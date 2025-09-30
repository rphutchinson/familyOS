# FamilyOS - Technical Documentation for AI Assistance

This document provides technical specifications and interaction guidelines for AI assistants working on the FamilyOS codebase.

## Core Technology Stack

- **Framework:** Next.js 15.5.2 with App Router and Turbopack
- **Language:** TypeScript with strict mode for complete type safety
- **Styling:** Tailwind CSS v4 with CSS variables
- **UI Components:** shadcn/ui (New York style) with custom module patterns
- **State Management:** Zustand with localStorage persistence and automatic migration
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

## Architecture Patterns

### Module System
- **Base Module Class**: All modules extend from a base class with standard lifecycle methods
- **Module Registry**: Centralized registration system in `src/lib/modules/registry.ts`
- **Modular State Architecture**: Separate Zustand stores for core family data and individual modules
- **Module-Specific Routes**: Each module defines its own routes and navigation items

### State Management
- **Zustand Stores**: Located in `src/lib/store/` directory
- **Persistence Layer**: Automatic localStorage persistence with version migration
- **State Versioning**: Each store includes a version number for migration support
- **React Context**: Family data exposed via React Context for cross-module access

### Data Storage
- **100% Local Storage**: All data stored in browser localStorage
- **No Backend**: Zero external services or API calls for data persistence
- **Migration System**: Automatic data structure migrations on version changes
- **Store Structure**:
  - `family-store`: Core family member data and preferences
  - `healthcare-store`: Healthcare module-specific data
  - Additional stores per module as needed

## Key File Locations

### Core System
- **Module Registry**: `src/lib/modules/registry.ts`
- **Base Module**: `src/lib/modules/base-module.ts`
- **Family Store**: `src/lib/store/family-store.ts`
- **Family Context**: `src/contexts/FamilyContext.tsx`

### Healthcare Module
- **Healthcare Store**: `src/lib/store/healthcare-store.ts`
- **Healthcare Module**: `src/lib/modules/healthcare/index.ts`
- **Provider Components**: `src/components/healthcare/`
- **Healthcare Routes**: `src/app/healthcare/`

### Shared Components
- **Family Member Selector**: `src/components/family/FamilyMemberSelector.tsx`
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
- Module-specific components in `src/components/{module-name}/`

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

1. **Create Module Class**: Extend `BaseModule` in `src/lib/modules/{module-name}/index.ts`
2. **Define Store**: Create Zustand store in `src/lib/store/{module-name}-store.ts`
3. **Register Module**: Add to module registry initialization
4. **Create Routes**: Add Next.js routes in `src/app/{module-name}/`
5. **Build Components**: Create module-specific components in `src/components/{module-name}/`
6. **Update Types**: Add preference types to family member preferences interface

### Example Module Integration
```typescript
// Module seamlessly integrates with family system
const { familyMembers, currentUser } = useFamilyData();
const modulePreferences = currentUser?.preferences?.moduleName;
```

## Privacy & Security Principles

- **Local-Only Storage**: Never transmit family data to external services
- **No Authentication**: No user accounts, registration, or login systems
- **Transparent Storage**: All data visible in browser developer tools
- **No Analytics**: No external analytics or tracking services
- **Sensitive Data**: Store only necessary information (no actual medical records, passwords, etc.)

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
- Reference specific files with clickable links: `[filename.ts](src/filename.ts)`
- Reference specific lines: `[filename.ts:42](src/filename.ts#L42)`
- Provide code examples when explaining patterns

---

**Note**: For product requirements, features, and roadmap information, see [README.md](README.md)
