/**
 * middleware/notFound.ts — Middleware para rutas no encontradas (404)
 *
 * ¿Por qué un middleware de 404?
 * ────────────────────────────────
 * Express, por defecto, si ninguna ruta coincide con la petición,
 * devuelve una respuesta HTML con "Cannot GET /ruta-inexistente".
 * Eso es inaceptable en una API — todo debe ser JSON consistente.
 *
 * Este middleware se coloca AL FINAL de todas las rutas.
 * Si la petición llega hasta aquí, es porque ninguna ruta anterior
 * la manejó → es un 404.
 */

import { type Request, type Response, type NextFunction } from 'express';

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: {
      status: 404,
      code: 'NOT_FOUND',
      message: `Ruta '${req.method} ${req.originalUrl}' no encontrada`,
      hint: 'Verifica la URL y el método HTTP. Consulta /api/docs para ver los endpoints disponibles.',
    },
  });
}
