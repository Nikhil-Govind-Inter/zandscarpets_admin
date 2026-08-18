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

import { Suspense } from "react";

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

// Site Settings — Banners
const BannersList = React.lazy(() => import("./pages/siteSettings/BannersList"));
const BannersForm = React.lazy(() => import("./pages/siteSettings/BannersForm"));

// Site Settings — Footer Media
const FooterMediaList = React.lazy(() => import("./pages/siteSettings/FooterMediaList"));
const FooterMediaForm = React.lazy(() => import("./pages/siteSettings/FooterMediaForm"));

// Home pages that exist
// convert all imports to lazy loading using React.lazy and Suspense

const HomeCmsForm = React.lazy(() => import("./pages/home/HomeCmsForm"));
import PageLoader from "./components/layout/PageLoader";

const queryClient = new QueryClient();
// Protected Route Component

const adminOnlyAccessRoutes = ["/users", "/users/create", "/users/edit/:id"];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
  return <DashboardLayout>{children}</DashboardLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* HOME */}
              <Route
                path="/home-cms"
                element={
                  <ProtectedRoute>
                    <HomeCmsForm />
                  </ProtectedRoute>
                }
              />

              {/* Site Settings Route */}
              <Route
                path="/site-settings"
                element={
                  <ProtectedRoute>
                    <SiteSettingsForm />
                  </ProtectedRoute>
                }
              />

              {/* Social Media Routes */}
              <Route
                path="/social-media"
                element={
                  <ProtectedRoute>
                    <SocialMediaList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/social-media/new"
                element={
                  <ProtectedRoute>
                    <SocialMediaForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/social-media/:id/edit"
                element={
                  <ProtectedRoute>
                    <SocialMediaForm />
                  </ProtectedRoute>
                }
              />

              {/* Pages Routes */}
              <Route
                path="/pages"
                element={
                  <ProtectedRoute>
                    <PagesList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pages/new"
                element={
                  <ProtectedRoute>
                    <PagesForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pages/:id/edit"
                element={
                  <ProtectedRoute>
                    <PagesForm />
                  </ProtectedRoute>
                }
              />

              {/* Banners Routes */}
              <Route
                path="/banners"
                element={
                  <ProtectedRoute>
                    <BannersList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/banners/new"
                element={
                  <ProtectedRoute>
                    <BannersForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/banners/:id/edit"
                element={
                  <ProtectedRoute>
                    <BannersForm />
                  </ProtectedRoute>
                }
              />

              {/* Footer Media Routes */}
              <Route
                path="/footer-media"
                element={
                  <ProtectedRoute>
                    <FooterMediaList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/footer-media/new"
                element={
                  <ProtectedRoute>
                    <FooterMediaForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/footer-media/:id/edit"
                element={
                  <ProtectedRoute>
                    <FooterMediaForm />
                  </ProtectedRoute>
                }
              />

              {/* Meta Tags Routes */}
              <Route
                path="/meta-tags"
                element={
                  <ProtectedRoute>
                    <MetaTagsList />
                  </ProtectedRoute>
                }
              />

              {/* Users */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersList />
                  </ProtectedRoute>
                }
              />

              {/* create user */}
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute>
                    <UsersForm />
                  </ProtectedRoute>
                }
              />

              {/* edit user */}
              <Route
                path="/users/edit/:id"
                element={
                  <ProtectedRoute>
                    <UsersForm />
                  </ProtectedRoute>
                }
              />
              {/* Catch all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
