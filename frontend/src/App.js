// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { fetchPlatformBranding } from "./services/platformService";
import { setBranding } from "./components/utils/branding";

// Layout & Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import ScrollToTop from "./components/ScrollToTop";

// Admin Pages
import AdminMenuManager from "./pages/AdminMenuManager";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import CampaignManagement from "./pages/admin/CampaignManagement";
import BrandUsers from "./pages/admin/BrandUsers";
import InfluencerUsers from "./pages/admin/InfluencerUsers";
import Finder from "./pages/admin/Finder";
import PaymentManagement from "./pages/admin/PaymentManagement";
import PaymentInfluencer from "./pages/admin/PaymentInfluencer";
import AdminReports from "./pages/admin/AdminReports";
import Settings from "./pages/admin/Settings";


// Brand Pages
import BrandDashboard from "./pages/brand/BrandDashboard";
import BrandCampaigns from "./pages/brand/BrandCampaigns";
import BrandCreateCampaign from "./pages/brand/BrandCreateCampaign";
import BrandApplications from "./pages/brand/BrandApplications";
import BrandAutomation from "./pages/brand/BrandAutomation";
import Payments from "./pages/brand/Payments";
import Autopay from "./pages/brand/Autopay";
import StripePayment from "./pages/brand/StripePayment";
import PayPalPayment from "./pages/brand/PayPalPayment";
import BrandAccountDetails from "./pages/brand/BrandAccountDetails";
import BrandMessage from "./pages/brand/BrandMessage";
import BrandSettings from "./pages/brand/BrandSettings";
import BrandAnalytics from "./pages/brand/BrandAnalytics";
import Contact from "./pages/brand/Contact";
import Tools from "./pages/brand/Tools";
import FindInfluencer from "./pages/brand/FindInfluencer";
import BrandIntegration from "./pages/brand/BrandIntegration";
import BrandIntelligence from "./pages/brand/BrandIntelligence";
import BrandAI from "./pages/brand/BrandAI";

import AutomationMarketing from "./pages/brand/AutomationMarketing";
import BrandNotification from "./pages/brand/BrandNotification";

import SendSMS from "./components/SendSMS";


// Influencer Pages
import InfluencerDashboard from "./pages/influencer/InfluencerDashboard";
import InfluencerCampaigns from "./pages/influencer/InfluencerCampaigns";
import InfluencerApplications from "./pages/influencer/InfluencerApplications";
import InfluencerAnalytics from "./pages/influencer/InfluencerAnalytics";
import Earnings from "./pages/influencer/Earnings";
import AITools from "./pages/influencer/AITools";
import InfluencerMessage from "./pages/influencer/InfluencerMessage";
import InfluencerSettings from "./pages/influencer/InfluencerSettings";
import AIContentCreator from "./pages/influencer/AIContentCreator";
import FastPost from "./pages/influencer/FastPost";
import AIHashtag from "./pages/influencer/AIHashtag";
import AICalculator from "./pages/influencer/AICalculator";
import VoiceToTextAI from "./pages/influencer/VoiceToTextAI";

import InfluencerNotification from "./pages/influencer/InfluencerNotification";



// Auth Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MainNavbar from "./pages/MainNavbar";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Footer from "./pages/Footer";
import Integration from "./pages/brand/Integration";
import FutureAI from "./pages/brand/FutureAI";
import MainLayout from "./pages/MainLayout";


import TermsAndConditions from './pages/HomePage/TermsAndConditions';
import PrivacyPolicy from './pages/HomePage/PrivacyPolicy';
import PaymentPolicy from './pages/HomePage/PaymentPolicy';

import PlatformOverview from './pages/HomePage/PlatformOverview';


// Tools & Features Components

import MarketIdeaFinder from "./components/MarketIdeaFinder";
import AIInsights from "./components/AIInsights";
import TrendPredictor from "./components/TrendPredictor";
import BudgetPlanner from "./components/BudgetPlanner";
import EngagementCalculator from "./components/EngagementCalculator";
import PricingSection from "./components/PricingSection";
import FraudDetection from "./components/FraudDetection";
import PredictiveROI from "./components/PredictiveROI";
import ContentAnalyzer from "./components/ContentAnalyzer";
import ContentIntelligence from "./components/ContentIntelligence";
import PaymentAutomation from "./components/PaymentAutomation";
import Blog from "./components/Blog";
import HelpCenter from "./components/HelpCenter";
import CaseStudies from "./components/CaseStudies";
import Documentation from "./components/Documentation";
import Community from "./components/Community";
import Support from "./components/Support";
import SocialMediaEmbed from "./components/SocialMediaEmbed";
import FAQPage from "./components/FAQPage";
import DemoVideoPage from "./components/DemoVideoPage";


import BrandProfile from "./pages/brand/BrandProfile";
import InfluencerProfile from "./pages/influencer/InfluencerProfile";
import BrandRegister from "./pages/brand/BrandRegister";
import InfluencerRegister from "./pages/influencer/InfluencerRegister";
import PublicProfiles from "./pages/brand/PublicProfiles";
import ViewProfile from "./pages/brand/ViewProfile";
import ConnectionsList from "./pages/brand/ConnectionsList";
// import AggreementForm from "./pages/AgreementForm";
import BrandAgreements from "./pages/brand/BrandAgreements";
import BrandWorkflow from "./pages/brand/BrandWorkflow";
import InfluencerWorkflow from "./pages/influencer/InfluencerWorkflow";
// import ContractPage from "./pages/ContractPage";
// import AgreementForm from "./pages/AgreementForm";
import InfluencerContracts from "./pages/influencer/InfluencerContracts";
import AdminLogo from "./pages/admin/AdminLogo";
import ImageGenerate from "./components/ImageGenerate";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import InfluencerAccountDetails from "./pages/influencer/InfluencerAccountDetails";
import CampaignDetails from "./pages/admin/CampaignDetails";
import Feed from "./pages/Feed"





// import AIHelpIcon from "./components/AIHelpIcon";
// import Chatbot from "./components/Chatbot";
// import { useLocation } from "react-router-dom";
import Loader from "./components/Loader";
import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import SubscriptionPage from "./pages/Subscription";
import ContactMessages from "./pages/admin/ContactMessages";
import FeedbackAdmin from "./pages/admin/FeedbackAdmin";
import DynamicFooter from "./pages/DynamicFooter";
import FooterBuilder from "./pages/admin/FooterBuilder";

import MaintenanceCountdown from "./components/MaintenanceCountdown";
import CurrencyProvider from "./context/CurrencyContext";
import ChatApp from "./pages/brand/ChatApp";


import {setFavicon} from "./components/utils/branding";
import ChatContainer from "./components/chating";
import DirectPayCampaign from "./pages/brand/DirectPayCampaign";
import PendingPayments from "./pages/brand/PendingPayments";
import AIFeatures from "./pages/HomePage/AIFeatures";
import AdminPaymentManagement from "./pages/admin/AdminPaymentManagement";
import AdminPaymentsDashboard from "./pages/admin/AdminPaymentManagement";
import EarningsAnalytics from "./pages/admin/EarningsAnalytics";
import WithdrawalsManagement from "./pages/admin/WithdrawalsManagement";
import PayoutsManagement from "./pages/admin/PayoutsManagement";
import PaymentsManagement from "./pages/admin/PaymentManagement";
import NotFound from "./components/NotFound";
import AdminLogin from "./pages/AdminLogin";
import BulkMessage from "./pages/brand/BulkMessage";


import { useLocation } from "react-router-dom";
import { setPageTitle } from "./components/utils/pageTitle";

function AppRoutes() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [endTime, setEndTime] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");



  
const location = useLocation();

useEffect(() => {
  const path = location.pathname;

  if (path.startsWith("/brand")) {
    setPageTitle("Brand Portal – AI Influencer Marketing Platform");
  } else if (path.startsWith("/influencer")) {
    setPageTitle("Influencer Portal – Collaborate with Brands");
  } else if (path.startsWith("/admin")) {
    setPageTitle("Admin Panel – Platform Management");
  }
}, [location.pathname]);






useEffect(() => {
  let abort = false;

  const loadBranding = async () => {
    try {
      // 1) Immediate fallbacks (no white screen)
      document.title = "Brio";
      setFavicon("/favicon.ico");

      // 2) timeout guard for slow backend
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const branding = await fetchPlatformBranding({ signal: controller.signal });

      clearTimeout(timeout);
      if (abort) return;

      // 3) Save platform globally for dynamic titles
      if (branding?.platformName) {
        window.__PLATFORM_NAME__ = branding.platformName;
        document.title = branding.platformName;
      }

      // 4) favicon or fallback logo
      if (branding?.favicon) {
        setFavicon(branding.favicon);
      } else if (branding?.logo) {
        setFavicon(branding.logo);
      }

    } catch (e) {
      console.error("Branding load failed", e);
      // keep defaults — never block UI
    }
  };

  loadBranding();

  return () => {
    abort = true;
  };
}, []);





  

  // Initial Loader
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Maintenance Check
  // Auto-update maintenance status every 5 sec
// useEffect(() => {
//   const checkStatus = () => {
//     fetch("http://localhost:7000/maintenance/status/")
//       .then((res) => res.json())
//       .then((data) => {
//         setMaintenance(data.maintenance);
//         setMaintenanceMessage(data.message);
//       setEndTime(data.end_time);
//       })
//       .catch(() => {});
//   };

//   checkStatus(); // initial check
//   const interval = setInterval(checkStatus, 5000); // check every 5 sec

//   return () => clearInterval(interval);
// }, []);

//   if (loading) return <Loader />;

//   // STOP ENTIRE APP IF MAINTENANCE = TRUE
//   if (maintenance) {
//   return (
//     <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
//       <iframe
//         src="http://localhost:7000/maintenance/screen/"
//         style={{
//           width: "100%",
//           height: "100%",
//           border: "none",
//         }}
//         title="Maintenance Screen"
//       ></iframe>
//     </div>
//   );
// }





  

  return (





    <Routes>

    <Route path="/auth" element={<AuthPage />} />
<Route path="/login" element={<AuthPage />} />
<Route path="/register" element={<AuthPage />} />

<Route path="/admin/login" element={<AdminLogin />} />




{/* 
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} /> */}

      {/* <Route path="/chatbot" element={<Chatbot />} /> */}
      {/* <Route path="/feedback" element={<FeedbackWidget />} /> */}
       
      <Route element={<MainLayout />}>
      {/* ---------------- Public Pages ---------------- */}
      <Route path="/" element={<Home />} />
      
      <Route path="/mainnavbar" element={<MainNavbar />} />

      
      <Route path="/about" element={<About />} />
      <Route path="/contactUs" element={<ContactUs />} />
      <Route path="/footer" element={<Footer />} />
       {/* Tools & Features */}
            <Route path="/ai-chatbot" element={<MarketIdeaFinder />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/trend-predictor" element={<TrendPredictor />} />
            <Route path="/budget-planner" element={<BudgetPlanner />} />
            <Route path="/engagement-calculator" element={<EngagementCalculator />} />
            <Route path="/fraud-detection" element={<FraudDetection />} />
            <Route path="/predictive-roi" element={<PredictiveROI />} />
            <Route path="/content-analyzer" element={<ContentAnalyzer />} />
            <Route path="/payment-automation" element={<PaymentAutomation />} />
            <Route path="/find-influencer" element={<FindInfluencer />} />
            <Route path="/integration" element={<Integration />} />
            <Route path="/content-intelligence" element={<ContentIntelligence />} />
            <Route path="/futureai" element={<FutureAI />} />
            <Route path="/automation-marketing" element={<AutomationMarketing />} />

            <Route path="/pricingsection" element={<PricingSection />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/demo" element={<DemoVideoPage />} />

            



            <Route path="/resources/blog" element={<Blog />} />
            <Route path="/resources/help-center" element={<HelpCenter />} />
            <Route path="/resources/case-studies" element={<CaseStudies />} />
            <Route path="/resources/documentation" element={<Documentation />} />
            <Route path="/resources/community" element={<Community />} />
            <Route path="/resources/support" element={<Support />} />

          {/* <Route path="/brand/profile/:id" element={<BrandProfile />} />
            <Route path="/influencer/profile/:id" element={<InfluencerProfile />} /> 
            <Route path="/register/brand" element={<BrandRegister />} />
<Route path="/register/influencer" element={<InfluencerRegister />} />*/}



          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          
          <Route path="/ai-features" element={<AIFeatures />} />
          <Route path="/platform-overview" element={<PlatformOverview />} />
          

            


      </Route>


      {/* <Route
  path="/brand/register"
  element={
    <Layout>
      <BrandRegister />
    </Layout>
  }
/>

<Route
  path="/influencer/register"
  element={
    <Layout>
      <InfluencerRegister />
    </Layout>
  }
/> */}

      
      {/* ---------------- Admin Pages ---------------- */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="users/brandusers" element={<BrandUsers />} />
                <Route path="users/influencerusers" element={<InfluencerUsers />} />
                <Route path="campaigns" element={<CampaignManagement />} />
                <Route path="payment/finder" element={<Finder />} />
                {/* <Route path="payment/payment" element={<PaymentManagement />} /> */}
                <Route path="payment/finduser" element={<PaymentInfluencer />} />
                <Route path="payment/campaignfinder" element={<CampaignDetails />} />
                <Route path="payment/bankaccount" element={<PaymentManagement />} />
                <Route path="payment/admin-management" element={<AdminPaymentManagement />} />



                <Route path="reports" element={<AdminReports/>} />
                <Route path="settings" element={<Settings/>} />
                <Route path="logo" element={<AdminLogo/>} />
                <Route path="contact-messages" element={<ContactMessages />} />
                <Route path="feedback-messages" element={<FeedbackAdmin />} />
                <Route path="footer-builder" element={<FooterBuilder />} />  
                


                <Route path="notifications" element={<AdminLogo/>} />
                
                <Route
                  path="menus"
                  element={<AdminMenuManager token={user?.token} />}
                />

                <Route path="/profiles/public" element={<PublicProfiles />} />
                <Route path="/profile/view/:type/:id" element={<ViewProfile />} />
                <Route path="/profiles/connections/:userId" element={<ConnectionsList />} />


                

              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ---------------- Brand Pages ---------------- */}
      <Route
        path="/brand/*"
        element={
          <ProtectedRoute role="brand">
            <Layout>
              <Routes>
                <Route path="workflow" element={<BrandWorkflow />} />
                <Route path="dashboard" element={<BrandDashboard />} />
                <Route path="campaigns" element={<BrandCampaigns />} />
                <Route path="campaigns/create-campaign" element={<BrandCreateCampaign />} />
                <Route path="campaigns/requests" element={<BrandApplications />} />
                {/* <Route path="collaborations" element={<BrandMessage />} /> */}
                <Route path="collaborations"  userRole="brand" element={<ChatApp />} />
                <Route path="automation" element={<BrandAutomation />} />
                {/* <Route path="automation1" element={<BulkMessage />} /> */}
                <Route path="analytics" element={<BrandAnalytics />} />
                <Route path="account" element={<BrandAccountDetails />} />
                <Route path="payments" element={<Payments />} />
                <Route path="autopay" element={<Autopay />} />
                <Route path="pendingpayments" element={<PendingPayments />} />
                <Route path="campaigns/:campaignId/direct-pay" element={<DirectPayCampaign />} />
                <Route path="stripepay" element={<StripePayment />} />
                <Route path="paypalpay" element={<PayPalPayment />} />
                <Route path="media" element={<SocialMediaEmbed />} />
                <Route path="notification" element={<BrandNotification />} />
                <Route path="settings" element={<BrandSettings />} />
                <Route path="sms" element={<SendSMS />} />
                <Route path="automation/contacts" element={<Contact />} />
                <Route path="tools" element={<Tools />} />
                <Route path="tools/findinluencers" element={<FindInfluencer />} />
                <Route path="tools/imagegenarate" element={<ImageGenerate />} />
                <Route path="tools/content-analyzer" element={<ContentAnalyzer />} />
                <Route path="tools/integration" element={<BrandIntegration />} />
                <Route
                  path="tools/content-intelligence"
                  element={<BrandIntelligence />}
                />
                <Route path="tools/futureai" element={<BrandAI />} />
                <Route
                  path="tools/automation-marketing"
                  element={<AutomationMarketing />}

                />


                <Route path=":id" element={<BrandProfile />} />
                <Route path="register" element={<BrandRegister />} />
                <Route path="profiles/public" element={<PublicProfiles />} />
                <Route path="profile/view/:type/:id" element={<ViewProfile />} />
                <Route path="profiles/connections/:userId" element={<ConnectionsList />} />
                <Route path="feed" element={<Feed />} />
                <Route path="Subscription" element={<SubscriptionPage />} />
                <Route path="notifications" element={<BrandNotification/>} />
                
            {/* <Route path="profile/:id" element={<InfluencerProfile />} />
            <Route path="/register/influencer" element={<InfluencerRegister />} /> */}
                
                <Route path="agreements" element={<BrandAgreements />} />
             
                
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ---------------- Influencer Pages ---------------- */}
      <Route
        path="/influencer/*"
        element={
          <ProtectedRoute role="influencer">
            <Layout>
              <Routes>
                <Route path="workflow" element={<InfluencerWorkflow />} />
                <Route path="dashboard" element={<InfluencerDashboard />} />
                <Route path="campaigns" element={<InfluencerCampaigns />} />
                <Route path="campaigns/requests" element={<InfluencerApplications />} />
                <Route path="analytics" element={<InfluencerAnalytics />} />
                {/* <Route path="collaborations" element={<InfluencerMessage />} /> */}
                <Route path="collaborations" userRole="influencer" element={<ChatApp />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="account" element={<InfluencerAccountDetails />} />
                <Route path="settings" element={<InfluencerSettings />} />
                <Route path="media" element={<SocialMediaEmbed />} />
                <Route path="notification" element={<InfluencerNotification />} />
                <Route path="aitools" element={<AITools />} />
                <Route path="aitools/aicontentcreator" element={<BrandIntelligence />} />
                <Route path="aitools/fastpost" element={<FastPost />} />
                <Route path="aitools/aihashtag" element={<AIHashtag />} />
                <Route path="aitools/aicalculator" element={<AICalculator />} />
                <Route path="aitools/imagegenarate" element={<ImageGenerate />} />
                <Route path="aitools/voicetotextai" element={<VoiceToTextAI />} />
                <Route path="agreements" element={<InfluencerContracts />} />



                {/* <Route path="profile/:id" element={<BrandProfile />} /> 
                <Route path="/register/brand" element={<BrandRegister />} />*/}
            <Route path=":id" element={<InfluencerProfile />} />
            <Route path="register" element={<InfluencerRegister />} />
            <Route path="profiles/public" element={<PublicProfiles />} />
            <Route path="profile/view/:type/:id" element={<ViewProfile />} />
            <Route path="profiles/connections/:userId" element={<ConnectionsList />} />
            <Route path="feed" element={<Feed />} />
            <Route path="Subscription" element={<SubscriptionPage />} />
            <Route path="notifications" element={<InfluencerNotification/>} />

                
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ---------------- Fallback / 404 ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
       <CurrencyProvider>
      <Router>
        <ScrollToTop />
        <AppRoutes />
        
        {/* <AIHelpIcon /> */}
        {/* <Chatbot /> */}
      </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}
