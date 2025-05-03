/**
 * Módulo para documentación de API con Swagger
 * 
 * Este módulo proporciona funciones para documentar endpoints de API
 * utilizando decoradores similares a los de Python pero adaptados a JavaScript.
 * 
 * Ejemplo de uso:
 * 
 * const { swaggerRoute } = require('../utils/swaggerDocs');
 * 
 * // Decorador para documentar una ruta
 * router.get('/', 
 *   swaggerRoute({
 *     summary: 'Obtener todos los usuarios',
 *     description: 'Retorna una lista de todos los usuarios registrados',
 *     tags: ['Users'],
 *     security: [{ bearerAuth: [] }],
 *     parameters: [
 *       {
 *         in: 'query',
 *         name: 'page',
 *         schema: { type: 'integer' },
 *         description: 'Número de página'
 *       }
 *     ],
 *     responses: {
 *       '200': {
 *         description: 'Lista de usuarios obtenida exitosamente',
 *         content: {
 *           'application/json': {
 *             schema: {
 *               type: 'object',
 *               properties: {
 *                 success: { type: 'boolean' },
 *                 data: { 
 *                   type: 'array',
 *                   items: { $ref: '#/components/schemas/User' }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       '401': { $ref: '#/components/responses/UnauthorizedError' }
 *     }
 *   }),
 *   controllerFunction
 * );
 */

/**
 * Decorador para documentar rutas de API
 * @param {Object} options - Opciones de documentación
 * @param {string} options.summary - Resumen breve de la ruta
 * @param {string} options.description - Descripción detallada
 * @param {Array<string>} options.tags - Etiquetas para agrupar rutas
 * @param {Array<Object>} options.security - Esquemas de seguridad
 * @param {Array<Object>} options.parameters - Parámetros de la ruta
 * @param {Object} options.requestBody - Cuerpo de la solicitud
 * @param {Object} options.responses - Respuestas posibles
 * @returns {Function} Middleware que pasa la documentación a Swagger
 */
const swaggerRoute = (options) => {
  return (req, res, next) => {
    // Este middleware no hace nada en tiempo de ejecución,
    // solo sirve para documentar la ruta en Swagger
    next();
  };
};

/**
 * Define un esquema para ser utilizado en la documentación
 * @param {string} name - Nombre del esquema
 * @param {Object} schema - Definición del esquema
 * @returns {Object} Esquema para ser utilizado en referencias
 */
const defineSchema = (name, schema) => {
  return { $ref: `#/components/schemas/${name}` };
};

/**
 * Define una respuesta común para ser reutilizada
 * @param {string} name - Nombre de la respuesta
 * @param {Object} response - Definición de la respuesta
 * @returns {Object} Respuesta para ser utilizada en referencias
 */
const defineResponse = (name, response) => {
  return { $ref: `#/components/responses/${name}` };
};

// Respuestas comunes predefinidas
const API_RESPONSES = {
  unauthorized: {
    description: 'No autorizado, token inválido o expirado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'No autorizado' }
          }
        }
      }
    }
  },
  not_found: {
    description: 'Recurso no encontrado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Recurso no encontrado' }
          }
        }
      }
    }
  },
  bad_request: {
    description: 'Solicitud incorrecta',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Datos inválidos' }
          }
        }
      }
    }
  },
  server_error: {
    description: 'Error del servidor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error interno del servidor' }
          }
        }
      }
    }
  }
};

module.exports = {
  swaggerRoute,
  defineSchema,
  defineResponse,
  API_RESPONSES
};