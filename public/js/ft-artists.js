// Sistema de artistas colaboradores (ft.)
let ftArtistCounter = 0;
let ftArtistsData = [];

// Configurar sistema de artistas colaboradores
function setupFtArtists(artists) {
    const addButton = document.getElementById('add-ft-artist-btn');
    const container = document.getElementById('ft-artists-container');
    const hiddenInput = document.getElementById('ft-artists');

    if (!addButton || !container) return;

    // Función para actualizar el campo hidden con los IDs
    function updateFtArtistsHidden() {
        const ids = ftArtistsData.map(a => a.id).filter(id => id);
        hiddenInput.value = ids.length > 0 ? JSON.stringify(ids) : '';
        console.log('🎯 ft_artists actualizado:', ids);
    }

    // Función para agregar un campo de artista colaborador
    function addFtArtistField(artistId = null, artistName = null) {
        ftArtistCounter++;
        const fieldId = `ft-artist-${ftArtistCounter}`;

        const fieldHtml = `
            <div class="ft-artist-field" data-field-id="${fieldId}" style="
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                align-items: center;
            ">
                <input type="text" 
                    id="${fieldId}-search" 
                    class="ft-artist-search" 
                    placeholder="Buscar artista colaborador..." 
                    autocomplete="off"
                    value="${artistName || ''}"
                    style="flex: 1; padding: 10px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-base); color: var(--text-base);">
                <input type="hidden" id="${fieldId}-id" class="ft-artist-id" value="${artistId || ''}">
                <div id="${fieldId}-suggestions" class="artist-suggestions" style="display: none; position: absolute; z-index: 1000;"></div>
                <button type="button" class="remove-ft-artist-btn" data-field-id="${fieldId}" style="
                    padding: 8px 12px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                " title="Eliminar">×</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', fieldHtml);

        // Configurar autocompletado para este campo
        const searchInput = document.getElementById(`${fieldId}-search`);
        const hiddenIdInput = document.getElementById(`${fieldId}-id`);
        const suggestionsDiv = document.getElementById(`${fieldId}-suggestions`);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length === 0) {
                suggestionsDiv.style.display = 'none';
                hiddenIdInput.value = '';
                updateFtArtistsData();
                return;
            }

            const filtered = artists.filter(artist =>
                artist.name.toLowerCase().includes(query) || artist.id.toString().includes(query)
            );

            if (filtered.length === 0) {
                suggestionsDiv.innerHTML = '<div style="padding: 12px; color: var(--text-subdued); background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px;">No se encontraron artistas</div>';
                suggestionsDiv.style.display = 'block';
                return;
            }

            suggestionsDiv.innerHTML = filtered.map(artist => `
                <div class="artist-suggestion-item" data-id="${artist.id}" data-name="${artist.name}" style="
                    padding: 12px;
                    cursor: pointer;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border-subtle);
                    border-radius: 4px;
                    margin-bottom: 4px;
                ">
                    <span class="artist-name">${artist.name}</span>
                    <span class="artist-id" style="color: var(--text-subdued);"> (${artist.id})</span>
                </div>
            `).join('');

            suggestionsDiv.style.display = 'block';

            // Agregar event listeners a las sugerencias
            suggestionsDiv.querySelectorAll('.artist-suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    searchInput.value = item.dataset.name;
                    hiddenIdInput.value = item.dataset.id;
                    suggestionsDiv.style.display = 'none';
                    updateFtArtistsData();
                });
            });
        });

        // Cerrar sugerencias al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
                suggestionsDiv.style.display = 'none';
            }
        });

        // Botón eliminar
        const removeBtn = container.querySelector(`[data-field-id="${fieldId}"].remove-ft-artist-btn`);
        removeBtn.addEventListener('click', () => {
            const field = container.querySelector(`[data-field-id="${fieldId}"].ft-artist-field`);
            field.remove();
            updateFtArtistsData();
        });

        updateFtArtistsData();
    }

    // Función para actualizar el array de datos de artistas colaboradores
    function updateFtArtistsData() {
        ftArtistsData = [];
        container.querySelectorAll('.ft-artist-field').forEach(field => {
            const idInput = field.querySelector('.ft-artist-id');
            const searchInput = field.querySelector('.ft-artist-search');
            if (idInput.value) {
                ftArtistsData.push({
                    id: idInput.value,
                    name: searchInput.value
                });
            }
        });
        updateFtArtistsHidden();
    }

    // Evento del botón "Agregar artista colaborador"
    addButton.addEventListener('click', () => {
        addFtArtistField();
    });

    // Exponer función para cargar artistas colaboradores existentes
    window.loadExistingFtArtists = function (ftArtistsJson, artistsData) {
        // Limpiar campos existentes
        container.innerHTML = '';
        ftArtistCounter = 0;
        ftArtistsData = [];

        if (!ftArtistsJson) return;

        try {
            const ids = typeof ftArtistsJson === 'string' ? JSON.parse(ftArtistsJson) : ftArtistsJson;

            if (Array.isArray(ids)) {
                ids.forEach(id => {
                    const artist = artistsData.find(a => a.id.toString() === id.toString());
                    if (artist) {
                        addFtArtistField(artist.id, artist.name);
                    }
                });
            }
        } catch (error) {
            console.error('Error cargando ft_artists:', error);
        }
    };

    // Exponer función para limpiar campos
    window.clearFtArtists = function () {
        container.innerHTML = '';
        ftArtistCounter = 0;
        ftArtistsData = [];
        hiddenInput.value = '';
    };
}
