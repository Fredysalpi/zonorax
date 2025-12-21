const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.query(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el usuario ya existe
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, 'user']
        );

        const userId = result.insertId;

        // Crear automáticamente la playlist "Me Gusta" para el nuevo usuario
        await db.query(
            'INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)',
            [userId, 'Me Gusta', 'Canciones que me gustan', false]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId: userId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            await db.query('DELETE FROM sessions WHERE token = ?', [token]);
        }

        res.json({ message: 'Sesión cerrada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [sessions] = await db.query(
            'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ error: 'Sesión expirada' });
        }

        const [users] = await db.query(
            'SELECT id, username, email, role, profile_image FROM users WHERE id = ?',
            [decoded.userId]
        );

        res.json({ user: users[0] });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;
