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
  Heart,
  Clock,
  Image,
  Users,
  RadioTower,
  MessageSquare,
  Phone,
  Link2,
  Briefcase,
  Wrench,
  ListChecks,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
  { title: "Banner", url: "/home-banner", icon: Image },
  { title: "Milestone", url: "/home-milestones", icon: Monitor },
  { title: "Brands", url: "/home-brands", icon: RadioTower },
  { title: "Testimonials", url: "/home-testimonials", icon: Monitor },
];

const aboutSection = [
  { title: "CMS", url: "/about-cms", icon: Info },
  { title: "Core Values", url: "/about-core-values", icon: Heart },
  { title: "History", url: "/about-history", icon: Clock },
  { title: "Messages", url: "/about-messages", icon: MessageSquare },
];

const contactSection = [
  { title: "CMS", url: "/contact-cms", icon: Phone },
  { title: "Connections", url: "/contact-connections", icon: Link2 },
];

const projectsSection = [
  {
    title: "Projects",
    url: "/projects",
    icon: Briefcase,
  },
];

const commonSection = [
  { title: "Site Settings", url: "/site-settings", icon: Settings },
  { title: "Social Media", url: "/social-media", icon: Share2 },
  { title: "Meta Tags", url: "/meta-tags", icon: Tags },
  { title: "Banners", url: "/banners", icon: Image },
  { title: "Footer Media", url: "/footer-media", icon: Image },
];
const mastersSection = [
  { title: "Pages", url: "/pages", icon: Compass },
  { title: "Faqs", url: "/faqs", icon: HelpCircle },
  { title: "Industry", url: "/industry", icon: MapPin },
  { title: "Our Features", url: "/our-features", icon: TrendingUp },
  { title: "Ads Banner", url: "/ads-banner", icon: Image },
  { title: "Projects", url: "/projects", icon: Briefcase },
];
const servicesSection = [
  { title: "Services", url: "/services", icon: Wrench },
  { title: "CMS", url: "/service-cms", icon: Info },
  { title: "Process Steps", url: "/process-steps", icon: ListChecks },
];
const adminSection = [{ title: "Users", url: "/users", icon: Users }];

const isNavActive = (pathname: string, url: string, end = false) =>
  end ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

const navItemCls =
  "flex items-center w-full text-left text-sidebar-foreground hover:bg-sidebar-accent/50";

export function AppSidebar() {
  const location = useLocation();
  const { role } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Auto-open sections based on current path
  useEffect(() => {
    const path = location.pathname;

    // Home section
    if (path.includes("/home-")) {
      setOpenSection("home");
    }
    // About section
    else if (path.includes("/about-")) {
      setOpenSection("about");
    }
    // Contact section
    else if (path.includes("/contact-")) {
      setOpenSection("contact");
    }
    // Common sections
    else if (
      [
        "/site-settings",
        "/social-media",
        "/meta-tags",
        "/common-faq",
        "/banners",
        "/footer-media",
      ].some((route) => path.includes(route))
    ) {
      setOpenSection("common");
    } else if (["/projects"].some((route) => path.includes(route))) {
      setOpenSection("projects");
    }
    // Masters section
    else if (
      [
        "/pages",
        "/faqs",
        "/industry",
        "/our-features",
        "/ads-banner",
        "/projects",
      ].some((route) => path.includes(route))
    ) {
      setOpenSection("masters");
    }
    // Services section
    else if (
      ["/services", "/service-cms", "/process-steps"].some((route) =>
        path.includes(route),
      )
    ) {
      setOpenSection("services");
    }
    // Admin section
    else if (["/users"].some((route) => path.includes(route))) {
      setOpenSection("admin");
    }
    // Dashboard (or any other unmatched route) — collapse everything
    else {
      setOpenSection(null);
    }
  }, [location.pathname]);

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border gap-0">
        {/* Logo Section */}
        <div
          className={`border-b border-sidebar-border ${isCollapsed ? "py-4 px-2k" : "p-4"}`}
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
                <SidebarMenuButton
                  asChild
                  isActive={isNavActive(location.pathname, item.url, true)}
                >
                  <NavLink to={item.url} end className={navItemCls}>
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
          open={openSection === "home"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "home" : null)}
          pathname={location.pathname}
          Section={homeSection}
        />

        {/* About Management */}
        <GetLayout
          Icon={Info}
          title="About"
          isCollapsed={isCollapsed}
          open={openSection === "about"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "about" : null)}
          pathname={location.pathname}
          Section={aboutSection}
        />

        {/* Contact Management */}
        <GetLayout
          Icon={Phone}
          title="Contact"
          isCollapsed={isCollapsed}
          open={openSection === "contact"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "contact" : null)}
          pathname={location.pathname}
          Section={contactSection}
        />

        <GetLayout
          Icon={Compass}
          title="Projects"
          isCollapsed={isCollapsed}
          open={openSection === "projects"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "projects" : null)}
          pathname={location.pathname}
          Section={projectsSection}
        />

        {/* Common Sections */}
        <GetLayout
          Icon={Settings}
          title="Settings & Common"
          isCollapsed={isCollapsed}
          open={openSection === "common"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "common" : null)}
          pathname={location.pathname}
          Section={commonSection}
        />

        {/* Masters */}
        <GetLayout
          Icon={Compass}
          title="Masters"
          isCollapsed={isCollapsed}
          open={openSection === "masters"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "masters" : null)}
          pathname={location.pathname}
          Section={mastersSection}
        />

        {/* Services */}
        <GetLayout
          Icon={Wrench}
          title="Services"
          isCollapsed={isCollapsed}
          open={openSection === "services"}
          onOpenChange={(isOpen) => setOpenSection(isOpen ? "services" : null)}
          pathname={location.pathname}
          Section={servicesSection}
        />

        {role === ROLES.ADMIN && (
          <GetLayout
            Icon={Users}
            title="Admin"
            isCollapsed={isCollapsed}
            open={openSection === "admin"}
            onOpenChange={(isOpen) => setOpenSection(isOpen ? "admin" : null)}
            pathname={location.pathname}
            Section={adminSection}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function GetLayout({
  open,
  onOpenChange,
  pathname,
  Section,
  isCollapsed,
  title,
  Icon,
}) {
  return (
    <SidebarGroup>
      <Collapsible open={!isCollapsed && open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger
          className={`flex items-center w-full p-2 text-sm font-medium rounded-md transition-colors ${
            open
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
        >
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
          <CollapsibleContent
            className={`ml-6 mt-1 space-y-1 border-l pl-2 transition-colors ${
              open ? "border-sidebar-primary/40" : "border-sidebar-border"
            }`}
          >
            <SidebarMenu>
              {Section.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    isActive={isNavActive(pathname, item.url)}
                  >
                    <NavLink to={item.url} className={navItemCls}>
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
