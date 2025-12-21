-- Script para actualizar la tabla users con los nuevos campos
USE zonorax_db;

-- Agregar columnas para nombre, apellido y teléfono
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) AFTER username,
ADD COLUMN last_name VARCHAR(100) AFTER first_name,
ADD COLUMN phone VARCHAR(9) AFTER last_name;

-- Verificar la estructura actualizada
DESCRIBE users;
