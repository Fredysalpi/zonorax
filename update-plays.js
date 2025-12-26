const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function updatePlays() {
    console.log('🔧 Actualizando valores de reproducciones...\\n');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: 'zonorax_db',
            multipleStatements: true
        });

        console.log('✅ Conectado a la base de datos');

        // Leer y ejecutar el SQL
        const updateSQL = await fs.readFile(
            path.join(__dirname, 'update_plays.sql'),
            'utf8'
        );

        const [results] = await connection.query(updateSQL);
        console.log('✅ Valores de reproducciones actualizados');

        // Mostrar las canciones con más reproducciones
        const [topSongs] = await connection.query(`
            SELECT 
                s.title,
                a.name AS artist_name,
                s.plays
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
            ORDER BY s.plays DESC
            LIMIT 10
        `);

        console.log('\\n📊 Top 10 canciones por reproducciones:');
        topSongs.forEach((song, index) => {
            console.log(`   ${index + 1}. ${song.title} - ${song.artist_name}: ${song.plays} plays`);
        });

        // Mostrar artistas con más reproducciones totales
        const [topArtists] = await connection.query(`
            SELECT 
                a.id,
                a.name,
                SUM(s.plays) AS total_plays
            FROM artists a
            LEFT JOIN songs s ON a.id = s.artist_id
            GROUP BY a.id, a.name
            ORDER BY total_plays DESC
            LIMIT 10
        `);

        console.log('\\n🎵 Top artistas por reproducciones totales:');
        topArtists.forEach((artist, index) => {
            console.log(`   ${index + 1}. ${artist.name}: ${artist.total_plays || 0} plays totales`);
        });

        await connection.end();

        console.log('\\n🎉 ¡Actualización completada exitosamente!');
        console.log('\\n📊 Ahora recarga la página para ver los DJs destacados ordenados por reproducciones');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updatePlays();
