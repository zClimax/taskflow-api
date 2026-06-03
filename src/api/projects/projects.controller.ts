/**
 * projects/projects.controller.ts — Handlers HTTP para Projects
 */

import { type Request, type Response, type NextFunction } from 'express';
import { projectsService } from './projects.service.js';
import type { GetProjectsQueryDto, CreateProjectDto, UpdateProjectDto } from './projects.dto.js';
import { prisma } from '../../infrastructure/database/prisma.js';

// TODO Módulo 6: reemplazar con req.user.id del middleware JWT
async function getRequesterId(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@taskflow.com' },
    select: { id: true },
  });
  return user?.id ?? 'unknown';
}

export const projectsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = res.locals['parsedQuery'] as GetProjectsQueryDto;
      const requesterId = await getRequesterId();
      const result = await projectsService.getProjects(query, requesterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },


  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = await getRequesterId();
      const result = await projectsService.getProjectById(id, requesterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateProjectDto;
      const requesterId = await getRequesterId();
      const result = await projectsService.createProject(dto, requesterId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateProjectDto;
      const requesterId = await getRequesterId();
      const result = await projectsService.updateProject(id, dto, requesterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requesterId = await getRequesterId();
      await projectsService.deleteProject(id, requesterId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
