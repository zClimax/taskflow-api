# Métodos HTTP y Códigos de Estado — Referencia Rápida

## Métodos HTTP

### Tabla Comparativa

| Método | Semántica | Body en req | Body en resp | Idempotente | Seguro |
|---|---|---|---|---|---|
| `GET` | Leer/obtener | ❌ | ✅ | ✅ | ✅ |
| `POST` | Crear | ✅ | ✅ | ❌ | ❌ |
| `PUT` | Reemplazar completo | ✅ | ✅ | ✅ | ❌ |
| `PATCH` | Actualizar parcial | ✅ | ✅ | ❌* | ❌ |
| `DELETE` | Eliminar | ❌ | ✅ / ❌ | ✅ | ❌ |
| `HEAD` | Como GET, sin body | ❌ | ❌ | ✅ | ✅ |
| `OPTIONS` | Capacidades del servidor | ❌ | ✅ | ✅ | ✅ |

**Idempotente**: llamar N veces produce el mismo resultado que llamar 1 vez.
**Seguro**: no modifica datos en el servidor.

### Aplicado a TaskFlow API

```
GET    /api/v1/tasks           → Listar tareas (con filtros opcionales)
POST   /api/v1/tasks           → Crear nueva tarea
GET    /api/v1/tasks/:id       → Ver una tarea específica
PUT    /api/v1/tasks/:id       → Reemplazar tarea completa
PATCH  /api/v1/tasks/:id       → Cambiar solo el estado (ej: done: true)
DELETE /api/v1/tasks/:id       → Eliminar tarea
```

---

## Códigos de Estado HTTP

### 2xx — Éxito

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `200` | OK | Respuesta exitosa genérica. GET, PUT, PATCH exitosos |
| `201` | Created | Recurso creado exitosamente. Siempre en POST exitoso |
| `204` | No Content | Operación exitosa sin body. DELETE exitoso |
| `206` | Partial Content | Respuesta paginada o por rangos |

### 3xx — Redirección

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `301` | Moved Permanently | URL cambió permanentemente |
| `304` | Not Modified | Recurso no cambió (caché válida) |

### 4xx — Errores del Cliente

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `400` | Bad Request | Datos inválidos, JSON malformado, validación fallida |
| `401` | Unauthorized | No autenticado (no hay token o es inválido) |
| `403` | Forbidden | Autenticado pero sin permiso (rol insuficiente) |
| `404` | Not Found | Recurso no existe |
| `405` | Method Not Allowed | Método no permitido en esa ruta |
| `409` | Conflict | Conflicto: email ya registrado, estado inválido |
| `410` | Gone | Recurso existía pero fue eliminado permanentemente |
| `422` | Unprocessable Entity | Datos bien formados pero semánticamente inválidos |
| `429` | Too Many Requests | Rate limit alcanzado |

### 5xx — Errores del Servidor

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `500` | Internal Server Error | Error inesperado en el servidor (bug, excepción no capturada) |
| `502` | Bad Gateway | El servidor upstream respondió mal |
| `503` | Service Unavailable | Servidor saturado o en mantenimiento |
| `504` | Gateway Timeout | Timeout esperando al servidor upstream |

---

## Regla de Oro: 401 vs 403

```
¿Sabes quién eres?
├── NO → 401 Unauthorized  ("¿Quién eres tú? Inicia sesión primero")
└── SÍ → ¿Tienes permiso?
          ├── NO → 403 Forbidden  ("Te conozco, pero no puedes hacer esto")
          └── SÍ → Procede ✅
```

---

## Anti-patrones Comunes (No hagas esto)

```javascript
// ❌ MAL: Siempre 200 aunque haya error
res.status(200).json({ success: false, error: "Not found" });

// ✅ BIEN: Código correcto para el contexto
res.status(404).json({ error: "Task not found" });

// ❌ MAL: Verbos en la URL
POST /api/createTask
GET  /api/deleteTask/5

// ✅ BIEN: Sustantivos + método HTTP
POST   /api/v1/tasks
DELETE /api/v1/tasks/5

// ❌ MAL: 200 para creación
app.post('/tasks', (req, res) => res.status(200).json(newTask));

// ✅ BIEN: 201 para recursos creados
app.post('/tasks', (req, res) => res.status(201).json(newTask));
```

---

## Referencias Relacionadas

[[01-API-REST-Fundamentos]]
[[01-Protocolo-HTTP]]
[[05-Manejo-Errores]]
