-- Actualizar la columna plays con valores de ejemplo
-- Esto asignará reproducciones aleatorias a cada canción para testing

USE zonorax_db;

-- Actualizar canciones con valores aleatorios de reproducciones (entre 100 y 10000)
UPDATE songs 
SET plays = FLOOR(RAND() * 9900) + 100 
WHERE id > 0;

-- Verificar los resultados
SELECT 
    s.id,
    s.title,
    a.name AS artist_name,
    s.plays
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
ORDER BY s.plays DESC;

SELECT 'Valores de reproducciones actualizados exitosamente' AS mensaje;
