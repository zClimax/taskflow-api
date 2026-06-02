/**
 * app.ts — Configuración completa de la aplicación Express
 *
 * ORDEN DE MIDDLEWARE (crítico — Express los ejecuta en este orden):
 * ─────────────────────────────────────────────────────────────────
 *  1. requestLogger     → registra TODAS las peticiones (primero para medir tiempo total)
 *  2. express.json()    → parsea el body JSON (antes de cualquier route handler)
 *  3. express.urlencoded → parsea formularios HTML (para compatibilidad)
 *  4. CORS headers      → habilita cross-origin (antes de las rutas)
 *  5. /health           → endpoint de salud (sin auth, sin versión)
 *  6. /api/v1           → todas las rutas de la API
 *  7. notFound          → captura cualquier ruta no definida → 404
 *  8. errorHandler      → maneja TODOS los errores de la cadena → respuesta JSON
 *
 * Regla de oro: los middlewares de error van SIEMPRE al final.
 */

import express, { type Application, type Request, type Response } from 'express';
import { config } from './config/env.js';
import { requestLogger } from './api/middleware/logger.js';
import { notFound } from './api/middleware/notFound.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { apiRouter } from './api/routes/index.js';

export function createApp(): Application {
  const app = express();

  // ─── 1. Logger ─────────────────────────────────────────────────────────────
  // Va primero para capturar el tiempo total de la petición (incluye todos los
  // middlewares posteriores)
  app.use(requestLogger);

  // ─── 2. Parsers ────────────────────────────────────────────────────────────
  // Sin express.json(), req.body siempre es undefined en POST/PUT/PATCH
  app.use(express.json({ limit: '10mb' })); // limit: evita payloads gigantes

  // Para formularios HTML (Content-Type: application/x-www-form-urlencoded)
  app.use(express.urlencoded({ extended: true }));

  // ─── 3. CORS ───────────────────────────────────────────────────────────────
  // Cross-Origin Resource Sharing: permite que tu frontend (en otro dominio/puerto)
  // haga peticiones a tu API.
  // Sin esto: el navegador bloquea peticiones desde localhost:5173 a localhost:3000
  //
  // En el Módulo 7 instalaremos el paquete 'cors' para una configuración más robusta.
  // Por ahora, headers manuales son suficientes para entender el concepto.
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.cors.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // OPTIONS es el "preflight" request que el navegador hace antes de POST/PUT/DELETE
    if (_req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // ─── 4. Health Check ───────────────────────────────────────────────────────
  // Sin versión, sin autenticación. Los load balancers lo usan para saber
  // si el servidor está vivo. Deve responder rápido y simple.
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.env,
      version: '0.1.0',
    });
  });

  // ─── 5. Rutas de la API ────────────────────────────────────────────────────
  // Montamos todo el router bajo /api/v1
  // Así, una ruta definida como '/' en apiRouter es accesible en '/api/v1/'
  // Y '/users' en usersRouter sería '/api/v1/users'
  app.use(`/api/${config.apiVersion}`, apiRouter);

  // ─── 6. 404 Handler ────────────────────────────────────────────────────────
  // Debe ir DESPUÉS de todas las rutas. Si llegamos aquí, ninguna ruta coincidió.
  app.use(notFound);

  // ─── 7. Error Handler ──────────────────────────────────────────────────────
  // SIEMPRE al final. Express lo reconoce por los 4 parámetros: (err, req, res, next)
  app.use(errorHandler);

  return app;
}
