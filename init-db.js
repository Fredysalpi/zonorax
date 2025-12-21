const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    console.log('🔧 Iniciando configuración de base de datos...\n');

    try {
        // Conectar sin especificar base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            multipleStatements: true
        });

        console.log('✅ Conectado a MySQL');

        // Leer y ejecutar schema.sql
        console.log('📋 Creando esquema de base de datos...');
        const schemaSQL = await fs.readFile(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
        await connection.query(schemaSQL);
        console.log('✅ Esquema creado exitosamente');

        // Leer y ejecutar seed.sql
        console.log('🌱 Insertando datos de ejemplo...');
        const seedSQL = await fs.readFile(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
        await connection.query(seedSQL);
        console.log('✅ Datos de ejemplo insertados');

        await connection.end();

        console.log('\n🎉 ¡Base de datos configurada exitosamente!');
        console.log('\n📊 Resumen:');
        console.log('   - Base de datos: zonorax_db');
        console.log('   - Tablas creadas: 9');
        console.log('   - Datos de ejemplo: Sí');
        console.log('\n🚀 Ahora puedes iniciar el servidor con: npm start');

    } catch (error) {
        console.error('❌ Error al configurar la base de datos:', error.message);
        console.error('\n💡 Asegúrate de que:');
        console.error('   1. MySQL esté corriendo');
        console.error('   2. Las credenciales en .env sean correctas');
        console.error('   3. El usuario tenga permisos para crear bases de datos');
        process.exit(1);
    }
}

initDatabase();
