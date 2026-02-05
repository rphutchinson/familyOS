import { getTodosAction } from '@/actions/todos';
import { getFamilyMembersAction } from '@/actions/family-members';
import { TodosPageClient } from './todos-page-client';

export default async function TodosPage() {
  const [todosResult, membersResult] = await Promise.all([
    getTodosAction(),
    getFamilyMembersAction(),
  ]);

  if (!todosResult.success) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: {todosResult.error}</p>
      </div>
    );
  }

  if (!membersResult.success) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error: {membersResult.error}</p>
      </div>
    );
  }

  return (
    <TodosPageClient
      initialTodos={todosResult.data}
      familyMembers={membersResult.data}
    />
  );
}
