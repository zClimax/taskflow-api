# El Patrón Middleware — Profundización

## ¿Qué es el Patrón Middleware?

Middleware es un patrón de diseño donde una serie de funciones se encadenan para procesar una petición de forma modular. Cada función tiene una responsabilidad única y puede pasar el control a la siguiente.

Es la implementación del **principio de responsabilidad única** aplicada al ciclo de vida de una petición HTTP.

---

## Anatomía de un Middleware

```typescript
function miMiddleware(
  req: Request,      // La petición — puede leer Y modificar
  res: Response,     // La respuesta — puede responder directamente
  next: NextFunction // Función que llama al siguiente middleware
): void {

  // 1. Hacer algo ANTES del handler (pre-processing)
  console.log('Antes del handler');

  // 2. Opciones:
  //    a) Pasar al siguiente
  next();
  //    b) Responder directamente (cortocircuita la cadena)
  // res.status(401).json({ error: 'No autorizado' });
  //    c) Pasar un error al error handler
  // next(new Error('Algo salió mal'));
}
```

---

## Los 4 Tipos de Middleware en Express

### 1. Middleware de Aplicación (`app.use`)

```typescript
// Corre en TODAS las peticiones
app.use(express.json());
app.use(requestLogger);

// Corre solo en rutas que empiecen con /api
app.use('/api', rateLimiter);
```

### 2. Middleware de Router (`router.use`)

```typescript
const router = Router();
// Solo afecta a rutas de este router
router.use(authMiddleware);
router.get('/profile', getProfile);
```

### 3. Middleware de Ruta (inline)

```typescript
// Solo en este endpoint específico
router.delete(
  '/users/:id',
  authMiddleware,      // ← Middleware 1 (verifica token)
  isAdminMiddleware,   // ← Middleware 2 (verifica rol)
  deleteUserHandler    // ← Handler final
);
```

### 4. Middleware de Error (4 parámetros)

```typescript
// Express lo reconoce por los EXACTAMENTE 4 parámetros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});
```

---

## Flujo Visual Completo

```
Petición: POST /api/v1/tasks (con JWT)
              │
              ▼
    ┌─────────────────┐
    │  requestLogger  │ → Registra: "POST /api/v1/tasks"
    └────────┬────────┘
             │ next()
             ▼
    ┌─────────────────┐
    │  express.json() │ → Parsea body: req.body = { title: "..." }
    └────────┬────────┘
             │ next()
             ▼
    ┌─────────────────┐
    │  CORS headers   │ → Añade Access-Control-Allow-Origin
    └────────┬────────┘
             │ next()
             ▼
    ┌─────────────────────┐
    │  authMiddleware     │ → Verifica JWT
    │  (solo en /api/v1)  │   Si inválido: res.status(401) — cadena termina
    └────────┬────────────┘
             │ next() (token válido)
             ▼
    ┌─────────────────┐
    │  tasksRouter    │ → Coincide con POST /tasks
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────┐
    │  createTaskHandler   │ → Crea la tarea, responde 201
    └──────────────────────┘
             │
             ▼
    res.on('finish') → Logger registra "201 45ms"
```

---

## Middlewares que Usaremos en Este Proyecto

| Middleware | Cuándo se añade | Propósito |
|---|---|---|
| `requestLogger` | Módulo 2 ✅ | Log de cada petición |
| `express.json()` | Módulo 2 ✅ | Parsea body JSON |
| CORS manual | Módulo 2 ✅ | Headers cross-origin |
| `cors()` (paquete) | Módulo 7 | CORS más robusto |
| `helmet()` | Módulo 7 | Headers de seguridad |
| `rateLimit()` | Módulo 7 | Límite de peticiones |
| `authMiddleware` | Módulo 6 | Verifica JWT |
| `notFound` | Módulo 2 ✅ | 404 en JSON |
| `errorHandler` | Módulo 2 ✅ | Errores en JSON |

---

## El Patrón `next(error)` para Propagación de Errores

```typescript
// Sin next(error) — el error no llega al error handler:
app.get('/tasks/:id', async (req, res) => {
  const task = await db.findTask(req.params.id); // ← Si esto lanza error...
  res.json(task);                                 // ...nunca llega aquí
  // El error no capturado crashea la app ❌
});

// Con next(error) — el error llega al error handler global:
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await db.findTask(req.params.id);
    res.json(task);
  } catch (error) {
    next(error); // ← Pasa al errorHandler global ✅
  }
});
```

---

## Referencias Relacionadas

[[02-Express-Fundamentos]]
[[05-Manejo-Errores]]
[[06-Autenticacion-JWT]]
