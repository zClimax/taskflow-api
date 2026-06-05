/**
 * tasks/tasks.service.test.ts — Unit Tests del Tasks Service
 *
 * Testeamos la lógica de negocio sin tocar la BD.
 * Cada test verifica una regla de negocio específica.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../middleware/errorHandler.js';

// Mocks
vi.mock('../../infrastructure/database/prisma.js', () => ({
  prisma: {
    project: { findUnique: vi.fn() },
    projectMember: { findFirst: vi.fn() },
  },
}));

vi.mock('./tasks.repository.js', () => ({
  tasksRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findComments: vi.fn(),
    createComment: vi.fn(),
    deleteComment: vi.fn(),
    findCommentById: vi.fn(),
  },
}));

import { tasksService } from './tasks.service.js';
import { tasksRepository } from './tasks.repository.js';
import { prisma } from '../../infrastructure/database/prisma.js';

// ── Datos de prueba ───────────────────────────────────────────────────────────
const userId = 'user-owner-123';
const projectId = 'project-abc-123';
const taskId = 'task-xyz-456';

const mockProject = {
  id: projectId,
  name: 'Proyecto Test',
  ownerId: userId,
  members: [{ userId, role: 'OWNER' }],
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTask = {
  id: taskId,
  title: 'Tarea de prueba',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  projectId,
  assigneeId: null,
  description: null,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  project: { id: projectId, name: 'Proyecto Test' },
  assignee: null,
  _count: { comments: 0 },
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('tasksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getTasks ─────────────────────────────────────────────────────────────────
  describe('getTasks', () => {
    it('debe devolver tareas con paginación correcta', async () => {
      const mockTasks = [mockTask, { ...mockTask, id: 'task-2' }];
      vi.mocked(tasksRepository.findMany).mockResolvedValue({
        tasks: mockTasks,
        total: 25,
      });

      const result = await tasksService.getTasks({
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });

      expect(result.pagination.total).toBe(25);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10) = 3
      expect(result.data).toHaveLength(2);
    });
  });

  // ── getTaskById ───────────────────────────────────────────────────────────────
  describe('getTaskById', () => {
    it('debe devolver la tarea cuando existe', async () => {
      vi.mocked(tasksRepository.findById).mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(taskId);

      expect(result.data.id).toBe(taskId);
      expect(tasksRepository.findById).toHaveBeenCalledWith(taskId);
    });

    it('debe lanzar 404 cuando la tarea no existe', async () => {
      vi.mocked(tasksRepository.findById).mockResolvedValue(null);

      await expect(tasksService.getTaskById('id-inexistente'))
        .rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    });
  });

  // ── createTask ────────────────────────────────────────────────────────────────
  describe('createTask', () => {
    it('debe crear la tarea cuando el usuario es miembro del proyecto', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject as any);
      vi.mocked(tasksRepository.create).mockResolvedValue(mockTask);

      const result = await tasksService.createTask(
        { title: 'Nueva tarea', projectId, priority: 'MEDIUM' },
        userId
      );

      expect(result.data.title).toBe('Tarea de prueba');
      expect(tasksRepository.create).toHaveBeenCalledOnce();
    });

    it('debe lanzar 404 cuando el proyecto no existe', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      await expect(
        tasksService.createTask({ title: 'Nueva tarea', projectId: 'no-existe', priority: 'MEDIUM' }, userId)
      ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });

      // La tarea NO debe crearse
      expect(tasksRepository.create).not.toHaveBeenCalled();
    });

    it('debe lanzar 403 cuando el usuario NO es miembro del proyecto', async () => {
      const projectWithoutUser = {
        ...mockProject,
        ownerId: 'otro-usuario',
        members: [], // El userId no está en los miembros
      };
      vi.mocked(prisma.project.findUnique).mockResolvedValue(projectWithoutUser as any);

      await expect(
        tasksService.createTask({ title: 'Nueva tarea', projectId, priority: 'MEDIUM' }, userId)
      ).rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });

      expect(tasksRepository.create).not.toHaveBeenCalled();
    });
  });

  // ── deleteTask ────────────────────────────────────────────────────────────────
  describe('deleteTask', () => {
    it('debe eliminar la tarea cuando existe', async () => {
      vi.mocked(tasksRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(tasksRepository.delete).mockResolvedValue();

      await tasksService.deleteTask(taskId, userId);

      expect(tasksRepository.delete).toHaveBeenCalledWith(taskId);
    });

    it('debe lanzar 404 cuando la tarea no existe', async () => {
      vi.mocked(tasksRepository.findById).mockResolvedValue(null);

      await expect(tasksService.deleteTask('no-existe', userId))
        .rejects.toMatchObject({ statusCode: 404 });

      expect(tasksRepository.delete).not.toHaveBeenCalled();
    });
  });

  // ── createComment ─────────────────────────────────────────────────────────────
  describe('createComment', () => {
    it('debe lanzar 404 cuando la tarea no existe', async () => {
      vi.mocked(tasksRepository.findById).mockResolvedValue(null);

      await expect(
        tasksService.createComment('no-existe', { content: 'Hola' }, userId)
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(tasksRepository.createComment).not.toHaveBeenCalled();
    });

    it('debe crear el comentario cuando la tarea existe', async () => {
      const mockComment = {
        id: 'comment-1',
        content: 'Hola',
        taskId,
        authorId: userId,
        createdAt: new Date(),
        author: { id: userId, name: 'Test', email: 'test@test.com' },
      };
      vi.mocked(tasksRepository.findById).mockResolvedValue(mockTask);
      vi.mocked(tasksRepository.createComment).mockResolvedValue(mockComment);

      const result = await tasksService.createComment(taskId, { content: 'Hola' }, userId);

      expect(result.data.content).toBe('Hola');
      expect(tasksRepository.createComment).toHaveBeenCalledWith(taskId, userId, 'Hola');
    });
  });
});
