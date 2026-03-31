import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  Divider,
  Box,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Container,
  Fade,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Slider,
  useMediaQuery,
  useTheme,
  Drawer,
  AppBar,
  Toolbar,
  Fab,
  Zoom,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  Rating,
  CircularProgress, Tooltip
} from "@mui/material";

import {
  ArrowBack,
  Bookmark,
  CalendarToday,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Add,
  Campaign,
  TrendingUp,
  People,
  AttachMoney,
  Category,
  Description,
  Checklist,
  Public,
  ArrowForward,
  ArrowBack as BackIcon,
  Image,
  Videocam,
  PlayArrow,
  Close,
  Search,
  FilterList,
  Clear,
  ViewModule,
  ViewList,
  Person,
  Chat,
  Instagram,
  YouTube,

  LinkedIn,
  Twitter,
  Language,
  LocationOn,
  ThumbUp,
  ThumbDown,
  Visibility,
  Assignment,
  WorkOutline,
  AccessTime,
  MonetizationOn,
  Send,
  Refresh
 

} from "@mui/icons-material";
import { campaignAPI } from "../../services/api";
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";
import { keyframes } from "@emotion/react";
import styled from '@emotion/styled';

import { FaTiktok } from 'react-icons/fa';




// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
`;

// Styled components with premium design
const PremiumCard = ({ children, sx, ...props }) => (
  <Card 
    sx={{ 
      height: '100%',
      borderRadius: '16px', 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
        borderColor: 'primary.light'
      },
      ...sx 
    }} 
    {...props}
  >
    {children}
  </Card>
);

const GradientButton = ({ children, sx, ...props }) => (
  <Button
    sx={{
      background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
      color: 'white',
      borderRadius: '12px',
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
        transform: 'translateY(-2px)',
        background: 'linear-gradient(45deg, #5a6fd8 0%, #3b82f6 100%)'
      },
      ...sx
    }}
    {...props}
  >
    {children}
  </Button>
);

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'approved' && {
    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, 0.3)',
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(255, 152, 0, 0.3)',
  }),
  ...(status === 'rejected' && {
    background: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(244, 67, 54, 0.3)',
  }),
  ...(status === 'contracted' && {
    background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(156, 39, 176, 0.3)',
  }),
  ...(status === 'media_submitted' && {
    background: 'linear-gradient(45deg, #2196F3 30%, #42A5F5 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, 0.3)',
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(45deg, #607D8B 30%, #78909C 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(96, 125, 139, 0.3)',
  })
}));

// Profile Image Component
const ProfileImage = ({ userId, profileType, alt, onClick, size = 32 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        
        if (response && response.profile) {
          const profileData = response.profile;
          setUserData(profileData);
          
          let imageId = null;
          if (profileType === 'influencer' && profileData.profile_picture) {
            imageId = profileData.profile_picture;
          } else if (profileType === 'brand' && profileData.logo) {
            imageId = profileData.logo;
          }

          if (imageId) {
            setImageUrl(`${process.env.REACT_APP_API_URL}/profiles/image/${imageId}`);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, profileType]);

  const getDisplayName = () => {
    if (userData) {
      if (profileType === 'influencer') {
        return userData.nickname || userData.full_name || alt || 'Influencer';
      } else {
        return userData.company_name || userData.contact_person_name || alt || 'Brand';
      }
    }
    return alt || 'User';
  };

  const getDisplayInitial = () => {
    const name = getDisplayName();
    return name?.charAt(0)?.toUpperCase() || 'U';
  };

  if (error || !imageUrl) {
    return (
      <Avatar 
        sx={{ 
          width: size, 
          height: size,
          bgcolor: 'primary.light',
          color: 'primary.main',
          fontSize: size * 0.4,
          fontWeight: 600,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        onClick={onClick}
        title={getDisplayName()}
      >
        {getDisplayInitial()}
      </Avatar>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            zIndex: 1,
            borderRadius: '50%'
          }}
        >
          <CircularProgress size={size * 0.5} />
        </Box>
      )}
      <Avatar 
        src={imageUrl}
        alt={getDisplayName()}
        sx={{ 
          width: size, 
          height: size,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        onClick={onClick}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        title={getDisplayName()}
      />
    </Box>
  );
};

// User Info Component
const UserInfo = ({ userId, profileType, showEmail = true, size = 32, showStats = false }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response && response.profile) {
          setUserData(response.profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleViewProfile = () => {
    navigate(`/brand/profile/view/${profileType}/${userId}`);
  };

  const getDisplayName = () => {
    if (!userData) return 'Loading...';
    
    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Unknown Influencer';
    } else {
      return userData.company_name || userData.contact_person_name || 'Unknown Brand';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram />;
      case 'youtube': return <YouTube />;
      case 'tiktok': return <FaTiktok />;
      case 'linkedin': return <LinkedIn />;
      case 'twitter': return <Twitter />;
      default: return <Language />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <ProfileImage
        userId={userId}
        profileType={profileType}
        alt={getDisplayName()}
        onClick={handleViewProfile}
        size={size}
      />
      <Box>
        <Typography 
          variant="subtitle2" 
          fontWeight="600"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
          }}
          onClick={handleViewProfile}
        >
          {getDisplayName()}
        </Typography>
        {showEmail && userData?.email && (
          <Typography variant="caption" color="text.secondary" display="block">
            {userData.email}
          </Typography>
        )}
        {showStats && profileType === 'influencer' && userData?.followers && (
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            {userData.primary_platform && getPlatformIcon(userData.primary_platform)}
            <Typography variant="caption" color="text.secondary">
              {userData.followers.toLocaleString()} followers
            </Typography>
            {userData.engagement_rate && (
              <Typography variant="caption" color="success.main" fontWeight="600">
                {userData.engagement_rate}% engagement
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Application Workflow Component
const ApplicationWorkflow = ({ application }) => {
  const steps = [
    {
      label: 'Application Submitted',
      status: 'completed',
      description: 'Influencer applied to your campaign',
      date: application.applied_at,
      icon: <Assignment />
    },
    {
      label: 'Under Review',
      status: application.status === 'pending' ? 'active' : 'completed',
      description: 'Reviewing influencer profile and application',
      date: application.applied_at,
      icon: <AccessTime />
    },
    {
      label: 'Approval Decision',
      status: ['approved', 'rejected', 'contracted', 'media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      description: application.status === 'approved' ? 'Application approved' : 
                   application.status === 'rejected' ? 'Application rejected' : 'Pending decision',
      date: application.status !== 'pending' ? application.applied_at : null,
      icon: application.status === 'approved' ? <ThumbUp /> : 
            application.status === 'rejected' ? <ThumbDown /> : <WorkOutline />
    },
    {
      label: 'Contract Sent',
      status: ['contracted', 'media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      description: application.contract_signed ? 'Contract signed by influencer' : 'Contract sent to influencer',
      date: application.contract_signed_at,
      icon: <Description />
    },
    {
      label: 'Media Submitted',
      status: ['media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      description: 'Influencer submitted media files',
      date: application.media_submitted_at,
      icon: <Image />
    },
    {
      label: 'Payment Processed',
      status: application.status === 'completed' ? 'completed' : 'pending',
      description: 'Payment completed for the campaign',
      date: application.payment_date,
      icon: <MonetizationOn />
    }
  ];

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      default: return 'disabled';
    }
  };

  return (
    <PremiumCard sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
        Application Workflow
      </Typography>
      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} active={step.status === 'active'} completed={step.status === 'completed'}>
            <StepLabel
              icon={React.cloneElement(step.icon, { color: getStepColor(step.status) })}
              sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: step.status === 'active' ? 700 : 500
                }
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
                {step.date && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {new Date(step.date).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </PremiumCard>
  );
};

// Application Detail Dialog
const ApplicationDetailDialog = ({ open, onClose, application, campaign, onStatusChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [influencerData, setInfluencerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchInfluencerData = async () => {
      if (application?.influencer_id) {
        try {
          setLoading(true);
          const response = await profileAPI.getProfileById(application.influencer_id);
          if (response?.profile) {
            setInfluencerData(response.profile);
          }
        } catch (error) {
          console.error('Error fetching influencer data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (open) {
      fetchInfluencerData();
    }
  }, [open, application]);

  const handleSendMessage = () => {
    navigate(`/brand/collaborations?user=${application.influencer_id}&campaign=${campaign._id}`);
    onClose();
  };

  const handleViewProfile = () => {
    navigate(`/brand/profile/view/influencer/${application.influencer_id}`);
    onClose();
  };



  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram color="primary" />;
      case 'youtube': return <YouTube color="error" />;
      case 'tiktok': return <FaTiktok color="secondary" />;
      case 'linkedin': return <LinkedIn color="info" />;
      case 'twitter': return <Twitter color="info" />;
      default: return <Language color="action" />;
    }
  };

  if (!application || !campaign) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', minHeight: '80vh' } }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #3b82f6 100%)'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Person />
            <Typography variant="h6">Application Details</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 3 }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Influencer Profile" value="profile" />
            <Tab label="Workflow" value="workflow" />
            <Tab label="Campaign Details" value="campaign" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Application Information
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <StatusChip 
                      label={application.status === 'approved' ? 'Approved - Send Contract' : 
                             application.status === 'rejected' ? 'Rejected' : 
                             application.status === 'pending' ? 'Under Review' : application.status} 
                      status={application.status}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {application.message && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        MESSAGE FROM INFLUENCER
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                        "{application.message}"
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Quick Actions
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                  <Button
                    variant="contained"
                    startIcon={<Chat />}
                    onClick={handleSendMessage}
                    sx={{ borderRadius: '8px' }}
                  >
                    Send Message
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Person />}
                    onClick={handleViewProfile}
                    sx={{ borderRadius: '8px' }}
                  >
                    View Profile
                  </Button>
                  {application.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => onStatusChange(campaign._id, application.influencer_id, 'approved')}
                        sx={{ borderRadius: '8px' }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => onStatusChange(campaign._id, application.influencer_id, 'rejected')}
                        sx={{ borderRadius: '8px' }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Campaign Details
                </Typography>
                
                <PremiumCard variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {campaign.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AttachMoney sx={{ color: 'success.main' }} />
                      <Typography variant="body1" fontWeight="600" color="success.main">
                        {campaign.currency || 'USD'} {campaign.budget}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category sx={{ color: 'primary.main' }} />
                      <Typography variant="body2">
                        {campaign.category}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ color: 'warning.main' }} />
                      <Typography variant="body2">
                        Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                </PremiumCard>
              </Grid>



                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Campaign requirements
                </Typography>
                  <PremiumCard variant="outlined" sx={{ mb: 2 }}>

                {campaign.requirements && (
                  <Box alignItems="center" gap={1} mb={1} padding={2}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      CAMPAIGN REQUIREMENTS
                    </Typography>
                    <Typography variant="body2">
                      {campaign.requirements}
                    </Typography>
                  </Box>
                )}
                </PremiumCard>
              </Grid>

                
              
            </Grid>
          )}

          {activeTab === 'profile' && (
            <Box>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : influencerData ? (
                <Grid >
                  <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                      <ProfileImage
                        userId={application.influencer_id}
                        profileType="influencer"
                        size={120}
                      />
                      <Typography variant="h5" gutterBottom mt={2} fontWeight="700">
                        {influencerData.nickname || influencerData.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {influencerData.email}
                      </Typography>
                      <Rating
                        value={4.5}
                        readOnly
                        precision={0.5}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    <Box display="flex" gap={1} flexDirection="column">
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Chat />}
                        onClick={handleSendMessage}
                        sx={{ borderRadius: '8px' }}
                      >
                        Send Message
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Person />}
                        onClick={handleViewProfile}
                        sx={{ borderRadius: '8px' }}
                      >
                        View Full Profile
                      </Button>
                    </Box>
                  </Grid>

                  
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Profile Not Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unable to load influencer profile information.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 'workflow' && (
            <ApplicationWorkflow application={application} />
          )}

          {activeTab === 'campaign' && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
                Campaign Overview
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <PremiumCard>
                    <CardContent>
                      <Typography variant="h5" gutterBottom fontWeight="700">
                        {campaign.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {campaign.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Chip 
                          label={campaign.category} 
                          color="primary" 
                          variant="outlined" 
                        />
                        <Chip 
                          label={campaign.status} 
                          color={campaign.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AttachMoney color="success" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Budget
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {campaign.currency || 'USD'} {campaign.budget}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarToday color="warning" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Deadline
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {new Date(campaign.deadline).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </PremiumCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <PremiumCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="700">
                        Campaign Requirements
                      </Typography>
                      <Typography variant="body2">
                        {campaign.requirements}
                      </Typography>
                    </CardContent>
                  </PremiumCard>
                  </Grid>


                  <Grid item xs={12} md={6}>

                  <PremiumCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="700">
                        Application Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Applications
                          </Typography>
                          <Typography variant="h6" fontWeight="700">
                            {campaign.applications?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Approved
                          </Typography>
                          <Typography variant="h6" fontWeight="700" color="success.main">
                            {campaign.applications?.filter(app => app.status === 'approved').length || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </PremiumCard>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} startIcon={<ArrowBack />} sx={{ borderRadius: '10px' }}>
          Back to Applications
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Enhanced Campaign Statistics Component
const CampaignStatistics = ({ campaign }) => {
  const stats = {
    totalApplications: campaign.applications?.length || 0,
    approvedApplications: campaign.applications?.filter(app => app.status === 'approved').length || 0,
    pendingApplications: campaign.applications?.filter(app => app.status === 'pending').length || 0,
    rejectedApplications: campaign.applications?.filter(app => app.status === 'rejected').length || 0,
    completionRate: campaign.applications?.length > 0 ? 
      Math.round((campaign.applications.filter(app => 
        ['completed', 'media_submitted', 'contracted'].includes(app.status)
      ).length / campaign.applications.length) * 100) : 0,
    // Add engagement metrics
    totalViews: campaign.total_views || 0,
    uniqueViews: campaign.unique_views || 0,
    likesCount: campaign.likes_count || 0,
    bookmarksCount: campaign.bookmarked_by?.length || 0
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease` }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
            {stats.totalApplications}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Applications
          </Typography>
        </PremiumCard>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease`, animationDelay: '0.1s' }}>
          <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
            {stats.approvedApplications}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Approved
          </Typography>
        </PremiumCard>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease`, animationDelay: '0.2s' }}>
          <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
            {stats.pendingApplications}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pending Review
          </Typography>
        </PremiumCard>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease`, animationDelay: '0.3s' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {stats.completionRate}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completion Rate
          </Typography>
        </PremiumCard>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease`, animationDelay: '0.4s' }}>
          <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
            {stats.totalViews}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Views
          </Typography>
        </PremiumCard>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <PremiumCard sx={{ textAlign: 'center', p: 2, animation: `${fadeIn} 0.5s ease`, animationDelay: '0.5s' }}>
          <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 700 }}>
            {stats.likesCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Likes
          </Typography>
        </PremiumCard>
      </Grid>
    </Grid>
  );
};

// Main Component
function BrandCampaign() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [applicationDetailOpen, setApplicationDetailOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 100000]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [applicationsTab, setApplicationsTab] = useState('all');

  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    category: '',
    deadline: '',
    status: 'active',
    currency: 'USD',
    campaignImage: null,
    campaignVideo: null
  });

  // Currency options with symbols
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];

  const categories = [
    { value: 'Fashion', label: 'Fashion', icon: '👗' },
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Lifestyle', label: 'Lifestyle', icon: '🏡' },
    { value: 'Food', label: 'Food', icon: '🍔' },
    { value: 'Travel', label: 'Travel', icon: '✈️' },
    { value: 'Fitness', label: 'Fitness', icon: '💪' },
    { value: 'Technology', label: 'Technology', icon: '📱' },
    { value: 'Gaming', label: 'Gaming', icon: '🎮' },
    { value: 'Other', label: 'Other', icon: '🔮' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'draft', label: 'Draft' }
  ];

  // Timeline filter options
  const timelineOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget-high', label: 'Budget: High to Low' },
    { value: 'budget-low', label: 'Budget: Low to High' },
    { value: 'applications-high', label: 'Applications: High to Low' },
    { value: 'applications-low', label: 'Applications: Low to High' }
  ];

  const applicationTabs = [
    { value: 'all', label: 'All Applications', count: selectedCampaign?.applications?.length || 0 },
    { value: 'pending', label: 'Pending Review', count: selectedCampaign?.applications?.filter(app => app.status === 'pending').length || 0 },
    { value: 'approved', label: 'Approved', count: selectedCampaign?.applications?.filter(app => app.status === 'approved').length || 0 },
    { value: 'rejected', label: 'Rejected', count: selectedCampaign?.applications?.filter(app => app.status === 'rejected').length || 0 }
  ];

  const steps = ['Campaign Details', 'Budget & Category', 'Media & Review'];

  // Helper function to get image URL from GridFS
  const getImageUrl = (fileId) => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:')) {
      return fileId;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
  };

  // Helper function to get video URL from GridFS
  const getVideoUrl = (fileId) => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:')) {
      return fileId;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/video/${fileId}`;
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getBrandCampaigns();
      
      const sortedCampaigns = (res.data || []).sort((a, b) => {
        return new Date(b.created_at || b.createdAt || b.date_created) - 
               new Date(a.created_at || a.createdAt || a.date_created);
      });
      
      setCampaigns(sortedCampaigns);
    } catch (err) {
      setError("Failed to load campaigns");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns based on search and filter criteria
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchQuery === '' || 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(campaign.category);
    
    const matchesStatus = selectedStatuses.length === 0 || 
      selectedStatuses.includes(campaign.status);
    
    const campaignBudget = parseFloat(campaign.budget) || 0;
    const matchesBudget = campaignBudget >= budgetRange[0] && campaignBudget <= budgetRange[1];
    
    const campaignDate = new Date(campaign.created_at || campaign.createdAt || campaign.date_created);
    const now = new Date();
    let matchesTimeline = true;
    
    switch (timelineFilter) {
      case 'today':
        matchesTimeline = campaignDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        matchesTimeline = campaignDate >= startOfWeek;
        break;
      case 'month':
        matchesTimeline = campaignDate.getMonth() === now.getMonth() && 
                         campaignDate.getFullYear() === now.getFullYear();
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        const campaignQuarter = Math.floor(campaignDate.getMonth() / 3) + 1;
        matchesTimeline = campaignQuarter === currentQuarter && 
                         campaignDate.getFullYear() === now.getFullYear();
        break;
      case 'year':
        matchesTimeline = campaignDate.getFullYear() === now.getFullYear();
        break;
      default:
        matchesTimeline = true;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesBudget && matchesTimeline;
  });

  // Sort the filtered campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || b.createdAt || b.date_created) - 
               new Date(a.created_at || a.createdAt || a.date_created);
      case 'oldest':
        return new Date(a.created_at || a.createdAt || a.date_created) - 
               new Date(b.created_at || b.createdAt || b.date_created);
      case 'budget-high':
        return (parseFloat(b.budget) || 0) - (parseFloat(a.budget) || 0);
      case 'budget-low':
        return (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0);
      case 'applications-high':
        return (b.applications?.length || 0) - (a.applications?.length || 0);
      case 'applications-low':
        return (a.applications?.length || 0) - (b.applications?.length || 0);
      default:
        return 0;
    }
  });

  // Filter applications based on selected tab
  const filteredApplications = selectedCampaign?.applications?.filter(app => {
    if (applicationsTab === 'all') return true;
    return app.status === applicationsTab;
  }) || [];

  // Calculate max budget for slider
  const maxBudget = campaigns.length > 0 
    ? Math.max(...campaigns.map(c => parseFloat(c.budget) || 0)) 
    : 10000;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setTimelineFilter('all');
    setSortBy('newest');
    setBudgetRange([0, maxBudget]);
    setFilterDrawerOpen(false);
  };

  // Get current currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === campaignForm.currency);
    return currency ? currency.symbol : '$';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCampaignForm({
        ...campaignForm,
        campaignImage: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCampaignForm({
        ...campaignForm,
        campaignVideo: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = async (campaignId, influencerId, newStatus) => {
    const key = `${campaignId}-${influencerId}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));
    
    try {
      await campaignAPI.updateApplicationStatus(campaignId, influencerId, { status: newStatus });
      setSuccess(`Application ${newStatus} successfully!`);
      fetchCampaigns();
      
      if (selectedCampaign && selectedCampaign._id === campaignId) {
        const updatedCampaigns = await campaignAPI.getBrandCampaigns();
        const updatedCampaign = updatedCampaigns.data.find(c => c._id === campaignId);
        if (updatedCampaign) {
          setSelectedCampaign(updatedCampaign);
        }
      }
    } catch (err) {
      setError('Failed to update application status');
      console.error('Status update error:', err);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleViewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setApplicationDetailOpen(true);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!campaignForm.title || !campaignForm.description || !campaignForm.requirements) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!campaignForm.budget || !campaignForm.category || !campaignForm.deadline) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateCampaign = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', campaignForm.title);
      formDataToSend.append('description', campaignForm.description);
      formDataToSend.append('requirements', campaignForm.requirements);
      formDataToSend.append('budget', campaignForm.budget);
      formDataToSend.append('category', campaignForm.category);
      formDataToSend.append('deadline', campaignForm.deadline);
      formDataToSend.append('status', campaignForm.status);
      formDataToSend.append('currency', campaignForm.currency);
      formDataToSend.append('brand_id', user.id || user._id);
      
      if (campaignForm.campaignImage) {
        formDataToSend.append('campaign_image', campaignForm.campaignImage);
      }
      
      if (campaignForm.campaignVideo) {
        formDataToSend.append('campaign_video', campaignForm.campaignVideo);
      }

      const response = await campaignAPI.createCampaign(formDataToSend);
      setCreatedCampaign(response.data);
      setSuccess('Campaign created successfully!');
      // Auto-close the modal after successful creation
      setTimeout(() => {
      setCreateModalOpen(false);
      setShowReview(false);
      setCreatedCampaign(null);
      // Reset form
      setCampaignForm({
        title: '',
        description: '',
        requirements: '',
        budget: '',
        category: '',
        deadline: '',
        status: 'active',
        currency: 'USD',
        campaignImage: null,
        campaignVideo: null
      });
      setImagePreview(null);
      setVideoPreview(null);
      setActiveStep(0);
    }, 2000); // Close after 2 seconds
    
    fetchCampaigns();
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to create campaign');
  }
};

  const handleCreateNew = () => {
    setShowReview(false);
    setActiveStep(0);
    setCampaignForm({
      title: '',
      description: '',
      requirements: '',
      budget: '',
      category: '',
      deadline: '',
      status: 'active',
      currency: 'USD',
      campaignImage: null,
      campaignVideo: null
    });
    setImagePreview(null);
    setVideoPreview(null);
    setCreatedCampaign(null);
    setCreateModalOpen(false);
  };

  const handleUpdateCampaign = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', campaignForm.title);
      formDataToSend.append('description', campaignForm.description);
      formDataToSend.append('requirements', campaignForm.requirements);
      formDataToSend.append('budget', campaignForm.budget);
      formDataToSend.append('category', campaignForm.category);
      formDataToSend.append('deadline', campaignForm.deadline);
      formDataToSend.append('status', campaignForm.status);
      formDataToSend.append('currency', campaignForm.currency);
      
      if (campaignForm.campaignImage) {
        formDataToSend.append('campaign_image', campaignForm.campaignImage);
      }
      
      if (campaignForm.campaignVideo) {
        formDataToSend.append('campaign_video', campaignForm.campaignVideo);
      }

      await campaignAPI.updateCampaign(selectedCampaign._id, formDataToSend);
      setSuccess('Campaign updated successfully!');
      setEditModalOpen(false);
      fetchCampaigns();
      setSelectedCampaign(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update campaign');
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await campaignAPI.deleteBrandCampaign(campaignToDelete._id);
      setSuccess('Campaign deleted successfully!');
      setDeleteModalOpen(false);
      setCampaignToDelete(null);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete campaign');
    }
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      title: campaign.title || '',
      description: campaign.description || '',
      requirements: campaign.requirements || '',
      budget: campaign.budget ? campaign.budget.toString() : '',
      category: campaign.category || '',
      deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
      status: campaign.status || 'active',
      currency: campaign.currency || 'USD',
      campaignImage: null,
      campaignVideo: null
    });
    setImagePreview(campaign.campaign_image_id ? getImageUrl(campaign.campaign_image_id) : null);
    setVideoPreview(campaign.campaign_video_id ? getVideoUrl(campaign.campaign_video_id) : null);
    setEditModalOpen(true);
  };

  const openDeleteModal = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteModalOpen(true);
  };

  const openMediaModal = (media, type) => {
    setSelectedMedia({ url: media, type });
    setMediaModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  const handleFormChange = (e) => {
    setCampaignForm({
      ...campaignForm,
      [e.target.name]: e.target.value
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ animation: `${fadeIn} 0.5s ease` }}>
            <TextField
              fullWidth
              label="Campaign Title"
              name="title"
              value={campaignForm.title}
              onChange={handleFormChange}
              required
              placeholder="e.g., Summer Collection Promotion"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Campaign color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Campaign Description"
              name="description"
              value={campaignForm.description}
              onChange={handleFormChange}
              required
              multiline
              rows={2}
              placeholder="Describe your campaign goals, target audience, and what you're looking for in influencers..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Description color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Requirements & Deliverables"
              name="requirements"
              value={campaignForm.requirements}
              onChange={handleFormChange}
              required
              multiline
              rows={1}
              placeholder="What do influencers need to do? (e.g., post requirements, content guidelines, deliverables)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Checklist color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ animation: `${fadeIn} 0.5s ease` }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Currency"
                  name="currency"
                  value={campaignForm.currency}
                  onChange={handleFormChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Public color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol}) - {currency.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  type="number"
                  value={campaignForm.budget}
                  onChange={handleFormChange}
                  required
                  inputProps={{ min: "0", step: "0.01" }}
                  placeholder="0.00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography color="primary">{getCurrencySymbol()}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              select
              label="Category"
              name="category"
              value={campaignForm.category}
              onChange={handleFormChange}
              required
              sx={{ my: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Category color="primary" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">
                <em>Select a category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ mr: 1, fontSize: '1.2rem' }}>{category.icon}</Typography>
                    {category.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
  fullWidth
  label="Application Deadline"
  name="deadline"
  type="datetime-local"
  value={campaignForm.deadline}
  onChange={handleFormChange}
  required
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <CalendarToday color="primary" />
      </InputAdornment>
    ),
  }}
  InputLabelProps={{
    shrink: true,
  }}
  inputProps={{
  min: new Date(new Date().setHours(0,0,0,0)).toISOString().slice(0, 16)
}}
// helperText="Deadline can be today or any future date"

/>


            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={campaignForm.status}
              onChange={handleFormChange}
              sx={{ mt: 3 }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ animation: `${fadeIn} 0.5s ease` }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Campaign Media
            </Typography>
            
            {/* Image Upload */}
            <Box sx={{ mb: 3 }}>
  <Typography variant="subtitle1" gutterBottom>
    Campaign Image (Required)
  </Typography>

  {/* Image Preview FIRST */}
  {imagePreview && (
    <Box sx={{ 
      mb: 2, 
      display: "flex", 
      justifyContent: "flex-start" 
    }}>
      <img
        src={imagePreview}
        alt="Campaign preview"
        style={{
          maxWidth: "100%",
          maxHeight: "220px",
          borderRadius: "10px"
        }}
      />
    </Box>
  )}

  {/* Upload Button BELOW */}
  <Button
    variant="outlined"
    component="label"
    startIcon={<Image />}
    sx={{ mt: 1 }}
  >
    Upload Image
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={handleImageChange}
    />
  </Button>
</Box>

            
            {/* Video Upload */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Campaign Video (Optional)
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Videocam />}
                sx={{ mb: 2 }}
              >
                Upload Video
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={handleVideoChange}
                />
              </Button>
              {videoPreview && (
                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                  <Box
                    style={{ 
                      position: 'relative',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => openMediaModal(videoPreview, 'video')}
                  >
                    <video style={{ width: '100%', maxHeight: '200px' }}>
                      <source src={videoPreview} />
                      Your browser does not support the video tag.
                    </video>
                    <Box 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 1,
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <PlayArrow style={{ color: 'white', fontSize: '48px' }} />
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Campaign Summary
            </Typography>
            <PremiumCard variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {campaignForm.title || '[No Title]'}
                  </Typography>
                  <Chip 
                    label={campaignForm.category || 'No Category'} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {campaignForm.description || '[No Description]'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="medium">
                        Budget
                      </Typography>
                      <Typography variant="body2">
                        {getCurrencySymbol()}{campaignForm.budget || '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="medium">
                        Deadline
                      </Typography>
                      <Typography variant="body2">
                        {campaignForm.deadline ? new Date(campaignForm.deadline).toLocaleString() : 'Not set'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="medium">
                        Currency
                      </Typography>
                      <Typography variant="body2">
                        {campaignForm.currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" fontWeight="medium">
                        Status
                      </Typography>
                      <Typography variant="body2">
                        {campaignForm.status}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Requirements
                    </Typography>
                    <Typography variant="body2">
                      {campaignForm.requirements || '[No Requirements]'}
                    </Typography>
                  </Box>
                </CardContent>
              </PremiumCard>
            </Box>
          );
        default:
          return 'Unknown step';
      }
    };

  // Helper function to determine badge color based on application count
const getApplicationCountColor = (count) => {
  if (count === 0) return 'default';
  if (count <= 5) return 'info';
  if (count <= 15) return 'primary';
  if (count <= 30) return 'secondary';
  return 'error'; // For very high numbers
};

  // ---------------- Render Campaign List ----------------
const renderCampaignList = () => (
  <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexDirection={isMobile ? "column" : "row"} gap={isMobile ? 2 : 0}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
          fontWeight: 700, 
          background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          pt: 1, pb: 2
          
        }}>
          Our Campaigns
        </Typography>
        <Chip 
          label={`${sortedCampaigns.length} campaigns`} 
          size="small" 
          variant="outlined" 
          color="primary" 
        />
      </Box>
      
      <Box display="flex" gap={1} alignItems="center">
        <IconButton 
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          color={viewMode === 'grid' ? 'primary' : 'default'}
        >
          {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
        </IconButton>
        
        <GradientButton
          startIcon={<Add />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ 
            borderRadius: '12px',
            ...(isMobile && { width: '100%' })
          }}
        >
          Create Campaign
        </GradientButton>
      </Box>
    </Box>

    {/* Search and Filter Section */}
    <PremiumCard sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2} flexDirection={isSmallScreen ? "column" : "row"}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search campaigns by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                    size="small"
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ 
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #3b82f6 100%)'
                }
              }}
            >
              <FilterList />
            </IconButton>
            
            {(searchQuery || selectedCategories.length > 0 || selectedStatuses.length > 0 || 
              timelineFilter !== 'all' || sortBy !== 'newest' || 
              budgetRange[0] > 0 || budgetRange[1] < maxBudget) && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                color="secondary"
                sx={{ borderRadius: '12px' }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {/* Results counter */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Showing {sortedCampaigns.length} of {campaigns.length} campaigns
            {timelineFilter !== 'all' && ` (${timelineOptions.find(t => t.value === timelineFilter)?.label})`}
            {sortBy !== 'newest' && `, sorted by ${sortOptions.find(s => s.value === sortBy)?.label}`}
          </Typography>
          {(searchQuery || selectedCategories.length > 0 || selectedStatuses.length > 0 || 
            timelineFilter !== 'all' || sortBy !== 'newest' || 
            budgetRange[0] > 0 || budgetRange[1] < maxBudget) && (
            <Chip 
              label="Filters Active" 
              color="primary" 
              variant="outlined" 
              size="small" 
              onDelete={clearFilters}
            />
          )}
        </Box>
      </CardContent>
    </PremiumCard>

    {loading ? (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <LinearProgress sx={{ width: '100%', borderRadius: '8px' }} />
      </Box>
    ) : campaigns.length === 0 ? (
      <PremiumCard sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            animation: `${pulse} 2s infinite`
          }}>
            <Campaign sx={{ fontSize: 64, color: 'grey.300' }} />
          </Box>
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            No campaigns yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first campaign to start collaborating with influencers and grow your brand
          </Typography>
          <GradientButton
            startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Your First Campaign
          </GradientButton>
        </CardContent>
      </PremiumCard>
    ) : sortedCampaigns.length === 0 ? (
      <PremiumCard sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Search sx={{ fontSize: 64, color: 'grey.300' }} />
          </Box>
          <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            No campaigns match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or clear all filters
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            sx={{ borderRadius: '12px' }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </PremiumCard>
    ) : (
      <Grid 
        container 
        spacing={3}
        sx={{
          // Ensure consistent grid behavior
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: viewMode === 'list' ? '1fr' : 'repeat(2, 1fr)',
            lg: viewMode === 'list' ? '1fr' : 'repeat(3, 1fr)'
          },
          gap: 3,
          // Reset default Grid item spacing
          '& .MuiGrid-item': {
            padding: 0,
            width: '100%'
          }
        }}
      >
        {sortedCampaigns.map((campaign, index) => (
          <Grid 
            item 
            key={campaign._id}
            sx={{ 
              animation: `${fadeIn} 0.5s ease`,
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both',
              // Ensure consistent item sizing
              display: 'flex',
              minWidth: 0 // Prevent flex item overflow
            }}
          >
            <PremiumCard 
              sx={{ 
                // Consistent dimensions for all cards
                width: '100%',
                minHeight: viewMode === 'list' ? '200px' : '480px',
                display: 'flex',
                flexDirection: viewMode === 'list' ? 'row' : 'column',
                // Consistent spacing
                p: 0,
                overflow: 'hidden'
              }}
            >
              {/* Campaign Image - Consistent sizing */}
              {campaign.campaign_image_id && (
                <Box
                  sx={{
                    position: 'relative',
                    width: viewMode === 'list' ? '240px' : '100%',
                    height: viewMode === 'list' ? '200px' : '200px',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={getImageUrl(campaign.campaign_image_id)}
                    alt={campaign.title}
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={() => openMediaModal(getImageUrl(campaign.campaign_image_id), 'image')}
                  />
                </Box>
              )}
              
              {/* Card Content - Consistent padding and layout */}
              <CardContent 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  // Consistent content spacing
                  '&:last-child': { pb: 3 }
                }}
              >
                {/* Header Section - Consistent alignment */}
                {/* Header Section with Color-Coded Application Badge */}
{/* Header Section with Improved Layout */}
<Box 
  display="flex" 
  justifyContent="space-between" 
  alignItems="flex-start" 
  mb={2}
  sx={{ 
    minHeight: '32px', 
    position: 'relative',
    gap: 1 // Add gap between title and status
  }}
>
  <Typography 
    variant="h6" 
    sx={{ 
      fontWeight: 600,
      flex: 1,
      pr: 1,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      lineHeight: 1.3,
      minHeight: '2.6em'
    }}
  >
    {campaign.title}
  </Typography>
  
  {/* Application Count Badge */}
  <Tooltip title={`${campaign.applications?.length || 0} applications received`} arrow>
    <Box sx={{ position: 'absolute', top: -8, right: -8, zIndex: 1 }}>
      <Chip
        label={campaign.applications?.length || 0}
        size="small"
        color={getApplicationCountColor(campaign.applications?.length || 0)}
        sx={{
          fontWeight: 700,
          fontSize: '0.7rem',
          minWidth: '32px',
          height: '24px',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          '& .MuiChip-label': {
            px: 1,
            py: 0.5
          }
        }}
      />
    </Box>
  </Tooltip>

  {/* Status Chip - Ensure it doesn't overlap */}
  <Chip
    label={campaign.status}
    color={campaign.status === 'active' ? 'success' : 
          campaign.status === 'completed' ? 'primary' : 
          campaign.status === 'paused' ? 'warning' : 'default'}
    size="small"
    sx={{ 
      fontWeight: 500,
      flexShrink: 0,
      mt: 0.5, // Adjust vertical alignment
      zIndex: 0 // Ensure it stays behind the application badge
    }}
  />
</Box>
                {/* Description - Consistent text treatment */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    flex: viewMode === 'list' ? 1 : 'none',
                    mb: 2,
                    // Consistent text truncation
                    display: '-webkit-box',
                    WebkitLineClamp: viewMode === 'list' ? 3 : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    minHeight: viewMode === 'list' ? '4.5em' : '3em' // 3 lines for list, 2 for grid
                  }}
                >
                  {campaign.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Stats Grid - Consistent layout */}
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'list' ? 'repeat(4, 1fr)' : '1fr',
                    gap: 2,
                    mb: 3
                  }}
                >
                  {/* Budget */}
                  <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                    <AttachMoney sx={{ fontSize: 18, mr: 1.5, color: 'success.main', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Budget
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatCurrency(campaign.budget, campaign.currency)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Deadline */}
                  <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                    <CalendarToday sx={{ fontSize: 18, mr: 1.5, color: 'warning.main', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Deadline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(campaign.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  
<Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
  <Box display="flex" alignItems="center" gap={2}>
    <Tooltip title="Total Views">
      <Box display="flex" alignItems="center" gap={0.5}>
        <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {campaign.total_views || 0}
        </Typography>
      </Box>
    </Tooltip>
    
    <Tooltip title="Likes">
      <Box display="flex" alignItems="center" gap={0.5}>
        <ThumbUp sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {campaign.likes_count || 0}
        </Typography>
      </Box>
    </Tooltip>
    
    <Tooltip title="Bookmarks">
      <Box display="flex" alignItems="center" gap={0.5}>
        <Bookmark sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          {campaign.bookmarked_by?.length || 0}
        </Typography>
      </Box>
    </Tooltip>
  </Box>
  
  <Typography variant="caption" color="text.secondary">
    {campaign.unique_views || 0} unique views
  </Typography>
</Box>

                  {/* Category */}
                  <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                    <Category sx={{ fontSize: 18, mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Category
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {campaign.category}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Applications Count - Only in list view */}
                  {viewMode === 'list' && (
                    <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                      <People sx={{ fontSize: 18, mr: 1.5, color: 'info.main', flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          Applications
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {campaign.applications?.length || 0}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons - Consistent positioning */}
                <Box 
                  display="flex" 
                  gap={1} 
                  sx={{ 
                    mt: 'auto',
                    pt: 2,
                    // Ensure consistent button sizing
                    '& .MuiButton-root, & .MuiIconButton-root': {
                      flex: viewMode === 'list' ? 'none' : 1,
                      minHeight: '36px'
                    }
                  }}
                >
                  <GradientButton
                    size="small"
                    onClick={() => setSelectedCampaign(campaign)}
                    startIcon={<TrendingUp />}
                    sx={{ borderRadius: '8px' }}
                  >
                    View Details
                  </GradientButton>
                  <IconButton
                    size="small"
                    onClick={() => openEditModal(campaign)}
                    color="primary"
                    sx={{ 
                      borderRadius: '8px',
                      background: 'rgba(25, 118, 210, 0.1)',
                      '&:hover': { background: 'rgba(25, 118, 210, 0.2)' }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => openDeleteModal(campaign)}
                    color="error"
                    sx={{ 
                      borderRadius: '8px',
                      background: 'rgba(244, 67, 54, 0.1)',
                      '&:hover': { background: 'rgba(244, 67, 54, 0.2)' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>
        ))}
      </Grid>
    )}
    
    {/* Floating Action Button for Mobile */}
    {isMobile && (
      <Zoom in={!selectedCampaign}>
        <Fab
          color="primary"
          aria-label="add campaign"
          onClick={() => setCreateModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 0%, #3b82f6 100%)'
            }
          }}
        >
          <Add />
        </Fab>
      </Zoom>
    )}
  </Box>
);
    


  // ---------------- Render Campaign Detail (Enhanced Applications Focus) ----------------
  const renderCampaignDetail = () => {
    if (!selectedCampaign) return null;

    return (
      <Box sx={{ animation: `${slideIn} 0.5s ease` }}>
        {/* Header with Back Button */}
        <Box display="flex" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <IconButton 
            onClick={() => setSelectedCampaign(null)} 
            sx={{ 
              background: 'rgba(25, 118, 210, 0.1)',
              '&:hover': { background: 'rgba(25, 118, 210, 0.2)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {selectedCampaign.title}
          </Typography>
          <Chip
            label={selectedCampaign.status}
            color={selectedCampaign.status === 'active' ? 'success' : 
                   selectedCampaign.status === 'completed' ? 'primary' : 
                   selectedCampaign.status === 'paused' ? 'warning' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Campaign Statistics */}
        <CampaignStatistics campaign={selectedCampaign} />

        {/* Campaign Media Section */}
        {(selectedCampaign.campaign_image_id || selectedCampaign.campaign_video_id) && (
          <PremiumCard sx={{ mb: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Campaign Media
              </Typography>
            </Box>
            <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {selectedCampaign.campaign_image_id && (
                <Box 
                  sx={{ 
                    position: 'relative',
                    flex: 1,
                    minWidth: 200,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => openMediaModal(getImageUrl(selectedCampaign.campaign_image_id), 'image')}
                >
                  <img 
                    src={getImageUrl(selectedCampaign.campaign_image_id)} 
                    alt="Campaign" 
                    style={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <Image sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                </Box>
              )}
              {selectedCampaign.campaign_video_id && (
                <Box 
                  sx={{ 
                    position: 'relative',
                    flex: 1,
                    minWidth: 200,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => openMediaModal(getVideoUrl(selectedCampaign.campaign_video_id), 'video')}
                >
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: 200, 
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 48, color: '#666' }} />
                  </Box>
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                </Box>
              )}
            </Box>
          </PremiumCard>
        )}

        {/* Campaign Info */}
        <PremiumCard sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Campaign Details
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: 'text.primary', lineHeight: 1.6 }}>
              {selectedCampaign.description}
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <AttachMoney sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Budget</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(selectedCampaign.budget, selectedCampaign.currency)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CalendarToday sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Deadline</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(selectedCampaign.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <Category sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Category</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedCampaign.category}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <People sx={{ fontSize: 20, mr: 1.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Applications</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedCampaign.applications?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {selectedCampaign.requirements && (
              <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Requirements:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {selectedCampaign.requirements}
                </Typography>
              </Box>
            )}
          </CardContent>
        </PremiumCard>

        {/* Applications Section with Tabs */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Applications ({selectedCampaign.applications?.length || 0})
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchCampaigns}
                sx={{ borderRadius: '8px' }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Application Tabs */}
          <Paper sx={{ mb: 2, borderRadius: '12px' }}>
            <Tabs
              value={applicationsTab}
              onChange={(e, newValue) => setApplicationsTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {applicationTabs.map((tab) => (
                <Tab 
                  key={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {tab.label}
                      <Chip 
                        label={tab.count} 
                        size="small" 
                        color={
                          tab.value === 'pending' ? 'warning' :
                          tab.value === 'approved' ? 'success' :
                          tab.value === 'rejected' ? 'error' : 'primary'
                        }
                        variant={tab.value === applicationsTab ? 'filled' : 'outlined'}
                      />
                    </Box>
                  } 
                  value={tab.value} 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <Grid container spacing={2}>
              {filteredApplications.map((app, index) => (
                <Grid item xs={12} key={index}>
                  <PremiumCard variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2} flexDirection={isSmallScreen ? "column" : "row"} gap={isSmallScreen ? 2 : 0}>
                        <Box display="flex" alignItems="center" flex={1}>
                          <UserInfo
                            userId={app.influencer_id}
                            profileType="influencer"
                            showEmail={true}
                            showStats={true}
                            size={48}
                          />
                          <Box sx={{ ml: 2 }} gap={0.5 }>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                              Applied: {new Date(app.applied_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <StatusChip 
                            label={app.status === 'approved' ? 'Approved - Send Contract' : 
                                   app.status === 'rejected' ? 'Rejected' : 
                                   app.status === 'pending' ? 'Under Review' : app.status} 
                            status={app.status}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleViewApplicationDetails(app)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      </Box>

                      {app.message && (
                        <Box sx={{ mb: 2, p: 2, background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            Influencer Message:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{app.message}"
                          </Typography>
                        </Box>
                      )}

                      {(app.status === 'pending' || !app.status) && (
                        <Box display="flex" gap={1} flexDirection={isSmallScreen ? "column" : "row"}>
                          <GradientButton
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleStatusChange(selectedCampaign._id, app.influencer_id, 'approved')}
                            disabled={updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`]}
                            sx={{ borderRadius: '8px' }}
                          >
                            {updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`] ? 'Updating...' : 'Approve'}
                          </GradientButton>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Cancel />}
                            onClick={() => handleStatusChange(selectedCampaign._id, app.influencer_id, 'rejected')}
                            disabled={updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`]}
                            sx={{ borderRadius: '8px' }}
                          >
                            {updatingStatus[`${selectedCampaign._id}-${app.influencer_id}`] ? 'Updating...' : 'Reject'}
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewApplicationDetails(app)}
                            sx={{ borderRadius: '8px' }}
                          >
                            View Details
                          </Button>
                        </Box>
                      )}

                      {app.status === 'approved' && (
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <GradientButton
                            size="small"
                            startIcon={<Send />}
                            onClick={() => {
                              // Navigate to agreements page or send contract
                              window.location.href = '/brand/agreements';
                            }}
                            sx={{ borderRadius: '8px' }}
                          >
                            Send Contract
                          </GradientButton>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Chat />}
                            onClick={() => {
                              // Navigate to chat
                              window.location.href = `/brand/collaborations?user=${app.influencer_id}&campaign=${selectedCampaign._id}`;
                            }}
                            sx={{ borderRadius: '8px' }}
                          >
                            Message
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </PremiumCard>
                </Grid>
              ))}
            </Grid>
          ) : (
            <PremiumCard sx={{ textAlign: 'center', p: 4 }}>
              <CardContent>
                <People sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                  No {applicationsTab !== 'all' ? applicationsTab : ''} applications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {applicationsTab === 'all' 
                    ? "Influencers haven't applied to this campaign yet. Check back later!"
                    : `No ${applicationsTab} applications found.`
                  }
                </Typography>
              </CardContent>
            </PremiumCard>
          )}
        </Box>
      </Box>
    );
  };

  // ---------------- Render Filter Drawer ----------------
  const renderFilterDrawer = () => (
    <Drawer
      anchor="right"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: { 
          width: isSmallScreen ? '100%' : 400,
          background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
        }
      }}
    >
      <AppBar position="sticky" elevation={1} sx={{ background: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setFilterDrawerOpen(false)}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1, fontWeight: 600 }}>
            Filters
          </Typography>
          <Button color="inherit" onClick={clearFilters} sx={{ fontWeight: 500 }}>
            Clear All
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Categories</InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value)}
            input={<OutlinedInput label="Categories" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                <Checkbox checked={selectedCategories.indexOf(category.value) > -1} />
                <ListItemText primary={category.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={selectedStatuses}
            onChange={(e) => setSelectedStatuses(e.target.value)}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                <Checkbox checked={selectedStatuses.indexOf(status.value) > -1} />
                <ListItemText primary={status.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
            input={<OutlinedInput label="Time Period" />}
          >
            {timelineOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            input={<OutlinedInput label="Sort By" />}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Typography sx={{ mb: 1 }} fontWeight={600}>
  Budget Range
</Typography>

<Box display="flex" gap={2} alignItems="center" sx={{ mb: 2 }}>
  <TextField
    label="Min"
    size="small"
    type="number"
    value={budgetRange[0]}
    onChange={(e) => {
      const value = Number(e.target.value);
      if (value <= budgetRange[1]) {
        setBudgetRange([value, budgetRange[1]]);
      }
    }}
    InputProps={{
      startAdornment: <InputAdornment position="start">$</InputAdornment>
    }}
    sx={{ width: "50%" }}
  />

  <TextField
    label="Max"
    size="small"
    type="number"
    value={budgetRange[1]}
    onChange={(e) => {
      const value = Number(e.target.value);
      if (value >= budgetRange[0]) {
        setBudgetRange([budgetRange[0], value]);
      }
    }}
    InputProps={{
      startAdornment: <InputAdornment position="start">$</InputAdornment>
    }}
    sx={{ width: "50%" }}
  />
</Box>
<Slider
  value={budgetRange}
  onChange={(e, newValue) => setBudgetRange(newValue)}
  valueLabelDisplay="auto"
  min={0}
  max={maxBudget}
  step={100}
  sx={{
    // VALUE LABEL CONTAINER
    '& .MuiSlider-valueLabel': {
      backgroundColor: '#111827',
      color: '#fff',
      fontSize: '0.75rem',
      borderRadius: '8px',
      padding: '4px 10px',
      minWidth: 42,              // <<< fixed width baseline
      textAlign: 'center',
      transform: 'translateY(-110%) scale(1) !important', // remove zoom
    },

    // VALUE LABEL TEXT WRAPPER
    '& .MuiSlider-valueLabel > *': {
      transform: 'none',         // <<< kills default rotate+scale
    },

    // REMOVE POINTER TAIL (optional)
    '& .MuiSlider-valueLabel:before': {
      display: 'none',
    },
  }}
/>



<Typography sx={{ mt: 1 }}>
  ${budgetRange[0].toLocaleString()} – ${budgetRange[1].toLocaleString()}
</Typography>

        
        <GradientButton
          fullWidth
          onClick={() => setFilterDrawerOpen(false)}
          startIcon={<CheckCircle />}
        >
          Apply Filters
        </GradientButton>
      </Box>
    </Drawer>
  );

  // ---------------- Render Create Campaign Modal ----------------
  // ---------------- Render Create Campaign Modal ----------------
const renderCreateModal = () => {
  if (showReview && createdCampaign) {
    return (
      <Dialog 
        open={createModalOpen} 
        onClose={() => {
          setCreateModalOpen(false);
          setShowReview(false);
          setCreatedCampaign(null);
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #4caf50 0%, #66bb6a 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <CheckCircle sx={{ mr: 1 }} />
          Campaign Created Successfully!
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <TrendingUp sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Your campaign is now live!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Influencers can now discover and apply to your campaign.
            </Typography>
            
            <PremiumCard variant="outlined" sx={{ textAlign: 'left', mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    {createdCampaign.title}
                  </Typography>
                  <Chip 
                    label={createdCampaign.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      Budget
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(createdCampaign.budget, createdCampaign.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" fontWeight="medium">
                      Deadline
                    </Typography>
                    <Typography variant="body2">
                      {new Date(createdCampaign.deadline).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </PremiumCard>
            
            {/* Auto-close notification */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Closing automatically...
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <GradientButton
            onClick={() => {
              setCreateModalOpen(false);
              setShowReview(false);
              setCreatedCampaign(null);
            }}
          >
            Close Now
          </GradientButton>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={createModalOpen} 
      onClose={() => setCreateModalOpen(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Campaign sx={{ mr: 1 }} />
        Create New Campaign
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={activeStep === 0 ? () => setCreateModalOpen(false) : handleBack}
          startIcon={activeStep > 0 ? <BackIcon /> : null}
          sx={{ borderRadius: '8px' }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <GradientButton
          onClick={activeStep === steps.length - 1 ? handleCreateCampaign : handleNext}
          endIcon={activeStep < steps.length - 1 ? <ArrowForward /> : null}
          disabled={activeStep === steps.length - 1 && !campaignForm.campaignImage && !imagePreview}
        >
          {activeStep === steps.length - 1 ? 'Create Campaign' : 'Next'}
        </GradientButton>
      </DialogActions>
    </Dialog>
  );
};

  // ---------------- Render Edit Modal ----------------
  const renderEditModal = () => (
    <Dialog 
      open={editModalOpen} 
      onClose={() => setEditModalOpen(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #667eea 0%, #3b82f6 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Edit sx={{ mr: 1 }} />
        Edit Campaign
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Currency"
              name="currency"
              value={campaignForm.currency}
              onChange={handleFormChange}
              select
              required
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={campaignForm.budget}
              onChange={handleFormChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {formatCurrency(0, campaignForm.currency).charAt(0)}
                  </InputAdornment>
                ),
              }}
            />
            </Grid>
          </Grid>



          <Grid container spacing={2} sx={{ p: 2, pt: 0 }}>

          <TextField
            fullWidth
            label="Campaign Title"
            name="title"
            value={campaignForm.title}
            onChange={handleFormChange}
            required
          />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ p: 2, pt: 0 }}>
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={campaignForm.description}
            onChange={handleFormChange}
            required
            multiline
            rows={1}
          />
          </Grid>
          <Grid item xs={12} sm={6} sx={{ p: 2, pt: 0 }}>
          <TextField
            fullWidth
            label="Requirements"
            name="requirements"
            value={campaignForm.requirements}
            onChange={handleFormChange}
            required
            multiline
            rows={1}
          />
          </Grid>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={campaignForm.category}
                onChange={handleFormChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={campaignForm.status}
                onChange={handleFormChange}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <TextField
  fullWidth
  label="Deadline"
  name="deadline"
  type="date"
  value={campaignForm.deadline}
  onChange={handleFormChange}
  required
  InputLabelProps={{ shrink: true }}
  sx={{ mb: 2 }}
  inputProps={{
    min: new Date().toISOString().split("T")[0], // 👈 restricts to today and future
  }}
/>


          {/* Media Section in Edit Modal */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Campaign Media
          </Typography>
          
          {/* Image Upload */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Campaign Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Image />}
              sx={{ borderRadius: '8px', mb: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 1 }}>
                <img 
                  src={imagePreview} 
                  alt="Campaign preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => openMediaModal(imagePreview, 'image')}
                />
              </Box>
            )}
          </Box>
          
          {/* Video Upload */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Campaign Video
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Videocam />}
              sx={{ borderRadius: '8px', mb: 2 }}
            >
              Upload Video
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={handleVideoChange}
              />
            </Button>
            {videoPreview && (
              <Box sx={{ mt: 1 }}>
                <Box
                  style={{ 
                    position: 'relative',
                    maxWidth: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                  onClick={() => openMediaModal(videoPreview, 'video')}
                >
                  <video style={{ width: '100%', maxHeight: '200px' }}>
                    <source src={videoPreview} />
                    Your browser does not support the video tag.
                  </video>
                  <Box 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 1,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <PlayArrow style={{ color: 'white', fontSize: '48px' }} />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setEditModalOpen(false)} 
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <GradientButton
            onClick={handleUpdateCampaign}
          >
            Update Campaign
          </GradientButton>
        </DialogActions>
      </Dialog>
    );

    const renderDeleteModal = () => (
      <Dialog 
        open={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the campaign "{campaignToDelete?.title}"?
            This action cannot be undone and will remove all associated applications.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteModalOpen(false)} 
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCampaign} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );

    const renderMediaModal = () => (
          <Dialog 
            open={mediaModalOpen} 
            onClose={() => setMediaModalOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px' } }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontWeight: 600
            }}>
              {selectedMedia?.type === 'image' ? 'Campaign Image' : 'Campaign Video'}
              <IconButton onClick={() => setMediaModalOpen(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedMedia?.type === 'image' ? (
                <img 
                  src={selectedMedia.url} 
                  alt="Campaign" 
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              ) : (
                <video 
                  controls 
                  autoPlay
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <source src={selectedMedia?.url} />
                  Your browser does not support the video tag.
                </video>
              )}
            </DialogContent>
          </Dialog>
    );

    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Fade in timeout={800}>
          <Box>
            {selectedCampaign ? renderCampaignDetail() : renderCampaignList()}

            {/* Modals */}
            {renderCreateModal()}
            {renderEditModal()}
            {renderDeleteModal()}
            {renderMediaModal()}
            {renderFilterDrawer()}

            {/* Application Detail Dialog */}
            <ApplicationDetailDialog
              open={applicationDetailOpen}
              onClose={() => setApplicationDetailOpen(false)}
              application={selectedApplication}
              campaign={selectedCampaign}
              onStatusChange={handleStatusChange}
            />

            {/* Success/Error Snackbar */}
            <Snackbar
              open={!!error || !!success}
              autoHideDuration={5000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              {error ? (
                <Alert 
                  onClose={handleCloseSnackbar} 
                  severity="error"
                  sx={{ borderRadius: '8px' }}
                >
                  {error}
                </Alert>
              ) : success ? (
                <Alert 
                  onClose={handleCloseSnackbar} 
                  severity="success"
                  sx={{ borderRadius: '8px' }}
                >
                  {success}
                </Alert>
              ) : null}
            </Snackbar>
          </Box>
        </Fade>
      </Container>
    );
  }

export default BrandCampaign;