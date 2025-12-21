-- Script para crear usuarios con contraseñas correctas
-- Ejecuta esto en phpMyAdmin

USE zonorax_db;

-- Eliminar usuarios existentes
DELETE FROM users WHERE email IN ('admin@zonorax.com', 'demo@zonorax.com');

-- Insertar usuarios con contraseñas hasheadas correctamente
-- IMPORTANTE: Estas contraseñas están hasheadas con bcrypt
INSERT INTO users (username, email, password_hash, role, profile_image) VALUES
('admin', 'admin@zonorax.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'admin', '/images/users/admin.jpg'),
('demo_user', 'demo@zonorax.com', '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'user', '/images/users/demo.jpg');

-- Verificar que se crearon
SELECT id, username, email, role, created_at FROM users;
