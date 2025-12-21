const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todas las canciones
router.get('/', async (req, res) => {
    try {
        const [songs] = await db.query(`
            SELECT s.*, a.name as artist_name, a.is_verified as artist_verified, al.title as album_title
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
            LEFT JOIN albums al ON s.album_id = al.id
            ORDER BY s.created_at DESC
        `);
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obtener canciones recientes
router.get('/recent', async (req, res) => {
    try {
        const [songs] = await db.query(`
            SELECT s.*, a.name as artist_name, a.is_verified as artist_verified, al.title as album_title
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
            LEFT JOIN albums al ON s.album_id = al.id
            ORDER BY s.created_at DESC
            LIMIT 10
        `);
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener canción por ID
router.get('/:id', async (req, res) => {
    try {
        const [songs] = await db.query(`
            SELECT s.*, a.name as artist_name, a.is_verified as artist_verified, al.title as album_title
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
            LEFT JOIN albums al ON s.album_id = al.id
            WHERE s.id = ?
        `, [req.params.id]);

        if (songs.length === 0) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        res.json(songs[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar canciones
router.get('/search/:query', async (req, res) => {
    try {
        const searchTerm = `%${req.params.query}%`;
        const [songs] = await db.query(`
            SELECT s.*, a.name as artist_name, a.is_verified as artist_verified, al.title as album_title
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
            LEFT JOIN albums al ON s.album_id = al.id
            WHERE s.title LIKE ? OR a.name LIKE ? OR s.genre LIKE ?
            ORDER BY s.plays DESC
        `, [searchTerm, searchTerm, searchTerm]);

        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Incrementar reproducciones
router.post('/:id/play', async (req, res) => {
    try {
        await db.query('UPDATE songs SET plays = plays + 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
