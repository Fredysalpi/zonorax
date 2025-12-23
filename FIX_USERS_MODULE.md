# 🔧 Correcciones Necesarias para el Módulo de Usuarios

## ❌ Problema Identificado

El error 500 (Internal Server Error) ocurre porque el campo de contraseña en la base de datos se llama `password_hash`, pero en el código estamos usando `password`.

## ✅ Soluciones

### 1. Corrección en `routes/admin.js`

#### Línea ~521 - Endpoint POST /users:
**Cambiar:**
```javascript
'INSERT INTO users (username, name, last_name, email, phone, password, role, profile_image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
```

**Por:**
```javascript
'INSERT INTO users (username, name, last_name, email, phone, password_hash, role, profile_image, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
```

#### Línea ~545 - Endpoint PUT /users/:id:
**Cambiar:**
```javascript
updateQuery += ', password = ?';
```

**Por:**
```javascript
updateQuery += ', password_hash = ?';
```

### 2. Agregar Logging en el Backend

Agregar después de la línea 504 en POST /users:
```javascript
console.log('📝 Creando usuario:', { username, name, last_name, email, phone, role });
```

Agregar después de la línea 534 en PUT /users/:id:
```javascript
console.log('📝 Actualizando usuario:', userId, { username, name, last_name, email, phone, role });
```

### 3. Verificar Estructura de la Tabla

Ejecuta este SQL en tu base de datos:

```sql
-- Ver estructura actual
DESCRIBE users;

-- Si falta alguna columna, agrégala:
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL AFTER username;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER name;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(9) NULL AFTER email;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) NULL AFTER password_hash;
```

### 4. Actualizar Usuarios Existentes

Si ya tienes usuarios sin los campos nuevos:

```sql
UPDATE users 
SET name = username, 
    last_name = '' 
WHERE name IS NULL OR name = '';
```

## 🔍 Para Verificar

Después de hacer estos cambios:

1. **Reinicia el servidor** (Ctrl+C y luego `npm run dev`)
2. **Recarga la página** del admin (F5)
3. **Haz click en "Usuarios"**
4. **Revisa la consola** del navegador y del servidor

## 📋 Checklist

- [ ] Cambiar `password` a `password_hash` en INSERT (línea ~521)
- [ ] Cambiar `password` a `password_hash` en UPDATE (línea ~545)
- [ ] Verificar estructura de tabla users
- [ ] Actualizar usuarios existentes
- [ ] Reiniciar servidor
- [ ] Probar carga de usuarios

## 🐛 Si Persiste el Error

Comparte el error exacto que aparece en:
1. La consola del navegador (F12)
2. La terminal donde corre el servidor

Esto me ayudará a identificar el problema exacto.
