"use client";

import { useState } from "react";
import { ExternalLink, MoreHorizontal, Edit, Trash2, Globe, User, Clock } from "lucide-react";
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
import { HealthcareProvider, FamilyMember } from "@/types";
import { useFamilyStore } from "@/lib/stores/family-store";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: HealthcareProvider;
  familyMembers: FamilyMember[];
  onEdit: (provider: HealthcareProvider) => void;
  className?: string;
}

export function ProviderCard({ provider, familyMembers, onEdit, className }: ProviderCardProps) {
  const { deleteProvider, markProviderUsed } = useFamilyStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteProvider(provider.id);
    } catch (error) {
      console.error("Failed to delete provider:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePortalClick = () => {
    markProviderUsed(provider.id);
    window.open(provider.portalUrl, '_blank');
  };

  // Get family members associated with this provider
  const associatedMembers = familyMembers.filter(member =>
    provider.familyMemberIds.includes(member.id)
  );

  const formatLastUsed = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">{provider.providerName}</h3>
            <p className="text-sm text-muted-foreground truncate">{provider.portalName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {provider.specialty}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {provider.portalPlatform}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {provider.autoDetected && (
              <Badge variant="outline" className="text-xs">
                Auto-detected
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
                <DropdownMenuItem onClick={() => onEdit(provider)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
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
      
      <CardContent className="space-y-4">
        {/* Family Members */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Family Members:</div>
          <div className="flex flex-wrap gap-1">
            {associatedMembers.map((member) => (
              <Badge
                key={member.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${member.color}20`, color: member.color }}
              >
                <User className="h-3 w-3 mr-1" />
                {member.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Login Username */}
        {provider.loginUsername && (
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Username:</span>
            <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
              {provider.loginUsername}
            </span>
          </div>
        )}

        {/* Notes */}
        {provider.notes && (
          <div className="text-sm">
            <span className="font-medium text-muted-foreground">Notes:</span>
            <p className="mt-1 text-sm text-muted-foreground">{provider.notes}</p>
          </div>
        )}

        {/* Last Used */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Last used: {formatLastUsed(provider.lastUsed)}
        </div>

        {/* Portal Login Button */}
        <Button 
          onClick={handlePortalClick}
          className="w-full"
          size="sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open {provider.portalName}
        </Button>
      </CardContent>
    </Card>
  );
}