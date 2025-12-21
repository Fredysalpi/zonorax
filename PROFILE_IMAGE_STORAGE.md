# Almacenamiento de Imagen de Perfil - Zonorax

## Estado Actual

Actualmente, la **imagen de perfil del usuario** se guarda en el **localStorage del navegador** en formato Base64.

### Ubicación:
- **Clave en localStorage**: `profileImage`
- **Formato**: Base64 (data URL)
- **Tamaño máximo**: 2MB

### Ventajas del método actual:
✅ No requiere servidor de archivos
✅ Implementación rápida
✅ Sin costos adicionales

### Desventajas:
❌ La imagen solo está disponible en el navegador donde se subió
❌ Se pierde si el usuario limpia el caché del navegador
❌ No se sincroniza entre dispositivos
❌ Ocupa espacio en localStorage (límite de ~5-10MB total)

---

## Recomendación: Migrar a Almacenamiento en Servidor

Para una solución profesional y escalable, se recomienda:

### Opción 1: Cloudflare R2 (Recomendado)
Ya que usas Cloudflare R2 para las canciones, puedes usar el mismo servicio para las imágenes de perfil.

**Implementación:**
1. Crear un bucket o carpeta `profile-images/` en R2
2. Al subir imagen, enviarla al backend
3. Backend sube a R2 y guarda la URL en la base de datos
4. Actualizar campo `profile_image` en tabla `users`

**Ventajas:**
- ✅ Sincronización entre dispositivos
- ✅ Persistencia permanente
- ✅ CDN global de Cloudflare
- ✅ Muy económico (10GB gratis/mes)

### Opción 2: Almacenamiento Local en Servidor
Guardar las imágenes en el servidor Node.js.

**Implementación:**
1. Crear carpeta `uploads/profiles/` en el servidor
2. Usar `multer` para manejar uploads
3. Guardar ruta en base de datos

**Ventajas:**
- ✅ Control total
- ✅ Sin costos adicionales
- ✅ Fácil de implementar

**Desventajas:**
- ❌ No escalable
- ❌ Sin CDN
- ❌ Backups manuales

---

## Migración Sugerida

### 1. Actualizar Backend (routes/auth.js)

```javascript
// Agregar endpoint para subir imagen de perfil
router.post('/upload-profile-image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.userId;
        const imageUrl = await uploadToR2(req.file); // Función para subir a R2
        
        await db.query(
            'UPDATE users SET profile_image = ? WHERE id = ?',
            [imageUrl, userId]
        );
        
        res.json({ success: true, imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 2. Actualizar Frontend (app.js)

```javascript
// Modificar la función de subir imagen
async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/auth/upload-profile-image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
    });
    
    const data = await response.json();
    return data.imageUrl;
}
```

### 3. Base de Datos

El campo `profile_image` ya existe en la tabla `users`:
```sql
profile_image VARCHAR(255)
```

---

## Próximos Pasos

1. ✅ **Actualizar tabla users** (agregar first_name, last_name, phone) - COMPLETADO
2. ⏳ **Decidir método de almacenamiento** (R2 vs Local)
3. ⏳ **Implementar backend para upload de imágenes**
4. ⏳ **Migrar frontend de localStorage a servidor**

---

## Consulta SQL para Verificar

```sql
-- Ver estructura de la tabla users
DESCRIBE users;

-- Ver usuarios con imágenes de perfil
SELECT id, username, email, profile_image FROM users;
```

---

**Fecha de creación**: 2025-12-21
**Estado**: localStorage (temporal) → Migrar a R2 (recomendado)
