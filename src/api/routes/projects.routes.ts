/**
 * routes/projects.routes.ts — Rutas de proyectos con validación y controller reales
 */

import { Router } from 'express';
import { projectsController } from '../projects/projects.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate, IdParamSchema } from '../middleware/validate.js';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  GetProjectsQuerySchema,
} from '../projects/projects.dto.js';

export const projectsRouter = Router();

// Todas las rutas de /projects requieren estar autenticado
projectsRouter.use(authenticate);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Listar proyectos del usuario
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
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
 */
projectsRouter.get(
  '/',
  validate({ query: GetProjectsQuerySchema }),
  projectsController.getAll
);

/**
 * @openapi
 * /projects:
 *   post:
 *     tags: [Projects]
 *     summary: Crear proyecto
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
 *               description:
 *                 type: string
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
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.post(
  '/',
  validate({ body: CreateProjectSchema }),
  projectsController.create
);

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
 *         schema: { type: string }
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
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.get(
  '/:id',
  validate({ params: IdParamSchema }),
  projectsController.getById
);

/**
 * @openapi
 * /projects/{id}:
 *   patch:
 *     tags: [Projects]
 *     summary: Actualizar proyecto
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
 *               name: { type: string }
 *               description: { type: string, nullable: true }
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
 */
projectsRouter.patch(
  '/:id',
  validate({ params: IdParamSchema, body: UpdateProjectSchema }),
  projectsController.update
);

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     tags: [Projects]
 *     summary: Eliminar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Proyecto eliminado
 *       403:
 *         description: Sin permiso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
projectsRouter.delete(
  '/:id',
  validate({ params: IdParamSchema }),
  projectsController.remove
);
