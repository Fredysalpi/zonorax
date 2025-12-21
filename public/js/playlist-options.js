// ===== OPCIONES DE PLAYLIST =====
window.togglePlaylistOptions = function(event, playlistId) {
    event.stopPropagation();
    
    // Crear modal de opciones
    const modal = document.createElement('div');
    modal.id = 'playlist-options-modal';
    modal.style.cssText = `
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.7);
display: flex;
align - items: center;
justify - content: center;
z - index: 10000;
`;
    
    modal.innerHTML = `
    < div style = "
background: var(--bg - elevated);
border - radius: 8px;
min - width: 200px;
box - shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
overflow: hidden;
">
    < button onclick = "editPlaylist(${playlistId}); document.getElementById('playlist-options-modal').remove();" style = "
width: 100 %;
padding: 16px 24px;
background: none;
border: none;
border - bottom: 1px solid var(--border - subtle);
color: var(--text - base);
text - align: left;
cursor: pointer;
font - size: 16px;
display: flex;
align - items: center;
gap: 12px;
transition: background 0.2s;
" onmouseover="this.style.background = 'rgba(255,255,255,0.1)'" onmouseout="this.style.background = 'none'">
    < svg viewBox = "0 0 16 16" width = "16" height = "16" >
        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286z" fill="currentColor" />
                </svg >
    Editar
            </button >
    <button onclick="deletePlaylist(${playlistId}); document.getElementById('playlist-options-modal').remove();" style="
                width: 100%;
                padding: 16px 24px;
                background: none;
                border: none;
                color: #ff4444;
                text-align: left;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">
        <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 1 0-1.492.15l.66 6.6A1.75 1.75 0 0 0 5.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 0 0-1.492-.149l-.66 6.6a.25.25 0 0 1-.249.225h-5.19a.25.25 0 0 1-.249-.225l-.66-6.6z" fill="currentColor" />
        </svg>
        Eliminar
    </button>
        </div >
    `;
    
    document.body.appendChild(modal);
    
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


window.editPlaylist = async function (playlistId) {
    // Cerrar popup de opciones
    document.getElementById('playlist-options-popup').style.display = 'none';

    try {
        // Obtener datos actuales de la playlist
        const response = await fetch(`${ API_BASE_URL } /playlists/${ playlistId } `);
        const playlist = await response.json();

        // Crear modal de edición
        const modal = document.createElement('div');
        modal.id = 'edit-playlist-modal';
        modal.style.cssText = `
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(0, 0, 0, 0.8);
display: flex;
align - items: center;
justify - content: center;
z - index: 10000;
`;

        modal.innerHTML = `
    < div style = "
background: var(--bg - elevated);
border - radius: 8px;
padding: 32px;
max - width: 600px;
width: 90 %;
box - shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
max - height: 90vh;
overflow - y: auto;
">
    < h2 style = "font-size: 24px; font-weight: 700; margin-bottom: 24px; color: var(--text-base);" > Editar playlist</h2 >
                
                < !--Imagen de portada-- >
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-base);">Imagen de portada</label>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div id="playlist-cover-preview" style="
                            width: 180px;
                            height: 180px;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                        ">
                            ${playlist.cover_image ?
                `<img src="${playlist.cover_image}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<svg viewBox="0 0 24 24" width="80" height="80" fill="rgba(255,255,255,0.7)">
                                    <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1.5.866l8-4.5a1 1 0 0 0 0-1.732l-8-4.5zM16 19.268V4.732L21.197 12 16 19.268zM7 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" fill="currentColor"/>
                                </svg>`
            }
                        </div>
                        <div style="flex: 1;">
                            <input type="file" id="playlist-cover-input" accept="image/*" style="display: none;">
                            <button onclick="document.getElementById('playlist-cover-input').click(); return false;" style="
                                padding: 8px 16px;
                                background: var(--bg-base);
                                border: 1px solid var(--border-subtle);
                                border-radius: 4px;
                                color: var(--text-base);
                                font-size: 14px;
                                cursor: pointer;
                                margin-bottom: 8px;
                            ">Seleccionar imagen</button>
                            <p style="font-size: 12px; color: var(--text-subdued); margin: 0;">JPG, PNG o GIF (máx. 2MB)</p>
                        </div>
                    </div>
                </div>
                
                <!--Nombre -->
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-base);">Nombre</label>
                    <input type="text" id="edit-playlist-name" value="${playlist.name}" style="
                        width: 100%;
                        padding: 12px;
                        background: var(--bg-base);
                        border: 1px solid var(--border-subtle);
                        border-radius: 4px;
                        color: var(--text-base);
                        font-size: 14px;
                    ">
                </div>
                
                <!--Descripción -->
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-base);">Descripción</label>
                    <textarea id="edit-playlist-description" style="
                        width: 100%;
                        padding: 12px;
                        background: var(--bg-base);
                        border: 1px solid var(--border-subtle);
                        border-radius: 4px;
                        color: var(--text-base);
                        font-size: 14px;
                        resize: vertical;
                        min-height: 80px;
                    ">${playlist.description || ''}</textarea>
                </div>
                
                <!--Pública -->
                <div style="margin-bottom: 24px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="edit-playlist-public" ${playlist.is_public ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
                        <span style="font-size: 14px; color: var(--text-base);">Hacer pública</span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancel-edit-playlist" style="
                        padding: 12px 24px;
                        background: transparent;
                        border: 1px solid var(--text-subdued);
                        border-radius: 24px;
                        color: var(--text-base);
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button id="confirm-edit-playlist" style="
                        padding: 12px 24px;
                        background: var(--accent-base);
                        border: none;
                        border-radius: 24px;
                        color: var(--bg-base);
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                    ">Guardar cambios</button>
                </div>
            </div >
    `;

        document.body.appendChild(modal);

        // Event listener para imagen de portada
        const coverInput = document.getElementById('playlist-cover-input');
        const coverPreview = document.getElementById('playlist-cover-preview');

        coverInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('La imagen no debe superar los 2MB');
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    alert('Por favor selecciona una imagen válida');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    coverPreview.innerHTML = `< img src = "${e.target.result}" style = "width: 100%; height: 100%; object-fit: cover;" > `;
                    window.tempPlaylistCoverFile = file;
                };
                reader.readAsDataURL(file);
            }
        });

        // Event listeners de botones
        document.getElementById('cancel-edit-playlist').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('confirm-edit-playlist').addEventListener('click', async () => {
            await updatePlaylistData(playlistId);
            modal.remove();
        });

        // Cerrar con click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

    } catch (error) {
        console.error('Error loading playlist for edit:', error);
        alert('❌ Error al cargar la playlist');
    }
}

async function updatePlaylistData(playlistId) {
    const name = document.getElementById('edit-playlist-name').value.trim();
    const description = document.getElementById('edit-playlist-description').value.trim();
    const isPublic = document.getElementById('edit-playlist-public').checked;

    if (!name) {
        alert('Por favor ingresa un nombre para la playlist');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        // Actualizar datos básicos
        const response = await fetch(`${ API_BASE_URL } /playlists/${ playlistId } `, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ token } `
            },
            body: JSON.stringify({
                name,
                description: description || null,
                is_public: isPublic
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la playlist');
        }

        // Si hay imagen nueva, subirla
        if (window.tempPlaylistCoverFile) {
            const formData = new FormData();
            formData.append('cover', window.tempPlaylistCoverFile);

            await fetch(`${ API_BASE_URL } /playlists/${ playlistId }/cover`, {
method: 'POST',
    headers: {
    'Authorization': `Bearer ${token}`
},
body: formData
            });

delete window.tempPlaylistCoverFile;
        }

alert('✅ Playlist actualizada correctamente');

// Recargar playlists y vista actual
await loadPlaylists();
await loadPlaylistSongs(playlistId);

    } catch (error) {
    console.error('Error updating playlist:', error);
    alert('❌ Error al actualizar la playlist: ' + error.message);
}
}

window.deletePlaylist = async function (playlistId) {
    // Cerrar popup de opciones
    document.getElementById('playlist-options-popup').style.display = 'none';

    if (!confirm('¿Estás seguro de que deseas eliminar esta playlist? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la playlist');
        }

        alert('✅ Playlist eliminada correctamente');

        // Recargar playlists y volver al inicio
        await loadPlaylists();
        goHome();

    } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('❌ Error al eliminar la playlist: ' + error.message);
    }
}
