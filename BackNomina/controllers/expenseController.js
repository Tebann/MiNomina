const { Expense } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Obtener gastos
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let whereClause = { userId: req.user.id };
    
    // Filtrar por año y mes si se proporcionan
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
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
    const { concept, amount, date } = req.body;
    
    const expense = await Expense.create({
      userId: req.user.id,
      concept,
      amount,
      date: date || new Date(),
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
    
    const summary = result.length > 0
      ? { totalAmount: parseFloat(result[0].totalAmount) || 0, count: parseInt(result[0].count) || 0 }
      : { totalAmount: 0, count: 0 };
    
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

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpensesSummary,
};