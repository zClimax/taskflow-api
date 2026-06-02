# Express.js — Fundamentos

## Definición

Express.js es el **framework web más popular de Node.js**. No es un servidor en sí mismo — es una capa de abstracción sobre el módulo `http` nativo de Node que simplifica radicalmente la creación de APIs.

Su filosofía es **minimalista y no opinado**: te da las herramientas esenciales pero no te impone una estructura. Tú decides cómo organizar el código.

---

## ¿Qué resuelve Express?

| Sin Express (raw Node.js) | Con Express |
|---|---|
| Routing manual con `if/else` | `app.get('/tasks', handler)` |
| Parsear body manualmente con streams | `req.body` automático |
| `res.setHeader()` + `res.writeHead()` + `res.end(JSON.stringify())` | `res.json(data)` |
| Errores no capturados crashean la app | Error handler global con 4 params |
| Sin concepto de middleware | Sistema de middleware potente |

---

## Conceptos Clave

### La Aplicación Express

```typescript
import express from 'express';
const app = express();          // Crea la instancia
app.listen(3000, callback);     // Inicia el servidor
```

### Route Handlers

```typescript
// Sintaxis: app.MÉTODO(ruta, handler)
app.get('/tasks', (req, res) => {
  res.json({ data: [] });
});

app.post('/tasks', (req, res) => {
  const body = req.body; // Disponible si express.json() está configurado
  res.status(201).json({ data: body });
});

// Parámetros de ruta: :id es dinámico
app.get('/tasks/:id', (req, res) => {
  const { id } = req.params; // { id: "42" } — siempre string
  res.json({ id: Number(id) });
});

// Query params: /tasks?status=pending&page=2
app.get('/tasks', (req, res) => {
  const { status, page } = req.query; // Automático
  res.json({ status, page });
});
```

### El objeto `req` (Request)

```typescript
req.params       // { id: "42" }           — parámetros de ruta (:id)
req.query        // { status: "pending" }  — query string (?status=pending)
req.body         // { title: "Tarea" }     — body JSON (requiere express.json())
req.headers      // { authorization: "..." } — headers HTTP
req.method       // "GET", "POST", etc.
req.originalUrl  // "/api/v1/tasks?page=2"
req.ip           // "127.0.0.1"
```

### El objeto `res` (Response)

```typescript
res.json(data)           // Responde JSON + Content-Type: application/json
res.status(201).json(d)  // Con código de estado específico
res.status(204).end()    // Sin body (DELETE exitoso)
res.setHeader('X-Custom', 'value')  // Header personalizado
res.redirect('/otra-ruta')          // Redirección
```

---

## Middleware — El Corazón de Express

Un middleware es una función `(req, res, next) => void` que:
1. Tiene acceso completo a `req` y `res`
2. Puede modificar ambos
3. Debe llamar `next()` para continuar la cadena, O responder directamente

```typescript
// Middleware de ejemplo: mide el tiempo de respuesta
function timer(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} - ${Date.now() - start}ms`);
  });
  next(); // ← SIN ESTO, la cadena se detiene aquí
}

app.use(timer); // Registrar como middleware global
```

### Tipos de Middleware

| Tipo | Sintaxis | Cuándo usarlo |
|---|---|---|
| **Global** | `app.use(fn)` | Logger, parser, CORS |
| **De ruta** | `app.use('/api', fn)` | Auth solo en rutas protegidas |
| **De error** | `(err, req, res, next)` | Captura todos los errores |
| **Terceros** | `app.use(cors())` | CORS, helmet, rate-limit |

### Orden de Middleware (CRÍTICO)

```typescript
app.use(logger);           // 1. Primero — para medir tiempo total
app.use(express.json());   // 2. Parser — antes de leer req.body
app.use(cors());           // 3. CORS — antes de las rutas
app.use('/api/v1', routes) // 4. Rutas de la API
app.use(notFound);         // 5. 404 — DESPUÉS de todas las rutas
app.use(errorHandler);     // 6. Errores — SIEMPRE al final (4 params)
```

---

## Express Router — Organización Modular

```typescript
// tasks.router.ts
import { Router } from 'express';
const router = Router();

router.get('/', getAllTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export { router as tasksRouter };

// app.ts — montar el router
app.use('/api/v1/tasks', tasksRouter);
// Ahora: GET /api/v1/tasks → getAllTasks
//        POST /api/v1/tasks → createTask
//        GET /api/v1/tasks/42 → getTaskById
```

---

## Manejo de Errores

```typescript
// En cualquier handler, pasar error al handler global:
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await taskService.findById(req.params.id);
    if (!task) throw new AppError(404, 'NOT_FOUND', 'Tarea no encontrada');
    res.json(task);
  } catch (error) {
    next(error); // ← Pasa al errorHandler global
  }
});

// Error handler global (4 parámetros — Express lo reconoce así):
app.use((err, req, res, next) => {
  res.status(err.statusCode ?? 500).json({ error: err.message });
});
```

---

## Buenas Prácticas

1. **Separa `app.ts` de `server.ts`** — facilita el testing sin abrir puertos
2. **Centraliza la config** — un módulo `config/env.ts` que valida variables de entorno
3. **Error handler al final, siempre** — con exactamente 4 parámetros
4. **notFound antes del error handler** — captura rutas no definidas como 404
5. **Usa `Router()`** — un archivo por recurso, montados en el router central
6. **Limita el body size** — `express.json({ limit: '10mb' })`

---

## Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `req.body` es `undefined` | Falta `app.use(express.json())` | Agregar antes de las rutas |
| El error handler no funciona | Tiene 3 params en lugar de 4 | Siempre `(err, req, res, next)` |
| Todas las peticiones dan el mismo resultado | Middleware sin `next()` | Llamar `next()` o responder |
| CORS error en el navegador | CORS no configurado | Agregar headers antes de las rutas |
| 404 devuelve HTML | No hay middleware `notFound` | Agregar `app.use(notFound)` después de las rutas |

---

## Preguntas de Repaso

1. ¿Por qué el error handler debe tener exactamente 4 parámetros?
2. ¿Qué pasa si un middleware no llama `next()` ni responde?
3. ¿Por qué separar `app.ts` de `server.ts`? ¿Qué ventaja da para los tests?
4. ¿En qué orden deben ir el `notFound` y el `errorHandler`? ¿Por qué?
5. ¿Cuándo usarías `app.use('/api', fn)` vs `app.use(fn)`?

---

## Referencias Relacionadas

[[01-API-REST-Fundamentos]]
[[02-Middleware-Pattern]]
[[02-Estructura-Proyecto]]
[[03-Diseno-API-REST]]
