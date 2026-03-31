// import React, { useState, useEffect } from "react";
// import "../style/PricingSection.css";
// import HomeTopBar from "../pages/HomePage/HomeTopBar";
// import { useAuth } from "../context/AuthContext";
// import { subscriptionService } from "../services/subscriptionService";
// import { loadStripe } from "@stripe/stripe-js";

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const plans = [
//   {
//     name: "Starter",
//     type: "starter",
//     price: "$29",
//     annualPrice: "$290",
//     description: "Perfect for small businesses getting started with influencer marketing",
//     features: [
//       "Up to 100 influencer contacts",
//       "Basic AI matching",
//       "Email campaign management",
//       "Standard analytics dashboard",
//       "Email support",
//       "3 social platforms"
//     ],
//     limitations: [
//       "No custom reporting",
//       "Limited to 3 active campaigns"
//     ],
//     popular: false
//   },
//   {
//     name: "Professional",
//     type: "pro", 
//     price: "$79",
//     annualPrice: "$790",
//     description: "Ideal for growing businesses scaling their influencer programs",
//     features: [
//       "Up to 500 influencer contacts",
//       "Advanced AI matching",
//       "Multi-channel campaign management",
//       "Advanced analytics & reporting",
//       "Priority email & chat support",
//       "5 social platforms",
//       "ROI tracking",
//       "Content approval workflows"
//     ],
//     limitations: [
//       "No API access",
//       "Limited to 10 team members"
//     ],
//     popular: true
//   },
//   {
//     name: "Enterprise",
//     type: "enterprise",
//     price: "$199",
//     annualPrice: "$1990",
//     description: "For large organizations with complex influencer marketing needs",
//     features: [
//       "Unlimited influencer contacts",
//       "Premium AI matching algorithm",
//       "Custom campaign workflows",
//       "Custom reporting & analytics",
//       "24/7 dedicated support",
//       "All social platforms",
//       "Advanced ROI attribution",
//       "Team collaboration tools",
//       "API access",
//       "White-label reporting",
//       "Dedicated account manager",
//       "Onboarding training"
//     ],
//     limitations: [],
//     popular: false
//   },
// ];

// const faqs = [
//   {
//     question: "Can I change plans anytime?",
//     answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new rate will apply immediately. When downgrading, the new rate will apply at the start of your next billing cycle."
//   },
//   {
//     question: "Is there a free trial available?",
//     answer: "Yes, we offer a 15-day free trial for all new users. No credit card required to start your trial. You'll get full access to all Professional plan features during your trial period."
//   },
//   {
//     question: "What payment methods do you accept?",
//     answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for annual Enterprise plans we also accept bank transfers."
//   },
//   {
//     question: "Do you offer discounts for non-profits?",
//     answer: "Yes, we offer a 25% discount for registered non-profit organizations. Please contact our sales team with proof of your non-profit status to get this discount applied."
//   }
// ];

// const testimonials = [
//   {
//     name: "Sarah Johnson",
//     company: "Bloom Cosmetics",
//     text: "Since switching to the Professional plan, we've increased our influencer marketing ROI by 137%. The advanced analytics alone are worth the investment.",
//     avatar: "https://randomuser.me/api/portraits/women/44.jpg"
//   },
//   {
//     name: "Michael Chen",
//     company: "TechGadgets Inc.",
//     text: "The Enterprise plan has transformed how we manage influencer relationships. The custom workflows and dedicated support have saved us countless hours.",
//     avatar: "https://randomuser.me/api/portraits/men/32.jpg"
//   },
//   {
//     name: "Jessica Williams",
//     company: "FitLife Apparel",
//     text: "We started with the Starter plan and gradually upgraded as our needs grew. The scalability of QuickBox has been perfect for our expanding business.",
//     avatar: "https://randomuser.me/api/portraits/women/68.jpg"
//   }
// ];

// export default function PricingSection() {
//   const { user, isAuthenticated } = useAuth();
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [activeFAQ, setActiveFAQ] = useState(null);
//   const [activeTab, setActiveTab] = useState("pricing");
//   const [currentSubscription, setCurrentSubscription] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchCurrentSubscription();
//     }
//   }, [isAuthenticated]);

//   const fetchCurrentSubscription = async () => {
//     try {
//       const subscription = await subscriptionService.getCurrentSubscription();
//       setCurrentSubscription(subscription);
//     } catch (error) {
//       console.error("Error fetching subscription:", error);
//     }
//   };

//   const toggleBillingCycle = () => {
//     setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly");
//   };

//   const toggleFAQ = (index) => {
//     setActiveFAQ(activeFAQ === index ? null : index);
//   };

//   const handleSubscribe = async (plan) => {
//     if (!isAuthenticated) {
//       window.location.href = "/auth/login";
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       // If user is on free trial, show confirmation
//       if (currentSubscription?.type === "trial") {
//         const confirmUpgrade = window.confirm(
//           "Upgrading will immediately start your paid subscription and end your free trial. Continue?"
//         );
//         if (!confirmUpgrade) return;
//       }

//       const result = await subscriptionService.createSubscription({
//         plan: plan.type,
//         billing_cycle: billingCycle,
//         payment_method_id: "pm_card_visa" // This would come from Stripe Elements in real implementation
//       });

//       if (result.requires_action && result.client_secret) {
//         const stripe = await stripePromise;
//         const { error } = await stripe.confirmCardPayment(result.client_secret);
        
//         if (error) {
//           setError(`Payment failed: ${error.message}`);
//         } else {
//           setSuccess("Subscription created successfully!");
//           await fetchCurrentSubscription();
//         }
//       } else {
//         setSuccess("Subscription created successfully!");
//         await fetchCurrentSubscription();
//       }
//     } catch (error) {
//       setError(error.message || "Failed to create subscription");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelSubscription = async () => {
//     if (!window.confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       await subscriptionService.cancelSubscription();
//       setSuccess("Subscription canceled successfully");
//       await fetchCurrentSubscription();
//     } catch (error) {
//       setError(error.message || "Failed to cancel subscription");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateRemainingDays = (endDate) => {
//     if (!endDate) return 0;
//     const end = new Date(endDate);
//     const now = new Date();
//     const diffTime = end - now;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return Math.max(0, diffDays);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const getPlanDisplayName = (planType) => {
//     const planMap = {
//       'free': 'Free',
//       'free_trial': 'Free Trial',
//       'starter': 'Starter',
//       'pro': 'Professional',
//       'enterprise': 'Enterprise'
//     };
//     return planMap[planType] || planType;
//   };

//   return (
//     <>
//       <HomeTopBar />
//       <section className="pricing-section" id="pricing">
        
//         {/* Hero Section */}
//         <div className="pricing-hero">
//           <h1>Simple, Transparent Pricing</h1>
//           <p>Choose the plan that works best for your business scale and needs. All plans include full platform access.</p>
          
//           {isAuthenticated && (
//             <div className="subscription-tabs">
//               <button 
//                 className={`tab-button ${activeTab === "pricing" ? "active" : ""}`}
//                 onClick={() => setActiveTab("pricing")}
//               >
//                 💰 Pricing & Upgrade
//               </button>
//               <button 
//                 className={`tab-button ${activeTab === "current" ? "active" : ""}`}
//                 onClick={() => setActiveTab("current")}
//               >
//                 📊 Current Plan & Countdown
//               </button>
//             </div>
//           )}
          
//           <div className="billing-toggle">
//             <span className={billingCycle === "monthly" ? "active" : ""}>Monthly</span>
//             <label className="toggle-switch">
//               <input 
//                 type="checkbox" 
//                 checked={billingCycle === "annually"} 
//                 onChange={toggleBillingCycle} 
//               />
//               <span className="slider"></span>
//             </label>
//             <span className={billingCycle === "annually" ? "active" : ""}>
//               Annually <span className="discount-badge">Save 20%</span>
//             </span>
//           </div>
//         </div>

//         {/* Current Plan & Countdown Tab */}
//         {isAuthenticated && activeTab === "current" && (
//           <div className="current-plan-section">
//             <div className="current-plan-card">
//               <h2>Your Current Plan</h2>
              
//               {currentSubscription ? (
//                 <div className="plan-details">
//                   <div className="plan-header">
//                     <h3 className={`plan-name ${currentSubscription.type}`}>
//                       {getPlanDisplayName(currentSubscription.plan)}
//                       {currentSubscription.type === "trial" && " 🚀"}
//                       {currentSubscription.type === "paid" && " ⭐"}
//                     </h3>
//                     <div className="plan-status">
//                       <span className={`status-badge ${currentSubscription.status}`}>
//                         {currentSubscription.status}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Trial Countdown */}
//                   {currentSubscription.type === "trial" && currentSubscription.current_period_end && (
//                     <div className="trial-countdown">
//                       <div className="countdown-header">
//                         <span className="countdown-icon">⏰</span>
//                         <h4>Trial Ends In</h4>
//                       </div>
//                       <div className="countdown-days">
//                         <span className="days-number">
//                           {calculateRemainingDays(currentSubscription.current_period_end)}
//                         </span>
//                         <span className="days-label">days</span>
//                       </div>
//                       <p className="countdown-date">
//                         Your trial ends on {formatDate(currentSubscription.current_period_end)}
//                       </p>
//                       <button 
//                         className="upgrade-now-button"
//                         onClick={() => setActiveTab("pricing")}
//                       >
//                         Upgrade to Keep Features →
//                       </button>
//                     </div>
//                   )}

//                   {/* Paid Plan Details */}
//                   {currentSubscription.type === "paid" && (
//                     <div className="paid-plan-details">
//                       <div className="billing-info">
//                         <div className="info-item">
//                           <label>Billing Cycle:</label>
//                           <span>{currentSubscription.billing_cycle || "Monthly"}</span>
//                         </div>
//                         <div className="info-item">
//                           <label>Next Billing Date:</label>
//                           <span>{formatDate(currentSubscription.current_period_end)}</span>
//                         </div>
//                         <div className="info-item">
//                           <label>Subscription ID:</label>
//                           <span className="subscription-id">
//                             {currentSubscription.stripe_subscription_id || "N/A"}
//                           </span>
//                         </div>
//                       </div>
                      
//                       <button 
//                         className="cancel-subscription-button"
//                         onClick={handleCancelSubscription}
//                         disabled={loading}
//                       >
//                         {loading ? "Canceling..." : "Cancel Subscription"}
//                       </button>
//                     </div>
//                   )}

//                   {/* Free Plan */}
//                   {currentSubscription.type === "free" && (
//                     <div className="free-plan-details">
//                       <div className="free-plan-content">
//                         <p>You're currently on the Free plan with basic features.</p>
//                         <button 
//                           className="upgrade-button"
//                           onClick={() => setActiveTab("pricing")}
//                         >
//                           Upgrade for Premium Features →
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="loading-plan">Loading your plan details...</div>
//               )}

//               {/* Error and Success Messages */}
//               {error && (
//                 <div className="alert alert-error">
//                   {error}
//                 </div>
//               )}
//               {success && (
//                 <div className="alert alert-success">
//                   {success}
//                 </div>
//               )}
//             </div>

//             {/* Usage Statistics */}
//             {currentSubscription && currentSubscription.type !== "free" && (
//               <div className="usage-statistics">
//                 <h3>Usage Overview</h3>
//                 <div className="stats-grid">
//                   <div className="stat-card">
//                     <div className="stat-value">0/100</div>
//                     <div className="stat-label">Influencer Contacts</div>
//                   </div>
//                   <div className="stat-card">
//                     <div className="stat-value">0/5</div>
//                     <div className="stat-label">Active Campaigns</div>
//                   </div>
//                   <div className="stat-card">
//                     <div className="stat-value">0/3</div>
//                     <div className="stat-label">Social Platforms</div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Pricing & Upgrade Tab */}
//         {(activeTab === "pricing" || !isAuthenticated) && (
//           <>
//             {/* Pricing Cards */}
//             <div className="pricing-cards">
//               {plans.map((plan) => {
//                 const isCurrentPlan = currentSubscription?.plan === plan.type;
//                 const isUpgrade = currentSubscription && 
//                   ["free", "free_trial", "starter"].includes(currentSubscription.plan) && 
//                   ["pro", "enterprise"].includes(plan.type);
                
//                 return (
//                   <div 
//                     key={plan.name} 
//                     className={`pricing-card ${plan.popular ? "popular" : ""} ${isCurrentPlan ? "current-plan" : ""}`}
//                   >
//                     {plan.popular && <div className="popular-badge">Most Popular</div>}
//                     {isCurrentPlan && <div className="current-badge">Current Plan</div>}
                    
//                     <h3>{plan.name}</h3>
//                     <div className="price">
//                       <span className="amount">
//                         {billingCycle === "monthly" ? plan.price : plan.annualPrice}
//                       </span>
//                       <span className="period">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
//                     </div>
//                     <p className="plan-description">{plan.description}</p>
                    
//                     <ul className="features">
//                       {plan.features.map((feat, i) => (
//                         <li key={i} className="feature-item">
//                           <span className="checkmark">✓</span> {feat}
//                         </li>
//                       ))}
//                     </ul>
                    
//                     {plan.limitations.length > 0 && (
//                       <div className="limitations">
//                         <h4>Limitations</h4>
//                         <ul>
//                           {plan.limitations.map((limit, i) => (
//                             <li key={i} className="limitation-item">
//                               <span className="x-mark">✕</span> {limit}
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
                    
//                     <button 
//                       className={`select-button ${plan.popular ? "primary" : "secondary"} ${isCurrentPlan ? "current" : ""}`}
//                       onClick={() => handleSubscribe(plan)}
//                       disabled={loading || isCurrentPlan}
//                     >
//                       {loading ? "Processing..." : 
//                        isCurrentPlan ? "Current Plan" :
//                        isUpgrade ? "Upgrade Now" : 
//                        "Get Started"}
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Comparison Table */}
//             <div className="comparison-section">
//               <h2>Plan Comparison</h2>
//               <p>Detailed feature breakdown across all plans</p>
              
//               <div className="comparison-table-wrapper">
//                 <table className="comparison-table">
//                   <thead>
//                     <tr>
//                       <th>Features</th>
//                       <th>Starter</th>
//                       <th>Professional</th>
//                       <th>Enterprise</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr>
//                       <td>Influencer Contacts</td>
//                       <td>Up to 100</td>
//                       <td>Up to 500</td>
//                       <td>Unlimited</td>
//                     </tr>
//                     <tr>
//                       <td>AI Matching</td>
//                       <td>Basic</td>
//                       <td>Advanced</td>
//                       <td>Premium</td>
//                     </tr>
//                     <tr>
//                       <td>Campaign Management</td>
//                       <td>✓</td>
//                       <td>✓</td>
//                       <td>✓</td>
//                     </tr>
//                     <tr>
//                       <td>Analytics Dashboard</td>
//                       <td>Standard</td>
//                       <td>Advanced</td>
//                       <td>Custom</td>
//                     </tr>
//                     <tr>
//                       <td>Social Platforms</td>
//                       <td>3</td>
//                       <td>5</td>
//                       <td>All</td>
//                     </tr>
//                     <tr>
//                       <td>Support</td>
//                       <td>Email</td>
//                       <td>Priority</td>
//                       <td>24/7 Dedicated</td>
//                     </tr>
//                     <tr>
//                       <td>ROI Tracking</td>
//                       <td>✕</td>
//                       <td>✓</td>
//                       <td>Advanced</td>
//                     </tr>
//                     <tr>
//                       <td>Team Members</td>
//                       <td>1</td>
//                       <td>10</td>
//                       <td>Unlimited</td>
//                     </tr>
//                     <tr>
//                       <td>API Access</td>
//                       <td>✕</td>
//                       <td>✕</td>
//                       <td>✓</td>
//                     </tr>
//                     <tr>
//                       <td>Custom Workflows</td>
//                       <td>✕</td>
//                       <td>Basic</td>
//                       <td>Advanced</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Testimonials Section */}
//             <section className="qb-testimonials">
//               <h2>What Our Clients Say</h2>
//               <div className="qb-testimonial-scroll">
//                 {[...testimonials, ...testimonials].map((t, index) => (
//                   <div key={index} className="qb-testimonial-card">
//                     <div className="qb-author-avatar">
//                       <img src={t.avatar} alt={t.name} />
//                     </div>
//                     <div className="qb-testimonial-content">"{t.text}"</div>
//                     <div className="qb-testimonial-author">
//                       <strong>{t.name}</strong>
//                       <span>{t.company}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>

//             {/* FAQ Section */}
//             <div className="faq-section">
//               <h2>Frequently Asked Questions</h2>
//               <div className="faq-list">
//                 {faqs.map((faq, index) => (
//                   <div 
//                     key={index} 
//                     className={`faq-item ${activeFAQ === index ? "active" : ""}`}
//                     onClick={() => toggleFAQ(index)}
//                   >
//                     <div className="faq-question">
//                       <h4>{faq.question}</h4>
//                       <span className="faq-toggle">{activeFAQ === index ? "−" : "+"}</span>
//                     </div>
//                     <div className="faq-answer">
//                       <p>{faq.answer}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}

//         {/* Final CTA */}
//         <div className="pricing-cta">
//           <h2>Ready to Transform Your Influencer Marketing?</h2>
//           <p>Join over 5,000 brands that trust QuickBox to power their influencer partnerships</p>
//           <div className="cta-buttons">
//             <button 
//               className="cta-button primary"
//               onClick={() => !isAuthenticated ? window.location.href = "/auth/register" : setActiveTab("pricing")}
//             >
//               {isAuthenticated ? "Upgrade Plan" : "Start Free Trial"}
//             </button>
//             <button className="cta-button secondary">Schedule a Demo</button>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Flame, Crown, Gift, ChevronDown } from 'lucide-react';
import { setPageTitle } from "../components/utils/pageTitle";
import { useEffect } from "react";


function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('annually');
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
  setPageTitle(
    "Pricing – AI Influencer Marketing Platform",
    "View pricing plans for our AI influencer marketing platform. Compare Free, Starter, Pro and Enterprise plans designed for brands and creators of every size."
  );
}, []);

const prices = {
  free: { monthly: 0, annually: 0 },
  starter: { monthly: 29, annually: 299 },
  pro: { monthly: 79, annually: 799 },
  enterprise: { monthly: 199, annually: 2199 },
};

const isAnnual = billingCycle === "annually";
const suffix = isAnnual ? "/year" : "/month";

const amount = billingCycle === "annually"
  ? prices.pro.annually
  : prices.pro.monthly;



  return (
    <div className="prc-wrapper">
      {/* Header */}
      <section className="prc-header">
        <div className="prc-container">
          <h1 className="prc-title">Simple, Transparent Pricing</h1>
          <p className="prc-subtitle">
            Choose the plan that works best for your business scale and needs.<br />
            All plans include full platform access.
          </p>
          
          <div className="prc-toggle-wrap">
            <span className={`prc-label ${billingCycle === 'monthly' ? 'active' : ''}`}>Monthly</span>
            <button 
              className="prc-toggle"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
            >
              <div className={`prc-slider ${billingCycle === 'annually' ? 'active' : ''}`}></div>
            </button>
            <span className={`prc-label ${billingCycle === 'annually' ? 'active' : ''}`}>Annually</span>
            {billingCycle === 'annually' && <span className="prc-badge">Save 20%</span>}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="prc-cards">
        <div className="prc-container">
          <div className="prc-grid">
            <div className="prc-card">
              <div className="prc-card-top">
                <div className="prc-icon"><Gift size={24} /></div>
                <h3 className="prc-card-title">Free Trial</h3>
           
<div className="prc-price">
  <span className="prc-amount">Free</span>
</div>


              </div>
              <button onClick={() => navigate("/login")} className="prc-btn">Get Started</button>
              <ul className="prc-list">
                <li><Check size={16} /><span>15-day free trial</span></li>
                <li><Check size={16} /><span>1 active campaign</span></li>
                <li><Check size={16} /><span>Up to 10 influencers</span></li>
                <li><Check size={16} /><span>Basic analytics</span></li>
                <li><Check size={16} /><span>Email support</span></li>
              </ul>
            </div>

            <div className="prc-card">
              <div className="prc-card-top">
                <div className="prc-icon"><Flame size={24} /></div>
                <h3 className="prc-card-title">Starter</h3>
            
<div className="prc-price">
  <span className="prc-currency">$</span>
  <span className="prc-amount">
    {isAnnual ? prices.starter.annually : prices.starter.monthly}
  </span>
  <span className="prc-period">{suffix}</span>
</div>


              </div>
              <button onClick={() => navigate("/login")} className="prc-btn">Get Started</button>
              <ul className="prc-list">
                <li><Check size={16} /><span>5 active campaigns</span></li>
                <li><Check size={16} /><span>Up to 50 influencers</span></li>
                <li><Check size={16} /><span>Collaboration chat (10 users)</span></li>
                <li><Check size={16} /><span>2 AI tools included</span></li>
                <li><Check size={16} /><span>500 emails per month</span></li>
              </ul>
            </div>

            <div className="prc-card prc-popular">
              <div className="prc-pop-badge">Most Popular</div>
              <div className="prc-card-top">
                <div className="prc-icon"><Crown size={24} /></div>
                <h3 className="prc-card-title">Pro</h3>
             
<div className="prc-price highlight">
  <span className="prc-currency">$</span>
  <span className="prc-amount">
    {isAnnual ? prices.pro.annually : prices.pro.monthly}
  </span>
  <span className="prc-period">{suffix}</span>
</div>


              </div>
              <button onClick={() => navigate("/login")} className="prc-btn prc-btn-primary">Get Started</button>
              <ul className="prc-list">
                <li><Check size={16} /><span>20 active campaigns</span></li>
                <li><Check size={16} /><span>Up to 200 influencers</span></li>
                <li><Check size={16} /><span>4 AI tools + API access</span></li>
                <li><Check size={16} /><span>5,000 emails + 1000 SMS</span></li>
                <li><Check size={16} /><span>Advanced analytics</span></li>
              </ul>
            </div>

            <div className="prc-card">
              <div className="prc-card-top">
                <div className="prc-icon"><Star size={24} /></div>
                <h3 className="prc-card-title">Enterprise</h3>
             
<div className="prc-price">
  <span className="prc-currency">$</span>
  <span className="prc-amount">
    {isAnnual ? prices.enterprise.annually : prices.enterprise.monthly}
  </span>
  <span className="prc-period">{suffix}</span>
</div>

              </div>
              <button  onClick={() => navigate("/login")}className="prc-btn">Get Started</button>
              <ul className="prc-list">
                <li><Check size={16} /><span>Unlimited campaigns</span></li>
                <li><Check size={16} /><span>Custom algorithms</span></li>
                <li><Check size={16} /><span>Unlimited messaging</span></li>
                <li><Check size={16} /><span>24/7 support</span></li>
                <li><Check size={16} /><span>Enterprise features</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="prc-compare">
        <div className="prc-container">
          <h2 className="prc-sec-title">Plan Comparison</h2>
          <p className="prc-sec-sub">Detailed feature breakdown across all plans</p>
          
          <div className="prc-table-wrap">
            <table className="prc-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Free</th>
                  <th>Starter</th>
                  <th>Pro</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Influencer Contacts</td><td>Up to 100</td><td>Up to 500</td><td>Unlimited</td><td>Unlimited</td></tr>
                <tr><td>AI Matching</td><td>Basic</td><td>Advanced</td><td>Premium</td><td>Premium</td></tr>
                <tr><td>Campaign Management</td><td><Check size={16} /></td><td><Check size={16} /></td><td><Check size={16} /></td><td><Check size={16} /></td></tr>
                <tr><td>Analytics</td><td>Standard</td><td>Advanced</td><td>Custom</td><td>Custom</td></tr>
                <tr><td>Social Platforms</td><td>3</td><td>5</td><td>All</td><td>All</td></tr>
                <tr><td>Support</td><td>Email</td><td>Priority</td><td>24/7</td><td>24/7</td></tr>
                <tr><td>ROI Tracking</td><td><X size={16} /></td><td><Check size={16} /></td><td>Advanced</td><td>Advanced</td></tr>
                <tr><td>Team Members</td><td>1</td><td>10</td><td>Unlimited</td><td>Unlimited</td></tr>
                <tr><td>API Access</td><td><X size={16} /></td><td><X size={16} /></td><td><Check size={16} /></td><td><Check size={16} /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="prc-testi">
        <div className="prc-container">
          <h2 className="prc-sec-title">What Our Customers Say</h2>
          <div className="prc-testi-grid">
            {[
              { text: "Since switching to the Professional plan, we've increased our influencer marketing ROI by 137%. The advanced analytics alone are worth the investment.", name: "Sarah Johnson", role: "Brown Cosmetics", img: "1" },
              { text: "The Enterprise plan has transformed how we manage influencer relationships. The custom workflows and dedicated support have saved us countless hours.", name: "Michael Chen", role: "TechInsights Inc.", img: "13" },
              { text: "We started with the Starter plan and gradually upgraded as our needs grew. The scalability of the platform has been perfect for our expanding business.", name: "Jessica Williams", role: "FitLife Apparel", img: "5" }
            ].map((t, i) => (
              <div key={i} className="prc-testi-card">
                <p className="prc-testi-text">" {t.text} "</p>
                <div className="prc-author">
                  <img src={`https://i.pravatar.cc/150?img=${t.img}`} alt={t.name} />
                  <div>
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="prc-faq">
        <div className="prc-container">
          <h2 className="prc-sec-title">Frequently Asked Questions</h2>
          <div className="prc-faq-list">
            {[
              { q: "Can I change plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any payments accordingly." },
              { q: "Is there a free trial available?", a: "Yes, we offer a 15-day free trial with access to basic features. No credit card required to start your trial." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for Enterprise plans." },
              { q: "Do you offer discounts for non-profits?", a: "Yes, we offer a 30% discount for registered non-profit organizations. Contact our sales team to learn more." }
            ].map((faq, i) => (
              <div key={i} className="prc-faq-item">
                <button className="prc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={openFaq === i ? 'active' : ''} />
                </button>
                {openFaq === i && <div className="prc-faq-a">{faq.a}</div>}
              </div>
            ))}
             <button  onClick={() => navigate("/faq")}className="prc-cta-btn secondary">View More FAQs</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="prc-cta">
        <div className="prc-container">
          <h2 className="prc-cta-title">Ready to Transform Your Influencer Marketing?</h2>
          <p className="prc-cta-sub">Join over 5,000 brands that trust InfluenceAI to power their partnerships</p>
          <div className="prc-cta-btns">
            <button onClick={() => navigate("/login")} className="prc-cta-btn primary">Start Free Trial</button>
            <button  onClick={() => navigate("/demo")}className="prc-cta-btn secondary">View Demo</button>
          </div>
        </div>
      </section>

      <style>{`
        .prc-wrapper { width: 100%; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .prc-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .prc-header { padding: 60px 0 40px; text-align: center; }
        .prc-title { font-size: 42px; font-weight: 700; color: #3b82f6; margin-bottom: 16px; }
        .prc-subtitle { font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 40px; }
        .prc-toggle-wrap { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .prc-label { font-size: 15px; color: #64748b; font-weight: 500; }
        .prc-label.active { color: #1e293b; font-weight: 600; }
        .prc-toggle { position: relative; width: 50px; height: 26px; background: #e2e8f0; border: none; border-radius: 13px; cursor: pointer; }
        .prc-slider { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .prc-slider.active { transform: translateX(24px); background: #22c55e; }
        .prc-badge { padding: 4px 12px; background: #22c55e; color: white; font-size: 12px; font-weight: 600; border-radius: 12px; }
        .prc-cards { padding: 40px 0; }
        .prc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .prc-card { position: relative; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 28px 24px; transition: 0.3s; }
        .prc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .prc-popular { border-color: #3b82f6; box-shadow: 0 8px 24px rgba(59,130,246,0.15); }
        .prc-pop-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 6px 16px; background: #3b82f6; color: white; font-size: 12px; font-weight: 600; border-radius: 12px; }
        .prc-card-top { text-align: center; margin-bottom: 24px; }
        .prc-icon { width: 48px; height: 48px; margin: 0 auto 12px; background: linear-gradient(135deg, #3b82f6, #60a5fa); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .prc-card-title { font-size: 20px; font-weight: 700; color: #1e293b; }
        .prc-btn { width: 100%; padding: 12px; background: #f1f5f9; color: #3b82f6; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 24px; }
        .prc-btn:hover { background: #e2e8f0; }
        .prc-btn-primary { background: #3b82f6; color: white; }
        .prc-btn-primary:hover { background: #2563eb; }
        .prc-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
        .prc-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #475569; }
        .prc-list svg { color: #3b82f6; flex-shrink: 0; margin-top: 2px; }
        .prc-compare { padding: 80px 0; background: #f8fafc; }
        .prc-sec-title { font-size: 36px; font-weight: 700; color: #3b82f6; text-align: center; margin-bottom: 12px; }
        .prc-sec-sub { font-size: 16px; color: #64748b; text-align: center; margin-bottom: 48px; }
        .prc-table-wrap { overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .prc-table { width: 100%; border-collapse: collapse; }
        .prc-table th { padding: 20px; background: #f8fafc; font-size: 14px; font-weight: 700; color: #1e293b; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .prc-table td { padding: 16px 20px; font-size: 14px; color: #475569; border-bottom: 1px solid #e2e8f0; }
        .prc-table td:first-child { font-weight: 600; color: #1e293b; }
        .prc-table td svg { color: #22c55e; }
        .prc-table td svg:last-child { color: #ef4444; }
        .prc-testi { padding: 80px 0; }
        .prc-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .prc-testi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; transition: 0.3s; }
        .prc-testi-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .prc-testi-text { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
        .prc-author { display: flex; align-items: center; gap: 12px; }
        .prc-author img { width: 48px; height: 48px; border-radius: 50%; }
        .prc-author h4 { font-size: 15px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
        .prc-author p { font-size: 13px; color: #64748b; }
        .prc-faq { padding: 80px 0; background: #f8fafc; }
        .prc-faq-list { max-width: 800px; margin: 0 auto; }
        .prc-faq-item { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
        .prc-faq-q { width: 100%; padding: 20px 24px; background: transparent; border: none; display: flex; justify-content: space-between; cursor: pointer; font-size: 16px; font-weight: 600; color: #1e293b; text-align: left; }
        .prc-faq-q:hover { background: #f8fafc; }
        .prc-faq-q svg { color: #64748b; transition: 0.3s; }
        .prc-faq-q svg.active { transform: rotate(180deg); }
        .prc-faq-a { padding: 0 24px 20px; font-size: 15px; color: #64748b; line-height: 1.7; }
        .prc-cta { padding: 80px 0; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); text-align: center; }
        .prc-cta-title { font-size: 36px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .prc-cta-sub { font-size: 18px; color: #64748b; margin-bottom: 32px; }
        .prc-cta-btns { display: flex; gap: 16px; justify-content: center; }
        .prc-cta-btn { padding: 14px 32px; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: 0.3s; }
        .prc-cta-btn.primary { background: #3b82f6; color: white; }
        .prc-cta-btn.primary:hover { background: #2563eb; }
        .prc-cta-btn.secondary { background: white; color: #3b82f6; border: 2px solid #3b82f6; }
        .prc-cta-btn.secondary:hover { background: #f1f5f9; }
        @media (max-width: 1024px) {
          .prc-grid { grid-template-columns: repeat(2, 1fr); }
          .prc-testi-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .prc-grid { grid-template-columns: 1fr; }
          .prc-title { font-size: 32px; }
          .prc-sec-title { font-size: 28px; }
          .prc-cta-btns { flex-direction: column; }
        }
          .prc-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin: 12px 0 20px;
}

.prc-currency {
  font-size: 18px;
  font-weight: 600;
  color: #475569;
}

.prc-amount {
  font-size: 40px;
  font-weight: 800;
  color: #1e293b;
}

.prc-period {
  font-size: 14px;
  color: #64748b;
}

.prc-price.highlight .prc-amount {
  color: #3b82f6;
}

      `}</style>
    </div>
  );
}

export default PricingSection;