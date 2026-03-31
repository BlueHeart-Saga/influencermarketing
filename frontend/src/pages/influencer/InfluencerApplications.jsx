import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions,
  Chip, Button, Grid, Avatar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, useTheme, useMediaQuery, Snackbar,
  CircularProgress, TextField, Badge, Paper, Modal, FormControl, Select, MenuItem,
  Checkbox, FormControlLabel, FormGroup,
  InputAdornment, Collapse, Radio, RadioGroup, List, ListItem, ListItemText,
  Divider, Tabs, Tab, ListItemIcon, Stepper, Step, StepLabel, StepContent, Drawer,
  Container, CardMedia, CardActionArea, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Email, CalendarToday, Business, Message,
  Visibility, Refresh, AttachMoney,
  Campaign, CheckCircle, Pending, Cancel,
  TrendingUp, Launch, Image as ImageIcon, Clear, Search, 
  ExpandLess, ExpandMore, Sort, Tune, Person, Chat, Send,
  AttachFile, Delete, AccountCircle, Work, Star,
  Description, Payment, DoneAll, PendingActions,
  VideoLibrary, Article, Audiotrack, InsertDriveFile,
  PlayArrow, Download, PictureAsPdf, WorkOutline,
  Assignment, AssignmentTurnedIn, MonetizationOn,
  ThumbUp, ThumbDown, FilterList, Close,
  ExpandMore as ExpandMoreIcon, Category, MonetizationOn as MonetizationOnIcon,
  Schedule, Flag, Language, Public, Group, TrendingFlat
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";
import { styled } from '@mui/material/styles';
import { format, parseISO, isAfter, subDays, differenceInDays } from 'date-fns';
import { TabContext, TabPanel, TabList } from "@mui/lab";

// Add this with your other keyframes/styled components
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// =============================================
// STYLED COMPONENTS
// =============================================

const PremiumCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '360px',
  minWidth: '320px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '20px',
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colorMap = {
    pending: theme.palette.warning.main,
    approved: theme.palette.success.main,
    contracted: theme.palette.secondary.main,
    media_submitted: theme.palette.info.main,
    completed: theme.palette.primary.main,
    rejected: theme.palette.error.main,
    default: theme.palette.grey[500]
  };
  
  return {
    backgroundColor: colorMap[status] || colorMap.default,
    color: 'white',
    fontWeight: 700,
    fontSize: '0.75rem',
    height: '28px',
    borderRadius: '8px',
    '& .MuiChip-icon': {
      color: 'white',
      fontSize: '18px'
    }
  };
});

const WorkflowStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    padding: theme.spacing(1),
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  '& .MuiStepIcon-root.Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepIcon-root.Mui-active': {
    color: theme.palette.primary.main,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 700,
  borderRadius: '12px',
  padding: '12px 24px',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 25px rgba(102, 126, 234, 0.4)',
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  },
  '&.Mui-disabled': {
    background: theme.palette.grey[300],
    transform: 'none',
    boxShadow: 'none',
  }
}));

const ContractButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #9C27B0 0%, #7B1FA2 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '0.875rem',
  boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #7B1FA2 0%, #6A1B9A 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(156, 39, 176, 0.4)',
  },
}));

const MediaButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '0.875rem',
  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #F57C00 0%, #EF6C00 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4CAF50 0%, #2E7D32 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '10px',
  padding: '10px 20px',
  fontSize: '0.875rem',
  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #388E3C 0%, #1B5E20 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
  },
}));

const StatRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  backgroundColor: 'rgba(245, 247, 250, 0.8)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
    fontSize: '22px',
  },
}));

const CampaignDetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  marginBottom: theme.spacing(3),
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 24px',
  borderRadius: '15px',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
    borderColor: theme.palette.primary.light,
  }
}));

const CampaignMediaSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.main,
    borderRadius: 4,
  }
}));

// =============================================
// REUSABLE COMPONENTS
// =============================================

// Profile Image Component
const ProfileImage = ({ userId, profileType, alt, onClick, size = 40 }) => {
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
            setImageUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/profiles/image/${imageId}`);
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
          fontWeight: 700,
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
            zIndex: 10,
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
const UserInfo = ({ userId, profileType, showEmail = true, size = 40, showRating = false }) => {
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
    navigate(`/influencer/profile/view/${profileType}/${userId}`);
  };

  const getDisplayName = () => {
    if (!userData) return 'Loading...';
    
    if (profileType === 'influencer') {
      return userData.nickname || userData.full_name || 'Unknown Influencer';
    } else {
      return userData.company_name || userData.contact_person_name || 'Unknown Brand';
    }
  };

  const getUsername = () => {
    if (!userData) return null;
    
    if (profileType === 'influencer') {
      if (userData.nickname && userData.full_name && userData.nickname !== userData.full_name) {
        return userData.full_name;
      }
    }
    return null;
  };

  const getRating = () => {
    if (!userData) return null;
    return userData.rating || userData.average_rating || null;
  };

  const getPlatformInfo = () => {
    if (!userData || profileType !== 'influencer') return null;
    return {
      platform: userData.primary_platform,
      followers: userData.followers,
      engagement: userData.engagement_rate
    };
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  const platformInfo = getPlatformInfo();

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <ProfileImage
        userId={userId}
        profileType={profileType}
        alt={getDisplayName()}
        onClick={handleViewProfile}
        size={size}
      />
      <Box flex={1}>
        <Typography 
          variant="subtitle1" 
          fontWeight="700"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
          }}
          onClick={handleViewProfile}
        >
          {getDisplayName()}
        </Typography>
        {getUsername() && (
          <Typography variant="body2" color="text.secondary" display="block">
            {getUsername()}
          </Typography>
        )}
        {showEmail && userData?.email && (
          <Typography variant="body2" color="text.secondary" display="block">
            {userData.email}
          </Typography>
        )}
        {showRating && getRating() && (
          <Box display="flex" alignItems="center" gap={1}>
            <Star sx={{ fontSize: 16, color: 'gold' }} />
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              {getRating().toFixed(1)}
            </Typography>
          </Box>
        )}
        {platformInfo && platformInfo.followers && (
          <Typography variant="caption" color="text.secondary" display="block">
            {platformInfo.followers.toLocaleString()} followers
            {platformInfo.engagement && ` • ${platformInfo.engagement}% engagement`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Campaign Image Component
const CampaignImage = ({ fileId, alt, onClick, height = 240, width = '100%' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getImageUrl = () => {
    if (!fileId) return null;
    
    if (fileId.startsWith('http') || fileId.startsWith('data:') || fileId.startsWith('blob:')) {
      return fileId;
    }
    
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl || error) {
    return (
      <CardActionArea onClick={onClick}>
        <Box 
          sx={{ 
            width: width,
            height: height,
            background: 'linear-gradient(135deg, #667eea 0%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: '16px',
            mb: 2
          }}
        >
          <Campaign sx={{ fontSize: 64, color: 'white', opacity: 0.7 }} />
        </Box>
      </CardActionArea>
    );
  }

  return (
    <CardActionArea onClick={onClick}>
      <Box sx={{ position: 'relative', width: width, height: height, mb: 2 }}>
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        <CardMedia
          component="img"
          image={imageUrl}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: loading ? 'none' : 'block',
            borderRadius: '16px'
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </Box>
    </CardActionArea>
  );
};

// Campaign Video Component
const CampaignVideo = ({ fileId, alt, onClick, height = 240, width = '100%' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getVideoUrl = () => {
    if (!fileId) return null;
    
    if (fileId.startsWith('http') || fileId.startsWith('data:') || fileId.startsWith('blob:')) {
      return fileId;
    }
    
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/video/${fileId}`;
  };

  const videoUrl = getVideoUrl();

  if (!videoUrl || error) {
    return (
      <CardActionArea onClick={onClick}>
        <Box 
          sx={{ 
            width: width,
            height: height,
            background: 'linear-gradient(135deg, #667eea 0%, #1565c0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onClick ? 'pointer' : 'default',
            borderRadius: '16px',
            mb: 2
          }}
        >
          <VideoLibrary sx={{ fontSize: 64, color: 'white', opacity: 0.7 }} />
        </Box>
      </CardActionArea>
    );
  }

  return (
    <CardActionArea onClick={onClick}>
      <Box sx={{ position: 'relative', width: width, height: height, mb: 2 }}>
        {loading && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              zIndex: 2
            }}
          >
            <CircularProgress size={40} />
          </Box>
        )}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: loading ? 'none' : 'block',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <video
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '16px'
            }}
            onLoadStart={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
              background: 'rgba(0, 0, 0, 0.3)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 1
              }
            }}
          >
            <PlayArrow sx={{ fontSize: 48, color: 'white' }} />
          </Box>
        </Box>
      </Box>
    </CardActionArea>
  );
};

// Campaign Detail Section Component
// Campaign Detail Section Component
const CampaignDetailSection = ({ application }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Add comprehensive null checking
  if (!application) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <Typography variant="h6" color="text.secondary">
          No application data available
        </Typography>
      </Box>
    );
  }

  // Use application data directly since all campaign info is included
  const campaignData = application;

  const getCurrencySymbol = (currency = 'USD') => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥'
    };
    return symbols[currency] || '$';
  };

  const formatCurrency = (amount, currency = 'USD') => {
    const symbol = getCurrencySymbol(currency);
    const amountNumber = typeof amount === 'number' ? amount : parseFloat(amount || 0);
    return `${symbol}${amountNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    try {
      const today = new Date();
      const deadlineDate = new Date(deadline);
      const days = differenceInDays(deadlineDate, today);
      return days > 0 ? days : 0;
    } catch (error) {
      console.error('Error calculating days remaining:', error);
      return null;
    }
  };

  const daysRemaining = getDaysRemaining(campaignData.campaign_deadline);

  // Safe data access with fallbacks
  const campaignTitle = campaignData.campaign_title || 'Untitled Campaign';
  const campaignStatus = campaignData.campaign_status || 'active';
  const campaignCategory = campaignData.campaign_category || 'Uncategorized';
  const campaignDescription = campaignData.campaign_description || 'No description provided.';
  const campaignRequirements = campaignData.campaign_requirements || 'No specific requirements provided.';
  const campaignBudget = campaignData.campaign_budget || 0;
  const campaignCurrency = campaignData.campaign_currency || 'USD';
  const campaignDeadline = campaignData.campaign_deadline;
  const campaignCreatedAt = campaignData.campaign_created_at;
  const campaignImageId = campaignData.campaign_image_id;
  const campaignVideoId = campaignData.campaign_video_id;
  const brandId = campaignData.brand_id;
  const brandEmail = campaignData.brand_email;

  return (
    <Box>
      {/* Campaign Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="800" color="primary">
          {campaignTitle}
        </Typography>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip 
            label={campaignStatus.toUpperCase()} 
            color={
              campaignStatus === 'active' ? 'success' :
              campaignStatus === 'paused' ? 'warning' :
              campaignStatus === 'completed' ? 'primary' : 'default'
            }
            size="small"
          />
          <Typography variant="body1" color="text.secondary">
            Category: {campaignCategory}
          </Typography>
          {daysRemaining !== null && (
            <Chip 
              icon={<Schedule />}
              label={`${daysRemaining} days remaining`}
              color={daysRemaining < 7 ? 'error' : daysRemaining < 30 ? 'warning' : 'success'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Campaign Media */}
        {(campaignImageId || campaignVideoId) && (
          <Grid item xs={12}>
            <CampaignDetailCard>
              <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
                Campaign Media
              </Typography>
              <CampaignMediaSection>
                {campaignImageId && (
                  <Box sx={{ minWidth: 300, flex: 1 }}>
                    <CampaignImage
                      fileId={campaignImageId}
                      alt={campaignTitle}
                      height={200}
                    />
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      Campaign Image
                    </Typography>
                  </Box>
                )}
                {campaignVideoId && (
                  <Box sx={{ minWidth: 300, flex: 1 }}>
                    <CampaignVideo
                      fileId={campaignVideoId}
                      alt={campaignTitle}
                      height={200}
                    />
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      Campaign Video
                    </Typography>
                  </Box>
                )}
              </CampaignMediaSection>
            </CampaignDetailCard>
          </Grid>
        )}

        {/* Campaign Description */}
        <Grid item xs={12} md={6}>
          <CampaignDetailCard>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              Campaign Description
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {campaignDescription}
            </Typography>
          </CampaignDetailCard>
        </Grid>

        {/* Campaign Requirements */}
        <Grid item xs={12} md={6}>
          <CampaignDetailCard>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              Requirements
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {campaignRequirements}
            </Typography>
          </CampaignDetailCard>
        </Grid>

        {/* Campaign Details */}
        <Grid item xs={12}>
          <CampaignDetailCard>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              Campaign Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatRow>
                  <MonetizationOnIcon />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="h6" fontWeight="800" color="primary">
                      {formatCurrency(campaignBudget, campaignCurrency)}
                    </Typography>
                  </Box>
                </StatRow>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatRow>
                  <Category />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      {campaignCategory}
                    </Typography>
                  </Box>
                </StatRow>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatRow>
                  <Schedule />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      {campaignDeadline ? 
                        new Date(campaignDeadline).toLocaleDateString() : 'N/A'
                      }
                    </Typography>
                  </Box>
                </StatRow>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatRow>
                  <Flag />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
                    </Typography>
                  </Box>
                </StatRow>
              </Grid>
            </Grid>
          </CampaignDetailCard>
        </Grid>

        {/* Timeline Information */}
        <Grid item xs={12} md={6}>
          <CampaignDetailCard>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              Timeline
            </Typography>
            <Box sx={{ '& > *': { mb: 2 } }}>
              <StatRow>
                <CalendarToday />
                <Box>
                  <Typography variant="body2" fontWeight="600" color="text.secondary">
                    Campaign Created
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {campaignCreatedAt ? 
                      new Date(campaignCreatedAt).toLocaleDateString() : 'N/A'
                    }
                  </Typography>
                </Box>
              </StatRow>
              <StatRow>
                <Assignment />
                <Box>
                  <Typography variant="body2" fontWeight="600" color="text.secondary">
                    You Applied
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {campaignData.applied_at ? 
                      new Date(campaignData.applied_at).toLocaleDateString() : 'N/A'
                    }
                  </Typography>
                </Box>
              </StatRow>
              {campaignData.contract_signed_at && (
                <StatRow>
                  <Description />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Contract Signed
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {new Date(campaignData.contract_signed_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </StatRow>
              )}
              {campaignData.media_submitted_at && (
                <StatRow>
                  <ImageIcon />
                  <Box>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Media Submitted
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {new Date(campaignData.media_submitted_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </StatRow>
              )}
            </Box>
          </CampaignDetailCard>
        </Grid>

        {/* Brand Information */}
        <Grid item xs={12} md={6}>
          <CampaignDetailCard>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              Brand Information
            </Typography>
            {brandId ? (
              <Box 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'rgba(102, 126, 234, 0.08)', 
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.12)',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <UserInfo
                  userId={brandId}
                  profileType="brand"
                  showEmail={true}
                  showRating={true}
                  size={60}
                />
              </Box>
            ) : (
              <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: '16px' }}>
                <Typography variant="body2" color="text.secondary">
                  Brand information not available
                </Typography>
              </Box>
            )}
            {brandEmail && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: '12px' }}>
                <Typography variant="body2" fontWeight="600" color="text.secondary">
                  Contact Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {brandEmail}
                </Typography>
              </Box>
            )}
          </CampaignDetailCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Contract Acceptance Dialog Component
// Contract Acceptance Dialog Component
const ContractAcceptanceDialog = ({ open, onClose, application, onAcceptContract }) => {
  const [accepting, setAccepting] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (application?.campaign_id) {
        try {
          const response = await campaignAPI.getCampaignById(application.campaign_id);
          setCampaignDetails(response);
        } catch (error) {
          console.error('Error fetching campaign details:', error);
        }
      }
    };

    if (open && application) {
      fetchCampaignDetails();
    }
  }, [open, application]);

  const handleAcceptContract = async () => {
    setAccepting(true);
    setLocalError('');
    
    try {
      // Get current user ID
      let currentUserId = user?._id || user?.id;
      if (!currentUserId) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        currentUserId = storedUser?._id || storedUser?.id;
      }

      if (!currentUserId) {
        setLocalError('User not authenticated');
        setAccepting(false);
        return;
      }

      const contractData = {
        campaign_id: application.campaign_id,
        influencer_id: currentUserId,
        terms_accepted: true,
        signed_at: new Date().toISOString()
      };

      console.log('Sending contract acceptance:', contractData);
      
      // Call the parent's onAcceptContract function
      await onAcceptContract(application);
      
      setLocalSuccess('Contract accepted successfully!');
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Contract acceptance failed:', err);
      const errorDetail = err.response?.data?.detail || err.message;
      setLocalError(`Contract acceptance failed: ${errorDetail}`);
    } finally {
      setAccepting(false);
    }
  };

  // Add null check for application
  if (!application) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', 
          color: 'white',
          fontWeight: 700,
          py: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Description sx={{ fontSize: 28 }} />
              <Typography variant="h5">Contract Agreement</Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No application data available
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: '12px', 
              px: 4,
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Use application data directly
  const campaignData = application;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #2563eb 100%)', 
        color: 'white',
        fontWeight: 700,
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Description sx={{ fontSize: 28 }} />
            <Typography variant="h5">Contract Agreement</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4 }}>
        {/* Error/Success messages */}
        {localError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {localError}
          </Alert>
        )}
        
        {localSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
            {localSuccess}
          </Alert>
        )}
        
        <Box mb={4}>
          <Typography variant="h4" gutterBottom color="primary" fontWeight="700">
            Congratulations! 🎉
          </Typography>
          <Typography variant="h6" gutterBottom>
            Your application for <strong style={{ color: '#9C27B0' }}>{campaignData?.campaign_title}</strong> has been approved!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please review and accept the contract agreement to proceed with the campaign.
          </Typography>
        </Box>

        <Box sx={{ p: 3, bgcolor: 'success.light', borderRadius: '16px', mb: 3 }}>
          <Typography variant="h6" gutterBottom color="success.dark" fontWeight="600">
            Campaign Details:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" fontWeight="600">Budget:</Typography>
              <Typography variant="body2">
                {campaignData?.campaign_currency || 'USD'} {campaignData?.campaign_budget}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" fontWeight="600">Deadline:</Typography>
              <Typography variant="body2">
                {campaignData?.campaign_deadline ? new Date(campaignData.campaign_deadline).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="600">Requirements:</Typography>
              <Typography variant="body2">
                {campaignData?.campaign_requirements || 'No specific requirements provided.'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 3, borderRadius: '16px' }}>
          <Typography variant="body1" color="info.dark" fontWeight="600">
            Contract Terms & Conditions:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Content Delivery" 
                secondary="Deliver high-quality media content as per campaign requirements"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Timeline Compliance" 
                secondary="Submit all deliverables before the campaign deadline"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Payment Terms" 
                secondary={`Payment of ${campaignData?.campaign_currency || 'USD'} ${campaignData?.campaign_budget} upon successful completion`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Content Usage" 
                secondary="Brand receives rights to use submitted content for marketing purposes"
              />
            </ListItem>
          </List>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: 'italic' }}>
          By accepting this contract, you agree to deliver the required media content according to the campaign specifications and timeline.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '12px', 
            px: 4,
            fontWeight: 600
          }}
          disabled={accepting}
        >
          Review Later
        </Button>
        <Button
          variant="contained"
          onClick={handleAcceptContract}
          disabled={accepting || !!localSuccess}
          startIcon={accepting ? <CircularProgress size={20} /> : <CheckCircle />}
          sx={{ 
            borderRadius: '12px', 
            px: 4,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #2563eb 0%, #2563eb 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            }
          }}
        >
          {accepting ? 'Accepting...' : localSuccess ? 'Accepted ✓' : 'Accept Contract'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Media Submission Dialog Component
const MediaSubmissionDialog = ({ open, onClose, application, onSubmitMedia }) => {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                          'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm',
                          'audio/mpeg', 'audio/wav', 'audio/ogg',
                          'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (!validTypes.includes(file.type)) {
        alert(`File type not supported: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File too large (max 100MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
    
    // Create previews for images
    const newPreviews = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 'document'
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke object URL if it exists
    if (newPreviews[index]?.preview) {
      URL.revokeObjectURL(newPreviews[index].preview);
    }
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    try {
      await onSubmitMedia(application, files, description);
      setFiles([]);
      setPreviews([]);
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error submitting media:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up object URLs
    previews.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview);
      }
    });
    setFiles([]);
    setPreviews([]);
    setDescription('');
    onClose();
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return <ImageIcon color="primary" />;
      case 'video': return <VideoLibrary color="secondary" />;
      case 'audio': return <Audiotrack color="info" />;
      case 'document': return <PictureAsPdf color="error" />;
      default: return <InsertDriveFile color="action" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', 
        color: 'white',
        fontWeight: 700,
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <ImageIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5">Submit Media Files</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4 }}>
        <Box mb={4}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Submit your completed media files for <strong style={{ color: '#FF9800' }}>{application?.campaign_title}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload images, videos, audio files, or documents as required by the campaign.
          </Typography>
        </Box>

        {/* File Upload */}
        <Box sx={{ mb: 4 }}>
          <input
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="media-upload"
            multiple
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="media-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<AttachFile />}
              fullWidth
              sx={{ 
                py: 3, 
                mb: 3,
                borderRadius: '12px',
                border: '2px dashed',
                borderColor: 'primary.main',
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Click to Select Files
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported: Images, Videos, Audio, PDF, Documents (Max 100MB per file)
                </Typography>
              </Box>
            </Button>
          </label>
          
          {files.length > 0 && (
            <Typography variant="body1" color="primary" sx={{ mb: 3, fontWeight: 600 }}>
              {files.length} file(s) selected • Total: {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}

          {/* File Previews */}
          {previews.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Selected Files:
              </Typography>
              <Grid container spacing={2}>
                {previews.map((preview, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2, position: 'relative', borderRadius: '12px' }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        {getFileIcon(preview.type)}
                        <Typography variant="body2" fontWeight="600" noWrap flex={1}>
                          {preview.file.name}
                        </Typography>
                      </Box>
                      
                      {preview.preview && (
                        <img
                          src={preview.preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      )}
                      
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Size: {(preview.file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,1)',
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Media Description (Optional)"
          placeholder="Describe your media files, provide context, or include any special instructions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            borderRadius: '12px', 
            px: 4,
            fontWeight: 600
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          startIcon={uploading ? <CircularProgress size={20} /> : <Send />}
          sx={{ 
            borderRadius: '12px', 
            px: 4,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #F57C00 0%, #EF6C00 100%)',
            }
          }}
        >
          {uploading ? 'Uploading...' : `Submit ${files.length} File(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Media Files Viewer Component
const MediaFilesViewer = ({ open, onClose, application }) => {
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
          console.log('Fetching media files for application:', application);
          
          // Try multiple API endpoints
          let mediaData = [];
          
          try {
            // First try: Get campaign media files
            const response = await campaignAPI.getCampaignMediaFiles(application.campaign_id);
            console.log('Campaign media API response:', response);
            
            if (response && Array.isArray(response)) {
              // Filter media files for this specific influencer
              mediaData = response.filter(media => 
                media.influencer_id === application.influencer_id
              );
            }
          } catch (campaignError) {
            console.warn('Campaign media API failed:', campaignError);
          }

          // If no media from campaign API, try influencer media API
          if (mediaData.length === 0) {
            try {
              const influencerResponse = await campaignAPI.getInfluencerMediaFiles();
              console.log('Influencer media API response:', influencerResponse);
              
              if (influencerResponse && Array.isArray(influencerResponse)) {
                // Filter for this specific campaign
                mediaData = influencerResponse.filter(media => 
                  media.campaign_id === application.campaign_id
                );
              }
            } catch (influencerError) {
              console.warn('Influencer media API failed:', influencerError);
            }
          }

          // If still no media, check application data directly
          if (mediaData.length === 0 && application.submitted_media) {
            console.log('Using submitted_media from application:', application.submitted_media);
            mediaData = application.submitted_media.map(media => ({
              ...media,
              campaign_id: application.campaign_id,
              influencer_id: application.influencer_id
            }));
          }

          console.log('Final media data:', mediaData);
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

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'image': return <ImageIcon color="primary" />;
      case 'video': return <VideoLibrary color="secondary" />;
      case 'audio': return <Audiotrack color="info" />;
      case 'document': return <PictureAsPdf color="error" />;
      default: return <InsertDriveFile color="action" />;
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      console.log('Downloading file:', fileId, filename);
      const response = await campaignAPI.downloadMediaFile(fileId);
      
      // Create download link
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
      
      // Fallback: Try direct download URL
      const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/media/${fileId}/download`;
      window.open(downloadUrl, '_blank');
    }
  };

  const handleViewMedia = (media) => {
    console.log('Viewing media:', media);
    setSelectedMedia(media);
  };

  const getMediaViewUrl = (media) => {
    if (!media.file_id) return null;
    
    // Use the view endpoint for browser-compatible files
    if (media.media_type === 'image' || media.media_type === 'video' || media.media_type === 'audio') {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/media/${media.file_id}/view`;
    }
    
    // For documents, use download endpoint
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/media/${media.file_id}/download`;
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
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            minHeight: '600px'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', 
          color: 'white',
          fontWeight: 700,
          py: 3
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <VideoLibrary sx={{ fontSize: 28 }} />
              <Typography variant="h5">
                Submitted Media Files
                {mediaFiles.length > 0 && ` (${mediaFiles.length})`}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4 }}>
          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Media files for <strong style={{ color: '#2196F3' }}>{application.campaign_title}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submitted on: {application.media_submitted_at ? new Date(application.media_submitted_at).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading media files...
              </Typography>
            </Box>
          ) : mediaFiles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <ImageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                No Media Files Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
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
                  <Card sx={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {getMediaIcon(media.media_type)}
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="600" noWrap>
                            {media.filename || `File ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {media.media_type} • {media.size ? `${(media.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {media.description && (
                        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                          "{media.description}"
                        </Typography>
                      )}

                      {media.submitted_at && (
                        <Typography variant="caption" color="text.secondary">
                          Submitted: {new Date(media.submitted_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewMedia(media)}
                        sx={{ borderRadius: '8px' }}
                        disabled={!media.file_id}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(media.file_id, media.filename)}
                        sx={{ borderRadius: '8px' }}
                        disabled={!media.file_id}
                      >
                        Download
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: '12px', 
              px: 4,
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Viewer Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        {selectedMedia && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="600">
                  {selectedMedia.filename || 'Media File'}
                </Typography>
                <IconButton onClick={() => setSelectedMedia(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, textAlign: 'center', minHeight: '400px' }}>
              {selectedMedia.media_type === 'image' ? (
                <img
                  src={getMediaViewUrl(selectedMedia)}
                  alt={selectedMedia.filename}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh', 
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', selectedMedia);
                    e.target.style.display = 'none';
                  }}
                />
              ) : selectedMedia.media_type === 'video' ? (
                <video
                  controls
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh',
                    borderRadius: '8px'
                  }}
                >
                  <source src={getMediaViewUrl(selectedMedia)} type={selectedMedia.content_type} />
                  Your browser does not support the video tag.
                </video>
              ) : selectedMedia.media_type === 'audio' ? (
                <Box py={6}>
                  <Audiotrack sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
                  <audio
                    controls
                    style={{ width: '100%', maxWidth: '400px' }}
                  >
                    <source src={getMediaViewUrl(selectedMedia)} type={selectedMedia.content_type} />
                    Your browser does not support the audio tag.
                  </audio>
                </Box>
              ) : (
                <Box py={6}>
                  {getMediaIcon(selectedMedia.media_type)}
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Preview not available
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please download the file to view its contents
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload(selectedMedia.file_id, selectedMedia.filename)}
                    sx={{ borderRadius: '12px' }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
              
              {selectedMedia.description && (
                <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Description:</strong> {selectedMedia.description}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================

const InfluencerApplications = ({ applications: propApplications, onUpdate, loading: propLoading }) => {
  const [internalApplications, setInternalApplications] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [contractAcceptanceDialogOpen, setContractAcceptanceDialogOpen] = useState(false);
  const [mediaSubmissionDialogOpen, setMediaSubmissionDialogOpen] = useState(false);
  const [mediaFilesDialogOpen, setMediaFilesDialogOpen] = useState(false);
  const [selectedApplicationForContract, setSelectedApplicationForContract] = useState(null);
  const [selectedApplicationForMedia, setSelectedApplicationForMedia] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [detailTab, setDetailTab] = useState('overview');
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    brandName: '',
    campaignTitle: '',
    dateRange: {
      start: null,
      end: null
    },
    hasMessage: 'all',
    sortBy: 'newest'
  });
  
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Determine if we're using internal state or props
  const applications = propApplications !== undefined ? propApplications : internalApplications;
  const loading = propLoading !== undefined ? propLoading : internalLoading;

  // Memoize the fetch function
  const fetchApplications = useCallback(async () => {
    try {
      setInternalLoading(true);
      setError('');
      const response = await campaignAPI.getInfluencerApplications();
      const appsData = Array.isArray(response) ? response : 
                      response?.data ? response.data : 
                      response?.applications ? response.applications : [];
      setInternalApplications(appsData);
    } catch (err) {
      setError('Failed to fetch applications. Please check your connection.');
      console.error('Fetch applications error:', err);
    } finally {
      setInternalLoading(false);
    }
  }, []);

  // API Calls
  useEffect(() => {
    if (propApplications === undefined) {
      fetchApplications();
    }
  }, [propApplications, fetchApplications]);

  const handleApplicationUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate();
    } else {
      fetchApplications();
    }
  }, [onUpdate, fetchApplications]);

  // Filter Functions
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      brandName: '',
      campaignTitle: '',
      dateRange: {
        start: null,
        end: null
      },
      hasMessage: 'all',
      sortBy: 'newest'
    });
  }, []);

  // Application Actions
  const handleAcceptContract = async (application) => {
    try {
      // Get current user ID
      let currentUserId = user?._id || user?.id;
      if (!currentUserId) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        currentUserId = storedUser?._id || storedUser?.id;
      }

      if (!currentUserId) {
        setError('User not authenticated');
        return;
      }

      const contractData = {
        campaign_id: application.campaign_id,
        influencer_id: currentUserId,
        terms_accepted: true,
        signed_at: new Date().toISOString()
      };

      console.log('Sending contract acceptance:', contractData);
      
      const response = await campaignAPI.acceptContract(contractData);
      console.log('Contract acceptance response:', response);
      
      setSuccess('Contract accepted successfully! You can now submit media files.');
      handleApplicationUpdate();
    } catch (err) {
      console.error('Contract acceptance failed:', err);
      const errorDetail = err.response?.data?.detail || err.message;
      setError(`Contract acceptance failed: ${errorDetail}`);
    }
  };

  const handleSubmitMedia = async (application, files, description) => {
    try {
      const formData = new FormData();
      formData.append('campaign_id', application.campaign_id);
      if (description) {
        formData.append('description', description);
      }
      
      // Append all files
      files.forEach(file => {
        formData.append('media_files', file);
      });

      await campaignAPI.submitMediaFiles(formData);
      setSuccess('Media files submitted successfully! Waiting for brand approval and payment.');
      handleApplicationUpdate();
    } catch (err) {
      setError('Failed to submit media files. Please try again.');
      console.error('Media submission error:', err);
      throw err;
    }
  };

  // Filter and sort applications
  const filteredApplications = React.useMemo(() => {
    if (!applications || applications.length === 0) return [];

    let filtered = applications.filter(app => {
      // Tab filtering
      if (activeTab !== 'all') {
        if (activeTab !== app.status) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          (app.brand_name?.toLowerCase().includes(searchLower)) ||
          (app.campaign_title?.toLowerCase().includes(searchLower)) ||
          (app.message?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(app.status)) {
        return false;
      }

      // Brand name filter
      if (filters.brandName && !app.brand_name?.toLowerCase().includes(filters.brandName.toLowerCase())) {
        return false;
      }

      // Campaign title filter
      if (filters.campaignTitle && !app.campaign_title?.toLowerCase().includes(filters.campaignTitle.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const appliedDate = new Date(app.applied_at);
        if (filters.dateRange.start && appliedDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (appliedDate > endDate) {
            return false;
          }
        }
      }

      // Message filter
      if (filters.hasMessage === 'with' && !app.message) {
        return false;
      }
      if (filters.hasMessage === 'without' && app.message) {
        return false;
      }

      return true;
    });

    // Sort applications
    filtered.sort((a, b) => {
      const dateA = new Date(a.applied_at);
      const dateB = new Date(b.applied_at);
      
      switch (filters.sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'brandAZ':
          return (a.brand_name || '').localeCompare(b.brand_name || '');
        case 'brandZA':
          return (b.brand_name || '').localeCompare(a.brand_name || '');
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [applications, filters, activeTab]);

  // Get unique brands and status counts for filter options
  const filterOptions = React.useMemo(() => {
    if (!applications || applications.length === 0) return { brands: [], statusCounts: {} };
    
    const brands = [...new Set(applications.map(app => app.brand_name).filter(Boolean))].sort();
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return { brands, statusCounts };
  }, [applications]);

  // Tab counts
  const tabCounts = React.useMemo(() => {
    if (!applications || applications.length === 0) return { 
      all: 0, pending: 0, approved: 0, contracted: 0, media_submitted: 0, completed: 0, rejected: 0 
    };
    
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      contracted: applications.filter(app => app.status === 'contracted' || app.contract_signed).length,
      media_submitted: applications.filter(app => app.status === 'media_submitted').length,
      completed: applications.filter(app => app.status === 'completed').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  }, [applications]);

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status, application) => {
  switch (status) {
    case 'pending': return <Pending color="warning" />;
    case 'approved': return <CheckCircle color="success" />;
    case 'contracted': 
      return application?.contract_signed ? 
        <Description color="success" /> : 
        <Description color="secondary" />;
    case 'media_submitted': return <ImageIcon color="info" />;
    case 'completed': return <DoneAll color="primary" />;
    case 'rejected': return <Cancel color="error" />;
    default: return <Campaign />;
  }
};

  const getStatusText = (status, application) => {
  switch (status) {
    case 'pending': return 'Under Review';
    case 'approved': return 'Approved - Contract Ready';
    case 'contracted': 
      return application?.contract_signed ? 'Contract Signed ✓' : 'Contract Sent - Action Required';
    case 'media_submitted': return 'Media Submitted';
    case 'completed': return 'Completed';
    case 'rejected': return 'Not Selected';
    default: return status;
  }
};

  const getApplicationActions = (app) => {
  switch (app.status) {
    case 'approved':
      return (
        <ContractButton
          size="small"
          startIcon={<Description />}
          onClick={() => {
            if (app) {
              setSelectedApplicationForContract(app);
              setContractAcceptanceDialogOpen(true);
            }
          }}
        >
          Review Contract
        </ContractButton>
      );
    
    // Fix: Check if contract is actually signed
    case 'contracted':
      if (app.contract_signed) {
        // Contract is signed - show Submit Media button
        return (
          <MediaButton
            size="small"
            startIcon={<ImageIcon />}
            onClick={() => {
              setSelectedApplicationForMedia(app);
              setMediaSubmissionDialogOpen(true);
            }}
          >
            Submit Media
          </MediaButton>
        );
      } else {
        // Contract not signed yet - show Accept Contract button
        return (
          <ContractButton
            size="small"
            startIcon={<Description />}
            onClick={() => {
              setSelectedApplicationForContract(app);
              setContractAcceptanceDialogOpen(true);
            }}
          >
            Accept Contract First
          </ContractButton>
        );
      }
    
    case 'media_submitted':
      return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Waiting for payment
          </Typography>
        </Box>
      );
    
    case 'completed':
      return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <PaymentButton
            size="small"
            startIcon={<DoneAll />}
            disabled
          >
            Completed
          </PaymentButton>
        </Box>
      );
    
    default:
      return (
        <Typography variant="caption" color="text.secondary">
          {getStatusText(app.status)}
        </Typography>
      );
  }
};

  const getWorkflowSteps = (application) => {
  const steps = [
    { label: 'Applied', completed: true, icon: <Assignment /> },
    { label: 'Under Review', completed: ['approved', 'contracted', 'media_submitted', 'completed'].includes(application.status), icon: <PendingActions /> },
    { label: 'Approved', completed: ['approved', 'contracted', 'media_submitted', 'completed'].includes(application.status), icon: <CheckCircle /> },
    { 
      label: application.contract_signed ? 'Contract Signed' : 'Contract Sent', 
      completed: ['contracted', 'media_submitted', 'completed'].includes(application.status), 
      icon: <Description />,
      subtext: application.contract_signed_at ? 
        `Signed: ${new Date(application.contract_signed_at).toLocaleDateString()}` : 
        'Awaiting your signature'
    },
    { label: 'Media Submitted', completed: ['media_submitted', 'completed'].includes(application.status), icon: <ImageIcon /> },
    { label: 'Payment', completed: ['completed'].includes(application.status), icon: <MonetizationOn /> }
  ];

  if (application.status === 'rejected') {
    steps[1].completed = false;
    steps[1].label = 'Rejected';
    steps[1].icon = <Cancel />;
  }

  return steps;
};

  const getActiveStep = (application) => {
    switch (application.status) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'contracted': return 3;
      case 'media_submitted': return 4;
      case 'completed': return 5;
      case 'rejected': return 1;
      default: return 0;
    }
  };

  // Image Handlers
  const handleImageClick = (fileId, altText) => {
    if (fileId) {
      setSelectedImage({
        url: `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`,
        alt: altText
      });
      setImageModalOpen(true);
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // Handlers
  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
    setDetailTab('overview');
  };

// Update the handleCloseDialogs function:
const handleCloseDialogs = () => {
  setDetailDialogOpen(false);
  setContractAcceptanceDialogOpen(false);
  setMediaSubmissionDialogOpen(false);
  setMediaFilesDialogOpen(false);
  setSelectedApplication(null);
  setSelectedApplicationForContract(null);
  setSelectedApplicationForMedia(null);
};

  const handleViewBrandProfile = (brandId) => {
    navigate(`/influencer/profile/view/brand/${brandId}`);
  };

  const handleContactBrand = (application) => {
    const brandId = application.brand_id;
    if (brandId) {
      navigate(`/influencer/collaborations?user=${brandId}&campaign=${application.campaign_id}`);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && 
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'object' && value.start === null && value.end === null)
    ).length;
  };

  // Filter Sidebar Component
  const FilterSidebar = () => (
    <FilterSection>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="700" color="primary">
          <FilterList sx={{ mr: 1 }} />
          Filters
        </Typography>
        <Badge badgeContent={getActiveFilterCount()} color="primary">
          <Button 
            size="small" 
            onClick={clearAllFilters}
            startIcon={<Clear />}
            sx={{ fontWeight: 600 }}
          >
            Clear All
          </Button>
        </Badge>
      </Box>
      
      {/* Global Search */}
      <SearchBar>
        <Search sx={{ color: 'text.secondary', mr: 1 }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search applications..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
        {filters.search && (
          <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
            <Clear />
          </IconButton>
        )}
      </SearchBar>

      {/* Status Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Application Status
        </Typography>
        <FormGroup>
          {['pending', 'approved', 'contracted', 'media_submitted', 'completed', 'rejected'].map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusChange(status)}
                  size="small"
                />
              }
              label={
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(status)}
                    <Typography variant="body2">
                      {getStatusText(status)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={filterOptions.statusCounts[status] || 0} 
                    size="small" 
                    sx={{ height: 20, minWidth: 30, fontSize: '0.7rem' }}
                  />
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Box>

      {/* Sort Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            sx={{ borderRadius: '8px' }}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="brandAZ">Brand Name A-Z</MenuItem>
            <MenuItem value="brandZA">Brand Name Z-A</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results Count */}
      <Box sx={{ p: 2, background: 'rgba(102, 126, 234, 0.08)', borderRadius: '12px', textAlign: 'center' }}>
        <Typography variant="body1" color="primary" fontWeight="600">
          {filteredApplications.length} of {applications.length} applications
        </Typography>
      </Box>
    </FilterSection>
  );

  // Image Modal Component
  const ImageModal = ({ open, onClose, imageUrl, alt }) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="image-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ 
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none'
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <Close />
          </IconButton>
          <img
            src={imageUrl}
            alt={alt}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          />
        </Box>
      </Modal>
    );
  };

  // Application Workflow Component
  const ApplicationWorkflow = ({ application }) => {
    const steps = getWorkflowSteps(application);
    const activeStep = getActiveStep(application);

    return (
      <WorkflowStepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} completed={step.completed}>
            <StepLabel
              icon={step.icon}
              sx={{
                '& .MuiStepLabel-label': {
                  color: step.completed ? 'success.main' : 
                         index === activeStep ? 'primary.main' : 'text.secondary',
                  fontWeight: index === activeStep ? 700 : 500
                }
              }}
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </WorkflowStepper>
    );
  };

  // =============================================
  // RENDER
  // =============================================

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 80px)"
        Height= "calc(100vh - 80px)"
        flexDirection="column"
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)', 
          borderRadius: '20px',
          mx: 2
        }}
      >
        <CircularProgress size={80} thickness={4} sx={{ color: 'primary.main', mb: 4 }} />
        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Loading your applications...
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
          Please wait while we fetch your campaign applications
        </Typography>
      </Box>
    );
  }

  if (error && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffeaea 0%, #ffcece 100%)',
            color: '#d32f2f',
            fontWeight: 600,
            py: 2
          }} 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleApplicationUpdate}
              sx={{ fontWeight: 700 }}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Oops! Something went wrong
          </Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexDirection={isMobile ? 'column' : 'row'}
        gap={isMobile ? 3 : 0}
        sx={{
          background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(29, 78, 216))',
          borderRadius: '20px',
          p: 4,
          color: 'white',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" fontWeight="800" gutterBottom>
            My Applications
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>
            Track your campaign applications and manage the complete workflow
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleApplicationUpdate}
            disabled={loading}
            sx={{ 
              borderRadius: '12px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              px: 3,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderColor: 'rgba(255,255,255,0.5)',
              }
            }}
          >
            Refresh
          </Button>

          <Button
    variant="outlined"
    startIcon={<FilterList />}
    onClick={() => setFilterDrawerOpen(true)}
    sx={{ 
      borderRadius: '12px', 
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      borderColor: 'rgba(255,255,255,0.3)',
      px: 3,
      fontWeight: 600,
    }}
  >
    Filters ({getActiveFilterCount()})
  </Button>
        </Box>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ borderRadius: '16px', mb: 4, overflow: 'hidden', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              fontSize: '0.9rem', 
              fontWeight: 700, 
              py: 3, 
              minHeight: '70px',
              textTransform: 'none'
            } 
          }}
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <Work sx={{ mr: 1.5, fontSize: 24 }} />
                All Applications
                <Chip label={tabCounts.all} size="small" sx={{ ml: 1.5, fontWeight: 700 }} />
              </Box>
            } 
            value="all" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <Pending sx={{ mr: 1.5, fontSize: 24 }} />
                Under Review
                <Chip label={tabCounts.pending} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="warning" />
              </Box>
            } 
            value="pending" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <CheckCircle sx={{ mr: 1.5, fontSize: 24 }} />
                Approved
                <Chip label={tabCounts.approved} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="success" />
              </Box>
            } 
            value="approved" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <Description sx={{ mr: 1.5, fontSize: 24 }} />
                Contracted
                <Chip label={tabCounts.contracted} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="secondary" />
              </Box>
            } 
            value="contracted" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <ImageIcon sx={{ mr: 1.5, fontSize: 24 }} />
                Media Ready
                <Chip label={tabCounts.media_submitted} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="info" />
              </Box>
            } 
            value="media_submitted" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <DoneAll sx={{ mr: 1.5, fontSize: 24 }} />
                Completed
                <Chip label={tabCounts.completed} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="primary" />
              </Box>
            } 
            value="completed" 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <Cancel sx={{ mr: 1.5, fontSize: 24 }} />
                Rejected
                <Chip label={tabCounts.rejected} size="small" sx={{ ml: 1.5, fontWeight: 700 }} color="error" />
              </Box>
            } 
            value="rejected" 
          />
        </Tabs>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Filters Sidebar - Hidden on mobile */}
        {/* {!isMobile && (
          <Grid item xs={12} md={3}>
            <FilterSidebar />
          </Grid>
        )} */}

        {/* Applications Content */}
        <Grid item xs={12}>
  {/* Filter Toggle Button - Show on all screens */}
  {/* <Button
    fullWidth={isMobile}
    variant="outlined"
    startIcon={<FilterList />}
    onClick={() => setFilterDrawerOpen(true)}
    sx={{ 
      mb: 3, 
      borderRadius: '12px',
      py: 1.5,
      fontWeight: 600,
      width: isMobile ? '100%' : 'auto'
    }}
  >
    Show Filters ({getActiveFilterCount()})
  </Button> */}

          {/* Alerts */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                fontWeight: 600
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                fontWeight: 600
              }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Status Summary Cards */}
          {/* {filteredApplications.length > 0 && (
            <Grid container spacing={2} mb={4}>
              {Object.entries(tabCounts).map(([status, count]) => (
                <Grid item xs={6} sm={4} md={3} key={status}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                      border: activeTab === status ? '2px solid' : '1px solid rgba(0, 0, 0, 0.05)',
                      borderColor: activeTab === status ? 'primary.main' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                    onClick={() => setActiveTab(status)}
                  >
                    <Box sx={{ color: 'primary.main', mb: 2, fontSize: '2.5rem' }}>
                      {getStatusIcon(status)}
                    </Box>
                    <Typography variant="h4" fontWeight="800" color="primary">
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 600 }}>
                      {getStatusText(status)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )} */}

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
  <Paper sx={{ 
    textAlign: 'center', 
    py: 10,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
    border: '2px dashed rgba(102, 126, 234, 0.3)'
  }}>
    <CardContent>
      <Campaign sx={{ fontSize: 80, color: 'grey.400', mb: 3, opacity: 0.7 }} />
      <Typography variant="h4" color="text.secondary" gutterBottom fontWeight="700">
        {applications.length === 0 ? 
          "No Applications Yet" : 
          "No Matching Applications"
        }
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4, fontSize: '1.1rem' }}>
        {applications.length === 0 ? 
          "Start your influencer journey by applying to exciting brand campaigns!" :
          "Try adjusting your filters to see more results"
        }
      </Typography>
      {applications.length === 0 ? (
        <GradientButton
          startIcon={<Launch />}
          onClick={() => navigate('/influencer/campaigns')}
          size="large"
        >
          Browse Available Campaigns
        </GradientButton>
      ) : (
        <GradientButton
          startIcon={<Clear />}
          onClick={clearAllFilters}
          size="large"
        >
          Clear All Filters
        </GradientButton>
      )}
    </CardContent>
  </Paper>
) : (
  <Grid 
    container 
    spacing={3}
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)'
      },
      gap: 3,
      '& .MuiGrid-item': {
        padding: 0,
        width: '100%',
        display: 'flex'
      }
    }}
  >
    {filteredApplications.map((app, index) => (                  
      <Grid 
        item 
        key={`${app.campaign_id}-${app.influencer_id}-${index}`}
        sx={{ 
          animation: `${fadeIn} 0.5s ease`,
          animationDelay: `${index * 0.1}s`,
          animationFillMode: 'both',
          display: 'flex',
          minWidth: 0
        }}
      >
        <Card 
          sx={{ 
            width: '100%',
            height: '100%',
            borderRadius: '16px', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            p: 0,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
              borderColor: 'primary.light'
            },
          }}
        >
          {/* Campaign Image Section - Full Width */}
          <Box sx={{ position: 'relative', width: '100%', height: '160px' }}>
            {app.campaign_image_id ? (
              <CardActionArea 
                onClick={() => handleImageClick(app.campaign_image_id, app.campaign_title)}
                sx={{ height: '100%' }}
              >
                <CardMedia
                  component="img"
                  image={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${app.campaign_image_id}`}
                  alt={app.campaign_title}
                  sx={{ 
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 2,
                  }}
                >
                  {/* Application Status Badge */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                    <StatusChip
                      label={getStatusText(app.status)}
                      status={app.status}
                      icon={getStatusIcon(app.status)}
                    />
                  </Box>
                </Box>
              </CardActionArea>
            ) : (
              <Box 
                sx={{ 
                  width: '100%',
                  height: '160px',
                  background: 'linear-gradient(135deg, #667eea 0%, #1565c0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Campaign sx={{ fontSize: 64, color: 'white', opacity: 0.7 }} />
              </Box>
            )}
          </Box>

          {/* Card Content Section */}
          <CardContent 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 3,
              '&:last-child': { pb: 3 }
            }}
          >
            {/* Title with Application Count Badge */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start" 
              mb={2}
              sx={{ 
                minHeight: '32px', 
                position: 'relative',
                gap: 1
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
                {app.campaign_title || 'Untitled Campaign'}
              </Typography>
              
              {/* Applied Date Badge */}
              <Chip
                label={app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                size="small"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  color: 'primary.main',
                  flexShrink: 0
                }}
              />
            </Box>

            {/* Brand Profile Section */}
            <Box 
              display="flex" 
              alignItems="center" 
              mb={2} 
              sx={{ 
                p: 1.5, 
                backgroundColor: 'rgba(102, 126, 234, 0.08)', 
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.12)',
                  transform: 'translateX(2px)',
                }
              }}
              onClick={() => handleViewBrandProfile(app.brand_id)}
            >
              <ProfileImage
                userId={app.brand_id}
                profileType="brand"
                size={40}
              />
              <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight="600" noWrap>
                  {app.brand_name || 'Unknown Brand'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {app.campaign_category || 'General'}
                </Typography>
              </Box>
              {/* <IconButton size="small" sx={{ color: 'primary.main' }}>
                <Visibility fontSize="small" />
              </IconButton> */}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Campaign Details Grid */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                mb: 2
              }}
            >
              {/* Budget */}
              <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                <AttachMoney sx={{ fontSize: 18, mr: 1.5, color: 'success.main', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    Budget
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {app.campaign_currency || 'USD'} {app.campaign_budget}
                  </Typography>
                </Box>
              </Box>

              {/* Deadline */}
              <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                <CalendarToday sx={{ fontSize: 18, mr: 1.5, color: 'warning.main', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    Deadline
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {app.campaign_deadline ? new Date(app.campaign_deadline).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Category */}
              <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                <Category sx={{ fontSize: 18, mr: 1.5, color: 'primary.main', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {app.campaign_category || 'General'}
                  </Typography>
                </Box>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" sx={{ minHeight: '24px' }}>
                <Flag sx={{ fontSize: 18, mr: 1.5, color: 'info.main', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    Campaign Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {app.campaign_status?.charAt(0).toUpperCase() + app.campaign_status?.slice(1) || 'Active'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Mini Workflow Status */}
            <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" mb={1}>
                APPLICATION STATUS:
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight="600" color="primary">
                  {getStatusText(app.status)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {app.applied_at ? `Applied: ${new Date(app.applied_at).toLocaleDateString()}` : ''}
                </Typography>
              </Box>
              
              {/* Tiny Progress Line */}
              <Box sx={{ mt: 1, position: 'relative', height: 4, backgroundColor: 'grey.200', borderRadius: 2 }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${(getActiveStep(app) / 5) * 100}%`,
                    background: 'linear-gradient(90deg, #667eea 0%, #1565c0 100%)',
                    borderRadius: 2,
                    transition: 'width 0.5s ease'
                  }}
                />
              </Box>
            </Box>

            {/* Application Message (if exists) */}
            {app.message && (
              <Box 
                sx={{ 
                  mb: 2, 
                  p: 1.5, 
                  backgroundColor: 'rgba(102, 126, 234, 0.05)', 
                  borderRadius: '10px',
                  borderLeft: '3px solid',
                  borderLeftColor: 'primary.main'
                }}
              >
                <Typography variant="caption" fontWeight="600" color="primary" display="block" mb={0.5}>
                  YOUR MESSAGE:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontStyle: 'italic',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    color: 'text.secondary'
                  }}
                >
                  "{app.message}"
                </Typography>
              </Box>
            )}

            {/* Bottom Actions Section */}
            <Box 
              display="flex" 
              gap={1} 
              sx={{ 
                mt: 'auto',
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={() => handleViewDetails(app)}
                sx={{ 
                  borderRadius: '8px',
                  flex: 1,
                  minHeight: '36px'
                }}
              >
                View Details
              </Button>
              
              <IconButton
                size="small"
                onClick={() => handleContactBrand(app)}
                sx={{ 
                  borderRadius: '8px',
                  background: 'rgba(25, 118, 210, 0)',
                  '&:hover': { background: 'rgba(25, 118, 210, 0.2)' }
                }}
              >
                <Message fontSize="small" />
              </IconButton>

              {/* View Media Button for relevant statuses */}
              {(app.status === 'media_submitted' || app.status === 'completed') && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedApplication(app);
                    setMediaFilesDialogOpen(true);
                  }}
                  sx={{ 
                    borderRadius: '8px',
                    background: 'rgba(33, 150, 243, 0.1)',
                    '&:hover': { background: 'rgba(33, 150, 243, 0.2)' }
                  }}
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              )}

              {/* Contract/Media Action Button */}
              <Box sx={{ flex: 1 }}>
                {getApplicationActions(app)}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
)}
      </Grid>
    </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: isMobile ? '100%' : 400, 
            p: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          } 
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight="700" color="primary">
            Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <FilterSidebar />
      </Drawer>

      {/* Application Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDialogs}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1565c0 0%, #1565c0 100%)', 
          color: 'white',
          fontWeight: 800,
          py: 4
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">
              Application Details
            </Typography>
            <IconButton onClick={handleCloseDialogs} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, overflow: 'auto' }}>
          {selectedApplication && (
            <TabContext value={detailTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs
                  value={detailTab}
                  onChange={(e, newValue) => setDetailTab(newValue)}
                  sx={{ 
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '1rem'
                    }
                  }}
                >
                  <Tab label="Campaign Overview" value="overview" />
                  <Tab label="Application Workflow" value="workflow" />
                  <Tab label="Media Files" value="media" />
                </Tabs>
              </Box>

              <TabPanel value="overview" sx={{ p: 4 }}>
                <CampaignDetailSection application={selectedApplication} />
              </TabPanel>

              <TabPanel value="workflow" sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="700" color="primary" mb={3}>
                  Application Progress
                </Typography>
                <ApplicationWorkflow application={selectedApplication} />
              </TabPanel>

              <TabPanel value="media" sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                  <Typography variant="h5" fontWeight="700" color="primary">
                    Submitted Media Files
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => {
                      handleCloseDialogs();
                      setMediaFilesDialogOpen(true);
                    }}
                    sx={{ borderRadius: '10px', fontWeight: 600 }}
                  >
                    Open Media Manager
                  </Button>
                </Box>
                <MediaFilesViewer 
                  open={false} 
                  onClose={() => {}} 
                  application={selectedApplication} 
                />
              </TabPanel>
            </TabContext>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialogs}
            sx={{ 
              borderRadius: '12px', 
              px: 4,
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Acceptance Dialog */}
      <ContractAcceptanceDialog
  open={contractAcceptanceDialogOpen}
  onClose={() => {
    setContractAcceptanceDialogOpen(false);
    setSelectedApplicationForContract(null);
  }}
  application={selectedApplicationForContract}
  onAcceptContract={handleAcceptContract}
/>

      {/* Media Submission Dialog */}
      <MediaSubmissionDialog
        open={mediaSubmissionDialogOpen}
        onClose={handleCloseDialogs}
        application={selectedApplicationForMedia}
        onSubmitMedia={handleSubmitMedia}
      />

      {/* Media Files Viewer Dialog */}
      <MediaFilesViewer
        open={mediaFilesDialogOpen}
        onClose={handleCloseDialogs}
        application={selectedApplication}
      />

      <ImageModal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        imageUrl={selectedImage?.url}
        alt={selectedImage?.alt}
      />

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => { setError(''); setSuccess(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => { setError(''); setSuccess(''); }}
          severity={error ? 'error' : 'success'}
          sx={{ 
            width: '100%', 
            borderRadius: '12px',
            alignItems: 'center',
            fontWeight: 600,
            fontSize: '1rem'
          }}
          variant="filled"
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InfluencerApplications;


// import InfluencerApplications from './components/InfluencerApplications';

// // In your parent component
// <InfluencerApplications
//   applications={applicationsData}
//   onUpdate={fetchApplications}
//   loading={isLoading}
// />