import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActions,
  Button, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Avatar, styled, Paper,
  IconButton, useTheme, 
  Tabs, Tab, Badge, 
  Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Stepper, Step, StepLabel,
  List, ListItem, ListItemIcon, ListItemText, Divider,
  Collapse, FormControl, InputLabel, Select, MenuItem,
  Tooltip, Fab, Zoom, CardMedia, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';

import {
  Person, CalendarToday, Campaign,
  CheckCircle, Cancel, Visibility,
  Search, Close, TrendingUp, ArrowBack, 
  Send, Payment, Description, Email,
  AccountBalance, Chat, Image as ImageIcon,
  Check, Clear, AccessTime, Work, Refresh,
  Article, DoneAll, PendingActions, ExpandMore,
  VideoLibrary, PictureAsPdf, InsertDriveFile, Download,
  PlayArrow, Instagram, YouTube, LinkedIn,
  Star, StarBorder, ThumbUp, ThumbDown, Business,
  LocationOn, Language, People, TrendingUp as TrendingUpIcon,
  AttachMoney, Schedule, Warning, Info,
  ExpandCircleDown, FilterList, ClearAll,
  MarkEmailRead, ContentCopy, Share,
  FileUpload, TaskAlt, RateReview
} from '@mui/icons-material';
import { FaTikTok } from "react-icons/fa";

import { campaignAPI } from '../../services/api';
import profileAPI from "../../services/profileAPI";
import { AuthContext } from "../../context/AuthContext";

// Styled Components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'contracted' && {
    background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(156, 39, 176, 0.3)',
  }),
  ...(status === 'approved' && {
    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(76, 175, 80, 0.3)',
  }),
  ...(status === 'pending' && {
    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(255, 152, 0, 0.3)',
  }),
  ...(status === 'media_submitted' && {
    background: 'linear-gradient(45deg, #2196F3 30%, #42A5F5 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, 0.3)',
  }),
  ...(status === 'completed' && {
    background: 'linear-gradient(45deg, #607D8B 30%, #78909C 90%)',
    color: 'white',
    boxShadow: '0 3px 5px 2px rgba(96, 125, 139, 0.3)',
  })
}));

const ContractCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.light
  }
}));

const DetailSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
}));

const MediaThumbnail = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid transparent`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.light
  }
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  background: 'linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 0%, #26A69A 100%)',
  }
}));

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
            setImageUrl(`${process.env.REACT_APP_API_URL}/profiles/image/${imageId}`);
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
          cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
const UserInfo = ({ userId, profileType, showEmail = true, size = 32, showStats = false }) => {
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

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
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
        {showEmail && userData?.email && (
          <Typography variant="caption" color="text.secondary" display="block">
            {userData.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Contract Workflow Stepper
const ContractWorkflow = ({ agreement }) => {
  const steps = [
    {
      label: 'Application Approved',
      status: 'completed',
      description: 'Your application was approved by the brand',
      icon: <CheckCircle />
    },
    {
      label: 'Contract Received',
      status: agreement.contract_sent ? 'completed' : 'pending',
      description: agreement.contract_sent ? 
        `Received on ${new Date(agreement.contract_sent_at).toLocaleDateString()}` : 
        'Waiting for contract from brand',
      icon: <Description />
    },
    {
      label: 'Contract Signed',
      status: agreement.contract_signed ? 'completed' : 'pending',
      description: agreement.contract_signed ? 
        `Signed on ${new Date(agreement.contract_signed_at).toLocaleDateString()}` : 
        'Review and sign the contract',
      icon: <MarkEmailRead />
    },
    {
      label: 'Media Submitted',
      status: agreement.status === 'media_submitted' || agreement.status === 'completed' ? 'completed' : 'pending',
      description: agreement.media_submitted_at ? 
        `Submitted on ${new Date(agreement.media_submitted_at).toLocaleDateString()}` : 
        'Submit your media files',
      icon: <FileUpload />
    },
    {
      label: 'Payment Received',
      status: agreement.status === 'completed' ? 'completed' : 'pending',
      description: agreement.payment_date ? 
        `Paid on ${new Date(agreement.payment_date).toLocaleDateString()}` : 
        'Payment processing',
      icon: <Payment />
    }
  ];

  return (
    <DetailSection>
      <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
        Contract Progress
      </Typography>
      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} active={step.status === 'completed'} completed={step.status === 'completed'}>
            <StepLabel
              icon={React.cloneElement(step.icon, { 
                color: step.status === 'completed' ? 'success' : 'disabled' 
              })}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </DetailSection>
  );
};

// Media Files Component
const MediaFilesSection = ({ agreement, onMediaSubmit }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMediaFiles = async () => {
      if (agreement) {
        setLoading(true);
        try {
          const response = await campaignAPI.getInfluencerMediaFiles();
          if (response && Array.isArray(response)) {
            const campaignMedia = response.filter(media => 
              media.campaign_id === agreement.campaign_id
            );
            setMediaFiles(campaignMedia);
          }
        } catch (error) {
          console.error('Error fetching media files:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMediaFiles();
  }, [agreement]);

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'image': return <ImageIcon color="primary" />;
      case 'video': return <VideoLibrary color="secondary" />;
      case 'audio': return <InsertDriveFile color="info" />;
      case 'document': return <PictureAsPdf color="error" />;
      default: return <InsertDriveFile color="action" />;
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await campaignAPI.downloadMediaFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleSubmitMedia = () => {
    setSubmitDialogOpen(true);
  };

  if (!agreement) return null;

  return (
    <DetailSection>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="700" color="primary">
          Media Files
        </Typography>
        {!agreement.contract_signed ? (
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            disabled
            sx={{ borderRadius: '8px' }}
          >
            Sign Contract First
          </Button>
        ) : agreement.status === 'media_submitted' || agreement.status === 'completed' ? (
          <Typography variant="body2" color="success.main" fontWeight="600">
            Media Submitted ✓
          </Typography>
        ) : (
          <Button
            variant="contained"
            startIcon={<FileUpload />}
            onClick={handleSubmitMedia}
            sx={{ borderRadius: '8px' }}
          >
            Submit Media
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : mediaFiles.length === 0 ? (
        <Box textAlign="center" py={4}>
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No media files submitted yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {agreement.contract_signed 
              ? 'Submit your media files to complete the campaign'
              : 'Sign the contract first to submit media files'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {mediaFiles.map((media, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <MediaThumbnail>
                <CardContent sx={{ p: 2, pb: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {getMediaIcon(media.media_type)}
                    <Typography variant="subtitle2" fontWeight="600" noWrap flex={1}>
                      {media.filename}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Type: {media.media_type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Size: {(media.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  
                  {media.description && (
                    <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                      {media.description}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions sx={{ p: 1, gap: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedMedia(media)}
                    sx={{ borderRadius: '6px', fontSize: '0.7rem' }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownload(media.file_id, media.filename)}
                    sx={{ borderRadius: '6px', fontSize: '0.7rem' }}
                  >
                    Download
                  </Button>
                </CardActions>
              </MediaThumbnail>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Media Viewer Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        {selectedMedia && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{selectedMedia.filename}</Typography>
                <IconButton onClick={() => setSelectedMedia(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, textAlign: 'center' }}>
              {selectedMedia.media_type === 'image' ? (
                <img
                  src={`${process.env.REACT_APP_API_URL}/api/media/${selectedMedia.file_id}/view`}
                  alt={selectedMedia.filename}
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                />
              ) : selectedMedia.media_type === 'video' ? (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                >
                  <source src={`${process.env.REACT_APP_API_URL}/api/media/${selectedMedia.file_id}/view`} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Box py={4}>
                  <InsertDriveFile sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload(selectedMedia.file_id, selectedMedia.filename)}
                    sx={{ mt: 1 }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
              
              {selectedMedia.description && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedMedia.description}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Submit Media Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Submit Media Files</Typography>
            <IconButton onClick={() => setSubmitDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            Submit your media files for <strong>{agreement.campaign_title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload images, videos, or documents as required by the campaign.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<FileUpload />}
            onClick={() => {
              setSubmitDialogOpen(false);
              onMediaSubmit(agreement);
            }}
            sx={{ borderRadius: '8px' }}
          >
            Open Media Upload
          </Button>
        </DialogContent>
      </Dialog>
    </DetailSection>
  );
};

// Campaign Details Component
const CampaignDetailsSection = ({ agreement }) => {
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (agreement?.campaign_id) {
        setLoading(true);
        try {
          const response = await campaignAPI.getCampaignById(agreement.campaign_id);
          setCampaignData(response);
        } catch (error) {
          console.error('Error fetching campaign data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCampaignData();
  }, [agreement]);

  if (!agreement) return null;

  return (
    <DetailSection>
      <Typography variant="h6" gutterBottom fontWeight="700" color="primary">
        Campaign Details
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                {agreement.campaign_title}
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
                    {agreement.currency || 'USD'} {agreement.budget}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {campaignData?.description && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  DESCRIPTION
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {campaignData.description}
                </Typography>
              </Box>
            )}

            {campaignData?.requirements && (
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  REQUIREMENTS
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {campaignData.requirements}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
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
                      primary="Contract Received" 
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
              </List>
            </Box>
          </Grid>
        </Grid>
      )}
    </DetailSection>
  );
};

// Contract Acceptance Dialog
const ContractAcceptanceDialog = ({ 
  open, 
  onClose, 
  agreement, 
  onAcceptContract 
}) => {
  const [accepting, setAccepting] = useState(false);

  const handleAcceptContract = async () => {
    setAccepting(true);
    try {
      await onAcceptContract(agreement);
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
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        fontWeight: 600 
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Description />
            <Typography variant="h6">Accept Contract</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="primary">
            Contract Agreement
          </Typography>
          <Typography variant="body1" gutterBottom>
            You are about to accept the contract for <strong>{agreement?.campaign_title}</strong>
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mt: 2 }}>
            <Typography variant="body2" color="success.dark">
              <strong>Contract Details:</strong><br />
              • Campaign: {agreement?.campaign_title}<br />
              • Brand: {agreement?.brand_name}<br />
              • Budget: {agreement?.currency || 'USD'} {agreement?.budget}<br />
              • Deadline: {agreement?.deadline ? new Date(agreement.deadline).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            By accepting this contract, you agree to deliver the required media content according to the campaign specifications and timeline.
          </Alert>
        </Box>
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

// Agreement Details Dialog
const ContractDetailsDialog = ({ open, onClose, agreement, onAcceptContract, onMediaSubmit }) => {
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  if (!agreement) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', minHeight: '80vh' } }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        fontWeight: 700,
        background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Description />
            <Typography variant="h6">Contract Details</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeDetailTab}
            onChange={(e, newValue) => setActiveDetailTab(newValue)}
            sx={{ px: 3 }}
          >
            <Tab label="Overview" value="overview" />
            <Tab label="Campaign Details" value="campaign" />
            <Tab label="Media Files" value="media" />
            <Tab label="Progress" value="progress" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeDetailTab === 'overview' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Brand Information
                </Typography>
                <UserInfo
                  userId={agreement.brand_id}
                  profileType="brand"
                  showEmail={true}
                  showStats={true}
                  size={64}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary" fontWeight="700">
                  Contract Status
                </Typography>
                <StatusChip 
                  label={agreement.contract_signed ? 'Contract Signed' : 
                         agreement.contract_sent ? 'Contract Received' : 
                         'Approved - Waiting Contract'} 
                  status={agreement.contract_signed ? 'contracted' : 
                          agreement.contract_sent ? 'approved' : 'pending'}
                  sx={{ fontSize: '1rem', padding: '8px 16px' }}
                />
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Applied: {new Date(agreement.applied_at).toLocaleDateString()}
                  </Typography>
                  {agreement.contract_sent_at && (
                    <Typography variant="body2" color="text.secondary">
                      Contract Received: {new Date(agreement.contract_sent_at).toLocaleDateString()}
                    </Typography>
                  )}
                  {agreement.contract_signed_at && (
                    <Typography variant="body2" color="success.main" fontWeight="600">
                      Contract Signed: {new Date(agreement.contract_signed_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeDetailTab === 'campaign' && (
            <CampaignDetailsSection agreement={agreement} />
          )}

          {activeDetailTab === 'media' && (
            <MediaFilesSection agreement={agreement} onMediaSubmit={onMediaSubmit} />
          )}

          {activeDetailTab === 'progress' && (
            <ContractWorkflow agreement={agreement} />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} startIcon={<ArrowBack />} sx={{ borderRadius: '10px' }}>
          Back to List
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const InfluencerContracts = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [acceptContractDialogOpen, setAcceptContractDialogOpen] = useState(false);
  const [contractDetailsOpen, setContractDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    platform: '',
    minBudget: '',
    maxBudget: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch contracts
  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter contracts
  useEffect(() => {
    let filtered = contracts;

    // Tab filtering
    if (activeTab !== 'all') {
      filtered = filtered.filter(contract => {
        switch (activeTab) {
          case 'pending': return contract.status === 'approved' && !contract.contract_sent;
          case 'received': return contract.contract_sent && !contract.contract_signed;
          case 'signed': return contract.contract_signed;
          case 'media_submitted': return contract.status === 'media_submitted';
          case 'completed': return contract.status === 'completed';
          default: return true;
        }
      });
    }

    // Search filtering
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.brand_name?.toLowerCase().includes(query) ||
        contract.campaign_title?.toLowerCase().includes(query) ||
        contract.brand_email?.toLowerCase().includes(query)
      );
    }

    // Additional filters
    if (filters.status) {
      filtered = filtered.filter(contract => {
        if (filters.status === 'signed') return contract.contract_signed;
        if (filters.status === 'received') return contract.contract_sent && !contract.contract_signed;
        if (filters.status === 'pending') return contract.status === 'approved' && !contract.contract_sent;
        return true;
      });
    }

    if (filters.minBudget) {
      filtered = filtered.filter(contract => contract.budget >= parseFloat(filters.minBudget));
    }

    if (filters.maxBudget) {
      filtered = filtered.filter(contract => contract.budget <= parseFloat(filters.maxBudget));
    }

    setFilteredContracts(filtered);
    setPage(0); // Reset to first page when filters change
  }, [contracts, activeTab, searchTerm, filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await campaignAPI.getInfluencerApplications();
      
      const appsData = Array.isArray(response) ? response : 
                      response.data ? response.data : 
                      response.applications ? response.applications : [];
      
      // Filter contracts (approved applications with contract workflow)
      const contractApps = appsData.filter(app => 
        app.status === 'approved' || app.contract_sent || app.contract_signed || 
        app.status === 'media_submitted' || app.status === 'completed'
      );
      
      setContracts(contractApps);
    } catch (err) {
      setError('Failed to load contracts. Please check your connection.');
      console.error('Failed to fetch contracts:', err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContract = async (contract) => {
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
        campaign_id: contract.campaign_id,
        influencer_id: currentUserId,
        terms_accepted: true,
        signed_at: new Date().toISOString()
      };

      console.log('Accepting contract:', contractData);
      
      const response = await campaignAPI.acceptContract(contractData);
      console.log('Contract acceptance response:', response);
      
      setSuccess('Contract accepted successfully! You can now submit media files.');
      fetchContracts();
    } catch (err) {
      console.error('Contract acceptance failed:', err);
      const errorDetail = err.response?.data?.detail || err.message;
      setError(`Contract acceptance failed: ${errorDetail}`);
    }
  };

  const handleSubmitMedia = (contract) => {
    navigate(`/influencer/applications?submitMedia=${contract.campaign_id}`);
  };

  const handleViewApplications = () => {
    navigate('/influencer/campaigns/requests');
  };

  const handleDirectChat = (contract) => {
    navigate(`/influencer/collaborations?user=${contract.brand_id}&campaign=${contract.campaign_id}`);
  };

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setContractDetailsOpen(true);
  };

  const handleCloseDialogs = () => {
    setAcceptContractDialogOpen(false);
    setContractDetailsOpen(false);
    setSelectedContract(null);
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusText = (contract) => {
    if (contract.contract_signed) {
      return 'Contract Signed';
    } else if (contract.contract_sent) {
      return 'Contract Received';
    } else if (contract.status === 'media_submitted') {
      return 'Media Submitted';
    } else if (contract.status === 'completed') {
      return 'Completed';
    } else {
      return 'Waiting Contract';
    }
  };

  const getStatusColor = (contract) => {
    if (contract.contract_signed) {
      return 'contracted';
    } else if (contract.contract_sent) {
      return 'approved';
    } else if (contract.status === 'media_submitted') {
      return 'media_submitted';
    } else if (contract.status === 'completed') {
      return 'completed';
    } else {
      return 'pending';
    }
  };

  const getActionButtons = (contract) => {
    if (contract.contract_signed) {
      return (
        <Box display="flex" gap={1}>
          <Tooltip title="View Media Files">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleViewDetails(contract)}
            >
              <ImageIcon />
            </IconButton>
          </Tooltip>
          {contract.status !== 'media_submitted' && contract.status !== 'completed' && (
            <Button
              size="small"
              color="primary"
              variant="contained"
              startIcon={<FileUpload />}
              onClick={() => handleSubmitMedia(contract)}
              sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
            >
              Submit Media
            </Button>
          )}
        </Box>
      );
    } else if (contract.contract_sent) {
      return (
        <Button
          size="small"
          color="success"
          variant="contained"
          startIcon={<CheckCircle />}
          onClick={() => {
            setSelectedContract(contract);
            setAcceptContractDialogOpen(true);
          }}
          sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
        >
          Review Contract
        </Button>
      );
    } else {
      return (
        <Button
          size="small"
          variant="outlined"
          startIcon={<AccessTime />}
          disabled
          sx={{ borderRadius: '6px', fontSize: '0.75rem' }}
        >
          Waiting Contract
        </Button>
      );
    }
  };

  // Tab counts
  const tabCounts = {
    all: contracts.length,
    pending: contracts.filter(contract => contract.status === 'approved' && !contract.contract_sent).length,
    received: contracts.filter(contract => contract.contract_sent && !contract.contract_signed).length,
    signed: contracts.filter(contract => contract.contract_signed).length,
    media_submitted: contracts.filter(contract => contract.status === 'media_submitted').length,
    completed: contracts.filter(contract => contract.status === 'completed').length
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedContracts = filteredContracts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      platform: '',
      minBudget: '',
      maxBudget: ''
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
          Loading contracts...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
              My Contracts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your contracts, submit media, and track payments
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleViewApplications}
              sx={{ borderRadius: '25px', px: 3, fontWeight: 600 }}
            >
              Back to Applications
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchContracts}
              disabled={loading}
              sx={{ borderRadius: '25px', px: 3, fontWeight: 600 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, borderRadius: '12px', mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={showFilters ? 2 : 0}>
            <Search sx={{ color: 'text.secondary' }} />
            <TextField
              fullWidth
              placeholder="Search contracts by brand name, campaign title, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
            />
            <Tooltip title="Toggle Filters">
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
              >
                <FilterList />
              </IconButton>
            </Tooltip>
            {(searchTerm || Object.values(filters).some(f => f !== '')) && (
              <Tooltip title="Clear All Filters">
                <IconButton onClick={clearAllFilters}>
                  <ClearAll />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Waiting Contract</MenuItem>
                    <MenuItem value="received">Contract Received</MenuItem>
                    <MenuItem value="signed">Contract Signed</MenuItem>
                    <MenuItem value="media_submitted">Media Submitted</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Min Budget"
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Max Budget"
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        {/* Status Tabs */}
        <Paper sx={{ borderRadius: '12px', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { fontSize: '0.875rem', fontWeight: 600, py: 2, minHeight: '60px' } }}
          >
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <Article sx={{ mr: 1, fontSize: 20 }} />
                  All Contracts
                  <Chip label={tabCounts.all} size="small" sx={{ ml: 1 }} />
                </Box>
              } 
              value="all" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <PendingActions sx={{ mr: 1, fontSize: 20 }} />
                  Waiting Contract
                  <Chip label={tabCounts.pending} size="small" sx={{ ml: 1 }} color="warning" />
                </Box>
              } 
              value="pending" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <Description sx={{ mr: 1, fontSize: 20 }} />
                  Contract Received
                  <Chip label={tabCounts.received} size="small" sx={{ ml: 1 }} color="info" />
                </Box>
              } 
              value="received" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <CheckCircle sx={{ mr: 1, fontSize: 20 }} />
                  Contract Signed
                  <Chip label={tabCounts.signed} size="small" sx={{ ml: 1 }} color="success" />
                </Box>
              } 
              value="signed" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <FileUpload sx={{ mr: 1, fontSize: 20 }} />
                  Media Ready
                  <Chip label={tabCounts.media_submitted} size="small" sx={{ ml: 1 }} color="primary" />
                </Box>
              } 
              value="media_submitted" 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center">
                  <DoneAll sx={{ mr: 1, fontSize: 20 }} />
                  Completed
                  <Chip label={tabCounts.completed} size="small" sx={{ ml: 1 }} color="secondary" />
                </Box>
              } 
              value="completed" 
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Contracts Table */}
      {filteredContracts.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8, borderRadius: '12px' }}>
          <Box sx={{ color: 'text.secondary' }}>
            <Description sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              {searchTerm || activeTab !== 'all' ? 'No matching contracts found' : 'No contracts yet'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {searchTerm || activeTab !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Approved applications with contracts will appear here.'
              }
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />} 
              onClick={handleViewApplications}
              sx={{ mt: 1 }}
            >
              Go to Applications
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: '12px', mb: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Brand</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Campaign</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Budget</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Applied Date</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedContracts.map((contract) => (
                  <TableRow 
                    key={`${contract.campaign_id}-${contract.influencer_id}`}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <UserInfo
                        userId={contract.brand_id}
                        profileType="brand"
                        showEmail={false}
                        showStats={true}
                        size={40}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">
                        {contract.campaign_title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="success.main">
                        {contract.currency || 'USD'} {contract.budget}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(contract.applied_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip 
                        label={getStatusText(contract)} 
                        status={getStatusColor(contract)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} alignItems="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(contract)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Open Chat">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleDirectChat(contract)}
                          >
                            <Chat />
                          </IconButton>
                        </Tooltip>
                        
                        {getActionButtons(contract)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredContracts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Floating Action Button */}
      <Zoom in={true}>
        <FloatingActionButton
          onClick={fetchContracts}
          aria-label="refresh contracts"
        >
          <Refresh />
        </FloatingActionButton>
      </Zoom>

      {/* Accept Contract Dialog */}
      <ContractAcceptanceDialog
        open={acceptContractDialogOpen}
        onClose={handleCloseDialogs}
        agreement={selectedContract}
        onAcceptContract={handleAcceptContract}
      />

      {/* Contract Details Dialog */}
      <ContractDetailsDialog
        open={contractDetailsOpen}
        onClose={handleCloseDialogs}
        agreement={selectedContract}
        onAcceptContract={handleAcceptContract}
        onMediaSubmit={handleSubmitMedia}
      />
    </Container>
  );
};

export default InfluencerContracts;