const { sequelize, testConnection } = require('./db/database');
const { syncModels } = require('./db/syncDB');

module.exports = {
  sequelize,
  testConnection,
  syncModels
};