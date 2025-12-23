# 🔍 Implementación de Búsqueda y Paginación para Artistas y Canciones

## ✅ Estado Actual
- **Usuarios**: ✅ Ya tiene búsqueda y paginación implementada

## 📋 Pendiente de Implementar
- **Artistas**: Agregar búsqueda y paginación
- **Canciones**: Agregar búsqueda y paginación

---

## 1️⃣ ARTISTAS - Cambios en HTML

### En `public/admin.html` - Línea ~187-198

**REEMPLAZAR:**
```html
<div class="section-header">
    <div>
        <h1>DJs / Artistas</h1>
        <p>Gestiona los artistas y DJs de la plataforma</p>
    </div>
    <button class="btn-primary" id="add-artist-btn">
        ...
    </button>
</div>
```

**POR:**
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
```

### Agregar después de la tabla de artistas (línea ~218):

```html
<div id="artists-pagination" class="pagination"></div>
```

---

## 2️⃣ CANCIONES - Cambios en HTML

### En `public/admin.html` - Sección de Canciones

**Agregar buscador en el section-header:**
```html
<div style="display: flex; gap: 12px; align-items: center;">
    <input type="text" id="songs-search" placeholder="Buscar canciones..." 
           style="padding: 10px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-highlight); color: var(--text-base); width: 300px;">
    <button class="btn-primary" id="add-song-btn">
        ...
    </button>
</div>
```

### Agregar después de la tabla de canciones:

```html
<div id="songs-pagination" class="pagination"></div>
```

---

## 3️⃣ BACKEND - Cambios en `routes/admin.js`

### Actualizar GET /artists (línea ~117):

```javascript
// Listar artistas con paginación y búsqueda
router.get('/artists', async (req, res) => {
    try {
        const { page = 1, limit = 25, search = '' } = req.query;
        const offset = (page - 1) * limit;
        console.log('🔍 Cargando artistas:', { page, limit, search });

        let query = 'SELECT * FROM artists';
        let countQuery = 'SELECT COUNT(*) as total FROM artists';
        const params = [];

        if (search) {
            query += ' WHERE name LIKE ?';
            countQuery += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [artists] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, search ? [`%${search}%`] : []);

        res.json({
            artists,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / limit)
        });
    } catch (error) {
        console.error('❌ Error en GET /artists:', error);
        res.status(500).json({ error: error.message });
    }
});
```

### Actualizar GET /songs (línea ~200):

```javascript
// Listar canciones con paginación y búsqueda
router.get('/songs', async (req, res) => {
    try {
        const { page = 1, limit = 25, search = '' } = req.query;
        const offset = (page - 1) * limit;
        console.log('🔍 Cargando canciones:', { page, limit, search });

        let query = `
            SELECT s.*, a.name as artist_name 
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
        `;
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM songs s
            LEFT JOIN artists a ON s.artist_id = a.id
        `;
        const params = [];

        if (search) {
            query += ' WHERE s.title LIKE ? OR a.name LIKE ?';
            countQuery += ' WHERE s.title LIKE ? OR a.name LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [songs] = await db.query(query, params);
        const [countResult] = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);

        res.json({
            songs,
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / limit)
        });
    } catch (error) {
        console.error('❌ Error en GET /songs:', error);
        res.status(500).json({ error: error.message });
    }
});
```

---

## 4️⃣ FRONTEND - Cambios en `public/js/admin.js`

### Agregar variables de paginación (al inicio del archivo):

```javascript
// Variables de paginación
let currentArtistsPage = 1;
let artistsSearchQuery = '';
let currentSongsPage = 1;
let songsSearchQuery = '';
```

### Actualizar loadArtists() (línea ~144):

```javascript
async function loadArtists(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/artists?page=${page}&limit=25&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        const tbody = document.getElementById('artists-table-body');
        tbody.innerHTML = data.artists.map(artist => `
            <tr>
                <td><img src="${artist.image_url || '/images/default-artist.jpg'}" alt="${artist.name}" class="table-img"></td>
                <td><strong>${artist.name}</strong></td>
                <td>${artist.bio ? artist.bio.substring(0, 100) + '...' : 'Sin biografía'}</td>
                <td>
                    <button class="btn-edit" onclick="editArtist(${artist.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteArtist(${artist.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Renderizar paginación
        renderPagination('artists', data.page, data.totalPages);

    } catch (error) {
        console.error('Error cargando artistas:', error);
    }
}
```

### Actualizar loadSongs() (línea ~200):

```javascript
async function loadSongs(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/songs?page=${page}&limit=25&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        const tbody = document.getElementById('songs-table-body');
        tbody.innerHTML = data.songs.map(song => `
            <tr>
                <td><img src="${song.cover_url || '/images/default-cover.jpg'}" alt="${song.title}" class="table-img"></td>
                <td><strong>${song.title}</strong></td>
                <td>${song.artist_name || 'Desconocido'}</td>
                <td>${formatDuration(song.duration)}</td>
                <td>
                    <button class="btn-edit" onclick="editSong(${song.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteSong(${song.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Renderizar paginación
        renderPagination('songs', data.page, data.totalPages);

    } catch (error) {
        console.error('Error cargando canciones:', error);
    }
}
```

### Actualizar window.changePage() (línea ~873):

```javascript
window.changePage = function(section, page) {
    if (section === 'users') {
        currentUsersPage = page;
        loadUsers(page, usersSearchQuery);
    } else if (section === 'artists') {
        currentArtistsPage = page;
        loadArtists(page, artistsSearchQuery);
    } else if (section === 'songs') {
        currentSongsPage = page;
        loadSongs(page, songsSearchQuery);
    }
};
```

### Agregar event listeners (en DOMContentLoaded):

```javascript
// Búsqueda de artistas
const artistsSearch = document.getElementById('artists-search');
if (artistsSearch) {
    let searchTimeout;
    artistsSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            artistsSearchQuery = e.target.value;
            currentArtistsPage = 1;
            loadArtists(1, artistsSearchQuery);
        }, 300);
    });
}

// Búsqueda de canciones
const songsSearch = document.getElementById('songs-search');
if (songsSearch) {
    let searchTimeout;
    songsSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            songsSearchQuery = e.target.value;
            currentSongsPage = 1;
            loadSongs(1, songsSearchQuery);
        }, 300);
    });
}
```

### Actualizar navegación para cargar datos:

```javascript
// En el event listener de navegación, agregar:
if (sectionId === 'artists') {
    loadArtists(1, '');
} else if (sectionId === 'songs') {
    loadSongs(1, '');
}
```

---

## 🧪 Pruebas

Después de implementar:

1. **Artistas:**
   - Buscar por nombre
   - Navegar entre páginas
   - Verificar que muestre 25 resultados por página

2. **Canciones:**
   - Buscar por título o artista
   - Navegar entre páginas
   - Verificar que muestre 25 resultados por página

3. **Usuarios:**
   - Ya debería funcionar correctamente

---

## 📝 Notas

- La función `renderPagination()` ya está implementada y es reutilizable
- El debounce de 300ms evita búsquedas excesivas
- Todos los endpoints devuelven la misma estructura: `{ items, total, page, limit, totalPages }`
