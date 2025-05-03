const express = require('express');
const router = express.Router();
const {
  getWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
} = require('../controllers/workShiftController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/workshifts:
 *   get:
 *     summary: Obtener jornadas de trabajo
 *     tags: [WorkShifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jornadas de trabajo
 *       401:
 *         description: No autorizado
 */
router.get('/', protect, getWorkShifts);

/**
 * @swagger
 * /api/workshifts:
 *   post:
 *     summary: Crear una jornada de trabajo
 *     tags: [WorkShifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               holidayMultiplier:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Jornada creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, createWorkShift);

/**
 * @swagger
 * /api/workshifts/{id}:
 *   put:
 *     summary: Actualizar una jornada de trabajo
 *     tags: [WorkShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la jornada
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               holidayMultiplier:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Jornada actualizada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Jornada no encontrada
 */
router.put('/:id', protect, updateWorkShift);

/**
 * @swagger
 * /api/workshifts/{id}:
 *   delete:
 *     summary: Eliminar una jornada de trabajo
 *     tags: [WorkShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la jornada
 *     responses:
 *       200:
 *         description: Jornada eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Jornada no encontrada
 */
router.delete('/:id', protect, deleteWorkShift);

module.exports = router;