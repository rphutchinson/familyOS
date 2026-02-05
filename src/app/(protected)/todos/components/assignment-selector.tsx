'use client';

import { useState } from 'react';
import type { FamilyMemberData } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AssignmentSelectorProps {
  familyMembers: FamilyMemberData[];
  selectedMemberIds: string[];
  onChange: (memberIds: string[]) => void;
  disabled?: boolean;
}

export function AssignmentSelector({
  familyMembers,
  selectedMemberIds,
  onChange,
  disabled,
}: AssignmentSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleMember = (memberId: string) => {
    if (selectedMemberIds.includes(memberId)) {
      onChange(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      onChange([...selectedMemberIds, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    onChange(selectedMemberIds.filter((id) => id !== memberId));
  };

  const selectedMembers = familyMembers.filter((m) =>
    selectedMemberIds.includes(m.id)
  );

  return (
    <div className="space-y-2">
      <Label>Assign to (optional)</Label>

      {/* Selected badges */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedMembers.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              {member.name}
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                disabled={disabled}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown selector */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={disabled || familyMembers.length === 0}
          >
            <span className="text-muted-foreground">
              {familyMembers.length === 0
                ? 'No family members available'
                : selectedMembers.length === 0
                ? 'Select family members'
                : `${selectedMembers.length} selected`}
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          <div className="p-2 space-y-2">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-accent rounded p-2"
                onClick={() => toggleMember(member.id)}
              >
                <Checkbox
                  checked={selectedMemberIds.includes(member.id)}
                  onCheckedChange={() => toggleMember(member.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="text-sm">{member.name}</span>
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
