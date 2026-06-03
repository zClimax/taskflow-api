/**
 * projects/projects.controller.ts — Handlers HTTP para Projects
 */

import { type Request, type Response, type NextFunction } from 'express';
import { projectsService } from './projects.service.js';
import type { GetProjectsQueryDto, CreateProjectDto, UpdateProjectDto } from './projects.dto.js';
// req.user viene del middleware authenticate (declarado en src/types/express.d.ts)

export const projectsController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = res.locals['parsedQuery'] as GetProjectsQueryDto;
      const result = await projectsService.getProjects(query, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },


  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await projectsService.getProjectById(id, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateProjectDto;
      const result = await projectsService.createProject(dto, req.user!.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateProjectDto;
      const result = await projectsService.updateProject(id, dto, req.user!.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await projectsService.deleteProject(id, req.user!.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
