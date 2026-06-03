/**
 * routes/users.routes.ts — Rutas de usuarios
 */

import { Router, type Request, type Response, type NextFunction } from 'express';

export const usersRouter = Router();

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Obtener perfil del usuario autenticado
 *     description: Devuelve los datos del usuario que está haciendo la petición (identificado por el JWT).
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.get('/me', (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO Módulo 6: extraer userId del JWT y buscar en BD
    res.json({ data: { message: '✅ GET /users/me — se implementará en el Módulo 6' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza parcialmente el nombre o email del usuario autenticado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jorge García Actualizado
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@example.com
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.patch('/me', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: { message: '✅ PATCH /users/me — se implementará en el Módulo 6' } });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /users/me:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar cuenta del usuario
 *     description: |
 *       Elimina permanentemente la cuenta y todos los datos asociados.
 *       Esta operación es irreversible.
 *     responses:
 *       204:
 *         description: Cuenta eliminada exitosamente
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
usersRouter.delete('/me', (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
