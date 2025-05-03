const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection/db/database');
const User = require('./User');

const Expense = sequelize.define('Expense', {
  concept: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese el concepto' }
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'El valor debe ser mayor a 0' },
      notEmpty: { msg: 'Por favor ingrese el valor' }
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  tag: {
    type: DataTypes.ENUM('Fijo', 'Imprevisto', 'Personal'),
    allowNull: false,
    defaultValue: 'Personal',
    validate: {
      isIn: {
        args: [['Fijo', 'Imprevisto', 'Personal']],
        msg: 'La etiqueta debe ser Fijo, Imprevisto o Personal'
      }
    }
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si el gasto se repite mensualmente (solo para gastos fijos)'
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
  timestamps: true
});

// Establecer relación con User
Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = Expense;