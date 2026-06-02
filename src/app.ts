/**
 * app.ts — Configuración de la aplicación Express
 *
 * Este archivo es el corazón de la aplicación. Configura:
 * - La instancia de Express
 * - Middleware globales (JSON, CORS, seguridad)
 * - Las rutas de la API
 * - El manejo de errores
 *
 * Exportamos una función `createApp()` en vez de la instancia directamente.
 * Esto nos permite crear instancias frescas para cada test, evitando que los
 * tests se interfieran entre sí.
 */

import express, { type Application, type Request, type Response } from 'express';

export function createApp(): Application {
  const app = express();

  // ─── Middleware Esenciales ──────────────────────────────────────────────────
  // express.json() permite parsear el body de las peticiones como JSON
  // Sin esto, req.body siempre sería undefined
  app.use(express.json());

  // ─── Ruta de Salud (Health Check) ──────────────────────────────────────────
  // Los servicios de hosting y los load balancers usan este endpoint para
  // verificar que la aplicación está corriendo correctamente
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: '0.1.0',
    });
  });

  // ─── Ruta Raíz ─────────────────────────────────────────────────────────────
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: '🚀 Bienvenido a TaskFlow API',
      version: 'v1',
      docs: '/api/docs',
      health: '/health',
    });
  });

  // TODO: Aquí irán las rutas de la API (Módulo 2 en adelante)
  // app.use('/api/v1/users', userRoutes);
  // app.use('/api/v1/projects', projectRoutes);
  // app.use('/api/v1/tasks', taskRoutes);

  return app;
}
