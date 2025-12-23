// ============================================
// ZONORAX - MOBILE PLAYER FUNCTIONALITY
// ============================================

(function () {
    'use strict';

    // Detectar si estamos en móvil
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Crear mini player móvil
    function createMobilePlayer() {
        console.log('🔧 Creating mobile player - VERSION 2.0');
        if (!isMobileDevice()) return;

        const playerBar = document.querySelector('.player-bar');
        if (!playerBar) return;

        // Crear estructura del mini player (horizontal como Spotify)
        const mobilePlayerHTML = `
            <div class="mobile-player-mini" id="mobile-player-mini" style="display: flex; align-items: center; width: 100%; gap: 12px;">
                <img class="song-cover" id="mobile-song-cover" src="/images/default-cover.png" alt="Cover" 
                     style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover; flex-shrink: 0;">
                
                <div class="song-details" style="flex: 1; min-width: 0; overflow: hidden;">
                    <div class="song-title" id="mobile-song-title" 
                         style="font-size: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
                        Selecciona una canción
                    </div>
                    <div class="song-artist" id="mobile-song-artist" 
                         style="font-size: 12px; color: #b3b3b3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        Artista
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button id="mobile-like-btn" 
                            style="background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    
                    <button class="play-btn" id="mobile-play-btn" 
                            style="background: #ffffff; border: none; color: #000000; cursor: pointer; padding: 0; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Limpiar player bar y agregar mini player
        playerBar.innerHTML = mobilePlayerHTML;

        // IMPORTANTE: Eliminar estilos inline del desktop que interfieren
        playerBar.removeAttribute('style');

        // Aplicar estilos móviles directamente
        playerBar.style.position = 'fixed';
        playerBar.style.bottom = '60px';
        playerBar.style.left = '0';
        playerBar.style.right = '0';
        playerBar.style.height = '70px';
        playerBar.style.display = 'flex';
        playerBar.style.flexDirection = 'row';
        playerBar.style.alignItems = 'center';
        playerBar.style.padding = '8px 12px';
        playerBar.style.backgroundColor = '#181818';
        playerBar.style.borderTop = '1px solid #282828';
        playerBar.style.zIndex = '200';
        playerBar.style.gap = '0';
        playerBar.style.marginBottom = '0';

        // Agregar event listeners
        const miniPlayer = document.getElementById('mobile-player-mini');
        const playBtn = document.getElementById('mobile-play-btn');
        const likeBtn = document.getElementById('mobile-like-btn');

        if (miniPlayer) {
            miniPlayer.addEventListener('click', function (e) {
                // No expandir si se hizo click en botones
                if (e.target.closest('#mobile-play-btn') || e.target.closest('#mobile-like-btn')) {
                    return;
                }
                console.log('🎵 Mini player clicked!');
                toggleFullscreenPlayer();
            });
        }

        if (playBtn) {
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('▶️ Play button clicked!');
                if (typeof togglePlayPause === 'function') {
                    togglePlayPause();
                }
            });
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('❤️ Like button clicked!');
                if (typeof toggleLike === 'function') {
                    toggleLike();
                }
            });
        }
    }

    // Crear player fullscreen
    function createFullscreenPlayer() {
        console.log('🎬 createFullscreenPlayer called');
        console.log('📱 isMobileDevice:', isMobileDevice());

        if (!isMobileDevice()) return;

        // Verificar si ya existe
        const existing = document.querySelector('.player-fullscreen');
        if (existing) {
            console.log('✅ Fullscreen player already exists');
            return;
        }

        console.log('🔨 Creating fullscreen player...');

        const fullscreenHTML = `
            <div class="player-fullscreen" id="player-fullscreen">
                <div class="player-fullscreen-header">
                    <button onclick="closeFullscreenPlayer()">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                    <div class="player-fullscreen-title" id="fullscreen-playlist-title">Reproduciendo</div>
                    <button onclick="alert('Opciones próximamente')">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </button>
                </div>

                <img class="player-fullscreen-cover" id="fullscreen-cover" src="/images/default-cover.png" alt="Cover">

                <div class="player-fullscreen-info">
                    <div class="player-fullscreen-song-title" id="fullscreen-song-title">Selecciona una canción</div>
                    <div class="player-fullscreen-artist" id="fullscreen-artist">Artista</div>
                </div>

                <div class="player-fullscreen-progress">
                    <div class="player-fullscreen-progress-bar" onclick="seekFullscreen(event)">
                        <div class="player-fullscreen-progress-fill" id="fullscreen-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="player-fullscreen-time">
                        <span id="fullscreen-current-time">0:00</span>
                        <span id="fullscreen-duration">0:00</span>
                    </div>
                </div>

                <div class="player-fullscreen-controls">
                    <button onclick="toggleShuffle()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                        </svg>
                    </button>
                    <button onclick="playPrevious()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>
                    <button class="play-pause-btn" id="fullscreen-play-btn" onclick="togglePlayPause()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button onclick="playNext()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                    <button onclick="toggleRepeat()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                        </svg>
                    </button>
                </div>

                <div class="player-fullscreen-actions">
                    <button onclick="alert('Conectar dispositivo próximamente')">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/>
                        </svg>
                    </button>
                    <button onclick="alert('Compartir próximamente')">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', fullscreenHTML);
        console.log('✅ Fullscreen player HTML inserted');

        const created = document.getElementById('player-fullscreen');
        console.log('🎬 Created element:', created);
        console.log('📏 Element styles:', created ? window.getComputedStyle(created).display : 'N/A');
    }

    // Toggle fullscreen player
    window.toggleFullscreenPlayer = function () {
        console.log('🎵 toggleFullscreenPlayer called');
        console.log('📱 isMobileDevice:', isMobileDevice());
        console.log('📏 Window width:', window.innerWidth);

        if (!isMobileDevice()) return;

        const fullscreen = document.getElementById('player-fullscreen');
        console.log('🎬 Fullscreen element:', fullscreen);

        if (fullscreen) {
            const isActive = fullscreen.classList.contains('active');

            if (isActive) {
                // Cerrar
                fullscreen.classList.remove('active');
                fullscreen.style.display = 'none';
                console.log('❌ Fullscreen closed');
            } else {
                // Abrir
                fullscreen.classList.add('active');
                // Forzar estilos inline para asegurar que se muestre
                fullscreen.style.display = 'flex';
                fullscreen.style.flexDirection = 'column';
                fullscreen.style.position = 'fixed';
                fullscreen.style.top = '0';
                fullscreen.style.left = '0';
                fullscreen.style.right = '0';
                fullscreen.style.bottom = '0';
                fullscreen.style.zIndex = '9999';
                fullscreen.style.background = 'linear-gradient(180deg, #1e3a5f 0%, #121212 100%)';
                fullscreen.style.padding = '20px';
                fullscreen.style.overflowY = 'auto';

                console.log('✅ Fullscreen opened');
                console.log('📏 Display after open:', window.getComputedStyle(fullscreen).display);

                // Actualizar info
                updateFullscreenPlayerInfo();
            }
        } else {
            console.error('❌ Fullscreen player element not found!');
        }
    };

    // Cerrar fullscreen player
    window.closeFullscreenPlayer = function () {
        const fullscreen = document.getElementById('player-fullscreen');
        if (fullscreen) {
            fullscreen.classList.remove('active');
            fullscreen.style.display = 'none';
            console.log('❌ Fullscreen player closed');
        }
    };

    // Actualizar info del fullscreen player
    function updateFullscreenPlayerInfo() {
        console.log('🔄 Updating fullscreen player info...');

        // Obtener datos del mini player
        const mobileCover = document.getElementById('mobile-song-cover');
        const mobileTitle = document.getElementById('mobile-song-title');
        const mobileArtist = document.getElementById('mobile-song-artist');

        // Actualizar fullscreen player
        const fullscreenCover = document.getElementById('fullscreen-cover');
        const fullscreenTitle = document.getElementById('fullscreen-song-title');
        const fullscreenArtist = document.getElementById('fullscreen-artist');

        if (mobileCover && fullscreenCover) {
            fullscreenCover.src = mobileCover.src;
            console.log('✅ Cover updated:', mobileCover.src);
        }
        if (mobileTitle && fullscreenTitle) {
            fullscreenTitle.textContent = mobileTitle.textContent;
            console.log('✅ Title updated:', mobileTitle.textContent);
        }
        if (mobileArtist && fullscreenArtist) {
            fullscreenArtist.textContent = mobileArtist.textContent;
            console.log('✅ Artist updated:', mobileArtist.textContent);
        }
    }

    // Seek en fullscreen
    window.seekFullscreen = function (event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;

        const audio = document.getElementById('audio-player');
        if (audio && audio.duration) {
            audio.currentTime = percent * audio.duration;
        }
    };

    // Actualizar progreso del mini player
    function updateMobileProgress() {
        const audio = document.getElementById('audio-player');
        if (!audio || !audio.duration) return;

        const percent = (audio.currentTime / audio.duration) * 100;

        // Mini player
        const mobileFill = document.getElementById('mobile-progress-fill');
        if (mobileFill) {
            mobileFill.style.width = percent + '%';
        }

        // Fullscreen player
        const fullscreenFill = document.getElementById('fullscreen-progress-fill');
        if (fullscreenFill) {
            fullscreenFill.style.width = percent + '%';
        }

        // Tiempos
        const currentTime = document.getElementById('fullscreen-current-time');
        const duration = document.getElementById('fullscreen-duration');

        if (currentTime) {
            currentTime.textContent = formatTime(audio.currentTime);
        }
        if (duration) {
            duration.textContent = formatTime(audio.duration);
        }
    }

    // Formatear tiempo
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Actualizar info del mini player cuando cambia la canción
    window.updateMobilePlayerInfo = function (song) {
        if (!isMobileDevice()) return;

        const mobileCover = document.getElementById('mobile-song-cover');
        const mobileTitle = document.getElementById('mobile-song-title');
        const mobileArtist = document.getElementById('mobile-song-artist');

        if (mobileCover && song.cover_image) {
            mobileCover.src = song.cover_image;
        }
        if (mobileTitle && song.title) {
            mobileTitle.textContent = song.title;
        }
        if (mobileArtist && song.artist_name) {
            mobileArtist.textContent = song.artist_name;
        }

        // También actualizar fullscreen si está abierto
        const fullscreen = document.getElementById('player-fullscreen');
        if (fullscreen && fullscreen.classList.contains('active')) {
            updateFullscreenPlayerInfo();
        }
    };

    // Actualizar botón play/pause
    window.updateMobilePlayButton = function (isPlaying) {
        if (!isMobileDevice()) return;

        const mobilePlayBtn = document.getElementById('mobile-play-btn');
        const fullscreenPlayBtn = document.getElementById('fullscreen-play-btn');

        const playIcon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        const pauseIcon = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

        if (mobilePlayBtn) {
            mobilePlayBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
        }
        if (fullscreenPlayBtn) {
            fullscreenPlayBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
        }
    };

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (!isMobileDevice()) return;

        createMobilePlayer();
        createFullscreenPlayer();

        // Actualizar progreso cada 100ms
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('timeupdate', updateMobileProgress);
        }

        // Actualizar en resize
        window.addEventListener('resize', function () {
            if (isMobileDevice()) {
                createMobilePlayer();
                if (!document.querySelector('.player-fullscreen')) {
                    createFullscreenPlayer();
                }
            }
        });
    }

    // ============================================
    // MOBILE SEARCH FUNCTIONALITY
    // ============================================

    // Abrir buscador móvil
    window.openMobileSearch = function () {
        if (!isMobileDevice()) return;

        const overlay = document.getElementById('mobile-search-overlay');
        const input = document.getElementById('mobile-search-input');

        if (overlay) {
            overlay.classList.add('active');
            // Focus en el input después de un pequeño delay para que la animación se vea bien
            setTimeout(() => {
                if (input) input.focus();
            }, 100);
        }
    };

    // Cerrar buscador móvil
    window.closeMobileSearch = function () {
        const overlay = document.getElementById('mobile-search-overlay');
        const input = document.getElementById('mobile-search-input');
        const results = document.getElementById('mobile-search-results');

        if (overlay) {
            overlay.classList.remove('active');
        }
        if (input) {
            input.value = '';
        }
        if (results) {
            results.innerHTML = '';
        }
    };

    // Manejar búsqueda en tiempo real
    function handleMobileSearch() {
        const input = document.getElementById('mobile-search-input');
        if (!input) return;

        let searchTimeout;
        input.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const query = this.value.trim();

            if (query.length < 2) {
                document.getElementById('mobile-search-results').innerHTML = '';
                return;
            }

            // Debounce: esperar 300ms después de que el usuario deje de escribir
            searchTimeout = setTimeout(() => {
                performMobileSearch(query);
            }, 300);
        });
    }

    // Realizar búsqueda
    async function performMobileSearch(query) {
        const resultsContainer = document.getElementById('mobile-search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #b3b3b3;">Buscando...</div>';

        try {
            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://localhost:3000/api'
                : '/api';

            // Buscar canciones y artistas en paralelo
            const [songsResponse, artistsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/songs/search/${encodeURIComponent(query)}`),
                fetch(`${API_BASE_URL}/artists/search/${encodeURIComponent(query)}`)
            ]);

            const songs = songsResponse.ok ? await songsResponse.json() : [];
            const artistsData = artistsResponse.ok ? await artistsResponse.json() : [];

            console.log('🔍 Songs from search:', songs);
            console.log('👥 Artists from search API:', artistsData);

            // Si no hay ni canciones ni artistas, mostrar mensaje
            if ((!Array.isArray(songs) || songs.length === 0) && (!Array.isArray(artistsData) || artistsData.length === 0)) {
                resultsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #b3b3b3;">No se encontraron resultados</div>';
                return;
            }

            let html = '';

            // Preparar artistas para mostrar (máximo 3)
            const artistsWithImages = artistsData.slice(0, 3).map(artist => ({
                id: artist.id,
                name: artist.name,
                profile_image: artist.image_url
            }));

            console.log('👥 Artists to display:', artistsWithImages);

            // Renderizar artistas primero (máximo 3)
            if (artistsWithImages.length > 0) {
                html += '<div style="padding: 8px 12px; font-size: 12px; font-weight: 700; color: #b3b3b3; text-transform: uppercase;">Artistas</div>';

                artistsWithImages.slice(0, 3).forEach(artist => {
                    console.log('👤 Rendering artist:', artist);
                    html += `
                        <div class="artist-row" data-artist-id="${artist.id}" style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            transition: background 0.2s;
                        ">
                            <img src="${artist.profile_image || '/images/default-artist.png'}" alt="${artist.name}"
                                 style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${artist.name}
                                    </span>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink: 0;">
                                        <circle cx="8" cy="8" r="8" fill="#1DB954"/>
                                        <path d="M11.5 5.5L6.5 10.5L4.5 8.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div style="font-size: 12px; color: #b3b3b3;">
                                    Artista
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            // Renderizar canciones
            if (songs.length > 0) {
                if (artistsWithImages.length > 0) {
                    html += '<div style="padding: 8px 12px; font-size: 12px; font-weight: 700; color: #b3b3b3; text-transform: uppercase; margin-top: 16px;">Canciones</div>';
                }

                songs.forEach(song => {
                    html += `
                        <div class="song-row" data-song-id="${song.id}" style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            transition: background 0.2s;
                        ">
                            <img src="${song.cover_image || '/images/placeholder-cover.jpg'}" alt="${song.title}"
                                 style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 14px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${song.title}
                                </div>
                                <div style="font-size: 12px; color: #b3b3b3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    Canción • ${song.artist_name || 'Artista Desconocido'}
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            resultsContainer.innerHTML = html;

            // Agregar event listeners para artistas
            resultsContainer.querySelectorAll('.artist-row').forEach(row => {
                row.addEventListener('click', () => {
                    const artistId = parseInt(row.dataset.artistId);
                    console.log('👤 Clicked artist ID:', artistId);

                    // Navegar a la página del artista
                    if (typeof window.showArtistPage === 'function') {
                        window.showArtistPage(artistId);
                        closeMobileSearch();
                    }
                });
            });

            // Agregar event listeners para canciones
            resultsContainer.querySelectorAll('.song-row').forEach(row => {
                row.addEventListener('click', async () => {
                    const songId = parseInt(row.dataset.songId);
                    console.log('🎵 Clicked song ID:', songId);

                    // Intentar usar playSongById con retry
                    const tryPlaySong = async () => {
                        // Esperar un poco para que app.js se cargue
                        await new Promise(resolve => setTimeout(resolve, 100));

                        if (typeof window.playSongById === 'function') {
                            console.log('✅ Using playSongById');
                            window.playSongById(songId);
                            closeMobileSearch();
                        } else {
                            // Si no existe, reproducir directamente con el audio player
                            console.log('⚠️ playSongById not found, playing directly...');
                            try {
                                const API_BASE_URL = window.location.hostname === 'localhost'
                                    ? 'http://localhost:3000/api'
                                    : '/api';

                                const response = await fetch(`${API_BASE_URL}/songs/${songId}`);
                                const song = await response.json();

                                console.log('🎵 Playing song:', song);

                                // Actualizar UI del player
                                const playerCover = document.getElementById('player-cover');
                                const playerSongTitle = document.getElementById('player-song-title');
                                const playerArtist = document.getElementById('player-artist');
                                const audioPlayer = document.getElementById('audio-player');

                                if (playerCover) playerCover.src = song.cover_image || '/images/placeholder-cover.jpg';
                                if (playerSongTitle) playerSongTitle.textContent = song.title;
                                if (playerArtist) playerArtist.textContent = song.artist_name || 'Artista Desconocido';

                                // Actualizar mobile player
                                if (typeof updateMobilePlayerInfo === 'function') {
                                    updateMobilePlayerInfo(song);
                                }

                                // Reproducir
                                if (audioPlayer) {
                                    audioPlayer.src = song.file_url;
                                    audioPlayer.play();
                                }

                                closeMobileSearch();
                            } catch (error) {
                                console.error('Error playing song:', error);
                            }
                        }
                    };

                    tryPlaySong();
                });
            });

        } catch (error) {
            console.error('Error en búsqueda:', error);
            resultsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff4444;">Error al buscar</div>';
        }
    }

    // Inicializar búsqueda cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleMobileSearch);
    } else {
        handleMobileSearch();
    }

})();
