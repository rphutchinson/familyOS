# Tasks: Todo List Module

**Input**: Design documents from `/specs/001-todolist-module/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Manual testing only per research.md (no automated tests in this phase)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md, this is a Next.js App Router web application with the following structure:
- **Types**: `src/types/database.ts`
- **Database Layer**: `src/lib/db/todos.ts`
- **Server Actions**: `src/actions/todos.ts`
- **Routes**: `src/app/(protected)/todos/`
- **Components**: `src/app/(protected)/todos/components/`
- **Navigation**: `src/components/main-nav.tsx`

---

## Phase 0: Dashboard Integration (US0 - Priority: P0) 🚪 Entry Point

**Purpose**: Enable users to discover and access the todo module from the dashboard

**Goal**: Display "Tasks & Todos" module card on dashboard with active todo count

**Independent Test**: Navigate to dashboard, verify module card is visible, shows correct count, and links to /todos

### Dashboard Integration Tasks

- [ ] T000 [P] [US0] Update dashboard module definition in src/app/(protected)/page.tsx (change href from /tasks to /todos, set available to true)
- [ ] T001 [P] [US0] Create getActiveTodoCountAction() in src/actions/todos.ts to fetch count of non-completed todos
- [ ] T002 [US0] Update dashboard page to fetch active todo count and display on module card

### Manual Testing for User Story 0

- [ ] T003 [US0] Manual test: Navigate to dashboard, verify "Tasks & Todos" card visible and clickable
- [ ] T004 [US0] Manual test: Click module card, verify navigates to /todos route
- [ ] T005 [US0] Manual test: Create todos, verify dashboard count updates (requires refresh)
- [ ] T006 [US0] Manual test: Mark todos complete, verify count decreases (active todos only)

**Checkpoint**: ✅ Dashboard integration complete - Users can discover and access the todo module

---

## Phase 1: Setup (Database Foundation)

**Purpose**: Create database schema and types that all user stories depend on

- [X] T001 [P] Add Todo types to src/types/database.ts (TodoDocument, Todo, CreateTodoInput, UpdateTodoInput)
- [X] T002 [P] Create database utilities file src/lib/db/todos.ts with collection accessor and converter function
- [X] T003 Add todos collection index to src/lib/db/init-indexes.ts (compound index: familyId + completed + createdAt)
- [X] T004 Run npm run db:init to create database indexes (NOTE: Skipped - requires MongoDB connection, will run automatically when DB connected)

**Checkpoint**: Database layer ready - user story implementation can now begin

---

## Phase 2: User Story 1 - Create and View Todo Items (Priority: P1) 🎯 MVP

**Goal**: Enable family members to create todo items and view all family todos in a list

**Independent Test**: Create several todo items through the UI and verify they appear in the list view sorted by creation date (newest first)

### Database Operations for User Story 1

- [X] T005 [P] [US1] Implement getTodosForFamily() in src/lib/db/todos.ts
- [X] T006 [P] [US1] Implement createTodo() in src/lib/db/todos.ts (without assignment logic)

### Server Actions for User Story 1

- [X] T007 [P] [US1] Implement getTodosAction() in src/actions/todos.ts with requireAuthWithFamily()
- [X] T008 [P] [US1] Implement createTodoAction() in src/actions/todos.ts with Zod validation (description only, empty assignedMemberIds)

### UI Components for User Story 1

- [X] T009 [US1] Create Server Component page src/app/(protected)/todos/page.tsx that fetches todos via getTodosAction()
- [X] T010 [US1] Create Client Component src/app/(protected)/todos/todos-page-client.tsx with layout and create button
- [X] T011 [P] [US1] Create src/app/(protected)/todos/components/create-todo-form.tsx (description input only, no assignment selector)
- [X] T012 [P] [US1] Create src/app/(protected)/todos/components/todo-list.tsx that displays todos sorted by createdAt
- [X] T013 [P] [US1] Create src/app/(protected)/todos/components/todo-item.tsx that shows description and timestamp (no completion UI yet)

### Navigation for User Story 1

- [X] T014 [US1] Add Todos link to src/components/main-nav.tsx with CheckSquare icon from lucide-react

### Manual Testing for User Story 1

- [ ] T015 [US1] Manual test: Navigate to /todos and verify empty state displays (READY FOR USER TESTING)
- [ ] T016 [US1] Manual test: Create todo with description, verify it appears in list (READY FOR USER TESTING)
- [ ] T017 [US1] Manual test: Create multiple todos, verify newest-first ordering (READY FOR USER TESTING)
- [ ] T018 [US1] Manual test: Create todo with empty description, verify validation error (READY FOR USER TESTING)
- [ ] T019 [US1] Manual test: Verify todos are family-isolated (different families see different todos) (READY FOR USER TESTING)

**Checkpoint**: ✅ MVP COMPLETE - Basic todo list functional and testable. Users can create and view todos.

---

## Phase 3: User Story 2 - Assign Tasks to Family Members (Priority: P2)

**Goal**: Enable assigning todos to one or more family members for accountability

**Independent Test**: Create todos with various assignments (none, single, multiple), verify assignments display correctly and filtering works

### Server Actions for User Story 2

- [X] T020 [US2] Enhance createTodoAction() in src/actions/todos.ts to accept assignedMemberIds array and validate member IDs exist in family (ALREADY IMPLEMENTED IN PHASE 1)
- [X] T021 [P] [US2] Implement updateTodoAction() in src/actions/todos.ts to support updating assignedMemberIds (ALREADY IMPLEMENTED IN PHASE 1)

### Database Operations for User Story 2

- [X] T022 [P] [US2] Update createTodo() in src/lib/db/todos.ts to handle assignedMemberIds array conversion to ObjectIds (ALREADY IMPLEMENTED IN PHASE 1)
- [X] T023 [P] [US2] Implement updateTodo() in src/lib/db/todos.ts with support for updating assignedMemberIds (ALREADY IMPLEMENTED IN PHASE 1)

### UI Components for User Story 2

- [ ] T024 [US2] Create src/app/(protected)/todos/components/assignment-selector.tsx with multi-select for family members
- [ ] T025 [US2] Integrate assignment-selector into create-todo-form.tsx
- [ ] T026 [US2] Update todo-item.tsx in src/app/(protected)/todos/components/ to display assigned member names
- [ ] T027 [US2] Add assignment filtering UI to todo-list.tsx (dropdown to filter by family member)
- [ ] T028 [US2] Implement client-side filtering logic in todos-page-client.tsx (filter assignedMemberIds array)

### Manual Testing for User Story 2

- [ ] T029 [US2] Manual test: Create todo assigned to one member, verify assignment displays
- [ ] T030 [US2] Manual test: Create todo assigned to multiple members, verify all display
- [ ] T031 [US2] Manual test: Filter todos by family member, verify only assigned todos show
- [ ] T032 [US2] Manual test: Update todo assignments, verify changes persist and display
- [ ] T033 [US2] Manual test: Assign to non-existent member ID, verify error message

**Checkpoint**: US1 + US2 complete. Users can create/view todos with assignments and filter by assignee.

---

## Phase 4: User Story 3 - Mark Tasks Complete (Priority: P3)

**Goal**: Enable marking todos as complete with visual distinction and timestamp tracking

**Independent Test**: Create todos, mark some complete, verify visual distinction and completion timestamp displays

### Database Operations for User Story 3

- [ ] T034 [P] [US3] Implement completeTodo() in src/lib/db/todos.ts that sets completed=true and completedAt timestamp

### Server Actions for User Story 3

- [ ] T035 [P] [US3] Implement completeTodoAction() in src/actions/todos.ts with requireAuthWithFamily() and revalidatePath()

### UI Components for User Story 3

- [ ] T036 [US3] Add complete button/checkbox to todo-item.tsx in src/app/(protected)/todos/components/
- [ ] T037 [US3] Add visual styling for completed todos in todo-item.tsx (strikethrough, opacity, or color change)
- [ ] T038 [US3] Add completion timestamp display to todo-item.tsx (show completedAt when completed=true)
- [ ] T039 [US3] Add completion status filter to todo-list.tsx (All / Active / Completed tabs/buttons)
- [ ] T040 [US3] Implement completion filtering logic in todos-page-client.tsx

### Manual Testing for User Story 3

- [ ] T041 [US3] Manual test: Mark todo complete with single click, verify completed status
- [ ] T042 [US3] Manual test: Verify completed todos visually distinct from active todos
- [ ] T043 [US3] Manual test: Filter to show only active todos, verify completed hidden
- [ ] T044 [US3] Manual test: Filter to show only completed todos, verify active hidden
- [ ] T045 [US3] Manual test: Verify completion timestamp displays correctly

**Checkpoint**: US1 + US2 + US3 complete. Users can track todo completion with visual feedback.

---

## Phase 5: User Story 4 - Edit and Delete Tasks (Priority: P4)

**Goal**: Enable editing todo descriptions/assignments and permanently deleting todos

**Independent Test**: Edit todo descriptions and assignments, delete todos, verify changes persist and deletions are permanent

### Database Operations for User Story 4

- [ ] T046 [P] [US4] Enhance updateTodo() in src/lib/db/todos.ts to support description updates (if not already done in US2)
- [ ] T047 [P] [US4] Implement deleteTodo() in src/lib/db/todos.ts with family ID validation

### Server Actions for User Story 4

- [ ] T048 [US4] Enhance updateTodoAction() in src/actions/todos.ts to support description updates with Zod validation
- [ ] T049 [P] [US4] Implement deleteTodoAction() in src/actions/todos.ts with requireAuthWithFamily() and revalidatePath()

### UI Components for User Story 4

- [ ] T050 [US4] Add edit mode to todo-item.tsx or create edit-todo-form.tsx component for inline editing
- [ ] T051 [US4] Add edit button to todo-item.tsx that toggles edit mode
- [ ] T052 [US4] Add delete button to todo-item.tsx with confirmation dialog
- [ ] T053 [US4] Implement edit handler in todos-page-client.tsx that calls updateTodoAction() with useTransition
- [ ] T054 [US4] Implement delete handler in todos-page-client.tsx that calls deleteTodoAction() with useTransition

### Manual Testing for User Story 4

- [ ] T055 [US4] Manual test: Edit todo description, verify update persists and displays
- [ ] T056 [US4] Manual test: Edit todo assignments, verify update persists and displays
- [ ] T057 [US4] Manual test: Delete todo with confirmation, verify removed from list
- [ ] T058 [US4] Manual test: Delete todo, verify other todos unaffected
- [ ] T059 [US4] Manual test: Verify 500+ character description shows validation error

**Checkpoint**: All user stories complete. Full CRUD functionality operational.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and performance validation

- [ ] T060 [P] Add empty state messaging to todo-list.tsx when no todos exist
- [ ] T061 [P] Add loading states during Server Action calls (use isPending from useTransition)
- [ ] T062 [P] Add error toast/alert component for displaying action errors to user
- [ ] T063 Verify TypeScript strict mode compliance: run npx tsc --noEmit
- [ ] T064 Run ESLint: npm run lint and fix any issues
- [ ] T065 Test performance with 50+ todos, verify <1 second load time per SC-003
- [ ] T066 Test all CRUD operations complete in <2 seconds per SC-007
- [ ] T067 Final constitution compliance check against plan.md checklist
- [ ] T068 Code cleanup: remove console.logs, unused imports, commented code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Creates database types and utilities that ALL user stories depend on
  - **MUST complete before any user story work begins**

- **User Story 1 (Phase 2)**: Depends on Setup (Phase 1) - No dependencies on other stories
  - This is the MVP - delivers core value

- **User Story 2 (Phase 3)**: Depends on Setup (Phase 1) - Extends US1
  - Enhances create/update actions from US1
  - Independently testable (can create/assign in one action)

- **User Story 3 (Phase 4)**: Depends on Setup (Phase 1) - Independent from US2
  - Can start after US1, does not require US2
  - Independently testable (can mark any todo complete)

- **User Story 4 (Phase 5)**: Depends on Setup (Phase 1) - Uses update/delete actions
  - Builds on update action from US2 (if US2 done) or creates it fresh
  - Independently testable (can edit/delete any todo)

- **Polish (Phase 6)**: Depends on desired user stories being complete
  - Can start when US1 complete (for MVP)
  - Or wait until all stories complete (for full feature)

### User Story Independence

Each user story after Phase 1 can be:
- ✅ Implemented independently after Phase 1 completes
- ✅ Tested independently without other stories
- ✅ Deployed as an MVP increment (US1 alone is valuable)
- ✅ Developed in parallel by different team members (with Phase 1 done)

### Within Each User Story

**Execution order within a story:**
1. Database operations (can be parallel if different operations)
2. Server Actions (can be parallel if different actions)
3. UI Components (can be parallel if different components)
4. Integration (wire up components in page/client)
5. Manual testing (sequential validation)

### Parallel Opportunities

**Phase 1 (Setup):**
- T001 and T002 can run in parallel (different files)

**Phase 2 (US1):**
- T005 and T006 can run in parallel (different functions in same file)
- T007 and T008 can run in parallel (different actions)
- T011, T012, T013 can run in parallel (different component files)

**Phase 3 (US2):**
- T021, T022, T023 can run in parallel (different functions)

**Phase 4 (US3):**
- T034 and T035 can run in parallel (different files)

**Phase 5 (US4):**
- T046, T047, T048, T049 can run in parallel (different operations/files)

**Phase 6 (Polish):**
- T060, T061, T062 can run in parallel (different concerns)

---

## Parallel Example: User Story 1 Database Layer

```bash
# Launch database operations for US1 together:
Task: "Implement getTodosForFamily() in src/lib/db/todos.ts"
Task: "Implement createTodo() in src/lib/db/todos.ts"

# These can run in parallel because they are different functions in the same file
# that don't depend on each other
```

## Parallel Example: User Story 1 Server Actions

```bash
# Launch Server Actions for US1 together:
Task: "Implement getTodosAction() in src/actions/todos.ts"
Task: "Implement createTodoAction() in src/actions/todos.ts"

# These can run in parallel because they are different exported functions
# in the same file with no interdependencies
```

## Parallel Example: User Story 1 Components

```bash
# Launch UI components for US1 together:
Task: "Create src/app/(protected)/todos/components/create-todo-form.tsx"
Task: "Create src/app/(protected)/todos/components/todo-list.tsx"
Task: "Create src/app/(protected)/todos/components/todo-item.tsx"

# These can run in parallel because they are different component files
# that will be integrated later
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - ~3 hours

**Recommended approach for fastest value delivery:**

1. ✅ Complete Phase 1: Setup (30 min)
   - Database types and utilities
2. ✅ Complete Phase 2: User Story 1 (2 hours)
   - Database operations → Server Actions → UI Components → Navigation
3. **STOP and VALIDATE**: Test US1 independently (30 min)
   - Can create todos, can view todos, newest first, family isolated
4. ✅ Deploy/demo MVP if ready

**At this point you have a working todo list!**

### Incremental Delivery (All User Stories) - ~4-5 hours total

**Full feature delivery:**

1. ✅ Complete Setup (Phase 1) - 30 min
2. ✅ Complete US1 (Phase 2) - 2 hours → **MVP ready**
3. ✅ Complete US2 (Phase 3) - 1 hour → **Assignments work**
4. ✅ Complete US3 (Phase 4) - 45 min → **Completion tracking works**
5. ✅ Complete US4 (Phase 5) - 45 min → **Full CRUD complete**
6. ✅ Complete Polish (Phase 6) - 30 min → **Production ready**

Each checkpoint adds value without breaking previous functionality.

### Parallel Team Strategy

**With 3 developers after Phase 1 completes:**

- **Developer A**: User Story 1 (2 hours) - MVP critical path
- **Developer B**: User Story 2 (1 hour) - Can start immediately after Setup
- **Developer C**: User Story 3 (45 min) - Can start immediately after Setup

**Benefit**: All 3 stories complete in ~2 hours instead of 3.75 hours sequentially.

**Note**: User Story 4 (edit/delete) should wait for US2 to complete since it builds on updateTodoAction().

---

## Task Summary

**Total Tasks**: 68

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (US1 - MVP): 15 tasks
- Phase 3 (US2): 14 tasks
- Phase 4 (US3): 12 tasks
- Phase 5 (US4): 14 tasks
- Phase 6 (Polish): 9 tasks

**By Category**:
- Database Layer: 8 tasks
- Server Actions: 8 tasks
- UI Components: 17 tasks
- Integration: 4 tasks
- Manual Testing: 20 tasks
- Infrastructure: 11 tasks

**Parallelizable Tasks**: 31 tasks marked with [P]

**MVP Scope** (Phases 1-2): 19 tasks (~3 hours)

**Full Feature** (Phases 1-6): 68 tasks (~4-5 hours)

---

## Validation Checklist

Before considering implementation complete:

### Constitution Compliance (per plan.md)
- [ ] All queries scoped to familyId via requireAuthWithFamily()
- [ ] No external service calls
- [ ] TypeScript strict mode, no `any` types
- [ ] Server Components fetch data, Client Components receive props
- [ ] Module in `(protected)` route group
- [ ] Uses shadcn/ui components as-is
- [ ] No unnecessary abstractions

### Success Criteria (per spec.md)
- [ ] SC-001: Create todo in <10 seconds ✓ (manual test)
- [ ] SC-002: Assign in <5 seconds ✓ (manual test)
- [ ] SC-003: List loads in <1 second ✓ (performance test)
- [ ] SC-005: Complete with single click ✓ (UI design)
- [ ] SC-006: 100 todos without lag ✓ (performance test)
- [ ] SC-007: Operations <2 seconds ✓ (manual test)

### Functional Requirements (per spec.md)
- [ ] FR-001: Create todos with description ✓ (US1)
- [ ] FR-002: Display all family todos ✓ (US1)
- [ ] FR-003: Assign to family members ✓ (US2)
- [ ] FR-004: Mark complete ✓ (US3)
- [ ] FR-005: Edit description ✓ (US4)
- [ ] FR-006: Modify assignments ✓ (US4)
- [ ] FR-007: Delete todos ✓ (US4)
- [ ] FR-008: MongoDB persistence with family isolation ✓ (All)
- [ ] FR-009: Validate non-empty description ✓ (All)
- [ ] FR-010: Display assigned members ✓ (US2)
- [ ] FR-011: Filter by family member ✓ (US2)
- [ ] FR-012: Visual distinction for completed ✓ (US3)
- [ ] FR-013: Record creation timestamp ✓ (All)
- [ ] FR-014: Record completion timestamp ✓ (US3)
- [ ] FR-015: Prevent cross-family access ✓ (All)

---

## Notes

- **[P]** = Parallelizable tasks (different files, no dependencies)
- **[Story]** = User story label (US1, US2, US3, US4) for traceability
- Each user story is independently completable and testable
- Manual testing approach per research.md (no automated tests in MVP)
- Commit after each task or logical group for easy rollback
- Stop at any checkpoint to validate story independently
- Use `router.refresh()` after mutations to refresh Server Component data
- Use `useTransition()` for pending states during Server Action calls

---

**Generated**: 2026-02-04 | **Feature**: Todo List Module | **Branch**: 001-todolist-module
