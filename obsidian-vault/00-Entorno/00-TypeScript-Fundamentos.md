# TypeScript — Fundamentos para Backend

## ¿Qué es TypeScript?

TypeScript es un **superset de JavaScript** creado por Microsoft. Todo código JavaScript válido es TypeScript válido, pero TypeScript añade:

- **Tipado estático**: defines qué tipo de datos puede contener cada variable
- **Interfaces y tipos**: describes la forma de objetos y funciones
- **Detección temprana de errores**: los errores aparecen mientras escribes, no en runtime

---

## ¿Por qué TypeScript en lugar de JavaScript puro?

```javascript
// JavaScript: sin errores al escribir, falla en producción
function getUser(id) {
  return db.findById(id);
}
getUser("abc"); // ¿Debería ser un número? JavaScript no avisa.
```

```typescript
// TypeScript: el error aparece inmediatamente en tu editor
function getUser(id: number): Promise<User> {
  return db.findById(id);
}
getUser("abc"); // ❌ Error: Argument of type 'string' is not assignable to type 'number'
```

---

## Conceptos Fundamentales

### Tipos Básicos

```typescript
// Tipos primitivos
let nombre: string = "Jorge";
let edad: number = 25;
let activo: boolean = true;

// Arrays
let ids: number[] = [1, 2, 3];
let nombres: string[] = ["Ana", "Luis"];

// Null y Undefined explícitos (con strict mode)
let email: string | null = null;  // puede ser string o null
```

### Interfaces — La forma de los objetos

```typescript
// Describe la estructura de un objeto
interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  role?: "admin" | "member"; // '?' = opcional
}

// Uso:
const user: User = {
  id: 1,
  email: "jorge@example.com",
  name: "Jorge",
  createdAt: new Date(),
};
```

### Tipos de Utilidad (muy usados en APIs)

```typescript
// Partial — todos los campos son opcionales (útil para PATCH/actualización)
type UpdateUserDto = Partial<User>;

// Pick — selecciona solo algunos campos
type UserPublic = Pick<User, "id" | "name" | "email">;

// Omit — excluye campos (útil para no exponer contraseñas)
type UserSafe = Omit<User, "password">;

// Required — todos los campos obligatorios
type CreateUserDto = Required<Pick<User, "email" | "name">>;
```

### Tipos en funciones (esencial para Express)

```typescript
import { Request, Response, NextFunction } from 'express';

// Función con tipos explícitos
async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await userService.findAll();
    res.json({ data: users });
  } catch (error) {
    next(error); // Pasa el error al middleware de errores
  }
}
```

---

## tsconfig.json — Opciones Clave

| Opción | Valor | Significado |
|---|---|---|
| `"strict": true` | boolean | Activa todas las validaciones estrictas |
| `"target"` | `"ES2022"` | A qué versión de JS compilar |
| `"outDir"` | `"./dist"` | Dónde poner el código compilado |
| `"sourceMap": true` | boolean | Para depuración: ver TS en el debugger |
| `"noUnusedLocals"` | `true` | Error si hay variables sin usar |

---

## Buenas Prácticas

1. **Nunca uses `any` si puedes evitarlo** — es rendirse al tipado
2. **Prefiere `interface` para objetos, `type` para uniones y utlidades**
3. **Nombrales tipos con PascalCase**: `UserResponse`, `CreateTaskDto`
4. **Suffix con `Dto`** para objetos de transferencia de datos
5. **Suffix con `Repository`, `Service`, `Controller`** para seguir la arquitectura

---

## Preguntas de Repaso

1. ¿Cuál es la diferencia entre `interface` y `type` en TypeScript?
2. ¿Por qué `Partial<User>` es útil en endpoints de actualización?
3. ¿Qué significa `string | null` y en qué caso lo usarías?
4. ¿Por qué activar `"strict": true` puede causar errores iniciales pero es beneficioso?

---

## Referencias Relacionadas

[[00-Entorno-de-Desarrollo]]
[[02-Express-Fundamentos]]
