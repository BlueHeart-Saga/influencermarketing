// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import {
//   CardElement,
//   useStripe,
//   useElements,
//   Elements,
// } from '@stripe/react-stripe-js';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Button,
//   Grid,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   Snackbar,
//   CircularProgress,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Container,
//   Fade,
//   Paper,
//   ToggleButtonGroup,
//   ToggleButton,
//   IconButton,
//   Collapse,
//   CardActions,
//   useTheme,
//   useMediaQuery,
//   alpha,
//   styled,
//   Tabs,
//   Tab,
//   LinearProgress
// } from '@mui/material';
// import {
//   ExpandMore,
//   ExpandLess,
//   CheckCircle,
//   Cancel,
//   Upgrade,
//   CardMembership,
//   Timer,
//   Star,
//   Rocket,
//   Diamond,
//   WorkspacePremium,
//   Group,
//   Analytics,
//   SupportAgent,
//   Storage,
//   TrendingUp,
//   Api,
//   Palette,
//   Chat,
//   SmartToy,
//   AutoAwesome,
//   Image,
//   Email,
//   Download,
//   Upload,
//   People,
//   Payment,
//   History,
//   Psychology,
//   Campaign,
//   HowToReg,
//   FilterList,
//   Security,
//   PersonSearch,
//   ManageSearch,
//   Shield,
//   Memory,
//   Dashboard,
//   BusinessCenter,
//   IntegrationInstructions,
//   WhatsApp,
//   Notifications,
//   Hub,
//   Rule,
//   BarChart,
//   ShowChart,
//   LockOpen,
//   TravelExplore,
//   GroupWork,
//   PhotoLibrary,
//   VerifiedUser,
//   ContactPhone,
//   AccessTime,
//   CalendarToday
// } from '@mui/icons-material';
// import { FaCrown } from "react-icons/fa";
// import axios from 'axios';

// // Initialize Stripe
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
// const API_BASE_URL = process.env.REACT_APP_API_URL;

// // Styled Components
// const SimplePlanCard = styled(Card)(({ theme, featured, planlevel }) => ({
//   maxWidth: 320,
// minWidth: 320,
//   border: featured ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
//   borderRadius: '12px',
//   transition: 'all 0.3s ease',
//   cursor: 'pointer',
//   background: theme.palette.background.paper,
//   '&:hover': {
//     transform: 'translateY(-4px)',
//     boxShadow: theme.shadows[8],
//   },
// }));

// const PlanHeader = styled(Box)(({ theme, planlevel }) => ({
//   background: planlevel === 'starter' 
//     ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
//     : planlevel === 'pro'
//     ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
//     : planlevel === 'enterprise'
//     ? 'linear-gradient(135deg, #F59E0B, #D97706)'
//     : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
//   color: 'white',
//   padding: theme.spacing(2),
//   textAlign: 'center',
//   borderTopLeftRadius: '12px',
//   borderTopRightRadius: '12px',
// }));

// const FeatureItem = styled(ListItem)(({ theme }) => ({
//   padding: '4px 0',
//   borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//   '&:last-child': {
//     borderBottom: 'none',
//   },
// }));

// const HighlightFeature = styled(ListItem)(({ theme }) => ({
//   padding: '6px 0',
//   background: alpha(theme.palette.primary.main, 0.03),
//   margin: '2px 0',
//   borderRadius: '4px',
//   borderLeft: `3px solid ${theme.palette.primary.main}`,
// }));

// const CountdownCard = styled(Card)(({ theme }) => ({
//   background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
//   border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
//   borderRadius: '12px',
//   padding: theme.spacing(3),
//   textAlign: 'center',
// }));

// const CountdownTimer = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   justifyContent: 'center',
//   gap: theme.spacing(2),
//   margin: theme.spacing(3, 0),
// }));

// const TimeUnit = styled(Box)(({ theme }) => ({
//   background: theme.palette.background.paper,
//   borderRadius: '8px',
//   padding: theme.spacing(2),
//   minWidth: 80,
//   boxShadow: theme.shadows[2],
//   border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
// }));

// // Plan Features Configuration
// const getPlanFeatures = (planKey) => {
//   const features = {
//     free_trial: [
//       { text: "15-day free trial", icon: <Timer fontSize="small" /> },
//       { text: "1 active campaign", icon: <Rocket fontSize="small" /> },
//       { text: "Up to 10 influencers", icon: <Group fontSize="small" /> },
//       { text: "Basic analytics", icon: <Analytics fontSize="small" /> },
//       { text: "Email support", icon: <SupportAgent fontSize="small" /> },
//       { text: "Limited chat access (3 users)", icon: <Chat fontSize="small" /> },
//       { text: "2 AI tools: Content Analyzer & Generator", icon: <AutoAwesome fontSize="small" /> },
//       { text: "50 emails per month", icon: <Email fontSize="small" /> },
//       { text: "Import up to 100 contacts", icon: <ContactPhone fontSize="small" /> },
//       { text: "Basic profile verification", icon: <VerifiedUser fontSize="small" /> },
//       { text: "Post to 1 social platform", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Limited search (basic filters)", icon: <FilterList fontSize="small" /> },
//       { text: "Stripe payments only", icon: <Payment fontSize="small" /> },
//       { text: "Basic payment history", icon: <History fontSize="small" /> }
//     ],

//     starter_monthly: [
//       { text: "5 active campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Up to 50 influencers", icon: <Group fontSize="small" /> },
//       { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
//       { text: "Priority email support", icon: <SupportAgent fontSize="small" /> },
//       { text: "30-day data retention", icon: <Storage fontSize="small" /> },
//       { text: "Collaboration chat (10 users)", icon: <Chat fontSize="small" /> },
//       { text: "2 AI tools: Content Analyzer & Generator", icon: <AutoAwesome fontSize="small" /> },
//       { text: "500 emails per month", icon: <Email fontSize="small" /> },
//       { text: "Import/Export up to 1,000 contacts", icon: <Download fontSize="small" /> },
//       { text: "Enhanced profile verification", icon: <VerifiedUser fontSize="small" /> },
//       { text: "Post to 2 social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Follow up to 500 followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search with filters", icon: <FilterList fontSize="small" /> },
//       { text: "Stripe & PayPal payments", icon: <Payment fontSize="small" /> },
//       { text: "Detailed payment history", icon: <History fontSize="small" /> },
//       { text: "$500 daily payment limit", icon: <Security fontSize="small" /> }
//     ],

//     starter_yearly: [
//       { text: "5 active campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Up to 50 influencers", icon: <Group fontSize="small" /> },
//       { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
//       { text: "Priority email support", icon: <SupportAgent fontSize="small" /> },
//       { text: "30-day data retention", icon: <Storage fontSize="small" /> },
//       { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
//       { text: "Collaboration chat (10 users)", icon: <Chat fontSize="small" /> },
//       { text: "2 AI tools: Content Analyzer & Generator", icon: <AutoAwesome fontSize="small" /> },
//       { text: "500 emails per month", icon: <Email fontSize="small" /> },
//       { text: "Import/Export up to 1,000 contacts", icon: <Download fontSize="small" /> },
//       { text: "Enhanced profile verification", icon: <VerifiedUser fontSize="small" /> },
//       { text: "Post to 2 social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Follow up to 500 followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search with filters", icon: <FilterList fontSize="small" /> },
//       { text: "Stripe & PayPal payments", icon: <Payment fontSize="small" /> },
//       { text: "Detailed payment history", icon: <History fontSize="small" /> },
//       { text: "$500 daily payment limit", icon: <Security fontSize="small" /> }
//     ],

//     pro_monthly: [
//       { text: "20 active campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Up to 200 influencers", icon: <Group fontSize="small" /> },
//       { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
//       { text: "Phone & email support", icon: <SupportAgent fontSize="small" /> },
//       { text: "90-day data retention", icon: <Storage fontSize="small" /> },
//       { text: "API access", icon: <Api fontSize="small" /> },
//       { text: "Collaboration chat (25 users)", icon: <Chat fontSize="small" /> },
//       { text: "4 AI tools: All except Automation", icon: <Psychology fontSize="small" /> },
//       { text: "AI Influencer Finder", icon: <PersonSearch fontSize="small" /> },
//       { text: "Content Analyzer & Generator", icon: <AutoAwesome fontSize="small" /> },
//       { text: "Image Generator", icon: <Image fontSize="small" /> },
//       { text: "5,000 emails & 1,000 SMS per month", icon: <Email fontSize="small" /> },
//       { text: "Import/Export up to 10,000 contacts", icon: <Download fontSize="small" /> },
//       { text: "Premium verified batch", icon: <VerifiedUser fontSize="small" /> },
//       { text: "Post to 5 social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Follow up to 2,000 followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search & view follower lists", icon: <ManageSearch fontSize="small" /> },
//       { text: "Stripe, PayPal & Razorpay payments", icon: <Payment fontSize="small" /> },
//       { text: "Advanced payment analytics", icon: <BarChart fontSize="small" /> },
//       { text: "$2,000 daily payment limit", icon: <Security fontSize="small" /> },
//       { text: "Limited AI Chatbot", icon: <SmartToy fontSize="small" /> },
//       { text: "AI campaign analysis", icon: <Campaign fontSize="small" /> },
//       { text: "Influencer application management", icon: <HowToReg fontSize="small" /> },
//       { text: "Basic automation workflows", icon: <Rule fontSize="small" /> }
//     ],

//     pro_yearly: [
//       { text: "20 active campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Up to 200 influencers", icon: <Group fontSize="small" /> },
//       { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
//       { text: "Phone & email support", icon: <SupportAgent fontSize="small" /> },
//       { text: "90-day data retention", icon: <Storage fontSize="small" /> },
//       { text: "API access", icon: <Api fontSize="small" /> },
//       { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
//       { text: "Collaboration chat (25 users)", icon: <Chat fontSize="small" /> },
//       { text: "4 AI tools: All except Automation", icon: <Psychology fontSize="small" /> },
//       { text: "AI Influencer Finder", icon: <PersonSearch fontSize="small" /> },
//       { text: "Content Analyzer & Generator", icon: <AutoAwesome fontSize="small" /> },
//       { text: "Image Generator", icon: <Image fontSize="small" /> },
//       { text: "5,000 emails & 1,000 SMS per month", icon: <Email fontSize="small" /> },
//       { text: "Import/Export up to 10,000 contacts", icon: <Download fontSize="small" /> },
//       { text: "Premium verified batch", icon: <VerifiedUser fontSize="small" /> },
//       { text: "Post to 5 social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Follow up to 2,000 followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search & view follower lists", icon: <ManageSearch fontSize="small" /> },
//       { text: "Stripe, PayPal & Razorpay payments", icon: <Payment fontSize="small" /> },
//       { text: "Advanced payment analytics", icon: <BarChart fontSize="small" /> },
//       { text: "$2,000 daily payment limit", icon: <Security fontSize="small" /> },
//       { text: "Limited AI Chatbot", icon: <SmartToy fontSize="small" /> },
//       { text: "AI campaign analysis", icon: <Campaign fontSize="small" /> },
//       { text: "Influencer application management", icon: <HowToReg fontSize="small" /> },
//       { text: "Basic automation workflows", icon: <Rule fontSize="small" /> }
//     ],

//     enterprise_monthly: [
//       { text: "Unlimited campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Unlimited influencers", icon: <Group fontSize="small" /> },
//       { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
//       { text: "24/7 dedicated support", icon: <SupportAgent fontSize="small" /> },
//       { text: "1-year data retention", icon: <Storage fontSize="small" /> },
//       { text: "Full API access", icon: <Api fontSize="small" /> },
//       { text: "Custom branding", icon: <Palette fontSize="small" /> },
//       { text: "Unlimited collaboration chat", icon: <Chat fontSize="small" /> },
//       { text: "All AI tools included", icon: <SmartToy fontSize="small" /> },
//       { text: "AI Influencer Finder (Advanced)", icon: <PersonSearch fontSize="small" /> },
//       { text: "Content Analyzer & Generator (Pro)", icon: <AutoAwesome fontSize="small" /> },
//       { text: "Image Generator (Advanced)", icon: <Image fontSize="small" /> },
//       { text: "Automation & Integration tools", icon: <IntegrationInstructions fontSize="small" /> },
//       { text: "Unlimited emails, SMS & WhatsApp", icon: <WhatsApp fontSize="small" /> },
//       { text: "Bulk messaging capabilities", icon: <Notifications fontSize="small" /> },
//       { text: "Unlimited contact Import/Export", icon: <Upload fontSize="small" /> },
//       { text: "Enterprise verified batch", icon: <WorkspacePremium fontSize="small" /> },
//       { text: "Post to all social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Unlimited followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search with AI filters", icon: <TravelExplore fontSize="small" /> },
//       { text: "Full follower list access", icon: <GroupWork fontSize="small" /> },
//       { text: "All payment gateways", icon: <Payment fontSize="small" /> },
//       { text: "Comprehensive payment analytics", icon: <ShowChart fontSize="small" /> },
//       { text: "No daily payment limits", icon: <LockOpen fontSize="small" /> },
//       { text: "Advanced AI Chatbot", icon: <SmartToy fontSize="small" /> },
//       { text: "AI campaign optimization", icon: <Campaign fontSize="small" /> },
//       { text: "Advanced influencer matching", icon: <HowToReg fontSize="small" /> },
//       { text: "Workflow automation", icon: <Rule fontSize="small" /> },
//       { text: "Custom AI algorithms", icon: <Memory fontSize="small" /> },
//       { text: "Real-time analytics dashboard", icon: <Dashboard fontSize="small" /> },
//       { text: "Advanced security features", icon: <Shield fontSize="small" /> },
//       { text: "Custom integration support", icon: <Hub fontSize="small" /> },
//       { text: "Dedicated account manager", icon: <BusinessCenter fontSize="small" /> }
//     ],

//     enterprise_yearly: [
//       { text: "Unlimited campaigns", icon: <Rocket fontSize="small" /> },
//       { text: "Unlimited influencers", icon: <Group fontSize="small" /> },
//       { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
//       { text: "24/7 dedicated support", icon: <SupportAgent fontSize="small" /> },
//       { text: "1-year data retention", icon: <Storage fontSize="small" /> },
//       { text: "Full API access", icon: <Api fontSize="small" /> },
//       { text: "Custom branding", icon: <Palette fontSize="small" /> },
//       { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
//       { text: "Unlimited collaboration chat", icon: <Chat fontSize="small" /> },
//       { text: "All AI tools included", icon: <SmartToy fontSize="small" /> },
//       { text: "AI Influencer Finder (Advanced)", icon: <PersonSearch fontSize="small" /> },
//       { text: "Content Analyzer & Generator (Pro)", icon: <AutoAwesome fontSize="small" /> },
//       { text: "Image Generator (Advanced)", icon: <Image fontSize="small" /> },
//       { text: "Automation & Integration tools", icon: <IntegrationInstructions fontSize="small" /> },
//       { text: "Unlimited emails, SMS & WhatsApp", icon: <WhatsApp fontSize="small" /> },
//       { text: "Bulk messaging capabilities", icon: <Notifications fontSize="small" /> },
//       { text: "Unlimited contact Import/Export", icon: <Upload fontSize="small" /> },
//       { text: "Enterprise verified batch", icon: <WorkspacePremium fontSize="small" /> },
//       { text: "Post to all social platforms", icon: <PhotoLibrary fontSize="small" /> },
//       { text: "Unlimited followers", icon: <People fontSize="small" /> },
//       { text: "Advanced search with AI filters", icon: <TravelExplore fontSize="small" /> },
//       { text: "Full follower list access", icon: <GroupWork fontSize="small" /> },
//       { text: "All payment gateways", icon: <Payment fontSize="small" /> },
//       { text: "Comprehensive payment analytics", icon: <ShowChart fontSize="small" /> },
//       { text: "No daily payment limits", icon: <LockOpen fontSize="small" /> },
//       { text: "Advanced AI Chatbot", icon: <SmartToy fontSize="small" /> },
//       { text: "AI campaign optimization", icon: <Campaign fontSize="small" /> },
//       { text: "Advanced influencer matching", icon: <HowToReg fontSize="small" /> },
//       { text: "Workflow automation", icon: <Rule fontSize="small" /> },
//       { text: "Custom AI algorithms", icon: <Memory fontSize="small" /> },
//       { text: "Real-time analytics dashboard", icon: <Dashboard fontSize="small" /> },
//       { text: "Advanced security features", icon: <Shield fontSize="small" /> },
//       { text: "Custom integration support", icon: <Hub fontSize="small" /> },
//       { text: "Dedicated account manager", icon: <BusinessCenter fontSize="small" /> }
//     ]
//   };

//   return features[planKey] || [];
// };

// const getPlanHighlights = (planKey) => {
//   const highlights = {
//     free_trial: [
//       "15-day free trial",
//       "1 active campaign", 
//       "Up to 10 influencers",
//       "Basic analytics",
//       "Email support"
//     ],
//     starter_monthly: [
//       "5 active campaigns",
//       "Up to 50 influencers",
//       "Collaboration chat (10 users)",
//       "2 AI tools included",
//       "500 emails per month"
//     ],
//     starter_yearly: [
//       "5 active campaigns",
//       "Up to 50 influencers", 
//       "Save 17% with yearly",
//       "2 AI tools included",
//       "Priority email support"
//     ],
//     pro_monthly: [
//       "20 active campaigns", 
//       "Up to 200 influencers",
//       "4 AI tools + API access",
//       "5,000 emails + 1,000 SMS",
//       "Advanced analytics"
//     ],
//     pro_yearly: [
//       "20 active campaigns",
//       "Up to 200 influencers",
//       "Save 17% with yearly",
//       "4 AI tools + API access", 
//       "Phone & email support"
//     ],
//     enterprise_monthly: [
//       "Unlimited campaigns & influencers",
//       "All AI tools + Custom algorithms", 
//       "Unlimited messaging & contacts",
//       "24/7 dedicated support",
//       "Enterprise features included"
//     ],
//     enterprise_yearly: [
//       "Unlimited campaigns & influencers",
//       "All AI tools + Custom algorithms",
//       "Save 17% with yearly",
//       "24/7 dedicated support", 
//       "Custom branding & API"
//     ]
//   };

//   return highlights[planKey] || [];
// };

// // Auth header helper
// const getAuthHeader = () => {
//   const token = localStorage.getItem('access_token');
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// // Payment Form Component
// function PaymentForm({ selectedPlan, onSuccess, onCancel }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');


//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const cardElement = elements.getElement(CardElement);

//       const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//       });

//       if (pmError) {
//         setError(pmError.message);
//         setLoading(false);
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/subscriptions/create`, {
//         plan_key: selectedPlan.key,
//         payment_method_id: paymentMethod.id
//       }, {
//         headers: getAuthHeader()
//       });

//       const result = response.data;

//       if (result.client_secret) {
//         if (result.client_secret.startsWith('seti_')) {
//           const { error: setupError } = await stripe.confirmCardSetup(result.client_secret);
//           if (setupError) {
//             setError(setupError.message);
//             setLoading(false);
//             return;
//           }
//         } else if (result.client_secret.startsWith('pi_')) {
//           const { error: paymentError } = await stripe.confirmCardPayment(result.client_secret);
//           if (paymentError) {
//             setError(paymentError.message);
//             setLoading(false);
//             return;
//           }
//         }
//       }

//       onSuccess(result);

//     } catch (err) {
//       console.error('Payment error:', err);
//       const errorMessage = err.response?.data?.detail || 
//                           err.response?.data?.message || 
//                           err.message || 
//                           'An unexpected error occurred';
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h6" gutterBottom fontWeight="600">
//           Upgrade to {selectedPlan?.plan}
//         </Typography>

//         <Card sx={{ p: 2, mb: 3, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
//           <CardElement
//             options={{
//               style: {
//                 base: {
//                   fontSize: '16px',
//                   color: '#424770',
//                   fontFamily: '"Inter", "Roboto", sans-serif',
//                   '::placeholder': {
//                     color: '#aab7c4',
//                   },
//                 },
//               },
//             }}
//           />
//         </Card>

//         {error && (
//           <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
//             {error}
//           </Alert>
//         )}
//       </Box>

//       <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
//         <Button 
//           onClick={onCancel} 
//           disabled={loading}
//           variant="outlined"
//         >
//           Cancel
//         </Button>
//         <Button
//           type="submit"
//           disabled={!stripe || loading}
//           variant="contained"
//           startIcon={loading ? <CircularProgress size={16} /> : <Payment />}
//         >
//           {loading ? 'Processing...' : `Subscribe to ${selectedPlan.plan}`}
//         </Button>
//       </Box>
//     </form>
//   );
// }

// // Plan Details Dialog Component
// function PlanDetailsDialog({ open, onClose, plan, currentSubscription, onUpgrade }) {
//   const theme = useTheme();
//   const isCurrentPlan = currentSubscription?.plan === plan?.key;
//   const isFreePlan = plan?.is_free;
//   const canUpgrade = !isFreePlan && !isCurrentPlan;

//   const getPlanLevel = () => {
//     if (!plan) return 'free';
//     if (plan.key.includes('starter')) return 'starter';
//     if (plan.key.includes('pro')) return 'pro';
//     if (plan.key.includes('enterprise')) return 'enterprise';
//     return 'free';
//   };

//   const planLevel = getPlanLevel();
//   const features = getPlanFeatures(plan?.key || '');
//   const highlights = getPlanHighlights(plan?.key || '');

//   const getPlanIcon = () => {
//     switch (planLevel) {
//       case 'starter': return <Rocket />;
//       case 'pro': return <Diamond />;
//       case 'enterprise': return <FaCrown style={{ fontSize: '20px' }} />;
//       default: return <Star />;
//     }
//   };

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: { borderRadius: '12px' }
//       }}
//     >
//       <DialogTitle sx={{ 
//         background: planLevel === 'starter' 
//           ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
//           : planLevel === 'pro'
//           ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
//           : planLevel === 'enterprise'
//           ? 'linear-gradient(135deg, #F59E0B, #D97706)'
//           : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
//         color: 'white',
//         textAlign: 'center'
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
//           {getPlanIcon()}
//           <Typography variant="h5" fontWeight="600">
//             {plan?.plan} - Full Features
//           </Typography>
//         </Box>
//         <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
//           {plan?.billing_cycle === 'trial' ? '15-day free trial' : 
//            plan?.is_free ? 'Free forever' : `${plan?.billing_cycle} billing`}
//         </Typography>
//       </DialogTitle>

//       <DialogContent sx={{ p: 3 }}>
//         {/* Highlights */}
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h6" gutterBottom fontWeight="600">
//             Key Highlights
//           </Typography>
//           <List dense>
//             {highlights.map((highlight, index) => (
//               <HighlightFeature key={index}>
//                 <ListItemIcon sx={{ minWidth: 32 }}>
//                   <CheckCircle color="primary" fontSize="small" />
//                 </ListItemIcon>
//                 <ListItemText 
//                   primary={highlight}
//                   primaryTypographyProps={{ variant: 'body2', fontWeight: '500' }}
//                 />
//               </HighlightFeature>
//             ))}
//           </List>
//         </Box>

//         <Divider sx={{ my: 2 }} />

//         {/* All Features */}
//         <Box>
//           <Typography variant="h6" gutterBottom fontWeight="600">
//             All Features Included
//           </Typography>
//           <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
//             {features.map((feature, index) => (
//               <FeatureItem key={index}>
//                 <ListItemIcon sx={{ minWidth: 32 }}>
//                   {feature.icon}
//                 </ListItemIcon>
//                 <ListItemText 
//                   primary={feature.text}
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </FeatureItem>
//             ))}
//           </List>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button onClick={onClose} variant="outlined">
//           Close
//         </Button>
//         <Button
//           variant={isCurrentPlan ? "outlined" : "contained"}
//           startIcon={isCurrentPlan ? <CheckCircle /> : <Upgrade />}
//           onClick={() => {
//             onUpgrade(plan);
//             onClose();
//           }}
//           disabled={!canUpgrade && !isCurrentPlan}
//         >
//           {isCurrentPlan ? 'Current Plan' : 
//            isFreePlan ? 'Current Plan' : 'Upgrade Now'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// // Simple Plan Card Component
// function PlanCard({ plan, currentSubscription, onUpgrade, onViewDetails }) {
//   const theme = useTheme();
//   const isCurrentPlan = currentSubscription?.plan === plan.key;
//   const isFreePlan = plan.is_free;
//   const canUpgrade = !isFreePlan && !isCurrentPlan;

//   // Get plan level for styling
//   const getPlanLevel = () => {
//     if (plan.key.includes('starter')) return 'starter';
//     if (plan.key.includes('pro')) return 'pro';
//     if (plan.key.includes('enterprise')) return 'enterprise';
//     return 'free';
//   };

//   const planLevel = getPlanLevel();
//   const highlights = getPlanHighlights(plan.key);

//   // Get plan icon
//   const getPlanIcon = () => {
//     switch (planLevel) {
//       case 'starter': return <Rocket />;
//       case 'pro': return <Diamond />;
//       case 'enterprise': return <FaCrown style={{ fontSize: '20px' }} />;
//       default: return <Star />;
//     }
//   };

//   return (
//     <SimplePlanCard featured={plan.featured} planlevel={planLevel}>
//       {/* Plan Header */}
//       <PlanHeader planlevel={planLevel}>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
//           {getPlanIcon()}
//           <Typography variant="h6" fontWeight="600">
//             {plan.plan}
//           </Typography>
//         </Box>
//         <Typography variant="body2" sx={{ opacity: 0.9 }}>
//           {plan.billing_cycle === 'trial' ? '15-day free trial' : 
//            plan.is_free ? 'Free forever' : `${plan.billing_cycle} billing`}
//         </Typography>

//         {plan.billing_cycle === 'yearly' && !plan.is_free && (
//           <Chip 
//             label="Save 17%" 
//             size="small"
//             sx={{ 
//               background: 'rgba(255,255,255,0.2)',
//               color: 'white',
//               fontWeight: '600',
//               mt: 1
//             }}
//           />
//         )}
//       </PlanHeader>

//       <CardContent sx={{ p: 2 }}>
//         {/* Price */}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <Typography variant="h5" fontWeight="700" gutterBottom>
//             {plan.is_free ? 'Free' : 'Paid'}
//           </Typography>
//         </Box>

//         {/* Highlights */}
//         <List dense sx={{ mb: 2 }}>
//           {highlights.map((highlight, index) => (
//             <FeatureItem key={index}>
//               <ListItemIcon sx={{ minWidth: 32 }}>
//                 <CheckCircle color="success" fontSize="small" />
//               </ListItemIcon>
//               <ListItemText 
//                 primary={highlight}
//                 primaryTypographyProps={{ variant: 'body2' }}
//               />
//             </FeatureItem>
//           ))}
//         </List>

//         {/* View Details Button */}
//         <Box sx={{ textAlign: 'center', mb: 2 }}>
//           <Button
//             size="small"
//             onClick={() => onViewDetails(plan)}
//             endIcon={<ExpandMore />}
//             sx={{ color: 'primary.main' }}
//           >
//             View All Features
//           </Button>
//         </Box>
//       </CardContent>

//       {/* Action Button */}
//       <CardActions sx={{ p: 2, pt: 0 }}>
//         <Button
//           fullWidth
//           variant={isCurrentPlan ? "outlined" : "contained"}
//           startIcon={isCurrentPlan ? <CheckCircle /> : <Upgrade />}
//           onClick={() => onUpgrade(plan)}
//           disabled={!canUpgrade && !isCurrentPlan}
//           size="small"
//         >
//           {isCurrentPlan ? 'Current Plan' : 
//            isFreePlan ? 'Current Plan' : 'Upgrade Now'}
//         </Button>
//       </CardActions>
//     </SimplePlanCard>
//   );
// }

// // Countdown Tab Component
// function CountdownTab({ subscription }) {
//   const [timeLeft, setTimeLeft] = useState({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0
//   });

//   const calculateTimeLeft = () => {
//     if (!subscription?.current_period_end) {
//       return { days: 0, hours: 0, minutes: 0, seconds: 0 };
//     }

//     const endDate = new Date(subscription.current_period_end);
//     const now = new Date();
//     const difference = endDate.getTime() - now.getTime();

//     if (difference <= 0) {
//       return { days: 0, hours: 0, minutes: 0, seconds: 0 };
//     }

//     return {
//       days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//       hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//       minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
//       seconds: Math.floor((difference % (1000 * 60)) / 1000)
//     };
//   };

//   const calculateProgress = () => {
//     if (!subscription?.current_period_start || !subscription?.current_period_end) {
//       return 0;
//     }

//     const start = new Date(subscription.current_period_start).getTime();
//     const end = new Date(subscription.current_period_end).getTime();
//     const now = new Date().getTime();

//     const total = end - start;
//     const elapsed = now - start;

//     return Math.min(100, Math.max(0, (elapsed / total) * 100));
//   };

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(calculateTimeLeft());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [subscription]);

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const isTrial = subscription?.type === 'trial';
//   const isActive = subscription?.is_active;
//   const progress = calculateProgress();

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <CountdownCard>
//         <Box sx={{ textAlign: 'center', mb: 4 }}>
//           <AccessTime sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
//           <Typography variant="h4" gutterBottom fontWeight="700">
//             {isTrial ? 'Trial Period Countdown' : 'Subscription Countdown'}
//           </Typography>
//           <Typography variant="h6" color="text.secondary">
//             {isTrial 
//               ? 'Your free trial ends in' 
//               : 'Your current billing period ends in'}
//           </Typography>
//         </Box>

//         {/* Countdown Timer */}
//         <CountdownTimer>
//           <TimeUnit>
//             <Typography variant="h3" fontWeight="700" color="primary.main">
//               {timeLeft.days}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Days
//             </Typography>
//           </TimeUnit>
//           <TimeUnit>
//             <Typography variant="h3" fontWeight="700" color="primary.main">
//               {timeLeft.hours}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Hours
//             </Typography>
//           </TimeUnit>
//           <TimeUnit>
//             <Typography variant="h3" fontWeight="700" color="primary.main">
//               {timeLeft.minutes}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Minutes
//             </Typography>
//           </TimeUnit>
//           <TimeUnit>
//             <Typography variant="h3" fontWeight="700" color="primary.main">
//               {timeLeft.seconds}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Seconds
//             </Typography>
//           </TimeUnit>
//         </CountdownTimer>

//         {/* Progress Bar */}
//         <Box sx={{ mb: 4 }}>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//             <Typography variant="body2" color="text.secondary">
//               Period Progress
//             </Typography>
//             <Typography variant="body2" color="primary.main" fontWeight="600">
//               {Math.round(progress)}%
//             </Typography>
//           </Box>
//           <LinearProgress 
//             variant="determinate" 
//             value={progress} 
//             sx={{ 
//               height: 8, 
//               borderRadius: 4,
//               backgroundColor: 'background.default'
//             }}
//           />
//         </Box>

//         {/* Subscription Details */}
//         <Grid container spacing={3} sx={{ mb: 3 }}>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 2, textAlign: 'center' }}>
//               <CalendarToday color="primary" sx={{ mb: 1 }} />
//               <Typography variant="body2" color="text.secondary">
//                 Period Start
//               </Typography>
//               <Typography variant="body1" fontWeight="600">
//                 {formatDate(subscription?.current_period_start)}
//               </Typography>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <Card sx={{ p: 2, textAlign: 'center' }}>
//               <Timer color="secondary" sx={{ mb: 1 }} />
//               <Typography variant="body2" color="text.secondary">
//                 Period End
//               </Typography>
//               <Typography variant="body1" fontWeight="600">
//                 {formatDate(subscription?.current_period_end)}
//               </Typography>
//             </Card>
//           </Grid>
//         </Grid>

//         {/* Status Info */}
//         <Alert 
//           severity={isActive ? "info" : "warning"}
//           sx={{ borderRadius: '8px' }}
//         >
//           <Typography variant="body2">
//             <strong>Current Status:</strong> {subscription?.status?.toUpperCase()} • 
//             <strong> Plan:</strong> {subscription?.plan?.toUpperCase()} • 
//             <strong> Type:</strong> {isTrial ? 'TRIAL' : subscription?.type?.toUpperCase()}
//           </Typography>
//         </Alert>

//         {isTrial && (
//           <Alert 
//             severity="warning" 
//             sx={{ mt: 2, borderRadius: '8px' }}
//           >
//             <Typography variant="body2">
//               <strong>Heads up!</strong> Your trial period will end soon. Upgrade to a paid plan to continue 
//               accessing all features without interruption.
//             </Typography>
//           </Alert>
//         )}
//       </CountdownCard>
//     </Container>
//   );
// }

// // Tab Panel Component
// function TabPanel({ children, value, index, ...other }) {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`subscription-tabpanel-${index}`}
//       aria-labelledby={`subscription-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
//     </div>
//   );
// }

// // Main Subscription Component
// function Subscription() {
//   const [tabValue, setTabValue] = useState(0);
//   const [subscription, setSubscription] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [upgradeDialog, setUpgradeDialog] = useState(false);
//   const [detailsDialog, setDetailsDialog] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [billingCycle, setBillingCycle] = useState('monthly');
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   // Fetch subscription data
//   const fetchSubscriptionData = async () => {
//     try {
//       setLoading(true);

//       const subResponse = await axios.get(`${API_BASE_URL}/subscriptions/me`, {
//         headers: getAuthHeader()
//       });

//       setSubscription(subResponse.data);

//       const plansResponse = await axios.get(`${API_BASE_URL}/subscriptions/all-plans`, {
//         headers: getAuthHeader()
//       });

//       // Mark featured plan and filter by billing cycle
//       const enhancedPlans = (plansResponse.data.plans || [])
//         .filter(plan => plan.billing_cycle === billingCycle || plan.is_free || plan.billing_cycle === 'trial')
//         .map(plan => ({
//           ...plan,
//           featured: plan.key === 'pro_monthly' || plan.key === 'pro_yearly'
//         }));

//       setPlans(enhancedPlans);

//     } catch (error) {
//       console.error('Error fetching subscription data:', error);
//       showSnackbar('Error loading subscription data', 'error');
//       setSubscription({
//         type: 'free',
//         plan: 'free',
//         status: 'active',
//         is_active: true,
//         is_trial: false
//       });
//       setPlans([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpgrade = (plan) => {
//     if (plan.is_free) {
//       showSnackbar('You are already on the free plan', 'info');
//       return;
//     }
//     setSelectedPlan(plan);
//     setUpgradeDialog(true);
//   };

//   const handleViewDetails = (plan) => {
//     setSelectedPlan(plan);
//     setDetailsDialog(true);
//   };

//   const handleUpgradeSuccess = (subscriptionData) => {
//     setUpgradeDialog(false);
//     const successMessage = subscriptionData.message || 
//                           subscriptionData.detail || 
//                           'Subscription upgraded successfully!';
//     showSnackbar(successMessage, 'success');
//     fetchSubscriptionData();
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   useEffect(() => {
//     fetchSubscriptionData();
//   }, [billingCycle]);

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ textAlign: 'center', mb: 4 }}>
//         <Typography variant="h4" fontWeight="700" gutterBottom>
//           Subscription Management
//         </Typography>
//         <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
//           Manage your plans and track your subscription timeline
//         </Typography>
//       </Box>

//       {/* Tabs */}
//       <Card sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
//         <Tabs
//           value={tabValue}
//           onChange={(e, newValue) => setTabValue(newValue)}
//           sx={{ 
//             borderBottom: 1, 
//             borderColor: 'divider',
//             '& .MuiTab-root': {
//               fontSize: '1rem',
//               fontWeight: '500',
//               textTransform: 'none',
//               py: 2,
//               minWidth: { xs: 'auto', md: 200 },
//             }
//           }}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           <Tab 
//             icon={<CardMembership />} 
//             label="Plans & Pricing" 
//             id="subscription-tab-0"
//           />
//           <Tab 
//             icon={<AccessTime />} 
//             label="Countdown Timer" 
//             id="subscription-tab-1"
//           />
//         </Tabs>

//         {/* Tab 1: Plans & Pricing */}
//         <TabPanel value={tabValue} index={0}>
//           {/* Billing Toggle */}
//           <Box sx={{ textAlign: 'center', mb: 4 }}>
//             <Paper elevation={0} sx={{ 
//               display: 'inline-flex', 
//               p: 1, 
//               borderRadius: '8px',
//               border: `1px solid ${theme.palette.divider}`
//             }}>
//               <ToggleButtonGroup
//                 value={billingCycle}
//                 exclusive
//                 onChange={(e, newCycle) => newCycle && setBillingCycle(newCycle)}
//                 aria-label="billing cycle"
//                 size="small"
//               >
//                 <ToggleButton value="monthly">
//                   Monthly
//                 </ToggleButton>
//                 <ToggleButton value="yearly">
//                   Yearly 
//                   <Chip 
//                     label="Save 17%" 
//                     size="small" 
//                     color="success"
//                     sx={{ ml: 1, height: 20 }} 
//                   />
//                 </ToggleButton>
//               </ToggleButtonGroup>
//             </Paper>
//           </Box>

//           {/* Plans Row - Single Row Layout */}
//           <Box
//   sx={{
//     display: "flex",
//     gap: 2,
//     justifyContent: {
//       xs: "center",
//       sm: "center",
//       md: "flex-start",
//     },
//     alignItems: "flex-start",
//     flexWrap: {
//       xs: "wrap",
//       sm: "wrap",
//       md: "nowrap",
//     },
//     overflowX: {
//       xs: "visible",
//       sm: "visible",
//       md: "auto",
//     },
//     scrollBehavior: "smooth",
//     pb: 2,
//     minHeight: 500,

//     px: 2,   // left-right padding
//   }}
// >

//             {plans.map((plan) => (
//               <PlanCard 
//                 key={plan.key}
//                 plan={plan}
//                 currentSubscription={subscription}
//                 onUpgrade={handleUpgrade}
//                 onViewDetails={handleViewDetails}
//               />
//             ))}
//           </Box>

//           {/* Current Plan Info */}
//           {subscription && (
//             <Fade in={true}>
//               <Paper sx={{ p: 3, mt: 4, textAlign: 'center', borderRadius: '8px' }}>
//                 <Typography variant="h6" gutterBottom>
//                   Current Plan: <strong>{subscription.plan?.toUpperCase()}</strong>
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {subscription.type === 'trial' ? 'Free Trial - ' : ''}
//                   Status: {subscription.status}
//                 </Typography>
//               </Paper>
//             </Fade>
//           )}
//         </TabPanel>

//         {/* Tab 2: Countdown Timer */}
//         <TabPanel value={tabValue} index={1}>
//           <CountdownTab subscription={subscription} />
//         </TabPanel>
//       </Card>

//       {/* Upgrade Dialog */}
//       <Dialog 
//         open={upgradeDialog} 
//         onClose={() => setUpgradeDialog(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>
//           Upgrade to {selectedPlan?.plan}
//         </DialogTitle>
//         <DialogContent>
//           <Elements stripe={stripePromise}>
//             <PaymentForm
//               selectedPlan={selectedPlan}
//               onSuccess={handleUpgradeSuccess}
//               onCancel={() => setUpgradeDialog(false)}
//             />
//           </Elements>
//         </DialogContent>
//       </Dialog>

//       {/* Plan Details Dialog */}
//       <PlanDetailsDialog
//         open={detailsDialog}
//         onClose={() => setDetailsDialog(false)}
//         plan={selectedPlan}
//         currentSubscription={subscription}
//         onUpgrade={handleUpgrade}
//       />

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
//       >
//         <Alert 
//           onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
//           severity={snackbar.severity}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// }

// export default Subscription;



import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Fade,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Collapse,
  CardActions,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  Upgrade,
  CardMembership,
  Timer,
  Star,
  Rocket,
  Diamond,
  WorkspacePremium,
  Group,
  Analytics,
  SupportAgent,
  Storage,
  TrendingUp,
  Api,
  Palette,
  Chat,
  SmartToy,
  AutoAwesome,
  Image,
  Email,
  Download,
  Upload,
  People,
  Payment,
  History,
  Psychology,
  Campaign,
  HowToReg,
  FilterList,
  Security,
  PersonSearch,
  ManageSearch,
  Shield,
  Memory,
  Dashboard,
  BusinessCenter,
  IntegrationInstructions,
  WhatsApp,
  Notifications,
  Hub,
  Rule,
  BarChart,
  ShowChart,
  LockOpen,
  TravelExplore,
  GroupWork,
  PhotoLibrary,
  VerifiedUser,
  ContactPhone,
  AccessTime,
  CalendarToday
} from '@mui/icons-material';
import { FaCrown } from "react-icons/fa";
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Styled Components
const SimplePlanCard = styled(Card)(({ theme, featured, planlevel }) => ({
  maxWidth: 320,
  minWidth: 320,
  border: featured ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const PlanHeader = styled(Box)(({ theme, planlevel }) => ({
  background: planlevel === 'starter'
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : planlevel === 'pro'
      ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
      : planlevel === 'enterprise'
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  color: 'white',
  padding: theme.spacing(2),
  textAlign: 'center',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
}));

const FeatureItem = styled(ListItem)(({ theme }) => ({
  padding: '4px 0',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const HighlightFeature = styled(ListItem)(({ theme }) => ({
  padding: '6px 0',
  background: alpha(theme.palette.primary.main, 0.03),
  margin: '2px 0',
  borderRadius: '4px',
  borderLeft: `3px solid ${theme.palette.primary.main}`,
}));

const CountdownCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: '12px',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const CountdownTimer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  margin: theme.spacing(3, 0),
}));

const TimeUnit = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: '8px',
  padding: theme.spacing(2),
  minWidth: 80,
  boxShadow: theme.shadows[2],
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

// Get features based on role AND plan
const getFeatures = (planKey, userRole = 'brand') => {
  const baseFeatures = {
    free_trial: {
      brand: [
        { text: "15-day free trial", icon: <Timer fontSize="small" /> },
        { text: "1 active campaign", icon: <Rocket fontSize="small" /> },
        { text: "Up to 10 influencers", icon: <Group fontSize="small" /> },
        { text: "Basic analytics", icon: <Analytics fontSize="small" /> },
        { text: "Email support", icon: <SupportAgent fontSize="small" /> },
      ],
      influencer: [
        { text: "15-day free trial", icon: <Timer fontSize="small" /> },
        { text: "Basic profile listing", icon: <VerifiedUser fontSize="small" /> },
        { text: "Apply to 3 campaigns/month", icon: <Campaign fontSize="small" /> },
        { text: "Basic analytics", icon: <Analytics fontSize="small" /> },
        { text: "Email support", icon: <SupportAgent fontSize="small" /> },
      ]
    },

    starter_monthly: {
      brand: [
        { text: "5 active campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Up to 50 influencers", icon: <Group fontSize="small" /> },
        { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
        { text: "Priority email support", icon: <SupportAgent fontSize="small" /> },
        { text: "Collaboration chat (10 users)", icon: <Chat fontSize="small" /> },
      ],
      influencer: [
        { text: "Apply to 10 campaigns/month", icon: <Campaign fontSize="small" /> },
        { text: "Verified profile badge", icon: <VerifiedUser fontSize="small" /> },
        { text: "Portfolio showcase (10 items)", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
        { text: "Priority email support", icon: <SupportAgent fontSize="small" /> },
      ]
    },

    starter_yearly: {
      brand: [
        { text: "5 active campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Up to 50 influencers", icon: <Group fontSize="small" /> },
        { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
        { text: "Priority email support", icon: <SupportAgent fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ],
      influencer: [
        { text: "Apply to 10 campaigns/month", icon: <Campaign fontSize="small" /> },
        { text: "Verified profile badge", icon: <VerifiedUser fontSize="small" /> },
        { text: "Portfolio showcase (10 items)", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Advanced analytics", icon: <Analytics fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ]
    },

    pro_monthly: {
      brand: [
        { text: "20 active campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Up to 200 influencers", icon: <Group fontSize="small" /> },
        { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
        { text: "Phone & email support", icon: <SupportAgent fontSize="small" /> },
        { text: "API access", icon: <Api fontSize="small" /> },
      ],
      influencer: [
        { text: "Apply to 30 campaigns/month", icon: <Campaign fontSize="small" /> },
        { text: "Premium verified badge", icon: <VerifiedUser fontSize="small" /> },
        { text: "Portfolio showcase (50 items)", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
        { text: "Priority support", icon: <SupportAgent fontSize="small" /> },
      ]
    },

    pro_yearly: {
      brand: [
        { text: "20 active campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Up to 200 influencers", icon: <Group fontSize="small" /> },
        { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
        { text: "Phone & email support", icon: <SupportAgent fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ],
      influencer: [
        { text: "Apply to 30 campaigns/month", icon: <Campaign fontSize="small" /> },
        { text: "Premium verified badge", icon: <VerifiedUser fontSize="small" /> },
        { text: "Portfolio showcase (50 items)", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Premium analytics", icon: <Analytics fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ]
    },

    enterprise_monthly: {
      brand: [
        { text: "Unlimited campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Unlimited influencers", icon: <Group fontSize="small" /> },
        { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
        { text: "24/7 dedicated support", icon: <SupportAgent fontSize="small" /> },
        { text: "Full API access", icon: <Api fontSize="small" /> },
      ],
      influencer: [
        { text: "Unlimited campaign applications", icon: <Campaign fontSize="small" /> },
        { text: "Enterprise verified badge", icon: <WorkspacePremium fontSize="small" /> },
        { text: "Unlimited portfolio items", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
        { text: "24/7 dedicated support", icon: <SupportAgent fontSize="small" /> },
      ]
    },

    enterprise_yearly: {
      brand: [
        { text: "Unlimited campaigns", icon: <Rocket fontSize="small" /> },
        { text: "Unlimited influencers", icon: <Group fontSize="small" /> },
        { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
        { text: "24/7 dedicated support", icon: <SupportAgent fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ],
      influencer: [
        { text: "Unlimited campaign applications", icon: <Campaign fontSize="small" /> },
        { text: "Enterprise verified badge", icon: <WorkspacePremium fontSize="small" /> },
        { text: "Unlimited portfolio items", icon: <PhotoLibrary fontSize="small" /> },
        { text: "Enterprise analytics", icon: <Analytics fontSize="small" /> },
        { text: "Save with yearly billing", icon: <TrendingUp fontSize="small" /> },
      ]
    }
  };

  const plan = planKey.replace('_monthly', '').replace('_yearly', '');
  const planKeyNormalized = planKey.includes('yearly') ? `${plan}_yearly` : `${plan}_monthly`;

  const features = baseFeatures[planKeyNormalized] || baseFeatures[planKey] || {};
  return features[userRole] || features.brand || [];
};

// Get highlights based on role AND plan
const getHighlights = (planKey, userRole = 'brand') => {
  const highlights = {
    free_trial: {
      brand: [
        "15-day free trial",
        "1 active campaign",
        "Up to 10 influencers",
        "Basic analytics",
        "Email support"
      ],
      influencer: [
        "15-day free trial",
        "Basic profile listing",
        "Apply to 3 campaigns/month",
        "Basic analytics",
        "Email support"
      ]
    },
    starter_monthly: {
      brand: [
        "5 active campaigns",
        "Up to 50 influencers",
        "Collaboration chat (10 users)",
        "Priority email support",
        "Advanced analytics"
      ],
      influencer: [
        "Apply to 10 campaigns/month",
        "Verified profile badge",
        "Portfolio showcase (10 items)",
        "Priority email support",
        "Advanced analytics"
      ]
    },
    starter_yearly: {
      brand: [
        "5 active campaigns",
        "Up to 50 influencers",
        "Save 17% with yearly",
        "Priority email support",
        "Advanced analytics"
      ],
      influencer: [
        "Apply to 10 campaigns/month",
        "Verified profile badge",
        "Save 17% with yearly",
        "Priority email support",
        "Advanced analytics"
      ]
    },
    pro_monthly: {
      brand: [
        "20 active campaigns",
        "Up to 200 influencers",
        "API access",
        "Phone & email support",
        "Premium analytics"
      ],
      influencer: [
        "Apply to 30 campaigns/month",
        "Premium verified badge",
        "Portfolio showcase (50 items)",
        "Priority support",
        "Premium analytics"
      ]
    },
    pro_yearly: {
      brand: [
        "20 active campaigns",
        "Up to 200 influencers",
        "Save 17% with yearly",
        "Phone & email support",
        "Premium analytics"
      ],
      influencer: [
        "Apply to 30 campaigns/month",
        "Premium verified badge",
        "Save 17% with yearly",
        "Priority support",
        "Premium analytics"
      ]
    },
    enterprise_monthly: {
      brand: [
        "Unlimited campaigns & influencers",
        "Full API access",
        "24/7 dedicated support",
        "Enterprise analytics",
        "Custom branding"
      ],
      influencer: [
        "Unlimited campaign applications",
        "Enterprise verified badge",
        "24/7 dedicated support",
        "Unlimited portfolio items",
        "Enterprise analytics"
      ]
    },
    enterprise_yearly: {
      brand: [
        "Unlimited campaigns & influencers",
        "Full API access",
        "Save 17% with yearly",
        "24/7 dedicated support",
        "Custom branding"
      ],
      influencer: [
        "Unlimited campaign applications",
        "Enterprise verified badge",
        "Save 17% with yearly",
        "24/7 dedicated support",
        "Enterprise analytics"
      ]
    }
  };

  const plan = planKey.replace('_monthly', '').replace('_yearly', '');
  const planKeyNormalized = planKey.includes('yearly') ? `${plan}_yearly` : `${plan}_monthly`;

  const planHighlights = highlights[planKeyNormalized] || highlights[planKey] || {};
  return planHighlights[userRole] || planHighlights.brand || [];
};

// Get plan display name based on role
const getPlanDisplayName = (planKey, userRole = 'brand') => {
  const planMap = {
    free_trial: 'Free Trial',
    starter_monthly: userRole === 'influencer' ? 'Basic' : 'Starter',
    starter_yearly: userRole === 'influencer' ? 'Basic' : 'Starter',
    pro_monthly: userRole === 'influencer' ? 'Pro' : 'Pro',
    pro_yearly: userRole === 'influencer' ? 'Pro' : 'Pro',
    enterprise_monthly: userRole === 'influencer' ? 'Premium' : 'Enterprise',
    enterprise_yearly: userRole === 'influencer' ? 'Premium' : 'Enterprise',
  };

  return planMap[planKey] || planKey;
};

// Get plan level for styling
const getPlanLevel = (planKey) => {
  if (planKey.includes('starter')) return 'starter';
  if (planKey.includes('pro')) return 'pro';
  if (planKey.includes('enterprise')) return 'enterprise';
  return 'free';
};

// Auth header helper
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Payment Form Component (same as before)
function PaymentForm({ selectedPlan, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (pmError) {
        setError(pmError.message);
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/subscriptions/create`, {
        plan_key: selectedPlan.key,
        payment_method_id: paymentMethod.id
      }, {
        headers: getAuthHeader()
      });

      const result = response.data;

      if (result.client_secret) {
        if (result.client_secret.startsWith('seti_')) {
          const { error: setupError } = await stripe.confirmCardSetup(result.client_secret);
          if (setupError) {
            setError(setupError.message);
            setLoading(false);
            return;
          }
        } else if (result.client_secret.startsWith('pi_')) {
          const { error: paymentError } = await stripe.confirmCardPayment(result.client_secret);
          if (paymentError) {
            setError(paymentError.message);
            setLoading(false);
            return;
          }
        }
      }

      onSuccess(result);

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          Upgrade to {selectedPlan?.plan}
        </Typography>

        <Card sx={{ p: 2, mb: 3, borderRadius: '8px', border: '1px solid', borderColor: 'divider' }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: '"Inter", "Roboto", sans-serif',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <Payment />}
        >
          {loading ? 'Processing...' : `Subscribe to ${selectedPlan.plan}`}
        </Button>
      </Box>
    </form>
  );
}

// Plan Details Dialog Component
function PlanDetailsDialog({ open, onClose, plan, currentSubscription, onUpgrade, userRole }) {
  const theme = useTheme();
  const isCurrentPlan = currentSubscription?.plan === plan?.key;
  const isFreePlan = plan?.is_free;
  const canUpgrade = !isFreePlan && !isCurrentPlan;

  const planLevel = getPlanLevel(plan?.key || 'free');
  const features = getFeatures(plan?.key || '', userRole);
  const highlights = getHighlights(plan?.key || '', userRole);

  const getPlanIcon = () => {
    switch (planLevel) {
      case 'starter': return <Rocket />;
      case 'pro': return <Diamond />;
      case 'enterprise': return <FaCrown style={{ fontSize: '20px' }} />;
      default: return <Star />;
    }
  };

  const planTitle = getPlanDisplayName(plan?.key || '', userRole);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px' }
      }}
    >
      <DialogTitle sx={{
        background: planLevel === 'starter'
          ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
          : planLevel === 'pro'
            ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
            : planLevel === 'enterprise'
              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
              : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
        color: 'white',
        textAlign: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {getPlanIcon()}
          <Typography variant="h5" fontWeight="600">
            {planTitle} - Full Features
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
          {plan?.billing_cycle === 'trial' ? '15-day free trial' :
            plan?.is_free ? 'Free forever' : `${plan?.billing_cycle} billing`}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Highlights */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Key Highlights
          </Typography>
          <List dense>
            {highlights.map((highlight, index) => (
              <HighlightFeature key={index}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={highlight}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: '500' }}
                />
              </HighlightFeature>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* All Features */}
        <Box>
          <Typography variant="h6" gutterBottom fontWeight="600">
            All Features Included
          </Typography>
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {features.map((feature, index) => (
              <FeatureItem key={index}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText
                  primary={feature.text}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </FeatureItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          startIcon={isCurrentPlan ? <CheckCircle /> : <Upgrade />}
          onClick={() => {
            onUpgrade(plan);
            onClose();
          }}
          disabled={!canUpgrade && !isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' :
            isFreePlan ? 'Current Plan' : 'Upgrade Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Simple Plan Card Component
function PlanCard({ plan, currentSubscription, onUpgrade, onViewDetails, userRole }) {
  const theme = useTheme();
  const isCurrentPlan = currentSubscription?.plan === plan.key;
  const isFreePlan = plan.is_free;
  const canUpgrade = !isFreePlan && !isCurrentPlan;

  const planLevel = getPlanLevel(plan.key);
  const highlights = getHighlights(plan.key, userRole);
  const planTitle = getPlanDisplayName(plan.key, userRole);

  // Get plan icon
  const getPlanIcon = () => {
    switch (planLevel) {
      case 'starter': return <Rocket />;
      case 'pro': return <Diamond />;
      case 'enterprise': return <FaCrown style={{ fontSize: '20px' }} />;
      default: return <Star />;
    }
  };

  return (
    <SimplePlanCard featured={plan.featured} planlevel={planLevel}>
      {/* Plan Header */}
      <PlanHeader planlevel={planLevel}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          {getPlanIcon()}
          <Typography variant="h6" fontWeight="600">
            {planTitle}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {plan.billing_cycle === 'trial' ? '15-day free trial' :
            plan.is_free ? 'Free forever' : `${plan.billing_cycle} billing`}
        </Typography>

        {plan.billing_cycle === 'yearly' && !plan.is_free && (
          <Chip
            label="Save 17%"
            size="small"
            sx={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: '600',
              mt: 1
            }}
          />
        )}
      </PlanHeader>

      <CardContent sx={{ p: 2 }}>
        {/* Price */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            {plan.is_free ? 'Free' : 'Paid'}
          </Typography>
        </Box>

        {/* Highlights */}
        <List dense sx={{ mb: 2 }}>
          {highlights.map((highlight, index) => (
            <FeatureItem key={index}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={highlight}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </FeatureItem>
          ))}
        </List>

        {/* View Details Button */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button
            size="small"
            onClick={() => onViewDetails(plan)}
            endIcon={<ExpandMore />}
            sx={{ color: 'primary.main' }}
          >
            View All Features
          </Button>
        </Box>
      </CardContent>

      {/* Action Button */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isCurrentPlan ? "outlined" : "contained"}
          startIcon={isCurrentPlan ? <CheckCircle /> : <Upgrade />}
          onClick={() => onUpgrade(plan)}
          disabled={!canUpgrade && !isCurrentPlan}
          size="small"
        >
          {isCurrentPlan ? 'Current Plan' :
            isFreePlan ? 'Current Plan' : 'Upgrade Now'}
        </Button>
      </CardActions>
    </SimplePlanCard>
  );
}

// Countdown Tab Component (same as before)
function CountdownTab({ subscription }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const calculateTimeLeft = () => {
    if (!subscription?.current_period_end) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const difference = endDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  const calculateProgress = () => {
    if (!subscription?.current_period_start || !subscription?.current_period_end) {
      return 0;
    }

    const start = new Date(subscription.current_period_start).getTime();
    const end = new Date(subscription.current_period_end).getTime();
    const now = new Date().getTime();

    const total = end - start;
    const elapsed = now - start;

    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTrial = subscription?.type === 'trial';
  const isActive = subscription?.is_active;
  const progress = calculateProgress();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <CountdownCard>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccessTime sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="700">
            {isTrial ? 'Trial Period Countdown' : 'Subscription Countdown'}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {isTrial
              ? 'Your free trial ends in'
              : 'Your current billing period ends in'}
          </Typography>
        </Box>

        {/* Countdown Timer */}
        <CountdownTimer>
          <TimeUnit>
            <Typography variant="h3" fontWeight="700" color="primary.main">
              {timeLeft.days}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Days
            </Typography>
          </TimeUnit>
          <TimeUnit>
            <Typography variant="h3" fontWeight="700" color="primary.main">
              {timeLeft.hours}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hours
            </Typography>
          </TimeUnit>
          <TimeUnit>
            <Typography variant="h3" fontWeight="700" color="primary.main">
              {timeLeft.minutes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Minutes
            </Typography>
          </TimeUnit>
          <TimeUnit>
            <Typography variant="h3" fontWeight="700" color="primary.main">
              {timeLeft.seconds}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seconds
            </Typography>
          </TimeUnit>
        </CountdownTimer>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Period Progress
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight="600">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'background.default'
            }}
          />
        </Box>

        {/* Subscription Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <CalendarToday color="primary" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Period Start
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {formatDate(subscription?.current_period_start)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Timer color="secondary" sx={{ mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Period End
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {formatDate(subscription?.current_period_end)}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Status Info */}
        <Alert
          severity={isActive ? "info" : "warning"}
          sx={{ borderRadius: '8px' }}
        >
          <Typography variant="body2">
            <strong>Current Status:</strong> {subscription?.status?.toUpperCase()} •
            <strong> Plan:</strong> {subscription?.plan?.toUpperCase()} •
            <strong> Type:</strong> {isTrial ? 'TRIAL' : subscription?.type?.toUpperCase()}
          </Typography>
        </Alert>

        {isTrial && (
          <Alert
            severity="warning"
            sx={{ mt: 2, borderRadius: '8px' }}
          >
            <Typography variant="body2">
              <strong>Heads up!</strong> Your trial period will end soon. Upgrade to a paid plan to continue
              accessing all features without interruption.
            </Typography>
          </Alert>
        )}
      </CountdownCard>
    </Container>
  );
}

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Main Subscription Component
function Subscription() {
  const [userRole, setUserRole] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeDialog, setUpgradeDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [billingCycle, setBillingCycle] = useState('monthly');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: getAuthHeader()
        });
        setUserRole(res.data.role);  // "brand" or "influencer"
      } catch (e) {
        console.error("Failed to load user role", e);
      }
    };

    fetchRole();
  }, []);

  // Fetch subscription data
  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      const subResponse = await axios.get(`${API_BASE_URL}/subscriptions/me`, {
        headers: getAuthHeader()
      });

      setSubscription(subResponse.data);

      const plansResponse = await axios.get(`${API_BASE_URL}/subscriptions/all-plans`, {
        headers: getAuthHeader()
      });

      // Get ALL plans (same for everyone)
      const allPlans = plansResponse.data.plans || [];

      // Filter based on billing cycle (show monthly/yearly options)
      const filteredPlans = allPlans.filter(plan =>
        plan.billing_cycle === billingCycle ||
        plan.is_free ||
        plan.billing_cycle === 'trial'
      );

      // Mark featured plan (Pro is usually featured)
      const enhancedPlans = filteredPlans.map(plan => ({
        ...plan,
        // Update display name based on user role
        plan: getPlanDisplayName(plan.key, userRole),
        featured: plan.key.includes('pro_')
      }));

      setPlans(enhancedPlans);

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      showSnackbar('Error loading subscription data', 'error');
      setSubscription({
        type: 'free',
        plan: 'free',
        status: 'active',
        is_active: true,
        is_trial: false
      });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    if (plan.is_free) {
      showSnackbar('You are already on the free plan', 'info');
      return;
    }
    setSelectedPlan(plan);
    setUpgradeDialog(true);
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setDetailsDialog(true);
  };

  const handleUpgradeSuccess = (subscriptionData) => {
    setUpgradeDialog(false);
    const successMessage = subscriptionData.message ||
      subscriptionData.detail ||
      'Subscription upgraded successfully!';
    showSnackbar(successMessage, 'success');
    fetchSubscriptionData();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (userRole) {
      fetchSubscriptionData();
    }
  }, [userRole, billingCycle]);

  if (loading || !userRole) {
    return (
      // <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      //   <CircularProgress />
      // </Box>
      <div className="brand-dashboard-loader">
        <div className="brand-loader-spinner"></div>
        <p>Loading your Subscription...</p>
      </div>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Subscription Plans
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {userRole === 'influencer'
            ? 'Choose the perfect plan for your influencer journey'
            : 'Select the right plan for your brand needs'}
        </Typography>

        {/* Role Indicator */}
        <Chip
          label={`${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Plan`}
          color={userRole === 'influencer' ? 'warning' : 'primary'}
          variant="outlined"
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: '500',
              textTransform: 'none',
              py: 2,
              minWidth: { xs: 'auto', md: 200 },
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<CardMembership />}
            label="Plans & Pricing"
            id="subscription-tab-0"
          />
          <Tab
            icon={<AccessTime />}
            label="Countdown Timer"
            id="subscription-tab-1"
          />
        </Tabs>

        {/* Tab 1: Plans & Pricing */}
        <TabPanel value={tabValue} index={0}>
          {/* Billing Toggle */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Paper elevation={0} sx={{
              display: 'inline-flex',
              p: 1,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`
            }}>
              <ToggleButtonGroup
                value={billingCycle}
                exclusive
                onChange={(e, newCycle) => newCycle && setBillingCycle(newCycle)}
                aria-label="billing cycle"
                size="small"
              >
                <ToggleButton value="monthly">
                  Monthly
                </ToggleButton>
                <ToggleButton value="yearly">
                  Yearly
                  <Chip
                    label="Save 17%"
                    size="small"
                    color="success"
                    sx={{ ml: 1, height: 20 }}
                  />
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
          </Box>

          {/* Plans Row - Single Row Layout */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: {
                xs: "center",
                sm: "center",
                md: "flex-start",
              },
              alignItems: "flex-start",
              flexWrap: {
                xs: "wrap",
                sm: "wrap",
                md: "nowrap",
              },
              overflowX: {
                xs: "visible",
                sm: "visible",
                md: "auto",
              },
              scrollBehavior: "smooth",
              pb: 2,
              minHeight: 500,
              px: 2,
            }}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                currentSubscription={subscription}
                onUpgrade={handleUpgrade}
                onViewDetails={handleViewDetails}
                userRole={userRole}
              />
            ))}
          </Box>

          {/* Current Plan Info */}
          {subscription && (
            <Fade in={true}>
              <Paper sx={{ p: 3, mt: 4, textAlign: 'center', borderRadius: '8px' }}>
                <Typography variant="h6" gutterBottom>
                  Current Plan: <strong>{getPlanDisplayName(subscription.plan, userRole)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscription.type === 'trial' ? 'Free Trial - ' : ''}
                  Status: {subscription.status}
                </Typography>
              </Paper>
            </Fade>
          )}
        </TabPanel>

        {/* Tab 2: Countdown Timer */}
        <TabPanel value={tabValue} index={1}>
          <CountdownTab subscription={subscription} />
        </TabPanel>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialog}
        onClose={() => setUpgradeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upgrade to {selectedPlan?.plan}
        </DialogTitle>
        <DialogContent>
          <Elements stripe={stripePromise}>
            <PaymentForm
              selectedPlan={selectedPlan}
              onSuccess={handleUpgradeSuccess}
              onCancel={() => setUpgradeDialog(false)}
            />
          </Elements>
        </DialogContent>
      </Dialog>

      {/* Plan Details Dialog */}
      <PlanDetailsDialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        plan={selectedPlan}
        currentSubscription={subscription}
        onUpgrade={handleUpgrade}
        userRole={userRole}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Subscription;