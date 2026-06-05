/**
 * tests/integration/auth.test.ts — Integration Tests del flujo de autenticación
 *
 * ¿Qué son los Integration Tests?
 * ─────────────────────────────────
 * Prueban el flujo completo: HTTP → Middleware → Controller → Service → BD.
 * Usan la base de datos de tests REAL (no mocks).
 * Supertest hace las peticiones HTTP sin levantar el servidor.
 *
 * Diferencia con Unit Tests:
 *   Unit Test:        authService.login() con prisma mockeado
 *   Integration Test: POST /api/v1/auth/login con BD real
 *
 * Los integration tests son más lentos pero prueban que todo funciona JUNTO.
 *
 * ⚠️ NOTA DE AISLAMIENTO:
 *   Vitest corre archivos de test en paralelo por defecto.
 *   Para tests que comparten una BD, usamos fileParallelism: false en vitest.config.ts
 *   para asegurarnos de que los archivos corran de forma secuencial.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { app } from '../../app.js';
import { cleanDatabase } from '../factories.js';

// ── Limpiar la BD antes de cada test para aislamiento completo ────────────────
beforeEach(async () => {
  await cleanDatabase();
});

// ── Helper: generar emails únicos para evitar colisiones 409 entre tests ───────
// Cada test necesita su propio email para ser independiente
function uniqueEmail(prefix = 'user') {
  return `${prefix}.${randomUUID().slice(0, 8)}@integration.com`;
}

// ── Helper: registrar usuario y extraer tokens ────────────────────────────────
async function registerUser(name = 'Test User', password = 'TestPass123') {
  const email = uniqueEmail(name.toLowerCase().replace(' ', ''));
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({ name, email, password });

  if (response.status !== 201) {
    throw new Error(`Register failed [${response.status}]: ${JSON.stringify(response.body)}`);
  }
  return {
    email,
    accessToken: response.body.data.accessToken as string,
    refreshToken: response.body.data.refreshToken as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Auth Integration Tests — /api/v1/auth', () => {
  // ── REGISTER ─────────────────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    it('debe registrar un usuario nuevo y devolver tokens', async () => {
      const email = uniqueEmail('jorge');
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Jorge López', email, password: 'TestPass123' });

      // Verificar código HTTP
      expect(response.status).toBe(201);

      // Verificar estructura (el email es dinámico, así que verificamos solo el formato)
      expect(response.body.data.user.name).toBe('Jorge López');
      expect(response.body.data.user.email).toBe(email); // Email en minúsculas (normalizado)
      expect(response.body.data.user.role).toBe('MEMBER');
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));

      // La respuesta NO debe incluir la contraseña
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('debe devolver 400 si la contraseña no cumple los requisitos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jorge',
          email: uniqueEmail('weak'),
          password: 'weak', // Sin mayúscula, sin número, muy corta
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.body.password).toBeDefined();
    });

    it('debe devolver 400 si la contraseña no cumple los requisitos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jorge',
          email: uniqueEmail('weak'),
          password: 'weak', // Sin mayúscula, sin número, muy corta
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.body.password).toBeDefined();
    });

    it('debe devolver 409 si el email ya está registrado', async () => {
      const email = uniqueEmail('dup');
      const userData = { name: 'Jorge', email, password: 'TestPass123' };

      // Primer registro — OK
      await request(app).post('/api/v1/auth/register').send(userData);

      // Segundo registro con mismo email — Conflict
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  // ── LOGIN ─────────────────────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    // Cada test de login crea su propio usuario con email único
    // para no depender de estado compartido entre tests

    it('debe devolver tokens con credenciales correctas', async () => {
      const { email } = await registerUser('Login Test');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'TestPass123' });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(email);
    });

    it('debe devolver 401 con contraseña incorrecta', async () => {
      const { email } = await registerUser('Wrong Pass');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPass999' });

      expect(response.status).toBe(401);
      // Mensaje genérico — no revela si el email existe
      expect(response.body.error.message).toBe('Email o contraseña incorrectos');
    });

    it('debe devolver 401 con email que no existe (mismo mensaje que password incorrecta)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: `noexiste.${randomUUID()}@nowhere.com`, password: 'TestPass123' });

      expect(response.status).toBe(401);
      // Mismo mensaje — el atacante no puede distinguir si el email existe o no
      expect(response.body.error.message).toBe('Email o contraseña incorrectos');
    });
  });

  // ── REFRESH + LOGOUT ──────────────────────────────────────────────────────────
  describe('POST /auth/refresh + /auth/logout', () => {
    it('debe generar nuevos tokens válidos con refresh válido', async () => {
      const { refreshToken } = await registerUser('Refresh User');

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBeDefined();
      // El nuevo refresh token debe ser un JWT con 3 partes (header.payload.signature)
      const newRefresh: string = response.body.data.refreshToken;
      expect(newRefresh).toBeDefined();
      expect(newRefresh.split('.')).toHaveLength(3);
    });

    it('debe devolver 401 si el refresh token es inválido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token.invalido.completamente' });

      expect(response.status).toBe(401);
    });

    it('debe cerrar sesión: el refresh token ya no debe funcionar después del logout', async () => {
      const { accessToken, refreshToken } = await registerUser('Logout User');

      // Logout
      const logoutResp = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(logoutResp.status).toBe(204);

      // Intentar usar el refresh token ya eliminado → 401
      const refreshResp = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshResp.status).toBe(401);
    });
  });

  // ── RUTAS PROTEGIDAS ──────────────────────────────────────────────────────────
  describe('Rutas protegidas (middleware authenticate)', () => {
    it('debe devolver 401 al acceder a /tasks sin token', async () => {
      const response = await request(app).get('/api/v1/tasks');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('debe devolver 401 con token malformado', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', 'Bearer token.falso');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('TOKEN_INVALID');
    });

    it('debe acceder a /tasks con token válido y devolver 200', async () => {
      const { accessToken } = await registerUser('Auth Check');

      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
    });
  });
});
