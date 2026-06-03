/**
 * users/users.service.ts + controller — Gestión del perfil de usuario
 */

import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../../infrastructure/database/prisma.js';
import { AppErrors } from '../middleware/errorHandler.js';

// ── DTOs ──────────────────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  avatarUrl: z.string().url('URL inválida').optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional(),
}).refine(
  (data) => {
    // Si se provee newPassword, currentPassword es obligatorio
    if (data.newPassword && !data.currentPassword) return false;
    return true;
  },
  { message: 'Para cambiar la contraseña debes proveer la contraseña actual', path: ['currentPassword'] }
);

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

// ── Service ───────────────────────────────────────────────────────────────────
export const usersService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true,
        avatarUrl: true, createdAt: true,
        _count: { select: { ownedProjects: true, assignedTasks: true } },
      },
    });
    if (!user) throw AppErrors.notFound('Usuario');
    return { data: user };
  },

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppErrors.notFound('Usuario');

    // Si quiere cambiar la contraseña, verificar la actual
    let newHashedPassword: string | undefined;
    if (dto.newPassword) {
      const matches = await bcrypt.compare(dto.currentPassword!, user.password);
      if (!matches) throw AppErrors.badRequest('La contraseña actual es incorrecta');
      newHashedPassword = await bcrypt.hash(dto.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(newHashedPassword && { password: newHashedPassword }),
      },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });

    return { data: updated };
  },

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  },
};

// ── Controller ────────────────────────────────────────────────────────────────
import { type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validate.js';

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await usersService.getProfile(req.user!.id);
      res.json(result);
    } catch (error) { next(error); }
  },

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as UpdateProfileDto;
      const result = await usersService.updateProfile(req.user!.id, dto);
      res.json(result);
    } catch (error) { next(error); }
  },

  async deleteMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deleteAccount(req.user!.id);
      res.status(204).end();
    } catch (error) { next(error); }
  },
};
