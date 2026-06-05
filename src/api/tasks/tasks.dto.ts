/**
 * tasks/tasks.dto.ts — Schemas de validación y tipos para Tasks
 *
 * DTO (Data Transfer Object) = Objeto que define la forma de los datos
 * que entran y salen de la API.
 *
 * Zod nos da dos cosas a la vez:
 *   1. Runtime validation: valida que los datos en tiempo de ejecución
 *   2. Static types: z.infer<typeof Schema> genera el tipo TypeScript
 *
 * Sin Zod tendrías que mantener el schema Y el tipo por separado.
 * Con Zod, defines uno y obtienes los dos.
 */

import { z } from 'zod';
import { PaginationSchema } from '../middleware/validate.js';

// ── Enums sincronizados con el schema de Prisma ───────────────────────────────
// Nota: Podrían importarse de @prisma/client, pero los redefinimos en Zod
// para que sean parte del schema de validación

const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']);
const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// ── Schema para crear una tarea (POST /tasks) ─────────────────────────────────
export const CreateTaskSchema = z.object({
  title: z
    .string({ error: 'El título es requerido' })
    .min(2, 'El título debe tener al menos 2 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .trim(),

  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),

  projectId: z
    .string({ error: 'El ID del proyecto es requerido' })
    .min(1, 'El ID del proyecto no puede estar vacío'),

  assigneeId: z.string().optional().nullable(),

  priority: TaskPriorityEnum.default('MEDIUM'),

  dueDate: z
    .string()
    .datetime({ message: 'La fecha debe ser un ISO 8601 válido (ej: 2026-12-31T00:00:00Z)' })
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)), // String → Date
});

// ── Schema para actualizar una tarea (PATCH /tasks/:id) ───────────────────────
// PATCH permite actualizar cualquier subconjunto de campos.
// La validación de "al menos un campo" la hace el validate middleware
// verificando que req.body no esté vacío antes de llamar a Zod.
export const UpdateTaskSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  description: z.string().max(2000).optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

// ── Schema para filtros y paginación (GET /tasks?...) ─────────────────────────
export const GetTasksQuerySchema = PaginationSchema.extend({
  projectId: z.string().optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  assigneeId: z.string().optional(),
  search: z.string().max(100).optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ── Schema para crear comentario ──────────────────────────────────────────────
export const CreateCommentSchema = z.object({
  content: z
    .string({ error: 'El contenido del comentario es requerido' })
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .trim(),
});

// ── Tipos TypeScript inferidos de los schemas ─────────────────────────────────
// z.infer<T> extrae el tipo de un schema Zod — no hay que definirlo dos veces
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;
export type GetTasksQueryDto = z.infer<typeof GetTasksQuerySchema>;
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>;
