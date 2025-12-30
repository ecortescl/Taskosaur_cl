# Project Structure & Organization

## Root Structure
```
taskosaur/
├── backend/           # NestJS API server
├── frontend/          # Next.js web application
├── docker/            # Docker configuration files
├── scripts/           # Build and utility scripts
├── assets/            # Shared assets (logos, images)
├── .env.example       # Environment template
├── docker-compose.*.yml # Docker Compose configurations
└── package.json       # Root workspace configuration
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── modules/       # Feature modules (auth, tasks, projects, etc.)
│   ├── common/        # Shared utilities, decorators, interceptors
│   ├── config/        # Configuration files
│   ├── gateway/       # WebSocket gateway
│   ├── prisma/        # Database service and middleware
│   ├── seeder/        # Database seeding
│   └── main.ts        # Application entry point
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── migrations/    # Database migrations
├── test/              # E2E tests
└── uploads/           # File uploads (local storage)
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── pages/         # Next.js pages (Pages Router)
│   ├── components/    # React components organized by feature
│   ├── contexts/      # React Context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API client
│   ├── styles/        # CSS and styling
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
├── public/            # Static assets
└── e2e/               # Playwright E2E tests
```

## Module Organization Patterns

### Backend Modules (`backend/src/modules/`)
Each feature module follows this structure:
```
module-name/
├── controllers/       # HTTP controllers (optional subfolder)
├── services/          # Business logic services (optional subfolder)
├── dto/               # Data Transfer Objects
├── guards/            # Route guards (if module-specific)
├── decorators/        # Custom decorators (if module-specific)
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.module.ts
```

### Frontend Components (`frontend/src/components/`)
Components are organized by feature/domain:
```
components/
├── auth/              # Authentication components
├── tasks/             # Task-related components
├── projects/          # Project management components
├── shared/            # Reusable components
├── ui/                # Base UI components (shadcn/ui)
├── modals/            # Modal dialogs
├── layout/            # Layout components
└── common/            # Common utilities
```

## Key Conventions

### File Naming
- **Backend**: kebab-case for files (`task-status.service.ts`)
- **Frontend**: PascalCase for components (`TaskCard.tsx`), camelCase for utilities
- **Database**: snake_case for table/column names
- **API Routes**: kebab-case (`/api/task-statuses`)

### Import Organization
```typescript
// 1. Node modules
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// 2. Internal modules (absolute paths)
import { AccessControlService } from 'src/common/access-control.utils';

// 3. Relative imports
import { CreateTaskDto } from './dto/create-task.dto';
```

### Database Schema Patterns
- **Primary Keys**: UUID with `@default(uuid())`
- **Timestamps**: `createdAt`, `updatedAt` with `@map("created_at")`
- **Soft Deletes**: `deletedAt`, `deletedBy` fields where applicable
- **Audit Fields**: `createdBy`, `updatedBy` for tracking changes
- **Relations**: Explicit foreign key fields with proper cascading

### API Response Patterns
```typescript
// Paginated responses
{
  data: T[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}

// Single resource responses
{
  id: string,
  // ... resource fields
  _count?: { relationName: number }  // Relation counts
}
```

### Error Handling
- **Backend**: NestJS exception filters with proper HTTP status codes
- **Frontend**: Centralized error handling in API client with user-friendly messages
- **Validation**: Class-validator DTOs on backend, Zod schemas on frontend

### Security Patterns
- **Authentication**: JWT with refresh tokens stored in httpOnly cookies
- **Authorization**: Role-based with scope decorators (`@Scope('PROJECT', 'projectId')`)
- **Input Sanitization**: HTML sanitization for user content
- **CORS**: Configured for specific origins in production

### Testing Structure
- **Backend E2E**: Feature-based test files in `backend/test/`
- **Frontend E2E**: Playwright tests in `frontend/e2e/`
- **Unit Tests**: Co-located with source files (`.spec.ts` suffix)