/**
 * tasks/tasks.repository.ts — Capa de acceso a datos para Tasks
 *
 * Responsabilidad ÚNICA: ejecutar queries en la base de datos.
 *
 * Reglas estrictas del Repository:
 * ─────────────────────────────────
 * ✅ Usa Prisma para leer y escribir datos
 * ✅ Recibe parámetros simples (IDs, filtros, datos)
 * ✅ Devuelve datos de la BD (o null si no existe)
 * ❌ NO tiene lógica de negocio (eso va en el Service)
 * ❌ NO sabe nada de HTTP (no usa req/res)
 * ❌ NO lanza errores de negocio (eso va en el Service)
 */

import { type Task, type Comment, type Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { CreateTaskDto, UpdateTaskDto, GetTasksQueryDto } from './tasks.dto.js';

// ── Tipos de retorno enriquecidos (con relaciones incluidas) ─────────────────
// Prisma genera tipos exactos basados en los includes que usamos
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: { select: { id: true; name: true } };
    assignee: { select: { id: true; name: true; email: true } };
    _count: { select: { comments: true } };
  };
}>;

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: { select: { id: true; name: true; email: true } };
  };
}>;

// ── Selección reutilizable (qué campos incluir en cada query) ─────────────────
const taskInclude = {
  project: { select: { id: true, name: true } },
  assignee: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

export const tasksRepository = {
  // ── Listar tareas con filtros y paginación ───────────────────────────────
  async findMany(filters: GetTasksQueryDto): Promise<{ tasks: TaskWithRelations[]; total: number }> {
    const {
      search, projectId, status, priority, assigneeId, sortBy, order
    } = filters;

    // Zod coerce convierte el string a número, pero req.query puede llegar sin transformar
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;

    // Construimos el objeto where dinámicamente
    // Solo añadimos condiciones si el filtro fue enviado (no undefined)
    const where: Prisma.TaskWhereInput = {
      ...(projectId && { projectId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Ejecutamos COUNT y SELECT en paralelo — más eficiente que hacerlo secuencialmente
    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit, // Offset de paginación
        take: limit,
      }),
    ]);

    return { tasks, total };
  },

  // ── Encontrar una tarea por ID ─────────────────────────────────────────────
  async findById(id: string): Promise<TaskWithRelations | null> {
    return prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
  },

  // ── Crear tarea ────────────────────────────────────────────────────────────
  async create(data: CreateTaskDto): Promise<TaskWithRelations> {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        priority: data.priority,
        dueDate: data.dueDate,
      },
      include: taskInclude,
    });
  },

  // ── Actualizar tarea ───────────────────────────────────────────────────────
  async update(id: string, data: UpdateTaskDto): Promise<TaskWithRelations> {
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      },
      include: taskInclude,
    });
  },

  // ── Eliminar tarea ─────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  },

  // ── COMMENTS: listar comentarios de una tarea ──────────────────────────────
  async findComments(taskId: string): Promise<CommentWithAuthor[]> {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' }, // Los más antiguos primero
    });
  },

  // ── COMMENTS: crear comentario ─────────────────────────────────────────────
  async createComment(taskId: string, authorId: string, content: string): Promise<CommentWithAuthor> {
    return prisma.comment.create({
      data: { content, taskId, authorId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // ── COMMENTS: eliminar comentario ─────────────────────────────────────────
  async deleteComment(commentId: string): Promise<void> {
    await prisma.comment.delete({ where: { id: commentId } });
  },

  // ── COMMENTS: buscar comentario por ID (para verificar autoría) ───────────
  async findCommentById(commentId: string): Promise<Comment | null> {
    return prisma.comment.findUnique({ where: { id: commentId } });
  },
};
