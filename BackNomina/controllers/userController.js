const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, identification } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe',
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      identification,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        companyName: user.companyName,
        companyNit: user.companyNit,
        companyCity: user.companyCity,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// @desc    Autenticar usuario y obtener token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        companyName: user.companyName,
        companyNit: user.companyNit,
        companyCity: user.companyCity,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

// @desc    Obtener perfil de usuario
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        companyName: user.companyName,
        companyNit: user.companyNit,
        companyCity: user.companyCity,
        signature: user.signature,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar campos
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.identification = req.body.identification || user.identification;
    
    if (req.body.company) {
      user.companyName = req.body.company.name || user.companyName;
      user.companyNit = req.body.company.nit || user.companyNit;
      user.companyCity = req.body.company.city || user.companyCity;
    }
    
    user.signature = req.body.signature || user.signature;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        identification: user.identification,
        company: {
          name: user.companyName,
          nit: user.companyNit,
          city: user.companyCity,
        },
        signature: user.signature,
        token: generateToken(user.id),
      },
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', '),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};