-- Script para verificar la estructura de la tabla users
-- Ejecuta esto en tu base de datos MySQL/MariaDB

-- 1. Ver la estructura actual de la tabla
DESCRIBE users;

-- 2. Ver todos los usuarios actuales (para verificar datos)
SELECT * FROM users LIMIT 5;

-- 3. Verificar que existan todos los campos necesarios
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- 4. Si falta algún campo, agrégalo:

-- Si falta 'name'
-- ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL AFTER username;

-- Si falta 'last_name'
-- ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NULL AFTER name;

-- Si falta 'phone'
-- ALTER TABLE users ADD COLUMN phone VARCHAR(9) NULL AFTER email;

-- Si falta 'profile_image'
-- ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER password_hash;

-- 5. Actualizar usuarios existentes con valores por defecto
-- UPDATE users SET name = username WHERE name IS NULL OR name = '';
-- UPDATE users SET last_name = '' WHERE last_name IS NULL;
