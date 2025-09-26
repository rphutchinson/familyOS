"use client";

import { Users, Heart, Plus, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFamilyStore } from "@/lib/stores/family-store";

export default function Dashboard() {
  const { familyMembers, providers } = useFamilyStore();

  const modules = [
    {
      name: "Healthcare",
      description: "Manage healthcare providers and portal access",
      icon: Heart,
      href: "/modules/healthcare",
      count: providers.length,
      color: "bg-red-50 text-red-600 border-red-200",
      available: true
    },
    {
      name: "Tasks & Todos",
      description: "Family task coordination and assignments",
      icon: Plus,
      href: "/tasks",
      count: 0,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      available: false
    },
    {
      name: "Calendar",
      description: "Unified family calendar and events",
      icon: Calendar,
      href: "/calendar",
      count: 0,
      color: "bg-green-50 text-green-600 border-green-200",
      available: false
    },
    {
      name: "Finances",
      description: "Budget tracking and expense management",
      icon: DollarSign,
      href: "/finances",
      count: 0,
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              FamilyOS Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your family's organization headquarters
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/modules/family">
                <Users className="h-4 w-4 mr-2" />
                Manage Family
              </Link>
            </Button>
          </div>
        </div>

        {/* Family Overview */}
        {familyMembers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family Overview
              </CardTitle>
              <CardDescription>
                Your family members and their organization modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {modules.map((module) => (
            module.available ? (
              <Link key={module.name} href={module.href} className="block">
                <Card className="transition-all hover:shadow-lg cursor-pointer hover:-translate-y-1 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <module.icon className="h-5 w-5" />
                      </div>
                      {module.count > 0 && (
                        <Badge variant="secondary">
                          {module.count}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ) : (
              <Card
                key={module.name}
                className="opacity-60 h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <module.icon className="h-5 w-5" />
                    </div>
                    {module.count > 0 && (
                      <Badge variant="secondary">
                        {module.count}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button disabled className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {/* Quick Start */}
        {familyMembers.length === 0 && (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle>Welcome to FamilyOS</CardTitle>
              <CardDescription>
                Start by adding your family members to begin organizing
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/modules/family">
                  <Users className="h-4 w-4 mr-2" />
                  Add Family Members
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}