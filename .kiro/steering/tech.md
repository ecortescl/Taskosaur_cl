# Technology Stack & Build System

## Core Technologies

### Backend (NestJS)
- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL 16+ with Prisma ORM
- **Authentication**: JWT with refresh tokens, Passport.js
- **Queue System**: Bull/BullMQ with Redis
- **Real-time**: Socket.IO WebSocket gateway
- **File Storage**: Local filesystem or AWS S3
- **API Documentation**: Swagger/OpenAPI

### Frontend (Next.js)
- **Framework**: Next.js 16.x with TypeScript (Pages Router)
- **UI Components**: Radix UI primitives with Tailwind CSS
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with comprehensive error handling
- **Styling**: Tailwind CSS with CSS variables for theming

### Infrastructure
- **Database**: PostgreSQL 16+
- **Cache/Queue**: Redis 7+
- **Node.js**: 22+ LTS
- **Package Manager**: npm (workspaces)
- **Containerization**: Docker with multi-stage builds

## Common Commands

### Development
```bash
# Start both frontend and backend
npm run dev

# Start individually
npm run dev:frontend    # Next.js on port 3001
npm run dev:backend     # NestJS on port 3030

# Docker development
docker compose -f docker-compose.dev.yml up
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database (idempotent)
npm run db:seed

# Reset database (destructive)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

### Build & Production
```bash
# Build all workspaces
npm run build

# Build distribution package
npm run build:dist

# Production deployment
docker compose -f docker-compose.prod.yml up -d
```

### Testing
```bash
# Run all tests
npm run test

# Backend tests
npm run test:backend
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # End-to-end tests

# Frontend E2E tests
npm run test:e2e --workspace=frontend
```

### Code Quality
```bash
# Lint all workspaces
npm run lint

# Format backend code
npm run format

# Clean build artifacts
npm run clean
```

## Environment Configuration

- **Development**: `.env` file in root directory
- **Docker**: Environment variables override for service names
- **Production**: Secure environment variable management required

## Key Architectural Patterns

- **Monorepo**: npm workspaces with shared dependencies
- **Module-based**: NestJS modules with clear separation of concerns
- **Decorator-driven**: Extensive use of custom decorators for auth, logging, notifications
- **Transaction-based**: Prisma transactions for data consistency
- **Event-driven**: WebSocket events for real-time updates