const User = require('./User');
const WorkDay = require('./WorkDay');
const Expense = require('./Expense');
const WorkShift = require('./WorkShift');
const { syncModels } = require('../connection/db/syncDB');

// Definir relaciones
User.hasMany(WorkDay, { foreignKey: 'userId' });
User.hasMany(Expense, { foreignKey: 'userId' });
User.hasMany(WorkShift, { foreignKey: 'userId' });

module.exports = {
  User,
  WorkDay,
  Expense,
  WorkShift,
  syncModels
};