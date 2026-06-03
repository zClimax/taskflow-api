/**
 * routes/tasks.routes.ts — Rutas de tareas + validación + controller
 *
 * Ahora cada ruta tiene 3 partes:
 *   1. validate(...) — middleware que valida los datos con Zod (responde 400 si falla)
 *   2. tasksController.method — el handler que procesa la petición
 *
 * La documentación OpenAPI (@openapi) se mantiene aquí porque swagger-jsdoc
 * escanea este archivo. Los schemas de validación están en tasks.dto.ts.
 */

import { Router } from 'express';
import { tasksController } from '../tasks/tasks.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, IdParamSchema, CommentParamSchema } from '../middleware/validate.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  GetTasksQuerySchema,
  CreateCommentSchema,
} from '../tasks/tasks.dto.js';

export const tasksRouter = Router();

// Todas las rutas de /tasks requieren estar autenticado
tasksRouter.use(authenticate);

// ─── TASKS ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Listar tareas
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, updatedAt, dueDate, priority, title] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lista de tareas con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
tasksRouter.get(
  '/',
  validate({ query: GetTasksQuerySchema }),
  tasksController.getAll
);

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Crear tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, projectId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Implementar autenticación JWT
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.post(
  '/',
  validate({ body: CreateTaskSchema }),
  tasksController.create
);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Obtener tarea por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.get(
  '/:id',
  validate({ params: IdParamSchema }),
  tasksController.getById
);

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Actualizar tarea parcialmente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               assigneeId: { type: string, nullable: true }
 *               dueDate: { type: string, format: date-time, nullable: true }
 *     responses:
 *       200:
 *         description: Tarea actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.patch(
  '/:id',
  validate({ params: IdParamSchema, body: UpdateTaskSchema }),
  tasksController.update
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Eliminar tarea
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Tarea eliminada
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.delete(
  '/:id',
  validate({ params: IdParamSchema }),
  tasksController.remove
);

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /tasks/{id}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Listar comentarios de una tarea
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 */
tasksRouter.get(
  '/:id/comments',
  validate({ params: IdParamSchema }),
  tasksController.getComments
);

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Crear comentario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Este es mi comentario
 *     responses:
 *       201:
 *         description: Comentario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 */
tasksRouter.post(
  '/:id/comments',
  validate({ params: IdParamSchema, body: CreateCommentSchema }),
  tasksController.createComment
);

/**
 * @openapi
 * /tasks/{id}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Eliminar comentario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Comentario eliminado
 */
tasksRouter.delete(
  '/:id/comments/:commentId',
  validate({ params: CommentParamSchema }),
  tasksController.deleteComment
);
