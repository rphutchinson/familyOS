# Quickstart Guide: Todo List Module Implementation

**Purpose**: Step-by-step implementation guide for developers
**Created**: 2026-02-04
**Feature**: [spec.md](./spec.md)

## Prerequisites

✅ Feature specification complete
✅ Data model defined
✅ API contracts documented
✅ Constitution check passed
✅ Branch `001-todolist-module` exists

## Implementation Order

Follow this sequence to maintain functional increments:

1. **Database Layer** → 2. **Server Actions** → 3. **UI Components** → 4. **Navigation** → 5. **Testing**

---

## Step 1: Database Layer (30 min)

### 1.1 Define TypeScript Types

**File**: `src/types/database.ts`

Add at the end of the file:

```typescript
// ============================================
// Todo Types
// ============================================

export interface TodoDocument {
  _id: ObjectId;
  familyId: ObjectId;
  description: string;
  assignedMemberIds: ObjectId[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Todo {
  id: string;
  familyId: string;
  description: string;
  assignedMemberIds: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTodoInput {
  description: string;
  assignedMemberIds?: string[];
}

export interface UpdateTodoInput {
  description?: string;
  assignedMemberIds?: string[];
}
```

**Verify**: Run `npx tsc --noEmit` to check for type errors

---

### 1.2 Create Database Utilities

**File**: `src/lib/db/todos.ts` (new file)

```typescript
// Database operations for todos collection

import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { TodoDocument, Todo, CreateTodoInput, UpdateTodoInput } from '@/types/database';

/**
 * Get the todos collection
 */
async function getTodosCollection() {
  const database = await getDatabase();
  return database.collection<TodoDocument>('todos');
}

/**
 * Convert TodoDocument to client-safe Todo
 */
export function todoDocumentToTodo(doc: TodoDocument): Todo {
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

/**
 * Get all todos for a family
 */
export async function getTodosForFamily(familyId: string): Promise<Todo[]> {
  const todos = await getTodosCollection();
  const docs = await todos
    .find({ familyId: new ObjectId(familyId) })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(todoDocumentToTodo);
}

/**
 * Create a new todo
 */
export async function createTodo(
  familyId: string,
  input: CreateTodoInput
): Promise<Todo> {
  const todos = await getTodosCollection();
  const now = new Date();

  const result = await todos.insertOne({
    _id: new ObjectId(),
    familyId: new ObjectId(familyId),
    description: input.description,
    assignedMemberIds: (input.assignedMemberIds || []).map(id => new ObjectId(id)),
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  const doc = await todos.findOne({ _id: result.insertedId });
  if (!doc) throw new Error('Failed to create todo');

  return todoDocumentToTodo(doc);
}

/**
 * Update a todo
 */
export async function updateTodo(
  todoId: string,
  familyId: string,
  input: UpdateTodoInput
): Promise<Todo | null> {
  const todos = await getTodosCollection();
  const updates: Partial<TodoDocument> = {
    updatedAt: new Date(),
  };

  if (input.description !== undefined) {
    updates.description = input.description;
  }

  if (input.assignedMemberIds !== undefined) {
    updates.assignedMemberIds = input.assignedMemberIds.map(id => new ObjectId(id));
  }

  const result = await todos.findOneAndUpdate(
    { _id: new ObjectId(todoId), familyId: new ObjectId(familyId) },
    { $set: updates },
    { returnDocument: 'after' }
  );

  return result ? todoDocumentToTodo(result) : null;
}

/**
 * Mark todo as complete
 */
export async function completeTodo(
  todoId: string,
  familyId: string
): Promise<Todo | null> {
  const todos = await getTodosCollection();
  const now = new Date();

  const result = await todos.findOneAndUpdate(
    { _id: new ObjectId(todoId), familyId: new ObjectId(familyId) },
    {
      $set: {
        completed: true,
        completedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  return result ? todoDocumentToTodo(result) : null;
}

/**
 * Delete a todo
 */
export async function deleteTodo(
  todoId: string,
  familyId: string
): Promise<boolean> {
  const todos = await getTodosCollection();
  const result = await todos.deleteOne({
    _id: new ObjectId(todoId),
    familyId: new ObjectId(familyId),
  });

  return result.deletedCount === 1;
}
```

**Verify**: Run `npx tsc --noEmit` to check for type errors

---

### 1.3 Create Database Index

**File**: `src/lib/db/init-indexes.ts`

Add at the end of the `initializeIndexes()` function:

```typescript
// Todos indexes
const todos = database.collection('todos');
await todos.createIndex(
  { familyId: 1, completed: 1, createdAt: -1 },
  { name: 'family_completion_date_idx' }
);
console.log('✓ Created todos indexes');
```

**Run**: `npm run db:init` to create indexes

---

## Step 2: Server Actions (45 min)

**File**: `src/actions/todos.ts` (new file)

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthWithFamily } from '@/lib/auth-utils';
import {
  getTodosForFamily,
  createTodo as dbCreateTodo,
  updateTodo as dbUpdateTodo,
  completeTodo as dbCompleteTodo,
  deleteTodo as dbDeleteTodo,
} from '@/lib/db/todos';
import { getFamilyMembersForFamily } from '@/lib/db/family-members';
import type { Todo } from '@/types/database';

// Result types
type ActionSuccess<T> = { success: true; data: T };
type ActionError = { success: false; error: string };
type ActionResult<T> = ActionSuccess<T> | ActionError;

// Validation schemas
const createTodoSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  assignedMemberIds: z.array(z.string()).optional().default([]),
});

const updateTodoSchema = z.object({
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  assignedMemberIds: z.array(z.string()).optional(),
});

/**
 * Validate that all member IDs belong to the family
 */
async function validateMemberIds(
  memberIds: string[],
  familyId: string
): Promise<boolean> {
  if (memberIds.length === 0) return true;

  const members = await getFamilyMembersForFamily(familyId);
  const validIds = new Set(members.map(m => m.id));

  return memberIds.every(id => validIds.has(id));
}

/**
 * Get all todos for authenticated user's family
 */
export async function getTodosAction(): Promise<ActionResult<Todo[]>> {
  try {
    const { family } = await requireAuthWithFamily();
    const todos = await getTodosForFamily(family.id);

    return { success: true, data: todos };
  } catch (error) {
    console.error('Error fetching todos:', error);
    return { success: false, error: 'Failed to fetch todos' };
  }
}

/**
 * Create a new todo
 */
export async function createTodoAction(
  input: unknown
): Promise<ActionResult<Todo>> {
  try {
    const validated = createTodoSchema.parse(input);
    const { family } = await requireAuthWithFamily();

    // Validate member IDs
    const validMembers = await validateMemberIds(
      validated.assignedMemberIds,
      family.id
    );
    if (!validMembers) {
      return { success: false, error: 'One or more assigned members not found' };
    }

    const todo = await dbCreateTodo(family.id, validated);

    revalidatePath('/todos');
    return { success: true, data: todo };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    console.error('Error creating todo:', error);
    return { success: false, error: 'Failed to create todo' };
  }
}

/**
 * Update a todo
 */
export async function updateTodoAction(
  todoId: string,
  input: unknown
): Promise<ActionResult<Todo>> {
  try {
    const validated = updateTodoSchema.parse(input);
    const { family } = await requireAuthWithFamily();

    // Validate member IDs if provided
    if (validated.assignedMemberIds) {
      const validMembers = await validateMemberIds(
        validated.assignedMemberIds,
        family.id
      );
      if (!validMembers) {
        return { success: false, error: 'One or more assigned members not found' };
      }
    }

    const todo = await dbUpdateTodo(todoId, family.id, validated);

    if (!todo) {
      return { success: false, error: 'Todo not found' };
    }

    revalidatePath('/todos');
    return { success: true, data: todo };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    console.error('Error updating todo:', error);
    return { success: false, error: 'Failed to update todo' };
  }
}

/**
 * Mark a todo as complete
 */
export async function completeTodoAction(
  todoId: string
): Promise<ActionResult<Todo>> {
  try {
    const { family } = await requireAuthWithFamily();
    const todo = await dbCompleteTodo(todoId, family.id);

    if (!todo) {
      return { success: false, error: 'Todo not found' };
    }

    revalidatePath('/todos');
    return { success: true, data: todo };
  } catch (error) {
    console.error('Error completing todo:', error);
    return { success: false, error: 'Failed to complete todo' };
  }
}

/**
 * Delete a todo
 */
export async function deleteTodoAction(
  todoId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const { family } = await requireAuthWithFamily();
    const deleted = await dbDeleteTodo(todoId, family.id);

    if (!deleted) {
      return { success: false, error: 'Todo not found' };
    }

    revalidatePath('/todos');
    return { success: true, data: { id: todoId } };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { success: false, error: 'Failed to delete todo' };
  }
}
```

**Verify**: Run `npx tsc --noEmit` to check for type errors

---

## Step 3: UI Components (2-3 hours)

### 3.1 Create Route Directory

```bash
mkdir -p src/app/\(protected\)/todos/components
```

### 3.2 Server Component Page

**File**: `src/app/(protected)/todos/page.tsx` (new file)

```typescript
import { getTodosAction } from '@/actions/todos';
import { TodosPageClient } from './todos-page-client';

export default async function TodosPage() {
  const result = await getTodosAction();

  if (!result.success) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: {result.error}</p>
      </div>
    );
  }

  return <TodosPageClient initialTodos={result.data} />;
}
```

### 3.3 Client Component Wrapper

**File**: `src/app/(protected)/todos/todos-page-client.tsx` (new file)

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Todo } from '@/types/database';
import { CreateTodoForm } from './components/create-todo-form';
import { TodoList } from './components/todo-list';

interface TodosPageClientProps {
  initialTodos: Todo[];
}

export function TodosPageClient({ initialTodos }: TodosPageClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Todo
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateTodoForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <TodoList todos={initialTodos} isPending={isPending} />
    </div>
  );
}
```

### 3.4 Individual Components

Create these components in `src/app/(protected)/todos/components/`:

1. **`create-todo-form.tsx`**: Form for creating todos with description + assignment selector
2. **`todo-list.tsx`**: List container with filtering by completion status
3. **`todo-item.tsx`**: Individual todo with complete/edit/delete actions
4. **`assignment-selector.tsx`**: Multi-select for family members

**Refer to**: Existing form patterns in `src/app/(protected)/healthcare/components/` for shadcn/ui usage

---

## Step 4: Navigation (5 min)

**File**: `src/components/main-nav.tsx`

Add todos link to navigation array:

```typescript
const navigation = [
  // ... existing items
  {
    name: 'Todos',
    href: '/todos',
    icon: CheckSquare, // Import from lucide-react
  },
];
```

---

## Step 5: Manual Testing (30 min)

### Test Checklist

Start dev server: `npm run dev`

**User Story 1: Create and View**
- [ ] Navigate to `/todos`
- [ ] Click "Add Todo"
- [ ] Create todo with description only (no assignment)
- [ ] Verify todo appears in list
- [ ] Create todo with family member assignment
- [ ] Verify assigned members display correctly
- [ ] Verify newest todos appear first

**User Story 2: Assignments**
- [ ] Create todo assigned to one member
- [ ] Create todo assigned to multiple members
- [ ] All assigned members display correctly

**User Story 3: Complete Tasks**
- [ ] Mark todo as complete
- [ ] Verify visual distinction (styling/strikethrough)
- [ ] Check completed timestamp displays

**User Story 4: Edit and Delete**
- [ ] Edit todo description
- [ ] Edit todo assignments
- [ ] Delete todo
- [ ] Verify it's removed from list

**Edge Cases**
- [ ] Try creating todo with empty description (should show error)
- [ ] View empty todo list (should show empty state)
- [ ] Test with 20+ todos (performance check)

---

## Verification Commands

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build (ensure no errors)
npm run build

# Dev server
npm run dev
```

---

## Constitutional Compliance Check

Before considering complete, verify:

- [x] All data queries scoped to `familyId` ✓
- [x] Server Actions use `requireAuthWithFamily()` ✓
- [x] No external service calls ✓
- [x] TypeScript strict mode, no `any` types ✓
- [x] Page is Server Component, interactions in Client Component ✓
- [x] Module in `(protected)` route group ✓
- [x] Uses shadcn/ui components as-is ✓
- [x] No unnecessary abstractions ✓

---

## Success Criteria Check

Per spec.md:

- [ ] SC-001: Create todo in <10 seconds ✓ (manual test)
- [ ] SC-002: Assign in <5 seconds ✓ (manual test)
- [ ] SC-003: List loads in <1 second ✓ (manual test)
- [ ] SC-005: Complete with single click ✓ (UI design)
- [ ] SC-006: 100 todos without lag ✓ (load test with dummy data)
- [ ] SC-007: Operations complete in <2 seconds ✓ (manual test)

---

## Next Steps

After implementation complete:

1. **Generate tasks**: Run `/speckit.tasks` to create task breakdown
2. **Code review**: Check against constitution and spec
3. **User testing**: Have family member test the feature
4. **Iterate**: Address any usability issues found

---

## Troubleshooting

**TypeScript errors**: Check that all types are imported from `@/types/database`

**Database connection errors**: Verify MongoDB is running and `.env.local` has correct `MONGODB_URI`

**Authorization errors**: Ensure user is logged in and has a family in database

**Todos not appearing**: Check browser console and server logs for errors, verify `revalidatePath()` is called

**Need help?**: Review existing modules (`/healthcare`, `/family`) for reference patterns

---

## Estimated Time

- Database Layer: **30 min**
- Server Actions: **45 min**
- UI Components: **2-3 hours**
- Navigation: **5 min**
- Testing: **30 min**

**Total**: **4-5 hours** for experienced Next.js developer

---

**Ready to implement!** Follow steps in order for smoothest development experience.
