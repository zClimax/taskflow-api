<div align="center">

# 🗂️ TaskFlow API

**A professional REST API for task and project management**

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.x-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tests](https://img.shields.io/badge/Tests-42%20passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Architecture](#-architecture) · [Testing](#-testing) · [Deploy](#-deploy)

</div>

---

## 📌 About

TaskFlow API is a **production-ready REST API** for task and project management — built as a structured learning project covering all the fundamentals of professional backend development.

The system lets users create projects, assign tasks, track status, add comments, and manage team members — similar to a simplified Trello or Linear.

**What makes this project stand out:**
- ✅ 3-layer clean architecture (Controller → Service → Repository)
- ✅ TypeScript strict mode — 0 compile errors
- ✅ JWT authentication with refresh token rotation & logout-all
- ✅ Zod schema validation on every endpoint
- ✅ 42 tests (unit + integration) with Vitest & Supertest
- ✅ Security-hardened: Helmet, CORS, rate limiting, compression
- ✅ Interactive Swagger UI documentation
- ✅ GitHub Actions CI/CD pipeline
- ✅ One-click deploy to Railway

---

## ✨ Features

| Feature | Status |
|---|---|
| User registration & login | ✅ Done |
| JWT access + refresh token rotation | ✅ Done |
| Logout / Logout all devices | ✅ Done |
| Projects CRUD | ✅ Done |
| Tasks CRUD with filtering & pagination | ✅ Done |
| Comments on tasks | ✅ Done |
| User profile management | ✅ Done |
| Role-based access (ADMIN / MEMBER) | ✅ Done |
| Input validation (Zod schemas) | ✅ Done |
| Centralized error handling | ✅ Done |
| Request logging | ✅ Done |
| Rate limiting (global + auth) | ✅ Done |
| Security headers (Helmet) | ✅ Done |
| CORS configuration | ✅ Done |
| Response compression (gzip) | ✅ Done |
| Swagger UI / OpenAPI 3.0 | ✅ Done |
| Unit tests (mocked) | ✅ Done |
| Integration tests (real DB) | ✅ Done |
| GitHub Actions CI pipeline | ✅ Done |
| Railway deployment config | ✅ Done |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Runtime** | Node.js 22 LTS | Stable long-term support release |
| **Language** | TypeScript 5 (strict) | Compile-time safety, better DX |
| **Framework** | Express.js 5 | Industry standard, vast ecosystem |
| **Database** | PostgreSQL 17 | Relational integrity, full SQL power |
| **ORM** | Prisma 7 | Type-safe queries, auto-generated client |
| **Auth** | JWT + bcrypt | Stateless, scalable authentication |
| **Validation** | Zod 4 | Runtime types = TypeScript types |
| **Security** | Helmet + cors + express-rate-limit | Production-ready hardening |
| **Compression** | compression (gzip) | Reduces response size ~87% |
| **Testing** | Vitest + Supertest | Fast, ESM-native test runner |
| **Docs** | Swagger UI + OpenAPI 3.0 | Interactive, auto-generated |
| **Deploy** | Railway | PaaS with managed PostgreSQL |
| **CI/CD** | GitHub Actions | Automated tests on every push |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20.0.0
- [PostgreSQL](https://www.postgresql.org) 17 (local or cloud)
- [Git](https://git-scm.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/zClimax/taskflow-api.git
cd taskflow-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secrets
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
NODE_ENV=development
PORT=3000
API_VERSION=v1

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow_dev"

# JWT secrets — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET="your_64_byte_random_hex"
JWT_REFRESH_SECRET="your_other_64_byte_random_hex"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS — comma-separated list of allowed origins
CORS_ORIGIN="http://localhost:5173"
```

### Database Setup

```bash
# Create database and apply all migrations
npm run db:migrate

# (Optional) Seed sample data — creates admin user and demo projects
npm run db:seed
```

### Run the Server

```bash
npm run dev      # Development server with hot reload (tsx watch)
npm start        # Production server (runs compiled JS from ./dist)
```

The API will be available at `http://localhost:3000`

**Swagger UI:** `http://localhost:3000/api/docs` *(development only)*

---

## 📚 API Reference

### Base URL
```
Development: http://localhost:3000/api/v1
Production:  https://your-project.railway.app/api/v1
```

### Authentication

Protected routes require a `Bearer` token in the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

### Endpoints

#### 🏥 Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ❌ | Server health check, uptime, version |

#### 🔐 Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register user, returns token pair |
| `POST` | `/auth/login` | ❌ | Login, returns token pair |
| `POST` | `/auth/refresh` | ❌ | Rotate refresh token, returns new pair |
| `POST` | `/auth/logout` | ✅ | Invalidate current refresh token |
| `POST` | `/auth/logout-all` | ✅ | Invalidate all tokens (all devices) |

#### 👤 Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | ✅ | Get current user profile + stats |
| `PATCH` | `/users/me` | ✅ | Update name, avatar, password |
| `DELETE` | `/users/me` | ✅ | Delete account |

#### 📁 Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/projects` | ✅ | List user's projects (paginated) |
| `POST` | `/projects` | ✅ | Create new project |
| `GET` | `/projects/:id` | ✅ | Get project with members |
| `PATCH` | `/projects/:id` | ✅ | Update project |
| `DELETE` | `/projects/:id` | ✅ | Delete project (owner only) |

#### ✅ Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/tasks` | ✅ | List tasks with filters + pagination |
| `POST` | `/tasks` | ✅ | Create task in a project |
| `GET` | `/tasks/:id` | ✅ | Get task with relations |
| `PATCH` | `/tasks/:id` | ✅ | Update title, status, priority, assignee |
| `DELETE` | `/tasks/:id` | ✅ | Delete task |
| `GET` | `/tasks/:id/comments` | ✅ | List comments |
| `POST` | `/tasks/:id/comments` | ✅ | Add comment |
| `DELETE` | `/tasks/:id/comments/:commentId` | ✅ | Delete own comment |

#### Query Parameters for `GET /tasks`
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page, max 100 (default: 20) |
| `status` | enum | `TODO` `IN_PROGRESS` `IN_REVIEW` `DONE` |
| `priority` | enum | `LOW` `MEDIUM` `HIGH` `URGENT` |
| `projectId` | string | Filter by project |
| `assigneeId` | string | Filter by assignee |
| `search` | string | Full-text search in title and description |
| `sortBy` | enum | `createdAt` `updatedAt` `dueDate` `priority` `title` |
| `order` | enum | `asc` `desc` |

### Response Format

All responses follow a consistent envelope:

```json
// Success
{
  "data": { ... },
  "pagination": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}

// Error
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos",
    "details": { "body": { "email": ["Email inválido"] } }
  }
}
```

### Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| All API routes | 100 requests | 15 minutes |
| `POST /auth/register` | 20 requests | 15 minutes |
| `POST /auth/login` | 20 requests | 15 minutes |

Rate limit headers are included in every response:
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: <timestamp>
```

---

## 🏗️ Architecture

### 3-Layer Clean Architecture

```
HTTP Request
     │
     ▼
┌─────────────────────────────────┐
│  Controller (HTTP layer)        │  ← Extracts req params, calls Service,
│  tasks.controller.ts            │    returns res.json(). No business logic.
└─────────────────┬───────────────┘
                  │ plain objects
                  ▼
┌─────────────────────────────────┐
│  Service (Business logic)       │  ← Validates rules ("is user a member?"),
│  tasks.service.ts               │    orchestrates Repository calls.
└─────────────────┬───────────────┘
                  │ Prisma types
                  ▼
┌─────────────────────────────────┐
│  Repository (Data access)       │  ← Only Prisma queries. No business logic.
│  tasks.repository.ts            │    Returns raw DB data or null.
└─────────────────┬───────────────┘
                  │
                  ▼
          PostgreSQL Database
```

### Project Structure

```
taskflow-api/
├── .github/workflows/
│   └── ci.yml              ← GitHub Actions: test + build on every push
├── prisma/
│   ├── schema.prisma        ← Data models: User, Project, Task, Comment
│   ├── migrations/          ← SQL migration history (tracked in git)
│   └── seed.ts              ← Sample data: admin user + demo projects
├── src/
│   ├── api/
│   │   ├── auth/            ← auth.controller, auth.service, auth.dto
│   │   ├── tasks/           ← tasks.controller, tasks.service, tasks.repository, tasks.dto
│   │   ├── projects/        ← projects.controller, projects.service, projects.dto
│   │   ├── users/           ← users.module (service + controller in one file)
│   │   ├── middleware/
│   │   │   ├── authenticate.ts  ← JWT verification, sets req.user
│   │   │   ├── errorHandler.ts  ← Global error → JSON response
│   │   │   ├── logger.ts        ← Request logging with timing
│   │   │   ├── notFound.ts      ← 404 handler
│   │   │   ├── security.ts      ← Helmet, CORS, rate-limit, compression
│   │   │   └── validate.ts      ← Zod schema validation middleware
│   │   └── routes/
│   │       ├── index.ts         ← Root API router
│   │       ├── auth.routes.ts
│   │       ├── tasks.routes.ts
│   │       ├── projects.routes.ts
│   │       └── users.routes.ts
│   ├── config/
│   │   ├── env.ts           ← Centralized env validation (fail-fast)
│   │   └── swagger.ts       ← OpenAPI spec configuration
│   ├── infrastructure/
│   │   └── database/
│   │       └── prisma.ts    ← Prisma singleton with connection pool
│   ├── tests/
│   │   ├── setup.ts         ← Global beforeAll/afterAll hooks
│   │   ├── factories.ts     ← createUser, createProject, createTask helpers
│   │   └── integration/
│   │       ├── auth.test.ts     ← 13 HTTP integration tests
│   │       └── tasks.test.ts    ← 13 HTTP integration tests
│   ├── types/
│   │   └── express.d.ts     ← Express Request type augmentation (req.user)
│   ├── app.ts               ← Express app factory + middleware stack
│   └── server.ts            ← HTTP server entry point
├── obsidian-vault/          ← 10 learning modules (Obsidian-compatible)
├── .env.example             ← Environment variables template
├── .env.production.example  ← Production variables reference
├── railway.toml             ← Railway deployment configuration
├── vitest.config.ts         ← Test runner configuration
└── tsconfig.json            ← TypeScript strict mode config
```

---

## 🧪 Testing

This project has **42 tests** covering both unit and integration layers.

```bash
npm test                 # Run full test suite (all 42 tests)
npm run test:watch       # Watch mode — re-runs on file save
npm run test:coverage    # Tests + HTML coverage report
```

### Test Architecture

| File | Type | Tests | What it covers |
|---|---|---|---|
| `auth.service.test.ts` | Unit | 6 | register, login, timing attack prevention |
| `tasks.service.test.ts` | Unit | 10 | getTasks, getById, createTask, comments |
| `auth.test.ts` | Integration | 13 | Full auth flow via HTTP with real DB |
| `tasks.test.ts` | Integration | 13 | Full CRUD via HTTP with real DB |

### Test Database Setup

Integration tests use a separate `taskflow_test` database:

```bash
# Create the test database
createdb taskflow_test

# Run migrations on test DB
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow_test" npx prisma migrate deploy
```

The test config (`vitest.config.ts`) automatically points to `DATABASE_URL_TEST`.

---

## 🚢 Deploy

### Railway (Recommended)

TaskFlow API is configured for one-click deployment on [Railway](https://railway.app).

#### 1. Create Project

1. Go to [railway.app](https://railway.app) → Login with GitHub
2. **New Project → Deploy from GitHub repo**
3. Select `taskflow-api`

#### 2. Add PostgreSQL

In your Railway project: **+ Add → Database → Add PostgreSQL**

Railway automatically injects `DATABASE_URL` into your app environment.

#### 3. Set Environment Variables

In **Variables**, add:

```
NODE_ENV=production
JWT_ACCESS_SECRET=<64-byte hex — generate locally>
JWT_REFRESH_SECRET=<different 64-byte hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
```

To generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 4. Deploy

Railway auto-deploys on every push to `main`. The `railway.toml` handles:
- **Build:** `npm ci && prisma generate && npm run build`
- **Start:** `prisma migrate deploy && node dist/server.js`
- **Health check:** `GET /health` (Railway waits for 200 before marking deploy as successful)

### GitHub Secrets (for CI)

Go to **GitHub → Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `JWT_ACCESS_SECRET` | Same as Railway |
| `JWT_REFRESH_SECRET` | Same as Railway |

---

## 📖 Learning Notes

This project was built module by module. Study notes are in [`obsidian-vault/`](./obsidian-vault), compatible with [Obsidian](https://obsidian.md).

| Module | Topic |
|---|---|
| `01` | REST fundamentals — HTTP, methods, status codes |
| `02` | Express.js — routing, middleware, error handling |
| `03` | Prisma ORM — schema, migrations, relationships |
| `04` | Clean architecture — Controllers, Services, Repositories |
| `05` | Zod validation — schemas, DTOs, type inference |
| `06` | JWT authentication — access/refresh tokens, rotation |
| `07` | Testing — unit tests (mocks), integration tests (Supertest) |
| `08` | CI/CD — GitHub Actions, Railway deploy |
| `09` | Security — Helmet, CORS, rate limiting, compression |

---

## 🤝 Contributing

This is a personal learning project, but feedback is welcome!

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-idea`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-idea`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ as a learning and portfolio project

[📝 Report an issue](https://github.com/zClimax/taskflow-api/issues) · [💬 Discussions](https://github.com/zClimax/taskflow-api/discussions)

</div>
