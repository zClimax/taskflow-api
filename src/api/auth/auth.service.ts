/**
 * auth/auth.service.ts — Lógica de negocio de Autenticación
 *
 * Flujo de registro:
 *   1. Verificar que el email no exista (unicidad)
 *   2. Hashear la contraseña con bcrypt (salt rounds = 12)
 *   3. Crear el usuario en la BD
 *   4. Generar access token + refresh token
 *   5. Guardar el refresh token hasheado en la BD
 *   6. Retornar tokens + datos del usuario (sin la contraseña)
 *
 * Flujo de login:
 *   1. Buscar el usuario por email
 *   2. Comparar la contraseña con bcrypt.compare()
 *   3. Si coincide → generar tokens y guardar refresh
 *   4. Si no coincide → 401 con mensaje genérico (no revelar si el email existe)
 *
 * Flujo de refresh:
 *   1. Verificar el refresh token con JWT
 *   2. Buscar el token hasheado en la BD
 *   3. Si existe → generar nuevo access token
 *   4. Rotation: eliminar el token viejo, guardar uno nuevo
 *
 * Flujo de logout:
 *   1. Eliminar el refresh token de la BD
 *   2. El access token expira solo (no se puede revocar — es stateless)
 */

import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AppErrors } from '../middleware/errorHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/authenticate.js';
import type { RegisterDto, LoginDto, RefreshDto } from './auth.dto.js';

// Cuántas "rounds" de hasheo aplica bcrypt. 12 = buen balance seguridad/velocidad.
// Cada round duplica el tiempo → 12 rounds ≈ 300ms en hardware moderno
const BCRYPT_ROUNDS = 12;

// ¿Cuándo expira el refresh token guardado en la BD?
function getRefreshExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7); // 7 días desde ahora
  return d;
}

// ── Respuesta estándar de auth (sin exponer la contraseña) ───────────────────
function buildAuthResponse(user: { id: string; email: string; name: string; role: string }, tokens: { accessToken: string; refreshToken: string }) {
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export const authService = {
  // ── REGISTER ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // 1. Verificar unicidad del email
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      // Error 409 Conflict — el recurso ya existe
      throw AppErrors.conflict('Ya existe una cuenta con ese email');
    }

    // 2. Hashear la contraseña — NUNCA guardar texto plano
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // 3. Crear el usuario
    const user = await prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true }, // NUNCA devolver password
    });

    // 4. Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);

    // 5. Guardar refresh token HASHEADO en la BD
    // ¿Por qué hashearlo? Por si roban la BD, no tienen los tokens directamente
    const hashedRefresh = await bcrypt.hash(refreshToken, 10); // 10 rounds (menos crítico)
    await prisma.refreshToken.create({
      data: { token: hashedRefresh, userId: user.id, expiresAt: getRefreshExpiry() },
    });

    return buildAuthResponse(user, { accessToken, refreshToken });
  },

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // 1. Buscar el usuario (con la contraseña — la única vez que la pedimos)
    const user = await prisma.user.findUnique({ where: { email: dto.email } });

    // Mensaje genérico — no revelar si el email existe o no (seguridad)
    const GENERIC_ERROR = 'Email o contraseña incorrectos';

    if (!user) {
      // Hacemos bcrypt.compare de todos modos para evitar timing attacks
      // (si retornamos inmediatamente cuando no existe, el tiempo de respuesta revela que el email no existe)
      await bcrypt.compare(dto.password, '$2b$12$dummy_hash_to_prevent_timing_attack');
      throw AppErrors.unauthorized(GENERIC_ERROR);
    }

    // 2. Comparar contraseña — bcrypt.compare() hace el trabajo pesado
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw AppErrors.unauthorized(GENERIC_ERROR);
    }

    // 3. Generar tokens
    const userData = { id: user.id, email: user.email, name: user.name, role: user.role };
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(user.id);

    // 4. Guardar refresh token en la BD
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: { token: hashedRefresh, userId: user.id, expiresAt: getRefreshExpiry() },
    });

    return buildAuthResponse(userData, { accessToken, refreshToken });
  },

  // ── REFRESH ───────────────────────────────────────────────────────────────
  async refresh(dto: RefreshDto) {
    // 1. Verificar que el JWT del refresh token sea válido
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(dto.refreshToken);
    } catch {
      throw AppErrors.unauthorized('Refresh token inválido o expirado');
    }

    // 2. Buscar tokens activos del usuario en la BD
    const storedTokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });

    // 3. Verificar que el token enviado coincida con uno guardado
    let matchedTokenId: string | null = null;
    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(dto.refreshToken, stored.token);
      if (matches) { matchedTokenId = stored.id; break; }
    }

    if (!matchedTokenId) {
      throw AppErrors.unauthorized('Refresh token no encontrado o ya utilizado');
    }

    // 4. Buscar datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw AppErrors.unauthorized('Usuario no encontrado');

    // 5. Token Rotation — eliminar el token viejo y crear uno nuevo
    // Esto previene el reuso: si alguien roba el token y lo usa primero,
    // el usuario legítimo obtendrá un error y sabrá que algo pasó
    const newRefreshToken = generateRefreshToken(user.id);
    const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: matchedTokenId } }),
      prisma.refreshToken.create({
        data: { token: hashedNewRefresh, userId: user.id, expiresAt: getRefreshExpiry() },
      }),
    ]);

    return {
      accessToken: generateAccessToken(user),
      refreshToken: newRefreshToken,
    };
  },

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  async logout(refreshToken: string, userId: string) {
    // Buscar y eliminar el refresh token de la BD
    const storedTokens = await prisma.refreshToken.findMany({
      where: { userId },
    });

    for (const stored of storedTokens) {
      const matches = await bcrypt.compare(refreshToken, stored.token);
      if (matches) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
        return; // Token encontrado y eliminado
      }
    }
    // Si no se encontró el token, no es un error — simplemente no hacemos nada
  },

  // ── LOGOUT DE TODOS LOS DISPOSITIVOS ─────────────────────────────────────
  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
