# Mi Nómina - Proyecto de Gestión de Ingresos y Gastos

Bienvenido al proyecto **Mi Nómina**, una aplicación web que te permite registrar y gestionar tus días trabajados, gastos mensuales y generar cuentas de cobro en formato PDF de manera automática.

Este README documenta toda la estructura, funcionamiento, tecnologías utilizadas y guía de uso.

---

## ✨ Características principales

- **Autenticación de usuarios**: Registro e inicio de sesión de usuarios con JWT.
- **Registrar días trabajados**: Guarda la fecha, tipo de jornada (medio tiempo o tiempo completo) y si fue un día festivo.
- **Registrar gastos del mes**: Guarda gastos con concepto, valor y etiqueta (Fijo, Imprevisto, Personal).
- **Gastos recurrentes**: Los gastos fijos pueden marcarse como recurrentes para generarse automáticamente cada mes.
- **Visualizar calendario del mes**: Muestra los días trabajados resaltados.
- **Listado de días trabajados recientes**: Visualiza días trabajados ordenados, con formato amigable.
- **Listado de gastos recientes**: Visualiza los gastos registrados por mes y filtrados por etiqueta.
- **Resumen mensual**:
  - Total ingresos.
  - Total gastos (general y por etiqueta).
  - Balance neto.
- **Generar Cuenta de Cobro (PDF)**: Genera automáticamente un documento PDF formal basado en los ingresos mensuales.

---

## 🛠️ Tecnologías utilizadas

### Frontend
- **HTML5** y **CSS3**: Estructura y estilo.
- **JavaScript (ES6+)**: Lógica y dinámica.
- **jsPDF**: Generación de documentos PDF en el navegador.

### Backend
- **Node.js** y **Express**: Servidor y API REST.
- **SQLite**: Base de datos relacional ligera.
- **Sequelize**: ORM para interactuar con la base de datos.
- **JWT**: Autenticación basada en tokens.
- **Swagger**: Documentación de la API.
- **bcryptjs**: Encriptación de contraseñas.

---

## 📂 Estructura del proyecto

```
/ (raíz del proyecto)
├── BackNomina/                # Backend de la aplicación
│   ├── config/                # Configuraciones
│   ├── connection/            # Conexión a la base de datos
│   ├── controllers/           # Controladores de la API
│   ├── data/                  # Datos de la aplicación (SQLite)
│   ├── middlewares/           # Middlewares (autenticación, errores)
│   ├── models/                # Modelos de datos (Sequelize)
│   ├── routes/                # Rutas de la API
│   ├── utils/                 # Utilidades
│   ├── .env                   # Variables de entorno
│   ├── package.json           # Dependencias del backend
│   └── server.js              # Punto de entrada del servidor
├── ProyectoMiNomina/          # Frontend de la aplicación
│   ├── css/                   # Estilos CSS
│   ├── js/                    # Scripts JavaScript
│   │   ├── api.js             # Servicios de API
│   │   ├── app.js             # Lógica principal
│   │   └── login.js           # Lógica de autenticación
│   ├── index.html             # Página principal
│   └── login.html             # Página de inicio de sesión
└── README.md                  # Documentación del proyecto
```

## 🚀 Instalación y ejecución

### Requisitos previos
- Node.js (v14 o superior)
- npm (v6 o superior)

### Pasos para ejecutar el proyecto

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Tebann/MiNomina.git
   cd MiNomina
   ```

2. **Configurar el backend**
   ```bash
   cd BackNomina
   npm install
   ```

3. **Iniciar el servidor backend**
   ```bash
   npm start
   ```
   El servidor se ejecutará en http://localhost:3000

4. **Abrir el frontend**
   - Abre el archivo `ProyectoMiNomina/login.html` en tu navegador
   - O utiliza un servidor local como Live Server de VS Code

### Modo Demo

La aplicación incluye un modo demo que permite utilizarla sin necesidad de ejecutar el backend:

1. Simplemente abre el archivo `ProyectoMiNomina/login.html` en tu navegador
2. Utiliza las credenciales de demo:
   - Email: `demo@example.com`
   - Contraseña: `demo123`
3. También puedes registrar un nuevo usuario que se guardará localmente

En modo demo, todos los datos se almacenan en el localStorage del navegador, permitiendo probar todas las funcionalidades sin necesidad de configurar el backend.

---

## 🧠 Detalles técnicos importantes

### Autenticación
- Sistema basado en JWT (JSON Web Tokens).
- Tokens almacenados en localStorage.
- Middleware de protección para rutas privadas.

### Gastos
- Clasificados por etiquetas: Fijo, Imprevisto, Personal.
- Los gastos fijos pueden marcarse como recurrentes.
- Generación automática de gastos recurrentes para cada mes.

### Días trabajados
- Soporte para diferentes tipos de jornada.
- Cálculo de ingresos basado en el tipo de jornada y si es día festivo.

### API REST
- Documentación completa con Swagger en `/api-docs`.
- Respuestas estandarizadas con formato JSON.
- Manejo de errores centralizado.

---

## 📝 API Endpoints

### Usuarios
- `POST /api/users` - Registrar un nuevo usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/profile` - Obtener perfil de usuario
- `PUT /api/users/profile` - Actualizar perfil de usuario

### Días trabajados
- `GET /api/workdays` - Obtener días trabajados
- `POST /api/workdays` - Crear un día trabajado
- `DELETE /api/workdays/:id` - Eliminar un día trabajado
- `GET /api/workdays/summary` - Obtener resumen de ingresos

### Gastos
- `GET /api/expenses` - Obtener gastos
- `POST /api/expenses` - Crear un gasto
- `DELETE /api/expenses/:id` - Eliminar un gasto
- `GET /api/expenses/summary` - Obtener resumen de gastos
- `POST /api/expenses/generate-recurring` - Generar gastos recurrentes

### Jornadas de trabajo
- `GET /api/workshifts` - Obtener jornadas de trabajo
- `POST /api/workshifts` - Crear una jornada de trabajo
- `PUT /api/workshifts/:id` - Actualizar una jornada de trabajo
- `DELETE /api/workshifts/:id` - Eliminar una jornada de trabajo

---

## 🧑‍💻 Autor y créditos

Proyecto desarrollado con dedicación para aprender y practicar desarrollo full-stack, autenticación, bases de datos relacionales y buenas prácticas de organización de aplicaciones web.

¡Gracias por usar **Mi Nómina**!

---
