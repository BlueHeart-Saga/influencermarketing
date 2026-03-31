// import React from "react";
// import { 
//   FaRobot, 
//   FaCalendarAlt, 
//   FaChartLine, 
//   FaPlug, 
//   FaUsers,
//   FaRocket,
//   FaPlay,
//   FaCheckCircle,
//   FaSync,
//   FaShieldAlt,
//   FaCog,
//   FaLightbulb,
//   FaRegClock,
//   FaRegChartBar,
//   FaRegComments,
//   FaRegStar, FaShopify, FaInstagram, FaYoutube, FaTiktok, FaFacebookF, FaTwitter, FaSearch, FaBolt
// } from "react-icons/fa";


// export default function AutomationMarketing() {
//   const stats = [
//     { value: "42", label: "Active Campaigns", icon: <FaRocket className="am-stat-icon" /> },
//     { value: "350+", label: "Influencers Onboarded", icon: <FaUsers className="am-stat-icon" /> },
//     { value: "1.2M", label: "Automated Impressions", icon: <FaRegChartBar className="am-stat-icon" /> },
//     { value: "87%", label: "Workflow Efficiency", icon: <FaSync className="am-stat-icon" /> }
//   ];

//   const features = [
//   {
//     icon: <FaCalendarAlt className="am-feature-icon" />,
//     title: "Campaign Scheduling",
//     description:
//       "Schedule campaigns with automated triggers and smart reminders to maximize engagement across all time zones.",
//     benefits: [
//       "Smart timezone optimization",
//       "Automated reminder system",
//       "Flexible scheduling options"
//     ]
//   },
//   {
//     icon: <FaRobot className="am-feature-icon" />,
//     title: "AI-Powered Workflows",
//     description:
//       "Automate repetitive tasks like approvals, reporting, and influencer follow-ups with intelligent automation.",
//     benefits: [
//       "Smart task automation",
//       "AI-driven approvals",
//       "Automated follow-ups"
//     ]
//   },
//   {
//     icon: <FaChartLine className="am-feature-icon" />,
//     title: "Smart Analytics",
//     description:
//       "Get real-time insights into campaign performance with predictive analytics and performance forecasting.",
//     benefits: [
//       "Real-time dashboards",
//       "Predictive analytics",
//       "Performance insights"
//     ]
//   },
//   {
//     icon: <FaPlug className="am-feature-icon" />,
//     title: "Seamless Integrations",
//     description:
//       "Connect with Shopify, Instagram, YouTube, and more for smooth automation across platforms.",
//     benefits: [
//       "50+ platform integrations",
//       "API connectivity",
//       "Custom webhooks"
//     ]
//   },
//   {
//     icon: <FaSearch className="am-feature-icon" />,
//     title: "Influencer Discovery",
//     description:
//       "Find the right influencers for your brand using AI-powered search, audience insights, and engagement metrics.",
//     benefits: [
//       "Advanced influencer filters",
//       "Authenticity verification",
//       "Engagement rate analytics"
//     ]
//   },
//   {
//     icon: <FaBolt className="am-feature-icon" />,
//     title: "Performance Optimization",
//     description:
//       "Boost campaign results with AI that adapts strategies in real time for better reach and ROI.",
//     benefits: [
//       "Adaptive performance tuning",
//       "AI-based content adjustments",
//       "ROI-driven insights"
//     ]
//   }
// ];

//   const workflowSteps = [
//     {
//       step: 1,
//       icon: <FaRegComments className="am-workflow-icon" />,
//       title: "Campaign Creation",
//       description: "Set up your campaign goals and parameters",
//       time: "2 minutes"
//     },
//     {
//       step: 2,
//       icon: <FaUsers className="am-workflow-icon" />,
//       title: "Influencer Matching",
//       description: "AI matches perfect influencers for your brand",
//       time: "Instant"
//     },
//     {
//       step: 3,
//       icon: <FaRegClock className="am-workflow-icon" />,
//       title: "Content Scheduling",
//       description: "Automatically schedule posts for optimal times",
//       time: "Auto-scheduled"
//     },
//     {
//       step: 4,
//       icon: <FaRegChartBar className="am-workflow-icon" />,
//       title: "Performance Reporting",
//       description: "Get comprehensive analytics and insights",
//       time: "Real-time"
//     }
//   ];

//   const benefits = [
//     { icon: <FaRegClock className="am-benefit-icon" />, text: "Save 15+ hours weekly" },
//     { icon: <FaChartLine className="am-benefit-icon" />, text: "Increase ROI by 40%" },
//     { icon: <FaUsers className="am-benefit-icon" />, text: "Scale to 1000+ influencers" },
//     { icon: <FaShieldAlt className="am-benefit-icon" />, text: "Enterprise-grade security" }
//   ];

//   return (
//     <div className="am-container">
//       {/* Background Elements */}
//       <div className="am-background-elements">
//         <div className="am-bg-shape am-shape-1"></div>
//         <div className="am-bg-shape am-shape-2"></div>
//         <div className="am-bg-shape am-shape-3"></div>
//       </div>

//       {/* Header Section */}
//       <header className="am-hero-section">
//         <div className="am-hero-content">
//           <div className="am-hero-badge">
//             <FaRobot className="am-badge-icon" />
//             <span>AI-Powered Automation</span>
//           </div>
//           <h1 className="am-hero-title">
//             Marketing Automation
//             <span className="am-title-accent"> Platform</span>
//           </h1>
//           <p className="am-hero-description">
//             Streamline campaigns, automate influencer collaborations, and scale your marketing 
//             efforts with intelligent AI-powered workflows that save time and boost performance.
//           </p>
          
//           <div className="am-hero-benefits">
//             {benefits.map((benefit, index) => (
//               <div key={index} className="am-benefit-item">
//                 {benefit.icon}
//                 <span>{benefit.text}</span>
//               </div>
//             ))}
//           </div>

//           <div className="am-hero-actions">
//             <button className="am-btn am-btn-primary">
//               <FaRocket className="am-btn-icon" />
//               <span>Start Free Trial</span>
//             </button>
//             <button className="am-btn am-btn-secondary">
//               <FaPlay className="am-btn-icon" />
//               <span>Watch Demo</span>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Stats Section */}
//       <section className="am-stats-section">
//         <div className="am-stats-grid">
//           {stats.map((stat, index) => (
//             <div key={index} className="am-stat-card">
//               <div className="am-stat-icon-wrapper">
//                 {stat.icon}
//               </div>
//               <div className="am-stat-content">
//                 <h3 className="am-stat-value">{stat.value}</h3>
//                 <p className="am-stat-label">{stat.label}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="am-features-section">
//         <div className="am-section-header">
//           <h2 className="am-section-title">Powerful Automation Features</h2>
//           <p className="am-section-description">
//             Everything you need to automate and scale your influencer marketing campaigns
//           </p>
//         </div>
        
//         <div className="am-features-grid">
//           {features.map((feature, index) => (
//             <div key={index} className="am-feature-card">
//               <div className="am-feature-header">
//                 <div className="am-feature-icon-wrapper">
//                   {feature.icon}
//                 </div>
//                 <h3 className="am-feature-title">{feature.title}</h3>
//               </div>
//               <p className="am-feature-description">{feature.description}</p>
//               <ul className="am-feature-benefits">
//                 {feature.benefits.map((benefit, idx) => (
//                   <li key={idx} className="am-benefit-item">
//                     <FaCheckCircle className="am-check-icon" />
//                     <span>{benefit}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Workflow Section */}
//       <section className="am-workflow-section">
//         <div className="am-section-header">
//           <h2 className="am-section-title">Automated Workflow Process</h2>
//           <p className="am-section-description">
//             From campaign creation to performance analysis - completely automated
//           </p>
//         </div>
        
//         <div className="am-workflow-container">
//           {workflowSteps.map((step, index) => (
//             <div key={index} className="am-workflow-step">
//               <div className="am-step-indicator">
//                 <div className="am-step-number">{step.step}</div>
//                 <div className="am-step-connector"></div>
//               </div>
//               <div className="am-step-content">
//                 <div className="am-step-icon">{step.icon}</div>
//                 <h4 className="am-step-title">{step.title}</h4>
//                 <p className="am-step-description">{step.description}</p>
//                 <div className="am-step-time">
//                   <FaRegClock className="am-time-icon" />
//                   <span>{step.time}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Integration Section */}
//       <section className="am-integration-section">
//         <div className="am-integration-content">
//           <div className="am-integration-text">
//             <h2 className="am-integration-title">
//               Connect Your Entire Marketing Stack
//             </h2>
//             <p className="am-integration-description">
//               Seamlessly integrate with your favorite tools and platforms to create 
//               a unified marketing automation ecosystem.
//             </p>
//             <div className="am-integration-features">
//               <div className="am-integration-feature">
//                 <FaCog className="am-integration-icon" />
//                 <span>Custom API Integrations</span>
//               </div>
//               <div className="am-integration-feature">
//                 <FaLightbulb className="am-integration-icon" />
//                 <span>Smart Data Sync</span>
//               </div>
//               <div className="am-integration-feature">
//                 <FaShieldAlt className="am-integration-icon" />
//                 <span>Secure Connections</span>
//               </div>
//             </div>
//           </div>
//           <div className="am-integration-visual">
//             <div className="am-platform-grid">
//   {[
//     { name: 'Shopify', icon: <FaShopify /> },
//     { name: 'Instagram', icon: <FaInstagram /> },
//     { name: 'YouTube', icon: <FaYoutube /> },
//     { name: 'TikTok', icon: <FaTiktok /> },
//     { name: 'Facebook', icon: <FaFacebookF /> },
//     { name: 'Twitter (X)', icon: <FaTwitter /> },
//   ].map((platform, index) => (
//     <div key={index} className="am-platform-item">
//       <div className="am-platform-icon">{platform.icon}</div>
//       <span>{platform.name}</span>
//     </div>
//   ))}
// </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="am-cta-section">
//         <div className="am-cta-content">
//           <div className="am-cta-badge">
//             <FaRocket className="am-cta-icon" />
//             <span>Start Automating Today</span>
//           </div>
//           <h2 className="am-cta-title">Ready to Transform Your Marketing?</h2>
//           <p className="am-cta-description">
//             Join 2,500+ brands that save time, reduce costs, and amplify their reach 
//             with automated influencer marketing workflows.
//           </p>
//           <div className="am-cta-actions">
//             <button className="am-btn am-btn-primary am-btn-large">
//               <FaRocket className="am-btn-icon" />
//               <span>Start Free Trial</span>
//             </button>
//             <button className="am-btn am-btn-secondary am-btn-large">
//               <FaRegStar className="am-btn-icon" />
//               <span>Schedule Demo</span>
//             </button>
//           </div>
//           <div className="am-cta-features">
//             <div className="am-cta-feature">
//               <FaCheckCircle className="am-cta-check" />
//               <span>No credit card required</span>
//             </div>
//             <div className="am-cta-feature">
//               <FaCheckCircle className="am-cta-check" />
//               <span>14-day free trial</span>
//             </div>
//             <div className="am-cta-feature">
//               <FaCheckCircle className="am-cta-check" />
//               <span>Cancel anytime</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       <style jsx>{`
//         .am-container {
//           min-height: 100vh;
//           background: linear-gradient(135deg, rgb(230, 236, 253) 0%, rgb(245, 247, 255) 50%, rgb(230, 236, 253) 100%);
//           position: relative;
//           overflow-x: hidden;
//         }

//         .am-background-elements {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           pointer-events: none;
//           overflow: hidden;
//         }

//         .am-bg-shape {
//           position: absolute;
//           border-radius: 50%;
//           background: rgba(161, 180, 242, 0.1);
//           filter: blur(60px);
//         }

//         .am-shape-1 {
//           width: 400px;
//           height: 400px;
//           top: -100px;
//           left: -100px;
//         }

//         .am-shape-2 {
//           width: 300px;
//           height: 300px;
//           bottom: -50px;
//           right: -50px;
//         }

//         .am-shape-3 {
//           width: 200px;
//           height: 200px;
//           top: 50%;
//           left: 60%;
//         }

//         /* Hero Section */
//         .am-hero-section {
//           padding: 6rem 1.5rem 4rem;
//           max-width: 1200px;
//           margin: 0 auto;
//           text-align: center;
//         }

//         .am-hero-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(161, 180, 242, 0.15);
//           border: 1px solid rgba(161, 180, 242, 0.4);
//           border-radius: 50px;
//           color: rgb(80, 100, 200);
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//         }

//         .am-badge-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .am-hero-title {
//           font-size: 3.5rem;
//           font-weight: 800;
//           color: #1a202c;
//           margin-bottom: 1.5rem;
//           line-height: 1.1;
//         }

//         .am-title-accent {
//           background: linear-gradient(135deg, rgb(80, 100, 200) 0%, rgb(161, 180, 242) 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }

//         .am-hero-description {
//           font-size: 1.25rem;
//           color: #4a5568;
//           max-width: 700px;
//           margin: 0 auto 3rem;
//           line-height: 1.6;
//         }

//         .am-hero-benefits {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 1rem;
//           max-width: 600px;
//           margin: 0 auto 3rem;
//         }

//         .am-benefit-item {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1rem 1.5rem;
//           background: rgba(255, 255, 255, 0.8);
//           border: 1px solid rgba(161, 180, 242, 0.3);
//           border-radius: 12px;
//           color: #2d3748;
//           font-size: 0.875rem;
//           font-weight: 500;
//           backdrop-filter: blur(10px);
//         }

//         .am-benefit-icon {
//           width: 1rem;
//           height: 1rem;
//           color: rgb(80, 100, 200);
//         }

//         .am-hero-actions {
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//           flex-wrap: wrap;
//         }

//         .am-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1rem 2rem;
//           border-radius: 12px;
//           font-size: 1rem;
//           font-weight: 600;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .am-btn-primary {
//           background: linear-gradient(135deg, rgb(80, 100, 200) 0%, rgb(161, 180, 242) 100%);
//           color: white;
//           box-shadow: 0 8px 25px rgba(80, 100, 200, 0.3);
//         }

//         .am-btn-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 12px 35px rgba(80, 100, 200, 0.4);
//         }

//         .am-btn-secondary {
//           background: rgba(255, 255, 255, 0.9);
//           color: rgb(80, 100, 200);
//           border: 2px solid rgba(161, 180, 242, 0.4);
//         }

//         .am-btn-secondary:hover {
//           background: white;
//           border-color: rgba(161, 180, 242, 0.6);
//           transform: translateY(-2px);
//         }

//         .am-btn-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         /* Stats Section */
//         .am-stats-section {
//           padding: 4rem 1.5rem;
//           max-width: 1200px;
//           margin: 0 auto;
//         }

//         .am-stats-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 2rem;
//         }

//         .am-stat-card {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(161, 180, 242, 0.3);
//           border-radius: 16px;
//           padding: 2.5rem 2rem;
//           text-align: center;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//         }

//         .am-stat-card:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 12px 30px rgba(161, 180, 242, 0.2);
//         }

//         .am-stat-icon-wrapper {
//           width: 70px;
//           height: 70px;
//           background: linear-gradient(135deg, rgba(161, 180, 242, 0.2) 0%, rgba(195, 217, 251, 0.3) 100%);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 1.5rem;
//           color: rgb(80, 100, 200);
//         }

//         .am-stat-icon {
//           width: 2rem;
//           height: 2rem;
//         }

//         .am-stat-value {
//           font-size: 2.5rem;
//           font-weight: 800;
//           color: #1a202c;
//           margin: 0 0 0.5rem;
//         }

//         .am-stat-label {
//           font-size: 0.875rem;
//           color: #718096;
//           margin: 0;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           font-weight: 600;
//         }

//         /* Features Section */
//         .am-features-section {
//           padding: 6rem 1.5rem;
//           max-width: 1200px;
//           margin: 0 auto;
//         }

//         .am-section-header {
//           text-align: center;
//           margin-bottom: 4rem;
//         }

//         .am-section-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 1rem;
//         }

//         .am-section-description {
//           font-size: 1.125rem;
//           color: #718096;
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .am-features-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 2.5rem;
//         }

//         .am-feature-card {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(161, 180, 242, 0.3);
//           border-radius: 20px;
//           padding: 2.5rem 2rem;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//         }

//         .am-feature-card:hover {
//           transform: translateY(-6px);
//           box-shadow: 0 20px 40px rgba(161, 180, 242, 0.15);
//         }

//         .am-feature-header {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         .am-feature-icon-wrapper {
//           width: 60px;
//           height: 60px;
//           background: linear-gradient(135deg, rgba(161, 180, 242, 0.2) 0%, rgba(195, 217, 251, 0.3) 100%);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: rgb(80, 100, 200);
//         }

//         .am-feature-icon {
//           width: 1.5rem;
//           height: 1.5rem;
//         }

//         .am-feature-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #1a202c;
//           margin: 0;
//         }

//         .am-feature-description {
//           color: #718096;
//           line-height: 1.6;
//           margin-bottom: 1.5rem;
//         }

//         .am-feature-benefits {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//         }

//         .am-benefit-item {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           color: #4a5568;
//           font-size: 0.875rem;
//           margin-bottom: 0.75rem;
//         }

//         .am-check-icon {
//           width: 1rem;
//           height: 1rem;
//           color: #48bb78;
//           flex-shrink: 0;
//         }

//         /* Workflow Section */
//         .am-workflow-section {
//           padding: 6rem 1.5rem;
//           max-width: 1200px;
//           margin: 0 auto;
//         }

//         .am-workflow-container {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 2rem;
//           position: relative;
//         }

//         .am-workflow-step {
//           display: flex;
//           gap: 1.5rem;
//           align-items: flex-start;
//         }

//         .am-step-indicator {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 1rem;
//         }

//         .am-step-number {
//           width: 50px;
//           height: 50px;
//           background: linear-gradient(135deg, rgb(80, 100, 200) 0%, rgb(161, 180, 242) 100%);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-weight: 700;
//           font-size: 1.125rem;
//         }

//         .am-step-connector {
//           flex: 1;
//           width: 2px;
//           background: linear-gradient(180deg, rgba(161, 180, 242, 0.4) 0%, transparent 100%);
//         }

//         .am-workflow-step:last-child .am-step-connector {
//           display: none;
//         }

//         .am-step-content {
//           flex: 1;
//           padding-bottom: 2rem;
//         }

//         .am-step-icon {
//           width: 50px;
//           height: 50px;
//           background: rgba(161, 180, 242, 0.1);
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: rgb(80, 100, 200);
//           margin-bottom: 1rem;
//         }

//         .am-workflow-icon {
//           width: 1.5rem;
//           height: 1.5rem;
//         }

//         .am-step-title {
//           font-size: 1.125rem;
//           font-weight: 600;
//           color: #1a202c;
//           margin: 0 0 0.5rem;
//         }

//         .am-step-description {
//           color: #718096;
//           font-size: 0.875rem;
//           margin: 0 0 1rem;
//           line-height: 1.5;
//         }

//         .am-step-time {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           color: #a0aec0;
//           font-size: 0.75rem;
//         }

//         .am-time-icon {
//           width: 0.75rem;
//           height: 0.75rem;
//         }

//         /* Integration Section */
//         .am-integration-section {
//           padding: 6rem 1.5rem;
//           background: rgba(255, 255, 255, 0.5);
//           margin: 4rem 0;
//         }

//         .am-integration-content {
//           max-width: 1200px;
//           margin: 0 auto;
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 4rem;
//           align-items: center;
//         }

//         .am-integration-title {
//           font-size: 2.25rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 1.5rem;
//           line-height: 1.2;
//         }

//         .am-integration-description {
//           font-size: 1.125rem;
//           color: #718096;
//           margin-bottom: 2rem;
//           line-height: 1.6;
//         }

//         .am-integration-features {
//           display: flex;
//           flex-direction: column;
//           gap: 1rem;
//         }

//         .am-integration-feature {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           color: #4a5568;
//           font-weight: 500;
//         }

//         .am-integration-icon {
//           width: 1.25rem;
//           height: 1.25rem;
//           color: rgb(80, 100, 200);
//         }

//         .am-platform-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 1.5rem;
//         }

//         .am-platform-item {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1.5rem 1rem;
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(161, 180, 242, 0.3);
//           border-radius: 12px;
//           transition: all 0.3s ease;
//         }

//         .am-platform-item:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(161, 180, 242, 0.2);
//         }

//         .am-platform-icon {
//           width: 40px;
//           height: 40px;
//           background: linear-gradient(135deg, rgba(161, 180, 242, 0.2) 0%, rgba(195, 217, 251, 0.3) 100%);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: rgb(80, 100, 200);
//           font-weight: 700;
//         }

//         .am-platform-item span {
//           font-size: 0.875rem;
//           font-weight: 600;
//           color: #4a5568;
//         }

//         /* CTA Section */
//         .am-cta-section {
//           padding: 6rem 1.5rem;
//           max-width: 800px;
//           margin: 0 auto;
//           text-align: center;
//         }

//         .am-cta-content {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(161, 180, 242, 0.4);
//           border-radius: 24px;
//           padding: 4rem 3rem;
//           backdrop-filter: blur(10px);
//           box-shadow: 0 20px 40px rgba(161, 180, 242, 0.15);
//         }

//         .am-cta-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(161, 180, 242, 0.15);
//           border: 1px solid rgba(161, 180, 242, 0.4);
//           border-radius: 50px;
//           color: rgb(80, 100, 200);
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//         }

//         .am-cta-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .am-cta-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 1.5rem;
//           line-height: 1.2;
//         }

//         .am-cta-description {
//           font-size: 1.125rem;
//           color: #718096;
//           margin-bottom: 2.5rem;
//           line-height: 1.6;
//         }

//         .am-cta-actions {
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           margin-bottom: 2rem;
//         }

//         .am-btn-large {
//           padding: 1.25rem 2.5rem;
//           font-size: 1.125rem;
//         }

//         .am-cta-features {
//           display: flex;
//           gap: 2rem;
//           justify-content: center;
//           flex-wrap: wrap;
//         }

//         .am-cta-feature {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           color: #718096;
//           font-size: 0.875rem;
//         }

//         .am-cta-check {
//           width: 1rem;
//           height: 1rem;
//           color: #48bb78;
//         }

//         /* Responsive Design */
//         @media (max-width: 1024px) {
//           .am-hero-title {
//             font-size: 3rem;
//           }

//           .am-integration-content {
//             grid-template-columns: 1fr;
//             gap: 3rem;
//           }
//         }

//         @media (max-width: 768px) {
//           .am-hero-section {
//             padding: 4rem 1rem 3rem;
//           }

//           .am-hero-title {
//             font-size: 2.5rem;
//           }

//           .am-hero-description {
//             font-size: 1.125rem;
//           }

//           .am-hero-benefits {
//             grid-template-columns: 1fr;
//           }

//           .am-hero-actions {
//             flex-direction: column;
//             align-items: center;
//           }

//           .am-btn {
//             width: 100%;
//             max-width: 280px;
//             justify-content: center;
//           }

//           .am-stats-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }

//           .am-features-grid {
//             grid-template-columns: 1fr;
//           }

//           .am-workflow-container {
//             grid-template-columns: 1fr;
//           }

//           .am-workflow-step {
//             gap: 1rem;
//           }

//           .am-cta-content {
//             padding: 3rem 2rem;
//           }

//           .am-cta-title {
//             font-size: 2rem;
//           }

//           .am-cta-actions {
//             flex-direction: column;
//           }

//           .am-cta-features {
//             flex-direction: column;
//             gap: 1rem;
//           }
//         }

//         @media (max-width: 640px) {
//           .am-hero-title {
//             font-size: 2rem;
//           }

//           .am-stats-grid {
//             grid-template-columns: 1fr;
//           }

//           .am-section-title {
//             font-size: 2rem;
//           }

//           .am-platform-grid {
//             grid-template-columns: repeat(2, 1fr);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }




import React from 'react';
import { 
  Rocket, Calendar, BarChart3, Plug, Users, 
  Play, CheckCircle, RefreshCw, Shield, Settings, 
  Lightbulb, Clock, ChartBar, MessageSquare, Star,
  Search, Zap, ChevronRight, Bot, Target,
  ShoppingBag, Instagram, Youtube, Zap as Bolt,
  Facebook, Twitter
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function AutomationMarketing() {
  const stats = [
    { value: "42", label: "Active Campaigns", icon: <Rocket size={24} /> },
    { value: "350+", label: "Influencers Onboarded", icon: <Users size={24} /> },
    { value: "1.2M", label: "Automated Impressions", icon: <ChartBar size={24} /> },
    { value: "87%", label: "Workflow Efficiency", icon: <RefreshCw size={24} /> }
  ];

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <Calendar size={24} />,
      title: "Campaign Scheduling",
      description: "Schedule campaigns with automated triggers and smart reminders to maximize engagement across all time zones.",
      benefits: [
        "Smart timezone optimization",
        "Automated reminder system",
        "Flexible scheduling options"
      ]
    },
    {
      icon: <Bot size={24} />,
      title: "AI-Powered Workflows",
      description: "Automate repetitive tasks like approvals, reporting, and influencer follow-ups with intelligent automation.",
      benefits: [
        "Smart task automation",
        "AI-driven approvals",
        "Automated follow-ups"
      ]
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Smart Analytics",
      description: "Get real-time insights into campaign performance with predictive analytics and performance forecasting.",
      benefits: [
        "Real-time dashboards",
        "Predictive analytics",
        "Performance insights"
      ]
    },
    {
      icon: <Plug size={24} />,
      title: "Seamless Integrations",
      description: "Connect with Shopify, Instagram, YouTube, and more for smooth automation across platforms.",
      benefits: [
        "50+ platform integrations",
        "API connectivity",
        "Custom webhooks"
      ]
    },
    {
      icon: <Search size={24} />,
      title: "Influencer Discovery",
      description: "Find the right influencers for your brand using AI-powered search, audience insights, and engagement metrics.",
      benefits: [
        "Advanced influencer filters",
        "Authenticity verification",
        "Engagement rate analytics"
      ]
    },
    {
      icon: <Zap size={24} />,
      title: "Performance Optimization",
      description: "Boost campaign results with AI that adapts strategies in real time for better reach and ROI.",
      benefits: [
        "Adaptive performance tuning",
        "AI-based content adjustments",
        "ROI-driven insights"
      ]
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      icon: <MessageSquare size={24} />,
      title: "Campaign Creation",
      description: "Set up your campaign goals and parameters",
      time: "2 minutes"
    },
    {
      step: 2,
      icon: <Users size={24} />,
      title: "Influencer Matching",
      description: "AI matches perfect influencers for your brand",
      time: "Instant"
    },
    {
      step: 3,
      icon: <Clock size={24} />,
      title: "Content Scheduling",
      description: "Automatically schedule posts for optimal times",
      time: "Auto-scheduled"
    },
    {
      step: 4,
      icon: <ChartBar size={24} />,
      title: "Performance Reporting",
      description: "Get comprehensive analytics and insights",
      time: "Real-time"
    }
  ];

  const benefits = [
    { icon: <Clock size={20} />, text: "Save 15+ hours weekly" },
    { icon: <BarChart3 size={20} />, text: "Increase ROI by 40%" },
    { icon: <Users size={20} />, text: "Scale to 1000+ influencers" },
    { icon: <Shield size={20} />, text: "Enterprise-grade security" }
  ];

  const platforms = [
    { name: 'Shopify', icon: <ShoppingBag size={24} /> },
    { name: 'Instagram', icon: <Instagram size={24} /> },
    { name: 'YouTube', icon: <Youtube size={24} /> },
    { name: 'TikTok', icon: <Bolt size={24} /> },
    { name: 'Facebook', icon: <Facebook size={24} /> },
    { name: 'Twitter', icon: <Twitter size={24} /> }
  ];

  return (
    <div className="auto-wrapper">
      {/* Hero Section */}
      <section className="auto-hero">
        <div className="auto-hero-content">
          <div className="auto-hero-badge">
            <Bot size={16} />
            <span>AI-Powered Automation</span>
          </div>
          
          <h1 className="auto-hero-title">
            Marketing Automation
            <span className="auto-hero-accent"> Platform</span>
          </h1>
          
          <p className="auto-hero-subtitle">
            Streamline campaigns, automate influencer collaborations, and scale your marketing 
            efforts with intelligent AI-powered workflows that save time and boost performance.
          </p>
          
          <div className="auto-hero-benefits">
            {benefits.map((benefit, index) => (
              <div key={index} className="auto-benefit-item">
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="auto-hero-actions">
            <button className="auto-btn auto-btn-primary"  onClick={goToLogin}>
              <Rocket size={18} />
              <span>Start Free Trial</span>
            </button>
            <button className="auto-btn auto-btn-secondary"  onClick={() => navigate("/demo")}>
              <Play size={18} />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="auto-main">
        <div className="auto-container">
          {/* Stats Section */}
          <section className="auto-stats-section">
            <div className="auto-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="auto-stat-card">
                  <div className="auto-stat-icon">
                    {stat.icon}
                  </div>
                  <div className="auto-stat-content">
                    <div className="auto-stat-value">{stat.value}</div>
                    <div className="auto-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="auto-layout">
            {/* Main Content Area */}
            <main className="auto-content">
              {/* Features Section */}
              <section className="auto-section">
                <div className="auto-section-header">
                  <h2 className="auto-section-title">Powerful Automation Features</h2>
                  <p className="auto-section-subtitle">
                    Everything you need to automate and scale your influencer marketing campaigns
                  </p>
                </div>
                
                <div className="auto-features-grid">
                  {features.map((feature, index) => (
                    <div key={index} className="auto-feature-card">
                      <div className="auto-feature-icon">
                        {feature.icon}
                      </div>
                      <div className="auto-feature-content">
                        <h3 className="auto-feature-title">{feature.title}</h3>
                        <p className="auto-feature-description">{feature.description}</p>
                        <div className="auto-feature-benefits">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className="auto-benefit">
                              <CheckCircle size={16} />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Workflow Section */}
              <section className="auto-section">
                <div className="auto-section-header">
                  <h2 className="auto-section-title">Automated Workflow Process</h2>
                  <p className="auto-section-subtitle">
                    From campaign creation to performance analysis - completely automated
                  </p>
                </div>
                
                <div className="auto-workflow">
                  {workflowSteps.map((step, index) => (
                    <div key={index} className="auto-workflow-step">
                      <div className="auto-step-number">{step.step}</div>
                      <div className="auto-step-content">
                        <div className="auto-step-icon">
                          {step.icon}
                        </div>
                        <div className="auto-step-details">
                          <h3 className="auto-step-title">{step.title}</h3>
                          <p className="auto-step-description">{step.description}</p>
                          <div className="auto-step-time">
                            <Clock size={14} />
                            <span>{step.time}</span>
                          </div>
                        </div>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div className="auto-step-arrow">
                          <ChevronRight size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="auto-cta-section">
                <div className="auto-cta-card">
                  <div className="auto-cta-badge">
                    <Rocket size={16} />
                    <span>Start Automating Today</span>
                  </div>
                  
                  <h2 className="auto-cta-title">Ready to Transform Your Marketing?</h2>
                  
                  <p className="auto-cta-description">
                    Join 2,500+ brands that save time, reduce costs, and amplify their reach 
                    with automated influencer marketing workflows.
                  </p>
                  
                  <div className="auto-cta-actions">
                    <button className="auto-btn auto-btn-primary auto-btn-lg"  onClick={goToLogin}>
                      <Rocket size={18} />
                      <span>Start Free Trial</span>
                    </button>
                    <button className="auto-btn-lg"  onClick={() => navigate("/demo")}>
                      <Star size={18} />
                      <span>Schedule Demo</span>
                    </button>
                  </div>
                  
                  <div className="auto-cta-features">
                    <div className="auto-cta-feature">
                      <CheckCircle size={16} />
                      <span>No credit card required</span>
                    </div>
                    <div className="auto-cta-feature">
                      <CheckCircle size={16} />
                      <span>14-day free trial</span>
                    </div>
                    <div className="auto-cta-feature">
                      <CheckCircle size={16} />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            {/* Sidebar */}
            <aside className="auto-sidebar">
              {/* Integrations Section */}
              <div className="auto-sidebar-section">
                <div className="auto-integration-card">
                  <div className="auto-integration-header">
                    <h3 className="auto-integration-title">Connect Your Entire Marketing Stack</h3>
                    <p className="auto-integration-subtitle">
                      Seamlessly integrate with your favorite tools and platforms
                    </p>
                  </div>
                  
                  <div className="auto-integration-platforms">
                    {platforms.map((platform, index) => (
                      <div key={index} className="auto-platform-item">
                        <div className="auto-platform-icon">
                          {platform.icon}
                        </div>
                        <span className="auto-platform-name">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="auto-integration-features">
                    <div className="auto-integration-feature">
                      <Settings size={16} />
                      <span>Custom API Integrations</span>
                    </div>
                    <div className="auto-integration-feature">
                      <Lightbulb size={16} />
                      <span>Smart Data Sync</span>
                    </div>
                    <div className="auto-integration-feature">
                      <Shield size={16} />
                      <span>Secure Connections</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Sidebar */}
              <div className="auto-sidebar-section">
                <h3 className="auto-sidebar-title">Key Benefits</h3>
                <div className="auto-sidebar-benefits">
                  <div className="auto-sidebar-benefit">
                    <Target size={16} />
                    <div>
                      <h4>Increased Efficiency</h4>
                      <p>Automate 80% of manual tasks</p>
                    </div>
                  </div>
                  <div className="auto-sidebar-benefit">
                    <BarChart3 size={16} />
                    <div>
                      <h4>Better ROI</h4>
                      <p>Average 40% improvement</p>
                    </div>
                  </div>
                  <div className="auto-sidebar-benefit">
                    <Users size={16} />
                    <div>
                      <h4>Scalable Campaigns</h4>
                      <p>Manage 1000+ influencers</p>
                    </div>
                  </div>
                  <div className="auto-sidebar-benefit">
                    <Zap size={16} />
                    <div>
                      <h4>Real-time Analytics</h4>
                      <p>Instant performance insights</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="auto-sidebar-section">
                <h3 className="auto-sidebar-title">Quick Actions</h3>
                <div className="auto-quick-actions">
                  <button className="auto-quick-action" onClick={goToLogin}>
                    <Rocket size={16} />
                    <span>Launch Campaign</span>
                  </button>
                  <button className="auto-quick-action" onClick={goToLogin}>
                    <BarChart3 size={16} />
                    <span>View Analytics</span>
                  </button>
                  <button className="auto-quick-action" onClick={goToLogin}>
                    <Settings size={16} />
                    <span>Configure Automations</span>
                  </button>
                  <button className="auto-quick-action" onClick={goToLogin}>
                    <Users size={16} />
                    <span>Browse Influencers</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .auto-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        
        /* Hero Section */
        .auto-hero { background: linear-gradient(135deg, #5DADE2 0%, #3b82f6 100%); padding: 80px 20px 60px; text-align: center; }
        .auto-hero-content { max-width: 900px; margin: 0 auto; }
        
        .auto-hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; color: white; font-size: 14px; font-weight: 600; margin-bottom: 32px; }
        
        .auto-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 20px; line-height: 1.2; }
        .auto-hero-accent { color: rgba(255,255,255,0.9); }
        .auto-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.9); max-width: 700px; margin: 0 auto 40px; line-height: 1.6; }
        
        .auto-hero-benefits { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px; margin: 0 auto 40px; }
        .auto-benefit-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-size: 14px; font-weight: 500; }
        .auto-benefit-item svg { opacity: 0.9; }
        
        .auto-hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        
        /* Buttons */
        .auto-btn { padding: 14px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; border: none; }
        .auto-btn-primary { background: white; color: #3B82F6; }
        .auto-btn-primary:hover { background: rgba(255,255,255,0.9); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,255,255,0.3); }
        .auto-btn-secondary {  background: #3b83f6ce; border: 2px solid #3B82F6; }
        .auto-btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); transform: translateY(-2px); }
        .auto-btn-lg { padding: 16px 32px; font-size: 16px; background: #0f6eeaff; }
        
        /* Main Content */
        .auto-main { padding: 40px 0; }
        .auto-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        
        /* Stats Section */
        .auto-stats-section { margin-bottom: 40px; }
        .auto-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .auto-stat-card { background: white; border-radius: 12px; padding: 24px; display: flex; gap: 16px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .auto-stat-icon { width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .auto-stat-content { flex: 1; }
        .auto-stat-value { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .auto-stat-label { font-size: 14px; color: #64748b; font-weight: 600; }
        
        /* Layout */
        .auto-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; }
        
        /* Content Area */
        .auto-content { display: flex; flex-direction: column; gap: 40px; }
        
        /* Section Styling */
        .auto-section { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .auto-section-header { text-align: center; margin-bottom: 32px; }
        .auto-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        .auto-section-subtitle { font-size: 15px; color: #64748b; max-width: 700px; margin: 0 auto; }
        
        /* Features Grid */
        .auto-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .auto-feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; gap: 20px; transition: 0.3s; }
        .auto-feature-card:hover { border-color: #3B82F6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .auto-feature-icon { width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; flex-shrink: 0; }
        .auto-feature-content { flex: 1; }
        .auto-feature-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .auto-feature-description { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }
        .auto-feature-benefits { display: flex; flex-direction: column; gap: 8px; }
        .auto-benefit { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
        .auto-benefit svg { color: #10B981; }
        
        /* Workflow */
        .auto-workflow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .auto-workflow-step { display: flex; align-items: center; gap: 12px; position: relative; }
        .auto-step-number { width: 40px; height: 40px; background: #3B82F6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; z-index: 1; }
        .auto-step-content { flex: 1; text-align: center; }
        .auto-step-icon { width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; margin: 0 auto 12px; }
        .auto-step-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .auto-step-description { font-size: 13px; color: #64748b; margin-bottom: 8px; }
        .auto-step-time { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 12px; color: #94a3b8; }
        .auto-step-arrow { color: #cbd5e1; }
        
        /* CTA Section */
        .auto-cta-section { margin-top: 20px; }
        .auto-cta-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 16px; padding: 40px; text-align: center; }
        .auto-cta-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; color: #3B82F6; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .auto-cta-title { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .auto-cta-description { font-size: 16px; color: #475569; max-width: 700px; margin: 0 auto 32px; line-height: 1.6; }
        .auto-cta-actions { display: flex; gap: 16px; justify-content: center; margin-bottom: 32px; }
        .auto-cta-features { display: flex; gap: 24px; justify-content: center; }
        .auto-cta-feature { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; }
        .auto-cta-feature svg { color: #10B981; }
        
        /* Sidebar */
        .auto-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
        
        /* Sidebar Sections */
        .auto-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        
        /* Integration Card */
        .auto-integration-card { }
        .auto-integration-header { margin-bottom: 24px; }
        .auto-integration-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .auto-integration-subtitle { font-size: 14px; color: #64748b; }
        
        .auto-integration-platforms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .auto-platform-item { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; background: #f8fafc; border-radius: 8px; transition: 0.2s; }
        .auto-platform-item:hover { background: #e2e8f0; }
        .auto-platform-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .auto-platform-name { font-size: 13px; font-weight: 600; color: #475569; }
        
        .auto-integration-features { display: flex; flex-direction: column; gap: 12px; }
        .auto-integration-feature { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569; }
        
        /* Benefits Sidebar */
        .auto-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .auto-sidebar-benefits { display: flex; flex-direction: column; gap: 16px; }
        .auto-sidebar-benefit { display: flex; gap: 12px; }
        .auto-sidebar-benefit svg { color: #3B82F6; margin-top: 4px; }
        .auto-sidebar-benefit h4 { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
        .auto-sidebar-benefit p { font-size: 13px; color: #64748b; }
        
        /* Quick Actions */
        .auto-quick-actions { display: flex; flex-direction: column; gap: 8px; }
        .auto-quick-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .auto-quick-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .auto-layout { grid-template-columns: 1fr; }
          .auto-sidebar { position: relative; }
          .auto-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .auto-features-grid { grid-template-columns: 1fr; }
          .auto-workflow { grid-template-columns: repeat(2, 1fr); }
          .auto-step-arrow { display: none; }
        }
        
        @media (max-width: 768px) {
          .auto-hero-title { font-size: 32px; }
          .auto-hero-subtitle { font-size: 16px; }
          .auto-hero-benefits { grid-template-columns: 1fr; }
          .auto-hero-actions { flex-direction: column; align-items: center; }
          .auto-btn { width: 100%; max-width: 280px; justify-content: center; }
          .auto-stats-grid { grid-template-columns: 1fr; }
          .auto-section { padding: 24px; }
          .auto-workflow { grid-template-columns: 1fr; }
          .auto-cta-actions { flex-direction: column; }
          .auto-cta-features { flex-direction: column; gap: 12px; }
          .auto-integration-platforms { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (max-width: 640px) {
          .auto-hero { padding: 60px 20px 40px; }
          .auto-section-title { font-size: 20px; }
          .auto-cta-card { padding: 32px 24px; }
          .auto-cta-title { font-size: 24px; }
          .auto-integration-platforms { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}