/**
 * routes/auth.routes.ts — Rutas de autenticación
 *
 * Los comentarios @openapi son leídos por swagger-jsdoc para generar
 * la documentación interactiva en /api/docs.
 * Esto es "docs-as-code": la doc vive junto al código que describe.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { AppErrors } from '../middleware/errorHandler.js';

export const authRouter = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Devuelve los tokens de acceso.
 *     security: []  # Este endpoint NO requiere autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jorge García
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jorge@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiPassword123!"
 *                 minLength: 8
 *                 description: Mínimo 8 caracteres, una mayúscula y un número
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         description: Datos inválidos (email mal formado, contraseña corta, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/register', (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO Módulo 6: implementar lógica real de registro con bcrypt + JWT
    res.status(201).json({
      data: {
        message: '✅ Endpoint de registro — se implementará en el Módulo 6',
        expectedBody: { name: 'string', email: 'string', password: 'string (min 8 chars)' },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y devuelve access token + refresh token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jorge@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiPassword123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/login', (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO Módulo 6: verificar credenciales y generar JWT
    res.json({
      data: { message: '✅ Endpoint de login — se implementará en el Módulo 6' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token
 *     description: |
 *       Usa el refresh token para obtener un nuevo access token sin volver a hacer login.
 *       El access token dura 15 minutos. El refresh token dura 7 días.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGci..."
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/refresh', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ Refresh token — se implementará en el Módulo 6' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: Invalida el refresh token en la base de datos. El access token expira naturalmente.
 *     responses:
 *       204:
 *         description: Sesión cerrada exitosamente (sin body)
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/logout', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
