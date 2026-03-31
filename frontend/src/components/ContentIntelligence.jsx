// import React from "react";
// import { Brain, TrendingUp, Lightbulb, Target, Clock, Hash, Video, BarChart3, Users, Zap, AlertCircle, Award, Shield } from "lucide-react";

// export default function ContentIntelligence() {
//   const stats = [
//     { value: "95%", label: "Prediction Accuracy", icon: <Award className="w-6 h-6" /> },
//     { value: "120K+", label: "Analyzed Posts", icon: <BarChart3 className="w-6 h-6" /> },
//     { value: "48%", label: "Engagement Boost", icon: <TrendingUp className="w-6 h-6" /> },
//     { value: "30+", label: "Trend Categories", icon: <Hash className="w-6 h-6" /> }
//   ];

// const features = [
//   {
//     icon: <TrendingUp className="w-8 h-8" />,
//     title: "Trend Forecasting",
//     description: "Anticipate content trends with predictive analytics and AI-powered forecasting models.",
//     highlights: ["Real-time trend detection", "Industry benchmarking", "Viral content prediction"]
//   },
//   {
//     icon: <Lightbulb className="w-8 h-8" />,
//     title: "Smart Recommendations",
//     description: "Receive AI-driven suggestions for post timing, hashtags, and content type optimization.",
//     highlights: ["Optimal posting schedule", "Hashtag performance analysis", "Content format suggestions"]
//   },
//   {
//     icon: <Target className="w-8 h-8" />,
//     title: "Audience Targeting",
//     description: "Identify the right audience segments and boost conversions with tailored content strategies.",
//     highlights: ["Demographic insights", "Behavior analysis", "Conversion optimization"]
//   },
//   {
//     icon: <Brain className="w-8 h-8" />,
//     title: "Content Insights",
//     description: "Analyze sentiment, style, and format performance to improve future campaigns.",
//     highlights: ["Sentiment analysis", "Style recommendations", "Performance metrics"]
//   },
//   {
//     icon: <Zap className="w-8 h-8" />,
//     title: "Automated Campaigns",
//     description: "Let AI handle repetitive campaign tasks — from influencer selection to post scheduling — automatically.",
//     highlights: [
//       "Auto influencer selection",
//       "Smart scheduling",
//       "Performance-based adjustments"
//     ]
//   },
//   {
//     icon: <Shield className="w-8 h-8" />,
//     title: "Brand Safety & Compliance",
//     description: "Ensure every collaboration meets brand and legal guidelines with AI-driven monitoring and alerts.",
//     highlights: [
//       "Content moderation",
//       "AI compliance checks",
//       "Reputation monitoring"
//     ]
//   }
// ];


//   const suggestions = [
//     {
//       icon: <Clock className="w-6 h-6" />,
//       title: "Best Time to Post",
//       value: "Thursday 6 PM",
//       insight: "30% more engagement",
//       color: "blue"
//     },
//     {
//       icon: <Hash className="w-6 h-6" />,
//       title: "Trending Hashtags",
//       value: "#AIContent #SmartMarketing",
//       insight: "Top performing this week",
//       color: "purple"
//     },
//     {
//       icon: <Video className="w-6 h-6" />,
//       title: "Recommended Format",
//       value: "Short-form video",
//       insight: "Reels/TikTok preferred",
//       color: "green"
//     }
//   ];

//   const benefits = [
//     {
//       icon: <Zap className="w-5 h-5" />,
//       text: "Real-time content analysis"
//     },
//     {
//       icon: <Users className="w-5 h-5" />,
//       text: "Audience behavior tracking"
//     },
//     {
//       icon: <BarChart3 className="w-5 h-5" />,
//       text: "Performance benchmarking"
//     },
//     {
//       icon: <AlertCircle className="w-5 h-5" />,
//       text: "Instant trend alerts"
//     }
//   ];

//   return (
//     <div className="ci-wrapper">
//       {/* Background Elements */}
//       <div className="ci-bg-elements">
//         <div className="ci-bg-orb ci-orb-1"></div>
//         <div className="ci-bg-orb ci-orb-2"></div>
//         <div className="ci-bg-orb ci-orb-3"></div>
//       </div>

//       <div className="ci-container">
//         {/* Header Section */}
//         <section className="ci-hero-section">
//           <div className="ci-hero-badge">
//             <Brain className="ci-badge-icon" />
//             <span>AI-Powered Intelligence</span>
//           </div>
//           <h1 className="ci-hero-title">
//             Content Intelligence Platform
//           </h1>
//           <p className="ci-hero-subtitle">
//             Transform your content strategy with AI-powered insights that predict trends, 
//             optimize engagement, and maximize ROI across all digital channels.
//           </p>
//           <div className="ci-benefits-grid">
//             {benefits.map((benefit, index) => (
//               <div key={index} className="ci-benefit-item">
//                 <div className="ci-benefit-icon">{benefit.icon}</div>
//                 <span className="ci-benefit-text">{benefit.text}</span>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Performance Metrics */}
//         <section className="ci-metrics-section">
//           <div className="ci-metrics-grid">
//             {stats.map((stat, index) => (
//               <div key={index} className="ci-metric-card">
//                 <div className="ci-metric-icon-container">
//                   <div className="ci-metric-icon">{stat.icon}</div>
//                 </div>
//                 <div className="ci-metric-content">
//                   <h3 className="ci-metric-value">{stat.value}</h3>
//                   <p className="ci-metric-label">{stat.label}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Core Features */}
//         <section className="ci-features-section">
//           <div className="ci-section-header">
//             <h2 className="ci-section-title">Advanced AI Capabilities</h2>
//             <p className="ci-section-description">
//               Leverage cutting-edge machine learning to optimize your content strategy
//             </p>
//           </div>
          
//           <div className="ci-features-grid">
//             {features.map((feature, index) => (
//               <div key={index} className="ci-feature-card">
//                 <div className="ci-feature-header">
//                   <div className="ci-feature-icon-wrapper">
//                     <div className="ci-feature-icon-bg"></div>
//                     <div className="ci-feature-icon">{feature.icon}</div>
//                   </div>
//                   <h3 className="ci-feature-title">{feature.title}</h3>
//                 </div>
//                 <p className="ci-feature-description">{feature.description}</p>
//                 <ul className="ci-feature-list">
//                   {feature.highlights.map((highlight, idx) => (
//                     <li key={idx} className="ci-feature-list-item">
//                       <div className="ci-list-marker"></div>
//                       <span>{highlight}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* AI Recommendations */}
//         <section className="ci-recommendations-section">
//           <div className="ci-section-header">
//             <h2 className="ci-section-title">Smart Recommendations</h2>
//             <p className="ci-section-description">
//               Real-time AI suggestions to enhance your content performance
//             </p>
//           </div>
          
//           <div className="ci-recommendations-grid">
//             {suggestions.map((suggestion, index) => (
//               <div key={index} className={`ci-recommendation-card ci-recommendation-${suggestion.color}`}>
//                 <div className="ci-recommendation-header">
//                   <div className="ci-recommendation-icon">{suggestion.icon}</div>
//                   <h4 className="ci-recommendation-category">{suggestion.title}</h4>
//                 </div>
//                 <p className="ci-recommendation-value">{suggestion.value}</p>
//                 <div className="ci-recommendation-insight">
//                   <TrendingUp className="ci-insight-icon" />
//                   <span className="ci-insight-text">{suggestion.insight}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="ci-cta-section">
//           <div className="ci-cta-content">
//             <div className="ci-cta-badge">
//               <Zap className="ci-cta-badge-icon" />
//               <span>Start Free Trial</span>
//             </div>
//             <h2 className="ci-cta-title">Elevate Your Content Strategy</h2>
//             <p className="ci-cta-description">
//               Join industry leaders using AI to create viral content, stay ahead of trends, 
//               and make data-driven decisions that drive real results.
//             </p>
//             <div className="ci-cta-actions">
//               <button className="ci-btn ci-btn-primary">
//                 <span>Start Free Trial</span>
//                 <span className="ci-btn-arrow">→</span>
//               </button>
//               <button className="ci-btn ci-btn-secondary">
//                 <span>View Demo</span>
//               </button>
//             </div>
//             <p className="ci-cta-note">No credit card required • 14-day free trial • Cancel anytime</p>
//           </div>
//         </section>
//       </div>

//       <style jsx>{`
//         .ci-wrapper {
//           min-height: 100vh;
//           background: rgb(230, 236, 252);
//           position: relative;
//           overflow-x: hidden;
//         }

//         .ci-bg-elements {
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           pointer-events: none;
//           overflow: hidden;
//         }

//         .ci-bg-orb {
//           position: absolute;
//           border-radius: 50%;
//           filter: blur(80px);
//           opacity: 0.4;
//         }



//         .ci-container {
//           max-width: 1200px;
//           margin: 0 auto;
//           padding: 5rem 1.5rem;
//           position: relative;
//           z-index: 1;
//         }

//         /* Hero Section */
//         .ci-hero-section {
//           text-align: center;
//           margin-bottom: 6rem;
//         }

//         .ci-hero-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(102, 126, 234, 0.1);
//           border: 1px solid rgba(102, 126, 234, 0.3);
//           border-radius: 50px;
//           color: #667eea;
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//           backdrop-filter: blur(10px);
//         }

//         .ci-badge-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .ci-hero-title {
//           font-size: 3.5rem;
//           font-weight: 800;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//           margin-bottom: 1.5rem;
//           line-height: 1.1;
//           letter-spacing: -0.02em;
//         }

//         .ci-hero-subtitle {
//           font-size: 1.25rem;
//           color: #64748b;
//           max-width: 700px;
//           margin: 0 auto 3rem;
//           line-height: 1.6;
//         }

//         .ci-benefits-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 1.5rem;
//           max-width: 800px;
//           margin: 0 auto;
//         }

//         .ci-benefit-item {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           padding: 1rem 1.5rem;
//           background: rgba(255, 255, 255, 0.8);
//           border: 1px solid rgba(226, 232, 240, 0.8);
//           border-radius: 12px;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//         }

//         .ci-benefit-item:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
//           border-color: rgba(102, 126, 234, 0.3);
//         }

//         .ci-benefit-icon {
//           color: #667eea;
//           flex-shrink: 0;
//         }

//         .ci-benefit-text {
//           font-size: 0.875rem;
//           font-weight: 500;
//           color: #374151;
//         }

//         /* Metrics Section */
//         .ci-metrics-section {
//           margin-bottom: 6rem;
//         }

//         .ci-metrics-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 2rem;
//         }

//         .ci-metric-card {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(226, 232, 240, 0.8);
//           border-radius: 16px;
//           padding: 2.5rem 2rem;
//           text-align: center;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//           position: relative;
//           overflow: hidden;
//         }

//         .ci-metric-card:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 12px 30px rgba(102, 126, 234, 0.2);
//           border-color: rgba(102, 126, 234, 0.4);
//         }

//         .ci-metric-icon-container {
//           width: 70px;
//           height: 70px;
//           background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 1.5rem;
//           color: #667eea;
//         }

//         .ci-metric-icon {
//           width: 2rem;
//           height: 2rem;
//         }

//         .ci-metric-value {
//           font-size: 2.5rem;
//           font-weight: 800;
//           color: #1f2937;
//           margin: 0 0 0.5rem;
//         }

//         .ci-metric-label {
//           font-size: 0.875rem;
//           color: #6b7280;
//           margin: 0;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//           font-weight: 600;
//         }

//         /* Features Section */
//         .ci-features-section {
//           margin-bottom: 6rem;
//         }

//         .ci-section-header {
//           text-align: center;
//           margin-bottom: 4rem;
//         }

//         .ci-section-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           color: #1f2937;
//           margin-bottom: 1rem;
//           line-height: 1.2;
//         }

//         .ci-section-description {
//           font-size: 1.125rem;
//           color: #6b7280;
//           max-width: 600px;
//           margin: 0 auto;
//           line-height: 1.6;
//         }

//         .ci-features-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 2.5rem;
//         }

//         .ci-feature-card {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(226, 232, 240, 0.8);
//           border-radius: 20px;
//           padding: 2.5rem 2rem;
//           backdrop-filter: blur(10px);
//           transition: all 0.4s ease;
//           position: relative;
//           overflow: hidden;
//         }

//         .ci-feature-card:hover {
//           transform: translateY(-6px);
//           box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
//           border-color: rgba(102, 126, 234, 0.3);
//         }

//         .ci-feature-header {
//           margin-bottom: 1.5rem;
//         }

//         .ci-feature-icon-wrapper {
//           position: relative;
//           width: 80px;
//           height: 80px;
//           margin-bottom: 1.5rem;
//         }

//         .ci-feature-icon-bg {
//           position: absolute;
//           inset: -8px;
//           background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
//           border-radius: 50%;
//           opacity: 0;
//           transition: opacity 0.4s ease;
//         }

//         .ci-feature-card:hover .ci-feature-icon-bg {
//           opacity: 1;
//         }

//         .ci-feature-icon {
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
//           border: 2px solid rgba(102, 126, 234, 0.2);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #667eea;
//           position: relative;
//           z-index: 1;
//         }

//         .ci-feature-title {
//           font-size: 1.5rem;
//           font-weight: 600;
//           color: #1f2937;
//           margin: 0;
//         }

//         .ci-feature-description {
//           color: #6b7280;
//           line-height: 1.6;
//           margin-bottom: 2rem;
//           font-size: 1rem;
//         }

//         .ci-feature-list {
//           list-style: none;
//           padding: 0;
//           margin: 0;
//         }

//         .ci-feature-list-item {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           color: #4b5563;
//           font-size: 0.875rem;
//           margin-bottom: 0.75rem;
//         }

//         .ci-list-marker {
//           width: 6px;
//           height: 6px;
//           background: #667eea;
//           border-radius: 50%;
//           flex-shrink: 0;
//         }

//         /* Recommendations Section */
//         .ci-recommendations-section {
//           margin-bottom: 6rem;
//         }

//         .ci-recommendations-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
//           gap: 2rem;
//         }

//         .ci-recommendation-card {
//           background: rgba(255, 255, 255, 0.9);
//           border: 1px solid rgba(226, 232, 240, 0.8);
//           border-radius: 16px;
//           padding: 2.5rem 2rem;
//           backdrop-filter: blur(10px);
//           transition: all 0.3s ease;
//         }

//         .ci-recommendation-card:hover {
//           transform: translateY(-4px);
//           box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
//         }

//         .ci-recommendation-blue {
//           border-left: 4px solid #3b82f6;
//         }

//         .ci-recommendation-purple {
//           border-left: 4px solid #8b5cf6;
//         }

//         .ci-recommendation-green {
//           border-left: 4px solid #10b981;
//         }

//         .ci-recommendation-header {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         .ci-recommendation-icon {
//           width: 50px;
//           height: 50px;
//           background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #667eea;
//         }

//         .ci-recommendation-category {
//           font-size: 0.875rem;
//           font-weight: 600;
//           color: #6b7280;
//           margin: 0;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }

//         .ci-recommendation-value {
//           font-size: 1.5rem;
//           font-weight: 700;
//           color: #1f2937;
//           margin: 0 0 1.5rem;
//         }

//         .ci-recommendation-insight {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1rem;
//           background: rgba(16, 185, 129, 0.1);
//           border: 1px solid rgba(16, 185, 129, 0.2);
//           border-radius: 8px;
//           color: #059669;
//           font-size: 0.875rem;
//           font-weight: 500;
//         }

//         .ci-insight-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         /* CTA Section */
//         .ci-cta-section {
//           background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
//           border: 1px solid rgba(102, 126, 234, 0.3);
//           border-radius: 24px;
//           padding: 5rem 3rem;
//           text-align: center;
//           backdrop-filter: blur(10px);
//         }

//         .ci-cta-content {
//           max-width: 600px;
//           margin: 0 auto;
//         }

//         .ci-cta-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(102, 126, 234, 0.2);
//           border: 1px solid rgba(102, 126, 234, 0.4);
//           border-radius: 50px;
//           color: #667eea;
//           font-size: 0.875rem;
//           font-weight: 600;
//           margin-bottom: 2rem;
//         }

//         .ci-cta-badge-icon {
//           width: 1rem;
//           height: 1rem;
//         }

//         .ci-cta-title {
//           font-size: 2.5rem;
//           font-weight: 700;
//           color: #1f2937;
//           margin-bottom: 1.5rem;
//           line-height: 1.2;
//         }

//         .ci-cta-description {
//           font-size: 1.125rem;
//           color: #6b7280;
//           margin-bottom: 2.5rem;
//           line-height: 1.6;
//         }

//         .ci-cta-actions {
//           display: flex;
//           gap: 1rem;
//           justify-content: center;
//           flex-wrap: wrap;
//           margin-bottom: 1.5rem;
//         }

//         .ci-btn {
//           padding: 1rem 2.5rem;
//           border-radius: 12px;
//           font-size: 1rem;
//           font-weight: 600;
//           border: none;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .ci-btn-primary {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//         }

//         .ci-btn-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
//         }

//         .ci-btn-arrow {
//           font-size: 1.25rem;
//           transition: transform 0.3s ease;
//         }

//         .ci-btn-primary:hover .ci-btn-arrow {
//           transform: translateX(4px);
//         }

//         .ci-btn-secondary {
//           background: rgba(255, 255, 255, 0.9);
//           color: #667eea;
//           border: 2px solid rgba(102, 126, 234, 0.3);
//         }

//         .ci-btn-secondary:hover {
//           background: white;
//           border-color: rgba(102, 126, 234, 0.5);
//           transform: translateY(-2px);
//         }

//         .ci-cta-note {
//           color: #9ca3af;
//           font-size: 0.875rem;
//           margin: 0;
//         }

//         /* Responsive Design */
//         @media (max-width: 1024px) {
//           .ci-hero-title {
//             font-size: 3rem;
//           }

//           .ci-section-title {
//             font-size: 2.25rem;
//           }

//           .ci-cta-title {
//             font-size: 2.25rem;
//           }
//         }

//         @media (max-width: 768px) {
//           .ci-container {
//             padding: 3rem 1.25rem;
//           }

//           .ci-hero-title {
//             font-size: 2.5rem;
//           }

//           .ci-hero-subtitle {
//             font-size: 1.125rem;
//           }

//           .ci-benefits-grid {
//             grid-template-columns: 1fr;
//             gap: 1rem;
//           }

//           .ci-metrics-grid {
//             grid-template-columns: repeat(2, 1fr);
//             gap: 1.5rem;
//           }

//           .ci-features-grid,
//           .ci-recommendations-grid {
//             grid-template-columns: 1fr;
//             gap: 2rem;
//           }

//           .ci-section-title {
//             font-size: 2rem;
//           }

//           .ci-cta-section {
//             padding: 3rem 2rem;
//           }

//           .ci-cta-title {
//             font-size: 2rem;
//           }

//           .ci-cta-actions {
//             flex-direction: column;
//             align-items: center;
//           }

//           .ci-btn {
//             width: 100%;
//             max-width: 280px;
//             justify-content: center;
//           }
//         }

//         @media (max-width: 640px) {
//           .ci-hero-title {
//             font-size: 2rem;
//           }

//           .ci-metrics-grid {
//             grid-template-columns: 1fr;
//           }

//           .ci-metric-card {
//             padding: 2rem 1.5rem;
//           }

//           .ci-feature-card {
//             padding: 2rem 1.5rem;
//           }

//           .ci-recommendation-card {
//             padding: 2rem 1.5rem;
//           }

//           .ci-cta-section {
//             padding: 2.5rem 1.5rem;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }


import React from 'react';
import { 
  Brain, TrendingUp, Lightbulb, Target, 
  Clock, Hash, Video, BarChart3, Users, 
  Zap, AlertCircle, Award, Shield, 
  ChevronRight, Play, CheckCircle,
  Sparkles, Target as TargetIcon
} from 'lucide-react';

export default function ContentIntelligence() {
  const stats = [
    { value: "95%", label: "Prediction Accuracy", icon: <Award size={24} /> },
    { value: "120K+", label: "Analyzed Posts", icon: <BarChart3 size={24} /> },
    { value: "48%", label: "Engagement Boost", icon: <TrendingUp size={24} /> },
    { value: "30+", label: "Trend Categories", icon: <Hash size={24} /> }
  ];

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: "Trend Forecasting",
      description: "Anticipate content trends with predictive analytics and AI-powered forecasting models.",
      highlights: ["Real-time trend detection", "Industry benchmarking", "Viral content prediction"],
      color: "#3B82F6"
    },
    {
      icon: <Lightbulb size={24} />,
      title: "Smart Recommendations",
      description: "Receive AI-driven suggestions for post timing, hashtags, and content type optimization.",
      highlights: ["Optimal posting schedule", "Hashtag performance analysis", "Content format suggestions"],
      color: "#10B981"
    },
    {
      icon: <Target size={24} />,
      title: "Audience Targeting",
      description: "Identify the right audience segments and boost conversions with tailored content strategies.",
      highlights: ["Demographic insights", "Behavior analysis", "Conversion optimization"],
      color: "#EF4444"
    },
    {
      icon: <Brain size={24} />,
      title: "Content Insights",
      description: "Analyze sentiment, style, and format performance to improve future campaigns.",
      highlights: ["Sentiment analysis", "Style recommendations", "Performance metrics"],
      color: "#8B5CF6"
    },
    {
      icon: <Zap size={24} />,
      title: "Automated Campaigns",
      description: "Let AI handle repetitive campaign tasks — from influencer selection to post scheduling — automatically.",
      highlights: ["Auto influencer selection", "Smart scheduling", "Performance-based adjustments"],
      color: "#F59E0B"
    },
    {
      icon: <Shield size={24} />,
      title: "Brand Safety & Compliance",
      description: "Ensure every collaboration meets brand and legal guidelines with AI-driven monitoring and alerts.",
      highlights: ["Content moderation", "AI compliance checks", "Reputation monitoring"],
      color: "#EC4899"
    }
  ];

  const suggestions = [
    {
      icon: <Clock size={20} />,
      title: "Best Time to Post",
      value: "Thursday 6 PM",
      insight: "30% more engagement",
      color: "blue"
    },
    {
      icon: <Hash size={20} />,
      title: "Trending Hashtags",
      value: "#AIContent #SmartMarketing",
      insight: "Top performing this week",
      color: "purple"
    },
    {
      icon: <Video size={20} />,
      title: "Recommended Format",
      value: "Short-form video",
      insight: "Reels/TikTok preferred",
      color: "green"
    }
  ];

  const benefits = [
    { icon: <Zap size={18} />, text: "Real-time content analysis" },
    { icon: <Users size={18} />, text: "Audience behavior tracking" },
    { icon: <BarChart3 size={18} />, text: "Performance benchmarking" },
    { icon: <AlertCircle size={18} />, text: "Instant trend alerts" }
  ];

  return (
    <div className="content-wrapper">
      {/* Hero Section */}
      <section className="content-hero">
        <div className="content-hero-content">
          <div className="content-hero-badge">
            <Brain size={16} />
            <span>AI-Powered Intelligence</span>
          </div>
          
          <h1 className="content-hero-title">
            Content Intelligence Platform
          </h1>
          
          <p className="content-hero-subtitle">
            Transform your content strategy with AI-powered insights that predict trends, 
            optimize engagement, and maximize ROI across all digital channels.
          </p>
          
          <div className="content-hero-benefits">
            {benefits.map((benefit, index) => (
              <div key={index} className="content-benefit-item">
                {benefit.icon}
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="content-main">
        <div className="content-container">
          {/* Stats Section */}
          <section className="content-stats">
            <div className="content-stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="content-stat-card">
                  <div className="content-stat-icon">
                    {stat.icon}
                  </div>
                  <div className="content-stat-content">
                    <div className="content-stat-value">{stat.value}</div>
                    <div className="content-stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="content-layout">
            {/* Main Content Area */}
            <main className="content-content">
              {/* Features Section */}
              <section className="content-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Advanced AI Capabilities</h2>
                  <p className="content-section-subtitle">
                    Leverage cutting-edge machine learning to optimize your content strategy
                  </p>
                </div>
                
                <div className="content-features-grid">
                  {features.map((feature, index) => (
                    <div key={index} className="content-feature-card">
                      <div className="content-feature-icon" style={{ color: feature.color }}>
                        {feature.icon}
                      </div>
                      <div className="content-feature-content">
                        <h3 className="content-feature-title">{feature.title}</h3>
                        <p className="content-feature-description">{feature.description}</p>
                        <div className="content-feature-highlights">
                          {feature.highlights.map((highlight, idx) => (
                            <div key={idx} className="content-highlight">
                              <CheckCircle size={14} />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommendations Section */}
              <section className="content-section">
                <div className="content-section-header">
                  <h2 className="content-section-title">Smart Recommendations</h2>
                  <p className="content-section-subtitle">
                    Real-time AI suggestions to enhance your content performance
                  </p>
                </div>
                
                <div className="content-suggestions-grid">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className={`content-suggestion-card suggestion-${suggestion.color}`}>
                      <div className="content-suggestion-header">
                        <div className="content-suggestion-icon">
                          {suggestion.icon}
                        </div>
                        <div className="content-suggestion-title">{suggestion.title}</div>
                      </div>
                      <div className="content-suggestion-value">{suggestion.value}</div>
                      <div className="content-suggestion-insight">
                        <TrendingUp size={14} />
                        <span>{suggestion.insight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>

            {/* Sidebar */}
            <aside className="content-sidebar">
              {/* Quick Insights */}
              <div className="content-sidebar-section">
                <h3 className="content-sidebar-title">Quick Insights</h3>
                <div className="content-insights">
                  <div className="content-insight">
                    <div className="content-insight-icon">
                      <TargetIcon size={16} />
                    </div>
                    <div className="content-insight-content">
                      <div className="content-insight-title">Top Performing Content</div>
                      <div className="content-insight-value">Video tutorials</div>
                    </div>
                  </div>
                  <div className="content-insight">
                    <div className="content-insight-icon">
                      <Clock size={16} />
                    </div>
                    <div className="content-insight-content">
                      <div className="content-insight-title">Peak Engagement</div>
                      <div className="content-insight-value">Weekdays 6-8 PM</div>
                    </div>
                  </div>
                  <div className="content-insight">
                    <div className="content-insight-icon">
                      <Users size={16} />
                    </div>
                    <div className="content-insight-content">
                      <div className="content-insight-title">Target Audience</div>
                      <div className="content-insight-value">25-34 age group</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="content-sidebar-section">
                <h3 className="content-sidebar-title">Trending Topics</h3>
                <div className="content-topics">
                  {['AI Content', 'Video Marketing', 'Social Commerce', 'Influencer Tips'].map((topic, index) => (
                    <div key={index} className="content-topic">
                      <div className="content-topic-tag">
                        <Sparkles size={12} />
                      </div>
                      <span>{topic}</span>
                      <div className="content-topic-growth">+24%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="content-sidebar-section">
                <h3 className="content-sidebar-title">Quick Actions</h3>
                <div className="content-actions">
                  <button className="content-action">
                    <BarChart3 size={16} />
                    <span>Run Analysis</span>
                  </button>
                  <button className="content-action">
                    <TrendingUp size={16} />
                    <span>Check Trends</span>
                  </button>
                  <button className="content-action">
                    <Lightbulb size={16} />
                    <span>Get Recommendations</span>
                  </button>
                  <button className="content-action">
                    <Zap size={16} />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* CTA Section */}
          <section className="content-cta">
            <div className="content-cta-card">
              <div className="content-cta-header">
                <div className="content-cta-badge">
                  <Zap size={16} />
                  <span>Start Free Trial</span>
                </div>
                <h2 className="content-cta-title">Elevate Your Content Strategy</h2>
                <p className="content-cta-description">
                  Join industry leaders using AI to create viral content, stay ahead of trends, 
                  and make data-driven decisions that drive real results.
                </p>
              </div>
              
              <div className="content-cta-actions">
                <button className="content-btn content-btn-primary">
                  <Zap size={18} />
                  <span>Start Free Trial</span>
                </button>
                <button className="content-btn content-btn-secondary">
                  <Play size={18} />
                  <span>View Demo</span>
                </button>
              </div>
              
              <div className="content-cta-features">
                <div className="content-cta-feature">
                  <CheckCircle size={16} />
                  <span>No credit card required</span>
                </div>
                <div className="content-cta-feature">
                  <CheckCircle size={16} />
                  <span>14-day free trial</span>
                </div>
                <div className="content-cta-feature">
                  <CheckCircle size={16} />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .content-wrapper { width: 100%; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; }
        
        /* Hero Section */
        .content-hero { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 80px 20px 60px; text-align: center; }
        .content-hero-content { max-width: 100%;  width: 100%; margin: 0 ; }
        
        .content-hero-badge { display: inline-flex; align-items:  width: 100%; center; gap: 8px; padding: 8px 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; color: white; font-size: 14px; font-weight: 600; margin-bottom: 32px; }
        
        .content-hero-title { font-size: 48px; font-weight: 700; color: white; margin-bottom: 20px; line-height: 1.2; }
        .content-hero-subtitle { font-size: 18px; color: rgba(255,255,255,0.9); max-width: 100%; margin: 0 auto 40px; line-height: 1.6; }
        
        .content-hero-benefits { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px; margin: 0 auto; }
        .content-benefit-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-size: 14px; font-weight: 500; }
        .content-benefit-item svg { opacity: 0.9; }
        
        /* Main Content */
        .content-main { padding: 40px 0;  width: 100%; }
        .content-container { max-width: 1400px;  width: 100%; margin: 0 auto; padding: 0 20px; }
        
        /* Stats Section */
        .content-stats { margin-bottom: 40px; }
        .content-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .content-stat-card { background: white; border-radius: 12px; padding: 24px; display: flex; gap: 16px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .content-stat-icon { width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .content-stat-content { flex: 1; }
        .content-stat-value { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .content-stat-label { font-size: 14px; color: #64748b; font-weight: 600; }
        
        /* Layout */
        .content-layout { display: grid; grid-template-columns: 1fr 350px; gap: 32px; margin-bottom: 40px; }
        
        /* Content Area */
        .content-content { display: flex; flex-direction: column; gap: 40px; }
        
        /* Section Styling */
        .content-section { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .content-section-header { text-align: center; margin-bottom: 32px; }
        .content-section-title { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        .content-section-subtitle { font-size: 15px; color: #64748b; max-width: 700px; margin: 0 auto; }
        
        /* Features Grid */
        .content-features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .content-feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; gap: 20px; transition: 0.3s; }
        .content-feature-card:hover { border-color: #3B82F6; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .content-feature-icon { width: 56px; height: 56px; background: rgba(59, 130, 246, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .content-feature-content { flex: 1; }
        .content-feature-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
        .content-feature-description { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 16px; }
        .content-feature-highlights { display: flex; flex-direction: column; gap: 8px; }
        .content-highlight { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
        .content-highlight svg { color: #10B981; }
        
        /* Suggestions Grid */
        .content-suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .content-suggestion-card { background: white; border-radius: 12px; padding: 24px; border-top: 4px solid; }
        .content-suggestion-card.suggestion-blue { border-color: #3B82F6; }
        .content-suggestion-card.suggestion-purple { border-color: #8B5CF6; }
        .content-suggestion-card.suggestion-green { border-color: #10B981; }
        
        .content-suggestion-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .content-suggestion-icon { width: 40px; height: 40px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .content-suggestion-title { font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .content-suggestion-value { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .content-suggestion-insight { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; color: #059669; font-size: 13px; font-weight: 600; }
        
        /* Sidebar */
        .content-sidebar { position: sticky; top: 20px; height: fit-content; display: flex; flex-direction: column; gap: 20px; }
        
        /* Sidebar Sections */
        .content-sidebar-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .content-sidebar-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        
        /* Insights */
        .content-insights { display: flex; flex-direction: column; gap: 16px; }
        .content-insight { display: flex; gap: 12px; }
        .content-insight-icon { width: 36px; height: 36px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #3B82F6; flex-shrink: 0; }
        .content-insight-content { flex: 1; }
        .content-insight-title { font-size: 13px; color: #64748b; margin-bottom: 4px; }
        .content-insight-value { font-size: 15px; font-weight: 600; color: #1e293b; }
        
        /* Topics */
        .content-topics { display: flex; flex-direction: column; gap: 12px; }
        .content-topic { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 8px; }
        .content-topic-tag { width: 24px; height: 24px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #3B82F6; }
        .content-topic span { flex: 1; font-size: 14px; color: #475569; }
        .content-topic-growth { font-size: 12px; font-weight: 600; color: #10B981; }
        
        /* Actions */
        .content-actions { display: flex; flex-direction: column; gap: 8px; }
        .content-action { padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #475569; font-size: 14px; cursor: pointer; transition: 0.2s; }
        .content-action:hover { background: #e2e8f0; border-color: #cbd5e1; color: #3B82F6; }
        
        /* CTA Section */
        .content-cta { margin-top: 20px; }
        .content-cta-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 16px; padding: 40px; text-align: center; }
        
        .content-cta-header { margin-bottom: 32px; }
        .content-cta-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 20px; color: #3B82F6; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
        .content-cta-title { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .content-cta-description { font-size: 16px; color: #475569; max-width: 700px; margin: 0 auto; line-height: 1.6; }
        
        .content-cta-actions { display: flex; gap: 16px; justify-content: center; margin-bottom: 32px; }
        
        /* Buttons */
        .content-btn { padding: 14px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; border: none; }
        .content-btn-primary { background: #3B82F6; color: white; }
        .content-btn-primary:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .content-btn-secondary { background: white; color: #3B82F6; border: 2px solid #3B82F6; }
        .content-btn-secondary:hover { background: #f0f9ff; transform: translateY(-2px); }
        
        .content-cta-features { display: flex; gap: 24px; justify-content: center; }
        .content-cta-feature { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; }
        .content-cta-feature svg { color: #10B981; }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .content-layout { grid-template-columns: 1fr; }
          .content-sidebar { position: relative; }
          .content-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .content-features-grid { grid-template-columns: 1fr; }
          .content-suggestions-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 768px) {
          .content-hero-title { font-size: 32px; }
          .content-hero-subtitle { font-size: 16px; }
          .content-hero-benefits { grid-template-columns: 1fr; }
          .content-stats-grid { grid-template-columns: 1fr; }
          .content-section { padding: 24px; }
          .content-suggestions-grid { grid-template-columns: 1fr; }
          .content-cta-actions { flex-direction: column; }
          .content-cta-features { flex-direction: column; gap: 12px; }
          .content-cta-card { padding: 32px 24px; }
          .content-cta-title { font-size: 24px; }
        }
        
        @media (max-width: 640px) {
          .content-hero { padding: 60px 20px 40px; }
          .content-section-title { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}