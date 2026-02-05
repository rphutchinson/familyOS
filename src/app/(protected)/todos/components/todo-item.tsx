'use client';

import { useState } from 'react';
import type { Todo, FamilyMemberData } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { AssignmentSelector } from './assignment-selector';

interface TodoItemProps {
  todo: Todo;
  familyMembers: FamilyMemberData[];
  onComplete?: (todoId: string) => void;
  onEdit?: (todoId: string, description: string, assignedMemberIds: string[]) => void;
  onDelete?: (todoId: string) => void;
  disabled?: boolean;
}

export function TodoItem({
  todo,
  familyMembers,
  onComplete,
  onEdit,
  onDelete,
  disabled,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [editAssignedMemberIds, setEditAssignedMemberIds] = useState(todo.assignedMemberIds);

  const createdDate = new Date(todo.createdAt).toLocaleDateString();
  const createdTime = new Date(todo.createdAt).toLocaleTimeString();

  // Get assigned members for this todo
  const assignedMembers = familyMembers.filter((member) =>
    todo.assignedMemberIds.includes(member.id)
  );

  const handleCheckboxChange = () => {
    if (!todo.completed && onComplete) {
      onComplete(todo.id);
    }
  };

  const handleEditClick = () => {
    setEditDescription(todo.description);
    setEditAssignedMemberIds(todo.assignedMemberIds);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editDescription.trim()) {
      onEdit(todo.id, editDescription.trim(), editAssignedMemberIds);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDescription(todo.description);
    setEditAssignedMemberIds(todo.assignedMemberIds);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(todo.id);
    }
  };

  // Edit mode UI
  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Todo description"
              maxLength={500}
              autoFocus
            />

            <AssignmentSelector
              familyMembers={familyMembers}
              selectedMemberIds={editAssignedMemberIds}
              onChange={setEditAssignedMemberIds}
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editDescription.trim()}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normal view mode UI
  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled || todo.completed}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1">
            <p
              className={`text-base ${
                todo.completed
                  ? 'line-through text-muted-foreground opacity-70'
                  : ''
              }`}
            >
              {todo.description}
            </p>

            {/* Display assigned members */}
            {assignedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assignedMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-sm text-muted-foreground mt-2">
              <p>Created {createdDate} at {createdTime}</p>
              {todo.completed && todo.completedAt && (
                <p className="text-xs mt-1">
                  Completed {new Date(todo.completedAt).toLocaleDateString()} at{' '}
                  {new Date(todo.completedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!todo.completed && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                disabled={disabled}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={disabled}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
