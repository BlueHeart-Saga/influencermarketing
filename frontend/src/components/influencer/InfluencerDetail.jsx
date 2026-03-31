// frontend/src/components/influencer/InfluencerDetail.jsx
import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  Tab,
  Tabs,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  People,
  Visibility,
  PlayCircle,
  TrendingUp,
  MonetizationOn,
  Schedule,
  Star,
  Analytics
} from '@mui/icons-material';
import { TabPanel, TabContext } from '@mui/lab';

const InfluencerDetail = ({ influencer, analysis, onBack, loading }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState('overview');

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
      'Nano': '#8B4513',
      'Elite': '#FF6B6B',
      'Professional': '#4ECDC4',
      'Emerging': '#45B7D1',
      'Starter': '#96CEB4'
    };
    return colors[tier] || '#666';
  };

  if (loading || !influencer) {
    return <Typography>Loading...</Typography>;
  }
  // TabPanel component for MUI
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} variant="outlined">
          Back to Results
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
          {influencer.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <TabContext value={activeTab}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Overview" value="overview" />
                <Tab label="Analytics" value="analytics" />
                <Tab label="Content" value="content" />
                <Tab label="Monetization" value="monetization" />
              </Tabs>

              {/* Overview Tab */}
              <TabPanel value="overview" sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {/* Channel Header */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', mb: 4,  }}>
                    <Avatar
                      src={influencer.thumbnails?.high?.url}
                      sx={{ width: 120, height: 120 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {influencer.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {influencer.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={analysis?.influencerTier || 'Unknown Tier'} 
                          sx={{ 
                            backgroundColor: getTierColor(analysis?.influencerTier),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip label={`Joined ${new Date(influencer.publishedAt).getFullYear()}`} variant="outlined" />
                        {influencer.country && <Chip label={influencer.country} variant="outlined" />}
                      </Box>
                    </Box>
                  </Box>

                  {/* Key Metrics */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[
                      { label: 'Subscribers', value: formatNumber(influencer.statistics?.subscriberCount), icon: People, color: 'primary' },
                      { label: 'Total Views', value: formatNumber(influencer.statistics?.viewCount), icon: Visibility, color: 'info' },
                      { label: 'Videos', value: formatNumber(influencer.statistics?.videoCount), icon: PlayCircle, color: 'success' },
                      { label: 'Engagement Rate', value: `${influencer.influencerMetrics?.engagementRate || 0}%`, icon: TrendingUp, color: 'warning' }
                    ].map((metric, index) => (
                      <Grid item xs={6} md={3} key={index}>
                        <Card sx={{ textAlign: 'center', borderRadius: 3 }}>
                          <CardContent>
                            <metric.icon sx={{ fontSize: 40, color: `${metric.color}.main`, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color={`${metric.color}.main`}>
                              {metric.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {metric.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Influencer Score */}
                  {influencer.influencerScore && (
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star color="warning" />
                        Influencer Score: {influencer.influencerScore.totalScore?.toFixed(1)}/10
                      </Typography>
                      <Rating value={influencer.influencerScore.totalScore / 2} readOnly size="large" sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        {Object.entries(influencer.influencerScore.dimensionScores || {}).map(([key, value]) => (
                          <Grid item xs={6} md={4} key={key}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={value * 10} 
                                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                  color={
                                    value >= 8 ? 'success' :
                                    value >= 6 ? 'warning' : 'error'
                                  }
                                />
                                <Typography variant="body2" fontWeight="bold">
                                  {value.toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  )}
                </Box>
              </TabPanel>

              {/* Analytics Tab */}
              <TabPanel value="analytics" sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {analysis && (
                    <>
                      {/* Performance Trends */}
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Performance Trends
                      </Typography>
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                          <Card sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Growth Trend
                            </Typography>
                            <Typography variant="h4" color={
                              analysis.performanceTrends?.growthRate > 0 ? 'success.main' : 
                              analysis.performanceTrends?.growthRate < 0 ? 'error.main' : 'text.primary'
                            }>
                              {analysis.performanceTrends?.growthRate > 0 ? '+' : ''}{analysis.performanceTrends?.growthRate}%
                            </Typography>
                            <Typography variant="body2">
                              {analysis.performanceTrends?.trend} performance
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Recent Engagement
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                              {analysis.performanceTrends?.avgRecentEngagement}%
                            </Typography>
                            <Typography variant="body2">
                              Last 5 videos
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>

                      {/* Content Analysis */}
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Content Analysis
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 4 }}>
                        {Object.entries(analysis.contentAnalysis || {}).map(([key, value]) => (
                          <Grid item xs={6} md={3} key={key}>
                            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {typeof value === 'number' ? value.toFixed(1) : value}
                              </Typography>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </Box>
              </TabPanel>

              {/* Monetization Tab */}
              <TabPanel value="monetization" sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  {analysis?.monetizationPotential && (
                    <>
                      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MonetizationOn color="success" />
                        Monetization Potential
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h5" color="success.main" gutterBottom>
                              ${analysis.monetizationPotential.estimatedEarningsPerVideo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Estimated earnings per video
                            </Typography>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Card sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h5" color="primary.main" gutterBottom>
                              ${analysis.monetizationPotential.sponsorshipValue?.estimatedSponsorshipFee}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Estimated sponsorship fee
                            </Typography>
                            <Chip 
                              label={analysis.monetizationPotential.sponsorshipValue?.valueTier} 
                              size="small"
                              sx={{ mt: 1 }}
                              color="primary"
                            />
                          </Card>
                        </Grid>

                        <Grid item xs={12}>
                          <Card sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Sponsorship Value Breakdown
                            </Typography>
                            <Grid container spacing={2}>
                              {analysis.monetizationPotential.sponsorshipValue?.factors && 
                                Object.entries(analysis.monetizationPotential.sponsorshipValue.factors).map(([key, value]) => (
                                  <Grid item xs={6} md={3} key={key}>
                                    <Typography variant="body2" color="text.secondary">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      ${value}
                                    </Typography>
                                  </Grid>
                                ))
                              }
                            </Grid>
                          </Card>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Box>
              </TabPanel>
            </Paper>
          </TabContext>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Stats */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Audience Quality</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {influencer.influencerMetrics?.audienceQuality?.toFixed(1)}/10
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Growth Potential</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {influencer.influencerMetrics?.growthPotential?.toFixed(1)}/10
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Content Frequency</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {influencer.influencerMetrics?.contentFrequency?.toFixed(1)}/10
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Recommendations */}
          {analysis?.recommendations && analysis.recommendations.length > 0 && (
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recommendations
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {analysis.recommendations.map((rec, index) => (
                  <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                    {rec}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}

          {/* Action Buttons */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Button variant="contained" fullWidth size="large" sx={{ mb: 2 }}>
              Contact Influencer
            </Button>
            <Button variant="outlined" fullWidth size="large">
              Save to List
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};



export default InfluencerDetail;