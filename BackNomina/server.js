require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { syncModels } = require('./connection/db/syncDB');
const { testConnection } = require('./connection/db/database');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const workDayRoutes = require('./routes/workDayRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const workShiftRoutes = require('./routes/workShiftRoutes');

// Inicializar Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/workdays', workDayRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/workshifts', workShiftRoutes);

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

// Probar conexión y sincronizar modelos con la base de datos
testConnection().then(connected => {
  if (connected) {
    syncModels().then(() => {
      // Iniciar servidor
      app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en el puerto ${PORT}`);
        console.log(`Documentación API: http://localhost:${PORT}/api-docs`);
      });
    });
  } else {
    console.error('No se pudo conectar a la base de datos. Cerrando aplicación.');
    process.exit(1);
  }
});

module.exports = app;