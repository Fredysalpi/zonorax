// ===== CONFIGURACIÓN =====
const API_BASE_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

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
async function loadArtists() {
    try {
        const response = await fetch(`${API_BASE_URL}/artists`);
        const artists = await response.json();

        const tbody = document.getElementById('artists-table-body');
        tbody.innerHTML = artists.map(artist => `
            <tr>
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

        // Cargar artistas en el select del formulario de canciones
        const artistSelect = document.getElementById('song-artist');
        artistSelect.innerHTML = '<option value="">Seleccionar artista...</option>' +
            artists.map(a => `<option value="${a.id}">${a.name}</option>`).join('');

    } catch (error) {
        console.error('Error cargando artistas:', error);
    }
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
async function loadSongs() {
    try {
        const response = await fetch(`${API_BASE_URL}/songs`);
        const songs = await response.json();

        const tbody = document.getElementById('songs-table-body');
        tbody.innerHTML = songs.map(song => `
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

    } catch (error) {
        console.error('Error cargando canciones:', error);
    }
}

function openSongModal(songId = null) {
    songForm.reset();
    document.getElementById('song-id').value = '';
    document.getElementById('song-modal-title').textContent = 'Nueva Canción';
    document.getElementById('upload-progress').style.display = 'none';

    if (songId) {
        document.getElementById('song-modal-title').textContent = 'Editar Canción';
        // TODO: Cargar datos de la canción
    }

    songModal.classList.add('active');
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
async function loadUploads() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/uploads`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const uploads = await response.json();

        const tbody = document.getElementById('uploads-table-body');
        tbody.innerHTML = uploads.map(upload => `
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

    } catch (error) {
        console.error('Error cargando uploads:', error);
    }
}

// Cargar uploads cuando se muestra la sección
navLinks.forEach(link => {
    if (link.dataset.section === 'uploads') {
        link.addEventListener('click', loadUploads);
    }
});

// ===== MODALES =====
function closeModals() {
    artistModal.classList.remove('active');
    songModal.classList.remove('active');
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

console.log('🔧 Panel de administración inicializado');
