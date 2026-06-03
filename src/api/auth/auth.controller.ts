/**
 * auth/auth.controller.ts — Handlers HTTP para autenticación
 */

import { type Request, type Response, type NextFunction } from 'express';
import { authService } from './auth.service.js';
import type { RegisterDto, LoginDto, RefreshDto } from './auth.dto.js';

export const authController = {
  // POST /auth/register
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as RegisterDto;
      const result = await authService.register(dto);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/login
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as LoginDto;
      const result = await authService.login(dto);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as RefreshDto;
      const result = await authService.refresh(dto);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/logout
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      // req.user viene del middleware authenticate
      if (req.user && refreshToken) {
        await authService.logout(refreshToken, req.user.id);
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/logout-all — cierra sesión en todos los dispositivos
  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logoutAll(req.user.id);
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
