/**
 * routes/tasks.routes.ts — Rutas de tareas y comentarios
 *
 * Nota de diseño: los comentarios se anidan bajo /tasks/:id/comments
 * porque un comentario solo tiene sentido en el contexto de una tarea.
 * Sin embargo, si los comentarios fueran un recurso más complejo (con
 * replies, reacciones, etc.), podría justificarse un router propio.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

export const tasksRouter = Router();

// ─── TASKS ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Listar tareas
 *     description: |
 *       Devuelve tareas del usuario con soporte para filtros, paginación y ordenamiento.
 *       Por defecto devuelve las tareas del usuario asignadas o de sus proyectos.
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filtrar por proyecto específico
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE]
 *         description: Filtrar por estado
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *         description: Filtrar por prioridad
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filtrar por usuario asignado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, priority]
 *           default: createdAt
 *         description: Campo para ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
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
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      message: '✅ GET /tasks — se implementará en el Módulo 5',
    });
  } catch (error) {
    next(error);
  }
});

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
 *                 minLength: 2
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 example: Detalle de la tarea...
 *               projectId:
 *                 type: string
 *                 example: cuid2proj123
 *               assigneeId:
 *                 type: string
 *                 example: cuid2user123
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *                 default: MEDIUM
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-31"
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
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permiso para crear tareas en este proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.post('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { message: '✅ POST /tasks — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

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
 *         schema:
 *           type: string
 *         example: cuid2task123
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
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.get('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ GET /tasks/:id — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Actualizar tarea
 *     description: Actualiza parcialmente una tarea. Muy usado para cambiar el estado (Kanban).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, URGENT]
 *               assigneeId:
 *                 type: string
 *                 nullable: true
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
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
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permiso para editar esta tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.patch('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ PATCH /tasks/:id — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

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
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarea eliminada
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permiso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.delete('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// ─── COMMENTS (anidados bajo /tasks/:id/comments) ────────────────────────────

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
 *         schema:
 *           type: string
 *         description: ID de la tarea
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
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.get('/:id/comments', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [], message: '✅ GET /tasks/:id/comments — Módulo 5' });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Agregar comentario a una tarea
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
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
 *                 example: Este es mi comentario sobre la tarea.
 *                 minLength: 1
 *                 maxLength: 2000
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
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tarea no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.post('/:id/comments', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { message: '✅ POST /tasks/:id/comments — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /tasks/{id}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Eliminar comentario
 *     description: Solo el autor del comentario puede eliminarlo.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario
 *     responses:
 *       204:
 *         description: Comentario eliminado
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo el autor puede eliminar el comentario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comentario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tasksRouter.delete('/:id/comments/:commentId', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
