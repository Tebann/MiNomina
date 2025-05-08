const { sequelize } = require('../connection/db/database');
const { DataTypes } = require('sequelize');

// Modelo para registrar las migraciones aplicadas
const Migration = sequelize.define('Migration', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'migrations',
  timestamps: false
});

// Función para inicializar la tabla de migraciones
const initMigrationTable = async () => {
  try {
    // Intentar inicializar la tabla con reintentos
    let retries = 5;
    let success = false;
    let lastError = null;
    
    while (retries > 0 && !success) {
      try {
        await Migration.sync({ force: false });
        success = true;
        console.log('Tabla de migraciones inicializada correctamente');
      } catch (error) {
        lastError = error;
        retries--;
        
        if (error.name === 'SequelizeTimeoutError' || 
            (error.original && error.original.code === 'SQLITE_BUSY')) {
          console.log(`Base de datos bloqueada al inicializar tabla, reintentando (${retries} intentos restantes)...`);
          // Esperar un tiempo antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Si es otro tipo de error, no reintentar
          break;
        }
      }
    }
    
    if (!success) {
      console.error('Error al inicializar tabla de migraciones después de varios intentos:', lastError);
      throw lastError;
    }
  } catch (error) {
    console.error('Error al inicializar tabla de migraciones:', error);
    throw error;
  }
};

// Función para verificar si una migración ya fue aplicada
const isMigrationApplied = async (migrationName) => {
  try {
    // Intentar verificar con reintentos
    let retries = 5;
    let migration = null;
    let lastError = null;
    
    while (retries > 0 && migration === null) {
      try {
        migration = await Migration.findOne({
          where: { name: migrationName }
        });
        
        // Si encontramos la migración o si no hay error, salir del bucle
        if (migration !== null || lastError === null) {
          break;
        }
      } catch (error) {
        lastError = error;
        retries--;
        
        if (error.name === 'SequelizeTimeoutError' || 
            (error.original && error.original.code === 'SQLITE_BUSY')) {
          console.log(`Base de datos bloqueada al verificar migración, reintentando (${retries} intentos restantes)...`);
          // Esperar un tiempo antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Si es otro tipo de error, no reintentar
          break;
        }
      }
    }
    
    if (lastError !== null && migration === null) {
      console.error(`Error al verificar migración ${migrationName} después de varios intentos:`, lastError);
      throw lastError;
    }
    
    return !!migration;
  } catch (error) {
    console.error(`Error al verificar migración ${migrationName}:`, error);
    throw error;
  }
};

// Función para registrar una migración como aplicada
const registerMigration = async (migrationName, transaction) => {
  try {
    // Intentar registrar la migración con reintentos
    let retries = 5;
    let success = false;
    let lastError = null;
    
    while (retries > 0 && !success) {
      try {
        await Migration.create({
          name: migrationName,
          appliedAt: new Date()
        }, { transaction });
        
        success = true;
        console.log(`Migración ${migrationName} registrada correctamente`);
      } catch (error) {
        lastError = error;
        retries--;
        
        if (error.name === 'SequelizeTimeoutError' || 
            (error.original && error.original.code === 'SQLITE_BUSY')) {
          console.log(`Base de datos bloqueada, reintentando (${retries} intentos restantes)...`);
          // Esperar un tiempo antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Si es otro tipo de error, no reintentar
          break;
        }
      }
    }
    
    if (!success) {
      console.error(`Error al registrar migración ${migrationName} después de varios intentos:`, lastError);
      throw lastError;
    }
  } catch (error) {
    console.error(`Error al registrar migración ${migrationName}:`, error);
    throw error;
  }
};

// Función para aplicar una migración específica
const applyMigration = async (migration) => {
  const transaction = await sequelize.transaction({
    isolationLevel: 'READ COMMITTED' // Nivel de aislamiento menos restrictivo
  });
  
  try {
    // Verificar si la migración ya fue aplicada
    const isApplied = await isMigrationApplied(migration.name);
    
    if (isApplied) {
      console.log(`Migración ${migration.name} ya fue aplicada anteriormente`);
      await transaction.commit();
      return false;
    }
    
    // Aplicar la migración
    console.log(`Aplicando migración: ${migration.name}`);
    await migration.up(sequelize, transaction);
    
    // Registrar la migración como aplicada
    await registerMigration(migration.name, transaction);
    
    // Confirmar la transacción
    await transaction.commit();
    console.log(`Migración ${migration.name} aplicada correctamente`);
    return true;
  } catch (error) {
    // Revertir la transacción en caso de error
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error(`Error al revertir transacción:`, rollbackError);
    }
    console.error(`Error al aplicar migración ${migration.name}:`, error);
    throw error;
  }
};

// Función para revertir una migración específica
const revertMigration = async (migration) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verificar si la migración fue aplicada
    const isApplied = await isMigrationApplied(migration.name);
    
    if (!isApplied) {
      console.log(`Migración ${migration.name} no está aplicada, no se puede revertir`);
      return false;
    }
    
    // Revertir la migración
    console.log(`Revirtiendo migración: ${migration.name}`);
    await migration.down(sequelize, transaction);
    
    // Eliminar el registro de la migración
    await Migration.destroy({
      where: { name: migration.name },
      transaction
    });
    
    // Confirmar la transacción
    await transaction.commit();
    console.log(`Migración ${migration.name} revertida correctamente`);
    return true;
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
    console.error(`Error al revertir migración ${migration.name}:`, error);
    throw error;
  }
};

// Función para aplicar todas las migraciones pendientes
const applyPendingMigrations = async (migrations) => {
  try {
    // Inicializar tabla de migraciones si no existe
    await initMigrationTable();
    
    let appliedCount = 0;
    let errors = [];
    
    // Aplicar cada migración en orden
    for (const migration of migrations) {
      try {
        const applied = await applyMigration(migration);
        if (applied) appliedCount++;
      } catch (error) {
        console.error(`Error al aplicar migración ${migration.name}, continuando con las siguientes:`, error);
        errors.push({ migration: migration.name, error });
        
        // Esperar un momento antes de continuar con la siguiente migración
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Se encontraron ${errors.length} errores durante la aplicación de migraciones:`);
      errors.forEach((err, index) => {
        console.warn(`${index + 1}. Migración: ${err.migration}`);
        console.warn(`   Error: ${err.error.message}`);
      });
    }
    
    console.log(`${appliedCount} migraciones aplicadas correctamente`);
    return appliedCount;
  } catch (error) {
    console.error('Error al aplicar migraciones pendientes:', error);
    throw error;
  }
};

// Función para obtener todas las migraciones aplicadas
const getAppliedMigrations = async () => {
  try {
    // Intentar obtener migraciones con reintentos
    let retries = 5;
    let migrations = null;
    let lastError = null;
    
    while (retries > 0 && migrations === null) {
      try {
        migrations = await Migration.findAll({
          order: [['appliedAt', 'ASC']]
        });
      } catch (error) {
        lastError = error;
        retries--;
        
        if (error.name === 'SequelizeTimeoutError' || 
            (error.original && error.original.code === 'SQLITE_BUSY')) {
          console.log(`Base de datos bloqueada al obtener migraciones, reintentando (${retries} intentos restantes)...`);
          // Esperar un tiempo antes de reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Si es otro tipo de error, no reintentar
          break;
        }
      }
    }
    
    if (lastError !== null && migrations === null) {
      console.error('Error al obtener migraciones aplicadas después de varios intentos:', lastError);
      throw lastError;
    }
    
    return (migrations || []).map(m => m.name);
  } catch (error) {
    console.error('Error al obtener migraciones aplicadas:', error);
    throw error;
  }
};

module.exports = {
  initMigrationTable,
  isMigrationApplied,
  registerMigration,
  applyMigration,
  revertMigration,
  applyPendingMigrations,
  getAppliedMigrations
};