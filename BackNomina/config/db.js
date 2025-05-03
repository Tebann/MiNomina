const { Sequelize } = require('sequelize');
const path = require('path');

// Configurar la conexion a SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/minomina.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Funcion para probar la conexion
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a SQLite establecida correctamente.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };