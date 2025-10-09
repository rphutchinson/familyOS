"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Edit, Trash2, Star, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FamilyMemberData } from "@/types/database";
import { deleteFamilyMemberAction, setDefaultFamilyMemberAction } from "@/actions/family-members";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FamilyMemberCardProps {
  member: FamilyMemberData;
  onEdit: (member: FamilyMemberData) => void;
  className?: string;
}

export function FamilyMemberCard({ member, onEdit, className }: FamilyMemberCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteFamilyMemberAction(member.id);

      if (result.success) {
        toast.success('Family member deleted');
        router.refresh();
      } else {
        toast.error(result.error);
      }
      setIsDeleting(false);
    });
  };

  const handleToggleDefault = () => {
    if (!member.isDefault) {
      startTransition(async () => {
        const result = await setDefaultFamilyMemberAction(member.id);

        if (result.success) {
          toast.success('Default member updated');
          router.refresh();
        } else {
          toast.error(result.error);
        }
      });
    }
  };

  const canDelete = !member.userId; // Can only delete non-user members
  const initials = member.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: member.color }}
            >
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {member.name}
                {member.userId && (
                  <User className="h-4 w-4 text-blue-600" aria-label="Has account" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{member.relationship}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {member.isDefault && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Default
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isPending}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>

                {!member.isDefault && member.userId && (
                  <DropdownMenuItem onClick={handleToggleDefault} disabled={isPending}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={!canDelete || isDeleting || isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
                {!canDelete && (
                  <p className="text-xs text-muted-foreground px-2 py-1">
                    Cannot delete members with accounts
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="text-sm text-muted-foreground">
          Added {new Date(member.createdAt).toLocaleDateString()}
        </div>
        {member.updatedAt !== member.createdAt && (
          <div className="text-xs text-muted-foreground">
            Updated {new Date(member.updatedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}