// src/components/agreement/AgreementForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton
} from '@mui/material';
import {
  Close,
  Description,
  CalendarToday,
  AttachMoney,
  Checklist,
  Send,
  Campaign,
  Person
} from '@mui/icons-material';
import { campaignAPI } from '../services/api';

const AgreementForm = ({ open, onClose, application, onAgreementCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  // Agreement form state
  const [agreement, setAgreement] = useState({
    campaign_id: '',
    influencer_id: '',
    title: '',
    deliverables: '',
    content_requirements: '',
    deadlines: {
      content_submission: '',
      content_approval: '',
      publishing: '',
      final_payment: ''
    },
    payment_terms: {
      total_amount: 0,
      currency: 'USD',
      payment_schedule: 'upon_completion',
      advance_percentage: 0
    },
    usage_rights: {
      duration: 'perpetual',
      territories: 'worldwide',
      platforms: 'all_platforms'
    },
    cancellation_terms: '',
    additional_terms: '',
    brand_signature: '',
    influencer_signature: ''
  });

  const steps = ['Agreement Details', 'Payment Terms', 'Review & Send'];

  useEffect(() => {
    if (application && open) {
      fetchCampaignDetails();
      initializeAgreement();
    }
  }, [application, open]);

  const fetchCampaignDetails = async () => {
    try {
      const response = await campaignAPI.getCampaign(application.campaign_id);
      setCampaignDetails(response.data);
    } catch (err) {
      setError('Failed to load campaign details');
    }
  };

  const initializeAgreement = () => {
    if (!application) return;

    const baseAgreement = {
      campaign_id: application.campaign_id,
      influencer_id: application.influencer_id,
      title: `${application.campaign_title} - Collaboration Agreement`,
      deliverables: application.requirements || '',
      content_requirements: '',
      deadlines: {
        content_submission: '',
        content_approval: '',
        publishing: '',
        final_payment: ''
      },
      payment_terms: {
        total_amount: application.budget || 0,
        currency: application.currency || 'USD',
        payment_schedule: 'upon_completion',
        advance_percentage: 0
      },
      usage_rights: {
        duration: 'perpetual',
        territories: 'worldwide',
        platforms: 'all_platforms'
      },
      cancellation_terms: 'Either party may terminate this agreement with 14 days written notice.',
      additional_terms: '',
      brand_signature: '',
      influencer_signature: ''
    };

    setAgreement(baseAgreement);
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setAgreement(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setAgreement(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return agreement.deliverables && agreement.deadlines.content_submission;
      case 1:
        return agreement.payment_terms.total_amount > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmitAgreement = async () => {
    try {
      setLoading(true);
      setError('');

      const agreementData = {
        ...agreement,
        status: 'pending',
        created_at: new Date().toISOString(),
        brand_id: application.brand_id
      };

      const response = await campaignAPI.createAgreement(agreementData);
      
      setSuccess('Agreement sent successfully!');
      setTimeout(() => {
        onAgreementCreated(response.data);
        onClose();
      }, 2000);

    } catch (err) {
      setError('Failed to send agreement: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Agreement Details
            </Typography>
            
            <TextField
              fullWidth
              label="Agreement Title"
              value={agreement.title}
              onChange={(e) => handleInputChange(null, 'title', e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Deliverables & Requirements"
              value={agreement.deliverables}
              onChange={(e) => handleInputChange(null, 'deliverables', e.target.value)}
              margin="normal"
              required
              placeholder="Specify exactly what content needs to be created, number of posts, platforms, hashtags, mentions, etc."
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Content Requirements"
              value={agreement.content_requirements}
              onChange={(e) => handleInputChange(null, 'content_requirements', e.target.value)}
              margin="normal"
              placeholder="Specific guidelines for content creation (brand voice, do's and don'ts, etc.)"
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Deadlines
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Content Submission Deadline"
                  value={agreement.deadlines.content_submission}
                  onChange={(e) => handleInputChange('deadlines', 'content_submission', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Content Approval Deadline"
                  value={agreement.deadlines.content_approval}
                  onChange={(e) => handleInputChange('deadlines', 'content_approval', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Publishing Deadline"
                  value={agreement.deadlines.publishing}
                  onChange={(e) => handleInputChange('deadlines', 'publishing', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Final Payment Deadline"
                  value={agreement.deadlines.final_payment}
                  onChange={(e) => handleInputChange('deadlines', 'final_payment', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Payment Terms
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Amount"
                  value={agreement.payment_terms.total_amount}
                  onChange={(e) => handleInputChange('payment_terms', 'total_amount', parseFloat(e.target.value))}
                  InputProps={{ startAdornment: '$' }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={agreement.payment_terms.currency}
                    onChange={(e) => handleInputChange('payment_terms', 'currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Payment Schedule</InputLabel>
              <Select
                value={agreement.payment_terms.payment_schedule}
                onChange={(e) => handleInputChange('payment_terms', 'payment_schedule', e.target.value)}
                label="Payment Schedule"
              >
                <MenuItem value="upon_completion">100% upon completion</MenuItem>
                <MenuItem value="50_50">50% advance, 50% upon completion</MenuItem>
                <MenuItem value="milestone_based">Milestone-based payments</MenuItem>
                <MenuItem value="net_30">Net 30 days after completion</MenuItem>
              </Select>
            </FormControl>

            {agreement.payment_terms.payment_schedule.includes('50') && (
              <TextField
                fullWidth
                type="number"
                label="Advance Percentage"
                value={agreement.payment_terms.advance_percentage}
                onChange={(e) => handleInputChange('payment_terms', 'advance_percentage', parseFloat(e.target.value))}
                sx={{ mt: 2 }}
                InputProps={{ endAdornment: '%' }}
              />
            )}

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
              Usage Rights
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={agreement.usage_rights.duration}
                    onChange={(e) => handleInputChange('usage_rights', 'duration', e.target.value)}
                    label="Duration"
                  >
                    <MenuItem value="perpetual">Perpetual</MenuItem>
                    <MenuItem value="1_year">1 Year</MenuItem>
                    <MenuItem value="2_years">2 Years</MenuItem>
                    <MenuItem value="limited">Limited Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Territories</InputLabel>
                  <Select
                    value={agreement.usage_rights.territories}
                    onChange={(e) => handleInputChange('usage_rights', 'territories', e.target.value)}
                    label="Territories"
                  >
                    <MenuItem value="worldwide">Worldwide</MenuItem>
                    <MenuItem value="regional">Regional</MenuItem>
                    <MenuItem value="country_specific">Country Specific</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Platforms</InputLabel>
                  <Select
                    value={agreement.usage_rights.platforms}
                    onChange={(e) => handleInputChange('usage_rights', 'platforms', e.target.value)}
                    label="Platforms"
                  >
                    <MenuItem value="all_platforms">All Platforms</MenuItem>
                    <MenuItem value="specific_platforms">Specific Platforms</MenuItem>
                    <MenuItem value="paid_only">Paid Channels Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Review Agreement
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom align="center">
                {agreement.title}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  BETWEEN
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {application?.brand_name || 'Brand'} (Brand)
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  AND
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {application?.influencer_name || 'Influencer'} (Influencer)
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  Deliverables
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {agreement.deliverables}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  Payment Terms
                </Typography>
                <Typography variant="body2">
                  Total Amount: {agreement.payment_terms.currency} {agreement.payment_terms.total_amount}
                </Typography>
                <Typography variant="body2">
                  Payment Schedule: {agreement.payment_terms.payment_schedule.replace(/_/g, ' ')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  Key Deadlines
                </Typography>
                {Object.entries(agreement.deadlines).map(([key, value]) => (
                  value && (
                    <Typography key={key} variant="body2">
                      {key.replace(/_/g, ' ')}: {new Date(value).toLocaleDateString()}
                    </Typography>
                  )
                ))}
              </Box>

              {agreement.additional_terms && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="600">
                    Additional Terms
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {agreement.additional_terms}
                  </Typography>
                </Box>
              )}
            </Paper>

            <FormControlLabel
              control={<Checkbox required />}
              label="I confirm that this agreement represents the complete understanding between both parties"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (!application) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px' } }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center">
          <Description sx={{ mr: 1 }} />
          <Typography variant="h6">Create Collaboration Agreement</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Application Summary */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom fontWeight="600">
              Campaign: {application.campaign_title}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Person />
                <Typography variant="body2">
                  Influencer: {application.influencer_name}
                </Typography>
              </Box>
              <Chip 
                label={application.status} 
                color="primary" 
                size="small" 
              />
            </Box>
          </CardContent>
        </Card>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={activeStep === 0 ? onClose : handleBack}
          disabled={loading}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmitAgreement : handleNext}
          disabled={loading}
          startIcon={activeStep === steps.length - 1 ? <Send /> : null}
        >
          {activeStep === steps.length - 1 
            ? (loading ? 'Sending...' : 'Send Agreement')
            : 'Next'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgreementForm;