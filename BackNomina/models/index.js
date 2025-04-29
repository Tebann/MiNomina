const User = require('./User');
const WorkDay = require('./WorkDay');
const Expense = require('./Expense');
const WorkShift = require('./WorkShift');
const { sequelize } = require('../config/db');

// Definir relaciones
User.hasMany(WorkDay, { foreignKey: 'userId' });
User.hasMany(Expense, { foreignKey: 'userId' });
User.hasMany(WorkShift, { foreignKey: 'userId' });

// Función para sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  }
};

module.exports = {
  User,
  WorkDay,
  Expense,
  WorkShift,
  syncModels
};