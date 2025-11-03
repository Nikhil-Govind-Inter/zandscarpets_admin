import { useState, useEffect } from "react";
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

const goecLogo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxMCIgY3k9IjE2IiByPSIxMCIgZmlsbD0iIzEwYjk4MSIvPgo8Y2lyY2xlIGN4PSIyNiIgY3k9IjE2IiByPSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHRleHQgeD0iNDQiIHk9IjIyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMWYyOTM3Ij5HT0VDPC90ZXh0Pgo8L3N2Zz4K";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard }
];

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

const investSection = [
  { title: "CMS", url: "/invest-in-goec-cms", icon: DollarSign },
  { title: "Explore", url: "/invest-in-goec-explore", icon: Compass },
  { title: "Milestones", url: "/invest-in-goec-milestone", icon: Target },
  { title: "Features", url: "/invest-in-goec-features", icon: Star },
];

const commonSection = [
  { title: "Site Settings", url: "/site-settings", icon: Settings },
  { title: "Social Media", url: "/social-media", icon: Share2 },
  { title: "Meta Tags", url: "/meta-tags", icon: Tags },
  { title: "Common FAQ", url: "/common-faq", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  
  const [homeOpen, setHomeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [commonOpen, setCommonOpen] = useState(false);

  const isCollapsed = state === "collapsed";

  // Auto-open sections based on current path
  useEffect(() => {
    const path = location.pathname;

    // Home section
    if (path.includes('/home-')) {
      setHomeOpen(true);
    }

    // About section
    if (path.includes('/about-')) {
      setAboutOpen(true);
    }

    // Invest section
    if (path.includes('/invest-')) {
      setInvestOpen(true);
    }

    // Common sections
    if (['/site-settings', '/social-media', '/meta-tags', '/common-faq'].some(route => path.includes(route))) {
      setCommonOpen(true);
    }
  }, [location.pathname]);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full text-left ${isActive
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Logo Section */}
        <div className="p-4 border-b border-sidebar-border">
          {!isCollapsed ? (
            <div className="flex items-center justify-center">
              <img
                src={goecLogo}
                alt="GOEC"
                className="h-8 w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">
                G
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
        <SidebarGroup>
          <Collapsible
            open={!isCollapsed && homeOpen}
            onOpenChange={setHomeOpen}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
              <Home className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-2">Home</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-auto transition-transform ${homeOpen ? "rotate-90" : ""
                      }`}
                  />
                </>
              )}
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                <SidebarMenu>
                  {homeSection.map((item) => (
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

        {/* About Page */}
        <SidebarGroup>
          <Collapsible
            open={!isCollapsed && aboutOpen}
            onOpenChange={setAboutOpen}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
              <FileText className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-2">About Page</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-auto transition-transform ${aboutOpen ? "rotate-90" : ""
                      }`}
                  />
                </>
              )}
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                <SidebarMenu>
                  {aboutSection.map((item) => (
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

        {/* Invest in GO EC */}
        <SidebarGroup>
          <Collapsible
            open={!isCollapsed && investOpen}
            onOpenChange={setInvestOpen}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
              <TrendingUp className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-2">Invest in GO EC</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-auto transition-transform ${investOpen ? "rotate-90" : ""
                      }`}
                  />
                </>
              )}
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                <SidebarMenu>
                  {investSection.map((item) => (
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

        {/* Common Sections */}
        <SidebarGroup>
          <Collapsible
            open={!isCollapsed && commonOpen}
            onOpenChange={setCommonOpen}
          >
            <CollapsibleTrigger className="flex items-center w-full p-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md">
              <Settings className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span className="ml-2">Settings & Content</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-auto transition-transform ${commonOpen ? "rotate-90" : ""
                      }`}
                  />
                </>
              )}
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="ml-6 mt-1 space-y-1">
                <SidebarMenu>
                  {commonSection.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}