'use client';

import { useState, useTransition } from 'react';
import { createTodoAction } from '@/actions/todos';
import type { FamilyMemberData } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AssignmentSelector } from './assignment-selector';

interface CreateTodoFormProps {
  familyMembers: FamilyMemberData[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateTodoForm({
  familyMembers,
  onSuccess,
  onCancel,
}: CreateTodoFormProps) {
  const [description, setDescription] = useState('');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    startTransition(async () => {
      const result = await createTodoAction({
        description,
        assignedMemberIds,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isPending}
          maxLength={500}
          autoFocus
        />
      </div>

      <AssignmentSelector
        familyMembers={familyMembers}
        selectedMemberIds={assignedMemberIds}
        onChange={setAssignedMemberIds}
        disabled={isPending}
      />

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Todo'}
        </Button>
      </div>
    </form>
  );
}
