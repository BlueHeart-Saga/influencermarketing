import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Avatar, Paper, IconButton,
  Tabs, Tab, Container, InputBase, Divider,
  List, ListItem, ListItemIcon, ListItemText,
  Stepper, Step, StepLabel, Tooltip, Badge,
  useTheme, useMediaQuery
} from '@mui/material';
import { TabContext, TabPanel } from "@mui/lab";
import { styled } from '@mui/system';

import {
  Search, Close, Campaign, Person,
  CalendarToday, Category, AttachMoney,
  Visibility, CheckCircle, Cancel, Description,
  Image as ImageIcon, VideoLibrary, Chat,
  Email, Business, Language, Instagram,
  YouTube, TrendingUp, Refresh,
  ArrowBack, ExpandMore, Download,
  MonetizationOn, ThumbUp, ThumbDown,
  Assignment, AssignmentTurnedIn, AccessTime, Phone,
  LocationOn, WorkOutline, Security, VerifiedUser, Receipt,
  Home, ListAlt, People, Analytics,
  AccountBalance, AccountBalanceWallet
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// =============================================
// 🎨 STYLED COMPONENTS
// =============================================

const ProfessionalCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.06)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 48px rgba(102, 126, 234, 0.15)',
    borderColor: theme.palette.primary
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.75rem',
  height: '28px',
  borderRadius: '8px',
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'rejected' && {
    background: 'linear-gradient(135deg, #F44336, #EF5350)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }),
  ...(status === 'contracted' && {
    background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
  }),
  ...(status === 'media_submitted' && {
    background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  })
}));

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
  color: 'white',
  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)'
  }
}));

const AnimatedTab = styled(Tab)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  py: 2,
  minHeight: '60px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  borderRadius: '12px',
  margin: '0 4px',
  '&.Mui-selected': {
    background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  },
  '&:hover': {
    transform: 'translateY(-2px)'
  }
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.primary}20`
}));

const SearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  maxWidth: '600px',
  margin: '0 auto'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'white',
    fontSize: '1.1rem',
    '&:hover fieldset': {
      borderColor: theme.palette.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary,
      borderWidth: '2px',
    },
  },
}));

// =============================================
// 🖼️ PROFILE IMAGE COMPONENT
// =============================================

const ProfileImage = ({ userId, profileType, alt, onClick, size = 40 }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/profiles/user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.profile);
          
          let imageId = null;
          if (profileType === 'influencer' && data.profile?.profile_picture) {
            imageId = data.profile.profile_picture;
          } else if (profileType === 'brand' && data.profile?.logo) {
            imageId = data.profile.logo;
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
          background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
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
        const response = await fetch(`${API_BASE_URL}/profiles/user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.profile);
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
    navigate(`/admin/profile/view/${profileType}/${userId}`);
  };

  const getDisplayName = () => {
    if (!userData) return 'Loading...';
    
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
      <Box flex={1}>
        <Typography 
          variant="subtitle2" 
          fontWeight="700"
          sx={{ 
            cursor: 'pointer',
            '&:hover': { color: 'primary', textDecoration: 'underline' }
          }}
          onClick={handleViewProfile}
        >
          {getDisplayName()}
        </Typography>
        
        {showStats && stats && (
          <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
            {stats.followers !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                👥 {stats.followers.toLocaleString()}
              </Typography>
            )}
            {stats.engagement !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                📈 {stats.engagement}%
              </Typography>
            )}
            {stats.rating !== 'N/A' && (
              <Typography variant="caption" color="text.secondary">
                ⭐ {stats.rating}
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
// 🏦 BANK ACCOUNT COMPONENT
// =============================================

const BankAccountInfo = ({ brandId }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/account/bank-accounts`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBankAccounts(data.data || data || []);
        }

        // Fetch account status
        const statusResponse = await fetch(`${API_BASE_URL}/account/bank-accounts/status`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setAccountStatus(statusData.data || statusData);
        }
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
        setError('Failed to load bank account information');
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBankAccounts();
    }
  }, [brandId]);

  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return '';
    return `****${accountNumber.slice(-4)}`;
  };

  const getStatusChip = (account) => {
    if (account.verification_status === 'verified') {
      return (
        <Chip
          icon={<VerifiedUser />}
          label="Verified"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else if (account.verification_status === 'failed') {
      return (
        <Chip
          icon={<Cancel />}
          label="Verification Failed"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<Security />}
          label="Pending Verification"
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100px">
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Loading bank account information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const primaryAccount = bankAccounts.find(account => account.is_primary) || bankAccounts[0];

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet color="primary" />
        Bank Account Information
      </Typography>

      {accountStatus && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={accountStatus.has_accounts ? 'Account Setup Complete' : 'Account Required'}
            color={accountStatus.has_accounts ? 'success' : 'warning'}
            variant="filled"
            size="small"
            sx={{ mb: 1 }}
          />
          {accountStatus.has_primary_account && (
            <Chip
              label="Primary Account Set"
              color="success"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      )}

      {primaryAccount ? (
        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="600">
                {primaryAccount.account_holder_name}
                {primaryAccount.is_primary && (
                  <Chip label="Primary" color="primary" size="small" sx={{ ml: 1, color: 'white' }} />
                )}
                {getStatusChip(primaryAccount)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                Account Number
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {formatAccountNumber(primaryAccount.account_number)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                IFSC Code
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {primaryAccount.ifsc_code}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                Bank
              </Typography>
              <Typography variant="body2">
                {primaryAccount.bank_name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" display="block">
                Account Type
              </Typography>
              <Typography variant="body2" textTransform="capitalize">
                {primaryAccount.account_type}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 1 }}>
          <Typography variant="body2">
            No bank account configured. Payments cannot be processed until a bank account is added.
          </Typography>
        </Alert>
      )}

      {bankAccounts.length > 1 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          + {bankAccounts.length - 1} additional account(s)
        </Typography>
      )}
    </Box>
  );
};

// =============================================
// 📊 CAMPAIGN METRICS COMPONENT
// =============================================

const CampaignMetrics = ({ applications }) => {
  const metrics = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    contracted: applications.filter(app => app.status === 'contracted' || app.contract_signed).length,
    completed: applications.filter(app => app.status === 'completed').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const getPercentage = (count) => {
    return applications.length > 0 ? ((count / applications.length) * 100).toFixed(1) : 0;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="700" sx={{ mb: 3 }}>
        📊 Campaign Analytics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard>
            <Typography variant="h4" fontWeight="800">
              {metrics.total}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Applications
            </Typography>
          </MetricCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
            <Typography variant="h4" fontWeight="800">
              {metrics.pending}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Pending
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getPercentage(metrics.pending)}%
            </Typography>
          </MetricCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' }}>
            <Typography variant="h4" fontWeight="800">
              {metrics.approved}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Approved
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getPercentage(metrics.approved)}%
            </Typography>
          </MetricCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard sx={{ background: 'linear-gradient(135deg, #42A5F5 0%, #42A5F5 100%)' }}>
            <Typography variant="h4" fontWeight="800">
              {metrics.contracted}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Contracted
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getPercentage(metrics.contracted)}%
            </Typography>
          </MetricCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)' }}>
            <Typography variant="h4" fontWeight="800">
              {metrics.completed}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Completed
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getPercentage(metrics.completed)}%
            </Typography>
          </MetricCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard sx={{ background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' }}>
            <Typography variant="h4" fontWeight="800">
              {metrics.rejected}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Rejected
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getPercentage(metrics.rejected)}%
            </Typography>
          </MetricCard>
        </Grid>
      </Grid>
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
      description: 'Influencer applied to campaign',
      date: application.applied_at,
      icon: <Assignment />
    },
    {
      label: 'Under Review',
      status: application.status === 'pending' ? 'active' : 'completed',
      description: 'Reviewing influencer application',
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
      label: 'Contract Phase',
      status: ['contracted', 'media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      description: application.contract_signed ? 'Contract signed' : 'Contract phase',
      date: application.contract_signed_at,
      icon: <Description />
    },
    {
      label: 'Media Submission',
      status: ['media_submitted', 'completed'].includes(application.status) ? 'completed' : 'pending',
      description: 'Media files submitted',
      date: application.media_submitted_at,
      icon: <ImageIcon />
    },
    {
      label: 'Completed',
      status: application.status === 'completed' ? 'completed' : 'pending',
      description: 'Campaign completed',
      date: application.completed_at,
      icon: <CheckCircle />
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
    <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)', borderRadius: '16px' }}>
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
    </Paper>
  );
};

// =============================================
// 🎯 MAIN COMPONENT - CAMPAIGN DETAILS
// =============================================

const CampaignDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [influencerDetails, setInfluencerDetails] = useState({});
  const [brandDetails, setBrandDetails] = useState(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [searchCampaignId, setSearchCampaignId] = useState(campaignId || "");

  const token = localStorage.getItem("access_token");

  // Fetch campaign details and related data
  const fetchCampaignDetails = async (id = searchCampaignId) => {
    if (!id) {
      setError("Please enter a Campaign ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch campaign basic info
      const campaignRes = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!campaignRes.ok) {
        throw new Error("Campaign not found or unauthorized");
      }

      const campaign = await campaignRes.json();
      setCampaignData(campaign);

      // Fetch applications for this campaign
      const applicationsRes = await fetch(`${API_BASE_URL}/api/campaigns/${id}/applications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData.applications || applicationsData);

        // Fetch details for all influencers in applications
        if (applicationsData.applications || applicationsData) {
          const apps = applicationsData.applications || applicationsData;
          apps.forEach(app => {
            fetchInfluencerDetails(app.influencer_id);
          });
        }
      }

      // Fetch brand details
      if (campaign.brand_id) {
        fetchBrandDetails(campaign.brand_id);
      }

    } catch (err) {
      console.error("Error fetching campaign details:", err);
      setError(err.message || "Failed to fetch campaign details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch influencer profile details
  const fetchInfluencerDetails = async (influencerId) => {
    if (influencerDetails[influencerId]) return;

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/user/${influencerId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setInfluencerDetails(prev => ({
          ...prev,
          [influencerId]: profileData
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch influencer details for ${influencerId}:`, err);
    }
  };

  // Fetch brand profile details
  const fetchBrandDetails = async (brandId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/user/${brandId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        setBrandDetails(profileData);
      } else {
        // Create fallback brand data
        setBrandDetails({
          profile: {
            company_name: 'Brand Information',
            contact_person_name: 'Not Available',
            email: 'No email available',
            phone_number: 'N/A',
            website: null,
            location: 'N/A',
            categories: []
          }
        });
      }
    } catch (err) {
      console.error(`Failed to fetch brand details for ${brandId}:`, err);
      // Create fallback brand data on error
      setBrandDetails({
        profile: {
          company_name: 'Brand Information',
          contact_person_name: 'Not Available',
          email: 'No email available',
          phone_number: 'N/A',
          website: null,
          location: 'N/A',
          categories: []
        }
      });
    }
  };

  // Handle application status update
  const updateApplicationStatus = async (influencerId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications/${campaignData._id}/${influencerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      // Refresh campaign details
      fetchCampaignDetails(campaignData._id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update application status");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = "USD") => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'contracted': return 'Contract Signed';
      case 'media_submitted': return 'Media Submitted';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchCampaignDetails(searchCampaignId);
  };

  // Handle key press in search field
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Render campaign overview
  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Campaign Basic Info */}
      <Grid item xs={12} md={6}>
        <ProfessionalCard>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
              📋 Campaign Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Campaign color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Title" 
                  secondary={campaignData.title || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Category color="secondary" /></ListItemIcon>
                <ListItemText 
                  primary="Category" 
                  secondary={campaignData.category || 'N/A'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><AttachMoney color="success" /></ListItemIcon>
                <ListItemText 
                  primary="Budget" 
                  secondary={formatCurrency(campaignData.budget, campaignData.currency)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                <ListItemText 
                  primary="Deadline" 
                  secondary={formatDate(campaignData.deadline)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Business color="info" /></ListItemIcon>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <StatusChip 
                      label={campaignData.status?.toUpperCase()} 
                      status={campaignData.status}
                    />
                  } 
                />
              </ListItem>
            </List>

            <Typography variant="subtitle1" fontWeight="600" sx={{ mt: 2 }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              {campaignData.description || 'No description available'}
            </Typography>

            <Typography variant="subtitle1" fontWeight="600" sx={{ mt: 2 }}>
              Requirements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              {campaignData.requirements || 'No requirements specified'}
            </Typography>
          </CardContent>
        </ProfessionalCard>
      </Grid>

      {/* Brand Information & Bank Account */}
      <Grid item xs={12} md={6}>
        <Grid container spacing={3}>
          {/* Brand Information */}
          <Grid item xs={12}>
            <ProfessionalCard>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
                  🏢 Brand Details
                </Typography>
                
                {!brandDetails ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="200px">
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading brand information...
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <ProfileImage
                        userId={campaignData.brand_id}
                        profileType="brand"
                        size={60}
                      />
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          {brandDetails.profile?.company_name || 'Unknown Brand'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {brandDetails.profile?.contact_person_name || 'Contact information not available'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Email:</strong> {brandDetails.profile?.email || 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Phone:</strong> {brandDetails.profile?.phone_number || 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Language fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Website:</strong> {brandDetails.profile?.website ? (
                              <a 
                                href={brandDetails.profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: theme.palette.primary }}
                              >
                                {brandDetails.profile.website}
                              </a>
                            ) : 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            <strong>Location:</strong> {brandDetails.profile?.location || 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {brandDetails.profile?.categories && brandDetails.profile.categories.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="600">
                          Business Categories:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                          {brandDetails.profile.categories.map((category, index) => (
                            <Chip 
                              key={index} 
                              label={category} 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Button
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => navigate(`/admin/profile/view/brand/${campaignData.brand_id}`)}
                      sx={{ mt: 2, borderRadius: '8px' }}
                      fullWidth
                    >
                      View Full Brand Profile
                    </Button>
                  </Box>
                )}
              </CardContent>
            </ProfessionalCard>
          </Grid>

          {/* Bank Account Information */}
          <Grid item xs={12}>
            <ProfessionalCard>
              <CardContent>
                <BankAccountInfo brandId={campaignData.brand_id} />
              </CardContent>
            </ProfessionalCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  // Render applications
  const renderApplications = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" gutterBottom fontWeight="700">
          📥 Applications ({applications.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchCampaignDetails(campaignData._id)}
          sx={{ borderRadius: '8px' }}
        >
          Refresh
        </Button>
      </Box>
      
      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <People sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This campaign hasn't received any applications yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application, index) => (
            <Grid item xs={12} key={application._id || application.application_id || index}>
              <ProfessionalCard>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <UserInfo
                          userId={application.influencer_id}
                          profileType="influencer"
                          showStats={true}
                          size={50}
                        />
                        <Box>
                          <StatusChip 
                            label={getStatusText(application.status)} 
                            status={application.status}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Applied: {formatDate(application.applied_at)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {application.message && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            APPLICATION MESSAGE:
                          </Typography>
                          <Typography variant="body2" fontStyle="italic">
                            "{application.message}"
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box display="flex" gap={1} flexDirection="column">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => setSelectedInfluencer(application.influencer_id)}
                          sx={{ borderRadius: '6px' }}
                        >
                          View Profile
                        </Button>
                        
                        {application.status === 'pending' && (
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => updateApplicationStatus(application.influencer_id, 'approved')}
                              sx={{ borderRadius: '6px' }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => updateApplicationStatus(application.influencer_id, 'rejected')}
                              sx={{ borderRadius: '6px' }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        
                        {application.status === 'approved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<Description />}
                            sx={{ borderRadius: '6px' }}
                          >
                            Send Contract
                          </Button>
                        )}

                        {['contracted', 'media_submitted', 'completed'].includes(application.status) && (
                          <ApplicationWorkflow application={application} />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </ProfessionalCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Render statistics
  const renderStatistics = () => (
    <Box>
      <CampaignMetrics applications={applications} />
      
      {applications.length > 0 && (
        <ProfessionalCard sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="700">
              Status Distribution
            </Typography>
            <Grid container spacing={2}>
              {['pending', 'approved', 'rejected', 'contracted', 'media_submitted', 'completed'].map(status => {
                const count = applications.filter(app => app.status === status).length;
                const percentage = applications.length > 0 ? (count / applications.length * 100).toFixed(1) : 0;
                
                return (
                  <Grid item xs={12} key={status}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1} minWidth="120px">
                        <StatusChip 
                          label={status.replace('_', ' ')} 
                          status={status}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} width="60%">
                        <Box width="100%" bgcolor="grey.200" borderRadius={1}>
                          <Box 
                            width={`${percentage}%`}
                            bgcolor={
                              status === 'approved' ? '#4CAF50' :
                              status === 'pending' ? '#FF9800' :
                              status === 'rejected' ? '#F44336' :
                              status === 'completed' ? '#2196F3' :
                              status === 'contracted' ? '#9C27B0' :
                              '#FF9800'
                            }
                            height={8}
                            borderRadius={1}
                          />
                        </Box>
                        <Typography variant="body2" minWidth={60} textAlign="right">
                          {count} ({percentage}%)
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </ProfessionalCard>
      )}
    </Box>
  );

  // Influencer Profile Dialog
  const InfluencerProfileDialog = ({ open, onClose, influencerId }) => {
    const profile = influencerDetails[influencerId];
    const application = applications.find(app => app.influencer_id === influencerId);

    if (!profile) {
      return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle>Loading Profile...</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
          color: 'white'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="700">
              Influencer Profile
            </Typography>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <ProfileImage
                  userId={influencerId}
                  profileType="influencer"
                  size={120}
                />
                <Typography variant="h6" sx={{ mt: 2 }} fontWeight="700">
                  {profile.profile?.nickname || profile.profile?.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.profile?.email}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Profile Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Full Name:</strong> {profile.profile?.full_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Location:</strong> {profile.profile?.location || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {profile.profile?.phone_number || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Bio:</strong> {profile.profile?.bio || 'No bio available'}
                  </Typography>
                </Grid>
              </Grid>

              {profile.profile?.categories && profile.profile.categories.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    Categories
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {profile.profile.categories.map((category, index) => (
                      <Chip key={index} label={category} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {application && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    Campaign Application
                  </Typography>
                  <Typography variant="body2">
                    Status: <StatusChip label={getStatusText(application.status)} status={application.status} />
                  </Typography>
                  <Typography variant="body2">
                    Applied: {formatDate(application.applied_at)}
                  </Typography>
                  {application.message && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      "{application.message}"
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => navigate(`/admin/profile/view/influencer/${influencerId}`)}
          >
            View Full Profile
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  useEffect(() => {
    if (campaignId) {
      setSearchCampaignId(campaignId);
      fetchCampaignDetails(campaignId);
    }
  }, [campaignId]);

  if (loading && campaignData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Section */}
      <SearchContainer>
        <Typography variant="h4" component="h1" fontWeight="800" gutterBottom color="primary" textAlign="center">
          🔍 Find Campaign Details
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Enter Campaign ID to view comprehensive details and manage applications
        </Typography>
        
        <SearchBar>
          <StyledTextField
            placeholder="Enter Campaign ID (e.g., 507f1f77bcf86cd799439011)"
            value={searchCampaignId}
            onChange={(e) => setSearchCampaignId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            disabled={loading || !searchCampaignId.trim()}
            sx={{ 
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
              fontWeight: 700
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
          >
            {loading ? 'Searching...' : 'Search Campaign'}
          </Button>
        </SearchBar>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2, 
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '20px auto 0'
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
      </SearchContainer>

      {campaignData && (
        <Box>
          {/* Campaign Header */}
          <Paper sx={{ 
            p: 4, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #42A5F5 100%)',
            color: 'white',
            borderRadius: '20px'
          }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h3" fontWeight="800" gutterBottom>
                  {campaignData.title}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                  {campaignData.description}
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip 
                    label={campaignData.category} 
                    sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  />
                  <Chip 
                    label={formatCurrency(campaignData.budget, campaignData.currency)} 
                    sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  />
                  <Chip 
                    label={`Deadline: ${formatDate(campaignData.deadline)}`} 
                    sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4} textAlign={{ md: 'right' }}>
                <StatusChip 
                  label={campaignData.status?.toUpperCase()} 
                  status={campaignData.status}
                  sx={{ 
                    background: 'rgba(255,255,255,0.9)',
                    color: 'primary',
                    fontSize: '1rem',
                    height: '40px'
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Navigation Tabs */}
          <Paper sx={{ borderRadius: '20px', mb: 3, overflow: 'hidden' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
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
                    <Campaign sx={{ mr: 1 }} />
                    Overview
                  </Box>
                } 
                value="overview" 
              />
              <AnimatedTab 
                label={
                  <Box display="flex" alignItems="center">
                    <People sx={{ mr: 1 }} />
                    Applications
                    <Chip label={applications.length} size="small" sx={{ ml: 1 }} color="primary" />
                  </Box>
                } 
                value="applications" 
              />
              <AnimatedTab 
                label={
                  <Box display="flex" alignItems="center">
                    <Analytics sx={{ mr: 1 }} />
                    Statistics
                  </Box>
                } 
                value="statistics" 
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <TabContext value={activeTab}>
            <TabPanel value="overview" sx={{ p: 0 }}>
              {renderOverview()}
            </TabPanel>
            <TabPanel value="applications" sx={{ p: 0 }}>
              {renderApplications()}
            </TabPanel>
            <TabPanel value="statistics" sx={{ p: 0 }}>
              {renderStatistics()}
            </TabPanel>
          </TabContext>
        </Box>
      )}

      {/* Influencer Profile Dialog */}
      <InfluencerProfileDialog
        open={!!selectedInfluencer}
        onClose={() => setSelectedInfluencer(null)}
        influencerId={selectedInfluencer}
      />
    </Container>
  );
};

export default CampaignDetails;