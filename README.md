# TypeSafe Hono + Next.js + Zod Monorepo

A full-stack TypeScript monorepo demonstrating type-safe API development with compile-time guarantees across frontend and backend.

## Features

- **Type Safety**: End-to-end type safety using neverthrow Result types and Zod validation
- **API Gateway**: Hono-based gateway with request routing and authentication
- **Backend API**: RESTful API with OpenAPI documentation and PostgreSQL integration
- **Frontend**: Next.js 15 application with App Router
- **Monorepo**: Turborepo for efficient builds and caching
- **Code Quality**: ESLint v9 for linting, Biome for ultra-fast formatting
- **Database**: PostgreSQL with Drizzle ORM and migrations
- **Docker**: Complete containerization for all services

## Quick Start

### Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Start PostgreSQL database**
```bash
# Using Docker
docker run -d \
  --name typesafe-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=typesafe_stack \
  -p 54321:54321 \
  postgres:16-alpine \
  -p 54321
```

or

```bash
docker compose up -d db
```

3. **Set up environment variables**
```bash
# Backend API
cp backend/packages/api/dotenv.example backend/packages/api/.env

# Gateway
cp backend/packages/gateway/dotenv.example backend/packages/gateway/.env

# Frontend
cp frontend/apps/web/dotenv.local.example frontend/apps/web/.env.local
```

4. **Apply database migrations**
```bash
cd backend/packages/api
npm run drizzle:migrate
```

5. **Start all services**
```bash
npm run dev:fullstack
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:10000
- Gateway: http://localhost:8888
- Database: localhost:54321

### Docker Setup

**Start all services with Docker Compose:**
```bash
docker compose up --build
```

This will start:
- PostgreSQL database with automatic schema initialization
- Backend API service
- Gateway service  
- Frontend Next.js application

All services are networked together and ready to use.

## Project Structure

```
├── backend/
│   ├── packages/
│   │   ├── api/           # Main API service
│   │   ├── gateway/       # API Gateway
│   │   ├── hono-server/   # Shared Hono utilities
│   │   └── db-toolkit/    # Database utilities
├── frontend/
│   └── apps/
│       └── web/          # Next.js application
├── turbo.json            # Turborepo configuration
└── docker-compose.yml    # Docker services
```

## Available Scripts

- `npm run dev:fullstack` - Start all services in development
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run check:all` - Type check, lint, and test everything
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Biome
- `npm run format:check` - Check if files need formatting

## Database

The API uses PostgreSQL with Drizzle ORM. Migrations are applied automatically in Docker, or manually with:

```bash
cd backend/packages/api
npm run drizzle:migrate
```

## API Documentation

With services running, API documentation is available at:
- OpenAPI JSON: http://localhost:10000/openapi.json
- Swagger UI: http://localhost:10000/docs?api_key=demo-api-key