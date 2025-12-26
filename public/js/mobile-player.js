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
                    <div class="song-artist" id="mobile-song-artist" data-artist-id=""
                         style="font-size: 12px; color: #b3b3b3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: color 0.2s;"
                         onmouseover="this.style.color='#1db954'" 
                         onmouseout="this.style.color='#b3b3b3'">
                        Artista
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                    <button id="mobile-add-to-playlist-btn" 
                            style="background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center;"
                            title="Agregar a playlist">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </button>
                    
                    <button id="mobile-like-btn" 
                            style="background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center;"
                            title="Me gusta">
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
        const addToPlaylistBtn = document.getElementById('mobile-add-to-playlist-btn');

        if (miniPlayer) {
            miniPlayer.addEventListener('click', function (e) {
                // No expandir si se hizo click en botones
                if (e.target.closest('#mobile-play-btn') ||
                    e.target.closest('#mobile-like-btn') ||
                    e.target.closest('#mobile-add-to-playlist-btn') ||
                    e.target.closest('#mobile-song-artist')) {
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

        if (addToPlaylistBtn) {
            addToPlaylistBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('➕ Add to playlist button clicked!');
                if (typeof window.openAddToPlaylistModal === 'function') {
                    window.openAddToPlaylistModal();
                }
            });
        }

        if (likeBtn) {
            likeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('❤️ Like button clicked!');
                if (typeof window.toggleLikeSong === 'function') {
                    window.toggleLikeSong();
                }
            });
        }

        // Event listener para el nombre del artista en el mini player
        const mobileArtist = document.getElementById('mobile-song-artist');
        if (mobileArtist) {
            mobileArtist.addEventListener('click', function (e) {
                e.stopPropagation();
                const artistId = this.getAttribute('data-artist-id');
                if (artistId && typeof window.showArtistPage === 'function') {
                    window.showArtistPage(parseInt(artistId));
                }
            });
        }
    }

    // Función global para sincronizar canción actual al móvil
    window.syncCurrentSongToMobile = function () {
        console.log('🔄 Sincronizando canción actual a móvil...');

        // Usar window.currentPlaylist y window.currentSongIndex
        if (window.currentPlaylist && window.currentPlaylist.length > 0 && window.currentSongIndex !== undefined) {
            const song = window.currentPlaylist[window.currentSongIndex];

            if (song) {
                const mobileCover = document.getElementById('mobile-song-cover');
                const mobileTitle = document.getElementById('mobile-song-title');
                const mobileArtist = document.getElementById('mobile-song-artist');

                if (mobileCover && mobileTitle && mobileArtist) {
                    mobileCover.src = song.cover_image || '/images/placeholder-cover.jpg';
                    mobileTitle.textContent = song.title;
                    mobileArtist.innerHTML = getFullArtistName(song, window.allArtists || []);

                    if (song.artist_id) {
                        mobileArtist.setAttribute('data-artist-id', song.artist_id);
                    }

                    // Actualizar también el fullscreen player
                    const fullscreenCover = document.getElementById('fullscreen-cover');
                    const fullscreenTitle = document.getElementById('fullscreen-song-title');
                    const fullscreenArtist = document.getElementById('fullscreen-artist');
                    const fullscreenBackground = document.getElementById('fullscreen-background');

                    if (fullscreenCover) {
                        fullscreenCover.src = song.cover_image || '/images/placeholder-cover.jpg';
                    }

                    if (fullscreenTitle) {
                        const marqueeSpan = fullscreenTitle.querySelector('.marquee-text');
                        if (marqueeSpan) {
                            marqueeSpan.textContent = song.title;
                        }
                    }

                    if (fullscreenArtist) {
                        fullscreenArtist.innerHTML = getFullArtistName(song, window.allArtists || []);
                        if (song.artist_id) {
                            fullscreenArtist.setAttribute('data-artist-id', song.artist_id);
                        }
                    }

                    // Actualizar el fondo difuminado con la portada
                    if (fullscreenBackground) {
                        fullscreenBackground.style.backgroundImage = `url("${song.cover_image || '/images/placeholder-cover.jpg'}")`;
                        console.log('✅ Fondo fullscreen actualizado con portada');
                    }

                    console.log('✅ Canción sincronizada desde currentPlaylist:', song.title);
                    return true;
                }
            }
        }

        console.warn('⚠️ No se pudo sincronizar: no hay canción actual');
        return false;
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
            <div class="player-fullscreen" id="player-fullscreen" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100dvh;
                background: linear-gradient(180deg, #1a1a1a 0%, #121212 100%);
                z-index: 9999;
                display: none;
                flex-direction: column;
                color: #ffffff;
                overflow: hidden;
            ">
                <!-- Fondo difuminado con la portada -->
                <div id="fullscreen-background" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: blur(50px);
                    opacity: 0.6;
                    z-index: 0;
                    transform: scale(1.1);
                "></div>
            
                <!-- Header -->
                <div class="player-fullscreen-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                ">
                    <button onclick="closeFullscreenPlayer()" style="
                        background: none;
                        border: none;
                        color: #ffffff;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                    <div class="player-fullscreen-title" id="fullscreen-playlist-title" style="
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                    ">Reproduciendo</div>
                    <button onclick="alert('Opciones próximamente')" style="
                        background: none;
                        border: none;
                        color: #ffffff;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                    </button>
                </div>

                <!-- Cover -->
                <div style="
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 24px;
                    min-height: min(75vw, 380px);
                    position: relative;
                    z-index: 1;
                ">
                    <img class="player-fullscreen-cover" id="fullscreen-cover" src="/images/default-cover.png" alt="Cover" style="
                        width: min(75vw, 380px);
                        height: min(75vw, 380px);
                        border-radius: 8px;
                        object-fit: cover;
                        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                        display: block;
                    ">
                </div>

                <!-- Info de la canción con botones -->
                <div class="player-fullscreen-info" style="
                    padding: 0 24px 16px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                ">
                    <div class="player-fullscreen-song-title marquee-container" id="fullscreen-song-title" style="
                        font-size: 22px;
                        font-weight: 700;
                        color: #ffffff;
                        margin-bottom: 12px;
                        text-align: center;
                        padding: 0 16px;
                    ">
                        <span class="marquee-text">Selecciona una canción</span>
                    </div>
                    
                    <!-- Artista con botones -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 16px;
                    ">
                        <button id="fullscreen-like-btn" style="
                            background: none;
                            border: none;
                            color: #b3b3b3;
                            cursor: pointer;
                            padding: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: color 0.2s;
                            flex-shrink: 0;
                        " title="Me gusta">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        
                        <div class="player-fullscreen-artist" id="fullscreen-artist" data-artist-id=""
                             style="
                                font-size: 16px;
                                color: #b3b3b3;
                                transition: color 0.2s;
                                white-space: normal;
                                word-wrap: break-word;
                                flex: 1;
                                min-width: 0;
                                text-align: center;
                                line-height: 1.4;
                                max-width: 100%;
                             ">Artista</div>
                        
                        <button id="fullscreen-add-to-playlist-btn" style="
                            background: none;
                            border: none;
                            color: #b3b3b3;
                            cursor: pointer;
                            padding: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: color 0.2s;
                            flex-shrink: 0;
                        " title="Agregar a playlist">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Barra de progreso -->
                <div class="player-fullscreen-progress" style="
                    padding: 0 24px 20px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                ">
                    <div class="player-fullscreen-progress-bar" onclick="seekFullscreen(event)" style="
                        width: 100%;
                        height: 4px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 2px;
                        cursor: pointer;
                        margin-bottom: 8px;
                        position: relative;
                    ">
                        <div class="player-fullscreen-progress-fill" id="fullscreen-progress-fill" style="
                            width: 0%;
                            height: 100%;
                            background: #1db954;
                            border-radius: 2px;
                            transition: width 0.1s;
                        "></div>
                    </div>
                    <div class="player-fullscreen-time" style="
                        display: flex;
                        justify-content: space-between;
                        font-size: 12px;
                        color: #b3b3b3;
                    ">
                        <span id="fullscreen-current-time">0:00</span>
                        <span id="fullscreen-duration">0:00</span>
                    </div>
                </div>

                <!-- Controles de reproducción -->
                <div class="player-fullscreen-controls" style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    padding: 0 24px 24px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                ">
                    <button id="fullscreen-shuffle-btn" onclick="toggleShuffle()" style="
                        background: none;
                        border: none;
                        color: #b3b3b3;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.2s;
                    " title="Aleatorio">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                        </svg>
                    </button>
                    <button onclick="playPrevious()" style="
                        background: none;
                        border: none;
                        color: #ffffff;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>
                    <button class="play-pause-btn" id="fullscreen-play-btn" onclick="togglePlayPause()" style="
                        background: #ffffff;
                        border: none;
                        color: #000000;
                        cursor: pointer;
                        padding: 0;
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    ">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <button onclick="playNext()" style="
                        background: none;
                        border: none;
                        color: #ffffff;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                    <button id="fullscreen-repeat-btn" onclick="toggleRepeat()" style="
                        background: none;
                        border: none;
                        color: #b3b3b3;
                        cursor: pointer;
                        padding: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: color 0.2s;
                        position: relative;
                    " title="Repetir">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
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

        // Event listener para el nombre del artista en el fullscreen player
        // NOTA: Ahora cada artista individual tiene su propio onclick en el HTML generado por getFullArtistName
        // por lo que no necesitamos este listener en el contenedor
        /*
        const fullscreenArtist = document.getElementById('fullscreen-artist');
        if (fullscreenArtist) {
            fullscreenArtist.addEventListener('click', function (e) {
                e.stopPropagation();
                const artistId = this.getAttribute('data-artist-id');
                if (artistId && typeof window.showArtistPage === 'function') {
                    window.showArtistPage(parseInt(artistId));
                    closeFullscreenPlayer();
                }
            });
        }
        */

        // Event listener para el botón de agregar a playlist en fullscreen
        const fullscreenAddBtn = document.getElementById('fullscreen-add-to-playlist-btn');
        if (fullscreenAddBtn) {
            fullscreenAddBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('➕ Fullscreen add to playlist clicked!');
                if (typeof window.openAddToPlaylistModal === 'function') {
                    window.openAddToPlaylistModal();
                }
            });
        }

        // Event listener para el botón de me gusta en fullscreen
        const fullscreenLikeBtn = document.getElementById('fullscreen-like-btn');
        if (fullscreenLikeBtn) {
            fullscreenLikeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                console.log('❤️ Fullscreen like button clicked!');
                if (typeof window.toggleLikeSong === 'function') {
                    window.toggleLikeSong();
                }
            });
        }
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
        const fullscreenBackground = document.getElementById('fullscreen-background');

        console.log('🖼️ Fullscreen background element:', fullscreenBackground);

        if (mobileCover && fullscreenCover) {
            fullscreenCover.src = mobileCover.src;
            console.log('✅ Cover updated:', mobileCover.src);

            // Actualizar el fondo difuminado con la misma imagen
            if (fullscreenBackground) {
                fullscreenBackground.style.backgroundImage = `url("${mobileCover.src}")`;
                console.log('✅ Background updated with blurred cover:', mobileCover.src);
            } else {
                console.warn('⚠️ Fullscreen background element not found!');
            }
        }
        if (mobileTitle && fullscreenTitle) {
            const marqueeSpan = fullscreenTitle.querySelector('.marquee-text');
            if (marqueeSpan) {
                marqueeSpan.textContent = mobileTitle.textContent;

                // Verificar si el texto es más largo que el contenedor
                setTimeout(() => {
                    if (marqueeSpan.scrollWidth > fullscreenTitle.clientWidth) {
                        marqueeSpan.classList.add('should-animate');
                        // Duplicar el texto para efecto continuo
                        marqueeSpan.textContent = mobileTitle.textContent + '  •  ' + mobileTitle.textContent;
                    } else {
                        marqueeSpan.classList.remove('should-animate');
                    }
                }, 100);
            }
            console.log('✅ Title updated:', mobileTitle.textContent);
        }
        if (mobileArtist && fullscreenArtist) {
            fullscreenArtist.innerHTML = mobileArtist.innerHTML;
            // Copiar el artist_id también
            const artistId = mobileArtist.getAttribute('data-artist-id');
            if (artistId) {
                fullscreenArtist.setAttribute('data-artist-id', artistId);
            }
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

            // Aplicar marquesina si el texto es muy largo
            setTimeout(() => {
                if (mobileTitle.scrollWidth > mobileTitle.clientWidth) {
                    mobileTitle.classList.add('marquee-container');
                    const span = document.createElement('span');
                    span.className = 'marquee-text should-animate';
                    span.textContent = song.title + '  •  ' + song.title;
                    mobileTitle.textContent = '';
                    mobileTitle.appendChild(span);
                }
            }, 100);
        }
        if (mobileArtist && song.artist_name) {
            mobileArtist.innerHTML = getFullArtistName(song, window.allArtists || []);
            // Guardar el artist_id en el atributo data
            if (song.artist_id) {
                mobileArtist.setAttribute('data-artist-id', song.artist_id);
            }
        }

        // Actualizar fullscreen player (esté abierto o no, para que esté listo)
        const fullscreenCover = document.getElementById('fullscreen-cover');
        const fullscreenTitle = document.getElementById('fullscreen-song-title');
        const fullscreenArtist = document.getElementById('fullscreen-artist');
        const fullscreenBackground = document.getElementById('fullscreen-background');

        if (fullscreenCover && song.cover_image) {
            fullscreenCover.src = song.cover_image;

            // Actualizar el fondo difuminado
            if (fullscreenBackground) {
                fullscreenBackground.style.backgroundImage = `url(${song.cover_image})`;
            }
        }
        if (fullscreenTitle && song.title) {
            const marqueeSpan = fullscreenTitle.querySelector('.marquee-text');
            if (marqueeSpan) {
                marqueeSpan.textContent = song.title;

                // Verificar si el texto es más largo que el contenedor
                setTimeout(() => {
                    if (marqueeSpan.scrollWidth > fullscreenTitle.clientWidth) {
                        marqueeSpan.classList.add('should-animate');
                        // Duplicar el texto para efecto continuo
                        marqueeSpan.textContent = song.title + '  •  ' + song.title;
                    } else {
                        marqueeSpan.classList.remove('should-animate');
                        marqueeSpan.textContent = song.title;
                    }
                }, 100);
            }
        }
        if (fullscreenArtist && song.artist_name) {
            fullscreenArtist.innerHTML = getFullArtistName(song, window.allArtists || []);
            if (song.artist_id) {
                fullscreenArtist.setAttribute('data-artist-id', song.artist_id);
            }
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
        // Inicializar si estamos en móvil
        if (isMobileDevice()) {
            createMobilePlayer();
            createFullscreenPlayer();
        }

        // Actualizar progreso cada 100ms
        const audio = document.getElementById('audio-player');
        if (audio) {
            audio.addEventListener('timeupdate', updateMobileProgress);
        }

        // Actualizar en resize - SIEMPRE escuchar, no solo en móvil
        let wasMobile = isMobileDevice();
        window.addEventListener('resize', function () {
            const isMobile = isMobileDevice();

            // Si cambiamos de desktop a móvil
            if (!wasMobile && isMobile) {
                console.log('📱 Cambiando a modo móvil');

                // Crear mini player si no existe
                if (!document.getElementById('mobile-player-mini')) {
                    createMobilePlayer();
                }

                // Crear fullscreen player si no existe
                if (!document.querySelector('.player-fullscreen')) {
                    createFullscreenPlayer();
                }

                // Sincronizar usando la función global con delay
                setTimeout(() => {
                    if (typeof window.syncCurrentSongToMobile === 'function') {
                        window.syncCurrentSongToMobile();
                    }
                }, 300);
            }
            // Si cambiamos de móvil a desktop
            else if (wasMobile && !isMobile) {
                console.log('💻 Cambiando a modo desktop');

                // Ocultar completamente el mini player móvil
                const mobilePlayerMini = document.getElementById('mobile-player-mini');
                if (mobilePlayerMini) {
                    mobilePlayerMini.remove(); // Eliminar completamente
                    console.log('✅ Mini player móvil eliminado');
                }

                // Ocultar la barra de navegación móvil
                const mobileNav = document.querySelector('.mobile-nav');
                if (mobileNav) {
                    mobileNav.remove(); // Eliminar completamente
                    console.log('✅ Navegación móvil eliminada');
                }

                // FORZAR que el reproductor desktop se muestre
                const playerBar = document.querySelector('.player-bar');
                if (playerBar) {
                    // Mostrar la barra del player
                    playerBar.style.display = 'grid';

                    // Mostrar los elementos internos del player
                    const playerLeft = playerBar.querySelector('.player-left');
                    const playerCenter = playerBar.querySelector('.player-center');
                    const playerRight = playerBar.querySelector('.player-right');

                    if (playerLeft) playerLeft.style.display = 'flex';
                    if (playerCenter) playerCenter.style.display = 'flex';
                    if (playerRight) playerRight.style.display = 'flex';

                    console.log('✅ Reproductor desktop restaurado');
                }
            }
            // Si seguimos en móvil, asegurar que existan los elementos
            else if (isMobile) {
                if (!document.getElementById('mobile-player-mini')) {
                    createMobilePlayer();
                    // Sincronizar después de crear
                    setTimeout(() => {
                        if (typeof window.syncCurrentSongToMobile === 'function') {
                            window.syncCurrentSongToMobile();
                        }
                    }, 100);
                }
                if (!document.querySelector('.player-fullscreen')) {
                    createFullscreenPlayer();
                }
            }

            wasMobile = isMobile;
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

    // ============================================
    // MOBILE LIBRARY FUNCTIONALITY
    // ============================================

    // Generar degradado aleatorio para playlists sin imagen
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

    // Mostrar biblioteca con playlists
    window.showMobileLibrary = async function () {
        if (!isMobileDevice()) return;

        const contentWrapper = document.querySelector('.content-wrapper');
        if (!contentWrapper) return;

        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';

        try {
            const token = localStorage.getItem('authToken');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            if (!token || !currentUser.id) {
                contentWrapper.innerHTML = '<div style="padding: 40px; text-align: center; color: #b3b3b3;">Inicia sesión para ver tu biblioteca</div>';
                return;
            }

            // Obtener playlists del usuario
            const response = await fetch(`${API_BASE_URL}/playlists?user_id=${currentUser.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar playlists');
            }

            const playlists = await response.json();

            // Renderizar biblioteca
            contentWrapper.innerHTML = `
                <div style="padding: 20px 20px 150px 12px;">
                    <h1 style="font-size: 32px; font-weight: 900; margin-bottom: 24px; padding-left: 4px;">Tu biblioteca</h1>
                    
                    <div id="playlists-container" style="display: flex; flex-direction: column; gap: 12px;">
                        ${playlists.length === 0 ?
                    '<div style="text-align: center; padding: 40px; color: #b3b3b3;">No tienes playlists aún</div>' :
                    playlists.map(playlist => {
                        const gradient = getRandomGradient();
                        return `
                                <div class="playlist-item" data-playlist-id="${playlist.id}" style="
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    padding: 8px 0;
                                    cursor: pointer;
                                    transition: opacity 0.2s;
                                " onclick="showMobilePlaylist(${playlist.id})">
                                    ${playlist.cover_image ?
                                `<img src="${playlist.cover_image}"
                                             alt="${playlist.name}"
                                             style="width: 56px; height: 56px; border-radius: 4px; object-fit: cover; flex-shrink: 0;">` :
                                `<div style="
                                            width: 56px;
                                            height: 56px;
                                            border-radius: 4px;
                                            background: linear-gradient(135deg, ${gradient});
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            flex-shrink: 0;
                                        ">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.7">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>`
                            }
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-size: 16px; font-weight: 400; color: #ffffff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${playlist.name}
                                        </div>
                                        <div style="font-size: 14px; color: #b3b3b3; display: flex; align-items: center; gap: 4px;">
                                            <span style="color: #1DB954; font-size: 12px;">📌</span>
                                            Playlist • ${playlist.song_count || 0} canciones
                                        </div>
                                    </div>
                                </div>
                            `}).join('')
                }
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading library:', error);
            contentWrapper.innerHTML = '<div style="padding: 40px; text-align: center; color: #ff4444;">Error al cargar la biblioteca</div>';
        }
    };

    // Mostrar canciones de una playlist
    window.showMobilePlaylist = async function (playlistId) {
        if (!isMobileDevice()) return;

        const contentWrapper = document.querySelector('.content-wrapper');
        if (!contentWrapper) return;

        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';

        try {
            const token = localStorage.getItem('authToken');

            // Obtener detalles de la playlist
            const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar playlist');
            }

            const playlist = await response.json();
            const gradient = getRandomGradient();
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

            // Calcular duración total
            const totalDuration = playlist.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0;
            const hours = Math.floor(totalDuration / 3600);
            const minutes = Math.floor((totalDuration % 3600) / 60);
            const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

            // Aplicar degradado al content-wrapper
            contentWrapper.style.background = `linear-gradient(180deg, rgba(${gradient.match(/\d+/g)?.slice(0, 3).join(',') || '102,126,234'}, 0.3) 0%, transparent 300px)`;

            // Renderizar playlist estilo Spotify
            contentWrapper.innerHTML = `
                <div style="padding-bottom: 150px;">
                    <!-- Header con flecha de volver -->
                    <div style="padding: 16px;">
                        <button onclick="showMobileLibrary()" style="
                            background: rgba(0,0,0,0.5);
                            border: none;
                            color: #ffffff;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Portada y detalles -->
                    <div style="text-align: center; padding: 0 20px 20px;">
                        ${playlist.cover_image ?
                    `<img src="${playlist.cover_image}" 
                                 alt="${playlist.name}"
                                 style="width: 240px; height: 240px; border-radius: 8px; object-fit: cover; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">` :
                    `<div style="
                                width: 240px; 
                                height: 240px; 
                                border-radius: 8px; 
                                background: linear-gradient(135deg, ${gradient});
                                margin: 0 auto 20px;
                                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <svg width="96" height="96" viewBox="0 0 24 24" fill="white" opacity="0.7">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                            </div>`
                }
                        
                        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; text-align: left;">${playlist.name}</h1>
                        <p style="font-size: 13px; color: #b3b3b3; text-align: left; margin-bottom: 12px;">
                            ${playlist.description || 'Playlist'}
                        </p>
                        
                        <!-- Creador -->
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">
                                ${playlist.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span style="font-size: 13px; font-weight: 600;">${playlist.username || 'Usuario'}</span>
                        </div>
                        
                        <!-- Info -->
                        <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; color: #b3b3b3;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                            <span>Se guardó ${playlist.songs?.length || 0} veces • ${durationText}</span>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div style="padding: 0 20px 20px; display: flex; align-items: center; justify-content: flex-end; gap: 16px;">
                        <!-- Botón shuffle -->
                        <button onclick="shuffleAndPlayPlaylist(${playlistId})" style="background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                            </svg>
                        </button>
                        
                        <!-- Botón play grande -->
                        <button onclick="playPlaylistFromStart(${playlistId})" style="
                            background: #1DB954;
                            border: none;
                            width: 56px;
                            height: 56px;
                            border-radius: 50%;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                        ">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Lista de canciones -->
                    <div style="padding: 0 12px;">
                        ${!playlist.songs || playlist.songs.length === 0 ?
                    '<div style="text-align: center; padding: 40px; color: #b3b3b3;">Esta playlist está vacía</div>' :
                    playlist.songs.map((song, index) => `
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    padding: 8px 0;
                                    position: relative;
                                ">
                                    <div onclick="playPlaylistSongByIndex(${playlistId}, ${index})" style="
                                        display: flex;
                                        align-items: center;
                                        gap: 12px;
                                        flex: 1;
                                        cursor: pointer;
                                    ">
                                        <img src="${song.cover_image || '/images/placeholder-cover.jpg'}" 
                                             alt="${song.title}"
                                             style="width: 48px; height: 48px; border-radius: 4px; object-fit: cover; flex-shrink: 0;">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 14px; font-weight: 400; color: #ffffff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                ${song.title}
                                            </div>
                                            <div style="font-size: 12px; color: #b3b3b3; display: flex; align-items: center; gap: 4px;">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                                </svg>
                                                <span>${song.artist_name || 'Artista Desconocido'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onclick="removeSongFromPlaylist(${playlistId}, ${song.id})" style="background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px;" title="Eliminar de la lista">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                        </svg>
                                    </button>
                                </div>
                            `).join('')
                }
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Error loading playlist:', error);
            contentWrapper.innerHTML = '<div style="padding: 40px; text-align: center; color: #ff4444;">Error al cargar la playlist</div>';
        }
    };

    // Reproducir canción de playlist por índice
    window.playPlaylistSongByIndex = async function (playlistId, songIndex) {
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const playlist = await response.json();

                if (playlist.songs && playlist.songs[songIndex]) {
                    // Limpiar estado previo
                    if (window.audioPlayer) {
                        window.audioPlayer.pause();
                        window.audioPlayer.currentTime = 0;
                    }

                    // Cargar playlist completa en el reproductor global
                    window.currentPlaylist = playlist.songs;
                    window.currentSongIndex = songIndex;

                    // Log de verificación
                    console.log('🔍 Verificación antes de reproducir:');
                    console.log('   - Índice a reproducir:', songIndex);
                    console.log('   - Canción en currentPlaylist[' + songIndex + ']:', window.currentPlaylist[songIndex]);
                    console.log('   - ID de canción:', window.currentPlaylist[songIndex].id);
                    console.log('   - Título:', window.currentPlaylist[songIndex].title);
                    console.log('   - Artista ID:', window.currentPlaylist[songIndex].artist_id);

                    // Pequeño delay para asegurar que el estado se actualice
                    setTimeout(() => {
                        if (typeof window.playSong === 'function') {
                            window.playSong(songIndex);
                        }
                    }, 0);
                }
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };

    // Reproducir playlist desde el inicio
    window.playPlaylistFromStart = async function (playlistId) {
        await window.playPlaylistSongByIndex(playlistId, 0);
    };

    // Reproducir playlist en modo aleatorio
    window.shuffleAndPlayPlaylist = async function (playlistId) {
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const playlist = await response.json();
                if (playlist.songs && playlist.songs.length > 0) {
                    // Obtener índice aleatorio
                    const randomIndex = Math.floor(Math.random() * playlist.songs.length);

                    // Reproducir desde índice aleatorio
                    await window.playPlaylistSongByIndex(playlistId, randomIndex);
                }
            }
        } catch (error) {
            console.error('Error shuffling playlist:', error);
        }
    };

    // Eliminar canción de playlist
    window.removeSongFromPlaylist = async function (playlistId, songId) {
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:3000/api'
            : '/api';

        if (!confirm('¿Eliminar esta canción de la playlist?')) {
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

            if (response.ok) {
                // Recargar la playlist
                showMobilePlaylist(playlistId);
            } else {
                alert('Error al eliminar la canción');
            }
        } catch (error) {
            console.error('Error removing song:', error);
            alert('Error al eliminar la canción');
        }
    };

    // ===== FUNCIONALIDAD DE ARRASTRE PARA BARRA DE PROGRESO FULLSCREEN =====

    // Hacer la barra de progreso fullscreen arrastrable
    const fullscreenProgressBar = document.getElementById('fullscreen-progress-bar');
    if (fullscreenProgressBar) {
        let isDragging = false;

        function updateProgress(e) {
            const rect = fullscreenProgressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

            const audio = document.getElementById('audio-player');
            if (audio && audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        }

        function startDrag(e) {
            isDragging = true;
            updateProgress(e);
            e.preventDefault();
        }

        function drag(e) {
            if (isDragging) {
                updateProgress(e);
            }
        }

        function stopDrag() {
            isDragging = false;
        }

        fullscreenProgressBar.addEventListener('mousedown', startDrag);
        fullscreenProgressBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = fullscreenProgressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
            const audio = document.getElementById('audio-player');
            if (audio && audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
            e.preventDefault();
        });

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                const rect = fullscreenProgressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
                const audio = document.getElementById('audio-player');
                if (audio && audio.duration) {
                    audio.currentTime = percent * audio.duration;
                }
            }
        });

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

})();
