# Migración: Agregar Cover Image a Playlists

## Descripción
Esta migración agrega la columna `cover_image` a la tabla `playlists` para permitir que las playlists tengan imágenes de portada.

## Instrucciones

### Opción 1: Usando MySQL Workbench o phpMyAdmin
1. Abre tu cliente de MySQL (Workbench, phpMyAdmin, etc.)
2. Selecciona la base de datos `zonorax_db`
3. Ejecuta el siguiente comando SQL:

```sql
ALTER TABLE playlists 
ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL;
```

### Opción 2: Usando línea de comandos
```bash
mysql -u root -p zonorax_db < database/add-playlist-cover.sql
```

## Verificación
Para verificar que la migración se ejecutó correctamente:

```sql
DESCRIBE playlists;
```

Deberías ver la columna `cover_image` en la lista.

## Rollback (opcional)
Si necesitas revertir esta migración:

```sql
ALTER TABLE playlists DROP COLUMN cover_image;
```
