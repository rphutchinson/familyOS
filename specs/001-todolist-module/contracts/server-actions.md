# Server Actions API Contract: Todo List Module

**Purpose**: Define Server Action signatures for todo operations
**Created**: 2026-02-04
**Feature**: [spec.md](../spec.md)

## Overview

All Server Actions follow FamilyOS patterns:
- Located in `src/actions/todos.ts`
- Use `requireAuthWithFamily()` for authentication and authorization
- Return typed results with `{ success: boolean, data?: T, error?: string }`
- Mark files with `"use server"` directive
- Call `revalidatePath()` after mutations

## Authentication & Authorization

All actions MUST:
1. Call `requireAuthWithFamily()` at start
2. Scope all queries to returned `family.id`
3. Validate member IDs belong to user's family
4. Return generic errors (no data leakage)

## Type Definitions

```typescript
// Success result
type ActionSuccess<T> = {
  success: true;
  data: T;
};

// Error result
type ActionError = {
  success: false;
  error: string;
};

// Combined result type
type ActionResult<T> = ActionSuccess<T> | ActionError;

// Todo type (client-facing)
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
```

---

## Actions

### getTodosAction

**Purpose**: Fetch all todos for authenticated user's family (FR-002)

**Signature**:
```typescript
export async function getTodosAction(): Promise<ActionResult<Todo[]>>
```

**Input**: None (uses authenticated session)

**Authorization**:
- Requires valid session via Better Auth
- Uses `requireAuthWithFamily()` to get family ID
- Returns only todos where `familyId` matches authenticated user's family

**Success Response**:
```typescript
{
  success: true,
  data: [
    {
      id: "507f1f77bcf86cd799439011",
      familyId: "507f1f77bcf86cd799439012",
      description: "Buy groceries",
      assignedMemberIds: ["507f1f77bcf86cd799439013"],
      completed: false,
      createdAt: "2026-02-04T10:30:00.000Z",
      updatedAt: "2026-02-04T10:30:00.000Z",
      completedAt: null
    },
    // ... more todos
  ]
}
```

**Error Response**:
```typescript
{
  success: false,
  error: "Failed to fetch todos"
}
```

**Query Pattern**:
- Fetch from `todos` collection
- Filter: `{ familyId: ObjectId(family.id) }`
- Sort: `{ createdAt: -1 }` (newest first)
- Convert ObjectIds to strings for client

**Performance**: Must complete in <1 second (SC-003)

---

### createTodoAction

**Purpose**: Create a new todo item (FR-001)

**Signature**:
```typescript
export async function createTodoAction(
  input: CreateTodoInput
): Promise<ActionResult<Todo>>
```

**Input**:
```typescript
interface CreateTodoInput {
  description: string;           // 1-500 characters
  assignedMemberIds?: string[];  // Optional array of member IDs
}
```

**Validation** (Zod schema):
```typescript
const createTodoSchema = z.object({
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  assignedMemberIds: z.array(z.string())
    .optional()
    .default([])
});
```

**Authorization**:
- Requires valid session
- All member IDs must exist in `family_members` collection
- All member IDs must belong to authenticated user's family

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "507f1f77bcf86cd799439011",
    familyId: "507f1f77bcf86cd799439012",
    description: "Buy groceries",
    assignedMemberIds: ["507f1f77bcf86cd799439013"],
    completed: false,
    createdAt: "2026-02-04T10:30:00.000Z",
    updatedAt: "2026-02-04T10:30:00.000Z",
    completedAt: null
  }
}
```

**Error Responses**:
```typescript
// Validation error
{
  success: false,
  error: "Description is required"
}

// Invalid member ID
{
  success: false,
  error: "One or more assigned members not found"
}

// Generic error
{
  success: false,
  error: "Failed to create todo"
}
```

**Mutation Pattern**:
- Insert into `todos` collection
- Set `completed: false`, `completedAt: null`
- Auto-generate `createdAt`, `updatedAt`
- Call `revalidatePath('/todos')` after success

**Performance**: Must complete in <2 seconds (SC-007)

---

### updateTodoAction

**Purpose**: Update todo description and/or assignments (FR-005, FR-006)

**Signature**:
```typescript
export async function updateTodoAction(
  todoId: string,
  input: UpdateTodoInput
): Promise<ActionResult<Todo>>
```

**Input**:
```typescript
interface UpdateTodoInput {
  description?: string;           // Optional, 1-500 characters if provided
  assignedMemberIds?: string[];   // Optional array of member IDs
}
```

**Validation** (Zod schema):
```typescript
const updateTodoSchema = z.object({
  description: z.string()
    .min(1, "Description cannot be empty")
    .max(500, "Description must be 500 characters or less")
    .optional(),
  assignedMemberIds: z.array(z.string())
    .optional()
});
```

**Authorization**:
- Requires valid session
- Todo must exist and belong to user's family
- All member IDs must belong to user's family

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "507f1f77bcf86cd799439011",
    familyId: "507f1f77bcf86cd799439012",
    description: "Buy groceries and snacks",  // Updated
    assignedMemberIds: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],  // Updated
    completed: false,
    createdAt: "2026-02-04T10:30:00.000Z",
    updatedAt: "2026-02-04T10:35:00.000Z",  // Updated timestamp
    completedAt: null
  }
}
```

**Error Responses**:
```typescript
// Not found or unauthorized
{
  success: false,
  error: "Todo not found"
}

// Validation error
{
  success: false,
  error: "Description cannot be empty"
}

// Invalid member
{
  success: false,
  error: "One or more assigned members not found"
}
```

**Mutation Pattern**:
- Update in `todos` collection
- Filter: `{ _id: ObjectId(todoId), familyId: ObjectId(family.id) }`
- Update fields: provided fields + `updatedAt: new Date()`
- Call `revalidatePath('/todos')` after success

**Performance**: Must complete in <2 seconds (SC-007)

---

### completeTodoAction

**Purpose**: Mark a todo as complete (FR-004)

**Signature**:
```typescript
export async function completeTodoAction(
  todoId: string
): Promise<ActionResult<Todo>>
```

**Input**: Todo ID (string)

**Authorization**:
- Requires valid session
- Todo must exist and belong to user's family

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "507f1f77bcf86cd799439011",
    familyId: "507f1f77bcf86cd799439012",
    description: "Buy groceries",
    assignedMemberIds: ["507f1f77bcf86cd799439013"],
    completed: true,              // Changed to true
    createdAt: "2026-02-04T10:30:00.000Z",
    updatedAt: "2026-02-04T10:40:00.000Z",  // Updated
    completedAt: "2026-02-04T10:40:00.000Z" // Set on completion
  }
}
```

**Error Response**:
```typescript
{
  success: false,
  error: "Todo not found"
}
```

**Mutation Pattern**:
- Update in `todos` collection
- Filter: `{ _id: ObjectId(todoId), familyId: ObjectId(family.id) }`
- Set: `{ completed: true, completedAt: new Date(), updatedAt: new Date() }`
- Call `revalidatePath('/todos')` after success

**Performance**: Must complete in <2 seconds (SC-007)

**Note**: Single-click completion per spec (SC-005)

---

### deleteTodoAction

**Purpose**: Permanently delete a todo (FR-007)

**Signature**:
```typescript
export async function deleteTodoAction(
  todoId: string
): Promise<ActionResult<{ id: string }>>
```

**Input**: Todo ID (string)

**Authorization**:
- Requires valid session
- Todo must exist and belong to user's family

**Success Response**:
```typescript
{
  success: true,
  data: {
    id: "507f1f77bcf86cd799439011"
  }
}
```

**Error Response**:
```typescript
{
  success: false,
  error: "Todo not found"
}
```

**Mutation Pattern**:
- Delete from `todos` collection
- Filter: `{ _id: ObjectId(todoId), familyId: ObjectId(family.id) }`
- Permanent deletion (no soft delete in MVP)
- Call `revalidatePath('/todos')` after success

**Performance**: Must complete in <2 seconds (SC-007)

**Warning**: Permanent operation, consider confirmation in UI

---

## Error Handling

### Standard Error Responses

All actions follow consistent error handling:

1. **Validation Errors**: Return Zod validation message
2. **Not Found**: "Todo not found" (don't reveal if todo exists in different family)
3. **Authorization**: "Todo not found" (same message as not found to prevent enumeration)
4. **Database Errors**: "Failed to {operation} todo" (generic, no details leaked)
5. **Unexpected Errors**: Logged server-side, return generic message to client

### Error Response Pattern

```typescript
try {
  // Validation
  const validated = schema.parse(input);

  // Authorization
  const { user, family } = await requireAuthWithFamily();

  // Business logic
  // ...

  return { success: true, data: result };
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false, error: error.errors[0].message };
  }

  console.error('Error in action:', error);
  return { success: false, error: 'Failed to perform operation' };
}
```

## Usage Pattern

### From Server Component (Page)

```typescript
// src/app/(protected)/todos/page.tsx
import { getTodosAction } from '@/actions/todos';
import { TodosPageClient } from './todos-page-client';

export default async function TodosPage() {
  const result = await getTodosAction();

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return <TodosPageClient initialTodos={result.data} />;
}
```

### From Client Component

```typescript
// src/app/(protected)/todos/todos-page-client.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createTodoAction } from '@/actions/todos';

export function TodosPageClient({ initialTodos }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreate = async (data) => {
    startTransition(async () => {
      const result = await createTodoAction(data);

      if (result.success) {
        router.refresh(); // Refresh Server Component data
      } else {
        // Show error to user
        alert(result.error);
      }
    });
  };

  return (
    <div>
      {/* UI using initialTodos */}
    </div>
  );
}
```

## Path Revalidation

All mutations must call `revalidatePath()` to update Server Component cache:

```typescript
import { revalidatePath } from 'next/cache';

// After successful mutation
revalidatePath('/todos');
```

## Summary

**Actions Defined**:
- ✅ `getTodosAction()` - Fetch all todos
- ✅ `createTodoAction(input)` - Create new todo
- ✅ `updateTodoAction(id, input)` - Update todo
- ✅ `completeTodoAction(id)` - Mark complete
- ✅ `deleteTodoAction(id)` - Delete todo

**Patterns Established**:
- Consistent error handling
- Family isolation via `requireAuthWithFamily()`
- Zod validation at boundaries
- Path revalidation after mutations
- Type-safe results with discriminated unions

**Constitutional Compliance**:
- ✅ Server-First Data Pattern (all mutations through Server Actions)
- ✅ Family Data Isolation (all queries scoped to family)
- ✅ Type Safety (explicit types, no `any`)
- ✅ Privacy-First (no external services, generic errors)

**Ready for Implementation**: All action signatures defined with validation and authorization rules.
