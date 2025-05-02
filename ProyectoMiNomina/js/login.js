document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;
    const errorDiv = document.getElementById("loginError");

    try {
        const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, contrasena }),
        credentials: "include"
    });

    if (response.ok) {
        // Login exitoso: redirigir a index.html
        window.location.href = "index.html";
    } else {
        const error = await response.text();
        errorDiv.textContent = error || "Credenciales incorrectas.";
    }
    } catch (err) {

    console.error(err);
    errorDiv.textContent = "Error de conexión con el servidor.";
    }
});