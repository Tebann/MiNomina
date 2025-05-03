const express = require('express');
const router = express.Router();
const {
  getWorkDays,
  createWorkDay,
  deleteWorkDay,
  getWorkDaysSummary,
} = require('../controllers/workDayController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/workdays:
 *   get:
 *     summary: Obtener días trabajados
 *     tags: [WorkDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Año para filtrar
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Mes para filtrar (1-12)
 *     responses:
 *       200:
 *         description: Lista de días trabajados
 *       401:
 *         description: No autorizado
 */
router.get('/', protect, getWorkDays);

/**
 * @swagger
 * /api/workdays:
 *   post:
 *     summary: Crear un día trabajado
 *     tags: [WorkDays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [medio, completo]
 *               isHoliday:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Día trabajado creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, createWorkDay);

/**
 * @swagger
 * /api/workdays/{id}:
 *   delete:
 *     summary: Eliminar un día trabajado
 *     tags: [WorkDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del día trabajado
 *     responses:
 *       200:
 *         description: Día trabajado eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Día trabajado no encontrado
 */
router.delete('/:id', protect, deleteWorkDay);

/**
 * @swagger
 * /api/workdays/summary:
 *   get:
 *     summary: Obtener resumen de ingresos por mes
 *     tags: [WorkDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Año para el resumen
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mes para el resumen (1-12)
 *     responses:
 *       200:
 *         description: Resumen de ingresos
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: No autorizado
 */
router.get('/summary', protect, getWorkDaysSummary);

module.exports = router;