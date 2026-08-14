import { useState, useEffect, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ChevronRight,
  HelpCircle,
  Share2,
  Home,
  Tags,
  Monitor,
  Target,
  MapPin,
  Compass,
  Smartphone,
  TrendingUp,
  Info,
  FileText,
  Heart,
  Clock,
  Image,
  DollarSign,
  Star,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/utils";

const Logo =
  "https://cdn-lanhl.nitrocdn.com/BEDNLEoRmIKjWuHGWySaweMWUMbmbmac/assets/images/source/rev-b24f0bb/www.zandscarpets.com/assets/images/logo.svg";
const mainNavItems = [{ title: "Dashboard", url: "/", icon: LayoutDashboard }];

const homeSection = [
  { title: "CMS", url: "/home-cms", icon: Home },
  { title: "Banner Slider", url: "/home-banner-slider", icon: Monitor },
  { title: "Milestone", url: "/home-milestone", icon: Target },
  { title: "Map", url: "/home-map", icon: MapPin },
  { title: "Explore", url: "/home-explore", icon: Compass },
  { title: "App Features", url: "/home-app-features", icon: Smartphone },
  { title: "Investment", url: "/home-investment", icon: TrendingUp },
];

const aboutSection = [
  { title: "About CMS", url: "/about-cms", icon: Info },
  { title: "Our Values", url: "/about-our-values", icon: Heart },
  { title: "Our Journey", url: "/about-our-journey", icon: Clock },
  { title: "Media", url: "/about-media", icon: Image },
];

const commonSection = [
  { title: "Site Settings", url: "/site-settings", icon: Settings },
  { title: "Social Media", url: "/social-media", icon: Share2 },
  { title: "Meta Tags", url: "/meta-tags", icon: Tags },
  { title: "Common FAQ", url: "/common-faq", icon: HelpCircle },
];
const adminSection = [{ title: "Users", url: "/users", icon: Users }];

export function AppSidebar() {
  const location = useLocation();
  const { role } = useAuth();
  const [homeOpen, setHomeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [commonOpen, setCommonOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Auto-open sections based on current path
  useEffect(() => {
    const path = location.pathname;

    // Home section
    if (path.includes("/home-")) {
      setHomeOpen(true);
    }

    // About section
    if (path.includes("/about-")) {
      setAboutOpen(true);
    }

    // Invest section
    if (path.includes("/invest-")) {
      setInvestOpen(true);
    }

    // Common sections
    if (
      ["/site-settings", "/social-media", "/meta-tags", "/common-faq"].some(
        (route) => path.includes(route),
      )
    ) {
      setCommonOpen(true);
    }

    if (["/users"].some((route) => path.includes(route))) {
      setAdminOpen(true);
    }
  }, [location.pathname]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full text-left ${
      isActive
        ? "bg-sidebar-accent text-sidebar-primary font-medium"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo Section */}
        <div
          className={`border-b border-sidebar-border ${isCollapsed ? "p-2" : "p-4"}`}
        >
          {!isCollapsed ? (
            <div className="flex items-center justify-center">
              <img
                src={Logo}
                alt="Z&S"
                className="h-8 w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">
                Z&S
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} end className={getNavCls}>
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Home Management */}
        <GetLayout
          Icon={Home}
          title="Home"
          isCollapsed={isCollapsed}
          open={homeOpen}
          setOpen={setHomeOpen}
          getNavCls={getNavCls}
          Section={homeSection}
        />

        {/* About Page */}
        <GetLayout
          Icon={Info}
          title="About"
          isCollapsed={isCollapsed}
          open={aboutOpen}
          setOpen={setAboutOpen}
          getNavCls={getNavCls}
          Section={aboutSection}
        />
        {/* Common Sections */}
        <GetLayout
          Icon={Settings}
          title="Settings & Common"
          isCollapsed={isCollapsed}
          open={commonOpen}
          setOpen={setCommonOpen}
          getNavCls={getNavCls}
          Section={commonSection}
        />

        {role === ROLES.ADMIN && (
          <GetLayout
            Icon={Users}
            title="Admin"
            isCollapsed={isCollapsed}
            open={adminOpen}
            setOpen={setAdminOpen}
            getNavCls={getNavCls}
            Section={adminSection}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function GetLayout({ open, setOpen, getNavCls, Section, isCollapsed, title, Icon }) {
  return (
    <SidebarGroup>
      <Collapsible open={!isCollapsed && open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
          <Icon className="h-4 w-4" />
          {!isCollapsed && (
            <>
              <span className="ml-2">{title}</span>
              <ChevronRight
                className={`h-4 w-4 ml-auto transition-transform ${
                  open ? "rotate-90" : ""
                }`}
              />
            </>
          )}
        </CollapsibleTrigger>
        {!isCollapsed && (
          <CollapsibleContent className="ml-6 mt-1 space-y-1">
            <SidebarMenu>
              {Section.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="sm">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span className="ml-2">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarGroup>
  );
}
