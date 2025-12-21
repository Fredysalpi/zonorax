-- Script para verificar al artista con ID 12
-- Esto hará que aparezcan 4 DJs en la sección "DJs Destacados"

UPDATE artists 
SET is_verified = 1 
WHERE id = 12;

-- Verificar el cambio
SELECT id, name, is_verified 
FROM artists 
ORDER BY id;
