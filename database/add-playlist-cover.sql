-- Agregar columna cover_image a la tabla playlists
ALTER TABLE playlists 
ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL;
