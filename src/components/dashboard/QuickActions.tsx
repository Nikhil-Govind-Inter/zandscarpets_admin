import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Edit,
  Users,
  Upload,
  BarChart3,
  Settings,
} from "lucide-react";

const quickActions = [
  {
    title: "New Blog Post",
    description: "Create a new blog article",
    icon: PlusCircle,
    href: "/blogs/new",
    variant: "gradient" as const,
  },
  {
    title: "Manage Professionals",
    description: "Post a new job opening",
    icon: Edit,
    href: "/professionals/new",
    variant: "default" as const,
  },
  // {
  //   title: "Manage Users",
  //   description: "Add or edit user accounts",
  //   icon: Users,
  //   href: "/users",
  //   variant: "secondary" as const,
  // },
  // {
  //   title: "Upload Media",
  //   description: "Add images and files",
  //   icon: Upload,
  //   href: "/media",
  //   variant: "outline" as const,
  // },
  // {
  //   title: "View Analytics",
  //   description: "Check performance metrics",
  //   icon: BarChart3,
  //   href: "/analytics",
  //   variant: "outline" as const,
  // },
  // {
  //   title: "Settings",
  //   description: "Configure system settings",
  //   icon: Settings,
  //   href: "/settings",
  //   variant: "ghost" as const,
  // },
];

export function QuickActions() {
  return (
    <Card className="shadow-healthcare-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Frequently used tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs opacity-80">{action.description}</span>
              </a>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
