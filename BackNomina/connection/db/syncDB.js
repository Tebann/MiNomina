const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');

// Asegurarse de que el directorio de datos exista
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Directorio de datos creado:', dataDir);
  }
};

// Sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    // Asegurar que el directorio de datos exista
    ensureDataDir();
    
    // Sincronizar modelos
    await sequelize.sync();
    console.log('Base de datos sincronizada correctamente');
    return true;
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    return false;
  }
};

module.exports = {
  syncModels
};