const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos SQLite
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/minomina.sqlite');

// Crear instancia de Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    freezeTableName: false,
    timestamps: true
  }
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a SQLite establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};