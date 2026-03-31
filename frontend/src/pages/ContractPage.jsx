// src/pages/ContractPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Description,
  CalendarToday,
  AttachMoney,
  Person,
  Campaign,
  Send,
  Image as ImageIcon,
  VideoLibrary,
  Link as LinkIcon,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { campaignAPI } from '../services/api';

const ContractPage = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (agreementId) {
      fetchAgreementDetails();
    }
  }, [agreementId]);

  const fetchAgreementDetails = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getAgreement(agreementId);
      setAgreement(response.data);
    } catch (err) {
      setError('Failed to load agreement details');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAgreement = async (party) => {
    try {
      setLoading(true);
      const response = await campaignAPI.signAgreement(agreementId, { party });
      
      setAgreement(prev => ({
        ...prev,
        ...response.data
      }));
      
      setSuccess(`${party === 'brand' ? 'Brand' : 'Influencer'} signed the agreement!`);
    } catch (err) {
      setError('Failed to sign agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleContentReview = async (status) => {
    try {
      setSubmittingReview(true);
      
      const reviewData = {
        content_id: selectedContent.id,
        status: status,
        feedback: reviewFeedback,
        reviewed_at: new Date().toISOString()
      };

      await campaignAPI.reviewContent(reviewData);
      
      setSuccess(`Content ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setReviewDialogOpen(false);
      setReviewFeedback('');
      fetchAgreementDetails(); // Refresh data
      
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setContentDialogOpen(true);
  };

  const renderContractPaper = () => (
    <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          COLLABORATION AGREEMENT
        </Typography>
        <Typography variant="h6" color="primary">
          {agreement.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Agreement ID: {agreement.id}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Parties */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          BETWEEN
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  THE BRAND
                </Typography>
                <Typography variant="body2">{agreement.brand_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Brand Representative
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="600">
                  THE INFLUENCER
                </Typography>
                <Typography variant="body2">{agreement.influencer_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Social Media Influencer
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Agreement Details */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          ARTICLE 1: DELIVERABLES
        </Typography>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {agreement.deliverables}
        </Typography>

        {agreement.content_requirements && (
          <>
            <Typography variant="subtitle1" gutterBottom fontWeight="600">
              Content Requirements:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {agreement.content_requirements}
            </Typography>
          </>
        )}
      </Box>

      {/* Deadlines */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          ARTICLE 2: TIMELINE & DEADLINES
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(agreement.deadlines).map(([key, value]) => (
            value && (
              <Grid item xs={12} sm={6} key={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday color="primary" fontSize="small" />
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2">
                      {new Date(value).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )
          ))}
        </Grid>
      </Box>

      {/* Payment Terms */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          ARTICLE 3: PAYMENT TERMS
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AttachMoney color="primary" />
              <Typography variant="body1" fontWeight="500">
                Total Amount: {agreement.payment_terms.currency} {agreement.payment_terms.total_amount}
              </Typography>
            </Box>
            <Typography variant="body2">
              Payment Schedule: {agreement.payment_terms.payment_schedule.replace(/_/g, ' ')}
            </Typography>
            {agreement.payment_terms.advance_percentage > 0 && (
              <Typography variant="body2">
                Advance: {agreement.payment_terms.advance_percentage}%
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Usage Rights */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          ARTICLE 4: USAGE RIGHTS
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="500">Duration:</Typography>
            <Typography variant="body2">{agreement.usage_rights.duration.replace(/_/g, ' ')}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="500">Territories:</Typography>
            <Typography variant="body2">{agreement.usage_rights.territories}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" fontWeight="500">Platforms:</Typography>
            <Typography variant="body2">{agreement.usage_rights.platforms.replace(/_/g, ' ')}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Signatures */}
      <Box mt={6}>
        <Typography variant="h6" gutterBottom fontWeight="600">
          SIGNATURES
        </Typography>
        <Grid container spacing={4} mt={2}>
          <Grid item xs={12} md={6}>
            <Box border={1} borderColor="divider" borderRadius={1} p={2}>
              <Typography variant="subtitle1" gutterBottom>
                THE BRAND
              </Typography>
              {agreement.brand_signature ? (
                <Box textAlign="center">
                  <CheckCircle color="success" sx={{ fontSize: 48 }} />
                  <Typography variant="body2" color="success.main">
                    Signed digitally on {new Date(agreement.brand_signed_at).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => handleSignAgreement('brand')}
                  disabled={loading}
                >
                  Sign as Brand
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box border={1} borderColor="divider" borderRadius={1} p={2}>
              <Typography variant="subtitle1" gutterBottom>
                THE INFLUENCER
              </Typography>
              {agreement.influencer_signature ? (
                <Box textAlign="center">
                  <CheckCircle color="success" sx={{ fontSize: 48 }} />
                  <Typography variant="body2" color="success.main">
                    Signed digitally on {new Date(agreement.influencer_signed_at).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Waiting for influencer signature
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Status */}
      <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="subtitle1" gutterBottom>
          AGREEMENT STATUS: <Chip 
            label={agreement.status} 
            color={
              agreement.status === 'active' ? 'success' :
              agreement.status === 'signed' ? 'primary' :
              agreement.status === 'pending' ? 'warning' : 'default'
            } 
          />
        </Typography>
      </Box>
    </Paper>
  );

  const renderContentSubmission = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Content Submissions
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(`/influencer/submit-content/${agreementId}`)}
        >
          Submit New Content
        </Button>
      </Box>

      {agreement.content_submissions?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Description sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Content Submitted Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The influencer hasn't submitted any content for review yet.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {agreement.content_submissions?.map((content, index) => (
            <Grid item xs={12} md={6} key={content.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6">
                      Submission #{index + 1}
                    </Typography>
                    <Chip 
                      label={content.status} 
                      color={
                        content.status === 'approved' ? 'success' :
                        content.status === 'rejected' ? 'error' :
                        'warning'
                      }
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Submitted: {new Date(content.submitted_at).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2" paragraph>
                    {content.description}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    {content.media_urls?.map((url, idx) => (
                      <Chip
                        key={idx}
                        icon={<ImageIcon />}
                        label={`Media ${idx + 1}`}
                        onClick={() => handleViewContent(content)}
                        clickable
                        size="small"
                      />
                    ))}
                    {content.links?.map((link, idx) => (
                      <Chip
                        key={idx}
                        icon={<LinkIcon />}
                        label={link.platform}
                        component="a"
                        href={link.url}
                        target="_blank"
                        clickable
                        size="small"
                      />
                    ))}
                  </Box>

                  {content.feedback && (
                    <Alert 
                      severity={content.status === 'approved' ? 'success' : 'error'} 
                      sx={{ mt: 2 }}
                    >
                      {content.feedback}
                    </Alert>
                  )}

                  {content.status === 'pending' && (
                    <Box display="flex" gap={1} mt={2}>
                      <Button
                        size="small"
                        startIcon={<ThumbUp />}
                        color="success"
                        onClick={() => {
                          setSelectedContent(content);
                          setReviewDialogOpen(true);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ThumbDown />}
                        color="error"
                        onClick={() => {
                          setSelectedContent(content);
                          setReviewDialogOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderMessages = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Communication History
      </Typography>
      
      {agreement.messages?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Send sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No Messages Yet
          </Typography>
        </Paper>
      ) : (
        <List>
          {agreement.messages?.map((message, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle2">
                      {message.sender_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.sent_at).toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {message.content}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box mt={3}>
        <Button
          variant="outlined"
          startIcon={<Send />}
          onClick={() => navigate(`/brand/collaborations?user=${agreement.influencer_id}&campaign=${agreement.campaign_id}`)}
        >
          Send Message
        </Button>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!agreement) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Agreement not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Collaboration Agreement
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {agreement.campaign_title}
            </Typography>
          </Box>
        </Box>
        
        <Chip 
          label={agreement.status} 
          color={
            agreement.status === 'active' ? 'success' :
            agreement.status === 'signed' ? 'primary' :
            agreement.status === 'pending' ? 'warning' : 'default'
          }
          size="large"
        />
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Contract" icon={<Description />} />
          <Tab label="Content Submissions" icon={<ImageIcon />} />
          <Tab label="Messages" icon={<Send />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && renderContractPaper()}
      {activeTab === 1 && renderContentSubmission()}
      {activeTab === 2 && renderMessages()}

      {/* Content View Dialog */}
      <Dialog
        open={contentDialogOpen}
        onClose={() => setContentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Content Submission
        </DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedContent.description}
              </Typography>
              
              <Grid container spacing={2} mt={1}>
                {selectedContent.media_urls?.map((url, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper elevation={1} sx={{ p: 1 }}>
                      <img 
                        src={url} 
                        alt={`Content ${index + 1}`}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {selectedContent.links?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Published Links:
                  </Typography>
                  {selectedContent.links.map((link, index) => (
                    <Box key={index} mb={1}>
                      <Button
                        component="a"
                        href={link.url}
                        target="_blank"
                        startIcon={<LinkIcon />}
                        variant="outlined"
                        size="small"
                      >
                        {link.platform} - {link.type}
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContentDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Review Content Submission
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Feedback"
            value={reviewFeedback}
            onChange={(e) => setReviewFeedback(e.target.value)}
            placeholder="Provide constructive feedback for the influencer..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setReviewDialogOpen(false)}
            disabled={submittingReview}
          >
            Cancel
          </Button>
          <Button 
            color="error"
            onClick={() => handleContentReview('rejected')}
            disabled={submittingReview || !reviewFeedback.trim()}
            startIcon={<ThumbDown />}
          >
            {submittingReview ? 'Rejecting...' : 'Reject'}
          </Button>
          <Button 
            color="success"
            onClick={() => handleContentReview('approved')}
            disabled={submittingReview}
            startIcon={<ThumbUp />}
          >
            {submittingReview ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractPage;