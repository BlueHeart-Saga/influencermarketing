import React, { useState, useEffect, useContext } from "react";
import {  useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Container,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  alpha,
  styled, FormHelperText
} from "@mui/material";
import {
  Download,
  Refresh,
  Image as ImageIcon,
  Upgrade,
  Close,
  AutoAwesome,
  WorkspacePremium,
} from "@mui/icons-material";
import { 
  FaRobot, 
  FaRocket, 
  FaChartLine,
  FaMagic,
  FaShieldAlt,
  FaPalette,
  FaBrain,
  FaExclamationTriangle,
  FaInfinity
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Fixed Styled Components - using theme colors directly
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
  borderRadius: '24px',
  padding: theme.spacing(6),
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const PlanLimitCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.05)})`,
  borderRadius: '16px',
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ImageCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
}));

const FeatureIcon = styled(Box)(({ theme, color }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: color 
    ? `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})` 
    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontSize: '24px',
  marginBottom: theme.spacing(2),
}));

const UsageProgress = styled(LinearProgress)(({ theme, value = 0 }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    background: value > 80 
      ? `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`
      : value > 60
      ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.primary.main})`
      : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 4,
  },
}));

const UpgradeButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.warning.main}, #ff9800)`,
  color: 'white',
  fontWeight: '600',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.warning.dark}, #f57c00)`,
    transform: 'translateY(-2px)',
  },
}));

// Main Component - Rest of your component remains the same...
const ImageGenerate = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "brand"; 
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(4);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [usageInfo, setUsageInfo] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [canGenerate, setCanGenerate] = useState(true);
  const [canGenerateCheck, setCanGenerateCheck] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialog, setImageDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();
  const resultsRef = React.useRef(null);

  useEffect(() => {
  if (images.length > 0 && resultsRef.current) {
    resultsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}, [images]);



  // Get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch usage and plan info
  const fetchUsageInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/images/usage`, {
        headers: getAuthHeader()
      });
      setUsageInfo(response.data);
      
      // Get plan info from user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setPlanInfo(userData.plan_benefits || userData.subscription);
    } catch (err) {
      console.error("Failed to fetch usage info:", err);
      // Set default usage info if API fails
      setUsageInfo({
        plan: { name: "Free Trial", type: "trial" },
        limits: { max_image_generations_per_day: 10, can_generate_images: true },
        usage: { today_used: 0, total_used: 0, daily_usage_percent: 0 },
        remaining: { daily: 10 }
      });
    }
  };

  // Check generation limits
  const checkCanGenerate = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/images/can-generate?num_images=${numImages}`,
        { headers: getAuthHeader() }
      );
      setCanGenerateCheck(response.data);
      setCanGenerate(response.data.can_generate);
      if (!response.data.can_generate) {
        setError(response.data.message);
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Failed to check generation limit:", err);
      setCanGenerate(true); // Default to true if check fails
    }
  };

  // Generate multiple images with subscription limits
  const generateMultipleImages = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setImages([]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/images/generate`,
        { 
          prompt: prompt.trim(),
          num_images: numImages 
        },
        { 
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      );

      if (response.data?.images?.length > 0) {
        setImages(response.data.images);
        setSuccess(`🎉 Generated ${response.data.images.length} images! ${response.data.usage_info?.remaining || 0} remaining today.`);
        
        // Update local usage state
        setUsageInfo(prev => ({
          ...prev,
          usage: {
            ...prev?.usage,
            today_used: response.data.usage_info?.today_used || 0
          },
          remaining: {
            daily: response.data.usage_info?.remaining || 0
          }
        }));
      } else {
        setError("No images were generated. Please try again.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      handleGenerationError(err);
    } finally {
      setLoading(false);
      // Refresh usage info
      setTimeout(fetchUsageInfo, 1000);
    }
  };

  // Handle generation errors
  const handleGenerationError = (err) => {
    if (err.response?.status === 402) {
      setError(`${err.response.data.detail} Consider upgrading your plan.`);
    } else if (err.response?.status === 403) {
      setError("You don't have permission to generate images. Please contact support.");
    } else if (err.response?.status === 429) {
      setError("Rate limit exceeded. Please wait a moment before trying again.");
    } else if (err.response?.data?.detail) {
      setError(err.response.data.detail);
    } else if (err.code === 'NETWORK_ERROR') {
      setError("Network error. Please check your connection and try again.");
    } else {
      setError("Failed to generate images. Please try again.");
    }
  };

  // Generate single image (for campaigns - no restrictions)
  const generateSingleImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setImages([]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/images/generate`,
        { 
          prompt: prompt.trim(),
          num_images: 1 
        },
        { 
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }
      );

      if (response.data?.images?.length > 0) {
        setImages(response.data.images);
        setSuccess("✨ Single image generated successfully for your campaign!");
      } else {
        setError("No image was generated. Please try again.");
      }
    } catch (err) {
      console.error("Single image generation error:", err);
      handleGenerationError(err);
    } finally {
      setLoading(false);
    }
  };

  // Download image
  const downloadImage = async (imageUrl, index) => {
    try {
      // Use the download endpoint for better reliability
      const response = await axios.get(
        `${API_BASE_URL}/api/images/download?url=${encodeURIComponent(imageUrl)}`,
        { 
          headers: getAuthHeader(),
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${Date.now()}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`📥 Downloaded image ${index + 1} successfully!`);
    } catch (err) {
      console.error("Download error:", err);
      // Fallback to direct download
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-image-${Date.now()}-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess(`📥 Downloaded image ${index + 1} successfully!`);
      } catch (fallbackErr) {
        setError("Failed to download image. Please try again.");
      }
    }
  };

  // Download all images
  const downloadAllImages = async () => {
    for (let i = 0; i < images.length; i++) {
      await downloadImage(images[i], i);
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger downloads
    }
  };

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!usageInfo || usageInfo.limits.max_image_generations_per_day === -1) return 0;
    if (usageInfo.limits.max_image_generations_per_day === 0) return 100;
    const used = usageInfo.usage?.today_used || 0;
    const limit = usageInfo.limits.max_image_generations_per_day;
    return Math.round((used / limit) * 100);
  };

  // Get remaining images
  const getRemainingImages = () => {
    if (!usageInfo) return 0;
    if (usageInfo.limits.max_image_generations_per_day === -1) return "Unlimited";
    const used = usageInfo.usage?.today_used || 0;
    const limit = usageInfo.limits.max_image_generations_per_day;
    return Math.max(0, limit - used);
  };

  // Get plan tier information
  const getPlanTier = () => {
    if (!usageInfo) return 'trial';
    return usageInfo.plan?.type || 'trial';
  };

  
 const goToSubscription = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/auth/me`, {
      withCredentials: true
    });

    const role = res.data.role;

    if (role === "brand") {
      window.location.href = "/brand/Subscription";
    } else if (role === "influencer") {
      window.location.href = "/influencer/Subscription";
    } else {
      window.location.href = "/pricing";
    }

  } catch (err) {
    console.error("Failed to fetch user info", err);
    window.location.href = "/login";
  }
};


  // Get plan features based on current plan - FIXED COLOR REFERENCES
  const getPlanFeatures = () => {
    const planTier = getPlanTier();
    const dailyLimit = usageInfo?.limits.max_image_generations_per_day;
    
    const baseFeatures = [
      { 
        icon: <FaRobot />, 
        label: "AI Generations", 
        value: dailyLimit === -1 ? "Unlimited" : `${dailyLimit}/day`,
        color: theme.palette.primary.main
      },
      { 
        icon: <FaRocket />, 
        label: "Resolution", 
        value: planTier === 'trial' ? "Basic" : planTier === 'starter' ? "Medium" : "HD",
        color: theme.palette.secondary.main 
      },
    ];

    if (planTier === 'trial') {
      return [
        ...baseFeatures,
        { 
          icon: <FaChartLine />, 
          label: "Quality", 
          value: "Standard", 
          color: theme.palette.info.main
        },
        { 
          icon: <FaShieldAlt />, 
          label: "Commercial Use", 
          value: "Limited",
          color: theme.palette.warning.main 
        },
      ];
    }

    if (planTier === 'starter') {
      return [
        ...baseFeatures,
        { 
          icon: <FaChartLine />, 
          label: "Quality", 
          value: "Enhanced", 
          color: theme.palette.info.main 
        },
        { 
          icon: <FaShieldAlt />, 
          label: "Commercial Use", 
          value: "Basic",
          color: theme.palette.warning.main 
        },
      ];
    }

    if (planTier === 'pro') {
      return [
        ...baseFeatures,
        { 
          icon: <FaMagic />, 
          label: "Advanced Styles", 
          value: "Available", 
          color: theme.palette.info.main 
        },
        { 
          icon: <FaShieldAlt />, 
          label: "Commercial Use", 
          value: "Full",
          color: theme.palette.success.main 
        },
      ];
    }

    // Enterprise
    return [
      ...baseFeatures,
      { 
        icon: <FaMagic />, 
        label: "Custom Models", 
        value: "Available", 
        color: theme.palette.info.main 
      },
      { 
        icon: <FaInfinity />, 
        label: "Priority Support", 
        value: "24/7", 
        color: theme.palette.success.main 
      },
    ];
  };

  // Get upgrade message based on current plan
  const getUpgradeMessage = () => {
    const planTier = getPlanTier();
    
    switch (planTier) {
      case 'trial':
        return {
          title: "Upgrade to Starter",
          description: "Get 5x more daily generations and higher resolution images",
          buttonText: "Upgrade Now"
        };
      case 'starter':
        return {
          title: "Go Pro",
          description: "Unlock advanced styles and full commercial usage rights",
          buttonText: "Upgrade to Pro"
        };
      case 'pro':
        return {
          title: "Enterprise Power",
          description: "Get unlimited generations and custom model training",
          buttonText: "Contact Sales"
        };
      default:
        return {
          title: "Upgrade Your Plan",
          description: "Get more features and higher limits",
          buttonText: "Upgrade Now"
        };
    }
  };

  useEffect(() => {
    fetchUsageInfo();
  }, []);

  useEffect(() => {
    if (prompt && numImages > 0) {
      checkCanGenerate();
    }
  }, [numImages, prompt]);

  const planFeatures = getPlanFeatures();
  const usagePercentage = getUsagePercentage();
  const remainingImages = getRemainingImages();
  const upgradeMessage = getUpgradeMessage();
  const planTier = getPlanTier();

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* Hero Section - Always Full Width */}
      <HeroSection sx={{ mb: 4 }}>
        <Fade in timeout={1000}>
          <Box>
            <FeatureIcon sx={{ margin: '0 auto 16px' }}>
              <FaBrain />
            </FeatureIcon>
            <Typography variant="h3" fontWeight="700" gutterBottom>
              AI Image Generator
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, margin: '0 auto' }}>
              Transform your ideas into stunning visuals with our advanced AI image generation technology
            </Typography>
            
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="primary">
                  {usageInfo?.usage?.total_used || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Generations
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="secondary">
                  {remainingImages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Remaining Today
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="700" color="success.main">
                  {planTier === 'enterprise' ? '∞' : 'HD'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {planTier === 'enterprise' ? 'Unlimited' : 'Quality'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      </HeroSection>

      {/* Content in single column for full width */}
      <Box sx={{ width: '100%' }}>
        {/* Plan Info & Controls Section - Full Width Stacked */}
        <Box sx={{ mb: 4, width: '100%' }}>
          {/* Plan Limits Card - Always Full Width */}
          <PlanLimitCard sx={{ mb: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <WorkspacePremium color="primary" sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="600">
                  {usageInfo?.plan?.name || "Free Trial"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {planTier === 'trial' ? `${usageInfo?.plan?.trial_days_remaining || 15} days remaining` : 'Active plan'}
                </Typography>
              </Box>
              <Chip 
                label={planTier === 'trial' ? 'Trial' : planTier} 
                color={
                  planTier === 'trial' ? 'warning' : 
                  planTier === 'enterprise' ? 'secondary' : 'success'
                }
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            {/* Usage Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Daily Usage
                </Typography>
                <Typography variant="body2" fontWeight="600" color={
                  usagePercentage > 80 ? 'error' : usagePercentage > 60 ? 'warning' : 'primary'
                }>
                  {usageInfo?.usage?.today_used || 0} / {usageInfo?.limits.max_image_generations_per_day === -1 ? '∞' : usageInfo?.limits.max_image_generations_per_day}
                </Typography>
              </Box>
              <UsageProgress variant="determinate" value={usagePercentage} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {remainingImages} generations remaining today
              </Typography>
            </Box>

            {/* Upgrade Prompt for trial users */}
            {planTier === 'trial' && (
              <Alert 
                severity="info" 
                sx={{ mb: 2, borderRadius: '8px' }}
                icon={<FaExclamationTriangle />}
              >
                <Typography variant="body2" fontWeight="600">
                  Trial Plan
                </Typography>
                <Typography variant="body2">
                  Upgrade to unlock more generations and premium features
                </Typography>
              </Alert>
            )}

            {!canGenerate && canGenerateCheck.reason && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px' }}>
                <Typography variant="body2" fontWeight="600">
                  Limit Reached
                </Typography>
                <Typography variant="body2">
                  {canGenerateCheck.message}
                </Typography>
              </Alert>
            )}
          </PlanLimitCard>

          {/* Generation Controls - Always Full Width */}
          <Card sx={{ p: 3, borderRadius: '16px', mb: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Generate Images
            </Typography>

            <TextField
              fullWidth
              label="Describe your image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 3 }}
              placeholder="A majestic dragon flying over a medieval castle at sunset, digital art..."
              error={!canGenerate}
              helperText={!canGenerate ? "Cannot generate with current limits" : "Be creative and descriptive for better results"}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Number of Images</InputLabel>
              <Select
                value={numImages}
                label="Number of Images"
                onChange={(e) => setNumImages(e.target.value)}
                disabled={!canGenerate}
              >
                <MenuItem value={1}>1 Image</MenuItem>
                <MenuItem value={2}>2 Images</MenuItem>
                <MenuItem value={3}>3 Images</MenuItem>
                <MenuItem value={4}>4 Images</MenuItem>
              </Select>
              <FormHelperText>
                AI typically returns 2-4 images per prompt
              </FormHelperText>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <Button
                fullWidth={isMobile}
                variant="contained"
                onClick={generateMultipleImages}
                disabled={loading || !canGenerate || !prompt.trim()}
                startIcon={loading ? <CircularProgress size={16} /> : <AutoAwesome />}
                size="large"
                sx={{ flex: 1 }}
              >
                {loading ? "Generating..." : `Generate ${numImages} Images`}
              </Button>
              
              <Tooltip title="Generate single image for campaign creation">
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  onClick={generateSingleImage}
                  disabled={loading || !prompt.trim()}
                  startIcon={<ImageIcon />}
                  size="large"
                >
                  Single Image
                </Button>
              </Tooltip>
            </Box>

            {!canGenerate && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <UpgradeButton
                  variant="contained"
                  startIcon={<Upgrade />}
                  onClick={goToSubscription}

                  size="small"
                >
                  {upgradeMessage.buttonText}
                </UpgradeButton>
              </Box>
            )}
          </Card>
        </Box>

        {/* Plan Features Section - Always Full Width */}
        <Card sx={{ p: 3, borderRadius: '16px', mb: 4, width: '100%' }}>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Plan Features
          </Typography>
          <Grid container spacing={2}>
            {planFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <FeatureIcon color={feature.color} sx={{ margin: '0 auto 8px' }}>
                    {feature.icon}
                  </FeatureIcon>
                  <Typography variant="body2" fontWeight="600" gutterBottom>
                    {feature.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Upgrade CTA */}
          {planTier !== 'enterprise' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: '8px' }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                {upgradeMessage.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {upgradeMessage.description}
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                fullWidth
                onClick={() =>
              navigate(`/${role}/Subscription`)}
              >
                {upgradeMessage.buttonText}
              </Button>
            </Box>
          )}
        </Card>

        {/* Generated Images Section - Always Full Width */}
        <Box sx={{ width: '100%' }} ref={resultsRef}>
          {/* Results Header */}
          {images.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" fontWeight="600">
                Generated Images ({images.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadAllImages}
                  size="small"
                >
                  Download All
                </Button>
                <Button
                  variant="text"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setImages([]);
                    setPrompt("");
                  }}
                  size="small"
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          )}

          {/* Images Grid */}
          <Grid container spacing={3}>
            {images.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Fade in timeout={500 + index * 100}>
                  <ImageCard>
                    <Box 
                      sx={{ 
                        position: 'relative', 
                        paddingTop: '100%', 
                        cursor: 'pointer',
                        background: `url(${imageUrl}) center/cover no-repeat`,
                        '&:hover::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.1)',
                        }
                      }}
                      onClick={() => {
                        setSelectedImage(imageUrl);
                        setImageDialog(true);
                      }}
                    />
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Image #{index + 1}
                        </Typography>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(imageUrl, index);
                            }}
                            color="primary"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </ImageCard>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {images.length === 0 && !loading && (
            <Paper 
              sx={{ 
                textAlign: 'center', 
                p: 8, 
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.1)}`,
                width: '100%',
                mt: 4
              }}
            >
              <FeatureIcon sx={{ margin: '0 auto 16px', width: 64, height: 64 }}>
                <FaPalette />
              </FeatureIcon>
              <Typography variant="h6" gutterBottom color="text.secondary">
                No images generated yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, margin: '0 auto' }}>
                Enter a creative prompt above and generate your first AI masterpiece
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label="Dragons" variant="outlined" onClick={() => setPrompt("A majestic dragon flying over mountains at sunset")} />
                <Chip label="Fantasy" variant="outlined" onClick={() => setPrompt("A magical forest with glowing mushrooms and fairies")} />
                <Chip label="Cyberpunk" variant="outlined" onClick={() => setPrompt("A futuristic city with neon lights and flying cars")} />
              </Box>
            </Paper>
          )}

          {/* Loading State */}
          {loading && (
            <Paper sx={{ textAlign: 'center', p: 8, borderRadius: '16px', width: '100%', mt: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Generating your images...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take 30-60 seconds. Please don't close this page.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog 
        open={imageDialog} 
        onClose={() => setImageDialog(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Image Preview</Typography>
          <IconButton onClick={() => setImageDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 0 }}>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }} 
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setImageDialog(false)}
          >
            Close
          </Button>
          <Button 
            startIcon={<Download />}
            onClick={() => {
              if (selectedImage) {
                downloadImage(selectedImage, images.indexOf(selectedImage));
                setImageDialog(false);
              }
            }}
            variant="contained"
          >
            Download Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messages Snackbar */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError("");
          setSuccess("");
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={error ? "error" : "success"}
          onClose={() => {
            setError("");
            setSuccess("");
          }}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ImageGenerate;