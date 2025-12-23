// ===== GESTIÓN DE USUARIOS =====

// Variables de paginación
let currentUsersPage = 1;
let usersSearchQuery = '';

// Cargar usuarios con paginación
async function loadUsers(page = 1, search = '') {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=25&search=${encodeURIComponent(search)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = data.users.map(user => `
            <tr>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-info'}">
                        ${user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                        ${user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${formatDate(user.created_at)}</td>
                <td>
                    <button class="btn-edit" onclick="editUser(${user.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');

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
    const form = document.getElementById('user-form');
    form.reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-password').required = true;

    if (userId) {
        document.getElementById('user-modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-password').required = false;
        loadUserData(userId);
    }

    document.getElementById('user-modal').classList.add('active');
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
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-active').checked = user.is_active === 1;
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
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    const is_active = document.getElementById('user-active').checked;

    const userData = { username, email, role, is_active };

    if (password) {
        userData.password = password;
    }

    try {
        const url = userId
            ? `${API_BASE_URL}/admin/users/${userId}`
            : `${API_BASE_URL}/admin/users`;

        const method = userId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userData)
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
    }
    // Agregar más secciones aquí cuando se implementen
};

// Event listener para búsqueda de usuarios
document.addEventListener('DOMContentLoaded', () => {
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

    // Event listener para formulario de usuario
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }

    // Event listener para botón de agregar usuario
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openUserModal());
    }
});
