const { DataTypes } = require('sequelize');

module.exports = {
  name: '001_add_isPaid_to_expenses',
  
  up: async (sequelize, transaction) => {
    // Verificar si la columna ya existe
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('expenses', { transaction });
    
    // Si la columna no existe, añadirla
    if (!tableInfo.isPaid) {
      await queryInterface.addColumn(
        'expenses',
        'isPaid',
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          comment: 'Indica si el gasto ya ha sido pagado'
        },
        { transaction }
      );
      console.log('Columna isPaid añadida a la tabla expenses');
    } else {
      console.log('La columna isPaid ya existe en la tabla expenses');
    }
  },
  
  down: async (sequelize, transaction) => {
    // Eliminar la columna
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('expenses', 'isPaid', { transaction });
    console.log('Columna isPaid eliminada de la tabla expenses');
  }
};