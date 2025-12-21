const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/albums', require('./routes/albums'));
app.use('/api/users', require('./routes/users'));

// Servir el frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error en el servidor:');
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Algo salió mal!' });
});

app.listen(PORT, () => {
    console.log(`🎵 Servidor Zonorax corriendo en http://localhost:${PORT}`);
});
