/**
 * projects/projects.repository.ts — Capa de acceso a datos para Projects
 */

import { type Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.js';
import type { CreateProjectDto, UpdateProjectDto, GetProjectsQueryDto } from './projects.dto.js';

export type ProjectWithCounts = Prisma.ProjectGetPayload<{
  include: {
    owner: { select: { id: true; name: true; email: true } };
    _count: { select: { tasks: true; members: true } };
  };
}>;

const projectInclude = {
  owner: { select: { id: true, name: true, email: true } },
  _count: { select: { tasks: true, members: true } },
} satisfies Prisma.ProjectInclude;

export const projectsRepository = {
  async findMany(
    userId: string,
    pagination: GetProjectsQueryDto
  ): Promise<{ projects: ProjectWithCounts[]; total: number }> {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 20;


    // Solo proyectos donde el usuario es owner o miembro
    const where: Prisma.ProjectWhereInput = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { projects, total };
  },

  async findById(id: string): Promise<ProjectWithCounts | null> {
    return prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
  },

  async create(data: CreateProjectDto, ownerId: string): Promise<ProjectWithCounts> {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
        // Al crear el proyecto, añadimos al owner como miembro con rol OWNER
        members: {
          create: { userId: ownerId, role: 'OWNER' },
        },
      },
      include: projectInclude,
    });
  },

  async update(id: string, data: UpdateProjectDto): Promise<ProjectWithCounts> {
    return prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: projectInclude,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  },

  // Verificar si un usuario es miembro de un proyecto y cuál es su rol
  async findMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
  },
};
