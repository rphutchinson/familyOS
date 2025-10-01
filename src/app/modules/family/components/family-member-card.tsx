"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Star, StarOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { FamilyMember } from "@/app/types";
import { useFamilyStore } from "@/app/lib/stores/family-store";
import { cn } from "@/app/lib/utils";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  className?: string;
}

export function FamilyMemberCard({ member, onEdit, className }: FamilyMemberCardProps) {
  const { deleteFamilyMember, setDefaultFamilyMember, familyMembers } = useFamilyStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteFamilyMember(member.id);
    } catch (error) {
      console.error("Failed to delete family member:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleDefault = () => {
    if (!member.isDefault) {
      setDefaultFamilyMember(member.id);
    }
  };

  const canDelete = familyMembers.length > 1;
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
              <h3 className="font-semibold text-lg">{member.name}</h3>
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(member)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                {!member.isDefault && (
                  <DropdownMenuItem onClick={handleToggleDefault}>
                    <Star className="h-4 w-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                
                {member.isDefault && familyMembers.length > 1 && (
                  <DropdownMenuItem onClick={handleToggleDefault} disabled>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove Default
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={!canDelete || isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
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