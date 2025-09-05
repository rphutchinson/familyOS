"use client";

import { Users, Calendar, Activity, Settings, Home } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Providers",
    href: "/providers",
    icon: Users,
    badge: "12",
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
    badge: "3",
  },
  {
    title: "Analytics",
    href: "/analytics", 
    icon: Activity,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-lg font-bold text-primary">
                Healthcare Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-4">
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <a href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.png" alt="User" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@health.com</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Healthcare Provider Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">
                  System Online
                </Badge>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}