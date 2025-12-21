const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, bucketName } = require('../config/r2');
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

// Configuración de multer para ARTISTAS (almacenamiento local)
const artistStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'image') {
            cb(null, 'public/uploads/artists/images');
        } else if (file.fieldname === 'cover' || file.fieldname === 'cover2') {
            cb(null, 'public/uploads/artists/covers');
        } else {
            cb(null, 'public/uploads');
        }
    },
    filename: function (req, file, cb) {
        const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const uploadArtist = multer({
    storage: artistStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB para imágenes
    },
    fileFilter: (req, file, cb) => {
        const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();

        if ((file.fieldname === 'image' || file.fieldname === 'cover' || file.fieldname === 'cover2') && allowedImages.includes(ext)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Configuración de multer para CANCIONES (memoria -> R2)
const uploadSong = multer({
    storage: multer.memoryStorage(), // Usar memoria para subir a R2
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB para audio
    },
    fileFilter: (req, file, cb) => {
        const allowedAudio = ['.mp3', '.wav', '.aac', '.ogg'];
        const allowedImages = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (file.fieldname === 'audio' && allowedAudio.includes(ext)) {
            cb(null, true);
        } else if (file.fieldname === 'cover' && allowedImages.includes(ext)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticate);
router.use(requireAdmin);

// ===== GESTIÓN DE DJs/ARTISTAS =====

// Crear DJ/Artista
router.post('/artists', uploadArtist.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'cover2', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, bio, genre, social_links, is_verified, is_active } = req.body;
        let imageUrl = null;
        let coverUrl = null;
        let cover2Url = null;

        // Guardar imagen de perfil si existe
        if (req.files && req.files['image'] && req.files['image'][0]) {
            const file = req.files['image'][0];
            imageUrl = `/uploads/artists/images/${file.filename}`;
        }

        // Guardar cover si existe
        if (req.files && req.files['cover'] && req.files['cover'][0]) {
            const file = req.files['cover'][0];
            coverUrl = `/uploads/artists/covers/${file.filename}`;
        }

        // Guardar cover2 si existe
        if (req.files && req.files['cover2'] && req.files['cover2'][0]) {
            const file = req.files['cover2'][0];
            cover2Url = `/uploads/artists/covers/${file.filename}`;
        }

        // Crear artista en BD con campo is_verified e is_active
        const isVerified = is_verified === 'true' || is_verified === true || is_verified === 'on' ? 1 : 0;
        const isActive = is_active === 'true' || is_active === true || is_active === 'on' ? 1 : 0;

        const [result] = await db.query(
            'INSERT INTO artists (name, bio, image_url, cover_image, cover_image_2, genre, social_links, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, bio || null, imageUrl, coverUrl, cover2Url, genre || null, social_links || null, isVerified, isActive]
        );

        res.status(201).json({
            message: 'DJ/Artista creado exitosamente',
            artistId: result.insertId
        });
    } catch (error) {
        console.error('Error al crear artista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar DJ/Artista
router.put('/artists/:id', uploadArtist.fields([
    { name: 'image', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
    { name: 'cover2', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, bio, genre, social_links, is_active, is_verified } = req.body;
        const artistId = req.params.id;

        // Obtener artista actual
        const [artists] = await db.query('SELECT * FROM artists WHERE id = ?', [artistId]);
        if (artists.length === 0) {
            return res.status(404).json({ error: 'Artista no encontrado' });
        }

        let imageUrl = artists[0].image_url;
        let coverUrl = artists[0].cover_image;
        let cover2Url = artists[0].cover_image_2;

        // Actualizar imagen si se proporciona
        if (req.files && req.files['image'] && req.files['image'][0]) {
            const file = req.files['image'][0];
            imageUrl = `/uploads/artists/images/${file.filename}`;
        }

        // Actualizar cover si se proporciona
        if (req.files && req.files['cover'] && req.files['cover'][0]) {
            const file = req.files['cover'][0];
            coverUrl = `/uploads/artists/covers/${file.filename}`;
        }

        // Actualizar cover2 si se proporciona
        if (req.files && req.files['cover2'] && req.files['cover2'][0]) {
            const file = req.files['cover2'][0];
            cover2Url = `/uploads/artists/covers/${file.filename}`;
        }

        const isVerified = is_verified === 'true' || is_verified === true || is_verified === 'on' ? 1 : 0;
        const isActive = is_active === 'true' || is_active === true || is_active === 'on' ? 1 : 0;

        await db.query(
            'UPDATE artists SET name = ?, bio = ?, image_url = ?, cover_image = ?, cover_image_2 = ?, genre = ?, social_links = ?, is_active = ?, is_verified = ? WHERE id = ?',
            [name, bio || null, imageUrl, coverUrl, cover2Url, genre || null, social_links || null, isActive, isVerified, artistId]
        );

        res.json({ message: 'Artista actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar artista:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar DJ/Artista
router.delete('/artists/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM artists WHERE id = ?', [req.params.id]);
        res.json({ message: 'Artista eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== GESTIÓN DE CANCIONES =====

// Crear canción con audio en R2
router.post('/songs', uploadSong.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('🎵 Subiendo canción a R2...');
        const { title, artist_id, album_id, duration, genre, bpm, key_signature } = req.body;

        if (!req.files['audio']) {
            return res.status(400).json({ error: 'Archivo de audio requerido' });
        }

        const audioFile = req.files['audio'][0];
        const fileExt = path.extname(audioFile.originalname).toLowerCase();
        const audioKey = `songs/${crypto.randomUUID()}${fileExt}`;

        console.log('📤 Subiendo audio a R2:', audioKey);

        // Subir audio a R2
        await r2Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: audioKey,
            Body: audioFile.buffer,
            ContentType: audioFile.mimetype
        }));

        const audioUrl = `${process.env.R2_PUBLIC_URL}/${audioKey}`;
        console.log('✅ Audio subido:', audioUrl);

        // Subir cover si existe
        let coverUrl = null;
        if (req.files['cover'] && req.files['cover'][0]) {
            const coverFile = req.files['cover'][0];
            const coverKey = `songs/covers/${crypto.randomUUID()}${path.extname(coverFile.originalname)}`;

            console.log('📤 Subiendo cover a R2:', coverKey);

            await r2Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: coverKey,
                Body: coverFile.buffer,
                ContentType: coverFile.mimetype
            }));

            coverUrl = `${process.env.R2_PUBLIC_URL}/${coverKey}`;
            console.log('✅ Cover subido:', coverUrl);
        }

        // Crear canción en BD
        const [result] = await db.query(
            'INSERT INTO songs (title, artist_id, album_id, duration, file_url, file_format, file_size, r2_key, cover_image, genre, bpm, key_signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, artist_id, album_id, duration, audioUrl, fileExt.slice(1), audioFile.size, audioKey, coverUrl, genre, bpm, key_signature]
        );

        // Registrar upload
        await db.query(
            'INSERT INTO uploads (user_id, file_name, file_type, file_format, file_size, r2_key, r2_url, entity_type, entity_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, audioFile.originalname, 'audio', fileExt.slice(1), audioFile.size, audioKey, audioUrl, 'song', result.insertId]
        );

        console.log('✅ Canción creada con ID:', result.insertId);

        res.status(201).json({
            message: 'Canción creada exitosamente',
            songId: result.insertId,
            audioUrl: audioUrl
        });
    } catch (error) {
        console.error('❌ Error al crear canción:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar canción
router.put('/songs/:id', uploadSong.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, artist_id, album_id, duration, genre, bpm, key_signature } = req.body;
        const songId = req.params.id;

        const [songs] = await db.query('SELECT * FROM songs WHERE id = ?', [songId]);
        if (songs.length === 0) {
            return res.status(404).json({ error: 'Canción no encontrada' });
        }

        let audioUrl = songs[0].file_url;
        let audioKey = songs[0].r2_key;
        let fileFormat = songs[0].file_format;
        let fileSize = songs[0].file_size;
        let coverUrl = songs[0].cover_image;

        // Actualizar audio si se proporciona
        if (req.files['audio']) {
            const audioFile = req.files['audio'][0];
            const fileExt = path.extname(audioFile.originalname).toLowerCase();
            audioKey = `songs/${crypto.randomUUID()}${fileExt}`;

            await r2Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: audioKey,
                Body: audioFile.buffer,
                ContentType: audioFile.mimetype
            }));

            audioUrl = `${process.env.R2_PUBLIC_URL}/${audioKey}`;
            fileFormat = fileExt.slice(1);
            fileSize = audioFile.size;
        }

        // Actualizar cover si se proporciona
        if (req.files['cover']) {
            const coverFile = req.files['cover'][0];
            const coverKey = `songs/covers/${crypto.randomUUID()}${path.extname(coverFile.originalname)}`;

            await r2Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: coverKey,
                Body: coverFile.buffer,
                ContentType: coverFile.mimetype
            }));

            coverUrl = `${process.env.R2_PUBLIC_URL}/${coverKey}`;
        }

        await db.query(
            'UPDATE songs SET title = ?, artist_id = ?, album_id = ?, duration = ?, file_url = ?, file_format = ?, file_size = ?, r2_key = ?, cover_image = ?, genre = ?, bpm = ?, key_signature = ? WHERE id = ?',
            [title, artist_id, album_id, duration, audioUrl, fileFormat, fileSize, audioKey, coverUrl, genre, bpm, key_signature, songId]
        );

        res.json({ message: 'Canción actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar canción
router.delete('/songs/:id', async (req, res) => {
    try {
        const [songs] = await db.query('SELECT r2_key FROM songs WHERE id = ?', [req.params.id]);

        if (songs.length > 0 && songs[0].r2_key) {
            // Eliminar de R2
            await r2Client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: songs[0].r2_key
            }));
        }

        await db.query('DELETE FROM songs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ESTADÍSTICAS ADMIN =====

router.get('/stats', async (req, res) => {
    try {
        const [songCount] = await db.query('SELECT COUNT(*) as count FROM songs');
        const [artistCount] = await db.query('SELECT COUNT(*) as count FROM artists');
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [playlistCount] = await db.query('SELECT COUNT(*) as count FROM playlists');
        const [totalPlays] = await db.query('SELECT SUM(plays) as total FROM songs');
        const [storageUsed] = await db.query('SELECT SUM(file_size) as total FROM uploads WHERE file_type = "audio"');

        res.json({
            songs: songCount[0].count,
            artists: artistCount[0].count,
            users: userCount[0].count,
            playlists: playlistCount[0].count,
            totalPlays: totalPlays[0].total || 0,
            storageUsed: storageUsed[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar todos los uploads
router.get('/uploads', async (req, res) => {
    try {
        const [uploads] = await db.query(`
            SELECT u.*, us.username 
            FROM uploads u
            JOIN users us ON u.user_id = us.id
            ORDER BY u.uploaded_at DESC
            LIMIT 100
        `);
        res.json(uploads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
