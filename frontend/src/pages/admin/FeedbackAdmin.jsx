import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Tooltip,
  Avatar,
  alpha,
  useTheme,
  Stack,
  Paper,
  Divider,
  Badge,
} from "@mui/material";
import {
  Email,
  BugReport,
  Lightbulb,
  Help,
  Chat,
  Refresh,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  AccessTime,
  CheckCircle,
  HourglassEmpty,
  FiberNew,
  Visibility,
  CheckCircleOutline,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const statusColors = {
  new: "error",
  reviewed: "info",
  in_progress: "warning",
  resolved: "success",
};

const typeColors = {
  general: "default",
  bug: "error",
  feature: "success",
  help: "info",
};

const typeIcons = {
  general: <Chat />,
  bug: <BugReport />,
  feature: <Lightbulb />,
  help: <Help />,
};

// Modern Stats Card Component
const ModernStatsCard = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="overline"
              fontWeight="600"
              letterSpacing={1}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              color={`${color}.main`}
              fontWeight="700"
              sx={{ mb: 1 }}
            >
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center">
                {trend > 0 ? (
                  <TrendingUp sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, mr: 0.5, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 64,
              height: 64,
              boxShadow: `0 8px 16px ${alpha(theme.palette[color].main, 0.3)}`
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Modern Feedback Card Component
const ModernFeedbackCard = ({ item, onView, onUpdateStatus }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Left Section - Content */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {/* Type & Email Chips */}
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Chip
                  icon={typeIcons[item.type]}
                  label={item.type.toUpperCase()}
                  color={typeColors[item.type]}
                  size="small"
                  sx={{ fontWeight: '600', borderRadius: 2 }}
                />
                {item.email && (
                  <Chip
                    icon={<Email sx={{ fontSize: 16 }} />}
                    label={item.email}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                )}
                <Chip
                  label={item.status.replace('_', ' ').toUpperCase()}
                  color={statusColors[item.status]}
                  size="small"
                  sx={{ fontWeight: '600', borderRadius: 2 }}
                />
              </Box>

              {/* Message */}
              <Typography
                variant="body1"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6,
                  color: 'text.primary',
                  fontWeight: 500
                }}
              >
                {item.message}
              </Typography>

              {/* Meta Info */}
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="textSecondary">
                    {new Date(item.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                {item.page_url && (
                  <Chip
                    label={item.page_url}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '11px',
                      height: 22,
                      borderRadius: 1,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Grid>

          
        </Grid>
        {/* Right Section - Actions */}
<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  }}
>
  {/* View Details Button */}
  <button
    onClick={() => onView(item)}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: "10px 18px",
      background: "white",
      border: "2px solid #1976d2",
      color: "#1976d2",
      borderRadius: "10px",
      fontWeight: 600,
      cursor: "pointer",
      textTransform: "none",
      whiteSpace: "nowrap",
    }}
  >
    <Visibility style={{ fontSize: 18 }} />
    View Details
  </button>

  {/* Mark Resolved Button */}
  {item.status !== "resolved" && (
    <button
      onClick={() => onUpdateStatus(item._id, "resolved")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 18px",
        background: "#2e7d32",
        border: "2px solid #2e7d32",
        color: "white",
        borderRadius: "10px",
        fontWeight: 600,
        cursor: "pointer",
        textTransform: "none",
        whiteSpace: "nowrap",
      }}
    >
      <CheckCircleOutline style={{ fontSize: 18 }} />
      Mark Resolved
    </button>
  )}
</div>

      </CardContent>
    </Card>
  );
};

const AdminFeedbackPage = () => {
  const theme = useTheme();
  const [feedbackList, setFeedbackList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Fetch feedback from backend
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback`);
      const data = await res.json();
      setFeedbackList(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load feedback");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Apply filter & search
  useEffect(() => {
    let list = [...feedbackList];

    if (filterStatus !== "all") {
      list = list.filter((item) => item.status === filterStatus);
    }

    if (filterType !== "all") {
      list = list.filter((item) => item.type === filterType);
    }

    if (searchText.trim()) {
      list = list.filter(
        (item) =>
          item.message.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.email && item.email.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFiltered(list);
  }, [filterStatus, filterType, searchText, feedbackList]);

  // Update feedback status
  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/feedback/${id}/status?status=${status}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update status");

      setFeedbackList(prev =>
        prev.map(item =>
          item._id === id
            ? { ...item, status, updated_at: new Date().toISOString() }
            : item
        )
      );

      if (viewItem && viewItem._id === id) {
        setViewItem(prev => ({ ...prev, status, updated_at: new Date().toISOString() }));
      }

    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusCounts = () => {
    return {
      all: feedbackList.length,
      new: feedbackList.filter(item => item.status === 'new').length,
      reviewed: feedbackList.filter(item => item.status === 'reviewed').length,
      in_progress: feedbackList.filter(item => item.status === 'in_progress').length,
      resolved: feedbackList.filter(item => item.status === 'resolved').length,
    };
  };

  const getTypeCounts = () => {
    return {
      all: feedbackList.length,
      general: feedbackList.filter(item => item.type === 'general').length,
      bug: feedbackList.filter(item => item.type === 'bug').length,
      feature: feedbackList.filter(item => item.type === 'feature').length,
      help: feedbackList.filter(item => item.type === 'help').length,
    };
  };

  const statusCounts = getStatusCounts();
  const typeCounts = getTypeCounts();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="700" gutterBottom sx={{ color: 'primary.main' }}>
          Feedback Management
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight="400">
          Manage and track all user-submitted feedback and feature requests
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatsCard
            title="Total Feedback"
            value={statusCounts.all}
            icon={<Chat sx={{ fontSize: 32 }} />}
            color="primary"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatsCard
            title="New"
            value={statusCounts.new}
            icon={<FiberNew sx={{ fontSize: 32 }} />}
            color="error"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatsCard
            title="In Progress"
            value={statusCounts.in_progress}
            icon={<HourglassEmpty sx={{ fontSize: 32 }} />}
            color="warning"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernStatsCard
            title="Resolved"
            value={statusCounts.resolved}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color="success"
            trend={15}
          />
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: 'white'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search feedback or email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All ({statusCounts.all})</MenuItem>
                <MenuItem value="new">
                  <Box display="flex" alignItems="center" gap={1}>
                    <FiberNew fontSize="small" color="error" />
                    New ({statusCounts.new})
                  </Box>
                </MenuItem>
                <MenuItem value="reviewed">Reviewed ({statusCounts.reviewed})</MenuItem>
                <MenuItem value="in_progress">In Progress ({statusCounts.in_progress})</MenuItem>
                <MenuItem value="resolved">
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle fontSize="small" color="success" />
                    Resolved ({statusCounts.resolved})
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All ({typeCounts.all})</MenuItem>
                <MenuItem value="general">General ({typeCounts.general})</MenuItem>
                <MenuItem value="bug">Bug ({typeCounts.bug})</MenuItem>
                <MenuItem value="feature">Feature ({typeCounts.feature})</MenuItem>
                <MenuItem value="help">Help ({typeCounts.help})</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
                setSearchText('');
              }}
              startIcon={<FilterList />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600', height: 56 }}
            >
              Clear
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchFeedback}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600', height: 56 }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Feedback List */}
      {loading ? (
        <Box textAlign="center" mt={6}>
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2} color="textSecondary">
            Loading feedback...
          </Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Chat sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight="600" gutterBottom>
            No feedback found
          </Typography>
          <Typography variant="body1" color="textSecondary">
            No feedback matches your current filters. Try adjusting your search criteria.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filtered.map((item) => (
            <ModernFeedbackCard
              key={item._id}
              item={item}
              onView={setViewItem}
              onUpdateStatus={updateStatus}
            />
          ))}
        </Stack>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            p: 3
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="700">
                Feedback Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {viewItem && formatDate(viewItem.created_at)}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setViewItem(null)}
              sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {viewItem && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  {/* Type */}
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="600">
                      TYPE
                    </Typography>
                    <Chip
                      icon={typeIcons[viewItem.type]}
                      label={viewItem.type.toUpperCase()}
                      color={typeColors[viewItem.type]}
                      sx={{ fontWeight: '600', borderRadius: 2 }}
                    />
                  </Box>

                  {/* Status */}
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="600">
                      STATUS
                    </Typography>
                    <Chip
                      label={viewItem.status.replace('_', ' ').toUpperCase()}
                      color={statusColors[viewItem.status]}
                      sx={{ fontWeight: '600', borderRadius: 2 }}
                    />
                  </Box>

                  {/* Email */}
                  {viewItem.email && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="600">
                        CONTACT EMAIL
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email color="primary" />
                        <Typography variant="body1" fontWeight="500">
                          {viewItem.email}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Page URL */}
                  {viewItem.page_url && (
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="600">
                        PAGE URL
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            color: 'primary.main'
                          }}
                        >
                          {viewItem.page_url}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom fontWeight="600">
                  MESSAGE
                </Typography>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette[typeColors[viewItem.type]]?.main || theme.palette.primary.main}`,
                    minHeight: 200
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {viewItem.message}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, gap: 1, flexWrap: 'wrap' }}>
          {viewItem && (
            <>
              <Button
                variant={viewItem.status === 'new' ? 'contained' : 'outlined'}
                onClick={() => updateStatus(viewItem._id, 'new')}
                color="error"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
              >
                New
              </Button>
              <Button
                variant={viewItem.status === 'reviewed' ? 'contained' : 'outlined'}
                onClick={() => updateStatus(viewItem._id, 'reviewed')}
                color="info"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
              >
                Reviewed
              </Button>
              <Button
                variant={viewItem.status === 'in_progress' ? 'contained' : 'outlined'}
                onClick={() => updateStatus(viewItem._id, 'in_progress')}
                color="warning"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
              >
                In Progress
              </Button>
              <Button
                variant={viewItem.status === 'resolved' ? 'contained' : 'outlined'}
                onClick={() => updateStatus(viewItem._id, 'resolved')}
                color="success"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
              >
                Resolved
              </Button>
            </>
          )}
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setViewItem(null)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: '600' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminFeedbackPage;