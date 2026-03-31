import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Badge,
  useTheme,
  CardActions,
  useMediaQuery,
  Tabs,
  Tab,
  Breadcrumbs,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Zoom
} from '@mui/material';
import {
  Payment,
  AccountBalanceWallet,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Receipt,
  Visibility,
  Refresh,
  TrendingUp,
  Image as ImageIcon,
  Download,
  Person,
  Close,
  Chat as ChatIcon,
  Email,
  CalendarToday,
  Category,
  AttachMoney,
  Work,
  Business,
  NavigateNext,
  Home,
  Campaign,
  PlayArrow,
  Description,
  OpenInNew,
  Share,
  Favorite,
  Comment,
  ThumbUp,
  ThumbDown,
  VerifiedUser,
  Instagram,
  YouTube,
  LinkedIn,
  Twitter,
  Facebook,
  Language
} from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { styled, keyframes } from '@mui/system';
import { format, formatDistanceToNow } from 'date-fns';
import { campaignAPI, paymentAPI } from '../../services/api';
import { AuthContext } from "../../context/AuthContext";
import profileAPI from '../../services/profileAPI';
// Add at the top with other imports
import { CurrencyContext } from "../../context/CurrencyContext";

// Add these currency constants after the imports
const CURRENCY_SYMBOLS = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  SGD: 'S$',
  HKD: 'HK$',
  KRW: '₩',
  RUB: '₽',
  TRY: '₺',
  BRL: 'R$',
  MXN: '$',
  AED: 'د.إ',
  SAR: 'ر.س',
  ZAR: 'R'
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krona',
  SGD: 'Singapore Dollar',
  HKD: 'Hong Kong Dollar',
  KRW: 'South Korean Won',
  RUB: 'Russian Ruble',
  TRY: 'Turkish Lira',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  ZAR: 'South African Rand'
};

const POPULAR_CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CAD', 'AUD', 'INR'];

// =============================================
// 🎨 ENHANCED STYLED COMPONENTS
// =============================================

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
  100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
`;

const StatsCard = styled(Card)(({ theme, updated }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #49a0edff 100%)',
  color: 'white',
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  animation: updated ? `${pulseAnimation} 0.6s ease` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
  }
}));

const ProfessionalCard = styled(Card)(({ theme, updated }) => ({
  height: '100%',
  width: '380px',
  maxWidth: '380px',
  minWidth: '320px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: updated ? '2px solid #4CAF50' : '1px solid rgba(0, 0, 0, 0.06)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  overflow: 'visible',
  animation: updated ? `${glowAnimation} 2s ease infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
    borderColor: theme.palette.primary
  }
}));

const StatusChip = styled(Chip)(({ theme, status, updated }) => ({
  fontWeight: 700,
  fontSize: '0.7rem',
  height: '26px',
  borderRadius: '8px',
  animation: updated ? `${pulseAnimation} 0.5s ease 2` : 'none',
  ...(status === 'completed' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'failed' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  }),
  ...(status === 'processing' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }),
  ...(status === 'media_submitted' && {
    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
  })
}));

const PaymentCard = styled(Card)(({ theme, updated }) => ({
  borderRadius: '20px',
  border: `1px solid ${theme.palette.divider}`,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  animation: updated ? `${slideInUp} 0.5s ease` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  }
}));

const FixedImageContainer = styled(Box)({
  height: '220px',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  flexShrink: 0,
  borderRadius: '20px 20px 0 0'
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #49a0edff 100%)',
  color: 'white',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    transform: 'translateY(-2px)',
    background: '#2563eb'
  }
}));

// =============================================
// 🖼️ PROFILE IMAGE COMPONENT
// =============================================

const ProfileImage = ({ userId, profileType, alt, onClick, size = 40, userData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        setLoading(true);
        if (userId) {
          const imageUrls = [
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/profiles/image/${userId}`,
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/profiles/image/${userId}`,
            `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/profiles/${userId}/image`,
          ];

          for (const url of imageUrls) {
            try {
              const response = await fetch(url, { method: 'HEAD' });
              if (response.ok) {
                setImageUrl(url);
                setError(false);
                return;
              }
            } catch (err) {
              continue;
            }
          }
          setError(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching profile image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImage();
  }, [userId, profileType]);

  const getDisplayInitial = () => {
    if (userData?.username) return userData.username.charAt(0).toUpperCase();
    if (userData?.full_name) return userData.full_name.charAt(0).toUpperCase();
    if (userData?.company_name) return userData.company_name.charAt(0).toUpperCase();
    return alt?.charAt(0)?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userData?.username) return userData.username;
    if (userData?.full_name) return userData.full_name;
    if (userData?.company_name) return userData.company_name;
    return alt || 'User';
  };

  if (error || !imageUrl) {
    return (
      <Avatar 
        sx={{ 
          width: size, 
          height: size,
          background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
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
// 👤 ENHANCED USER INFO COMPONENT
// =============================================

const UserInfo = ({ userId, profileType, showEmail = true, size = 40, showStats = false, userName, userData, onViewProfile, onChat }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(userData || null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!userData && userId) {
          const response = await profileAPI.getProfileById(userId);
          if (response?.profile) {
            setProfileData(response.profile);
          } else {
            setProfileData({
              username: userName || 'Unknown User',
              email: 'user@example.com',
              profile_type: profileType
            });
          }
        } else {
          setProfileData(userData || {
            username: userName || 'Unknown User',
            email: 'user@example.com',
            profile_type: profileType
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setProfileData({
          username: userName || 'Unknown User',
          email: 'user@example.com',
          profile_type: profileType
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, userName, userData, profileType]);

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(profileData);
    } else if (userId) {
      navigate(`/profile/view/${profileType}/${userId}`);
    }
  };

  const handleChat = () => {
    if (onChat) {
      onChat(profileData);
    } else if (userId) {
      navigate(`/brand/collaborations?user=${userId}&name=${encodeURIComponent(userName || profileData?.username)}`);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram sx={{ fontSize: 16 }} />;
      case 'youtube': return <YouTube sx={{ fontSize: 16 }} />;
      case 'linkedin': return <LinkedIn sx={{ fontSize: 16 }} />;
      case 'twitter': return <Twitter sx={{ fontSize: 16 }} />;
      case 'facebook': return <Facebook sx={{ fontSize: 16 }} />;
      default: return <Language sx={{ fontSize: 16 }} />;
    }
  };

  const getDisplayName = () => {
    if (profileData?.username) return profileData.username;
    if (profileData?.full_name) return profileData.full_name;
    if (profileData?.company_name) return profileData.company_name;
    return userName || 'Unknown User';
  };

  const getDisplayTitle = () => {
    if (profileData?.title) return profileData.title;
    if (profileData?.bio) return profileData.bio.substring(0, 50) + (profileData.bio.length > 50 ? '...' : '');
    if (profileType === 'influencer') return 'Influencer';
    return 'Brand';
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1.5}>
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
        userData={profileData}
      />
      <Box flex={1} minWidth={0}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Typography 
            variant="subtitle2" 
            fontWeight="700"
            sx={{ 
              cursor: 'pointer',
              '&:hover': { color: 'primary', textDecoration: 'underline' }
            }}
            onClick={handleViewProfile}
            noWrap
          >
            {getDisplayName()}
          </Typography>
          
          {profileData?.verified && (
            <Tooltip title="Verified Profile">
              <VerifiedUser sx={{ fontSize: 16, color: 'primary' }} />
            </Tooltip>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {getDisplayTitle()}
        </Typography>

        {showEmail && profileData?.email && (
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {profileData.email}
          </Typography>
        )}

        {showStats && profileType === 'influencer' && (
          <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
            {profileData?.primary_platform && (
              <Tooltip title={profileData.primary_platform}>
                {getPlatformIcon(profileData.primary_platform)}
              </Tooltip>
            )}
            {profileData?.followers && (
              <Typography variant="caption" color="text.secondary">
                {profileData.followers >= 1000 
                  ? `${(profileData.followers / 1000).toFixed(1)}K` 
                  : profileData.followers
                } followers
              </Typography>
            )}
            {profileData?.engagement_rate && (
              <Typography variant="caption" color="success" fontWeight="600">
                {profileData.engagement_rate}% engagement
              </Typography>
            )}
          </Box>
        )}

        {showStats && profileType === 'brand' && profileData?.company_name && (
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Business sx={{ fontSize: 12, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {profileData.company_name}
            </Typography>
          </Box>
        )}
      </Box>

      {onChat && (
        <Tooltip title="Send Message">
          <IconButton 
            size="small" 
            onClick={handleChat}
            sx={{ 
              background: 'rgba(25, 118, 210, 0.1)',
              '&:hover': { background: 'rgba(25, 118, 210, 0.2)' }
            }}
          >
            <ChatIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// =============================================
// 💬 CHAT LAUNCH COMPONENT
// =============================================

const ChatLaunch = ({ userId, userName, size = "small" }) => {
  const navigate = useNavigate();

  const handleChat = () => {
    navigate(`/brand/collaborations?user=${userId}&name=${encodeURIComponent(userName)}`);
  };

  return (
    <Tooltip title={`Chat with ${userName}`}>
      <Button
        size={size}
        startIcon={<ChatIcon />}
        onClick={handleChat}
        variant="outlined"
        sx={{ 
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Chat
      </Button>
    </Tooltip>
  );
};

// =============================================
// 🎯 CAMPAIGN DETAILS COMPONENT
// =============================================

const CampaignDetails = ({ campaign, expanded = false, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.(!isExpanded);
  };

  if (!campaign) return null;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box flex={1}>
          <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
            {campaign.title || 'Campaign Details'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {campaign.category || 'General Category'} • {campaign.status || 'Active'}
          </Typography>
        </Box>
        <IconButton onClick={handleExpand} size="small">
          {isExpanded ? <Visibility /> : <Visibility />}
        </IconButton>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <AttachMoney sx={{ fontSize: 16, color: 'success' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {campaign.currency || 'USD'} {campaign.budget?.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarToday sx={{ fontSize: 16, color: 'warning' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Deadline
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {campaign.deadline ? format(new Date(campaign.deadline), 'MMM dd, yyyy') : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Category sx={{ fontSize: 16, color: 'primary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {campaign.category || 'General'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Work sx={{ fontSize: 16, color: 'info' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <StatusChip 
                label={campaign.status} 
                status={campaign.status}
                size="small"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {isExpanded && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {campaign.description && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {campaign.description}
              </Typography>
            </Box>
          )}

          {campaign.requirements && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Requirements
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {campaign.requirements}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Campaign Timeline
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Created" 
                    secondary={campaign.created_at ? format(new Date(campaign.created_at), 'MMM dd, yyyy') : 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Schedule sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Deadline" 
                    secondary={campaign.deadline ? format(new Date(campaign.deadline), 'MMM dd, yyyy') : 'N/A'}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                Performance
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Person sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Applications" 
                    secondary={campaign.applications_count || campaign.applications?.length || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Approved" 
                    secondary={campaign.approved_applications || 0}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

// =============================================
// 🖼️ CAMPAIGN IMAGE COMPONENT
// =============================================

const CampaignImage = ({ fileId, alt, onClick, campaignData }) => {
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
      <FixedImageContainer onClick={onClick}>
        <Box 
          sx={{ 
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
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
      
      {campaignData?.budget && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(255,160,0,0.95) 100%)',
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

      {campaignData?.status && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: 600,
            zIndex: 2
          }}
        >
          {campaignData.status}
        </Box>
      )}
    </FixedImageContainer>
  );
};

// =============================================
// 📁 ENHANCED MEDIA FILES DIALOG
// =============================================

const MediaFilesDialog = ({ open, onClose, application, mediaFiles }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const navigate = useNavigate();

  const getMediaIcon = (mediaType) => {
    switch (mediaType?.toLowerCase()) {
      case 'image': return <ImageIcon color="primary" />;
      case 'video': return <PlayArrow color="secondary" />;
      case 'audio': return <Description color="info" />;
      case 'document': return <Description color="warning" />;
      default: return <ImageIcon color="action" />;
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/media/${fileId}/download`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleViewMedia = (media) => {
    setSelectedMedia(media);
  };

  const getMediaViewUrl = (media) => {
    if (!media.file_id) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/media/${media.file_id}/view`;
  };

  const handleViewProfile = (profileData) => {
    setViewProfile(profileData);
  };

  const handleChat = (profileData) => {
    navigate(`/brand/collaborations?user=${profileData._id}&name=${encodeURIComponent(profileData.username)}`);
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
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
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
              <ImageIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5">
                  Submitted Media Files
                  {mediaFiles.length > 0 && ` (${mediaFiles.length})`}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <UserInfo
                    userId={application.influencer_id}
                    profileType="influencer"
                    showEmail={false}
                    size={32}
                    userName={application.influencer_name}
                    onViewProfile={handleViewProfile}
                    onChat={handleChat}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    for "{application.title}"
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 4 }}>
          {mediaFiles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <ImageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Media Files Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No media files have been submitted for this campaign yet.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<ChatIcon />}
                onClick={() => handleChat({ _id: application.influencer_id, username: application.influencer_name })}
              >
                Message Influencer
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {mediaFiles.map((media, index) => (
                <Grid item xs={12} sm={6} md={4} key={media.file_id || index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.3s ease',
                      border: `2px solid transparent`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                    onClick={() => handleViewMedia(media)}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
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
                          Submitted: {format(new Date(media.submitted_at), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMedia(media);
                        }}
                        sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                        disabled={!media.file_id}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(media.file_id, media.filename);
                        }}
                        sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                        disabled={!media.file_id}
                        color="success"
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

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={() => handleChat({ _id: application.influencer_id, username: application.influencer_name })}
            sx={{ borderRadius: '12px' }}
          >
            Message Influencer
          </Button>
          <Button 
            onClick={onClose} 
            sx={{ borderRadius: '12px', px: 4 }}
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
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', color: 'white' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="600">
                  {selectedMedia.filename || 'Media File'}
                </Typography>
                <IconButton onClick={() => setSelectedMedia(null)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, textAlign: 'center', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedMedia.media_type === 'image' ? (
                <img
                  src={getMediaViewUrl(selectedMedia)}
                  alt={selectedMedia.filename}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh', 
                    objectFit: 'contain',
                    borderRadius: '12px'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', selectedMedia);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Box py={6} width="100%">
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
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

// =============================================
// 💰 MAIN BRAND PAYMENT COMPONENT
// =============================================

const BrandPayment = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  
  const [applications, setApplications] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [paymentStep, setPaymentStep] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [updatedItems, setUpdatedItems] = useState(new Set());

  const steps = ['Select Payment', 'Confirm Details', 'Processing', 'Complete'];

  // Enhanced breadcrumbs
  const breadcrumbs = [
    <Link key="1" to="/brand/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Home sx={{ fontSize: 16 }} />
        Dashboard
      </Typography>
    </Link>,
    <Link key="2" to="/brand/campaigns" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Typography>Campaigns</Typography>
    </Link>,
    <Typography key="3" color="primary" fontWeight="600">
      Payments
    </Typography>,
  ];

  useEffect(() => {
    loadData();
  }, []);

  const markAsUpdated = (itemId) => {
    setUpdatedItems(prev => new Set([...prev, itemId]));
    setTimeout(() => {
      setUpdatedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  const isRecentlyUpdated = (itemId) => updatedItems.has(itemId);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const appsResponse = await campaignAPI.getBrandApplications();
      const appsData = Array.isArray(appsResponse) ? appsResponse : 
                     appsResponse?.data || appsResponse?.applications || [];
      
      const filteredApps = appsData.filter(app => 
        (app.status === 'media_submitted' || app.submitted_media?.length > 0) && 
        app.status !== 'completed'
      );
      
      setApplications(filteredApps);

      try {
        const paymentsResponse = await paymentAPI.getPaymentHistory();
        let paymentsData = [];
        
        if (paymentsResponse?.success) {
          paymentsData = paymentsResponse.payments || [];
        } else if (Array.isArray(paymentsResponse)) {
          paymentsData = paymentsResponse;
        } else if (paymentsResponse?.data) {
          paymentsData = paymentsResponse.data;
        }
        
        console.log('Payment history loaded:', paymentsData);
        setPaymentHistory(paymentsData);
      } catch (paymentError) {
        console.error('Error loading payment history:', paymentError);
        setPaymentHistory([]);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setApplications([]);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaFiles = async (application) => {
    if (!application) return;
    
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
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };

  const handleOpenPaymentDialog = async (application) => {
    setSelectedApplication(application);
    setPaymentDialogOpen(true);
    setPaymentStep(0);
    setPaymentDetails(null);
    setError('');
    await loadMediaFiles(application);
  };

  const handleClosePaymentDialog = () => {
    if (!processing) {
      setPaymentDialogOpen(false);
      setSelectedApplication(null);
      setPaymentStep(0);
      setPaymentDetails(null);
      setMediaFiles([]);
      setError('');
    }
  };

  const handleOpenMediaDialog = async (application) => {
    setSelectedApplication(application);
    await loadMediaFiles(application);
    setMediaDialogOpen(true);
  };

  const handleViewProfile = (profileData) => {
    setSelectedProfile(profileData);
    setProfileDialogOpen(true);
  };

  const handleChat = (profileData) => {
    navigate(`/brand/collaborations?user=${profileData._id}&name=${encodeURIComponent(profileData.username)}`);
  };

  const handlePaymentMethodSelect = async () => {
    try {
      setProcessing(true);
      setError('');
      
      const orderData = {
        amount: selectedApplication.budget || selectedApplication.campaign_budget,
        currency: selectedApplication.currency || 'INR',
        campaign_id: selectedApplication.campaign_id,
        influencer_id: selectedApplication.influencer_id
      };

      console.log('Creating Razorpay order with data:', orderData);

      const response = await paymentAPI.createRazorpayOrder(orderData);
      console.log('Razorpay order response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment order');
      }

      if (!response.order_id) {
        throw new Error('Invalid order response: missing order ID');
      }

      const normalizedDetails = {
        order_id: response.order_id,
        amount: response.amount || (selectedApplication.budget || selectedApplication.campaign_budget),
        currency: response.currency || (selectedApplication.currency || 'INR'),
        razorpay_key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
        payment_id: response.payment_id
      };

      console.log('Normalized payment details:', normalizedDetails);
      setPaymentDetails(normalizedDetails);
      setPaymentStep(1);
      
    } catch (err) {
      console.error('Payment initialization error:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to initialize payment';
      setError(errorMessage);
      setPaymentStep(0);
    } finally {
      setProcessing(false);
    }
  };

  const processRazorpayPayment = () => {
    if (!paymentDetails) {
      setError('Payment details not loaded. Please try again.');
      return;
    }

    const orderId = paymentDetails.order_id;
    if (!orderId) {
      setError('Invalid payment order. Please try again.');
      return;
    }

    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setError('Payment gateway not configured. Please contact support.');
      return;
    }

    const amount = Math.round(paymentDetails.amount * 100);
    const currency = paymentDetails.currency || 'INR';

    console.log('Initializing Razorpay with:', { key: razorpayKey, amount, currency, orderId });

    const options = {
      key: razorpayKey,
      amount: amount,
      currency: currency,
      name: "Brio",
      description: `Payment for campaign: ${selectedApplication.title || selectedApplication.campaign_title}`,
      order_id: orderId,
      handler: async function (response) {
        console.log('Razorpay payment response:', response);
        
        if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
          setError('Invalid payment response from gateway');
          setPaymentStep(1);
          return;
        }
        
        await verifyRazorpayPayment(response);
      },
      prefill: {
        name: localStorage.getItem('userName') || 'Brand User',
        email: localStorage.getItem('userEmail') || '',
      },
      theme: {
        color: "#3399cc"
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setPaymentStep(0);
          setError('Payment cancelled by user');
        }
      }
    };

    try {
      if (typeof window.Razorpay === 'undefined') {
        setError('Payment gateway not loaded. Please refresh the page.');
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setPaymentStep(1);
      });
      
      rzp.open();
    } catch (rzpError) {
      console.error('Razorpay initialization error:', rzpError);
      setError('Failed to initialize payment gateway. Please try again.');
    }
  };

  const verifyRazorpayPayment = async (paymentResponse) => {
    try {
      setProcessing(true);
      setPaymentStep(2);
      setError('');

      console.log('Verifying payment:', paymentResponse);

      const verifyData = {
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_signature: paymentResponse.razorpay_signature
      };

      const verificationResponse = await paymentAPI.verifyRazorpayPayment(verifyData);
      console.log('Payment verification response:', verificationResponse);
      
      if (!verificationResponse.success) {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }
      
      setPaymentStep(3);
      setSuccess('Payment completed successfully!');
      markAsUpdated(`${selectedApplication.campaign_id}-${selectedApplication.influencer_id}`);
      
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (err) {
      console.error('Payment verification error:', err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Payment verification failed';
      setError(errorMessage);
      setPaymentStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount, currencyCode = currency) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getMediaFileCount = (application) => {
    return application.submitted_media?.length || mediaFiles.length || 0;
  };

  const stats = {
    pendingPayments: applications.length,
    totalPayments: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    totalAmount: paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      {/* Currency Converter Header Section */}
<Box sx={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
  p: 4,
  borderRadius: '16px',
  color: 'white',
  mb: 4,
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Decorative elements */}
  <Box sx={{
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  }} />
  <Box sx={{
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
  }} />
  
  <Box sx={{ position: 'relative', zIndex: 1 }}>
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
      <Box>
        <Typography variant="h3" component="h1" fontWeight="800" gutterBottom>
          Payment Management
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px' }}>
          Process payments for completed influencer campaigns. Real-time status updates with currency conversion.
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<Refresh />}
        onClick={loadData}
        disabled={processing}
        sx={{ 
          borderRadius: '25px', 
          px: 3, 
          fontWeight: 600,
          background: 'rgba(255, 255, 255, 0.2)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        Refresh
      </Button>
    </Box>

    {/* Currency Converter Section */}
    <Box sx={{ 
      mt: 3, 
      p: 3, 
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Currency Converter
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            All amounts will be displayed in your selected currency
          </Typography>
        </Box>
        
        {/* Currency Selector */}
        <Box sx={{ minWidth: 200 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Display Currency
            </InputLabel>
            <Select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              label="Display Currency"
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
                    color: 'white',
                  }
                }
              }}
            >
              {POPULAR_CURRENCIES.map((currencyCode) => (
                <MenuItem key={currencyCode} value={currencyCode}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="600">
                      {CURRENCY_SYMBOLS[currencyCode] || currencyCode}
                    </Typography>
                    <Typography variant="body2">
                      {currencyCode}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, ml: 'auto' }}>
                      {CURRENCY_NAMES[currencyCode]}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Converted Total Display */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Total Processed
          </Typography>
          <Typography variant="h4" fontWeight="800">
            {formatCurrency(stats.totalAmount, currency)}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Across {paymentHistory.length} payments
          </Typography>
        </Box>
      </Box>

      {/* Currency Stats Grid */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Pending Payments
            </Typography>
            <Typography variant="h5" fontWeight="700">
              {applications.length}
            </Typography>
            {applications.length > 0 && (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {formatCurrency(
                  applications.reduce((sum, app) => sum + (app.budget || app.campaign_budget || 0), 0),
                  currency
                )} total
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Completed Payments
            </Typography>
            <Typography variant="h5" fontWeight="700">
              {stats.completedPayments}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {formatCurrency(stats.totalAmount, currency)} processed
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Exchange Rate
            </Typography>
            <Typography variant="h5" fontWeight="700">
              1 GBP = {rates && rates[currency] ? rates[currency].toFixed(2) : '1.00'} {currency}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Live rates from CurrencyContext
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ 
            p: 2, 
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Currency
            </Typography>
            <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {CURRENCY_SYMBOLS[currency] || currency} {currency}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {CURRENCY_NAMES[currency] || 'Selected Currency'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  </Box>
</Box>

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

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.9rem',
                textTransform: 'none',
                minHeight: '60px'
              }
            }}
          >
            <Tab 
              icon={<AccountBalanceWallet />} 
              label={
                <Badge badgeContent={applications.length} color="primary" showZero>
                  Pending Payments
                </Badge>
              } 
              value="pending" 
            />
            <Tab 
              icon={<Receipt />} 
              label={
                <Badge badgeContent={paymentHistory.length} color="primary" showZero>
                  Payment History
                </Badge>
              } 
              value="history" 
            />
          </Tabs>
        </Box>

        <TabPanel value="pending" sx={{ p: 0 }}>
          <Grid container spacing={4}>
            {/* Pending Payments Section */}
            <Grid item xs={12} lg={8}>
              <PaymentCard updated={isRecentlyUpdated('pending-section')}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: '700', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceWallet color="primary" />
                    Ready for Payment
                    <Chip 
                      label={applications.length} 
                      color="primary" 
                      size="small"
                    />
                  </Typography>

                  {applications.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <CheckCircle sx={{ fontSize: 80, color: 'success', mb: 2 }} />
                      <Typography variant="h5" color="success" gutterBottom>
                        All Caught Up! 🎉
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No pending payments. All influencer campaigns have been processed.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                      {applications.map((application) => {
                        const itemId = `${application.campaign_id}-${application.influencer_id}`;
                        const isUpdated = isRecentlyUpdated(itemId);
                        
                        return (
                          <Grid item key={itemId} sx={{ display: "flex", justifyContent: "center" }}>
                            <Zoom in={true} style={{ transitionDelay: isUpdated ? '0ms' : '100ms' }}>
                              <ProfessionalCard updated={isUpdated}>
                                {/* Campaign Image */}
                                <CampaignImage
                                  fileId={application.campaign_image_id}
                                  alt={application.title}
                                  campaignData={application}
                                />
                                
                                <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                                  {/* Header with Influencer Info and Status */}
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box flex={1}>
                                      <UserInfo
                                        userId={application.influencer_id}
                                        profileType="influencer"
                                        showEmail={false}
                                        showStats={true}
                                        size={44}
                                        userName={application.influencer_name}
                                        onViewProfile={handleViewProfile}
                                        onChat={handleChat}
                                      />
                                    </Box>
                                    <StatusChip 
                                      label={application.status === 'media_submitted' ? 'Ready for Payment' : application.status} 
                                      status={application.status === 'media_submitted' ? 'media_submitted' : application.status}
                                      size="small"
                                    />
                                  </Box>

                                  {/* Campaign Details */}
                                  <Box mb={2}>
                                    <CampaignDetails campaign={application} />
                                  </Box>

                                  {/* Budget and Media Info */}
<Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
  <Box>
    <Box display="flex" alignItems="center" gap={0.5}>
      <AttachMoney sx={{ fontSize: 18, color: 'success' }} />
      <Typography variant="body1" fontWeight="700" color="success">
        {application.currency || 'USD'} {application.budget?.toLocaleString()}
      </Typography>
    </Box>
    {/* Show converted amount if different currency */}
    {application.currency !== currency && rates && rates[application.currency] && rates[currency] && (
      <Typography variant="caption" color="text.secondary">
        ≈ {formatCurrency(
          (application.budget / rates[application.currency]) * rates[currency],
          currency
        )}
      </Typography>
    )}
  </Box>
  
  {/* Media File Count */}
  <Box display="flex" alignItems="center" gap={0.5}>
    <Badge badgeContent={getMediaFileCount(application)} color="primary" overlap="circular">
      <ImageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
    </Badge>
    <Typography variant="caption" color="text.secondary">
      {getMediaFileCount(application)} files
    </Typography>
  </Box>
</Box>

                                  {/* Influencer Message */}
                                  {application.message && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        INFLUENCER MESSAGE:
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{
                                          p: 1,
                                          background: 'rgba(102, 126, 234, 0.05)',
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
                                        "{application.message}"
                                      </Typography>
                                    </Box>
                                  )}
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 1, width: '100%', flexDirection: 'column' }}>
                                    {/* Primary Actions Row */}
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                      <GradientButton
                                        size="small"
                                        startIcon={<Payment />}
                                        onClick={() => handleOpenPaymentDialog(application)}
                                        sx={{ 
                                          borderRadius: '8px', 
                                          fontSize: '0.75rem', 
                                          flex: 2,
                                          animation: isUpdated ? `${pulseAnimation} 1s ease infinite` : 'none'
                                        }}
                                      >
                                        Pay with Razorpay
                                      </GradientButton>

                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<ImageIcon />}
                                        onClick={() => handleOpenMediaDialog(application)}
                                        sx={{ borderRadius: '8px', fontSize: '0.75rem', flex: 1 }}
                                      >
                                        Media
                                      </Button>
                                    </Box>

                                    {/* Secondary Actions Row */}
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                      <ChatLaunch 
                                        userId={application.influencer_id}
                                        userName={application.influencer_name}
                                        size="small"
                                      />
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewProfile({
                                          _id: application.influencer_id,
                                          username: application.influencer_name,
                                          profile_type: 'influencer'
                                        })}
                                        sx={{ borderRadius: '8px', fontSize: '0.75rem', flex: 1 }}
                                      >
                                        Profile
                                      </Button>
                                    </Box>
                                  </Box>
                                </CardActions>
                              </ProfessionalCard>
                            </Zoom>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </CardContent>
              </PaymentCard>
            </Grid>

            {/* Real-time Status Sidebar */}
            <Grid item xs={12} lg={4}>
              <PaymentCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <TrendingUp color="primary" />
                    Payment Overview
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountBalanceWallet color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Pending Payments" 
                        secondary={`${stats.pendingPayments} campaigns waiting for payment`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Completed Payments" 
                        secondary={`${stats.completedPayments} successful transactions`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Receipt color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Processed" 
                        secondary={formatCurrency(stats.totalAmount)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ChatIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Chat Integration" 
                        secondary="Direct messaging with influencers"
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ p: 2, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600" color="info.dark" gutterBottom>
                      💡 Quick Tips
                    </Typography>
                    <Typography variant="caption" color="info.dark">
                      • Review media files before payment<br/>
                      • Use chat to clarify any requirements<br/>
                      • Payments are processed securely via Razorpay
                    </Typography>
                  </Box>
                </CardContent>
              </PaymentCard>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value="history" sx={{ p: 0 }}>
          <PaymentCard>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt />
                Payment History
                <Chip label={paymentHistory.length} size="small" />
              </Typography>

              {paymentHistory.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Payment History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your payment history will appear here after processing payments
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell><strong>Campaign</strong></TableCell>
                        <TableCell><strong>Influencer</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentHistory.map((payment, index) => {
                        const isNew = index === 0 && isRecentlyUpdated(`payment-${payment._id}`);
                        return (
                          <TableRow 
                            key={payment._id || payment.payment_id} 
                            hover
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              animation: isNew ? `${slideInUp} 0.5s ease` : 'none',
                              background: isNew ? 'rgba(76, 175, 80, 0.05)' : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {payment.campaign_title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <UserInfo
                                userId={payment.influencer_id}
                                profileType="influencer"
                                showEmail={false}
                                size={32}
                                userName={payment.influencer_name}
                                onViewProfile={handleViewProfile}
                                onChat={handleChat}
                              />
                            </TableCell>
                            <TableCell>
  <Box>
    <Typography fontWeight="700" color="primary">
      {formatCurrency(payment.amount, payment.currency)}
    </Typography>
    {/* Show converted amount */}
    {payment.currency !== currency && rates && rates[payment.currency] && rates[currency] && (
      <Typography variant="caption" color="text.secondary">
        ≈ {formatCurrency(
          (payment.amount / rates[payment.currency]) * rates[currency],
          currency
        )}
      </Typography>
    )}
  </Box>
</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(payment.created_at || payment.payment_date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip
                                label={payment.status}
                                status={payment.status}
                                size="small"
                                updated={isNew}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={0.5}>
                                <Tooltip title="View Details">
                                  <IconButton size="small">
                                    <Visibility sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download Receipt">
                                  <IconButton size="small">
                                    <Download sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </PaymentCard>
        </TabPanel>
      </TabContext>

      {/* Payment Processing Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment />
            Process Payment with Razorpay
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stepper activeStep={paymentStep} sx={{ mb: 4, mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {selectedApplication && (
            <Box>
              {/* Step 0: Payment Method Selection */}
              {paymentStep === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Payment Details
                  </Typography>
                  
                  <PaymentCard sx={{ mb: 3, p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Campaign
                        </Typography>
                        <Typography variant="h6" fontWeight="700" color="primary">
                          {selectedApplication.title || selectedApplication.campaign_title}
                        </Typography>
                        <CampaignDetails campaign={selectedApplication} expanded={false} />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Influencer
                        </Typography>
                        <UserInfo
                          userId={selectedApplication.influencer_id}
                          profileType="influencer"
                          showEmail={true}
                          showStats={true}
                          size={44}
                          userName={selectedApplication.influencer_name}
                          onViewProfile={handleViewProfile}
                          onChat={handleChat}
                        />
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <ChatLaunch 
                            userId={selectedApplication.influencer_id}
                            userName={selectedApplication.influencer_name}
                            size="small"
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewProfile({
                              _id: selectedApplication.influencer_id,
                              username: selectedApplication.influencer_name,
                              profile_type: 'influencer'
                            })}
                            sx={{ borderRadius: '8px' }}
                          >
                            Profile
                          </Button>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
  <Typography variant="subtitle2" color="text.secondary">
    Amount
  </Typography>
  <Box>
    <Typography variant="h4" fontWeight="800" color="primary">
      {formatCurrency(selectedApplication.budget || selectedApplication.campaign_budget, selectedApplication.currency)}
    </Typography>
    {/* Show converted amount */}
    {selectedApplication.currency !== currency && rates && rates[selectedApplication.currency] && rates[currency] && (
      <Typography variant="body2" color="text.secondary">
        ≈ {formatCurrency(
          ((selectedApplication.budget || selectedApplication.campaign_budget) / rates[selectedApplication.currency]) * rates[currency],
          currency
        )}
      </Typography>
    )}
  </Box>
</Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <StatusChip 
                          label="Ready for Payment" 
                          status="pending"
                        />
                      </Grid>
                    </Grid>
                  </PaymentCard>

                  <Alert severity="info" sx={{ borderRadius: '8px' }}>
                    <Typography variant="body2">
                      Click continue to proceed with secure Razorpay payment
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* Step 1: Confirm Details */}
              {paymentStep === 1 && paymentDetails && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Confirm Payment
                  </Typography>
                  
                  <PaymentCard sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Campaign</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedApplication.title}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Influencer</Typography>
                        <Typography variant="body1" fontWeight="600">{selectedApplication.influencer_name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Amount</Typography>
                        <Typography variant="h6" color="primary" fontWeight="700">
                          {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Method</Typography>
                        <Typography variant="body1" fontWeight="600">Razorpay</Typography>
                      </Grid>
                    </Grid>
                  </PaymentCard>

                  <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                    <Typography variant="body2">
                      You will be redirected to Razorpay's secure payment gateway to complete the transaction.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {/* Step 2: Processing */}
              {paymentStep === 2 && (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Processing Payment...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we process your payment
                  </Typography>
                </Box>
              )}

              {/* Step 3: Complete */}
              {paymentStep === 3 && (
                <Box textAlign="center" py={4}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success', mb: 2 }} />
                  <Typography variant="h4" gutterBottom color="success">
                    Payment Successful!
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Thank you for your payment
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Your payment of {formatCurrency(selectedApplication.budget || selectedApplication.campaign_budget, selectedApplication.currency)} has been processed successfully.
                  </Typography>
                  
                  <PaymentCard sx={{ mt: 3, p: 3, maxWidth: 400, mx: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Transaction Details
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2">
                        <strong>Campaign:</strong> {selectedApplication.title || selectedApplication.campaign_title}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Influencer:</strong> {selectedApplication.influencer_name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Amount:</strong> {formatCurrency(selectedApplication.budget || selectedApplication.campaign_budget, selectedApplication.currency)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> <StatusChip label="Completed" status="completed" size="small" />
                      </Typography>
                    </Box>
                  </PaymentCard>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      onClick={handleClosePaymentDialog}
                      sx={{ borderRadius: '12px', px: 4 }}
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/brand/campaigns')}
                      sx={{ 
                        borderRadius: '12px', 
                        px: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)'
                      }}
                    >
                      View Campaigns
                    </Button>
                    <ChatLaunch 
                      userId={selectedApplication.influencer_id}
                      userName={selectedApplication.influencer_name}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          {paymentStep === 0 && (
            <>
              <Button onClick={handleClosePaymentDialog} disabled={processing} sx={{ borderRadius: '8px' }}>
                Cancel
              </Button>
              <GradientButton
                onClick={handlePaymentMethodSelect}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
                sx={{ borderRadius: '8px' }}
              >
                {processing ? 'Processing...' : 'Continue to Payment'}
              </GradientButton>
            </>
          )}

          {paymentStep === 1 && (
            <>
              <Button onClick={() => setPaymentStep(0)} disabled={processing} sx={{ borderRadius: '8px' }}>
                Back
              </Button>
              <GradientButton
                onClick={processRazorpayPayment}
                disabled={processing}
                startIcon={<Payment />}
                sx={{ borderRadius: '8px' }}
              >
                Proceed to Pay
              </GradientButton>
            </>
          )}

          {paymentStep === 3 && (
            <GradientButton onClick={handleClosePaymentDialog} sx={{ borderRadius: '8px' }}>
              Done
            </GradientButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Media Files Dialog */}
      <MediaFilesDialog
        open={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        application={selectedApplication}
        mediaFiles={mediaFiles}
      />

      {/* Profile View Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        {selectedProfile && (
          <>
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #528aeaff 100%)',
              color: 'white',
              fontWeight: 700
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <Person />
                  <Typography variant="h6">
                    {selectedProfile.username}'s Profile
                  </Typography>
                </Box>
                <IconButton onClick={() => setProfileDialogOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box textAlign="center" mb={3}>
                <ProfileImage
                  userId={selectedProfile._id}
                  profileType={selectedProfile.profile_type}
                  alt={selectedProfile.username}
                  size={80}
                  userData={selectedProfile}
                />
                <Typography variant="h5" fontWeight="700" sx={{ mt: 2 }}>
                  {selectedProfile.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProfile.profile_type === 'influencer' ? 'Influencer' : 'Brand'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <ChatLaunch 
                  userId={selectedProfile._id}
                  userName={selectedProfile.username}
                />
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/profile/view/${selectedProfile.profile_type}/${selectedProfile._id}`)}
                  startIcon={<OpenInNew />}
                >
                  Full Profile
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            color: 'white',
            fontWeight: 600
          }}
          icon={<CheckCircle />}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BrandPayment;