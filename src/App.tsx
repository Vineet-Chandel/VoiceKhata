import React, { Suspense, lazy } from "react";
import ShopkeeperLanding from "./components/Pages/ShopkeeperLanding";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { FinancialProvider } from "@/context/FinancialContext";
import { ChatStoreProvider } from "@/components/hooks/use-chat-store";

// Lazy-load other pages so their heavy dependencies don't block the root landing page
const Landing = lazy(() => import("./components/Pages/Landing"));
const SkeletonLanding = lazy(() => import("./components/Pages/SkeletonLanding"));
const AuthPage = lazy(() => import("@/components/ui/SignUp/auth-page").then(m => ({ default: m.AuthPage })));
const LoginPage = lazy(() => import("@/components/ui/SignUp/Login-page").then(m => ({ default: m.LoginPage })));
const VerifyEmail = lazy(() => import("@/components/ui/SignUp/verifyEmail"));
const NotFound = lazy(() => import("@/components/ui/Page_Not_Found/not-found-2").then(m => ({ default: m.NotFound })));
const DashboardPage = lazy(() => import("@/components/Pages/DashboardPage"));
const DashboardHome = lazy(() => import("@/components/Pages/DashboardHome"));
const KhataPage = lazy(() => import("@/components/Pages/KhataPage"));
const BusinessGrowthHubPage = lazy(() => import("@/components/Pages/BusinessGrowthHubPage"));
const TransactionsPage = lazy(() => import("@/components/Pages/TransactionsPage"));
const BudgetPage = lazy(() => import("@/components/Pages/BudgetPage"));
const ReportsPage = lazy(() => import("@/components/Pages/ReportsPage"));
const AIAssistantPage = lazy(() => import("@/components/Pages/AIAssistantPage"));
const SettingsPage = lazy(() => import("@/components/Pages/Settings"));
const NotificationsPage = lazy(() => import("@/components/Pages/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const ComingSoon = lazy(() => import("@/components/ui/Page_Not_Found/coming_soon").then(m => ({ default: m.ComingSoon })));
const Features = lazy(() => import("@/components/ui/Footer_pages/features"));
const FAQsPage = lazy(() => import("@/components/ui/Footer_pages/faqs"));
const Pricing = lazy(() => import("@/components/ui/Footer_pages/pricing"));
const Testimonials = lazy(() => import("@/components/ui/Footer_pages/Testimonials"));
const Integration = lazy(() => import("@/components/ui/Footer_pages/Integration"));
const AboutUs = lazy(() => import("@/components/ui/Footer_pages/about"));
const PrivacyPolicy = lazy(() => import("@/components/ui/Footer_pages/Privacy").then(m => ({ default: m.PrivacyPolicy })));
const TermsAndServices = lazy(() => import("@/components/ui/Footer_pages/Terms"));
const Blog = lazy(() => import("@/components/ui/Footer_pages/Blog"));
const Changelog = lazy(() => import("@/components/ui/Footer_pages/changelog"));
const Brand = lazy(() => import("@/components/ui/Footer_pages/brand"));
const Help = lazy(() => import("@/components/ui/Footer_pages/help"));

export default function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen w-full bg-background text-foreground font-sans">
        <Suspense fallback={<div className="min-h-screen w-full bg-background" />}>
          <Routes>
            <Route path="/" element={<ShopkeeperLanding />} />
            <Route path="/classic" element={<Landing />} />
            <Route path="/shopkeeper" element={<ShopkeeperLanding />} />
            <Route path="/vyapar" element={<ShopkeeperLanding />} />
            <Route path="/skeleton" element={<SkeletonLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/verify" element={<VerifyEmail />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <FinancialProvider>
                    <ChatStoreProvider>
                      <DashboardPage />
                    </ChatStoreProvider>
                  </FinancialProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="khata" element={<KhataPage />} />
              <Route path="growth" element={<BusinessGrowthHubPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
            <Route path="/soon" element={<ComingSoon />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/integration" element={<Integration />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndServices />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/brand" element={<Brand />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}
