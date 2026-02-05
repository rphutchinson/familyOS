'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Todo, FamilyMemberData } from '@/types/database';
import { completeTodoAction, updateTodoAction, deleteTodoAction } from '@/actions/todos';
import { CreateTodoForm } from './components/create-todo-form';
import { TodoList, type CompletionFilter } from './components/todo-list';
import { DeleteTodoDialog } from './components/delete-todo-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';

interface TodosPageClientProps {
  initialTodos: Todo[];
  familyMembers: FamilyMemberData[];
}

export function TodosPageClient({
  initialTodos,
  familyMembers,
}: TodosPageClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleComplete = (todoId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await completeTodoAction(todoId);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleEdit = (todoId: string, description: string, assignedMemberIds: string[]) => {
    setError(null);
    startTransition(async () => {
      const result = await updateTodoAction(todoId, {
        description,
        assignedMemberIds,
      });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleDeleteClick = (todoId: string) => {
    const todo = initialTodos.find((t) => t.id === todoId);
    if (todo) {
      setTodoToDelete(todo);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (todoToDelete) {
      setError(null);
      startTransition(async () => {
        const result = await deleteTodoAction(todoToDelete.id);
        if (result.success) {
          router.refresh();
        } else {
          setError(result.error);
        }
      });
      setTodoToDelete(null);
    }
  };

  // Filter todos based on completion status and selected member
  const filteredTodos = useMemo(() => {
    let todos = initialTodos;

    // Filter by completion status
    if (completionFilter === 'active') {
      todos = todos.filter((todo) => !todo.completed);
    } else if (completionFilter === 'completed') {
      todos = todos.filter((todo) => todo.completed);
    }

    // Filter by selected member
    if (selectedMemberId) {
      todos = todos.filter((todo) =>
        todo.assignedMemberIds.includes(selectedMemberId)
      );
    }

    return todos;
  }, [initialTodos, completionFilter, selectedMemberId]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Todo List</h1>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Todo
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-card">
          <CreateTodoForm
            familyMembers={familyMembers}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <TodoList
        todos={filteredTodos}
        familyMembers={familyMembers}
        selectedMemberId={selectedMemberId}
        completionFilter={completionFilter}
        onMemberFilterChange={setSelectedMemberId}
        onCompletionFilterChange={setCompletionFilter}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        isPending={isPending}
      />

      <DeleteTodoDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        todoDescription={todoToDelete?.description || ''}
      />
    </div>
  );
}
