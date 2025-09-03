require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { syncModels } = require('./connection/db/syncDB');
const { testConnection } = require('./connection/db/database');
const { applyPendingMigrations } = require('./migrations/migrationManager');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const workDayRoutes = require('./routes/workDayRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const workShiftRoutes = require('./routes/workShiftRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');

// Inicializar Express
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/workdays', workDayRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/workshifts', workShiftRoutes);
app.use('/api/profile', userProfileRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de MiNomina funcionando correctamente',
    version: '1.0.0',
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;

// Función para cargar todas las migraciones disponibles
const loadMigrations = () => {
  const migrationsDir = path.join(__dirname, './migrations');
  console.log('Loading migrations from:', migrationsDir);
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => 
      file.endsWith('.js') && 
      file !== 'migrationManager.js' && 
      file !== 'runMigrations.js'
    )
    .sort(); // Ordenar alfabéticamente para asegurar el orden correcto
  
  console.log('Found migration files:', migrationFiles);

  return migrationFiles.map(file => {
    const migrationPath = path.join(migrationsDir, file);
    console.log('Loading migration:', migrationPath);
    const migration = require(migrationPath);
    console.log('Loaded migration object:', migration);
    return migration;
  });
};

// Probar conexión, sincronizar modelos, aplicar migraciones e iniciar servidor
const startServer = async () => {
  try {
    // 1. Probar conexión a la base de datos
    const connected = await testConnection();
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Cerrando aplicación.');
      process.exit(1);
    }

    // 2. Sincronizar modelos
    await syncModels();

    // 3. Cargar y aplicar migraciones
    console.log('Iniciando proceso de migraciones...');
    const migrations = loadMigrations();
    console.log(`Se encontraron ${migrations.length} migraciones disponibles.`);
    await applyPendingMigrations(migrations);
    console.log('Proceso de migraciones completado.');

    // 4. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`Documentación API: http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    console.error('Error crítico durante la inicialización del servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;