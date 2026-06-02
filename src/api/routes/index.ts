/**
 * routes/index.ts — Router principal de la API
 *
 * Este archivo actúa como el "enrutador raíz" que agrupa todos los sub-routers.
 * Cuando añadamos Users, Projects y Tasks, cada uno tendrá su propio router
 * y se montará aquí.
 *
 * Ventaja de este patrón:
 * - app.ts no se satura de rutas
 * - Cada dominio (users, tasks) es independiente y testeable por separado
 * - Cambiar el prefijo /api/v1 a /api/v2 es una sola línea en app.ts
 */

import { Router, type Request, type Response } from 'express';
import { config } from '../../config/env.js';

export const apiRouter = Router();

// ─── Ruta de información de la API ───────────────────────────────────────────
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'TaskFlow API',
    version: config.apiVersion,
    status: 'operational',
    environment: config.env,
    endpoints: {
      health: '/health',
      docs: '/api/docs',
      users: `/api/${config.apiVersion}/users`,
      projects: `/api/${config.apiVersion}/projects`,
      tasks: `/api/${config.apiVersion}/tasks`,
    },
  });
});

// ─── Sub-routers (se irán añadiendo módulo a módulo) ─────────────────────────
// TODO Módulo 5: import { usersRouter } from './users.js';
// TODO Módulo 5: apiRouter.use('/users', usersRouter);

// TODO Módulo 5: import { projectsRouter } from './projects.js';
// TODO Módulo 5: apiRouter.use('/projects', projectsRouter);

// TODO Módulo 5: import { tasksRouter } from './tasks.js';
// TODO Módulo 5: apiRouter.use('/tasks', tasksRouter);
