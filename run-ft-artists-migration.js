const db = require('./config/database');
const fs = require('fs');

async function runMigration() {
    try {
        console.log('🔧 Ejecutando migración: add_ft_artists_column.sql');

        const sql = fs.readFileSync('migrations/add_ft_artists_column.sql', 'utf8');

        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'USE zonorax_db');

        for (const statement of statements) {
            if (statement.trim()) {
                console.log('📝 Ejecutando:', statement.substring(0, 80) + '...');
                await db.query(statement);
            }
        }

        console.log('✅ Migración completada exitosamente');
        console.log('✅ Columna ft_artists agregada a la tabla songs');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración:', error.message);
        process.exit(1);
    }
}

runMigration();
