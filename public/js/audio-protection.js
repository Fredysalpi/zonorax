// ===== PROTECCIÓN DE AUDIO =====

// Prevenir inspección de elementos de audio
(function () {
    'use strict';

    // Deshabilitar click derecho en el reproductor de audio
    const audioPlayer = document.getElementById('audio-player');

    if (audioPlayer) {
        audioPlayer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Prevenir arrastrar el elemento de audio
        audioPlayer.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        // Ocultar controles nativos del navegador
        audioPlayer.removeAttribute('controls');
        audioPlayer.setAttribute('controlsList', 'nodownload');
        audioPlayer.setAttribute('disablePictureInPicture', 'true');
    }

    // Detectar si las DevTools están abiertas
    let devtoolsOpen = false;
    const threshold = 160;

    const detectDevTools = () => {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                // Opcional: Pausar reproducción cuando se abren DevTools
                if (audioPlayer && !audioPlayer.paused) {
                    console.warn('⚠️ Protección de contenido activa');
                }
            }
        } else {
            devtoolsOpen = false;
        }
    };

    // Verificar cada segundo
    setInterval(detectDevTools, 1000);

    // Prevenir atajos de teclado para DevTools
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (ver código fuente)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (guardar página)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
    });

    // Prevenir selección de texto en elementos sensibles
    document.addEventListener('selectstart', (e) => {
        if (e.target.tagName === 'AUDIO') {
            e.preventDefault();
            return false;
        }
    });

})();

// Función para cargar audio con token temporal
async function loadProtectedAudio(songId) {
    try {
        // Solicitar token temporal
        const response = await fetch(`${API_BASE_URL}/audio/generate-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ songId })
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener acceso al audio');
        }

        const { token, expiresAt } = await response.json();

        // Usar URL con token temporal
        const streamUrl = `${API_BASE_URL}/audio/stream/${token}`;

        return streamUrl;

    } catch (error) {
        console.error('Error loading protected audio:', error);
        throw error;
    }
}

// Función para crear Blob URL ofuscado (alternativa)
async function createBlobUrl(audioUrl) {
    try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // El blob URL es temporal y no revela la URL original
        return blobUrl;

    } catch (error) {
        console.error('Error creating blob URL:', error);
        throw error;
    }
}

// Limpiar Blob URLs cuando ya no se necesiten
function revokeBlobUrl(url) {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

// Exportar funciones
window.audioProtection = {
    loadProtectedAudio,
    createBlobUrl,
    revokeBlobUrl
};
