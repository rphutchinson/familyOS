# Implementation Plan: Todo List Module

**Branch**: `001-todolist-module` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todolist-module/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a family-shared todo list module where family members can create, assign, complete, and manage task items. Tasks can be assigned to one or more family members. The module follows FamilyOS's server-first data pattern with MongoDB storage and family isolation.

## Technical Context

**Language/Version**: TypeScript (strict mode) with Next.js 15.5.2
**Primary Dependencies**: Next.js App Router, Better Auth, MongoDB driver, Zustand (legacy, being phased out), Tailwind CSS v4, shadcn/ui (New York style), Lucide React
**Storage**: MongoDB with family-based isolation pattern
**Testing**: Manual testing for MVP (no automated testing framework in place, defer to future iteration per research.md)
**Target Platform**: Web application (Next.js with Turbopack)
**Project Type**: Web application with server-first architecture
**Performance Goals**: <1 second list load time, <2 seconds for CRUD operations (per spec SC-003, SC-007)
**Constraints**: Server-side rendering required, family data isolation mandatory, no external services
**Scale/Scope**: Up to 100 todos per family without performance degradation (per spec SC-006), single module within existing FamilyOS application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Privacy-First Architecture

- [x] NO external services for data storage, analytics, or tracking
  - *All todo data stored in MongoDB, no external integrations planned*
- [x] All data operations use `requireAuthWithFamily()` for family isolation
  - *Server Actions will use this helper per architecture pattern*
- [x] Server Actions validate authorization before database operations
  - *Authorization check before all CRUD operations*
- [x] NO client-side data leaks (Server Components fetch data, Client Components receive props)
  - *Page.tsx fetches data, passes to todos-page-client.tsx*

### Family Data Isolation

- [x] Every database query scoped to authenticated user's family via `familyId`
  - *All queries include familyId filter per FR-015*
- [x] Cross-family data access prevented by design
  - *requireAuthWithFamily() enforces this automatically*
- [x] Server-side authorization in all Server Actions
  - *Authorization check at start of each Server Action*
- [x] Protected routes in `src/app/(protected)/` route group
  - *Module located at src/app/(protected)/todos/*

### Server-First Data Pattern

- [x] All mutations through Server Actions in `src/actions/`
  - *Create/update/delete operations in src/actions/todos.ts*
- [x] All data fetching in Server Components
  - *page.tsx fetches via Server Actions*
- [x] Client Components marked with `"use client"` receive data as props
  - *todos-page-client.tsx receives todo list as props*
- [x] MongoDB is source of truth (legacy Zustand stores being phased out)
  - *No Zustand usage planned for this module*

### Type Safety & Explicit Contracts

- [x] TypeScript strict mode enabled
  - *Project already has strict mode enabled*
- [x] All function signatures have explicit type annotations
  - *All new functions will have explicit types*
- [x] NO use of `any` type (use `unknown` if genuinely unknown)
  - *Type safety enforced in all new code*
- [x] Database schemas defined in `src/types/database.ts`
  - *Todo interface will be added to existing types file*

### Simplicity & Convention Over Configuration

- [x] Follows Next.js App Router conventions
  - *Standard file-based routing in app directory*
- [x] Module is route directory in `src/app/(protected)/` with NO registration required
  - *Route auto-discovered by Next.js App Router*
- [x] Uses shadcn/ui components (New York style) as-is
  - *Will use existing UI components without modification*
- [x] NO premature abstractions - minimal complexity for current requirements
  - *Direct implementation without unnecessary layers*

**Status**: ✅ PASSED - All constitutional requirements satisfied

---

**Post-Design Re-evaluation** (2026-02-04):

After completing Phase 1 design (data model, contracts, quickstart):

- ✅ **Privacy-First**: No external services in design, all data in MongoDB
- ✅ **Family Isolation**: All Server Actions use `requireAuthWithFamily()`, queries scoped to `familyId`
- ✅ **Server-First**: Data fetching in Server Components, mutations via Server Actions, path revalidation included
- ✅ **Type Safety**: Strict TypeScript types defined, Zod validation at boundaries, no `any` usage
- ✅ **Simplicity**: Standard Next.js patterns, no custom abstractions, direct MongoDB operations

**Final Status**: ✅ CONSTITUTION COMPLIANT - Ready for implementation

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   └── (protected)/
│       └── todos/                    # Todo module route
│           ├── page.tsx              # Server Component (data fetching)
│           ├── todos-page-client.tsx # Client Component (UI + interactions)
│           └── components/           # Module-specific components
│               ├── todo-list.tsx
│               ├── todo-item.tsx
│               ├── create-todo-form.tsx
│               └── assignment-selector.tsx
├── actions/
│   └── todos.ts                      # Server Actions for todo CRUD
├── lib/
│   └── db/
│       └── todos.ts                  # MongoDB operations for todos
├── types/
│   └── database.ts                   # Todo interfaces (extend existing)
└── components/
    └── main-nav.tsx                  # Update with todos link

specs/
└── 001-todolist-module/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

**Structure Decision**: Next.js App Router with route-based module system. The todo module follows the established FamilyOS pattern: route in `(protected)` group for automatic authentication, Server Component page for data fetching, Client Component wrapper for interactivity, Server Actions for mutations, and database utilities in `lib/db/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
