/**
 * tests/integration/tasks.test.ts — Integration Tests del CRUD de tareas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { app } from '../../app.js';
import { cleanDatabase, createProject, createTask } from '../factories.js';

// ── Helper: registrar usuario y obtener token ─────────────────────────────────
// Usamos emails únicos por invocación para evitar colisiones 409 entre tests
async function registerAndLogin() {
  const email = `user.${randomUUID().slice(0, 8)}@tasks-test.com`;
  const response = await request(app).post('/api/v1/auth/register').send({
    name: 'Integration User',
    email,
    password: 'TestPass123',
  });

  if (!response.body.data) {
    throw new Error(`Register failed: ${JSON.stringify(response.body)}`);
  }

  return {
    token: response.body.data.accessToken as string,
    userId: response.body.data.user.id as string,
    refreshToken: response.body.data.refreshToken as string,
  };
}

describe('Tasks Integration Tests — /api/v1/tasks', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  // ── GET /tasks ────────────────────────────────────────────────────────────────
  describe('GET /tasks', () => {
    it('debe devolver lista de tareas con paginación', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      await createTask(project.id, { title: 'Tarea A', status: 'TODO' });
      await createTask(project.id, { title: 'Tarea B', status: 'DONE' });

      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('debe filtrar tareas por status', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      await createTask(project.id, { status: 'TODO' });
      await createTask(project.id, { status: 'DONE' });
      await createTask(project.id, { status: 'DONE' });

      const response = await request(app)
        .get('/api/v1/tasks?status=DONE')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.total).toBe(2);
      response.body.data.forEach((t: any) => {
        expect(t.status).toBe('DONE');
      });
    });

    it('debe paginar correctamente', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      // Crear 5 tareas
      for (let i = 1; i <= 5; i++) {
        await createTask(project.id, { title: `Tarea ${i}` });
      }

      const response = await request(app)
        .get('/api/v1/tasks?page=1&limit=3')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toMatchObject({
        total: 5,
        page: 1,
        limit: 3,
        totalPages: 2,
      });
    });
  });

  // ── GET /tasks/:id ────────────────────────────────────────────────────────────
  describe('GET /tasks/:id', () => {
    it('debe devolver la tarea con sus relaciones', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id, { title: 'Mi tarea especial' });

      const response = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(task.id);
      expect(response.body.data.title).toBe('Mi tarea especial');
      // Debe incluir el proyecto relacionado
      expect(response.body.data.project).toBeDefined();
      expect(response.body.data.project.id).toBe(project.id);
    });

    it('debe devolver 404 para una tarea inexistente', async () => {
      const { token } = await registerAndLogin();

      const response = await request(app)
        .get('/api/v1/tasks/id-que-no-existe')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ── POST /tasks ───────────────────────────────────────────────────────────────
  describe('POST /tasks', () => {
    it('debe crear una tarea y devolverla con status TODO por defecto', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Mi nueva tarea de integración',
          projectId: project.id,
          priority: 'HIGH',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        title: 'Mi nueva tarea de integración',
        status: 'TODO',   // Default
        priority: 'HIGH',
        projectId: project.id,
      });
    });

    it('debe devolver 400 si falta el título', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ projectId: project.id }); // Sin title

      expect(response.status).toBe(400);
      expect(response.body.error.details.body.title).toBeDefined();
    });

    it('debe devolver 404 si el proyecto no existe', async () => {
      const { token } = await registerAndLogin();

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', projectId: 'proyecto-inexistente', priority: 'MEDIUM' });

      expect(response.status).toBe(404);
    });
  });

  // ── PATCH /tasks/:id ──────────────────────────────────────────────────────────
  describe('PATCH /tasks/:id', () => {
    it('debe actualizar el status de una tarea', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id);

      const response = await request(app)
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('debe devolver 400 con status inválido', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id);

      const response = await request(app)
        .patch(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'ESTADO_INVALIDO' });

      expect(response.status).toBe(400);
    });
  });

  // ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
  describe('DELETE /tasks/:id', () => {
    it('debe eliminar la tarea y devolver 204', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id);

      const deleteResponse = await request(app)
        .delete(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(204);

      // Verificar que ya no existe
      const getResponse = await request(app)
        .get(`/api/v1/tasks/${task.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });

  // ── COMMENTS ──────────────────────────────────────────────────────────────────
  describe('Comments /tasks/:id/comments', () => {
    it('debe crear y listar comentarios', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id);

      // Crear comentario
      const createResp = await request(app)
        .post(`/api/v1/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Primer comentario de integración' });

      expect(createResp.status).toBe(201);
      expect(createResp.body.data.content).toBe('Primer comentario de integración');
      expect(createResp.body.data.author).toBeDefined();

      // Listar comentarios
      const listResp = await request(app)
        .get(`/api/v1/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${token}`);

      expect(listResp.status).toBe(200);
      expect(listResp.body.data).toHaveLength(1);
    });

    it('debe eliminar un comentario propio', async () => {
      const { token, userId } = await registerAndLogin();
      const project = await createProject(userId);
      const task = await createTask(project.id);

      const createResp = await request(app)
        .post(`/api/v1/tasks/${task.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Comentario a eliminar' });

      const commentId = createResp.body.data.id;

      const deleteResp = await request(app)
        .delete(`/api/v1/tasks/${task.id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResp.status).toBe(204);
    });
  });
});
