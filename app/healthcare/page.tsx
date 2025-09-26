"use client";

import { useState, useMemo } from "react";
import { Plus, Users, Zap, Heart } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderCard } from "@/components/provider-card";
import { AddProviderForm } from "@/components/add-provider-form";
import { EditProviderForm } from "@/components/edit-provider-form";
import { useFamilyStore } from "@/lib/stores/family-store";
import { HealthcareProvider } from "@/types";

export default function HealthcarePage() {
  const { familyMembers, providers, groupProvidersByFamily } = useFamilyStore();
  const [editingProvider, setEditingProvider] = useState<HealthcareProvider | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | "all">("all");

  // Get family groups with providers
  const familyGroups = groupProvidersByFamily();

  // Filter providers based on selected family member
  const filteredData = useMemo(() => {
    if (selectedFamilyMemberId === "all") {
      // For ALL view, deduplicate providers and show them in a single list
      const uniqueProviders = providers.reduce((acc, provider) => {
        if (!acc.find(p => p.id === provider.id)) {
          acc.push(provider);
        }
        return acc;
      }, [] as HealthcareProvider[]);

      return {
        isAllView: true,
        providers: uniqueProviders,
        familyGroups: []
      };
    } else {
      // Show only providers for selected family member
      const selectedMember = familyMembers.find(m => m.id === selectedFamilyMemberId);
      if (!selectedMember) return { isAllView: false, providers: [], familyGroups: [] };

      const memberProviders = providers.filter(provider =>
        provider.familyMemberIds.includes(selectedFamilyMemberId)
      );

      return {
        isAllView: false,
        providers: memberProviders,
        familyGroups: [{
          familyMember: selectedMember,
          providers: memberProviders
        }]
      };
    }
  }, [selectedFamilyMemberId, providers, familyMembers]);

  const handleEditProvider = (provider: HealthcareProvider) => {
    setEditingProvider(provider);
    setShowEditForm(true);
  };

  const handleCloseEditForm = (open: boolean) => {
    setShowEditForm(open);
    if (!open) {
      setEditingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-600" />
              Healthcare Portal Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Organize and access your family's healthcare provider portals
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/family">
                <Users className="h-4 w-4 mr-2" />
                Manage Family
              </Link>
            </Button>
            <AddProviderForm />
          </div>
        </div>

        {/* Family Navigation */}
        {familyMembers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedFamilyMemberId === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFamilyMemberId("all")}
                className="mb-2"
              >
                All Family Members
                <Badge variant="secondary" className="ml-2">
                  {providers.length}
                </Badge>
              </Button>
              {familyMembers.map((member) => {
                const memberProviderCount = providers.filter(p =>
                  p.familyMemberIds.includes(member.id)
                ).length;

                return (
                  <Button
                    key={member.id}
                    variant={selectedFamilyMemberId === member.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFamilyMemberId(member.id)}
                    className="mb-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name}
                    <Badge variant="secondary" className="ml-2">
                      {memberProviderCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Add Section */}
        <Card className="mb-8 border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Quick Add</h3>
                  <p className="text-sm text-muted-foreground">
                    Currently viewing a healthcare portal? Quick-add it here.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Add Current Site
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Provider Display */}
        {filteredData.isAllView ? (
          // Show all providers in a single grid without family groupings
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">All Providers</h2>
              <Badge variant="secondary" className="text-xs">
                {filteredData.providers.length} {filteredData.providers.length === 1 ? 'provider' : 'providers'}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  familyMembers={familyMembers}
                  onEdit={handleEditProvider}
                />
              ))}
            </div>
          </div>
        ) : (
          // Show providers grouped by selected family member
          filteredData.familyGroups.map((group) => (
            <div key={group.familyMember.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: group.familyMember.color }}
                />
                <h2 className="text-xl font-semibold">
                  {group.familyMember.name}
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {group.providers.length} {group.providers.length === 1 ? 'provider' : 'providers'}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    familyMembers={familyMembers}
                    onEdit={handleEditProvider}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Empty State */}
        {filteredData.providers.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No healthcare providers yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Start by adding family members and their healthcare providers to organize portal access.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/family">
                  <Users className="h-4 w-4 mr-2" />
                  Add Family Members
                </Link>
              </Button>
              <AddProviderForm
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Provider
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {/* Edit Provider Modal */}
        <EditProviderForm
          provider={editingProvider}
          open={showEditForm}
          onOpenChange={handleCloseEditForm}
        />
      </div>
    </div>
  );
}