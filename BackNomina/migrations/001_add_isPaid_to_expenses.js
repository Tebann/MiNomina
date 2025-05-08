const { DataTypes } = require('sequelize');

module.exports = {
  name: '001_add_isPaid_to_expenses',
  
  up: async (sequelize, transaction) => {
    try {
      // Verificar si la tabla existe
      const queryInterface = sequelize.getQueryInterface();
      
      // Verificar si la tabla expenses existe
      try {
        const tableInfo = await queryInterface.describeTable('expenses', { transaction });
        
        // Si la columna no existe, añadirla
        if (!tableInfo.isPaid) {
          try {
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
          } catch (addError) {
            // Si hay un error específico al añadir la columna
            if (addError.message && addError.message.includes('duplicate column name')) {
              console.log('La columna isPaid ya existe en la tabla expenses (detectado en error)');
            } else {
              throw addError;
            }
          }
        } else {
          console.log('La columna isPaid ya existe en la tabla expenses');
        }
      } catch (tableError) {
        // Si la tabla no existe, no hacer nada
        if (tableError.message && tableError.message.includes('no such table')) {
          console.log('La tabla expenses no existe todavía, se creará durante la sincronización de modelos');
        } else {
          throw tableError;
        }
      }
    } catch (error) {
      console.error('Error durante la migración:', error);
      throw error;
    }
  },
  
  down: async (sequelize, transaction) => {
    try {
      // Verificar si la tabla existe
      const queryInterface = sequelize.getQueryInterface();
      
      try {
        // Verificar si la tabla expenses existe
        await queryInterface.describeTable('expenses', { transaction });
        
        // Intentar eliminar la columna
        try {
          await queryInterface.removeColumn('expenses', 'isPaid', { transaction });
          console.log('Columna isPaid eliminada de la tabla expenses');
        } catch (removeError) {
          // Si hay un error específico al eliminar la columna
          if (removeError.message && removeError.message.includes('no such column')) {
            console.log('La columna isPaid no existe en la tabla expenses');
          } else {
            throw removeError;
          }
        }
      } catch (tableError) {
        // Si la tabla no existe, no hacer nada
        if (tableError.message && tableError.message.includes('no such table')) {
          console.log('La tabla expenses no existe, no hay columna que eliminar');
        } else {
          throw tableError;
        }
      }
    } catch (error) {
      console.error('Error durante la reversión de la migración:', error);
      throw error;
    }
  }
};