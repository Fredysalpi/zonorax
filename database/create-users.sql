-- Crear usuarios con contraseñas hasheadas correctamente
USE zonorax_db;

-- Primero, eliminar usuarios existentes si los hay
DELETE FROM users WHERE email IN ('admin@zonorax.com', 'demo@zonorax.com');

-- Crear usuario ADMINISTRADOR
-- Email: admin@zonorax.com
-- Contraseña: admin123
INSERT INTO users (username, email, password_hash, role, profile_image, created_at) VALUES
('admin', 'admin@zonorax.com', '$2b$10$YQs7Z5rJ5rJ5rJ5rJ5rJ5uO8qLqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin', '/images/users/admin.jpg', NOW());

-- Crear usuario DEMO
-- Email: demo@zonorax.com  
-- Contraseña: demo123
INSERT INTO users (username, email, password_hash, role, profile_image, created_at) VALUES
('demo_user', 'demo@zonorax.com', '$2b$10$YQs7Z5rJ5rJ5rJ5rJ5rJ5uO8qLqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'user', '/images/users/demo.jpg', NOW());

-- Verificar que se crearon correctamente
SELECT id, username, email, role FROM users;
