// frontend/src/components/influencer/AnalyticsPanel.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Analytics,
  BarChart,
  PieChart,
  ShowChart,
  Groups,
  Visibility,
  ThumbUp,
  Comment
} from '@mui/icons-material';

const AnalyticsPanel = ({ influencers }) => {
  const calculateAggregates = () => {
    if (!influencers.length) return {};

    const totalSubscribers = influencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.subscriberCount || 0), 0);
    const totalViews = influencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.viewCount || 0), 0);
    const totalVideos = influencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.videoCount || 0), 0);
    const totalLikes = influencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.likeCount || 0), 0);
    const totalComments = influencers.reduce((sum, inf) => sum + parseInt(inf.statistics?.commentCount || 0), 0);
    const avgEngagement = influencers.reduce((sum, inf) => sum + (inf.influencerMetrics?.engagementRate || 0), 0) / influencers.length;
    const avgScore = influencers.reduce((sum, inf) => sum + (inf.influencerScore?.totalScore || 0), 0) / influencers.length;

    const tierDistribution = influencers.reduce((acc, inf) => {
      const subCount = parseInt(inf.statistics?.subscriberCount || 0);
      let tier = 'Nano';
      if (subCount >= 1000000) tier = 'Mega';
      else if (subCount >= 100000) tier = 'Macro';
      else if (subCount >= 10000) tier = 'Micro';
      
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSubscribers,
      totalViews,
      totalVideos,
      totalLikes,
      totalComments,
      avgEngagement,
      avgScore,
      tierDistribution,
      totalInfluencers: influencers.length
    };
  };

  const aggregates = calculateAggregates();
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTrendIcon = (value, threshold = 0) => {
    if (value > threshold) return <TrendingUp color="success" />;
    if (value < threshold) return <TrendingDown color="error" />;
    return <Remove color="action" />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Analytics Header */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive insights for {aggregates.totalInfluencers} influencers
              </Typography>
            </Box>
          </Box>

          {/* Summary Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Reach',
                value: formatNumber(aggregates.totalSubscribers),
                subtext: `${aggregates.totalInfluencers} influencers`,
                icon: <Groups />,
                color: 'primary.main'
              },
              {
                title: 'Total Views',
                value: formatNumber(aggregates.totalViews),
                subtext: `${formatNumber(aggregates.totalVideos)} videos`,
                icon: <Visibility />,
                color: 'secondary.main'
              },
              {
                title: 'Engagement',
                value: `${aggregates.avgEngagement?.toFixed(1)}%`,
                subtext: 'Average rate',
                icon: <ThumbUp />,
                color: 'success.main'
              },
              {
                title: 'Interactions',
                value: formatNumber(aggregates.totalLikes + aggregates.totalComments),
                subtext: `${formatNumber(aggregates.totalLikes)} likes • ${formatNumber(aggregates.totalComments)} comments`,
                icon: <Comment />,
                color: 'warning.main'
              }
            ].map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        backgroundColor: `${metric.color}15`,
                        color: metric.color 
                      }}>
                        {metric.icon}
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {metric.title}
                      </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.subtext}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Tier Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PieChart color="primary" />
                Tier Distribution
              </Typography>
              {aggregates.tierDistribution && Object.entries(aggregates.tierDistribution).map(([tier, count]) => {
                const percentage = ((count / aggregates.totalInfluencers) * 100).toFixed(1);
                return (
                  <Box key={tier} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {tier}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {count} ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: tier === 'Mega' ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)' :
                                    tier === 'Macro' ? 'linear-gradient(90deg, #C0C0C0 0%, #A0A0A0 100%)' :
                                    tier === 'Micro' ? 'linear-gradient(90deg, #CD7F32 0%, #B36600 100%)' :
                                    'linear-gradient(90deg, #8B4513 0%, #663300 100%)'
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Score Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BarChart color="primary" />
                Score Distribution
              </Typography>
              {[
                { label: 'Excellent (8-10)', range: [8, 10], color: '#4CAF50' },
                { label: 'Good (6-8)', range: [6, 8], color: '#2196F3' },
                { label: 'Average (4-6)', range: [4, 6], color: '#FF9800' },
                { label: 'Poor (0-4)', range: [0, 4], color: '#F44336' }
              ].map((category, index) => {
                const rangeCount = influencers.filter(inf => {
                  const score = inf.influencerScore?.totalScore || 0;
                  return score >= category.range[0] && score < category.range[1];
                }).length;
                const percentage = ((rangeCount / aggregates.totalInfluencers) * 100).toFixed(1);

                return (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {category.label}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {rangeCount} ({percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          backgroundColor: category.color
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performers Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <ShowChart color="primary" />
            Top Performing Influencers
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Influencer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Subscribers</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Engagement</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Tier</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {influencers
                  .sort((a, b) => (b.influencerScore?.totalScore || 0) - (a.influencerScore?.totalScore || 0))
                  .slice(0, 10)
                  .map((influencer, index) => (
                    <TableRow 
                      key={influencer.channelId} 
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          backgroundColor: index < 3 ? 'primary.main' : 'grey.200',
                          color: index < 3 ? 'white' : 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={influencer.thumbnails?.default?.url}
                            sx={{ width: 48, height: 48 }}
                          />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {influencer.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatNumber(influencer.statistics?.videoCount)} videos
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(influencer.statistics?.subscriberCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold"
                            color={
                              influencer.influencerMetrics?.engagementRate >= 8 ? 'success.main' :
                              influencer.influencerMetrics?.engagementRate >= 4 ? 'warning.main' : 'error.main'
                            }
                          >
                            {influencer.influencerMetrics?.engagementRate?.toFixed(1)}%
                          </Typography>
                          {getTrendIcon(influencer.influencerMetrics?.engagementRate, 5)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="primary">
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
                            backgroundColor: 
                              parseInt(influencer.statistics?.subscriberCount || 0) >= 1000000 ? '#FFD700' :
                              parseInt(influencer.statistics?.subscriberCount || 0) >= 100000 ? '#C0C0C0' :
                              parseInt(influencer.statistics?.subscriberCount || 0) >= 10000 ? '#CD7F32' : '#8B4513',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            influencer.influencerScore?.totalScore >= 8 ? 'Excellent' :
                            influencer.influencerScore?.totalScore >= 6 ? 'Good' :
                            influencer.influencerScore?.totalScore >= 4 ? 'Average' : 'Needs Review'
                          }
                          size="small"
                          variant="outlined"
                          color={
                            influencer.influencerScore?.totalScore >= 8 ? 'success' :
                            influencer.influencerScore?.totalScore >= 6 ? 'primary' :
                            influencer.influencerScore?.totalScore >= 4 ? 'warning' : 'error'
                          }
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsPanel;