const express = require('express');
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

module.exports = router;
