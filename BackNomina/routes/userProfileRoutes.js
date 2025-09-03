/**
 * User Profile Routes
 *
 * Routes for user profile operations:
 * - GET /api/profile - Get user profile
 * - PUT /api/profile - Update user profile
 * - PUT /api/profile/password - Change user password
 * - POST /api/profile/logout - Logout user
 */

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  logoutUser
} = require('../controllers/userProfileController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Obtener perfil completo del usuario
 *     description: Obtiene toda la información del perfil del usuario autenticado, incluyendo campos extendidos
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token no válido"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Actualizar perfil completo del usuario
 *     description: Actualiza toda la información del perfil del usuario autenticado, incluyendo campos extendidos
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfileUpdate'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Nuevo token JWT con información actualizada
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado correctamente"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Datos inválidos"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profile/password:
 *   put:
 *     summary: Cambiar contraseña del usuario
 *     description: Permite cambiar la contraseña del usuario autenticado verificando la contraseña actual
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual del usuario
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada correctamente"
 *       400:
 *         description: Datos inválidos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Se requiere la contraseña actual y la nueva contraseña"
 *       401:
 *         description: Contraseña actual incorrecta o no autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Contraseña actual incorrecta"
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */

/**
 * @swagger
 * /api/profile/logout:
 *   post:
 *     summary: Cerrar sesión del usuario
 *     description: Cierra la sesión del usuario autenticado (operación del lado del cliente)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada correctamente"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

// All routes are protected with auth middleware
router.use(protect);

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/', updateUserProfile);

// Change password
router.put('/password', changePassword);

// Logout user
router.post('/logout', logoutUser);

module.exports = router;