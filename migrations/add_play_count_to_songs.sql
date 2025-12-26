-- Agregar columna play_count a la tabla songs
-- Esta columna almacenará el número de reproducciones de cada canción

ALTER TABLE songs 
ADD COLUMN play_count INT DEFAULT 0 NOT NULL;

-- Opcional: Agregar un índice para mejorar el rendimiento de consultas por play_count
CREATE INDEX idx_songs_play_count ON songs(play_count DESC);

-- Opcional: Actualizar algunas canciones con valores de ejemplo para testing
-- Puedes comentar o modificar estos valores según tus necesidades
UPDATE songs SET play_count = FLOOR(RAND() * 10000) + 100 WHERE id > 0;

SELECT 'Columna play_count agregada exitosamente a la tabla songs' AS mensaje;
