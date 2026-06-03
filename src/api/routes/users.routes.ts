/**
 * routes/users.routes.ts — Rutas de usuario (requieren autenticación)
 */

import { Router } from 'express';
import { usersController, UpdateProfileSchema } from '../users/users.module.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

export const usersRouter = Router();

// Todas las rutas de /users requieren autenticación
usersRouter.use(authenticate);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.get('/me', usersController.getMe);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               currentPassword:
 *                 type: string
 *                 description: Requerido si se envía newPassword
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
usersRouter.patch('/me', validate({ body: UpdateProfileSchema }), usersController.updateMe);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar cuenta del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cuenta eliminada
 */
usersRouter.delete('/me', usersController.deleteMe);
