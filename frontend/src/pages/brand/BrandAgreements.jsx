import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Avatar, styled, Paper,
  IconButton, useTheme, useMediaQuery,
  Tabs, Tab, Container, Table, TableBody, TableCell,
  TableHead, TableRow, TablePagination, Stepper, Step, StepLabel,
  List, ListItem, ListItemIcon, ListItemText,
  Collapse, FormControl, InputLabel, Select, MenuItem,
  Tooltip, Fab, Zoom, alpha, Badge,
  InputAdornment, Divider, Menu, TableContainer
} from '@mui/material';

import {
  CalendarToday, CheckCircle, Visibility,
  Search, Close, ArrowBack, Send, Payment,
  Description, Email, Chat, Image as ImageIcon,
  AccessTime, Refresh, VideoLibrary, PictureAsPdf,
  InsertDriveFile, Download, AttachMoney, Schedule,
  FilterList, ClearAll, Audiotrack, MarkEmailRead,
  TrendingUp, Group, FileCopy, Campaign,
  MoreVert, ExpandMore, ExpandLess, Dashboard,
  Notifications, AccountCircle, Launch, Person,
  Check, Clear, WorkOutline, Assignment, AssignmentTurnedIn,
  MonetizationOn, ThumbUp, ThumbDown, Category, Flag,
  Business, ContactMail, Public, Analytics, LocalOffer,
  Instagram, YouTube, VerifiedUser
} from '@mui/icons-material';
import { TabContext, TabPanel } from "@mui/lab";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faUser,
  faChartPie,
  faArrowsRotate,
  faFileContract,
  faMoneyBillWave,
  faCalendarDays,
  faUserTag,
  faCircleCheck,
  faFolderOpen,
  faRocket,
  faAward,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

import { campaignAPI } from '../../services/api';
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";
import { format } from 'date-fns';

// =============================================
// 🎨 STYLED COMPONENTS (Consistent with Brand Applications)
// =============================================

const GlassCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  fontSize: '0.7rem',
  height: '26px',
  borderRadius: '8px',
  ...(status === 'contracted' && {
    background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)'
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  }),
  ...(status === 'media_submitted' && {
    background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(135deg, #607D8B 0%, #78909C 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(96, 125, 139, 0.3)'
  }),
  ...(status === 'sent' && {
    background: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
  })
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: '#1976d2',
  color: 'white',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '0.875rem',
  boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#1976d2',
    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
    transform: 'translateY(-1px)'
  },
  '&.Mui-disabled': {
    background: theme.palette.action.disabled,
    boxShadow: 'none'
  }
}));

const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 30px ${alpha(theme.palette[color].main, 0.15)}`,
    borderColor: alpha(theme.palette[color].main, 0.3)
  }
}));

const WorkflowStepper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
  borderRadius: '16px',
  border: `2px solid ${theme.palette.primary.light}20`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
}));

const AnimatedTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
    transform: 'scale(1.002)'
  }
}));

// =============================================
// 👤 REUSABLE COMPONENTS
// =============================================

const ProfileImage = ({ userId, profileType, alt, size = 40, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getProfileById(userId);
        if (response?.profile) {
          const imageId = profileType === 'influencer'
            ? response.profile.profile_picture
            : response.profile.logo;

          if (imageId) {
            setImageUrl(`${process.env.REACT_APP_API_URL}/profiles/image/${imageId}`);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfileImage();
  }, [userId, profileType]);

  if (loading) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: 'action.hover',
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <CircularProgress size={20} />
      </Avatar>
    );
  }

  if (error || !imageUrl) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          bgcolor: 'primary.light',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick ? {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'scale(1.05)'
          } : {}
        }}
        onClick={onClick}
      >
        {alt?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={imageUrl}
      alt={alt}
      sx={{
        width: size,
        height: size,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'scale(1.05)'
        } : {}
      }}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
};

const UserInfo = ({ userId, profileType, showEmail = false, size = 40, showStats = false }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await profileAPI.getProfileById(userId);
        if (response?.profile) {
          setUserData(response.profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  const handleViewProfile = () => {
    navigate(`/brand/profile/view/${profileType}/${userId}`);
  };

  const getDisplayName = () => {
    if (!userData) return 'Brio User';
    return profileType === 'influencer'
      ? userData.nickname || userData.full_name || 'Unknown Influencer'
      : userData.company_name || userData.contact_person_name || 'Unknown Brand';
  };

  const getStats = () => {
    if (!userData || !showStats) return null;

    if (profileType === 'influencer') {
      return {
        followers: userData.followers_count || 'N/A',
        engagement: userData.engagement_rate || 'N/A',
        rating: userData.rating || 'N/A'
      };
    } else {
      return {
        industry: userData.industry || 'N/A',
        location: userData.location || 'N/A'
      };
    }
  };

  const stats = getStats();

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
            {stats.followers !== 'N/A' && profileType === 'influencer' && (
              <Typography variant="caption" color="text.secondary">
                👥 {stats.followers.toLocaleString()}
              </Typography>
            )}
            {stats.engagement !== 'N/A' && profileType === 'influencer' && (
              <Typography variant="caption" color="text.secondary">
                📈 {stats.engagement}%
              </Typography>
            )}
            {stats.rating !== 'N/A' && profileType === 'influencer' && (
              <Typography variant="caption" color="text.secondary">
                ⭐ {stats.rating}
              </Typography>
            )}
            {stats.industry !== 'N/A' && profileType === 'brand' && (
              <Typography variant="caption" color="text.secondary">
                🏢 {stats.industry}
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
// 📊 STATS OVERVIEW COMPONENT
// =============================================

const StatsOverview = ({ agreements, onTabChange }) => {
  const stats = {
    total: agreements.length,
    contracted: agreements.filter(a => a.contract_signed).length,
    pending: agreements.filter(a => a.status === 'approved' && !a.contract_sent).length,
    sent: agreements.filter(a => a.contract_sent && !a.contract_signed).length,
    completed: agreements.filter(a => a.status === 'completed').length,
    mediaReady: agreements.filter(a => a.status === 'media_submitted').length
  };

  const statItems = [
    {
      label: 'Total Agreements',
      value: stats.total,
      icon: <Description sx={{ fontSize: 32 }} />,
      color: 'primary',
      tab: 'all'
    },
    {
      label: 'Ready for Contract',
      value: stats.pending,
      icon: <AccessTime sx={{ fontSize: 32 }} />,
      color: 'warning',
      tab: 'approved'
    },
    {
      label: 'Contract Sent',
      value: stats.sent,
      icon: <Send sx={{ fontSize: 32 }} />,
      color: 'info',
      tab: 'sent'
    },
    {
      label: 'Contract Signed',
      value: stats.contracted,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: 'success',
      tab: 'contracted'
    },
    {
      label: 'Media Ready',
      value: stats.mediaReady,
      icon: <ImageIcon sx={{ fontSize: 32 }} />,
      color: 'secondary',
      tab: 'media_submitted'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      color: 'primary',
      tab: 'completed'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statItems.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.label}>
          <StatsCard
            color={stat.color}
            onClick={() => onTabChange(stat.tab)}
            sx={{ height: '100%' }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Avatar sx={{
                bgcolor: `${stat.color}.light`,
                color: `${stat.color}.dark`,
                width: 60,
                height: 60
              }}>
                {stat.icon}
              </Avatar>
            </Box>
            <Typography variant="h4" fontWeight="800" color={`${stat.color}.main`} gutterBottom>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="600">
              {stat.label}
            </Typography>
          </StatsCard>
        </Grid>
      ))}
    </Grid>
  );
};

// =============================================
// 🔄 WORKFLOW COMPONENTS
// =============================================

const AgreementWorkflow = ({ agreement }) => {
  const steps = [
    {
      label: 'Application Approved',
      status: 'completed',
      description: 'Influencer application was approved',
      date: agreement.applied_at,
      icon: <ThumbUp />
    },
    {
      label: 'Contract Prepared',
      status: 'completed',
      description: 'Contract agreement ready to send',
      date: agreement.applied_at,
      icon: <Description />
    },
    {
      label: 'Contract Sent',
      status: agreement.contract_sent ? 'completed' : agreement.contract_signed ? 'completed' : 'pending',
      description: agreement.contract_sent ?
        `Contract sent to influencer on ${new Date(agreement.contract_sent_at).toLocaleDateString()}` :
        'Ready to send contract agreement',
      date: agreement.contract_sent_at,
      icon: <Send />
    },
    {
      label: 'Contract Signed',
      status: agreement.contract_signed ? 'completed' : 'pending',
      description: agreement.contract_signed ?
        `Contract signed by influencer on ${new Date(agreement.contract_signed_at).toLocaleDateString()}` :
        'Waiting for influencer signature',
      date: agreement.contract_signed_at,
      icon: <CheckCircle />
    },
    {
      label: 'Media Submission',
      status: ['media_submitted', 'completed'].includes(agreement.status) ? 'completed' : 'pending',
      description: agreement.media_submitted_at ?
        `Media submitted on ${new Date(agreement.media_submitted_at).toLocaleDateString()}` :
        'Waiting for media submission',
      date: agreement.media_submitted_at,
      icon: <ImageIcon />
    },
    {
      label: 'Payment Processed',
      status: agreement.status === 'completed' ? 'completed' : 'pending',
      description: agreement.payment_date ?
        `Payment completed on ${new Date(agreement.payment_date).toLocaleDateString()}` :
        'Ready for payment processing',
      date: agreement.payment_date,
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
        Agreement Workflow
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
// 💼 CAMPAIGN DETAILS SECTION
// =============================================

const CampaignDetailsSection = ({ agreement }) => {
  const [campaignData, setCampaignData] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (agreement?.campaign_id) {
        try {
          const response = await campaignAPI.getCampaignDetail(agreement.campaign_id);
          setCampaignData(response);
        } catch (error) {
          console.error('Error fetching campaign data:', error);
        }
      }
    };

    fetchCampaignData();
  }, [agreement]);

  return (
    <Box sx={{ p: 4 }}>
      {/* Campaign Details - FULL WIDTH High-Fidelity Design */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FontAwesomeIcon icon={faBullseye} />
          Campaign Overview
        </Typography>

        {agreement && (
          <Box sx={{
            p: 4,
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Status Indicator */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              p: 3
            }}>
              <StatusChip
                label={agreement.status?.toUpperCase() || 'ACTIVE'}
                status={agreement.status}
              />
            </Box>

            <Typography variant="h4" fontWeight="800" gutterBottom color="primary">
              {agreement.title}
            </Typography>

            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: '12px', color: 'success.main', display: 'flex' }}>
                    <AttachMoney />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Package Price
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {agreement.currency || 'USD'} {agreement.budget?.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: '12px', color: 'info.main', display: 'flex' }}>
                    <Category />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Niche Category
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {agreement.category || 'Lifestyle'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: '12px', color: 'warning.main', display: 'flex' }}>
                    <Schedule />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Submission Deadline
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {agreement.deadline ? format(new Date(agreement.deadline), 'MMM dd, yyyy') : 'No Date Set'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: '12px', color: 'secondary.main', display: 'flex' }}>
                    <Flag />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Campaign Priority
                    </Typography>
                    <Typography variant="h6" fontWeight="700">
                      {campaignData?.priority || 'Normal'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {campaignData?.description && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description sx={{ fontSize: 20 }} />
                  About the Collaboration
                </Typography>
                <Typography variant="body1" sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
                  borderRadius: '16px',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                  color: 'text.primary',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  {campaignData.description}
                </Typography>
              </Box>
            )}

            {campaignData?.requirements && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment sx={{ fontSize: 20 }} />
                  Campaign Requirements
                </Typography>
                <Typography variant="body1" sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #fff9f0 0%, #fff4e5 100%)',
                  borderRadius: '16px',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                  color: 'text.primary',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  {campaignData.requirements}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};



// =============================================
// 💰 SEND CONTRACT DIALOG (Enhanced)
// =============================================

const SendContractDialog = ({ open, onClose, agreement, onSendContract }) => {
  const [sending, setSending] = useState(false);
  const [influencerData, setInfluencerData] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const safeAgreement = agreement || {};
  const isResend = safeAgreement.contract_sent;

  useEffect(() => {
    const fetchData = async () => {
      if (open && safeAgreement.influencer_id && safeAgreement.campaign_id) {
        setLoading(true);
        try {
          // Fetch influencer data
          let influencerResponse;
          try {
            influencerResponse = await profileAPI.getProfileById(safeAgreement.influencer_id);
          } catch (error) {
            console.error('Error fetching influencer data:', error);
            influencerResponse = {
              profile: {
                nickname: safeAgreement.influencer_name || 'Unknown Influencer',
                full_name: safeAgreement.influencer_name || 'Unknown Influencer',
                email: safeAgreement.influencer_email || 'No email available',
                categories: safeAgreement.category ? [safeAgreement.category] : [],
                bio: safeAgreement.message || 'No bio available'
              }
            };
          }

          // Fetch campaign data
          let campaignResponse;
          try {
            campaignResponse = await campaignAPI.getCampaignById(safeAgreement.campaign_id);
          } catch (error) {
            console.error('Error fetching campaign data:', error);
            campaignResponse = {
              title: safeAgreement.title || 'Unknown Campaign',
              description: safeAgreement.description || 'No description available',
              budget: safeAgreement.budget || 0,
              currency: safeAgreement.currency || 'USD',
              category: safeAgreement.category || 'General',
              deadline: safeAgreement.deadline,
              status: safeAgreement.status || 'active',
              requirements: safeAgreement.requirements || 'No specific requirements'
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
  }, [open, safeAgreement]);

  const handleSendContract = async () => {
    if (!agreement) return;

    setSending(true);
    try {
      await onSendContract(agreement, isResend);
      onClose();
    } catch (error) {
      console.error('Error sending contract:', error);
    } finally {
      setSending(false);
    }
  };

  if (!agreement) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>No agreement data available.</Typography>
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
          borderRadius: '24px',
          minHeight: '80vh',
          background: '#ffffff',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        background: isResend ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        fontWeight: 800,
        py: 4,
        px: 4
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={3}>
            <Box sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              p: 2,
              borderRadius: '16px',
              display: 'flex'
            }}>
              <FontAwesomeIcon icon={faFileContract} size="2x" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="800">
                {isResend ? 'Resend Digital Contract' : 'Send Agreement Contract'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {isResend ? 'Updating terms for' : 'Initiating collaboration with'} {influencerData?.nickname || influencerData?.full_name || 'Brio User'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, border: 'none' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px" flexDirection="column">
            <CircularProgress size={60} thickness={5} />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 700, color: 'primary.main' }}>
              Preparing high-fidelity contract...
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            {/* Full-Width Section 1: Influencer Discovery & Context */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <FontAwesomeIcon icon={faUserTag} />
                Creator Selection
              </Typography>

              <Box sx={{
                p: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f9faff 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}>
                <UserInfo
                  userId={safeAgreement.influencer_id}
                  profileType="influencer"
                  showEmail={true}
                  showStats={true}
                  size={90}
                />

                <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <StatusChip
                      label={isResend ? 'REVISION REQUEST' : 'READY FOR CONTRACT'}
                      status={isResend ? 'sent' : 'approved'}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Full-Width Section 2: Campaign Terms */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <FontAwesomeIcon icon={faBullseye} />
                Agreement Parameters
              </Typography>

              <Box sx={{
                p: 4,
                bgcolor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
              }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ p: 2.5, bgcolor: 'success.light', borderRadius: '20px', textAlign: 'center' }}>
                      <FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: '1.5rem', color: '#059669', marginBottom: '12px' }} />
                      <Typography variant="h5" fontWeight="900" color="#047857">
                        {campaignData?.currency || 'USD'} {campaignData?.budget?.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" fontWeight="700" sx={{ color: '#047857', opacity: 0.8 }}>
                        PROPOSED BUDGET
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="h5" fontWeight="800" color="primary" gutterBottom>
                        {campaignData?.title || 'Loading Campaign...'}
                      </Typography>
                      <Box display="flex" gap={2} mt={1}>
                        <Chip
                          icon={<CalendarToday sx={{ fontSize: '14px !important' }} />}
                          label={`Deadline: ${campaignData?.deadline ? format(new Date(campaignData.deadline), 'PPP') : 'N/A'}`}
                          size="small"
                          sx={{ borderRadius: '8px', fontWeight: 600 }}
                        />
                        <Chip
                          icon={<Flag sx={{ fontSize: '14px !important' }} />}
                          label={`Priority: ${campaignData?.priority || 'Standard'}`}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: '8px', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4, opacity: 0.6 }} />

                <Box>
                  <Typography variant="subtitle2" fontWeight="800" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Deliverables & Requirements
                  </Typography>
                  <Typography variant="body1" sx={{
                    mt: 2,
                    p: 3,
                    bgcolor: '#fcfcfd',
                    borderRadius: '16px',
                    lineHeight: 1.8,
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    {campaignData?.requirements || 'No specific requirements defined for this collaboration.'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Full-Width Section 3: Legal Terms List */}
            <Box>
              <Typography variant="h6" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <FontAwesomeIcon icon={faCircleCheck} />
                Contract Execution Terms
              </Typography>

              <Box sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: '16px',
                mb: 3,
                border: '1px solid',
                borderColor: 'info.main',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <FontAwesomeIcon icon={faRocket} style={{ color: '#0284c7' }} />
                <Typography variant="body2" fontWeight="700" color="info.dark">
                  By sending this contract, you formalize the professional collaboration between your brand and the creator.
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {[
                  { icon: <CheckCircle color="success" />, title: "Usage Rights", desc: "Brand receives full rights to use submitted content for marketing purposes." },
                  { icon: <MonetizationOn color="primary" />, title: "Payment Flow", desc: "Digital payment release within 7 days of final content approval." },
                  { icon: <VerifiedUser color="info" />, title: "Legal Binding", desc: "This agreement is legally binding once digitally signed by both parties." }
                ].map((term, i) => (
                  <Grid item xs={12} md={4} key={i}>
                    <Box sx={{ p: 2.5, height: '100%', bgcolor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                        <Box sx={{ display: 'flex' }}>{term.icon}</Box>
                        <Typography variant="subtitle2" fontWeight="800">{term.title}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                        {term.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {isResend && safeAgreement.contract_sent_at && (
              <Alert severity="warning" sx={{ mt: 4, borderRadius: '16px', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                Attention: This contract was previously dispatched on {format(new Date(safeAgreement.contract_sent_at), 'PPP')}. Resending will override previous terms.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 4, bgcolor: '#fcfcfd', gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{ borderRadius: '14px', px: 6, py: 1.5, fontWeight: 800 }}
          variant="outlined"
          size="large"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendContract}
          disabled={sending || loading}
          startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <FontAwesomeIcon icon={faRocket} />}
          sx={{
            borderRadius: '14px',
            px: 6,
            py: 1.5,
            fontWeight: 800,
            fontSize: '1rem',
            background: isResend ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
            '&:hover': {
              boxShadow: '0 15px 40px rgba(37, 99, 235, 0.3)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          {sending ? (isResend ? 'Resending...' : 'Sending...') : (isResend ? 'Confirm & Resend Contract' : 'Authorize & Send Contract')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// 🛠 UTILITY FUNCTIONS
// =============================================

const getStatusText = (agreement) => {
  if (!agreement) return '';
  if (agreement.contract_signed) {
    return 'Contract Signed';
  } else if (agreement.contract_sent) {
    return 'Contract Sent';
  } else if (agreement.status === 'media_submitted') {
    return 'Media Submitted';
  } else if (agreement.status === 'completed') {
    return 'Completed';
  } else {
    return 'Ready for Contract';
  }
};

const getStatusColor = (agreement) => {
  if (!agreement) return 'pending';
  if (agreement.contract_signed) {
    return 'contracted';
  } else if (agreement.contract_sent) {
    return 'sent';
  } else if (agreement.status === 'media_submitted') {
    return 'media_submitted';
  } else if (agreement.status === 'completed') {
    return 'completed';
  } else {
    return 'approved';
  }
};

// =============================================
// 📄 AGREEMENT DETAILS DIALOG (Enhanced)
// =============================================

const AgreementDetailsDialog = ({ open, onClose, agreement }) => {
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const theme = useTheme();
  const navigate = useNavigate();

  if (!agreement) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          minHeight: '80vh',
          background: '#ffffff',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        fontWeight: 800,
        py: 1.5,
        px: 4
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={3}>
            <Box sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              p: 2,
              borderRadius: '16px',
              display: 'flex'
            }}>
              <FontAwesomeIcon icon={faFileContract} size="2x" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="800">Agreement Intel</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
                {agreement.title} • {getStatusText(agreement)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, border: 'none' }}>
        <TabContext value={activeDetailTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', background: '#fcfcfd', px: 4 }}>
            <Tabs
              value={activeDetailTab}
              onChange={(e, newValue) => setActiveDetailTab(newValue)}
              sx={{
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px'
                },
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  py: 1.5,
                  minHeight: '48px',
                  minWidth: '120px'
                }
              }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <FontAwesomeIcon icon={faChartPie} />
                    Overview
                  </Box>
                }
                value="overview"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <FontAwesomeIcon icon={faBullseye} />
                    Campaign
                  </Box>
                }
                value="campaign"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <FontAwesomeIcon icon={faArrowsRotate} />
                    Workflow
                  </Box>
                }
                value="workflow"
              />
              <Tab
                label={
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <FontAwesomeIcon icon={faUser} />
                    Influencer
                  </Box>
                }
                value="profile"
              />
            </Tabs>
          </Box>

          <TabPanel value="overview" sx={{ p: 4, bgcolor: '#fcfcfd' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 1. Influencer Partnership Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FontAwesomeIcon icon={faUserTag} />
                  Assigned Partnership
                </Typography>
                <Box sx={{
                  p: 3,
                  bgcolor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }
                }}>
                  <UserInfo
                    userId={agreement.influencer_id}
                    profileType="influencer"
                    showEmail={true}
                    showStats={true}
                    size={64}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faRocket} />}
                    onClick={() => window.open(`/brand/profile/view/influencer/${agreement.influencer_id}`, '_blank')}
                    sx={{ borderRadius: '10px', px: 3, py: 1, fontWeight: 700, display: { xs: 'none', md: 'flex' } }}
                  >
                    View Insights
                  </Button>
                </Box>
              </Box>

              {/* 2. Strategic Status Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  Strategic Milestone
                </Typography>
                <Box sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  borderRadius: '24px',
                  color: 'white',
                  boxShadow: '0 12px 32px rgba(25, 118, 210, 0.15)',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 3
                }}>
                  <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                      {getStatusText(agreement)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: '500px', lineHeight: 1.6 }}>
                      {agreement.contract_signed
                        ? 'This collaboration is legally active. All parties are bound by the agreed terms and conditions.'
                        : 'The agreement is currently in the negotiation phase. Waiting for legal finalization.'}
                    </Typography>
                  </Box>
                  <Box sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    p: 3,
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    minWidth: '200px'
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 1.5, opacity: 0.8, display: 'block' }}>
                      LEGAL COMPLIANCE
                    </Typography>
                    <Typography variant="h5" fontWeight="900" sx={{ mt: 0.5 }}>
                      {agreement.contract_signed ? 'SIGNED' : 'PENDING'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 3. Campaign Context Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FontAwesomeIcon icon={faBullseye} />
                  Campaign Context
                </Typography>
                <Box sx={{
                  p: 3,
                  bgcolor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <Typography variant="h6" fontWeight="800">{agreement.campaign_title || 'Active Campaign'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    This agreement is tied to the strategic initiatives of the primary campaign.
                    All deliverables must align with the brand guidelines specified in the campaign brief.
                  </Typography>
                </Box>
              </Box>

              {/* 4. Timeline Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FontAwesomeIcon icon={faCalendarDays} />
                  Operational Roadmap
                </Typography>
                <Box sx={{
                  p: 3,
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: '24px',
                  border: '1px dashed #e0e6ed',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Applied Date', value: agreement.applied_at, color: '#6366f1', icon: <CalendarToday sx={{ fontSize: 18 }} /> },
                      { label: 'Contract Sent', value: agreement.contract_sent_at, color: '#0ea5e9', icon: <Send sx={{ fontSize: 18 }} /> },
                      { label: 'Signed Date', value: agreement.contract_signed_at, color: '#10b981', icon: <VerifiedUser sx={{ fontSize: 18 }} /> },
                      { label: 'Final Deadline', value: agreement.deadline, color: '#f43f5e', icon: <Schedule sx={{ fontSize: 18 }} /> }
                    ].map((item, idx) => (
                      <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: '16px',
                          border: '1px solid rgba(0,0,0,0.03)',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5
                        }}>
                          <Box sx={{ color: item.color, opacity: 0.8, display: 'flex' }}>{item.icon}</Box>
                          <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: '0.7rem' }}>
                            {item.label.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" fontWeight="800">
                            {item.value ? format(new Date(item.value), 'PPP') : 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>

              {/* 5. Financial Value Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                  Contractual Investment
                </Typography>
                <Box sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                  borderRadius: '24px',
                  border: '1px solid rgba(22, 163, 74, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography variant="h4" fontWeight="900" color="#166534">
                      {agreement.currency || 'USD'} {agreement.budget?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', opacity: 0.8, fontWeight: 700, letterSpacing: 1 }}>
                      TOTAL ALLOCATED BUDGET
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" color="success.dark" fontWeight="700" sx={{ fontSize: '0.8rem' }}>
                      Status: Secured via Escrow
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Released on approval
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Notes Context */}
              {agreement.notes && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <FontAwesomeIcon icon={faFileContract} />
                    Administrative Notes
                  </Typography>
                  <Box sx={{
                    p: 3,
                    bgcolor: '#fffbeb',
                    borderRadius: '20px',
                    border: '1px solid rgba(245, 158, 11, 0.1)',
                    color: '#92400e',
                    fontStyle: 'italic',
                    fontSize: '0.9rem',
                    lineHeight: 1.6
                  }}>
                    "{agreement.notes}"
                  </Box>
                </Box>
              )}

              {/* Bottom Actions */}
              <Box sx={{
                mt: 3,
                pt: 4,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}&title=${encodeURIComponent(agreement.campaign_title || '')}`)}
                  sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}
                >
                  Message Partner
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faMessage} />}
                  onClick={() => navigate(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}&title=${encodeURIComponent(agreement.campaign_title || '')}&autoSend=true`)}
                  sx={{ borderRadius: '12px', px: 4, py: 1.5, fontWeight: 700 }}
                >
                  Urgent Update
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value="campaign" sx={{ p: 0 }}>
            <CampaignDetailsSection agreement={agreement} />
          </TabPanel>

          <TabPanel value="workflow" sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="800" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FontAwesomeIcon icon={faArrowsRotate} />
                Agreemement Progress
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Track the end-to-end journey of this collaboration from application to final payment.
              </Typography>
              <AgreementWorkflow agreement={agreement} />
            </Box>
          </TabPanel>

          <TabPanel value="profile" sx={{ p: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{
                  p: 4,
                  bgcolor: 'white',
                  borderRadius: '24px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <UserInfo
                    userId={agreement.influencer_id}
                    profileType="influencer"
                    showEmail={false}
                    showStats={false}
                    size={120}
                  />
                  <Typography variant="h6" fontWeight="800" sx={{ mt: 2 }}>{agreement.influencer_name || 'Creator'}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Verified Influencer</Typography>
                  <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Launch />}
                      onClick={() => window.open(`/brand/profile/view/influencer/${agreement.influencer_id}`, '_blank')}
                      sx={{ borderRadius: '12px', fontWeight: 800, py: 1.2 }}
                    >
                      Full Analysis
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<FontAwesomeIcon icon={faMessage} />}
                      onClick={() => navigate(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}&title=${encodeURIComponent(agreement.campaign_title || '')}`)}
                      sx={{ borderRadius: '12px', fontWeight: 800, py: 1.2 }}
                    >
                      Quick Message
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: '24px', height: '100%' }}>
                  <Typography variant="h6" fontWeight="800" color="primary" gutterBottom>Influencer Context</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    This creator has been vetted for this campaign. Review their performance metrics or initiate direct communication for specific deliverable adjustments.
                  </Typography>

                  <Grid container spacing={2}>
                    {[
                      { label: 'Platform Expertise', value: 'Instagram, TikTok', icon: <FontAwesomeIcon icon={faAward} /> },
                      { label: 'Audience Match', value: 'High Alignment', icon: <FontAwesomeIcon icon={faBullseye} /> },
                      { label: 'Avg. Engagement', value: '4.8%', icon: <FontAwesomeIcon icon={faChartPie} /> }
                    ].map((feat, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Box sx={{ p: 2.5, bgcolor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ color: 'primary.main' }}>{feat.icon}</Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{feat.label}</Typography>
                            <Typography variant="body2" fontWeight="800">{feat.value}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
        </TabContext>
      </DialogContent>

      <DialogActions sx={{ p: 4, bgcolor: '#fcfcfd' }}>
        <Button
          onClick={onClose}
          startIcon={<ArrowBack />}
          sx={{ borderRadius: '14px', px: 6, py: 1.5, fontWeight: 800, fontSize: '0.9rem' }}
          variant="outlined"
        >
          Back to Agreements
        </Button>
      </DialogActions>
    </Dialog>
  );
};



// =============================================
// 🎯 MAIN COMPONENT - BRAND AGREEMENTS
// =============================================

const BrandAgreements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [agreements, setAgreements] = useState([]);
  const [filteredAgreements, setFilteredAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [sendContractDialogOpen, setSendContractDialogOpen] = useState(false);
  const [agreementDetailsOpen, setAgreementDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    minBudget: '',
    maxBudget: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    currency: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedAgreementForMenu, setSelectedAgreementForMenu] = useState(null);

  // Fetch agreements
  useEffect(() => {
    fetchAgreements();
  }, []);

  // Filter agreements
  useEffect(() => {
    let filtered = agreements;

    // Tab filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(agreement => {
        switch (activeTab) {
          case 'contracted': return agreement.contract_signed;
          case 'approved': return agreement.status === 'approved' && !agreement.contract_sent;
          case 'sent': return agreement.contract_sent && !agreement.contract_signed;
          case 'media_submitted': return agreement.status === 'media_submitted';
          case 'completed': return agreement.status === 'completed';
          default: return true;
        }
      });
    }

    // Search filtering
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(agreement =>
        agreement.influencer_name?.toLowerCase().includes(query) ||
        agreement.title?.toLowerCase().includes(query) ||
        agreement.influencer_email?.toLowerCase().includes(query) ||
        agreement.category?.toLowerCase().includes(query)
      );
    }

    // Additional filters
    if (filters.status) {
      filtered = filtered.filter(agreement => {
        if (filters.status === 'contracted') return agreement.contract_signed;
        if (filters.status === 'sent') return agreement.contract_sent && !agreement.contract_signed;
        if (filters.status === 'approved') return agreement.status === 'approved' && !agreement.contract_sent;
        return true;
      });
    }

    if (filters.minBudget) {
      filtered = filtered.filter(agreement => (agreement.budget || 0) >= parseFloat(filters.minBudget));
    }
    if (filters.maxBudget) {
      filtered = filtered.filter(agreement => (agreement.budget || 0) <= parseFloat(filters.maxBudget));
    }
    if (filters.category) {
      filtered = filtered.filter(agreement => agreement.category?.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.currency) {
      filtered = filtered.filter(agreement => agreement.currency === filters.currency);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(agreement => new Date(agreement.applied_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(agreement => new Date(agreement.applied_at) <= toDate);
    }

    setFilteredAgreements(filtered);
    setPage(0);
  }, [agreements, activeTab, searchTerm, filters]);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getBrandApplications();

      const appsData = Array.isArray(response) ? response :
        response.data ? response.data :
          response.applications ? response.applications : [];

      // Filter only approved applications that can have contracts
      const approvedApps = appsData.filter(app =>
        app.status === 'approved' || app.contract_sent || app.contract_signed ||
        app.status === 'media_submitted' || app.status === 'completed'
      );

      setAgreements(approvedApps);
    } catch (err) {
      setError('Failed to load agreements. Please check your connection and try again.');
      console.error('Failed to fetch agreements:', err);
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendContract = async (agreement, isResend = false) => {
    try {
      await campaignAPI.sendContractAgreement(agreement.campaign_id, agreement.influencer_id);
      setSuccess(`Contract ${isResend ? 'resent' : 'sent'} successfully to ${agreement.influencer_name}!`);
      fetchAgreements();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to send contract agreement. Please try again.');
      console.error('Contract sending error:', err);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleProcessPayment = (agreement) => {
    navigate(`/brand/payments?campaign=${agreement.campaign_id}&user=${agreement.influencer_id}`);
  };

  const handleViewApplications = () => {
    navigate('/brand/campaigns/requests');
  };

  const handleDirectChat = (agreement) => {
    const params = new URLSearchParams({
      user: agreement.influencer_id,
      campaign: agreement.campaign_id,
      title: agreement.title,
      budget: agreement.budget || '',
      currency: agreement.currency || 'USD'
    });
    navigate(`/brand/collaborations?${params.toString()}`);
  };

  const handleViewDetails = (agreement) => {
    setSelectedAgreement(agreement);
    setAgreementDetailsOpen(true);
  };

  const handleCloseDialogs = () => {
    setSendContractDialogOpen(false);
    setAgreementDetailsOpen(false);
    setSelectedAgreement(null);
  };

  const handleActionMenuOpen = (event, agreement) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedAgreementForMenu(agreement);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedAgreementForMenu(null);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityActions = (agreement) => {
    if (agreement.contract_signed && agreement.status === 'media_submitted') {
      return (
        <GradientButton
          size="small"
          startIcon={<Payment />}
          onClick={() => handleProcessPayment(agreement)}
        >
          Process Payment
        </GradientButton>
      );
    } else if (agreement.status === 'approved' && !agreement.contract_sent) {
      return (
        <GradientButton
          size="small"
          startIcon={<Send />}
          onClick={() => {
            setSelectedAgreement(agreement);
            setSendContractDialogOpen(true);
          }}
        >
          Send Contract
        </GradientButton>
      );
    } else if (agreement.contract_sent && !agreement.contract_signed) {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AccessTime />}
          disabled
          sx={{ borderRadius: '8px' }}
        >
          Awaiting Accept
        </Button>
      );
    } else if (agreement.status === 'completed') {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<CheckCircle />}
          disabled
          sx={{ borderRadius: '8px' }}
        >
          Completed
        </Button>
      );
    }
    return null;
  };

  // Tab counts
  const tabCounts = {
    all: agreements.length,
    approved: agreements.filter(agreement => agreement.status === 'approved' && !agreement.contract_sent).length,
    sent: agreements.filter(agreement => agreement.contract_sent && !agreement.contract_signed).length,
    contracted: agreements.filter(agreement => agreement.contract_signed).length,
    media_submitted: agreements.filter(agreement => agreement.status === 'media_submitted').length,
    completed: agreements.filter(agreement => agreement.status === 'completed').length
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAgreements = filteredAgreements.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      minBudget: '',
      maxBudget: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      currency: ''
    });
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh" flexDirection="column">
        <CircularProgress size={80} thickness={4} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Loading Agreements...
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Preparing your contract management dashboard
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} flexDirection={isMobile ? "column" : "row"} gap={3} mb={4}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{
              background: '#1976d2',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Contract Agreements
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
              Manage your influencer partnerships, track contract progress, and streamline collaboration workflows
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleViewApplications}
              sx={{ borderRadius: '10px', fontWeight: 600 }}
            >
              View Applications
            </Button>
            <GradientButton
              startIcon={<Refresh />}
              onClick={fetchAgreements}
              disabled={loading}
            >
              Refresh Data
            </GradientButton>
          </Box>
        </Box>

        {/* Stats Overview */}
        <StatsOverview agreements={agreements} onTabChange={handleTabChange} />

        {/* Search and Filters */}
        <GlassCard sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={showFilters ? 3 : 0}>
            <TextField
              fullWidth
              placeholder="Search agreements by influencer, campaign, email, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  background: alpha(theme.palette.background.paper, 0.8),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }
                }
              }}
            />
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
                sx={{
                  border: `2px solid ${showFilters ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.2)}`,
                  borderRadius: '10px',
                  width: 48,
                  height: 48
                }}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
            {(searchTerm || Object.values(filters).some(f => f !== '')) && (
              <Tooltip title="Clear All Filters">
                <IconButton
                  onClick={clearAllFilters}
                  color="error"
                  sx={{
                    border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    borderRadius: '10px',
                    width: 48,
                    height: 48
                  }}
                >
                  <ClearAll />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3} sx={{ width: '100%' }}>
              {/* Row 1: Status, Category, Currency */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', minWidth: '200px' } }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="approved">Ready for Contract</MenuItem>
                  <MenuItem value="sent">Contract Sent</MenuItem>
                  <MenuItem value="contracted">Contract Signed</MenuItem>
                  <MenuItem value="media_submitted">Media Submitted</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Category"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', minWidth: '200px' } }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {Array.from(new Set(agreements.map(a => a.category).filter(Boolean))).map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Currency"
                  value={filters.currency}
                  onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', minWidth: '200px' } }}
                >
                  <MenuItem value="">All Currencies</MenuItem>
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="INR">INR (₹)</MenuItem>
                </TextField>
              </Grid>

              {/* Budget Range */}
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Budget"
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: '12px', minWidth: '100px' } }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Budget"
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ sx: { borderRadius: '12px', minWidth: '100px' } }}
                  />
                </Box>
              </Grid>

              {/* Date From */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Applied From"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', minWidth: '200px' } }}
                />
              </Grid>

              {/* Date To */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Applied To"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { borderRadius: '12px', minWidth: '200px' } }}
                />
              </Grid>

              {/* Row 3: Action */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
                  <Button
                    onClick={clearAllFilters}
                    size="small"
                    startIcon={<Search sx={{ fontSize: 18 }} />}
                    sx={{ fontWeight: 700, borderRadius: '10px', textTransform: 'none', color: 'text.secondary' }}
                  >
                    Reset All Sorting Parameters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Collapse>
        </GlassCard>

        {/* Status Tabs */}
        <Paper sx={{ borderRadius: '16px', mb: 4, overflow: 'hidden', background: 'transparent' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.9rem',
                minHeight: '70px',
                textTransform: 'none',
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              },
              '& .MuiTabs-indicator': {
                background: '#2563eb',
                height: 3,
                borderRadius: '2px 2px 0 0'
              }
            }}
          >
            <Tab
              label={
                <Badge badgeContent={tabCounts.all} color="primary" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  All Agreements
                </Badge>
              }
              value="all"
            />
            <Tab
              label={
                <Badge badgeContent={tabCounts.approved} color="warning" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  Ready for Contract
                </Badge>
              }
              value="approved"
            />
            <Tab
              label={
                <Badge badgeContent={tabCounts.sent} color="info" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  Contract Sent
                </Badge>
              }
              value="sent"
            />
            <Tab
              label={
                <Badge badgeContent={tabCounts.contracted} color="success" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  Contract Signed
                </Badge>
              }
              value="contracted"
            />
            <Tab
              label={
                <Badge badgeContent={tabCounts.media_submitted} color="secondary" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  Media Ready
                </Badge>
              }
              value="media_submitted"
            />
            <Tab
              label={
                <Badge badgeContent={tabCounts.completed} color="primary" showZero sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 700 } }}>
                  Completed
                </Badge>
              }
              value="completed"
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}
          onClose={() => setError('')}
          icon={<Close fontSize="small" />}
        >
          <Typography fontWeight="600">{error}</Typography>
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: '12px', border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}
          onClose={() => setSuccess('')}
          icon={<CheckCircle fontSize="small" />}
        >
          <Typography fontWeight="600">{success}</Typography>
        </Alert>
      )}

      {/* Agreements Table */}
      {filteredAgreements.length === 0 ? (
        <GlassCard sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ color: 'text.secondary' }}>
            <Description sx={{ fontSize: 80, mb: 3, opacity: 0.3 }} />
            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ mb: 2 }}>
              {searchTerm || activeTab !== 'all' ? 'No Matching Agreements Found' : 'No Agreements Yet'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: '500px', mx: 'auto', lineHeight: 1.6 }}>
              {searchTerm || activeTab !== 'all'
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Approved applications will appear here for contract management. Start by reviewing your campaign applications.'
              }
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleViewApplications}
                sx={{ borderRadius: '10px', fontWeight: 600 }}
              >
                Go to Applications
              </Button>
              <GradientButton
                startIcon={<Refresh />}
                onClick={fetchAgreements}
              >
                Refresh Page
              </GradientButton>
            </Box>
          </Box>
        </GlassCard>
      ) : (
        <>
          <GlassCard>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem' }}>Influencer</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem' }}>Campaign</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem' }}>Budget</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem' }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary', py: 3, fontSize: '0.95rem', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAgreements.map((agreement) => (
                    <AnimatedTableRow
                      key={`${agreement.campaign_id}-${agreement.influencer_id}`}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <UserInfo
                          userId={agreement.influencer_id}
                          profileType="influencer"
                          showEmail={false}
                          showStats={true}
                          size={48}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                          {agreement.title}
                        </Typography>
                        {agreement.category && (
                          <Chip
                            label={agreement.category}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: '6px', fontSize: '0.7rem' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                          <Typography variant="body1" fontWeight="700" color="success.main" fontSize="1.1rem">
                            {agreement.currency || 'USD'} {agreement.budget}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" fontWeight="500">
                          {formatDate(agreement.applied_at)}
                        </Typography>
                        {agreement.deadline && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Due: {formatDate(agreement.deadline)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <StatusChip
                          label={getStatusText(agreement)}
                          status={getStatusColor(agreement)}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Box display="flex" gap={1} alignItems="center" justifyContent="center" flexWrap="wrap">
                          {getPriorityActions(agreement)}
                        </Box>
                        <Box display="flex" gap={1} alignItems="center" justifyContent="center" flexWrap="wrap" mt={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(agreement)}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Open Chat">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleDirectChat(agreement)}
                              sx={{
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.2) }
                              }}
                            >
                              <Chat />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleActionMenuOpen(e, agreement)}
                              sx={{
                                bgcolor: alpha(theme.palette.text.primary, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.2) }
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </AnimatedTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>

          <Box sx={{ mt: 3 }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredAgreements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  gap: 2
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 600
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Fab
          onClick={fetchAgreements}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#1976d2',
            color: 'white',
            '&:hover': {
              background: '#1565c0',
            }
          }}
        >
          <Refresh />
        </Fab>
      </Zoom>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedAgreementForMenu);
          handleActionMenuClose();
        }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDirectChat(selectedAgreementForMenu);
          handleActionMenuClose();
        }}>
          <ListItemIcon><Chat fontSize="small" /></ListItemIcon>
          <ListItemText>Open Chat</ListItemText>
        </MenuItem>
        {selectedAgreementForMenu?.status === 'approved' && !selectedAgreementForMenu?.contract_sent && (
          <MenuItem onClick={() => {
            setSelectedAgreement(selectedAgreementForMenu);
            setSendContractDialogOpen(true);
            handleActionMenuClose();
          }}>
            <ListItemIcon><Send fontSize="small" /></ListItemIcon>
            <ListItemText>Send Contract</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          if (selectedAgreementForMenu) {
            navigate(`/brand/profile/view/influencer/${selectedAgreementForMenu.influencer_id}`);
          }
          handleActionMenuClose();
        }}>
          <ListItemIcon><Launch fontSize="small" /></ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <SendContractDialog
        open={sendContractDialogOpen}
        onClose={handleCloseDialogs}
        agreement={selectedAgreement}
        onSendContract={handleSendContract}
      />

      <AgreementDetailsDialog
        open={agreementDetailsOpen}
        onClose={handleCloseDialogs}
        agreement={selectedAgreement}
      />
    </Container>
  );
};

export default BrandAgreements;