const { WorkShift } = require('../models');

// @desc    Obtener jornadas de trabajo
// @route   GET /api/workshifts
// @access  Private
const getWorkShifts = async (req, res) => {
  try {
    const workShifts = await WorkShift.findAll({
      where: { userId: req.user.id },
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      count: workShifts.length,
      data: workShifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener jornadas',
      error: error.message,
    });
  }
};

// @desc    Crear una jornada de trabajo
// @route   POST /api/workshifts
// @access  Private
const createWorkShift = async (req, res) => {
  try {
    const { name, amount, holidayMultiplier } = req.body;
    
    // Verificar si ya existe una jornada con el mismo nombre
    const existingWorkShift = await WorkShift.findOne({
      where: {
        userId: req.user.id,
        name
      }
    });
    
    if (existingWorkShift) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una jornada con este nombre',
      });
    }
    
    const workShift = await WorkShift.create({
      userId: req.user.id,
      name,
      amount,
      holidayMultiplier: holidayMultiplier || 1.75,
    });
    
    res.status(201).json({
      success: true,
      data: workShift,
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
      message: 'Error al crear jornada',
      error: error.message,
    });
  }
};

// @desc    Actualizar una jornada de trabajo
// @route   PUT /api/workshifts/:id
// @access  Private
const updateWorkShift = async (req, res) => {
  try {
    const { name, amount, holidayMultiplier } = req.body;
    
    const workShift = await WorkShift.findByPk(req.params.id);
    
    if (!workShift) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada',
      });
    }
    
    // Verificar que la jornada pertenece al usuario
    if (workShift.userId !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }
    
    // Actualizar campos
    workShift.name = name || workShift.name;
    workShift.amount = amount || workShift.amount;
    workShift.holidayMultiplier = holidayMultiplier || workShift.holidayMultiplier;
    
    await workShift.save();
    
    res.json({
      success: true,
      data: workShift,
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
      message: 'Error al actualizar jornada',
      error: error.message,
    });
  }
};

// @desc    Eliminar una jornada de trabajo
// @route   DELETE /api/workshifts/:id
// @access  Private
const deleteWorkShift = async (req, res) => {
  try {
    const workShift = await WorkShift.findByPk(req.params.id);
    
    if (!workShift) {
      return res.status(404).json({
        success: false,
        message: 'Jornada no encontrada',
      });
    }
    
    // Verificar que la jornada pertenece al usuario
    if (workShift.userId !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }
    
    await workShift.destroy();
    
    res.json({
      success: true,
      message: 'Jornada eliminada',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar jornada',
      error: error.message,
    });
  }
};

module.exports = {
  getWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
};