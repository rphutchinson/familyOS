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
