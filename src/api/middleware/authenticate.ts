/**
 * middleware/authenticate.ts — Middleware de autenticación JWT
 *
 * ¿Cómo funciona?
 * ────────────────
 * 1. El cliente envía el access token en el header: Authorization: Bearer <token>
 * 2. Este middleware extrae el token
 * 3. Lo verifica con la clave secreta (si alguien modificó el token, la firma no coincide)
 * 4. Extrae el payload (userId, email, role)
 * 5. Lo pone en req.user para que los controllers lo usen
 * 6. Si algo falla → 401 Unauthorized
 *
 * Uso en rutas:
 *   router.get('/me', authenticate, usersController.getMe)
 *   router.post('/tasks', authenticate, validate({body: ...}), tasksController.create)
 *
 * Importante: authenticate debe ir ANTES del validate y del controller.
 */

import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';

// ── Tipo del payload que guardamos en el access token ─────────────────────────
interface JwtAccessPayload {
  sub: string;            // Subject = userId (convención JWT estándar)
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // 1. Extraer el token del header Authorization
  // Formato esperado: "Bearer eyJhbGciOiJI..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Token de autenticación requerido. Incluye: Authorization: Bearer <token>',
      },
    });
    return;
  }

  const token = authHeader.split(' ')[1]; // Extrae solo el token, sin "Bearer "

  try {
    // 2. Verificar y decodificar el token
    // Si el token fue modificado, expiró o tiene firma inválida → lanza error
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtAccessPayload;

    // 3. Añadir el usuario al request para que los controllers lo usen
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };

    next(); // Token válido → continuar al siguiente middleware/controller
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          status: 401,
          code: 'TOKEN_EXPIRED',
          message: 'El token ha expirado. Usa el refresh token para obtener uno nuevo.',
        },
      });
    } else {
      res.status(401).json({
        error: {
          status: 401,
          code: 'TOKEN_INVALID',
          message: 'Token inválido o malformado.',
        },
      });
    }
  }
}

// ── Helper para generar tokens (usado en auth.service.ts) ─────────────────────
export function generateAccessToken(user: { id: string; email: string; name: string; role: string }): string {
  return jwt.sign(
    {
      sub: user.id,       // sub = subject, es la convención estándar de JWT para el ID
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { sub: string };
}
