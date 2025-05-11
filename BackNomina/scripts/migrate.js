require('dotenv').config();
const { testConnection } = require('../connection/db/database');
const fs = require('fs');
const path = require('path');

// Función principal
async function runMigrations() {
  try {
    console.log('Verificando conexión a la base de datos...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Abortando migraciones.');
      process.exit(1);
    }
    
    console.log('Conexión a la base de datos establecida.');
    
    // Importar el gestor de migraciones
    const { applyPendingMigrations, getAppliedMigrations } = require('../migrations/migrationManager');
    
    // Cargar todas las migraciones disponibles
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => 
        file.endsWith('.js') && 
        file !== 'migrationManager.js' && 
        file !== 'runMigrations.js'
      )
      .sort(); // Ordenar alfabéticamente para asegurar el orden correcto
    
    console.log(`Se encontraron ${migrationFiles.length} archivos de migración:`);
    migrationFiles.forEach(file => console.log(`- ${file}`));
    
    // Cargar los módulos de migración
    const migrations = migrationFiles.map(file => {
      const migrationPath = path.join(migrationsDir, file);
      return require(migrationPath);
    });
    
    // Obtener migraciones ya aplicadas
    const appliedMigrations = await getAppliedMigrations();
    console.log(`${appliedMigrations.length} migraciones ya están aplicadas:`);
    appliedMigrations.forEach(name => console.log(`- ${name}`));
    
    // Aplicar migraciones pendientes
    console.log('\nAplicando migraciones pendientes...');
    const appliedCount = await applyPendingMigrations(migrations);
    
    if (appliedCount > 0) {
      console.log(`\n✅ Se aplicaron ${appliedCount} migraciones nuevas correctamente.`);
    } else {
      console.log('\n✅ La base de datos está actualizada. No hay migraciones pendientes.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante el proceso de migraciones:', error);
    process.exit(1);
  }
}

// Ejecutar el script
runMigrations();