const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener datos de un usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await db.query('SELECT id, username, email, first_name, last_name, phone, role, profile_image, created_at FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtener playlists de usuario
router.get('/:id/playlists', async (req, res) => {
    try {
        const [playlists] = await db.query(`
            SELECT p.*, COUNT(ps.song_id) as song_count
            FROM playlists p
            LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        `, [req.params.id]);

        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener favoritos de usuario
router.get('/:id/favorites', async (req, res) => {
    try {
        const [favorites] = await db.query(`
            SELECT s.*, a.name as artist_name, f.created_at as favorited_at
            FROM favorites f
            JOIN songs s ON f.song_id = s.id
            LEFT JOIN artists a ON s.artist_id = a.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `, [req.params.id]);

        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cambiar contraseña de usuario
router.put('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;

        // Validar que se proporcionen ambas contraseñas
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva contraseña' });
        }

        // Obtener usuario de la base de datos
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = users[0];

        // Verificar contraseña actual
        const bcrypt = require('bcrypt');
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña en la base de datos
        await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar datos personales de usuario
router.put('/:id', async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;
        const userId = req.params.id;

        console.log('📝 Actualizando datos personales del usuario:', userId, { first_name, last_name, phone });

        // Obtener usuario de la base de datos
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar datos personales
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
            [first_name || null, last_name || null, phone || null, userId]
        );

        res.json({ message: 'Datos personales actualizados correctamente' });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
