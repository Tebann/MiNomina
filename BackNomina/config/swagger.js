const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mi Nómina API',
      version: '1.0.0',
      description: 'API para la gestión de ingresos, gastos y generación de cuentas de cobro',
      contact: {
        name: 'Soporte Mi Nómina',
        email: 'soporte@minomina.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;