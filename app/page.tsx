import { Users, Calendar, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard-layout";

const stats = [
  {
    title: "Total Providers",
    value: "24",
    change: "+2 this month",
    icon: Users,
    trend: "up",
  },
  {
    title: "Active Patients",
    value: "1,247",
    change: "+18% from last month",
    icon: Activity,
    trend: "up",
  },
  {
    title: "Appointments Today",
    value: "32",
    change: "8 pending",
    icon: Calendar,
    trend: "neutral",
  },
  {
    title: "Revenue Growth",
    value: "$12,450",
    change: "+15% this quarter",
    icon: TrendingUp,
    trend: "up",
  },
];

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your healthcare providers today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Providers</CardTitle>
              <CardDescription>
                Latest healthcare providers added to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Dr. Sarah Johnson", specialty: "Cardiology", status: "active" },
                  { name: "Dr. Michael Chen", specialty: "Pediatrics", status: "active" },
                  { name: "Dr. Emily Davis", specialty: "Neurology", status: "pending" },
                ].map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                    </div>
                    <Badge variant={provider.status === "active" ? "default" : "secondary"}>
                      {provider.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Appointments</CardTitle>
              <CardDescription>
                Upcoming appointments for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "9:00 AM", patient: "John Smith", provider: "Dr. Johnson" },
                  { time: "10:30 AM", patient: "Mary Wilson", provider: "Dr. Chen" },
                  { time: "2:00 PM", patient: "Robert Brown", provider: "Dr. Davis" },
                ].map((appointment) => (
                  <div key={`${appointment.time}-${appointment.patient}`} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient} with {appointment.provider}
                      </p>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
