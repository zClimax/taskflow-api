# Arquitectura en Capas — Repository + Service + Controller

## El Problema que Resuelve

Sin separación de capas, todo el código queda mezclado:

```typescript
// ❌ Sin capas — todo en el handler:
router.post('/tasks', async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title required' });
  const project = await prisma.project.findUnique({ where: { id: req.body.projectId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const task = await prisma.task.create({ data: req.body });
  res.status(201).json(task);
});
// Resultado: código imposible de testear, reutilizar o mantener
```

Con capas, cada responsabilidad va a su lugar:

```
HTTP Request ──► Controller ──► Service ──► Repository ──► PostgreSQL
HTTP Response ◄── Controller ◄── Service ◄── Repository ◄── PostgreSQL
```

---

## Las 3 Capas

### 🔵 Repository (Capa de Datos)

**Responsabilidad**: ejecutar queries en la base de datos. Solo eso.

```typescript
export const tasksRepository = {
  async findById(id: string) {
    return prisma.task.findUnique({ where: { id }, include: taskInclude });
  },
  async create(data: CreateTaskDto) {
    return prisma.task.create({ data, include: taskInclude });
  },
  // ...
};
```

**Reglas:**
- ✅ Solo Prisma queries
- ❌ No lógica de negocio
- ❌ No conoce HTTP

### 🟡 Service (Capa de Negocio)

**Responsabilidad**: orquestar la lógica de negocio.

```typescript
export const tasksService = {
  async createTask(dto: CreateTaskDto, requesterId: string) {
    // 1. ¿El proyecto existe?
    const project = await prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw AppErrors.notFound('Proyecto');

    // 2. ¿El usuario es miembro?
    const isMember = project.members.some(m => m.userId === requesterId);
    if (!isMember) throw AppErrors.forbidden('No eres miembro');

    // 3. Si todo OK, crear
    return tasksRepository.create(dto);
  }
};
```

**Reglas:**
- ✅ Verifica permisos y reglas
- ✅ Llama al Repository
- ✅ Lanza AppErrors con el código HTTP correcto
- ❌ No conoce req/res

### 🔴 Controller (Capa HTTP)

**Responsabilidad**: traducir HTTP → objetos → HTTP.

```typescript
export const tasksController = {
  async create(req, res, next) {
    try {
      const dto = req.body;           // Viene validado por el middleware
      const userId = req.user.id;     // Viene del middleware JWT (Módulo 6)
      const result = await tasksService.createTask(dto, userId);
      res.status(201).json(result);   // 201 Created
    } catch (error) {
      next(error);                    // Pasa al errorHandler global
    }
  }
};
```

**Reglas:**
- ✅ Extrae datos de req
- ✅ Llama al Service
- ✅ Devuelve res.json()
- ❌ No tiene lógica de negocio

---

## Zod — Validación con Tipos

Zod define el schema Y genera el tipo TypeScript en una sola declaración:

```typescript
// Sin Zod (duplicación):
type CreateTaskDto = { title: string; projectId: string; priority: 'LOW' | 'HIGH' };
function validate(body: unknown): boolean { /* validación manual */ }

// Con Zod (una sola fuente de verdad):
const CreateTaskSchema = z.object({
  title: z.string().min(2).max(200),
  projectId: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
type CreateTaskDto = z.infer<typeof CreateTaskSchema>; // Tipo gratis
```

### El middleware `validate()`

```typescript
router.post('/tasks',
  validate({ body: CreateTaskSchema }),  // 400 si falla
  tasksController.create                 // Solo llega si body es válido
);
```

Si la validación falla → responde 400 con errores por campo:
```json
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "details": {
      "body": {
        "title": ["El título debe tener al menos 2 caracteres"],
        "projectId": ["El ID del proyecto es requerido"]
      }
    }
  }
}
```

---

## Flujo Completo de una Petición

```
POST /api/v1/tasks
  {"title": "Nueva tarea", "projectId": "abc123"}

1. app.ts              → Router recibe la petición
2. requestLogger       → Registra en consola: "POST /api/v1/tasks"
3. validate(body)      → Zod valida el body → OK
4. tasksController.create
   └── req.body = { title, projectId, priority: 'MEDIUM' }  (con defaults)
   └── userId = "cuid-del-usuario"                           (del JWT)
5. tasksService.createTask(dto, userId)
   ├── prisma.project.findUnique(projectId) → existe ✅
   ├── project.members.includes(userId)     → es miembro ✅
   └── tasksRepository.create(dto)
       └── prisma.task.create({ data: dto, include: {...} })
           └── INSERT INTO tasks ... → PostgreSQL
6. res.status(201).json({ data: task })
   → 201 Created con la tarea creada y sus relaciones

HTTP 201 ←────────────────────────────────────────────────
{
  "data": {
    "id": "cuid2abc",
    "title": "Nueva tarea",
    "status": "TODO",
    "priority": "MEDIUM",
    "project": { "id": "abc123", "name": "Mi Proyecto" },
    "assignee": null,
    "_count": { "comments": 0 }
  }
}
```

---

## ¿Por qué Esta Arquitectura?

| Beneficio | Explicación |
|---|---|
| **Testabilidad** | Puedes testear el Service sin HTTP ni BD |
| **Mantenibilidad** | Cada capa tiene una razón para cambiar |
| **Reutilización** | El Service puede ser usado por WebSockets, CLI, etc. |
| **Escalabilidad** | Puedes cambiar la BD sin tocar Controllers |

---

## Preguntas de Repaso

1. Si quisieras cambiar PostgreSQL por MongoDB, ¿qué capas tendrías que modificar?
2. ¿Por qué `next(error)` en el Controller en lugar de `res.status(500).json(...)`?
3. ¿Qué ventaja tiene que el validate middleware responda 400 antes de llegar al Controller?
4. ¿Por qué `Promise.all([count, findMany])` en el Repository es mejor que hacerlo secuencialmente?

---

## Referencias Relacionadas

[[04-Prisma-ORM]]
[[06-Autenticacion-JWT]]
[[05-Patron-Repository]]
