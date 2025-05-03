const { Expense } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Obtener gastos
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { year, month, tag } = req.query;
    
    let whereClause = { userId: req.user.id };
    
    // Filtrar por año y mes si se proporcionan
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    // Filtrar por etiqueta si se proporciona
    if (tag) {
      whereClause.tag = tag;
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener gastos',
      error: error.message,
    });
  }
};

// @desc    Crear un gasto
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { concept, amount, date, tag, isRecurring } = req.body;
    
    // Validar que si es un gasto recurrente, debe ser de tipo Fijo
    if (isRecurring && tag !== 'Fijo') {
      return res.status(400).json({
        success: false,
        message: 'Solo los gastos con etiqueta "Fijo" pueden ser recurrentes',
      });
    }
    
    const expense = await Expense.create({
      userId: req.user.id,
      concept,
      amount,
      date: date || new Date(),
      tag: tag || 'Personal',
      isRecurring: isRecurring || false,
    });
    
    res.status(201).json({
      success: true,
      data: expense,
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
      message: 'Error al crear gasto',
      error: error.message,
    });
  }
};

// @desc    Eliminar un gasto
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado',
      });
    }
    
    // Verificar que el gasto pertenece al usuario
    if (expense.userId !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }
    
    await expense.destroy();
    
    res.json({
      success: true,
      message: 'Gasto eliminado',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar gasto',
      error: error.message,
    });
  }
};

// @desc    Obtener resumen de gastos por mes
// @route   GET /api/expenses/summary
// @access  Private
const getExpensesSummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere año y mes',
      });
    }
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Obtener resumen general
    const result = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      raw: true
    });
    
    // Obtener resumen por etiqueta
    const tagSummary = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'tag',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['tag'],
      raw: true
    });
    
    const summary = {
      total: result.length > 0
        ? { totalAmount: parseFloat(result[0].totalAmount) || 0, count: parseInt(result[0].count) || 0 }
        : { totalAmount: 0, count: 0 },
      byTag: tagSummary.map(item => ({
        tag: item.tag,
        totalAmount: parseFloat(item.totalAmount) || 0,
        count: parseInt(item.count) || 0
      }))
    };
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message,
    });
  }
};

// @desc    Generar gastos fijos recurrentes para un mes específico
// @route   POST /api/expenses/generate-recurring
// @access  Private
const generateRecurringExpenses = async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere año y mes',
      });
    }
    
    // Obtener todos los gastos fijos recurrentes del usuario
    const recurringExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        tag: 'Fijo',
        isRecurring: true
      }
    });
    
    // Verificar si ya existen gastos para el mes solicitado
    const targetDate = new Date(year, month - 1, 15); // Usar el día 15 del mes como referencia
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const existingExpenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        tag: 'Fijo',
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    // Crear nuevos gastos recurrentes para el mes solicitado
    const newExpenses = [];
    
    for (const expense of recurringExpenses) {
      // Verificar si ya existe un gasto similar en el mes solicitado
      const exists = existingExpenses.some(e => 
        e.concept === expense.concept && 
        e.amount === expense.amount && 
        e.tag === expense.tag
      );
      
      if (!exists) {
        const newExpense = await Expense.create({
          userId: req.user.id,
          concept: expense.concept,
          amount: expense.amount,
          date: targetDate,
          tag: 'Fijo',
          isRecurring: true
        });
        
        newExpenses.push(newExpense);
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${newExpenses.length} gastos recurrentes generados para ${month}/${year}`,
      data: newExpenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al generar gastos recurrentes',
      error: error.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpensesSummary,
  generateRecurringExpenses,
};