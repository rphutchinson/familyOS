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
import { getFamilyMembers } from '@/lib/db/family-members';
import type { Todo, ActionResult } from '@/types/database';

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

  const members = await getFamilyMembers(familyId);
  const validIds = new Set(members.map((m) => m.id));

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
 * Get count of active (non-completed) todos for authenticated user's family
 */
export async function getActiveTodoCountAction(): Promise<ActionResult<number>> {
  try {
    const { family } = await requireAuthWithFamily();
    const todos = await getTodosForFamily(family.id);
    const activeCount = todos.filter((todo) => !todo.completed).length;

    return { success: true, data: activeCount };
  } catch (error) {
    console.error('Error fetching active todo count:', error);
    return { success: false, error: 'Failed to fetch todo count' };
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
      return { success: false, error: error.issues[0].message };
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
      return { success: false, error: error.issues[0].message };
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
