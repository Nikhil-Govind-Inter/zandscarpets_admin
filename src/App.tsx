import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Core pages that exist
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Common pages that exist
import SiteSettingsForm from "./pages/common/SiteSettingsForm";
import SocialMediaList from "./pages/common/SocialMediaList";
import SocialMediaForm from "./pages/common/SocialMediaForm";
import CommonFaqList from "./pages/common/CommonFaqList";
import CommonFaqForm from "./pages/common/CommonFaqForm";
import { MetaTagsList } from "./pages/common/MetaTagsList";

// Home pages that exist
import HomeCmsForm from "./pages/home/HomeCmsForm";
import HomeBannerSliderList from "./pages/home/HomeBannerSliderList";
import HomeBannerSliderForm from "./pages/home/HomeBannerSliderForm";
import HomeMilestoneList from "./pages/home/HomeMilestoneList";
import HomeMilestoneForm from "./pages/home/HomeMilestoneForm";
import HomeMapList from "./pages/home/HomeMapList";
import HomeMapForm from "./pages/home/HomeMapForm";
import HomeExploreList from "./pages/home/HomeExploreList";
import HomeExploreForm from "./pages/home/HomeExploreForm";
import HomeAppFeatures from "./pages/home/HomeAppFeatures";
import HomeAppFeaturesForm from "./pages/home/HomeAppFeaturesForm";
import HomeInvestment from "./pages/home/HomeInvestment";
import HomeInvestmentForm from "./pages/home/HomeInvestmentForm";
import AboutCmsForm from "./pages/about/AboutCmsForm";
import AboutOurValues from "./pages/about/AboutOurValues";
import AboutOurValuesForm from "./pages/about/AboutOurValuesForm";
import AboutOurJourneyList from "./pages/about/AboutOurJourneyList";
import AboutOurJourneyForm from "./pages/about/AboutOurJourneyForm";
import AboutMediaList from "./pages/about/AboutMediaList";
import AboutMediaForm from "./pages/about/AboutMediaForm";
import InvestInGoecCmsForm from "./pages/investingoec/InvestInGoecCmsForm";
import InvestInGoecExploreList from "./pages/investingoec/InvestInGoecExploreList";
import InvestInGoecExploreForm from "./pages/investingoec/InvestInGoecExploreForm";
import InvestInGoecMilestoneList from "./pages/investingoec/InvestInGoecMilestoneList";
import InvestInGoecMilestoneForm from "./pages/investingoec/InvestInGoecMilestoneForm";
import InvestInGoecFeaturesList from "./pages/investingoec/InvestInGoecFeaturesList";
import InvestInGoecFeaturesForm from "./pages/investingoec/InvestInGoecFeaturesForm";

const queryClient = new QueryClient();
// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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

          {/* Common FAQ Management Routes */}
          <Route
            path="/common-faq"
            element={
              <ProtectedRoute>
                <CommonFaqList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/common-faq/new"
            element={
              <ProtectedRoute>
                <CommonFaqForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/common-faq/:id/edit"
            element={
              <ProtectedRoute>
                <CommonFaqForm />
              </ProtectedRoute>
            }
          />

          {/* Home CMS Route */}
          <Route
            path="/home-cms"
            element={
              <ProtectedRoute>
                <HomeCmsForm />
              </ProtectedRoute>
            }
          />

          {/* Home Banner Slider Routes */}
          <Route
            path="/home-banner-slider"
            element={
              <ProtectedRoute>
                <HomeBannerSliderList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-banner-slider/create"
            element={
              <ProtectedRoute>
                <HomeBannerSliderForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-banner-slider/edit/:id"
            element={
              <ProtectedRoute>
                <HomeBannerSliderForm />
              </ProtectedRoute>
            }
          />

          {/* Home Milestone Routes */}
          <Route
            path="/home-milestone"
            element={
              <ProtectedRoute>
                <HomeMilestoneList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-milestone/create"
            element={
              <ProtectedRoute>
                <HomeMilestoneForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-milestone/edit/:id"
            element={
              <ProtectedRoute>
                <HomeMilestoneForm />
              </ProtectedRoute>
            }
          />

          {/* Home Map Routes */}
          <Route
            path="/home-map"
            element={
              <ProtectedRoute>
                <HomeMapList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-map/create"
            element={
              <ProtectedRoute>
                <HomeMapForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-map/edit/:id"
            element={
              <ProtectedRoute>
                <HomeMapForm />
              </ProtectedRoute>
            }
          />

          {/* Home Explore Routes */}
          <Route
            path="/home-explore"
            element={
              <ProtectedRoute>
                <HomeExploreList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-explore/create"
            element={
              <ProtectedRoute>
                <HomeExploreForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-explore/edit/:id"
            element={
              <ProtectedRoute>
                <HomeExploreForm />
              </ProtectedRoute>
            }
          />

          {/* Home App Features Routes */}
          <Route
            path="/home-app-features"
            element={
              <ProtectedRoute>
                <HomeAppFeatures />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-app-features/create"
            element={
              <ProtectedRoute>
                <HomeAppFeaturesForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-app-features/edit/:id"
            element={
              <ProtectedRoute>
                <HomeAppFeaturesForm />
              </ProtectedRoute>
            }
          />

          {/* Home Investment Routes */}
          <Route
            path="/home-investment"
            element={
              <ProtectedRoute>
                <HomeInvestment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-investment/create"
            element={
              <ProtectedRoute>
                <HomeInvestmentForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home-investment/edit/:id"
            element={
              <ProtectedRoute>
                <HomeInvestmentForm />
              </ProtectedRoute>
            }
          />

          {/* About CMS Route */}
          <Route
            path="/about-cms"
            element={
              <ProtectedRoute>
                <AboutCmsForm />
              </ProtectedRoute>
            }
          />

          {/* About Our Values Routes */}
          <Route
            path="/about-our-values"
            element={
              <ProtectedRoute>
                <AboutOurValues />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-our-values/create"
            element={
              <ProtectedRoute>
                <AboutOurValuesForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-our-values/edit/:id"
            element={
              <ProtectedRoute>
                <AboutOurValuesForm />
              </ProtectedRoute>
            }
          />

          {/* About Our Journey Routes */}
          <Route
            path="/about-our-journey"
            element={
              <ProtectedRoute>
                <AboutOurJourneyList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-our-journey/create"
            element={
              <ProtectedRoute>
                <AboutOurJourneyForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-our-journey/edit/:id"
            element={
              <ProtectedRoute>
                <AboutOurJourneyForm />
              </ProtectedRoute>
            }
          />

          {/* About Media Routes */}
          <Route
            path="/about-media"
            element={
              <ProtectedRoute>
                <AboutMediaList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-media/create"
            element={
              <ProtectedRoute>
                <AboutMediaForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/about-media/edit/:id"
            element={
              <ProtectedRoute>
                <AboutMediaForm />
              </ProtectedRoute>
            }
          />

          {/* Invest in GO EC Routes */}
          <Route
            path="/invest-in-zandcarpets-cms"
            element={
              <ProtectedRoute>
                <InvestInGoecCmsForm />
              </ProtectedRoute>
            }
          />

          {/* Invest in GO EC Explore Routes */}
          <Route
            path="/invest-in-zandcarpets-explore"
            element={
              <ProtectedRoute>
                <InvestInGoecExploreList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-explore/create"
            element={
              <ProtectedRoute>
                <InvestInGoecExploreForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-explore/edit/:id"
            element={
              <ProtectedRoute>
                <InvestInGoecExploreForm />
              </ProtectedRoute>
            }
          />

          {/* Invest in GO EC Milestone Routes */}
          <Route
            path="/invest-in-zandcarpets-milestone"
            element={
              <ProtectedRoute>
                <InvestInGoecMilestoneList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-milestone/create"
            element={
              <ProtectedRoute>
                <InvestInGoecMilestoneForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-milestone/edit/:id"
            element={
              <ProtectedRoute>
                <InvestInGoecMilestoneForm />
              </ProtectedRoute>
            }
          />

          {/* Invest in GO EC Features Routes */}
          <Route
            path="/invest-in-zandcarpets-features"
            element={
              <ProtectedRoute>
                <InvestInGoecFeaturesList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-features/create"
            element={
              <ProtectedRoute>
                <InvestInGoecFeaturesForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invest-in-zandcarpets-features/edit/:id"
            element={
              <ProtectedRoute>
                <InvestInGoecFeaturesForm />
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

          {/* Catch all route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
