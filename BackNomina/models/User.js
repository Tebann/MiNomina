const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese su nombre' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Por favor ingrese un email válido' },
      notEmpty: { msg: 'Por favor ingrese su email' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [6, 100], msg: 'La contraseña debe tener al menos 6 caracteres' },
      notEmpty: { msg: 'Por favor ingrese una contraseña' }
    }
  },
  identification: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Por favor ingrese su número de identificación' }
    }
  },
  companyName: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  companyNit: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  companyCity: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  signature: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para comparar contraseñas
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;