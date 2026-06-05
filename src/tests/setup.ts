/**
 * tests/setup.ts — Configuración global de todos los tests
 *
 * Este archivo se ejecuta ANTES de cada suite de tests.
 *
 * Responsabilidades:
 *   1. Cargar variables de entorno de test
 *   2. Verificar que la BD de test está disponible
 *   3. Limpiar la BD al terminar todos los tests
 */

import 'dotenv/config';
import { afterAll, beforeAll } from 'vitest';

// Forzar el entorno de tests (importante para que env.ts use los valores de test)
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/taskflow_test';

// Importamos después de setear las env vars
import { prisma } from '../infrastructure/database/prisma.js';

// ── Hook global: antes de TODOS los tests ─────────────────────────────────────
beforeAll(async () => {
  // Verificar conexión a la BD de tests
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión a taskflow_test verificada');
  } catch (error) {
    console.error('❌ No se puede conectar a taskflow_test:', error);
    throw error;
  }
});

// ── Hook global: después de TODOS los tests ───────────────────────────────────
afterAll(async () => {
  // Limpiar TODOS los datos de test al finalizar
  // El orden importa por las foreign keys: primero los hijos, luego los padres
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();
  console.log('🧹 Base de datos de tests limpiada');
});
