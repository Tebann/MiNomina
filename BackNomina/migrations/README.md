# Sistema de Migraciones para MiNomina

Este sistema permite gestionar cambios en la estructura de la base de datos de forma segura, manteniendo un registro de las migraciones aplicadas y permitiendo actualizar la base de datos sin perder información existente.

## Estructura

- `migrationManager.js`: Contiene la lógica principal para gestionar migraciones
- `001_add_isPaid_to_expenses.js`: Primera migración que añade el campo `isPaid` a la tabla de gastos
- `runMigrations.js`: Script auxiliar para ejecutar migraciones (usado internamente)

## Cómo funciona

1. Cada migración es un archivo JavaScript con un nombre único que incluye un número secuencial
2. Las migraciones se aplican en orden según su nombre
3. El sistema registra cada migración aplicada en una tabla `migrations` en la base de datos
4. Al iniciar el servidor, se verifican y aplican automáticamente las migraciones pendientes

## Ejecutar migraciones manualmente

```bash
npm run migrate
```

## Crear una nueva migración

Para crear una nueva migración, sigue estos pasos:

1. Crea un nuevo archivo en la carpeta `migrations` con un nombre que siga el formato `XXX_descripcion.js` (donde XXX es un número secuencial)
2. Implementa las funciones `up` (para aplicar la migración) y `down` (para revertirla)
3. Asegúrate de que el objeto exportado incluya un campo `name` único

Ejemplo:

```javascript
const { DataTypes } = require('sequelize');

module.exports = {
  name: '002_add_new_field',
  
  up: async (sequelize, transaction) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn(
      'table_name',
      'new_field',
      {
        type: DataTypes.STRING,
        allowNull: true
      },
      { transaction }
    );
  },
  
  down: async (sequelize, transaction) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.removeColumn('table_name', 'new_field', { transaction });
  }
};
```

4. Añade la nueva migración al array en `server.js` para que se ejecute automáticamente al iniciar el servidor

## Buenas prácticas

- Nunca modifiques una migración que ya ha sido aplicada en producción
- Cada migración debe ser idempotente (poder ejecutarse múltiples veces sin causar errores)
- Incluye siempre la función `down` para poder revertir los cambios si es necesario
- Usa transacciones para asegurar la integridad de los datos