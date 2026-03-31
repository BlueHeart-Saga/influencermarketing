// // frontend/src/pages/brand/FindInfluencer.jsx
// import React, { useState, useMemo } from 'react';
// import {
//   Box,
//   Container,
//   Grid,
//   Paper,
//   Typography,
//   Button,
//   Chip,
//   useTheme,
//   useMediaQuery,
//   alpha,
//   Breadcrumbs,
//   Link
// } from '@mui/material';
// import {
//   Home,
//   YouTube,
//   Search,
//   TrendingUp,
//   People,
//   Analytics,
//   CompareArrows,
//   NavigateNext
// } from '@mui/icons-material';
// import { youtubeApi } from '../../services/api';

// // Import Components
// import SearchPanel from '../../components/influencer/SearchPanel';
// import ResultsGrid from '../../components/influencer/ResultsGrid';
// import InfluencerDetail from '../../components/influencer/InfluencerDetail';
// import AnalyticsPanel from '../../components/influencer/AnalyticsPanel';
// import BatchAnalysis from '../../components/influencer/BatchAnalysis';

// const FindInfluencer = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [activeView, setActiveView] = useState('search');
//   const [searchResults, setSearchResults] = useState([]);
//   const [selectedInfluencer, setSelectedInfluencer] = useState(null);
//   const [influencerAnalysis, setInfluencerAnalysis] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [filters, setFilters] = useState({
//     minSubscribers: 0,
//     maxSubscribers: 10000000,
//     category: '',
//     engagementMin: 0,
//     sortBy: 'score'
//   });

//   // Calculate content height based on layout
//   const contentHeight = useMemo(() => {
//     const navbarHeight = 68;
//     return `calc(100vh - ${navbarHeight}px)`;
//   }, []);

//   const handleSearch = async (searchParams) => {
//     setLoading(true);
//     setError('');
//     try {
//       const response = await youtubeApi.searchChannels(
//         searchParams.query,
//         searchParams.maxResults,
//         searchParams.order,
//         filters.minSubscribers,
//         filters.maxSubscribers
//       );
//       setSearchResults(response.items || []);
//       setActiveView('results');
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Search failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInfluencerSelect = async (channelId) => {
//     setLoading(true);
//     setError('');
//     try {
//       const [channelData, analysisData] = await Promise.all([
//         youtubeApi.getChannel(channelId),
//         youtubeApi.analyzeInfluencer(channelId)
//       ]);
      
//       setSelectedInfluencer(channelData.item);
//       setInfluencerAnalysis(analysisData);
//       setActiveView('details');
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Failed to load influencer details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBatchAnalysis = (channels) => {
//     setSearchResults(channels);
//     setActiveView('batch');
//   };

//   const handleBackToResults = () => {
//     setActiveView('results');
//     setSelectedInfluencer(null);
//     setInfluencerAnalysis(null);
//   };

//   const handleBackToSearch = () => {
//     setActiveView('search');
//     setSearchResults([]);
//     setSelectedInfluencer(null);
//     setInfluencerAnalysis(null);
//   };

//   // Breadcrumb navigation
//   const renderBreadcrumbs = () => {
//     const breadcrumbs = [
//       { label: 'Dashboard', icon: <Home />, action: () => setActiveView('search') }
//     ];

//     if (activeView === 'results' || activeView === 'details' || activeView === 'batch') {
//       breadcrumbs.push({ label: 'Search Results', action: () => setActiveView('results') });
//     }

//     if (activeView === 'details') {
//       breadcrumbs.push({ label: selectedInfluencer?.title || 'Influencer Details' });
//     }

//     if (activeView === 'batch') {
//       breadcrumbs.push({ label: 'Batch Analysis' });
//     }

//     if (activeView === 'analytics') {
//       breadcrumbs.push({ label: 'Analytics Dashboard' });
//     }

//     return (
//       <Breadcrumbs 
//         separator={<NavigateNext fontSize="small" />} 
//         sx={{ mb: 3 }}
//       >
//         {breadcrumbs.map((breadcrumb, index) => (
//           <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//             {index === 0 && breadcrumb.icon}
//             {index < breadcrumbs.length - 1 ? (
//               <Link
//                 component="button"
//                 variant="body1"
//                 onClick={breadcrumb.action}
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 0.5,
//                   textDecoration: 'none',
//                   color: 'primary.main',
//                   '&:hover': { textDecoration: 'underline' }
//                 }}
//               >
//                 {breadcrumb.label}
//               </Link>
//             ) : (
//               <Typography 
//                 variant="body1" 
//                 color="text.primary"
//                 sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
//               >
//                 {breadcrumb.label}
//               </Typography>
//             )}
//           </Box>
//         ))}
//       </Breadcrumbs>
//     );
//   };

//   // View actions
//   const renderViewActions = () => {
//     switch (activeView) {
//       case 'results':
//         return (
//           <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
//             <Button
//               variant="outlined"
//               startIcon={<CompareArrows />}
//               onClick={() => setActiveView('batch')}
//               disabled={searchResults.length === 0}
//             >
//               Batch Compare
//             </Button>
//             <Button
//               variant="outlined"
//               startIcon={<Analytics />}
//               onClick={() => setActiveView('analytics')}
//               disabled={searchResults.length === 0}
//             >
//               View Analytics
//             </Button>
//             <Button
//               variant="outlined"
//               startIcon={<Search />}
//               onClick={handleBackToSearch}
//             >
//               New Search
//             </Button>
//           </Box>
//         );
//       case 'details':
//         return (
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <Button
//               variant="outlined"
//               onClick={handleBackToResults}
//             >
//               Back to Results
//             </Button>
//           </Box>
//         );
//       case 'batch':
//       case 'analytics':
//         return (
//           <Button
//             variant="outlined"
//             onClick={() => setActiveView('results')}
//           >
//             Back to Results
//           </Button>
//         );
//       default:
//         return null;
//     }
//   };

//   const renderActiveView = () => {
//     switch (activeView) {
//       case 'search':
//         return (
//           <SearchPanel 
//             onSearch={handleSearch}
//             onBatchAnalysis={handleBatchAnalysis}
//             loading={loading}
//           />
//         );
//       case 'results':
//         return (
//           <ResultsGrid
//             influencers={searchResults}
//             onInfluencerSelect={handleInfluencerSelect}
//             loading={loading}
//             filters={filters}
//             onFiltersChange={setFilters}
//           />
//         );
//       case 'details':
//         return (
//           <InfluencerDetail
//             influencer={selectedInfluencer}
//             analysis={influencerAnalysis}
//             onBack={handleBackToResults}
//             loading={loading}
//           />
//         );
//       case 'analytics':
//         return (
//           <AnalyticsPanel influencers={searchResults} />
//         );
//       case 'batch':
//         return (
//           <BatchAnalysis
//             influencers={searchResults}
//             onInfluencerSelect={handleInfluencerSelect}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   // Get view title
//   const getViewTitle = () => {
//     switch (activeView) {
//       case 'search':
//         return 'Influencer Discovery';
//       case 'results':
//         return `Search Results (${searchResults.length})`;
//       case 'details':
//         return selectedInfluencer?.title || 'Influencer Details';
//       case 'analytics':
//         return 'Analytics Dashboard';
//       case 'batch':
//         return 'Batch Analysis';
//       default:
//         return 'Influencer Analytics';
//     }
//   };

//   // Get view description
//   const getViewDescription = () => {
//     switch (activeView) {
//       case 'search':
//         return 'Find the perfect YouTube creators with AI-powered analytics and deep insights';
//       case 'results':
//         return 'Browse and analyze influencers based on your search criteria';
//       case 'details':
//         return 'Comprehensive analysis and performance metrics';
//       case 'analytics':
//         return 'Compare performance across all discovered influencers';
//       case 'batch':
//         return 'Compare multiple influencers side by side';
//       default:
//         return '';
//     }
//   };

//   return (
//     <Box sx={{ 
//       minHeight: contentHeight,
//       backgroundColor: 'background.default',
//       p: { xs: 2, md: 3 }
//     }}>
//       <Container maxWidth="xl" sx={{ height: '100%' }}>
//         {/* Header Section */}
//         <Box sx={{ mb: 4 }}>
//           {renderBreadcrumbs()}
          
//           <Box sx={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             alignItems: { xs: 'flex-start', md: 'center' },
//             flexDirection: { xs: 'column', md: 'row' },
//             gap: 2,
//             mb: 3
//           }}>
//             <Box>
//               <Typography 
//                 variant="h4" 
//                 component="h1" 
//                 fontWeight="bold"
//                 sx={{ 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   gap: 2,
//                   mb: 1
//                 }}
//               >
//                 <YouTube sx={{ color: 'red', fontSize: 'inherit' }} />
//                 {getViewTitle()}
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 {getViewDescription()}
//               </Typography>
//             </Box>
            
//             <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//               {renderViewActions()}
//             </Box>
//           </Box>

//           {/* Status Chips */}
//           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//             {searchResults.length > 0 && (
//               <Chip 
//                 label={`${searchResults.length} Influencers Found`} 
//                 color="primary" 
//                 variant="outlined"
//                 size="small"
//               />
//             )}
//             {filters.minSubscribers > 0 && (
//               <Chip 
//                 label={`Min ${filters.minSubscribers >= 1000000 ? `${(filters.minSubscribers/1000000).toFixed(1)}M` : filters.minSubscribers >= 1000 ? `${(filters.minSubscribers/1000).toFixed(0)}K` : filters.minSubscribers} subs`} 
//                 size="small"
//               />
//             )}
//             {filters.category && (
//               <Chip 
//                 label={filters.category} 
//                 size="small"
//               />
//             )}
//           </Box>
//         </Box>

//         {/* Error Alert */}
//         {error && (
//           <Paper
//             sx={{
//               p: 2,
//               mb: 3,
//               backgroundColor: theme.palette.error.light,
//               color: theme.palette.error.contrastText,
//               borderRadius: 2
//             }}
//           >
//             <Typography variant="body2">{error}</Typography>
//           </Paper>
//         )}

//         {/* Main Content Area */}
//         <Box sx={{ 
//           minHeight: `calc(${contentHeight} - 200px)`,
//           overflow: 'auto'
//         }}>
//           {renderActiveView()}
//         </Box>

//         {/* Quick Navigation Footer */}
//         {activeView !== 'search' && (
//           <Paper 
//             sx={{ 
//               mt: 4, 
//               p: 2, 
//               borderRadius: 2,
//               backgroundColor: alpha(theme.palette.primary.main, 0.02),
//               border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
//             }}
//           >
//             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
//               <Button
//                 variant="text"
//                 startIcon={<Search />}
//                 onClick={handleBackToSearch}
//                 size="small"
//               >
//                 New Search
//               </Button>
//               {activeView !== 'results' && searchResults.length > 0 && (
//                 <Button
//                   variant="text"
//                   startIcon={<People />}
//                   onClick={() => setActiveView('results')}
//                   size="small"
//                 >
//                   Back to Results
//                 </Button>
//               )}
//               {activeView !== 'analytics' && searchResults.length > 0 && (
//                 <Button
//                   variant="text"
//                   startIcon={<Analytics />}
//                   onClick={() => setActiveView('analytics')}
//                   size="small"
//                 >
//                   View Analytics
//                 </Button>
//               )}
//               {activeView !== 'batch' && searchResults.length > 0 && (
//                 <Button
//                   variant="text"
//                   startIcon={<CompareArrows />}
//                   onClick={() => setActiveView('batch')}
//                   size="small"
//                 >
//                   Batch Compare
//                 </Button>
//               )}
//             </Box>
//           </Paper>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default FindInfluencer;


// frontend/src/pages/brand/FindInfluencer.jsx
import React, { useState, useMemo } from 'react';
import {
  Search, Filter, TrendingUp, Users,
  BarChart3, ChevronRight,
  Youtube, Instagram, Facebook, Twitter,
  CheckCircle, Star, Users as UsersIcon,
  Eye, MessageSquare, Heart, Share2,
  Download, Save, X, Menu, Grid,
  List, ChevronLeft, ChevronDown,
  AlertCircle, Loader2
} from 'lucide-react';
import { GitCompare } from "lucide-react";

// import HomeTopBar from '../HomePage/HomeTopBar';
import { youtubeApi } from '../../services/api';

// Import Components
import SearchPanel from '../../components/influencer/SearchPanel';
import ResultsGrid from '../../components/influencer/ResultsGrid';
import InfluencerDetail from '../../components/influencer/InfluencerDetail';
import AnalyticsPanel from '../../components/influencer/AnalyticsPanel';
import BatchAnalysis from '../../components/influencer/BatchAnalysis';

const FindInfluencer = () => {
  const [activeView, setActiveView] = useState('search');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [influencerAnalysis, setInfluencerAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minSubscribers: 0,
    maxSubscribers: 10000000,
    category: '',
    engagementMin: 0,
    sortBy: 'score'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError('');
    try {
      const response = await youtubeApi.searchChannels(
        searchParams.query,
        searchParams.maxResults,
        searchParams.order,
        filters.minSubscribers,
        filters.maxSubscribers
      );
      setSearchResults(response.items || []);
      setActiveView('results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfluencerSelect = async (channelId) => {
    setLoading(true);
    setError('');
    try {
      const [channelData, analysisData] = await Promise.all([
        youtubeApi.getChannel(channelId),
        youtubeApi.analyzeInfluencer(channelId)
      ]);
      
      setSelectedInfluencer(channelData.item);
      setInfluencerAnalysis(analysisData);
      setActiveView('details');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load influencer details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalysis = (channels) => {
    setSearchResults(channels);
    setActiveView('batch');
  };

  const handleBackToResults = () => {
    setActiveView('results');
    setSelectedInfluencer(null);
    setInfluencerAnalysis(null);
  };

  const handleBackToSearch = () => {
    setActiveView('search');
    setSearchResults([]);
    setSelectedInfluencer(null);
    setInfluencerAnalysis(null);
  };

  const handleSaveSearch = () => {
    console.log('Save search:', filters);
  };

  const handleExportData = () => {
    console.log('Export data:', searchResults);
  };

  const quickFilters = [
    { label: 'Micro (1K-50K)', min: 1000, max: 50000 },
    { label: 'Mid-tier (50K-500K)', min: 50000, max: 500000 },
    { label: 'Macro (500K-5M)', min: 500000, max: 5000000 },
    { label: 'Mega (5M+)', min: 5000000, max: 100000000 }
  ];

  const platformStats = [
    { platform: 'YouTube', count: 156, icon: <Youtube size={16} />, color: '#FF0000' },
    { platform: 'Instagram', count: 89, icon: <Instagram size={16} />, color: '#E4405F' },
    { platform: 'TikTok', count: 112, icon: <Facebook size={16} />, color: '#000000' },
    { platform: 'Twitter', count: 42, icon: <Twitter size={16} />, color: '#1DA1F2' }
  ];

  const getViewTitle = () => {
    switch (activeView) {
      case 'search': return 'Influencer Discovery';
      case 'results': return `Search Results (${searchResults.length})`;
      case 'details': return selectedInfluencer?.title || 'Influencer Details';
      case 'analytics': return 'Analytics Dashboard';
      case 'batch': return 'Batch Analysis';
      default: return 'Influencer Analytics';
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'search': return 'Find the perfect YouTube creators with AI-powered analytics and deep insights';
      case 'results': return 'Browse and analyze influencers based on your search criteria';
      case 'details': return 'Comprehensive analysis and performance metrics';
      case 'analytics': return 'Compare performance across all discovered influencers';
      case 'batch': return 'Compare multiple influencers side by side';
      default: return '';
    }
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Dashboard', icon: '🏠', action: () => setActiveView('search') }
    ];

    if (activeView === 'results' || activeView === 'details' || activeView === 'batch') {
      breadcrumbs.push({ label: 'Search Results', action: () => setActiveView('results') });
    }

    if (activeView === 'details') {
      breadcrumbs.push({ label: 'Details' });
    }

    if (activeView === 'batch') {
      breadcrumbs.push({ label: 'Batch Analysis' });
    }

    if (activeView === 'analytics') {
      breadcrumbs.push({ label: 'Analytics' });
    }

    return (
      <div className="breadcrumbs">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
            <button
              className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
              onClick={breadcrumb.action}
              disabled={index === breadcrumbs.length - 1}
            >
              {breadcrumb.icon}
              <span>{breadcrumb.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderViewActions = () => {
    switch (activeView) {
      case 'results':
        return (
          <div className="view-actions">
            <button 
              className="view-action-btn"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
              <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
            </button>
            <button 
              className="view-action-btn"
              onClick={() => setActiveView('batch')}
              disabled={searchResults.length === 0}
            >
              <GitCompare size={16} />
              <span>Batch Compare</span>
            </button>
            <button 
              className="view-action-btn primary"
              onClick={() => setActiveView('analytics')}
              disabled={searchResults.length === 0}
            >
              <BarChart3 size={16} />
              <span>View Analytics</span>
            </button>
          </div>
        );
      case 'details':
        return (
          <div className="view-actions">
            <button className="view-action-btn" onClick={handleBackToResults}>
              <ChevronLeft size={16} />
              <span>Back to Results</span>
            </button>
            <button className="view-action-btn primary">
              <Save size={16} />
              <span>Save Profile</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'search':
        return (
          <SearchPanel 
            onSearch={handleSearch}
            onBatchAnalysis={handleBatchAnalysis}
            loading={loading}
          />
        );
      case 'results':
        return (
          <ResultsGrid
            influencers={searchResults}
            onInfluencerSelect={handleInfluencerSelect}
            loading={loading}
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
          />
        );
      case 'details':
        return (
          <InfluencerDetail
            influencer={selectedInfluencer}
            analysis={influencerAnalysis}
            onBack={handleBackToResults}
            loading={loading}
          />
        );
      case 'analytics':
        return <AnalyticsPanel influencers={searchResults} />;
      case 'batch':
        return <BatchAnalysis influencers={searchResults} onInfluencerSelect={handleInfluencerSelect} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* <HomeTopBar /> */}
      <div className="influencer-wrapper">
        <div className="influencer-main">
          {/* Mobile Sidebar Toggle */}
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>

          {/* Header Section - Full Width */}
          <div className="influencer-header-section">
            <div className="influencer-header-content">
              <div className="influencer-header-icon">
                <TrendingUp size={32} />
              </div>
              <div className="influencer-header-text">
                {renderBreadcrumbs()}
                <h1 className="influencer-header-title">
                  <Youtube size={28} style={{ color: '#FF0000', marginRight: '12px' }} />
                  {getViewTitle()}
                </h1>
                <p className="influencer-header-subtitle">{getViewDescription()}</p>
              </div>
            </div>
          </div>

          {/* Stats Section - Full Width */}
          <div className="stats-section">
            <div className="stats-container">
              {platformStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.count}</div>
                    <div className="stat-label">{stat.platform}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters - Full Width */}
          {activeView === 'search' && (
            <div className="quick-filters-section">
              <div className="section-header">
                <h3 className="section-title">Quick Filters</h3>
                <p className="section-description">Filter by audience size</p>
              </div>
              <div className="filters-container">
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    className="filter-option"
                    onClick={() => setFilters({
                      ...filters,
                      minSubscribers: filter.min,
                      maxSubscribers: filter.max
                    })}
                  >
                    <UsersIcon size={16} />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert - Full Width */}
          {error && (
            <div className="error-section">
              <div className="error-container">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Main Content Area - Full Width */}
          <div className="main-content-section">
            <div className="content-header">
              <div className="header-left">
                {activeView !== 'search' && searchResults.length > 0 && (
                  <div className="results-info">
                    <Users size={18} />
                    <span>{searchResults.length} influencers found</span>
                  </div>
                )}
                {activeView !== 'search' && filters.minSubscribers > 0 && (
                  <div className="active-filter">
                    <span>Min {filters.minSubscribers.toLocaleString()} subscribers</span>
                  </div>
                )}
              </div>
              <div className="header-right">
                {renderViewActions()}
              </div>
            </div>

            <div className={`content-body ${loading ? 'loading' : ''}`}>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading influencers...</span>
                </div>
              ) : (
                <div className="view-container">
                  {renderActiveView()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className={`influencer-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>

            {/* Saved Searches */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Saved Searches</h3>
              <div className="saved-searches">
                <button className="saved-search">
                  <Search size={14} />
                  <span>Tech YouTubers</span>
                  <span className="saved-count">24</span>
                </button>
                <button className="saved-search">
                  <Search size={14} />
                  <span>Gaming Creators</span>
                  <span className="saved-count">18</span>
                </button>
                <button className="saved-search">
                  <Search size={14} />
                  <span>Beauty & Lifestyle</span>
                  <span className="saved-count">32</span>
                </button>
              </div>
            </div>

            {/* Top Performers */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Top Performers</h3>
              <div className="top-performers">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="performer-card">
                    <div className="performer-rank">{item}</div>
                    <div className="performer-info">
                      <div className="performer-name">Creator #{item}</div>
                      <div className="performer-stats">
                        <span className="stat">
                          <Eye size={12} />
                          <span>1.{item}M</span>
                        </span>
                        <span className="stat">
                          <Star size={12} />
                          <span>9.{10-item}.2%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Export & Share</h3>
              <div className="export-actions">
                <button className="export-btn" onClick={handleExportData}>
                  <Download size={16} />
                  <span>Export CSV</span>
                </button>
                <button className="export-btn">
                  <Share2 size={16} />
                  <span>Share List</span>
                </button>
                <button className="export-btn" onClick={handleSaveSearch}>
                  <Save size={16} />
                  <span>Save Search</span>
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="sidebar-section">
              <h3 className="sidebar-title">Discovery Tips</h3>
              <div className="tips-list">
                <div className="tip">
                  <CheckCircle size={14} />
                  <span>Look for engagement rate ≥ 3%</span>
                </div>
                <div className="tip">
                  <CheckCircle size={14} />
                  <span>Check recent video performance</span>
                </div>
                <div className="tip">
                  <CheckCircle size={14} />
                  <span>Verify audience demographics</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <style>{`
          /* Reset and Base Styles */
          .influencer-wrapper { 
            width: 100%; 
            background: #f8fafc; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            min-height: 100vh;
          }
          
          .influencer-main {
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 24px;
            max-width: 100%;
            margin: 0 auto;
          }
          
          /* Mobile Sidebar Toggle */
          .mobile-sidebar-toggle { 
            display: none; 
            position: fixed; 
            top: 100px; 
            right: 20px; 
            z-index: 1000; 
            background: #3B82F6; 
            color: white; 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            border: none; 
            cursor: pointer; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          /* Header Section - Full Width */
          .influencer-header-section {
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            border-radius: 16px;
            padding: 40px;
            color: white;
            margin: 0 -24px;
            width: calc(100% + 48px);
          }
          
          .influencer-header-content {
            display: flex;
            align-items: center;
            gap: 24px;
            max-width: 1400px;
            margin: 0 auto;
          }
          
          .influencer-header-icon {
            width: 72px;
            height: 72px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .influencer-header-text {
            flex: 1;
          }
          
          .influencer-header-title {
            font-size: 36px;
            font-weight: 800;
            color: white;
            margin: 12px 0;
            display: flex;
            align-items: center;
          }
          
          .influencer-header-subtitle {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.5;
            max-width: 800px;
          }
          
          /* Breadcrumbs */
          .breadcrumbs {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
          }
          
          .breadcrumb-item {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .breadcrumb-item:hover:not(.active) {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
          
          .breadcrumb-item.active {
            color: white;
            cursor: default;
            opacity: 0.9;
          }
          
          .breadcrumb-separator {
            color: rgba(255, 255, 255, 0.5);
          }
          
          /* Stats Section - Full Width */
          .stats-section {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          }
          
          .stats-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          
          .stat-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            border-radius: 12px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
          }
          
          .stat-card:hover {
            border-color: #cbd5e1;
            transform: translateY(-2px);
          }
          
          .stat-icon {
            width: 48px;
            height: 48px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
          }
          
          .stat-content {
            flex: 1;
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1;
          }
          
          .stat-label {
            font-size: 14px;
            color: #64748b;
            margin-top: 4px;
          }
          
          /* Quick Filters Section - Full Width */
          .quick-filters-section {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          }
          
          .section-header {
            margin-bottom: 24px;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 8px 0;
          }
          
          .section-description {
            font-size: 14px;
            color: #64748b;
          }
          
          .filters-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          
          .filter-option {
            padding: 20px;
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            transition: all 0.2s ease;
          }
          
          .filter-option:hover {
            background: #e2e8f0;
            border-color: #cbd5e1;
            transform: translateY(-2px);
          }
          
          /* Error Section - Full Width */
          .error-section {
            margin: 0 -24px;
            width: calc(100% + 48px);
          }
          
          .error-container {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px 40px;
            background: #fee2e2;
            color: #dc2626;
            border-left: 4px solid #dc2626;
          }
          
          /* Main Content Section - Full Width */
          .main-content-section {
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          
          .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .results-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: #e0f2fe;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            color: #0369a1;
            font-size: 15px;
            font-weight: 500;
          }
          
          .active-filter {
            padding: 10px 16px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
            border: 1px solid #e2e8f0;
          }
          
          /* View Actions */
          .view-actions {
            display: flex;
            gap: 12px;
          }
          
          .view-action-btn {
            padding: 12px 20px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
          }
          
          .view-action-btn:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
          }
          
          .view-action-btn.primary {
            background: #3B82F6;
            border-color: #3B82F6;
            color: white;
          }
          
          .view-action-btn.primary:hover {
            background: #2563eb;
            border-color: #2563eb;
          }
          
          .view-action-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
          
          /* Content Body */
          .content-body {
            min-height: 500px;
            position: relative;
          }
          
          .content-body.loading {
            min-height: 300px;
          }
          
          .loading-state {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(59, 130, 246, 0.1);
            border-top-color: #3B82F6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .view-container {
            padding: 0;
            width: 100%;
          }
          
          /* Sidebar */
          .influencer-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 380px;
            height: 100vh;
            background: white;
            padding: 40px 24px 24px;
            z-index: 999;
            transition: right 0.3s ease;
            overflow-y: auto;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
            border-left: 1px solid #e2e8f0;
          }
          
          .influencer-sidebar.open {
            right: 0;
          }
          
          .sidebar-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .sidebar-close:hover {
            background: #e2e8f0;
          }
          
          /* Sidebar Sections */
          .sidebar-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
          }
          
          .sidebar-section:last-child {
            margin-bottom: 0;
          }
          
          .sidebar-title {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          /* Saved Searches */
          .saved-searches {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .saved-search {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
            color: #475569;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          
          .saved-search:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            transform: translateX(4px);
          }
          
          .saved-count {
            margin-left: auto;
            background: #3B82F6;
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            min-width: 32px;
            text-align: center;
          }
          
          /* Top Performers */
          .top-performers {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .performer-card {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 16px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s ease;
          }
          
          .performer-card:hover {
            border-color: #cbd5e1;
            transform: translateX(4px);
          }
          
          .performer-rank {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
          }
          
          .performer-info {
            flex: 1;
          }
          
          .performer-name {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 6px;
          }
          
          .performer-stats {
            display: flex;
            gap: 16px;
          }
          
          .stat {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #64748b;
          }
          
          /* Export Actions */
          .export-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .export-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            color: #475569;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
          }
          
          .export-btn:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            transform: translateX(4px);
          }
          
          /* Tips */
          .tips-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          
          .tip {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }
          
          .tip svg {
            color: #10B981;
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .tip span {
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }
          
          /* Responsive Design */
          @media (max-width: 1200px) {
            .stats-container,
            .filters-container {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .influencer-header-title {
              font-size: 32px;
            }
          }
          
          @media (max-width: 768px) {
            .influencer-main {
              padding: 16px;
              gap: 16px;
            }
            
            .influencer-header-section {
              margin: 0 -16px;
              width: calc(100% + 32px);
              padding: 32px 24px;
              border-radius: 12px;
            }
            
            .influencer-header-content {
              flex-direction: column;
              text-align: center;
              gap: 16px;
            }
            
            .influencer-header-icon {
              width: 60px;
              height: 60px;
            }
            
            .influencer-header-title {
              font-size: 28px;
              flex-direction: column;
              gap: 8px;
            }
            
            .stats-container,
            .filters-container {
              grid-template-columns: 1fr;
            }
            
            .content-header {
              flex-direction: column;
              gap: 16px;
              align-items: stretch;
              padding: 20px 24px;
            }
            
            .header-left,
            .header-right {
              width: 100%;
            }
            
            .view-actions {
              flex-wrap: wrap;
            }
            
            .view-action-btn {
              flex: 1;
              justify-content: center;
            }
            
            .mobile-sidebar-toggle {
              display: flex;
            }
            
            .influencer-sidebar {
              width: 100%;
              right: -100%;
            }
            
            .influencer-sidebar.open {
              right: 0;
            }
            
            .error-section {
              margin: 0 -16px;
              width: calc(100% + 32px);
            }
            
            .error-container {
              padding: 16px 24px;
            }
          }
          
          @media (max-width: 480px) {
            .influencer-header-title {
              font-size: 24px;
            }
            
            .influencer-header-subtitle {
              font-size: 16px;
            }
            
            .section-title {
              font-size: 20px;
            }
            
            .stat-value {
              font-size: 24px;
            }
            
            .view-action-btn {
              padding: 10px 16px;
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default FindInfluencer;