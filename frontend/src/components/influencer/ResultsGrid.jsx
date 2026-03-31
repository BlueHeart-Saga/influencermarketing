// frontend/src/components/influencer/ResultsGrid.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Rating,
  Skeleton,
  IconButton,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  People,
  Visibility,
  PlayCircle,
  TrendingUp,
  Analytics,
  Star,
  OpenInNew,
  ThumbUp,
  Comment,
  Share
} from '@mui/icons-material';

const ResultsGrid = ({ influencers, onInfluencerSelect, loading, filters, onFiltersChange }) => {
  const formatNumber = (num) => {
    if (!num || num === '0') return '0';
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  const getTierColor = (tier) => {
    const colors = {
      'Mega': '#FFD700',
      'Macro': '#C0C0C0',
      'Micro': '#CD7F32',
      'Nano': '#8B4513'
    };
    return colors[tier] || '#666';
  };

  const getTierFromSubs = (subCount) => {
    const count = typeof subCount === 'string' ? parseInt(subCount) : subCount;
    if (count >= 1000000) return 'Mega';
    if (count >= 100000) return 'Macro';
    if (count >= 10000) return 'Micro';
    return 'Nano';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        {[...Array(6)].map((_, index) => (
          <Card key={index} sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={40} />
                  <Skeleton variant="text" width="40%" height={30} />
                  <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                    <Skeleton variant="text" width="100px" height={25} />
                    <Skeleton variant="text" width="100px" height={25} />
                    <Skeleton variant="text" width="100px" height={25} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Results Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: 1
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {influencers.length} Influencers Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sorted by {filters.sortBy === 'score' ? 'Influencer Score' : 
                      filters.sortBy === 'subscribers' ? 'Subscribers' :
                      filters.sortBy === 'engagement' ? 'Engagement' : 'Video Count'}
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
          >
            <MenuItem value="score">Influencer Score</MenuItem>
            <MenuItem value="subscribers">Subscribers</MenuItem>
            <MenuItem value="engagement">Engagement Rate</MenuItem>
            <MenuItem value="videos">Video Count</MenuItem>
            <MenuItem value="views">Total Views</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Results List - Full Width Cards */}
      <Box sx={{ width: '100%' }}>
        {influencers.map((influencer, index) => (
          <Card 
            key={influencer.channelId || index}
            sx={{ 
              mb: 3,
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
                borderLeft: '4px solid',
                borderLeftColor: 'primary.main'
              }
            }}
            onClick={() => onInfluencerSelect(influencer.channelId)}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                {/* Channel Avatar */}
                <Box sx={{ position: 'relative' }}>
                  <img
                    src={influencer.thumbnails?.medium?.url || influencer.thumbnails?.default?.url}
                    alt={influencer.title}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid',
                      borderColor: getTierColor(getTierFromSubs(influencer.statistics?.subscriberCount))
                    }}
                  />
                  <Chip 
                    label={getTierFromSubs(influencer.statistics?.subscriberCount)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: getTierColor(getTierFromSubs(influencer.statistics?.subscriberCount)),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1 }}>
                  {/* Channel Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {influencer.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {influencer.customUrl || influencer.channelId}
                      </Typography>
                    </Box>
                    
                    {/* Score and Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {influencer.influencerScore?.totalScore?.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Overall Score
                        </Typography>
                      </Box>
                      <Rating 
                        value={influencer.influencerScore?.totalScore / 2} 
                        readOnly 
                        precision={0.5}
                        sx={{ color: 'warning.main' }}
                      />
                    </Box>
                  </Box>

                  {/* Statistics Bar */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    p: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 2
                  }}>
                    {[
                      { icon: <People />, label: 'Subscribers', value: formatNumber(influencer.statistics?.subscriberCount) },
                      { icon: <Visibility />, label: 'Views', value: formatNumber(influencer.statistics?.viewCount) },
                      { icon: <PlayCircle />, label: 'Videos', value: formatNumber(influencer.statistics?.videoCount) },
                      { icon: <TrendingUp />, label: 'Engagement', value: `${influencer.influencerMetrics?.engagementRate || 0}%` },
                      { icon: <ThumbUp />, label: 'Likes', value: formatNumber(influencer.statistics?.likeCount) },
                      { icon: <Comment />, label: 'Comments', value: formatNumber(influencer.statistics?.commentCount) }
                    ].map((stat, idx) => (
                      <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ color: 'primary.main' }}>
                            {stat.icon}
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {stat.value}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Dimension Scores */}
                  {influencer.influencerScore?.dimensionScores && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        {Object.entries(influencer.influencerScore.dimensionScores).map(([key, value]) => (
                          <Grid item xs={12} sm={6} md={3} key={key}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {value.toFixed(1)}
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={value * 10} 
                                sx={{ 
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: value >= 8 ? '#4CAF50' : value >= 6 ? '#2196F3' : '#FF9800'
                                  }
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {influencer.keywords?.slice(0, 4).map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View detailed analytics">
                        <IconButton 
                          size="small"
                          sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark'
                            }
                          }}
                        >
                          <Analytics fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open channel">
                        <IconButton 
                          size="small"
                          sx={{ 
                            backgroundColor: 'grey.200',
                            '&:hover': {
                              backgroundColor: 'grey.300'
                            }
                          }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pagination */}
      {influencers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={10} color="primary" size="large" />
        </Box>
      )}
    </Box>
  );
};

export default ResultsGrid;