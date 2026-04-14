import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency as globalFormatCurrency, formatCompactNumber } from '../../utils/formatters';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Slider,
  Container,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Fab,
  Zoom,
  Fade,
  useMediaQuery,
  useTheme,
  Collapse,
  AppBar,
  Toolbar,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Drawer, List, ListItem, ListItemIcon
} from '@mui/material';
import Business from "@mui/icons-material/Business";

import People from "@mui/icons-material/People";
import { FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedin,
  FaFacebook,
  FaLink
} from "react-icons/fa";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";


// import Videocam from '@mui/icons-material/Videocam';
// import PlayArrow from '@mui/icons-material/PlayArrow';
import AccessTime from '@mui/icons-material/AccessTime';
import PendingActions from "@mui/icons-material/PendingActions";
import Breadcrumbs from "@mui/material/Breadcrumbs";

// import ArrowBack from '@mui/icons-material/ArrowBack';

import { Sliders, X } from "lucide-react";
import {
  Campaign,
  AttachMoney,
  Category,
  Event,
  Send,
  Refresh,
  Visibility,
  TrendingUp,
  Search,
  FilterList,
  Clear,
  Chat,
  RemoveRedEye,
  Image as ImageIcon,
  Menu,
  Close,
  AttachFile,
  Delete,
  AccountCircle,
  Work,
  Star,
  Description,
  CheckCircle,
  CardMedia,
  PlayArrow,
  Videocam,
  ArrowBack,
  CalendarToday,
  Share,
  Bookmark,
  BookmarkBorder,
  Favorite,
  FavoriteBorder,
  DoneAll
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';
import { collaborationAPI } from "../../services/api";
import profileAPI from "../../services/profileAPI";
import { styled } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import InfluencerApplications from './InfluencerApplications';
import InfluencerContracts from './InfluencerContracts';
import AddBankAccountDialog from "../../components/AddBankAccountDialog";
import { accountAPI } from "../../services/api";


// =============================================
// STYLED COMPONENTS
// =============================================

const PremiumCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '16px',
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let color;
  switch (status?.toLowerCase()) {
    case 'active': color = theme.palette.success.main; break;
    case 'draft': color = theme.palette.grey[500]; break;
    case 'completed': color = theme.palette.primary.main; break;
    case 'paused': color = theme.palette.warning.main; break;
    default: color = theme.palette.grey[500];
  }
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 600,
    fontSize: '0.7rem',
    height: '22px',
    minWidth: '70px',
  };
});

const ApplicationStatusChip = styled(Chip)(({ status, theme }) => {
  let color;
  switch (status?.toLowerCase()) {
    case 'approved': color = theme.palette.success.main; break;
    case 'pending': color = theme.palette.warning.main; break;
    case 'rejected': color = theme.palette.error.main; break;
    case 'contracted': color = theme.palette.secondary.main; break;
    case 'media_submitted': color = theme.palette.info.main; break;
    case 'completed': color = theme.palette.primary.main; break;
    default: color = theme.palette.grey[500];
  }
  return {
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    fontWeight: 600,
    fontSize: '0.7rem',
    height: '22px',
  };
});

const GradientButton = styled(Button)(({ theme }) => ({
  background: '#2563eb',
  color: 'white',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  minWidth: 'auto',
  flex: 1,
  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#6a94f0',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)',
  },
}));

const ContractButton = styled(Button)(({ theme }) => ({
  background: '#2563eb',
  color: 'white',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
  '&:hover': {
    background: '#145aef',
  },
}));

const MediaButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF9800 0%, #F57C00 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #F57C00 0%, #EF6C00 100%)',
  },
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4CAF50 0%, #2E7D32 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.875rem',
  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #388E3C 0%, #1B5E20 100%)',
  },
}));

const StatRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
    fontSize: '16px',
    flexShrink: 0,
    minWidth: '20px',
  },
}));

const ViewCountBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(25, 118, 210, 0.1)',
  color: theme.palette.primary.main,
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '0.7rem',
  fontWeight: 600,
  marginLeft: 'auto',
}));

// Responsive Filter Sidebar
const FilterSidebar = styled(Box)(({ theme, open }) => ({
  width: open ? '320px' : '0',
  minWidth: open ? '320px' : '0',
  flexShrink: 0,
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  [theme.breakpoints.down('lg')]: {
    position: 'sticky',
    top: 64,

    height: '100vh',
    zIndex: 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: open ? '4px 0 20px rgba(0, 0, 0, 0.1)' : 'none',
  },
}));

// Main Content Area
const MainContent = styled(Box)(({ theme, sidebarOpen }) => ({
  flexGrow: 1,
  minHeight: 'calc(100vh - 64px)',
  transition: 'all 0.3s ease-in-out',
  marginLeft: sidebarOpen ? '0' : '0',
  [theme.breakpoints.up('lg')]: {
    marginLeft: sidebarOpen ? '0' : '0',
    width: sidebarOpen ? 'calc(100% - 320px)' : '100%',
  },
}));

// Campaign Grid Container
const CampaignGrid = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: theme.spacing(3),
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
  [theme.breakpoints.between('sm', 'md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },
}));

// =============================================
// REUSABLE COMPONENTS
// =============================================

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
          fontWeight: 600,
          cursor: onClick ? 'pointer' : 'default'
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
            zIndex: 100,
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
          cursor: onClick ? 'pointer' : 'default'
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
const UserInfo = ({ userId, profileType, showEmail = true, size = 32, showRating = false }) => {
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
    if (!userData) return 'Brio User';

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

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
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
        {getUsername() && (
          <Typography variant="caption" color="text.secondary" display="block">
            {getUsername()}
          </Typography>
        )}
        {showEmail && userData?.email && (
          <Typography variant="caption" color="text.secondary" display="block">
            {userData.email}
          </Typography>
        )}
        {showRating && getRating() && (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Star sx={{ fontSize: 14, color: 'gold' }} />
            <Typography variant="caption" color="text.secondary">
              {getRating().toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Campaign Image Component
const CampaignImage = ({ fileId, alt, onClick, height = 200 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getImageUrl = () => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:') || fileId.startsWith('blob:')) {
      return fileId;
    }
    if (fileId.length === 24 && /^[0-9a-fA-F]{24}$/.test(fileId)) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl || error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: height,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          aspectRatio: '1 / 1',
          flexShrink: 0
        }}
        onClick={onClick}
      >
        <ImageIcon sx={{ fontSize: 48, color: 'white', opacity: 0.7 }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: height,
      aspectRatio: '1 / 1',
      flexShrink: 0
    }}>
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
            background: 'rgba(255, 255, 255, 0.8)',
            zIndex: 100
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: onClick ? 'pointer' : 'default',
          aspectRatio: '1 / 1'
        }}
        onClick={onClick}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </Box>
  );
};

// Quick Message Dialog Component

// Professional Campaign Details Dialog Component with Enhanced Profile Section
const CampaignDetailDialog = ({ open, onClose, campaign, onApply, openBankDialog, setOpenBankDialog }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('image');
  const [isBookmarked, setIsBookmarked] = useState(campaign?.user_bookmarked || false);
  const [isLiked, setIsLiked] = useState(campaign?.user_liked || false);
  const [likesCount, setLikesCount] = useState(campaign?.likes_count || 0);
  const [brandProfile, setBrandProfile] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const navigate = useNavigate();

  const [applying, setApplying] = useState(false);


  // Safe count extractor (supports numbers, arrays, undefined)
  const getSafeCount = (value) => {
    if (value === undefined || value === null) return 0;
    if (Array.isArray(value)) return value.length;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Fetch complete brand profile data with follow counts
  useEffect(() => {
    const fetchBrandProfile = async () => {
      if (!campaign?.brand_id && !campaign?.brand?._id) return;

      setBrandLoading(true);
      try {
        const brandId = campaign.brand_id || campaign.brand?._id;

        // First try to fetch basic profile
        const basicResponse = await profileAPI.getProfileById(brandId);
        const basicProfile = basicResponse.profile || basicResponse;

        // Then try to fetch follow counts separately
        let followersCount = 0;
        let followingCount = 0;

        try {
          const followersData = await profileAPI.getFollowers(brandId);
          const followingData = await profileAPI.getFollowing(brandId);
          followersCount = getSafeCount(followersData);
          followingCount = getSafeCount(followingData);
        } catch (followError) {
          console.warn('Could not fetch follow counts:', followError);
          // Use fallback counts from basic profile if available
          followersCount = getSafeCount(basicProfile.followers_count || basicProfile.total_followers || basicProfile.followers);
          followingCount = getSafeCount(basicProfile.following_count || basicProfile.total_following || basicProfile.following);
        }

        // Combine all data
        const enhancedProfile = {
          ...basicProfile,
          followers_count: followersCount,
          following_count: followingCount
        };

        setBrandProfile(enhancedProfile);

      } catch (error) {
        console.error('Error fetching brand profile:', error);
        setBrandProfile(null);
      } finally {
        setBrandLoading(false);
      }
    };

    if (open && campaign) {
      fetchBrandProfile();
    }
  }, [campaign, open]);

  // Helper functions
  const getImageUrl = (fileId) => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:')) {
      return fileId;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${fileId}`;
  };

  const getProfileImageUrl = (fileId) => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:')) {
      return fileId;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/profiles/image/${fileId}`;
  };

  const getVideoUrl = (fileId) => {
    if (!fileId) return null;
    if (fileId.startsWith('http') || fileId.startsWith('data:')) {
      return fileId;
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/video/${fileId}`;
  };

  const handleMediaClick = (mediaUrl, type) => {
    setSelectedMedia({ url: mediaUrl, type });
    setMediaModalOpen(true);
  };

  //   const handleApplyClick = async () => {
  //   if (applying) return;

  //   setApplying(true);

  //   try {
  //     const res = await accountAPI.getBankAccountStatus();

  //     // 🔒 BANK REQUIRED → OPEN DIALOG (NO ERROR)
  //     if (!res?.data?.has_accounts) {
  //       onClose(); // close campaign dialog first

  //       setTimeout(() => {
  //         setOpenBankDialog(true);
  //       }, 200);

  //       return; // ⛔ STOP HERE (IMPORTANT)
  //     }

  //     // ✅ BANK EXISTS → APPLY
  //     onClose();
  //     await onApply(campaign);

  //   } catch (err) {
  //     console.error("Apply check failed:", err);

  //     // ❌ ONLY show error if API itself failed
  //     alert("Something went wrong. Please try again.");
  //   } finally {
  //     setApplying(false);
  //   }
  // };

  const handleApplyClick = async () => {
    if (applying) return;

    setApplying(true);
    await onApply(); // This should trigger the parent's handleApply
    setApplying(false);
  };



  const formatNumber = (num) => {
    return formatCompactNumber(num);
  };

  const handleViewBrandProfile = (brandId, activeTab = 'overview') => {
    if (brandId) {
      navigate(`/influencer/profile/view/brand/${brandId}?tab=${activeTab}`);
    }
  };

  const handleDirectChat = () => {
    if (campaign && (campaign.brand_id || campaign.brand?._id)) {
      const params = new URLSearchParams({
        user: campaign.brand_id || campaign.brand?._id,
        campaign: campaign._id,
        title: campaign.title,
        budget: campaign.budget || '',
        currency: campaign.currency || 'USD'
      });
      navigate(`/influencer/collaborations?${params.toString()}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount, currencyCode = 'USD') => {
    return globalFormatCurrency(amount, currencyCode);
  };

  const getCampaignCurrency = () => {
    if (!campaign) return 'USD';
    return campaign.currency || campaign.brand?.currency || 'USD';
  };

  const handleShareCampaign = () => {
    if (!campaign) return;

    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getViewsCount = () => {
    if (!campaign) return 0;
    return campaign?.views ||
      campaign?.total_views ||
      campaign?.view_count ||
      campaign?.impressions ||
      0;
  };

  const formatViews = (views) => {
    if (!views || views === 0) return '0';

    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  const getApplicationCount = () => {
    if (!campaign) return 0;
    return campaign?.applications_count ||
      campaign?.application_count ||
      campaign?.applications?.length ||
      campaign?.total_applications ||
      0;
  };

  const formatApplicationCount = (count) => {
    if (!count || count === 0) return '0';

    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  const getCompetitionLevel = (applicationCount) => {
    if (applicationCount === 0) return { level: 'Low', color: 'success', text: 'Great opportunity!' };
    if (applicationCount <= 10) return { level: 'Medium', color: 'warning', text: 'Good chance' };
    if (applicationCount <= 50) return { level: 'High', color: 'error', text: 'Competitive' };
    return { level: 'Very High', color: 'error', text: 'Highly competitive' };
  };

  // Handle like/unlike
  const handleLikeToggle = async () => {
    try {
      const newLikeState = !isLiked;
      const response = await campaignAPI.toggleLike(campaign._id, newLikeState);

      setIsLiked(newLikeState);
      setLikesCount(response.likes_count);

      // Update the campaign in parent component if needed
      if (response.likes_count !== undefined) {
        campaign.likes_count = response.likes_count;
        campaign.user_liked = newLikeState;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle bookmark/unbookmark
  const handleBookmarkToggle = async () => {
    try {
      const newBookmarkState = !isBookmarked;
      await campaignAPI.toggleBookmark(campaign._id, newBookmarkState);

      setIsBookmarked(newBookmarkState);

      // Update the campaign in parent component if needed
      campaign.user_bookmarked = newBookmarkState;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Enhanced brand profile data extraction with proper follow counts
  const getEnhancedBrandProfile = () => {
    const brandId = campaign?.brand_id || campaign?.brand?._id;

    // Use fetched brand profile data if available
    if (brandProfile) {
      return {
        _id: brandId,
        company_name: brandProfile.company_name || campaign.brand_name || campaign.brand?.company_name || 'Unknown Brand',
        bio: brandProfile.bio || campaign.brand?.bio || "Professional brand looking for quality collaborations.",
        profile_picture: brandProfile.logo || brandProfile.profile_picture || campaign.brand?.logo || campaign.brand?.profile_picture,
        bg_image: brandProfile.bg_image || campaign.brand?.bg_image,
        rating: brandProfile.rating || campaign.brand?.rating || 4.5,
        campaigns_count: getSafeCount(brandProfile.campaigns_count || campaign.brand?.campaigns_count || campaign.brand?.total_campaigns),
        followers_count: getSafeCount(brandProfile.followers_count || brandProfile.followers),
        following_count: getSafeCount(brandProfile.following_count || brandProfile.following),
        category: brandProfile.category || brandProfile.categories?.[0] || campaign.category || campaign.brand?.category || 'Unknown',
        location: brandProfile.location || campaign.brand?.location || 'Global',
        website: brandProfile.website || campaign.brand?.website,
        email: brandProfile.email || campaign.brand?.email,
        phone_number: brandProfile.phone_number || campaign.brand?.phone_number,
        contact_person_name: brandProfile.contact_person_name || campaign.brand?.contact_person_name,
        social_links: brandProfile.social_links || campaign.brand?.social_links || {},
        created_at: brandProfile.created_at || campaign.brand?.created_at || campaign.created_at
      };
    }

    // Fallback to campaign data if brand profile not fetched
    if (!campaign) {
      return {
        _id: null,
        company_name: 'Unknown Brand',
        bio: 'Brand information not available',
        profile_picture: null,
        bg_image: null,
        rating: 0,
        campaigns_count: 0,
        followers_count: 0,
        following_count: 0,
        category: 'Unknown',
        location: 'Unknown',
        website: null,
        email: null,
        phone_number: null,
        contact_person_name: null,
        social_links: {},
        created_at: null
      };
    }

    return {
      _id: brandId,
      company_name: campaign.brand_name || campaign.brand?.company_name || 'Unknown Brand',
      bio: campaign.brand?.bio || campaign.brand?.description || "Professional brand looking for quality collaborations.",
      profile_picture: campaign.brand?.logo || campaign.brand?.profile_picture,
      bg_image: campaign.brand?.bg_image,
      rating: campaign.brand?.rating || 4.5,
      campaigns_count: getSafeCount(campaign.brand?.campaigns_count || campaign.brand?.total_campaigns),
      followers_count: getSafeCount(campaign.brand?.followers_count || campaign.brand?.total_followers),
      following_count: getSafeCount(campaign.brand?.following_count || campaign.brand?.total_following),
      category: campaign.brand?.category || campaign.category || 'Unknown',
      location: campaign.brand?.location || 'Global',
      website: campaign.brand?.website,
      email: campaign.brand?.email,
      phone_number: campaign.brand?.phone_number,
      contact_person_name: campaign.brand?.contact_person_name,
      social_links: campaign.brand?.social_links || {},
      created_at: campaign.brand?.created_at || campaign.created_at
    };
  };

  // Early return if campaign is null
  if (!campaign) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Campaign Not Found</DialogTitle>
        <DialogContent>
          <Typography>The campaign information is not available.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const enhancedBrandProfile = getEnhancedBrandProfile();
  const viewsCount = getViewsCount();
  const formattedViews = formatViews(viewsCount);
  const applicationCount = getApplicationCount();
  const formattedApplications = formatApplicationCount(applicationCount);
  const competition = getCompetitionLevel(applicationCount);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '12px',
            minHeight: isMobile ? '100vh' : '90vh',
            maxHeight: isMobile ? '100vh' : '90vh',
            background: '#ffffff',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header */}
        <DialogTitle sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: '#fafafa'
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  background: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: '8px',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Campaign sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Campaign Details
                </Typography>
                <Breadcrumbs sx={{ mt: 0.5 }} separator="›">
                  <Typography variant="caption" color="text.secondary">Campaigns</Typography>
                  <Typography variant="caption" color="text.secondary">{campaign.category || 'Unknown'}</Typography>
                  <Typography variant="caption" fontWeight="600" color="text.primary">
                    {campaign.title || 'Untitled Campaign'}
                  </Typography>
                </Breadcrumbs>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {/* Like Button */}
              <Tooltip title={isLiked ? "Unlike" : "Like"}>
                <IconButton
                  onClick={handleLikeToggle}
                  color={isLiked ? "error" : "default"}
                  sx={{
                    color: isLiked ? 'error.main' : 'text.secondary',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                      color: isLiked ? 'error.dark' : 'text.primary'
                    }
                  }}
                >
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              </Tooltip>

              {/* Bookmark Button */}
              <Tooltip title={isBookmarked ? "Remove bookmark" : "Bookmark campaign"}>
                <IconButton
                  onClick={handleBookmarkToggle}
                  sx={{
                    color: isBookmarked ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                      color: isBookmarked ? 'primary.dark' : 'text.primary'
                    }
                  }}
                >
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Share campaign">
                <IconButton
                  onClick={handleShareCampaign}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                      color: 'text.primary'
                    }
                  }}
                >
                  <Share />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.04)',
                    color: 'text.primary'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* Scrollable Content */}
        <DialogContent
          dividers
          sx={{
            p: 0,
            overflow: 'hidden',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              p: isMobile ? 2 : 4,
              overflow: 'auto',
              flex: 1
            }}
          >
            <Grid container spacing={4}>
              {/* Left Column - Campaign Details */}
              <Grid item xs={12} lg={12}>
                {/* Campaign Header */}
                <Paper sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  background: '#ffffff'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                      <Typography
                        variant="h4"
                        fontWeight="600"
                        sx={{
                          color: 'text.primary',
                          fontSize: { xs: '1.5rem', md: '2rem' },
                          lineHeight: 1.3,
                          flex: 1
                        }}
                      >
                        {campaign.title || 'Untitled Campaign'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StatusChip
                          label={campaign.status || 'Active'}
                          status={campaign.status}
                          size="medium"
                        />
                        <Tooltip title={isLiked ? "Unlike" : "Like"}>
                          <IconButton
                            onClick={handleLikeToggle}
                            color={isLiked ? "error" : "default"}
                            sx={{
                              '&:hover': {
                                background: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            {isLiked ? <Favorite /> : <FavoriteBorder />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mt={2} flexWrap="wrap">
                      <Chip
                        label={campaign.category || 'General'}
                        variant="outlined"
                        icon={<Category />}
                        sx={{ fontWeight: 500 }}
                      />
                      <Box display="flex" alignItems="center" gap={1}>
                        <RemoveRedEye sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          {formattedViews} views
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Favorite
                          sx={{
                            fontSize: 18,
                            color: isLiked ? 'error.main' : 'text.secondary'
                          }}
                        />
                        <Typography
                          variant="body2"
                          color={isLiked ? 'error.main' : 'text.secondary'}
                          fontWeight="500"
                        >
                          {likesCount} likes
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          {formattedApplications} applications
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                          Posted {formatDate(campaign.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Competition Level Alert */}
                <Paper sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: `${competition.color}.light`,
                  background: `${competition.color}.50`
                }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        background: `${competition.color}.main`,
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TrendingUp sx={{ fontSize: '1.2rem', color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color={`${competition.color}.dark`}>
                        Competition Level: {competition.level}
                      </Typography>
                      <Typography variant="body2" color={`${competition.color}.dark`}>
                        {applicationCount === 0 ?
                          "Be the first to apply! This campaign hasn't received any applications yet." :
                          `${competition.text} - ${applicationCount} influencer${applicationCount === 1 ? ' has' : 's have'} already applied.`
                        }
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Media Section */}
                {(campaign.campaign_image_id || campaign.campaign_video_id) && (
                  <Paper sx={{
                    mb: 3,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      px: 3,
                      pt: 2,
                      background: '#fafafa',
                    }}>
                      <Tabs
                        value={activeMediaTab}
                        onChange={(e, newValue) => setActiveMediaTab(newValue)}
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                          '& .MuiTab-root': {
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textTransform: 'none',
                            minHeight: '48px',
                            color: 'text.secondary',
                            '&.Mui-selected': {
                              color: 'text.primary',
                            }
                          },
                          '& .MuiTabs-indicator': {
                            backgroundColor: 'text.primary',
                            height: 2,
                          }
                        }}
                      >
                        {campaign.campaign_image_id && (
                          <Tab
                            label={
                              <Box display="flex" alignItems="center" gap={1}>
                                <ImageIcon sx={{ fontSize: '1.2rem' }} />
                                <span>Campaign Image</span>
                              </Box>
                            }
                            value="image"
                          />
                        )}
                        {campaign.campaign_video_id && (
                          <Tab
                            label={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Videocam sx={{ fontSize: '1.2rem' }} />
                                <span>Campaign Video</span>
                              </Box>
                            }
                            value="video"
                          />
                        )}
                      </Tabs>
                    </Box>

                    <Box sx={{
                      p: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      background: '#ffffff',
                      minHeight: '400px'
                    }}>
                      {activeMediaTab === 'image' && campaign.campaign_image_id && (
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '600px',
                            height: isMobile ? '300px' : '400px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                          onClick={() => handleMediaClick(getImageUrl(campaign.campaign_image_id), 'image')}
                        >
                          <Box
                            component="img"
                            src={getImageUrl(campaign.campaign_image_id)}
                            alt={campaign.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.02)',
                              }
                            }}
                          />
                        </Box>
                      )}

                      {activeMediaTab === 'video' && campaign.campaign_video_id && (
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '600px',
                            height: isMobile ? '300px' : '400px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                          onClick={() => handleMediaClick(getVideoUrl(campaign.campaign_video_id), 'video')}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f5f5f5',
                              position: 'relative'
                            }}
                          >
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
                                flexDirection: 'column',
                                gap: 2,
                                background: 'rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: 'rgba(0,0,0,0.2)',
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  background: 'rgba(255,255,255,0.9)',
                                  borderRadius: '50%',
                                  p: 2,
                                  transition: 'transform 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                  }
                                }}
                              >
                                <PlayArrow sx={{ fontSize: 48, color: 'text.primary' }} />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                )}

                {/* Campaign Description */}
                <Paper sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Description sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Campaign Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete details about this campaign
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    p: 2.5,
                    background: '#fafafa',
                    borderRadius: '8px',
                  }}>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.7,
                        color: 'text.primary',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {campaign.description || 'No description available.'}
                    </Typography>
                  </Box>
                </Paper>

                {/* Requirements */}
                {campaign.requirements && (
                  <Paper sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <CheckCircle sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                          Campaign Requirements
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          What you need to deliver for this campaign
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2.5,
                        background: '#fafafa',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-line',
                          lineHeight: 1.7,
                        }}
                      >
                        {campaign.requirements}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Grid>

              {/* Right Column - Brand Profile & Actions */}
              <Grid item xs={12} lg={12}>
                <Box sx={{ position: 'sticky', top: 0 }}>

                  {/* Enhanced Brand Profile Section */}
                  <Paper
                    sx={{
                      mb: 3,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      background: '#ffffff',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Profile Header with Background */}
                    <Box sx={{ position: 'relative' }}>
                      {enhancedBrandProfile.bg_image ? (
                        <Box
                          sx={{
                            height: '120px',
                            backgroundImage: `url(${getProfileImageUrl(enhancedBrandProfile.bg_image)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '120px',
                            background: '#2563eb'
                          }}
                        />
                      )}

                      {/* Profile Picture */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '-40px',
                          left: '24px',
                          width: '80px',
                          height: '80px',
                          borderRadius: '12px',
                          border: '4px solid #ffffff',
                          background: '#ffffff',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          overflow: 'hidden'
                        }}
                        onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id)}
                      >
                        {enhancedBrandProfile.profile_picture ? (
                          <img
                            src={getProfileImageUrl(enhancedBrandProfile.profile_picture)}
                            alt={enhancedBrandProfile.company_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              background: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            <Business sx={{ fontSize: '2rem' }} />
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Profile Content */}
                    <Box sx={{ p: 3, pt: 5 }}>
                      {/* Brand Name and Rating */}
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="700"
                            sx={{
                              cursor: enhancedBrandProfile._id ? 'pointer' : 'default',
                              '&:hover': enhancedBrandProfile._id ? {
                                color: 'primary.main'
                              } : {}
                            }}
                            onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id)}
                          >
                            {enhancedBrandProfile.company_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {enhancedBrandProfile.category}
                          </Typography>
                        </Box>
                        {enhancedBrandProfile.rating > 0 && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Star sx={{ fontSize: 20, color: 'gold' }} />
                            <Typography variant="body1" fontWeight="600">
                              {enhancedBrandProfile.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Brand Bio */}
                      {enhancedBrandProfile.bio && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 3,
                            lineHeight: 1.6
                          }}
                        >
                          {enhancedBrandProfile.bio}
                        </Typography>
                      )}

                      {/* Stats Grid */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 1.5,
                              background: 'rgba(102, 126, 234, 0.08)',
                              borderRadius: '8px',
                              cursor: enhancedBrandProfile._id ? 'pointer' : 'default',
                              transition: 'all 0.3s ease',
                              '&:hover': enhancedBrandProfile._id ? {
                                background: 'rgba(102, 126, 234, 0.12)',
                                transform: 'translateY(-2px)'
                              } : {}
                            }}
                            onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id, 'campaigns')}
                          >
                            <Typography variant="h6" fontWeight="700" color="primary.main">
                              {formatNumber(enhancedBrandProfile.campaigns_count)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                              Campaigns
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 1.5,
                              background: 'rgba(76, 175, 80, 0.08)',
                              borderRadius: '8px',
                              cursor: enhancedBrandProfile._id ? 'pointer' : 'default',
                              transition: 'all 0.3s ease',
                              '&:hover': enhancedBrandProfile._id ? {
                                background: 'rgba(76, 175, 80, 0.12)',
                                transform: 'translateY(-2px)'
                              } : {}
                            }}
                            onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id, 'followers')}
                          >
                            <Typography variant="h6" fontWeight="700" color="success.main">
                              {formatNumber(enhancedBrandProfile.followers_count)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                              Followers
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 1.5,
                              background: 'rgba(156, 39, 176, 0.08)',
                              borderRadius: '8px',
                              cursor: enhancedBrandProfile._id ? 'pointer' : 'default',
                              transition: 'all 0.3s ease',
                              '&:hover': enhancedBrandProfile._id ? {
                                background: 'rgba(156, 39, 176, 0.12)',
                                transform: 'translateY(-2px)'
                              } : {}
                            }}
                            onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id, 'following')}
                          >
                            <Typography variant="h6" fontWeight="700" color="secondary.main">
                              {formatNumber(enhancedBrandProfile.following_count)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="500">
                              Following
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Contact Information */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                          Contact Information
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={1.5}>
                          {enhancedBrandProfile.email && (
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {enhancedBrandProfile.email}
                              </Typography>
                            </Box>
                          )}
                          {enhancedBrandProfile.phone_number && (
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {enhancedBrandProfile.phone_number}
                              </Typography>
                            </Box>
                          )}
                          {enhancedBrandProfile.location && (
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {enhancedBrandProfile.location}
                              </Typography>
                            </Box>
                          )}
                          {enhancedBrandProfile.website && (
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography
                                variant="body2"
                                color="primary.main"
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => window.open(enhancedBrandProfile.website, '_blank')}
                              >
                                Visit Website
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Social Links */}
                      {enhancedBrandProfile.social_links && Object.keys(enhancedBrandProfile.social_links).filter(platform => enhancedBrandProfile.social_links[platform]).length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" fontWeight="600" color="text.primary" gutterBottom>
                            Social Links
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {Object.entries(enhancedBrandProfile.social_links).map(([platform, url]) =>
                              url && (
                                <IconButton
                                  key={platform}
                                  size="small"
                                  onClick={() => window.open(url, '_blank')}
                                  sx={{
                                    background: 'rgba(0,0,0,0.04)',
                                    '&:hover': { background: 'rgba(0,0,0,0.08)' }
                                  }}
                                >
                                  {platform === 'instagram' && <FaInstagram style={{ color: '#E4405F' }} />}
                                  {platform === 'youtube' && <FaYoutube style={{ color: '#FF0000' }} />}
                                  {platform === 'tiktok' && <FaTiktok style={{ color: '#000000' }} />}
                                  {platform === 'linkedin' && <FaLinkedin style={{ color: '#0A66C2' }} />}
                                  {platform === 'facebook' && <FaFacebook style={{ color: '#1877F2' }} />}
                                  {platform === 'other' && <FaLink style={{ color: '#666' }} />}
                                </IconButton>
                              )
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box display="flex" gap={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<AccountCircle />}
                          onClick={() => enhancedBrandProfile._id && handleViewBrandProfile(enhancedBrandProfile._id)}
                          disabled={!enhancedBrandProfile._id}
                          sx={{
                            borderRadius: '8px',
                            py: 1.25,
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          {enhancedBrandProfile._id ? 'View Profile' : 'Profile Unavailable'}
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Chat />}
                          onClick={handleDirectChat}
                          disabled={!enhancedBrandProfile._id}
                          sx={{
                            borderRadius: '8px',
                            py: 1.25,
                            fontWeight: 600,
                            textTransform: 'none',
                            background: '#2563eb',
                            '&:hover': {
                              background: '#2563eb',
                            }
                          }}
                        >
                          Message
                        </Button>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Campaign Quick Details */}
                  <Paper sx={{
                    mb: 3,
                    p: 3,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <TrendingUp sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Campaign Details
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                      {/* Budget */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, background: '#fafafa', borderRadius: '8px' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AttachMoney sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500" color="text.primary">
                            Budget
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="600">
                          {formatCurrency(campaign.budget, getCampaignCurrency())}
                        </Typography>
                      </Box>

                      {/* Applications */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, background: '#fafafa', borderRadius: '8px' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <People sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500" color="text.primary">
                            Applications
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="600">
                            {formattedApplications}
                          </Typography>
                          <Chip
                            label={competition.level}
                            size="small"
                            color={competition.color}
                            variant="outlined"
                            sx={{ height: '20px', fontSize: '0.6rem' }}
                          />
                        </Box>
                      </Box>

                      {/* Deadline */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, background: '#fafafa', borderRadius: '8px' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Event sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500" color="text.primary">
                            Deadline
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="600">
                          {formatDate(campaign.deadline)}
                        </Typography>
                      </Box>

                      {/* Created */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, background: '#fafafa', borderRadius: '8px' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AccessTime sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="500" color="text.primary">
                            Created
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="600">
                          {formatDate(campaign.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>

                  {/* Quick Actions */}
                  <Paper sx={{
                    p: 3,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Work sx={{ fontSize: '1.5rem', color: 'text.primary' }} />
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Ready to Apply?
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.6 }}>
                        {applicationCount === 0 ?
                          "Be the first to apply! This is a great opportunity to stand out." :
                          `Join ${applicationCount} other influencer${applicationCount === 1 ? '' : 's'} who have already applied.`
                        }
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <Button
                        variant="contained"
                        startIcon={<Work />}
                        onClick={handleApplyClick}
                        disabled={applying}
                        sx={{
                          borderRadius: '8px',
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          background: '#2563eb',
                          '&:hover': {
                            background: '#2563eb',
                          }
                        }}
                      >
                        {applying ? "Checking..." : "Apply to Campaign"}
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          gap: 2,
          background: '#fafafa',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Button
            onClick={onClose}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: '8px',
              fontWeight: 500,
              px: 3,
              py: 1,
              textTransform: 'none'
            }}
            variant="outlined"
          >
            Back to Campaigns
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyClick}
            startIcon={<Work />}
            disabled={applying}
            sx={{
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: '#2563eb',
              '&:hover': {
                background: '#2563eb',
              }
            }}
          >
            {applying ? "Checking..." : "Apply Now"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Modal */}
      <Dialog
        open={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '12px',
            background: '#ffffff',
            overflow: 'hidden',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}>
          <Typography variant="h6" fontWeight="600">
            {selectedMedia?.type === 'image' ? 'Campaign Image' : 'Campaign Video'}
          </Typography>
          <IconButton
            onClick={() => setMediaModalOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '80vh' : '70vh',
          background: '#fafafa'
        }}>
          {selectedMedia?.type === 'image' ? (
            <img
              src={selectedMedia.url}
              alt="Campaign"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          ) : (
            <video
              controls
              autoPlay
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh'
              }}
            >
              <source src={selectedMedia?.url} />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>




    </>
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
    setFiles(selectedFiles);

    // Create previews
    const newPreviews = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    // Revoke object URL
    URL.revokeObjectURL(newPreviews[index].preview);

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
    previews.forEach(preview => URL.revokeObjectURL(preview.preview));
    setFiles([]);
    setPreviews([]);
    setDescription('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px' } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ImageIcon />
            <Typography variant="h6">Submit Media Files</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="body1" gutterBottom>
            Submit your completed media files for <strong>{application?.campaign_title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload images, videos, or other media files as required by the campaign.
          </Typography>
        </Box>

        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            accept="image/*,video/*,.pdf,.doc,.docx"
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
              sx={{ py: 2, mb: 2 }}
            >
              Select Media Files
            </Button>
          </label>

          {files.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {files.length} file(s) selected
            </Typography>
          )}

          {/* File Previews */}
          {previews.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              <Grid container spacing={1}>
                {previews.map((preview, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Paper sx={{ p: 1, position: 'relative' }}>
                      <img
                        src={preview.preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(255,255,255,0.8)'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.5 }}>
                        {preview.file.name}
                      </Typography>
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
          rows={3}
          label="Media Description (Optional)"
          placeholder="Describe your media files or provide any additional context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={uploading || files.length === 0}
          startIcon={uploading ? <CircularProgress size={16} /> : <Send />}
          sx={{ borderRadius: 2 }}
        >
          {uploading ? 'Uploading...' : 'Submit Media'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Contract Acceptance Dialog
const ContractAcceptanceDialog = ({ open, onClose, application, onAcceptContract }) => {
  const [accepting, setAccepting] = useState(false);

  const handleAcceptContract = async () => {
    setAccepting(true);
    try {
      await onAcceptContract(application);
      onClose();
    } catch (error) {
      console.error('Error accepting contract:', error);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px' } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Description />
            <Typography variant="h6">Contract Agreement</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="primary">
            Congratulations! 🎉
          </Typography>
          <Typography variant="body1" gutterBottom>
            Your application for <strong>{application?.campaign_title}</strong> has been approved!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review and accept the contract agreement to proceed with the campaign.
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="success.dark">
            <strong>Campaign Details:</strong><br />
            • Budget: {application?.currency || 'USD'} {application?.budget}<br />
            • Requirements: {application?.requirements}<br />
            • Deadline: {application?.deadline ? new Date(application.deadline).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          By accepting this contract, you agree to deliver the required media content according to the campaign specifications.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Review Later
        </Button>
        <Button
          variant="contained"
          onClick={handleAcceptContract}
          disabled={accepting}
          startIcon={accepting ? <CircularProgress size={16} /> : <CheckCircle />}
          sx={{ borderRadius: 2 }}
        >
          {accepting ? 'Accepting...' : 'Accept Contract'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// FILTER SIDEBAR COMPONENT
// =============================================

const FilterSidebarContent = ({
  filters,
  onFilterChange,
  campaigns,
  onClearFilters,
  onClose
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Categories with icons
  const categories = [
    { value: 'Fashion', label: 'Fashion', icon: '👗' },
    { value: 'Beauty', label: 'Beauty', icon: '💄' },
    { value: 'Lifestyle', label: 'Lifestyle', icon: '🌟' },
    { value: 'Food', label: 'Food', icon: '🍕' },
    { value: 'Travel', label: 'Travel', icon: '✈️' },
    { value: 'Fitness', label: 'Fitness', icon: '💪' },
    { value: 'Technology', label: 'Technology', icon: '💻' },
    { value: 'Gaming', label: 'Gaming', icon: '🎮' },
    { value: 'Other', label: 'Other', icon: '📦' }
  ];

  // const statusOptions = [
  //   { value: 'Active', label: 'Active', color: 'success' },
  //   { value: 'Draft', label: 'Draft', color: 'default' },
  //   { value: 'Completed', label: 'Completed', color: 'primary' },
  //   { value: 'Paused', label: 'Paused', color: 'warning' }
  // ];

  const timelineOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget-high', label: 'Budget: High to Low' },
    { value: 'budget-low', label: 'Budget: Low to High' },
    { value: 'deadline-close', label: 'Deadline: Soonest' },
    { value: 'deadline-far', label: 'Deadline: Farthest' },
    { value: 'views-high', label: 'Views: High to Low' },
    { value: 'views-low', label: 'Views: Low to High' }
  ];

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    status: true,
    brands: true,
    budget: true,
    timeline: true,
    sort: true,
    dates: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getFilteredBrands = () => {
    const brands = campaigns.map(campaign =>
      campaign.brand_name || campaign.brand?.name || 'Unknown Brand'
    ).filter(brand => brand && brand !== 'Unknown Brand');

    const uniqueBrands = [...new Set(brands)].sort();

    if (filters.brandSearch) {
      return uniqueBrands.filter(brand =>
        brand.toLowerCase().includes(filters.brandSearch.toLowerCase())
      );
    }

    return uniqueBrands;
  };

  const calculateMaxBudget = () => {
    const budgets = campaigns.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
    return budgets.length > 0 ? Math.max(...budgets) : 10000;
  };

  const formatCurrency = (amount, currencyCode = 'USD') => {
    return globalFormatCurrency(amount, currencyCode);
  };

  // Add this custom hook for intersection observation
  const useCampaignViewTracker = (campaigns, onViewTrack) => {
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const campaignId = entry.target.getAttribute('data-campaign-id');
              if (campaignId) {
                onViewTrack(campaignId);
              }
            }
          });
        },
        {
          threshold: 0.5, // 50% of the element is visible
          rootMargin: '0px 0px -100px 0px' // Trigger when element enters viewport
        }
      );

      // Observe all campaign cards
      const campaignCards = document.querySelectorAll('[data-campaign-id]');
      campaignCards.forEach(card => observer.observe(card));

      return () => {
        campaignCards.forEach(card => observer.unobserve(card));
        observer.disconnect();
      };
    }, [campaigns, onViewTrack]);
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      bgcolor: 'background.paper'
    }}>
      {/* Sidebar Header */}
      <Box className="sidebar-header" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="600">
            <FilterList sx={{ mr: 1, fontSize: '20px' }} />
            Filters
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <Clear fontSize="small" />
            </IconButton>
            {isMobile && (
              <IconButton
                size="small"
                onClick={onClose}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      {/* Sidebar Content */}
      <Box className="sidebar-content" sx={{ p: 2 }}>
        {/* Categories Filter */}
        <Box className="filter-section" sx={{ mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('categories')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Categories
            </Typography>
            <IconButton size="small">
              {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.categories}>
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={filters.selectedCategories}
                onChange={(e) => onFilterChange('selectedCategories', e.target.value)}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.length > 0 ? `${selected.length} selected` : 'All categories'}
                displayEmpty
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Checkbox checked={filters.selectedCategories.indexOf(category.value) > -1} />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: 8, fontSize: '16px' }}>{category.icon}</span>
                          {category.label}
                        </Box>
                      }
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>
        </Box>

        {/* Status Filter
        <Box className="filter-section" sx={{ mb: 2 }}>
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('status')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Status
            </Typography>
            <IconButton size="small">
              {expandedSections.status ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.status}>
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={filters.selectedStatuses}
                onChange={(e) => onFilterChange('selectedStatuses', e.target.value)}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.length > 0 ? `${selected.length} selected` : 'All statuses'}
                displayEmpty
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Checkbox checked={filters.selectedStatuses.indexOf(status.value) > -1} />
                    <Chip 
                      label={status.label} 
                      size="small" 
                      color={status.color}
                      variant="outlined"
                      sx={{ height: '24px', fontSize: '0.7rem' }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>
        </Box> */}

        {/* Brands Filter with Search */}
        <Box className="filter-section" sx={{ mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('brands')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Brands
            </Typography>
            <IconButton size="small">
              {expandedSections.brands ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.brands}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search brands..."
              value={filters.brandSearch}
              onChange={(e) => onFilterChange('brandSearch', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <FormControl fullWidth size="small">
              <Select
                multiple
                value={filters.selectedBrands}
                onChange={(e) => onFilterChange('selectedBrands', e.target.value)}
                input={<OutlinedInput />}
                renderValue={(selected) => selected.length > 0 ? `${selected.length} selected` : 'All brands'}
                displayEmpty
              >
                {getFilteredBrands().map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    <Checkbox checked={filters.selectedBrands.indexOf(brand) > -1} />
                    <ListItemText primary={brand} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>
        </Box>

        {/* Budget Filter */}
        <Box
          className="filter-section"
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.06)' },
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('budget')}
          >
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{ color: 'text.primary', letterSpacing: 0.2 }}
            >
              Budget Range
            </Typography>
            <IconButton
              size="small"
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              {expandedSections.budget ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>

          {/* Collapsible Section */}
          <Collapse in={expandedSections.budget}>
            <Box sx={{ px: 1, mt: 1 }}>
              {/* Amount Inputs */}
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  value={filters.budgetRange[0]}
                  onChange={(e) => {
                    const min = Number(e.target.value);
                    onFilterChange('budgetRange', [min, filters.budgetRange[1]]);
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 0.5 }}></Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  value={filters.budgetRange[1]}
                  onChange={(e) => {
                    const max = Number(e.target.value);
                    onFilterChange('budgetRange', [filters.budgetRange[0], max]);
                  }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 0.5 }}></Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Styled Slider */}
              <Slider
                value={filters.budgetRange}
                onChange={(e, newValue) => onFilterChange('budgetRange', newValue)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
                min={0}
                max={calculateMaxBudget()}
                sx={{
                  color: 'primary.main',
                  height: 6,
                  '& .MuiSlider-thumb': {
                    width: 18,
                    height: 18,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.25)' },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.3,
                    backgroundColor: '#d0d6e3',
                  },
                  '& .MuiSlider-track': {
                    border: 'none',
                    background: 'linear-gradient(90deg, #4A6CF7, #80B6FF)',
                  },
                }}
              />
            </Box>
          </Collapse>
        </Box>


        {/* Timeline Filter */}
        <Box className="filter-section" sx={{ mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('timeline')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Time Period
            </Typography>
            <IconButton size="small">
              {expandedSections.timeline ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.timeline}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.timelineFilter}
                onChange={(e) => onFilterChange('timelineFilter', e.target.value)}
                displayEmpty
              >
                {timelineOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>
        </Box>

        {/* Sort By */}
        <Box className="filter-section" sx={{ mb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('sort')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Sort By
            </Typography>
            <IconButton size="small">
              {expandedSections.sort ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.sort}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.sortBy}
                onChange={(e) => onFilterChange('sortBy', e.target.value)}
                displayEmpty
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Collapse>
        </Box>

        {/* Date Range Filters */}
        <Box className="filter-section">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={() => toggleSection('dates')}
          >
            <Typography variant="subtitle1" fontWeight="600">
              Date Ranges
            </Typography>
            <IconButton size="small">
              {expandedSections.dates ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.dates}>
            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>Deadline</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={filters.deadlineRange[0] || ''}
                onChange={(e) => onFilterChange('deadlineRange', [e.target.value, filters.deadlineRange[1]])}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={filters.deadlineRange[1] || ''}
                onChange={(e) => onFilterChange('deadlineRange', [filters.deadlineRange[0], e.target.value])}
              />
            </Box>

            <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>Created Date</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={filters.createdDateRange[0] || ''}
                onChange={(e) => onFilterChange('createdDateRange', [e.target.value, filters.createdDateRange[1]])}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={filters.createdDateRange[1] || ''}
                onChange={(e) => onFilterChange('createdDateRange', [filters.createdDateRange[0], e.target.value])}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================

const InfluencerCampaigns = ({ onApplicationSubmit }) => {
  const [activeTab, setActiveTab] = useState('available');
  const [campaigns, setCampaigns] = useState([]);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [viewedCampaigns, setViewedCampaigns] = useState(new Set());
  const [campaignViews, setCampaignViews] = useState({});
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [sortedCampaigns, setSortedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [applyingCampaign, setApplyingCampaign] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [collaborations, setCollaborations] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quickMessageDialogOpen, setQuickMessageDialogOpen] = useState(false);
  const [selectedCampaignForChat, setSelectedCampaignForChat] = useState(null);
  const [mediaSubmissionDialogOpen, setMediaSubmissionDialogOpen] = useState(false);
  const [selectedApplicationForMedia, setSelectedApplicationForMedia] = useState(null);
  const [contractAcceptanceDialogOpen, setContractAcceptanceDialogOpen] = useState(false);
  const [selectedApplicationForContract, setSelectedApplicationForContract] = useState(null);




  const handleOpenCampaign = (campaign) => {
    setSelectedCampaign(campaign);
  };


  const trackCampaignView = async (campaignId) => {
    // Prevent multiple views from the same user in the same session
    if (viewedCampaigns.has(campaignId)) {
      return;
    }

    try {
      await campaignAPI.trackCampaignView(campaignId);

      // Update local state to mark as viewed
      setViewedCampaigns(prev => new Set(prev).add(campaignId));


      // Update view count in local state
      setCampaignViews(prev => ({
        ...prev,
        [campaignId]: (prev[campaignId] || 0) + 1
      }));

      // Also update the campaigns array
      setCampaigns(prev => prev.map(campaign =>
        campaign._id === campaignId
          ? { ...campaign, views: (campaign.views || 0) + 1 }
          : campaign
      ));

    } catch (error) {
      console.error('Failed to track view:', error);
      // Don't show error to user as this is background tracking
    }
  };

  // Function to handle campaign view (call this when campaign is viewed)
  const handleCampaignView = (campaignId) => {
    trackCampaignView(campaignId);
  };



  // Filter states
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedCategories: [],
    selectedStatuses: [],
    budgetRange: [0, 10000],
    selectedBrands: [],
    timelineFilter: 'all',
    sortBy: 'newest',
    brandSearch: '',
    deadlineRange: [null, null],
    createdDateRange: [null, null]
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const navigate = useNavigate();
  const currentUser = {
    id: localStorage.getItem('user_id'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  };



  // Currency symbols
  const currencySymbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥',
    CAD: 'C$', AUD: 'A$', CNY: '¥', BRL: 'R$', RUB: '₽'
  };

  // Toggle sidebar based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchAvailableCampaigns();
    fetchApplications();
    fetchCollaborations();
  }, []);

  // Update your fetchAvailableCampaigns to include real view data
  const fetchAvailableCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getAvailableCampaigns();

      let campaignsData = [];

      if (Array.isArray(response)) {
        campaignsData = response;
      } else if (response?.data) {
        campaignsData = response.data;
      } else if (response?.campaigns) {
        campaignsData = response.campaigns;
      } else if (response?.results) {
        campaignsData = response.results;
      }

      // Initialize campaign views state and ensure like fields exist
      const viewsMap = {};
      campaignsData.forEach(campaign => {
        viewsMap[campaign._id] = campaign.total_views || campaign.views || 0;

        // Ensure like and bookmark fields exist
        campaign.likes_count = campaign.likes_count || 0;
        campaign.user_liked = campaign.user_liked || false;
        campaign.user_bookmarked = campaign.user_bookmarked || false;
      });
      setCampaignViews(viewsMap);

      const sortedCampaigns = campaignsData.sort((a, b) => {
        return new Date(b.created_at || b.createdAt || b.date_created) -
          new Date(a.created_at || a.createdAt || a.date_created);
      });

      setCampaigns(sortedCampaigns);

      if (campaignsData.length > 0) {
        const budgets = campaignsData.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
        const maxBudget = budgets.length > 0 ? Math.max(...budgets) : 10000;
        setFilters(prev => ({
          ...prev,
          budgetRange: [0, maxBudget]
        }));
      }
    } catch (err) {
      setError('Failed to fetch campaigns. Please check your connection.');
      console.error('Error fetching campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await campaignAPI.getInfluencerApplications();
      const appsData = Array.isArray(response) ? response :
        response.data ? response.data :
          response.applications ? response.applications : [];
      setApplications(appsData);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    }
  };

  const fetchCollaborations = async () => {
    try {
      const response = await collaborationAPI.getCollaborations(currentUser.id, 'influencer');
      setCollaborations(response.data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Filter campaigns based on criteria
  useEffect(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = filters.searchQuery === '' ||
        campaign.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        campaign.brand_name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        campaign.brand?.name?.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesCategory = filters.selectedCategories.length === 0 ||
        filters.selectedCategories.includes(campaign.category);

      const matchesStatus = filters.selectedStatuses.length === 0 ||
        filters.selectedStatuses.includes(campaign.status);

      const matchesBrand = filters.selectedBrands.length === 0 ||
        filters.selectedBrands.includes(campaign.brand_name || campaign.brand?.name);

      const campaignBudget = parseFloat(campaign.budget) || 0;
      const matchesBudget = campaignBudget >= filters.budgetRange[0] && campaignBudget <= filters.budgetRange[1];

      const campaignDate = new Date(campaign.created_at || campaign.createdAt || campaign.date_created);
      const now = new Date();
      let matchesTimeline = true;

      switch (filters.timelineFilter) {
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

      // Deadline range filter
      let matchesDeadline = true;
      if (filters.deadlineRange[0] || filters.deadlineRange[1]) {
        const campaignDeadline = new Date(campaign.deadline);
        if (filters.deadlineRange[0] && campaignDeadline < new Date(filters.deadlineRange[0])) {
          matchesDeadline = false;
        }
        if (filters.deadlineRange[1] && campaignDeadline > new Date(filters.deadlineRange[1])) {
          matchesDeadline = false;
        }
      }

      // Created date range filter
      let matchesCreatedDate = true;
      if (filters.createdDateRange[0] || filters.createdDateRange[1]) {
        const campaignCreated = new Date(campaign.created_at || campaign.createdAt || campaign.date_created);
        if (filters.createdDateRange[0] && campaignCreated < new Date(filters.createdDateRange[0])) {
          matchesCreatedDate = false;
        }
        if (filters.createdDateRange[1] && campaignCreated > new Date(filters.createdDateRange[1])) {
          matchesCreatedDate = false;
        }
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesBrand &&
        matchesBudget && matchesTimeline && matchesDeadline && matchesCreatedDate;
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, filters]);

  // Sort the filtered campaigns
  useEffect(() => {
    const sorted = [...filteredCampaigns].sort((a, b) => {
      switch (filters.sortBy) {
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
        case 'deadline-close':
          return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
        case 'deadline-far':
          return new Date(b.deadline || '0000-01-01') - new Date(a.deadline || '0000-01-01');
        case 'views-high':
          return (b.views || 0) - (a.views || 0);
        case 'views-low':
          return (a.views || 0) - (b.views || 0);
        default:
          return 0;
      }
    });

    setSortedCampaigns(sorted);
  }, [filteredCampaigns, filters.sortBy]);

  const handleViewDetails = (campaign) => {
    handleCampaignView(campaign._id);
    setSelectedCampaign(campaign);
    setDetailDialogOpen(true);
  };

  const handleApply = async (campaign) => {
    try {
      const res = await accountAPI.getBankAccountStatus();

      // 🔒 BANK REQUIRED → OPEN DIALOG (NO ERROR)
      if (!res?.data?.has_accounts) {
        setDetailDialogOpen(false); // close campaign dialog first

        setTimeout(() => {
          setBankDialogOpen(true);
        }, 200);

        return; // ⛔ STOP HERE (IMPORTANT)
      }

      // ✅ BANK EXISTS → APPLY
      setDetailDialogOpen(false);

      // Original application logic
      setApplyingCampaign(campaign);
      setApplicationMessage('');

    } catch (err) {
      console.error("Apply check failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const cancelApply = () => {
    setApplyingCampaign(null);
    setApplicationMessage('');
  };

  const submitApplication = async () => {
    if (!applyingCampaign) return;

    try {
      setApplying(true);
      await campaignAPI.applyToCampaign(applyingCampaign._id, {
        message: applicationMessage
      });
      setSuccess('Application submitted successfully!');
      setApplyingCampaign(null);
      setApplicationMessage('');
      onApplicationSubmit?.();
      fetchAvailableCampaigns();
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptContract = async (application) => {
    try {
      await campaignAPI.acceptContract({
        campaign_id: application.campaign_id,
        influencer_id: currentUser.id,
        terms_accepted: true,
        signed_at: new Date().toISOString(),
      });

      setSuccess('Contract accepted successfully!');
      fetchApplications();
    } catch (err) {
      setError('Failed to accept contract. Please try again.');
      console.error('Contract acceptance error:', err);
    }
  };

  const handleSubmitMedia = async (application, files, description) => {
    try {
      const formData = new FormData();
      formData.append('campaign_id', application.campaign_id);
      formData.append('description', description);

      // Append all files
      files.forEach(file => {
        formData.append('media_files', file);
      });

      await campaignAPI.submitMediaFiles(formData);
      setSuccess('Media files submitted successfully!');
      fetchApplications();
    } catch (err) {
      setError('Failed to submit media files. Please try again.');
      console.error('Media submission error:', err);
      throw err;
    }
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      selectedStatuses: [],
      budgetRange: [0, calculateMaxBudget()],
      selectedBrands: [],
      timelineFilter: 'all',
      sortBy: 'newest',
      brandSearch: '',
      deadlineRange: [null, null],
      createdDateRange: [null, null]
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (typeof amount !== 'number') {
      amount = parseFloat(amount) || 0;
    }

    const symbol = currencySymbols[currency] || '$';
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return `${symbol}${formattedAmount}`;
  };

  const formatViews = (views) => {
    if (!views || views === 0) return '0';

    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  const getCampaignCurrency = (campaign) => {
    return campaign.currency || campaign.brand?.currency || 'USD';
  };

  const calculateMaxBudget = () => {
    const budgets = campaigns.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
    return budgets.length > 0 ? Math.max(...budgets) : 10000;
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const hasExistingCollaboration = (brandId) => {
    return collaborations.some(collab => collab.brand_id === brandId);
  };



  const handleQuickMessage = (campaign) => {
    setSelectedCampaignForChat(campaign);
    setQuickMessageDialogOpen(true);
  };

  const handleSendAndRedirect = async (campaign, message) => {
    try {
      const token = localStorage.getItem('access_token');
      const brandId = campaign.brand_id || campaign.brand?._id;

      if (!brandId) {
        throw new Error('Brand ID not found');
      }

      // First, create or get conversation
      const conversationResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brand_id: brandId,
          influencer_id: currentUser.id
        })
      });

      if (!conversationResponse.ok) {
        const errorData = await conversationResponse.json();
        throw new Error(errorData.detail || 'Failed to create conversation');
      }

      const conversationData = await conversationResponse.json();
      const conversationId = conversationData.conversation_id;

      // Send the message
      const messageResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: message,
          message_type: 'text'
        })
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      // Navigate to the messages page with the conversation
      navigate(`/influencer/messages?conversation=${conversationId}`);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      throw err;
    }
  };

  const handleViewBrandProfile = (brandId) => {
    if (brandId) {
      navigate(`/influencer/profile/view/brand/${brandId}`);
    }
  };

  const handleImageClick = (campaign) => {
    handleCampaignView(campaign._id);
    if (campaign.campaign_image_id) {
      setSelectedImage(campaign.campaign_image_id);
      setImageModalOpen(true);
    }
  };

  useEffect(() => {
    // Track view for each campaign when they first become visible
    // This could be enhanced with Intersection Observer for actual visibility tracking
    const timer = setTimeout(() => {
      campaigns.forEach(campaign => {
        // Only track if campaign is in viewport and not already viewed
        if (!viewedCampaigns.has(campaign._id)) {
          // For now, we'll track when component loads. 
          // You can enhance this with Intersection Observer for actual visibility
          handleCampaignView(campaign._id);
        }
      });
    }, 1000); // Small delay to ensure component is rendered

    return () => clearTimeout(timer);
  }, [campaigns.length]); // Only run when campaigns change

  // Update the getRealViewCount function to use actual data
  const getRealViewCount = (campaign) => {
    return campaignViews[campaign._id] || campaign.total_views || campaign.views || 0;
  };

  const getApplicationStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved - Contract Pending';
      case 'rejected': return 'Rejected';
      case 'contracted': return 'Contract Sent';
      case 'media_submitted': return 'Media Submitted';
      case 'completed': return 'Completed';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const getApplicationActions = (application) => {
    switch (application.status) {
      case 'approved':
        return (
          <ContractButton
            size="small"
            startIcon={<Description />}
            onClick={() => {
              setSelectedApplicationForContract(application);
              setContractAcceptanceDialogOpen(true);
            }}
          >
            Review Contract
          </ContractButton>
        );

      case 'contracted':
        return (
          <MediaButton
            size="small"
            startIcon={<ImageIcon />}
            onClick={() => {
              setSelectedApplicationForMedia(application);
              setMediaSubmissionDialogOpen(true);
            }}
          >
            Submit Media
          </MediaButton>
        );

      case 'media_submitted':
        return (
          <Typography variant="caption" color="text.secondary">
            Waiting for payment...
          </Typography>
        );

      case 'completed':
        return (
          <PaymentButton
            size="small"
            startIcon={<DoneAll />}
            disabled
          >
            Completed
          </PaymentButton>
        );

      default:
        return (
          <Typography variant="caption" color="text.secondary">
            {getApplicationStatusText(application.status)}
          </Typography>
        );
    }
  };

  // Handle tab changes with navigation
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Image Modal Component
  const ImageModal = ({ open, onClose, imageUrl, alt }) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{alt}</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={imageUrl}
              alt={alt}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box className="loading-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading available campaigns...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', zIndex: 100, margin: '10px' }}>
      {/* App Bar */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
            Campaign Marketplace
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Chat />}
              onClick={() => navigate('/influencer/collaborations')}
              size="small"
            >
              Messages
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchAvailableCampaigns();
                fetchApplications();
              }}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Toolbar>

        {/* Tabs */}
        <Paper square sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Campaign />
                  <span>Available Campaigns</span>
                  <Chip label={campaigns.length} size="small" color="primary" variant="outlined" />
                </Box>
              }
              value="available"
            />
            {/* <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <PendingActions />
                  <span>My Applications</span>
                  <Chip label={applications.length} size="small" color="secondary" variant="outlined" />
                </Box>
              } 
              value="applications" 
            /> */}
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Description />
                  <span>Contracts</span>
                  <Chip
                    label={applications.filter(app => app.status === 'contracted' || app.contract_signed).length}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>
              }
              value="contracts"
            />
            {/* Add new tabs for Likes and Bookmarks */}
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Favorite />
                  <span>Liked</span>
                  <Chip
                    label={campaigns.filter(c => c.user_liked).length}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </Box>
              }
              value="liked"
            />
            <Tab
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <Bookmark />
                  <span>Bookmarked</span>
                  <Chip
                    label={campaigns.filter(c => c.user_bookmarked).length}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              value="bookmarked"
            />
          </Tabs>
        </Paper>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative', marginTop: '15px', border: "20px", boxShadow: 3, backgroundColor: 'background.paper' }}>
        {/* Filter Sidebar - Only show for available campaigns */}
        {activeTab === 'available' && (
          <>
            {/* Desktop Sidebar */}
            {!isMobile && (
              <FilterSidebar open={sidebarOpen}>
                <FilterSidebarContent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  campaigns={campaigns}
                  onClearFilters={clearFilters}
                />
              </FilterSidebar>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
              <Drawer
                anchor="left"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: '320px',
                    maxWidth: '90vw',
                  },
                }}
              >
                <FilterSidebarContent
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  campaigns={campaigns}
                  onClearFilters={clearFilters}
                  onClose={() => setSidebarOpen(false)}
                />
              </Drawer>
            )}
          </>
        )}

        {/* Main Content */}
        <MainContent sidebarOpen={sidebarOpen && activeTab === 'available' && !isMobile}>
          <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3 } }}>

            {activeTab === 'available' && (
              <>
                {/* Search and Filter Toggle Section */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Search Bar */}
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search campaigns by title, description, or brand..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {filters.searchQuery && (
                            <IconButton
                              aria-label="clear search"
                              onClick={() => handleFilterChange('searchQuery', '')}
                              edge="end"
                              size="small"
                            >
                              <Clear />
                            </IconButton>
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: '600px', flexGrow: 1 }}
                  />

                  {/* Filter Toggle Button for Mobile */}
                  {isMobile && (
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setSidebarOpen(true)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Filters
                    </Button>
                  )}

                  {/* Desktop Toggle Button */}
                  {!isMobile && activeTab === 'available' && (
                    <Tooltip title={sidebarOpen ? "Hide filters" : "Show filters"}>
                      <IconButton
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '8px'
                        }}
                      >
                        {sidebarOpen ? <X /> : <Sliders />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Results counter and active filters */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {sortedCampaigns.length} of {campaigns.length} campaigns
                  </Typography>

                  {/* Active Filters Indicator */}
                  {(filters.searchQuery || filters.selectedCategories.length > 0 || filters.selectedStatuses.length > 0 ||
                    filters.selectedBrands.length > 0 || filters.timelineFilter !== 'all' || filters.sortBy !== 'newest') && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label="Filters Active"
                          color="primary"
                          variant="outlined"
                          size="small"
                          onDelete={clearFilters}
                        />
                        <Button
                          size="small"
                          onClick={clearFilters}
                          startIcon={<Clear />}
                        >
                          Clear All
                        </Button>
                      </Box>
                    )}
                </Box>
              </>
            )}

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'available' && (
                <>
                  {sortedCampaigns.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        {campaigns.length === 0 ? 'No campaigns available' : 'No campaigns match your filters'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {campaigns.length === 0
                          ? 'Check back later for new campaign opportunities.'
                          : 'Try adjusting your search criteria or clear filters.'
                        }
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          startIcon={<Refresh />}
                          onClick={fetchAvailableCampaigns}
                        >
                          Refresh
                        </Button>
                        {campaigns.length > 0 && (
                          <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <CampaignGrid>
                      {sortedCampaigns.map((campaign, index) => {
                        const currency = getCampaignCurrency(campaign);
                        const brandId = campaign.brand_id || campaign.brand?._id;
                        const hasChat = brandId && hasExistingCollaboration(brandId);
                        const realViews = getRealViewCount(campaign);


                        // Handle like toggle for campaign card
                        const handleLikeToggle = async (e) => {
                          e.stopPropagation(); // Prevent opening details dialog
                          try {
                            const newLikeState = !campaign.user_liked;
                            const response = await campaignAPI.toggleLike(campaign._id, newLikeState);

                            // Update local state
                            setCampaigns(prev => prev.map(c =>
                              c._id === campaign._id
                                ? {
                                  ...c,
                                  user_liked: newLikeState,
                                  likes_count: response.likes_count
                                }
                                : c
                            ));
                          } catch (error) {
                            console.error('Error toggling like:', error);
                          }
                        };

                        // Handle bookmark toggle for campaign card
                        const handleBookmarkToggle = async (e) => {
                          e.stopPropagation(); // Prevent opening details dialog
                          try {
                            const newBookmarkState = !campaign.user_bookmarked;
                            await campaignAPI.toggleBookmark(campaign._id, newBookmarkState);

                            // Update local state
                            setCampaigns(prev => prev.map(c =>
                              c._id === campaign._id
                                ? { ...c, user_bookmarked: newBookmarkState }
                                : c
                            ));
                          } catch (error) {
                            console.error('Error toggling bookmark:', error);
                          }
                        };

                        return (
                          <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={campaign._id}>
                            <PremiumCard className="campaign-card" data-campaign-id={campaign._id}>
                              {/* Campaign Image with 1:1 aspect ratio */}
                              <Box sx={{ position: 'relative' }}>
                                <CampaignImage
                                  fileId={campaign.campaign_image_id}
                                  alt={campaign.title}
                                  onClick={() => handleImageClick(campaign)}
                                  height={200}
                                />

                                {/* Like and Bookmark buttons overlay on image - ONLY PLACE WHERE BUTTONS APPEAR */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    display: 'flex',
                                    gap: 0.5
                                  }}
                                >
                                  {/* Bookmark Button */}
                                  <Tooltip title={campaign.user_bookmarked ? "Remove bookmark" : "Bookmark campaign"}>
                                    <IconButton
                                      size="small"
                                      onClick={handleBookmarkToggle}
                                      sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                        color: campaign.user_bookmarked ? 'primary.main' : 'text.secondary'
                                      }}
                                    >
                                      {campaign.user_bookmarked ? <Bookmark /> : <BookmarkBorder />}
                                    </IconButton>
                                  </Tooltip>

                                  {/* Like Button */}
                                  <Tooltip title={campaign.user_liked ? "Unlike" : "Like"}>
                                    <IconButton
                                      size="small"
                                      onClick={handleLikeToggle}
                                      sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                        color: campaign.user_liked ? 'error.main' : 'text.secondary'
                                      }}
                                    >
                                      {campaign.user_liked ? <Favorite /> : <FavoriteBorder />}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>

                              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                {/* Header with title and status */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: '1rem',
                                      lineHeight: 1.3,
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      flex: 1,
                                      mr: 1
                                    }}
                                  >
                                    {campaign.title}
                                  </Typography>
                                  <StatusChip
                                    label={campaign.status || 'Active'}
                                    status={campaign.status}
                                    size="small"
                                  />
                                </Box>

                                {/* Brand Information with Profile Integration */}
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  mb={1.5}
                                  sx={{
                                    p: 1,
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.12)',
                                    }
                                  }}
                                  onClick={() => handleViewBrandProfile(brandId)}
                                >
                                  <UserInfo
                                    userId={brandId}
                                    profileType="brand"
                                    showEmail={false}
                                    showRating={true}
                                    size={36}
                                  />
                                </Box>

                                {/* Description */}
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    mb: 2,
                                    flexGrow: 1,
                                    lineHeight: 1.4
                                  }}
                                >
                                  {campaign.description}
                                </Typography>

                                <Divider sx={{ my: 1.5 }} />

                                {/* Stats section with real views */}
                                <Box sx={{ mb: 2 }}>
                                  <StatRow>
                                    <AttachMoney />
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                      <strong>Budget:</strong> {formatCurrency(campaign.budget, currency)}
                                    </Typography>
                                  </StatRow>

                                  <StatRow>
                                    <Category />
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                      <strong>Category:</strong> {campaign.category || 'General'}
                                    </Typography>
                                  </StatRow>

                                  <StatRow>
                                    <Event />
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                      <strong>Deadline:</strong> {formatDate(campaign.deadline)}
                                    </Typography>
                                  </StatRow>

                                  <StatRow>
                                    <RemoveRedEye />
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                      <strong>Views:</strong> {formatViews(realViews)}
                                    </Typography>
                                    {realViews > 1000 && (
                                      <ViewCountBadge>
                                        <TrendingUp sx={{ fontSize: '14px', mr: 0.5 }} />
                                        Trending
                                      </ViewCountBadge>
                                    )}
                                  </StatRow>

                                  {/* Likes Count Row (DISPLAY ONLY - no button) */}
                                  <StatRow>
                                    <Favorite
                                      sx={{
                                        fontSize: '16px',
                                        color: 'text.secondary'
                                      }}
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: '0.875rem',
                                        color: 'text.secondary'
                                      }}
                                    >
                                      <strong>Likes:</strong> {campaign.likes_count || 0}
                                    </Typography>
                                    {(campaign.likes_count > 100) && (
                                      <ViewCountBadge sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: 'error.main' }}>
                                        <TrendingUp sx={{ fontSize: '14px', mr: 0.5 }} />
                                        Popular
                                      </ViewCountBadge>
                                    )}
                                  </StatRow>
                                </Box>

                                {/* Actions */}
                                <Box sx={{
                                  display: 'flex',
                                  gap: 1,
                                  mt: 'auto'
                                }}>
                                  <Tooltip title="View details">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewDetails(campaign)}
                                      sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '8px'
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="View brand profile">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewBrandProfile(brandId)}
                                      sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '8px'
                                      }}
                                    >
                                      <AccountCircle fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <GradientButton
                                    variant="contained"
                                    onClick={() => handleApply(campaign)}
                                    startIcon={<Work />}
                                    className="apply-btn"
                                    sx={{ minWidth: '100px' }}
                                  >
                                    Apply
                                  </GradientButton>
                                </Box>
                              </CardContent>
                            </PremiumCard>
                          </Fade>
                        );
                      })}
                    </CampaignGrid>
                  )}
                </>
              )}
              {activeTab === 'applications' && <InfluencerApplications />}
              {activeTab === 'contracts' && <InfluencerContracts />}

              {/* Add Liked Campaigns Tab */}
              {activeTab === 'liked' && (
                <>
                  {campaigns.filter(c => c.user_liked).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        No Liked Campaigns
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Campaigns you like will appear here. Start exploring and like campaigns that interest you!
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveTab('available')}
                        startIcon={<Campaign />}
                      >
                        Browse Campaigns
                      </Button>
                    </Box>
                  ) : (
                    <CampaignGrid>
                      {campaigns
                        .filter(c => c.user_liked)
                        .map((campaign, index) => {
                          const currency = getCampaignCurrency(campaign);
                          const brandId = campaign.brand_id || campaign.brand?._id;
                          const realViews = getRealViewCount(campaign);

                          // Handle like toggle for liked campaigns
                          const handleLikeToggle = async (e) => {
                            e.stopPropagation();
                            try {
                              const response = await campaignAPI.toggleLike(campaign._id, false);

                              // Remove from liked list by updating local state
                              setCampaigns(prev => prev.map(c =>
                                c._id === campaign._id
                                  ? {
                                    ...c,
                                    user_liked: false,
                                    likes_count: response.likes_count
                                  }
                                  : c
                              ));
                            } catch (error) {
                              console.error('Error toggling like:', error);
                            }
                          };

                          // Handle bookmark toggle for liked campaigns
                          const handleBookmarkToggle = async (e) => {
                            e.stopPropagation();
                            try {
                              const newBookmarkState = !campaign.user_bookmarked;
                              await campaignAPI.toggleBookmark(campaign._id, newBookmarkState);

                              setCampaigns(prev => prev.map(c =>
                                c._id === campaign._id
                                  ? { ...c, user_bookmarked: newBookmarkState }
                                  : c
                              ));
                            } catch (error) {
                              console.error('Error toggling bookmark:', error);
                            }
                          };

                          return (
                            <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={campaign._id}>
                              <PremiumCard className="campaign-card" data-campaign-id={campaign._id}>
                                {/* Campaign Image with Like/Bookmark Overlay */}
                                <Box sx={{ position: 'relative' }}>
                                  <CampaignImage
                                    fileId={campaign.campaign_image_id}
                                    alt={campaign.title}
                                    onClick={() => handleImageClick(campaign)}
                                    height={200}
                                  />

                                  {/* Like and Bookmark buttons overlay */}
                                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                                    {/* Bookmark Button */}
                                    <Tooltip title={campaign.user_bookmarked ? "Remove bookmark" : "Bookmark campaign"}>
                                      <IconButton
                                        size="small"
                                        onClick={handleBookmarkToggle}
                                        sx={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          color: campaign.user_bookmarked ? 'primary.main' : 'text.secondary'
                                        }}
                                      >
                                        {campaign.user_bookmarked ? <Bookmark /> : <BookmarkBorder />}
                                      </IconButton>
                                    </Tooltip>

                                    {/* Like Button - Already liked in this tab */}
                                    <Tooltip title="Unlike">
                                      <IconButton
                                        size="small"
                                        onClick={handleLikeToggle}
                                        sx={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          color: 'error.main'
                                        }}
                                      >
                                        <Favorite />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                  {/* Header with title and status */}
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        lineHeight: 1.3,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flex: 1,
                                        mr: 1
                                      }}
                                    >
                                      {campaign.title}
                                    </Typography>
                                    <StatusChip
                                      label={campaign.status || 'Active'}
                                      status={campaign.status}
                                      size="small"
                                    />
                                  </Box>

                                  {/* Brand Information */}
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mb={1.5}
                                    sx={{
                                      p: 1,
                                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: 'rgba(102, 126, 234, 0.12)',
                                      }
                                    }}
                                    onClick={() => handleViewBrandProfile(brandId)}
                                  >
                                    <UserInfo
                                      userId={brandId}
                                      profileType="brand"
                                      showEmail={false}
                                      showRating={true}
                                      size={36}
                                    />
                                  </Box>

                                  {/* Description */}
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      mb: 2,
                                      flexGrow: 1,
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {campaign.description}
                                  </Typography>

                                  <Divider sx={{ my: 1.5 }} />

                                  {/* Stats section */}
                                  <Box sx={{ mb: 2 }}>
                                    <StatRow>
                                      <AttachMoney />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Budget:</strong> {formatCurrency(campaign.budget, currency)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Category />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Category:</strong> {campaign.category || 'General'}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Event />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Deadline:</strong> {formatDate(campaign.deadline)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <RemoveRedEye />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Views:</strong> {formatViews(realViews)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Favorite sx={{ fontSize: '16px', color: 'error.main' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'error.main' }}>
                                        <strong>Likes:</strong> {campaign.likes_count || 0}
                                      </Typography>
                                    </StatRow>
                                  </Box>

                                  {/* Actions */}
                                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Tooltip title="View details">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(campaign)}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="View brand profile">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewBrandProfile(brandId)}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        <AccountCircle fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <GradientButton
                                      variant="contained"
                                      onClick={() => handleApply(campaign)}
                                      startIcon={<Work />}
                                      className="apply-btn"
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Apply
                                    </GradientButton>
                                  </Box>
                                </CardContent>
                              </PremiumCard>
                            </Fade>
                          );
                        })}
                    </CampaignGrid>
                  )}
                </>
              )}

              {/* Add Bookmarked Campaigns Tab */}
              {activeTab === 'bookmarked' && (
                <>
                  {campaigns.filter(c => c.user_bookmarked).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Bookmark sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>
                        No Bookmarked Campaigns
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Campaigns you bookmark will appear here. Save campaigns to review them later!
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setActiveTab('available')}
                        startIcon={<Campaign />}
                      >
                        Browse Campaigns
                      </Button>
                    </Box>
                  ) : (
                    <CampaignGrid>
                      {campaigns
                        .filter(c => c.user_bookmarked)
                        .map((campaign, index) => {
                          const currency = getCampaignCurrency(campaign);
                          const brandId = campaign.brand_id || campaign.brand?._id;
                          const realViews = getRealViewCount(campaign);

                          // Handle like toggle for bookmarked campaigns
                          const handleLikeToggle = async (e) => {
                            e.stopPropagation();
                            try {
                              const newLikeState = !campaign.user_liked;
                              const response = await campaignAPI.toggleLike(campaign._id, newLikeState);

                              setCampaigns(prev => prev.map(c =>
                                c._id === campaign._id
                                  ? {
                                    ...c,
                                    user_liked: newLikeState,
                                    likes_count: response.likes_count
                                  }
                                  : c
                              ));
                            } catch (error) {
                              console.error('Error toggling like:', error);
                            }
                          };

                          // Handle bookmark toggle for bookmarked campaigns
                          const handleBookmarkToggle = async (e) => {
                            e.stopPropagation();
                            try {
                              await campaignAPI.toggleBookmark(campaign._id, false);

                              // Remove from bookmarked list by updating local state
                              setCampaigns(prev => prev.map(c =>
                                c._id === campaign._id
                                  ? { ...c, user_bookmarked: false }
                                  : c
                              ));
                            } catch (error) {
                              console.error('Error toggling bookmark:', error);
                            }
                          };

                          return (
                            <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={campaign._id}>
                              <PremiumCard className="campaign-card" data-campaign-id={campaign._id}>
                                {/* Campaign Image with Like/Bookmark Overlay */}
                                <Box sx={{ position: 'relative' }}>
                                  <CampaignImage
                                    fileId={campaign.campaign_image_id}
                                    alt={campaign.title}
                                    onClick={() => handleImageClick(campaign)}
                                    height={200}
                                  />

                                  {/* Like and Bookmark buttons overlay */}
                                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                                    {/* Bookmark Button - Already bookmarked in this tab */}
                                    <Tooltip title="Remove bookmark">
                                      <IconButton
                                        size="small"
                                        onClick={handleBookmarkToggle}
                                        sx={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          color: 'primary.main'
                                        }}
                                      >
                                        <Bookmark />
                                      </IconButton>
                                    </Tooltip>

                                    {/* Like Button */}
                                    <Tooltip title={campaign.user_liked ? "Unlike" : "Like"}>
                                      <IconButton
                                        size="small"
                                        onClick={handleLikeToggle}
                                        sx={{
                                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                                          color: campaign.user_liked ? 'error.main' : 'text.secondary'
                                        }}
                                      >
                                        {campaign.user_liked ? <Favorite /> : <FavoriteBorder />}
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                  {/* Header with title and status */}
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        lineHeight: 1.3,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flex: 1,
                                        mr: 1
                                      }}
                                    >
                                      {campaign.title}
                                    </Typography>
                                    <StatusChip
                                      label={campaign.status || 'Active'}
                                      status={campaign.status}
                                      size="small"
                                    />
                                  </Box>

                                  {/* Brand Information */}
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mb={1.5}
                                    sx={{
                                      p: 1,
                                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: 'rgba(102, 126, 234, 0.12)',
                                      }
                                    }}
                                    onClick={() => handleViewBrandProfile(brandId)}
                                  >
                                    <UserInfo
                                      userId={brandId}
                                      profileType="brand"
                                      showEmail={false}
                                      showRating={true}
                                      size={36}
                                    />
                                  </Box>

                                  {/* Description */}
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      mb: 2,
                                      flexGrow: 1,
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {campaign.description}
                                  </Typography>

                                  <Divider sx={{ my: 1.5 }} />

                                  {/* Stats section */}
                                  <Box sx={{ mb: 2 }}>
                                    <StatRow>
                                      <AttachMoney />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Budget:</strong> {formatCurrency(campaign.budget, currency)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Category />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Category:</strong> {campaign.category || 'General'}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Event />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Deadline:</strong> {formatDate(campaign.deadline)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <RemoveRedEye />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <strong>Views:</strong> {formatViews(realViews)}
                                      </Typography>
                                    </StatRow>

                                    <StatRow>
                                      <Favorite sx={{ fontSize: '16px', color: campaign.user_liked ? 'error.main' : 'text.secondary' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: campaign.user_liked ? 'error.main' : 'text.secondary' }}>
                                        <strong>Likes:</strong> {campaign.likes_count || 0}
                                      </Typography>
                                    </StatRow>
                                  </Box>

                                  {/* Actions */}
                                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                    <Tooltip title="View details">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewDetails(campaign)}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip title="View brand profile">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewBrandProfile(brandId)}
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        <AccountCircle fontSize="small" />
                                      </IconButton>
                                    </Tooltip>

                                    <GradientButton
                                      variant="contained"
                                      onClick={() => handleApply(campaign)}
                                      startIcon={<Work />}
                                      className="apply-btn"
                                      sx={{ minWidth: '100px' }}
                                    >
                                      Apply
                                    </GradientButton>
                                  </Box>
                                </CardContent>
                              </PremiumCard>
                            </Fade>
                          );
                        })}
                    </CampaignGrid>
                  )}
                </>
              )}
            </div>

            {/* Application Dialog */}
            <Dialog
              open={!!applyingCampaign}
              onClose={cancelApply}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Apply to Campaign
              </DialogTitle>
              <DialogContent>
                {applyingCampaign && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {applyingCampaign.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {applyingCampaign.brand_name || applyingCampaign.brand?.name}
                    </Typography>

                    <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                      Budget: {formatCurrency(applyingCampaign.budget, getCampaignCurrency(applyingCampaign))}
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Message (Optional)"
                      value={applicationMessage}
                      onChange={(e) => setApplicationMessage(e.target.value)}
                      placeholder="Tell the brand why you're a good fit for this campaign..."
                    />
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={cancelApply}
                  disabled={applying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApplication}
                  variant="contained"
                  disabled={applying}
                  startIcon={applying ? <CircularProgress size={16} /> : <Send />}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogActions>
            </Dialog>



            {/* Campaign Details Dialog */}
            <Dialog
              open={detailDialogOpen}
              onClose={() => setDetailDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                Campaign Details
              </DialogTitle>
              <DialogContent dividers>
                {selectedCampaign && (
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {selectedCampaign.title}
                    </Typography>

                    {/* Brand Information */}
                    <Box
                      display="flex"
                      alignItems="center"
                      mb={3}
                      sx={{
                        p: 2,
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.12)',
                        }
                      }}
                      onClick={() => handleViewBrandProfile(selectedCampaign.brand_id || selectedCampaign.brand?._id)}
                    >
                      <UserInfo
                        userId={selectedCampaign.brand_id || selectedCampaign.brand?._id}
                        profileType="brand"
                        showEmail={true}
                        showRating={true}
                        size={50}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <StatusChip
                        label={selectedCampaign.status || 'Active'}
                        status={selectedCampaign.status}
                        size="medium"
                      />
                    </Box>

                    <Typography variant="body1" paragraph>
                      {selectedCampaign.description}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <StatRow>
                          <AttachMoney />
                          <Typography variant="body2">
                            <strong>Budget:</strong> {formatCurrency(selectedCampaign.budget, getCampaignCurrency(selectedCampaign))}
                          </Typography>
                        </StatRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StatRow>
                          <Category />
                          <Typography variant="body2">
                            <strong>Category:</strong> {selectedCampaign.category || 'General'}
                          </Typography>
                        </StatRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StatRow>
                          <Event />
                          <Typography variant="body2">
                            <strong>Deadline:</strong> {formatDate(selectedCampaign.deadline)}
                          </Typography>
                        </StatRow>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <StatRow>
                          <RemoveRedEye />
                          <Typography variant="body2">
                            <strong>Views:</strong> {formatViews(getRealViewCount(selectedCampaign))}
                          </Typography>
                        </StatRow>
                      </Grid>
                    </Grid>

                    {selectedCampaign.requirements && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Requirements:
                        </Typography>
                        <Typography variant="body2">
                          {selectedCampaign.requirements}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* <Button
                    variant="outlined"
                    startIcon={<Send />}
                    onClick={() => handleQuickMessage(selectedCampaign)}
                  >
                    Quick Message
                  </Button> */}
                  <Button
                    variant="contained"
                    onClick={() => {
                      setDetailDialogOpen(false);
                      handleApply(selectedCampaign);
                    }}
                  >
                    Apply Now
                  </Button>
                </Box>
              </DialogActions>
            </Dialog>

            {/* Quick Message Dialog */}


            {/* Media Submission Dialog */}
            <MediaSubmissionDialog
              open={mediaSubmissionDialogOpen}
              onClose={() => setMediaSubmissionDialogOpen(false)}
              application={selectedApplicationForMedia}
              onSubmitMedia={handleSubmitMedia}
            />

            {/* Contract Acceptance Dialog */}
            <ContractAcceptanceDialog
              open={contractAcceptanceDialogOpen}
              onClose={() => setContractAcceptanceDialogOpen(false)}
              application={selectedApplicationForContract}
              onAcceptContract={handleAcceptContract}
            />

            {/* Campaign Details Dialog */}
            {/* <CampaignDetailDialog
  open={detailDialogOpen}
  onClose={() => setDetailDialogOpen(false)}
  campaign={selectedCampaign}
  onApply={handleApply}
/> */}

            {/* Campaign Detail Dialog */}
            {/* Campaign Detail Dialog */}
            {selectedCampaign && (
              <CampaignDetailDialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                campaign={selectedCampaign}
                onApply={() => handleApply(selectedCampaign)}
                openBankDialog={bankDialogOpen}
                setOpenBankDialog={setBankDialogOpen}
              />
            )}

            {/* Add Bank Account Dialog */}
            <AddBankAccountDialog
              open={bankDialogOpen}
              onClose={() => setBankDialogOpen(false)}
              onSuccess={() => {
                setBankDialogOpen(false);

                if (selectedCampaign) {
                  campaignAPI.applyToCampaign(selectedCampaign._id);
                  setSelectedCampaign(null);
                }
              }}
            />



            {/* Image Modal */}
            <ImageModal
              open={imageModalOpen}
              onClose={() => setImageModalOpen(false)}
              imageUrl={selectedImage ?
                `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/campaigns/image/${selectedImage}`
                : ''}
              alt={selectedCampaign?.title || 'Campaign Image'}
            />

            {/* Success/Error Snackbar */}
            {/* Success/Error Snackbar */}
            <Snackbar
              open={!!error || !!success}
              autoHideDuration={5000}
              onClose={handleCloseSnackbar}
              sx={{
                zIndex: 9999, // Increase z-index to appear above everything
                '& .MuiSnackbar-root': {
                  zIndex: 9999,
                },
                '& .MuiAlert-root': {
                  zIndex: 9999,
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Optional: control position
            >
              <Alert
                onClose={handleCloseSnackbar}
                severity={error ? 'error' : 'success'}
                variant="filled"
                sx={{
                  zIndex: 9999,
                  boxShadow: 24, // Add elevation for better visibility
                  minWidth: '300px' // Ensure minimum width
                }}
              >
                {error || success}
              </Alert>
            </Snackbar>

            {/* Floating Action Button for Mobile */}
            <Zoom in={!detailDialogOpen && !applyingCampaign}>
              <Fab
                color="primary"
                aria-label="refresh campaigns"
                onClick={() => {
                  fetchAvailableCampaigns();
                  fetchApplications();
                }}
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  right: 16,
                  display: { xs: 'flex', sm: 'none' }
                }}
                disabled={loading}
              >
                <Refresh />
              </Fab>
            </Zoom>
          </Container>
        </MainContent>
      </Box>
    </Box>
  );
};

export default InfluencerCampaigns;