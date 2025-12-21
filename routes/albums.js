const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Obtener todos los álbumes
router.get('/', async (req, res) => {
    try {
        const [albums] = await db.query(`
            SELECT al.*, a.name as artist_name
            FROM albums al
            LEFT JOIN artists a ON al.artist_id = a.id
            ORDER BY al.release_date DESC
        `);
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener álbum por ID con sus canciones
router.get('/:id', async (req, res) => {
    try {
        const [albums] = await db.query(`
            SELECT al.*, a.name as artist_name
            FROM albums al
            LEFT JOIN artists a ON al.artist_id = a.id
            WHERE al.id = ?
        `, [req.params.id]);

        if (albums.length === 0) {
            return res.status(404).json({ error: 'Álbum no encontrado' });
        }

        const [songs] = await db.query('SELECT * FROM songs WHERE album_id = ?', [req.params.id]);

        res.json({
            ...albums[0],
            songs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
