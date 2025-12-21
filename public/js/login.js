const API_BASE_URL = '/api';
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al iniciar sesión');
        }

        const data = await response.json();

        // Guardar token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        // Redirigir según el rol
        if (data.user.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/';
        }

    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Verificar si ya está autenticado
const authToken = localStorage.getItem('authToken');
if (authToken) {
    fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Token inválido');
        })
        .then(data => {
            if (data.user.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/';
            }
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        });
}
