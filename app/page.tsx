"use client";

import { useState } from "react";
import { Plus, ExternalLink, Users, Settings, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProviders } from "@/hooks/use-providers";
import { useFamilyMembers } from "@/hooks/use-family-members";
import { Provider, FamilyMember } from "@/types";

export default function Home() {
  const { providers, groupProvidersByFamily, markProviderAccessed } = useProviders();
  const { familyMembers } = useFamilyMembers();
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showManageFamily, setShowManageFamily] = useState(false);

  // Sample data for demo when no real data exists
  const sampleFamilyMembers: FamilyMember[] = [
    { id: "self", name: "Me", relationship: "Self", color: "#3b82f6", isDefault: true },
    { id: "spouse", name: "Sarah", relationship: "Spouse", color: "#ef4444" },
    { id: "child1", name: "Emma", relationship: "Child", color: "#22c55e" }
  ];

  const sampleProviders: Provider[] = [
    {
      id: "1",
      name: "Dr. Johnson",
      specialty: "Primary Care", 
      portalUrl: "https://mychart.example.com",
      portalPlatform: "MyChart",
      familyMemberIds: ["self"]
    },
    {
      id: "2",
      name: "City Dental",
      specialty: "Dentistry",
      portalUrl: "https://patientportal.example.com", 
      portalPlatform: "Patient Portal",
      familyMemberIds: ["self", "spouse", "child1"]
    },
    {
      id: "3",
      name: "Children's Hospital",
      specialty: "Pediatrics",
      portalUrl: "https://epic.example.com",
      portalPlatform: "Epic",
      familyMemberIds: ["child1"]
    }
  ];

  // Use real data if available, otherwise show demo data
  const displayFamilyMembers = familyMembers.length > 1 ? familyMembers : sampleFamilyMembers;
  const displayProviders = providers.length > 0 ? providers : sampleProviders;

  // Group providers by family member
  const familyGroups = displayFamilyMembers.map(familyMember => ({
    familyMember,
    providers: displayProviders.filter(provider => 
      provider.familyMemberIds.includes(familyMember.id)
    )
  })).filter(group => group.providers.length > 0);

  const handlePortalClick = (provider: Provider) => {
    markProviderAccessed(provider.id);
    window.open(provider.portalUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Family Healthcare Portals
            </h1>
            <p className="text-muted-foreground mt-2">
              Quick access to healthcare portals for your family
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowManageFamily(true)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Family
            </Button>
            <Button onClick={() => setShowAddProvider(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </div>

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

        {/* Family Groups */}
        {familyGroups.map((group) => (
          <div key={group.familyMember.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: group.familyMember.color || '#94a3b8' }}
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
                <Card key={provider.id} className="hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {provider.specialty}
                        </CardDescription>
                      </div>
                      {provider.quickAddData?.autoDetected && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Auto-detected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Portal:</span>
                      <span className="ml-2">{provider.portalPlatform}</span>
                    </div>
                    
                    {provider.username && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Username:</span>
                        <span className="ml-2 font-mono text-xs">{provider.username}</span>
                      </div>
                    )}
                    
                    {provider.notes && (
                      <p className="text-sm text-muted-foreground">
                        {provider.notes}
                      </p>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handlePortalClick(provider)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Portal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {familyGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No providers yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Start by adding family members and their healthcare providers to organize portal access.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowManageFamily(true)}>
                <Users className="h-4 w-4 mr-2" />
                Add Family Members
              </Button>
              <Button onClick={() => setShowAddProvider(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}