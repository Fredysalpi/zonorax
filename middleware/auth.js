const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware para verificar autenticación
async function authenticate(req, res, next) {
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
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        req.user = { ...users[0], userId: users[0].id };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
}

// Middleware para verificar rol de administrador
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }
    next();
}

module.exports = { authenticate, requireAdmin };
