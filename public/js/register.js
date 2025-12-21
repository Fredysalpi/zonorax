const API_BASE_URL = '/api';
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const registerBtn = document.getElementById('register-btn');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpiar mensajes
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    successMessage.style.display = 'none';

    const username = document.getElementById('username').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    // Validaciones
    if (password !== passwordConfirm) {
        showError('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (!validateEmail(email)) {
        showError('Por favor ingresa un email válido');
        return;
    }

    if (!validatePhone(phone)) {
        showError('El teléfono debe tener exactamente 9 dígitos');
        return;
    }

    // Deshabilitar botón
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creando cuenta...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                first_name: firstName,
                last_name: lastName,
                phone,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al crear la cuenta');
        }

        // Mostrar mensaje de éxito
        successMessage.innerHTML = `
            <strong>¡Cuenta creada exitosamente!</strong><br>
            Usuario: ${username}<br>
            Nombre: ${firstName} ${lastName}<br>
            Email: ${email}<br>
            Teléfono: ${phone}<br><br>
            Redirigiendo al login...
        `;
        successMessage.style.display = 'block';

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);

    } catch (error) {
        showError(error.message);
        registerBtn.disabled = false;
        registerBtn.textContent = 'Crear Cuenta';
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9]{9}$/;
    return re.test(phone);
}

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
            // Ya está autenticado, redirigir
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
