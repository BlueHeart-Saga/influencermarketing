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
  Instagram, YouTube, DescriptionIcon
} from '@mui/icons-material';

import { campaignAPI } from '../../services/api';
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";

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
  background: '#2563eb',
  color: 'white',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '10px 24px',
  textTransform: 'none',
  fontSize: '0.875rem',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#2563eb',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
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
    if (!userData) return 'Loading...';
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

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (agreement?.campaign_id) {
        try {
          const response = await campaignAPI.getCampaignById(agreement.campaign_id);
          setCampaignData(response);
        } catch (error) {
          console.error('Error fetching campaign data:', error);
        }
      }
    };

    fetchCampaignData();
  }, [agreement]);

  return (
    <DetailSection>
      <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
        🎯 Campaign Details
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="h5" fontWeight="700" gutterBottom color="primary">
              {agreement.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip 
                label={agreement.category || 'General'} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
              <Box display="flex" alignItems="center">
                <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                <Typography variant="body1" fontWeight="600" color="success.main">
                  {agreement.currency || 'USD'} {agreement.budget?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {campaignData?.description && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                DESCRIPTION
              </Typography>
              <Typography variant="body2" sx={{ 
                p: 2, 
                background: 'grey.50', 
                borderRadius: '8px', 
                lineHeight: 1.6 
              }}>
                {campaignData.description}
              </Typography>
            </Box>
          )}

          {campaignData?.requirements && (
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                REQUIREMENTS
              </Typography>
              <Typography variant="body2" sx={{ 
                p: 2, 
                background: 'grey.50', 
                borderRadius: '8px', 
                lineHeight: 1.6 
              }}>
                {campaignData.requirements}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              CAMPAIGN TIMELINE
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CalendarToday color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Applied Date" 
                  secondary={new Date(agreement.applied_at).toLocaleDateString()} 
                />
              </ListItem>
              
              {agreement.deadline && (
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Submission Deadline" 
                    secondary={new Date(agreement.deadline).toLocaleDateString()} 
                  />
                </ListItem>
              )}

              {agreement.contract_sent_at && (
                <ListItem>
                  <ListItemIcon>
                    <Send color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Contract Sent" 
                    secondary={new Date(agreement.contract_sent_at).toLocaleDateString()} 
                  />
                </ListItem>
              )}

              {agreement.contract_signed_at && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Contract Signed" 
                    secondary={new Date(agreement.contract_signed_at).toLocaleDateString()} 
                  />
                </ListItem>
              )}

              {agreement.media_submitted_at && (
                <ListItem>
                  <ListItemIcon>
                    <ImageIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Media Submitted" 
                    secondary={new Date(agreement.media_submitted_at).toLocaleDateString()} 
                  />
                </ListItem>
              )}
            </List>
          </GlassCard>
        </Grid>
      </Grid>
    </DetailSection>
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
          borderRadius: '20px', 
          minHeight: '700px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${isResend ? theme.palette.warning.main : theme.palette.primary.main} 0%, ${isResend ? theme.palette.warning.dark : theme.palette.primary.dark} 100%)`,
        color: 'white', 
        fontWeight: 700,
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Description sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5">
                {isResend ? 'Resend Contract Agreement' : 'Send Contract Agreement'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isResend ? 'Resending contract to' : 'Formalize collaboration with'} {influencerData?.nickname || influencerData?.full_name || 'the influencer'}
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
              <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3 }}>
                🎯 Campaign Overview
              </Typography>
              
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
                            {campaignData.deadline ? new Date(campaignData.deadline).toLocaleDateString() : 'N/A'}
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
              <Typography variant="h6" gutterBottom color="primary" fontWeight="700" sx={{ mb: 3 }}>
                👤 Influencer Profile
              </Typography>
              
              {influencerData ? (
                <Box sx={{ p: 3, background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', mb: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <ProfileImage
                      userId={safeAgreement.influencer_id}
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
                  {influencerData.categories && influencerData.categories.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Categories
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {influencerData.categories.slice(0, 3).map((category, index) => (
                          <Chip
                            key={index}
                            label={category}
                            size="small"
                            sx={{ 
                              background: '#2563eb',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                        {influencerData.categories.length > 3 && (
                          <Chip
                            label={`+${influencerData.categories.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Bio */}
                  {influencerData.bio && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        About
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{influencerData.bio}"
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
              <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                📝 Contract Terms
              </Typography>

              <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: '12px', mb: 3 }}>
                <Typography variant="body2" color="info.dark" fontWeight="600">
                  {isResend 
                    ? 'This will resend the contract agreement with updated terms and timeline.'
                    : 'This agreement formalizes the collaboration between your brand and the influencer.'
                  }
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
                    subtext: `${safeAgreement.currency || 'USD'} ${safeAgreement.budget || 'N/A'} upon satisfactory completion` 
                  },
                  { 
                    icon: <Business color="info" />, 
                    text: "Content Usage Rights", 
                    subtext: "Brand receives rights to use submitted content for marketing" 
                  },
                  { 
                    icon: <CheckCircle color="warning" />, 
                    text: "Approval Process", 
                    subtext: "Brand approval required before content publication" 
                  },
                  { 
                    icon: <Payment color="secondary" />, 
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

              {isResend && safeAgreement.contract_sent_at && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                  Contract was previously sent on {new Date(safeAgreement.contract_sent_at).toLocaleDateString()}
                </Alert>
              )}
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
            background: `linear-gradient(135deg, ${isResend ? theme.palette.warning.main : theme.palette.primary.main} 0%, ${isResend ? theme.palette.warning.dark : theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${isResend ? theme.palette.warning.dark : theme.palette.primary.dark} 0%, ${isResend ? theme.palette.warning.main : theme.palette.primary.main} 100%)`
            }
          }}
        >
          {sending ? 'Sending Contract...' : (isResend ? 'Resend Contract Agreement' : 'Send Contract Agreement')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// =============================================
// 📄 AGREEMENT DETAILS DIALOG (Enhanced)
// =============================================

const AgreementDetailsDialog = ({ open, onClose, agreement }) => {
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const theme = useTheme();

  if (!agreement) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '20px', 
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        background: '#2563eb', 
        color: 'white', 
        fontWeight: 700,
        borderRadius: '20px 20px 0 0',
        py: 3
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Description sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5">Agreement Details</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {agreement.title} - {agreement.influencer_name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', background: 'white' }}>
          <Tabs
            value={activeDetailTab}
            onChange={(e, newValue) => setActiveDetailTab(newValue)}
            sx={{ px: 3 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="📊 Overview" value="overview" />
            <Tab label="🎯 Campaign Details" value="campaign" />
            <Tab label="🔄 Workflow" value="workflow" />
            <Tab label="👤 Influencer Profile" value="profile" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeDetailTab === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  👤 Influencer Information
                </Typography>
                <UserInfo
                  userId={agreement.influencer_id}
                  profileType="influencer"
                  showEmail={true}
                  showStats={true}
                  size={64}
                />
                
                {/* Agreement Timeline */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    AGREEMENT TIMELINE
                  </Typography>
                  <GlassCard sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        Applied
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {new Date(agreement.applied_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {agreement.contract_sent_at && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                          Contract Sent
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {new Date(agreement.contract_sent_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    {agreement.contract_signed_at && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="success.main">
                          Contract Signed
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="success.main">
                          {new Date(agreement.contract_signed_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    {agreement.media_submitted_at && (
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="info.main">
                          Media Submitted
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="info.main">
                          {new Date(agreement.media_submitted_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                    {agreement.deadline && (
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="warning.main">
                          Deadline
                        </Typography>
                        <Typography variant="body2" fontWeight="600" color="warning.main">
                          {new Date(agreement.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </GlassCard>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  📄 Agreement Status
                </Typography>
                <StatusChip 
                  label={agreement.contract_signed ? 'Contract Signed' : 
                         agreement.contract_sent ? 'Contract Sent' : 
                         'Ready for Contract'} 
                  status={agreement.contract_signed ? 'contracted' : 
                          agreement.contract_sent ? 'sent' : 'approved'}
                  sx={{ fontSize: '1rem', padding: '8px 16px', mb: 2 }}
                />
                
                {/* Quick Actions */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                    🚀 Quick Actions
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<Person />}
                      onClick={() => window.open(`/brand/profile/view/influencer/${agreement.influencer_id}`, '_blank')}
                      sx={{ borderRadius: '8px' }}
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Chat />}
                      onClick={() => window.open(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}`, '_blank')}
                      sx={{ borderRadius: '8px' }}
                    >
                      Open Chat
                    </Button>
                    {agreement.status === 'approved' && !agreement.contract_sent && (
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={() => {
                          // This would be handled by parent component
                        }}
                        sx={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
                        }}
                      >
                        Send Contract
                      </Button>
                    )}
                    {agreement.status === 'media_submitted' && (
                      <Button
                        variant="contained"
                        startIcon={<Payment />}
                        onClick={() => window.open(`/brand/payments?campaign=${agreement.campaign_id}&user=${agreement.influencer_id}`, '_blank')}
                        sx={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                        }}
                      >
                        Process Payment
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Budget Summary */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    BUDGET SUMMARY
                  </Typography>
                  <GlassCard sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Agreement Value
                      </Typography>
                      <Typography variant="h6" fontWeight="700" color="success.main">
                        {agreement.currency || 'USD'} {agreement.budget}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="body2">
                        Status
                      </Typography>
                      <StatusChip 
                        label={agreement.contract_signed ? 'Contract Active' : 'Pending Signature'} 
                        status={agreement.contract_signed ? 'contracted' : 'pending'}
                        size="small"
                      />
                    </Box>
                  </GlassCard>
                </Box>
              </Grid>
            </Grid>
          )}

          {activeDetailTab === 'campaign' && (
            <CampaignDetailsSection agreement={agreement} />
          )}

          {activeDetailTab === 'workflow' && (
            <AgreementWorkflow agreement={agreement} />
          )}

          {activeDetailTab === 'profile' && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                👤 Influencer Profile Details
              </Typography>
              <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                <UserInfo
                  userId={agreement.influencer_id}
                  profileType="influencer"
                  showEmail={true}
                  showStats={true}
                  size={80}
                />
                <Button
                  variant="contained"
                  startIcon={<Launch />}
                  onClick={() => window.open(`/brand/profile/view/influencer/${agreement.influencer_id}`, '_blank')}
                  sx={{ mt: 3, borderRadius: '12px', px: 4 }}
                >
                  View Full Profile Page
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          startIcon={<ArrowBack />} 
          sx={{ borderRadius: '12px', px: 4 }}
          variant="outlined"
        >
          Back to List
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
    maxBudget: ''
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
      filtered = filtered.filter(agreement => agreement.budget >= parseFloat(filters.minBudget));
    }

    if (filters.maxBudget) {
      filtered = filtered.filter(agreement => agreement.budget <= parseFloat(filters.maxBudget));
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
    navigate(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}`);
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

  const getStatusText = (agreement) => {
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
          Awaiting Signature
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
      maxBudget: ''
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
              background: '#2563eb',
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
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    label="Filter by Status"
                    sx={{ borderRadius: '10px' }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="approved">Ready for Contract</MenuItem>
                    <MenuItem value="sent">Contract Sent</MenuItem>
                    <MenuItem value="contracted">Contract Signed</MenuItem>
                    <MenuItem value="media_submitted">Media Submitted</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Minimum Budget"
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ borderRadius: '10px' }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="medium"
                  label="Maximum Budget"
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={{ borderRadius: '10px' }}
                />
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
            background: '#2563eb',
            color: 'white',
            '&:hover': {
              background: '#2563eb',
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