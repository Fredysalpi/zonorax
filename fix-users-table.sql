-- Script para verificar y actualizar la tabla users
-- Ejecuta esto en tu base de datos MySQL

-- 1. Ver la estructura actual de la tabla
DESCRIBE users;

-- 2. Si faltan columnas, agrégalas con estos comandos:

-- Agregar columna 'name' si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL AFTER username;

-- Agregar columna 'last_name' si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER name;

-- Agregar columna 'phone' si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(9) NULL AFTER email;

-- Agregar columna 'profile_image' si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) NULL AFTER password_hash;

-- 3. Verificar que todas las columnas existan
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- 4. Actualizar usuarios existentes con datos por defecto si es necesario
UPDATE users 
SET name = username, 
    last_name = '' 
WHERE name IS NULL;
