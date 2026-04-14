import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Avatar, styled, Paper,
  IconButton, useTheme,
  Tabs, Tab, Badge,
  Drawer, FormControl, InputLabel, Select, MenuItem,
  Checkbox, Collapse, useMediaQuery, Container, InputBase,
  Stepper, Step, StepLabel,
  List, ListItem, ListItemIcon, ListItemText,
  Divider, Tooltip, Fade, Zoom, Slider,
  AppBar, Toolbar, OutlinedInput, InputAdornment
} from '@mui/material';
import { TabContext, TabPanel } from "@mui/lab";

import {
  Person, CalendarToday, Campaign,
  CheckCircle, Cancel, Visibility, VisibilityOff,
  FilterList, Search, Close, TrendingUp, ArrowBack, Instagram, YouTube, Payment, Description, Chat, Image as ImageIcon,
  ExpandMore, ClearAll, VideoLibrary,
  Check, Clear, AccessTime, Work, Refresh, Email, Audiotrack, InsertDriveFile, Download, PictureAsPdf, WorkOutline,
  Assignment, AssignmentTurnedIn, MonetizationOn, ThumbUp, ThumbDown,
  Category, AttachMoney, Flag, Schedule, Star, Language,
  Group, TrendingFlat, Receipt, Security, VerifiedUser,
  LocalOffer, Business, ContactMail, Public, Analytics, Send
} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBullseye,
  faUser,
  faChartBar,
  faMoneyBillWave,
  faCalendarDays,
  faFileContract,
  faUsers,
  faChartLine,
  faStar, faChartPie,
  faArrowsRotate,

  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import { campaignAPI } from '../../services/api';
import { subDays, format } from 'date-fns';
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";
import { FaRocket } from 'react-icons/fa';

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const ProfessionalCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  background: '#ffffff',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 60px ${theme.palette.primary.main}25`,
    borderColor: theme.palette.primary.light
  }
}));

const FixedImageContainer = styled(Box)(({ theme }) => ({
  height: '220px',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
  borderRadius: '20px 20px 0 0',
  backgroundColor: theme.palette.primary.main
}));

const StatsBadge = styled(Box)(({ theme, type }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: type === 'premium'
    ? 'linear-gradient(135deg, #FFD700, #FFA000)'
    : theme.palette.primary.main,
  color: 'white',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease'
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 24px',
  borderRadius: '50px',
  boxShadow: `0 6px 24px ${theme.palette.primary.main}15`,
  border: `2px solid ${theme.palette.primary.light}20`,
  backgroundColor: '#ffffff',
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: `0 8px 32px ${theme.palette.primary.main}25`,
    borderColor: theme.palette.primary.light,
    transform: 'translateY(-2px)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.7rem',
  height: '26px',
  borderRadius: '8px',
  ...(status === 'approved' && {
    backgroundColor: '#4CAF50',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'pending' && {
    backgroundColor: '#FF9800',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'rejected' && {
    backgroundColor: '#F44336',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  }),
  ...(status === 'completed' && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
  }),
  ...(status === 'contracted' && {
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
    boxShadow: `0 4px 12px ${theme.palette.secondary.main}30`
  }),
  ...(status === 'media_submitted' && {
    backgroundColor: '#FF9800',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  })
}));

const WorkflowStepper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#f8faff',
  borderRadius: '16px',
  border: `2px solid ${theme.palette.primary.light}20`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
}));

const MediaPreviewCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid transparent`,
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    borderColor: theme.palette.primary.light
  }
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: '18px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  boxShadow: `0 6px 20px ${theme.palette.primary.main}30`
}));

const AnimatedTab = styled(Tab)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  py: 2,
  minHeight: '60px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  borderRadius: '12px',
  margin: '0 4px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    boxShadow: `0 4px 15px ${theme.palette.primary.main}30`,
    transform: 'scale(1.05)'
  },
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

// =============================================
// 🖼️ CAMPAIGN IMAGE COMPONENT
// =============================================

const CampaignImage = ({ fileId, alt, onClick, campaignData }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getImageUrl = () => {
    if (!fileId) return null;

    if (fileId.startsWith('http') || fileId.startsWith('data:') || fileId.startsWith('blob:')) {
      return fileId;
    }

    return `${process.env.REACT_APP_API_URL || API_BASE_URL}/api/campaigns/image/${fileId}`;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl || error) {
    return (
      <FixedImageContainer onClick={onClick}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: onClick ? 'pointer' : 'default',
            color: 'white',
            padding: 2
          }}
        >
          <Campaign sx={{ fontSize: 48, opacity: 0.8, mb: 1 }} />
          <Typography variant="h6" fontWeight="700" textAlign="center">
            {campaignData?.title || 'Campaign'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
            {campaignData?.category || 'Marketing Campaign'}
          </Typography>
        </Box>
      </FixedImageContainer>
    );
  }

  return (
    <FixedImageContainer>
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
            background: 'rgba(255, 255, 255, 0.95)',
            zIndex: 1,
            borderRadius: '20px 20px 0 0'
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {/* Campaign Budget Overlay */}
      {campaignData?.budget && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 2
          }}
        >
          <AttachMoney sx={{ fontSize: 14, mr: 0.5 }} />
          {campaignData.currency || 'USD'} {campaignData.budget.toLocaleString()}
        </Box>
      )}
    </FixedImageContainer>
  );
};

// =============================================
// 👤 PROFILE IMAGE COMPONENT
// =============================================

const ProfileImage = ({ userId, profileType, alt, onClick, size = 40 }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);

        if (response?.profile) {
          setUserData(response.profile);

          let imageId = null;
          if (profileType === 'influencer' && response.profile.profile_picture) {
            imageId = response.profile.profile_picture;
          } else if (profileType === 'brand' && response.profile.logo) {
            imageId = response.profile.logo;
          }

          if (imageId) {
            setImageUrl(`${API_BASE_URL}/profiles/image/${imageId}`);
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
    return alt || 'Brio user';
  };

  const getDisplayInitial = () => {
    const name = getDisplayName();
    return name?.charAt(0)?.toUpperCase() || 'B';
  };

  if (error || !imageUrl) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          background: theme.palette.primary.main,
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 700,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '2px solid white'
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
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '2px solid white'
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

// =============================================
// 👤 USER INFO COMPONENT
// =============================================

const UserInfo = ({ userId, profileType, showEmail = true, size = 40, showStats = false }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response?.profile) {
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
    if (!userData) return 'Brio User';

    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Unknown Influencer';
    } else {
      return userData.company_name || userData.contact_person_name || 'Unknown Brand';
    }
  };

  const getStats = () => {
    if (!userData || !showStats) return null;

    return {
      followers: userData.followers || 'N/A',
      engagement: userData.engagement_rate || 'N/A',
      rating: userData.rating || 'N/A'
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1.5}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Brio User
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
      <Box flex={1}>
        <Typography
          variant="subtitle2"
          fontWeight="700"
          sx={{
            cursor: 'pointer',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
          }}
          onClick={handleViewProfile}
        >
          {getDisplayName()}
        </Typography>

        {showStats && stats && (
          <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
            {stats.followers !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                <FontAwesomeIcon icon={faUsers} /> {stats.followers.toLocaleString()}
              </Typography>

            )}
            {stats.engagement !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                <FontAwesomeIcon icon={faChartLine} /> {stats.engagement}%
              </Typography>
            )}
            {stats.rating !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                <FontAwesomeIcon icon={faStar} /> {stats.rating}
              </Typography>
            )}
          </Box>
        )}

        {showEmail && userData?.email && (
          <Typography variant="caption" color="text.secondary" display="block">
            {userData.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// =============================================
// 💼 APPLICATION WORKFLOW COMPONENT
// =============================================

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
      icon: <ImageIcon />
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
    <WorkflowStepper>
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
    </WorkflowStepper>
  );
};

// =============================================
// 💰 CAMPAIGN METRICS COMPONENT
// =============================================

// const CampaignMetrics = ({ applications }) => {
//   const metrics = {
//     total: applications.length,
//     pending: applications.filter(app => app.status === 'pending').length,
//     approved: applications.filter(app => app.status === 'approved').length,
//     contracted: applications.filter(app => app.status === 'contracted' || app.contract_signed).length,
//     completed: applications.filter(app => app.status === 'completed').length,
//     totalBudget: applications.reduce((sum, app) => sum + (app.budget || 0), 0)
//   };

//   return (
//     <Grid container spacing={2} sx={{ mb: 3 }}>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard>
//           <Typography variant="h4" fontWeight="700">
//             {metrics.total}
//           </Typography>
//           <Typography variant="caption">Total Applications</Typography>
//         </MetricCard>
//       </Grid>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard sx={{ backgroundColor: '#FF9800' }}>
//           <Typography variant="h4" fontWeight="700">
//             {metrics.pending}
//           </Typography>
//           <Typography variant="caption">Pending Review</Typography>
//         </MetricCard>
//       </Grid>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard sx={{ backgroundColor: '#4CAF50' }}>
//           <Typography variant="h4" fontWeight="700">
//             {metrics.approved}
//           </Typography>
//           <Typography variant="caption">Approved</Typography>
//         </MetricCard>
//       </Grid>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard sx={{ backgroundColor: 'secondary.main' }}>
//           <Typography variant="h4" fontWeight="700">
//             {metrics.contracted}
//           </Typography>
//           <Typography variant="caption">Contracted</Typography>
//         </MetricCard>
//       </Grid>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard sx={{ backgroundColor: 'primary.main' }}>
//           <Typography variant="h4" fontWeight="700">
//             {metrics.completed}
//           </Typography>
//           <Typography variant="caption">Completed</Typography>
//         </MetricCard>
//       </Grid>
//       <Grid item xs={6} sm={4} md={2}>
//         <MetricCard sx={{ backgroundColor: '#FF5722' }}>
//           <Typography variant="h4" fontWeight="700">
//             ${metrics.totalBudget.toLocaleString()}
//           </Typography>
//           <Typography variant="caption">Total Budget</Typography>
//         </MetricCard>
//       </Grid>
//     </Grid>
//   );
// };

// =============================================
// 📊 DETAILED FILTER COMPONENT
// =============================================

const DetailedFilterSection = ({ filters, onFilterChange, onClearFilters, applicationCounts }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    campaign: true,
    influencer: true,
    performance: true,
    status: true,
    budget: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sliderStyle = {
    mt: 2,
    mb: 2,
    '& .MuiSlider-valueLabel': {
      fontSize: '0.8rem',
      fontWeight: 700,
      top: -6,
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      borderRadius: '8px',
      padding: '4px 10px',
      minWidth: 'max-content',
      width: 'auto',
      whiteSpace: 'nowrap',
      '&:before': { display: 'none' }
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Under Review', count: applicationCounts?.pending || 0 },
    { value: 'approved', label: 'Approved', count: applicationCounts?.approved || 0 },
    { value: 'rejected', label: 'Rejected', count: applicationCounts?.rejected || 0 },
    { value: 'contracted', label: 'Contracted', count: applicationCounts?.contracted || 0 },
    { value: 'media_submitted', label: 'Media Submitted', count: applicationCounts?.media_submitted || 0 },
    { value: 'completed', label: 'Completed', count: applicationCounts?.completed || 0 }
  ];

  const StyledFilterGroup = styled(Box)(({ theme }) => ({
    marginBottom: '20px',
    '& .section-header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      padding: '10px 0',
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: '16px',
      color: theme.palette.text.secondary,
      transition: 'all 0.2s ease',
      '&:hover': {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main
      }
    }
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Search Header */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Global keyword search..."
        value={filters.globalSearch || ''}
        onChange={(e) => onFilterChange('globalSearch', e.target.value)}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            background: 'rgba(25, 118, 210, 0.05)'
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="primary" />
            </InputAdornment>
          )
        }}
      />

      {/* Campaign Details */}
      <StyledFilterGroup>
        <Box className="section-header" onClick={() => toggleSection('campaign')}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={faBullseye} />
            <Typography variant="subtitle2" fontWeight="700">CAMPAIGN</Typography>
          </Box>
          <ExpandMore sx={{ transform: expandedSections.campaign ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </Box>
        <Collapse in={expandedSections.campaign}>
          <TextField
            fullWidth
            size="small"
            label="Campaign Title"
            value={filters.title || ''}
            onChange={(e) => onFilterChange('title', e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => onFilterChange('category', e.target.value)}
              input={<OutlinedInput label="Category" />}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="fashion">Fashion</MenuItem>
              <MenuItem value="beauty">Beauty</MenuItem>
              <MenuItem value="lifestyle">Lifestyle</MenuItem>
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="food">Food & Beverage</MenuItem>
              <MenuItem value="travel">Travel</MenuItem>
              <MenuItem value="fitness">Fitness</MenuItem>
              <MenuItem value="gaming">Gaming</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Requirements Search"
            value={filters.requirements || ''}
            onChange={(e) => onFilterChange('requirements', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Collapse>
      </StyledFilterGroup>

      {/* Influencer Details */}
      <StyledFilterGroup>
        <Box className="section-header" onClick={() => toggleSection('influencer')}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={faUser} />
            <Typography variant="subtitle2" fontWeight="700">INFLUENCER</Typography>
          </Box>
          <ExpandMore sx={{ transform: expandedSections.influencer ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </Box>
        <Collapse in={expandedSections.influencer}>
          <TextField
            fullWidth
            size="small"
            label="Full Name / Nickname"
            value={filters.influencerName || ''}
            onChange={(e) => onFilterChange('influencerName', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label="Message Search"
            value={filters.message || ''}
            onChange={(e) => onFilterChange('message', e.target.value)}
            sx={{ mb: 2 }}
          />
        </Collapse>
      </StyledFilterGroup>

      {/* Performance Slider Section */}
      <StyledFilterGroup>
        <Box className="section-header" onClick={() => toggleSection('performance')}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={faChartLine} />
            <Typography variant="subtitle2" fontWeight="700">PERFORMANCE</Typography>
          </Box>
          <ExpandMore sx={{ transform: expandedSections.performance ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </Box>
        <Collapse in={expandedSections.performance}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="700">FOLLOWER RANGE</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                size="small"
                value={[filters.minFollowers || 0, filters.maxFollowers || 1000000]}
                onChange={(e, val) => {
                  onFilterChange('minFollowers', val[0]);
                  onFilterChange('maxFollowers', val[1]);
                }}
                min={0}
                max={1000000}
                step={1000}
                valueLabelDisplay="auto"
                sx={sliderStyle}
              />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {(filters.minFollowers || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(filters.maxFollowers || 1000000).toLocaleString()}+
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="700">ENGAGEMENT RATE (%)</Typography>
            <Slider
              size="small"
              value={filters.minEngagement || 0}
              onChange={(e, val) => onFilterChange('minEngagement', val)}
              min={0}
              max={20}
              step={0.5}
              valueLabelDisplay="auto"
              sx={sliderStyle}
            />
          </Box>
        </Collapse>
      </StyledFilterGroup>

      {/* Status & Timing */}
      <StyledFilterGroup>
        <Box className="section-header" onClick={() => toggleSection('status')}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={faChartBar} />
            <Typography variant="subtitle2" fontWeight="700">STATUS & DATE</Typography>
          </Box>
          <ExpandMore sx={{ transform: expandedSections.status ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </Box>
        <Collapse in={expandedSections.status}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Application Status</InputLabel>
            <Select
              multiple
              value={filters.status || []}
              onChange={(e) => onFilterChange('status', e.target.value)}
              input={<OutlinedInput label="Application Status" />}
              renderValue={(selected) => `${selected.length} Selected`}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(filters.status || []).includes(option.value)} />
                  <ListItemText primary={option.label} />
                  <Chip label={option.count} size="small" sx={{ ml: 1 }} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Apply Date Range</InputLabel>
            <Select
              value={filters.dateRange || ''}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              input={<OutlinedInput label="Apply Date Range" />}
            >
              <MenuItem value="">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          {filters.dateRange === 'custom' && (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="End"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </Collapse>
      </StyledFilterGroup>

      {/* Budget & Currency */}
      <StyledFilterGroup>
        <Box className="section-header" onClick={() => toggleSection('budget')}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FontAwesomeIcon icon={faMoneyBillWave} />
            <Typography variant="subtitle2" fontWeight="700">BUDGET</Typography>
          </Box>
          <ExpandMore sx={{ transform: expandedSections.budget ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </Box>
        <Collapse in={expandedSections.budget}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Currency</InputLabel>
            <Select
              value={filters.currency || ''}
              onChange={(e) => onFilterChange('currency', e.target.value)}
              input={<OutlinedInput label="Currency" />}
            >
              <MenuItem value="">Any Currency</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="EUR">EUR (€)</MenuItem>
              <MenuItem value="GBP">GBP (£)</MenuItem>
              <MenuItem value="INR">INR (₹)</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Min"
                type="number"
                value={filters.minBudget || ''}
                onChange={(e) => onFilterChange('minBudget', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Max"
                type="number"
                value={filters.maxBudget || ''}
                onChange={(e) => onFilterChange('maxBudget', e.target.value)}
              />
            </Grid>
          </Grid>
        </Collapse>
      </StyledFilterGroup>

      {/* Results Summary Box */}
      <Box sx={{
        p: 3,
        mt: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        borderRadius: '16px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)'
      }}>
        <Typography variant="h5" fontWeight="800">
          {(applicationCounts?.filtered || 0).toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: '1px' }}>
          APPLICATIONS MATCHED
        </Typography>
      </Box>
    </Box>
  );
};


// =============================================
// 💬 SEND CONTRACT DIALOG - FIXED VERSION
// =============================================

const SendContractDialog = ({ open, onClose, application, onSendContract }) => {
  const theme = useTheme();
  const [sending, setSending] = useState(false);
  const [influencerData, setInfluencerData] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);

  const safeApplication = application || {};
  const influencerId = safeApplication.influencer_id;
  const campaignId = safeApplication.campaign_id;

  useEffect(() => {
    const fetchData = async () => {
      if (open && influencerId && campaignId) {
        setLoading(true);
        try {
          // Fetch influencer data
          let influencerResponse;
          try {
            influencerResponse = await profileAPI.getProfileById(influencerId);
          } catch (error) {
            console.error('Error fetching influencer data:', error);
            // Create fallback influencer data
            influencerResponse = {
              profile: {
                nickname: safeApplication.influencer_name || 'Unknown Influencer',
                full_name: safeApplication.influencer_name || 'Unknown Influencer',
                email: safeApplication.influencer_email || 'No email available',

                categories: safeApplication.category ? [safeApplication.category] : [],
                bio: safeApplication.message || 'No bio available'
              }
            };
          }

          // Fetch campaign data
          let campaignResponse;
          try {
            campaignResponse = await campaignAPI.getCampaignDetail(campaignId);
          } catch (error) {
            console.error('Error fetching campaign data:', error);
            // Create fallback campaign data
            campaignResponse = {
              title: safeApplication.title || 'Unknown Campaign',
              description: safeApplication.description || 'No description available',
              budget: safeApplication.budget || 0,
              currency: safeApplication.currency || 'USD',
              category: safeApplication.category || 'General',
              deadline: safeApplication.deadline,
              status: safeApplication.status || 'active',
              requirements: safeApplication.requirements || 'No specific requirements'
            };
          }

          if (influencerResponse?.profile) {
            setInfluencerData(influencerResponse.profile);
          }
          if (campaignResponse) {
            setCampaignData(campaignResponse);
          }
        } catch (error) {
          console.error('Error fetching data for contract:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (open) {
      fetchData();
    } else {
      setInfluencerData(null);
      setCampaignData(null);
      setLoading(false);
    }
  }, [open, influencerId, campaignId, safeApplication]);

  const handleSendContract = async () => {
    if (!application) return;

    setSending(true);
    try {
      await onSendContract(application);
      onClose();
    } catch (error) {
      console.error('Error sending contract:', error);
    } finally {
      setSending(false);
    }
  };

  const getInfluencerStats = () => {
    if (!influencerData) return null;

    return {

      categories: influencerData.categories || [],
      bio: influencerData.bio || 'No bio available'
    };
  };

  const stats = getInfluencerStats();

  if (!application) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>No application data available.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          minHeight: '700px',
          background: '#ffffff'
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        fontWeight: 700,
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Description sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5">Send Contract Agreement</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Formalize your collaboration with {influencerData?.nickname || influencerData?.full_name || 'the influencer'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px" flexDirection="column">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading contract details...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column - Campaign Details */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <FontAwesomeIcon icon={faBullseye} />
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Campaign Overview
                </Typography>
              </Box>


              {campaignData ? (
                <Box sx={{ p: 3, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h5" fontWeight="700" gutterBottom color="primary">
                    {campaignData.title}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachMoney color="success" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Budget
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {campaignData.currency || 'USD'} {campaignData.budget?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Category color="info" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {campaignData.category || 'General'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule color="warning" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Deadline
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {campaignData.deadline ? format(new Date(campaignData.deadline), 'MMM dd, yyyy') : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Flag color="secondary" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Status
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {campaignData.status || 'Active'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {campaignData.description && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ p: 1.5, background: 'grey.50', borderRadius: '8px', lineHeight: 1.6 }}>
                        {campaignData.description}
                      </Typography>
                    </Box>
                  )}

                  {campaignData.requirements && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Requirements
                      </Typography>
                      <Typography variant="body2" sx={{ p: 1.5, background: 'grey.50', borderRadius: '8px', lineHeight: 1.6 }}>
                        {campaignData.requirements}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Campaign details not available
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Right Column - Influencer & Contract Details */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <FontAwesomeIcon icon={faUser} />
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Influencer Profile
                </Typography>
              </Box>


              {influencerData ? (
                <Box sx={{ p: 3, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', mb: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <ProfileImage
                      userId={influencerId}
                      profileType="influencer"
                      size={60}
                    />
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="700">
                        {influencerData.nickname || influencerData.full_name || 'Unknown Influencer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {influencerData.email || 'No email available'}
                      </Typography>
                    </Box>
                  </Box>


                  {/* Categories */}
                  {stats.categories && stats.categories.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Categories
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {stats.categories.slice(0, 3).map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                        {stats.categories.length > 3 && (
                          <Chip
                            label={`+${stats.categories.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Bio */}
                  {stats.bio && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        About
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{stats.bio}"
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Influencer details not available
                  </Typography>
                </Box>
              )}

              {/* Contract Terms */}
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <FontAwesomeIcon icon={faFileContract} />
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Contract Terms
                </Typography>
              </Box>


              <Box sx={{ p: 2.5, backgroundColor: '#e3f2fd', borderRadius: '12px', mb: 3 }}>
                <Typography variant="body2" color="info.dark" fontWeight="600">
                  This agreement formalizes the collaboration between your brand and the influencer. Key terms include deliverables, timeline, compensation, and usage rights.
                </Typography>
              </Box>

              <List dense>
                {[
                  {
                    icon: <CheckCircle color="success" />,
                    text: "Deliverables & Timeline",
                    subtext: "Clear specification of required content and submission deadlines"
                  },
                  {
                    icon: <AttachMoney color="primary" />,
                    text: "Compensation",
                    subtext: `${safeApplication.currency || 'USD'} ${safeApplication.budget || 'N/A'} upon satisfactory completion`
                  },
                  {
                    icon: <Security color="info" />,
                    text: "Content Usage Rights",
                    subtext: "Brand receives rights to use submitted content for marketing"
                  },
                  {
                    icon: <VerifiedUser color="warning" />,
                    text: "Approval Process",
                    subtext: "Brand approval required before content publication"
                  },
                  {
                    icon: <Receipt color="secondary" />,
                    text: "Payment Terms",
                    subtext: "Payment released within 7 days of content approval"
                  }
                ].map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      secondary={item.subtext}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: '12px', px: 4, py: 1 }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendContract}
          disabled={sending || loading}
          startIcon={sending ? <CircularProgress size={16} /> : <Email />}
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          {sending ? 'Sending Contract...' : 'Send Contract Agreement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// 🖼️ MEDIA UTILITIES & COMPONENTS
// =============================================

const getMediaIcon = (mediaType) => {
  switch (mediaType) {
    case 'image': return <ImageIcon color="primary" />;
    case 'video': return <VideoLibrary color="secondary" />;
    case 'audio': return <Audiotrack color="info" />;
    case 'document': return <PictureAsPdf color="error" />;
    default: return <InsertDriveFile color="action" />;
  }
};

const getMediaViewUrl = (media) => {
  if (!media.file_id) return null;
  const baseUrl = `${process.env.REACT_APP_API_URL || API_BASE_URL}/api/media/${media.file_id}`;

  if (media.media_type === 'image' || media.media_type === 'video' || media.media_type === 'audio') {
    return `${baseUrl}/view`;
  }

  return `${baseUrl}/download`;
};

const handleDownload = async (fileId, filename) => {
  try {
    const response = await campaignAPI.downloadMediaFile(fileId);
    const url = window.URL.createObjectURL(response);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `file-${fileId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    const downloadUrl = `${process.env.REACT_APP_API_URL || API_BASE_URL}/api/media/${fileId}/download`;
    window.open(downloadUrl, '_blank');
  }
};

const MediaPreview = ({ media }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (media.media_type === 'image') {
        setPreviewLoading(true);
        try {
          const viewUrl = getMediaViewUrl(media);
          if (viewUrl) {
            const response = await fetch(viewUrl);
            if (response.ok) {
              const blob = await response.blob();
              setPreviewUrl(URL.createObjectURL(blob));
            } else {
              setPreviewError('Failed to load preview');
            }
          } else {
            setPreviewError('No valid URL for preview');
          }
        } catch (error) {
          console.error('Error loading preview:', error);
          setPreviewError('Failed to load preview');
        } finally {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [media]);

  if (media.media_type === 'image') {
    if (previewLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="140px">
          <CircularProgress size={30} />
        </Box>
      );
    }

    if (previewError) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="140px" flexDirection="column">
          <ImageIcon color="disabled" />
          <Typography variant="caption" color="text.secondary">
            Preview unavailable
          </Typography>
        </Box>
      );
    }

    if (previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={media.filename}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '12px'
          }}
        />
      );
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="140px" flexDirection="column" sx={{ bgcolor: 'grey.50' }}>
      {getMediaIcon(media.media_type)}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {media.media_type?.toUpperCase() || 'FILE'}
      </Typography>
    </Box>
  );
};

// =============================================
// 📁 MEDIA FILES DIALOG
// =============================================

const MediaFilesDialog = ({ open, onClose, application }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (open && application) {
        setLoading(true);
        setError('');
        try {
          let mediaData = [];

          try {
            const response = await campaignAPI.getCampaignMediaFiles(application.campaign_id);
            if (response && Array.isArray(response)) {
              mediaData = response.filter(media =>
                media.influencer_id === application.influencer_id
              );
            }
          } catch (campaignError) {
            console.warn('Campaign media API failed:', campaignError);
          }

          if (mediaData.length === 0 && application.submitted_media) {
            mediaData = application.submitted_media.map(media => ({
              ...media,
              campaign_id: application.campaign_id,
              influencer_id: application.influencer_id
            }));
          }

          setMediaFiles(mediaData);

          if (mediaData.length === 0) {
            setError('No media files found for this application.');
          }

        } catch (error) {
          console.error('Error fetching media files:', error);
          setError('Failed to load media files. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMediaFiles();
  }, [open, application]);

  const handleViewMedia = (media) => {
    setSelectedMedia(media);
  };

  if (!application) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            minHeight: '600px',
            background: '#ffffff'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#FF9800',
          color: 'white',
          fontWeight: 700,
          py: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <ImageIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5">
                  Submitted Media Files
                  {mediaFiles.length > 0 && ` (${mediaFiles.length})`}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {application.influencer_name} - {application.title}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 4 }}>
          {/* Application Info */}
          <Box sx={{ p: 3, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="700" color="primary">
                  {application.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Media submitted by {application.influencer_name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {application.media_submitted_at ? format(new Date(application.media_submitted_at), 'MMM dd, yyyy') : 'Waiting...'}
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <StatusChip
                        label={application.status === 'media_submitted' ? 'Ready for Review' : application.status}
                        status={application.status}
                      />
                    </Typography>
                  </Box>
                  {application.budget && (
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="success.main">
                        {application.currency || 'USD'} {application.budget}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: '12px' }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px" flexDirection="column">
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading media files...
              </Typography>
            </Box>
          ) : mediaFiles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <ImageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Media Files Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {error || "No media files have been submitted for this campaign yet."}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                sx={{ borderRadius: '12px' }}
              >
                Refresh
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {mediaFiles.map((media, index) => (
                <Grid item xs={12} sm={6} md={4} key={media.file_id || index}>
                  <MediaPreviewCard>
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Media Preview */}
                      <MediaPreview media={media} />

                      <Box display="flex" alignItems="center" gap={1} mb={1} sx={{ mt: 2 }}>
                        {getMediaIcon(media.media_type)}
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="600" noWrap>
                            {media.filename || `File ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {media.media_type} • {media.size ? `${(media.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                          </Typography>
                        </Box>
                      </Box>

                      {media.description && (
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', fontSize: '0.8rem' }} noWrap>
                          "{media.description}"
                        </Typography>
                      )}

                      {media.submitted_at && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(media.submitted_at), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewMedia(media)}
                        sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                        disabled={!media.file_id}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(media.file_id, media.filename)}
                        sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                        disabled={!media.file_id}
                        color="success"
                      >
                        Download
                      </Button>
                    </CardActions>
                  </MediaPreviewCard>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} variant="contained" sx={{ borderRadius: '12px', px: 4 }}>
            Close Media Manager
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Viewer Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ backgroundColor: '#333', color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedMedia?.filename || 'Media View'}</Typography>
            <IconButton onClick={() => setSelectedMedia(null)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, backgroundColor: '#000', display: 'flex', justifyContent: 'center', minHeight: '400px' }}>
          {selectedMedia?.media_type === 'image' && (
            <img
              src={getMediaViewUrl(selectedMedia)}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
          {selectedMedia?.media_type === 'video' && (
            <video
              src={getMediaViewUrl(selectedMedia)}
              controls
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
              autoPlay
            />
          )}
          {selectedMedia?.media_type === 'audio' && (
            <Box display="flex" alignItems="center" justifyContent="center" width="100%" p={4}>
              <audio src={getMediaViewUrl(selectedMedia)} controls autoPlay />
            </Box>
          )}
          {!['image', 'video', 'audio'].includes(selectedMedia?.media_type) && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6} color="white">
              <PictureAsPdf sx={{ fontSize: 80, mb: 2 }} />
              <Typography>Preview not available for this file type.</Typography>
              <Button
                variant="contained"
                onClick={() => handleDownload(selectedMedia.file_id, selectedMedia.filename)}
                sx={{ mt: 3 }}
              >
                Download to View
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

/* =============================================
   📁 APPLICATION MEDIA GALLERY (In-place Preview)
   ============================================= */
const ApplicationMediaGallery = ({ application }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!application) return;
      setLoading(true);
      setError('');
      try {
        const response = await campaignAPI.getCampaignMediaFiles(application.campaign_id);
        if (response && Array.isArray(response)) {
          const userMedia = response.filter(m => m.influencer_id === application.influencer_id);
          setMediaFiles(userMedia);

          if (userMedia.length === 0 && application.submitted_media) {
            setMediaFiles(application.submitted_media);
          }
        } else if (application.submitted_media) {
          setMediaFiles(application.submitted_media);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (application.submitted_media) {
          setMediaFiles(application.submitted_media);
        } else {
          setError('Failed to load media files');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [application]);

  if (loading) return (
    <Box display="flex" justifyContent="center" py={8} flexDirection="column" alignItems="center" gap={2}>
      <CircularProgress thickness={5} size={40} />
      <Typography variant="body2" color="text.secondary">Fetching media files...</Typography>
    </Box>
  );

  if (error && mediaFiles.length === 0) return (
    <Box textAlign="center" py={6} bgcolor="error.light" sx={{ opacity: 0.1, borderRadius: '16px' }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (mediaFiles.length === 0) return (
    <Box textAlign="center" py={8} bgcolor="grey.50" borderRadius="24px" border="2px dashed" borderColor="divider">
      <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
      <Typography color="text.secondary" fontWeight="600">No media files submitted yet.</Typography>
      <Typography variant="caption" color="text.disabled">Submitted content will appear here directly.</Typography>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={2}>
        {mediaFiles.map((media, index) => (
          <Grid item xs={12} sm={6} md={4} key={media.file_id || index}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                cursor: 'pointer',
                aspectRatio: '1/1',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                  borderColor: 'primary.light'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => setMediaDialogOpen(true)}
            >
              <MediaPreview media={media} />
            </Paper>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', px: 1, color: 'text.secondary', fontWeight: 600 }} noWrap>
              {media.filename || `Media Asset ${index + 1}`}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => setMediaDialogOpen(true)}
          sx={{
            borderRadius: '25px',
            px: 4,
            fontWeight: 700,
            textTransform: 'none',
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              backgroundColor: 'primary.main',
              color: 'white'
            }
          }}
        >
          View All {mediaFiles.length} Media Files
        </Button>
      </Box>

      <MediaFilesDialog
        open={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        application={application}
      />
    </Box>
  );
};



// =============================================
// 🎯 MAIN COMPONENT - BRAND APPLICATIONS
// =============================================

const BrandApplications = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State Management
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [sendContractDialogOpen, setSendContractDialogOpen] = useState(false);
  const [mediaFilesDialogOpen, setMediaFilesDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [detailTab, setDetailTab] = useState('overview');
  const [isTabSticky, setIsTabSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80) {
        setIsTabSticky(true);
      } else {
        setIsTabSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced Filter State
  const [filters, setFilters] = useState({
    globalSearch: '',
    title: '',
    influencerName: '',
    influencerEmail: '',
    category: '',
    status: [],
    minBudget: '',
    maxBudget: '',
    currency: '',
    requirements: '',
    message: '',
    dateRange: '',
    startDate: '',
    endDate: '',
    minFollowers: 0,
    maxFollowers: 1000000,
    minEngagement: 0,
    maxEngagement: 100,
    minViews: 0,
    minLikes: 0
  });

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications whenever filters or applications change
  useEffect(() => {
    let filtered = applications;

    // Tab filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(app => {
        switch (activeTab) {
          case 'approved': return app.status === 'approved' && !app.contract_sent;
          case 'pending': return app.status === 'pending';
          case 'rejected': return app.status === 'rejected';
          case 'sent': return app.contract_sent && !app.contract_signed;
          case 'contracted': return app.contract_signed;
          case 'media_submitted': return app.status === 'media_submitted';
          case 'completed': return app.status === 'completed';
          default: return true;
        }
      });
    }

    // Global search
    if (filters.globalSearch) {
      const query = filters.globalSearch.toLowerCase();
      filtered = filtered.filter(app =>
      (app.influencer_name?.toLowerCase().includes(query) ||
        app.title?.toLowerCase().includes(query) ||
        app.influencer_email?.toLowerCase().includes(query) ||
        app.message?.toLowerCase().includes(query) ||
        app.category?.toLowerCase().includes(query) ||
        app.requirements?.toLowerCase().includes(query))
      );
    }

    // Individual filters
    if (filters.title) {
      filtered = filtered.filter(app =>
        app.title?.toLowerCase().includes(filters.title.toLowerCase())
      );
    }

    if (filters.influencerName) {
      filtered = filtered.filter(app =>
        app.influencer_name?.toLowerCase().includes(filters.influencerName.toLowerCase())
      );
    }

    if (filters.influencerEmail) {
      filtered = filtered.filter(app =>
        app.influencer_email?.toLowerCase().includes(filters.influencerEmail.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(app =>
        app.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.requirements) {
      filtered = filtered.filter(app =>
        app.requirements?.toLowerCase().includes(filters.requirements.toLowerCase())
      );
    }

    if (filters.message) {
      filtered = filtered.filter(app =>
        app.message?.toLowerCase().includes(filters.message.toLowerCase())
      );
    }

    if (filters.currency) {
      filtered = filtered.filter(app =>
        app.currency === filters.currency
      );
    }



    if (filters.status.length > 0) {
      filtered = filtered.filter(app => filters.status.includes(app.status));
    }



    if (filters.minBudget) {
      filtered = filtered.filter(app =>
        app.budget && app.budget >= parseInt(filters.minBudget)
      );
    }

    if (filters.maxBudget) {
      filtered = filtered.filter(app =>
        app.budget && app.budget <= parseInt(filters.maxBudget)
      );
    }

    // Date filtering
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(app => {
        const appDate = new Date(app.applied_at);
        switch (filters.dateRange) {
          case 'today':
            return appDate.toDateString() === now.toDateString();
          case 'week':
            return appDate > subDays(now, 7);
          case 'month':
            return appDate > subDays(now, 30);
          case 'custom':
            if (filters.startDate && filters.endDate) {
              const start = new Date(filters.startDate);
              const end = new Date(filters.endDate);
              end.setHours(23, 59, 59, 999);
              return appDate >= start && appDate <= end;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Performance Metrics Filtering
    if (filters.minFollowers > 0 || filters.maxFollowers < 1000000) {
      filtered = filtered.filter(app => {
        const followers = app.influencer_followers || 0;
        return followers >= filters.minFollowers && followers <= filters.maxFollowers;
      });
    }

    if (filters.minEngagement > 0) {
      filtered = filtered.filter(app => {
        const er = parseFloat(app.influencer_engagement_rate) || 0;
        return er >= filters.minEngagement;
      });
    }

    if (filters.minViews > 0) {
      filtered = filtered.filter(app => (app.influencer_avg_views || 0) >= filters.minViews);
    }

    setFilteredApplications(filtered);
  }, [applications, filters, activeTab]);

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getBrandApplications();

      const appsData = Array.isArray(response) ? response :
        response.data ? response.data :
          response.applications ? response.applications : [];

      setApplications(appsData);
    } catch (err) {
      setError('Failed to load applications. Please check your connection and try again.');
      console.error('Failed to fetch applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle application status change
  const handleStatusChange = async (campaignId, influencerId, newStatus) => {
    const key = `${campaignId}-${influencerId}`;
    setUpdatingStatus(prev => ({ ...prev, [key]: true }));

    try {
      await campaignAPI.updateApplicationStatus(campaignId, influencerId, { status: newStatus });

      if (newStatus === 'approved') {
        setSuccess(`Application approved! You can now send the contract agreement.`);
        const approvedApp = applications.find(app =>
          app.campaign_id === campaignId && app.influencer_id === influencerId
        );
        if (approvedApp) {
          setSelectedApplication(approvedApp);
          setSendContractDialogOpen(true);
        }
      } else {
        setSuccess(`Application ${newStatus} successfully!`);
      }

      await fetchApplications();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [key]: false }));
    }
  };

  // Handle sending contract
  const handleSendContract = async (application) => {
    try {
      if (!token) {
        setError("You must be logged in to send a contract.");
        return;
      }

      if (!application?.campaign_id || !application?.influencer_id) {
        setError("Invalid application data. Cannot send contract.");
        return;
      }

      await campaignAPI.sendContractAgreement(application.campaign_id, application.influencer_id, token);
      setSuccess('Contract agreement sent successfully!');

      await fetchApplications();
      navigate('/brand/agreements');
    } catch (err) {
      console.error('Contract sending error:', err);
      setError(err.response?.data?.message || 'Failed to send contract agreement');
    }
  };

  // Navigation and dialog handlers
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
    setDetailTab('overview');
  };

  const handleViewMediaFiles = (application) => {
    setSelectedApplication(application);
    setMediaFilesDialogOpen(true);
  };

  const handleDirectChat = (application) => {
    const params = new URLSearchParams({
      user: application.influencer_id,
      campaign: application.campaign_id,
      title: application.title,
      budget: application.budget || '',
      currency: application.currency || 'USD'
    });
    navigate(`/brand/collaborations?${params.toString()}`);
  };

  const handleProcessPayment = (application) => {
    if (!application?.campaign_id || !application?.influencer_id) {
      setError('Invalid application data for payment processing');
      return;
    }

    navigate(`/brand/payments?campaign=${application.campaign_id}&influencer=${application.influencer_id}`);
  };

  const handleViewAgreements = () => {
    navigate('/brand/agreements');
  };

  const handleViewProfile = (userId, userType = 'influencer') => {
    navigate(`/brand/profile/view/${userType}/${userId}`);
  };

  const handleCloseDialogs = () => {
    setDetailDialogOpen(false);
    setSendContractDialogOpen(false);
    setMediaFilesDialogOpen(false);
    setSelectedApplication(null);
  };

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      globalSearch: '',
      title: '',
      influencerName: '',
      influencerEmail: '',
      category: '',
      status: [],
      minBudget: '',
      maxBudget: '',
      currency: '',
      requirements: '',
      message: '',
      dateRange: '',
      startDate: '',
      endDate: '',
      minFollowers: 0,
      maxFollowers: 1000000,
      minEngagement: 0,
      maxEngagement: 100,
      minViews: 0,
      minLikes: 0
    });
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key];
      if (key === 'minFollowers' && value === 0) return false;
      if (key === 'maxFollowers' && value === 1000000) return false;
      if (key === 'minEngagement' && value === 0) return false;
      if (key === 'maxEngagement' && value === 100) return false;
      if (key === 'minViews' && value === 0) return false;
      if (key === 'minLikes' && value === 0) return false;
      return value !== '' && !(Array.isArray(value) && value.length === 0);
    }).length;
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusText = (app) => {
    const status = app?.status;
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved - Send Contract';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'contracted': return app?.contract_signed ? 'Contract Signed' : 'Contract Sent';
      case 'media_submitted': return 'Media Submitted';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };



  // Action buttons based on application status
  const getActionButtons = (app) => {
    switch (app.status) {
      case 'pending':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => handleStatusChange(app.campaign_id, app.influencer_id, 'approved')}
              disabled={updatingStatus[`${app.campaign_id}-${app.influencer_id}`]}
              sx={{ borderRadius: '8px', fontSize: '0.7rem', flex: 1 }}
            >
              {updatingStatus[`${app.campaign_id}-${app.influencer_id}`] ?
                <CircularProgress size={14} /> : 'Approve'}
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => handleStatusChange(app.campaign_id, app.influencer_id, 'rejected')}
              disabled={updatingStatus[`${app.campaign_id}-${app.influencer_id}`]}
              sx={{ borderRadius: '8px', fontSize: '0.7rem', flex: 1 }}
            >
              {updatingStatus[`${app.campaign_id}-${app.influencer_id}`] ?
                <CircularProgress size={14} /> : 'Reject'}
            </Button>
          </Box>
        );

      case 'approved':
        return (
          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<Description />}
            onClick={() => {
              setSelectedApplication(app);
              setSendContractDialogOpen(true);
            }}
            sx={{ borderRadius: '8px', fontSize: '0.7rem', width: '100%' }}
          >
            Send Contract
          </Button>
        );

      case 'contracted':
        if (!app.contract_signed) {
          return (
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Contract Sent - Waiting for Signature
            </Typography>
          );
        }
        return (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Waiting for media submission...
          </Typography>
        );

      case 'media_submitted':
        return (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
            <Button
              size="small"
              color="info"
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => handleViewMediaFiles(app)}
              sx={{ borderRadius: '8px', fontSize: '0.7rem', flex: 1 }}
            >
              View Media
            </Button>
            <Button
              size="small"
              color="success"
              variant="contained"
              startIcon={<Payment />}
              onClick={() => handleProcessPayment(app)}
              sx={{ borderRadius: '8px', fontSize: '0.7rem', flex: 1 }}
            >
              Pay Now
            </Button>
          </Box>
        );

      case 'completed':
        return (
          <Button
            size="small"
            color="info"
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => handleViewMediaFiles(app)}
            sx={{ borderRadius: '8px', fontSize: '0.7rem', width: '100%' }}
          >
            View Media
          </Button>
        );

      default:
        return null;
    }
  };

  // Application counts for tabs and metrics
  const applicationCounts = {
    total: applications.length,
    filtered: filteredApplications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved' && !app.contract_sent).length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    sent: applications.filter(app => app.contract_sent && !app.contract_signed).length,
    contracted: applications.filter(app => app.contract_signed).length,
    media_submitted: applications.filter(app => app.status === 'media_submitted').length,
    completed: applications.filter(app => app.status === 'completed').length
  };

  // Tab counts for display
  const tabCounts = {
    all: applicationCounts.total,
    pending: applicationCounts.pending,
    approved: applicationCounts.approved,
    rejected: applicationCounts.rejected,
    sent: applicationCounts.sent,
    contracted: applicationCounts.contracted,
    media_submitted: applicationCounts.media_submitted,
    completed: applicationCounts.completed
  };

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px" flexDirection="column">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading applications...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom color="primary">
              Influencer Applications
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
                Manage and review influencer applications for your campaigns.
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Description />}
              onClick={handleViewAgreements}
              sx={{ borderRadius: '25px', px: 3, fontWeight: 600 }}
            >
              View Agreements
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchApplications}
              disabled={loading}
              sx={{ borderRadius: '25px', px: 3, fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Static Sticky Header Container (Search + Tabs) */}
      <Box
        sx={{
          position: 'sticky',
          top: '0px',
          zIndex: 1100,
          transition: 'all 0.3s ease',
          mb: 3
        }}
      >
        {/* Global Search Bar */}
        <SearchBar sx={{ pr: '6px', mb: 2 }}>
          <Search sx={{ color: 'primary.main', mr: 1 }} />
          <InputBase
            fullWidth
            placeholder="Search applications by name, campaign, keywords..."
            value={filters.globalSearch}
            onChange={(e) => handleFilterChange('globalSearch', e.target.value)}
            sx={{ ml: 1, flex: 1, fontSize: '1rem' }}
          />
          {filters.globalSearch && (
            <IconButton size="small" onClick={() => handleFilterChange('globalSearch', '')} sx={{ mr: 1 }}>
              <Close />
            </IconButton>
          )}

          <Divider sx={{ height: 28, mx: 1 }} orientation="vertical" />

          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList />}
            onClick={() => isMobile ? setFilterDrawerOpen(true) : setShowFilters(!showFilters)}
            sx={{
              borderRadius: '25px',
              textTransform: 'none',
              px: { xs: 2, md: 3 },
              py: 0.8,
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }
            }}
          >
            <Box display={{ xs: 'none', sm: 'block' }}>Filters</Box>
            {getActiveFilterCount() > 0 && (
              <Badge
                badgeContent={getActiveFilterCount()}
                color="error"
                sx={{
                  ml: { xs: 0, sm: 1.5 },
                  '& .MuiBadge-badge': {
                    border: '2px solid white'
                  }
                }}
              />
            )}
          </Button>
        </SearchBar>

        {/* Status Tabs with Smart Sticky Behavior (LinkedIn Style) */}
        <Paper
          sx={{
            borderRadius: '20px',
            boxShadow: isTabSticky
              ? '0 12px 40px rgba(0, 0, 0, 0.15)'
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <Work sx={{ mr: 1, fontSize: 20 }} />
                  All Applications
                  <Chip label={tabCounts.all} size="small" sx={{ ml: 1 }} color="primary" />
                </Box>
              }
              value="all"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                  Under Review
                  <Chip label={tabCounts.pending} size="small" sx={{ ml: 1 }} color="warning" />
                </Box>
              }
              value="pending"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <Check sx={{ mr: 1, fontSize: 20 }} />
                  Approved
                  <Chip label={tabCounts.approved} size="small" sx={{ ml: 1 }} color="success" />
                </Box>
              }
              value="approved"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <Send sx={{ mr: 1, fontSize: 20 }} />
                  Contract Sent
                  <Chip label={tabCounts.sent} size="small" sx={{ ml: 1 }} color="info" />
                </Box>
              }
              value="sent"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <AssignmentTurnedIn sx={{ mr: 1, fontSize: 20 }} />
                  Contract Signed
                  <Chip label={tabCounts.contracted} size="small" sx={{ ml: 1 }} color="secondary" />
                </Box>
              }
              value="contracted"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <ImageIcon sx={{ mr: 1, fontSize: 20 }} />
                  Media Ready
                  <Chip label={tabCounts.media_submitted} size="small" sx={{ ml: 1 }} color="info" />
                </Box>
              }
              value="media_submitted"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <MonetizationOn sx={{ mr: 1, fontSize: 20 }} />
                  Completed
                  <Chip label={tabCounts.completed} size="small" sx={{ ml: 1 }} color="primary" />
                </Box>
              }
              value="completed"
            />
            <AnimatedTab
              label={
                <Box display="flex" alignItems="center">
                  <Clear sx={{ mr: 1, fontSize: 20 }} />
                  Rejected
                  <Chip label={tabCounts.rejected} size="small" sx={{ ml: 1 }} color="error" />
                </Box>
              }
              value="rejected"
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ width: '100%', position: 'relative' }}>
        {/* Advanced Filter Drawer (Right Side) */}
        {!isMobile && (
          <Drawer
            anchor="right"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '400px',
                p: 0,
                borderLeft: `1px solid ${theme.palette.divider}`,
                boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.08)',
                background: '#ffffff',
                height: '100%',
                overflow: 'hidden'
              }
            }}
          >
            <AppBar position="sticky" elevation={1} sx={{ background: 'white', color: 'text.primary' }}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setShowFilters(false)}
                  aria-label="close"
                >
                  <Close />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 2, flex: 1, fontWeight: 700 }}>
                  Filters
                </Typography>
                <Button color="primary" onClick={clearAllFilters} sx={{ fontWeight: 600 }}>
                  Clear All
                </Button>
              </Toolbar>
            </AppBar>
            <Box sx={{ height: 'calc(100% - 64px)', overflowY: 'auto' }}>
              <DetailedFilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearAllFilters}
                applicationCounts={applicationCounts}
              />
            </Box>
          </Drawer>
        )}

        {/* Applications Grid */}
        <Box
          sx={{
            flex: 1,
            transition: 'all 0.3s ease'
          }}
        >
          {/* Mobile Filter Button */}
          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Applications Grid */}
          {filteredApplications.length === 0 ? (
            <Paper sx={{ textAlign: 'center', py: 8, borderRadius: '20px', backgroundColor: '#ffffff' }}>
              <Box sx={{ color: 'text.secondary' }}>
                <TrendingUp sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" gutterBottom fontWeight="600">
                  {getActiveFilterCount() > 0 ? 'No matching applications found' : 'No applications received yet'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
                  {getActiveFilterCount() > 0
                    ? 'Try adjusting your filters or search criteria to see more results.'
                    : 'Applications from influencers will appear here once they apply to your campaigns. Create more campaigns to attract influencers!'
                  }
                </Typography>
                {getActiveFilterCount() > 0 && (
                  <Button variant="outlined" startIcon={<ClearAll />} onClick={clearAllFilters} sx={{ mt: 1, borderRadius: '12px' }}>
                    Clear All Filters
                  </Button>
                )}
              </Box>
            </Paper>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: 3,
                '& .MuiGrid-item': {
                  padding: 0,
                  width: '100%'
                }
              }}
            >
              {filteredApplications.map((app) => (
                <Grid
                  item
                  key={`${app.campaign_id}-${app.influencer_id}`}
                  sx={{ display: 'flex' }}
                >
                  <Zoom in={true} style={{ transitionDelay: '100ms' }}>
                    <ProfessionalCard>
                      {/* Campaign Image with Budget Overlay */}
                      <CampaignImage
                        fileId={app.campaign_image_id}
                        alt={app.title}
                        campaignData={app}
                      />

                      <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                        {/* Header with Influencer Info and Status */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <UserInfo
                              userId={app.influencer_id}
                              profileType="influencer"
                              showEmail={false}
                              showStats={true}
                              size={44}
                            />
                          </Box>
                          <StatusChip
                            label={getStatusText(app)}
                            status={app.status}
                            size="small"
                          />
                        </Box>

                        {/* Campaign Details */}
                        <Box mb={2}>
                          <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
                            {app.title || 'Unknown Campaign'}
                          </Typography>

                          <Grid container spacing={1} sx={{ mb: 1.5 }}>
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {app.category || 'General'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(app.applied_at)}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Budget */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                              <Typography variant="body2" fontWeight="600" color="success.main">
                                {app.currency || 'USD'} {app.budget?.toLocaleString()}
                              </Typography>
                            </Box>

                          </Box>

                          {/* Campaign Description Preview */}
                          {app.description && (
                            <Typography
                              variant="body2"
                              sx={{
                                p: 1.5,
                                background: '#f5f7ff',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                                maxHeight: '60px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {app.description}
                            </Typography>
                          )}
                        </Box>

                        {/* Influencer Message */}
                        {app.message && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                              MESSAGE:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                p: 1,
                                backgroundColor: `${theme.palette.primary.main}10`,
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                lineHeight: 1.4,
                                maxHeight: '40px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              "{app.message}"
                            </Typography>
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, width: '100%', flexDirection: 'column' }}>
                          {/* Primary Actions Row */}
                          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            {/* View Details Button */}
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(app)}
                              sx={{
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                flex: 2,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.dark'
                                }
                              }}
                            >
                              View Details
                            </Button>

                            {/* Chat Button */}
                            <Tooltip title="Open Chat">
                              <IconButton
                                size="small"
                                onClick={() => handleDirectChat(app)}
                                sx={{
                                  borderRadius: '8px',
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#388E3C'
                                  }
                                }}
                              >
                                <Chat fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {/* Media Button for relevant statuses
                            {(app.status === 'media_submitted' || app.status === 'completed') && (
                              <Tooltip title="View Media Files">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewMediaFiles(app)}
                                  sx={{ 
                                    borderRadius: '8px',
                                    backgroundColor: theme.palette.info.main,
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: theme.palette.info.dark
                                    }
                                  }}
                                >
                                  <ImageIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )} */}
                          </Box>

                          {/* Status-specific Actions */}
                          {getActionButtons(app)}
                        </Box>
                      </CardActions>
                    </ProfessionalCard>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 340,
            p: 2.5,
            backgroundColor: '#ffffff'
          }
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight="700">Advanced Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <DetailedFilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          applicationCounts={applicationCounts}
        />
      </Drawer>

      {/* Application Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            minHeight: '700px',
            background: '#ffffff'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 700,
          py: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Campaign sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5">Application Details</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedApplication?.title} - {selectedApplication?.influencer_name}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDialogs} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedApplication && (
            <TabContext value={detailTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs
                  value={detailTab}
                  onChange={(e, newValue) => setDetailTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }
                  }}
                >
                  <Tab
                    value="overview"
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <FontAwesomeIcon icon={faChartPie} />
                        Overview
                      </Box>
                    }
                  />

                  <Tab
                    value="workflow"
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <FontAwesomeIcon icon={faArrowsRotate} />
                        Workflow
                      </Box>
                    }
                  />

                  <Tab
                    value="profile"
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <FontAwesomeIcon icon={faUser} />
                        Profile
                      </Box>
                    }
                  />

                  <Tab
                    value="media"
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <FontAwesomeIcon icon={faFolderOpen} />
                        Media Files
                      </Box>
                    }
                  />
                </Tabs>

              </Box>

              <TabPanel value="overview" sx={{ p: 4 }}>
                {/* Campaign Details - FULL WIDTH */}
                <Grid item xs={12} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontAwesomeIcon icon={faBullseye} />
                    Campaign Details
                  </Typography>

                  <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    {/* Campaign Title */}
                    <Typography variant="h5" fontWeight="700" color="primary" gutterBottom>
                      {selectedApplication.title || 'Untitled Campaign'}
                    </Typography>

                    {/* Campaign Stats Grid */}
                    <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney color="success" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Budget
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {selectedApplication.currency || 'USD'} {selectedApplication.budget?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Category color="info" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {selectedApplication.category || 'General'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule color="warning" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Deadline
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {selectedApplication.deadline ? format(new Date(selectedApplication.deadline), 'MMM dd, yyyy') : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Flag color="secondary" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Status
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              <StatusChip
                                label={getStatusText(selectedApplication.status)}
                                status={selectedApplication.status}
                                size="small"
                              />
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Description - FULL WIDTH */}
                    {selectedApplication.description && (
                      <Box sx={{ mt: 3, mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          Description
                        </Typography>
                        <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: '8px', lineHeight: 1.6 }}>
                          <Typography variant="body2">
                            {selectedApplication.description}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {/* Requirements - FULL WIDTH */}
                    {selectedApplication.requirements && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          Requirements
                        </Typography>
                        <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: '8px', lineHeight: 1.6 }}>
                          <Typography variant="body2">
                            {selectedApplication.requirements}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Quick Actions - FULL WIDTH */}
                <Grid item xs={12} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaRocket />
                    Quick Actions
                  </Typography>

                  <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                      <Button
                        variant="outlined"
                        startIcon={<Person />}
                        onClick={() => handleViewProfile(selectedApplication.influencer_id, 'influencer')}
                        sx={{ borderRadius: '12px', px: 3, py: 1.5, minWidth: '180px' }}
                      >
                        View Influencer Profile
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Chat />}
                        onClick={() => {
                          setDetailDialogOpen(false);
                          handleDirectChat(selectedApplication);
                        }}
                        sx={{ borderRadius: '12px', px: 3, py: 1.5, minWidth: '180px' }}
                      >
                        Open Chat
                      </Button>
                      {selectedApplication.status === 'approved' && (
                        <Button
                          variant="contained"
                          startIcon={<Description />}
                          onClick={() => {
                            setDetailDialogOpen(false);
                            setSendContractDialogOpen(true);
                          }}
                          sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            minWidth: '180px',
                            backgroundColor: 'primary.main'
                          }}
                        >
                          Send Contract
                        </Button>
                      )}
                      {selectedApplication.status === 'media_submitted' && (
                        <Button
                          variant="contained"
                          startIcon={<Payment />}
                          onClick={() => handleProcessPayment(selectedApplication)}
                          sx={{
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            minWidth: '180px',
                            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                          }}
                        >
                          Process Payment
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Influencer Details - FULL WIDTH */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontAwesomeIcon icon={faUser} />
                    Influencer Details
                  </Typography>

                  <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                    {/* User Info Section */}
                    <Box sx={{ mb: 3 }}>
                      <UserInfo
                        userId={selectedApplication.influencer_id}
                        profileType="influencer"
                        showEmail={true}
                        showStats={true}
                        size={60}
                      />
                    </Box>

                    {/* Application Message - FULL WIDTH */}
                    {selectedApplication.message && (
                      <Box sx={{ mt: 3, mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                          APPLICATION MESSAGE
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={selectedApplication.message}
                          InputProps={{
                            readOnly: true,
                            sx: {
                              bgcolor: 'grey.50',
                              borderRadius: '12px',
                              fontSize: '0.9rem',
                              lineHeight: 1.6,
                              '& .MuiInputBase-input': {
                                padding: '12px',
                              }
                            }
                          }}
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {/* Application Timeline - FULL WIDTH */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="600">
                        APPLICATION TIMELINE
                      </Typography>
                      <Paper sx={{ p: 2.5, bgcolor: 'grey.50', borderRadius: '8px' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">
                                Applied on
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {formatDate(selectedApplication.applied_at)}
                              </Typography>
                            </Box>
                          </Grid>
                          {selectedApplication.media_submitted_at && (
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">
                                  Media submitted on
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {formatDate(selectedApplication.media_submitted_at)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {selectedApplication.contract_signed_at && (
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">
                                  Contract signed on
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {formatDate(selectedApplication.contract_signed_at)}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    </Box>
                  </Paper>
                </Grid>
              </TabPanel>

              <TabPanel value="workflow" sx={{ p: 4 }}>
                <ApplicationWorkflow application={selectedApplication} />
              </TabPanel>

              <TabPanel value="profile" sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3 }}>
                  <FontAwesomeIcon icon={faUser} /> Influencer Profile
                </Typography>
                <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                  <UserInfo
                    userId={selectedApplication.influencer_id}
                    profileType="influencer"
                    showEmail={true}
                    showStats={true}
                    size={80}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Person />}
                    onClick={() => handleViewProfile(selectedApplication.influencer_id, 'influencer')}
                    sx={{ mt: 3, borderRadius: '12px', px: 4 }}
                  >
                    View Full Profile Page
                  </Button>
                </Box>
              </TabPanel>

              <TabPanel value="media" sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" color="primary" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FontAwesomeIcon icon={faFileContract} /> Submitted Media Assets
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review the content submitted by the influencer for your campaign.
                  </Typography>
                </Box>

                <ApplicationMediaGallery application={selectedApplication} />
              </TabPanel>
            </TabContext>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialogs} startIcon={<ArrowBack />} sx={{ borderRadius: '12px', px: 4 }}>
            Back to List
          </Button>
          {selectedApplication?.status === 'pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="success"
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleStatusChange(selectedApplication.campaign_id, selectedApplication.influencer_id, 'approved')}
                sx={{ borderRadius: '12px', px: 4 }}
              >
                Approve
              </Button>
              <Button
                color="error"
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleStatusChange(selectedApplication.campaign_id, selectedApplication.influencer_id, 'rejected')}
                sx={{ borderRadius: '12px', px: 4 }}
              >
                Reject
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Send Contract Dialog */}
      <SendContractDialog
        open={sendContractDialogOpen}
        onClose={handleCloseDialogs}
        application={selectedApplication}
        onSendContract={handleSendContract}
      />


      {/* Media Files Dialog */}
      <MediaFilesDialog
        open={mediaFilesDialogOpen}
        onClose={handleCloseDialogs}
        application={selectedApplication}
      />
    </Container>
  );
};

export default BrandApplications;