document.addEventListener('DOMContentLoaded', function() {
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

    document.getElementById("loginForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("usuario").value;
        const password = document.getElementById("contrasena").value;
        const errorDiv = document.getElementById("loginError");

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
                    errorDiv.textContent = data.message || "Credenciales incorrectas.";
                }
            }
        } catch (err) {
            console.error(err);
            errorDiv.textContent = "Error de conexión con el servidor.";
        }
    });
});