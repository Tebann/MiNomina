const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpensesSummary,
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Obtener gastos
 *     tags: [Expenses]
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
 *         description: Lista de gastos
 *       401:
 *         description: No autorizado
 */
router.get('/', protect, getExpenses);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Crear un gasto
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concept
 *               - amount
 *             properties:
 *               concept:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Eliminar un gasto
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto
 *     responses:
 *       200:
 *         description: Gasto eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Gasto no encontrado
 */
router.delete('/:id', protect, deleteExpense);

/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Obtener resumen de gastos por mes
 *     tags: [Expenses]
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
 *         description: Resumen de gastos
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: No autorizado
 */
router.get('/summary', protect, getExpensesSummary);

module.exports = router;