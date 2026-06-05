/**
 * auth/auth.service.test.ts — Unit Tests del Auth Service
 *
 * ¿Qué son los Unit Tests?
 * ─────────────────────────
 * Prueban UNA unidad de código (una función, una clase) en AISLAMIENTO.
 * Las dependencias externas (BD, red) se reemplazan con MOCKS.
 *
 * ¿Por qué mocks?
 * ────────────────
 * - Velocidad: no hay I/O de red o disco → corren en milisegundos
 * - Control: puedes simular cualquier escenario (BD caída, usuario no existe, etc.)
 * - Aislamiento: si el test falla, sabes que el problema está en este service,
 *   no en la BD o en otro módulo
 *
 * ¿Qué mockeamos aquí?
 * ─────────────────────
 * - `prisma`: para no conectar a la BD de verdad
 * - `bcrypt`: para que hash/compare sean instantáneos
 * - Los generadores de tokens: para controlar qué token se genera
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../middleware/errorHandler.js';

// ── Mocks ANTES de importar el módulo a testear ───────────────────────────────
// vi.mock() intercepta el módulo y reemplaza sus exports con funciones spy

vi.mock('../../infrastructure/database/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$hashed_password'),
    compare: vi.fn(),
  },
}));

vi.mock('../middleware/authenticate.js', () => ({
  generateAccessToken: vi.fn().mockReturnValue('mock_access_token'),
  generateRefreshToken: vi.fn().mockReturnValue('mock_refresh_token'),
  verifyRefreshToken: vi.fn(),
}));

// Importar DESPUÉS de declarar los mocks
import { authService } from './auth.service.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import bcrypt from 'bcrypt';
import * as authenticateModule from '../middleware/authenticate.js';

// ── Datos de prueba ───────────────────────────────────────────────────────────
const mockUser = {
  id: 'user-cuid-123',
  email: 'test@example.com',
  name: 'Test User',
  password: '$hashed_password',
  role: 'MEMBER' as const,
};

// ── Suite de tests ────────────────────────────────────────────────────────────
describe('authService', () => {
  // beforeEach: se ejecuta antes de CADA test
  // Limpia los mocks para que cada test empiece desde cero
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── REGISTER ────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('debe crear un usuario y devolver tokens cuando el email es nuevo', async () => {
      // ARRANGE: configurar los mocks para este escenario
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null); // email libre
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      // ACT: ejecutar la función bajo prueba
      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
      });

      // ASSERT: verificar el resultado
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock_access_token');
      expect(result.refreshToken).toBe('mock_refresh_token');

      // Verificar que se llamaron las funciones correctas
      expect(prisma.user.create).toHaveBeenCalledOnce();
      expect(bcrypt.hash).toHaveBeenCalledWith('TestPass123', 12);
    });

    it('debe lanzar 409 cuando el email ya existe', async () => {
      // ARRANGE: simular que el usuario ya existe
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // ACT & ASSERT: verificar que lanza el error correcto
      await expect(
        authService.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        })
      ).rejects.toThrow(AppError);

      // Verificar el código de error
      await expect(
        authService.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        code: 'CONFLICT',
      });

      // Verificar que NO se intentó crear el usuario
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('NO debe devolver la contraseña del usuario en la respuesta', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const result = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
      });

      // La respuesta NO debe incluir la contraseña bajo ningún nombre
      expect(result.user).not.toHaveProperty('password');
      expect(JSON.stringify(result)).not.toContain('$hashed_password');
      expect(JSON.stringify(result)).not.toContain('TestPass123');
    });
  });

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('debe devolver tokens cuando las credenciales son correctas', async () => {
      // ARRANGE
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      // ACT
      const result = await authService.login({
        email: 'test@example.com',
        password: 'TestPass123',
      });

      // ASSERT
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock_access_token');
      expect(bcrypt.compare).toHaveBeenCalledWith('TestPass123', '$hashed_password');
    });

    it('debe lanzar 401 con mensaje genérico cuando la contraseña es incorrecta', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never); // password incorrecta

      await expect(
        authService.login({ email: 'test@example.com', password: 'WrongPass' })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Email o contraseña incorrectos', // Mensaje genérico
      });
    });

    it('debe lanzar 401 con mensaje genérico cuando el email no existe (timing attack prevention)', async () => {
      // El usuario NO existe
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      // bcrypt.compare se llama igualmente con un dummy hash para normalizar el tiempo de respuesta
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ email: 'noexiste@example.com', password: 'AnyPass' })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Email o contraseña incorrectos',
      });

      // CLAVE: bcrypt.compare debe haberse llamado incluso cuando el usuario no existe
      // Esto previene que un atacante detecte si el email está registrado por el tiempo de respuesta
      // Se llama con el DUMMY_HASH pre-computado, no con el password del usuario (el usuario no existe)
      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });
});
