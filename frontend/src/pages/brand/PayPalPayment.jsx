// PayPalPayment.jsx - Complete PayPal Payment Gateway Integration
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CardActions,
  Snackbar,
  Fade,
  Zoom,
  Slide,
  Rating,
  Tooltip,
   FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { TabContext, TabPanel } from "@mui/lab";
import {
  Payment,
  CheckCircle,
  Error as ErrorIcon,
  AccountBalanceWallet,
  Receipt,
  TrendingUp,
  Security,
  VerifiedUser,
  AssignmentTurnedIn,
  Close,
  Person,
  Image as ImageIcon,
  Refresh,
  Schedule,
  Visibility,
  Download,
  Description,
  ArrowBack,
  AutoAwesome,
  RocketLaunch,
  Celebration,
  Campaign,
  AttachMoney,
  CalendarToday,
  Category,
  Chat as ChatIcon,
  Email,
  Language,
  Instagram,
  YouTube,
  LinkedIn,
  Twitter,
  Facebook,
  Share,
  Link as LinkIcon,
  NavigateNext,
  Home,
  Work,
  Business,
  Group,
  Public,
  Phone,
  LocationOn,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  PlayArrow,
  Pause,
  Stop,
  Send,
  Favorite,
  Comment,
  Share as ShareIcon,
  MoreVert,
  ExpandMore,
  ExpandLess,
  OpenInNew,
  AccountBalance
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/system';
import { format, formatDistanceToNow } from 'date-fns';
import { AuthContext } from "../../context/AuthContext";
import { campaignAPI } from '../../services/api';
import paypalAPI from '../../services/paypalAPI';
import profileAPI from '../../services/profileAPI';

// At the top of PayPalPayment.jsx, add these imports
import { CurrencyContext } from "../../context/CurrencyContext";
// import CurrencyConverter from "../../components/CurrencyConverter"; // Adjust path as needed



// Currency symbols mapping
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

// Currency names
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

// Popular currencies for quick selection
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
  0% { box-shadow: 0 0 5px rgba(0, 102, 204, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 102, 204, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 102, 204, 0.5); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

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
  border: updated ? '2px solid #0066CC' : '1px solid rgba(0, 0, 0, 0.06)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  overflow: 'visible',
  animation: updated ? `${glowAnimation} 2s ease infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(0, 102, 204, 0.15)',
    borderColor: theme.palette.primary
  }
}));

const StatsCard = styled(Card)(({ theme, updated }) => ({
  background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
  color: 'white',
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 102, 204, 0.3)',
  transition: 'all 0.3s ease',
  animation: updated ? `${pulseAnimation} 0.6s ease` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 102, 204, 0.4)'
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
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'rejected' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  }),
  ...(status === 'created' && {
    background: 'linear-gradient(135deg, #0066CC, #0080FF)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #0066CC, #0080FF)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
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

const PayPalButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
  color: 'white',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(0, 102, 204, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0, 102, 204, 0.6)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(135deg, #0055AA 0%, #003377 100%)'
  }
}));

// =============================================
// 🖼️ PROFILE IMAGE COMPONENT (Reuse from Stripe)
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
          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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
      navigate(`/messages?user=${userId}`);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram sx={{ fontSize: 16 }} />;
      case 'youtube': return <YouTube sx={{ fontSize: 16 }} />;
      case 'linkedin': return <LinkedIn sx={{ fontSize: 16 }} />;
      case 'twitter': return <Twitter sx={{ fontSize: 16 }} />;
      case 'facebook': return <Facebook sx={{ fontSize: 16 }} />;
      case 'tiktok': return <Language sx={{ fontSize: 16 }} />;
      default: return <Public sx={{ fontSize: 16 }} />;
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
              background: 'rgba(0, 102, 204, 0.1)',
              '&:hover': { background: 'rgba(0, 102, 204, 0.2)' }
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
    <Box sx={{ animation: `${fadeIn} 0.3s ease` }}>
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
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
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
        <Box sx={{ mt: 2, animation: `${slideInUp} 0.3s ease` }}>
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
                    <Group sx={{ fontSize: 16 }} />
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
// 🖼️ ENHANCED CAMPAIGN IMAGE COMPONENT
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
            background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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
            minHeight: '600px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          } 
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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

      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        {selectedMedia && (
          <>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)', color: 'white' }}>
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
// 💳 PAYPAL PAYMENT FORM COMPONENT
// =============================================

const PayPalPaymentForm = ({ 
  orderData, 
  application, 
  onSuccess, 
  onError,
  onCancel 
}) => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePayPalRedirect = () => {
    if (orderData?.approval_url) {
      window.open(orderData.approval_url, '_blank');
    } else {
      setPaymentError('Payment URL not available. Please try again.');
    }
  };

  const handleManualCapture = async () => {
    setIsLoading(true);
    setPaymentError('');

    try {
      const captureData = {
        order_id: orderData.order_id,
        payer_id: 'manual_capture' // This would come from PayPal redirect in real scenario
      };

      const result = await paypalAPI.captureOrder(captureData);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        setPaymentError(result.error || 'Payment capture failed');
        onError?.(result.error);
      }
    } catch (err) {
      console.error('Payment capture error:', err);
      setPaymentError('Failed to capture payment. Please try again.');
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleChat = () => {
    navigate(`/brand/collaborations?user=${application.influencer_id}&name=${encodeURIComponent(application.influencer_name)}`);
  };

  const handleViewProfile = () => {
    navigate(`/profile/view/influencer/${application.influencer_id}`);
  };

  return (
    <Box>
      {paymentError && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: '12px' }}
          onClose={() => setPaymentError('')}
        >
          {paymentError}
        </Alert>
      )}
      
      {/* Campaign Summary */}
      <PaymentCard sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Receipt />
          Payment Summary
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Campaign
            </Typography>
            <Typography variant="h6" fontWeight="700" color="primary">
              {application?.title || application?.campaign_title || 'Loading...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {application?.category || 'General Category'}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <CampaignDetails campaign={application} expanded={false} />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Influencer
            </Typography>
            <UserInfo
              userId={application?.influencer_id}
              profileType="influencer"
              showEmail={true}
              showStats={true}
              size={44}
              userName={application?.influencer_name}
              onViewProfile={handleViewProfile}
              onChat={handleChat}
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <ChatLaunch 
                userId={application.influencer_id}
                userName={application.influencer_name}
                size="small"
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={handleViewProfile}
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
            <Typography variant="h4" fontWeight="800" color="primary">
              {formatCurrency(application?.budget || application?.campaign_budget, application?.currency)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <StatusChip 
              label={orderData?.status === 'CREATED' ? 'Ready for Payment' : orderData?.status || 'Pending'} 
              status={orderData?.status === 'CREATED' ? 'created' : 'pending'}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {application?.category || 'General'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Applied: {application?.applied_at ? format(new Date(application.applied_at), 'MMM dd, yyyy') : 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <ImageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Media Files: {application?.submitted_media?.length || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {application?.message && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Message from Influencer:
                </Typography>
                <Typography variant="body2">
                  "{application.message}"
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </PaymentCard>
      
      {/* PayPal Payment Options */}
      <PaymentCard sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance />
            PayPal Payment
          </Typography>
          
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Choose your preferred payment method:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 102, 204, 0.15)'
                    }
                  }}
                  onClick={handlePayPalRedirect}
                >
                  <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    PayPal Checkout
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Secure payment through PayPal. You'll be redirected to complete the payment.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    startIcon={<OpenInNew />}
                  >
                    Pay with PayPal
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    cursor: isLoading ? 'default' : 'pointer',
                    border: '2px solid',
                    borderColor: 'secondary.main',
                    background: 'linear-gradient(135deg, #fff8f5 0%, #fff0f0 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': !isLoading ? {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)'
                    } : {}
                  }}
                  onClick={!isLoading ? handleManualCapture : undefined}
                >
                  <Payment sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Manual Capture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    For testing purposes. Capture payment without PayPal redirect.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    sx={{ mt: 2 }}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
                  >
                    {isLoading ? 'Processing...' : 'Capture Payment'}
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </PaymentCard>

      {/* Security Notice */}
      <Alert 
        severity="info" 
        sx={{ mb: 2, borderRadius: '12px' }}
        icon={<Security />}
      >
        <Typography variant="body2">
          <strong>Secure Payment:</strong> Your payment is processed securely through PayPal. 
          We never store your financial information.
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={isLoading}
          startIcon={<Close />}
          sx={{ borderRadius: '12px', px: 4 }}
        >
          Cancel
        </Button>
        <PayPalButton
          onClick={handlePayPalRedirect}
          disabled={isLoading || !orderData?.approval_url}
          startIcon={<AccountBalance />}
          sx={{ px: 4 }}
        >
          {isLoading ? 'Processing...' : `Pay ${formatCurrency(application?.budget || application?.campaign_budget, application?.currency)}`}
        </PayPalButton>
      </Box>
    </Box>
  );
};

// =============================================
// 🔄 REAL-TIME STATUS MANAGER
// =============================================

const useRealTimeStatus = () => {
  const [applications, setApplications] = useState([]);
  const [updatedItems, setUpdatedItems] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(null);

  const markAsUpdated = (itemId) => {
    setUpdatedItems(prev => new Set([...prev, itemId]));
    setLastUpdate(Date.now());
    
    setTimeout(() => {
      setUpdatedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  const updateApplicationStatus = (campaignId, influencerId, newStatus) => {
    setApplications(prev => prev.map(app => {
      if (app.campaign_id === campaignId && app.influencer_id === influencerId) {
        const updatedApp = { ...app, status: newStatus };
        markAsUpdated(`${campaignId}-${influencerId}`);
        return updatedApp;
      }
      return app;
    }));
  };

  const removeApplication = (campaignId, influencerId) => {
    setApplications(prev => {
      const filtered = prev.filter(app => 
        !(app.campaign_id === campaignId && app.influencer_id === influencerId)
      );
      markAsUpdated(`${campaignId}-${influencerId}`);
      return filtered;
    });
  };

  const addToPaymentHistory = (newPayment) => {
    markAsUpdated(`payment-${newPayment._id}`);
  };

  return {
    applications,
    setApplications,
    updatedItems,
    lastUpdate,
    updateApplicationStatus,
    removeApplication,
    addToPaymentHistory,
    markAsUpdated
  };
};

// =============================================
// 💰 MAIN PAYPAL PAYMENT COMPONENT
// =============================================

const PayPalPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  
  // Real-time status management
  const {
    applications,
    setApplications,
    updatedItems,
    updateApplicationStatus,
    removeApplication,
    addToPaymentHistory,
    markAsUpdated
  } = useRealTimeStatus();

  const [activeStep, setActiveStep] = useState(0);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captureResult, setCaptureResult] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [completedPayment, setCompletedPayment] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Get URL parameters for direct navigation
  const urlParams = new URLSearchParams(location.search);
  const campaignId = urlParams.get('campaign');
  const influencerId = urlParams.get('influencer');

  // Payment steps
  const steps = ['Create Order', 'Payment Processing', 'Capture Payment', 'Complete'];

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
      PayPal Payments
    </Typography>,
  ];

  // Polling for real-time updates
  useEffect(() => {
    if (activeTab === 'pending' && applications.length > 0) {
      const interval = setInterval(() => {
        checkForUpdates();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeTab, applications.length]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Auto-open payment dialog when URL parameters are present
  useEffect(() => {
    if (campaignId && influencerId && applications.length > 0 && !paymentDialogOpen) {
      const targetApp = applications.find(app => 
        app.campaign_id === campaignId && app.influencer_id === influencerId
      );
      if (targetApp) {
        handleOpenPaymentDialog(targetApp);
      }
    }
  }, [applications, campaignId, influencerId, paymentDialogOpen]);

  const checkForUpdates = async () => {
    try {
      const appsResponse = await campaignAPI.getBrandApplications();
      const appsData = Array.isArray(appsResponse) ? appsResponse : 
                     appsResponse?.data || appsResponse?.applications || [];
      
      // Check for status changes
      appsData.forEach(newApp => {
        const existingApp = applications.find(app => 
          app.campaign_id === newApp.campaign_id && 
          app.influencer_id === newApp.influencer_id
        );
        
        if (existingApp && existingApp.status !== newApp.status) {
          console.log(`🔄 Status changed: ${existingApp.status} → ${newApp.status}`);
          updateApplicationStatus(
            newApp.campaign_id, 
            newApp.influencer_id, 
            newApp.status
          );
        }
      });

    } catch (err) {
      console.error('Error checking for updates:', err);
    }
  };

  const loadData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError('');
      
      // Load applications with media submitted using campaignAPI
      const appsResponse = await campaignAPI.getBrandApplications();
      console.log('🔄 Loading applications:', appsResponse);
      
      const appsData = Array.isArray(appsResponse) ? appsResponse : 
                     appsResponse?.data || appsResponse?.applications || [];
      
      // Filter applications with media submitted and not completed
      const filteredApps = appsData.filter(app => 
        (app.status === 'media_submitted' || app.submitted_media?.length > 0) && 
        app.status !== 'completed'
      );
      
      console.log('✅ Filtered applications:', filteredApps);
      setApplications(filteredApps);

      // Load payment history using PayPal API
      try {
        const paymentsResponse = await paypalAPI.getPaymentHistory();
        console.log('💰 PayPal payments response:', paymentsResponse);
        const paymentsData = paymentsResponse?.payments || paymentsResponse?.data || [];
        
        setPaymentHistory(paymentsData);
      } catch (paymentError) {
        console.error('Error loading payment history:', paymentError);
        setPaymentHistory([]);
      }

    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError('Failed to load data. Please try again.');
      setApplications([]);
      setPaymentHistory([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const createPayPalOrder = async (application) => {
    try {
      setIsLoading(true);
      setError('');

      // Create PayPal order using the service
      const orderData = {
        campaign_id: application.campaign_id,
        influencer_id: application.influencer_id,
        amount: application.budget || application.campaign_budget,
        currency: application.currency || 'USD',
        description: `Payment for campaign: ${application.title || application.campaign_title}`
      };

      console.log('💳 Creating PayPal order with data:', orderData);

      const response = await paypalAPI.createOrder(orderData);
      console.log('✅ PayPal order response:', response);
      
      if (!response.order_id) {
        throw new Error('No order ID received from server');
      }

      setOrderData(response);
      setActiveStep(1);
      
    } catch (err) {
      console.error('❌ PayPal order creation failed:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create PayPal order';
      setError(errorMessage);
      setActiveStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentDialog = async (application) => {
    setSelectedApplication(application);
    setPaymentDialogOpen(true);
    setActiveStep(0);
    setError('');
    await loadMediaFiles(application);
    await createPayPalOrder(application);
  };

  const handleClosePaymentDialog = () => {
    if (!isLoading) {
      setPaymentDialogOpen(false);
      setSelectedApplication(null);
      setActiveStep(0);
      setOrderData(null);
      setCaptureResult(null);
      setMediaFiles([]);
      setError('');
      
      // Clear URL parameters
      navigate('/brand/paypalpay', { replace: true });
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

  const handlePaymentSuccess = async (captureData) => {
    console.log('🎉 PayPal payment success:', captureData);
    
    try {
      setCaptureResult(captureData);
      setActiveStep(3);
      setSuccess('Payment completed successfully!');
      setShowSuccessToast(true);
      
      // Immediately update the UI
      if (selectedApplication) {
        // Remove from pending applications
        removeApplication(selectedApplication.campaign_id, selectedApplication.influencer_id);
        
        // Add to payment history
        const newPayment = {
          _id: `payment-${Date.now()}`,
          campaign_title: selectedApplication.title || selectedApplication.campaign_title,
          influencer_name: selectedApplication.influencer_name,
          amount: selectedApplication.budget || selectedApplication.campaign_budget,
          currency: selectedApplication.currency || 'USD',
          status: 'completed',
          created_at: new Date().toISOString(),
          transaction_id: captureData.transaction_id,
          order_id: captureData.order_id,
          payment_gateway: 'paypal'
        };
        
        setPaymentHistory(prev => [newPayment, ...prev]);
        setCompletedPayment(newPayment);
        addToPaymentHistory(newPayment);
      }

      // Refresh data to get the latest state from server
      setTimeout(() => {
        loadData();
      }, 2000);

    } catch (error) {
      console.error('❌ Payment success handling failed:', error);
      setError('Payment processed but failed to update UI. Please contact support.');
      setActiveStep(1);
    }
  };

  const handlePaymentError = (errorMessage) => {
    console.error('❌ Payment error:', errorMessage);
    setError(errorMessage);
    setActiveStep(1);
  };

  const handleCancel = () => {
    handleClosePaymentDialog();
  };

  const formatCurrency = (amount, currencyCode = currency) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  

  const getMediaFileCount = (application) => {
    return application.submitted_media?.length || mediaFiles.length || 0;
  };

  // Enhanced stats calculation with real-time updates
  const stats = {
    pendingPayments: applications.length,
    totalPayments: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    totalAmount: paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  };

  // Check if an item was recently updated
  const isRecentlyUpdated = (itemId) => updatedItems.has(itemId);

  if (isLoading && !paymentDialogOpen) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading PayPal payment dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    {/* Success Toast */}
    <Snackbar
      open={showSuccessToast}
      autoHideDuration={6000}
      onClose={() => setShowSuccessToast(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
    >
      {/* ... existing code ... */}
    </Snackbar>

    {/* Currency Converter Header */}
    <Box sx={{ 
      background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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
              PayPal Payment Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px' }}>
              Process payments securely through PayPal for completed influencer campaigns
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => loadData(true)}
            disabled={isRefreshing}
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
            {isRefreshing ? <CircularProgress size={20} /> : 'Refresh'}
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
            
            {/* Custom Material-UI Currency Selector */}
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Public style={{ marginRight: 8, fontSize: 14 }} />
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
                        background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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

          {/* Currency Stats */}
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

    {/* Rest of your existing code... */}
    {error && (
      <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
        {error}
      </Alert>
    )}

      {success && !showSuccessToast && (
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
            {/* Pending Payments Section with Real-time Updates */}
            <Grid item xs={12} lg={8}>
              <PaymentCard updated={isRecentlyUpdated('pending-section')}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: '700', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceWallet color="primary" />
                    Ready for PayPal Payment
                    <Chip 
                      label={applications.length} 
                      color="primary" 
                      size="small"
                      sx={{ animation: applications.length === 0 ? `${pulseAnimation} 2s ease infinite` : 'none' }}
                    />
                  </Typography>

                  {applications.length === 0 ? (
                    <Box textAlign="center" py={6}>
                      <AutoAwesome sx={{ fontSize: 80, color: 'success', mb: 2 }} />
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
                              <ProfessionalCard 
                                updated={isUpdated}
                              >
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
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <AttachMoney sx={{ fontSize: 18, color: 'success' }} />
                                      <Typography variant="body1" fontWeight="700" color="success">
                                        {application.currency || 'USD'} {application.budget?.toLocaleString()}
                                      </Typography>
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
                                          background: 'rgba(0, 102, 204, 0.05)',
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
                                      {/* PayPal Button */}
                                      <PayPalButton
                                        size="small"
                                        startIcon={<AccountBalance />}
                                        onClick={() => handleOpenPaymentDialog(application)}
                                        sx={{ 
                                          borderRadius: '8px', 
                                          fontSize: '0.75rem', 
                                          flex: 2,
                                          animation: isUpdated ? `${pulseAnimation} 1s ease infinite` : 'none'
                                        }}
                                      >
                                        Pay with PayPal
                                      </PayPalButton>

                                      {/* Media Button */}
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
                    <RocketLaunch color="primary" />
                    PayPal Real-time Updates
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountBalance color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="PayPal Secure" 
                        secondary="Industry-leading security and buyer protection"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AutoAwesome color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Live Status" 
                        secondary="Automatic status updates every 5 seconds"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Instant Completion" 
                        secondary="Payments disappear immediately after completion"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Security color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Buyer Protection" 
                        secondary="Full PayPal buyer protection on all payments"
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ p: 2, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="600" color="info.dark" gutterBottom>
                      🔄 PayPal Live Updates Active
                    </Typography>
                    <Typography variant="caption" color="info.dark">
                      The system automatically checks for status changes and updates the interface in real-time.
                    </Typography>
                  </Box>

                  {/* Quick Stats */}
                  <Box sx={{ mt: 3, p: 2, background: 'linear-gradient(135deg, #f5f7ff, #f0f4ff)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                      Quick Stats
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Active Campaigns:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {applications.length}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Total Processed:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(stats.totalAmount)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        PayPal Fees:
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatCurrency(stats.totalAmount * 0.029 + 0.3)}*
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      *Estimated PayPal processing fees (2.9% + $0.30)
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
                PayPal Payment History
                <Chip label={paymentHistory.length} size="small" />
              </Typography>

              {paymentHistory.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <TrendingUp sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Payment History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your PayPal payment history will appear here after processing payments
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
                        <TableCell><strong>Order ID</strong></TableCell>
                        <TableCell><strong>Gateway</strong></TableCell>
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
                              background: isNew ? 'rgba(0, 102, 204, 0.05)' : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {payment.campaign_title || 'Unknown Campaign'}
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
                              <Typography fontWeight="700" color="primary">
                                {formatCurrency(payment.amount, payment.currency)}
                              </Typography>
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
                              <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                                {payment.order_id || payment.transaction_id || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={payment.payment_gateway || 'PayPal'} 
                                size="small"
                                color="primary"
                                variant="outlined"
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

      {/* PayPal Payment Processing Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance />
            Process Payment with PayPal
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4, p: 3, pb: 0 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ m: 3, mb: 0 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {selectedApplication && (
            <Box sx={{ p: 3 }}>
              {/* Step 0: Creating Order */}
              {activeStep === 0 && (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Creating PayPal Order...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we set up your payment with PayPal
                  </Typography>
                </Box>
              )}

              {/* Step 1: Payment Processing */}
              {activeStep === 1 && orderData && (
                <PayPalPaymentForm
                  orderData={orderData}
                  application={selectedApplication}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handleCancel}
                />
              )}

              {/* Step 2: Capture Processing */}
              {activeStep === 2 && (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Capturing Payment...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we capture your PayPal payment
                  </Typography>
                </Box>
              )}

              {/* Step 3: Complete */}
              {activeStep === 3 && captureResult && (
                <Box textAlign="center" py={4}>
                  <Box sx={{ animation: `${pulseAnimation} 1s ease infinite` }}>
                    <CheckCircle sx={{ fontSize: 80, mb: 2, color: 'success' }} />
                  </Box>
                  <Typography variant="h4" gutterBottom color="success">
                    PayPal Payment Successful!
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Thank you for your payment
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Your payment of {formatCurrency(selectedApplication.budget || selectedApplication.campaign_budget, selectedApplication.currency)} has been processed successfully through PayPal.
                  </Typography>
                  
                  <PaymentCard sx={{ mt: 3, p: 3, maxWidth: 400, mx: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      PayPal Transaction Details
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2">
                        <strong>Transaction ID:</strong> {captureResult.transaction_id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Order ID:</strong> {captureResult.order_id}
                      </Typography>
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
                      <Typography variant="body2">
                        <strong>Payment Gateway:</strong> PayPal
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
                        background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)'
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
              background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
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
    </Container>
  );
};

export default PayPalPayment;