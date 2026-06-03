/**
 * routes/index.ts — Router principal de la API v1
 *
 * Este archivo es el punto de montaje de todos los sub-routers.
 * app.ts monta este router bajo /api/v1, por lo que:
 *   authRouter en '/auth'     → accesible en /api/v1/auth
 *   usersRouter en '/users'   → accesible en /api/v1/users
 *   projectsRouter en '...'   → accesible en /api/v1/projects
 *   tasksRouter en '/tasks'   → accesible en /api/v1/tasks
 */

import { Router, type Request, type Response } from 'express';
import { config } from '../../config/env.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { projectsRouter } from './projects.routes.js';
import { tasksRouter } from './tasks.routes.js';

export const apiRouter = Router();

// ─── Ruta de información de la API ───────────────────────────────────────────
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'TaskFlow API',
    version: config.apiVersion,
    status: 'operational',
    environment: config.env,
    docs: `/api/docs`,
    endpoints: {
      auth:     `/api/${config.apiVersion}/auth`,
      users:    `/api/${config.apiVersion}/users`,
      projects: `/api/${config.apiVersion}/projects`,
      tasks:    `/api/${config.apiVersion}/tasks`,
    },
  });
});

// ─── Montaje de sub-routers ───────────────────────────────────────────────────
apiRouter.use('/auth',     authRouter);
apiRouter.use('/users',    usersRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/tasks',    tasksRouter);
