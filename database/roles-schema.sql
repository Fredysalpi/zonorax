-- Agregar sistema de roles a la base de datos existente
USE zonorax_db;

-- Agregar columna de rol a usuarios
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER password_hash;

-- Tabla de sesiones para autenticación
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
);

-- Modificar tabla de artistas para agregar más información
ALTER TABLE artists 
    ADD COLUMN cover_image VARCHAR(255) AFTER image_url,
    ADD COLUMN genre VARCHAR(100) AFTER bio,
    ADD COLUMN social_links JSON AFTER genre,
    ADD COLUMN is_active BOOLEAN DEFAULT true AFTER social_links;

-- Tabla de archivos subidos (para tracking)
CREATE TABLE IF NOT EXISTS uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type ENUM('audio', 'image') NOT NULL,
    file_format VARCHAR(10) NOT NULL,
    file_size BIGINT NOT NULL,
    r2_key VARCHAR(500),
    r2_url VARCHAR(500),
    entity_type ENUM('song', 'artist', 'album', 'playlist') NOT NULL,
    entity_id INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entity (entity_type, entity_id)
);

-- Modificar tabla de canciones para soportar múltiples formatos
ALTER TABLE songs 
    ADD COLUMN file_format VARCHAR(10) DEFAULT 'mp3' AFTER file_url,
    ADD COLUMN file_size BIGINT AFTER file_format,
    ADD COLUMN r2_key VARCHAR(500) AFTER file_size;

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO users (username, email, password_hash, role, profile_image) VALUES
('admin', 'admin@zonorax.com', '$2b$10$rKvVPx8qLqKqKqKqKqKqKuO8qLqKqKqKqKqKqKqKqKqKqKqKqKqKq', 'admin', '/images/users/admin.jpg')
ON DUPLICATE KEY UPDATE role = 'admin';

-- Actualizar usuario demo a rol normal
UPDATE users SET role = 'user' WHERE username = 'demo_user';
