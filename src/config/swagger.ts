/**
 * config/swagger.ts — Configuración de OpenAPI/Swagger
 *
 * ¿Qué es OpenAPI?
 * ────────────────
 * OpenAPI (antes Swagger) es el estándar de la industria para describir APIs REST.
 * Es un archivo YAML/JSON que documenta cada endpoint: URL, métodos, parámetros,
 * cuerpos de petición, respuestas posibles y códigos de estado.
 *
 * ¿Qué es swagger-jsdoc?
 * ───────────────────────
 * Genera la especificación OpenAPI a partir de comentarios JSDoc en tu código.
 * Ventaja: la documentación vive junto al código que describe.
 * Si cambias un endpoint y actualizas su comentario, la doc se actualiza sola.
 *
 * ¿Qué es swagger-ui-express?
 * ─────────────────────────────
 * Sirve una interfaz web interactiva (Swagger UI) en una ruta de tu API.
 * Desde ahí puedes explorar y probar todos los endpoints sin Postman.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.js';

const options: swaggerJsdoc.Options = {
  // Metadatos de la API
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: `
## API de Gestión de Tareas y Proyectos

**TaskFlow API** es una API REST profesional que permite gestionar proyectos,
tareas y equipos de trabajo. Construida con Node.js + TypeScript + Express + PostgreSQL.

### Características
- ✅ Autenticación JWT con refresh tokens
- ✅ CRUD completo para proyectos y tareas
- ✅ Roles y permisos (RBAC)
- ✅ Filtrado, paginación y ordenamiento
- ✅ Rate limiting y seguridad

### Autenticación
La mayoría de endpoints requieren un Bearer token JWT en el header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`
Obtén el token con \`POST /api/v1/auth/login\`.
      `,
      contact: {
        name: 'Jorge — zClimax',
        url: 'https://github.com/zClimax/taskflow-api',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },

    // URL base de todos los endpoints
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Servidor de desarrollo local',
      },
      {
        url: `https://taskflow-api.onrender.com/api/${config.apiVersion}`,
        description: 'Servidor de producción (Render)',
      },
    ],

    // Esquemas de seguridad disponibles
    components: {
      securitySchemes: {
        // JWT Bearer token — el estándar para REST APIs
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido con POST /auth/login',
        },
      },

      // ── Schemas reutilizables ────────────────────────────────────────────
      // Definir schemas aquí permite referenciarlos con $ref en todos los endpoints
      // Evita repetir la misma estructura en cada operación
      schemas: {
        // ── Respuesta de error estándar (RFC 7807) ───────────────────────
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                status: { type: 'integer', example: 400 },
                code: { type: 'string', example: 'BAD_REQUEST' },
                message: { type: 'string', example: 'El campo email es requerido' },
              },
            },
          },
        },

        // ── Paginación ───────────────────────────────────────────────────
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalPages: { type: 'integer', example: 3 },
          },
        },

        // ── User ─────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'cuid2abc123' },
            name: { type: 'string', example: 'Jorge García' },
            email: { type: 'string', format: 'email', example: 'jorge@example.com' },
            role: { type: 'string', enum: ['admin', 'member'], example: 'member' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Project ──────────────────────────────────────────────────────
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cuid2abc123' },
            name: { type: 'string', example: 'Mi Proyecto' },
            description: { type: 'string', example: 'Descripción del proyecto' },
            ownerId: { type: 'string', example: 'cuid2user123' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Task ─────────────────────────────────────────────────────────
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cuid2abc123' },
            title: { type: 'string', example: 'Implementar autenticación JWT' },
            description: { type: 'string', example: 'Descripción detallada...' },
            status: {
              type: 'string',
              enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
              example: 'TODO',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
              example: 'MEDIUM',
            },
            projectId: { type: 'string', example: 'cuid2proj123' },
            assigneeId: { type: 'string', nullable: true, example: null },
            dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-12-31' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Comment ──────────────────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cuid2abc123' },
            content: { type: 'string', example: 'Este es un comentario' },
            taskId: { type: 'string', example: 'cuid2task123' },
            authorId: { type: 'string', example: 'cuid2user123' },
            author: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Auth Tokens ───────────────────────────────────────────────────
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGci...' },
            refreshToken: { type: 'string', example: 'eyJhbGci...' },
            expiresIn: { type: 'string', example: '15m' },
          },
        },
      },
    },

    // Seguridad global: todos los endpoints requieren Bearer token por defecto
    // Se puede sobrescribir en endpoints individuales (ej: login no requiere auth)
    security: [{ bearerAuth: [] }],

    // Tags: agrupan endpoints en la UI de Swagger
    tags: [
      { name: 'Auth', description: 'Registro, login y gestión de tokens' },
      { name: 'Users', description: 'Perfil y gestión del usuario autenticado' },
      { name: 'Projects', description: 'CRUD de proyectos y gestión de miembros' },
      { name: 'Tasks', description: 'CRUD de tareas con filtros y paginación' },
      { name: 'Comments', description: 'Comentarios anidados en tareas' },
    ],
  },

  // Dónde buscar los comentarios JSDoc con @openapi
  // swagger-jsdoc escanea estos archivos y extrae la documentación
  apis: ['./src/api/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
