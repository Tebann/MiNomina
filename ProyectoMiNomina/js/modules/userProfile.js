/**
 * User Profile Module
 * 
 * Handles all functionality related to the user profile page:
 * - Loading profile data
 * - Updating profile information
 * - Changing password
 * - Handling form interactions
 */

// DOM Elements
let elements = {};

// Current user data
let userData = null;

// Initialize the module
function init() {
  // Only initialize on profile page
  if (!document.querySelector('.profile-container')) {
    return;
  }

  // Cache DOM elements
  cacheElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load user profile data
  loadUserProfile();
}

// Cache all DOM elements
function cacheElements() {
  // Personal data elements
  elements.datosPersonalesView = document.getElementById('datosPersonalesView');
  elements.formDatosPersonales = document.getElementById('formDatosPersonales');
  elements.btnEditarPersonales = document.getElementById('btnEditarPersonales');
  elements.btnGuardarPersonales = document.getElementById('btnGuardarPersonales');
  elements.btnCancelarPersonales = document.getElementById('btnCancelarPersonales');
  
  // Company data elements
  elements.datosEmpresaView = document.getElementById('datosEmpresaView');
  elements.formDatosEmpresa = document.getElementById('formDatosEmpresa');
  elements.btnEditarEmpresa = document.getElementById('btnEditarEmpresa');
  elements.btnGuardarEmpresa = document.getElementById('btnGuardarEmpresa');
  elements.btnCancelarEmpresa = document.getElementById('btnCancelarEmpresa');
  
  // Password elements
  elements.datosContrasenaView = document.getElementById('datosContrasenaView');
  elements.formCambiarContrasena = document.getElementById('formCambiarContrasena');
  elements.btnEditarContrasena = document.getElementById('btnEditarContrasena');
  elements.btnGuardarContrasena = document.getElementById('btnGuardarContrasena');
  elements.btnCancelarContrasena = document.getElementById('btnCancelarContrasena');
  
  // Signature elements
  elements.firmaView = document.getElementById('firmaView');
  elements.firmaEdit = document.getElementById('firmaEdit');
  elements.btnEditarFirma = document.getElementById('btnEditarFirma');
  elements.btnGuardarFirma = document.getElementById('btnGuardarFirma');
  elements.btnCancelarFirma = document.getElementById('btnCancelarFirma');
  
  // Form inputs - Personal data
  elements.inputNombreCompleto = document.getElementById('nombreCompleto');
  elements.inputNombrePersonalizado = document.getElementById('nombrePersonalizado');
  elements.inputIdentificacion = document.getElementById('identificacion');
  elements.inputCorreo = document.getElementById('correo');
  
  // Form inputs - Company data
  elements.inputNombreEmpresa = document.getElementById('nombreEmpresa');
  elements.inputNitEmpresa = document.getElementById('nitEmpresa');
  
  // Form inputs - Password
  elements.inputContrasenaActual = document.getElementById('contrasenaActual');
  elements.inputNuevaContrasena = document.getElementById('nuevaContrasena');
  elements.inputConfirmarContrasena = document.getElementById('confirmarContrasena');
  
  // Form inputs - Signature
  elements.inputFirmaArchivo = document.getElementById('firmaArchivo');
  
  // View elements
  elements.nombreCompletoView = document.getElementById('nombreCompletoView');
  elements.nombrePersonalizadoView = document.getElementById('nombrePersonalizadoView');
  elements.identificacionView = document.getElementById('identificacionView');
  elements.correoView = document.getElementById('correoView');
  elements.nombreEmpresaView = document.getElementById('nombreEmpresaView');
  elements.nitEmpresaView = document.getElementById('nitEmpresaView');
  elements.firmaImagenView = document.getElementById('firmaImagenView');
  elements.firmaImagen = document.getElementById('firmaImagen');
  elements.firmaNota = document.getElementById('firmaNota');
  
  // Navigation
  elements.btnVolver = document.getElementById('btnVolver');
  elements.logoutBtn = document.getElementById('logoutBtn');
  
  // Modal
  elements.modalOverlay = document.getElementById('modalOverlay');
  elements.modalText = document.getElementById('modalText');
  elements.modalYes = document.getElementById('modalYes');
  elements.modalNo = document.getElementById('modalNo');
}

// Set up all event listeners
function setupEventListeners() {
  // Personal data form
  elements.btnEditarPersonales.addEventListener('click', () => toggleEditMode('Personales', true));
  elements.btnGuardarPersonales.addEventListener('click', savePersonalData);
  elements.btnCancelarPersonales.addEventListener('click', () => toggleEditMode('Personales', false));
  
  // Company data form
  elements.btnEditarEmpresa.addEventListener('click', () => toggleEditMode('Empresa', true));
  elements.btnGuardarEmpresa.addEventListener('click', saveCompanyData);
  elements.btnCancelarEmpresa.addEventListener('click', () => toggleEditMode('Empresa', false));
  
  // Password form
  elements.btnEditarContrasena.addEventListener('click', () => toggleEditMode('Contrasena', true));
  elements.btnGuardarContrasena.addEventListener('click', savePassword);
  elements.btnCancelarContrasena.addEventListener('click', () => toggleEditMode('Contrasena', false));
  
  // Signature form
  elements.btnEditarFirma.addEventListener('click', () => toggleEditMode('Firma', true));
  elements.btnGuardarFirma.addEventListener('click', saveSignature);
  elements.btnCancelarFirma.addEventListener('click', () => toggleEditMode('Firma', false));
  
  // Signature file input
  if (elements.inputFirmaArchivo) {
    elements.inputFirmaArchivo.addEventListener('change', handleSignatureFileSelect);
  }
  
  // Navigation
  if (elements.btnVolver) {
    elements.btnVolver.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  
  // Logout
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', logout);
  }
  
  // Password visibility toggles
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
  });
  
  // Modal buttons
  if (elements.modalYes) {
    elements.modalYes.addEventListener('click', () => {
      elements.modalOverlay.style.display = 'none';
      if (elements.modalOverlay.dataset.action === 'logout') {
        logout();
      }
    });
  }
  
  if (elements.modalNo) {
    elements.modalNo.addEventListener('click', () => {
      elements.modalOverlay.style.display = 'none';
    });
  }
}

// Load user profile data from API
async function loadUserProfile() {
  try {
    const response = await window.apiService.auth.getProfile();
    
    if (response.success) {
      userData = response.data;
      
      // Update view with user data
      updateProfileView(userData);
      
      // Fill form fields with user data
      fillFormFields(userData);
    }
  } catch (error) {
    console.error('Error al cargar perfil de usuario:', error);
    showNotification('Error al cargar datos del perfil', true);
  }
}

// Update profile view with user data
function updateProfileView(user) {
  // Personal data
  elements.nombreCompletoView.textContent = user.fullName || user.name || '-';
  elements.nombrePersonalizadoView.textContent = user.name || '-';
  elements.identificacionView.textContent = user.identification || '-';
  elements.correoView.textContent = user.email || '-';
  
  // Company data
  elements.nombreEmpresaView.textContent = user.company || user.companyName || '-';
  elements.nitEmpresaView.textContent = user.rut || user.companyNit || '-';
  
  // Signature
  if (user.signature) {
    elements.firmaImagenView.src = user.signature;
    elements.firmaNota.textContent = 'Firma digital cargada correctamente.';
  } else {
    elements.firmaImagenView.src = 'images/placeholder-signature.png';
    elements.firmaNota.textContent = 'No has cargado ninguna firma aún. Haz clic en "Editar" para añadir tu firma.';
  }
  
  // Update user info in header
  const userInfoEl = document.getElementById('userInfo');
  if (userInfoEl) {
    userInfoEl.textContent = `Hola, ${user.name}!`;
  }
}

// Fill form fields with user data
function fillFormFields(user) {
  // Personal data
  elements.inputNombreCompleto.value = user.fullName || '';
  elements.inputNombrePersonalizado.value = user.name || '';
  elements.inputIdentificacion.value = user.identification || '';
  elements.inputCorreo.value = user.email || '';
  
  // Company data
  elements.inputNombreEmpresa.value = user.company || user.companyName || '';
  elements.inputNitEmpresa.value = user.rut || user.companyNit || '';
  
  // Signature
  if (user.signature) {
    elements.firmaImagen.src = user.signature;
  }
}

// Toggle edit mode for a section
function toggleEditMode(section, isEdit) {
  const viewEl = elements[`datos${section}View`];
  const formEl = section === 'Firma' ? elements.firmaEdit : elements[`formDatos${section}`];
  const editBtn = elements[`btnEditar${section}`];
  const saveBtn = elements[`btnGuardar${section}`];
  const cancelBtn = elements[`btnCancelar${section}`];
  
  if (isEdit) {
    // Switch to edit mode
    viewEl.style.display = 'none';
    formEl.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    
    // If it's the password section, clear the fields
    if (section === 'Contrasena') {
      elements.inputContrasenaActual.value = '';
      elements.inputNuevaContrasena.value = '';
      elements.inputConfirmarContrasena.value = '';
    }
  } else {
    // Switch to view mode
    viewEl.style.display = 'block';
    formEl.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // If cancelling, reset form values to current user data
    if (userData) {
      fillFormFields(userData);
    }
  }
}

// Save personal data
async function savePersonalData() {
  try {
    const updatedData = {
      fullName: elements.inputNombreCompleto.value,
      name: elements.inputNombrePersonalizado.value,
      identification: elements.inputIdentificacion.value
    };
    
    const response = await window.apiService.auth.updateProfile(updatedData);
    
    if (response.success) {
      // Update local user data
      userData = response.data.user;
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update token if provided
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      
      // Update view
      updateProfileView(userData);
      
      // Switch back to view mode
      toggleEditMode('Personales', false);
      
      // Show success message
      showNotification('Datos personales actualizados correctamente');
    }
  } catch (error) {
    console.error('Error al guardar datos personales:', error);
    showNotification('Error al guardar datos personales', true);
  }
}

// Save company data
async function saveCompanyData() {
  try {
    const updatedData = {
      company: elements.inputNombreEmpresa.value,
      rut: elements.inputNitEmpresa.value
    };
    
    const response = await window.apiService.auth.updateProfile(updatedData);
    
    if (response.success) {
      // Update local user data
      userData = response.data.user;
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update token if provided
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      
      // Update view
      updateProfileView(userData);
      
      // Switch back to view mode
      toggleEditMode('Empresa', false);
      
      // Show success message
      showNotification('Datos de empresa actualizados correctamente');
    }
  } catch (error) {
    console.error('Error al guardar datos de empresa:', error);
    showNotification('Error al guardar datos de empresa', true);
  }
}

// Save password
async function savePassword() {
  try {
    const currentPassword = elements.inputContrasenaActual.value;
    const newPassword = elements.inputNuevaContrasena.value;
    const confirmPassword = elements.inputConfirmarContrasena.value;
    
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showNotification('Por favor complete todos los campos', true);
    }
    
    if (newPassword !== confirmPassword) {
      return showNotification('Las contraseñas no coinciden', true);
    }
    
    if (newPassword.length < 6) {
      return showNotification('La contraseña debe tener al menos 6 caracteres', true);
    }
    
    // Send request to API
    const response = await fetch(`${API_URL}/profile/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Switch back to view mode
      toggleEditMode('Contrasena', false);
      
      // Show success message
      showNotification('Contraseña actualizada correctamente');
    } else {
      showNotification(data.message || 'Error al actualizar contraseña', true);
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    showNotification('Error al cambiar contraseña', true);
  }
}

// Handle signature file selection
function handleSignatureFileSelect(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.match('image/png')) {
    showNotification('Por favor seleccione una imagen PNG', true);
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('La imagen no debe superar los 2MB', true);
    return;
  }
  
  // Read file and show preview
  const reader = new FileReader();
  reader.onload = function(e) {
    elements.firmaImagen.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Save signature
async function saveSignature() {
  try {
    // Get base64 data from image
    const signatureData = elements.firmaImagen.src;
    
    // Only save if it's not the placeholder
    if (signatureData.includes('placeholder-signature.png')) {
      showNotification('Por favor seleccione una imagen para su firma', true);
      return;
    }
    
    const response = await window.apiService.auth.updateProfile({
      signature: signatureData
    });
    
    if (response.success) {
      // Update local user data
      userData = response.data.user;
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update token if provided
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
      }
      
      // Update view
      updateProfileView(userData);
      
      // Switch back to view mode
      toggleEditMode('Firma', false);
      
      // Show success message
      showNotification('Firma actualizada correctamente');
    }
  } catch (error) {
    console.error('Error al guardar firma:', error);
    showNotification('Error al guardar firma', true);
  }
}

// Toggle password visibility
function togglePasswordVisibility(event) {
  const button = event.currentTarget;
  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);
  
  if (input.type === 'password') {
    input.type = 'text';
    button.querySelector('img').src = 'images/eye-slash.svg';
  } else {
    input.type = 'password';
    button.querySelector('img').src = 'images/eye.svg';
  }
}

// Logout user
async function logout() {
  try {
    // Call logout API
    await fetch(`${API_URL}/profile/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
      }
    });
    
    // Clear local storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    // Redirect to login page
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    
    // Even if there's an error, clear local storage and redirect
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
  }
}

// Show confirmation modal
function showConfirmation(message, action) {
  elements.modalText.textContent = message;
  elements.modalOverlay.dataset.action = action;
  elements.modalOverlay.style.display = 'flex';
}

// Show notification
function showNotification(message, isError = false) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set message and style
  notification.textContent = message;
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  
  // Show notification
  notification.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Get API URL from apiService
const API_URL = 'http://localhost:3000/api';

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

// Export module
window.userProfileModule = {
  init,
  loadUserProfile,
  logout
};