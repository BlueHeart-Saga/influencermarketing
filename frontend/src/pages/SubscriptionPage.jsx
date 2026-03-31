// // src/pages/SubscriptionPage.jsx
// import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import axios from "axios";
// import API_BASE_URL from "../config/api";
// import "../style/SubscriptionPage.css";

// // ✅ Initialize Stripe with .env key
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const SubscriptionForm = () => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const [plan, setPlan] = useState("starter");
//   const [billingCycle, setBillingCycle] = useState("monthly");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // "success", "error", "warning"
//   const [currentSub, setCurrentSub] = useState(null);
//   const [userEmail, setUserEmail] = useState("");
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [requiresAction, setRequiresAction] = useState(false);
//   const [clientSecret, setClientSecret] = useState("");
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [trialStatus, setTrialStatus] = useState(null);
//   const [userPlanStatus, setUserPlanStatus] = useState(null);

//   // Get user info from token
//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       try {
//         const payload = JSON.parse(atob(token.split('.')[1]));
//         if (payload && payload.sub) {
//           setIsAuthenticated(true);
//           setUserEmail(payload.email || "loading...");
//           // Fetch initial data
//           fetchUserPlanStatus();
//           fetchCurrentSubscription();
//         } else {
//           handleAuthError();
//         }
//       } catch (err) {
//         console.error("Error decoding token:", err);
//         handleAuthError();
//       }
//     } else {
//       setMessage("Please log in to manage subscriptions.");
//       setMessageType("error");
//     }
//   }, []);

//   const handleAuthError = () => {
//     setMessage("Authentication error. Please log in again.");
//     setMessageType("error");
//     setIsAuthenticated(false);
//     localStorage.removeItem("access_token");
//   };

//   // Fetch user plan status from auth endpoint
//   const fetchUserPlanStatus = async () => {
//     if (!isAuthenticated) return;
    
//     try {
//       const token = localStorage.getItem("access_token");
      
//       // Fetch user data with plan status from /auth/me
//       const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//       });
      
//       console.log("User plan status:", userRes.data);
//       setUserPlanStatus(userRes.data);
      
//       // Also fetch trial status
//       try {
//         const trialRes = await axios.get(`${API_BASE_URL}/auth/trial-status`, {
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//         });
//         console.log("Trial status:", trialRes.data);
//         setTrialStatus(trialRes.data);
//       } catch (trialErr) {
//         console.log("Trial status not available:", trialErr.message);
//       }
      
//     } catch (err) {
//       console.error("Error fetching user plan status:", err);
//       if (err.response?.status === 401) {
//         handleAuthError();
//       }
//     }
//   };

//   // Fetch current subscription with enhanced error handling
//   const fetchCurrentSubscription = async () => {
//     if (!isAuthenticated) return;
    
//     try {
//       const token = localStorage.getItem("access_token");
      
//       // Fetch subscription data from /subscriptions/current
//       const subRes = await axios.get(`${API_BASE_URL}/subscriptions/current`, {
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//       });
      
//       console.log("Subscription data:", subRes.data);
//       setCurrentSub(subRes.data);
      
//     } catch (err) {
//       console.error("Error fetching subscription data:", err);
//       if (err.response?.status === 401) {
//         handleAuthError();
//       } else if (err.response?.status === 404) {
//         setCurrentSub(null);
//         setMessage("No active subscription found. Choose a plan to get started.");
//         setMessageType("info");
//       } else {
//         setMessage("Error fetching subscription information.");
//         setMessageType("error");
//       }
//     }
//   };

//   // Enhanced 3D Secure authentication
//   const handle3DAuthentication = async (clientSecret, setupIntent = true) => {
//     try {
//       setMessage("Completing authentication...");
//       setMessageType("warning");
      
//       let result;
//       if (setupIntent) {
//         result = await stripe.confirmCardSetup(clientSecret);
//       } else {
//         result = await stripe.confirmCardPayment(clientSecret);
//       }
      
//       const { error, setupIntent: si, paymentIntent } = result;
      
//       if (error) {
//         setMessage(`Authentication failed: ${error.message}`);
//         setMessageType("error");
//         return false;
//       }
      
//       if ((si && si.status === 'succeeded') || (paymentIntent && paymentIntent.status === 'succeeded')) {
//         setMessage("Authentication successful! Your subscription is now active.");
//         setMessageType("success");
        
//         // Refresh both subscription and user status
//         setTimeout(() => {
//           fetchCurrentSubscription();
//           fetchUserPlanStatus();
//         }, 2000);
        
//         return true;
//       } else {
//         setMessage("Authentication incomplete. Please try again.");
//         setMessageType("warning");
//         return false;
//       }
//     } catch (err) {
//       console.error("3D Secure error:", err);
//       setMessage("Authentication error. Please try again.");
//       setMessageType("error");
//       return false;
//     }
//   };

//   // Handle subscription creation
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!stripe || !elements || !isAuthenticated) {
//       setMessage("Stripe not loaded or user not authenticated.");
//       setMessageType("error");
//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setMessageType("");
//     setRequiresAction(false);
//     setClientSecret("");

//     try {
//       const token = localStorage.getItem("access_token");
//       const cardElement = elements.getElement(CardElement);

//       // Validate card element
//       if (!cardElement) {
//         setMessage("Please enter your card details.");
//         setMessageType("error");
//         setLoading(false);
//         return;
//       }

//       // ✅ Step 1: Create payment method
//       const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//         billing_details: {
//           name: "Customer",
//           email: userEmail !== "loading..." ? userEmail : "customer@example.com",
//         },
//       });

//       if (pmError) {
//         setMessage(`Payment method error: ${pmError.message}`);
//         setMessageType("error");
//         setLoading(false);
//         return;
//       }

//       console.log("Creating subscription with:", { 
//         plan, 
//         billing_cycle: billingCycle, 
//         payment_method_id: paymentMethod.id 
//       });

//       // ✅ Step 2: Create subscription with payment method
//       const res = await axios.post(
//         `${API_BASE_URL}/subscriptions/create`,
//         { 
//           plan: plan, 
//           billing_cycle: billingCycle,
//           payment_method_id: paymentMethod.id 
//         },
//         { 
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           } 
//         }
//       );

//       const subscriptionData = res.data;
//       console.log("Subscription response:", subscriptionData);

//       // ✅ Step 3: Handle payment confirmation if required
//       if (subscriptionData.requires_action && subscriptionData.client_secret) {
//         setRequiresAction(true);
//         setClientSecret(subscriptionData.client_secret);
//         setMessage("Additional authentication required. Please complete the verification.");
//         setMessageType("warning");
        
//         // Automatically handle 3D Secure
//         const authSuccess = await handle3DAuthentication(subscriptionData.client_secret, true);
//         if (authSuccess) {
//           setRequiresAction(false);
//           setClientSecret("");
//           // Clear card element on success
//           if (cardElement) {
//             cardElement.clear();
//           }
//         }
//       } else if (subscriptionData.status === 'active' || subscriptionData.status === 'trialing') {
//         setMessage(`🎉 Subscription created successfully! You're now on the ${plan} plan.`);
//         setMessageType("success");
        
//         // Refresh both subscription and user status
//         setTimeout(() => {
//           fetchCurrentSubscription();
//           fetchUserPlanStatus();
//         }, 2000);
        
//         // Clear card element
//         if (cardElement) {
//           cardElement.clear();
//         }
//       } else {
//         setMessage(`Subscription created with status: ${subscriptionData.status}. Please wait for activation.`);
//         setMessageType("info");
        
//         // Refresh status
//         setTimeout(() => {
//           fetchCurrentSubscription();
//           fetchUserPlanStatus();
//         }, 2000);
//       }

//     } catch (err) {
//       console.error("Subscription error:", err);
//       if (err.response?.status === 401) {
//         handleAuthError();
//       } else {
//         const errorMsg = err.response?.data?.detail || 
//                         err.response?.data?.message || 
//                         (err.response?.data?.error ? JSON.stringify(err.response.data.error) : err.message) || 
//                         "Subscription failed";
//         setMessage(typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg);
//         setMessageType("error");
//       }
//     }

//     setLoading(false);
//   };

//   // Cancel subscription
//   const handleCancel = async () => {
//     if (!currentSub || !isAuthenticated) return;
    
//     if (!window.confirm(
//       `Are you sure you want to cancel your ${currentSub.plan} subscription? You will lose access to premium features at the end of your billing period.`
//     )) {
//       return;
//     }

//     setLoading(true);
//     setMessage("");
//     setMessageType("");

//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.post(
//         `${API_BASE_URL}/subscriptions/cancel`,
//         {},
//         { 
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           } 
//         }
//       );
      
//       console.log("Cancel response:", response.data);
      
//       setMessage("Subscription canceled successfully. You can resubscribe anytime.");
//       setMessageType("success");
      
//       // Refresh both subscription and user status
//       setTimeout(() => {
//         fetchCurrentSubscription();
//         fetchUserPlanStatus();
//       }, 2000);
      
//     } catch (err) {
//       console.error("Cancel error:", err);
//       if (err.response?.status === 401) {
//         handleAuthError();
//       } else {
//         const errorMsg = err.response?.data?.detail || 
//                         err.response?.data?.message || 
//                         err.message || 
//                         "Cancel failed";
//         setMessage(typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg);
//         setMessageType("error");
//       }
//     }

//     setLoading(false);
//   };

//   // Sync subscription status
//   const handleSyncStatus = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("access_token");
//       await axios.post(
//         `${API_BASE_URL}/subscriptions/sync-status`,
//         {},
//         { 
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           } 
//         }
//       );
//       setMessage("Subscription status synced successfully!");
//       setMessageType("success");
      
//       // Refresh both subscription and user status
//       setTimeout(() => {
//         fetchCurrentSubscription();
//         fetchUserPlanStatus();
//       }, 1000);
      
//     } catch (err) {
//       setMessage("Error syncing status: " + (err.response?.data?.detail || err.message));
//       setMessageType("error");
//     }
//     setLoading(false);
//   };

//   // Enhanced date formatting with better error handling
//   const formatDate = (dateString) => {
//     if (!dateString) {
//       return "Not available";
//     }
    
//     try {
//       // Handle both string dates and Date objects
//       const date = new Date(dateString);
      
//       // Check if date is valid
//       if (isNaN(date.getTime())) {
//         console.log("Invalid date:", dateString);
//         return "Date not set";
//       }
      
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (error) {
//       console.error("Date formatting error:", error, "Input:", dateString);
//       return "Date error";
//     }
//   };

//   // Get appropriate label for date field
//   const getDateLabel = () => {
//     if (!currentSub) return "Next Billing";
    
//     if (currentSub.is_trial || currentSub.type === 'trial') {
//       return "Trial Ends";
//     }
    
//     switch (currentSub.status) {
//       case 'active':
//       case 'trialing':
//         return "Renews On";
//       case 'canceled':
//         return "Access Ends";
//       case 'past_due':
//         return "Payment Due";
//       case 'incomplete':
//         return "Activation Required";
//       default:
//         return "Next Billing";
//     }
//   };

//   // Get display date based on subscription type
//   const getDisplayDate = () => {
//     if (!currentSub) return null;
    
//     if (currentSub.is_trial || currentSub.type === 'trial') {
//       return currentSub.trial_end || currentSub.current_period_end;
//     }
    
//     return currentSub.current_period_end;
//   };

//   // Plan pricing display - Updated to match backend plans
//   const getPlanPrice = () => {
//     const prices = {
//       starter: { monthly: "$29", yearly: "$290" },
//       pro: { monthly: "$79", yearly: "$790" },
//       enterprise: { monthly: "$199", yearly: "$1990" }
//     };
//     return prices[plan]?.[billingCycle] || "";
//   };

//   // Get plan features based on selected plan - Updated to match backend
//   const getPlanFeatures = () => {
//     const features = {
//       starter: [
//         "5 campaigns",
//         "50 influencer contacts", 
//         "Basic analytics",
//         "Email support"
//       ],
//       pro: [
//         "20 campaigns",
//         "200 influencer contacts",
//         "Advanced analytics", 
//         "Priority support",
//         "API access"
//       ],
//       enterprise: [
//         "100 campaigns",
//         "1000 influencer contacts",
//         "Premium analytics",
//         "24/7 dedicated support", 
//         "Full API access",
//         "Custom integrations"
//       ]
//     };
//     return features[plan] || [];
//   };

//   // Check if user should see subscription form
//   const shouldShowSubscriptionForm = () => {
//     if (!currentSub) return true;
    
//     // Show form if no active paid subscription or if it's just a free trial
//     const isActivePaidSubscription = currentSub.is_active && 
//                                    currentSub.type === 'paid';
    
//     return !isActivePaidSubscription;
//   };

//   // Check if user has active paid subscription
//   const hasActivePaidSubscription = () => {
//     return currentSub && 
//            currentSub.is_active && 
//            currentSub.type === 'paid';
//   };

//   // Check if user has active trial
//   const hasActiveTrial = () => {
//     return (currentSub && currentSub.type === 'trial' && currentSub.is_active) ||
//            (userPlanStatus && userPlanStatus.is_trial_active);
//   };

//   // Check if user is on free plan
//   const isOnFreePlan = () => {
//     return (currentSub && currentSub.type === 'free') ||
//            (userPlanStatus && userPlanStatus.current_plan === 'free');
//   };

//   // Get current plan display name
//   const getCurrentPlanDisplayName = () => {
//     if (currentSub) {
//       return currentSub.plan?.replace('_', ' ') || 'Unknown';
//     }
//     if (userPlanStatus) {
//       return userPlanStatus.current_plan?.replace('_', ' ') || 'Free';
//     }
//     return 'Free';
//   };

//   // Reset form when showing subscription form
//   useEffect(() => {
//     if (shouldShowSubscriptionForm()) {
//       setPlan("starter");
//       setBillingCycle("monthly");
//       setRequiresAction(false);
//       setClientSecret("");
//     }
//   }, [currentSub]);

//   // Debug info (remove in production)
//   const renderDebugInfo = () => {
//     if (process.env.NODE_ENV === 'development') {
//       return (
//         <div className="debug-info">
//           <h4>Debug Info:</h4>
//           <p>Current Sub Type: {currentSub?.type}</p>
//           <p>Current Sub Plan: {currentSub?.plan}</p>
//           <p>User Plan: {userPlanStatus?.current_plan}</p>
//           <p>Has Active Paid: {JSON.stringify(hasActivePaidSubscription())}</p>
//           <p>Has Active Trial: {JSON.stringify(hasActiveTrial())}</p>
//           <p>Is Free: {JSON.stringify(isOnFreePlan())}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="auth-error-container">
//         <h2 className="subscription-title">Subscription Management</h2>
//         <div className="auth-error-content">
//           <p className="auth-error-message">{message || "Please log in to manage your subscription."}</p>
//           <button
//             onClick={() => window.location.href = "/login"}
//             className="auth-login-button"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="subscription-container">
//       <div className="subscription-card">
//         <div className="subscription-header">
//           <h2 className="subscription-title">Subscription Management</h2>
//           <div className="header-actions">
//             <button 
//               onClick={handleSyncStatus}
//               disabled={loading}
//               className="sync-button"
//               title="Refresh subscription status"
//             >
//               🔄 Sync
//             </button>
//           </div>
//         </div>
        
//         {/* User Info */}
//         <div className="user-info">
//           <p>Logged in as: <strong>{userEmail}</strong></p>
//           {userPlanStatus && (
//             <div className="user-plan-info">
//               <span className={`plan-badge ${userPlanStatus.current_plan}`}>
//                 {getCurrentPlanDisplayName().toUpperCase()}
//               </span>
//               {userPlanStatus.has_active_subscription && (
//                 <span className="active-badge">ACTIVE</span>
//               )}
//               {userPlanStatus.is_trial_active && (
//                 <span className="trial-badge">TRIAL</span>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Trial Status Banner */}
//         {hasActiveTrial() && (
//           <div className="trial-banner">
//             <div className="trial-banner-content">
//               <span className="trial-icon">🎁</span>
//               <div className="trial-text">
//                 <strong>Free Trial Active</strong>
//                 <span>
//                   {trialStatus?.remaining_days || 
//                    currentSub?.remaining_days || 
//                    userPlanStatus?.subscription?.remaining_days || 
//                    0} days remaining
//                 </span>
//               </div>
//             </div>
//             <p className="trial-description">
//               Upgrade to a paid plan to continue using premium features after your trial ends.
//             </p>
//           </div>
//         )}

//         <p className="subscription-subtitle">
//           {hasActivePaidSubscription()
//             ? "Manage your current subscription" 
//             : "Choose a plan that works best for you"
//           }
//         </p>

//         {/* Current Subscription Display */}
//         {hasActivePaidSubscription() ? (
//           <div className="current-subscription">
//             <div className="subscription-header">
//               <h3 className="current-subscription-title">
//                 <span className="header-icon">📋</span> Current Subscription
//               </h3>
//               <div className={`status-badge ${currentSub.status}`}>
//                 {currentSub.status?.toUpperCase() || 'ACTIVE'}
//               </div>
//             </div>
            
//             <div className="subscription-details-grid">
//               <div className="detail-item">
//                 <label className="detail-label">Plan</label>
//                 <p className="detail-value capitalize">
//                   {getCurrentPlanDisplayName()}
//                 </p>
//               </div>
              
//               <div className="detail-item">
//                 <label className="detail-label">Billing Cycle</label>
//                 <p className="detail-value capitalize">
//                   {currentSub.billing_cycle || 'monthly'}
//                 </p>
//               </div>
              
//               <div className="detail-item">
//                 <label className="detail-label">Status</label>
//                 <p className={`detail-value status ${currentSub.status}`}>
//                   {currentSub.status?.charAt(0).toUpperCase() + currentSub.status?.slice(1) || 'Active'}
//                 </p>
//               </div>
              
//               <div className="detail-item">
//                 <label className="detail-label">{getDateLabel()}</label>
//                 <p className="detail-value">
//                   {formatDate(getDisplayDate())}
//                 </p>
//                 {currentSub.remaining_days > 0 && (
//                   <p className="remaining-days">
//                     {currentSub.remaining_days} days remaining
//                   </p>
//                 )}
//               </div>
//             </div>
            
//             {/* Status-specific messages */}
//             {currentSub.status === 'incomplete' && (
//               <div className="status-message warning">
//                 <p className="status-message-text">
//                   ⚠️ Your subscription is pending payment confirmation. It will be activated once payment is completed.
//                 </p>
//               </div>
//             )}
            
//             {currentSub.status === 'past_due' && (
//               <div className="status-message error">
//                 <p className="status-message-text">
//                   ❌ Payment failed. Please update your payment method to avoid service interruption.
//                 </p>
//               </div>
//             )}

//             {currentSub.status === 'canceled' && (
//               <div className="status-message info">
//                 <p className="status-message-text">
//                   ℹ️ Your subscription has been canceled. You can resubscribe anytime.
//                 </p>
//               </div>
//             )}
            
//             <div className="subscription-actions">
//               <button
//                 onClick={handleCancel}
//                 disabled={loading || currentSub.status === 'canceled'}
//                 className="btn btn-cancel"
//               >
//                 {loading ? "Processing..." : "Cancel Subscription"}
//               </button>
              
//               <button
//                 onClick={() => {
//                   setCurrentSub(null);
//                   setMessage("You can now choose a new subscription plan.");
//                   setMessageType("info");
//                 }}
//                 className="btn btn-change"
//               >
//                 Change Plan
//               </button>
//             </div>
//           </div>
//         ) : (
//           // Subscription Form
//           <div className="subscription-form-container">
//             {/* Active Trial Notice */}
//             {hasActiveTrial() && (
//               <div className="trial-notice">
//                 <p>
//                   🎁 You are currently on a free trial with {
//                     trialStatus?.remaining_days || 
//                     currentSub?.remaining_days || 
//                     userPlanStatus?.subscription?.remaining_days || 
//                     0
//                   } days remaining. 
//                   Upgrade now to keep your features after the trial ends.
//                 </p>
//               </div>
//             )}

//             {/* Free Plan Notice */}
//             {isOnFreePlan() && (
//               <div className="free-plan-notice">
//                 <p>
//                   🆓 You are currently on the free plan. Upgrade to access premium features.
//                 </p>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="subscription-form">
//               {/* Plan Selection */}
//               <div className="plan-selection-section">
//                 <h3 className="section-title">Choose Your Plan</h3>
//                 <div className="plan-selection-grid">
//                   {[
//                     { 
//                       value: "starter", 
//                       label: "Starter", 
//                       desc: "Perfect for individuals and small businesses",
//                       monthly: "$29/month",
//                       yearly: "$290/year"
//                     },
//                     { 
//                       value: "pro", 
//                       label: "Professional", 
//                       desc: "Great for growing teams and agencies",
//                       monthly: "$79/month",
//                       yearly: "$790/year"
//                     },
//                     { 
//                       value: "enterprise", 
//                       label: "Enterprise", 
//                       desc: "For large organizations with advanced needs",
//                       monthly: "$199/month",
//                       yearly: "$1990/year"
//                     }
//                   ].map((planOption) => (
//                     <div
//                       key={planOption.value}
//                       className={`plan-option ${plan === planOption.value ? 'selected' : ''}`}
//                       onClick={() => setPlan(planOption.value)}
//                     >
//                       <div className="plan-header">
//                         <div className="plan-selector">
//                           <div className={`plan-radio ${plan === planOption.value ? 'selected' : ''}`}></div>
//                           <h3 className="plan-name">{planOption.label}</h3>
//                         </div>
//                         <div className="plan-price">
//                           {billingCycle === 'monthly' ? planOption.monthly : planOption.yearly}
//                         </div>
//                       </div>
//                       <p className="plan-description">{planOption.desc}</p>
                      
//                       <div className="plan-features">
//                         {getPlanFeatures().map((feature, index) => (
//                           <div key={index} className="feature-preview">
//                             <span className="feature-check">✓</span>
//                             {feature}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Billing Cycle */}
//               <div className="billing-section">
//                 <h3 className="section-title">Billing Cycle</h3>
//                 <div className="billing-options">
//                   {[
//                     { value: "monthly", label: "Monthly", savings: "" },
//                     { value: "yearly", label: "Yearly", savings: "Save 17%" }
//                   ].map((cycle) => (
//                     <label key={cycle.value} className="billing-option">
//                       <input
//                         type="radio"
//                         value={cycle.value}
//                         checked={billingCycle === cycle.value}
//                         onChange={(e) => setBillingCycle(e.target.value)}
//                       />
//                       <div className="billing-content">
//                         <span className="billing-text">{cycle.label}</span>
//                         {cycle.savings && <span className="savings-badge">{cycle.savings}</span>}
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Selected Plan Summary */}
//               <div className="selected-plan-summary">
//                 <div className="summary-header">
//                   <h4>Selected Plan</h4>
//                   <div className="summary-price">
//                     {getPlanPrice()}
//                     <span>/{billingCycle === "monthly" ? "month" : "year"}</span>
//                   </div>
//                 </div>
//                 <div className="summary-features">
//                   {getPlanFeatures().slice(0, 3).map((feature, index) => (
//                     <div key={index} className="summary-feature">
//                       ✓ {feature}
//                     </div>
//                   ))}
//                   {getPlanFeatures().length > 3 && (
//                     <div className="summary-more">+ {getPlanFeatures().length - 3} more features</div>
//                   )}
//                 </div>
//               </div>

//               {/* Card Details */}
//               <div className="card-section">
//                 <h3 className="section-title">Payment Details</h3>
//                 <div className="card-element-container">
//                   <CardElement 
//                     options={{
//                       style: {
//                         base: {
//                           fontSize: '16px',
//                           color: '#2d3748',
//                           '::placeholder': {
//                             color: '#a0aec0',
//                           },
//                           padding: '12px',
//                           backgroundColor: '#ffffff',
//                           border: '1px solid #e2e8f0',
//                           borderRadius: '8px',
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//                 <p className="card-security">
//                   🔒 Your payment information is secure and encrypted
//                 </p>
//               </div>

//               {/* 3D Secure Notice */}
//               {requiresAction && (
//                 <div className="secure-auth-container warning">
//                   <div className="secure-auth-header">
//                     <div className="secure-auth-spinner"></div>
//                     <p className="secure-auth-title">3D Secure Authentication Required</p>
//                   </div>
//                   <p className="secure-auth-message">
//                     Please complete the authentication with your bank to activate your subscription.
//                     A verification window may appear.
//                   </p>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={!stripe || loading || requiresAction}
//                 className={`btn btn-subscribe ${loading ? 'loading' : ''}`}
//               >
//                 {loading ? (
//                   <div className="button-loading">
//                     <div className="loading-spinner"></div>
//                     Processing...
//                   </div>
//                 ) : requiresAction ? (
//                   "Completing Authentication..."
//                 ) : (
//                   `Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)} - ${getPlanPrice()}/${billingCycle === "monthly" ? "month" : "year"}`
//                 )}
//               </button>
//             </form>

//             {/* Features Comparison */}
//             <div className="features-comparison">
//               <h3 className="section-title">All Plan Features</h3>
//               <div className="features-grid">
//                 <div className="feature-category">
//                   <h4>Core Features</h4>
//                   <ul>
//                     <li>Campaign Management</li>
//                     <li>Influencer Database</li>
//                     <li>Basic Analytics</li>
//                     <li>Email Support</li>
//                   </ul>
//                 </div>
//                 <div className="feature-category">
//                   <h4>Advanced Features</h4>
//                   <ul>
//                     <li className={plan !== 'starter' ? 'included' : 'not-included'}>
//                       {plan !== 'starter' ? '✓' : '○'} Advanced Analytics
//                     </li>
//                     <li className={plan !== 'starter' ? 'included' : 'not-included'}>
//                       {plan !== 'starter' ? '✓' : '○'} API Access
//                     </li>
//                     <li className={plan === 'enterprise' ? 'included' : 'not-included'}>
//                       {plan === 'enterprise' ? '✓' : '○'} Custom Integrations
//                     </li>
//                     <li className={plan === 'enterprise' ? 'included' : 'not-included'}>
//                       {plan === 'enterprise' ? '✓' : '○'} Dedicated Support
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Debug Info */}
//         {renderDebugInfo()}

//         {/* Message Display */}
//         {message && (
//           <div className={`message-container ${messageType}`}>
//             <div className="message-content">
//               {messageType === 'success' && '✅ '}
//               {messageType === 'error' && '❌ '}
//               {messageType === 'warning' && '⚠️ '}
//               {messageType === 'info' && 'ℹ️ '}
//               {message}
//             </div>
//             <button 
//               onClick={() => setMessage("")}
//               className="message-close"
//             >
//               ×
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const SubscriptionPage = () => (
//   <Elements stripe={stripePromise}>
//     <SubscriptionForm />
//   </Elements>
// );

// export default SubscriptionPage;