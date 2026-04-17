// import React, { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";
// import "../style/Home.css";
// import About from "./About";
// import PricingSection from "../components/PricingSection";
// import AutomationMarketing from "./brand/AutomationMarketing";
// import Integration from "./brand/Integration";
// import CaseStudies from "../components/CaseStudies";
// import ContentIntelligence from "../components/ContentIntelligence";

// const Home = () => {
//   const [isVisible, setIsVisible] = useState({});
//   const sectionRefs = {
//     hero: useRef(null),
//     stats: useRef(null),
//     platform: useRef(null),
//     campaigns: useRef(null),
//     influencers: useRef(null),
//     features: useRef(null),
//     cta: useRef(null)
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
//           }
//         });
//       },
//       { threshold: 0.2 }
//     );

//     Object.keys(sectionRefs).forEach((key) => {
//       if (sectionRefs[key].current) {
//         observer.observe(sectionRefs[key].current);
//       }
//     });

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div className="qb-home-container">


//       {/* Main Content */}
//       <main className="qb-main-content">
//         {/* Hero Section */}
//         <section className="qb-hero" ref={sectionRefs.hero} id="hero">
//           <div className="qb-hero-background">
//             <div className="qb-hero-orbit orbit-1"></div>
//             <div className="qb-hero-orbit orbit-2"></div>
//             <div className="qb-hero-orbit orbit-3"></div>
//           </div>

//           <div className={`qb-hero-content ${isVisible.hero ? 'fade-in-up' : ''}`}>
//             <div className="qb-hero-badge">
//                AI-Driven Influencer Marketing Platform
//             </div>
//             <h1>Transform Your Brand with <span className="qb-gradient-text">AI-Powered</span> Influencer Marketing</h1>
//             <p>QUICKBOX.IO connects you with the perfect influencers, measures campaign performance, and maximizes your ROI—all through intelligent automation.</p>
//             <div className="qb-hero-actions">
//               <Link to="/login" className="qb-btn primary large with-glow">
//                 Start Free Trial
//               </Link>
//               <Link to="/demo" className="qb-btn secondary large">
//                 View Live Demo
//               </Link>
//             </div>
//             <div className="qb-hero-trusted">
//               <p>Trusted by 500+ brands worldwide</p>
//               <div className="qb-trusted-logos">
//                 <span>Nike</span>
//                 <span>Adidas</span>
//                 <span>Samsung</span>
//                 <span>Coca-Cola</span>
//                 <span>Amazon</span>
//               </div>
//             </div>
//           </div>

//           <div className="qb-hero-visual">
//             <div className="qb-hero-image-container">
//               <img 
//                 src="/images/quickbox-dashboard.jpg"
//                 alt="QUICKBOX.IO AI Dashboard - Analytics and Insights" 
//                 className="qb-hero-image with-3d-effect"
//               />
//               <div className="qb-image-glow"></div>
//             </div>
//           </div>
//         </section>

//         {/* Stats Section */}
//         <section className="qb-stats-section" ref={sectionRefs.stats} id="stats">
//           <div className="qb-stats-background">
//             <div className="qb-stats-particle particle-1"></div>
//             <div className="qb-stats-particle particle-2"></div>
//             <div className="qb-stats-particle particle-3"></div>
//           </div>
//           <div className="qb-stats-container">
//             <div className={`qb-stat ${isVisible.stats ? 'counter-animation' : ''}`}>
//               <h3 data-count="10000">10K+</h3>
//               <p>Active Influencers</p>
//             </div>
//             <div className={`qb-stat ${isVisible.stats ? 'counter-animation' : ''}`}>
//               <h3 data-count="5000">5K+</h3>
//               <p>Successful Campaigns</p>
//             </div>
//             <div className={`qb-stat ${isVisible.stats ? 'counter-animation' : ''}`}>
//               <h3 data-count="98">98%</h3>
//               <p>Client Satisfaction</p>
//             </div>
//             <div className={`qb-stat ${isVisible.stats ? 'counter-animation' : ''}`}>
//               <h3 data-count="15000000">15M+</h3>
//               <p>Audience Reach</p>
//             </div>
//           </div>
//         </section>

//         {/* Platform Overview */}
//         <section className="qb-platform-overview" ref={sectionRefs.platform} id="platform">
//           <div className={`qb-section-header ${isVisible.platform ? 'fade-in-up' : ''}`}>
//             <h2>Everything You Need for Influencer Marketing Success</h2>
//             <p>Our AI-powered platform simplifies every aspect of influencer marketing with intelligent automation</p>
//           </div>

//           {/* Campaign Management */}
//           <div className={`qb-feature-highlight ${isVisible.platform ? 'slide-in-left' : ''}`}>
//             <div className="qb-feature-content">
//               <div className="qb-feature-badge">AI-Powered</div>
//               <h3>Launch Campaigns in Minutes</h3>
//               <p>Create, manage, and track influencer campaigns with our intuitive tools. Set up targeting, budgets, and goals with just a few clicks using our AI recommendations.</p>
//               <ul className="qb-feature-list">
//                 <li>✓ AI-driven influencer matching</li>
//                 <li>✓ Automated campaign workflows</li>
//                 <li>✓ Real-time performance tracking</li>
//                 <li>✓ Smart budget optimization</li>
//               </ul>
//               <Link to="/login" className="qb-btn primary with-hover-effect">Create Campaign</Link>
//             </div>
//             <div className="qb-feature-visual">
//               <div className="qb-platform-image-container">
//                 <img 
//                   src="/images/createcampaign.jpg"
//                   alt="Campaign Management Dashboard"
//                   className="qb-platform-image with-3d-effect"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Analytics & Insights */}
//           <div className={`qb-feature-highlight reverse ${isVisible.platform ? 'slide-in-right' : ''}`}>
//             <div className="qb-feature-content">
//               <div className="qb-feature-badge">Real-Time</div>
//               <h3>Advanced Analytics & Insights</h3>
//               <p>Track campaign performance with detailed metrics and AI-powered insights. Make data-driven decisions to optimize your strategy in real-time.</p>
//               <div className="qb-analytics-preview">
//                 <div className="qb-analytic-metric">
//                   <span className="qb-metric-value">2.4M</span>
//                   <span className="qb-metric-label">Impressions</span>
//                 </div>
//                 <div className="qb-analytic-metric">
//                   <span className="qb-metric-value">45K</span>
//                   <span className="qb-metric-label">Engagements</span>
//                 </div>
//                 <div className="qb-analytic-metric">
//                   <span className="qb-metric-value">12.8%</span>
//                   <span className="qb-metric-label">Conversion Rate</span>
//                 </div>
//               </div>
//               <Link to="/login" className="qb-btn primary with-hover-effect">View Analytics</Link>
//             </div>
//             <div className="qb-feature-visual">
//               <div className="qb-analytics-image-container">
//                 <img 
//                   src="/images/analyticsreport.jpg"
//                   alt="Analytics and Reporting Dashboard"
//                   className="qb-analytics-image with-3d-effect"
//                 />
//               </div>
//             </div>
//           </div>
//         </section>

//         <About />

//         {/* Campaigns Preview */}
//         <section className="qb-campaigns-preview" ref={sectionRefs.campaigns} id="campaigns">
//           <div className="qb-campaigns-background">
//             <div className="qb-campaigns-grid-bg"></div>
//           </div>
//           <div className={`qb-section-header ${isVisible.campaigns ? 'fade-in-up' : ''}`}>
//             <h2>Successful Campaign Examples</h2>
//             <p>See how brands are achieving exceptional results with QUICKBOX.IO</p>
//           </div>

//           <div className="qb-campaigns-grid">
//             <div className={`qb-campaign-card with-hover-3d ${isVisible.campaigns ? 'fade-in-up delayed-1' : ''}`}>
//               <div className="qb-campaign-image">
//                 <img src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80" alt="Summer Launch Campaign" />
//               </div>
//               <div className="qb-campaign-badge">Instagram</div>
//               <h4>Summer Launch Campaign</h4>
//               <p className="qb-campaign-stats">+245% Engagement • 3.2M Reach</p>
//               <p className="qb-campaign-desc">Kickstart your summer with our AI-curated influencer campaign featuring trending lifestyle content creators.</p>
//               <div className="qb-campaign-result">
//                 <span className="qb-result-value">$15.2K</span>
//                 <span className="qb-result-label">ROI Generated</span>
//               </div>
//               <Link to="/campaigns/summer" className="qb-campaign-btn">View Case Study →</Link>
//             </div>

//             <div className={`qb-campaign-card with-hover-3d ${isVisible.campaigns ? 'fade-in-up delayed-2' : ''}`}>
//               <div className="qb-campaign-image">
//                 <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Fitness Challenge Campaign" />
//               </div>
//               <div className="qb-campaign-badge">YouTube</div>
//               <h4>Fitness Challenge</h4>
//               <p className="qb-campaign-stats">+189% Conversions • 850K Views</p>
//               <p className="qb-campaign-desc">Collaborate with top fitness influencers to promote your products and engage health-conscious audiences.</p>
//               <div className="qb-campaign-result">
//                 <span className="qb-result-value">8.5x</span>
//                 <span className="qb-result-label">Return on Ad Spend</span>
//               </div>
//               <Link to="/campaigns/fitness" className="qb-campaign-btn">View Case Study →</Link>
//             </div>

//             <div className={`qb-campaign-card with-hover-3d ${isVisible.campaigns ? 'fade-in-up delayed-3' : ''}`}>
//               <div className="qb-campaign-image">
//                 <img src="/images/tech.jpg" alt="Tech Giveaway Campaign" />
//               </div>
//               <div className="qb-campaign-badge">TikTok</div>
//               <h4>Tech Giveaway Blitz</h4>
//               <p className="qb-campaign-stats">+312% Awareness • 5.1M Views</p>
//               <p className="qb-campaign-desc">Boost brand awareness with viral TikTok challenges and giveaways powered by tech-savvy content creators.</p>
//               <div className="qb-campaign-result">
//                 <span className="qb-result-value">42K</span>
//                 <span className="qb-result-label">New Followers</span>
//               </div>
//               <Link to="/campaigns/tech" className="qb-campaign-btn">View Case Study →</Link>
//             </div>
//           </div>

//           <div className="qb-section-cta">
//             <Link to="/campaigns" className="qb-btn primary large with-glow">Explore All Campaigns</Link>
//           </div>
//         </section>

//         <PricingSection />

//         {/* AI Features Section */}
//         <section className="qb-ai-features" ref={sectionRefs.features} id="features">
//           <div className={`qb-section-header ${isVisible.features ? 'fade-in-up' : ''}`}>
//             <h2>Powered by Advanced AI Technology</h2>
//             <p>Experience the future of influencer marketing with our cutting-edge AI capabilities</p>
//           </div>

//           <div className="qb-ai-features-grid">
//             <div className={`qb-ai-feature-card ${isVisible.features ? 'fade-in-up delayed-1' : ''}`}>
//               <div className="qb-ai-icon">
//                 <div className="qb-ai-glow"></div>
//                 <img src="/images/smart.jpg" alt="AI Matching Technology" className="qb-ai-image" />
//               </div>
//               <h3>Smart Influencer Matching</h3>
//               <p>Our AI analyzes 200+ data points to find perfect influencer matches based on audience demographics, engagement patterns, and brand alignment.</p>
//               <div className="qb-ai-stats">
//                 <span>95% Match Accuracy</span>
//               </div>
//             </div>

//             <div className={`qb-ai-feature-card ${isVisible.features ? 'fade-in-up delayed-2' : ''}`}>
//               <div className="qb-ai-icon">
//                 <div className="qb-ai-glow"></div>
//                 <img src="/images/predict.jpg" alt="Predictive Analytics" className="qb-ai-image" />
//               </div>
//               <h3>Predictive Analytics</h3>
//               <p>Forecast campaign performance and ROI before launch using our machine learning models trained on thousands of successful campaigns.</p>
//               <div className="qb-ai-stats">
//                 <span>89% Prediction Accuracy</span>
//               </div>
//             </div>

//             <div className={`qb-ai-feature-card ${isVisible.features ? 'fade-in-up delayed-3' : ''}`}>
//               <div className="qb-ai-icon">
//                 <div className="qb-ai-glow"></div>
//                 <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80" alt="Automation Workflows" className="qb-ai-image" />
//               </div>
//               <h3>Automated Workflows</h3>
//               <p>Streamline influencer outreach, contract management, content approval, and payments with intelligent automation workflows.</p>
//               <div className="qb-ai-stats">
//                 <span>70% Time Saved</span>
//               </div>
//             </div>
//           </div>
//         </section>
//         <ContentIntelligence />

//         {/* CTA Section */}
//         <section className="qb-cta-section" ref={sectionRefs.cta} id="cta">
//           <div className="qb-cta-background">
//             <div className="qb-cta-orbit"></div>
//             <div className="qb-cta-particles"></div>
//           </div>
//           <div className={`qb-cta-container ${isVisible.cta ? 'scale-in' : ''}`}>
//             <h2>Ready to Transform Your Influencer Marketing?</h2>
//             <p>Join thousands of brands that trust QUICKBOX.IO for their AI-powered influencer campaigns</p>
//             <div className="qb-cta-features">
//               <span>✓ AI-Powered Matching</span>
//               <span>✓ Real-Time Analytics</span>
//               <span>✓ Automated Workflows</span>
//             </div>
//             <Link to="/login" className="qb-btn primary large with-pulse">
//               Start Your Free Trial
//             </Link>
//             <span className="qb-cta-note">No credit card required • 14-day free trial • Setup in 5 minutes</span>
//           </div>
//         </section>
//         <AutomationMarketing />
//         <CaseStudies />
//         <Integration />
//       </main>
//     </div>
//   );
// };

// export default Home;


import React from "react";
import "../style/Home.css";

// Import components from HomePage folder
import HeroSection from "./HomePage/HeroSection";
import StatsSection from "./HomePage/StatsSection";
import Features from "./HomePage/Features";
import PlatformOverview from "./HomePage/PlatformOverview";
import CampaignsPreview from "./HomePage/CampaignsPreview";
import AIFeatures from "./HomePage/AIFeatures";
import CTASection from "./HomePage/CTASection";
import PartnershipScroll from "./HomePage/PartnershipScroll";
import About from "./About";
import PricingSection from "../components/PricingSection";
import AutomationMarketing from "./brand/AutomationMarketing";
import Integration from "./brand/Integration";
import CaseStudies from "../components/CaseStudies";
import ContentIntelligence from "../components/ContentIntelligence";
import DynamicFooter from "./DynamicFooter";
import ProfessionalFeatures from "./HomePage/professionalFeatures";


import { setPageTitle } from "../components/utils/pageTitle";
import { useEffect } from "react";


const Home = () => {

  useEffect(() => {
    setPageTitle(
      "AI-Driven Influencer Marketing Platform for Brands & Influencers",
      "Discover AI-powered influencer marketing that helps brands identify creators, run smarter campaigns, and maximize reach with data-driven insights."
    );
  }, []);




  return (
    <div >

      <HeroSection />

      <PartnershipScroll />

      <Features />


      <ProfessionalFeatures />

      {/* <StatsSection /> */}


      {/* <PlatformOverview /> */}

      {/* <PricingSection /> */}

      {/* <CampaignsPreview/> */}

      {/* <AIFeatures/> */}

      {/* <CaseStudies /> */}

      {/* <ContentIntelligence /> */}

      {/* <CTASection /> */}

      {/* <About /> */}

      {/* <AutomationMarketing /> */}

      {/* <Integration /> */}

      {/* <DynamicFooter /> */}

    </div>
  );
};

export default Home;