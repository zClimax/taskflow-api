# Diseño de API REST — Buenas Prácticas

## Definición

El diseño de API es la fase donde se define el **contrato** entre el servidor y sus clientes: qué URLs existen, qué métodos aceptan, qué datos esperan y qué devuelven. Un buen diseño previene errores costosos que son difíciles de corregir una vez que hay clientes consumiendo la API.

---

## API-First: Diseñar Antes de Codificar

El enfoque **API-First** define la especificación OpenAPI antes de escribir código:

```
❌ Tradicional:   Código → Documentación (la doc es un afterthought)
✅ API-First:     Especificación → Código → Documentación (automática)
```

**Ventajas:**
- El frontend puede trabajar con mocks mientras el backend se implementa
- Los errores de diseño son baratos de corregir antes de codificar
- La documentación nunca queda desactualizada

---

## Reglas de Diseño de Endpoints

| Regla | ❌ Mal | ✅ Bien |
|---|---|---|
| Sustantivos, no verbos | `POST /createTask` | `POST /tasks` |
| Plural siempre | `GET /task` | `GET /tasks` |
| El verbo lo da el método HTTP | `GET /deleteTask/5` | `DELETE /tasks/5` |
| Minúsculas con guiones | `/myTasks`, `/my_tasks` | `/my-tasks` |
| Versión en la URL | `/tasks` | `/api/v1/tasks` |
| Recursos anidados con moderación | `/users/:id/projects/:pId/tasks/:tId` | `/tasks?projectId=x` |

---

## Diseño de TaskFlow API — Todos los Endpoints

```
AUTH (sin autenticación requerida)
POST   /api/v1/auth/register        → Registro
POST   /api/v1/auth/login           → Login
POST   /api/v1/auth/refresh         → Renovar token
POST   /api/v1/auth/logout          → Logout

USERS (requiere JWT)
GET    /api/v1/users/me             → Perfil propio
PATCH  /api/v1/users/me             → Actualizar perfil
DELETE /api/v1/users/me             → Eliminar cuenta

PROJECTS (requiere JWT)
GET    /api/v1/projects             → Listar proyectos
POST   /api/v1/projects             → Crear proyecto
GET    /api/v1/projects/:id         → Ver proyecto
PATCH  /api/v1/projects/:id         → Actualizar proyecto
DELETE /api/v1/projects/:id         → Eliminar proyecto

TASKS (requiere JWT)
GET    /api/v1/tasks                → Listar (con filtros)
POST   /api/v1/tasks                → Crear tarea
GET    /api/v1/tasks/:id            → Ver tarea
PATCH  /api/v1/tasks/:id            → Actualizar tarea
DELETE /api/v1/tasks/:id            → Eliminar tarea

COMMENTS (anidados bajo tasks)
GET    /api/v1/tasks/:id/comments   → Listar comentarios
POST   /api/v1/tasks/:id/comments   → Agregar comentario
DELETE /api/v1/tasks/:id/comments/:commentId → Eliminar comentario
```

---

## Paginación

Para listas, siempre agregar paginación mediante query params:

```
GET /api/v1/tasks?page=2&limit=20

Respuesta:
{
  "data": [...],
  "pagination": {
    "total": 145,
    "page": 2,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Filtros y Ordenamiento

```
GET /api/v1/tasks?status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&order=asc
GET /api/v1/tasks?projectId=abc123&assigneeId=xyz789&search=autenticación
```

---

## Versionado de API

Versionar desde el primer día en la URL:
```
/api/v1/tasks    ← Versión actual
/api/v2/tasks    ← Versión nueva (cuando haya cambios breaking)
```

**Cuándo crear v2:** Solo cuando un cambio rompe clientes existentes (eliminar un campo obligatorio, cambiar tipos de datos, etc.)

---

## Buenas Prácticas

1. **Diseña el contrato antes de codificar** (API-First)
2. **Documenta todas las respuestas posibles** — éxito Y errores
3. **Sé consistente**: si un endpoint devuelve `{ data: [...] }`, todos deben hacerlo
4. **Nunca rompas el contrato sin versionar** — tendrás clientes que dependen de ti
5. **Diseña para el peor caso** — ¿qué pasa si el recurso no existe? ¿Si no tiene permisos?

---

## Preguntas de Repaso

1. ¿Por qué los comentarios se anidan bajo `/tasks/:id/comments` y no tienen su propio router `/comments`?
2. ¿Cuándo debería crear `/api/v2` en lugar de modificar `/api/v1`?
3. ¿Por qué `PATCH /tasks/:id` es preferible a `PUT /tasks/:id` para actualizar el estado de una tarea?
4. ¿Qué información debería incluir siempre una respuesta de lista paginada?

---

## Referencias Relacionadas

[[01-API-REST-Fundamentos]]
[[01-Metodos-HTTP-Codigos-Estado]]
[[03-OpenAPI-Swagger]]
[[05-CRUD-por-Capas]]
