// Cargar artistas para poder mostrar colaboradores
let allArtistsLoaded = false;

async function loadArtistsForCollaborators() {
    if (allArtistsLoaded) return;

    try {
        const response = await fetch('/api/artists');
        const data = await response.json();
        window.allArtists = data || [];
        allArtistsLoaded = true;
        console.log('✅ Artistas cargados para colaboradores:', window.allArtists.length);
    } catch (error) {
        console.error('Error cargando artistas:', error);
        window.allArtists = [];
    }
}

// Cargar artistas al inicio
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadArtistsForCollaborators);
} else {
    loadArtistsForCollaborators();
}
