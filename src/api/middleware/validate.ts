/**
 * middleware/validate.ts — Middleware de validación con Zod
 *
 * ¿Qué es Zod?
 * ─────────────
 * Zod es una librería de validación de esquemas con TypeScript-first.
 * Define la forma esperada de tus datos y Zod:
 *   1. Valida que los datos coincidan con el schema
 *   2. Genera los tipos TypeScript automáticamente (no hay duplicación)
 *   3. Devuelve errores descriptivos si algo falla
 *
 * ¿Por qué no validar en el controller directamente?
 * ─────────────────────────────────────────────────────
 * Este middleware separa la validación del manejo de la petición.
 * Si la validación falla, responde 400 ANTES de llegar al controller.
 * El controller recibe SIEMPRE datos válidos y tipados — sin necesidad de
 * verificaciones adicionales.
 *
 * Uso:
 *   router.post('/tasks', validate({ body: CreateTaskSchema }), controller.createTask)
 */

import { type Request, type Response, type NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, unknown> = {};

    // Validar body
    if (schemas.body) {
      // Primero verificamos que el body no sea un objeto vacío {}
      // Importante para PATCH donde se requiere al menos un campo
      if (
        req.body !== null &&
        typeof req.body === 'object' &&
        Object.keys(req.body as object).length === 0
      ) {
        res.status(400).json({
          error: {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: 'El body no puede estar vacío',
            details: { body: { _errors: ['Debes enviar al menos un campo'] } },
          },
        });
        return;
      }

      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.flatten().fieldErrors;
      } else {
        req.body = result.data; // Reemplaza con datos parseados/transformados
      }
    }

    // Validar params de ruta (:id, etc.)
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.flatten().fieldErrors;
      }
    }

    // Validar query string (?page=1&limit=20)
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.flatten().fieldErrors;
      } else {
        // Guardamos los datos parseados en res.locals para que el controller los use
        // No podemos mutar req.query directamente en Express (es readonly)
        res.locals['parsedQuery'] = result.data;
      }
    }

    // Si hay errores en cualquier parte, responder 400
    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        error: {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Los datos enviados no son válidos',
          details: errors,
        },
      });
      return;
    }

    next();
  };
}

// ── Schemas de parámetros comunes ─────────────────────────────────────────────
// Reutilizable en cualquier ruta que tenga :id
export const IdParamSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
});

export const CommentParamSchema = z.object({
  id: z.string().min(1, 'El ID de la tarea es requerido'),
  commentId: z.string().min(1, 'El ID del comentario es requerido'),
});

// ── Schema de paginación común ────────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),       // "2" → 2
  limit: z.coerce.number().int().positive().max(100).default(20), // "20" → 20
});
