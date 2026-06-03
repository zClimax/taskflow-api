/**
 * prisma/seed.ts — Datos iniciales de prueba (Seeding)
 *
 * ¿Qué es el seeding?
 * ────────────────────
 * El seeding es el proceso de poblar la base de datos con datos iniciales.
 * Es útil para:
 *   - Tener datos de prueba en desarrollo desde el primer día
 *   - No tener que crear datos manualmente para probar la API
 *   - Que todos en el equipo tengan el mismo estado inicial de la BD
 *
 * Para ejecutar: npm run db:seed
 * Para resetear y volver a seedear: npm run db:reset (borra todo y re-migra)
 *
 * IMPORTANTE: Las contraseñas en el seed son hashes bcrypt de strings simples.
 * En el Módulo 6 aprenderemos a generarlas correctamente.
 * Por ahora usamos un hash precomputado de "Password123!" para los usuarios demo.
 */

import { PrismaClient, TaskStatus, TaskPriority, ProjectRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });


// Hash bcrypt de "Password123!" (generado con bcrypt.hash("Password123!", 12))
// En el Módulo 6 usaremos la librería bcrypt correctamente
const DEMO_PASSWORD_HASH =
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQN4gQtMlJJa';

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ── 1. Limpiar datos existentes (en orden para respetar foreign keys) ─────
  // Borramos en orden inverso a las dependencias
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ── 2. Crear usuarios de prueba ────────────────────────────────────────────
  console.log('👥 Creando usuarios...');

  const adminUser = await prisma.user.create({
    data: {
      name: 'Jorge Admin',
      email: 'admin@taskflow.com',
      password: DEMO_PASSWORD_HASH,
      role: 'ADMIN',
    },
  });

  const memberUser1 = await prisma.user.create({
    data: {
      name: 'Ana García',
      email: 'ana@taskflow.com',
      password: DEMO_PASSWORD_HASH,
      role: 'MEMBER',
    },
  });

  const memberUser2 = await prisma.user.create({
    data: {
      name: 'Luis Martínez',
      email: 'luis@taskflow.com',
      password: DEMO_PASSWORD_HASH,
      role: 'MEMBER',
    },
  });

  console.log(`  ✅ Creados: ${adminUser.email}, ${memberUser1.email}, ${memberUser2.email}`);

  // ── 3. Crear proyectos ─────────────────────────────────────────────────────
  console.log('📁 Creando proyectos...');

  const project1 = await prisma.project.create({
    data: {
      name: 'TaskFlow API Development',
      description: 'Desarrollo de la API REST de gestión de tareas',
      ownerId: adminUser.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Marketing Website',
      description: 'Rediseño del sitio web de marketing',
      ownerId: memberUser1.id,
    },
  });

  console.log(`  ✅ Creados: "${project1.name}", "${project2.name}"`);

  // ── 4. Añadir miembros a los proyectos ────────────────────────────────────
  console.log('🤝 Configurando miembros de proyectos...');

  await prisma.projectMember.createMany({
    data: [
      // adminUser es owner del project1 — también lo añadimos como miembro con OWNER role
      { userId: adminUser.id, projectId: project1.id, role: ProjectRole.OWNER },
      // Ana y Luis son miembros del project1
      { userId: memberUser1.id, projectId: project1.id, role: ProjectRole.MEMBER },
      { userId: memberUser2.id, projectId: project1.id, role: ProjectRole.ADMIN },
      // Ana es owner del project2, Luis es viewer
      { userId: memberUser1.id, projectId: project2.id, role: ProjectRole.OWNER },
      { userId: memberUser2.id, projectId: project2.id, role: ProjectRole.VIEWER },
    ],
  });

  // ── 5. Crear tareas ────────────────────────────────────────────────────────
  console.log('✅ Creando tareas...');

  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'Configurar entorno de desarrollo',
        description: 'Instalar Node.js, TypeScript, y configurar el proyecto base',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: adminUser.id,
      },
      {
        title: 'Diseñar esquema de base de datos',
        description: 'Definir modelos Prisma: User, Project, Task, Comment',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: adminUser.id,
      },
      {
        title: 'Implementar autenticación JWT',
        description: 'Login, registro, refresh tokens y middleware de auth',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        projectId: project1.id,
        assigneeId: adminUser.id,
        dueDate: new Date('2026-07-01'),
      },
      {
        title: 'CRUD de proyectos',
        description: 'Implementar endpoints CREATE, READ, UPDATE, DELETE para proyectos',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: memberUser1.id,
      },
      {
        title: 'CRUD de tareas',
        description: 'Implementar endpoints con filtros, paginación y ordenamiento',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        projectId: project1.id,
        assigneeId: memberUser2.id,
      },
      {
        title: 'Configurar Swagger UI',
        description: 'Documentar todos los endpoints con OpenAPI 3.0',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        assigneeId: adminUser.id,
      },
      {
        title: 'Escribir tests de integración',
        description: 'Tests con Vitest + Supertest para todos los endpoints',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project1.id,
        assigneeId: null, // Sin asignar
      },
      // Tareas del proyecto 2
      {
        title: 'Diseño visual del sitio',
        description: 'Mockups en Figma para las páginas principales',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.HIGH,
        projectId: project2.id,
        assigneeId: memberUser1.id,
      },
      {
        title: 'Implementar landing page',
        description: 'HTML/CSS/JS vanilla, responsive',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        projectId: project2.id,
        assigneeId: memberUser2.id,
      },
    ],
  });

  console.log(`  ✅ Creadas: ${tasks.count} tareas`);

  // ── 6. Crear comentarios ───────────────────────────────────────────────────
  console.log('💬 Creando comentarios...');

  // Obtenemos la tarea de autenticación para añadirle comentarios
  const authTask = await prisma.task.findFirst({
    where: { title: { contains: 'autenticación' } },
  });

  if (authTask) {
    await prisma.comment.createMany({
      data: [
        {
          content: 'He investigado las mejores librerías. Usaré jsonwebtoken + bcrypt.',
          taskId: authTask.id,
          authorId: adminUser.id,
        },
        {
          content: 'Recuerda implementar el refresh token rotation para mayor seguridad.',
          taskId: authTask.id,
          authorId: memberUser2.id,
        },
        {
          content: '¿Vamos a usar OAuth también o solo JWT propio?',
          taskId: authTask.id,
          authorId: memberUser1.id,
        },
      ],
    });
    console.log('  ✅ Comentarios de ejemplo creados');
  }

  // ── Resumen final ──────────────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    comments: await prisma.comment.count(),
  };

  console.log('\n✨ Seed completado exitosamente!');
  console.log('─────────────────────────────────');
  console.log(`  👥 Usuarios:    ${counts.users}`);
  console.log(`  📁 Proyectos:   ${counts.projects}`);
  console.log(`  ✅ Tareas:      ${counts.tasks}`);
  console.log(`  💬 Comentarios: ${counts.comments}`);
  console.log('─────────────────────────────────');
  console.log('\n📧 Credenciales de prueba:');
  console.log('  admin@taskflow.com  / Password123!');
  console.log('  ana@taskflow.com    / Password123!');
  console.log('  luis@taskflow.com   / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
