/**
 * User Profile Controller
 * 
 * Handles operations related to user profiles:
 * - Getting user profile information
 * - Updating user profile
 * - Logging out users
 */

const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

/**
 * Get user profile information
 * @route GET /api/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Fields that can be updated
    const {
      name,
      fullName,
      company,
      rut,
      companyEmail,
      position,
      identification,
      companyName,
      companyNit,
      companyCity,
      signature,
      password
    } = req.body;

    // Update basic fields if provided
    if (name) user.name = name;
    if (fullName) user.fullName = fullName;
    if (company) user.company = company;
    if (rut) user.rut = rut;
    if (companyEmail) user.companyEmail = companyEmail;
    if (position) user.position = position;
    if (identification) user.identification = identification;
    if (companyName) user.companyName = companyName;
    if (companyNit) user.companyNit = companyNit;
    if (companyCity) user.companyCity = companyCity;
    if (signature) user.signature = signature;

    // If password is provided, it will be hashed by the model hooks
    if (password) {
      user.password = password;
    }

    // Save the updated user
    await user.save();

    // Generate a new token with updated user info
    const token = generateToken(user.id);

    // Return updated user (excluding password)
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        token
      },
      message: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil de usuario',
      error: error.message
    });
  }
};

/**
 * Change user password
 * @route PUT /api/profile/password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere la contraseña actual y la nueva contraseña'
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

/**
 * Logout user
 * @route POST /api/profile/logout
 * @access Private
 */
const logoutUser = async (req, res) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will remove the token from storage
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  logoutUser
};