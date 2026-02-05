# Research: Todo List Module

**Purpose**: Resolve NEEDS CLARIFICATION items and document technical decisions
**Created**: 2026-02-04
**Feature**: [spec.md](./spec.md)

## Testing Strategy

**Decision**: No automated testing framework currently in place; focus on manual testing for MVP

**Rationale**:
- Package.json shows no testing dependencies (no Jest, Vitest, Playwright, etc.)
- No test files found in src/ directory (grep for test patterns returned no results)
- Project is in early stage with emphasis on rapid feature delivery
- Constitution principle of "Simplicity" suggests avoiding premature infrastructure
- Manual testing via `npm run dev` is current approach

**Alternatives Considered**:
- **Jest/Vitest with React Testing Library**: Would provide unit and component testing but adds setup overhead and slows development velocity at this stage
- **Playwright/Cypress**: E2E testing would be valuable but requires significant setup and maintenance
- **Defer to future**: Best approach - implement features now, add testing framework when pattern stabilizes

**Implications**:
- All todo functionality will be manually tested during development
- Future iteration can add testing framework once module patterns are established
- Focus acceptance testing on the scenarios defined in spec.md

## MongoDB Data Model Patterns

**Decision**: Use existing FamilyOS MongoDB patterns with embedded ObjectId references

**Rationale**:
- Existing codebase uses MongoDB with direct collection access pattern (see `src/lib/db/families.ts`)
- Document-to-client conversion pattern established (`familyDocumentToFamily`)
- ObjectId for internal storage, string IDs for client-facing data
- No ODM/ORM layer - direct MongoDB driver usage

**Implementation Pattern**:
```typescript
// Database document structure
interface TodoDocument {
  _id: ObjectId;
  familyId: ObjectId;
  description: string;
  assignedMemberIds: ObjectId[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Client-facing structure
interface Todo {
  id: string;
  familyId: string;
  description: string;
  assignedMemberIds: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Converter function
function todoDocumentToTodo(doc: TodoDocument): Todo {
  return {
    id: doc._id.toString(),
    familyId: doc.familyId.toString(),
    description: doc.description,
    assignedMemberIds: doc.assignedMemberIds.map(id => id.toString()),
    completed: doc.completed,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
  };
}
```

**Alternatives Considered**:
- **Embedded sub-documents**: Could embed full family member objects in todos, but creates data duplication and sync issues
- **Mongoose ODM**: Would provide schema validation but adds abstraction layer that violates "Simplicity" principle
- **Separate assignments collection**: Overcomplicated for simple many-to-many relationship with few assignments

## Indexes for Performance

**Decision**: Create compound index on `familyId` + `completed` for list queries

**Rationale**:
- Primary query pattern: fetch all todos for a family, often filtered by completion status
- Performance requirement: <1 second list load time (SC-003) for up to 100 todos (SC-006)
- Compound index supports both full list and filtered list queries efficiently

**Index Strategy**:
```typescript
// In src/lib/db/init-indexes.ts (existing pattern)
await todos.createIndex(
  { familyId: 1, completed: 1, createdAt: -1 },
  { name: 'family_completion_date_idx' }
);

// Supports queries:
// 1. All todos for family: { familyId }
// 2. Active todos: { familyId, completed: false }
// 3. Completed todos: { familyId, completed: true }
// All with creation date sorting
```

**Alternatives Considered**:
- **Single familyId index**: Would work but less efficient for filtered queries
- **Separate indexes**: More storage overhead, compound index is more efficient
- **Text search index**: Not needed for MVP (no search functionality in spec)

## Assignment Query Pattern

**Decision**: Filter assignments in application code, not database queries

**Rationale**:
- Spec requirement FR-011: "System MUST filter todos by assigned family member when requested"
- Small data set (100 todos max) means in-memory filtering is performant
- MongoDB array query ($in) would require separate index and adds complexity
- Keeps query pattern simple and aligned with "Simplicity" principle

**Implementation**:
```typescript
// Fetch all todos for family
const todos = await getAllTodosForFamily(familyId);

// Filter in application code
const filteredTodos = selectedMemberId
  ? todos.filter(todo => todo.assignedMemberIds.includes(selectedMemberId))
  : todos;
```

**Alternatives Considered**:
- **MongoDB $in query**: Would push filtering to database but requires index on assignedMemberIds array field, adds query complexity
- **Separate query per filter**: Would require multiple database round-trips for different views

## Validation Strategy

**Decision**: Zod schemas for input validation in Server Actions

**Rationale**:
- Zod already a project dependency (package.json line 36)
- Provides runtime type checking at API boundary
- Requirement FR-009: "System MUST validate that todo descriptions are not empty before creation"
- Aligns with Type Safety constitutional principle

**Implementation Pattern**:
```typescript
import { z } from 'zod';

const createTodoSchema = z.object({
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  assignedMemberIds: z.array(z.string()).optional().default([]),
});

export async function createTodoAction(input: unknown) {
  const { user, family } = await requireAuthWithFamily();

  const validated = createTodoSchema.parse(input);

  // ... proceed with creation
}
```

**Alternatives Considered**:
- **Manual validation**: More error-prone, less maintainable
- **TypeScript-only validation**: No runtime checking, allows invalid data at runtime
- **Custom validation functions**: Reinvents wheel, Zod is already available

## Summary

All NEEDS CLARIFICATION items resolved:

1. ✅ **Testing**: Manual testing for MVP, defer automated testing to future iteration
2. ✅ **MongoDB Patterns**: Follow existing FamilyOS patterns with ObjectId conversion
3. ✅ **Performance**: Compound index strategy supports performance requirements
4. ✅ **Validation**: Use Zod schemas at Server Action boundaries
5. ✅ **Assignment Queries**: In-memory filtering for simplicity and performance

**Ready for Phase 1**: Data model and API contracts can now be defined with full technical context.
