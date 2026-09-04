import Landing from "./components/Pages/Landing";
import { AuthPage } from "@/components/ui/SignUp/auth-page";
import { Particles } from "@/components/ui/background-particles";
import { Routes, Route } from "react-router-dom";
import { NotFound } from "@/components/ui/Page_Not_Found/not-found-2";
import DashboardPage from "@/components/Pages/DashboardPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import VerifyEmail from "@/components/ui/SignUp/verifyEmail";
import { LoginPage } from "@/components/ui/SignUp/Login-page";
import SettingsPage from "@/components/Pages/Settings";
import DashboardHome from "@/components/Pages/DashboardHome";
import TransactionsPage from "@/components/Pages/TransactionsPage";
import BudgetPage from "@/components/Pages/BudgetPage";
import ReportsPage from "@/components/Pages/ReportsPage";
import AIAssistantPage from "@/components/Pages/AIAssistantPage";
import Features from "@/components/ui/Footer_pages/features";
import { ChatStoreProvider } from "@/components/hooks/use-chat-store"
import RecurringPage from "@/components/Pages/RecurringPage"
import SavingsPage from "@/components/Pages/SavingsPage";
import { NotificationsPage } from "@/components/Pages/NotificationsPage";
import { ComingSoon } from "@/components/ui/Page_Not_Found/coming_soon";
import FAQsPage from "@/components/ui/Footer_pages/faqs";
import Pricing from "@/components/ui/Footer_pages/pricing";
import Testimonials from "@/components/ui/Footer_pages/Testimonials";
import Integration from "@/components/ui/Footer_pages/Integration";
import AboutUs from "@/components/ui/Footer_pages/about";
import { PrivacyPolicy } from "@/components/ui/Footer_pages/Privacy";
import TermsAndServices from "@/components/ui/Footer_pages/Terms";
import Blog from "@/components/ui/Footer_pages/Blog";
import Changelog from "@/components/ui/Footer_pages/changelog";
import Brand from "@/components/ui/Footer_pages/brand";
import Help from "@/components/ui/Footer_pages/help";
import { AuthProvider } from "@/context/AuthContext";
import { FinancialProvider } from "@/context/FinancialContext";

export default function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen w-full bg-background text-foreground">

        {/* Background */}
        <div className="fixed inset-0 z-0">
          <Particles
            quantity={100}
            ease={80}
            staticity={60}
            size={0.5}
            color="#ffffff"
          />
        </div>

        <div>
          <Routes>

            <Route path="/" element={<Landing />} />
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
              <Route index               element={<DashboardHome />}     />
              <Route path="transactions" element={<TransactionsPage />}  />
              <Route path="budget"       element={<BudgetPage />}        />
              <Route path="reports"      element={<ReportsPage />}       />
              <Route path="ai-assistant" element={<AIAssistantPage />}   />
              <Route path="settings"     element={<SettingsPage />}      />
              <Route path="autopay"      element={<RecurringPage />}     />
              <Route path="finvault"     element={<SavingsPage />}       />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*"             element={<NotFound />} />
            <Route path="/soon"         element={<ComingSoon />} />
            <Route path="/features"     element={<Features />} />
            <Route path="/pricing"      element={<Pricing />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/integration"  element={<Integration />} />
            <Route path="/faqs"         element={<FAQsPage />} />
            <Route path="/about"        element={<AboutUs />} />
            <Route path="/privacy"      element={<PrivacyPolicy />} />
            <Route path="/terms"        element={<TermsAndServices />} />
            <Route path="/blog"         element={<Blog />} />
            <Route path="/changelog"    element={<Changelog />} />
            <Route path="/brand"        element={<Brand />} />
            <Route path="/help"         element={<Help />} />
          </Routes>
        </div>

      </div>
    </AuthProvider>
  );
}
