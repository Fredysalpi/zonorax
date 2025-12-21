const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Crear directorios si no existen
const uploadDirs = [
    'public/uploads/artists/images',
    'public/uploads/artists/covers',
    'public/uploads/songs',
    'public/uploads/songs/covers'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configurar multer SIMPLE - guardar todo en uploads y luego mover
const upload = multer({
    dest: 'public/uploads/temp',
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticate);
router.use(requireAdmin);

// ===== GESTIÓN DE DJs/ARTISTAS =====

// Crear DJ/Artista
router.post('/artists', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('📝 Creando artista...');
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        const { name, bio, genre, social_links, is_verified, is_active } = req.body;
        let imageUrl = null;
        let coverUrl = null;

        // Procesar imagen de perfil
        if (req.files && req.files['image'] && req.files['image'][0]) {
            const file = req.files['image'][0];
            const newFilename = crypto.randomUUID() + path.extname(file.originalname);
            const newPath = path.join('public/uploads/artists/images', newFilename);

            fs.renameSync(file.path, newPath);
            imageUrl = `/uploads/artists/images/${newFilename}`;
            console.log('✅ Imagen guardada:', imageUrl);
        }

        // Procesar cover
        if (req.files && req.files['cover'] && req.files['cover'][0]) {
            const file = req.files['cover'][0];
            const newFilename = crypto.randomUUID() + path.extname(file.originalname);
            const newPath = path.join('public/uploads/artists/covers', newFilename);

            fs.renameSync(file.path, newPath);
            coverUrl = `/uploads/artists/covers/${newFilename}`;
            console.log('✅ Cover guardado:', coverUrl);
        }

        const isVerified = is_verified === 'true' || is_verified === true || is_verified === 'on' ? 1 : 0;
        const isActive = is_active === 'true' || is_active === true || is_active === 'on' ? 1 : 0;

        console.log('💾 Guardando en BD:', { name, bio, imageUrl, coverUrl, genre, isVerified, isActive });

        const [result] = await db.query(
            'INSERT INTO artists (name, bio, image_url, cover_image, genre, social_links, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, bio || null, imageUrl, coverUrl, genre || null, social_links || null, isVerified, isActive]
        );

        console.log('✅ Artista creado con ID:', result.insertId);

        res.status(201).json({
            message: 'DJ/Artista creado exitosamente',
            artistId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error al crear artista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Resto del código...
module.exports = router;
