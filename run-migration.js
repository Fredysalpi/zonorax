const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
    console.log('🔧 Ejecutando migración: Agregar play_count a songs...\\n');

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

        // Leer y ejecutar la migración
        const migrationSQL = await fs.readFile(
            path.join(__dirname, 'migrations', 'add_play_count_to_songs.sql'),
            'utf8'
        );

        await connection.query(migrationSQL);
        console.log('✅ Migración ejecutada exitosamente');

        // Verificar que la columna se agregó
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM songs LIKE 'play_count'"
        );

        if (columns.length > 0) {
            console.log('✅ Columna play_count verificada en la tabla songs');
            console.log('   Tipo:', columns[0].Type);
            console.log('   Default:', columns[0].Default);
        }

        await connection.end();

        console.log('\\n🎉 ¡Migración completada exitosamente!');
        console.log('\\n📊 Ahora los DJs destacados se ordenarán por reproducciones');

    } catch (error) {
        console.error('❌ Error al ejecutar la migración:', error.message);

        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('\\n⚠️  La columna play_count ya existe en la tabla songs');
        } else {
            console.error('\\n💡 Verifica que:');
            console.error('   1. MySQL esté corriendo');
            console.error('   2. La base de datos zonorax_db exista');
            console.error('   3. Las credenciales en .env sean correctas');
        }
        process.exit(1);
    }
}

runMigration();
