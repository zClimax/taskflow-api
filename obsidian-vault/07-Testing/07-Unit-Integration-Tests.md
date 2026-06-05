# Testing de APIs — Unit Tests + Integration Tests

## La Pirámide de Tests

```
         ┌─────┐
         │ E2E │   Pocos · Lentos · Prueban el sistema completo
        /───────\
       / Integra │  Algunos · Medios · Prueban capas juntas con BD real
      /───────────\
     /  Unit Tests │ Muchos · Rápidos · Prueban funciones aisladas (mocks)
    /───────────────\
```

| Tipo | Qué prueba | Usa BD | Velocidad | Herramienta |
|---|---|---|---|---|
| **Unit** | Una función o service | ❌ (mocks) | ~1ms | Vitest + vi.mock() |
| **Integration** | HTTP → Controller → Service → BD | ✅ (test DB) | ~500ms | Vitest + Supertest |
| **E2E** | Flujo de usuario completo | ✅ | ~segundos | Playwright, Cypress |

---

## Unit Tests — Aislar con Mocks

Los mocks reemplazan dependencias reales con funciones controladas:

```typescript
// ❌ Sin mock: el test necesita una BD real y es lento
it('register crea un usuario', async () => {
  const result = await authService.register({ name: 'Jorge', email: '...', password: '...' });
  // Este test falla si la BD no está disponible
});

// ✅ Con mock: controlamos exactamente qué devuelve Prisma
vi.mock('../../infrastructure/database/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue(null), // email libre
      create: vi.fn().mockResolvedValue({ id: '123', email: '...' }),
    },
    refreshToken: { create: vi.fn() },
  },
}));

it('register crea un usuario', async () => {
  const result = await authService.register({ name: 'Jorge', email: '...', password: '...' });
  expect(result.user.email).toBe('...');
  expect(prisma.user.create).toHaveBeenCalledOnce(); // Verificar que se llamó
});
```

### Patrón AAA (Arrange, Act, Assert)

```typescript
it('login falla con contraseña incorrecta', async () => {
  // ARRANGE — preparar el escenario
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
  vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

  // ACT — ejecutar la función bajo prueba
  const promise = authService.login({ email: 'test@test.com', password: 'wrong' });

  // ASSERT — verificar el resultado esperado
  await expect(promise).rejects.toMatchObject({
    statusCode: 401,
    message: 'Email o contraseña incorrectos',
  });
});
```

---

## Integration Tests — Supertest

Supertest hace peticiones HTTP reales a tu app **sin levantar un servidor**:

```typescript
import request from 'supertest';
import { app } from '../../app.js';

it('POST /auth/login devuelve 200', async () => {
  // request(app) crea un servidor temporal solo para este test
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'jorge@test.com', password: 'TestPass123' });

  expect(response.status).toBe(200);
  expect(response.body.data.accessToken).toBeDefined();
});
```

### Por qué necesitamos una BD de tests separada

```
❌ Sin BD separada:
  npm test → crea usuarios reales, crea proyectos reales → ensucia la BD de desarrollo

✅ Con taskflow_test:
  npm test → crea datos → beforeEach los limpia → la BD de dev nunca se toca
```

---

## Aislamiento de Tests — El Problema del Paralelismo

Vitest corre archivos en **paralelo por defecto**. Con una BD compartida esto causa:

```
auth.test.ts                    tasks.test.ts
    ↓                               ↓
beforeEach: cleanDatabase()     beforeEach: cleanDatabase()
    ↓                               ↓
registerUser()                  registerUser()
    ↓                               ↓
crear usuario en BD             ← BORRA TODO (cleanDatabase) ← (⚠️ carrera!)
    ↓                               ↓
createProject(userId)           FK violation: usuario ya no existe
```

**Solución**: `fileParallelism: false` en `vitest.config.ts` → los archivos corren secuencialmente.

---

## Test Factories — Datos Reutilizables

En vez de repetir la creación de datos en cada test, las factories centralizan la lógica:

```typescript
// ❌ Sin factory — repetitivo:
it('test 1', async () => {
  const user = await prisma.user.create({ data: { name: 'Test', email: '...', password: '...' } });
  const project = await prisma.project.create({ data: { name: 'Proj', ownerId: user.id, ... } });
  // ...
});

// ✅ Con factory — limpio:
it('test 1', async () => {
  const user = await createUser();
  const project = await createProject(user.id);
  // ...
});
```

---

## Emails Únicos en Tests

Si dos tests crean el mismo email, el segundo falla con 409 CONFLICT.
Cada test debe usar emails únicos:

```typescript
function uniqueEmail(prefix = 'user') {
  return `${prefix}.${randomUUID().slice(0, 8)}@test.com`;
}
// → "user.a3b4c5d6@test.com"  — único por ejecución
```

---

## Coverage — Medir Qué Se Prueba

```bash
npm run test:coverage
```

Genera un reporte mostrando qué % de líneas/branches/funciones están cubiertas:

```
File                    | Stmts | Branch | Funcs | Lines |
------------------------|-------|--------|-------|-------|
auth/auth.service.ts    |  92%  |  88%   |  100% |  92%  |
tasks/tasks.service.ts  |  85%  |  78%   |  90%  |  85%  |
```

Umbrales configurados en `vitest.config.ts`:
```typescript
thresholds: {
  statements: 70,   // Al menos 70% de líneas cubiertas
  branches: 60,     // Al menos 60% de ramas (if/else) cubiertas
  functions: 70,    // Al menos 70% de funciones cubiertas
}
```

---

## Suite Implementada

| Archivo | Tipo | Tests | Qué verifica |
|---|---|---|---|
| `auth.service.test.ts` | Unit | 6 | register, login, timing attacks, sin password en respuesta |
| `tasks.service.test.ts` | Unit | 10 | getTasks, getById, create, delete, comments |
| `auth.test.ts` | Integration | 13 | register, login, refresh, logout, rutas protegidas |
| `tasks.test.ts` | Integration | 13 | CRUD completo, filtros, paginación, comentarios |
| **Total** | | **41** | |

---

## Comandos

```bash
npm test                    # Correr todos los tests (una vez)
npm run test:watch          # Modo watch — recorre cuando cambias código
npm run test:coverage       # Tests + reporte de cobertura
```

---

## Preguntas de Repaso

1. ¿Cuál es la diferencia entre `vi.mock()` y `vi.spyOn()`?
2. ¿Por qué el `beforeEach` en los tests de integración llama `cleanDatabase()` y no `afterEach`?
3. Si un unit test falla, ¿qué te dice eso sobre el problema? ¿Y si falla un integration test?
4. ¿Por qué usamos `fileParallelism: false` para los tests de integración pero no para los unit tests?

---

## Referencias

[[06-Autenticacion-JWT]]
[[08-OpenAPI-Swagger]]
