/**
 * middleware/errorHandler.ts — Middleware global de manejo de errores
 *
 * ¿Por qué un error handler global?
 * ──────────────────────────────────
 * Sin un handler global, cuando un error no capturado llega a Express:
 *   - La app puede crashear
 *   - Se puede exponer el stack trace al cliente (riesgo de seguridad)
 *   - La respuesta puede no ser JSON (otro HTML feo)
 *
 * Express reconoce un middleware de errores porque tiene 4 parámetros:
 * (err, req, res, next) — con el 'err' como primer parámetro.
 * DEBE tener exactamente 4 parámetros para que Express lo reconozca.
 *
 * Flujo:
 *   1. Un handler llama next(error) con un error
 *   2. Express salta todos los middlewares normales
 *   3. Va directo a este error handler (4 parámetros)
 *   4. Respondemos JSON siempre, nunca HTML
 *
 * Seguimos RFC 7807 (Problem Details for HTTP APIs) — estándar de la industria
 */

import { type Request, type Response, type NextFunction } from 'express';
import { config } from '../../config/env.js';

// Clase base para errores operacionales (errores "esperados" de negocio)
// Los distinguimos de errores de programación (bugs)
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly isOperational = true // true = error esperado, false = bug
  ) {
    super(message);
    this.name = 'AppError';
    // Necesario para que instanceof funcione correctamente en TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Errores comunes pre-construidos (usaremos estos en los controllers)
export const AppErrors = {
  notFound: (resource: string) =>
    new AppError(404, 'NOT_FOUND', `${resource} no encontrado`),

  unauthorized: (message = 'No autenticado. Incluye un token Bearer válido') =>
    new AppError(401, 'UNAUTHORIZED', message),

  forbidden: (message = 'No tienes permiso para realizar esta acción') =>
    new AppError(403, 'FORBIDDEN', message),

  badRequest: (message: string) =>
    new AppError(400, 'BAD_REQUEST', message),

  conflict: (message: string) =>
    new AppError(409, 'CONFLICT', message),

  internal: (message = 'Error interno del servidor') =>
    new AppError(500, 'INTERNAL_ERROR', message, false),
};

// Middleware de error handler (4 parámetros — Express lo reconoce así)
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // Aunque no se use, debe estar declarado
): void {
  // Determinar si es un error operacional nuestro o un bug inesperado
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';

  // Log del error (en producción enviaríamos a Sentry, Datadog, etc.)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: err.stack,
    });
  }

  // Respuesta al cliente — formato RFC 7807
  res.status(statusCode).json({
    error: {
      status: statusCode,
      code,
      message: err.message,
      // El stack trace SOLO se envía en desarrollo (nunca en producción)
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
}
