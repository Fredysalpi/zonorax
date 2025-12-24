// Fix para reproducción de playlist móvil
(function () {
    // Sobrescribir la función problemática
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
                    // Obtener la canción ANTES de modificar currentPlaylist
                    const songToPlay = playlist.songs[songIndex];

                    console.log('🎵 Reproduciendo:', songToPlay.title, '(ID:', songToPlay.id, ', Artista ID:', songToPlay.artist_id, ')');

                    // Cargar playlist completa (copia del array)
                    window.currentPlaylist = [...playlist.songs];
                    window.currentSongIndex = songIndex;

                    // Actualizar UI del reproductor directamente
                    const playerCover = document.getElementById('player-cover');
                    const playerSongTitle = document.getElementById('player-song-title');
                    const playerArtist = document.getElementById('player-artist');

                    if (playerCover) playerCover.src = songToPlay.cover_image || '/images/placeholder-cover.jpg';
                    if (playerSongTitle) playerSongTitle.textContent = songToPlay.title;
                    if (playerArtist) playerArtist.textContent = songToPlay.artist_name || 'Artista Desconocido';

                    // Guardar IDs
                    window.currentArtistId = songToPlay.artist_id;
                    window.currentSongId = songToPlay.id;

                    // Actualizar mobile player
                    if (typeof window.updateMobilePlayerInfo === 'function') {
                        window.updateMobilePlayerInfo(songToPlay);
                    }

                    // Reproducir audio - OBTENER DEL DOM
                    const audioPlayer = document.getElementById('audio-player');
                    console.log('🔍 audioPlayer:', audioPlayer);

                    if (audioPlayer) {
                        console.log('✅ audioPlayer encontrado');
                        audioPlayer.src = songToPlay.file_url;
                        console.log('✅ src asignado:', audioPlayer.src);

                        try {
                            await audioPlayer.play();
                            console.log('✅ Reproducción iniciada');
                        } catch (error) {
                            console.error('❌ Error al reproducir:', error);
                        }
                    } else {
                        console.error('❌ No se encontró el elemento audio-player');
                    }

                    // Actualizar sidebar
                    if (typeof window.updateSongSidebar === 'function') {
                        window.updateSongSidebar(songToPlay);
                    }

                    // Verificar "Me Gusta"
                    if (typeof window.updateLikeButtonState === 'function') {
                        window.updateLikeButtonState();
                    }

                    // Registrar reproducción
                    fetch(`${API_BASE_URL}/songs/${songToPlay.id}/play`, { method: 'POST' });
                }
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    };
})();
