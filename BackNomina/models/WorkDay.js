const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection/db/database');
const User = require('./User');

const WorkDay = sequelize.define('WorkDay', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese la fecha' }
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['medio', 'completo']],
        msg: 'El tipo debe ser medio o completo'
      },
      notEmpty: { msg: 'Por favor seleccione el tipo de jornada' }
    }
  },
  isHoliday: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El valor debe ser mayor o igual a 0' },
      notEmpty: { msg: 'Por favor ingrese el valor' }
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'date']
    }
  ]
});

// Establecer relación con User
WorkDay.belongsTo(User, { foreignKey: 'userId' });

module.exports = WorkDay;