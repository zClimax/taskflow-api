# PostgreSQL + Prisma ORM — Fundamentos

## Definición

**PostgreSQL** es el sistema de gestión de bases de datos relacional (RDBMS) de código abierto más avanzado del mundo. Es el estándar de oro para proyectos profesionales en 2026.

**Prisma** es un ORM (Object-Relational Mapper) de nueva generación para Node.js y TypeScript. Genera un cliente completamente tipado a partir de un schema declarativo.

---

## ¿Por qué PostgreSQL sobre otras opciones?

| | SQLite | MySQL | **PostgreSQL** |
|---|---|---|---|
| Producción | ❌ | ✅ | ✅ **Preferido** |
| JSON nativo | Básico | Limitado | ✅ Excelente |
| Full-text search | Básico | Básico | ✅ Potente |
| ACID completo | ✅ | ✅ | ✅ |
| Mercado laboral | Bajo | Medio | **Más demandado** |

---

## Arquitectura de Prisma

```
schema.prisma         → Fuente única de verdad (modelos + relaciones)
      │
      ├── prisma migrate dev    → Genera SQL + lo aplica en la BD
      │                          Crea archivos en prisma/migrations/
      │
      └── prisma generate       → Genera PrismaClient TypeScript
                                  Queda en node_modules/@prisma/client
```

### Los 3 Componentes

| Componente | Qué hace |
|---|---|
| **Prisma Schema** | Defines modelos, relaciones y config de BD |
| **Prisma Migrate** | Convierte cambios del schema en SQL y los aplica |
| **Prisma Client** | API TypeScript type-safe para hacer queries |

---

## Sintaxis del Schema

```prisma
// Tipos de campo
model Task {
  id          String       @id @default(cuid())  // PK + auto-generado
  title       String                              // NOT NULL por defecto
  description String?                             // ? = nullable
  status      TaskStatus   @default(TODO)         // Enum con valor por defecto
  dueDate     DateTime?                           // Fecha opcional
  createdAt   DateTime     @default(now())        // Timestamp automático
  updatedAt   DateTime     @updatedAt             // Se actualiza solo

  // Relación: Task pertenece a Project (FK)
  projectId   String
  project     Project @relation(fields: [projectId], references: [id])

  // Índices para optimizar búsquedas
  @@index([projectId])
  @@map("tasks")  // Nombre de la tabla en PostgreSQL
}
```

---

## Relaciones en Prisma

### 1:N (uno a muchos)
```prisma
model Project {
  id    String @id @default(cuid())
  tasks Task[] // Un proyecto tiene muchas tareas
}

model Task {
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
}
```

### N:M (muchos a muchos — tabla de unión explícita)
```prisma
model ProjectMember {
  userId    String
  projectId String
  role      ProjectRole

  user    User    @relation(fields: [userId],    references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])  // Clave primaria compuesta
}
```

---

## Prisma Client — Queries Esenciales

```typescript
// CREATE
const task = await prisma.task.create({
  data: { title: 'Nueva tarea', projectId: 'abc', status: 'TODO' }
});

// READ ONE
const task = await prisma.task.findUnique({
  where: { id: 'xyz' },
  include: { project: true, assignee: true }  // JOINs automáticos
});

// READ MANY con filtros y paginación
const tasks = await prisma.task.findMany({
  where: {
    projectId: 'abc',
    status: 'IN_PROGRESS',
    priority: { in: ['HIGH', 'URGENT'] }
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,    // offset
  take: 20,   // limit
});

// UPDATE
const updated = await prisma.task.update({
  where: { id: 'xyz' },
  data: { status: 'DONE' }
});

// DELETE
await prisma.task.delete({ where: { id: 'xyz' } });

// COUNT
const total = await prisma.task.count({ where: { projectId: 'abc' } });
```

---

## Migraciones

```bash
# Desarrollo: crea el archivo de migración y lo aplica
npm run db:migrate

# Producción: aplica migraciones sin crear nuevas
npm run db:migrate:prod

# Ver el estado de las migraciones
npx prisma migrate status

# Reset completo (¡BORRA TODOS LOS DATOS!)
npm run db:reset
```

Cada migración genera un archivo SQL en `prisma/migrations/`:
```
prisma/migrations/
  20260601_init/
    migration.sql    ← SQL exacto que se ejecutó en la BD
```

---

## Seeding

El seeding popula la BD con datos iniciales de prueba:

```bash
npm run db:seed    # Ejecuta prisma/seed.ts
```

---

## Comandos Esenciales

```bash
npm run db:generate   # Regenerar el cliente después de cambiar el schema
npm run db:migrate    # Crear y aplicar nueva migración
npm run db:studio     # Abrir Prisma Studio (GUI de la BD)
npm run db:seed       # Poblar con datos de prueba
npm run db:reset      # ⚠️ Borrar todo y re-migrar
```

---

## Prisma Studio

```bash
npm run db:studio
# Abre http://localhost:5555
# Interfaz visual para ver/editar datos en la BD
```

---

## Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `P2002` - Unique constraint failed | Email duplicado, índice único violado | Catch el error y devolver 409 Conflict |
| `P2025` - Record not found | findUnique devolvió null | Verificar antes de operar, devolver 404 |
| `P1001` - Can't reach database | DATABASE_URL incorrecto o PG no corre | Verificar URL y que PostgreSQL esté activo |
| Client no generado | Olvidaste `prisma generate` | `npm run db:generate` |

---

## Preguntas de Repaso

1. ¿Por qué usamos el patrón singleton para PrismaClient? ¿Qué pasa si no lo hacemos?
2. ¿Cuál es la diferencia entre `prisma migrate dev` y `prisma migrate deploy`?
3. ¿Qué hace `onDelete: Cascade` en una relación? ¿Y `onDelete: SetNull`?
4. ¿Por qué añadimos `@@index([projectId])` en el modelo Task?

---

## Referencias Relacionadas

[[04-Modelado-Datos]]
[[05-Patron-Repository]]
[[05-CRUD-por-Capas]]
