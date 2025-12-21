const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los artistas
router.get('/', async (req, res) => {
    try {
        const [artists] = await db.query(`
            SELECT a.*, COUNT(s.id) as song_count
            FROM artists a
            LEFT JOIN songs s ON a.id = s.artist_id
            GROUP BY a.id
            ORDER BY a.name
        `);
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener artista por ID con sus canciones
router.get('/:id', async (req, res) => {
    try {
        const [artists] = await db.query('SELECT * FROM artists WHERE id = ?', [req.params.id]);

        if (artists.length === 0) {
            return res.status(404).json({ error: 'Artista no encontrado' });
        }

        const [songs] = await db.query('SELECT * FROM songs WHERE artist_id = ?', [req.params.id]);

        res.json({
            ...artists[0],
            songs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
