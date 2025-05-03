document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginContainer = document.getElementById('loginContainer');
    const registerContainer = document.getElementById('registerContainer');
    const toggleLoginBtn = document.getElementById('toggleLogin');
    const toggleRegisterBtn = document.getElementById('toggleRegister');
    const errorDiv = document.getElementById('loginError');
    
    // Función para mostrar mensajes
    function showMessage(message, isError = false) {
        const messageEl = document.getElementById('authMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isError ? 'error-message' : 'success-message';
            messageEl.style.display = 'block';
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        } else if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            errorDiv.className = isError ? 'error-message' : 'success-message';
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Función para cambiar entre formularios
    function toggleAuthForm() {
        if (loginContainer.style.display === 'none') {
            loginContainer.style.display = 'block';
            registerContainer.style.display = 'none';
        } else {
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
        }
    }
    
    // Verificar si ya hay una sesión activa
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        // Redirigir a index.html
        window.location.href = "index.html";
        return;
    }

    // Configurar evento de login
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            // MODO DEMO: Aceptar cualquier email/contraseña para demostración
            // En un entorno real, esto se conectaría al backend
            
            // Crear un token de demostración
            const demoToken = "demo_token_" + Date.now();
            
            // Guardar token y datos de usuario en localStorage
            localStorage.setItem('userToken', demoToken);
            localStorage.setItem('userData', JSON.stringify({
                id: 1,
                name: "Usuario Demo",
                email: email,
                identification: "12345678",
                companyName: "Empresa Demo",
                companyNit: "123456789",
                companyCity: "Ciudad Demo"
            }));
            
            showMessage("Login exitoso. Redirigiendo...", false);
            
            // Redirigir a index.html después de un breve retraso
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }
    
    // Configurar evento de registro
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const identification = document.getElementById("registerIdentification").value;

            // MODO DEMO: Simular registro exitoso
            showMessage("Registro exitoso. Ahora puedes iniciar sesión.", false);
            
            // Cambiar al formulario de login después de un breve retraso
            setTimeout(() => {
                toggleAuthForm();
            }, 1500);
        });
    }
    
    // Configurar cambio entre formularios
    if (toggleLoginBtn) {
        toggleLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthForm();
        });
    }
    
    if (toggleRegisterBtn) {
        toggleRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthForm();
        });
    }
    
    // Inicializar la visualización de los formularios
    if (loginContainer && registerContainer) {
        loginContainer.style.display = 'block';
        registerContainer.style.display = 'none';
    }
});