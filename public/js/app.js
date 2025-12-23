// ===== CONFIGURACIÃ“N Y ESTADO GLOBAL =====
const API_BASE_URL = '/api';
let currentPlaylist = [];
let currentSongIndex = 0;
let isPlaying = false;
let currentVolume = 0.8;
let isShuffle = false;
let repeatMode = 'off';

// ===== FUNCIONES AUXILIARES =====
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRandomGradient() {
    const gradients = [
        '#667eea 0%, #764ba2 100%',
        '#f093fb 0%, #f5576c 100%',
        '#4facfe 0%, #00f2fe 100%',
        '#43e97b 0%, #38f9d7 100%',
        '#fa709a 0%, #fee140 100%',
        '#30cfd0 0%, #330867 100%',
        '#a8edea 0%, #fed6e3 100%',
        '#ff9a9e 0%, #fecfef 100%',
        '#ffecd2 0%, #fcb69f 100%',
        '#ff6e7f 0%, #bfe9ff 100%'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// ===== HISTORIAL DE NAVEGACIÃ“N =====
let navigationHistory = [];
let navigationIndex = -1;
let isNavigating = false;

// ===== FUNCIÓN PARA VOLVER A LA PÁGINA PRINCIPAL =====
function goHome() {
    const contentWrapper = document.querySelector('.content-wrapper');

    contentWrapper.innerHTML = `
        <section class="djs-section">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: var(--text-base);">DJs Destacados</h2>
            <div class="djs-grid" id="djs-grid">
                <!-- DJs se cargarán aquí -->
            </div>
        </section>

        <section class="releases-section">
            <div class="section-header">
                <h2>Lanzamientos</h2>
                <a href="#" class="show-all">Mostrar todo</a>
            </div>
            <div class="releases-grid" id="releases-grid">
                <!-- Lanzamientos se cargarán aquí -->
            </div>
        </section>
    `;

    // Recargar el contenido
    loadDJs();
    loadFeaturedPlaylists();
    loadReleases();

    // Solo guardar estado si no estamos navegando (para evitar duplicados en el historial)
    if (!isNavigating) {
        saveToHistory();
    }
}

// ===== FUNCIONES DE NAVEGACIÓN (ATRÁS/ADELANTE) =====
function navigateBack() {
    if (navigationIndex > 0) {
        isNavigating = true;
        navigationIndex--;
        const state = navigationHistory[navigationIndex];
        restoreNavigationState(state);
        updateNavigationButtons();
    }
}

function navigateForward() {
    if (navigationIndex < navigationHistory.length - 1) {
        isNavigating = true;
        navigationIndex++;
        const state = navigationHistory[navigationIndex];
        restoreNavigationState(state);
        updateNavigationButtons();
    }
}

function saveToHistory() {
    if (isNavigating) {
        isNavigating = false;
        return;
    }

    const contentWrapper = document.querySelector('.content-wrapper');
    const state = {
        html: contentWrapper.innerHTML,
        scrollPosition: contentWrapper.scrollTop
    };

    // Si no estamos al final del historial, eliminar el historial hacia adelante
    if (navigationIndex < navigationHistory.length - 1) {
        navigationHistory = navigationHistory.slice(0, navigationIndex + 1);
    }

    navigationHistory.push(state);
    navigationIndex = navigationHistory.length - 1;
    updateNavigationButtons();
}

function restoreNavigationState(state) {
    const contentWrapper = document.querySelector('.content-wrapper');
    contentWrapper.innerHTML = state.html;
    contentWrapper.scrollTop = state.scrollPosition;

    // Re-inicializar event listeners si es necesario
    setTimeout(() => {
        isNavigating = false;
    }, 100);
}

function updateNavigationButtons() {
    const backBtn = document.querySelector('.nav-buttons .nav-btn:first-child');
    const forwardBtn = document.querySelector('.nav-buttons .nav-btn:last-child');

    if (backBtn) {
        backBtn.disabled = navigationIndex <= 0;
        backBtn.style.opacity = navigationIndex <= 0 ? '0.5' : '1';
        backBtn.style.cursor = navigationIndex <= 0 ? 'not-allowed' : 'pointer';
    }

    if (forwardBtn) {
        forwardBtn.disabled = navigationIndex >= navigationHistory.length - 1;
        forwardBtn.style.opacity = navigationIndex >= navigationHistory.length - 1 ? '0.5' : '1';
        forwardBtn.style.cursor = navigationIndex >= navigationHistory.length - 1 ? 'not-allowed' : 'pointer';
    }
}

function initNavButtons() {
    const backBtn = document.querySelector('.nav-buttons .nav-btn:first-child');
    const forwardBtn = document.querySelector('.nav-buttons .nav-btn:last-child');

    if (backBtn) {
        backBtn.addEventListener('click', navigateBack);
    }

    if (forwardBtn) {
        forwardBtn.addEventListener('click', navigateForward);
    }

    updateNavigationButtons();
}

// Hacer las funciones globales
window.goHome = goHome;
window.navigateBack = navigateBack;
window.navigateForward = navigateForward;


// ===== ELEMENTOS DEL DOM =====
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressFill = document.getElementById('progress-fill');
const progressHandle = document.getElementById('progress-handle');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const volumeFill = document.getElementById('volume-fill');
const volumeHandle = document.getElementById('volume-handle');
const playerCover = document.getElementById('player-cover');
const playerSongTitle = document.getElementById('player-song-title');
const playerArtist = document.getElementById('player-artist');

// ===== INICIALIZACIÃ“N =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlaylists();
    await loadFeaturedPlaylists();
    await loadReleases();
    await loadDJs();
    initializePlayer();
    initializeEventListeners();
    initNavButtons();
    generateUserAvatar();
    setupCreatePlaylist();
    // setupLikeButton eliminado

    setTimeout(() => {
        saveToHistory();
    }, 500);
});

// ===== CARGA DE DATOS =====
// Función para obtener el user_id del usuario actual
function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.id || null;
}

async function loadPlaylists() {
    try {
        const userId = getCurrentUserId();
        const url = userId ? `${API_BASE_URL}/playlists?user_id=${userId}` : `${API_BASE_URL}/playlists`;
        const response = await fetch(url);
        const playlists = await response.json();

        // Ordenar: "Me Gusta" primero, luego las demás por fecha de creación
        playlists.sort((a, b) => {
            if (a.name === 'Me Gusta') return -1;
            if (b.name === 'Me Gusta') return 1;
            return new Date(b.created_at) - new Date(a.created_at);
        });

        const container = document.getElementById('playlists-container');
        container.innerHTML = playlists.map(playlist => `
            <div class="playlist-item" data-playlist-id="${playlist.id}">
                <div class="playlist-cover" style="background: linear-gradient(135deg, ${getRandomGradient()}); width: 48px; height: 48px; min-width: 48px; min-height: 48px; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative;">
                    ${playlist.cover_image ? `<img src="${playlist.cover_image}" alt="${playlist.name}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                    ${playlist.name === 'Me Gusta' ? `
                        <svg viewBox="0 0 16 16" width="24" height="24" style="position: absolute; fill: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                            <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"/>
                        </svg>
                    ` : ''}
                </div>
                <div class="playlist-info">
                    <div class="playlist-name">${playlist.name}</div>
                    <div class="playlist-meta">
                        ${playlist.is_public ? '<svg viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z" fill="currentColor"/></svg>' : ''}
                        Playlist • ${playlist.song_count || 0} canciones
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', async () => {
                const playlistId = item.dataset.playlistId;
                await loadPlaylistSongs(playlistId);
            });
        });
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

// ===== CREAR PLAYLIST =====
function setupCreatePlaylist() {
    const createBtn = document.getElementById('create-playlist-btn');
    if (!createBtn) return;

    createBtn.addEventListener('click', () => {
        showCreatePlaylistModal();
    });
}

function showCreatePlaylistModal() {
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'create-playlist-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: var(--bg-elevated);
            border-radius: 8px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        ">
            <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px; color: var(--text-base);">Crear playlist</h2>
            
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-base);">Nombre</label>
                <input type="text" id="playlist-name-input" placeholder="Mi playlist" style="
                    width: 100%;
                    padding: 12px;
                    background: var(--bg-base);
                    border: 1px solid var(--border-subtle);
                    border-radius: 4px;
                    color: var(--text-base);
                    font-size: 14px;
                ">
            </div>
            
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-base);">Descripción (opcional)</label>
                <textarea id="playlist-description-input" placeholder="Agrega una descripción" style="
                    width: 100%;
                    padding: 12px;
                    background: var(--bg-base);
                    border: 1px solid var(--border-subtle);
                    border-radius: 4px;
                    color: var(--text-base);
                    font-size: 14px;
                    resize: vertical;
                    min-height: 80px;
                "></textarea>
            </div>
            
            <div style="margin-bottom: 24px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="playlist-public-checkbox" style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-size: 14px; color: var(--text-base);">Hacer pública(Todos los usuarios podran ver tu Playlist)</span>
                </label>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancel-create-playlist" style="
                    padding: 12px 24px;
                    background: transparent;
                    border: 1px solid var(--text-subdued);
                    border-radius: 24px;
                    color: var(--text-base);
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                ">Cancelar</button>
                <button id="confirm-create-playlist" style="
                    padding: 12px 24px;
                    background: var(--accent-base);
                    border: none;
                    border-radius: 24px;
                    color: var(--bg-base);
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                ">Crear</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus en el input de nombre
    setTimeout(() => {
        document.getElementById('playlist-name-input').focus();
    }, 100);

    // Event listeners
    document.getElementById('cancel-create-playlist').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('confirm-create-playlist').addEventListener('click', async () => {
        await createPlaylist();
        modal.remove();
    });

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

async function createPlaylist() {
    const name = document.getElementById('playlist-name-input').value.trim();
    const description = document.getElementById('playlist-description-input').value.trim();
    const isPublic = document.getElementById('playlist-public-checkbox').checked;

    if (!name) {
        alert('Por favor ingresa un nombre para la playlist');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const userId = getCurrentUserId();

        if (!userId) {
            alert('Debes iniciar sesión para crear una playlist');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                name: name,
                description: description || null,
                is_public: isPublic
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear la playlist');
        }

        const newPlaylist = await response.json();

        // Recargar playlists
        await loadPlaylists();

        // Mostrar mensaje de éxito
        alert(`✅ Playlist "${name}" creada exitosamente`);

        // Abrir la nueva playlist
        if (newPlaylist.id) {
            await loadPlaylistSongs(newPlaylist.id);
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        alert('❌ Error al crear la playlist: ' + error.message);
    }
}

async function loadFeaturedPlaylists() {
    try {
        const response = await fetch(`${API_BASE_URL}/playlists`);
        const playlists = await response.json();

        const container = document.getElementById('featured-playlists');
        const featured = playlists.slice(0, 6);

        container.innerHTML = featured.map(playlist => `
            <div class="featured-card" data-playlist-id="${playlist.id}">
                <div class="featured-card-image" style="background: linear-gradient(135deg, ${getRandomGradient()});">
                    <button class="play-button">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
                <div class="featured-card-title">${playlist.name}</div>
                <div class="featured-card-subtitle">${playlist.description || `Playlist â€¢ ${playlist.song_count || 0} canciones`}</div>
            </div>
        `).join('');

        document.querySelectorAll('.featured-card').forEach(card => {
            const playBtn = card.querySelector('.play-button');
            playBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const playlistId = card.dataset.playlistId;
                await loadPlaylistSongs(playlistId);
                playSong(0);
            });

            card.addEventListener('click', async () => {
                const playlistId = card.dataset.playlistId;
                await loadPlaylistSongs(playlistId);
            });
        });
    } catch (error) {
        console.error('Error loading featured playlists:', error);
    }
}

async function loadReleases() {
    try {
        const response = await fetch(`${API_BASE_URL}/songs`);
        const songs = await response.json();

        const container = document.getElementById('releases-grid');
        const releases = songs.slice(0, 5);

        container.innerHTML = releases.map((song, index) => `
            <div class="release-card" data-song-index="${index}">
                ${index === 0 ? '<div class="release-badge">HOT NOW!</div>' : ''}
                <div class="release-card-image" style="background: linear-gradient(135deg, ${getRandomGradient()});">
                        ${song.cover_image ? `<img src="${song.cover_image}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; position: absolute; top: 0; left: 0;">` : ''}
                    <button class="play-button">
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
                <div class="featured-card-title">${song.title}</div>
                <div class="featured-card-subtitle">${song.artist_name || 'Artista Desconocido'}</div>
            </div>
        `).join('');

        currentPlaylist = releases;

        document.querySelectorAll('.release-card').forEach(card => {
            const playBtn = card.querySelector('.play-button');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songIndex = parseInt(card.dataset.songIndex);
                playSong(songIndex);
            });
        });
    } catch (error) {
        console.error('Error loading releases:', error);
    }
}

async function loadDJs() {
    try {
        const response = await fetch(`${API_BASE_URL}/artists`);
        const artists = await response.json();

        const container = document.getElementById('djs-grid');
        const djs = artists.filter(a => a.is_verified).slice(0, 4);

        container.innerHTML = djs.map(dj => `
            <div class="dj-card" onclick="window.showArtistPage(${dj.id})" style="cursor: pointer; text-align: center;">
                <div class="dj-image" style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; margin: 0 auto 12px; background: linear-gradient(135deg, ${getRandomGradient()});">
                    ${dj.image_url ? `<img src="${dj.image_url}" alt="${dj.name}" style="width: 100%; height: 100%; object-fit: cover;">` : ''}
                </div>
                <div class="dj-name" style="font-size: 16px; font-weight: 700; color: var(--text-base); margin-bottom: 4px;">${dj.name}</div>
                <div class="dj-genre" style="font-size: 14px; color: var(--text-subdued);">${dj.genre || 'Electronica'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading DJs:', error);
    }
}

async function loadPlaylistSongs(playlistId) {
    try {
        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`);
        const playlist = await response.json();
        currentPlaylist = playlist.songs || [];

        // Mostrar la vista de la playlist en el main content
        const contentWrapper = document.querySelector('.content-wrapper');

        const totalDuration = currentPlaylist.reduce((sum, song) => sum + (song.duration || 0), 0);
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const durationText = hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;

        contentWrapper.innerHTML = `
            <div class="playlist-page" style="padding: 0;">
                <!-- Header de la Playlist -->
                <div class="playlist-header" style="
                    background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), 
                                linear-gradient(135deg, ${getRandomGradient()});
                    padding: 80px 24px 40px;
                    margin: -24px -24px 24px -24px;
                    border-radius: 8px 8px 0 0;
                    min-height: 340px;
                    display: flex;
                    align-items: flex-end;
                    gap: 24px;
                ">
                    <!-- Cover de la Playlist -->
                    <div style="
                        width: 232px;
                        height: 232px;
                        background: linear-gradient(135deg, ${getRandomGradient()});
                        border-radius: 8px;
                        flex-shrink: 0;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        position: relative;
                    ">
                        ${playlist.cover_image ?
                `<img src="${playlist.cover_image}" style="width: 100%; height: 100%; object-fit: cover;">` :
                playlist.name === 'Me Gusta' ?
                    `<svg viewBox="0 0 16 16" width="120" height="120" style="fill: white; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));">
                    <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"/>
                </svg>` :
                    `<svg viewBox="0 0 24 24" width="80" height="80" fill="rgba(255,255,255,0.7)">
                                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l8-4.5a1 1 0 0 0 0-1.732l-8-4.5zM16 19.268V4.732L21.197 12 16 19.268zM7 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" fill="currentColor"/>
                            </svg>`
            }

                    </div>
                    
                    <!-- Info de la Playlist -->
                    <div style="flex: 1;">
                        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                            ${playlist.is_public ? 'Playlist pública' : 'Playlist privada'}
                        </div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                            <h1 style="font-size: 72px; font-weight: 900; line-height: 1; margin: 0;">${playlist.name}</h1>
                            <!-- Botón de opciones (3 puntos) -->
                            <button id="playlist-options-btn" onclick="togglePlaylistOptions(event, ${playlistId})" style="
                                width: 40px;
                                height: 40px;
                                border-radius: 50%;
                                background: rgba(0,0,0,0.3);
                                border: none;
                                color: var(--text-base);
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                                transition: background 0.2s;
                            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                                <svg viewBox="0 0 16 16" width="20" height="20">
                                    <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM16 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                        ${playlist.description ? `<p style="font-size: 14px; color: var(--text-subdued); margin-bottom: 16px;">${playlist.description}</p>` : ''}
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600;">
                            <!-- Avatar del usuario -->
                            ${(() => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const userName = currentUser.username || playlist.username || 'Usuario';
                const userInitial = userName.charAt(0).toUpperCase();
                const profileImage = currentUser.profile_image;

                if (profileImage) {
                    return `<div style="
                                        width: 24px;
                                        height: 24px;
                                        border-radius: 50%;
                                        overflow: hidden;
                                    ">
                                        <img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover;">
                                    </div>`;
                } else {
                    return `<div style="
                                        width: 24px;
                                        height: 24px;
                                        border-radius: 50%;
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 12px;
                                        font-weight: 700;
                                        color: white;
                                    ">
                                        ${userInitial}
                                    </div>`;
                }
            })()}
                            <span>${(() => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                return currentUser.username || playlist.username || 'Usuario';
            })()}</span>
                            <span>•</span>
                            <span>${currentPlaylist.length} canciones</span>
                            ${currentPlaylist.length > 0 ? `<span>•</span><span>cerca de ${durationText}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Controles de la Playlist -->
                <div style="padding: 24px; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%);">
                    <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
                        ${currentPlaylist.length > 0 ? `
                            <button onclick="playSong(0)" style="
                                width: 56px;
                                height: 56px;
                                border-radius: 50%;
                                background: var(--accent-base);
                                border: none;
                                color: var(--bg-base);
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 24px;
                                transition: all 0.2s;
                            " onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
                                ▶
                            </button>
                        ` : ''}
                    </div>
                    
                    ${currentPlaylist.length > 0 ? `
                        <!-- Lista de Canciones -->
                        <div style="margin-bottom: 40px;">
                            <!-- Header de la tabla -->
                            <div style="
                                display: grid;
                                grid-template-columns: 40px 1fr 1fr 40px 40px;
                                gap: 16px;
                                padding: 8px 16px;
                                border-bottom: 1px solid var(--border-subtle);
                                margin-bottom: 8px;
                                color: var(--text-subdued);
                                font-size: 12px;
                                font-weight: 600;
                                text-transform: uppercase;
                            ">
                                <div style="text-align: center;">#</div>
                                <div>Título</div>
                                <div>Álbum</div>
                                <div style="text-align: center;">
                                    <svg viewBox="0 0 16 16" width="16" height="16">
                                        <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" fill="currentColor"/>
                                        <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H12a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div></div>
                            </div>
                            
                            <!-- Canciones -->
                            ${currentPlaylist.map((song, index) => `
                                <div class="song-row" style="
                                    display: grid;
                                    grid-template-columns: 40px 1fr 1fr 40px 40px;
                                    gap: 16px;
                                    padding: 8px 16px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    align-items: center;
                                    transition: background-color 0.2s;
                                " onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">
                                    <div style="display: flex; align-items: center; justify-content: center;" onclick="playSong(${index})">
                                        <span style="color: var(--text-subdued); font-size: 16px;">${index + 1}</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" onclick="playSong(${index})">
                                        ${song.cover_image ? `<img src="${song.cover_image}" alt="${song.title}" style="width: 40px; height: 40px; border-radius: 4px;">` : ''}
                                        <div>
                                            <div style="font-size: 16px; color: var(--text-base); margin-bottom: 4px;">${song.title}</div>
                                            <div style="font-size: 14px; color: var(--text-subdued);">${song.artist_name || 'Artista Desconocido'}</div>
                                        </div>
                                    </div>
                                    <div style="color: var(--text-subdued); font-size: 14px;" onclick="playSong(${index})">${song.album_name || '-'}</div>
                                    <div style="color: var(--text-subdued); font-size: 14px; text-align: center;" onclick="playSong(${index})">${formatTime(song.duration)}</div>
                                    <div style="display: flex; align-items: center; justify-content: center;">
                                        <button class="song-remove-btn" onclick="event.stopPropagation(); removeSongFromPlaylist(${playlistId}, ${song.id}, '${song.title.replace(/'/g, "\\'")}');" title="Eliminar de la playlist" style="
                                            width: 32px;
                                            height: 32px;
                                            border-radius: 50%;
                                            border: none;
                                            background: transparent;
                                            color: var(--text-subdued);
                                            cursor: pointer;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            transition: all 0.2s;
                                            opacity: 0;
                                        " onmouseover="this.style.background='var(--bg-tint)'; this.style.color='#ff4444'; this.style.opacity='1';" onmouseout="this.style.background='transparent'; this.style.color='var(--text-subdued)'; this.style.opacity='0';">
                                            <svg viewBox="0 0 16 16" width="16" height="16">
                                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" fill="currentColor"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 60px 20px; color: var(--text-subdued);">
                            <svg viewBox="0 0 24 24" width="64" height="64" style="margin-bottom: 16px; opacity: 0.5;">
                                <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l8-4.5a1 1 0 0 0 0-1.732l-8-4.5zM16 19.268V4.732L21.197 12 16 19.268zM7 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" fill="currentColor"/>
                            </svg>
                            <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Esta playlist está vacía</h3>
                            <p style="font-size: 14px;">Agrega canciones para empezar a escuchar</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Guardar en historial de navegación
        saveToHistory();

        console.log('Playlist cargada:', playlist.name, currentPlaylist.length, 'canciones');
    } catch (error) {
        console.error('Error loading playlist songs:', error);
        alert('Error al cargar la playlist');
    }
}

// ===== REPRODUCTOR DE AUDIO =====
function initializePlayer() {
    audioPlayer.volume = currentVolume;
    updateVolumeUI();

    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = formatTime(audioPlayer.duration);
    });
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayButton();
        if (typeof updateMobilePlayButton === 'function') {
            updateMobilePlayButton(true);
        }
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayButton();
        if (typeof updateMobilePlayButton === 'function') {
            updateMobilePlayButton(false);
        }
    });
}

function updateProgress() {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
        timeCurrent.textContent = formatTime(audioPlayer.currentTime);
    }
}

function playSong(index) {
    if (currentPlaylist.length === 0) return;

    currentSongIndex = index;
    const song = currentPlaylist[currentSongIndex];

    playerCover.src = song.cover_image || '/images/placeholder-cover.jpg';
    playerSongTitle.textContent = song.title;
    playerArtist.textContent = song.artist_name || 'Artista Desconocido';

    // Guardar el artist_id de la canción actual para poder navegar a su página
    window.currentArtistId = song.artist_id;
    window.currentSongId = song.id;

    // Actualizar sidebar derecha con info de la canción
    updateSongSidebar(song);

    // Verificar si la canción está en "Me Gusta"
    updateLikeButtonState();

    // Actualizar mobile player si existe
    if (typeof updateMobilePlayerInfo === 'function') {
        updateMobilePlayerInfo(song);
    }


    audioPlayer.src = song.file_url;
    audioPlayer.play();

    fetch(`${API_BASE_URL}/songs/${song.id}/play`, { method: 'POST' });
}

// Función para ir a la página del artista actual
window.goToCurrentArtist = function () {
    if (window.currentArtistId) {
        window.showArtistPage(window.currentArtistId);
    } else {
        console.warn('No hay artista seleccionado');
    }
}

// Función para abrir el modal de agregar a playlist
window.openAddToPlaylistModal = async function () {
    if (!window.currentSongId) {
        alert('No hay canción seleccionada');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const userId = getCurrentUserId();

        // Agregar user_id como query parameter para obtener playlists públicas y privadas del usuario
        const url = userId ? `${API_BASE_URL}/playlists?user_id=${userId}` : `${API_BASE_URL}/playlists`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlists = await response.json();

        // Filtrar para excluir "Me Gusta"
        const filteredPlaylists = playlists.filter(p => p.name !== 'Me Gusta');

        const modal = document.getElementById('add-to-playlist-modal');
        const playlistList = document.getElementById('playlist-selection-list');

        if (filteredPlaylists.length === 0) {
            playlistList.innerHTML = `
                <p style="color: var(--text-subdued); text-align: center; padding: 20px;">
                    No tienes playlists disponibles. Crea una nueva playlist primero.
                </p>
            `;
        } else {
            playlistList.innerHTML = filteredPlaylists.map(playlist => `
                <button onclick="addSongToPlaylist(${playlist.id}, '${playlist.name.replace(/'/g, "\\'")}')" 
                    style="padding: 12px 16px; background: var(--bg-highlight); border: 1px solid var(--border-subtle); 
                           border-radius: 4px; color: var(--text-base); cursor: pointer; text-align: left; 
                           transition: background 0.2s; font-size: 14px;"
                    onmouseover="this.style.background='var(--bg-tint)'" 
                    onmouseout="this.style.background='var(--bg-highlight)'">
                    <div style="font-weight: 600;">${playlist.name}</div>
                    <div style="font-size: 12px; color: var(--text-subdued); margin-top: 4px;">
                        ${playlist.is_public ? '🌐 Pública' : '🔒 Privada'} • ${playlist.song_count || 0} canciones
                    </div>
                </button>
            `).join('');
        }

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error loading playlists:', error);
        alert('Error al cargar las playlists');
    }
}

// Función para cerrar el modal
window.closeAddToPlaylistModal = function () {
    const modal = document.getElementById('add-to-playlist-modal');
    modal.style.display = 'none';
}

// Función para agregar canción a una playlist
window.addSongToPlaylist = async function (playlistId, playlistName) {
    if (!window.currentSongId) {
        alert('No hay canción seleccionada');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                song_id: window.currentSongId
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al agregar la canción');
        }

        alert(`✅ Canción agregada a "${playlistName}"`);

        // Cerrar el modal automáticamente
        closeAddToPlaylistModal();

        // Recargar las playlists del sidebar para mostrar el número actualizado
        await loadPlaylists();
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        alert('❌ ' + error.message);
    }
}

// Función para eliminar canción de una playlist
window.removeSongFromPlaylist = async function (playlistId, songId, songTitle) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${songTitle}" de esta playlist?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar la canción');
        }

        alert(`✅ Canción eliminada de la playlist`);

        // Recargar la playlist actual para reflejar los cambios
        await loadPlaylistSongs(playlistId);

        // También recargar las playlists del sidebar
        await loadPlaylists();
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        alert('❌ ' + error.message);
    }
}

// Función para agregar/quitar de "Me Gusta"
window.toggleLikeSong = async function () {
    if (!window.currentSongId) {
        alert('No hay canción seleccionada');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const userId = getCurrentUserId();

        // Obtener la playlist "Me Gusta"
        const url = userId ? `${API_BASE_URL}/playlists?user_id=${userId}` : `${API_BASE_URL}/playlists`;
        const playlistsResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlists = await playlistsResponse.json();
        let likePlaylist = playlists.find(p => p.name === 'Me Gusta');

        // Si no existe la playlist "Me Gusta", crearla automáticamente
        if (!likePlaylist) {
            const createResponse = await fetch(`${API_BASE_URL}/playlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    name: 'Me Gusta',
                    description: 'Canciones que me gustan',
                    is_public: false
                })
            });

            if (!createResponse.ok) {
                throw new Error('Error al crear la playlist Me Gusta');
            }

            likePlaylist = await createResponse.json();

            // Recargar playlists en el sidebar
            await loadPlaylists();
        }

        // Verificar si la canción ya está en "Me Gusta"
        const playlistDetailResponse = await fetch(`${API_BASE_URL}/playlists/${likePlaylist.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlistDetail = await playlistDetailResponse.json();
        const isLiked = playlistDetail.songs.some(s => s.id === window.currentSongId);

        if (isLiked) {
            // Quitar de "Me Gusta"
            const deleteResponse = await fetch(`${API_BASE_URL}/playlists/${likePlaylist.id}/songs/${window.currentSongId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!deleteResponse.ok) {
                throw new Error('Error al quitar de Me Gusta');
            }

            alert('💔 Canción quitada de Me Gusta');
        } else {
            // Agregar a "Me Gusta"
            const addResponse = await fetch(`${API_BASE_URL}/playlists/${likePlaylist.id}/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    song_id: window.currentSongId
                })
            });

            if (!addResponse.ok) {
                const error = await addResponse.json();
                throw new Error(error.error || 'Error al agregar a Me Gusta');
            }

            alert('❤️ Canción agregada a Me Gusta');
        }

        // Actualizar el estado del botón
        updateLikeButtonState();
    } catch (error) {
        console.error('Error toggling like:', error);
        alert('❌ ' + error.message);
    }
}

// Función para actualizar el estado visual del botón de "Me Gusta"
async function updateLikeButtonState() {
    if (!window.currentSongId) return;

    try {
        const token = localStorage.getItem('authToken');
        const userId = getCurrentUserId();

        const url = userId ? `${API_BASE_URL}/playlists?user_id=${userId}` : `${API_BASE_URL}/playlists`;
        const playlistsResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlists = await playlistsResponse.json();
        const likePlaylist = playlists.find(p => p.name === 'Me Gusta');

        if (!likePlaylist) return;

        const playlistDetailResponse = await fetch(`${API_BASE_URL}/playlists/${likePlaylist.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const playlistDetail = await playlistDetailResponse.json();
        const isLiked = playlistDetail.songs.some(s => s.id === window.currentSongId);

        const likeBtn = document.getElementById('like-song-btn');
        if (likeBtn) {
            if (isLiked) {
                likeBtn.classList.add('active');
                likeBtn.style.color = '#1db954';
            } else {
                likeBtn.classList.remove('active');
                likeBtn.style.color = '';
            }
        }
    } catch (error) {
        console.error('Error updating like button state:', error);
    }
}


// Función para actualizar el sidebar con info de la canción
function updateSongSidebar(song) {
    // Actualizar portada de la canción
    const songCoverSidebar = document.getElementById('song-cover-sidebar');
    if (songCoverSidebar) {
        songCoverSidebar.src = song.cover_image || '/images/placeholder-cover.jpg';
    }

    // Actualizar título en el header del sidebar
    const songTitleSidebar = document.getElementById('song-title-sidebar');
    if (songTitleSidebar) {
        songTitleSidebar.textContent = song.title || 'Canción';
    }

    // Actualizar título detallado
    const songTitleDetail = document.getElementById('song-title-detail');
    if (songTitleDetail) {
        songTitleDetail.textContent = song.title || 'Sin título';
    }

    // Actualizar artista (clickeable)
    const songArtistDetail = document.getElementById('song-artist-detail');
    if (songArtistDetail) {
        songArtistDetail.textContent = song.artist_name || 'Artista Desconocido';
    }

    // Cargar redes sociales del artista
    if (song.artist_id) {
        loadArtistSocialLinks(song.artist_id);
    } else {
        // Limpiar redes sociales si no hay artista
        const socialLinksContainer = document.getElementById('song-social-links');
        if (socialLinksContainer) {
            socialLinksContainer.innerHTML = '';
        }
    }
}

async function loadArtistSocialLinks(artistId) {
    try {
        console.log('🔍 Cargando redes sociales para artista ID:', artistId);

        const token = localStorage.getItem('authToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/admin/artists/${artistId}`, { headers });
        const artist = await response.json();

        console.log('📦 Datos del artista recibidos:', artist);

        // Parsear social_links si es un string JSON
        let socialLinks = {};
        if (artist.social_links) {
            try {
                socialLinks = typeof artist.social_links === 'string'
                    ? JSON.parse(artist.social_links)
                    : artist.social_links;
            } catch (e) {
                console.error('Error parseando social_links:', e);
            }
        }

        console.log('📘 Facebook:', socialLinks.facebook);
        console.log('📷 Instagram:', socialLinks.instagram);
        console.log('📱 WhatsApp:', socialLinks.whatsapp);

        const socialLinksContainer = document.getElementById('song-social-links');
        if (!socialLinksContainer) {
            console.warn('⚠️ Contenedor song-social-links no encontrado');
            return;
        }

        let socialHTML = '';

        // Facebook
        if (socialLinks.facebook) {
            socialHTML += `
                <a href="${socialLinks.facebook}" target="_blank" rel="noopener noreferrer" 
                   style="
                       display: flex;
                       align-items: center;
                       gap: 10px;
                       padding: 10px 16px;
                       background: rgba(24, 119, 242, 0.1);
                       border: 1px solid rgba(24, 119, 242, 0.3);
                       border-radius: 8px;
                       color: #1877f2;
                       text-decoration: none;
                       font-size: 13px;
                       font-weight: 600;
                       transition: all 0.2s ease;
                   "
                   onmouseover="this.style.background='rgba(24, 119, 242, 0.2)'; this.style.borderColor='rgba(24, 119, 242, 0.5)';"
                   onmouseout="this.style.background='rgba(24, 119, 242, 0.1)'; this.style.borderColor='rgba(24, 119, 242, 0.3)';">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                </a>
            `;
        }

        // Instagram
        if (socialLinks.instagram) {
            socialHTML += `
                <a href="${socialLinks.instagram}" target="_blank" rel="noopener noreferrer"
                   style="
                       display: flex;
                       align-items: center;
                       gap: 10px;
                       padding: 10px 16px;
                       background: rgba(225, 48, 108, 0.1);
                       border: 1px solid rgba(225, 48, 108, 0.3);
                       border-radius: 8px;
                       color: #e1306c;
                       text-decoration: none;
                       font-size: 13px;
                       font-weight: 600;
                       transition: all 0.2s ease;
                   "
                   onmouseover="this.style.background='rgba(225, 48, 108, 0.2)'; this.style.borderColor='rgba(225, 48, 108, 0.5)';"
                   onmouseout="this.style.background='rgba(225, 48, 108, 0.1)'; this.style.borderColor='rgba(225, 48, 108, 0.3)';">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                </a>
            `;
        }

        // WhatsApp
        if (socialLinks.whatsapp) {
            socialHTML += `
                <a href="${socialLinks.whatsapp}" target="_blank" rel="noopener noreferrer"
                   style="
                       display: flex;
                       align-items: center;
                       gap: 10px;
                       padding: 10px 16px;
                       background: rgba(37, 211, 102, 0.1);
                       border: 1px solid rgba(37, 211, 102, 0.3);
                       border-radius: 8px;
                       color: #25d366;
                       text-decoration: none;
                       font-size: 13px;
                       font-weight: 600;
                       transition: all 0.2s ease;
                   "
                   onmouseover="this.style.background='rgba(37, 211, 102, 0.2)'; this.style.borderColor='rgba(37, 211, 102, 0.5)';"
                   onmouseout="this.style.background='rgba(37, 211, 102, 0.1)'; this.style.borderColor='rgba(37, 211, 102, 0.3)';">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>Whatsapp</span>
                </a>
            `;
        }

        console.log('✅ HTML de redes sociales generado:', socialHTML ? 'Sí' : 'No (vacío)');
        socialLinksContainer.innerHTML = socialHTML || '<p style="font-size: 12px; color: var(--text-subdued);">Sin redes sociales</p>';
    } catch (error) {
        console.error('Error cargando redes sociales del artista:', error);
    }
}

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

function playNext() {
    if (currentPlaylist.length === 0) return;

    if (isShuffle) {
        currentSongIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
    }

    playSong(currentSongIndex);
}

function playPrevious() {
    if (currentPlaylist.length === 0) return;

    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        currentSongIndex = currentSongIndex === 0 ? currentPlaylist.length - 1 : currentSongIndex - 1;
        playSong(currentSongIndex);
    }
}

function handleSongEnd() {
    if (repeatMode === 'one') {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else if (repeatMode === 'all' || currentSongIndex < currentPlaylist.length - 1) {
        playNext();
    }
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = `${progress}%`;
    progressHandle.style.left = `${progress}%`;
    timeCurrent.textContent = formatTime(audioPlayer.currentTime);
}

function updatePlayButton() {
    playPauseBtn.innerHTML = isPlaying ? `
        <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" fill="currentColor"/>
        </svg>
    ` : `
        <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z" fill="currentColor"/>
        </svg>
    `;
}

function setVolume(volume) {
    currentVolume = Math.max(0, Math.min(1, volume));
    audioPlayer.volume = currentVolume;
    updateVolumeUI();
}

function updateVolumeUI() {
    const volumePercent = currentVolume * 100;
    volumeFill.style.width = `${volumePercent}%`;
    volumeHandle.style.left = `${volumePercent}%`;
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    document.querySelector('.shuffle-btn').classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentIndex + 1) % modes.length];

    const repeatBtn = document.querySelector('.repeat-btn');
    repeatBtn.classList.toggle('active', repeatMode !== 'off');

    // Remover badge anterior si existe
    const existingBadge = repeatBtn.querySelector('.repeat-badge');
    if (existingBadge) {
        existingBadge.remove();
    }

    if (repeatMode === 'one') {
        // Icono normal de repeat
        repeatBtn.innerHTML = `
            <svg viewBox="0 0 16 16" width="16" height="16">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5a2.25 2.25 0 0 0-2.25 2.25v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" fill="currentColor"/>
            </svg>
        `;
        // Agregar badge "1" fuera del icono
        const badge = document.createElement('span');
        badge.className = 'repeat-badge';
        badge.textContent = '1';
        badge.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            background-color: #1db954;
            color: #000;
            font-size: 10px;
            font-weight: 700;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        `;
        repeatBtn.appendChild(badge);
    } else {
        repeatBtn.innerHTML = `
            <svg viewBox="0 0 16 16" width="16" height="16">
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5a2.25 2.25 0 0 0-2.25 2.25v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" fill="currentColor"/>
            </svg>
        `;
    }
}

// ===== GENERAR AVATAR DE USUARIO =====
function generateUserAvatar() {
    const token = localStorage.getItem('authToken');
    let username = 'Usuario';

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            username = payload.username || 'Usuario';
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }


    const userInitial = document.getElementById('user-initial');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenuPopup = document.getElementById('user-menu-popup');

    // Obtener imagen de perfil desde currentUser
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const profileImage = currentUser.profile_image;

    if (userMenuBtn) {
        // Si hay imagen de perfil guardada, mostrarla
        if (profileImage) {
            userMenuBtn.style.background = 'none';
            userMenuBtn.style.padding = '0';
            userMenuBtn.innerHTML = `<img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else if (userInitial) {
            // Si no hay imagen, mostrar la inicial
            userInitial.textContent = username.charAt(0).toUpperCase();
        }
    }

    if (userMenuBtn && userMenuPopup) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuPopup.style.display = userMenuPopup.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!userMenuPopup.contains(e.target) && e.target !== userMenuBtn) {
                userMenuPopup.style.display = 'none';
            }
        });
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);
    document.querySelector('.next-btn').addEventListener('click', playNext);
    document.querySelector('.prev-btn').addEventListener('click', playPrevious);
    document.querySelector('.shuffle-btn').addEventListener('click', toggleShuffle);
    document.querySelector('.repeat-btn').addEventListener('click', toggleRepeat);

    const progressBar = document.querySelector('.progress-bar');
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    const volumeBar = document.querySelector('.volume-bar');
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setVolume(percent);
    });

    document.querySelector('.volume-btn').addEventListener('click', () => {
        if (currentVolume > 0) {
            setVolume(0);
        } else {
            setVolume(0.8);
        }
    });

    // Event listener para el botón de "Me Gusta"
    const likeSongBtn = document.getElementById('like-song-btn');
    if (likeSongBtn) {
        likeSongBtn.addEventListener('click', toggleLikeSong);
    }

    // Event listener para el botón de "Agregar a playlist"
    const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
    if (addToPlaylistBtn) {
        addToPlaylistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAddToPlaylistModal();
        });
    }

    // Cerrar modal al hacer clic fuera de él
    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    if (addToPlaylistModal) {
        addToPlaylistModal.addEventListener('click', (e) => {
            if (e.target === addToPlaylistModal) {
                closeAddToPlaylistModal();
            }
        });
    }

    const mainSearch = document.getElementById('main-search');
    if (mainSearch) {
        mainSearch.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                await searchSongs(query);
            }
        }, 300));
    }

    // ===== NAVEGACIÃ“N (ATRÃS/ADELANTE) =====
    function saveToHistory() {
        if (isNavigating) return;

        const contentWrapper = document.querySelector('.content-wrapper');
        const state = {
            html: contentWrapper.innerHTML,
            timestamp: Date.now()
        };

        if (navigationIndex < navigationHistory.length - 1) {
            navigationHistory = navigationHistory.slice(0, navigationIndex + 1);
        }

        navigationHistory.push(state);
        navigationIndex = navigationHistory.length - 1;

        updateNavigationButtons();
    }

    function navigateBack() {
        if (navigationIndex > 0) {
            isNavigating = true;
            navigationIndex--;
            const state = navigationHistory[navigationIndex];
            document.querySelector('.content-wrapper').innerHTML = state.html;
            updateNavigationButtons();

            reattachContentEventListeners();

            setTimeout(() => { isNavigating = false; }, 100);
        }
    }

    function navigateForward() {
        if (navigationIndex < navigationHistory.length - 1) {
            isNavigating = true;
            navigationIndex++;
            const state = navigationHistory[navigationIndex];
            document.querySelector('.content-wrapper').innerHTML = state.html;
            updateNavigationButtons();

            reattachContentEventListeners();

            setTimeout(() => { isNavigating = false; }, 100);
        }
    }

    function updateNavigationButtons() {
        const backBtn = document.querySelector('.nav-buttons .nav-btn:first-child');
        const forwardBtn = document.querySelector('.nav-buttons .nav-btn:last-child');

        if (backBtn) {
            backBtn.disabled = navigationIndex <= 0;
            backBtn.style.opacity = navigationIndex <= 0 ? '0.5' : '1';
            backBtn.style.cursor = navigationIndex <= 0 ? 'not-allowed' : 'pointer';
        }

        if (forwardBtn) {
            forwardBtn.disabled = navigationIndex >= navigationHistory.length - 1;
            forwardBtn.style.opacity = navigationIndex >= navigationHistory.length - 1 ? '0.5' : '1';
            forwardBtn.style.cursor = navigationIndex >= navigationHistory.length - 1 ? 'not-allowed' : 'pointer';
        }
    }

    function reattachContentEventListeners() {
        document.querySelectorAll('.featured-card').forEach(card => {
            const playBtn = card.querySelector('.play-button');
            if (playBtn) {
                playBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const playlistId = card.dataset.playlistId;
                    await loadPlaylistSongs(playlistId);
                    playSong(0);
                });
            }

            card.addEventListener('click', async () => {
                const playlistId = card.dataset.playlistId;
                await loadPlaylistSongs(playlistId);
            });
        });

        document.querySelectorAll('.release-card').forEach(card => {
            const playBtn = card.querySelector('.play-button');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const songIndex = parseInt(card.dataset.songIndex);
                    if (!isNaN(songIndex)) {
                        playSong(songIndex);
                    }
                });
            }
        });
    }

    function initNavButtons() {
        const backBtn = document.querySelector('.nav-buttons .nav-btn:first-child');
        const forwardBtn = document.querySelector('.nav-buttons .nav-btn:last-child');

        if (backBtn) {
            backBtn.addEventListener('click', navigateBack);
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', navigateForward);
        }

        updateNavigationButtons();
    }

    // ===== BÃšSQUEDA =====
    async function searchSongs(query) {
        try {
            const songsResponse = await fetch(`${API_BASE_URL}/songs/search/${encodeURIComponent(query)}`);
            const songs = await songsResponse.json();

            const artistsResponse = await fetch(`${API_BASE_URL}/artists`);
            const allArtists = await artistsResponse.json();
            const artists = allArtists.filter(a =>
                a.name.toLowerCase().includes(query.toLowerCase())
            );

            console.log('Resultados:', { canciones: songs.length, artistas: artists.length });

            if (artists.length === 1 && songs.length === 0) {
                showArtistPage(artists[0].id);
            } else {
                displaySearchResults(songs, artists);
            }
        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    function displaySearchResults(songs, artists) {
        const contentWrapper = document.querySelector('.content-wrapper');

        let html = '<div class="search-results">';

        if (artists.length > 0) {
            html += '<div class="section-header"><h2>Artistas</h2></div>';
            html += '<div class="releases-grid">';
            artists.forEach(artist => {
                html += `
                <div class="release-card" onclick="showArtistPage(${artist.id})" style="cursor: pointer;">
                    <div class="release-card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                        ${artist.image_url ? `<img src="${artist.image_url}" alt="${artist.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : ''}
                    </div>
                    <div class="featured-card-title">${artist.name}</div>
                    <div class="featured-card-subtitle">Artista</div>
                </div>
            `;
            });
            html += '</div>';
        }

        if (songs.length > 0) {
            html += '<div class="section-header"><h2>Canciones</h2></div>';
            html += '<div class="releases-grid">';
            songs.forEach((song) => {
                html += `
                <div class="release-card" onclick="playSongById(${song.id})" style="cursor: pointer;">
                    <div class="release-card-image">
                        ${song.cover_image ? `<img src="${song.cover_image}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : ''}
                    </div>
                    <div class="featured-card-title">${song.title}</div>
                    <div class="featured-card-subtitle">${song.artist_name}</div>
                </div>
            `;
            });
            html += '</div>';
        }

        if (artists.length === 0 && songs.length === 0) {
            html += '<p style="color: var(--text-subdued); padding: 40px; text-align: center;">No se encontraron resultados para "' + document.getElementById('main-search').value + '"</p>';
        }

        html += '</div>';
        contentWrapper.innerHTML = html;

        // Solo guardar estado si no estamos navegando
        if (!isNavigating) {
            saveToHistory();
        }
    }

    // ===== PÃGINA DEL ARTISTA =====
    window.showArtistPage = async function (artistId) {
        try {
            const artistResponse = await fetch(`${API_BASE_URL}/artists/${artistId}`);
            const artist = await artistResponse.json();

            const songsResponse = await fetch(`${API_BASE_URL}/songs`);
            const allSongs = await songsResponse.json();
            const artistSongs = allSongs.filter(s => s.artist_id === artistId);

            const contentWrapper = document.querySelector('.content-wrapper');
            let html = `
            <div class="artist-page">
                <div class="artist-hero" style="
                    background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%), 
                                url('${artist.cover_image || ''}');
                    background-size: cover;
                    background-position: center;
                    padding: 80px 24px 40px;
                    margin: -24px -24px 24px -24px;
                    border-radius: 8px 8px 0 0;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                ">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        ${artist.is_verified ? '<img src="/images/verificado.png" alt="Verificado" style="width: 24px; height: 24px;">' : ''}
                        <span style="font-size: 14px; font-weight: 600;">${artist.is_verified ? 'Artista verificado' : 'Artista'}</span>
                    </div>
                    <h1 style="font-size: 72px; font-weight: 900; margin-bottom: 16px;">${artist.name}</h1>
                    <p style="font-size: 16px; color: var(--text-base); margin-bottom: 16px;">${artistSongs.length} oyente mensual</p>
                </div>
                
                <div style="padding: 24px; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%);">
                    <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px;">
                        <button onclick="playArtistSongs(${artistId})" style="
                            width: 56px;
                            height: 56px;
                            border-radius: 50%;
                            background: var(--accent-base);
                            border: none;
                            color: var(--bg-base);
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            transition: all 0.2s;
                        " onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'">
                            ▶
                        </button>
                    </div>
                    
                    <div class="section-header" style="margin-bottom: 16px;">
                        <h2>Popular</h2>
                    </div>
                    
                    <div class="song-list" style="margin-bottom: 40px;">
        `;

            artistSongs.forEach((song, index) => {
                html += `
                <div class="song-row" onclick="playSongById(${song.id})" style="
                    display: grid;
                    grid-template-columns: 40px 1fr auto 40px;
                    gap: 16px;
                    padding: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    align-items: center;
                    transition: background-color 0.2s;
                " onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <span style="color: var(--text-subdued); font-size: 16px;">${index + 1}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${song.cover_image ? `<img src="${song.cover_image}" alt="${song.title}" style="width: 40px; height: 40px; border-radius: 4px;">` : ''}
                        <div>
                            <div style="font-size: 16px; color: var(--text-base); margin-bottom: 4px;">${song.title}</div>
                            <div style="font-size: 14px; color: var(--text-subdued);">${artist.name}</div>
                        </div>
                    </div>
                    <div style="color: var(--text-subdued); font-size: 14px;">${formatTime(song.duration)}</div>
                    <button class="song-more-btn" onclick="toggleSongPlaylist(${song.id}, event)" title="Agregar a playlist">
                        <svg viewBox="0 0 16 16" width="16" height="16">
                            <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            `;
            });

            html += `
                    </div>
        `;

            if (artist.bio || artist.cover_image_2) {
                html += `
                <div class="artist-bio-section" style="
                    background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%), 
                                url('${artist.cover_image_2 || artist.cover_image || ''}');
                    background-size: cover;
                    background-position: center;
                    padding: 60px 40px;
                    border-radius: 12px;
                    margin-top: 40px;
                    min-height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                ">
                    <h3 style="font-size: 28px; font-weight: 700; margin-bottom: 20px; color: var(--text-base);">Sobre ${artist.name}</h3>
                    ${artist.bio ? `
                        <p style="font-size: 16px; line-height: 1.8; color: var(--text-base); max-width: 900px;">
                            ${artist.bio}
                        </p>
                    ` : '<p style="font-size: 16px; color: var(--text-subdued);">No hay biografía disponible.</p>'}
                </div>
            `;
            }

            if (artist.social_links) {
                try {
                    const socials = typeof artist.social_links === 'string'
                        ? JSON.parse(artist.social_links)
                        : artist.social_links;

                    if (socials && Object.keys(socials).length > 0) {
                        html += `
                        <div style="margin-top: 32px;">
                            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--text-base);">Redes Sociales</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                    `;

                        Object.entries(socials).forEach(([platform, url]) => {
                            // Mapeo de plataformas a imágenes PNG
                            const socialIcons = {
                                'facebook': '/images/facebook.png',
                                'instagram': '/images/instagram.png',
                                'whatsapp': '/images/whatsapp.png'
                            };

                            const iconUrl = socialIcons[platform.toLowerCase()] || '/images/facebook.png';

                            html += `
                            <a href="${url}" target="_blank" 
                                style="display: flex; align-items: center; gap: 8px; padding: 12px 20px; 
                                       background: var(--bg-highlight); border-radius: 24px; 
                                       color: var(--text-base); text-decoration: none; 
                                       transition: all 0.2s; border: 1px solid var(--border-subtle);"
                                onmouseover="this.style.background='var(--bg-tint)'; this.style.transform='translateY(-2px)';" 
                                onmouseout="this.style.background='var(--bg-highlight)'; this.style.transform='translateY(0)';">
                                <img src="${iconUrl}" alt="${platform}" style="width: 20px; height: 20px;">
                                <span style="font-size: 14px; font-weight: 600; text-transform: capitalize;">${platform}</span>
                            </a>
                        `;
                        });

                        html += `
                            </div>
                        </div>
                    `;
                    }
                } catch (e) {
                    console.error('Error parsing social links:', e);
                }
            }

            html += `
                    </div>
                </div>
            </div>
        `;

            contentWrapper.innerHTML = html;

            saveToHistory();

        } catch (error) {
            console.error('Error loading artist page:', error);
        }
    }

    window.playArtistSongs = async function (artistId) {
        try {
            const response = await fetch(`${API_BASE_URL}/songs`);
            const allSongs = await response.json();
            const artistSongs = allSongs.filter(s => s.artist_id === artistId);
            if (artistSongs.length > 0) {
                currentPlaylist = artistSongs;
                currentSongIndex = 0;
                playSong(0);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    window.playSongById = async function (songId) {
        try {
            const response = await fetch(`${API_BASE_URL}/songs/${songId}`);
            const song = await response.json();
            currentPlaylist = [song];
            currentSongIndex = 0;
            playSong(0);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // ===== PÁGINA DEL ARTISTA =====
    window.playArtistSongs = async function (artistId) {
        try {
            const response = await fetch(`${API_BASE_URL}/songs`);
            const allSongs = await response.json();
            const artistSongs = allSongs.filter(s => s.artist_id === artistId);

            if (artistSongs.length > 0) {
                currentPlaylist = artistSongs;
                currentSongIndex = 0;
                playSong(0);
            }
        } catch (error) {
            console.error('Error playing artist songs:', error);
        }
    }

    // Función para obtener iconos de redes sociales
    function getSocialIcon(platform) {
        const icons = {
            instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            twitter: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
            youtube: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
            spotify: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
            tiktok: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
            soundcloud: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.051 0-.09.04-.099.099l-.135 1.326.135 1.303c.009.058.048.099.099.099.05 0 .09-.04.099-.099l.165-1.303-.165-1.326c0-.057-.04-.099-.09-.099m1.83-1.229c-.06 0-.113.051-.113.113l-.195 2.391.195 2.236c0 .061.052.112.113.112s.112-.051.112-.112l.226-2.236-.226-2.391c0-.062-.051-.113-.112-.113m.955-.086c-.068 0-.127.058-.127.126l-.164 2.477.164 2.278c0 .069.059.127.127.127.068 0 .126-.058.126-.127l.189-2.278-.189-2.477c0-.068-.058-.126-.126-.126m.964.139c-.075 0-.138.063-.138.139l-.134 2.338.134 2.191c0 .076.063.139.138.139.076 0 .139-.063.139-.139l.152-2.191-.152-2.338c0-.076-.063-.139-.139-.139m.972-.086c-.084 0-.151.068-.151.152l-.105 2.424.105 2.131c0 .084.067.152.151.152.084 0 .152-.068.152-.152l.121-2.131-.121-2.424c0-.084-.068-.152-.152-.152m.964.086c-.092 0-.166.074-.166.166l-.08 2.338.08 2.098c0 .092.074.166.166.166.091 0 .165-.074.165-.166l.091-2.098-.091-2.338c0-.092-.074-.166-.165-.166m.964-.086c-.1 0-.181.081-.181.181l-.053 2.424.053 2.053c0 .1.081.181.181.181.1 0 .181-.081.181-.181l.061-2.053-.061-2.424c0-.1-.081-.181-.181-.181m.964.086c-.107 0-.195.088-.195.195l-.027 2.338.027 2.008c0 .107.088.195.195.195.107 0 .195-.088.195-.195l.031-2.008-.031-2.338c0-.107-.088-.195-.195-.195m.964-.086c-.115 0-.209.094-.209.209v4.555c0 .115.094.209.209.209.115 0 .209-.094.209-.209V12.209c0-.115-.094-.209-.209-.209m13.084-2.555c-.317 0-.617.062-.899.177-.13-2.513-2.166-4.511-4.652-4.511-1.522 0-2.866.734-3.727 1.866-.12.159-.134.373-.033.546.101.174.289.28.495.28h8.816c1.244 0 2.25 1.006 2.25 2.25s-1.006 2.25-2.25 2.25z"/></svg>',
            website: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
        };

        return icons[platform.toLowerCase()] || icons.website;
    }

    // ===== UTILIDADES =====
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function getRandomGradient() {
        const gradients = [
            '#667eea 0%, #764ba2 100%',
            '#f093fb 0%, #f5576c 100%',
            '#4facfe 0%, #00f2fe 100%',
            '#43e97b 0%, #38f9d7 100%',
            '#fa709a 0%, #fee140 100%',
            '#30cfd0 0%, #330867 100%',
            '#a8edea 0%, #fed6e3 100%',
            '#ff9a9e 0%, #fecfef 100%',
            '#ffecd2 0%, #fcb69f 100%',
            '#ff6e7f 0%, #bfe9ff 100%'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }


    // ===== PERFIL Y LOGOUT =====
    window.showProfile = async function () {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Obtener datos del usuario desde localStorage
            let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = currentUser.id || payload.userId || payload.id;

            // Cargar datos completos del usuario desde la API
            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    // Actualizar currentUser con los datos de la API
                    currentUser = {
                        ...currentUser,
                        ...userData
                    };
                    // Actualizar localStorage
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            } catch (error) {
                console.error('Error cargando datos del usuario:', error);
            }

            const username = currentUser.username || payload.username || 'Usuario';
            const email = currentUser.email || payload.email || '';

            const contentWrapper = document.querySelector('.content-wrapper');

            contentWrapper.innerHTML = `
            <div class="profile-page" style="padding: 40px;" data-user-id="${userId}">
                <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 32px;">Perfil</h1>
                
                <div style="background: var(--bg-highlight); border-radius: 8px; padding: 24px; max-width: 600px;">
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Nombre de usuario</label>
                        <input type="text" id="profile-username" value="${username}" disabled style="width: 100%; padding: 12px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px; cursor: not-allowed;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Nombre</label>
                        <input type="text" id="profile-first-name" value="${currentUser.first_name || ''}" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Apellido</label>
                        <input type="text" id="profile-last-name" value="${currentUser.last_name || ''}" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Email</label>
                        <input type="email" id="profile-email" value="${email}" disabled style="width: 100%; padding: 12px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px; cursor: not-allowed;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Teléfono</label>
                        <input type="tel" id="profile-phone" value="${currentUser.phone || ''}" placeholder="+1234567890" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Imagen de perfil</label>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div id="profile-image-preview" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                <span style="font-size: 32px; font-weight: 700; color: #ffffff;">${username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div style="flex: 1;">
                                <input type="file" id="profile-image-input" accept="image/*" style="display: none;">
                                <button onclick="document.getElementById('profile-image-input').click(); return false;" style="padding: 8px 16px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px; cursor: pointer; margin-bottom: 8px;">
                                    Seleccionar imagen
                                </button>
                                <p style="font-size: 12px; color: var(--text-subdued); margin: 0;">JPG, PNG o GIF (máx. 2MB)</p>
                            </div>
                        </div>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 32px 0;">
                    
                    <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Cambiar contraseña</h2>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Contraseña actual</label>
                        <input type="password" id="profile-current-password" placeholder="Ingresa tu contraseña actual" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Nueva contraseña</label>
                        <input type="password" id="profile-new-password" placeholder="Ingresa tu nueva contraseña" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Confirmar nueva contraseña</label>
                        <input type="password" id="profile-confirm-password" placeholder="Confirma tu nueva contraseña" style="width: 100%; padding: 12px; background: var(--bg-base); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-base); font-size: 14px;">
                    </div>
                    
                    <div style="display: flex; gap: 16px;">
                        <button onclick="updateProfile()" style="padding: 12px 32px; background: var(--accent-base); border: none; border-radius: 24px; color: var(--bg-base); font-size: 14px; font-weight: 700; cursor: pointer;">
                            Guardar cambios
                        </button>
                        <button onclick="goHome()" style="padding: 12px 32px; background: transparent; border: 1px solid var(--text-subdued); border-radius: 24px; color: var(--text-base); font-size: 14px; font-weight: 700; cursor: pointer;">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('user-menu-popup').style.display = 'none';

            // Agregar event listener para el input de imagen
            const profileImageInput = document.getElementById('profile-image-input');
            const profileImagePreview = document.getElementById('profile-image-preview');

            if (profileImageInput && profileImagePreview) {
                profileImageInput.addEventListener('change', function (e) {
                    const file = e.target.files[0];
                    if (file) {
                        // Validar tamaño (2MB máximo)
                        if (file.size > 2 * 1024 * 1024) {
                            alert('La imagen no debe superar los 2MB');
                            return;
                        }

                        // Validar tipo
                        if (!file.type.startsWith('image/')) {
                            alert('Por favor selecciona una imagen válida');
                            return;
                        }

                        // Crear preview
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            profileImagePreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                            // Guardar el archivo temporalmente para subirlo después
                            window.tempProfileImageFile = file;
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // Cargar imagen guardada desde el servidor si existe
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (currentUser.profile_image) {
                    profileImagePreview.innerHTML = `<img src="${currentUser.profile_image}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            }

            saveToHistory();

        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Error al cargar el perfil');
        }
    }

    window.logout = function () {
        // Cerrar el popup del menú de usuario
        const userMenuPopup = document.getElementById('user-menu-popup');
        if (userMenuPopup) {
            userMenuPopup.style.display = 'none';
        }

        // Limpiar datos de sesión
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');

        // Redirigir a la página de login
        window.location.href = '/login.html';
    }

    window.updateProfile = async function () {
        const firstName = document.getElementById('profile-first-name').value;
        const lastName = document.getElementById('profile-last-name').value;
        const phone = document.getElementById('profile-phone').value;
        const currentPassword = document.getElementById('profile-current-password').value;
        const newPassword = document.getElementById('profile-new-password').value;
        const confirmPassword = document.getElementById('profile-confirm-password').value;

        // Si hay una imagen temporal, subirla al servidor
        if (window.tempProfileImageFile) {
            try {
                const formData = new FormData();
                formData.append('image', window.tempProfileImageFile);

                const token = localStorage.getItem('authToken');
                const response = await fetch(`${API_BASE_URL}/auth/upload-profile-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al subir la imagen');
                }

                // Actualizar currentUser en localStorage
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                currentUser.profile_image = data.imageUrl;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                // Limpiar archivo temporal
                delete window.tempProfileImageFile;

                alert('✅ Imagen de perfil actualizada correctamente');
                // Actualizar el avatar en el header
                generateUserAvatar();
                return;
            } catch (error) {
                alert('❌ Error al subir la imagen: ' + error.message);
                return;
            }
        }

        // Guardar datos personales si han cambiado
        const hasPersonalDataChanges = firstName || lastName || phone;
        if (hasPersonalDataChanges) {
            try {
                const token = localStorage.getItem('authToken');
                const userId = JSON.parse(localStorage.getItem('currentUser')).id;

                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        phone: phone
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Error al actualizar datos personales');
                }

                // Actualizar currentUser en localStorage
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                currentUser.first_name = firstName;
                currentUser.last_name = lastName;
                currentUser.phone = phone;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                alert('✅ Datos personales actualizados correctamente');

                // Si no hay cambios de contraseña, terminar aquí
                if (!currentPassword && !newPassword && !confirmPassword) {
                    return;
                }
            } catch (error) {
                alert('❌ Error al actualizar datos: ' + error.message);
                return;
            }
        }

        // Validar que se hayan llenado los campos de contraseña
        if (!currentPassword && !newPassword && !confirmPassword) {
            alert('No hay cambios para guardar.');
            return;
        }

        // Validar que todos los campos de contraseña estén llenos
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Por favor, completa todos los campos de contraseña.');
            return;
        }

        // Validar que las contraseñas nuevas coincidan
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas nuevas no coinciden.');
            return;
        }

        // Validar longitud mínima de la contraseña
        if (newPassword.length < 6) {
            alert('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const userId = document.querySelector('.profile-page').getAttribute('data-user-id');

            const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al cambiar la contraseña');
            }

            alert('✅ Contraseña actualizada correctamente');

            // Limpiar los campos de contraseña
            document.getElementById('profile-current-password').value = '';
            document.getElementById('profile-new-password').value = '';
            document.getElementById('profile-confirm-password').value = '';

        } catch (error) {
            console.error('Error updating password:', error);
            alert('❌ Error: ' + error.message);
        }
    }

    function goHome() {
        const contentWrapper = document.querySelector('.content-wrapper');

        contentWrapper.innerHTML = `
        <div class="filter-tabs">
            <button class="filter-tab active">Todo</button>
            <button class="filter-tab">MÃºsica</button>
            <button class="filter-tab">Podcasts</button>
        </div>

`;

        loadPlaylists();
        loadFeaturedPlaylists();
        loadReleases();
        loadDJs();
        saveToHistory();
    }

    // Función auxiliar para formatear tiempo
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Función auxiliar para generar gradientes aleatorios
    function getRandomGradient() {
        const gradients = [
            '#667eea 0%, #764ba2 100%',
            '#f093fb 0%, #f5576c 100%',
            '#4facfe 0%, #00f2fe 100%',
            '#43e97b 0%, #38f9d7 100%',
            '#fa709a 0%, #fee140 100%',
            '#30cfd0 0%, #330867 100%',
            '#a8edea 0%, #fed6e3 100%',
            '#ff9a9e 0%, #fecfef 100%',
            '#ffecd2 0%, #fcb69f 100%',
            '#ff6e7f 0%, #bfe9ff 100%'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }

    // Función debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    console.log('🎵 Zonorax Player inicializado');
}