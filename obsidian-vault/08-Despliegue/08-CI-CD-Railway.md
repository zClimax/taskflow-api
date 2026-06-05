# Despliegue en Railway — Módulo 8

## Conceptos Clave

### PaaS vs IaaS vs Serverless

| | PaaS (Railway) | IaaS (AWS EC2) | Serverless (Vercel) |
|---|---|---|---|
| **Configuración** | Mínima | Alta | Mínima |
| **Control** | Medio | Total | Bajo |
| **Escalado** | Automático | Manual | Automático |
| **Precio** | Bajo | Variable | Por invocación |
| **Ideal para** | APIs de aprendizaje | Producción grande | Funciones cortas |

Railway = PaaS → tú pones el código, Railway se encarga del servidor, red y BD.

---

## CI/CD — El Flujo Completo

```
git push origin main
         │
         ▼
   GitHub Actions
         │
         ├─ npm ci                    ← Instalar dependencias
         ├─ tsc --noEmit              ← Verificar tipos TS
         ├─ npm run build             ← Compilar a JS
         ├─ prisma migrate deploy     ← Aplicar migraciones en BD test
         └─ npm test                  ← 42 tests
                │
                ├─ ✅ PASS → Railway despliega
                └─ ❌ FAIL → Nadie ve el código roto en producción
```

### ¿Por qué es importante CI?

```
Sin CI:                          Con CI:
dev push → deploy → crash 💥     dev push → tests → OK → deploy ✅
         → usuarios ven errores           → usuarios no notan nada
```

---

## Configurar Railway (Pasos Manuales)

### 1. Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz login con tu cuenta de GitHub
3. Crea un nuevo proyecto: **New Project → Deploy from GitHub repo**
4. Selecciona `taskflow-api`

### 2. Añadir PostgreSQL

En tu proyecto de Railway:
- Click en **+ Add** → **Database** → **Add PostgreSQL**
- Railway crea automáticamente la BD y la variable `DATABASE_URL`

### 3. Configurar Variables de Entorno

En **Variables** de tu proyecto Railway, añade:

```
NODE_ENV=production
JWT_ACCESS_SECRET=<clave generada con crypto>
JWT_REFRESH_SECRET=<clave generada con otra llamada a crypto>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=*
```

> ⚠️ Railway añade `DATABASE_URL` automáticamente del plugin PostgreSQL.
> No la sobreescribas.

Para generar las claves JWT:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Configurar GitHub Secrets (para CI)

En GitHub → tu repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Descripción |
|---|---|
| `JWT_ACCESS_SECRET` | La misma clave que pusiste en Railway |
| `JWT_REFRESH_SECRET` | La misma clave que pusiste en Railway |

El workflow de CI las usa así: `${{ secrets.JWT_ACCESS_SECRET }}`

---

## El Ciclo de Deploy

Cada vez que haces `git push origin main`:

```
1. GitHub recibe el push
2. GitHub Actions corre el workflow ci.yml:
   - Instala dependencias (2min)
   - TypeScript check (30s)
   - Build (1min)
   - Levanta PostgreSQL en Docker
   - Migraciones en BD de test
   - 42 tests (20s)
3. Si todo pasa → Railway detecta el push
4. Railway ejecuta railway.toml:
   buildCommand: npm ci && prisma generate && npm run build
   startCommand: prisma migrate deploy && node dist/server.js
5. Railway reemplaza el contenedor anterior con el nuevo
6. Health check en /health → si responde 200, deploy exitoso
7. Tu API está en https://tu-proyecto.railway.app/api/v1
```

---

## Comandos de Railway CLI (opcional)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver logs en tiempo real
railway logs

# Conectarte a la BD de producción (para debugging)
railway run npx prisma studio

# Ejecutar migraciones manualmente
railway run npx prisma migrate deploy

# Variables de entorno
railway variables
```

---

## Diferencias Development vs Production

| | Desarrollo | Producción |
|---|---|---|
| **BD** | `taskflow_dev` local | Railway PostgreSQL |
| **Logs** | Todos (query, info, error) | Solo warnings y errores |
| **JWT secrets** | Valores del `.env` | Railway Variables (secretos) |
| **CORS** | `localhost:5173` | Tu dominio real |
| **Start** | `tsx watch src/server.ts` | `node dist/server.js` |
| **Migraciones** | `migrate dev` (interactivo) | `migrate deploy` (silencioso) |

---

## `prisma migrate dev` vs `prisma migrate deploy`

```bash
# prisma migrate dev — para DESARROLLO
# ✅ Crea nuevas migraciones cuando cambias el schema
# ✅ Aplica migraciones pendientes
# ⚠️ Hace preguntas (interactivo)
# ❌ No usar en producción/CI

# prisma migrate deploy — para PRODUCCIÓN y CI
# ✅ Solo aplica migraciones existentes (sin crear nuevas)
# ✅ No interactivo (perfecto para scripts)
# ✅ Falla si la BD no coincide con el estado esperado
# ❌ No genera nuevas migraciones
```

---

## Diagrama de Infraestructura

```
Internet
   │
   ▼
Railway Load Balancer
   │   (HTTPS termination automático)
   ▼
Node.js Container (Docker)
   │   src/server.ts → dist/server.js
   │   Puerto: 3000 (interno)
   │
   ▼
PostgreSQL Service (Railway)
   │   taskflow (producción)
   └── Se conecta vía DATABASE_URL
```

---

## Preguntas de Repaso

1. ¿Por qué usamos `npm ci` en lugar de `npm install` en CI?
2. ¿Qué pasaría si el servidor arrancase ANTES de que terminaran las migraciones?
3. ¿Por qué Railway provee `DATABASE_URL` automáticamente pero no los secrets de JWT?
4. ¿Qué es un "health check" y por qué es crítico para el deploy?
5. ¿Qué diferencia hay entre un `push` a `main` con CI vs sin CI?

---

## Referencias

[[07-Unit-Integration-Tests]]
[[09-Optimizacion-Produccion]]
