const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');

// Almacenar tokens temporales en memoria (en producción usar Redis)
const streamTokens = new Map();

// Generar token de streaming temporal
router.post('/generate-token', async (req, res) => {
    try {
        const { songId } = req.body;

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // Almacenar token con expiración de 1 hora
        const expiresAt = Date.now() + (60 * 60 * 1000);
        streamTokens.set(token, {
            songId,
            expiresAt,
            ip: req.ip
        });

        // Limpiar tokens expirados cada 5 minutos
        setTimeout(() => {
            for (const [key, value] of streamTokens.entries()) {
                if (value.expiresAt < Date.now()) {
                    streamTokens.delete(key);
                }
            }
        }, 5 * 60 * 1000);

        res.json({ token, expiresAt });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Error al generar token' });
    }
});

// Endpoint de streaming protegido
router.get('/stream/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Verificar token
        const tokenData = streamTokens.get(token);

        if (!tokenData) {
            return res.status(403).json({ error: 'Token inválido' });
        }

        if (tokenData.expiresAt < Date.now()) {
            streamTokens.delete(token);
            return res.status(403).json({ error: 'Token expirado' });
        }

        // Verificar IP (opcional, más seguro)
        if (tokenData.ip !== req.ip) {
            return res.status(403).json({ error: 'IP no autorizada' });
        }

        // Obtener información de la canción
        const [songs] = await db.query(
            'SELECT file_url FROM songs WHERE id = ?',
            [tokenData.songId]
        );

        if (songs.length === 0) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        // Redirigir a la URL real (Cloudflare R2)
        // La URL se expone solo por un momento y con token
        res.redirect(songs[0].file_url);

        // Opcional: Eliminar token después de usarlo una vez
        // streamTokens.delete(token);

    } catch (error) {
        console.error('Error streaming audio:', error);
        res.status(500).json({ error: 'Error al reproducir audio' });
    }
});

module.exports = router;
