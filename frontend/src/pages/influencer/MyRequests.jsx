// src/pages/MyRequests.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Refresh,
  Email,
  CalendarToday,
  AttachMoney
} from '@mui/icons-material';
import { campaignAPI } from '../../services/api';

// ---------- helpers (defensive parsing) ----------
const normalizeId = (v) =>
  typeof v === 'string'
    ? v
    : v && typeof v === 'object'
      ? (v._id || v.id || JSON.stringify(v))
      : '';

const normalizeStr = (v, fallback = '') =>
  v == null
    ? fallback
    : typeof v === 'string'
      ? v
      : typeof v === 'number'
        ? String(v)
        : '';

const normalizeNum = (v, fallback = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeDate = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.valueOf()) ? d : null;
};

const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    normalizeNum(n)
  );

const formatDate = (v) => {
  const d = normalizeDate(v);
  return d ? d.toLocaleDateString() : 'N/A';
};

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'error';
    case 'completed':
      return 'primary';
    case 'pending':
    default:
      return 'default';
  }
};

const statusText = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Not Selected';
    default:
      return status || 'Unknown';
  }
};

// Map a raw application item from backend to a flat, renderable shape
const toRenderableApp = (app) => {
  const campaignObj =
    (typeof app.campaign_id === 'object' && app.campaign_id) || {};
  const brandObj = (typeof app.brand_id === 'object' && app.brand_id) || {};
  const influencerObj =
    (typeof app.influencer_id === 'object' && app.influencer_id) || {};

  const id =
    app._id ||
    app.id ||
    campaignObj._id ||
    influencerObj._id ||
    Math.random().toString(36).slice(2);

  return {
    id: normalizeId(id),
    // campaign
    campaign_id: normalizeId(app.campaign_id),
    campaign_title:
      normalizeStr(campaignObj.title) ||
      normalizeStr(app.campaign_title, 'Unknown Campaign'),
    campaign_status:
      normalizeStr(campaignObj.status) ||
      normalizeStr(app.campaign_status, ''),
    campaign_budget:
      normalizeNum(campaignObj.budget) ||
      normalizeNum(app.campaign_budget, 0),
    campaign_deadline:
      campaignObj.deadline || app.campaign_deadline || app.deadline || null,
    // brand
    brand_name:
      normalizeStr(brandObj.name) || normalizeStr(app.brand_name, 'Unknown Brand'),
    // influencer
    influencer_id: normalizeId(app.influencer_id),
    influencer_name:
      normalizeStr(influencerObj.name) ||
      normalizeStr(app.influencer_name, 'Unknown Influencer'),
    influencer_email:
      normalizeStr(influencerObj.email) ||
      normalizeStr(app.influencer_email, 'No email'),
    // meta
    status: normalizeStr(app.status, 'pending'),
    message: normalizeStr(app.message, ''),
    applied_at: app.applied_at || app.createdAt || new Date().toISOString()
  };
};

// ---------- component ----------
const MyRequests = ({ userRole }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let response;

      if (userRole === 'influencer') {
        response = await campaignAPI.getInfluencerApplications();
      } else if (userRole === 'brand') {
        response = await campaignAPI.getBrandApplications();
      } else {
        setApplications([]);
        setLoading(false);
        return;
      }

      const data = response?.data;
      const arr = Array.isArray(data) ? data : [];
      const mapped = arr.map(toRenderableApp);
      setApplications(mapped);
    } catch (err) {
      console.error('Error fetching applications:', err);
      const status = err?.response?.status;
      if (status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (status === 403) {
        setError('You do not have permission to view these applications.');
      } else {
        setError('Failed to fetch applications. Please try again.');
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (userRole === 'influencer') {
      filtered = applications.filter(
        (app) =>
          app.status.toLowerCase() !== 'rejected' ||
          app.campaign_status.toLowerCase() === 'active'
      );
    }

    if (userRole === 'brand') {
      const statusFilters = ['pending', 'approved', 'rejected'];
      const statusFilter = statusFilters[selectedTab];
      filtered = applications.filter((app) => {
        const s = (app.status || '').toLowerCase();
        if (statusFilter === 'pending') return s === 'pending';
        if (statusFilter === 'approved') return s === 'approved' || s === 'accepted';
        if (statusFilter === 'rejected') return s === 'rejected';
        return true;
      });
    }

    return filtered;
  }, [applications, selectedTab, userRole]);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
  };

  const handleStatusUpdate = (application, status) => {
    setSelectedApplication(application);
    setStatusUpdate(status);
    setActionDialogOpen(true);
  };

  const updateApplicationStatus = async () => {
    try {
      if (!selectedApplication) return;
      await campaignAPI.updateApplicationStatus(
        selectedApplication.campaign_id,
        selectedApplication.influencer_id,
        { status: statusUpdate }
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, status: statusUpdate } : app
        )
      );

      setSuccess(`Application ${statusUpdate} successfully.`);
      setActionDialogOpen(false);
    } catch (err) {
      console.error('Failed to update application status', err);
      const status = err?.response?.status;
      if (status === 403) {
        setError('You do not have permission to update this application.');
      } else {
        setError('Failed to update application status.');
      }
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography>Loading applications...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {userRole === 'influencer' ? 'My Applications' : 'Campaign Applications'}
      </Typography>

      {userRole === 'brand' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
            <Tab label="Pending" />
            <Tab label="Approved" />
            <Tab label="Rejected" />
          </Tabs>
        </Box>
      )}

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchData} sx={{ ml: 2 }} size="small" variant="outlined">
            Retry
          </Button>
        </Alert>
      )}

      {filteredApplications.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {userRole === 'influencer'
              ? "You haven't applied to any campaigns yet."
              : 'No applications found for the selected filter.'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {userRole === 'brand' && <TableCell>Influencer</TableCell>}
                {userRole === 'influencer' && <TableCell>Brand/Campaign</TableCell>}
                <TableCell>Applied On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  {userRole === 'brand' && (
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {normalizeStr(application.influencer_name, 'I').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {normalizeStr(application.influencer_name, 'Unknown Influencer')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {normalizeStr(application.influencer_email, 'No email')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  )}

                  {userRole === 'influencer' && (
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {normalizeStr(application.campaign_title, 'Unknown Campaign')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {normalizeStr(application.brand_name, 'Unknown Brand')}
                        </Typography>
                        {normalizeStr(application.campaign_status) && (
                          <Typography variant="caption" color="text.secondary">
                            Campaign: {normalizeStr(application.campaign_status)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  )}

                  <TableCell>{formatDate(application.applied_at)}</TableCell>

                  <TableCell>
                    <Chip
                      label={
                        userRole === 'influencer'
                          ? statusText(application.status)
                          : normalizeStr(application.status, 'pending')
                      }
                      color={statusColor(application.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(application)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    {userRole === 'brand' &&
                      (application.status || '').toLowerCase() === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStatusUpdate(application, 'approved')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStatusUpdate(application, 'rejected')}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Application Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent dividers>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {userRole === 'influencer' ? 'Campaign Information' : 'Influencer Information'}
                </Typography>

                {userRole === 'influencer' ? (
                  <Box>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2 }}>
                        {normalizeStr(selectedApplication.brand_name, 'B').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {normalizeStr(selectedApplication.brand_name, 'Unknown Brand')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {normalizeStr(selectedApplication.campaign_title, 'Unknown Campaign')}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2">
                        <AttachMoney sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        Budget: {currency(selectedApplication.campaign_budget)}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2">
                        <CalendarToday sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        Deadline: {formatDate(selectedApplication.campaign_deadline)}
                      </Typography>
                    </Box>

                    {normalizeStr(selectedApplication.campaign_status) && (
                      <Box mb={2}>
                        <Typography variant="body2">
                          Campaign Status: {normalizeStr(selectedApplication.campaign_status)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, width: 48, height: 48 }}>
                      {normalizeStr(selectedApplication.influencer_name, 'I').charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {normalizeStr(selectedApplication.influencer_name, 'Unknown Influencer')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        {normalizeStr(selectedApplication.influencer_email, 'No email')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Application Details
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2">
                    <CalendarToday sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    Applied on: {formatDate(selectedApplication.applied_at)}
                  </Typography>
                </Box>

                <Box mb={2} display="flex" alignItems="center">
                  <Typography variant="body2">Status:</Typography>
                  <Chip
                    sx={{ ml: 1 }}
                    label={
                      userRole === 'influencer'
                        ? statusText(selectedApplication.status)
                        : normalizeStr(selectedApplication.status, 'pending')
                    }
                    color={statusColor(selectedApplication.status)}
                    size="small"
                  />
                </Box>

                {normalizeStr(selectedApplication.message) && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      {userRole === 'influencer' ? 'Your Message' : 'Influencer Message'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1, whiteSpace: 'pre-wrap' }}
                    >
                      {normalizeStr(selectedApplication.message)}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog (Brand only) */}
      {userRole === 'brand' && (
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
          <DialogTitle>
            {statusUpdate === 'approved' ? 'Approve Application' : 'Reject Application'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {statusUpdate} this application from{' '}
              {normalizeStr(selectedApplication?.influencer_name, 'this influencer')}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={updateApplicationStatus}
              variant="contained"
              color={statusUpdate === 'approved' ? 'success' : 'error'}
            >
              Confirm {statusUpdate === 'approved' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar} variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar} variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyRequests;
