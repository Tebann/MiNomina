document.addEventListener('DOMContentLoaded', function() {
    // Limpiar localStorage al cargar la página de login para evitar conflictos
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
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
    
    // Ya no necesitamos verificar si hay una sesión activa
    // porque limpiamos el localStorage al cargar la página

    // Configurar evento de login
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                // Usar el servicio de API para autenticar
                const response = await window.apiService.auth.login({ email, password });
                
                if (response.success) {
                    // Guardar datos del usuario en localStorage
                    localStorage.setItem('userData', JSON.stringify({
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        identification: response.data.identification,
                        companyName: response.data.companyName,
                        companyNit: response.data.companyNit,
                        companyCity: response.data.companyCity
                    }));
                    
                    showMessage("Inicio de sesión exitoso. Redirigiendo...", false);
                    
                    // Redirigir a index.html después de un breve retraso
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1500);
                }
            } catch (error) {
                showMessage(error.message || "Error al iniciar sesión. Verifica tus credenciales.", true);
            }
        });
    }
    
    // Configurar evento de registro
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const password = document.getElementById("registerPassword").value;
            const identification = document.getElementById("registerIdentification").value;

            try {
                // Usar el servicio de API para registrar
                const response = await window.apiService.auth.register({
                    name,
                    email,
                    password,
                    identification
                });
                
                if (response.success) {
                    showMessage("Registro exitoso. Ahora puedes iniciar sesión.", false);
                    
                    // Cambiar al formulario de login después de un breve retraso
                    setTimeout(() => {
                        toggleAuthForm();
                    }, 1500);
                }
            } catch (error) {
                showMessage(error.message || "Error al registrar usuario.", true);
            }
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