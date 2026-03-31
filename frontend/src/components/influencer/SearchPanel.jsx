// frontend/src/components/influencer/SearchPanel.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Grid,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Groups,
  Analytics,
  BatchPrediction,
  RocketLaunch,
  MonetizationOn,
  FilterList,
  SmartToy
} from '@mui/icons-material';
import {
  FaLaptopCode,
  FaTshirt,
  FaMusic,
  FaCamera,
  FaDog,
  FaHeartbeat,
  FaCar,
  FaBookOpen,
  FaMicrophone,
  FaFilm,
  FaLeaf,
  FaPalette,
  FaShoppingCart,
  FaChild,
  FaGlobeAsia,FaGamepad, FaUtensils, FaMoneyBillAlt, FaBicycle,
  FaTools,
  FaStore,
  FaChalkboardTeacher,
  FaSmileBeam,
  FaChartLine,
  FaProjectDiagram,
  FaHandsHelping,
  FaPrayingHands,
  FaNewspaper,
  FaRocket,
  FaMobileAlt,
  FaBeer,
  FaWater,
  FaPlane,
  FaHammer
} from "react-icons/fa";
import { lightBlue } from '@mui/material/colors';


const SearchPanel = ({ onSearch, onBatchAnalysis, loading }) => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useState({
    query: '',
    maxResults: 12,
    order: 'relevance',
    minSubscribers: '',
    maxSubscribers: '',
    minEngagement: ''
  });

  const quickSearches = [
  { label: 'Tech Reviews', query: 'tech review unboxing', icon: <FaLaptopCode /> },
  { label: 'Beauty & Makeup', query: 'beauty makeup tutorial', icon: <FaPalette /> },
  { label: 'Gaming', query: 'gaming gameplay walkthrough', icon: <FaGamepad /> },
  { label: 'Cooking', query: 'cooking recipe food', icon: <FaUtensils /> },
  { label: 'Fitness', query: 'fitness workout exercise', icon: <FaHeartbeat /> },
  { label: 'Travel', query: 'travel vlog adventure', icon: <FaGlobeAsia /> },
  { label: 'Finance', query: 'finance investing money', icon: <FaMoneyBillAlt /> },
  { label: 'Education', query: 'education learning tutorial', icon: <FaBookOpen /> },

  // New categories below
  { label: 'Fashion', query: 'fashion clothing try on haul', icon: <FaTshirt /> },
  { label: 'Music', query: 'music cover singing performance', icon: <FaMusic /> },
  { label: 'Photography', query: 'photography camera tips editing', icon: <FaCamera /> },
  { label: 'Pets & Animals', query: 'cute pets dogs cats animals', icon: <FaDog /> },
  { label: 'Health & Wellness', query: 'health wellness mental health tips', icon: <FaHeartbeat /> },
  { label: 'Automobile', query: 'car review automobile features test drive', icon: <FaCar /> },
  { label: 'Parenting', query: 'parenting mom vlog baby care tips', icon: <FaChild /> },
  { label: 'Movies & TV', query: 'movie review web series breakdown', icon: <FaFilm /> },
  { label: 'Podcast Hosts', query: 'podcast talk show interview', icon: <FaMicrophone /> },
  { label: 'Eco & Green Living', query: 'eco friendly sustainability zero waste', icon: <FaLeaf /> },
  { label: 'Shopping & Deals', query: 'online shopping deals discount haul', icon: <FaShoppingCart /> },
  { label: 'Cycling', query: 'cycling road bike mtb vlog', icon: <FaBicycle /> },
  { label: 'DIY & Crafts', query: 'DIY craft handmade tutorial', icon: <FaTools /> },
  { label: 'Small Business', query: 'small business marketing tips', icon: <FaStore /> },
  { label: 'Teaching & Tutors', query: 'online teaching tutor classes', icon: <FaChalkboardTeacher /> },
  { label: 'Comedy & Skits', query: 'funny comedy skit reels', icon: <FaSmileBeam /> },
  { label: 'Stock Market', query: 'stock market trading investment tips', icon: <FaChartLine /> },
  { label: 'Startups', query: 'startup entrepreneur founder journey', icon: <FaRocket /> },
  { label: 'Motivation', query: 'motivational speech success story', icon: <FaHandsHelping /> },
  { label: 'Religion & Spiritual', query: 'spiritual motivation prayer bible', icon: <FaPrayingHands /> },
  { label: 'News Commentary', query: 'current affairs news commentary', icon: <FaNewspaper /> },
  { label: 'Public Speaking', query: 'public speaking speech tips', icon: <FaMicrophone /> },
  { label: 'Smartphones & Gadgets', query: 'mobile gadget review unboxing', icon: <FaMobileAlt /> },
  { label: 'Beer & Wine', query: 'beer wine review tasting', icon: <FaBeer /> },
  { label: 'Ocean & Marine', query: 'ocean marine life diving vlog', icon: <FaWater /> },
  { label: 'Aviation', query: 'pilot aviation flying vlog', icon: <FaPlane /> },
  { label: 'Home Renovation', query: 'home renovation interior decor', icon: <FaHammer /> },
  { label: 'Art & Drawing', query: 'digital art drawing procreate', icon: <FaPalette /> },
  { label: 'Project Management', query: 'project management productivity', icon: <FaProjectDiagram /> }
];



  const handleQuickSearch = (query) => {
    setSearchParams(prev => ({ ...prev, query }));
    onSearch({ ...searchParams, query });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Search Section */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Discover Top YouTube Influencers
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              AI-powered search with deep analytics for smart influencer marketing
            </Typography>

            {/* Main Search Box */}
            <Card sx={{ 
              p: 3, 
              backgroundColor: alpha('#fff', 0.95),
              borderRadius: 3,
              boxShadow: 6
            }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by niche, topic, channel name, or keywords..."
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && onSearch(searchParams)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    sx: { 
                      backgroundColor: 'white',
                      borderRadius: 2
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => onSearch(searchParams)}
                  disabled={loading || !searchParams.query.trim()}
                  startIcon={loading ? <RocketLaunch /> : <Search />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {loading ? 'Analyzing...' : 'Search'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  select
                  size="small"
                  value={searchParams.order}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, order: e.target.value }))}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="relevance">Sort by Relevance</MenuItem>
                  <MenuItem value="date">Sort by Date</MenuItem>
                  <MenuItem value="rating">Sort by Rating</MenuItem>
                  <MenuItem value="viewCount">Sort by Views</MenuItem>
                </TextField>

                <TextField
                  size="small"
                  placeholder="Min subscribers"
                  value={searchParams.minSubscribers}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, minSubscribers: e.target.value }))}
                  sx={{ minWidth: 150 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Groups fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  size="small"
                  placeholder="Min engagement %"
                  value={searchParams.minEngagement}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, minEngagement: e.target.value }))}
                  sx={{ minWidth: 150 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TrendingUp fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  size="small"
                  sx={{ px: 3 }}
                >
                  More Filters
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<BatchPrediction />}
                  onClick={() => onBatchAnalysis([])}
                  size="small"
                  sx={{ px: 3 }}
                >
                  Batch Analysis
                </Button>
              </Box>
            </Card>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Searches */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <TrendingUp color="primary" />
            Popular Categories
          </Typography>
          
          <Box sx={{ mt: 2 }}>
  <Grid container spacing={2}>
    {quickSearches.map((item, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Box>
          }
          onClick={() => handleQuickSearch(item.query)}
          sx={{
            width: '100%',
            py: 2,
            fontSize: '1rem',
            justifyContent: 'center',
            borderRadius: 2,
            borderWidth: 2,
            borderColor: lightBlue,
            backgroundColor: 'white',
            boxShadow: 2,
            '& .MuiChip-label': {
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            },
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: 'black',
              transform: 'translateY(-2px)',
            }
          }}
          variant="outlined"
        />
      </Grid>
    ))}
  </Grid>
</Box>

        </CardContent>
      </Card>

      {/* Features Section */}
      {/* <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
            Why Choose Our Platform?
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              {
                icon: <Analytics sx={{ fontSize: 36 }} />,
                title: 'Comprehensive Analytics',
                description: 'Get detailed insights on engagement rates, audience demographics, and performance metrics',
                color: 'primary.main'
              },
              {
                icon: <SmartToy sx={{ fontSize: 36 }} />,
                title: 'AI-Powered Scoring',
                description: 'Our proprietary algorithm scores influencers across multiple dimensions for accurate matching',
                color: 'secondary.main'
              },
              {
                icon: <MonetizationOn sx={{ fontSize: 36 }} />,
                title: 'ROI Prediction',
                description: 'Estimate campaign performance and potential return on investment for each influencer',
                color: 'success.main'
              },
              {
                icon: <BatchPrediction sx={{ fontSize: 36 }} />,
                title: 'Batch Analysis',
                description: 'Compare multiple influencers side-by-side and create custom shortlists',
                color: 'warning.main'
              }
            ].map((feature, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 3,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: index % 2 === 0 ? 'grey.50' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateX(8px)'
                  }
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  backgroundColor: `${feature.color}15`,
                  color: feature.color 
                }}>
                  {feature.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent> 
      </Card>*/}
    </Box>
  );
};

export default SearchPanel;