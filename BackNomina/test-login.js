require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { User } = require('./models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de login simple
app.post('/login', async (req, res) => {
  try {
    console.log('Intento de login con:', req.body);
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    console.log('Usuario encontrado:', user ? user.email : 'No encontrado');

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Verificar contraseña
    console.log('Verificando contraseña...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña correcta?', isMatch);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    console.log('Login exitoso, generando token...');
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secreto123', {
      expiresIn: '30d',
    });
    console.log('Token generado');

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
});

// Puerto
const PORT = 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de prueba ejecutándose en el puerto ${PORT}`);
});