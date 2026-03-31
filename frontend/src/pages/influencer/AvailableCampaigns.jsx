// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Box, Typography, Grid, Card, CardContent, CardActions,
//   Button, Chip, Dialog, DialogTitle, DialogContent,
//   DialogActions, TextField, Alert, CircularProgress,
//   IconButton, Tooltip, Badge,
//   InputAdornment, FormControl, InputLabel, Select,
//   MenuItem, Slider, Collapse, Checkbox, ListItemText,
//   OutlinedInput
// } from '@mui/material';
// import {
//   AttachMoney, CalendarToday, Category,
//   Person, Visibility, Send, Refresh,
//   Campaign, Groups, Public, TrendingUp,
//   Search, FilterList, Clear,
//   Chat
// } from '@mui/icons-material';
// import { campaignAPI } from '../../services/api';
// import { getCollaborations, createCollaboration } from '../../services/api';
// import { styled } from '@mui/material/styles';
// import '../../style/AvailableCampaigns.css';
// import { useNavigate } from 'react-router-dom';

// // Styled components for modern UI
// const StyledCard = styled(Card)(({ theme }) => ({
//   height: '100%',
//   display: 'flex',
//   flexDirection: 'column',
//   transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
//   borderRadius: '12px',
//   '&:hover': {
//     transform: 'translateY(-4px)',
//     boxShadow: theme.shadows[8],
//   },
// }));

// const StatusChip = styled(Chip)(({ status, theme }) => {
//   let color;
//   switch (status?.toLowerCase()) {
//     case 'active': color = theme.palette.success.main; break;
//     case 'draft': color = theme.palette.grey[500]; break;
//     case 'completed': color = theme.palette.primary.main; break;
//     case 'paused': color = theme.palette.warning.main; break;
//     default: color = theme.palette.grey[500];
//   }
//   return {
//     backgroundColor: color,
//     color: theme.palette.getContrastText(color),
//     fontWeight: 600,
//   };
// });

// const GradientButton = styled(Button)(({ theme }) => ({
//   background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
//   color: 'white',
//   fontWeight: 600,
//   borderRadius: '8px',
//   padding: '8px 16px',
// }));

// const StatRow = styled(Box)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   marginBottom: theme.spacing(1),
//   '& .MuiSvgIcon-root': {
//     marginRight: theme.spacing(1),
//     color: theme.palette.primary.main,
//   },
// }));

// const AvailableCampaigns = () => {
//   const [campaigns, setCampaigns] = useState([]);
//   const [filteredCampaigns, setFilteredCampaigns] = useState([]);
//   const [sortedCampaigns, setSortedCampaigns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [selectedCampaign, setSelectedCampaign] = useState(null);
//   const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
//   const [detailDialogOpen, setDetailDialogOpen] = useState(false);
//   const [applicationMessage, setApplicationMessage] = useState('');
//   const [applying, setApplying] = useState(false);
//   const [collaborations, setCollaborations] = useState([]);
//   const [chatLoading, setChatLoading] = useState(false);
  
//   // Filter states
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [selectedStatuses, setSelectedStatuses] = useState([]);
//   const [budgetRange, setBudgetRange] = useState([0, 10000]);
//   const [selectedBrands, setSelectedBrands] = useState([]);
//   const [showFilters, setShowFilters] = useState(false);
  
//   // New filter states
//   const [timelineFilter, setTimelineFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
  
//   const navigate = useNavigate();
//   const currentUser = {
//     id: localStorage.getItem('user_id'),
//     username: localStorage.getItem('username'),
//     role: localStorage.getItem('role')
//   };

//   const categories = [
//     'Fashion', 'Beauty', 'Lifestyle', 'Food', 'Travel',
//     'Fitness', 'Technology', 'Gaming', 'Other'
//   ];

//   const statusOptions = [
//     'Active', 'Draft', 'Completed', 'Paused'
//   ];

//   // Timeline filter options
//   const timelineOptions = [
//     { value: 'all', label: 'All Time' },
//     { value: 'today', label: 'Today' },
//     { value: 'week', label: 'This Week' },
//     { value: 'month', label: 'This Month' },
//     { value: 'quarter', label: 'This Quarter' },
//     { value: 'year', label: 'This Year' }
//   ];

//   // Sort options
//   const sortOptions = [
//     { value: 'newest', label: 'Newest First' },
//     { value: 'oldest', label: 'Oldest First' },
//     { value: 'budget-high', label: 'Budget: High to Low' },
//     { value: 'budget-low', label: 'Budget: Low to High' },
//     { value: 'deadline-close', label: 'Deadline: Soonest' },
//     { value: 'deadline-far', label: 'Deadline: Farthest' }
//   ];

//   // Currency symbols mapping
//   const currencySymbols = {
//     USD: '$',
//     EUR: '€',
//     GBP: '£',
//     INR: '₹',
//     JPY: '¥',
//     CAD: 'C$',
//     AUD: 'A$',
//     CNY: '¥',
//     BRL: 'R$',
//     RUB: '₽',
//     KRW: '₩',
//     MXN: '$',
//     CHF: 'Fr',
//     SEK: 'kr',
//     NOK: 'kr',
//     DKK: 'kr',
//     PLN: 'zł',
//     TRY: '₺',
//     ZAR: 'R',
//     SGD: 'S$',
//     HKD: 'HK$',
//     NZD: 'NZ$'
//   };

//   const fetchCampaigns = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await campaignAPI.getAvailableCampaigns();
      
//       // Handle different response structures
//       let campaignsData = [];
      
//       if (Array.isArray(response)) {
//         campaignsData = response;
//       } else if (response?.data) {
//         campaignsData = response.data;
//       } else if (response?.campaigns) {
//         campaignsData = response.campaigns;
//       } else if (response?.results) {
//         campaignsData = response.results;
//       }
      
//       // Sort campaigns by creation date (newest first)
//       const sortedCampaigns = campaignsData.sort((a, b) => {
//         return new Date(b.created_at || b.createdAt || b.date_created) - 
//                new Date(a.created_at || a.createdAt || a.date_created);
//       });
      
//       setCampaigns(sortedCampaigns);
      
//       // Initialize budget range based on actual data
//       if (campaignsData.length > 0) {
//         const budgets = campaignsData.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
//         const maxBudget = budgets.length > 0 ? Math.max(...budgets) : 10000;
//         setBudgetRange([0, maxBudget]);
//       }
//     } catch (err) {
//       setError('Failed to fetch campaigns. Please check your connection.');
//       console.error('Error fetching campaigns:', err);
//       setCampaigns([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const fetchCollaborations = useCallback(async () => {
//     try {
//       if (!currentUser?.id) return;
      
//       // FIX: Add user_id parameter to the API call
//       const response = await getCollaborations(currentUser.id, 'influencer');
//       setCollaborations(response.data || []);
//     } catch (error) {
//       console.error('Error fetching collaborations:', error);
//       // Don't set error state here to avoid blocking the UI
//     }
//   }, [currentUser.id]);

//   useEffect(() => {
//     fetchCampaigns();
//     fetchCollaborations();
//   }, []); // Removed dependencies to prevent infinite loop

//   // Filter campaigns based on criteria
//   useEffect(() => {
//     let filtered = campaigns.filter(campaign => {
//       // Search query filter
//       const matchesSearch = searchQuery === '' || 
//         campaign.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         campaign.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         campaign.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());

//       // Category filter
//       const matchesCategory = selectedCategories.length === 0 || 
//         selectedCategories.includes(campaign.category);

//       // Status filter
//       const matchesStatus = selectedStatuses.length === 0 || 
//         selectedStatuses.includes(campaign.status);

//       // Brand filter
//       const matchesBrand = selectedBrands.length === 0 || 
//         selectedBrands.includes(campaign.brand_name || campaign.brand?.name);

//       // Budget filter
//       const campaignBudget = parseFloat(campaign.budget) || 0;
//       const matchesBudget = campaignBudget >= budgetRange[0] && campaignBudget <= budgetRange[1];
      
//       // Timeline filter
//       const campaignDate = new Date(campaign.created_at || campaign.createdAt || campaign.date_created);
//       const now = new Date();
//       let matchesTimeline = true;
      
//       switch (timelineFilter) {
//         case 'today':
//           matchesTimeline = campaignDate.toDateString() === now.toDateString();
//           break;
//         case 'week':
//           const startOfWeek = new Date(now);
//           startOfWeek.setDate(now.getDate() - now.getDay());
//           startOfWeek.setHours(0, 0, 0, 0);
//           matchesTimeline = campaignDate >= startOfWeek;
//           break;
//         case 'month':
//           matchesTimeline = campaignDate.getMonth() === now.getMonth() && 
//                            campaignDate.getFullYear() === now.getFullYear();
//           break;
//         case 'quarter':
//           const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
//           const campaignQuarter = Math.floor(campaignDate.getMonth() / 3) + 1;
//           matchesTimeline = campaignQuarter === currentQuarter && 
//                            campaignDate.getFullYear() === now.getFullYear();
//           break;
//         case 'year':
//           matchesTimeline = campaignDate.getFullYear() === now.getFullYear();
//           break;
//         default:
//           matchesTimeline = true;
//       }

//       return matchesSearch && matchesCategory && matchesStatus && matchesBrand && matchesBudget && matchesTimeline;
//     });

//     setFilteredCampaigns(filtered);
//   }, [campaigns, searchQuery, selectedCategories, selectedStatuses, selectedBrands, budgetRange, timelineFilter]);

//   // Sort the filtered campaigns
//   useEffect(() => {
//     const sorted = [...filteredCampaigns].sort((a, b) => {
//       switch (sortBy) {
//         case 'newest':
//           return new Date(b.created_at || b.createdAt || b.date_created) - 
//                  new Date(a.created_at || a.createdAt || a.date_created);
//         case 'oldest':
//           return new Date(a.created_at || a.createdAt || a.date_created) - 
//                  new Date(b.created_at || b.createdAt || b.date_created);
//         case 'budget-high':
//           return (parseFloat(b.budget) || 0) - (parseFloat(a.budget) || 0);
//         case 'budget-low':
//           return (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0);
//         case 'deadline-close':
//           return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
//         case 'deadline-far':
//           return new Date(b.deadline || '0000-01-01') - new Date(a.deadline || '0000-01-01');
//         default:
//           return 0;
//       }
//     });
    
//     setSortedCampaigns(sorted);
//   }, [filteredCampaigns, sortBy]);

//   // Get unique brands from campaigns
//   const getUniqueBrands = () => {
//     const brands = campaigns.map(campaign => 
//       campaign.brand_name || campaign.brand?.name || 'Unknown Brand'
//     ).filter(brand => brand && brand !== 'Unknown Brand');
//     return [...new Set(brands)].sort();
//   };

//   const handleViewDetails = (campaign) => {
//     setSelectedCampaign(campaign);
//     setDetailDialogOpen(true);
//   };

//   const handleApply = (campaign) => {
//     setSelectedCampaign(campaign);
//     setApplicationMessage('');
//     setApplicationDialogOpen(true);
//   };

//   const handleSubmitApplication = async () => {
//     if (!selectedCampaign) return;

//     try {
//       setApplying(true);
//       await campaignAPI.applyToCampaign(selectedCampaign._id, {
//         message: applicationMessage
//       });
      
//       setSuccess('Application submitted successfully!');
//       setApplicationDialogOpen(false);
//       setSelectedCampaign(null);
//       setApplicationMessage('');
      
//       // Refresh the campaigns list to remove the applied campaign
//       fetchCampaigns();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Failed to submit application. Please try again.');
//       console.error('Application error:', err);
//     } finally {
//       setApplying(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchQuery('');
//     setSelectedCategories([]);
//     setSelectedStatuses([]);
//     setSelectedBrands([]);
//     setTimelineFilter('all');
//     setSortBy('newest');
//     if (campaigns.length > 0) {
//       const budgets = campaigns.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
//       const maxBudget = budgets.length > 0 ? Math.max(...budgets) : 10000;
//       setBudgetRange([0, maxBudget]);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const formatCurrency = (amount, currency = 'USD') => {
//     if (typeof amount !== 'number') {
//       amount = parseFloat(amount) || 0;
//     }
    
//     const symbol = currencySymbols[currency] || '$';
//     const formattedAmount = new Intl.NumberFormat('en-US', {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
    
//     return `${symbol}${formattedAmount}`;
//   };

//   // Get campaign currency
//   const getCampaignCurrency = (campaign) => {
//     return campaign.currency || campaign.brand?.currency || 'USD';
//   };

//   // Calculate max budget for slider
//   const calculateMaxBudget = () => {
//     const budgets = campaigns.map(c => parseFloat(c.budget) || 0).filter(b => b > 0);
//     return budgets.length > 0 ? Math.max(...budgets) : 10000;
//   };

//   // Check if there's an existing collaboration with a brand
//   const hasExistingCollaboration = (brandId) => {
//     return collaborations.some(collab => collab.brand_id === brandId);
//   };

//   // Handle chat with brand
//   const handleChatWithBrand = async (campaign) => {
//     try {
//       setChatLoading(true);
//       const brandId = campaign.brand_id || campaign.brand?._id;
      
//       if (!brandId) {
//         setError('Cannot start chat: Brand information is missing');
//         return;
//       }

//       // Check if collaboration already exists
//       const existingCollaboration = collaborations.find(collab => collab.brand_id === brandId);
      
//       if (existingCollaboration) {
//         // Navigate to collaborations page with the existing chat
//         navigate('/influencer/collaborations', { 
//           state: { selectedChatId: existingCollaboration.id } 
//         });
//         return;
//       }

//       // Create a new collaboration
//       const collaborationData = {
//         brand_id: brandId,
//         influencer_id: currentUser.id,
//         campaign_title: campaign.title || `Chat about ${campaign.brand_name || campaign.brand?.name}`,
//         brand_name: campaign.brand_name || campaign.brand?.name || 'Unknown Brand',
//         influencer_name: currentUser.username,
//         status: 'active'
//       };

//       const response = await createCollaboration(collaborationData);
//       const newCollaboration = response.data;

//       // Refresh collaborations and navigate to the new chat
//       await fetchCollaborations();
//       navigate('/influencer/collaborations', { 
//         state: { selectedChatId: newCollaboration.id } 
//       });

//     } catch (error) {
//       console.error('Error creating collaboration:', error);
//       setError('Failed to start chat. Please try again.');
//     } finally {
//       setChatLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Box className="loading-container">
//         <CircularProgress size={60} thickness={4} />
//         <Typography variant="h6" className="loading-text">
//           Loading available campaigns...
//         </Typography>
//       </Box>
//     );
//   }

//   const maxBudget = calculateMaxBudget();

//   return (
//     <Box className="campaigns-container">
//       <Box className="campaigns-header">
//         <Box className="header-content">
//           <Typography variant="h4" className="page-title">
//             Available Campaigns
//           </Typography>
//           <Typography variant="body1" className="page-subtitle">
//             Discover exciting opportunities to collaborate with brands
//           </Typography>
//         </Box>
//         <Box>
//           <Button
//             variant="outlined"
//             startIcon={<Chat />}
//             onClick={() => navigate('/influencer/collaborations')}
//             sx={{ mr: 1 }}
//           >
//             View Messages
//           </Button>
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchCampaigns}
//             disabled={loading}
//             className="refresh-btn"
//           >
//             Refresh
//           </Button>
//         </Box>
//       </Box>

//       {error && (
//         <Alert 
//           severity="error" 
//           className="error-alert"
//           onClose={() => setError('')}
//         >
//           {error}
//         </Alert>
//       )}

//       {success && (
//         <Alert 
//           severity="success" 
//           className="success-alert"
//           onClose={() => setSuccess('')}
//         >
//           {success}
//         </Alert>
//       )}

//       {/* Search and Filter Section */}
//       <Card className="search-filter-card">
//         <CardContent>
//           <Box className="search-container">
//             <TextField
//               fullWidth
//               variant="outlined"
//               placeholder="Search campaigns by title, description, or brand..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Search color="primary" />
//                   </InputAdornment>
//                 ),
//                 endAdornment: searchQuery && (
//                   <InputAdornment position="end">
//                     <IconButton
//                       aria-label="clear search"
//                       onClick={() => setSearchQuery('')}
//                       edge="end"
//                       size="small"
//                     >
//                       <Clear />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//               className="search-field"
//             />
//             <Button
//               variant="outlined"
//               startIcon={<FilterList />}
//               onClick={() => setShowFilters(!showFilters)}
//               className="filter-toggle-btn"
//             >
//               Filters
//             </Button>
//             {(searchQuery || selectedCategories.length > 0 || selectedStatuses.length > 0 || 
//               selectedBrands.length > 0 || timelineFilter !== 'all' || sortBy !== 'newest' || 
//               budgetRange[0] > 0 || budgetRange[1] < maxBudget) && (
//               <Button
//                 variant="outlined"
//                 startIcon={<Clear />}
//                 onClick={clearFilters}
//                 color="secondary"
//                 className="clear-filters-btn"
//               >
//                 Clear
//               </Button>
//             )}
//           </Box>

//           <Collapse in={showFilters}>
//             <Box className="filter-content">
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <FormControl fullWidth>
//                     <InputLabel>Categories</InputLabel>
//                     <Select
//                       multiple
//                       value={selectedCategories}
//                       onChange={(e) => setSelectedCategories(e.target.value)}
//                       input={<OutlinedInput label="Categories" />}
//                       renderValue={(selected) => selected.join(', ')}
//                     >
//                       {categories.map(category => (
//                         <MenuItem key={category} value={category}>
//                           <Checkbox checked={selectedCategories.indexOf(category) > -1} />
//                           <ListItemText primary={category} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <FormControl fullWidth>
//                     <InputLabel>Status</InputLabel>
//                     <Select
//                       multiple
//                       value={selectedStatuses}
//                       onChange={(e) => setSelectedStatuses(e.target.value)}
//                       input={<OutlinedInput label="Status" />}
//                       renderValue={(selected) => selected.join(', ')}
//                     >
//                       {statusOptions.map(status => (
//                         <MenuItem key={status} value={status}>
//                           <Checkbox checked={selectedStatuses.indexOf(status) > -1} />
//                           <ListItemText primary={status} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <FormControl fullWidth>
//                     <InputLabel>Brands</InputLabel>
//                     <Select
//                       multiple
//                       value={selectedBrands}
//                       onChange={(e) => setSelectedBrands(e.target.value)}
//                       input={<OutlinedInput label="Brands" />}
//                       renderValue={(selected) => selected.join(', ')}
//                     >
//                       {getUniqueBrands().map(brand => (
//                         <MenuItem key={brand} value={brand}>
//                           <Checkbox checked={selectedBrands.indexOf(brand) > -1} />
//                           <ListItemText primary={brand} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <FormControl fullWidth>
//                     <InputLabel>Time Period</InputLabel>
//                     <Select
//                       value={timelineFilter}
//                       onChange={(e) => setTimelineFilter(e.target.value)}
//                       input={<OutlinedInput label="Time Period" />}
//                     >
//                       {timelineOptions.map((option) => (
//                         <MenuItem key={option.value} value={option.value}>
//                           {option.label}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={3}>
//                   <FormControl fullWidth>
//                     <InputLabel>Sort By</InputLabel>
//                     <Select
//                       value={sortBy}
//                       onChange={(e) => setSortBy(e.target.value)}
//                       input={<OutlinedInput label="Sort By" />}
//                     >
//                       {sortOptions.map((option) => (
//                         <MenuItem key={option.value} value={option.value}>
//                           {option.label}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//                 <Grid item xs={12} sm={6} md={6}>
//                   <Box className="budget-filter">
//                     <Typography variant="body2" gutterBottom>
//                       Budget Range: {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
//                     </Typography>
//                     <Slider
//                       value={budgetRange}
//                       onChange={(e, newValue) => setBudgetRange(newValue)}
//                       valueLabelDisplay="auto"
//                       valueLabelFormat={(value) => formatCurrency(value)}
//                       min={0}
//                       max={maxBudget}
//                       className="budget-slider"
//                     />
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Collapse>

//           {/* Results counter */}
//           <Box className="results-counter">
//             <Typography variant="body2" className="results-text">
//               Showing {sortedCampaigns.length} of {campaigns.length} campaigns
//               {timelineFilter !== 'all' && ` (${timelineOptions.find(t => t.value === timelineFilter)?.label})`}
//               {sortBy !== 'newest' && `, sorted by ${sortOptions.find(s => s.value === sortBy)?.label}`}
//             </Typography>
//             {(searchQuery || selectedCategories.length > 0 || selectedStatuses.length > 0 || 
//               selectedBrands.length > 0 || timelineFilter !== 'all' || sortBy !== 'newest' || 
//               budgetRange[0] > 0 || budgetRange[1] < maxBudget) && (
//               <Chip 
//                 label="Filters Active" 
//                 color="primary" 
//                 variant="outlined" 
//                 size="small" 
//                 className="filters-active-chip"
//                 onDelete={clearFilters}
//               />
//             )}
//           </Box>
//         </CardContent>
//       </Card>

//       {sortedCampaigns.length === 0 ? (
//         <Box className="empty-state">
//           <Campaign className="empty-icon" />
//           <Typography variant="h6" className="empty-title">
//             {campaigns.length === 0 ? 'No campaigns available at the moment' : 'No campaigns match your filters'}
//           </Typography>
//           <Typography variant="body2" className="empty-description">
//             {campaigns.length === 0 
//               ? 'Check back later for new campaign opportunities or try refreshing the page.'
//               : 'Try adjusting your search criteria or clear all filters.'
//             }
//           </Typography>
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchCampaigns}
//             className="empty-action-btn"
//           >
//             Refresh Campaigns
//           </Button>
//           {campaigns.length > 0 && (
//             <Button
//               variant="outlined"
//               startIcon={<Clear />}
//               onClick={clearFilters}
//               className="empty-action-btn"
//               sx={{ ml: 1 }}
//             >
//               Clear Filters
//             </Button>
//           )}
//         </Box>
//       ) : (
//         <Grid container spacing={3}>
//           {sortedCampaigns.map((campaign) => {
//             const currency = getCampaignCurrency(campaign);
//             const brandId = campaign.brand_id || campaign.brand?._id;
//             const hasChat = brandId && hasExistingCollaboration(brandId);
            
//             return (
//               <Grid item xs={12} sm={6} lg={4} key={campaign._id || campaign.id}>
//                 <StyledCard>
//                   <CardContent className="campaign-card-content">
//                     <Box className="campaign-header">
//                       <Typography variant="h6" className="campaign-title">
//                         {campaign.title}
//                       </Typography>
//                       <StatusChip
//                         label={campaign.status || 'Active'}
//                         size="small"
//                         status={campaign.status}
//                       />
//                     </Box>

//                     <Typography variant="body2" className="brand-name">
//                       by {campaign.brand_name || campaign.brand?.name || 'Unknown Brand'}
//                     </Typography>

//                     <Typography 
//                       variant="body2" 
//                       className="campaign-description"
//                     >
//                       {campaign.description}
//                     </Typography>

//                     <Box className="campaign-stats">
//                       <StatRow>
//                         <AttachMoney fontSize="small" />
//                         <Typography variant="body2" className="stat-text">
//                           Budget: {formatCurrency(campaign.budget, currency)}
//                         </Typography>
//                       </StatRow>

//                       <StatRow>
//                         <Category fontSize="small" />
//                         <Typography variant="body2" className="stat-text">
//                           Category: {campaign.category || 'General'}
//                         </Typography>
//                       </StatRow>

//                       <StatRow>
//                         <CalendarToday fontSize="small" />
//                         <Typography variant="body2" className="stat-text">
//                           Deadline: {formatDate(campaign.deadline)}
//                         </Typography>
//                       </StatRow>
//                     </Box>

//                     {campaign.requirements && (
//                       <Typography variant="caption" className="requirements-text">
//                         Requirements: {campaign.requirements}
//                       </Typography>
//                     )}
//                   </CardContent>

//                   <CardActions className="campaign-actions">
//                     <Tooltip title="View details">
//                       <IconButton
//                         size="small"
//                         onClick={() => handleViewDetails(campaign)}
//                         className="view-details-btn"
//                       >
//                         <Visibility />
//                       </IconButton>
//                     </Tooltip>
                    
//                     {brandId && (
//                       <Tooltip title={hasChat ? "Continue conversation" : "Start conversation"}>
//                         <Badge
//                           color="primary"
//                           variant="dot"
//                           invisible={!hasChat}
//                         >
//                           <IconButton
//                             size="small"
//                             onClick={() => handleChatWithBrand(campaign)}
//                             disabled={chatLoading}
//                             className="chat-btn"
//                             color={hasChat ? "primary" : "default"}
//                           >
//                             <Chat />
//                           </IconButton>
//                         </Badge>
//                       </Tooltip>
//                     )}
                    
//                     <GradientButton
//                       variant="contained"
//                       startIcon={<Send />}
//                       onClick={() => handleApply(campaign)}
//                       className="apply-btn"
//                       size="small"
//                     >
//                       Apply
//                     </GradientButton>
//                   </CardActions>
//                 </StyledCard>
//               </Grid>
//             );
//           })}
//         </Grid>
//       )}

//       {/* Campaign Details Dialog */}
//       <Dialog
//         open={detailDialogOpen}
//         onClose={() => setDetailDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//         className="details-dialog"
//       >
//         <DialogTitle className="dialog-header">
//           Campaign Details
//         </DialogTitle>
//         <DialogContent dividers className="dialog-content">
//           {selectedCampaign && (
//             <Box>
//               <Typography variant="h5" className="detail-title">
//                 {selectedCampaign.title}
//               </Typography>
              
//               <Typography variant="body1" className="detail-brand">
//                 by {selectedCampaign.brand_name || selectedCampaign.brand?.name || 'Unknown Brand'}
//               </Typography>

//               <Box className="detail-status">
//                 <StatusChip
//                   label={selectedCampaign.status || 'Active'}
//                   status={selectedCampaign.status}
//                   size="medium"
//                 />
//               </Box>

//               <Typography variant="body1" className="detail-description">
//                 {selectedCampaign.description}
//               </Typography>

//               <Grid container spacing={2} className="detail-grid">
//                 <Grid item xs={12} sm={6}>
//                   <StatRow>
//                     <AttachMoney />
//                     <Typography variant="body2" className="detail-text">
//                       <strong>Budget:</strong> {formatCurrency(selectedCampaign.budget, getCampaignCurrency(selectedCampaign))}
//                     </Typography>
//                   </StatRow>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <StatRow>
//                     <Category />
//                     <Typography variant="body2" className="detail-text">
//                       <strong>Category:</strong> {selectedCampaign.category || 'General'}
//                     </Typography>
//                   </StatRow>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <StatRow>
//                     <CalendarToday />
//                     <Typography variant="body2" className="detail-text">
//                       <strong>Deadline:</strong> {formatDate(selectedCampaign.deadline)}
//                     </Typography>
//                   </StatRow>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <StatRow>
//                     <Person />
//                     <Typography variant="body2" className="detail-text">
//                       <strong>Status:</strong> {selectedCampaign.status || 'Active'}
//                     </Typography>
//                   </StatRow>
//                 </Grid>
//                 {selectedCampaign.target_audience && (
//                   <Grid item xs={12} sm={6}>
//                     <StatRow>
//                       <Groups />
//                       <Typography variant="body2" className="detail-text">
//                         <strong>Audience:</strong> {selectedCampaign.target_audience}
//                       </Typography>
//                     </StatRow>
//                   </Grid>
//                 )}
//                 {selectedCampaign.platform && (
//                   <Grid item xs={12} sm={6}>
//                     <StatRow>
//                       <Public />
//                       <Typography variant="body2" className="detail-text">
//                         <strong>Platform:</strong> {selectedCampaign.platform}
//                       </Typography>
//                     </StatRow>
//                   </Grid>
//                 )}
//                 {selectedCampaign.engagement && (
//                   <Grid item xs={12}>
//                     <StatRow>
//                       <TrendingUp />
//                       <Typography variant="body2" className="detail-text">
//                         <strong>Engagement:</strong> {selectedCampaign.engagement}
//                       </Typography>
//                     </StatRow>
//                   </Grid>
//                 )}
//                 {selectedCampaign.currency && (
//                   <Grid item xs={12} sm={6}>
//                     <StatRow>
//                       <AttachMoney />
//                       <Typography variant="body2" className="detail-text">
//                         <strong>Currency:</strong> {selectedCampaign.currency}
//                       </Typography>
//                     </StatRow>
//                   </Grid>
//                 )}
//               </Grid>

//               {selectedCampaign.requirements && (
//                 <Box className="requirements-section">
//                   <Typography variant="subtitle1" className="requirements-title">
//                     Requirements:
//                   </Typography>
//                   <Typography variant="body2" className="requirements-content">
//                     {selectedCampaign.requirements}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions className="dialog-actions">
//           <Button 
//             onClick={() => setDetailDialogOpen(false)}
//             className="close-btn"
//           >
//             Close
//           </Button>
//           {selectedCampaign && (
//             <IconButton
//               onClick={() => handleChatWithBrand(selectedCampaign)}
//               disabled={chatLoading}
//               className="detail-chat-btn"
//               color="primary"
//               size="large"
//             >
//               <Chat />
//             </IconButton>
//           )}
//           <Button
//             variant="contained"
//             onClick={() => {
//               setDetailDialogOpen(false);
//               handleApply(selectedCampaign);
//             }}
//             className="apply-now-btn"
//           >
//             Apply Now
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Application Dialog */}
//       <Dialog
//         open={applicationDialogOpen}
//         onClose={() => !applying && setApplicationDialogOpen(false)}
//         maxWidth="sm"
//         fullWidth
//         className="application-dialog"
//       >
//         <DialogTitle className="dialog-header">
//           Apply to {selectedCampaign?.title}
//         </DialogTitle>
//         <DialogContent dividers className="dialog-content">
//           <Typography variant="body2" className="application-brand">
//             Campaign by {selectedCampaign?.brand_name || selectedCampaign?.brand?.name}
//           </Typography>
          
//           <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
//             Budget: {selectedCampaign && formatCurrency(selectedCampaign.budget, getCampaignCurrency(selectedCampaign))}
//           </Typography>
          
//           <TextField
//             fullWidth
//             multiline
//             rows={4}
//             label="Your Message (Optional)"
//             placeholder="Tell the brand why you're a good fit for this campaign. Include your experience, audience demographics, and why you're excited about this opportunity."
//             value={applicationMessage}
//             onChange={(e) => setApplicationMessage(e.target.value)}
//             margin="normal"
//             disabled={applying}
//             className="message-field"
//           />
          
//           <Typography variant="caption" className="message-tip">
//             Tip: A personalized message increases your chances of being selected!
//           </Typography>
//         </DialogContent>
//         <DialogActions className="dialog-actions">
//           <Button
//             onClick={() => setApplicationDialogOpen(false)}
//             disabled={applying}
//             className="cancel-btn"
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleSubmitApplication}
//             disabled={applying || !selectedCampaign}
//             startIcon={applying ? <CircularProgress size={16} /> : <Send />}
//             className="submit-btn"
//           >
//             {applying ? 'Submitting...' : 'Submit Application'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default AvailableCampaigns;