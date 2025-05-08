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
    await Migration.sync();
    console.log('Tabla de migraciones inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar tabla de migraciones:', error);
    throw error;
  }
};

// Función para verificar si una migración ya fue aplicada
const isMigrationApplied = async (migrationName) => {
  try {
    const migration = await Migration.findOne({
      where: { name: migrationName }
    });
    return !!migration;
  } catch (error) {
    console.error(`Error al verificar migración ${migrationName}:`, error);
    throw error;
  }
};

// Función para registrar una migración como aplicada
const registerMigration = async (migrationName) => {
  try {
    await Migration.create({
      name: migrationName,
      appliedAt: new Date()
    });
    console.log(`Migración ${migrationName} registrada correctamente`);
  } catch (error) {
    console.error(`Error al registrar migración ${migrationName}:`, error);
    throw error;
  }
};

// Función para aplicar una migración específica
const applyMigration = async (migration) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verificar si la migración ya fue aplicada
    const isApplied = await isMigrationApplied(migration.name);
    
    if (isApplied) {
      console.log(`Migración ${migration.name} ya fue aplicada anteriormente`);
      return false;
    }
    
    // Aplicar la migración
    console.log(`Aplicando migración: ${migration.name}`);
    await migration.up(sequelize, transaction);
    
    // Registrar la migración como aplicada
    await registerMigration(migration.name);
    
    // Confirmar la transacción
    await transaction.commit();
    console.log(`Migración ${migration.name} aplicada correctamente`);
    return true;
  } catch (error) {
    // Revertir la transacción en caso de error
    await transaction.rollback();
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
    
    // Aplicar cada migración en orden
    for (const migration of migrations) {
      const applied = await applyMigration(migration);
      if (applied) appliedCount++;
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
    const migrations = await Migration.findAll({
      order: [['appliedAt', 'ASC']]
    });
    return migrations.map(m => m.name);
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