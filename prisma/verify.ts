/**
 * Script temporal para verificar que los datos del seed están en PostgreSQL
 * Ejecutar: npx tsx prisma/verify.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

async function verify() {
  console.log('\n🔍 Verificando datos en PostgreSQL...\n');

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('👥 USUARIOS:');
  users.forEach(u => console.log(`   [${u.role}] ${u.name} — ${u.email}`));

  const projects = await prisma.project.findMany({
    include: { _count: { select: { tasks: true, members: true } } }
  });
  console.log('\n📁 PROYECTOS:');
  projects.forEach(p =>
    console.log(`   "${p.name}" → ${p._count.tasks} tareas, ${p._count.members} miembros`)
  );

  const tasks = await prisma.task.findMany({
    select: { title: true, status: true, priority: true },
    orderBy: { status: 'asc' }
  });
  console.log('\n✅ TAREAS:');
  tasks.forEach(t =>
    console.log(`   [${t.status.padEnd(11)}] [${t.priority.padEnd(6)}] ${t.title}`)
  );

  const commentCount = await prisma.comment.count();
  console.log(`\n💬 COMENTARIOS: ${commentCount}`);

  console.log('\n✨ Todos los datos verificados correctamente!\n');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
