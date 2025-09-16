import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Briefcase, User, Calendar } from "lucide-react";

interface Activity {
  id: string;
  type: "blog" | "job" | "user" | "system";
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: "published" | "draft" | "pending" | "active";
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "blog",
    title: "New Blog Post Created",
    description: "Digital Health Trends in 2024",
    user: "Dr. Sarah Johnson",
    timestamp: "2 minutes ago",
    status: "draft",
  },
  {
    id: "2",
    type: "job",
    title: "Job Listing Published",
    description: "Senior Nurse Practitioner - Emergency Care",
    user: "HR Manager",
    timestamp: "15 minutes ago",
    status: "active",
  },
  {
    id: "3",
    type: "user",
    title: "New User Registered",
    description: "Content Editor role assigned",
    user: "System",
    timestamp: "1 hour ago",
    status: "pending",
  },
  {
    id: "4",
    type: "blog",
    title: "Blog Post Updated",
    description: "Telemedicine Best Practices",
    user: "Dr. Michael Chen",
    timestamp: "2 hours ago",
    status: "published",
  },
  {
    id: "5",
    type: "system",
    title: "System Maintenance",
    description: "Database optimization completed",
    user: "System Admin",
    timestamp: "4 hours ago",
  },
];

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "blog":
      return FileText;
    case "job":
      return Briefcase;
    case "user":
      return User;
    default:
      return Calendar;
  }
};

const getStatusBadge = (status?: Activity["status"]) => {
  if (!status) return null;

  const variants = {
    published: "success",
    draft: "secondary",
    pending: "warning",
    active: "info",
  } as const;

  return (
    <Badge variant={variants[status] as any} className="text-xs">
      {status}
    </Badge>
  );
};

export function ActivityFeed() {
  return (
    <Card className="shadow-healthcare-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>
          Latest updates across your content management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="text-xs">
                      {activity.user.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {activity.user} • {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}