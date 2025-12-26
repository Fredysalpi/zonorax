-- Migración para agregar columna ft_artists (artistas colaboradores)
-- Fecha: 2025-12-26

USE zonorax_db;

-- Agregar columna ft_artists para almacenar IDs de artistas colaboradores en formato JSON
ALTER TABLE songs 
ADD COLUMN ft_artists JSON DEFAULT NULL COMMENT 'IDs de artistas colaboradores en formato JSON array';

-- Ejemplo de uso:
-- ft_artists = [12, 15, 8] para múltiples colaboradores
-- ft_artists = NULL si no hay colaboradores
