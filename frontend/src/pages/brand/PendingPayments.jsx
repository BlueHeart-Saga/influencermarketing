// PendingPayments.jsx - Enhanced Direct Payments Interface
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  TextField,
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
  Zoom,
  Tooltip,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  InputLabel,
  Stack,
  FormControl,
  Select,
  
  Switch, 
  MenuItem
} from '@mui/material';
import { TabContext, TabPanel } from "@mui/lab";
import {
  CheckCircle,
  AccountBalanceWallet,
  Receipt,
  VerifiedUser,
  Send,
  Close,
  Person,
  Refresh,
  Visibility,
  Download,
  Chat as ChatIcon,
  Language,
  Instagram,
  YouTube,
  LinkedIn,
  Twitter,
  Facebook,
  Home,
  Business,
  Public,
  AttachMoney,
  CalendarToday,
  AutoAwesome,
  Celebration,
  OpenInNew,
  Payment as PaymentIcon,
  History,
  ReceiptLong,
  Security as SecurityIcon,
  Speed,
  FlashOn,Cancel,
  Add,  
  AccountBalance
} from '@mui/icons-material';
import Avatar from "@mui/material/Avatar";
import { accountAPI } from '../../services/api';
import { styled, keyframes } from '@mui/system';
import { format} from 'date-fns';
import { AuthContext } from "../../context/AuthContext";
import { CurrencyContext } from "../../context/CurrencyContext"; // Add this import
import { paymentsAPI } from "../../services/paymentAPI";
import { campaignAPI } from '../../services/api';
import profileAPI from '../../services/profileAPI';
import BrandAccountDetails from './BrandAccountDetails'; 

// =============================================
// 💱 CURRENCY CONFIGURATION
// =============================================

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
  0% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
  100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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
  border: updated ? '2px solid #4CAF50' : '1px solid rgba(0, 0, 0, 0.06)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  overflow: 'visible',
  animation: updated ? `${glowAnimation} 2s ease infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)',
   
  }
}));

const StatsCard = styled(Card)(({ theme, updated }) => ({
  background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
  color: 'white',
  padding: theme.spacing(2),
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
  ...(status === 'bank_verified' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'bank_unverified' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'no_bank' && {
    background: 'linear-gradient(135deg, #757575, #9E9E9E)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(117, 117, 117, 0.3)'
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

const GradientButton = styled(Button)(({ theme, disabled }) => ({
  background: disabled 
    ? 'linear-gradient(135deg, #BDBDBD, #9E9E9E)'
    : 'linear-gradient(135deg, #667eea 0%, #004499 100%)',
  color: 'white',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: disabled 
    ? '0 4px 14px rgba(158, 158, 158, 0.4)'
    : '0 4px 14px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: disabled 
      ? '0 6px 20px rgba(158, 158, 158, 0.6)'
      : '0 6px 20px rgba(102, 126, 234, 0.6)',
    transform: disabled ? 'none' : 'translateY(-2px)',
    background: disabled 
      ? 'linear-gradient(135deg, #BDBDBD, #9E9E9E)'
      : 'linear-gradient(135deg, #5a6fd8 0%, #004499 100%)'
  }
}));

const AmountInput = styled(TextField)(({ theme, error }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
    fontSize: '1.1rem',
    fontWeight: 600,
    animation: error ? `${shakeAnimation} 0.5s ease` : 'none',
    '&:hover fieldset': {
      
    },
    '&.Mui-focused fieldset': {
      borderWidth: 2,
    },
  },
}));

// =============================================
// 👤 PROFILE IMAGE COMPONENT (Reused from StripePayment)
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
          background: 'linear-gradient(135deg, #667eea 0%, #004499 100%)',
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
  if (typeof profileData?.username === 'string') return profileData.username;
  if (typeof profileData?.full_name === 'string') return profileData.full_name;
  if (typeof profileData?.company_name === 'string') return profileData.company_name;
  return typeof userName === 'string' ? userName : 'Unknown User';
};

  const getDisplayTitle = () => {
  if (typeof profileData?.title === 'string') return profileData.title;
  if (typeof profileData?.bio === 'string') return profileData.bio.substring(0, 50) + (profileData.bio.length > 50 ? '...' : '');
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
              '&:hover': {  textDecoration: 'underline' }
            }}
            onClick={handleViewProfile}
            noWrap
          >
            {getDisplayName()}
          </Typography>
          
          {profileData?.verified && (
            <Tooltip title="Verified Profile">
              <VerifiedUser sx={{ fontSize: 16}} />
            </Tooltip>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {getDisplayTitle()}
        </Typography>

        {showEmail && typeof profileData?.email === 'string' && (
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
              <Typography variant="caption"  fontWeight="600">
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
// 🏦 BANK ACCOUNT DETAILS COMPONENT
// =============================================

const BankAccountDetails = ({ bankAccount, application }) => {
  if (!bankAccount) {
    return (
      <Box sx={{ p: 2, background: 'linear-gradient(135deg, #FFEBEE, #FFCDD2)', borderRadius: 2 }}>
        <Typography variant="body2" color="error" fontWeight="600" display="flex" alignItems="center" gap={1}>
          <AccountBalance />
          No Bank Account Added
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Influencer needs to add bank details for direct payment
        </Typography>
      </Box>
    );
  }

  const isVerified = bankAccount.verified || bankAccount.status === 'verified';
  const status = isVerified ? 'bank_verified' : 'bank_unverified';

  return (
    <Box sx={{ animation: `${fadeIn} 0.3s ease` }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="600">
          Bank Details
        </Typography>
        <StatusChip 
          label={isVerified ? "Verified" : "Unverified"} 
          status={status}
          size="small"
        />
      </Box>
      
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance sx={{ fontSize: 18 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Bank Name
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {bankAccount.bank_name || 'Unknown Bank'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Account Holder
            </Typography>
            <Typography variant="body2" fontWeight="600">
              {bankAccount.account_holder_name || application?.influencer_name || 'N/A'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Account Number
            </Typography>
            <Typography variant="body2" fontWeight="600" fontFamily="monospace">
              ****{bankAccount.last4 || bankAccount.last_4_digits || 'XXXX'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Routing Number
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              {bankAccount.routing_number ? `****${bankAccount.routing_number.slice(-4)}` : 'N/A'}
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Account Type
            </Typography>
            <Typography variant="body2">
              {bankAccount.account_type || 'Checking'}
            </Typography>
          </Box>
        </Grid>
        
        {bankAccount.currency && (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                Currency: <strong>{bankAccount.currency}</strong>
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// =============================================
// 💰 PAYMENT AMOUNT COMPONENT
// =============================================

const PaymentAmountInput = ({ amount, onChange, disabled, maxAmount, currency = 'USD' }) => {
  const [inputError, setInputError] = useState(false);
  const [localAmount, setLocalAmount] = useState(amount || '');

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalAmount(value);
    
    // Validate amount
    if (value && (isNaN(value) || parseFloat(value) <= 0)) {
      setInputError(true);
      onChange?.(null);
    } else if (maxAmount && value && parseFloat(value) > maxAmount) {
      setInputError(true);
      onChange?.(null);
    } else {
      setInputError(false);
      onChange?.(value ? parseFloat(value) : null);
    }
  };

  const handleQuickSelect = (percentage) => {
    if (maxAmount) {
      const quickAmount = maxAmount * percentage;
      setLocalAmount(quickAmount.toFixed(2));
      onChange?.(quickAmount);
      setInputError(false);
    }
  };

  return (
    <Box sx={{ animation: `${slideInUp} 0.3s ease` }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="600">
          Payment Amount
        </Typography>
        {maxAmount && (
          <Typography variant="caption" color="text.secondary">
            Max: {currency} {maxAmount.toFixed(2)}
          </Typography>
        )}
      </Box>

      <AmountInput
        fullWidth
        type="number"
        placeholder={`Enter amount in ${currency}`}
        value={localAmount}
        onChange={handleChange}
        disabled={disabled}
        error={inputError}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AttachMoney sx={{ color: inputError ? 'error' : 'primary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Typography variant="body2" color="text.secondary">
                {currency}
              </Typography>
            </InputAdornment>
          ),
        }}
        helperText={inputError 
          ? maxAmount && localAmount > maxAmount 
            ? `Amount exceeds maximum of ${currency} ${maxAmount.toFixed(2)}`
            : 'Please enter a valid amount'
          : ''
        }
      />

      {maxAmount && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Quick Select:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {[0.25, 0.5, 0.75, 1].map((percentage) => (
              <Chip
                key={percentage}
                label={`${percentage * 100}% (${currency} ${(maxAmount * percentage).toFixed(2)})`}
                size="small"
                onClick={() => handleQuickSelect(percentage)}
                sx={{
                  borderRadius: '8px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.2)',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// =============================================
// 🏦 BRAND BANK ACCOUNT DIALOG COMPONENT
// =============================================




// =============================================
// 🎯 MAIN PENDING PAYMENTS COMPONENT
// =============================================

const PendingPayments = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [applications, setApplications] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [updatedItems, setUpdatedItems] = useState(new Set());

  const [brandBankAccounts, setBrandBankAccounts] = useState([]);
const [brandAccountStatus, setBrandAccountStatus] = useState(null);
const [brandBankDialogOpen, setBrandBankDialogOpen] = useState(false);
const [loadingBrandAccounts, setLoadingBrandAccounts] = useState(false);
const [paymentInProgress, setPaymentInProgress] = useState(false);

const [showBrandAccountDialog, setShowBrandAccountDialog] = useState(false);

  // Real-time updates
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

  // Calculate converted amounts
  const calculateConvertedAmount = (originalAmount, originalCurrency = 'USD') => {
    if (!originalAmount || !rates || !currency) return originalAmount;
    
    if (rates[originalCurrency] && rates[currency]) {
      const amountInGBP = originalAmount / rates[originalCurrency];
      return amountInGBP * rates[currency];
    }
    
    return originalAmount;
  };

  // Format currency with conversion
  const formatCurrency = (amount, originalCurrency = 'USD') => {
    if (!amount) return 'N/A';
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const convertedAmount = calculateConvertedAmount(amount, originalCurrency);
    return `${symbol}${convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format original currency display
  const formatOriginalCurrency = (amount, originalCurrency) => {
    if (!amount) return 'N/A';
    const symbol = CURRENCY_SYMBOLS[originalCurrency] || originalCurrency;
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Calculate stats with currency conversion
  const stats = {
    pendingPayments: applications.length,
    totalPayments: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    pendingAmount: applications.reduce((sum, app) => 
      sum + calculateConvertedAmount(app.amount_due || 0, app.currency || 'USD'), 0),
    totalAmount: paymentHistory.reduce((sum, payment) => 
      sum + calculateConvertedAmount(payment.amount || 0, payment.currency || 'USD'), 0)
  };

  // Enhanced breadcrumbs
  const breadcrumbs = [
    <Button 
      key="1" 
      onClick={() => navigate('/brand/dashboard')}
      sx={{ textDecoration: 'none', color: 'inherit' }}
      startIcon={<Home />}
    >
      Dashboard
    </Button>,
    <Typography key="2" color="primary" fontWeight="600">
      Direct Payments
    </Typography>,
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Polling for real-time updates
  useEffect(() => {
    if (activeTab === 'pending' && applications.length > 0) {
      const interval = setInterval(() => {
        checkForUpdates();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeTab, applications.length]);

  const checkForUpdates = async () => {
    try {
      const res = await paymentsAPI.getPendingDirectPayments();
      const newApps = res.applications || [];

      
      newApps.forEach(newApp => {
        const existingApp = applications.find(app => 
          app.application_id === newApp.application_id
        );
        
        if (existingApp && existingApp.status !== newApp.status) {
          console.log(`🔄 Status changed: ${existingApp.status} → ${newApp.status}`);
          markAsUpdated(newApp.application_id);
        }
      });
    } catch (err) {
      console.error('Error checking for updates:', err);
    }
  };

  // Load brand's bank accounts
// Update the loadBrandBankAccounts function:
const loadBrandBankAccounts = async () => {
  try {
    setLoadingBrandAccounts(true);
    const response = await accountAPI.getBankAccounts();
    
    // Handle different response formats
    let accounts = [];
    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        accounts = response;
      } else if (response.data && Array.isArray(response.data)) {
        accounts = response.data;
      } else if (response.bank_accounts && Array.isArray(response.bank_accounts)) {
        accounts = response.bank_accounts;
      }
    }
    
    setBrandBankAccounts(accounts);
    
    // Also get account status
    try {
      const statusResponse = await accountAPI.getBankAccountStatus();
      setBrandAccountStatus(statusResponse.data);
    } catch (statusErr) {
      console.error('Error loading account status:', statusErr);
    }
    
    return accounts;
  } catch (err) {
    console.error('Error loading brand bank accounts:', err);
    setBrandBankAccounts([]);
    return [];
  } finally {
    setLoadingBrandAccounts(false);
  }
};

// Call this when component mounts
useEffect(() => {
  loadBrandBankAccounts();
}, []);

  // In the loadData function, update:
const loadData = async (showRefresh = false) => {
  try {
    if (showRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError('');
    
    // Load pending payments
    const pendingRes = await paymentsAPI.getPendingDirectPayments();
    console.log('🔄 Loading pending payments response:', pendingRes);
    
    // FIX: Handle validation errors and nested data properly
    let pendingApps = [];
    
    if (pendingRes && typeof pendingRes === 'object') {
      if (Array.isArray(pendingRes)) {
        // Response is already an array
        pendingApps = pendingRes;
      } else if (pendingRes.applications && Array.isArray(pendingRes.applications)) {
        // Response has applications array
        pendingApps = pendingRes.applications;
      } else if (pendingRes.data && Array.isArray(pendingRes.data.applications)) {
        // Response has nested data.applications array
        pendingApps = pendingRes.data.applications;
      } else if (pendingRes.detail) {
        // This is a validation error response
        console.error('API Validation Error:', pendingRes.detail);
        setError(`API Error: ${JSON.stringify(pendingRes.detail)}`);
      }
    }
    
    console.log('✅ Parsed applications:', pendingApps);
    setApplications(pendingApps);

    // Load payment history with similar error handling
    try {
      const historyRes = await paymentsAPI.getDirectPaymentHistory();
      console.log('💰 Payment history response:', historyRes);
      
      let historyData = [];
      
      if (historyRes && typeof historyRes === 'object') {
        if (Array.isArray(historyRes)) {
          historyData = historyRes;
        } else if (historyRes.payments && Array.isArray(historyRes.payments)) {
          historyData = historyRes.payments;
        } else if (historyRes.data && Array.isArray(historyRes.data)) {
          historyData = historyRes.data;
        } else if (historyRes.detail) {
          console.error('History API Error:', historyRes.detail);
        }
      }
      
      setPaymentHistory(historyData);
    } catch (paymentError) {
      console.error('Error loading payment history:', paymentError);
      setPaymentHistory([]);
    }

  } catch (err) {
    console.error('❌ Error loading data:', err);
    const errorMsg = err.response?.data?.detail || err.message || 'Failed to load data. Please try again.';
    setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    setApplications([]);
    setPaymentHistory([]);
  } finally {
    setLoading(false);
    setIsRefreshing(false);
  }
};



  const handlePay = async (application) => {
  // First check if brand has bank accounts
  const brandAccounts = brandBankAccounts.length > 0 ? brandBankAccounts : await loadBrandBankAccounts();
  
  if (!brandAccounts || brandAccounts.length === 0) {
    // No brand bank account - show the BrandAccountDetails dialog
    setSelectedApplication(application);
    setShowBrandAccountDialog(true);
    return;
  }

  // Check if brand has a primary account
  const hasPrimary = brandAccounts.some(acc => acc.is_primary);
  if (!hasPrimary) {
    setError('Please set a primary bank account for your business before making payments');
    setSelectedApplication(application);
    setShowBrandAccountDialog(true);
    return;
  }

  // Rest of your existing payment logic...
  const amount = amounts[application.application_id] || application.amount_due;
  const bankAccount = application.bank_account;

  if (!amount || amount <= 0) {
    setError('Please enter a valid amount');
    return;
  }

  if (!bankAccount || !bankAccount.verified) {
    setError('Influencer bank account is not verified');
    return;
  }

  try {
    setPayingId(application.application_id);
    setError('');

    const response = await paymentsAPI.directPayInfluencer(
      application.campaign_id,
      application.influencer.id,
      Number(amount)
    );

    console.log('✅ Payment successful:', response);
    
    // Show success message
    setSuccess(`Successfully paid ${application.influencer.name} ${application.currency || 'USD'} ${amount}`);
    setShowSuccessToast(true);
    
    // Mark as updated
    markAsUpdated(application.application_id);
    
    // Remove from pending
    setApplications(prev => prev.filter(app => 
      app.application_id !== application.application_id
    ));
    
    // Add to history
    const newPayment = {
      id: `payment-${Date.now()}`,
      application_id: application.application_id,
      influencer_name: application.influencer.name,
      campaign_title: application.campaign_title,
      amount: amount,
      currency: application.currency || 'USD',
      status: 'completed',
      created_at: new Date().toISOString(),
      transaction_id: response.data?.transaction_id || `txn_${Date.now()}`
    };
    
    setPaymentHistory(prev => [newPayment, ...prev]);

    // Clear amount
    setAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[application.application_id];
      return newAmounts;
    });

  } catch (err) {
    console.error('❌ Payment failed:', err);
    const errorMsg = err.response?.data?.detail || err.message || 'Payment failed. Please try again.';
    setError(errorMsg);
    markAsUpdated(`error-${application.application_id}`);
  } finally {
    setPayingId(null);
    setPaymentInProgress(false);
  }
};

const handleBrandAccountAdded = () => {
  setShowBrandAccountDialog(false);
  // Refresh bank accounts
  loadBrandBankAccounts();
  // If there was a pending payment, you could automatically retry
  if (selectedApplication) {
    // Optionally auto-fill the amount and show a success message
    setSuccess('Bank account added! You can now proceed with payment.');
    setShowSuccessToast(true);
  }
};


const handleAddBrandBankAccount = () => {
  // This will now open the dialog instead of navigating
  setBrandBankDialogOpen(true);
};

const handleAddBankAccountFromDialog = async (formData) => {
  try {
    setLoadingBrandAccounts(true);
    const response = await accountAPI.createBankAccount(formData);
    console.log('Bank account created:', response);
    
    // Refresh the bank accounts list
    await loadBrandBankAccounts();
    
    // Close the dialog
    setBrandBankDialogOpen(false);
    setPaymentInProgress(false);
    
    // Show success message
    setSuccess('Bank account added successfully! You can now make payments.');
    setShowSuccessToast(true);
    
    // If there was a selected application, you might want to proceed with payment
    if (selectedApplication) {
      // Optionally auto-fill the amount and proceed
      handleAmountChange(selectedApplication.application_id, selectedApplication.amount_due);
      // You could also automatically trigger the payment here if needed
    }
    
  } catch (err) {
    console.error('Error adding bank account:', err);
    setError(err.response?.data?.detail || 'Failed to add bank account. Please try again.');
  } finally {
    setLoadingBrandAccounts(false);
  }
};

  const handleViewProfile = (profileData) => {
    setSelectedProfile(profileData);
    setProfileDialogOpen(true);
  };

  const handleChat = (profileData) => {
    navigate(`/brand/collaborations?user=${profileData._id || profileData.id}&name=${encodeURIComponent(profileData.username || profileData.name)}`);
  };

  const handleAmountChange = (applicationId, amount) => {
    setAmounts(prev => ({
      ...prev,
      [applicationId]: amount
    }));
  };

  // const formatCurrency = (amount, currency = 'USD') => {
  //   if (!amount) return 'N/A';
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: currency
  //   }).format(amount);
  // };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const getBankStatus = (bankAccount) => {
  if (!bankAccount) return 'no_bank';
  
  // Handle different possible formats
  const isVerified = bankAccount.verified === true || 
                     bankAccount.verified === 'true' || 
                     bankAccount.status === 'verified';
  
  return isVerified ? 'bank_verified' : 'bank_unverified';
};

  const isRecentlyUpdated = (itemId) => updatedItems.has(itemId);

  // Calculate stats
  // const stats = {
  //   pendingPayments: applications.length,
  //   totalPayments: paymentHistory.length,
  //   completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
  //   pendingAmount: applications.reduce((sum, app) => sum + (app.amount_due || 0), 0),
  //   totalAmount: paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  // };

  if (loading && !isRefreshing) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading payment dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{
    py: 4,
    minHeight: '100vh',
    overflowY: 'auto'
  }}>
     

      {/* Header Section */}
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
                Direct Payment Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '600px' }}>
                Send direct bank transfers to influencers with verified accounts
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
              
              {/* Currency Selection */}
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
              
              {/* Total Amount Display */}
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Pending
                </Typography>
                <Typography variant="h4" fontWeight="800">
                  {formatCurrency(stats.pendingAmount)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Across {applications.length} applications
                </Typography>
              </Box>
            </Box>

            {/* Currency Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Applications
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {applications.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {applications.filter(app => app.bank_account?.verified).length} verified
                  </Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Ready to Pay
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    {applications.filter(app => app.bank_account?.verified).length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Verified bank accounts
                  </Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Exchange Rate
                  </Typography>
                  <Typography variant="h5" fontWeight="700">
                    1 GBP = {rates && rates[currency] ? rates[currency].toFixed(2) : '1.00'} {currency}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Live rates from CurrencyContext
                  </Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Currency
                  </Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {CURRENCY_SYMBOLS[currency] || currency} {currency}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {CURRENCY_NAMES[currency] || 'Selected Currency'}
                  </Typography>
                </StatsCard>
              </Grid>
              
<Grid item xs={12} sm={6} md={3}>
  <StatsCard updated={brandBankAccounts.length > 0}>
    <Typography variant="body2" sx={{ opacity: 0.8 }}>
      Business Account
    </Typography>
    <Typography variant="h5" fontWeight="700">
      {brandBankAccounts.length > 0 ? '✓ Added' : '⚠️ Required'}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.7 }}>
      {brandBankAccounts.filter(acc => acc.is_primary).length > 0 
        ? 'Primary set' 
        : brandBankAccounts.length > 0 
          ? 'Set primary account' 
          : 'Add account to pay'
      }
    </Typography>
  </StatsCard>
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
      {error && (
  <Alert 
    severity="error" 
    sx={{ mb: 3, borderRadius: '12px' }} 
    onClose={() => setError('')}
  >
    {typeof error === 'string' ? error : JSON.stringify(error)}
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

        {/* PENDING PAYMENTS TAB */}
        <TabPanel value="pending" sx={{ p: 0 }}>
          <Grid container spacing={4}>
            {/* Main Content */}
            <Grid item xs={12} lg={8}>
              <PaymentCard updated={isRecentlyUpdated('pending-section')}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: '700', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOn color="primary" />
                    Ready for Direct Payment
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
                        const isUpdated = isRecentlyUpdated(application.application_id);
                        const bankAccount = application.bank_account;
                        const bankStatus = getBankStatus(bankAccount);
                        const isPayable = bankAccount?.verified && amounts[application.application_id] > 0;
                        
                        return (
                          <Grid item key={application.application_id} sx={{ display: "flex", justifyContent: "center" }}>
                            <Zoom in={true} style={{ transitionDelay: isUpdated ? '0ms' : '100ms' }}>
                              <ProfessionalCard updated={isUpdated}>
                                <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                                  {/* Header with Influencer Info */}
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box flex={1}>
                                      <UserInfo
                                        userId={application.influencer?.id}
                                        profileType="influencer"
                                        showEmail={false}
                                        showStats={true}
                                        size={44}
                                        userName={application.influencer?.name}
                                        onViewProfile={handleViewProfile}
                                        onChat={handleChat}
                                      />
                                    </Box>
                                    <StatusChip 
                                      label={bankStatus === 'bank_verified' ? 'Ready to Pay' : 
                                             bankStatus === 'bank_unverified' ? 'Bank Unverified' : 'No Bank'}
                                      status={bankStatus}
                                      size="small"
                                    />
                                  </Box>

                                  {/* Campaign Details */}
                                  <Box mb={3}>
                                    <Typography variant="h6" fontWeight="700" color="primary" gutterBottom>
                                      {application.campaign_title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      Campaign ID: {application.campaign_id}
                                    </Typography>
                                    
                                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mt={1}>
                                      <Box display="flex" alignItems="center" gap={0.5}>
                                        <AttachMoney sx={{ fontSize: 18, color: 'success' }} />
                                        <Typography variant="body1" fontWeight="700" >
                                          Due: {application.currency || 'USD'} {application.amount_due?.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box display="flex" alignItems="center" gap={0.5}>
                                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary">
                                          Applied: {application.applied_date ? formatDate(application.applied_date) : 'N/A'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Bank Account Details */}
                                  <Box mb={3}>
                                    <BankAccountDetails 
                                      bankAccount={bankAccount}
                                      application={application}
                                    />
                                  </Box>

                                  {/* Payment Amount Input */}
                                  <Box mb={3}>
                                    <PaymentAmountInput
                                      amount={amounts[application.application_id]}
                                      onChange={(amount) => handleAmountChange(application.application_id, amount)}
                                      disabled={!bankAccount?.verified || payingId === application.application_id}
                                      maxAmount={application.amount_due}
                                      currency={application.currency}
                                    />
                                  </Box>

                                  {/* Application Status */}
                                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Chip
                                      label={`Status: ${application.status || 'pending'}`}
                                      size="small"
                                      color="default"
                                      sx={{ borderRadius: '8px' }}
                                    />
                                    {application.media_submitted && (
                                      <Chip
                                        label="Media Submitted"
                                        size="small"
                                        color="info"
                                        sx={{ borderRadius: '8px' }}
                                      />
                                    )}
                                  </Box>
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 1, width: '100%', flexDirection: 'column' }}>
                                    {/* Primary Payment Button */}
                                    <GradientButton
                                      size="small"
                                      startIcon={payingId === application.application_id ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                      onClick={() => handlePay(application)}
                                      disabled={!isPayable || payingId === application.application_id}
                                      sx={{ 
                                        borderRadius: '8px', 
                                        fontSize: '0.75rem', 
                                        animation: isUpdated ? `${pulseAnimation} 1s ease infinite` : 'none'
                                      }}
                                    >
                                      {payingId === application.application_id 
                                        ? 'Processing...' 
                                        : `Pay ${formatCurrency(amounts[application.application_id] || application.amount_due, application.currency)}`
                                      }
                                    </GradientButton>

                                    {/* Secondary Actions */}
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                      <ChatLaunch 
                                        userId={application.influencer?.id}
                                        userName={application.influencer?.name}
                                        size="small"
                                      />
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewProfile({
                                          _id: application.influencer?.id,
                                          username: application.influencer?.name,
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

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <PaymentCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Speed color="primary" />
                    Quick Stats & Actions
                  </Typography>

                  {/* Payment Summary */}
                  <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="success.dark" gutterBottom>
                      💰 Payment Summary
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Total Pending:
                      </Typography>
                      <Typography variant="body2" fontWeight="700" color="success.dark">
                        {formatCurrency(stats.pendingAmount)}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Ready to Pay:
                      </Typography>
                      <Typography variant="body2" fontWeight="700" color="success.dark">
                        {applications.filter(app => app.bank_account?.verified).length}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Security Notice */}
                  <Box sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="info.dark" gutterBottom display="flex" alignItems="center" gap={1}>
                      <SecurityIcon /> Secure Direct Payment
                    </Typography>
                    <Typography variant="caption" color="info.dark">
                      All payments are processed securely with bank-level encryption. Funds are transferred directly to the influencer's verified bank account.
                    </Typography>
                  </Box>

                  {/* Quick Tips */}
                  <Box sx={{ p: 2, background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="warning.dark" gutterBottom>
                      ⚡ Quick Tips
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Verify Bank Details" 
                          secondary="Always check bank verification status before payment"
                          primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Use Quick Select" 
                          secondary="Click percentage chips for quick amount selection"
                          primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Chat Before Paying" 
                          secondary="Communicate with influencers for confirmation"
                          primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </CardContent>
              </PaymentCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* PAYMENT HISTORY TAB */}
        <TabPanel value="history" sx={{ p: 0 }}>
          <PaymentCard>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: '700', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Direct Payment History
                <Chip label={paymentHistory.length} size="small" />
              </Typography>

              {paymentHistory.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ReceiptLong sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Payment History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your direct payment history will appear here after processing payments
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell><strong>Influencer</strong></TableCell>
                        <TableCell><strong>Campaign</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Transaction ID</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paymentHistory.map((payment, index) => {
                        const isNew = index === 0 && isRecentlyUpdated(`payment-${payment.id}`);
                        return (
                          <TableRow 
                            key={payment.id || payment.transaction_id} 
                            hover
                            sx={{ 
                              '&:last-child td, &:last-child th': { border: 0 },
                              animation: isNew ? `${slideInUp} 0.5s ease` : 'none',
                              background: isNew ? 'rgba(76, 175, 80, 0.05)' : 'inherit'
                            }}
                          >
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
                              <Typography variant="body2" fontWeight="600">
                                {payment.campaign_title || 'Unknown Campaign'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {payment.campaign_id || payment.application_id}
                              </Typography>
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
                                {payment.transaction_id || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={0.5}>
                                <Tooltip title="View Receipt">
                                  <IconButton size="small">
                                    <Receipt sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
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
              background: 'linear-gradient(135deg, #667eea 0%, #004499 100%)',
              color: 'white',
              fontWeight: 700
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <Person />
                  <Typography variant="h6">
                    {selectedProfile.username || selectedProfile.name}'s Profile
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
                  userId={selectedProfile._id || selectedProfile.id}
                  profileType={selectedProfile.profile_type || 'influencer'}
                  alt={selectedProfile.username || selectedProfile.name}
                  size={80}
                  userData={selectedProfile}
                />
                <Typography variant="h5" fontWeight="700" sx={{ mt: 2 }}>
                  {selectedProfile.username || selectedProfile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProfile.profile_type === 'influencer' ? 'Influencer' : 'Brand'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <ChatLaunch 
                  userId={selectedProfile._id || selectedProfile.id}
                  userName={selectedProfile.username || selectedProfile.name}
                />
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/profile/view/influencer/${selectedProfile._id || selectedProfile.id}`)}
                  startIcon={<OpenInNew />}
                >
                  Full Profile
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        {selectedApplication && (
          <>
            <DialogTitle sx={{ 
              background: '#2563eb',
              color: 'white',
              fontWeight: 700
            }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={1}>
                  <PaymentIcon />
                  <Typography variant="h6">
                    Payment Details
                  </Typography>
                </Box>
                <IconButton onClick={() => setPaymentDialogOpen(false)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {/* Payment details content would go here */}
            </DialogContent>
          </>
        )}
      </Dialog>

       {/* Success Toast */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={6000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            color: 'white',
            fontWeight: 600
          }}
          icon={<Celebration />}
          onClose={() => setShowSuccessToast(false)}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              🎉 Payment Successful!
            </Typography>
            <Typography variant="body2">
              {success}
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

     {/* Brand Account Details Dialog */}
<Dialog
  open={showBrandAccountDialog}
  onClose={() => setShowBrandAccountDialog(false)}
  maxWidth="xl"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '20px',
      height: '90vh', // Makes dialog take most of the viewport height
      maxHeight: '90vh'
    }
  }}
>
  <DialogTitle sx={{ 
    background: 'linear-gradient(135deg, #0066CC 0%, #004499 100%)',
    color: 'white',
    fontWeight: 700,
    py: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Box display="flex" alignItems="center" gap={1}>
      <Business />
      <Typography variant="h5" fontWeight="700">
        Business Bank Account Management
      </Typography>
    </Box>
    <IconButton 
      onClick={() => setShowBrandAccountDialog(false)}
      sx={{ color: 'white' }}
    >
      <Close />
    </IconButton>
  </DialogTitle>
  
  <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
    }}>
      {/* Render the BrandAccountDetails component here */}
      <BrandAccountDetails 
        embedded={true} 
        onAccountAdded={handleBrandAccountAdded}
      />
    </Box>
  </DialogContent>
</Dialog>

    </Container>
  );
};

export default PendingPayments;