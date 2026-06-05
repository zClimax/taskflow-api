# Seguridad en APIs — Módulo 9

## Los 4 Pilares de Seguridad HTTP

### 1. Helmet — Headers de Seguridad

El navegador confía en los headers que envía el servidor. Un servidor sin headers de seguridad es vulnerable a varios ataques.

```
Sin Helmet:                     Con Helmet:
                                X-Content-Type-Options: nosniff
                                X-Frame-Options: DENY
                                X-XSS-Protection: 0
                                Content-Security-Policy: default-src 'self'
                                Strict-Transport-Security: max-age=31536000
                                Referrer-Policy: no-referrer
```

**¿Qué ataca cada header?**

| Header | Ataque que previene |
|---|---|
| `Content-Security-Policy` | XSS (Cross-Site Scripting) |
| `X-Frame-Options: DENY` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME type sniffing |
| `Strict-Transport-Security` | Downgrade attacks (fuerza HTTPS) |
| `Referrer-Policy: no-referrer` | Information leakage via Referer header |

```typescript
import helmet from 'helmet';

// Con configuración por defecto — protección básica en 1 línea
app.use(helmet());

// En desarrollo: desactivamos CSP para que Swagger funcione
app.use(helmet({ contentSecurityPolicy: false }));
```

---

### 2. CORS — Cross-Origin Resource Sharing

```
Sin CORS configurado:
  frontend en localhost:5173 → petición a API en localhost:3000
  Browser: ❌ BLOQUEADO (política same-origin)

Con CORS (Access-Control-Allow-Origin: http://localhost:5173):
  Browser: ✅ PERMITIDO solo para ese origen
```

**El flujo preflight (OPTIONS):**

```
1. Browser quiere hacer POST con Content-Type: application/json
2. Antes del POST real, envía: OPTIONS /api/v1/tasks
3. Server responde con los headers CORS permitidos
4. Browser verifica → si OK, envía el POST real
5. maxAge: 86400 → el browser cachea esta respuesta 24h (no repite OPTIONS)
```

```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'https://mi-app.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,  // Permite cookies de autenticación
  maxAge: 86400,      // Cachea preflight 24h
}));
```

> ⚠️ **Nunca usar `origin: '*'` con `credentials: true`** — los browsers lo bloquean y es un agujero de seguridad.

---

### 3. Rate Limiting — Límite de Peticiones

**¿Por qué importa?**

```
Sin rate limiting:
  Atacante: curl -X POST /auth/login (x 1.000.000 veces)
  → Prueba todas las contraseñas comunes en minutos
  → Password: "123456" → ACCESO ✅

Con rate limiting (20 req / 15 min):
  Atacante intenta 20 veces → 429 Too Many Requests
  → A 20 intentos cada 15 min = 1.920 intentos/día
  → Contra una contraseña de 8+ chars = imposible
```

**Dos niveles de rate limit:**

```typescript
// Nivel 1: General — todas las rutas API
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // 100 req / IP
});

// Nivel 2: Estricto — solo endpoints de auth
const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 20,                    // 20 intentos / IP
});

// Aplicación:
app.use('/api/v1', rateLimitMiddleware);          // General
authRouter.post('/login', authRateLimitMiddleware, ...); // Específico
```

**Headers que verá el cliente:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1717700000
```

---

### 4. Compression — Compresión gzip

```
Respuesta de 100 tareas:
  Sin compresión:  ~45KB  (el cliente descarga 45KB)
  Con gzip:        ~6KB   (el cliente descarga 6KB → 87% menos)

¿Cómo funciona?
  Client: GET /api/v1/tasks  (header: Accept-Encoding: gzip)
  Server: comprime la respuesta con gzip
  Client: descomprime transparentemente

El middleware NO comprime:
  - Respuestas < 1KB (overhead no vale la pena)
  - Imágenes y archivos binarios (ya están comprimidos)
```

---

## Orden de Middleware: ¿Por Qué Importa?

Express ejecuta los middlewares **en el orden en que se registran**.

```typescript
// ✅ CORRECTO — compression primero
app.use(compression());  // 1. Comprime TODAS las respuestas
app.use(helmet());       // 2. Añade headers de seguridad
app.use(cors());         // 3. Permite cross-origin
app.use(rateLimit());    // 4. Aplica DESPUÉS de /health
app.use('/api', routes); // 5. Las rutas

// ❌ INCORRECTO — si helmet va después de las rutas
app.use('/api', routes); // Las rutas responden
app.use(helmet());       // Ya es tarde, las respuestas ya salieron
```

---

## Verificar la Seguridad

Después de desplegar en Railway, verifica los headers:

```bash
# Ver todos los headers de seguridad
curl -I https://tu-api.railway.app/health

# Respuesta esperada:
# Content-Security-Policy: default-src 'self'
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 0
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Referrer-Policy: no-referrer

# Verificar rate limiting
for i in {1..25}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://tu-api.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'; done
# Los primeros 20: 401 (credenciales incorrectas)
# Del 21 en adelante: 429 (rate limit)

# Verificar compresión
curl -I -H "Accept-Encoding: gzip" https://tu-api.railway.app/api/v1/tasks
# Content-Encoding: gzip
```

---

## Tools Online para Auditar Seguridad

- **securityheaders.com** → analiza tus headers de seguridad con puntuación
- **observatory.mozilla.org** → auditoría completa de seguridad HTTP
- **hstspreload.org** → verificar si tu dominio está en la lista HSTS preload

---

## Configuración por Entorno

```typescript
// CSP solo en producción (Swagger necesita inline styles en desarrollo)
contentSecurityPolicy: config.isProduction ? { ... } : false,

// HSTS solo en producción (en local no hay HTTPS)
hsts: config.isProduction ? { maxAge: 31536000 } : false,

// Swagger solo en desarrollo (no exponer la API en producción)
if (config.isDevelopment) {
  app.use('/api/docs', swaggerUi.serve, ...);
}
```

---

## Preguntas de Repaso

1. ¿Por qué un atacante querría saber qué versión de Express usas? (piensa en `X-Powered-By`)
2. ¿Qué diferencia hay entre el rate limit general (100 req) y el de auth (20 req)?
3. Si `CORS_ORIGIN=*`, ¿qué significa? ¿Cuándo es aceptable?
4. ¿Por qué NO comprimimos respuestas menores a 1KB?
5. ¿Qué es un "preflight request" y para qué sirve?

---

## Referencias

[[08-CI-CD-Railway]]
[[10-OpenAPI-Swagger-Avanzado]]
