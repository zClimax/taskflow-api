# Modelado de Datos — TaskFlow

## Diagrama de Entidades

```
User ──────────────────────────────────────────────────────────
│ id, email, name, password, role, avatarUrl                  │
│ createdAt, updatedAt                                         │
└──┬─────────────────┬───────────────────┬────────────────────┘
   │ owner           │ miembro           │ asignado a tarea
   ▼                 ▼                   ▼
Project         ProjectMember         Task
│ id, name      │ userId              │ id, title, description
│ description   │ projectId           │ status, priority
│ ownerId       │ role                │ dueDate
│ createdAt     │ joinedAt            │ projectId, assigneeId
└──┬────────────└─────────────────────┴────────┬──────────────
   │ tiene tareas                               │ tiene comentarios
   ▼                                            ▼
 Task                                        Comment
                                            │ id, content
                                            │ taskId, authorId
                                            └────────────────
```

---

## Enums — Por Qué Usarlos

Los enums garantizan que solo valores válidos entren a la BD:

```typescript
// Sin enum — bug potencial:
task.status = 'completado'; // Error silencioso — la BD rechaza esto

// Con enum — error en tiempo de compilación:
task.status = TaskStatus.DONE; // ✅ TypeScript valida en tiempo de compilación
```

### Enums de TaskFlow

```
UserRole:     ADMIN | MEMBER
TaskStatus:   TODO | IN_PROGRESS | IN_REVIEW | DONE
TaskPriority: LOW | MEDIUM | HIGH | URGENT
ProjectRole:  OWNER | ADMIN | MEMBER | VIEWER
```

---

## Decisiones de Diseño

### ¿Por qué CUID2 y no autoincrement?

```sql
-- Autoincrement (evitar):
id SERIAL PRIMARY KEY   -- "1, 2, 3..." → predecible → enumerable
-- GET /users/1, /users/2... alguien puede enumerar todos los usuarios

-- CUID2 (preferible):
id VARCHAR PRIMARY KEY  -- "cjld2cjxh0000qzrmn831i7rn" → no predecible
-- Imposible enumerar, más seguro
```

### ¿Por qué RefreshToken en la BD?

Los JWT son stateless: una vez emitidos, no se pueden revocar. Si un usuario hace logout, el access token sigue siendo válido hasta que expira (15 min).

La solución: guardar los **refresh tokens** en la BD. En cada logout, el refresh token se borra. Así, aunque el access token siga válido 15 min, no se puede obtener uno nuevo.

```
Login  → access token (15min) + refresh token (7 días, guardado en BD)
Uso    → access token en cada request
Expiró → usa refresh token → BD verifica que existe → nuevo access token
Logout → borra refresh token de la BD → no se pueden generar más access tokens
```

### ¿Por qué `onDelete: Cascade`?

```
User se borra → sus RefreshTokens se borran automáticamente
Project se borra → sus Tasks y ProjectMembers se borran
Task se borra → sus Comments se borran

Sin Cascade: la BD lanzaría un error de FK violation al intentar borrar
```

### ¿Por qué `onDelete: SetNull` en Task.assigneeId?

```
Si el usuario asignado se borra:
  - SetNull: la tarea queda sin asignar (assigneeId = null) ← Preferible
  - Cascade: se borraría la tarea también ← Indeseable
  - Restrict: no se puede borrar el usuario ← Muy restrictivo
```

---

## Índices — Performance

Los índices hacen que las búsquedas sean O(log n) en lugar de O(n):

```prisma
model Task {
  @@index([projectId])          // Frecuente: "dame las tareas del proyecto X"
  @@index([assigneeId])         // Frecuente: "dame las tareas de Juan"
  @@index([status, priority])   // Frecuente: "tareas urgentes en progreso"
}
```

> **Regla**: Si filtras frecuentemente por un campo (WHERE, ORDER BY), ponle un índice.
> Contra: los índices tienen costo en escrituras (INSERT/UPDATE más lentos).
> No indexar todo — solo los campos que realmente se usan en filtros.

---

## Normalización

El schema de TaskFlow está en **3FN (Tercera Forma Normal)**:

- No hay datos duplicados
- `ProjectMember` normaliza la relación N:M entre User y Project
- Los datos de User no se repiten en Task (solo el ID de referencia)

---

## Referencias Relacionadas

[[04-Prisma-ORM]]
[[05-Patron-Repository]]
