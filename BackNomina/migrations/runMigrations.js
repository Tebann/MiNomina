const { applyPendingMigrations, getAppliedMigrations } = require('./migrationManager');
const fs = require('fs');
const path = require('path');

// Función para cargar todas las migraciones disponibles
const loadMigrations = () => {
  const migrationsDir = path.join(__dirname);
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => 
      file.endsWith('.js') && 
      file !== 'migrationManager.js' && 
      file !== 'runMigrations.js'
    )
    .sort(); // Ordenar alfabéticamente para asegurar el orden correcto
  
  return migrationFiles.map(file => {
    const migrationPath = path.join(migrationsDir, file);
    return require(migrationPath);
  });
};

// Función principal para ejecutar migraciones
const runMigrations = async () => {
  try {
    console.log('Iniciando proceso de migraciones...');
    
    // Cargar todas las migraciones disponibles
    const migrations = loadMigrations();
    console.log(`Se encontraron ${migrations.length} migraciones disponibles`);
    
    // Obtener migraciones ya aplicadas
    const appliedMigrations = await getAppliedMigrations();
    console.log(`${appliedMigrations.length} migraciones ya están aplicadas`);
    
    // Aplicar migraciones pendientes
    const appliedCount = await applyPendingMigrations(migrations);
    
    if (appliedCount > 0) {
      console.log(`Se aplicaron ${appliedCount} migraciones nuevas`);
    } else {
      console.log('No hay migraciones pendientes por aplicar');
    }
    
    console.log('Proceso de migraciones completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el proceso de migraciones:', error);
    process.exit(1);
  }
};

// Ejecutar migraciones
runMigrations();