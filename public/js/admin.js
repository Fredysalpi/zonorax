// ===== CONFIGURACIÓN =====
const API_BASE_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Variables de paginación
let currentArtistsPage = 1;
let artistsSearchQuery = '';
let currentSongsPage = 1;
let songsSearchQuery = '';
let currentUsersPage = 1;
let usersSearchQuery = '';
let currentUploadsPage = 1;
let uploadsSearchQuery = '';


// ===== ELEMENTOS DEL DOM =====
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('.admin-section');
const logoutBtn = document.getElementById('logout-btn');

// Modales
const artistModal = document.getElementById('artist-modal');
const songModal = document.getElementById('song-modal');
const artistForm = document.getElementById('artist-form');
const songForm = document.getElementById('song-form');

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', async () => {
    if (!authToken) {
        window.location.href = '/login.html';
        return;
    }

    await verifyAuth();
    await loadDashboardStats();
    await loadArtists();
    await loadSongs();

    initializeEventListeners();
    initializeMobileMenu();
});

// ===== AUTENTICACIÓN =====
async function verifyAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('No autorizado');
        }

        const data = await response.json();
        currentUser = data.user;

        if (currentUser.role !== 'admin') {
            alert('Acceso denegado. Se requiere rol de administrador.');
            window.location.href = '/';
            return;
        }

        document.getElementById('admin-name').textContent = currentUser.username;

    } catch (error) {
        console.error('Error de autenticación:', error);
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }

    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
}

// ===== NAVEGACIÓN =====
function initializeEventListeners() {
    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;

            if (sectionId) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(`${sectionId}-section`).classList.add('active');

                // Cargar datos específicos de cada sección
                if (sectionId === 'users') {
                    loadUsers(1, '');
                }
            }
        });
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Botones de agregar
    document.getElementById('add-artist-btn').addEventListener('click', () => openArtistModal());
    document.getElementById('add-song-btn').addEventListener('click', () => openSongModal());

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });

    // Formularios
    artistForm.addEventListener('submit', handleArtistSubmit);
    songForm.addEventListener('submit', handleSongSubmit);
}

// ===== MENÚ MÓVIL =====
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');

    if (!mobileMenuToggle || !sidebar) return;

    // Toggle del menú
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace de navegación
    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });

    // Cerrar menú al hacer clic en el overlay
    sidebar.addEventListener('click', (e) => {
        if (e.target === sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

// ===== DASHBOARD =====
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const stats = await response.json();

        document.getElementById('stat-songs').textContent = stats.songs;
        document.getElementById('stat-artists').textContent = stats.artists;
        document.getElementById('stat-users').textContent = stats.users;
        document.getElementById('stat-playlists').textContent = stats.playlists;
        document.getElementById('stat-plays').textContent = formatNumber(stats.totalPlays);
        document.getElementById('stat-storage').textContent = formatBytes(stats.storageUsed);

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ===== ARTISTAS =====
async function loadArtists(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/artists?page=${page}&limit=12&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        const tbody = document.getElementById('artists-table-body');
        tbody.innerHTML = data.artists.map(artist => `
            <tr>
                <td><strong>#${artist.id}</strong></td>
                <td>
                    <img src="${artist.image_url || '/images/placeholder-artist.jpg'}" 
                         alt="${artist.name}" class="table-img">
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <strong>${artist.name}</strong>
                        ${artist.is_verified ? '<img src="/images/verificado.png" alt="Verificado" style="width: 16px; height: 16px;" title="Artista Verificado">' : ''}
                    </div>
                </td>
                <td>${artist.genre || '-'}</td>
                <td>
                    <span class="status-badge ${artist.is_active ? 'status-active' : 'status-inactive'}">
                        ${artist.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${artist.song_count || 0}</td>
                <td>
                    <button class="btn-edit" onclick="editArtist(${artist.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteArtist(${artist.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');

        // Configurar autocompletado de artistas
        setupArtistAutocomplete(data.artists);

        // Configurar sistema de artistas colaboradores (ft.)
        if (typeof setupFtArtists === 'function') {
            setupFtArtists(data.artists);
        }

        // Renderizar paginación
        renderPagination('artists', data.page, data.totalPages);

    } catch (error) {
        console.error('Error cargando artistas:', error);
    }
}

// Configurar autocompletado de artistas
function setupArtistAutocomplete(artists) {
    const searchInput = document.getElementById('song-artist-search');
    const hiddenInput = document.getElementById('song-artist');
    const suggestionsDiv = document.getElementById('artist-suggestions');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const fullValue = e.target.value;

        // IMPORTANTE: Sincronizar el valor con el campo hidden
        // Esto permite que los IDs escritos directamente se guarden
        hiddenInput.value = fullValue;

        const lastCommaIndex = fullValue.lastIndexOf(',');
        const query = (lastCommaIndex !== -1 ? fullValue.substring(lastCommaIndex + 1) : fullValue).toLowerCase().trim();

        if (query.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const filtered = artists.filter(artist =>
            artist.name.toLowerCase().includes(query) || artist.id.toString().includes(query)
        );

        if (filtered.length === 0) {
            suggestionsDiv.innerHTML = '<div style="padding: 12px; color: var(--text-subdued);">No se encontraron artistas</div>';
            suggestionsDiv.style.display = 'block';
            return;
        }

        suggestionsDiv.innerHTML = filtered.map(artist => `
            <div class="artist-suggestion-item" data-id="${artist.id}" data-name="${artist.name}">
                <span class="artist-name">${artist.name}</span>
                <span class="artist-id">(${artist.id})</span>
            </div>
        `).join('');

        suggestionsDiv.style.display = 'block';

        // Agregar event listeners a las sugerencias
        suggestionsDiv.querySelectorAll('.artist-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const artistId = item.dataset.id;
                const artistName = item.dataset.name;

                // Obtener el valor actual del campo hidden
                const currentIds = hiddenInput.value.trim();
                const currentIdsArray = currentIds ? currentIds.split(',').map(id => id.trim()) : [];

                // Agregar el nuevo ID si no existe ya
                if (!currentIdsArray.includes(artistId)) {
                    currentIdsArray.push(artistId);
                }

                // Actualizar el campo hidden con los IDs separados por coma
                hiddenInput.value = currentIdsArray.join(', ');

                // Actualizar el campo visible con los IDs también
                searchInput.value = currentIdsArray.join(', ');

                suggestionsDiv.style.display = 'none';
            });
        });
    });

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

function openArtistModal(artistId = null) {
    artistForm.reset();
    document.getElementById('artist-id').value = '';
    document.getElementById('artist-modal-title').textContent = 'Nuevo DJ/Artista';
    document.getElementById('artist-verified').checked = false;

    if (artistId) {
        // Cargar datos del artista para editar
        document.getElementById('artist-modal-title').textContent = 'Editar DJ/Artista';
        loadArtistData(artistId);
    }

    artistModal.classList.add('active');
}

async function loadArtistData(artistId) {
    try {
        const response = await fetch(`${API_BASE_URL}/artists/${artistId}`);
        const artist = await response.json();

        document.getElementById('artist-id').value = artist.id;
        document.getElementById('artist-name').value = artist.name || '';
        document.getElementById('artist-genre').value = artist.genre || '';
        document.getElementById('artist-bio').value = artist.bio || '';
        document.getElementById('artist-verified').checked = artist.is_verified === 1 || artist.is_verified === true;
        document.getElementById('artist-active').checked = artist.is_active === 1 || artist.is_active === true;

        // Parsear redes sociales del JSON
        if (artist.social_links) {
            try {
                const socials = typeof artist.social_links === 'string'
                    ? JSON.parse(artist.social_links)
                    : artist.social_links;

                document.getElementById('artist-facebook').value = socials.facebook || '';
                document.getElementById('artist-instagram').value = socials.instagram || '';
                document.getElementById('artist-whatsapp').value = socials.whatsapp || '';
            } catch (e) {
                console.error('Error parsing social links:', e);
            }
        }
    } catch (error) {
        console.error('Error cargando datos del artista:', error);
        alert('Error al cargar los datos del artista');
    }
}

async function handleArtistSubmit(e) {
    e.preventDefault();

    const formData = new FormData(artistForm);
    const artistId = document.getElementById('artist-id').value;

    // Construir objeto de redes sociales desde los campos individuales
    const facebook = document.getElementById('artist-facebook').value.trim();
    const instagram = document.getElementById('artist-instagram').value.trim();
    const whatsapp = document.getElementById('artist-whatsapp').value.trim();

    const socialLinks = {};
    if (facebook) socialLinks.facebook = facebook;
    if (instagram) socialLinks.instagram = instagram;
    if (whatsapp) socialLinks.whatsapp = whatsapp;

    // Agregar social_links como JSON al formData
    if (Object.keys(socialLinks).length > 0) {
        formData.set('social_links', JSON.stringify(socialLinks));
    }

    try {
        const url = artistId
            ? `${API_BASE_URL}/admin/artists/${artistId}`
            : `${API_BASE_URL}/admin/artists`;

        const method = artistId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al guardar artista');
        }

        alert('Artista guardado exitosamente');
        closeModals();
        await loadArtists();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar artista: ' + error.message);
    }
}

async function deleteArtist(id) {
    if (!confirm('¿Estás seguro de eliminar este artista? Esto también eliminará todas sus canciones.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/artists/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar artista');
        }

        alert('Artista eliminado exitosamente');
        await loadArtists();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar artista: ' + error.message);
    }
}

// ===== CANCIONES =====
async function loadSongs(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/songs?page=${page}&limit=12&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        const tbody = document.getElementById('songs-table-body');
        tbody.innerHTML = data.songs.map(song => `
            <tr>
                <td>
                    <img src="${song.cover_image || '/images/placeholder-cover.jpg'}" 
                         alt="${song.title}" class="table-img">
                </td>
                <td><strong>${song.title}</strong></td>
                <td>${song.artist_name || '-'}</td>
                <td>
                    <span class="status-badge status-active">${(song.file_format || 'mp3').toUpperCase()}</span>
                </td>
                <td>${song.bpm || '-'}</td>
                <td>${song.key_signature || '-'}</td>
                <td>${formatNumber(song.plays)}</td>
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

function openSongModal(songId = null) {
    songForm.reset();
    document.getElementById('song-id').value = '';
    document.getElementById('song-modal-title').textContent = 'Nueva Canción';
    document.getElementById('upload-progress').style.display = 'none';

    // Limpiar campo de artista principal
    document.getElementById('song-artist-search').value = '';
    document.getElementById('song-artist').value = '';

    // Limpiar artistas colaboradores
    if (typeof window.clearFtArtists === 'function') {
        window.clearFtArtists();
    }

    if (songId) {
        document.getElementById('song-modal-title').textContent = 'Editar Canción';
        loadSongData(songId);
    }

    songModal.classList.add('active');
}

async function loadSongData(songId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/songs?page=1&limit=1000&search=`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        const song = data.songs.find(s => s.id === songId);

        if (song) {
            document.getElementById('song-id').value = song.id;
            document.getElementById('song-title').value = song.title || '';

            // Obtener la lista de artistas para el autocompletado
            const artistsResponse = await fetch(`${API_BASE_URL}/admin/artists?page=1&limit=1000&search=`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const artistsData = await artistsResponse.json();

            // Cargar artista principal
            if (song.artist_id) {
                const mainArtist = artistsData.artists.find(a => a.id === song.artist_id);
                if (mainArtist) {
                    document.getElementById('song-artist-search').value = mainArtist.name;
                    document.getElementById('song-artist').value = mainArtist.id;
                }
            }

            // Cargar artistas colaboradores (ft.)
            if (song.ft_artists && typeof window.loadExistingFtArtists === 'function') {
                window.loadExistingFtArtists(song.ft_artists, artistsData.artists);
            }

            // Convertir duración de segundos a mm:ss
            if (song.duration) {
                const minutes = Math.floor(song.duration / 60);
                const seconds = song.duration % 60;
                document.getElementById('song-duration').value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }

            document.getElementById('song-genre').value = song.genre || '';
            document.getElementById('song-bpm').value = song.bpm || '';
            document.getElementById('song-key').value = song.key_signature || '';
        }
    } catch (error) {
        console.error('Error cargando datos de la canción:', error);
        alert('Error al cargar los datos de la canción');
    }
}

async function handleSongSubmit(e) {
    e.preventDefault();

    const formData = new FormData(songForm);
    const songId = document.getElementById('song-id').value;

    // Validar que se haya seleccionado un archivo de audio (solo para nuevas canciones)
    if (!songId && !formData.get('audio').size) {
        alert('Por favor selecciona un archivo de audio');
        return;
    }

    // Convertir duración de mm:ss a segundos
    const durationInput = document.getElementById('song-duration').value;
    const durationInSeconds = convertDurationToSeconds(durationInput);

    if (durationInSeconds === null) {
        alert('Por favor ingresa una duración válida en formato mm:ss (ejemplo: 2:54)');
        return;
    }

    // Reemplazar el valor de duración con los segundos
    formData.set('duration', durationInSeconds);

    try {
        const url = songId
            ? `${API_BASE_URL}/admin/songs/${songId}`
            : `${API_BASE_URL}/admin/songs`;

        const method = songId ? 'PUT' : 'POST';

        // Mostrar barra de progreso
        const progressDiv = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        progressDiv.style.display = 'block';

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = Math.round(percentComplete) + '%';
            }
        });

        xhr.addEventListener('load', async () => {
            if (xhr.status === 200 || xhr.status === 201) {
                alert('Canción guardada exitosamente');
                closeModals();
                await loadSongs();
                await loadDashboardStats();
            } else {
                throw new Error('Error al guardar canción');
            }
        });

        xhr.addEventListener('error', () => {
            alert('Error al subir la canción');
        });

        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        xhr.send(formData);

    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar canción: ' + error.message);
    }
}

// Función para convertir duración de mm:ss a segundos
function convertDurationToSeconds(duration) {
    if (!duration) return null;

    const parts = duration.split(':');
    if (parts.length !== 2) return null;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || seconds < 0) {
        return null;
    }

    return (minutes * 60) + seconds;
}

async function deleteSong(id) {
    if (!confirm('¿Estás seguro de eliminar esta canción? Esto también eliminará el archivo de Cloudflare R2.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/songs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar canción');
        }

        alert('Canción eliminada exitosamente');
        await loadSongs();
        await loadDashboardStats();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar canción: ' + error.message);
    }
}

// ===== ARCHIVOS SUBIDOS =====
async function loadUploads(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/uploads?page=${page}&limit=12&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        const tbody = document.getElementById('uploads-table-body');
        tbody.innerHTML = data.uploads.map(upload => `
            <tr>
                <td><strong>${upload.file_name}</strong></td>
                <td>
                    <span class="status-badge ${upload.file_type === 'audio' ? 'status-active' : 'status-info'}">
                        ${upload.file_type}
                    </span>
                </td>
                <td>${upload.file_format.toUpperCase()}</td>
                <td>${formatBytes(upload.file_size)}</td>
                <td>${upload.username}</td>
                <td>${formatDate(upload.uploaded_at)}</td>
            </tr>
        `).join('');

        // Renderizar paginación
        renderPagination('uploads', data.page, data.totalPages);

    } catch (error) {
        console.error('Error cargando uploads:', error);
    }
}


// ===== MODALES =====
function closeModals() {
    artistModal.classList.remove('active');
    songModal.classList.remove('active');
    const userModal = document.getElementById('user-modal');
    if (userModal) {
        userModal.classList.remove('active');
    }
}

// ===== UTILIDADES =====
function formatNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('es-ES').format(num);
}

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}


// Funciones globales para los botones
window.editArtist = (id) => openArtistModal(id);
window.deleteArtist = deleteArtist;
window.editSong = (id) => openSongModal(id);
window.deleteSong = deleteSong;

// ===== GESTIÓN DE USUARIOS =====

// ===== GESTIÓN DE USUARIOS =====

const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');

// Cargar usuarios con paginación
async function loadUsers(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=12&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = data.users.map(user => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre';
            const avatarUrl = user.profile_image || '/images/user-avatar.jpg';

            return `
            <tr>
                <td>
                    <img src="${avatarUrl}" alt="${user.username}" class="table-img" style="border-radius: 50%;">
                </td>
                <td><strong>${fullName}</strong></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone || '-'}</td>
                <td>
                    <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-info'}">
                        ${user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                </td>
                <td>
                    <button class="btn-edit" onclick="editUser(${user.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                </td>
            </tr>
        `}).join('');

        // Renderizar paginación
        renderPagination('users', data.page, data.totalPages, (newPage) => {
            currentUsersPage = newPage;
            loadUsers(newPage, usersSearchQuery);
        });

    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

// Abrir modal de usuario
function openUserModal(userId = null) {
    userForm.reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-password').required = true;

    if (userId) {
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-password').required = false;
        loadUserData(userId);
    }

    userModal.classList.add('active');
}

// Cargar datos del usuario
async function loadUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users?search=&page=1&limit=1000`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        const user = data.users.find(u => u.id === userId);

        if (user) {
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.first_name || '';
            document.getElementById('user-lastname').value = user.last_name || '';
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-phone').value = user.phone || '';
            document.getElementById('user-role').value = user.role;

            // Mostrar avatar actual si existe
            if (user.profile_image) {
                document.getElementById('current-avatar-preview').style.display = 'block';
                document.getElementById('current-avatar-img').src = user.profile_image;
            } else {
                document.getElementById('current-avatar-preview').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        alert('Error al cargar los datos del usuario');
    }
}

// Manejar envío del formulario de usuario
async function handleUserSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('user-id').value;
    const formData = new FormData();

    // Agregar todos los campos
    formData.append('first_name', document.getElementById('user-name').value);
    formData.append('last_name', document.getElementById('user-lastname').value);
    formData.append('username', document.getElementById('user-username').value);
    formData.append('email', document.getElementById('user-email').value);
    formData.append('phone', document.getElementById('user-phone').value);
    formData.append('role', document.getElementById('user-role').value);

    const password = document.getElementById('user-password').value;
    if (password) {
        formData.append('password', password);
    }

    // Agregar avatar si se seleccionó
    const avatarFile = document.getElementById('user-avatar').files[0];
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    try {
        const url = userId
            ? `${API_BASE_URL}/admin/users/${userId}`
            : `${API_BASE_URL}/admin/users`;

        const method = userId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar usuario');
        }

        alert('Usuario guardado exitosamente');
        closeModals();
        await loadUsers(currentUsersPage, usersSearchQuery);
        await loadDashboardStats();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar usuario: ' + error.message);
    }
}

// Eliminar usuario
async function deleteUser(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar usuario');
        }

        alert('Usuario eliminado exitosamente');
        await loadUsers(currentUsersPage, usersSearchQuery);
        await loadDashboardStats();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario: ' + error.message);
    }
}

// Función global para editar usuario
window.editUser = (id) => openUserModal(id);
window.deleteUser = deleteUser;

// ===== FUNCIÓN GENÉRICA DE PAGINACIÓN =====

function renderPagination(section, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(`${section}-pagination`);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Botón anterior
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
             onclick="changePage('${section}', ${currentPage - 1})">
             ← Anterior
             </button>`;

    // Páginas
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage('${section}', 1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-info">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                 onclick="changePage('${section}', ${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-info">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="changePage('${section}', ${totalPages})">${totalPages}</button>`;
    }

    // Botón siguiente
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
             onclick="changePage('${section}', ${currentPage + 1})">
             Siguiente →
             </button>`;

    // Info
    html += `<span class="pagination-info">Página ${currentPage} de ${totalPages}</span>`;

    container.innerHTML = html;
}

// Función global para cambiar de página
window.changePage = function (section, page) {
    if (section === 'users') {
        currentUsersPage = page;
        loadUsers(page, usersSearchQuery);
    } else if (section === 'artists') {
        currentArtistsPage = page;
        loadArtists(page, artistsSearchQuery);
    } else if (section === 'songs') {
        currentSongsPage = page;
        loadSongs(page, songsSearchQuery);
    } else if (section === 'uploads') {
        currentUploadsPage = page;
        loadUploads(page, uploadsSearchQuery);
    }
};

// Agregar event listeners para usuarios
document.addEventListener('DOMContentLoaded', () => {
    // Búsqueda de usuarios
    const usersSearch = document.getElementById('users-search');
    if (usersSearch) {
        let searchTimeout;
        usersSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                usersSearchQuery = e.target.value;
                currentUsersPage = 1;
                loadUsers(1, usersSearchQuery);
            }, 300);
        });
    }

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

    // Búsqueda de uploads
    const uploadsSearch = document.getElementById('uploads-search');
    if (uploadsSearch) {
        let searchTimeout;
        uploadsSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                uploadsSearchQuery = e.target.value;
                currentUploadsPage = 1;
                loadUploads(1, uploadsSearchQuery);
            }, 300);
        });
    }

    // Formulario de usuario
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }

    // Botón de agregar usuario
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openUserModal());
    }

    // Cargar datos cuando se muestra cada sección
    navLinks.forEach(link => {
        if (link.dataset.section === 'users') {
            link.addEventListener('click', () => loadUsers(1, ''));
        } else if (link.dataset.section === 'artists') {
            link.addEventListener('click', () => loadArtists(1, ''));
        } else if (link.dataset.section === 'songs') {
            link.addEventListener('click', () => loadSongs(1, ''));
        } else if (link.dataset.section === 'uploads') {
            link.addEventListener('click', () => loadUploads(1, ''));
        }
    });
});

console.log('🔧 Panel de administración inicializado');
