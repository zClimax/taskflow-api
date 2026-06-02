<div align="center">

# 🗂️ TaskFlow API

**A professional REST API for task and project management**

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Docs](#-api-documentation) · [Project Structure](#-project-structure)

</div>

---

## 📌 About

TaskFlow API is a **fully-featured REST API** built as a learning and portfolio project. It implements a task and project management system similar to a simplified Trello — covering all the fundamental concepts of professional backend development.

This project was built following industry best practices:
- ✅ Clean architecture (Controllers → Services → Repositories)
- ✅ Type-safe with TypeScript strict mode
- ✅ JWT authentication with refresh token rotation
- ✅ Input validation with Zod schemas
- ✅ Full test suite with Vitest + Supertest
- ✅ Interactive API documentation with Swagger UI
- ✅ CI/CD pipeline with GitHub Actions

---

## ✨ Features

| Feature | Status |
|---|---|
| User registration & login | ✅ Done |
| JWT authentication (access + refresh tokens) | 🚧 In Progress |
| Projects CRUD | 🚧 In Progress |
| Tasks CRUD with filtering & pagination | 🚧 In Progress |
| Comments on tasks | 🚧 In Progress |
| Role-based access control (RBAC) | 🔒 Planned |
| File uploads (avatars) | 🔒 Planned |
| Rate limiting | 🔒 Planned |
| Swagger UI documentation | 🔒 Planned |
| GitHub Actions CI/CD | 🔒 Planned |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js 24 (LTS) | JavaScript execution environment |
| **Language** | TypeScript 5 | Static typing and developer experience |
| **Framework** | Express.js 5 | HTTP server and routing |
| **Database** | PostgreSQL 16 | Relational data storage |
| **ORM** | Prisma | Type-safe database access |
| **Auth** | JWT + bcrypt | Stateless authentication |
| **Validation** | Zod | Runtime schema validation |
| **Testing** | Vitest + Supertest | Unit and integration tests |
| **Docs** | OpenAPI / Swagger UI | Interactive API documentation |
| **Deployment** | Render | Cloud hosting |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org) >= 20.0.0
- [Git](https://git-scm.com)
- A PostgreSQL database (local or cloud via [Supabase](https://supabase.com) / [Neon](https://neon.tech))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/zClimax/taskflow-api.git
cd taskflow-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secrets

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed sample data
npm run db:seed

# 6. Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow_dev"
JWT_ACCESS_SECRET="your_random_secret_here"
JWT_REFRESH_SECRET="your_other_random_secret_here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

> **Security Note:** Never commit your `.env` file to version control. It's already listed in `.gitignore`.

---

## 📚 API Documentation

Once the server is running, interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

### Quick Endpoints Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Server health check | ❌ |
| `POST` | `/api/v1/auth/register` | Register new user | ❌ |
| `POST` | `/api/v1/auth/login` | Login and get tokens | ❌ |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | ❌ |
| `GET` | `/api/v1/users/me` | Get current user profile | ✅ |
| `GET` | `/api/v1/projects` | List user's projects | ✅ |
| `POST` | `/api/v1/projects` | Create new project | ✅ |
| `GET` | `/api/v1/tasks` | List tasks (with filters) | ✅ |
| `POST` | `/api/v1/tasks` | Create new task | ✅ |
| `PATCH` | `/api/v1/tasks/:id` | Update task | ✅ |
| `DELETE` | `/api/v1/tasks/:id` | Delete task | ✅ |

*Full documentation available at `/api/docs` once the server is running.*

---

## 📁 Project Structure

```
taskflow-api/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── prisma/
│   ├── schema.prisma           # Database models and relations
│   ├── migrations/             # Database migration history
│   └── seed.ts                 # Sample data seeding script
├── src/
│   ├── api/
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── routes/             # Route definitions
│   │   ├── middleware/         # Auth, validation, error handling
│   │   └── validators/         # Zod validation schemas
│   ├── services/               # Business logic layer
│   ├── repositories/           # Data access layer (Prisma)
│   ├── config/                 # App configuration & env loading
│   ├── utils/                  # Shared utilities and helpers
│   ├── types/                  # Shared TypeScript type definitions
│   ├── app.ts                  # Express app configuration
│   └── server.ts               # Application entry point
├── tests/
│   ├── unit/                   # Unit tests (services, utils)
│   ├── integration/            # Integration tests (HTTP endpoints)
│   └── helpers/                # Test utilities and fixtures
├── docs/
│   └── postman/                # Postman collection exports
├── obsidian-vault/             # Learning notes (Obsidian-compatible)
├── .env.example                # Environment variables template
├── .gitignore
├── tsconfig.json               # TypeScript compiler configuration
├── eslint.config.js            # ESLint rules for TypeScript
├── package.json
└── README.md
```

---

## 🧪 Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-runs on file save)
npm run test:coverage # Generate coverage report
```

---

## 📖 Learning Notes

This project was built as part of a structured learning journey. Study notes are available in the [`obsidian-vault/`](./obsidian-vault) directory, organized by module and compatible with [Obsidian](https://obsidian.md).

**Modules covered:**
- `00` · Development environment & TypeScript setup
- `01` · REST fundamentals & HTTP protocol
- `02` · Express.js framework deep-dive
- `03` · API design & OpenAPI specification
- `04` · PostgreSQL & Prisma ORM
- `05` · Clean architecture (Controllers → Services → Repositories)
- `06` · JWT authentication & RBAC
- `07` · Advanced features (pagination, rate limiting, CORS)
- `08` · Testing with Vitest & Supertest
- `09` · API documentation with Swagger
- `10` · Cloud deployment & CI/CD

---

## 🤝 Contributing

This is a personal learning project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-idea`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ as a learning project · [Report an issue](https://github.com/zClimax/taskflow-api/issues)

</div>
