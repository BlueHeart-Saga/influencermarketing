// frontend/src/pages/brand/Autopay.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Badge,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Autocomplete,
  CardActions,
  CardMedia,
  Rating
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
  Person,
  Campaign,
  AttachMoney,
  Security,
  AutoAwesome,
  CalendarToday,
  PlayArrow,
  Pause,
  Delete,
  Edit,
  Add,
  History,
  TrendingFlat,
  NotificationsActive,
  Speed,
  VerifiedUser,
  Close,
  Search,
  Instagram,
  YouTube,
  Language,
  Group,
  Star,
  Email,
  Phone,
  LocationOn,
  Category,
  Work,
  Download,
  Image as ImageIcon,
  VideoLibrary,
  InsertDriveFile
} from '@mui/icons-material';
import { styled } from '@mui/system';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { AuthContext } from "../../context/AuthContext";
import { autopayAPI, campaignAPI} from '../../services/api';
import  profileAPI from '../../services/profileAPI' 

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const StatsCard = styled(Card)(({ theme }) => ({
  background: '#2563eb',
  color: 'white',
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
  }
}));

const ApplicationCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `2px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  }
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.7rem',
  height: '26px',
  borderRadius: '8px',
  ...(status === 'active' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'paused' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'cancelled' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  })
}));

const FrequencyChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
  color: 'white',
  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
}));

// =============================================
// 👤 PROFILE IMAGE COMPONENT
// =============================================

const ProfileImage = ({ userId, alt, onClick, size = 60 }) => {
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
          
          if (response.profile.profile_picture) {
            setImageUrl(`${process.env.REACT_APP_API_URL}/profiles/image/${response.profile.profile_picture}`);
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
  }, [userId]);

  const getDisplayName = () => {
    if (userData) {
      return userData.nickname || userData.full_name || alt || 'Influencer';
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
          background: '#2563eb',
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
// 👤 INFLUENCER PROFILE COMPONENT
// =============================================

const InfluencerProfile = ({ influencerId, application }) => {
  const [influencerData, setInfluencerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencerData = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(influencerId);
        if (response?.profile) {
          setInfluencerData(response.profile);
        }
      } catch (error) {
        console.error('Error fetching influencer data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (influencerId) {
      fetchInfluencerData();
    }
  }, [influencerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!influencerData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">
          Influencer profile not available
        </Typography>
      </Box>
    );
  }

  const stats = {
    followers: influencerData.followers || 'N/A',
    engagement: influencerData.engagement_rate || 'N/A',
    rating: influencerData.rating || 'N/A',
    categories: influencerData.categories || [],
    languages: influencerData.languages || [],
    location: influencerData.location || 'N/A'
  };

  return (
    <ProfileCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <ProfileImage userId={influencerId} size={70} />
          <Box flex={1}>
            <Typography variant="h6" fontWeight="700">
              {influencerData.nickname || influencerData.full_name || 'Unknown Influencer'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {influencerData.bio || 'No bio available'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Rating value={parseFloat(stats.rating) || 0} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {stats.rating || 'No ratings'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="700" color="primary">
                {stats.followers !== 'N/A' ? (stats.followers > 1000 ? `${(stats.followers / 1000).toFixed(1)}K` : stats.followers) : 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Followers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="700" color="primary">
                {stats.engagement !== 'N/A' ? `${stats.engagement}%` : 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Engagement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="700" color="primary">
                {stats.rating || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rating
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Categories */}
        {stats.categories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight="600" color="text.secondary">
              CATEGORIES
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {stats.categories.slice(0, 3).map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  size="small"
                  sx={{ 
                    background: '#2563eb',
                    color: 'white',
                    fontSize: '0.6rem'
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

        {/* Contact Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" fontWeight="600" color="text.secondary">
            CONTACT
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              {influencerData.email || 'No email'}
            </Typography>
          </Box>
          {stats.location !== 'N/A' && (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {stats.location}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Social Media */}
        <Box>
          <Typography variant="caption" fontWeight="600" color="text.secondary">
            SOCIAL PLATFORMS
          </Typography>
          <Box display="flex" gap={1} sx={{ mt: 0.5 }}>
            {influencerData.instagram_handle && (
              <Tooltip title="Instagram">
                <Instagram sx={{ color: '#E4405F' }} />
              </Tooltip>
            )}
            {influencerData.youtube_handle && (
              <Tooltip title="YouTube">
                <YouTube sx={{ color: '#FF0000' }} />
              </Tooltip>
            )}
            {!influencerData.instagram_handle && !influencerData.youtube_handle && (
              <Typography variant="caption" color="text.secondary">
                No social links
              </Typography>
            )}
          </Box>
        </Box>

        {/* Application Message */}
        {application?.message && (
          <Box sx={{ mt: 2, p: 1.5, background: 'rgba(102, 126, 234, 0.05)', borderRadius: '8px' }}>
            <Typography variant="caption" fontWeight="600" color="text.secondary">
              APPLICATION MESSAGE
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              "{application.message}"
            </Typography>
          </Box>
        )}
      </CardContent>
    </ProfileCard>
  );
};

// =============================================
// 💰 MAIN AUTOPAY COMPONENT - REWRITTEN
// =============================================

const Autopay = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [autopaySchedules, setAutopaySchedules] = useState([]);
  const [directPayments, setDirectPayments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [directPaymentDialogOpen, setDirectPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Form states
  const [autopayForm, setAutopayForm] = useState({
    campaign_id: '',
    influencer_id: '',
    amount: '',
    frequency: 'immediate',
    start_date: '',
    end_date: '',
    max_payments: '',
    notes: ''
  });

  const [directPaymentForm, setDirectPaymentForm] = useState({
    campaign_id: '',
    influencer_id: '',
    amount: '',
    notes: '',
    immediate_payout: true
  });

  // Stats
  const [stats, setStats] = useState({
    activeSchedules: 0,
    totalProcessed: 0,
    upcomingPayments: 0,
    totalSaved: 0,
    pendingApplications: 0,
    approvedApplications: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    setLoading(true);
    setError('');

    // Load autopay schedules
    const schedulesResponse = await autopayAPI.getMyAutopays();
    const schedulesData = Array.isArray(schedulesResponse)
      ? schedulesResponse
      : schedulesResponse.data || [];
    setAutopaySchedules(schedulesData);

    // Load direct payment history
    const paymentsResponse = await autopayAPI.getPaymentHistory();
    const paymentsData = Array.isArray(paymentsResponse)
      ? paymentsResponse
      : paymentsResponse.data || [];
    setDirectPayments(paymentsData);

    // Load campaigns for dropdowns
    const campaignsResponse = await campaignAPI.getBrandCampaigns();
    const campaignsData = Array.isArray(campaignsResponse)
      ? campaignsResponse
      : campaignsResponse.data || campaignsResponse.campaigns || [];
    setCampaigns(campaignsData);

    // Load applications to get influencer data
    const applicationsResponse = await campaignAPI.getBrandApplications();
    const applicationsData = Array.isArray(applicationsResponse)
      ? applicationsResponse
      : applicationsResponse.data || applicationsResponse.applications || [];

    // Filter approved applications for payments
    const approvedAppsForPayment = applicationsData.filter(
      (app) =>
        app.status === "approved" ||
        app.status === "contracted" ||
        app.status === "media_submitted"
    );
    setApplications(approvedAppsForPayment);

    // Calculate stats
    const activeSchedules = schedulesData.filter((s) => s.status === "active").length;
    const totalProcessed = schedulesData.reduce(
      (sum, schedule) => sum + (schedule.total_paid || 0),
      0
    );
    const upcomingPayments = schedulesData.filter(
      (s) => s.status === "active" && new Date(s.next_payment_date) > new Date()
    ).length;

    const pendingApplications = applicationsData.filter(
      (app) => app.status === "approved"
    ).length;

    const approvedApplications = applicationsData.filter(
      (app) => app.status === "contracted" || app.status === "media_submitted"
    ).length;

    // Update state
    setStats({
      activeSchedules,
      totalProcessed,
      upcomingPayments,
      totalSaved: totalProcessed * 0.02, // Assuming 2% automation savings
      pendingApplications,
      approvedApplications,
    });

  } catch (err) {
    console.error("Error loading data:", err);
    setError("Failed to load data. Please try again later.");
  } finally {
    setLoading(false);
  }
};



  // Get applications for selected campaign
  const getCampaignApplications = (campaignId) => {
    return applications.filter(app => app.campaign_id === campaignId);
  };

  // Get campaign by ID
  const getCampaignById = (campaignId) => {
    return campaigns.find(campaign => campaign._id === campaignId || campaign.id === campaignId);
  };

  // Handle campaign selection change
  const handleCampaignChange = (campaignId, formType = 'autopay') => {
    const campaign = getCampaignById(campaignId);
    
    if (formType === 'autopay') {
      setAutopayForm(prev => ({
        ...prev,
        campaign_id: campaignId,
        amount: campaign?.budget || ''
      }));
    } else {
      setDirectPaymentForm(prev => ({
        ...prev,
        campaign_id: campaignId,
        amount: campaign?.budget || ''
      }));
    }
  };

  // Handle influencer selection change
  const handleInfluencerChange = (influencerId, formType = 'autopay') => {
    if (formType === 'autopay') {
      setAutopayForm(prev => ({
        ...prev,
        influencer_id: influencerId
      }));
    } else {
      setDirectPaymentForm(prev => ({
        ...prev,
        influencer_id: influencerId
      }));
    }
  };

  const handleSetupAutopay = async () => {
    try {
      setProcessing(true);
      setError('');

      const response = await autopayAPI.setupAutopay(autopayForm);
      
      setSuccess('Autopay schedule created successfully!');
      setSetupDialogOpen(false);
      resetAutopayForm();
      loadData();

    } catch (err) {
      console.error('Error setting up autopay:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to setup autopay');
    } finally {
      setProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    try {
      setProcessing(true);
      setError('');

      const response = await autopayAPI.makeDirectPayment(directPaymentForm);
      
      setSuccess('Direct payment processed successfully!');
      setDirectPaymentDialogOpen(false);
      resetDirectPaymentForm();
      loadData();

    } catch (err) {
      console.error('Error processing direct payment:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to process direct payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewProfile = (application) => {
    setSelectedApplication(application);
    setProfileDialogOpen(true);
  };

  const resetAutopayForm = () => {
    setAutopayForm({
      campaign_id: '',
      influencer_id: '',
      amount: '',
      frequency: 'immediate',
      start_date: '',
      end_date: '',
      max_payments: '',
      notes: ''
    });
  };

  const resetDirectPaymentForm = () => {
    setDirectPaymentForm({
      campaign_id: '',
      influencer_id: '',
      amount: '',
      notes: '',
      immediate_payout: true
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      immediate: 'Immediate',
      weekly: 'Weekly',
      bi_weekly: 'Bi-Weekly',
      monthly: 'Monthly',
      after_campaign: 'After Campaign'
    };
    return labels[frequency] || frequency;
  };

  const getNextPaymentDate = (schedule) => {
    if (!schedule.next_payment_date) return 'N/A';
    return format(new Date(schedule.next_payment_date), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Get influencer name by ID
  const getInfluencerName = (influencerId) => {
    const application = applications.find(app => app.influencer_id === influencerId);
    return application?.influencer_name || 'Unknown Influencer';
  };

  // Get campaign title by ID
  const getCampaignTitle = (campaignId) => {
    const campaign = getCampaignById(campaignId);
    return campaign?.title || 'Unknown Campaign';
  };

  // Get application by influencer and campaign
  const getApplication = (campaignId, influencerId) => {
    return applications.find(app => 
      app.campaign_id === campaignId && app.influencer_id === influencerId
    );
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
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom color="primary">
              Payment Management
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
              Manage influencer payments, set up autopay schedules, and process direct payments with detailed influencer profiles.
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              disabled={processing}
              sx={{ borderRadius: '25px', px: 3, fontWeight: 600 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSetupDialogOpen(true)}
              sx={{ 
                borderRadius: '25px', 
                px: 3, 
                fontWeight: 600,
                background: '#2563eb'
              }}
            >
              Setup Autopay
            </Button>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <Typography variant="h3" fontWeight="800">
                {stats.activeSchedules}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Active Schedules
              </Typography>
              <AutoAwesome sx={{ fontSize: 40, opacity: 0.8, mt: 1 }} />
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
              <Typography variant="h3" fontWeight="800">
                {formatCurrency(stats.totalProcessed)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Processed
              </Typography>
              <TrendingUp sx={{ fontSize: 40, opacity: 0.8, mt: 1 }} />
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
              <Typography variant="h3" fontWeight="800">
                {stats.approvedApplications}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Ready for Payment
              </Typography>
              <Person sx={{ fontSize: 40, opacity: 0.8, mt: 1 }} />
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)' }}>
              <Typography variant="h3" fontWeight="800">
                {stats.upcomingPayments}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Upcoming Payments
              </Typography>
              <Schedule sx={{ fontSize: 40, opacity: 0.8, mt: 1 }} />
            </StatsCard>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                py: 2,
                minHeight: '64px'
              }
            }}
          >
            <Tab 
              icon={<Person />} 
              iconPosition="start" 
              label={`Approved Applications (${applications.length})`} 
            />
            <Tab 
              icon={<AutoAwesome />} 
              iconPosition="start" 
              label={`Autopay Schedules (${autopaySchedules.length})`} 
            />
            <Tab 
              icon={<Payment />} 
              iconPosition="start" 
              label={`Payment History (${directPayments.length})`} 
            />
          </Tabs>

          {/* Tab 1: Approved Applications */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              {applications.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Approved Applications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Approved influencer applications will appear here. You can set up autopay or make direct payments.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Campaign />}
                    onClick={() => window.location.href = '/brand/applications'}
                    sx={{ borderRadius: '12px' }}
                  >
                    View Applications
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {applications.map((application) => (
                    <Grid item xs={12} md={6} lg={4} key={`${application.campaign_id}-${application.influencer_id}`}>
                      <ApplicationCard>
                        <CardContent sx={{ p: 3, flex: 1 }}>
                          {/* Header with Influencer Info */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box display="flex" alignItems="center" gap={2} flex={1}>
                              <ProfileImage 
                                userId={application.influencer_id} 
                                onClick={() => handleViewProfile(application)}
                              />
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight="700" noWrap>
                                  {application.influencer_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                  {application.influencer_email}
                                </Typography>
                                <StatusChip 
                                  label={application.status} 
                                  status={application.status}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          </Box>

                          {/* Campaign Details */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              CAMPAIGN
                            </Typography>
                            <Typography variant="body1" fontWeight="600" color="primary">
                              {application.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.category} • {formatDate(application.applied_at)}
                            </Typography>
                          </Box>

                          {/* Budget */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                AGREED BUDGET
                              </Typography>
                              <Typography variant="h6" fontWeight="700" color="success.main">
                                {formatCurrency(application.budget, application.currency)}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="caption" color="text.secondary">
                                STATUS
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                Ready for {application.status === 'media_submitted' ? 'Payment' : 'Contract'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Application Message Preview */}
                          {application.message && (
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
                          )}
                        </CardContent>

                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Box display="flex" gap={1} width="100%">
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewProfile(application)}
                              fullWidth
                              variant="outlined"
                              sx={{ borderRadius: '8px' }}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="small"
                              startIcon={<AutoAwesome />}
                              onClick={() => {
                                setAutopayForm({
                                  campaign_id: application.campaign_id,
                                  influencer_id: application.influencer_id,
                                  amount: application.budget,
                                  frequency: 'immediate',
                                  start_date: '',
                                  end_date: '',
                                  max_payments: '',
                                  notes: ''
                                });
                                setSetupDialogOpen(true);
                              }}
                              fullWidth
                              variant="contained"
                              sx={{ borderRadius: '8px' }}
                            >
                              Setup Autopay
                            </Button>
                          </Box>
                        </CardActions>
                      </ApplicationCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 2: Autopay Schedules */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              {autopaySchedules.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <AutoAwesome sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Autopay Schedules
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Set up automatic payment schedules to save time and ensure timely payments to influencers.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setSetupDialogOpen(true)}
                    sx={{ borderRadius: '12px' }}
                  >
                    Create Your First Autopay
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {autopaySchedules.map((schedule) => {
                    const application = getApplication(schedule.campaign_id, schedule.influencer_id);
                    return (
                      <Grid item xs={12} md={6} key={schedule._id || schedule.id}>
                        <ApplicationCard>
                          <CardContent sx={{ p: 3, flex: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                              <Box display="flex" alignItems="center" gap={2} flex={1}>
                                <ProfileImage userId={schedule.influencer_id} />
                                <Box flex={1}>
                                  <Typography variant="h6" fontWeight="700">
                                    {getInfluencerName(schedule.influencer_id)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {getCampaignTitle(schedule.campaign_id)}
                                  </Typography>
                                </Box>
                              </Box>
                              <StatusChip 
                                label={schedule.status} 
                                status={schedule.status}
                              />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <FrequencyChip 
                                label={getFrequencyLabel(schedule.frequency)} 
                                size="small"
                              />
                              <Typography variant="h5" fontWeight="700" color="primary">
                                {formatCurrency(schedule.amount)}
                              </Typography>
                            </Box>

                            <Grid container spacing={1} sx={{ mb: 2 }}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Payments Made
                                </Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {schedule.payments_made || 0}
                                  {schedule.max_payments && ` / ${schedule.max_payments}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Total Paid
                                </Typography>
                                <Typography variant="body2" fontWeight="600" color="success.main">
                                  {formatCurrency(schedule.total_paid || 0)}
                                </Typography>
                              </Grid>
                            </Grid>

                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Next Payment
                              </Typography>
                              <Typography variant="body2" fontWeight="600">
                                {getNextPaymentDate(schedule)}
                              </Typography>
                            </Box>

                            {schedule.notes && (
                              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }} noWrap>
                                "{schedule.notes}"
                              </Typography>
                            )}
                          </CardContent>

                          <CardActions sx={{ p: 2, pt: 0 }}>
                            <Box display="flex" gap={1} width="100%">
                              <Button
                                size="small"
                                startIcon={<Edit />}
                                onClick={() => {
                                  setSelectedSchedule(schedule);
                                  setEditDialogOpen(true);
                                }}
                                fullWidth
                                variant="outlined"
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => handleViewProfile(application)}
                                fullWidth
                                variant="outlined"
                              >
                                Profile
                              </Button>
                            </Box>
                          </CardActions>
                        </ApplicationCard>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Tab 3: Payment History */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  Payment History
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => setDirectPaymentDialogOpen(true)}
                  sx={{ borderRadius: '12px' }}
                >
                  Make Direct Payment
                </Button>
              </Box>

              {directPayments.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Payment History
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your payment history will appear here after processing payments.
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
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {directPayments.map((payment) => (
                        <TableRow 
                          key={payment._id || payment.id} 
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ProfileImage userId={payment.influencer_id} size={32} />
                              <Typography variant="body2" fontWeight="600">
                                {getInfluencerName(payment.influencer_id)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600">
                              {getCampaignTitle(payment.campaign_id)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="700" color="primary">
                              {formatCurrency(payment.amount, payment.currency)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(payment.created_at || payment.processed_at)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.type === 'direct' ? 'Direct' : 'Autopay'} 
                              size="small"
                              color={payment.type === 'direct' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={payment.status}
                              status={payment.status}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Setup Autopay Dialog */}
      <Dialog
        open={setupDialogOpen}
        onClose={() => !processing && setSetupDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ 
          background: '#2563eb',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesome />
            Setup Autopay Schedule
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={autopayForm.campaign_id}
                  label="Campaign"
                  onChange={(e) => handleCampaignChange(e.target.value, 'autopay')}
                >
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign._id || campaign.id} value={campaign._id || campaign.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {campaign.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Budget: {formatCurrency(campaign.budget, campaign.currency)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Influencer</InputLabel>
                <Select
                  value={autopayForm.influencer_id}
                  label="Influencer"
                  onChange={(e) => handleInfluencerChange(e.target.value, 'autopay')}
                  disabled={!autopayForm.campaign_id}
                >
                  {getCampaignApplications(autopayForm.campaign_id).map((app) => (
                    <MenuItem key={app.influencer_id} value={app.influencer_id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProfileImage userId={app.influencer_id} size={30} />
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {app.influencer_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {app.influencer_email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                  {getCampaignApplications(autopayForm.campaign_id).length === 0 && (
                    <MenuItem disabled>
                      No influencers found for this campaign
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={autopayForm.amount}
                onChange={(e) => setAutopayForm({...autopayForm, amount: e.target.value})}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                }}
                helperText="Campaign budget is auto-filled"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={autopayForm.frequency}
                  label="Frequency"
                  onChange={(e) => setAutopayForm({...autopayForm, frequency: e.target.value})}
                >
                  <MenuItem value="immediate">Immediate (One-time)</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="bi_weekly">Bi-Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="after_campaign">After Campaign Completion</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={autopayForm.notes}
                onChange={(e) => setAutopayForm({...autopayForm, notes: e.target.value})}
                placeholder="Add any notes about this payment schedule..."
              />
            </Grid>
          </Grid>

          {/* Campaign & Influencer Info Summary */}
          {autopayForm.campaign_id && autopayForm.influencer_id && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="600">
                Setting up autopay for:
              </Typography>
              <Typography variant="body2">
                Campaign: <strong>{getCampaignTitle(autopayForm.campaign_id)}</strong>
              </Typography>
              <Typography variant="body2">
                Influencer: <strong>{getInfluencerName(autopayForm.influencer_id)}</strong>
              </Typography>
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            Autopay schedules will automatically process payments based on your selected frequency.
            You can pause or cancel anytime.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setSetupDialogOpen(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSetupAutopay}
            disabled={processing || !autopayForm.campaign_id || !autopayForm.influencer_id || !autopayForm.amount}
            startIcon={processing ? <CircularProgress size={20} /> : <AutoAwesome />}
          >
            {processing ? 'Setting Up...' : 'Setup Autopay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Direct Payment Dialog */}
      <Dialog
        open={directPaymentDialogOpen}
        onClose={() => !processing && setDirectPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Payment />
            Make Direct Payment
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  value={directPaymentForm.campaign_id}
                  label="Campaign"
                  onChange={(e) => handleCampaignChange(e.target.value, 'direct')}
                >
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign._id || campaign.id} value={campaign._id || campaign.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {campaign.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Budget: {formatCurrency(campaign.budget, campaign.currency)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Influencer</InputLabel>
                <Select
                  value={directPaymentForm.influencer_id}
                  label="Influencer"
                  onChange={(e) => handleInfluencerChange(e.target.value, 'direct')}
                  disabled={!directPaymentForm.campaign_id}
                >
                  {getCampaignApplications(directPaymentForm.campaign_id).map((app) => (
                    <MenuItem key={app.influencer_id} value={app.influencer_id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ProfileImage userId={app.influencer_id} size={30} />
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {app.influencer_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {app.influencer_email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                  {getCampaignApplications(directPaymentForm.campaign_id).length === 0 && (
                    <MenuItem disabled>
                      No influencers found for this campaign
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={directPaymentForm.amount}
                onChange={(e) => setDirectPaymentForm({...directPaymentForm, amount: e.target.value})}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />
                }}
                helperText="Campaign budget is auto-filled"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={directPaymentForm.notes}
                onChange={(e) => setDirectPaymentForm({...directPaymentForm, notes: e.target.value})}
                placeholder="Add payment notes..."
              />
            </Grid>
          </Grid>

          {/* Campaign & Influencer Info Summary */}
          {directPaymentForm.campaign_id && directPaymentForm.influencer_id && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="600">
                Making direct payment for:
              </Typography>
              <Typography variant="body2">
                Campaign: <strong>{getCampaignTitle(directPaymentForm.campaign_id)}</strong>
              </Typography>
              <Typography variant="body2">
                Influencer: <strong>{getInfluencerName(directPaymentForm.influencer_id)}</strong>
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDirectPaymentDialogOpen(false)} 
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDirectPayment}
            disabled={processing || !directPaymentForm.campaign_id || !directPaymentForm.influencer_id || !directPaymentForm.amount}
            startIcon={processing ? <CircularProgress size={20} /> : <Payment />}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
            }}
          >
            {processing ? 'Processing...' : 'Make Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Influencer Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ 
          background: '#2563eb',
          color: 'white',
          fontWeight: 700
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Person />
              Influencer Profile
            </Box>
            <IconButton onClick={() => setProfileDialogOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {selectedApplication && (
            <InfluencerProfile 
              influencerId={selectedApplication.influencer_id} 
              application={selectedApplication}
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setProfileDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
          {selectedApplication && (
            <Button
              variant="contained"
              startIcon={<AutoAwesome />}
              onClick={() => {
                setProfileDialogOpen(false);
                setAutopayForm({
                  campaign_id: selectedApplication.campaign_id,
                  influencer_id: selectedApplication.influencer_id,
                  amount: selectedApplication.budget,
                  frequency: 'immediate',
                  start_date: '',
                  end_date: '',
                  max_payments: '',
                  notes: ''
                });
                setSetupDialogOpen(true);
              }}
            >
              Setup Autopay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Autopay;