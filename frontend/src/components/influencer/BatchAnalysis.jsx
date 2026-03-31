// frontend/src/components/influencer/BatchAnalysis.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Delete,
  CompareArrows,
  Analytics,
  ContentCopy,
  Download
} from '@mui/icons-material';
import { youtubeApi } from '../../services/api';

const BatchAnalysis = ({ influencers, onInfluencerSelect }) => {
  const [channelUrls, setChannelUrls] = useState('');
  const [batchInfluencers, setBatchInfluencers] = useState(influencers || []);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddChannels = async () => {
    if (!channelUrls.trim()) return;

    setLoading(true);
    try {
      const urls = channelUrls.split('\n').filter(url => url.trim());
      const channelIds = urls.map(url => {
        // Extract channel ID from various YouTube URL formats
        const match = url.match(/(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/user\/|@)([^\/\s?]+)/);
        return match ? match[1] : null;
      }).filter(id => id);

      if (channelIds.length === 0) {
        alert('No valid YouTube channel URLs found');
        return;
      }

      const response = await youtubeApi.getBatchChannels(channelIds);
      setBatchInfluencers(prev => [...prev, ...response.channels]);
      setChannelUrls('');
      setDialogOpen(false);
    } catch (error) {
      alert('Error adding channels: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInfluencer = (channelId) => {
    setBatchInfluencers(prev => prev.filter(inf => inf.channelId !== channelId));
  };

  const handleClearAll = () => {
    setBatchInfluencers([]);
  };

  const formatNumber = (num) => {
    if (!num || num === '0') return '0';
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  };

  const getTierColor = (subCount) => {
    const count = typeof subCount === 'string' ? parseInt(subCount) : subCount;
    if (count >= 1000000) return '#FFD700';
    if (count >= 100000) return '#C0C0C0';
    if (count >= 10000) return '#CD7F32';
    return '#8B4513';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Subscribers', 'Views', 'Videos', 'Engagement Rate', 'Influencer Score', 'Tier'];
    const data = batchInfluencers.map(inf => [
      inf.title,
      inf.statistics?.subscriberCount,
      inf.statistics?.viewCount,
      inf.statistics?.videoCount,
      inf.influencerMetrics?.engagementRate,
      inf.influencerScore?.totalScore,
      parseInt(inf.statistics?.subscriberCount || 0) >= 1000000 ? 'Mega' :
      parseInt(inf.statistics?.subscriberCount || 0) >= 100000 ? 'Macro' :
      parseInt(inf.statistics?.subscriberCount || 0) >= 10000 ? 'Micro' : 'Nano'
    ]);

    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'influencer_comparison.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          Batch Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportToCSV}
            disabled={batchInfluencers.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearAll}
            disabled={batchInfluencers.length === 0}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Channels
          </Button>
        </Box>
      </Box>

      {batchInfluencers.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Analytics sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No influencers added for comparison
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add YouTube channels to compare their performance metrics side by side
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Channels to Compare
          </Button>
        </Paper>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Channels
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {batchInfluencers.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reach
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {formatNumber(batchInfluencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.subscriberCount || 0), 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Engagement
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {(batchInfluencers.reduce((sum, inf) => sum + (inf.influencerMetrics?.engagementRate || 0), 0) / batchInfluencers.length).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Avg Score
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {(batchInfluencers.reduce((sum, inf) => sum + (inf.influencerScore?.totalScore || 0), 0) / batchInfluencers.length).toFixed(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Comparison Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Channel</TableCell>
                    <TableCell align="right">Subscribers</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Videos</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                    <TableCell align="right">Score</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batchInfluencers.map((influencer) => (
                    <TableRow 
                      key={influencer.channelId} 
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onInfluencerSelect(influencer.channelId)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={influencer.thumbnails?.default?.url} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {influencer.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {influencer.customUrl || influencer.channelId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatNumber(influencer.statistics?.subscriberCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography>
                          {formatNumber(influencer.statistics?.viewCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography>
                          {formatNumber(influencer.statistics?.videoCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="bold"
                          color={
                            influencer.influencerMetrics?.engagementRate >= 8 ? 'success.main' :
                            influencer.influencerMetrics?.engagementRate >= 4 ? 'warning.main' : 'error.main'
                          }
                        >
                          {influencer.influencerMetrics?.engagementRate?.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="primary">
                          {influencer.influencerScore?.totalScore?.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            parseInt(influencer.statistics?.subscriberCount || 0) >= 1000000 ? 'Mega' :
                            parseInt(influencer.statistics?.subscriberCount || 0) >= 100000 ? 'Macro' :
                            parseInt(influencer.statistics?.subscriberCount || 0) >= 10000 ? 'Micro' : 'Nano'
                          }
                          size="small"
                          sx={{
                            backgroundColor: getTierColor(influencer.statistics?.subscriberCount),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveInfluencer(influencer.channelId);
                          }}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Add Channels Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Add Channels for Comparison
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter YouTube channel URLs (one per line). Supported formats:
          </Typography>
          <Box sx={{ mb: 2, pl: 2 }}>
            <Typography variant="body2" color="text.secondary">
              • https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • https://www.youtube.com/c/ChannelName
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • https://www.youtube.com/@Username
            </Typography>
          </Box>
          
          <TextField
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            placeholder="Paste YouTube channel URLs here, one per line..."
            value={channelUrls}
            onChange={(e) => setChannelUrls(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <ContentCopy fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Tip: You can copy multiple channel URLs from YouTube and paste them here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddChannels} 
            variant="contained"
            disabled={!channelUrls.trim() || loading}
          >
            {loading ? 'Adding...' : 'Add Channels'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchAnalysis;