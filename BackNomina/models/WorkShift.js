const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const WorkShift = sequelize.define('WorkShift', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese el nombre de la jornada' }
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'El valor debe ser mayor a 0' },
      notEmpty: { msg: 'Por favor ingrese el valor de la jornada' }
    }
  },
  holidayMultiplier: {
    type: DataTypes.FLOAT,
    defaultValue: 1.75,
    validate: {
      min: { args: [1], msg: 'El multiplicador debe ser mayor o igual a 1' }
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
      fields: ['userId', 'name']
    }
  ]
});

// Establecer relación con User
WorkShift.belongsTo(User, { foreignKey: 'userId' });

module.exports = WorkShift;