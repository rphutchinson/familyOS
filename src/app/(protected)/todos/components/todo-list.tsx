'use client';

import type { Todo, FamilyMemberData } from '@/types/database';
import { TodoItem } from './todo-item';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export type CompletionFilter = 'all' | 'active' | 'completed';

interface TodoListProps {
  todos: Todo[];
  familyMembers: FamilyMemberData[];
  selectedMemberId: string | null;
  completionFilter: CompletionFilter;
  onMemberFilterChange: (memberId: string | null) => void;
  onCompletionFilterChange: (filter: CompletionFilter) => void;
  onComplete?: (todoId: string) => void;
  onEdit?: (todoId: string, description: string, assignedMemberIds: string[]) => void;
  onDelete?: (todoId: string) => void;
  isPending: boolean;
}

export function TodoList({
  todos,
  familyMembers,
  selectedMemberId,
  completionFilter,
  onMemberFilterChange,
  onCompletionFilterChange,
  onComplete,
  onEdit,
  onDelete,
  isPending,
}: TodoListProps) {
  return (
    <div className="space-y-4">
      {/* Filter controls - always visible */}
      <div className="space-y-4 p-4 border rounded-lg bg-card">
        {/* Completion status tabs */}
        <div className="flex gap-2">
          <Button
            variant={completionFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCompletionFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={completionFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCompletionFilterChange('active')}
          >
            Active
          </Button>
          <Button
            variant={completionFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCompletionFilterChange('completed')}
          >
            Completed
          </Button>
        </div>

        {/* Member filter */}
        {familyMembers.length > 0 && (
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">Filter by:</Label>
            <Select
              value={selectedMemberId || 'all'}
              onValueChange={(value) =>
                onMemberFilterChange(value === 'all' ? null : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All family members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All family members</SelectItem>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      {member.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Todo list or empty state */}
      {todos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
          <p className="text-lg">No todos found</p>
          <p className="text-sm mt-2">
            {completionFilter === 'active' && 'No active todos. '}
            {completionFilter === 'completed' && 'No completed todos. '}
            {selectedMemberId && 'Try changing the filter or assignment. '}
            {!selectedMemberId && completionFilter === 'all' && 'Click &quot;Add Todo&quot; to create your first task'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              familyMembers={familyMembers}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
