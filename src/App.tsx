import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Core pages that exist
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// lazy

// Common pages that exist
const SiteSettingsForm = React.lazy(
  () => import("./pages/common/SiteSettingsForm"),
);
const SocialMediaList = React.lazy(
  () => import("./pages/common/SocialMediaList"),
);
const SocialMediaForm = React.lazy(
  () => import("./pages/common/SocialMediaForm"),
);

const UsersList = React.lazy(() => import("./pages/users/UsersList"));
const UsersForm = React.lazy(() => import("./pages/users/UsersForm"));
import { MetaTagsList } from "./pages/common/MetaTagsList";

// Masters — Pages
const PagesList = React.lazy(() => import("./pages/masters/PagesList"));
const PagesForm = React.lazy(() => import("./pages/masters/PagesForm"));

// Masters — Faqs
const FaqsList = React.lazy(() => import("./pages/masters/FaqsList"));
const FaqsForm = React.lazy(() => import("./pages/masters/FaqsForm"));

// Masters — Industry
const IndustryList = React.lazy(() => import("./pages/masters/IndustryList"));
const IndustryForm = React.lazy(() => import("./pages/masters/IndustryForm"));

// Masters — Our Features
const OurFeaturesList = React.lazy(
  () => import("./pages/masters/OurFeaturesList"),
);
const OurFeaturesForm = React.lazy(
  () => import("./pages/masters/OurFeaturesForm"),
);

// Masters — Ads Banner
const AdsBannerList = React.lazy(() => import("./pages/masters/AdsBannerList"));
const AdsBannerForm = React.lazy(() => import("./pages/masters/AdsBannerForm"));

// Site Settings — Banners
const BannersList = React.lazy(
  () => import("./pages/siteSettings/BannersList"),
);
const BannersForm = React.lazy(
  () => import("./pages/siteSettings/BannersForm"),
);

// Site Settings — Footer Media
const FooterMediaList = React.lazy(
  () => import("./pages/siteSettings/FooterMediaList"),
);
const FooterMediaForm = React.lazy(
  () => import("./pages/siteSettings/FooterMediaForm"),
);

// Home pages that exist
// convert all imports to lazy loading using React.lazy and Suspense

const HomeCmsForm = React.lazy(() => import("./pages/home/HomeCmsForm"));

// Home — Banner
const HomeBannerList = React.lazy(() => import("./pages/home/HomeBannerList"));
const HomeBannerForm = React.lazy(() => import("./pages/home/HomeBannerForm"));

// Home - Milestones
const HomeMilestonesList = React.lazy(
  () => import("./pages/home/HomeMilestonesList"),
);
const HomeMilestonesForm = React.lazy(
  () => import("./pages/home/HomeMilestonesForm"),
);

const queryClient = new QueryClient();
// Protected Route Component

const adminOnlyAccessRoutes = ["/users", "/users/create", "/users/edit/:id"];

// Layout route: renders once and stays mounted while only the matched child
// route's element swaps inside DashboardLayout's <Outlet /> — this is what
// keeps the sidebar/header from remounting on every navigation.
function ProtectedRoute() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  const isAdminRoute = adminOnlyAccessRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`),
  );
  // only admin can access the route
  if (isAdminRoute && role !== "admin") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <DashboardLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />

              {/* HOME */}
              <Route path="/home-cms" element={<HomeCmsForm />} />

              {/* Home Banner Routes */}
              <Route path="/home-banner" element={<HomeBannerList />} />
              <Route path="/home-banner/new" element={<HomeBannerForm />} />
              <Route
                path="/home-banner/:id/edit"
                element={<HomeBannerForm />}
              />

              {/* HOme milestones */}
              <Route
                path="/home-milestones"
                element={<HomeMilestonesList />}
              />
              <Route
                path="/home-milestones/new"
                element={<HomeMilestonesForm />}
              />
              <Route
                path="/home-milestones/:id/edit"
                element={<HomeMilestonesForm />}
              />

              {/* Faqs Routes */}
              <Route path="/faqs" element={<FaqsList />} />
              <Route path="/faqs/new" element={<FaqsForm />} />
              <Route path="/faqs/:id/edit" element={<FaqsForm />} />

              {/* Industry Routes */}
              <Route path="/industry" element={<IndustryList />} />
              <Route path="/industry/new" element={<IndustryForm />} />
              <Route path="/industry/:id/edit" element={<IndustryForm />} />

              {/* Our Features Routes */}
              <Route path="/our-features" element={<OurFeaturesList />} />
              <Route path="/our-features/new" element={<OurFeaturesForm />} />
              <Route
                path="/our-features/:id/edit"
                element={<OurFeaturesForm />}
              />

              {/* Ads Banner Routes */}
              <Route path="/ads-banner" element={<AdsBannerList />} />
              <Route path="/ads-banner/new" element={<AdsBannerForm />} />
              <Route
                path="/ads-banner/:id/edit"
                element={<AdsBannerForm />}
              />

              {/* Site Settings Route */}
              <Route path="/site-settings" element={<SiteSettingsForm />} />

              {/* Social Media Routes */}
              <Route path="/social-media" element={<SocialMediaList />} />
              <Route path="/social-media/new" element={<SocialMediaForm />} />
              <Route
                path="/social-media/:id/edit"
                element={<SocialMediaForm />}
              />

              {/* Pages Routes */}
              <Route path="/pages" element={<PagesList />} />
              <Route path="/pages/new" element={<PagesForm />} />
              <Route path="/pages/:id/edit" element={<PagesForm />} />

              {/* Banners Routes */}
              <Route path="/banners" element={<BannersList />} />
              <Route path="/banners/new" element={<BannersForm />} />
              <Route path="/banners/:id/edit" element={<BannersForm />} />

              {/* Footer Media Routes */}
              <Route path="/footer-media" element={<FooterMediaList />} />
              <Route
                path="/footer-media/new"
                element={<FooterMediaForm />}
              />
              <Route
                path="/footer-media/:id/edit"
                element={<FooterMediaForm />}
              />

              {/* Meta Tags Routes */}
              <Route path="/meta-tags" element={<MetaTagsList />} />

              {/* Users */}
              <Route path="/users" element={<UsersList />} />
              {/* create user */}
              <Route path="/users/create" element={<UsersForm />} />
              {/* edit user */}
              <Route path="/users/edit/:id" element={<UsersForm />} />
            </Route>

            {/* Catch all route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
