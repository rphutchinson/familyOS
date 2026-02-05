# Data Model: Todo List Module

**Purpose**: Define entities, fields, relationships, and validation rules
**Created**: 2026-02-04
**Feature**: [spec.md](./spec.md)

## Entities

### Todo

Represents a task to be completed by one or more family members.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `_id` | ObjectId | Yes | MongoDB document ID | Auto-generated |
| `familyId` | ObjectId | Yes | Reference to family that owns this todo | Must exist in families collection |
| `description` | string | Yes | Task description text | Min: 1 char, Max: 500 chars |
| `assignedMemberIds` | ObjectId[] | No | Array of family member IDs assigned to this task | Each ID must exist in family_members collection |
| `completed` | boolean | Yes | Whether task is completed | Default: false |
| `createdAt` | Date | Yes | When todo was created | Auto-generated on creation |
| `updatedAt` | Date | Yes | When todo was last modified | Auto-updated on modification |
| `completedAt` | Date | No | When todo was marked complete | Set when completed = true |

**Client-Facing Type** (converted from document):

```typescript
interface Todo {
  id: string;                    // _id.toString()
  familyId: string;              // familyId.toString()
  description: string;
  assignedMemberIds: string[];   // ObjectId[].map(toString)
  completed: boolean;
  createdAt: string;             // ISO 8601 format
  updatedAt: string;             // ISO 8601 format
  completedAt?: string;          // ISO 8601 format, optional
}
```

**Indexes**:

```typescript
// Compound index for primary query patterns
{
  familyId: 1,
  completed: 1,
  createdAt: -1
}
// Name: 'family_completion_date_idx'
// Supports: family queries, completion filtering, date sorting
```

## Relationships

### Todo → Family (Many-to-One)

- **Foreign Key**: `familyId` references `families._id`
- **Cardinality**: Each todo belongs to exactly one family
- **Enforcement**: Server-side validation in Server Actions via `requireAuthWithFamily()`
- **Cascade**: If family deleted, todos should be cascade deleted (not in MVP scope)

### Todo → Family Members (Many-to-Many)

- **Foreign Key**: `assignedMemberIds[]` array references `family_members._id`
- **Cardinality**: Each todo can be assigned to zero or more family members
- **Enforcement**: Validation checks that all IDs exist in family_members collection with matching familyId
- **Cascade**: If family member deleted, remove their ID from todos' assignedMemberIds arrays (not in MVP scope)

## State Transitions

### Todo Lifecycle

```
[Created] → completed: false, completedAt: null
    ↓
[Active] ← can be edited, assigned, or deleted
    ↓ (mark complete)
[Completed] → completed: true, completedAt: Date
    ↓ (optional, not in MVP)
[Uncomplete] → completed: false, completedAt: null
```

**State Rules**:
- New todos start with `completed: false` and `completedAt: null`
- When marking complete: set `completed: true`, `completedAt: Date.now()`, update `updatedAt`
- When marking incomplete (future): set `completed: false`, `completedAt: null`, update `updatedAt`
- Description and assignments can be modified in any state
- Deleted todos are removed permanently (no soft delete in MVP)

## Validation Rules

### Todo Creation (FR-001, FR-009)

```typescript
{
  description: {
    required: true,
    minLength: 1,
    maxLength: 500,
    type: 'string',
    message: 'Description must be 1-500 characters'
  },
  assignedMemberIds: {
    required: false,
    default: [],
    type: 'array of strings',
    validate: 'All IDs must exist in family_members for user\'s family'
  }
}
```

### Todo Update (FR-005, FR-006)

```typescript
{
  description: {
    optional: true,
    minLength: 1,
    maxLength: 500,
    type: 'string'
  },
  assignedMemberIds: {
    optional: true,
    type: 'array of strings',
    validate: 'All IDs must exist in family_members for user\'s family'
  },
  completed: {
    optional: true,
    type: 'boolean'
  }
}
```

### Authorization Rules (FR-015)

All operations MUST enforce:

1. **Family Isolation**: User can only access todos where `todo.familyId === user.familyId`
2. **Authentication**: All endpoints require valid session via Better Auth
3. **Authorization**: `requireAuthWithFamily()` helper enforces family-scoped access
4. **Member Validation**: Assignment IDs must belong to members in same family

## Query Patterns

### Primary Queries

**Get All Todos for Family**:
```javascript
db.todos.find({ familyId: ObjectId(familyId) })
  .sort({ createdAt: -1 })
```

**Get Active Todos**:
```javascript
db.todos.find({ familyId: ObjectId(familyId), completed: false })
  .sort({ createdAt: -1 })
```

**Get Completed Todos**:
```javascript
db.todos.find({ familyId: ObjectId(familyId), completed: true })
  .sort({ createdAt: -1 })
```

**Filter by Assignment** (in application code):
```javascript
const todos = await getAllTodos(familyId);
const filtered = todos.filter(t => t.assignedMemberIds.includes(memberId));
```

### Mutations

**Create**:
```javascript
const result = await db.todos.insertOne({
  familyId: ObjectId(familyId),
  description: validated.description,
  assignedMemberIds: validated.assignedMemberIds.map(id => ObjectId(id)),
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: null
});
```

**Update**:
```javascript
await db.todos.updateOne(
  { _id: ObjectId(todoId), familyId: ObjectId(familyId) },
  {
    $set: {
      ...updates,
      updatedAt: new Date()
    }
  }
);
```

**Complete**:
```javascript
await db.todos.updateOne(
  { _id: ObjectId(todoId), familyId: ObjectId(familyId) },
  {
    $set: {
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date()
    }
  }
);
```

**Delete**:
```javascript
await db.todos.deleteOne({
  _id: ObjectId(todoId),
  familyId: ObjectId(familyId)
});
```

## Data Migration

**MVP**: No migration needed - new collection

**Future Considerations**:
- If adding due dates, use `$set` with default value
- If adding priority field, use `$set` with default value
- If adding subtasks, consider separate collection vs embedded array

## Performance Characteristics

**Expected Scale** (per spec SC-006):
- Max 100 todos per family
- Estimated average: 20-30 active todos per family

**Performance Requirements** (per spec SC-003, SC-007):
- List load: <1 second
- CRUD operations: <2 seconds

**Index Impact**:
- Compound index covers primary query patterns
- Small collection size means memory fits in RAM
- Write performance: negligible impact with 100 docs
- Read performance: index provides O(log n) lookup

## Edge Cases

### Empty Description (FR-009)
- **Prevention**: Zod validation rejects at Server Action boundary
- **Message**: "Description must be 1-500 characters"

### Assignment to Deleted Member
- **MVP**: No automatic cleanup (member deletion not in scope)
- **Future**: Add cascade cleanup when member deletion implemented

### Assignment to Non-Existent Member
- **Prevention**: Validation checks all IDs exist before saving
- **Error**: "One or more assigned members not found"

### Very Long Description (500+ chars)
- **Prevention**: Zod validation rejects at Server Action boundary
- **Message**: "Description must be 1-500 characters"

### Concurrent Edits
- **MVP**: Last write wins (standard MongoDB behavior)
- **Future**: Consider optimistic locking with version field if needed

### Empty Todo List
- **Handling**: UI shows empty state with call-to-action to create first todo
- **No error**: Empty array is valid response

## Summary

**Collections**:
- `todos` (new collection)

**Indexes**:
- Compound: `{ familyId: 1, completed: 1, createdAt: -1 }`

**Relationships**:
- Todo → Family (many-to-one via familyId)
- Todo → Family Members (many-to-many via assignedMemberIds array)

**Validation**:
- Zod schemas at Server Action boundaries
- Family isolation via requireAuthWithFamily()
- Member existence validation for assignments

**Ready for API Contract Definition**: Entity structure and validation rules defined.
