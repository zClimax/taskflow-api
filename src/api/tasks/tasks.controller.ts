/**
 * tasks/tasks.controller.ts — Handlers HTTP para Tasks
 *
 * Responsabilidad ÚNICA: traducir entre HTTP y el mundo de objetos TypeScript.
 *
 * Reglas del Controller:
 * ──────────────────────
 * ✅ Extrae datos de req (params, query, body)
 * ✅ Llama al Service con esos datos
 * ✅ Responde con res.json() o res.status().end()
 * ✅ Captura errores y los pasa a next(error) para el errorHandler
 * ❌ NO tiene lógica de negocio
 * ❌ NO hace queries a la BD directamente
 * ❌ NO lanza errores de negocio (el Service lo hace)
 *
 * Patrón try/catch/next:
 * ──────────────────────
 * Cada handler envuelve su código en try/catch.
 * Si el Service lanza un AppError, next(error) lo pasa al errorHandler global
 * que lo convierte en una respuesta JSON con el código HTTP correcto.
 *
 * Placeholder de autenticación (Módulo 6):
 * ─────────────────────────────────────────
 * Por ahora usamos el primer usuario del seed como "usuario autenticado".
 * En el Módulo 6, req.user.id vendrá del middleware JWT.
 */

import { type Request, type Response, type NextFunction } from 'express';
import { tasksService } from './tasks.service.js';
import type { GetTasksQueryDto, CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './tasks.dto.js';
import { prisma } from '../../infrastructure/database/prisma.js';

// ── Helper temporal: obtener el primer usuario del seed como "autenticado" ────
// TODO Módulo 6: reemplazar con req.user.id del middleware JWT
async function getRequesterId(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@taskflow.com' },
    select: { id: true },
  });
  return user?.id ?? 'unknown';
}

export const tasksController = {
  // ── GET /tasks ─────────────────────────────────────────────────────────────
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // res.locals.parsedQuery contiene los datos validados y transformados por el middleware
      // (page y limit ya son numbers, no strings)
      const query = res.locals['parsedQuery'] as GetTasksQueryDto;
      const result = await tasksService.getTasks(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── GET /tasks/:id ─────────────────────────────────────────────────────────
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await tasksService.getTaskById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── POST /tasks ────────────────────────────────────────────────────────────
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateTaskDto;
      const requesterId = await getRequesterId();
      const result = await tasksService.createTask(dto, requesterId);
      // 201 Created: se creó un nuevo recurso
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /tasks/:id ───────────────────────────────────────────────────────
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateTaskDto;
      const requesterId = await getRequesterId();
      const result = await tasksService.updateTask(id, dto, requesterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /tasks/:id ──────────────────────────────────────────────────────
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = await getRequesterId();
      await tasksService.deleteTask(id, requesterId);
      // 204 No Content: operación exitosa sin body de respuesta
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  // ── GET /tasks/:id/comments ────────────────────────────────────────────────
  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await tasksService.getComments(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── POST /tasks/:id/comments ───────────────────────────────────────────────
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as CreateCommentDto;
      const requesterId = await getRequesterId();
      const result = await tasksService.createComment(id, dto, requesterId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /tasks/:id/comments/:commentId ─────────────────────────────────
  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, commentId } = req.params;
      const requesterId = await getRequesterId();
      await tasksService.deleteComment(id, commentId, requesterId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
