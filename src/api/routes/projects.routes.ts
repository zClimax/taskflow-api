/**
 * routes/projects.routes.ts — Rutas de proyectos
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

export const projectsRouter = Router();

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos del usuario
 *     description: Devuelve todos los proyectos donde el usuario es owner o miembro.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Resultados por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista de proyectos con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      message: '✅ GET /projects — se implementará en el Módulo 5',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Crear nuevo proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mi Nuevo Proyecto
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 example: Descripción opcional del proyecto
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Proyecto creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
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
 */
projectsRouter.post('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { message: '✅ POST /projects — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags: [Projects]
 *     summary: Obtener proyecto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *         example: cuid2abc123
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permiso para ver este proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.get('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ GET /projects/:id — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Actualizar proyecto
 *     description: Solo el owner del proyecto puede actualizarlo.
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
 *               name:
 *                 type: string
 *                 example: Nombre Actualizado
 *               description:
 *                 type: string
 *                 example: Nueva descripción
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo el owner puede editar el proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.patch('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ PATCH /projects/:id — Módulo 5' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Eliminar proyecto
 *     description: Solo el owner puede eliminar. Elimina también todas las tareas del proyecto.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Proyecto eliminado
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Solo el owner puede eliminar el proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.delete('/:id', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
