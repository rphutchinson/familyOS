"use client";

import { useState } from "react";
import { Users, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FamilyMemberCard } from "@/components/family-member-card";
import { AddFamilyMemberForm } from "@/components/add-family-member-form";
import { EditFamilyMemberForm } from "@/components/edit-family-member-form";
import { useFamilyStore } from "@/lib/stores/family-store";
import { FamilyMember } from "@/types";

export default function FamilyManagementPage() {
  const { familyMembers } = useFamilyStore();
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowEditForm(true);
  };

  const handleCloseEditForm = (open: boolean) => {
    setShowEditForm(open);
    if (!open) {
      setEditingMember(null);
    }
  };

  const totalMembers = familyMembers.length;
  const defaultMember = familyMembers.find(m => m.isDefault);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Family Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your family members to organize healthcare provider access
            </p>
          </div>
          
          <AddFamilyMemberForm />
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Family Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalMembers}</div>
                <div className="text-sm text-muted-foreground">
                  Family {totalMembers === 1 ? 'Member' : 'Members'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {defaultMember?.name || 'None'}
                </div>
                <div className="text-sm text-muted-foreground">Default Member</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(familyMembers.map(m => m.color)).size}
                </div>
                <div className="text-sm text-muted-foreground">Colors Used</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Members Grid */}
        {familyMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {familyMembers
              .sort((a, b) => {
                // Sort default member first, then by creation date
                if (a.isDefault) return -1;
                if (b.isDefault) return 1;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                />
              ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Family Members</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Start by adding your first family member to organize healthcare provider access.
            </p>
            <AddFamilyMemberForm 
              trigger={
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Family Member
                </Button>
              }
            />
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-2">Tips for Family Management</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use personal names like "Sarah" or "Dad" instead of just "Spouse" or "Parent"</li>
                  <li>• Choose unique colors for each family member to make them easy to identify</li>
                  <li>• The default member is used for quick-add functionality and provider suggestions</li>
                  <li>• You can share providers between family members (e.g., family dentist)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form Modal */}
        <EditFamilyMemberForm
          member={editingMember}
          open={showEditForm}
          onOpenChange={handleCloseEditForm}
        />
      </div>
    </div>
  );
}