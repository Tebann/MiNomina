// Funciones de autenticación

// Elementos del DOM para login/registro
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('curriculum');
const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');

// Función para mostrar mensajes de error/éxito
function showAuthMessage(message, isError = false) {
  const messageEl = document.getElementById('authMessage');
  messageEl.textContent = message;
  messageEl.className = isError ? 'error-message' : 'success-message';
  messageEl.style.display = 'block';
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

// Función para mostrar el nombre del usuario logueado
function updateUserInfo(user) {
  if (user && userInfoEl) {
    userInfoEl.textContent = `Hola, ${user.name}!`;
  }
}

// Función para cambiar entre formularios de login y registro
function toggleAuthForm() {
  const loginContainer = document.getElementById('loginContainer');
  const registerContainer = document.getElementById('registerContainer');
  
  if (loginContainer.style.display === 'none') {
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
  } else {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
  }
}

// Función para verificar autenticación y mostrar la interfaz correspondiente
async function checkAuth() {
  // Verificar si hay un token en localStorage
  const userToken = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (userToken && userData) {
    try {
      // Mostrar la aplicación y ocultar formularios de auth
      if (authContainer) authContainer.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';
      
      // Actualizar información del usuario
      const user = JSON.parse(userData);
      updateUserInfo(user);
      return true;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Si hay error, limpiar token y redirigir a login
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      window.location.href = "login.html";
      return false;
    }
  } else {
    // Si no está autenticado, redirigir a login
    window.location.href = "login.html";
    return false;
  }
}

// Inicializar autenticación
function initAuth() {
  // Verificar autenticación al cargar
  checkAuth();
  
  // Configurar evento de login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        const response = await window.apiService.auth.login({ email, password });
        if (response.success) {
          showAuthMessage('Login exitoso');
          checkAuth();
        }
      } catch (error) {
        showAuthMessage(error.message || 'Error al iniciar sesión', true);
      }
    });
  }
  
  // Configurar evento de registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const identification = document.getElementById('registerIdentification').value;
      
      try {
        const response = await window.apiService.auth.register({
          name,
          email,
          password,
          identification
        });
        
        if (response.success) {
          showAuthMessage('Registro exitoso');
          checkAuth();
        }
      } catch (error) {
        showAuthMessage(error.message || 'Error al registrarse', true);
      }
    });
  }
  
  // Configurar evento de logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Limpiar token y datos de usuario
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Redirigir a login
      window.location.href = "login.html";
    });
  }
  
  // Configurar cambio entre formularios
  const toggleLoginBtn = document.getElementById('toggleLogin');
  const toggleRegisterBtn = document.getElementById('toggleRegister');
  
  if (toggleLoginBtn) {
    toggleLoginBtn.addEventListener('click', toggleAuthForm);
  }
  
  if (toggleRegisterBtn) {
    toggleRegisterBtn.addEventListener('click', toggleAuthForm);
  }
}

// Exportar funciones
window.authService = {
  init: initAuth,
  check: checkAuth,
};