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

### Module System
- **Simple Route-Based Modules**: Each module is a separate route directory in `src/app/(protected)/`
- **No Registration Required**: Modules are standard Next.js App Router routes
- **Modular State Architecture**: Separate Zustand stores for core family data and individual modules

### State Management
- **Zustand Stores**: Located in `src/lib/stores/` directory
- **Persistence Layer**: Automatic localStorage persistence with version migration
- **State Versioning**: Each store includes a version number for migration support
- **React Context**: Family data exposed via React Context for cross-module access

### Data Storage
- **Local Storage for App Data**: Family and module data stored in browser localStorage
- **MongoDB for Auth**: User accounts and sessions stored in MongoDB
- **Migration System**: Automatic data structure migrations on version changes
- **Store Structure**:
  - `family-store`: Core family member data and preferences
  - `healthcare-store`: Healthcare module-specific data
  - `app-store`: App-level settings and configuration
  - Additional stores per module as needed

## Key File Locations

### Core System
- **App Store**: `src/lib/stores/app-store.ts`
- **Family Store**: `src/lib/stores/family-store.ts`
- **Family Context**: `src/app/family/family-context.tsx`
- **Main Navigation**: `src/app/family/components/main-nav.tsx`

### Healthcare Module
- **Healthcare Store**: `src/lib/stores/healthcare-store.ts`
- **Healthcare Routes**: `src/app/healthcare/`
- **Provider Components**: `src/app/healthcare/components/`

### Shared Components
- **Family Member Selector**: `src/app/family/components/family-member-selector.tsx`
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
- Use functional components with hooks
- Prefer composition over prop drilling
- Use React Context for cross-cutting concerns (family data)
- Module-specific components in `src/app/{module-name}/components/`

### State Management
- Use Zustand for complex state management
- Use React hooks (useState, useReducer) for local component state
- Persist important data to localStorage via Zustand middleware
- Include migration logic when changing store structure

### Styling
- Use Tailwind utility classes
- Follow shadcn/ui component patterns (New York style)
- Use CSS variables for theme values
- Mobile-first responsive design approach

## Module Development Pattern

When creating a new module:

1. **Create Route Directory**: Create a new directory in `src/app/(protected)/{module-name}/` (inside protected route group)
2. **Define Store**: Create Zustand store in `src/lib/stores/{module-name}-store.ts` with localStorage persistence
3. **Create Pages**: Add Next.js page components in `src/app/(protected)/{module-name}/page.tsx`
4. **Build Components**: Create module-specific components in `src/app/(protected)/{module-name}/components/`
5. **Update Navigation**: Add navigation link in `src/components/main-nav.tsx`
6. **Update Types**: Add preference types to family member preferences interface if needed

**Note**: All new modules should be created inside the `(protected)` route group to automatically require authentication.

### Example Module Integration
```typescript
// Import family context in your module
import { useFamilyData } from '@/app/family/family-context';

// Use in your component
const { familyMembers, currentUser } = useFamilyData();
const modulePreferences = currentUser?.preferences?.moduleName;
```

## Privacy & Security Principles

- **Authentication Required**: All routes except `/auth/signin` and `/auth/signup` require authentication
- **Secure Credentials**: Passwords hashed with scrypt algorithm
- **Session-Based Auth**: Better Auth handles secure session management
- **Local Storage for App Data**: Family and module data stored locally in browser
- **MongoDB for Auth Only**: User accounts and sessions stored in MongoDB
- **No Analytics**: No external analytics or tracking services
- **Sensitive Data**: Store only necessary information (no actual medical records, etc.)

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
