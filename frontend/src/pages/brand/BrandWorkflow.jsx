import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCheckCircle, FaUser, FaBullhorn, FaClipboardList, 
  FaFileContract, FaFileVideo, FaDollarSign, FaRocket,
  FaChartLine, FaUsers, FaFileAlt, FaStar, FaArrowRight,
  FaBell, FaSync, FaExclamationTriangle, FaCalendar,
  FaMedal, FaTrendingUp, FaLightbulb, FaShieldAlt
} from "react-icons/fa";
import { 
  Box, Typography, Paper, Chip, Button, LinearProgress,
  Card, CardContent, Avatar, Tooltip, IconButton,
  Badge, Alert, Snackbar, CircularProgress
} from "@mui/material";
import { FaArrowUp } from "react-icons/fa";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { campaignAPI  } from "../../services/api";
import profileAPI from "../../services/profileAPI";

// Styled Components
const WorkflowContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#2563eb',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '20px',
  },
}));

const StepCard = styled(motion.div)(({ theme, completed, active, urgent }) => ({
  background: completed 
    ? 'linear-gradient(135deg, #4CAF50, #66BB6A)'
    : active
    ? 'linear-gradient(135deg, #2196F3, #1976D2)'
    : urgent
    ? 'linear-gradient(135deg, #FF9800, #F57C00)'
    : 'rgba(255, 255, 255, 0.9)',
  color: completed || active || urgent ? 'white' : theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${
    completed ? '#4CAF50' : 
    active ? '#2196F3' : 
    urgent ? '#FF9800' : 
    'rgba(0, 0, 0, 0.1)'
  }`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const ProgressRing = styled(Box)(({ theme, progress }) => ({
  width: '140px',
  height: '140px',
  borderRadius: '50%',
  background: `conic-gradient(#4CAF50 ${progress * 3.6}deg, #e0e0e0 0deg)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'white',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
    '&::before': {
      width: '80px',
      height: '80px',
    },
  },
}));

const StatsCard = styled(Card)(({ theme, trend }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  textAlign: 'center',
  border: `1px solid ${
    trend > 0 ? 'rgba(76, 175, 80, 0.3)' : 
    trend < 0 ? 'rgba(244, 67, 54, 0.3)' : 
    'rgba(255, 255, 255, 0.3)'
  }`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: trend > 0 ? '#4CAF50' : trend < 0 ? '#F44336' : '#9E9E9E',
  },
}));

const NotificationDot = styled(Box)(({ theme, severity }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: severity === 'high' ? '#F44336' : severity === 'medium' ? '#FF9800' : '#4CAF50',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
}));

// Enhanced workflow steps with real-time tracking capabilities
const brandSteps = [
  { 
    icon: <FaUser />, 
    title: "Complete Brand Profile", 
    key: "profile",
    route: "/brand/profile",
    description: "Set up your complete brand identity with verification to build trust with influencers.",
    stats: ['Profile Score', 'Social Verification', 'Brand Trust'],
    metrics: ['completion_score', 'verification_status', 'social_links'],
    tips: [
      "Complete all profile sections for better influencer trust",
      "Add social media links to increase credibility",
      "Upload high-quality brand logo and banner"
    ]
  },
  { 
    icon: <FaBullhorn />, 
    title: "Launch Campaign", 
    key: "campaigns",
    route: "/brand/campaigns",
    description: "Create and manage high-performing campaigns with clear objectives and budgets.",
    stats: ['Active Campaigns', 'Total Budget', 'Performance Score'],
    metrics: ['active_campaigns', 'total_budget', 'campaign_performance'],
    tips: [
      "Set clear campaign objectives and KPIs",
      "Use attractive visuals to increase applications",
      "Define precise target audience demographics"
    ]
  },
  { 
    icon: <FaClipboardList />, 
    title: "Manage Applications", 
    key: "applications",
    route: "/brand/applications",
    description: "Review, filter, and select the best influencer matches for your campaigns.",
    stats: ['Pending Apps', 'Approval Rate', 'Avg Response Time'],
    metrics: ['pending_applications', 'approval_rate', 'response_time'],
    tips: [
      "Respond to applications within 48 hours",
      "Check influencer engagement rates and authenticity",
      "Use our AI matching for better selections"
    ]
  },
  { 
    icon: <FaFileContract />, 
    title: "Contracts & Agreements", 
    key: "contracts",
    route: "/brand/contracts",
    description: "Create, send, and track professional contracts with secure digital signatures.",
    stats: ['Pending Contracts', 'Signed Rate', 'Completion Time'],
    metrics: ['pending_contracts', 'signed_rate', 'completion_time'],
    tips: [
      "Use template contracts for faster processing",
      "Set clear deliverables and timelines",
      "Enable automatic reminders for pending signatures"
    ]
  },
  { 
    icon: <FaFileVideo />, 
    title: "Content Review", 
    key: "content",
    route: "/brand/content",
    description: "Review submitted content, provide feedback, and approve final deliverables.",
    stats: ['Media Pending', 'Approval Rate', 'Quality Score'],
    metrics: ['pending_media', 'approval_rate', 'quality_score'],
    tips: [
      "Provide constructive feedback to influencers",
      "Use our content guidelines for consistency",
      "Track content performance metrics"
    ]
  },
  { 
    icon: <FaDollarSign />, 
    title: "Payments & Analytics", 
    key: "payments",
    route: "/brand/payments",
    description: "Manage payments, track ROI, and analyze campaign performance comprehensively.",
    stats: ['Pending Payments', 'ROI', 'Success Rate'],
    metrics: ['pending_payments', 'roi', 'success_rate'],
    tips: [
      "Set up automatic payment reminders",
      "Track campaign ROI in real-time",
      "Use analytics to optimize future campaigns"
    ]
  }
];

const BrandWorkflow = () => {
  const [workflowData, setWorkflowData] = useState({
    completedSteps: {},
    stepMetrics: {},
    profileData: null,
    campaignStats: {},
    realTimeUpdates: [],
    notifications: []
  });
  const [activeStep, setActiveStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const stepsContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Comprehensive data fetching with error handling
  const fetchWorkflowData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch all data in parallel for better performance
      const [
        profileResponse,
        campaignsResponse,
        applicationsResponse,
        contractsResponse,
        contentResponse,
        paymentsResponse,
        analyticsResponse
      ] = await Promise.allSettled([
        profileAPI.getMyProfile(),
        campaignAPI.getBrandCampaigns(),
        campaignAPI.getBrandApplications(),
        axios.get('/api/brand/contracts'),
        axios.get('/api/brand/content'),
        axios.get('/api/brand/payments'),
        axios.get('/api/brand/analytics/overview')
      ]);

      // Process profile data
      const profileData = profileResponse.status === 'fulfilled' ? profileResponse.value : null;
      
      // Process campaign statistics
      const campaigns = campaignsResponse.status === 'fulfilled' ? campaignsResponse.value : [];
      const applications = applicationsResponse.status === 'fulfilled' ? applicationsResponse.value : [];
      
      // Calculate comprehensive metrics
      const stepMetrics = calculateStepMetrics({
        profileData,
        campaigns,
        applications,
        contracts: contractsResponse.status === 'fulfilled' ? contractsResponse.value : {},
        content: contentResponse.status === 'fulfilled' ? contentResponse.value : {},
        payments: paymentsResponse.status === 'fulfilled' ? paymentsResponse.value : {},
        analytics: analyticsResponse.status === 'fulfilled' ? analyticsResponse.value : {}
      });

      const completedSteps = determineCompletedSteps(stepMetrics);
      const activeStepKey = determineActiveStep(completedSteps);
      
      // Generate real-time updates and notifications
      const realTimeUpdates = generateRealTimeUpdates(stepMetrics);
      const notifications = generateNotifications(stepMetrics);

      setWorkflowData({
        completedSteps,
        stepMetrics,
        profileData,
        campaignStats: calculateCampaignStats(campaigns, applications),
        realTimeUpdates,
        notifications
      });
      
      setActiveStep(activeStepKey);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        showSnackbar('Workflow data updated successfully!', 'success');
      }

    } catch (error) {
      console.error('Failed to fetch workflow data:', error);
      showSnackbar('Failed to update workflow data. Using cached data.', 'error');
      // Fallback to mock data for demonstration
      setMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStepMetrics = (data) => {
    const { profileData, campaigns, applications, contracts, content, payments, analytics } = data;
    
    return {
      profile: {
        completion_score: profileData ? calculateProfileCompletion(profileData) : 0,
        verification_status: profileData?.verified ? 100 : 0,
        social_links: profileData?.social_links?.length || 0
      },
      campaigns: {
        active_campaigns: campaigns?.length || 0,
        total_budget: campaigns?.reduce((sum, camp) => sum + (camp.budget || 0), 0) || 0,
        campaign_performance: analytics?.campaign_performance || 0
      },
      applications: {
        pending_applications: applications?.filter(app => app.status === 'pending').length || 0,
        approval_rate: analytics?.approval_rate || 0,
        response_time: analytics?.avg_response_time || 0
      },
      contracts: {
        pending_contracts: contracts?.pending?.length || 0,
        signed_rate: contracts?.signed_rate || 0,
        completion_time: contracts?.avg_completion_time || 0
      },
      content: {
        pending_media: content?.pending_review?.length || 0,
        approval_rate: content?.approval_rate || 0,
        quality_score: content?.avg_quality_score || 0
      },
      payments: {
        pending_payments: payments?.pending?.length || 0,
        roi: analytics?.roi || 0,
        success_rate: analytics?.success_rate || 0
      }
    };
  };

  const calculateProfileCompletion = (profile) => {
    let score = 0;
    const fields = [
      'company_name', 'description', 'logo', 'website', 
      'industry', 'social_links', 'contact_email'
    ];
    
    fields.forEach(field => {
      if (profile[field]) score += 100 / fields.length;
    });
    
    return Math.round(score);
  };

  const determineCompletedSteps = (metrics) => {
    return {
      profile: metrics.profile.completion_score >= 80,
      campaigns: metrics.campaigns.active_campaigns > 0,
      applications: metrics.applications.pending_applications > 0,
      contracts: metrics.contracts.pending_contracts > 0,
      content: metrics.content.pending_media > 0,
      payments: metrics.payments.pending_payments > 0
    };
  };

  const determineActiveStep = (completedSteps) => {
    const firstIncomplete = brandSteps.find(step => !completedSteps[step.key]);
    return firstIncomplete?.key || brandSteps[brandSteps.length - 1].key;
  };

  const generateRealTimeUpdates = (metrics) => {
    const updates = [];
    
    if (metrics.applications.pending_applications > 0) {
      updates.push({
        type: 'application',
        message: `${metrics.applications.pending_applications} new applications pending review`,
        time: 'Just now',
        priority: 'high'
      });
    }
    
    if (metrics.contracts.pending_contracts > 0) {
      updates.push({
        type: 'contract',
        message: `${metrics.contracts.pending_contracts} contracts awaiting signature`,
        time: '2 hours ago',
        priority: 'medium'
      });
    }
    
    if (metrics.content.pending_media > 0) {
      updates.push({
        type: 'content',
        message: `${metrics.content.pending_media} content submissions to review`,
        time: '1 hour ago',
        priority: 'medium'
      });
    }

    return updates.slice(0, 5); // Limit to 5 updates
  };

  const generateNotifications = (metrics) => {
    const notifications = [];
    
    // Urgent notifications
    if (metrics.applications.pending_applications > 10) {
      notifications.push({
        message: 'High volume of pending applications',
        severity: 'high',
        action: 'review_applications'
      });
    }
    
    if (metrics.contracts.pending_contracts > 5) {
      notifications.push({
        message: 'Multiple contracts awaiting action',
        severity: 'medium',
        action: 'manage_contracts'
      });
    }

    return notifications;
  };

  const calculateCampaignStats = (campaigns, applications) => {
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(camp => camp.status === 'active').length || 0;
    const totalApplications = applications?.length || 0;
    const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0;
    
    return {
      totalCampaigns,
      activeCampaigns,
      totalApplications,
      pendingApplications,
      completionRate: totalCampaigns > 0 ? Math.round((activeCampaigns / totalCampaigns) * 100) : 0
    };
  };

  const setMockData = () => {
    const mockMetrics = {
      profile: { completion_score: 85, verification_status: 100, social_links: 4 },
      campaigns: { active_campaigns: 3, total_budget: 12500, campaign_performance: 78 },
      applications: { pending_applications: 12, approval_rate: 65, response_time: 24 },
      contracts: { pending_contracts: 3, signed_rate: 80, completion_time: 48 },
      content: { pending_media: 8, approval_rate: 90, quality_score: 85 },
      payments: { pending_payments: 2, roi: 245, success_rate: 88 }
    };

    setWorkflowData({
      completedSteps: determineCompletedSteps(mockMetrics),
      stepMetrics: mockMetrics,
      profileData: { verified: true, social_links: ['instagram', 'twitter', 'youtube'] },
      campaignStats: { totalCampaigns: 5, activeCampaigns: 3, totalApplications: 47, pendingApplications: 12, completionRate: 75 },
      realTimeUpdates: generateRealTimeUpdates(mockMetrics),
      notifications: generateNotifications(mockMetrics)
    });
    
    setActiveStep('applications');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRefresh = () => {
    fetchWorkflowData(true);
  };

  const handleStepClick = (step) => {
    navigate(step.route);
  };

  const handleNotificationAction = (action) => {
    switch (action) {
      case 'review_applications':
        navigate('/brand/applications');
        break;
      case 'manage_contracts':
        navigate('/brand/contracts');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchWorkflowData();
    
    // Set up real-time polling
    const interval = setInterval(() => {
      fetchWorkflowData(true);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeStep && stepsContainerRef.current) {
      const activeIndex = brandSteps.findIndex(step => step.key === activeStep);
      const stepElement = stepsContainerRef.current.children[activeIndex];
      if (stepElement) {
        setTimeout(() => {
          stepElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 1000);
      }
    }
  }, [activeStep]);

  // Calculate overall progress
  const completedCount = Object.values(workflowData.completedSteps).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / brandSteps.length) * 100);

  // Get step-specific data
  const getStepData = (stepKey) => {
    const metrics = workflowData.stepMetrics[stepKey] || {};
    const isCompleted = workflowData.completedSteps[stepKey];
    const isActive = activeStep === stepKey;
    const hasUrgentItems = metrics.pending_applications > 5 || metrics.pending_contracts > 3 || metrics.pending_media > 5;
    
    return { metrics, isCompleted, isActive, hasUrgentItems };
  };

  if (loading) {
    return (
      <WorkflowContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </Box>
      </WorkflowContainer>
    );
  }

  return (
    <WorkflowContainer>
      {/* Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 226, 0.3) 0%, transparent 50%)
          `,
          animation: 'float 8s ease-in-out infinite',
        }}
      />

      <GlassCard>
        {/* Header Section with Refresh and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <FaRocket style={{ fontSize: '2.5rem', color: '#667eea' }} />
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    fontWeight="800"
                    sx={{
                      background: '#2563eb',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Brand Success Dashboard
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Track your influencer marketing journey in real-time
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* Last Updated and Refresh */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
              </Typography>
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                size="small"
                sx={{ 
                  color: 'primary.main',
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <FaSync />
              </IconButton>
            </Box>
          </Box>

          {/* Notifications */}
          {workflowData.notifications.length > 0 && (
            <Box sx={{ position: 'relative' }}>
              <Badge badgeContent={workflowData.notifications.length} color="error">
                <IconButton>
                  <FaBell />
                </IconButton>
              </Badge>
            </Box>
          )}
        </Box>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6, flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ProgressRing progress={completionPercent}>
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="800" color="#4CAF50">
                    {completionPercent}%
                  </Typography>
                  <Typography variant="caption" display="block" fontWeight="600">
                    Complete
                  </Typography>
                </Box>
              </ProgressRing>
              
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Journey Progress
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {completedCount} of {brandSteps.length} milestones achieved
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercent} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                      borderRadius: 5,
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<FaMedal />} 
                label={`Rank: ${workflowData.campaignStats.completionRate >= 80 ? 'Expert' : workflowData.campaignStats.completionRate >= 60 ? 'Pro' : 'Beginner'}`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                icon={<FaArrowUp />} 
                label={`ROI: ${workflowData.stepMetrics.payments?.roi || 0}%`}
                color="success"
                variant="outlined"
              />
              <Chip 
                icon={<FaUsers />} 
                label={`${workflowData.campaignStats.totalApplications} Applications`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>
        </motion.div>

        {/* Real-time Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
            <StatsCard trend={workflowData.campaignStats.activeCampaigns}>
              <FaBullhorn style={{ fontSize: '2rem', color: '#667eea', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="primary">
                {workflowData.campaignStats.activeCampaigns}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Campaigns
              </Typography>
              <Typography variant="caption" color={workflowData.campaignStats.activeCampaigns > 0 ? 'success.main' : 'text.secondary'}>
                {workflowData.campaignStats.activeCampaigns > 0 ? '✓ Running' : 'No active campaigns'}
              </Typography>
            </StatsCard>
            
            <StatsCard trend={workflowData.stepMetrics.applications?.pending_applications > 0 ? 1 : 0}>
              <FaUsers style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="success.main">
                {workflowData.stepMetrics.applications?.pending_applications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Applications
              </Typography>
              <Typography variant="caption" color={workflowData.stepMetrics.applications?.pending_applications > 0 ? 'warning.main' : 'text.secondary'}>
                {workflowData.stepMetrics.applications?.pending_applications > 0 ? '⚠ Needs attention' : 'All caught up'}
              </Typography>
            </StatsCard>
            
            <StatsCard trend={workflowData.stepMetrics.contracts?.pending_contracts > 0 ? -1 : 0}>
              <FaFileAlt style={{ fontSize: '2rem', color: '#FF9800', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="warning.main">
                {workflowData.stepMetrics.contracts?.pending_contracts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Contracts
              </Typography>
              <Typography variant="caption" color={workflowData.stepMetrics.contracts?.pending_contracts > 0 ? 'error.main' : 'text.secondary'}>
                {workflowData.stepMetrics.contracts?.pending_contracts > 0 ? '🚨 Action required' : 'Up to date'}
              </Typography>
            </StatsCard>
            
            <StatsCard trend={workflowData.stepMetrics.payments?.roi > 100 ? 1 : -1}>
              <FaDollarSign style={{ fontSize: '2rem', color: '#9C27B0', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="secondary.main">
                {workflowData.stepMetrics.payments?.roi || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average ROI
              </Typography>
              <Typography variant="caption" color={workflowData.stepMetrics.payments?.roi > 100 ? 'success.main' : 'error.main'}>
                {workflowData.stepMetrics.payments?.roi > 100 ? '📈 Excellent' : '📉 Needs improvement'}
              </Typography>
            </StatsCard>
          </Box>
        </motion.div>

        {/* Notifications Alert */}
        {workflowData.notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Alert 
              severity="warning" 
              sx={{ mb: 4, borderRadius: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => handleNotificationAction(workflowData.notifications[0].action)}
                >
                  Take Action
                </Button>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaExclamationTriangle />
                <Typography variant="body2" fontWeight="600">
                  {workflowData.notifications[0].message}
                </Typography>
              </Box>
            </Alert>
          </motion.div>
        )}

        {/* Workflow Steps */}
        <Box ref={stepsContainerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AnimatePresence>
            {brandSteps.map((step, index) => {
              const { metrics, isCompleted, isActive, hasUrgentItems } = getStepData(step.key);
              
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  layout
                >
                  <StepCard
                    completed={isCompleted}
                    active={isActive}
                    urgent={hasUrgentItems}
                    onClick={() => handleStepClick(step)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Urgent Notification Dot */}
                    {hasUrgentItems && (
                      <NotificationDot severity="high" />
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      {/* Step Number and Icon */}
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            background: isCompleted 
                              ? 'rgba(255, 255, 255, 0.2)' 
                              : isActive
                              ? 'rgba(255, 255, 255, 0.3)'
                              : hasUrgentItems
                              ? 'rgba(255, 152, 0, 0.2)'
                              : 'rgba(102, 126, 234, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {isCompleted ? (
                            <FaCheckCircle style={{ fontSize: '2rem', color: 'white' }} />
                          ) : (
                            <Box sx={{ 
                              color: isActive ? 'white' : hasUrgentItems ? '#FF9800' : 'primary.main',
                              fontSize: '1.5rem'
                            }}>
                              {step.icon}
                            </Box>
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: isCompleted ? '#4CAF50' : 
                                        isActive ? '#2196F3' : 
                                        hasUrgentItems ? '#FF9800' : '#9E9E9E',
                              color: 'white',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </Box>
                      </Box>

                      {/* Step Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight="700" gutterBottom>
                              {step.title}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              opacity: isCompleted ? 0.9 : 0.7,
                              mb: 2 
                            }}>
                              {step.description}
                            </Typography>
                          </Box>
                          
                          {/* Step Metrics */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {step.metrics.map((metricKey, metricIndex) => (
                              <Tooltip key={metricIndex} title={step.stats[metricIndex]} arrow>
                                <Chip 
                                  label={`${Math.round(metrics[metricKey] || 0)}`}
                                  size="small"
                                  color={
                                    isCompleted ? "success" : 
                                    isActive ? "primary" : 
                                    hasUrgentItems ? "warning" : "default"
                                  }
                                  variant="filled"
                                  sx={{ 
                                    fontWeight: '600',
                                    minWidth: '50px'
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>

                        {/* Progress Indicators */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {step.stats.map((stat, statIndex) => (
                            <Chip
                              key={statIndex}
                              label={stat}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                background: isCompleted ? 'rgba(255,255,255,0.2)' : 
                                        isActive ? 'rgba(255,255,255,0.1)' :
                                        hasUrgentItems ? 'rgba(255,152,0,0.1)' : 'rgba(0,0,0,0.05)',
                                color: isCompleted || isActive || hasUrgentItems ? 'white' : 'text.secondary',
                                borderColor: isCompleted || isActive || hasUrgentItems ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Box>

                        {/* Helpful Tips */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {step.tips.slice(0, 2).map((tip, tipIndex) => (
                            <Chip
                              key={tipIndex}
                              icon={<FaLightbulb style={{ fontSize: '0.8rem' }} />}
                              label={tip}
                              size="small"
                              variant="outlined"
                              sx={{
                                background: 'rgba(255,255,255,0.3)',
                                color: isCompleted || isActive || hasUrgentItems ? 'white' : 'text.secondary',
                                borderColor: 'rgba(255,255,255,0.5)',
                                fontSize: '0.65rem',
                                height: '24px',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Action Arrow */}
                      <motion.div
                        animate={{ x: isActive ? [0, 5, 0] : 0 }}
                        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                        style={{ alignSelf: 'center', flexShrink: 0 }}
                      >
                        <FaArrowRight style={{ 
                          fontSize: '1.5rem', 
                          color: isCompleted || isActive || hasUrgentItems ? 'white' : 'text.secondary',
                          opacity: (isActive || hasUrgentItems) ? 1 : 0.6
                        }} />
                      </motion.div>
                    </Box>

                    {/* Connection Line */}
                    {index < brandSteps.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -25,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '3px',
                          height: '25px',
                          background: workflowData.completedSteps[brandSteps[index + 1].key] 
                            ? 'linear-gradient(to bottom, #4CAF50, #4CAF50)'
                            : 'linear-gradient(to bottom, #E0E0E0, transparent)',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </StepCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>

        {/* Real-time Updates Section */}
        {workflowData.realTimeUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Box sx={{ mt: 6, p: 3, background: 'rgba(255,255,255,0.8)', borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaBell style={{ color: '#667eea' }} />
                Real-time Updates
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {workflowData.realTimeUpdates.map((update, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderLeft: `4px solid ${
                        update.type === 'application' ? '#4CAF50' :
                        update.type === 'contract' ? '#2196F3' :
                        update.type === 'content' ? '#FF9800' : '#9C27B0'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: update.priority === 'high' ? '#F44336' : 
                                  update.priority === 'medium' ? '#FF9800' : '#4CAF50',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="500">
                        {update.message}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {update.time}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Box sx={{ mt: 4, p: 3, background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)', borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FaChartLine style={{ color: '#667eea' }} />
              Performance Insights
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="primary">
                  {workflowData.stepMetrics.applications?.approval_rate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Application Approval Rate
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="success.main">
                  {workflowData.stepMetrics.content?.quality_score || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Content Quality Score
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="warning.main">
                  {workflowData.stepMetrics.contracts?.signed_rate || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contract Signing Rate
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </GlassCard>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<FaBullhorn />}
            onClick={() => navigate('/brand/campaigns/create')}
            sx={{
              borderRadius: '25px',
              px: 4,
              py: 1.5,
              background: '#2563eb',
              fontWeight: '600',
              fontSize: '1rem',
            }}
          >
            Launch New Campaign
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<FaClipboardList />}
            onClick={() => navigate('/brand/applications')}
            sx={{ 
              borderRadius: '25px', 
              px: 4, 
              py: 1.5,
              fontWeight: '600',
              fontSize: '1rem',
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px' }
            }}
          >
            Review Applications
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<FaChartLine />}
            onClick={() => navigate('/brand/analytics')}
            sx={{ 
              borderRadius: '25px', 
              px: 4, 
              py: 1.5,
              fontWeight: '600',
              fontSize: '1rem',
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px' }
            }}
          >
            View Analytics
          </Button>
        </Box>
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: snackbar.severity === 'success' ? '#4CAF50' : 
                       snackbar.severity === 'error' ? '#F44336' : '#2196F3',
            fontWeight: '600',
          },
        }}
      />
    </WorkflowContainer>
  );
};

export default BrandWorkflow;