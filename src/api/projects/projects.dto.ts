/**
 * projects/projects.dto.ts — Schemas de validación para Projects
 */

import { z } from 'zod';
import { PaginationSchema } from '../middleware/validate.js';

export const CreateProjectSchema = z.object({
  name: z
    .string({ error: 'El nombre del proyecto es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(500).optional().nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debes enviar al menos un campo para actualizar' }
);

export const GetProjectsQuerySchema = PaginationSchema;

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
export type GetProjectsQueryDto = z.infer<typeof GetProjectsQuerySchema>;
