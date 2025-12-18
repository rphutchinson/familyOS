<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
Modified principles: N/A (Initial creation)
Added sections:
  - Core Principles (5 principles: Privacy-First, Family Isolation, Server-First, Type Safety, Simplicity)
  - Architecture Standards (Module Development, Database Layer, Security Requirements)
  - Development Workflow (Code Changes, File Management, Commands, Styling)
  - Governance (Amendment Process, Compliance, Runtime Guidance)
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section updated with concrete checklist items for all 5 principles
  ✅ spec-template.md - Requirements structure already aligns (technology-agnostic, user-focused)
  ✅ tasks-template.md - Task organization already aligns (test-first optional, user story breakdown)
Runtime documentation:
  ✅ CLAUDE.md - Already contains implementation-specific guidance referenced by constitution
  ✅ README.md - Product documentation, no updates needed (constitution is governance, not product)
Follow-up TODOs: None - all templates validated and updated
-->

# FamilyOS Constitution

## Core Principles

### I. Privacy-First Architecture (NON-NEGOTIABLE)

**Rule**: All user data MUST be stored server-side in MongoDB with family-based isolation. NO data SHALL be transmitted to external services except for essential infrastructure (authentication). NO analytics or tracking services SHALL be integrated.

**Rationale**: FamilyOS is fundamentally a privacy-preserving family organization platform. Users trust the platform with sensitive family data (healthcare, finances, personal information). This trust MUST be honored through architectural enforcement, not policy alone.

**Implementation Requirements**:
- All data operations MUST use `requireAuthWithFamily()` for automatic family isolation
- Server Actions MUST validate authorization before any database operation
- NO external API calls for analytics, tracking, or data collection
- Session management handled exclusively by Better Auth
- Client-side state (Zustand) used ONLY for UI preferences, being phased out in favor of MongoDB

### II. Family Data Isolation (NON-NEGOTIABLE)

**Rule**: Every database query and mutation MUST be scoped to the authenticated user's family. Cross-family data access is STRICTLY FORBIDDEN. Authorization checks MUST happen server-side before any data operation.

**Rationale**: Multi-family support requires absolute data isolation to prevent unauthorized access. A vulnerability in family isolation could expose sensitive data across family boundaries.

**Implementation Requirements**:
- Use `requireAuthWithFamily()` helper in all Server Actions
- All database queries MUST include `familyId` filter
- Protected routes organized in `src/app/(protected)/` route group
- Single auth check in protected layout protects all child routes
- NO client-side authorization decisions

### III. Server-First Data Pattern (NON-NEGOTIABLE)

**Rule**: All data mutations MUST go through Server Actions. All data fetching MUST happen in Server Components. Client Components receive data as props and call Server Actions for mutations. MongoDB is the source of truth for all persistent data.

**Rationale**: Next.js App Router's Server Components model provides security, performance, and type safety. Server-side data access prevents client-side data leaks and ensures consistent authorization.

**Implementation Requirements**:
- Pages are Server Components that fetch data via Server Actions
- Client Components marked with `"use client"` receive data as props
- All mutations use Server Actions in `src/actions/`
- Use `router.refresh()` after mutations to refresh Server Component data
- Use `useTransition()` for pending states during Server Action calls
- Legacy Zustand stores being phased out - new features use Server Actions

### IV. Type Safety & Explicit Contracts

**Rule**: TypeScript strict mode MUST be enabled. All function signatures MUST have explicit type annotations. Interfaces define database schemas in `src/types/database.ts`. NO use of `any` type - use `unknown` when type is genuinely unknown.

**Rationale**: Type safety prevents runtime errors, documents contracts, and enables confident refactoring. In a family data platform, type errors could lead to data corruption or security vulnerabilities.

**Implementation Requirements**:
- Strict mode enabled in tsconfig.json
- Interfaces for object shapes, types for unions/primitives
- Export types alongside implementations
- Server Actions return typed results with `success` boolean and typed `data`/`error`
- Database schemas defined in centralized types file

### V. Simplicity & Convention Over Configuration

**Rule**: Prefer Next.js conventions over custom abstractions. Each module is a route directory in `src/app/(protected)/` with NO registration required. Use shadcn/ui patterns without modification. Avoid premature abstraction - three similar lines are better than a forced abstraction.

**Rationale**: The platform's longevity depends on maintainability. Custom frameworks and abstractions create cognitive overhead and maintenance burden. Following established conventions makes onboarding faster and reduces bugs.

**Implementation Requirements**:
- Modules are standard Next.js routes in `(protected)` route group
- No module registration system - file-based routing provides discovery
- Use shadcn/ui components (New York style) as-is
- Avoid creating helpers/utilities for one-time operations
- Keep solutions minimal - add complexity only when required becomes clear

## Architecture Standards

### Module Development Pattern

All new modules MUST follow this structure:

1. **Route Directory**: `src/app/(protected)/{module-name}/` (inside protected route group for automatic auth)
2. **Server Component Page**: `src/app/(protected)/{module-name}/page.tsx` (fetches data, passes to client)
3. **Client Component Wrapper**: `{module-name}-page-client.tsx` (interactive UI, calls Server Actions)
4. **Server Actions**: `src/actions/{module-name}.ts` (uses `requireAuthWithFamily()`, includes `revalidatePath()`)
5. **Module Components**: `src/app/(protected)/{module-name}/components/` (module-specific UI)
6. **Navigation Update**: Add to `src/components/main-nav.tsx`
7. **Types**: Add to `src/types/database.ts` if needed

### Database Layer Organization

All database operations MUST follow this structure:

1. **Database Utilities**: `src/lib/db/{collection-name}.ts` - Direct MongoDB operations
2. **Server Actions**: `src/actions/{feature}.ts` - Authorization wrapper calling db utilities
3. **Type Definitions**: `src/types/database.ts` - Centralized schema definitions
4. **Index Management**: `src/lib/db/init-indexes.ts` - Performance optimization

### Security Requirements

- Authentication: Better Auth with scrypt password hashing
- Authorization: `requireAuthWithFamily()` before all data operations
- Route Protection: `(protected)` route group with layout-level auth check
- Session Validation: Server-side session checks via Better Auth
- Input Validation: Zod schemas for all user inputs
- Error Handling: Generic error messages to prevent information leakage

## Development Workflow

### Code Changes

- **Server Components**: Default for pages - fetch data directly from MongoDB via Server Actions
- **Client Components**: Mark with `"use client"` only when interactivity required
- **Component Composition**: Prefer composition over prop drilling
- **Data Flow**: Server Component → Server Action → Props → Client Component → Server Action (mutation) → `router.refresh()`

### File Management

- **ALWAYS** prefer editing existing files over creating new ones
- **NEVER** create files unless absolutely necessary
- **NEVER** proactively create documentation files unless explicitly requested
- Maintain existing code style and patterns

### Development Commands

```bash
npm run dev       # Development with Turbopack
npm run build     # Production build
npm start         # Production server
npm run lint      # ESLint
npx tsc --noEmit  # Type checking
```

### Styling Standards

- Tailwind utility classes (Tailwind CSS v4)
- shadcn/ui component patterns (New York style)
- CSS variables for theme values
- Mobile-first responsive design

## Governance

This constitution supersedes all other development practices and preferences. When this document conflicts with external conventions, this document takes precedence.

### Amendment Process

1. **Proposal**: Document proposed change with rationale
2. **Version Increment**:
   - MAJOR: Backward incompatible governance/principle removals or redefinitions
   - MINOR: New principle/section added or materially expanded guidance
   - PATCH: Clarifications, wording, typo fixes, non-semantic refinements
3. **Propagation**: Update all dependent templates and documentation
4. **Approval**: Changes require explicit approval before adoption
5. **Migration**: Update existing code to comply with amended principles

### Compliance

- All code changes MUST verify compliance with constitution principles
- Architecture decisions MUST be justified against simplicity principle
- Privacy violations are blocking - NO exceptions
- Security vulnerabilities are blocking - NO exceptions
- Type safety errors are blocking - NO exceptions

### Runtime Guidance

For implementation-specific guidance and AI assistant interaction rules, see [CLAUDE.md](../../CLAUDE.md).

**Version**: 1.0.0 | **Ratified**: 2025-12-18 | **Last Amended**: 2025-12-18
