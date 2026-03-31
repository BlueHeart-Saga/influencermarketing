import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaCheckCircle, FaUser, FaSearch, FaHandshake, 
  FaFileContract, FaFileVideo, FaDollarSign, FaRocket,
  FaChartLine, FaUsers, FaFileAlt, FaStar, FaArrowRight,
  FaInstagram, FaYoutube, FaTiktok, FaTwitter
} from "react-icons/fa";
import { 
  Box, Typography, Paper, Chip, Button, LinearProgress,
  Card, CardContent, Avatar, Tooltip, IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { campaignAPI } from "../../services/api";

// Styled Components
const WorkflowContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StepCard = styled(motion.div)(({ theme, completed, active }) => ({
  background: completed 
    ? 'linear-gradient(135deg, #4CAF50, #66BB6A)'
    : active
    ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
    : 'rgba(255, 255, 255, 0.9)',
  color: completed || active ? 'white' : theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${completed ? '#4CAF50' : active ? '#FF6B6B' : 'rgba(0, 0, 0, 0.1)'}`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const ProgressRing = styled(Box)(({ theme, progress }) => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  background: `conic-gradient(#4ECDC4 ${progress * 3.6}deg, #e0e0e0 0deg)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'white',
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  textAlign: 'center',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}));

const PlatformIcon = ({ platform }) => {
  const icons = {
    instagram: <FaInstagram style={{ color: '#E4405F' }} />,
    youtube: <FaYoutube style={{ color: '#FF0000' }} />,
    tiktok: <FaTiktok style={{ color: '#000000' }} />,
    twitter: <FaTwitter style={{ color: '#1DA1F2' }} />,
  };
  
  return icons[platform] || <FaUser />;
};

// Influencer workflow steps
const influencerSteps = [
  { 
    icon: <FaUser />, 
    title: "Complete Influencer Profile", 
    key: "register",
    route: "/influencer/profile",
    description: "Build your influencer profile with portfolio, social media links, engagement metrics, and content niches.",
    stats: ['Profile Completion', 'Portfolio Items', 'Social Verification']
  },
  { 
    icon: <FaSearch />, 
    title: "Discover Campaigns", 
    key: "discoverCampaigns",
    route: "/influencer/campaigns",
    description: "Browse available campaigns that match your niche, audience, and collaboration preferences.",
    stats: ['Available Campaigns', 'Matches Found', 'Recommended']
  },
  { 
    icon: <FaHandshake />, 
    title: "Apply to Campaigns", 
    key: "applyCampaigns",
    route: "/influencer/campaigns",
    description: "Submit compelling applications showcasing your value proposition and content ideas to brands.",
    stats: ['Applications Sent', 'Success Rate', 'Pending Reviews']
  },
  { 
    icon: <FaFileContract />, 
    title: "Review Contracts", 
    key: "reviewContracts",
    route: "/influencer/applications",
    description: "Review and accept collaboration contracts outlining deliverables, timelines, and compensation.",
    stats: ['Contracts Received', 'Signed Contracts', 'Active Collaborations']
  },
  { 
    icon: <FaFileVideo />, 
    title: "Create & Submit Content", 
    key: "createContent",
    route: "/influencer/applications",
    description: "Produce high-quality content according to campaign requirements and submit for brand approval.",
    stats: ['Content Submitted', 'Approval Rate', 'Revision Requests']
  },
  { 
    icon: <FaDollarSign />, 
    title: "Receive Payments", 
    key: "receivePayments",
    route: "/influencer/payments",
    description: "Get compensated for your work with secure payments and track your earnings across campaigns.",
    stats: ['Total Earnings', 'Pending Payments', 'Payment History']
  }
];

const InfluencerWorkflow = () => {
  const [completedSteps, setCompletedSteps] = useState({});
  const [activeStep, setActiveStep] = useState(null);
  const [workflowStats, setWorkflowStats] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [influencerProfile, setInfluencerProfile] = useState({});
  const stepsContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch comprehensive workflow status and real-time data
  const fetchWorkflowData = async () => {
    try {
      // Fetch influencer profile data
      const profileResponse = await axios.get("/api/influencer/profile");
      setInfluencerProfile(profileResponse.data);

      // Fetch step completion status
      const statusResponse = await axios.get("/api/influencer/workflow-status");
      setCompletedSteps(statusResponse.data.completedSteps || {});

      // Fetch real-time statistics
      const statsResponse = await axios.get("/api/influencer/workflow-stats");
      setWorkflowStats(statsResponse.data);

      // Fetch real-time updates (applications, contracts, etc.)
      const realTimeResponse = await axios.get("/api/influencer/real-time-updates");
      setRealTimeData(realTimeResponse.data);

      // Determine active step (first incomplete step)
      const firstIncomplete = influencerSteps.find(step => !statusResponse.data.completedSteps?.[step.key]);
      setActiveStep(firstIncomplete?.key || influencerSteps[influencerSteps.length - 1].key);

    } catch (error) {
      console.error("Failed to fetch workflow data:", error);
      // Fallback to mock data for demonstration
      setMockData();
    }
  };

  const setMockData = () => {
    // Mock completion status
    const mockCompleted = {
      register: true,
      discoverCampaigns: true,
      applyCampaigns: false,
      reviewContracts: false,
      createContent: false,
      receivePayments: false
    };
    setCompletedSteps(mockCompleted);
    setActiveStep('applyCampaigns');

    // Mock influencer profile
    setInfluencerProfile({
      username: "@creativeinfluencer",
      fullName: "Alex Johnson",
      followers: 125000,
      engagementRate: 4.2,
      primaryPlatform: "instagram",
      categories: ["Lifestyle", "Fashion", "Travel"],
      profileCompletion: 85
    });

    // Mock statistics
    setWorkflowStats({
      totalApplications: 15,
      activeApplications: 3,
      approvedApplications: 8,
      completedCollaborations: 12,
      totalEarnings: 3200,
      averageRating: 4.8
    });

    // Mock real-time data
    setRealTimeData({
      newCampaigns: 5,
      pendingApplications: 2,
      contractsToReview: 1,
      contentToSubmit: 3,
      recentActivity: [
        { type: 'campaign', message: 'New Fashion Campaign available', time: '10 min ago' },
        { type: 'application', message: 'Application approved for Tech Review', time: '2 hours ago' },
        { type: 'contract', message: 'New contract received from BeautyBrand', time: '1 day ago' }
      ]
    });
  };

  useEffect(() => {
    fetchWorkflowData();
    
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(fetchWorkflowData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to active step
  useEffect(() => {
    if (activeStep && stepsContainerRef.current) {
      const activeIndex = influencerSteps.findIndex(step => step.key === activeStep);
      const stepElement = stepsContainerRef.current.children[activeIndex];
      if (stepElement) {
        setTimeout(() => {
          stepElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    }
  }, [activeStep]);

  const handleStepClick = (step) => {
    navigate(step.route);
  };

  // Calculate completion progress
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / influencerSteps.length) * 100);

  // Get step-specific statistics
  const getStepStats = (stepKey) => {
    switch(stepKey) {
      case 'register':
        return { value: influencerProfile.profileCompletion || 0, label: '% Complete' };
      case 'discoverCampaigns':
        return { value: realTimeData.newCampaigns || 0, label: 'New Campaigns' };
      case 'applyCampaigns':
        return { value: workflowStats.activeApplications || 0, label: 'Active Apps' };
      case 'reviewContracts':
        return { value: realTimeData.contractsToReview || 0, label: 'Contracts' };
      case 'createContent':
        return { value: realTimeData.contentToSubmit || 0, label: 'Content Due' };
      case 'receivePayments':
        return { value: workflowStats.completedCollaborations || 0, label: 'Completed' };
      default:
        return { value: 0, label: '' };
    }
  };

  return (
    <WorkflowContainer>
      {/* Background Animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.3) 0%, transparent 50%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />

      <GlassCard>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <FaRocket style={{ fontSize: '2.5rem', color: '#FF6B6B', marginRight: '1rem' }} />
              <Typography 
                variant="h3" 
                component="h1" 
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Influencer Success Journey
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Follow your workflow to grow your influence and maximize brand collaborations
            </Typography>
          </motion.div>

          {/* Influencer Profile Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, mb: 4 }}>
              {/* Profile Avatar */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    border: '4px solid #4ECDC4',
                    background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)'
                  }}
                >
                  {influencerProfile.username?.charAt(0) || 'I'}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" fontWeight="700">
                    {influencerProfile.fullName || "Influencer"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {influencerProfile.username || "@username"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {influencerProfile.primaryPlatform && (
                      <PlatformIcon platform={influencerProfile.primaryPlatform} />
                    )}
                    <Typography variant="body2">
                      {influencerProfile.followers?.toLocaleString() || '0'} followers
                    </Typography>
                    <Chip 
                      label={`${influencerProfile.engagementRate || 0}% engagement`} 
                      size="small" 
                      color="success"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Progress Overview */}
              <ProgressRing progress={completionPercent}>
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="800" color="#4ECDC4">
                    {completionPercent}%
                  </Typography>
                  <Typography variant="caption" display="block">
                    Complete
                  </Typography>
                </Box>
              </ProgressRing>
              
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Your Progress
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {completedCount} of {influencerSteps.length} steps completed
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercent} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #4ECDC4, #FF6B6B)',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Real-time Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 6 }}>
            <StatsCard>
              <FaHandshake style={{ fontSize: '2rem', color: '#FF6B6B', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="primary">
                {workflowStats.totalApplications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </StatsCard>
            
            <StatsCard>
              <FaCheckCircle style={{ fontSize: '2rem', color: '#4CAF50', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="success.main">
                {workflowStats.approvedApplications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved Applications
              </Typography>
            </StatsCard>
            
            <StatsCard>
              <FaFileAlt style={{ fontSize: '2rem', color: '#FF9800', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="warning.main">
                {workflowStats.activeApplications || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Collaborations
              </Typography>
            </StatsCard>
            
            <StatsCard>
              <FaDollarSign style={{ fontSize: '2rem', color: '#4ECDC4', marginBottom: '0.5rem' }} />
              <Typography variant="h4" fontWeight="700" color="secondary.main">
                ${workflowStats.totalEarnings || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </StatsCard>
          </Box>
        </motion.div>

        {/* Workflow Steps */}
        <Box ref={stepsContainerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {influencerSteps.map((step, index) => {
            const isCompleted = completedSteps[step.key];
            const isActive = activeStep === step.key;
            const stepStats = getStepStats(step.key);
            
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <StepCard
                  completed={isCompleted}
                  active={isActive}
                  onClick={() => handleStepClick(step)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Step Number and Icon */}
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: isCompleted 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : isActive
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(255, 107, 107, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        {isCompleted ? (
                          <FaCheckCircle style={{ fontSize: '1.5rem', color: 'white' }} />
                        ) : (
                          <Box sx={{ color: isActive ? 'white' : 'primary.main' }}>
                            {step.icon}
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            background: isCompleted ? '#4CAF50' : isActive ? '#FF6B6B' : '#9E9E9E',
                            color: 'white',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Box>
                    </Box>

                    {/* Step Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" fontWeight="700">
                          {step.title}
                        </Typography>
                        {stepStats.value > 0 && (
                          <Chip 
                            label={`${stepStats.value} ${stepStats.label}`}
                            size="small"
                            color={isCompleted ? "success" : isActive ? "primary" : "default"}
                            variant={isCompleted || isActive ? "filled" : "outlined"}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" sx={{ 
                        opacity: isCompleted ? 0.9 : 0.7,
                        mb: 2 
                      }}>
                        {step.description}
                      </Typography>

                      {/* Progress indicators for each step */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {step.stats.map((stat, statIndex) => (
                          <Chip
                            key={statIndex}
                            label={stat}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              background: isCompleted ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                              color: isCompleted || isActive ? 'white' : 'text.secondary',
                              borderColor: isCompleted || isActive ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Action Arrow */}
                    <motion.div
                      animate={{ x: isActive ? [0, 5, 0] : 0 }}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    >
                      <FaArrowRight style={{ 
                        fontSize: '1.2rem', 
                        color: isCompleted || isActive ? 'white' : 'text.secondary',
                        opacity: isActive ? 1 : 0.5
                      }} />
                    </motion.div>
                  </Box>

                  {/* Connection Line */}
                  {index < influencerSteps.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '2px',
                        height: '20px',
                        background: completedSteps[influencerSteps[index + 1].key] 
                          ? 'linear-gradient(to bottom, #4CAF50, #4CAF50)'
                          : 'linear-gradient(to bottom, #E0E0E0, transparent)',
                      }}
                    />
                  )}
                </StepCard>
              </motion.div>
            );
          })}
        </Box>

        {/* Recent Activity Section */}
        {realTimeData.recentActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaChartLine />
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {realTimeData.recentActivity.map((activity, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderLeft: `4px solid ${
                        activity.type === 'campaign' ? '#4ECDC4' :
                        activity.type === 'application' ? '#4CAF50' :
                        activity.type === 'contract' ? '#FF6B6B' : '#FF9800'
                      }`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          </motion.div>
        )}
      </GlassCard>

      {/* Quick Actions Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<FaSearch />}
            onClick={() => navigate('/influencer/campaigns')}
            sx={{
              borderRadius: '25px',
              px: 4,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
            }}
          >
            Discover Campaigns
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<FaHandshake />}
            onClick={() => navigate('/influencer/applications')}
            sx={{ borderRadius: '25px', px: 4 }}
          >
            My Applications
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<FaChartLine />}
            onClick={() => navigate('/influencer/analytics')}
            sx={{ borderRadius: '25px', px: 4 }}
          >
            View Analytics
          </Button>
        </Box>
      </motion.div>
    </WorkflowContainer>
  );
};

export default InfluencerWorkflow;