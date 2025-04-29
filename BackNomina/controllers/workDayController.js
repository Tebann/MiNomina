const { WorkDay, WorkShift } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Obtener días trabajados
// @route   GET /api/workdays
// @access  Private
const getWorkDays = async (req, res) => {
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
    
    const workDays = await WorkDay.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    res.json({
      success: true,
      count: workDays.length,
      data: workDays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener días trabajados',
      error: error.message,
    });
  }
};

// @desc    Crear un día trabajado
// @route   POST /api/workdays
// @access  Private
const createWorkDay = async (req, res) => {
  try {
    const { date, type, isHoliday } = req.body;
    
    // Verificar si ya existe un registro para esta fecha
    const existingWorkDay = await WorkDay.findOne({
      where: {
        userId: req.user.id,
        date: new Date(date)
      }
    });
    
    if (existingWorkDay) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un registro para esta fecha',
      });
    }
    
    // Buscar la tarifa correspondiente al tipo de jornada
    let amount;
    
    // Buscar si el usuario tiene jornadas personalizadas
    const workShift = await WorkShift.findOne({
      where: {
        userId: req.user.id,
        name: type
      }
    });
    
    if (workShift) {
      amount = workShift.amount;
      
      // Aplicar multiplicador si es festivo
      if (isHoliday) {
        amount *= workShift.holidayMultiplier;
      }
    } else {
      // Valores por defecto si no hay jornadas personalizadas
      const defaultRates = {
        medio: 28500,
        completo: 60300,
      };
      
      amount = defaultRates[type] || 0;
      
      // Aplicar multiplicador por defecto si es festivo
      if (isHoliday) {
        amount *= 1.75;
      }
    }
    
    const workDay = await WorkDay.create({
      userId: req.user.id,
      date,
      type,
      isHoliday,
      amount,
    });
    
    res.status(201).json({
      success: true,
      data: workDay,
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
      message: 'Error al crear día trabajado',
      error: error.message,
    });
  }
};

// @desc    Eliminar un día trabajado
// @route   DELETE /api/workdays/:id
// @access  Private
const deleteWorkDay = async (req, res) => {
  try {
    const workDay = await WorkDay.findByPk(req.params.id);
    
    if (!workDay) {
      return res.status(404).json({
        success: false,
        message: 'Día trabajado no encontrado',
      });
    }
    
    // Verificar que el día trabajado pertenece al usuario
    if (workDay.userId !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }
    
    await workDay.destroy();
    
    res.json({
      success: true,
      message: 'Día trabajado eliminado',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar día trabajado',
      error: error.message,
    });
  }
};

// @desc    Obtener resumen de ingresos por mes
// @route   GET /api/workdays/summary
// @access  Private
const getWorkDaysSummary = async (req, res) => {
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
    
    const result = await WorkDay.findAll({
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
  getWorkDays,
  createWorkDay,
  deleteWorkDay,
  getWorkDaysSummary,
};