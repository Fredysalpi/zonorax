const express = require('express');
const { authenticate } = require('../middleware/auth');
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las playlists
router.get('/', async (req, res) => {
    try {
        const userId = req.query.user_id; // Obtener user_id de los query params

        let query = `
            SELECT p.*, u.username, 
                   COUNT(ps.song_id) as song_count
            FROM playlists p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
        `;

        let params = [];

        if (userId) {
            // Si hay user_id, mostrar playlists públicas Y las privadas del usuario
            query += ` WHERE p.is_public = true OR p.user_id = ?`;
            params.push(userId);
        } else {
            // Si no hay user_id, solo mostrar públicas
            query += ` WHERE p.is_public = true`;
        }

        query += `
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        const [playlists] = await db.query(query, params);
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obtener playlists destacadas
router.get('/featured', async (req, res) => {
    try {
        const [playlists] = await db.query(`
            SELECT p.*, u.username, 
                   COUNT(ps.song_id) as song_count
            FROM playlists p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
            WHERE p.is_public = true
            GROUP BY p.id
            ORDER BY song_count DESC, p.created_at DESC
            LIMIT 6
        `);
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener playlist por ID con sus canciones
router.get('/:id', async (req, res) => {
    try {
        const [playlists] = await db.query(`
            SELECT p.*, u.username
            FROM playlists p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (playlists.length === 0) {
            return res.status(404).json({ error: 'Playlist no encontrada' });
        }

        const [songs] = await db.query(`
            SELECT s.*, a.name as artist_name, ps.position
            FROM playlist_songs ps
            JOIN songs s ON ps.song_id = s.id
            LEFT JOIN artists a ON s.artist_id = a.id
            WHERE ps.playlist_id = ?
            ORDER BY ps.position
        `, [req.params.id]);

        res.json({
            ...playlists[0],
            songs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear nueva playlist
router.post('/', async (req, res) => {
    try {
        const { user_id, name, description, cover_image, is_public } = req.body;
        const [result] = await db.query(
            'INSERT INTO playlists (user_id, name, description, cover_image, is_public) VALUES (?, ?, ?, ?, ?)',
            [user_id, name, description, cover_image, is_public]
        );
        res.status(201).json({ id: result.insertId, message: 'Playlist creada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar canción a playlist
router.post('/:id/songs', async (req, res) => {
    try {
        const { song_id } = req.body;
        const playlist_id = req.params.id;

        const [maxPosition] = await db.query(
            'SELECT COALESCE(MAX(position), 0) as max_pos FROM playlist_songs WHERE playlist_id = ?',
            [playlist_id]
        );

        const position = maxPosition[0].max_pos + 1;

        await db.query(
            'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
            [playlist_id, song_id, position]
        );

        res.status(201).json({ message: 'Canción agregada a la playlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar canción de playlist
router.delete('/:playlistId/songs/:songId', async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        await db.query(
            'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
            [playlistId, songId]
        );

        res.json({ success: true, message: 'Canción eliminada de la playlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Actualizar playlist
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, description, is_public } = req.body;
        const playlistId = req.params.id;
        const userId = req.user.userId;

        // Verificar que la playlist pertenece al usuario
        const [playlists] = await db.query(
            'SELECT * FROM playlists WHERE id = ? AND user_id = ?',
            [playlistId, userId]
        );

        if (playlists.length === 0) {
            return res.status(403).json({ error: 'No tienes permiso para editar esta playlist' });
        }

        await db.query(
            'UPDATE playlists SET name = ?, description = ?, is_public = ? WHERE id = ?',
            [name, description, is_public, playlistId]
        );

        res.json({ success: true, message: 'Playlist actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Subir imagen de portada de playlist
router.post('/:id/cover', authenticate, upload.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        const playlistId = req.params.id;
        const userId = req.user.userId;
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        // Verificar que la playlist pertenece al usuario
        const [playlists] = await db.query(
            'SELECT cover_image FROM playlists WHERE id = ? AND user_id = ?',
            [playlistId, userId]
        );

        if (playlists.length === 0) {
            // Eliminar archivo subido
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ error: 'No tienes permiso para editar esta playlist' });
        }

        const oldImage = playlists[0]?.cover_image;

        // Actualizar base de datos
        await db.query(
            'UPDATE playlists SET cover_image = ? WHERE id = ?',
            [imageUrl, playlistId]
        );

        // Eliminar imagen anterior si existe
        if (oldImage) {
            const oldImagePath = path.join(__dirname, '..', oldImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Imagen de portada actualizada correctamente'
        });
    } catch (error) {
        // Si hay error, eliminar el archivo subido
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: error.message });
    }
});

// Eliminar playlist
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const userId = req.user.userId;

        // Verificar que la playlist pertenece al usuario
        const [playlists] = await db.query(
            'SELECT cover_image FROM playlists WHERE id = ? AND user_id = ?',
            [playlistId, userId]
        );

        if (playlists.length === 0) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta playlist' });
        }

        const coverImage = playlists[0]?.cover_image;

        // Eliminar canciones de la playlist
        await db.query('DELETE FROM playlist_songs WHERE playlist_id = ?', [playlistId]);

        // Eliminar playlist
        await db.query('DELETE FROM playlists WHERE id = ?', [playlistId]);

        // Eliminar imagen de portada si existe
        if (coverImage) {
            const imagePath = path.join(__dirname, '..', coverImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({ success: true, message: 'Playlist eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
