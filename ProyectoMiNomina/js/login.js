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
    if (window.apiService && window.apiService.isAuthenticated()) {
        // Verificar que el token sea válido antes de redirigir
        window.apiService.auth.getProfile()
            .then(response => {
                if (response.success) {
                    window.location.href = "index.html";
                } else {
                    // Si hay error en la respuesta, limpiar token
                    window.apiService.auth.logout();
                }
            })
            .catch(error => {
                console.error("Error al verificar perfil:", error);
                // Si hay error en la petición, limpiar token
                window.apiService.auth.logout();
            });
        return;
    }

    // Configurar evento de login
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                // Usar el servicio de API si está disponible
                if (window.apiService) {
                    const response = await window.apiService.auth.login({ email, password });
                    
                    if (response.success) {
                        // Guardar datos de usuario en localStorage
                        localStorage.setItem('userData', JSON.stringify({
                            id: response.data.id,
                            name: response.data.name,
                            email: response.data.email,
                            identification: response.data.identification,
                            companyName: response.data.companyName,
                            companyNit: response.data.companyNit,
                            companyCity: response.data.companyCity
                        }));
                        
                        // Login exitoso: redirigir a index.html
                        window.location.href = "index.html";
                    } else {
                        showMessage(response.message || "Credenciales incorrectas.", true);
                    }
                } else {
                    // Fallback si el servicio de API no está disponible
                    const response = await fetch("http://localhost:3000/api/users/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        // Guardar token y datos de usuario en localStorage
                        localStorage.setItem('userToken', data.data.token);
                        localStorage.setItem('userData', JSON.stringify({
                            id: data.data.id,
                            name: data.data.name,
                            email: data.data.email,
                            identification: data.data.identification,
                            companyName: data.data.companyName,
                            companyNit: data.data.companyNit,
                            companyCity: data.data.companyCity
                        }));
                        
                        // Login exitoso: redirigir a index.html
                        window.location.href = "index.html";
                    } else {
                        showMessage(data.message || "Credenciales incorrectas.", true);
                    }
                }
            } catch (err) {
                console.error(err);
                showMessage("Error de conexión con el servidor.", true);
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
                // Usar el servicio de API
                if (window.apiService) {
                    const response = await window.apiService.auth.register({
                        name,
                        email,
                        password,
                        identification
                    });
                    
                    if (response.success) {
                        showMessage("Registro exitoso. Ahora puedes iniciar sesión.", false);
                        // Cambiar al formulario de login
                        toggleAuthForm();
                    } else {
                        showMessage(response.message || "Error al registrarse.", true);
                    }
                } else {
                    // Fallback si el servicio de API no está disponible
                    const response = await fetch("http://localhost:3000/api/users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ 
                            name, 
                            email, 
                            password, 
                            identification 
                        })
                    });

                    const data = await response.json();

                    if (response.ok && data.success) {
                        showMessage("Registro exitoso. Ahora puedes iniciar sesión.", false);
                        // Cambiar al formulario de login
                        toggleAuthForm();
                    } else {
                        showMessage(data.message || "Error al registrarse.", true);
                    }
                }
            } catch (err) {
                console.error(err);
                showMessage("Error de conexión con el servidor.", true);
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
});