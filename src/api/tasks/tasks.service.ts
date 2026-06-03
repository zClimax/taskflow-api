/**
 * tasks/tasks.service.ts — Lógica de negocio para Tasks
 *
 * Responsabilidad: orquestar las operaciones de negocio.
 *
 * Reglas del Service:
 * ───────────────────
 * ✅ Verifica permisos (¿el usuario puede hacer esto?)
 * ✅ Aplica reglas de negocio (¿el proyecto existe? ¿el asignado es miembro?)
 * ✅ Llama al Repository para datos
 * ✅ Lanza AppErrors con el código HTTP correcto
 * ❌ NO conoce req/res (eso es del Controller)
 * ❌ NO ejecuta queries directamente (eso es del Repository)
 *
 * Nota sobre autenticación (Módulo 6):
 * ─────────────────────────────────────
 * En este módulo, el userId viene como parámetro.
 * En el Módulo 6, el middleware de auth lo pondrá en req.user.id
 * y el Controller lo extraerá de ahí.
 */

import { prisma } from '../../infrastructure/database/prisma.js';
import { AppErrors } from '../middleware/errorHandler.js';
import { tasksRepository } from './tasks.repository.js';
import type { CreateTaskDto, UpdateTaskDto, GetTasksQueryDto, CreateCommentDto } from './tasks.dto.js';

export const tasksService = {
  // ── Listar tareas ──────────────────────────────────────────────────────────
  async getTasks(query: GetTasksQueryDto) {
    const { tasks, total } = await tasksRepository.findMany(query);
    const { page, limit } = query;

    return {
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ── Obtener una tarea por ID ───────────────────────────────────────────────
  async getTaskById(id: string) {
    const task = await tasksRepository.findById(id);

    if (!task) {
      throw AppErrors.notFound(`Tarea con ID '${id}'`);
    }

    return { data: task };
  },

  // ── Crear tarea ────────────────────────────────────────────────────────────
  async createTask(dto: CreateTaskDto, requesterId: string) {
    // Regla de negocio: el proyecto debe existir
    const project = await prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { members: { where: { userId: requesterId } } },
    });

    if (!project) {
      throw AppErrors.notFound(`Proyecto con ID '${dto.projectId}'`);
    }

    // Regla de negocio: el usuario debe ser miembro del proyecto
    // (En Módulo 6 esto usará el userId real del JWT)
    const isMember = project.members.length > 0;
    const isOwner = project.ownerId === requesterId;

    if (!isMember && !isOwner) {
      throw AppErrors.forbidden('No eres miembro de este proyecto');
    }

    // Si hay assigneeId, verificar que el asignado también sea miembro
    if (dto.assigneeId) {
      const assigneeIsMember = await prisma.projectMember.findFirst({
        where: { projectId: dto.projectId, userId: dto.assigneeId },
      });
      if (!assigneeIsMember) {
        throw AppErrors.badRequest('El usuario asignado no es miembro del proyecto');
      }
    }

    const task = await tasksRepository.create(dto);
    return { data: task };
  },

  // ── Actualizar tarea ───────────────────────────────────────────────────────
  async updateTask(id: string, dto: UpdateTaskDto, requesterId: string) {
    // Verificar que la tarea existe
    const task = await tasksRepository.findById(id);
    if (!task) {
      throw AppErrors.notFound(`Tarea con ID '${id}'`);
    }

    // Regla de negocio: solo el creador, asignado o miembro admin puede editar
    // (En Módulo 6 verificaremos el rol del usuario en el proyecto)
    // Por ahora cualquier miembro del proyecto puede editar

    // Si se cambia el asignado, verificar que sea miembro del proyecto
    if (dto.assigneeId) {
      const assigneeIsMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId: dto.assigneeId },
      });
      if (!assigneeIsMember) {
        throw AppErrors.badRequest('El usuario asignado no es miembro del proyecto');
      }
    }

    const updated = await tasksRepository.update(id, dto);
    return { data: updated };
  },

  // ── Eliminar tarea ─────────────────────────────────────────────────────────
  async deleteTask(id: string, requesterId: string) {
    const task = await tasksRepository.findById(id);
    if (!task) {
      throw AppErrors.notFound(`Tarea con ID '${id}'`);
    }

    // Regla de negocio: solo el owner del proyecto o el creador puede eliminar
    // (En Módulo 6 usaremos el rol real del JWT)

    await tasksRepository.delete(id);
    // No retornamos nada — el controller responderá 204 No Content
  },

  // ── COMMENTS: listar ───────────────────────────────────────────────────────
  async getComments(taskId: string) {
    // Verificar que la tarea existe
    const task = await tasksRepository.findById(taskId);
    if (!task) {
      throw AppErrors.notFound(`Tarea con ID '${taskId}'`);
    }

    const comments = await tasksRepository.findComments(taskId);
    return { data: comments };
  },

  // ── COMMENTS: crear ────────────────────────────────────────────────────────
  async createComment(taskId: string, dto: CreateCommentDto, authorId: string) {
    const task = await tasksRepository.findById(taskId);
    if (!task) {
      throw AppErrors.notFound(`Tarea con ID '${taskId}'`);
    }

    const comment = await tasksRepository.createComment(taskId, authorId, dto.content);
    return { data: comment };
  },

  // ── COMMENTS: eliminar ─────────────────────────────────────────────────────
  async deleteComment(taskId: string, commentId: string, requesterId: string) {
    const comment = await tasksRepository.findCommentById(commentId);

    if (!comment || comment.taskId !== taskId) {
      throw AppErrors.notFound(`Comentario con ID '${commentId}'`);
    }

    // Solo el autor puede eliminar su comentario
    if (comment.authorId !== requesterId) {
      throw AppErrors.forbidden('Solo el autor puede eliminar este comentario');
    }

    await tasksRepository.deleteComment(commentId);
  },
};
