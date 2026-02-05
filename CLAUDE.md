# FamilyOS - Technical Documentation for AI Assistance

This document provides technical specifications and interaction guidelines for AI assistants working on the FamilyOS codebase.

## Core Technology Stack

- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode for complete type safety
- **Authentication:** Better Auth with MongoDB for user authentication
- **Database:** MongoDB for auth data persistence
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style) with custom module patterns
- **State Management:** Zustand with localStorage persistence and automatic migration
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

## Architecture Patterns

### Authentication & Route Protection
- **Better Auth**: Credentials-based authentication with email/password
- **MongoDB Persistence**: User accounts stored in MongoDB database
- **Protected Routes Pattern**: All routes except auth pages require authentication
  - Protected routes are organized in `src/app/(protected)/` route group
  - Single auth check in `(protected)/layout.tsx` protects all child routes
  - No repetitive auth code needed in individual pages
- **Middleware**: Initial UX redirects for unauthenticated users
- **Server-Side Validation**: Actual session validation happens in protected layout using `requireAuth()`
- **Family-Based Authorization**: `requireAuthWithFamily()` helper ensures family data isolation

### Module System
- **Simple Route-Based Modules**: Each module is a separate route directory in `src/app/(protected)/`
- **No Registration Required**: Modules are standard Next.js App Router routes
- **Modular State Architecture**: Separate Zustand stores for core family data and individual modules

### Data Persistence & State Management
- **MongoDB Collections**: Primary data storage for families, family members, and healthcare providers
  - `families`: Family information, settings, and invite codes
  - `family_members`: Individual family member records with optional user account links
  - `healthcare_providers`: Healthcare provider portal information linked to family members
- **Server Actions**: Type-safe data mutations located in `src/app/actions/`
  - `family.ts`: Family CRUD operations and invite system
  - `family-members.ts`: Family member management
  - `providers.ts`: Healthcare provider operations
  - All actions include automatic family isolation and authorization
- **Server Components**: Pages fetch data directly from MongoDB via Server Actions
- **Client Components**: Interactive UI components receive data as props from Server Components
- **Legacy Zustand Stores** (being phased out):
  - Some components still use localStorage-based stores
  - New features should use Server Actions and MongoDB
  - Located in `src/lib/stores/` directory

## Key File Locations

### Database Layer
- **Database Utilities**: `src/lib/db/`
  - `families.ts`: Family CRUD operations
  - `family-members.ts`: Family member operations
  - `providers.ts`: Healthcare provider operations
  - `init-indexes.ts`: Database index creation
- **Type Definitions**: `src/types/database.ts`

### Server Actions
- **Family Actions**: `src/actions/family.ts`
- **Family Member Actions**: `src/actions/family-members.ts`
- **Provider Actions**: `src/actions/providers.ts`
- **Migration Actions**: `src/actions/migration.ts`

### Authentication & Authorization
- **Auth Config**: `src/lib/auth.ts`
- **Auth Helpers**: `src/lib/auth-utils.ts` (`requireAuth`, `requireAuthWithFamily`)

### Core Pages
- **Onboarding**: `src/app/(protected)/onboarding/`
- **Family Management**: `src/app/(protected)/family/`
- **Family Settings**: `src/app/(protected)/family/settings/`
- **Healthcare Module**: `src/app/(protected)/healthcare/`
- **Main Navigation**: `src/components/main-nav.tsx`

### Shared Components
- **UI Components**: `src/components/ui/` (shadcn/ui components)

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Production server
npm start

# Code linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Code Style & Conventions

### TypeScript
- Strict mode enabled - all types must be explicitly defined
- Use interfaces for object shapes, types for unions/primitives
- Avoid `any` type - use `unknown` if type is truly unknown
- Export types alongside implementations

### Component Patterns
- **Server Components**: Default for pages - fetch data directly from MongoDB via Server Actions
- **Client Components**: Mark with `"use client"` only when needed for interactivity
- Prefer composition over prop drilling
- Pass data from Server Components to Client Components as props
- Module-specific components in `src/app/(protected)/{module-name}/components/`

### Data Management Patterns
- **Server Actions for Mutations**: All data modifications go through Server Actions
- **Server Components for Data Fetching**: Pages fetch data server-side
- **router.refresh()**: Use after mutations to refresh Server Component data
- **useTransition**: Wrap Server Action calls for pending states
- Use React hooks (useState, useReducer) for local component state only

### Styling
- Use Tailwind utility classes
- Follow shadcn/ui component patterns (New York style)
- Use CSS variables for theme values
- Mobile-first responsive design approach

## Module Development Pattern

When creating a new module:

1. **Create Route Directory**: Create directory in `src/app/(protected)/{module-name}/` (inside protected route group)
2. **Create Server Component Page**: Add page in `src/app/(protected)/{module-name}/page.tsx`
   - Fetch data using Server Actions
   - Pass data to Client Component wrapper
3. **Create Client Component Wrapper**: Add `{module-name}-page-client.tsx` for interactive UI
   - Receives data as props from Server Component
   - Handles user interactions
   - Calls Server Actions for mutations
4. **Add Server Actions**: Create actions in `src/actions/{module-name}.ts`
   - Use `requireAuthWithFamily()` for authorization
   - Include `revalidatePath()` after mutations
5. **Build Components**: Create module-specific components in `src/app/(protected)/{module-name}/components/`
6. **Update Navigation**: Add navigation link in `src/components/main-nav.tsx`
7. **Update Types**: Add types to `src/types/database.ts` if needed

**Note**: All new modules should be created inside the `(protected)` route group to automatically require authentication.

### Example Server Component Page
```typescript
// src/app/(protected)/module-name/page.tsx
import { getModuleDataAction } from '@/actions/module-name';
import { ModulePageClient } from './module-page-client';

export default async function ModulePage() {
  const result = await getModuleDataAction();

  if (!result.success) {
    // Handle error
  }

  return <ModulePageClient data={result.data} />;
}
```

### Example Client Component
```typescript
// src/app/(protected)/module-name/module-page-client.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateModuleDataAction } from "@/actions/module-name";

export function ModulePageClient({ data }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = async () => {
    startTransition(async () => {
      const result = await updateModuleDataAction({ /* ... */ });
      if (result.success) {
        router.refresh(); // Refresh Server Component data
      }
    });
  };

  return <div>{/* Interactive UI */}</div>;
}
```

## Privacy & Security Principles

- **Authentication Required**: All routes except `/auth/signin` and `/auth/signup` require authentication
- **Secure Credentials**: Passwords hashed with scrypt algorithm
- **Session-Based Auth**: Better Auth handles secure session management
- **MongoDB for All Data**: User accounts, families, family members, and module data stored in MongoDB
- **Family Isolation**: All queries automatically scoped to user's family via `requireAuthWithFamily()`
- **Server-Side Authorization**: All data access validated server-side before operations
- **No Analytics**: No external analytics or tracking services
- **Sensitive Data**: Store only necessary information (no actual medical records, etc.)
- **Multi-User Support**: Multiple users can belong to same family with proper data isolation

## Interaction Guidelines

### File Management
- **ALWAYS** prefer editing existing files over creating new ones
- **NEVER** create files unless absolutely necessary for the task
- **NEVER** proactively create documentation files (*.md) unless explicitly requested
- Only create README files if explicitly requested by the user

### Code Changes
- Do what has been asked; nothing more, nothing less
- Maintain existing code style and patterns
- Follow the established architecture patterns
- Ensure type safety - no TypeScript errors
- Test changes with `npm run dev` before completing

### Communication
- Be concise and direct in responses
- Reference specific files with clickable links: `[filename.ts](src/app/filename.ts)`
- Reference specific lines: `[filename.ts:42](src/app/filename.ts#L42)`
- Provide code examples when explaining patterns

---

**Note**: For product requirements, features, and roadmap information, see [README.md](README.md)

## Active Technologies
- TypeScript (strict mode) with Next.js 15.5.2 + Next.js App Router, Better Auth, MongoDB driver, Zustand (legacy, being phased out), Tailwind CSS v4, shadcn/ui (New York style), Lucide Reac (001-todolist-module)
- MongoDB with family-based isolation pattern (001-todolist-module)

## Recent Changes
- 001-todolist-module: Added TypeScript (strict mode) with Next.js 15.5.2 + Next.js App Router, Better Auth, MongoDB driver, Zustand (legacy, being phased out), Tailwind CSS v4, shadcn/ui (New York style), Lucide Reac
