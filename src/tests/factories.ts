/**
 * tests/factories.ts — Fábricas de datos de tests
 *
 * ¿Por qué factories?
 * ────────────────────
 * En lugar de repetir la misma creación de datos en cada test,
 * las factories centralizan la creación de entidades con valores
 * sensatos por defecto que se pueden sobreescribir.
 *
 * Ventaja: si cambia el schema, solo actualizas la factory.
 *
 * Patrón:
 *   createUser()          → usuario con valores por defecto
 *   createUser({ role: 'ADMIN' }) → sobreescribir campos específicos
 */

import bcrypt from 'bcrypt';
import { prisma } from '../infrastructure/database/prisma.js';
import type { User, Project, Task } from '@prisma/client';

// ── Contadores para generar emails únicos en cada test ────────────────────────
let userCounter = 0;
let projectCounter = 0;

export function resetCounters() {
  userCounter = 0;
  projectCounter = 0;
}

// ── Factory: Usuario ──────────────────────────────────────────────────────────
export async function createUser(overrides: Partial<{
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
}> = {}): Promise<User> {
  userCounter++;
  const defaults = {
    name: `Test User ${userCounter}`,
    email: `test.user.${userCounter}.${Date.now()}@test.com`,
    password: await bcrypt.hash('TestPass123', 4), // 4 rounds en tests (rápido)
    role: 'MEMBER' as const,
  };

  return prisma.user.create({
    data: { ...defaults, ...overrides },
  });
}

// ── Factory: Proyecto ─────────────────────────────────────────────────────────
export async function createProject(
  ownerId: string,
  overrides: Partial<{ name: string; description: string }> = {}
): Promise<Project> {
  projectCounter++;
  const defaults = {
    name: `Proyecto Test ${projectCounter}`,
    description: 'Proyecto creado en tests',
  };

  return prisma.project.create({
    data: {
      ...defaults,
      ...overrides,
      ownerId,
      members: {
        create: { userId: ownerId, role: 'OWNER' },
      },
    },
  });
}

// ── Factory: Tarea ────────────────────────────────────────────────────────────
export async function createTask(
  projectId: string,
  overrides: Partial<{
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigneeId: string | null;
  }> = {}
): Promise<Task> {
  const defaults = {
    title: `Tarea Test ${Date.now()}`,
    status: 'TODO' as const,
    priority: 'MEDIUM' as const,
    assigneeId: null,
  };

  return prisma.task.create({
    data: { ...defaults, ...overrides, projectId },
  });
}

// ── Helper: limpiar todo entre tests ─────────────────────────────────────────
// Llámalo en beforeEach de tests de integración para aislar cada test
export async function cleanDatabase() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  resetCounters();
}
