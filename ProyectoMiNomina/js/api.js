// API Service para conectar con el backend
const API_URL = 'http://localhost:3000/api';

// Para pruebas locales con archivos HTML
if (window.location.protocol === 'file:') {
  console.log('Ejecutando en modo local (file://), usando API en localhost');
}

// Almacenamiento del token
let authToken = localStorage.getItem('userToken') || null;

// Función para establecer el token
const setToken = (token) => {
  authToken = token;
  localStorage.setItem('userToken', token);
};

// Función para limpiar el token (logout)
const clearToken = () => {
  authToken = null;
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  
  // Redirigir a la página de login después de logout
  if (window.location.pathname !== '/login.html') {
    window.location.href = 'login.html';
  }
};

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  return !!authToken;
};

// Función para realizar peticiones HTTP
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Configuración por defecto
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Si hay token, añadirlo a los headers
  if (authToken) {
    defaultOptions.headers.Authorization = `Bearer ${authToken}`;
  }
  
  // Combinar opciones
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
};

// Servicios de autenticación
const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await fetchAPI('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      setToken(response.data.token);
    }
    
    return response;
  },
  
  // Login de usuario
  login: async (credentials) => {
    const response = await fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      setToken(response.data.token);
    }
    
    return response;
  },
  
  // Obtener perfil de usuario
  getProfile: async () => {
    return await fetchAPI('/users/profile');
  },
  
  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    return await fetchAPI('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  // Logout
  logout: () => {
    clearToken();
  },
};

// Servicios de días trabajados
const workDayService = {
  // Obtener días trabajados
  getWorkDays: async (year, month) => {
    let endpoint = '/workdays';
    
    // Si hay año y mes, añadir como query params
    if (year && month) {
      endpoint += `?year=${year}&month=${month}`;
    }
    
    return await fetchAPI(endpoint);
  },
  
  // Crear día trabajado
  createWorkDay: async (workDayData) => {
    return await fetchAPI('/workdays', {
      method: 'POST',
      body: JSON.stringify(workDayData),
    });
  },
  
  // Eliminar día trabajado
  deleteWorkDay: async (id) => {
    return await fetchAPI(`/workdays/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Obtener resumen de ingresos
  getWorkDaysSummary: async (year, month) => {
    return await fetchAPI(`/workdays/summary?year=${year}&month=${month}`);
  },
};

// Servicios de gastos
const expenseService = {
  // Obtener gastos
  getExpenses: async (year, month, tag) => {
    let endpoint = '/expenses';
    const params = [];
    
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (tag) params.push(`tag=${tag}`);
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    return await fetchAPI(endpoint);
  },
  
  // Crear gasto
  createExpense: async (expenseData) => {
    return await fetchAPI('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },
  
  // Eliminar gasto
  deleteExpense: async (id) => {
    return await fetchAPI(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
  
  // Obtener resumen de gastos
  getExpensesSummary: async (year, month) => {
    return await fetchAPI(`/expenses/summary?year=${year}&month=${month}`);
  },
  
  // Generar gastos recurrentes
  generateRecurringExpenses: async (year, month) => {
    return await fetchAPI('/expenses/generate-recurring', {
      method: 'POST',
      body: JSON.stringify({ year, month }),
    });
  },
};

// Exportar servicios
window.apiService = {
  auth: authService,
  workDay: workDayService,
  expense: expenseService,
  isAuthenticated,
};