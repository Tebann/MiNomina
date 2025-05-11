const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpensesSummary,
  generateRecurringExpenses,
  toggleExpensePaid,
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - concept
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del gasto
 *         concept:
 *           type: string
 *           description: Concepto o descripción del gasto
 *         amount:
 *           type: number
 *           format: float
 *           description: Monto del gasto
 *         date:
 *           type: string
 *           format: date
 *           description: Fecha del gasto
 *         tag:
 *           type: string
 *           enum: [Fijo, Imprevisto, Personal]
 *           description: Etiqueta del gasto
 *         isRecurring:
 *           type: boolean
 *           description: Indica si el gasto es recurrente mensualmente (solo para gastos fijos)
 *         userId:
 *           type: integer
 *           description: ID del usuario al que pertenece el gasto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del registro
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Obtener gastos
 *     description: Obtiene la lista de gastos del usuario, con opciones de filtrado por año, mes y etiqueta
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
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           enum: [Fijo, Imprevisto, Personal]
 *         description: Etiqueta para filtrar
 *     responses:
 *       200:
 *         description: Lista de gastos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', protect, getExpenses);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Crear un gasto
 *     description: Crea un nuevo gasto con la información proporcionada
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
 *                 description: Concepto o descripción del gasto
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Monto del gasto
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del gasto (por defecto es la fecha actual)
 *               tag:
 *                 type: string
 *                 enum: [Fijo, Imprevisto, Personal]
 *                 description: Etiqueta del gasto (por defecto es 'Personal')
 *               isRecurring:
 *                 type: boolean
 *                 description: Indica si el gasto es recurrente mensualmente (solo válido para gastos con etiqueta 'Fijo')
 *     responses:
 *       201:
 *         description: Gasto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', protect, createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Eliminar un gasto
 *     description: Elimina un gasto específico por su ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto a eliminar
 *     responses:
 *       200:
 *         description: Gasto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', protect, deleteExpense);

/**
 * @swagger
 * /api/expenses/summary:
 *   get:
 *     summary: Obtener resumen de gastos por mes
 *     description: Obtiene un resumen de los gastos del mes, incluyendo totales generales y por etiqueta
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
 *                     total:
 *                       type: object
 *                       properties:
 *                         totalAmount:
 *                           type: number
 *                         count:
 *                           type: integer
 *                     byTag:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: string
 *                           totalAmount:
 *                             type: number
 *                           count:
 *                             type: integer
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/summary', protect, getExpensesSummary);

/**
 * @swagger
 * /api/expenses/generate-recurring:
 *   post:
 *     summary: Generar gastos fijos recurrentes
 *     description: Genera automáticamente los gastos fijos recurrentes para un mes específico
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
 *               - year
 *               - month
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Año para generar los gastos
 *               month:
 *                 type: integer
 *                 description: Mes para generar los gastos (1-12)
 *     responses:
 *       201:
 *         description: Gastos recurrentes generados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/generate-recurring', protect, generateRecurringExpenses);

/**
 * @swagger
 * /api/expenses/{id}/toggle-paid:
 *   patch:
 *     summary: Cambiar estado de pago de un gasto
 *     description: Cambia el estado de pago de un gasto (pagado/no pagado)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del gasto a modificar
 *     responses:
 *       200:
 *         description: Estado de pago actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Expense'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Gasto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/toggle-paid', protect, toggleExpensePaid);

module.exports = router;