/**
 * middleware/logger.ts — Middleware de logging de peticiones HTTP
 *
 * ¿Por qué un logger?
 * ───────────────────
 * En producción, no puedes abrir una terminal y ver qué pasa.
 * Los logs son tu única ventana para entender qué hicieron los usuarios,
 * qué errores ocurrieron y cuánto tardó cada operación.
 *
 * Este middleware registra cada petición con:
 * - Método HTTP y URL
 * - Código de estado de la respuesta
 * - Tiempo que tardó en procesarse
 * - Tamaño de la respuesta
 *
 * ¿Cómo funciona el truco del tiempo?
 * ─────────────────────────────────────
 * Guardamos el timestamp ANTES de que el handler corra (en el request).
 * Escuchamos el evento 'finish' de la respuesta (cuando se envía al cliente).
 * La diferencia = tiempo total de procesamiento.
 */

import { type Request, type Response, type NextFunction } from 'express';

// Colores ANSI para la terminal (solo en desarrollo)
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function getMethodColor(method: string): string {
  const map: Record<string, string> = {
    GET: colors.green,
    POST: colors.blue,
    PUT: colors.yellow,
    PATCH: colors.yellow,
    DELETE: colors.red,
  };
  return map[method] ?? colors.reset;
}

function getStatusColor(status: number): string {
  if (status < 300) return colors.green;
  if (status < 400) return colors.cyan;
  if (status < 500) return colors.yellow;
  return colors.red;
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Marcamos el tiempo de inicio ANTES de procesar el request
  const startTime = process.hrtime.bigint(); // Alta precisión (nanosegundos)
  const timestamp = new Date().toISOString();

  // res.on('finish') se dispara cuando la respuesta termina de enviarse
  // En ese momento ya tenemos acceso al status code final
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000; // ns → ms

    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    const contentLength = res.getHeader('content-length') ?? '-';

    const methodColored = `${getMethodColor(method)}${method.padEnd(6)}${colors.reset}`;
    const statusColored = `${getStatusColor(status)}${status}${colors.reset}`;
    const durationColored = `${colors.dim}${durationMs.toFixed(2)}ms${colors.reset}`;

    console.log(
      `${colors.dim}${timestamp}${colors.reset} ` +
      `${methodColored} ${url} ` +
      `${statusColored} ` +
      `${durationColored} ` +
      `${colors.dim}${contentLength}b${colors.reset}`
    );
  });

  // IMPORTANTE: siempre llamar next() para continuar la cadena
  next();
}
