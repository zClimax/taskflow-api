/**
 * app.ts — Configuración completa de la aplicación Express
 *
 * ORDEN DE MIDDLEWARE (crítico — Express los ejecuta en este orden):
 * ─────────────────────────────────────────────────────────────────
 *  1. compression      → comprimir respuestas (primero para que todo lo de abajo se comprima)
 *  2. helmet           → headers de seguridad HTTP
 *  3. cors             → política de cross-origin
 *  4. requestLogger    → registra TODAS las peticiones
 *  5. express.json()   → parsea el body JSON
 *  6. express.urlencoded → parsea formularios HTML
 *  7. /health          → endpoint de salud (sin auth, sin versión, sin rate limit)
 *  8. /api/docs        → Swagger UI (sin auth)
 *  9. rateLimit        → límite global de peticiones (después de health y docs)
 * 10. /api/v1          → todas las rutas de la API
 * 11. notFound         → captura cualquier ruta no definida → 404
 * 12. errorHandler     → maneja TODOS los errores → respuesta JSON
 *
 * Regla de oro: los middlewares de error van SIEMPRE al final.
 *
 * Módulo 9: Añadimos helmet, cors (package), compression y rate limiting
 */

import express, { type Application, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { requestLogger } from './api/middleware/logger.js';
import { notFound } from './api/middleware/notFound.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { apiRouter } from './api/routes/index.js';
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimitMiddleware,
  compressionMiddleware,
} from './api/middleware/security.js';

export function createApp(): Application {
  const app = express();

  // ─── 1. Compression ─────────────────────────────────────────────────────────
  // Va PRIMERO: así todas las respuestas (incluyendo errores) se comprimen.
  // Comprime automáticamente JSON, texto, etc. cuando supera 1KB.
  // El cliente indica que acepta compresión con el header Accept-Encoding: gzip
  app.use(compressionMiddleware);

  // ─── 2. Helmet ──────────────────────────────────────────────────────────────
  // Headers de seguridad HTTP. Debe ir temprano, antes de generar cualquier
  // respuesta, para que TODOS los responses incluyan estos headers.
  //
  // Headers añadidos (puedes verlos en DevTools → Network → Response Headers):
  //   Content-Security-Policy: default-src 'self'
  //   X-Content-Type-Options: nosniff
  //   X-Frame-Options: DENY
  //   X-XSS-Protection: 0  (los browsers modernos tienen XSS protection nativo)
  //   Referrer-Policy: no-referrer
  //   Permissions-Policy: camera=(), microphone=(), geolocation=()
  app.use(helmetMiddleware);

  // ─── 3. CORS ────────────────────────────────────────────────────────────────
  // Reemplazamos los headers manuales del módulo anterior con el package 'cors'.
  // Ventaja: maneja correctamente las peticiones OPTIONS (preflight) y
  // soporta múltiples orígenes fácilmente vía CORS_ORIGIN separado por comas.
  //
  // Configuración vía env: CORS_ORIGIN="http://localhost:5173,https://mi-app.vercel.app"
  app.use(corsMiddleware);

  // ─── 4. Logger ──────────────────────────────────────────────────────────────
  // Después de CORS pero antes de las rutas para capturar el timing completo
  app.use(requestLogger);

  // ─── 5. Parsers ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── 6. Health Check ────────────────────────────────────────────────────────
  // Sin rate limit — los load balancers y Railway lo llaman constantemente.
  // Sin autenticación — debe ser accesible públicamente.
  // Responde con los datos mínimos: status, timestamp, uptime, entorno.
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.env,
      version: '0.1.0',
    });
  });

  // ─── 7. Swagger UI (solo en desarrollo) ─────────────────────────────────────
  // No exponemos la documentación en producción por seguridad.
  // Un atacante con tu spec OpenAPI conoce exactamente qué endpoints existen.
  if (config.isDevelopment) {
    app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'TaskFlow API Docs',
        customCss: `
          .swagger-ui .topbar { background-color: #1a1a2e; }
          .swagger-ui .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🗂️</text></svg>'); }
        `,
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
        },
      })
    );

    app.get('/api/docs.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // ─── 8. Rate Limiting ───────────────────────────────────────────────────────
  // Después de /health y /api/docs para que no los limite.
  // Antes de /api/v1 para que proteja TODAS las rutas de la API.
  //
  // Headers que verá el cliente:
  //   RateLimit-Limit: 100
  //   RateLimit-Remaining: 99
  //   RateLimit-Reset: 1700000000  (timestamp de cuándo se resetea la ventana)
  app.use(`/api/${config.apiVersion}`, rateLimitMiddleware);

  // ─── 9. Rutas de la API ─────────────────────────────────────────────────────
  app.use(`/api/${config.apiVersion}`, apiRouter);

  // ─── 10. 404 Handler ────────────────────────────────────────────────────────
  app.use(notFound);

  // ─── 11. Error Handler ──────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

// Instancia exportada para uso en tests con Supertest
// Supertest no necesita server.listen() — llama directamente al app
export const app = createApp();
