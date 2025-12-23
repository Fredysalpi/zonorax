-- Script para agregar las columnas faltantes a la tabla users
-- Ejecuta esto en tu base de datos MySQL/MariaDB

-- 1. Agregar columna 'name' si no existe
ALTER TABLE users ADD COLUMN name VARCHAR(100) NULL AFTER username;

-- 2. Agregar columna 'last_name' si no existe
ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NULL AFTER name;

-- 3. Agregar columna 'phone' si no existe (si ya existe, comenta esta línea)
-- ALTER TABLE users ADD COLUMN phone VARCHAR(9) NULL AFTER email;

-- 4. Agregar columna 'profile_image' si no existe (si ya existe, comenta esta línea)
-- ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER password_hash;

-- 5. Actualizar usuarios existentes con valores por defecto
UPDATE users SET name = username WHERE name IS NULL OR name = '';
UPDATE users SET last_name = '' WHERE last_name IS NULL;

-- 6. Verificar que todo esté correcto
SELECT id, username, name, last_name, email, phone, role, profile_image, is_active 
FROM users 
LIMIT 5;
