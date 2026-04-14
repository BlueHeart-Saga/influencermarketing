import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Fade,
  Container,
  Zoom,
  Slide,
  Grow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Category,
  Description,
  Checklist,
  TrendingUp,
  ArrowForward,
  ArrowBack,
  Image,
  Videocam,
  AutoAwesome,
  ExpandMore,
  RocketLaunch,
  Celebration,
  AttachMoney,
  Schedule,
  Title as TitleIcon,
  CheckCircle,
  Visibility,
  Close,
  Download,
  AddPhotoAlternate,
  Edit as EditIcon,
  Shuffle,
  ConfirmationNumber,
  History,
  Update
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';
import axios from 'axios';

// API base URL for logo fetching
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const BrandCreateCampaign = ({ onCampaignCreated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    category: '',
    deadline: '',
    currency: 'USD',
    campaignImage: null,
    campaignVideo: null,
    productLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [showFullBudget, setShowFullBudget] = useState(false);

  // Initializing state from location if editing
  useEffect(() => {
    if (location.state && location.state.campaign) {
      const { campaign } = location.state;
      console.log('Initializing edit mode for campaign:', campaign);

      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        requirements: campaign.requirements || '',
        budget: campaign.budget ? campaign.budget.toString() : '',
        category: campaign.category || '',
        deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
        currency: campaign.currency || 'USD',
        campaignImage: null,
        campaignVideo: null,
        productLink: campaign.product_link || ''
      });

      if (campaign.campaign_image_id) {
        setImagePreview(`${API_BASE_URL}/api/campaigns/image/${campaign.campaign_image_id}`);
      } else if (campaign.campaign_image) {
        setImagePreview(campaign.campaign_image);
      }

      if (campaign.campaign_video_id) {
        setVideoPreview(`${API_BASE_URL}/api/campaigns/video/${campaign.campaign_video_id}`);
      } else if (campaign.campaign_video) {
        setVideoPreview(campaign.campaign_video);
      }

      setIsEditMode(true);
      setCampaignId(campaign._id || campaign.id || '');
    }
  }, [location.state]);

  // Fetch dynamic logo
  const fetchLogo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logo/current`, {
        headers: {}, // No token needed for public access
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setLogoUrl(url);
      } else {
        setLogoUrl(""); // fallback if no logo
      }
    } catch (err) {
      console.error("Failed to fetch logo:", err);
      setLogoUrl(""); // fallback if no logo
    }
  }, []);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];
  const MIN_BUDGET_BY_CURRENCY = {
    USD: 0.5,
    EUR: 0.5,
    GBP: 0.3,
    INR: 50,
    AUD: 0.5,
    CAD: 0.5,
    SGD: 0.5,
    JPY: 50,
  };


  const categories = [
    { value: 'Fashion', label: 'Fashion', icon: '👗', color: '#FF6B93' },
    { value: 'Beauty', label: 'Beauty', icon: '💄', color: '#FF9F43' },
    { value: 'Lifestyle', label: 'Lifestyle', icon: '🏡', color: '#36BDCB' },
    { value: 'Food', label: 'Food', icon: '🍔', color: '#FF9F43' },
    { value: 'Travel', label: 'Travel', icon: '✈️', color: '#6C5CE7' },
    { value: 'Fitness', label: 'Fitness', icon: '💪', color: '#00B894' },
    { value: 'Technology', label: 'Technology', icon: '📱', color: '#0984E3' },
    { value: 'Gaming', label: 'Gaming', icon: '🎮', color: '#E84393' },
    { value: 'Other', label: 'Other', icon: '🔮', color: '#636E72' }
  ];

  const steps = ['Campaign Details', 'Budget & Settings', 'Media & Review', 'Success'];

  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.currency);
    return currency ? currency.symbol : '$';
  };

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'budget') {
      const budgetValue = parseFloat(value);
      const currency = formData.currency;
      const minBudget = MIN_BUDGET_BY_CURRENCY[currency];

      if (value && minBudget && budgetValue < minBudget) {
        setBudgetError(
          `Minimum budget for ${currency} is ${getCurrencySymbol()}${minBudget}`
        );
      } else {
        setBudgetError('');
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const generateCampaignImages = async (prompt) => {
    if (!prompt.trim()) {
      setError('Please enter a campaign title first to generate images');
      return;
    }

    setImageGenLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.post(
        `${API_BASE_URL}/api/images/generate`,
        {
          prompt: `${prompt} marketing campaign, professional, high quality, social media content, vibrant colors, modern design`,
          num_images: 4
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.images?.length) {
        setGeneratedImages(response.data.images);
        setImageDialogOpen(true);
      } else {
        setError("No images generated. Please try again with a different prompt.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("You must be logged in to generate images.");
      } else {
        setError("Failed to generate images. Please try again.");
      }
    } finally {
      setImageGenLoading(false);
    }
  };


  const selectGeneratedImage = (url) => {
    // Convert data URL to blob for file upload
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "generated_campaign_image.jpg", { type: "image/jpeg" });
        setFormData({ ...formData, campaignImage: file });

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);

        setSelectedImage(url);
      })
      .catch(err => {
        console.error('Error converting image:', err);
        setError('Failed to process generated image');
      });
  };

  const downloadImage = async (url, index) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `campaign_image_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, etc.)');
        return;
      }

      setFormData({ ...formData, campaignImage: file });
      setSelectedImage(null);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Video must be less than 50MB');
        return;
      }

      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file (MP4, MOV, etc.)');
        return;
      }

      setFormData({ ...formData, campaignVideo: file });

      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeProductLink = async () => {
    if (!formData.productLink) {
      setError('Please enter a product link first');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const response = await campaignAPI.analyzeProductLink(formData.productLink);

      if (response.data) {
        setAiSuggestions(response.data);
        setShowAiSuggestions(true);

        if (response.data.title) {
          generateCampaignImages(response.data.title);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze product link');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        title: aiSuggestions.title,
        description: aiSuggestions.description,
        requirements: aiSuggestions.requirements,
        category: aiSuggestions.category,
        budget: aiSuggestions.budget.replace(/[^\d.-]/g, '')
      }));
      setShowAiSuggestions(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.title || !formData.description || !formData.requirements) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.budget || !formData.category || !formData.deadline) {
        setError('Please fill in all required fields');
        return;
      }

      if (parseFloat(formData.budget) <= 0) {
        setError('Budget must be greater than 0');
        return;
      }
      const minBudget = MIN_BUDGET_BY_CURRENCY[formData.currency];

      if (parseFloat(formData.budget) < minBudget) {
        setError(
          `Minimum campaign budget for ${formData.currency} is ${getCurrencySymbol()}${minBudget}`
        );
        return;
      }


      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate < now) {
        setError('Deadline must be a future date');
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.campaignImage && !imagePreview) {
        setError('Please upload or generate a campaign image');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Helper function to extract campaign ID from response
  const extractCampaignId = (responseData) => {
    if (!responseData) return null;

    console.log('API Response:', responseData);

    // Try different possible field names for campaign ID
    const possibleIdFields = [
      'campaign_id',
      'id',
      '_id',
      'campaignId',
      'campaignID'
    ];

    for (const field of possibleIdFields) {
      if (responseData[field]) {
        console.log(`Found campaign ID in field '${field}':`, responseData[field]);
        return responseData[field];
      }
    }

    // If no ID found, check nested structures
    if (responseData.data) {
      for (const field of possibleIdFields) {
        if (responseData.data[field]) {
          console.log(`Found campaign ID in data.${field}:`, responseData.data[field]);
          return responseData.data[field];
        }
      }
    }

    // If no ID found, check if there's any string that looks like an ID
    const stringified = JSON.stringify(responseData);
    const idMatch = stringified.match(/"([a-f0-9]{24})"/); // MongoDB-like ID pattern
    if (idMatch) {
      console.log('Found MongoDB-like ID pattern:', idMatch[1]);
      return idMatch[1];
    }

    console.log('No campaign ID found in response');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('requirements', formData.requirements);
      formDataToSend.append('budget', parseFloat(formData.budget));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('deadline', formData.deadline);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('brand_id', user.id);
      formDataToSend.append('status', 'active');

      if (formData.campaignImage) {
        formDataToSend.append('campaign_image', formData.campaignImage);
      }

      if (formData.campaignVideo) {
        formDataToSend.append('campaign_video', formData.campaignVideo);
      }

      const minBudget = MIN_BUDGET_BY_CURRENCY[formData.currency];

      if (parseFloat(formData.budget) < minBudget) {
        setError(
          `Minimum campaign budget for ${formData.currency} is ${getCurrencySymbol()}${minBudget}`
        );
        setLoading(false);
        return;
      }


      console.log('Sending campaign creation or update request...');
      let response;
      if (isEditMode && campaignId) {
        // Remove '#' if present
        const rawId = campaignId.toString().startsWith('#') ? campaignId.toString().substring(1) : campaignId;
        console.log('Editing campaign with ID:', rawId);
        response = await campaignAPI.updateCampaign(rawId, formDataToSend);
        console.log('Campaign update response:', response);

        // Prepare data for success screen (updates might not return full campaign)
        setCreatedCampaign({
          ...formData,
          _id: rawId,
          campaign_id: rawId,
          id: rawId
        });

        setSuccess(true);
      } else {
        response = await campaignAPI.createCampaign(formDataToSend);
        console.log('Campaign creation response:', response);

        // Extract and set campaign ID
        const extractedId = extractCampaignId(response);
        if (extractedId) {
          setCampaignId(`#${extractedId}`);
          setIsEditMode(true); // Now we are in edit mode for this campaign
          setCreatedCampaign({
            ...formData,
            _id: extractedId,
            campaign_id: extractedId,
            id: extractedId
          });
        } else {
          setCampaignId('#N/A');
          console.warn('Could not extract campaign ID from response');
          setCreatedCampaign({
            ...formData,
            ...response
          });
        }

        setSuccess(true);
      }

      setActiveStep(3);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Campaign creation error:', err);
      if (err.response?.status === 413) {
        setError('File too large. Please try a smaller file.');
      } else if (err.response?.status === 415) {
        setError('Unsupported file type. Please use images or videos.');
      } else {
        setError(err.response?.data?.detail || 'Failed to create campaign. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      budget: '',
      category: '',
      deadline: '',
      currency: 'USD',
      campaignImage: null,
      campaignVideo: null,
      productLink: ''
    });
    setImagePreview(null);
    setVideoPreview(null);
    setCreatedCampaign(null);
    setCampaignId('');
    setIsEditMode(false); // Reset edit mode when starting fresh
    setAiSuggestions(null);
    setShowAiSuggestions(false);
    setGeneratedImages([]);
    setSelectedImage(null);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {/* AI Analysis Section */}
            <Grow in={true} timeout={800}>
              <Card sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #3b82f6 100%)',
                color: 'white',
                borderRadius: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AutoAwesome sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      AI-Powered Campaign Creation
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Enter your product link and let AI generate campaign details and images instantly
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="Product Link"
                      name="productLink"
                      value={formData.productLink}
                      onChange={handleChange}
                      placeholder="https://example.com/product/123"
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.8)' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={analyzeProductLink}
                      disabled={aiLoading || !formData.productLink}
                      startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
                      sx={{
                        minWidth: { xs: '100%', sm: '140px' },
                        height: '56px',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { background: 'rgba(255,255,255,0.3)' },
                        borderRadius: 2
                      }}
                    >
                      {aiLoading ? 'Analyzing...' : 'AI Analyze'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>

            {/* AI Suggestions Accordion */}
            {aiSuggestions && (
              <Slide in={true} direction="down" timeout={500}>
                <Accordion
                  expanded={showAiSuggestions}
                  onChange={() => setShowAiSuggestions(!showAiSuggestions)}
                  sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        AI Suggestions Available
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Title Suggestion</Typography>
                        <Card variant="outlined" sx={{ p: 2, mb: 2, background: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="body2">{aiSuggestions.title}</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Category & Budget</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip label={aiSuggestions.category} color="primary" variant="outlined" />
                          <Box
                            sx={{
                              p: 1.2,
                              backgroundColor: '#8e24aa',
                              color: 'white',
                              borderRadius: '5px',
                              maxWidth: '100%',
                              cursor: 'pointer'
                            }}
                            onClick={() => setShowFullBudget(!showFullBudget)}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: showFullBudget ? 'normal' : 'nowrap',
                                overflow: showFullBudget ? 'visible' : 'hidden',
                                textOverflow: showFullBudget ? 'clip' : 'ellipsis'
                              }}
                            >
                              {aiSuggestions.budget}
                            </Typography>

                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.9 }}>
                              {showFullBudget ? 'Read less' : 'Read more'}
                            </Typography>
                          </Box>

                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Description</Typography>
                        <Card variant="outlined" sx={{ p: 2, mb: 2, background: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="body2">{aiSuggestions.description}</Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Requirements</Typography>
                        <Card variant="outlined" sx={{ p: 2, background: '#f8f9fa', borderRadius: 2 }}>
                          <Typography variant="body2">{aiSuggestions.requirements}</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAiSuggestions(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={applyAiSuggestions}
                      >
                        Apply All Suggestions
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Slide>
            )}

            {/* Campaign Details Form */}

            <Box container spacing={2}>
              <Grid item xs={12} md={6}>
                <Zoom in={true} timeout={600}>
                  <TextField
                    fullWidth
                    label="Campaign Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Summer Collection Promotion"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2, mb: 3 }}
                  />
                </Zoom>
              </Grid>

              <Grid item xs={12} md={6}>
                <Zoom in={true} timeout={600}>
                  <TextField
                    fullWidth
                    label="Campaign Description *"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={1}
                    placeholder="Describe your campaign goals, target audience, and key messaging..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <Description color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2, mb: 3 }}
                  />
                </Zoom>
              </Grid>

              <Grid item xs={12} md={6}>
                <Zoom in={true} timeout={600}>
                  <TextField
                    fullWidth
                    label="Requirements & Deliverables *"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    required
                    multiline
                    rows={2}
                    placeholder="What do influencers need to do? (e.g., Instagram post, Story, Reel, etc.)"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <Checklist color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2, mb: 3 }}
                  />
                </Zoom>
              </Grid>
            </Box>
          </Box>
        );


      case 1:
        return (
          <Grid container direction="column" spacing={3}>
            <Grid item xs={12}>
              <Zoom in={true} timeout={400}>
                <TextField
                  fullWidth
                  select
                  label="Currency *"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol}) - {currency.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Zoom>
            </Grid>

            <Grid item xs={12}>
              <Zoom in={true} timeout={500}>
                <TextField
                  fullWidth
                  label="Campaign Budget *"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  error={Boolean(budgetError)}
                  helperText={budgetError || `Minimum ${getCurrencySymbol()}${MIN_BUDGET_BY_CURRENCY[formData.currency]}`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ color: 'primary.main', fontWeight: 700, mr: 0.5 }}>
                          {getCurrencySymbol()}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0, step: "0.01" }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                />
              </Zoom>
            </Grid>

            <Grid item xs={12}>
              <Zoom in={true} timeout={600}>
                <TextField
                  fullWidth
                  select
                  label="Category *"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                >
                  <MenuItem value=""><em>Select a category</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 2 }}>{cat.icon}</Typography>
                        <Typography>{cat.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Zoom>
            </Grid>

            <Grid item xs={12}>
              <Zoom in={true} timeout={700}>
                <TextField
                  fullWidth
                  label="Application Deadline *"
                  name="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  inputProps={{ min: getMinDate() }}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                />
              </Zoom>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <Visibility sx={{ mr: 1, color: 'primary.main' }} />
              Campaign Media & Final Review
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Media Upload Section */}
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 700, mb: 3 }}>
                    Media Assets
                  </Typography>

                  {/* AI Image Generation */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                      <AutoAwesome fontSize="small" color="primary" />
                      AI Image Generation
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => generateCampaignImages(formData.title || 'marketing campaign')}
                      disabled={imageGenLoading || !formData.title}
                      startIcon={imageGenLoading ? <CircularProgress size={20} /> : <Shuffle />}
                      fullWidth
                      sx={{ mb: 2, py: 1.5, borderRadius: 2.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      {imageGenLoading ? 'Generating Images...' : 'Generate AI Images'}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Generate professional campaign images using AI based on your campaign title
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Manual Image Upload */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                      <Image fontSize="small" color="primary" />
                      Campaign Image *
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<AddPhotoAlternate />}
                      sx={{ mb: 2, py: 1.5, borderRadius: 2.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      {formData.campaignImage ? 'Change Image' : 'Upload Image'}
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>

                    {selectedImage && (
                      <Alert severity="success" variant="outlined" sx={{ mb: 2, borderRadius: 2.5 }}>
                        AI-generated image is selected
                      </Alert>
                    )}

                    {imagePreview && (
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <img
                          src={imagePreview}
                          alt="Campaign preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '380px',
                            borderRadius: 16,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Video Upload */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                      <Videocam fontSize="small" color="primary" />
                      Campaign Video (Optional)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<Videocam />}
                      sx={{ py: 1.5, borderRadius: 2.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                    >
                      {formData.campaignVideo ? 'Change Video' : 'Upload Video'}
                      <input type="file" hidden accept="video/*" onChange={handleVideoChange} />
                    </Button>
                    {videoPreview && (
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <video
                          controls
                          style={{
                            maxWidth: '100%',
                            maxHeight: '380px',
                            borderRadius: 16,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <source src={videoPreview} />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Campaign Summary */}
              <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      Campaign Summary
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => setActiveStep(0)}
                      sx={{ borderRadius: 2 }}
                    >
                      Edit Details
                    </Button>
                  </Box>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <List dense disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <TitleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Title"
                            secondary={formData.title || 'Not set'}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 700 }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, mt: 2 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <AttachMoney color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Budget"
                            secondary={formData.budget ? `${getCurrencySymbol()}${formData.budget}` : 'Not set'}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 700 }}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <List dense disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Schedule color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Deadline"
                            secondary={formData.deadline ? new Date(formData.deadline).toLocaleString() : 'Not set'}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 700 }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0, mt: 2 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Category color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Category"
                            secondary={formData.category || 'Not set'}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 700 }}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle2" gutterBottom color="primary" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Description Preview
                  </Typography>
                  <Typography variant="body2" sx={{
                    p: 3,
                    background: '#f8fafc',
                    borderRadius: 3,
                    minHeight: 120,
                    color: formData.description ? 'text.primary' : 'text.secondary',
                    border: '1px solid #e2e8f0',
                    lineHeight: 1.7,
                    fontSize: '0.95rem'
                  }}>
                    {formData.description || 'No description provided'}
                  </Typography>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CheckCircle fontSize="small" />}
                      label={formData.campaignImage ? "Image Ready" : "Missing Image"}
                      color={formData.campaignImage ? "success" : "error"}
                      variant="filled"
                      sx={{ borderRadius: 2, fontWeight: 700, px: 1 }}
                    />
                    <Chip
                      icon={<CheckCircle fontSize="small" />}
                      label={formData.campaignVideo ? "Video Ready" : "No Video (Optional)"}
                      color={formData.campaignVideo ? "success" : "default"}
                      variant="filled"
                      sx={{ borderRadius: 2, fontWeight: 700, px: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            {/* Success Page */}
            <Fade in={true} timeout={1000}>
              <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, textAlign: 'center' }} elevation={0}>
                <Box sx={{ mb: 4 }}>
                  <Avatar sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                  }}>
                    <Celebration sx={{ fontSize: 40 }} />
                  </Avatar>

                  <Typography variant="h4" component="h2" gutterBottom fontWeight={700} color="success.main">
                    {isEditMode ? 'Campaign Updated Successfully!' : 'Campaign Launched Successfully!'}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                    Your campaign is now live and visible to influencers. You can track applications and manage the campaign from your dashboard.
                  </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 4, borderRadius: 3 }}>
                      <CardContent>
                        <Grid container spacing={3} alignItems="center">
                          {formData.campaignImage && (
                            <Grid item xs={12} sm={4}>
                              <img
                                src={imagePreview}
                                alt="Campaign"
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: 12
                                }}
                              />
                            </Grid>
                          )}

                          <Grid item xs={12} sm={formData.campaignImage ? 8 : 12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                              <Typography variant="h6" component="div" fontWeight={600}>
                                {formData.title}
                              </Typography>
                              <Chip
                                label={formData.category}
                                color="primary"
                                variant="outlined"
                              />
                            </Box>

                            <Grid container spacing={3}>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  Budget
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {getCurrencySymbol()}{formData.budget}
                                </Typography>
                              </Grid>

                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  Deadline
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {new Date(formData.deadline).toLocaleDateString()}
                                </Typography>
                              </Grid>

                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  Campaign ID
                                </Typography>
                                <Typography variant="body1" fontFamily="monospace" fontWeight={600}>
                                  {campaignId || 'Loading...'}
                                </Typography>
                              </Grid>

                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  Status
                                </Typography>
                                <Chip
                                  label="Active"
                                  color="success"
                                  size="small"
                                />
                              </Grid>
                            </Grid>

                            {/* Additional Campaign Details */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                Campaign Overview
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                    Description
                                  </Typography>
                                  <Typography variant="body2">
                                    {formData.description || 'No description provided'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                    Requirements
                                  </Typography>
                                  <Typography variant="body2">
                                    {formData.requirements || 'No requirements specified'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                    Currency
                                  </Typography>
                                  <Typography variant="body2">
                                    {formData.currency}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                    Media Status
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                      label="Image"
                                      size="small"
                                      color={formData.campaignImage ? "success" : "error"}
                                      variant={formData.campaignImage ? "filled" : "outlined"}
                                    />
                                    <Chip
                                      label="Video"
                                      size="small"
                                      color={formData.campaignVideo ? "success" : "default"}
                                      variant={formData.campaignVideo ? "filled" : "outlined"}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditMode(true);
                      setActiveStep(0);
                    }}
                    size="large"
                    startIcon={<Edit />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                  >
                    Edit Campaign
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleCreateNew}
                    size="large"
                    startIcon={<RocketLaunch />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                  >
                    Create Another
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => window.location.href = '/brand/dashboard'}
                    size="large"
                    startIcon={<TrendingUp />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, background: 'linear-gradient(45deg, #2196F3, #21CBF3)', color: 'white', fontWeight: 600 }}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              </Paper>
            </Fade>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  // Enhanced AI Image Generation Dialog
  const ImageGenerationDialog = () => (
    <Dialog
      open={imageDialogOpen}
      onClose={() => setImageDialogOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
        pb: 2
      }}>
        <Typography variant="h6" component="div" fontWeight={600}>
          Select Campaign Image
        </Typography>
        <IconButton
          onClick={() => setImageDialogOpen(false)}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Choose one of the AI-generated images for your campaign. Click "Select" to use the image or "Download" to save it.
        </Typography>

        <Grid container spacing={2}>
          {generatedImages.map((url, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedImage === url ? '3px solid' : '1px solid',
                  borderColor: selectedImage === url ? 'primary.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <img
                    src={url}
                    alt={`Generated ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginBottom: 12
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      size="small"
                      variant={selectedImage === url ? "contained" : "outlined"}
                      onClick={() => {
                        selectGeneratedImage(url);
                        setImageDialogOpen(false);
                      }}
                      startIcon={<CheckCircle />}
                    >
                      {selectedImage === url ? 'Selected' : 'Select'}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(url, index);
                      }}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      <Download />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 2,
        px: 3
      }}>
        <Button
          onClick={() => setImageDialogOpen(false)}
          variant="outlined"
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => generateCampaignImages(formData.title || 'marketing campaign')}
          startIcon={<Shuffle />}
          disabled={imageGenLoading}
        >
          {imageGenLoading ? 'Generating...' : 'Generate More'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 2, md: 4 },
        minHeight: '100vh'
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            width: '100%',
            maxWidth: '1200px',
            mx: 'auto',
            position: 'relative'
          }}
          elevation={isMobile ? 0 : 1}
        >
          {/* Brand Logo */}
          {/* {logoUrl && (
            <Box sx={{ 
              position: 'absolute', 
              top: { xs: 16, sm: 24 }, 
              left: { xs: 16, sm: 24 },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <img 
                src={logoUrl} 
                alt="Brand Logo" 
                style={{
                  height: isMobile ? 32 : 40,
                  width: 'auto',
                  borderRadius: 4
                }}
              />
            </Box>
          )} */}

          {/* Header */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
              pt: logoUrl ? (isMobile ? 4 : 3) : 0
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              {logoUrl ? (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="Brand Logo"
                    style={{
                      height: isMobile ? 28 : 36,
                      width: 'auto',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </Box>
              ) : (
                <RocketLaunch
                  sx={{
                    fontSize: isMobile ? 32 : 40,
                    color: 'primary.main'
                  }}
                />
              )}
            </Box>




            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              gutterBottom
              fontWeight={800}
            >
              {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {isEditMode
                ? 'Update your campaign details to keep them accurate and engaging for influencers.'
                : 'Launch your influencer marketing campaign with precision. Follow the steps below to create an engaging campaign.'}
            </Typography>
          </Box>

          {/* Stepper - Hidden on Success Step */}
          {activeStep !== 3 && (
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                '& .MuiStepLabel-root': {
                  padding: { xs: '8px', sm: '16px' }
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant={isMobile ? "caption" : "body2"} fontWeight={600}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* Alerts */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Campaign created successfully!
            </Alert>
          )}

          {/* Form Content */}
          {activeStep !== 3 ? (
            <Box
              component="form"
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                // Prevent form submission on 'Enter' key unless we're on the final review step
                if (e.key === 'Enter' && activeStep < 2) {
                  e.preventDefault();
                  handleNext();
                }
              }}
            >
              {getStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 4,
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={activeStep === 0 ? () => {
                    setFormData({
                      title: '',
                      description: '',
                      requirements: '',
                      budget: '',
                      category: '',
                      deadline: '',
                      currency: 'USD',
                      campaignImage: null,
                      campaignVideo: null,
                      productLink: ''
                    });
                    setImagePreview(null);
                    setVideoPreview(null);
                    setAiSuggestions(null);
                    setShowAiSuggestions(false);
                    setGeneratedImages([]);
                    setSelectedImage(null);
                  } : handleBack}
                  disabled={loading}
                  startIcon={<ArrowBack />}
                  size="large"
                  sx={{
                    minWidth: { xs: '100%', sm: 140 },
                    order: { xs: 2, sm: 1 },
                    borderRadius: 2
                  }}
                >
                  {activeStep === 0 ? 'Reset Form' : 'Back'}
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || (!formData.campaignImage && !imagePreview)}
                    startIcon={loading ? <CircularProgress size={20} /> : <Celebration />}
                    size="large"
                    sx={{
                      minWidth: { xs: '100%', sm: 200 },
                      order: { xs: 1, sm: 2 },
                      borderRadius: 2
                    }}
                  >
                    {loading ? (isEditMode ? 'Updating...' : 'Launching...') : (isEditMode ? 'Update Campaign' : 'Launch Campaign')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    size="large"
                    sx={{
                      minWidth: { xs: '100%', sm: 140 },
                      order: { xs: 1, sm: 2 },
                      borderRadius: 2
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            // Success Step Content
            getStepContent(3)
          )}
        </Paper>
      </Fade>

      {/* Enhanced Image Generation Dialog */}
      <ImageGenerationDialog />
    </Container>
  );
};

BrandCreateCampaign.defaultProps = {
  onCampaignCreated: () => { }
};

export default BrandCreateCampaign;