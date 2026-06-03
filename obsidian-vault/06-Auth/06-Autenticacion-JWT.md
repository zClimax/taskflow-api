# Autenticación JWT — Access Tokens + Refresh Tokens

## ¿Por qué no guardar la sesión en el servidor?

Las APIs REST son **stateless** — el servidor no debe recordar quién está autenticado entre requests. La alternativa es enviar un **token firmado** en cada petición:

```
Sin JWT:  Cliente → Servidor → "¿quién eres?" → BD → "ah, eres Jorge"  ❌ (BD en cada request)
Con JWT:  Cliente → [token firmado] → Servidor → verifica firma → "eres Jorge" ✅ (sin BD)
```

---

## Anatomía de un JWT

Un JWT tiene 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (base64)
.
eyJzdWIiOiJ1c2VyMTIzIiwiZW1haWwiOiJ...  ← Payload (base64)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_...  ← Signature (HMAC-SHA256)
```

**Header:** algoritmo de firma  
**Payload:** datos del usuario (sub=userId, email, role, exp=expiración)  
**Signature:** HMAC(header + payload, secreto) — si alguien modifica el payload, la firma no coincide

```typescript
// Decodificar el payload (no verifica la firma):
JSON.parse(atob(token.split('.')[1]))
// → { sub: "cuid123", email: "jorge@...", role: "ADMIN", exp: 1748995200 }
```

⚠️ El payload NO es secreto — cualquiera puede leerlo. La **firma** es lo que no se puede falsificar sin el secreto.

---

## Estrategia Access + Refresh

```
REGISTER / LOGIN
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Access Token (15 min)        Refresh Token (7 días)    │
│  ──────────────────────       ──────────────────────    │
│  STATELESS: el server no      STATEFUL: se guarda       │
│  lo guarda en ningún lado     hasheado en la BD         │
│                                                         │
│  Se envía en cada request     Solo se usa para renovar  │
│  Authorization: Bearer <tok>  POST /auth/refresh        │
└─────────────────────────────────────────────────────────┘

Petición normal:
  GET /tasks
  Authorization: Bearer <access_token>  ─► middleware verifica firma ─► OK

Token expirado (15 min después):
  GET /tasks  ─► 401 TOKEN_EXPIRED
  POST /auth/refresh { refreshToken }  ─► nuevo access token
  GET /tasks  ─► OK con nuevo token

Logout:
  POST /auth/logout { refreshToken }
  ─► borra el refresh token de la BD
  ─► el access token expira solo (no se puede revocar — es stateless)
```

---

## Bcrypt — Por qué No MD5/SHA256

```
MD5:     "Password123" → 5f4dcc3b5aa765...  (reversible con tablas rainbow)
bcrypt:  "Password123" → $2b$12$LQv3c1yqBW...  (con salt aleatorio)
```

**Salt:** cadena aleatoria añadida antes de hashear — hace que el mismo password produzca hashes distintos:
```
bcrypt("Password123", salt1) = $2b$12$abc123...
bcrypt("Password123", salt2) = $2b$12$xyz789...  ← diferente!
```

**Cost factor (12 rounds):** bcrypt itera 2^12 = 4096 veces. En 2024, un atacante con GPU puede probar ~100 hashes/seg (vs. millones con MD5).

```typescript
// Hashear:
const hash = await bcrypt.hash("Password123", 12)  // ~300ms

// Verificar:
const match = await bcrypt.compare("Password123", hash)  // true
```

---

## Token Rotation (Seguridad Avanzada)

Cuando se usa el refresh token para obtener uno nuevo, **el viejo se elimina**:

```
Refresh token A → usar → se genera token B (A queda inválido)
Refresh token B → usar → se genera token C (B queda inválido)
```

**¿Por qué?** Si alguien roba el token:
1. Atacante usa el refresh token A → obtiene token B
2. Usuario legítimo intenta usar A → 401 "ya fue utilizado"
3. Usuario sabe que fue comprometido → hace logout-all

---

## Timing Attacks — Seguridad Adicional

Cuando el email no existe, un servidor mal implementado responde instantáneamente:
- Email existe: 300ms (bcrypt.compare)
- Email no existe: 0ms (retorno inmediato)

El atacante puede medir el tiempo de respuesta y saber si el email está registrado.

**Solución:** siempre ejecutar bcrypt.compare(), aunque el usuario no exista:
```typescript
if (!user) {
  await bcrypt.compare(password, '$2b$12$dummy_hash'); // hace que tarde igual
  throw AppErrors.unauthorized('Email o contraseña incorrectos');
}
```

---

## Rutas Implementadas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Crear cuenta |
| POST | `/auth/login` | No | Iniciar sesión |
| POST | `/auth/refresh` | No | Renovar access token |
| POST | `/auth/logout` | ✅ | Cerrar sesión (invalida refresh) |
| POST | `/auth/logout-all` | ✅ | Cerrar en todos los dispositivos |
| GET | `/users/me` | ✅ | Ver perfil propio |
| PATCH | `/users/me` | ✅ | Actualizar perfil |
| DELETE | `/users/me` | ✅ | Eliminar cuenta |

---

## Preguntas de Repaso

1. ¿Por qué el access token NO se guarda en la BD pero el refresh token SÍ?
2. Un atacante obtiene el access token de alguien. ¿Qué puede hacer? ¿Por cuánto tiempo?
3. ¿Qué información es seguro poner en el payload del JWT? ¿Qué NO debes poner?
4. ¿Por qué `bcrypt.compare()` es más seguro que `hash(input) === storedHash`?

---

## Referencias

[[05-Arquitectura-Capas]]
[[07-Testing]]
