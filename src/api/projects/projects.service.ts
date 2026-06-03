/**
 * projects/projects.service.ts — Lógica de negocio para Projects
 */

import { AppErrors } from '../middleware/errorHandler.js';
import { projectsRepository } from './projects.repository.js';
import type { CreateProjectDto, UpdateProjectDto, GetProjectsQueryDto } from './projects.dto.js';

export const projectsService = {
  async getProjects(query: GetProjectsQueryDto, userId: string) {
    const { projects, total } = await projectsRepository.findMany(userId, query);
    const { page, limit } = query;

    return {
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProjectById(id: string, userId: string) {
    const project = await projectsRepository.findById(id);

    if (!project) {
      throw AppErrors.notFound(`Proyecto con ID '${id}'`);
    }

    // Verificar que el usuario tenga acceso
    const isOwner = project.ownerId === userId;
    const isMember = await projectsRepository.findMember(id, userId);

    if (!isOwner && !isMember) {
      throw AppErrors.forbidden('No tienes acceso a este proyecto');
    }

    return { data: project };
  },

  async createProject(dto: CreateProjectDto, ownerId: string) {
    const project = await projectsRepository.create(dto, ownerId);
    return { data: project };
  },

  async updateProject(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await projectsRepository.findById(id);

    if (!project) {
      throw AppErrors.notFound(`Proyecto con ID '${id}'`);
    }

    // Solo el owner puede actualizar el proyecto
    if (project.ownerId !== userId) {
      throw AppErrors.forbidden('Solo el propietario puede actualizar este proyecto');
    }

    const updated = await projectsRepository.update(id, dto);
    return { data: updated };
  },

  async deleteProject(id: string, userId: string) {
    const project = await projectsRepository.findById(id);

    if (!project) {
      throw AppErrors.notFound(`Proyecto con ID '${id}'`);
    }

    // Solo el owner puede eliminar el proyecto
    if (project.ownerId !== userId) {
      throw AppErrors.forbidden('Solo el propietario puede eliminar este proyecto');
    }

    await projectsRepository.delete(id);
  },
};
