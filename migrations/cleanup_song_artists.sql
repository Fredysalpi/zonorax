-- Limpieza: Eliminar tabla song_artists que ya no se usa
-- Fecha: 2025-12-26
-- Ahora usamos ft_artists (JSON) en lugar de song_artists

USE zonorax_db;

-- Eliminar tabla song_artists si existe
DROP TABLE IF EXISTS song_artists;

-- Verificar que la columna ft_artists existe en songs
-- (Esta query solo es informativa, no hace cambios)
SHOW COLUMNS FROM songs LIKE 'ft_artists';
