const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - identification
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (único)
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (mínimo 6 caracteres)
 *         identification:
 *           type: string
 *           description: Número de identificación del usuario
 *         companyName:
 *           type: string
 *           description: Nombre de la empresa para la cuenta de cobro
 *         companyNit:
 *           type: string
 *           description: NIT de la empresa para la cuenta de cobro
 *         companyCity:
 *           type: string
 *           description: Ciudad de la empresa para la cuenta de cobro
 *         signature:
 *           type: string
 *           description: URL o base64 de la firma del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del registro
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         identification:
 *           type: string
 *           description: Número de identificación del usuario
 *         companyName:
 *           type: string
 *           description: Nombre de la empresa para la cuenta de cobro
 *         companyNit:
 *           type: string
 *           description: NIT de la empresa para la cuenta de cobro
 *         companyCity:
 *           type: string
 *           description: Ciudad de la empresa para la cuenta de cobro
 *         signature:
 *           type: string
 *           description: URL o base64 de la firma del usuario
 *         token:
 *           type: string
 *           description: Token JWT para autenticación
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario con la información proporcionada
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - identification
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario (debe ser único)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *               identification:
 *                 type: string
 *                 description: Número de identificación del usuario
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Datos inválidos o usuario ya existe
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
 *       500:
 *         description: Error del servidor
 */
router.post('/', registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Autenticar usuario y obtener token
 *     description: Inicia sesión con email y contraseña para obtener un token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Credenciales inválidas
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
 *       500:
 *         description: Error del servidor
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil de usuario
 *     description: Obtiene la información del perfil del usuario autenticado
 *     tags: [Users]
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     identification:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     companyNit:
 *                       type: string
 *                     companyCity:
 *                       type: string
 *                     signature:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualizar perfil de usuario
 *     description: Actualiza la información del perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña (opcional)
 *               identification:
 *                 type: string
 *                 description: Número de identificación del usuario
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Nombre de la empresa para la cuenta de cobro
 *                   nit:
 *                     type: string
 *                     description: NIT de la empresa para la cuenta de cobro
 *                   city:
 *                     type: string
 *                     description: Ciudad de la empresa para la cuenta de cobro
 *               signature:
 *                 type: string
 *                 description: URL o base64 de la firma del usuario
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     identification:
 *                       type: string
 *                     company:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         nit:
 *                           type: string
 *                         city:
 *                           type: string
 *                     signature:
 *                       type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/profile', protect, updateUserProfile);

module.exports = router;