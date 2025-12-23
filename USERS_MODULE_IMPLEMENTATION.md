# 📋 Implementación de Módulo de Usuarios y Buscadores con Paginación

## Archivos a Modificar

### 1. `public/admin.html` - Agregar sección de Usuarios

Agregar después de la sección de Canciones (línea 253):

```html
<!-- Gestión de Usuarios -->
<section id="users-section" class="admin-section">
    <div class="section-header">
        <div>
            <h1>Usuarios</h1>
            <p>Gestiona los usuarios de la plataforma</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
            <input type="text" id="users-search" placeholder="Buscar usuarios..." 
                   style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-highlight); color: var(--text-base); width: 300px;">
            <button class="btn-primary" id="add-user-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Nuevo Usuario
            </button>
        </div>
    </div>

    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="users-table-body">
                <!-- Se llenará dinámicamente -->
            </tbody>
        </table>
    </div>
    
    <!-- Paginación -->
    <div id="users-pagination" class="pagination"></div>
</section>
```

### 2. Agregar buscadores a las secciones existentes

#### Artistas (línea ~190):
```html
<div class="section-header">
    <div>
        <h1>DJs / Artistas</h1>
        <p>Gestiona los artistas y DJs de la plataforma</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
        <input type="text" id="artists-search" placeholder="Buscar artistas..." 
               style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-highlight); color: var(--text-base); width: 300px;">
        <button class="btn-primary" id="add-artist-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
            Nuevo DJ/Artista
        </button>
    </div>
</div>

<!-- Después de la tabla, agregar: -->
<div id="artists-pagination" class="pagination"></div>
```

#### Canciones (línea ~220):
```html
<div class="section-header">
    <div>
        <h1>Canciones</h1>
        <p>Gestiona las canciones y archivos de audio</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
        <input type="text" id="songs-search" placeholder="Buscar canciones..." 
               style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-highlight); color: var(--text-base); width: 300px;">
        <button class="btn-primary" id="add-song-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
            Nueva Canción
        </button>
    </div>
</div>

<!-- Después de la tabla, agregar: -->
<div id="songs-pagination" class="pagination"></div>
```

#### Archivos Subidos (línea ~257):
```html
<div class="section-header">
    <div>
        <h1>Archivos Subidos</h1>
        <p>Historial de archivos subidos a Cloudflare R2</p>
    </div>
    <input type="text" id="uploads-search" placeholder="Buscar archivos..." 
           style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-highlight); color: var(--text-base); width: 300px;">
</div>

<!-- Después de la tabla, agregar: -->
<div id="uploads-pagination" class="pagination"></div>
```

### 3. Modal de Usuario

Agregar después del modal de canción:

```html
<!-- Modal para Usuario -->
<div id="user-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="user-modal-title">Nuevo Usuario</h2>
            <button class="close-modal">&times;</button>
        </div>
        <form id="user-form">
            <input type="hidden" id="user-id" name="id">

            <div class="form-group">
                <label for="user-username">Nombre de Usuario *</label>
                <input type="text" id="user-username" name="username" required>
            </div>

            <div class="form-group">
                <label for="user-email">Email *</label>
                <input type="email" id="user-email" name="email" required>
            </div>

            <div class="form-group">
                <label for="user-password">Contraseña</label>
                <input type="password" id="user-password" name="password">
                <small>Dejar en blanco para mantener la contraseña actual</small>
            </div>

            <div class="form-group">
                <label for="user-role">Rol *</label>
                <select id="user-role" name="role" required>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                </select>
            </div>

            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="user-active" name="is_active" checked>
                    <span>✓ Usuario Activo</span>
                </label>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn-secondary close-modal">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>
```

### 4. `public/css/admin.css` - Estilos de Paginación

Agregar al final del archivo:

```css
/* ===== PAGINACIÓN ===== */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    padding: 20px 0;
}

.pagination-btn {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
    background-color: var(--bg-card);
    color: var(--text-base);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
    background-color: var(--bg-hover);
    border-color: var(--accent-base);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-btn.active {
    background-color: var(--accent-base);
    color: var(--bg-base);
    border-color: var(--accent-base);
}

.pagination-info {
    font-size: 14px;
    color: var(--text-subdued);
    margin: 0 16px;
}
```

### 5. `public/js/admin.js` - Lógica de Usuarios y Paginación

Ver archivo adjunto `admin-users-implementation.js` con todo el código JavaScript necesario.

### 6. `routes/admin.js` - Endpoints de Usuarios

Agregar al final del archivo (antes de `module.exports`):

```javascript
// ===== GESTIÓN DE USUARIOS =====

// Listar usuarios con paginación y búsqueda
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 25, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, username, email, role, is_active, created_at FROM users';
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        const params = [];

        if (search) {
            query += ' WHERE username LIKE ? OR email LIKE ?';
            countQuery += ' WHERE username LIKE ? OR email LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

        res.json({
            users,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear usuario
router.post('/users', async (req, res) => {
    try {
        const { username, email, password, role = 'user', is_active = true } = req.body;

        // Verificar si el usuario ya existe
        const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El usuario o email ya existe' });
        }

        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, is_active ? 1 : 0]
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
    try {
        const { username, email, password, role, is_active } = req.body;
        const userId = req.params.id;

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?, is_active = ?';
        let params = [username, email, role, is_active ? 1 : 0];

        if (password) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password = ?';
            params.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        params.push(userId);

        await db.query(updateQuery, params);

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar usuario
router.delete('/users/:id', async (req, res) => {
    try {
        // No permitir eliminar al propio usuario
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## Instrucciones de Implementación

1. **Modificar `public/admin.html`**: Agregar todas las secciones HTML mencionadas
2. **Modificar `public/css/admin.css`**: Agregar estilos de paginación
3. **Modificar `public/js/admin.js`**: Agregar toda la lógica JavaScript (ver siguiente archivo)
4. **Modificar `routes/admin.js`**: Agregar endpoints de usuarios

## Características Implementadas

✅ Módulo completo de gestión de usuarios
✅ Buscador en tiempo real en todas las secciones
✅ Paginación de 25 resultados por página
✅ Editar y eliminar usuarios
✅ Cambiar rol (usuario/admin)
✅ Activar/desactivar usuarios
✅ Protección contra auto-eliminación

## Próximo Paso

Crear el archivo JavaScript con toda la lógica de usuarios y paginación.
