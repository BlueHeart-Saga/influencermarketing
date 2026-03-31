// // components/chat/ChatContainer.jsx
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Box,
//   Container,
//   Grid,
//   Paper,
//   Typography,
//   TextField,
//   IconButton,
//   Avatar,
//   Badge,
//   CircularProgress,
//   Chip,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   ListItemButton,
//   InputAdornment,
//   Menu,
//   MenuItem,
//   Button,
//   Alert,
//   Snackbar,
//   Tooltip,
//   useMediaQuery,
//   useTheme,
//   Tabs,
//   Tab,
//   Rating,
//   Card,
//   CardContent,
//   CardActions,
//   CardHeader,
//   LinearProgress,
//   Fab,
//   FormControl,
//   InputLabel,
//   Select,
//   Slider,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   ListItemIcon,
//   Divider
// } from '@mui/material';
// import {
//   Send as SendIcon,
//   Search as SearchIcon,
//   MoreVert as MoreVertIcon,
//   Archive as ArchiveIcon,
//   Delete as DeleteIcon,
//   Person as PersonIcon,
//   Business as BusinessIcon,
//   Campaign as CampaignIcon,
//   CheckCircle as CheckCircleIcon,
//   CheckCircleOutline as CheckCircleOutlineIcon,
//   AccessTime as AccessTimeIcon,
//   Refresh as RefreshIcon,
//   Clear as ClearIcon,
//   AttachFile as AttachFileIcon,
//   Image as ImageIcon,
//   InsertDriveFile as InsertDriveFileIcon,
//   ArrowBack as ArrowBackIcon,
//   ExpandMore as ExpandMoreIcon,
//   FilterList as FilterListIcon,
//   Chat as ChatIcon,
//   People as PeopleIcon,
//   Work as WorkIcon,
//   Star as StarIcon,
//   LocationOn as LocationOnIcon,
//   TrendingUp as TrendingUpIcon,
//   Language as LanguageIcon,
//   Phone as PhoneIcon,
//   Email as EmailIcon,
//   Instagram as InstagramIcon,
//   YouTube as YouTubeIcon,

//   Facebook as FacebookIcon,
//   Twitter as TwitterIcon,
//   Close as CloseIcon,
//   Check as CheckIcon,
//   Visibility as VisibilityIcon,
//   Dashboard as DashboardIcon,
//   BarChart as BarChartIcon,
//   Groups as GroupsIcon,
//   Article as ArticleIcon,
//   AccountCircle as AccountCircleIcon,
//   FavoriteBorder as FavoriteBorderIcon,
//   ExpandLess as ExpandLessIcon
// } from '@mui/icons-material';
// import { format } from 'date-fns';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import '../style/Chating.css';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// // ==================== PROFILE TYPES ====================
// const PROFILE_TYPES = {
//   BRAND: 'brand',
//   INFLUENCER: 'influencer'
// };

// // ==================== CUSTOM HOOKS ====================

// // Hook for fetching profiles
// const useProfiles = (type, filters = {}) => {
//   const [profiles, setProfiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { token } = useAuth();

//   const fetchProfiles = useCallback(async () => {
//     try {
//       setLoading(true);
//       // Fetch users with the specified role
//       const response = await axios.get(`${API_BASE_URL}/auth/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: { 
//           role: type,
//           ...filters
//         }
//       });
      
//       // Enrich with profile data
//       const enrichedProfiles = await Promise.all(
//         response.data.users.map(async (user) => {
//           try {
//             const profileResponse = await axios.get(
//               `${API_BASE_URL}/profile/${user.id}`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
//             return { ...user, ...profileResponse.data };
//           } catch {
//             return user;
//           }
//         })
//       );
      
//       setProfiles(enrichedProfiles);
//       setError(null);
//     } catch (err) {
//       setError(`Failed to load ${type}s`);
//       console.error(`Error fetching ${type}s:`, err);
//     } finally {
//       setLoading(false);
//     }
//   }, [type, token, JSON.stringify(filters)]);

//   useEffect(() => {
//     fetchProfiles();
//   }, [fetchProfiles]);

//   return {
//     profiles,
//     loading,
//     error,
//     refreshProfiles: fetchProfiles
//   };
// };

// // Hook for fetching conversations
// const useConversations = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { token } = useAuth();

//   const fetchConversations = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setConversations(response.data.conversations);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load conversations');
//       console.error('Error fetching conversations:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchConversations();
//     const interval = setInterval(fetchConversations, 30000);
//     return () => clearInterval(interval);
//   }, [fetchConversations]);

//   return {
//     conversations,
//     loading,
//     error,
//     refreshConversations: fetchConversations
//   };
// };

// // Hook for fetching messages
// const useMessages = (conversationId) => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { token } = useAuth();

//   const fetchMessages = useCallback(async () => {
//     if (!conversationId) return;
    
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMessages(response.data.messages);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load messages');
//       console.error('Error fetching messages:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [conversationId, token]);

//   useEffect(() => {
//     fetchMessages();
//   }, [fetchMessages]);

//   return {
//     messages,
//     loading,
//     error,
//     refreshMessages: fetchMessages,
//     setMessages
//   };
// };

// // Hook for fetching profile details
// const useProfileDetail = (profileId, type) => {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [matchAnalysis, setMatchAnalysis] = useState(null);
//   const { user, token } = useAuth();

//   const fetchProfileDetail = useCallback(async () => {
//     if (!profileId || !type) return;
    
//     try {
//       setLoading(true);
      
//       // Fetch profile details
//       const profileResponse = await axios.get(
//         `${API_BASE_URL}/profile/${profileId}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       setProfile(profileResponse.data);
      
//       // Get match analysis if applicable
//       if (user?.role === PROFILE_TYPES.BRAND && type === PROFILE_TYPES.INFLUENCER) {
//         try {
//           const matchResponse = await axios.get(
//             `${API_BASE_URL}/chat/match-analysis/${profileId}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           setMatchAnalysis(matchResponse.data.match_analysis);
//         } catch (matchErr) {
//           console.error('Error fetching match analysis:', matchErr);
//         }
//       }
      
//       setError(null);
//     } catch (err) {
//       setError(`Failed to load ${type} profile`);
//       console.error(`Error fetching ${type} profile:`, err);
//     } finally {
//       setLoading(false);
//     }
//   }, [profileId, type, user, token]);

//   useEffect(() => {
//     fetchProfileDetail();
//   }, [fetchProfileDetail]);

//   return {
//     profile,
//     loading,
//     error,
//     matchAnalysis,
//     refreshProfile: fetchProfileDetail
//   };
// };

// // ==================== COMPONENTS ====================

// // Profile Card Component
// const ProfileCard = ({ profile, type, onClick, isSelected, onStartChat }) => {
//   const theme = useTheme();
//   const { user } = useAuth();

//   const getProfileScore = () => {
//     const completion = profile?.profile_completion?.completion_percentage || 0;
//     return Math.min(Math.round(completion), 100);
//   };

//   const getSocialMediaIcons = () => {
//     if (type !== PROFILE_TYPES.INFLUENCER) return null;
    
//     const socials = profile?.social_media_handles || {};
//     const icons = {
//       instagram: <InstagramIcon fontSize="small" />,
//       youtube: <YouTubeIcon fontSize="small" />,
//     //   tiktok: <TikTokIcon fontSize="small" />,
//       facebook: <FacebookIcon fontSize="small" />,
//       twitter: <TwitterIcon fontSize="small" />
//     };

//     return Object.entries(socials).slice(0, 3).map(([platform, handle]) => (
//       <Tooltip key={platform} title={`${platform}: ${handle}`}>
//         <IconButton size="small">
//           {icons[platform] || <LanguageIcon fontSize="small" />}
//         </IconButton>
//       </Tooltip>
//     ));
//   };

//   return (
//     <Card 
//       sx={{ 
//         mb: 2, 
//         cursor: 'pointer',
//         border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
//         '&:hover': { boxShadow: 4 }
//       }}
//       onClick={() => onClick(profile)}
//     >
//       <CardHeader
//         avatar={
//           <Badge
//             overlap="circular"
//             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             badgeContent={
//               <Box
//                 sx={{
//                   width: 12,
//                   height: 12,
//                   borderRadius: '50%',
//                   bgcolor: profile?.is_online ? 'success.main' : 'grey.500',
//                   border: `2px solid ${theme.palette.background.paper}`
//                 }}
//               />
//             }
//           >
//             <Avatar
//               src={profile?.profile_picture}
//               sx={{ width: 56, height: 56 }}
//             >
//               {profile?.username?.charAt(0) || type.charAt(0).toUpperCase()}
//             </Avatar>
//           </Badge>
//         }
//         title={
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="h6" noWrap>
//               {profile?.username || 'Unknown'}
//             </Typography>
//             {type === PROFILE_TYPES.INFLUENCER && (
//               <Rating value={profile?.rating || 0} size="small" readOnly />
//             )}
//           </Box>
//         }
//         subheader={
//           <Box>
//             <Typography variant="body2" color="text.secondary">
//               {type === PROFILE_TYPES.BRAND ? profile?.company_name : profile?.name}
//             </Typography>
//             <Box display="flex" alignItems="center" gap={1} mt={0.5}>
//               <LocationOnIcon fontSize="small" />
//               <Typography variant="caption">
//                 {profile?.location || 'Location not specified'}
//               </Typography>
//             </Box>
//           </Box>
//         }
//       />
      
//       <CardContent sx={{ pt: 0 }}>
//         {/* Bio Preview */}
//         {profile?.bio && (
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//             {profile.bio.length > 100 ? `${profile.bio.substring(0, 100)}...` : profile.bio}
//           </Typography>
//         )}

//         {/* Industry/Niche */}
//         {(profile?.industry || profile?.niche) && (
//           <Chip
//             label={profile?.industry || profile?.niche}
//             size="small"
//             color="primary"
//             variant="outlined"
//             sx={{ mb: 2 }}
//           />
//         )}

//         {/* Stats */}
//         <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
//           {/* Profile Score */}
//           <Box textAlign="center">
//             <Typography variant="caption" color="text.secondary">Profile Score</Typography>
//             <Box position="relative" display="inline-flex" mt={0.5}>
//               <CircularProgress
//                 variant="determinate"
//                 value={getProfileScore()}
//                 size={40}
//                 thickness={4}
//                 color={getProfileScore() >= 70 ? 'success' : getProfileScore() >= 40 ? 'warning' : 'error'}
//               />
//               <Box
//                 top={0}
//                 left={0}
//                 bottom={0}
//                 right={0}
//                 position="absolute"
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="center"
//               >
//                 <Typography variant="caption" component="div" color="text.secondary">
//                   {`${getProfileScore()}%`}
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>

//           {/* Followers (for influencers) */}
//           {type === PROFILE_TYPES.INFLUENCER && profile?.follower_count && (
//             <Box textAlign="center">
//               <Typography variant="caption" color="text.secondary">Followers</Typography>
//               <Typography variant="h6">
//                 {profile.follower_count >= 1000000 
//                   ? `${(profile.follower_count / 1000000).toFixed(1)}M`
//                   : profile.follower_count >= 1000
//                     ? `${(profile.follower_count / 1000).toFixed(1)}K`
//                     : profile.follower_count}
//               </Typography>
//             </Box>
//           )}

//           {/* Social Media */}
//           <Box>
//             <Typography variant="caption" color="text.secondary">Social</Typography>
//             <Box display="flex" justifyContent="center" mt={0.5}>
//               {getSocialMediaIcons()}
//             </Box>
//           </Box>
//         </Box>
//       </CardContent>

//       <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
//         <Button
//           size="small"
//           startIcon={<VisibilityIcon />}
//           onClick={(e) => {
//             e.stopPropagation();
//             onClick(profile);
//           }}
//         >
//           View Profile
//         </Button>
//         {user?.role !== type && (
//           <Button
//             size="small"
//             variant="contained"
//             startIcon={<ChatIcon />}
//             onClick={(e) => {
//               e.stopPropagation();
//               onStartChat(profile);
//             }}
//           >
//             Start Chat
//           </Button>
//         )}
//       </CardActions>
//     </Card>
//   );
// };

// // Profile Filters Component
// const ProfileFilters = ({ type, filters, onFilterChange }) => {
//   const [expanded, setExpanded] = useState(false);

//   const handleFilterChange = (key, value) => {
//     onFilterChange({ ...filters, [key]: value });
//   };

//   const clearFilters = () => {
//     onFilterChange({});
//   };

//   return (
//     <Paper sx={{ p: 2, mb: 2 }}>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//         <Box display="flex" alignItems="center" gap={1}>
//           <FilterListIcon />
//           <Typography variant="h6">Filters</Typography>
//         </Box>
//         <Box>
//           <Button size="small" onClick={clearFilters}>
//             Clear All
//           </Button>
//           <IconButton onClick={() => setExpanded(!expanded)}>
//             {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//           </IconButton>
//         </Box>
//       </Box>

//       {expanded && (
//         <Grid container spacing={2}>
//           {/* Location Filter */}
//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               size="small"
//               label="Location"
//               value={filters.location || ''}
//               onChange={(e) => handleFilterChange('location', e.target.value)}
//               placeholder="City, Country"
//             />
//           </Grid>

//           {/* Profile Score Filter */}
//           <Grid item xs={12}>
//             <Typography gutterBottom>Profile Score</Typography>
//             <Slider
//               value={[filters.minScore || 0, filters.maxScore || 100]}
//               onChange={(_, newValue) => {
//                 handleFilterChange('minScore', newValue[0]);
//                 handleFilterChange('maxScore', newValue[1]);
//               }}
//               valueLabelDisplay="auto"
//               marks={[
//                 { value: 0, label: '0%' },
//                 { value: 25, label: '25%' },
//                 { value: 50, label: '50%' },
//                 { value: 75, label: '75%' },
//                 { value: 100, label: '100%' }
//               ]}
//             />
//           </Grid>

//           {/* For Influencers Only */}
//           {type === PROFILE_TYPES.INFLUENCER && (
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 label="Min Followers"
//                 type="number"
//                 value={filters.minFollowers || ''}
//                 onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
//                 InputProps={{
//                   endAdornment: <InputAdornment position="end">followers</InputAdornment>
//                 }}
//               />
//             </Grid>
//           )}
//         </Grid>
//       )}
//     </Paper>
//   );
// };

// // Conversation List Component
// const ConversationList = ({ 
//   conversations, 
//   selectedConversation, 
//   onSelectConversation,
//   loading,
//   onRefresh,
//   searchQuery,
//   onSearchChange 
// }) => {
//   const formatTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       return format(date, 'HH:mm');
//     } else if (diffDays === 1) {
//       return 'Yesterday';
//     } else if (diffDays < 7) {
//       return format(date, 'EEE');
//     } else {
//       return format(date, 'dd/MM/yy');
//     }
//   };

//   const getPreviewText = (text) => {
//     if (!text) return 'No messages yet';
//     return text.length > 50 ? text.substring(0, 50) + '...' : text;
//   };

//   if (loading && conversations.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//       {/* Search Bar */}
//       <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
//         <TextField
//           fullWidth
//           placeholder="Search conversations..."
//           value={searchQuery}
//           onChange={onSearchChange}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//             endAdornment: searchQuery && (
//               <InputAdornment position="end">
//                 <IconButton size="small" onClick={() => onSearchChange({ target: { value: '' } })}>
//                   <ClearIcon />
//                 </IconButton>
//               </InputAdornment>
//             )
//           }}
//           size="small"
//         />
//       </Box>

//       {/* Conversations List */}
//       <List sx={{ flexGrow: 1, overflow: 'auto' }}>
//         {conversations.map((conv) => (
//           <ListItemButton
//             key={conv.id}
//             selected={selectedConversation?.id === conv.id}
//             onClick={() => onSelectConversation(conv)}
//             sx={{
//               borderBottom: 1,
//               borderColor: 'divider',
//               '&:hover': { backgroundColor: 'action.hover' }
//             }}
//           >
//             <ListItem disablePadding sx={{ width: '100%' }}>
//               <ListItemAvatar>
//                 <Badge
//                   badgeContent={conv.unread_count}
//                   color="error"
//                   invisible={conv.unread_count === 0}
//                 >
//                   <Avatar>
//                     {conv.brand_name?.charAt(0) || 'B'}
//                   </Avatar>
//                 </Badge>
//               </ListItemAvatar>
//               <ListItemText
//                 primary={
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="subtitle1" noWrap>
//                       {conv.brand_name || 'Brand'}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {formatTime(conv.last_message_time)}
//                     </Typography>
//                   </Box>
//                 }
//                 secondary={
//                   <Box>
//                     <Typography variant="body2" color="text.secondary" noWrap>
//                       {getPreviewText(conv.last_message)}
//                     </Typography>
//                     {conv.campaign_id && (
//                       <Chip
//                         icon={<CampaignIcon />}
//                         label="Campaign"
//                         size="small"
//                         sx={{ mt: 0.5, height: 20 }}
//                       />
//                     )}
//                   </Box>
//                 }
//               />
//             </ListItem>
//           </ListItemButton>
//         ))}
//       </List>

//       {/* Empty State */}
//       {!loading && conversations.length === 0 && (
//         <Box textAlign="center" py={4} px={2}>
//           <ChatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//           <Typography color="text.secondary">
//             No conversations yet
//           </Typography>
//           <Typography variant="body2" color="text.disabled">
//             Start a conversation with a brand or influencer
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// // Message Bubble Component
// const MessageBubble = ({ message, currentUserId }) => {
//   const isOwnMessage = message.sender_id === currentUserId;
  
//   const getStatusIcon = () => {
//     switch (message.status) {
//       case 'read':
//         return <CheckCircleIcon fontSize="small" color="success" />;
//       case 'delivered':
//         return <CheckCircleOutlineIcon fontSize="small" color="action" />;
//       case 'sent':
//         return <AccessTimeIcon fontSize="small" color="action" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
//         mb: 2
//       }}
//     >
//       <Box
//         sx={{
//           maxWidth: '70%',
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
//         }}
//       >
//         <Paper
//           elevation={1}
//           sx={{
//             p: 1.5,
//             bgcolor: isOwnMessage ? 'primary.light' : 'grey.100',
//             color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
//             borderRadius: 2,
//             borderTopLeftRadius: isOwnMessage ? 12 : 4,
//             borderTopRightRadius: isOwnMessage ? 4 : 12
//           }}
//         >
//           <Typography variant="body1">{message.content}</Typography>
//         </Paper>
        
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             mt: 0.5,
//             gap: 0.5
//           }}
//         >
//           <Typography variant="caption" color="text.secondary">
//             {format(new Date(message.created_at), 'HH:mm')}
//           </Typography>
//           {isOwnMessage && getStatusIcon()}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// // Chat Messages Component
// const ChatMessages = ({ messages, loading, currentUserId, onLoadMore, hasMore }) => {
//   const messagesEndRef = useRef(null);
//   const containerRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   if (loading && messages.length === 0) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       ref={containerRef}
//       sx={{
//         flexGrow: 1,
//         overflow: 'auto',
//         p: 2,
//         display: 'flex',
//         flexDirection: 'column'
//       }}
//     >
//       {hasMore && (
//         <Box textAlign="center" mb={2}>
//           <Button
//             variant="outlined"
//             size="small"
//             onClick={onLoadMore}
//             startIcon={<ExpandMoreIcon />}
//           >
//             Load older messages
//           </Button>
//         </Box>
//       )}

//       {messages.map((message) => (
//         <MessageBubble
//           key={message.id}
//           message={message}
//           currentUserId={currentUserId}
//         />
//       ))}

//       {messages.length === 0 && !loading && (
//         <Box textAlign="center" py={4}>
//           <Typography color="text.secondary">
//             No messages yet
//           </Typography>
//           <Typography variant="body2" color="text.disabled">
//             Start the conversation by sending a message
//           </Typography>
//         </Box>
//       )}

//       <div ref={messagesEndRef} />
//     </Box>
//   );
// };

// // Message Input Component
// const MessageInput = ({ onSendMessage, disabled, onAttachFile }) => {
//   const [message, setMessage] = useState('');
//   const fileInputRef = useRef(null);

//   const handleSend = () => {
//     if (message.trim()) {
//       onSendMessage(message.trim());
//       setMessage('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleAttachClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);
//     onAttachFile(files);
//     e.target.value = null;
//   };

//   return (
//     <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
//       <TextField
//         fullWidth
//         multiline
//         maxRows={4}
//         placeholder="Type your message..."
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyPress={handleKeyPress}
//         disabled={disabled}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <Tooltip title="Attach file">
//                 <IconButton onClick={handleAttachClick} disabled={disabled}>
//                   <AttachFileIcon />
//                 </IconButton>
//               </Tooltip>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileSelect}
//                 multiple
//               />
//             </InputAdornment>
//           ),
//           endAdornment: (
//             <InputAdornment position="end">
//               <Tooltip title="Send message">
//                 <span>
//                   <IconButton
//                     onClick={handleSend}
//                     disabled={!message.trim() || disabled}
//                     color="primary"
//                   >
//                     <SendIcon />
//                   </IconButton>
//                 </span>
//               </Tooltip>
//             </InputAdornment>
//           )
//         }}
//       />
//     </Box>
//   );
// };

// // Chat Header Component
// const ChatHeader = ({ conversation, onBack, onRefresh }) => {
//   const { user } = useAuth();
//   const otherUser = user?.role === 'brand' 
//     ? conversation?.influencer_name 
//     : conversation?.brand_name;

//   return (
//     <Box
//       sx={{
//         p: 2,
//         borderBottom: 1,
//         borderColor: 'divider',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         bgcolor: 'background.paper'
//       }}
//     >
//       <Box display="flex" alignItems="center" gap={2}>
//         <IconButton onClick={onBack} sx={{ display: { md: 'none' } }}>
//           <ArrowBackIcon />
//         </IconButton>
//         <Avatar>
//           {otherUser?.charAt(0) || 'U'}
//         </Avatar>
//         <Box>
//           <Typography variant="h6">
//             {otherUser || 'Unknown User'}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {user?.role === 'brand' ? 'Influencer' : 'Brand'}
//           </Typography>
//         </Box>
//         {conversation?.campaign_id && (
//           <Chip
//             icon={<CampaignIcon />}
//             label="Campaign"
//             size="small"
//             color="primary"
//             variant="outlined"
//           />
//         )}
//       </Box>
//       <Box>
//         <Tooltip title="Refresh">
//           <IconButton onClick={onRefresh}>
//             <RefreshIcon />
//           </IconButton>
//         </Tooltip>
//       </Box>
//     </Box>
//   );
// };

// // Profile Detail Panel Component
// const ProfileDetailPanel = ({ profile, type, onClose, matchAnalysis, onStartChat }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { user } = useAuth();

//   const getStatsSection = () => {
//     const stats = [];
    
//     if (type === PROFILE_TYPES.INFLUENCER) {
//       stats.push(
//         { label: 'Engagement Rate', value: `${profile?.engagement_rate || 0}%`, icon: <TrendingUpIcon /> },
//         { label: 'Avg. Views', value: profile?.average_views || 'N/A', icon: <VisibilityIcon /> },
//         { label: 'Content Posts', value: profile?.content_count || 0, icon: <ArticleIcon /> }
//       );
//     } else {
//       stats.push(
//         { label: 'Company Size', value: profile?.company_size || 'N/A', icon: <GroupsIcon /> },
//         { label: 'Campaigns', value: profile?.campaign_count || 0, icon: <CampaignIcon /> },
//         { label: 'Success Rate', value: `${profile?.success_rate || 0}%`, icon: <BarChartIcon /> }
//       );
//     }

//     return (
//       <Box sx={{ mt: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           Statistics
//         </Typography>
//         <Grid container spacing={2}>
//           {stats.map((stat, index) => (
//             <Grid item xs={4} key={index}>
//               <Card variant="outlined">
//                 <CardContent sx={{ textAlign: 'center' }}>
//                   <Box sx={{ mb: 1, color: 'primary.main' }}>
//                     {stat.icon}
//                   </Box>
//                   <Typography variant="h5">{stat.value}</Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {stat.label}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     );
//   };

//   return (
//     <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//       {/* Header */}
//       <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
//         <Box display="flex" justifyContent="space-between" alignItems="center">
//           <Box display="flex" alignItems="center" gap={2}>
//             {isMobile && (
//               <IconButton onClick={onClose}>
//                 <ArrowBackIcon />
//               </IconButton>
//             )}
//             <Avatar
//               src={profile?.profile_picture}
//               sx={{ width: 60, height: 60 }}
//             >
//               {profile?.username?.charAt(0) || type.charAt(0).toUpperCase()}
//             </Avatar>
//             <Box>
//               <Typography variant="h5">
//                 {profile?.username || 'Unknown'}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {type === PROFILE_TYPES.BRAND ? profile?.company_name : profile?.name}
//               </Typography>
//               <Box display="flex" alignItems="center" gap={1} mt={0.5}>
//                 <LocationOnIcon fontSize="small" />
//                 <Typography variant="caption">
//                   {profile?.location || 'Location not specified'}
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>
//           <Box>
//             {user?.role !== type && (
//               <Button
//                 variant="contained"
//                 startIcon={<ChatIcon />}
//                 onClick={() => onStartChat(profile)}
//                 sx={{ mr: 1 }}
//               >
//                 Start Chat
//               </Button>
//             )}
//             {!isMobile && (
//               <IconButton onClick={onClose}>
//                 <CloseIcon />
//               </IconButton>
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* Content */}
//       <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
//         {/* Bio */}
//         {profile?.bio && (
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="h6" gutterBottom>
//               Bio
//             </Typography>
//             <Typography variant="body1">
//               {profile.bio}
//             </Typography>
//           </Box>
//         )}

//         {/* Match Analysis */}
//         {matchAnalysis && user?.role !== type && (
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="h6" gutterBottom>
//               Compatibility Analysis
//             </Typography>
//             <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
//               <CardContent>
//                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                   <Typography variant="h5">
//                     {matchAnalysis.match_score}% Match
//                   </Typography>
//                   <Chip
//                     label={matchAnalysis.match_level?.replace('_', ' ') || 'Good'}
//                     color={
//                       matchAnalysis.match_score >= 80 ? 'success' :
//                       matchAnalysis.match_score >= 60 ? 'warning' :
//                       'error'
//                     }
//                     sx={{ textTransform: 'capitalize' }}
//                   />
//                 </Box>
                
//                 {/* Recommendations */}
//                 {matchAnalysis.recommendations?.length > 0 && (
//                   <Box sx={{ mt: 3 }}>
//                     <Typography variant="subtitle2" gutterBottom>
//                       Recommendations
//                     </Typography>
//                     <List dense>
//                       {matchAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
//                         <ListItem key={idx} sx={{ py: 0.5 }}>
//                           <ListItemIcon sx={{ minWidth: 36 }}>
//                             <CheckIcon fontSize="small" />
//                           </ListItemIcon>
//                           <ListItemText primary={rec} />
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Box>
//                 )}
//               </CardContent>
//             </Card>
//           </Box>
//         )}

//         {/* Stats */}
//         {getStatsSection()}

//         {/* Contact Information */}
//         <Box sx={{ mt: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             Contact Information
//           </Typography>
//           <Grid container spacing={2}>
//             {profile?.email && (
//               <Grid item xs={12} sm={6}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <EmailIcon color="action" />
//                   <Typography variant="body2">{profile.email}</Typography>
//                 </Box>
//               </Grid>
//             )}
//             {profile?.phone && (
//               <Grid item xs={12} sm={6}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <PhoneIcon color="action" />
//                   <Typography variant="body2">{profile.phone}</Typography>
//                 </Box>
//               </Grid>
//             )}
//             {profile?.website && (
//               <Grid item xs={12}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <LanguageIcon color="action" />
//                   <Typography variant="body2" component="a" href={profile.website} target="_blank">
//                     {profile.website}
//                   </Typography>
//                 </Box>
//               </Grid>
//             )}
//           </Grid>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// // ==================== MAIN CHAT CONTAINER ====================

// const ChatContainer = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { user, token } = useAuth();
  
//   // State
//   const [activeTab, setActiveTab] = useState(0);
//   const [selectedProfile, setSelectedProfile] = useState(null);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [showProfileDetail, setShowProfileDetail] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [profileFilters, setProfileFilters] = useState({});
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
//   // Determine which profile type to show based on user role
//   const profileType = user?.role === PROFILE_TYPES.BRAND 
//     ? PROFILE_TYPES.INFLUENCER 
//     : PROFILE_TYPES.BRAND;

//   // Hooks
//   const {
//     profiles,
//     loading: loadingProfiles,
//     refreshProfiles
//   } = useProfiles(profileType, profileFilters);

//   const {
//     conversations,
//     loading: loadingConversations,
//     refreshConversations
//   } = useConversations();

//   const {
//     messages,
//     loading: loadingMessages,
//     refreshMessages,
//     setMessages
//   } = useMessages(selectedConversation?.id);

//   const {
//     profile: detailedProfile,
//     loading: loadingProfileDetail,
//     matchAnalysis,
//     refreshProfile
//   } = useProfileDetail(selectedProfile?.id, profileType);

//   // Handlers
//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//     if (newValue === 0) {
//       setShowProfileDetail(false);
//       setSelectedProfile(null);
//     }
//   };

//   const handleProfileSelect = (profile) => {
//     setSelectedProfile(profile);
//     setShowProfileDetail(true);
//   };

//   const handleStartChat = async (profile) => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/chat/conversations`,
//         {
//           [profileType === PROFILE_TYPES.INFLUENCER ? 'influencer_id' : 'brand_id']: profile.id,
//           message: `Hi ${profile.username}, I'd like to connect with you!`
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setSelectedConversation({
//         id: response.data.conversation_id,
//         brand_name: user.role === PROFILE_TYPES.BRAND ? user.username : profile.username,
//         influencer_name: user.role === PROFILE_TYPES.INFLUENCER ? user.username : profile.username,
//         brand_id: user.role === PROFILE_TYPES.BRAND ? user.id : profile.id,
//         influencer_id: user.role === PROFILE_TYPES.INFLUENCER ? user.id : profile.id
//       });

//       setActiveTab(1);
//       setShowProfileDetail(false);
//       refreshConversations();

//       setSnackbar({
//         open: true,
//         message: 'Conversation started successfully!',
//         severity: 'success'
//       });
//     } catch (error) {
//       console.error('Error starting conversation:', error);
//       setSnackbar({
//         open: true,
//         message: 'Failed to start conversation',
//         severity: 'error'
//       });
//     }
//   };

//   const handleCloseProfileDetail = () => {
//     setShowProfileDetail(false);
//     setSelectedProfile(null);
//   };

//   const handleSelectConversation = (conversation) => {
//     setSelectedConversation(conversation);
//     if (isMobile) {
//       setActiveTab(2);
//     }
//   };

//   const handleBackToConversations = () => {
//     if (isMobile) {
//       setActiveTab(1);
//     }
//   };

//   const handleSendMessage = async (content) => {
//     if (!selectedConversation || !content.trim()) return;

//     try {
//       const tempMessageId = `temp-${Date.now()}`;
//       const tempMessage = {
//         id: tempMessageId,
//         conversation_id: selectedConversation.id,
//         sender_id: user.id,
//         recipient_id: selectedConversation.brand_id === user.id 
//           ? selectedConversation.influencer_id 
//           : selectedConversation.brand_id,
//         content: content,
//         message_type: 'text',
//         status: 'sending',
//         created_at: new Date().toISOString()
//       };

//       // Optimistically add message
//       setMessages(prev => [...prev, tempMessage]);

//       // Send to server
//       const response = await axios.post(
//         `${API_BASE_URL}/chat/messages`,
//         {
//           conversation_id: selectedConversation.id,
//           content: content,
//           message_type: 'text'
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Replace temp message with real one
//       setMessages(prev => prev.map(msg =>
//         msg.id === tempMessageId ? response.data : msg
//       ));

//       // Refresh conversation list
//       refreshConversations();

//       setSnackbar({
//         open: true,
//         message: 'Message sent!',
//         severity: 'success'
//       });
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setSnackbar({
//         open: true,
//         message: 'Failed to send message',
//         severity: 'error'
//       });
      
//       // Remove failed message
//       setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
//     }
//   };

//   const handleAttachFile = async (files) => {
//     console.log('Files to attach:', files);
//     // Implement file upload logic
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   // Filter conversations based on search
//   const filteredConversations = conversations.filter(conv =>
//     conv.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     conv.influencer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Filter profiles based on search
//   const filteredProfiles = profiles.filter(profile => {
//     if (!searchQuery) return true;
    
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       profile.username?.toLowerCase().includes(searchLower) ||
//       profile.name?.toLowerCase().includes(searchLower) ||
//       profile.company_name?.toLowerCase().includes(searchLower) ||
//       profile.bio?.toLowerCase().includes(searchLower) ||
//       profile.industry?.toLowerCase().includes(searchLower) ||
//       profile.niche?.toLowerCase().includes(searchLower) ||
//       profile.location?.toLowerCase().includes(searchLower)
//     );
//   });

//   // Mobile Layout
//   if (isMobile) {
//     return (
//       <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//         {/* Header */}
//         <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
//           <Typography variant="h6">
//             {activeTab === 0 ? 'Discover' : activeTab === 1 ? 'Conversations' : 'Chat'}
//           </Typography>
//         </Box>

//         {/* Tabs */}
//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
//             <Tab label="Discover" icon={<PeopleIcon />} />
//             <Tab label="Chats" icon={<ChatIcon />} />
//           </Tabs>
//         </Box>

//         {/* Content */}
//         <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
//           {activeTab === 0 ? (
//             // Discover Tab
//             showProfileDetail ? (
//               <ProfileDetailPanel
//                 profile={detailedProfile}
//                 type={profileType}
//                 onClose={handleCloseProfileDetail}
//                 matchAnalysis={matchAnalysis}
//                 onStartChat={handleStartChat}
//               />
//             ) : (
//               <Box sx={{ p: 2 }}>
//                 {/* Search Bar */}
//                 <TextField
//                   fullWidth
//                   placeholder={`Search ${profileType}s...`}
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon />
//                       </InputAdornment>
//                     ),
//                     endAdornment: searchQuery && (
//                       <InputAdornment position="end">
//                         <IconButton size="small" onClick={() => setSearchQuery('')}>
//                           <ClearIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }}
//                   sx={{ mb: 2 }}
//                 />

//                 {/* Filters */}
//                 <ProfileFilters
//                   type={profileType}
//                   filters={profileFilters}
//                   onFilterChange={setProfileFilters}
//                 />

//                 {/* Profiles List */}
//                 {loadingProfiles ? (
//                   <Box display="flex" justifyContent="center" py={4}>
//                     <CircularProgress />
//                   </Box>
//                 ) : filteredProfiles.length > 0 ? (
//                   filteredProfiles.map((profile) => (
//                     <ProfileCard
//                       key={profile.id}
//                       profile={profile}
//                       type={profileType}
//                       onClick={handleProfileSelect}
//                       isSelected={selectedProfile?.id === profile.id}
//                       onStartChat={handleStartChat}
//                     />
//                   ))
//                 ) : (
//                   <Box textAlign="center" py={4}>
//                     <PeopleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//                     <Typography color="text.secondary">
//                       No {profileType}s found
//                     </Typography>
//                     <Typography variant="body2" color="text.disabled">
//                       Try adjusting your filters or search
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             )
//           ) : activeTab === 1 ? (
//             // Conversations Tab
//             <ConversationList
//               conversations={filteredConversations}
//               selectedConversation={selectedConversation}
//               onSelectConversation={handleSelectConversation}
//               loading={loadingConversations}
//               onRefresh={refreshConversations}
//               searchQuery={searchQuery}
//               onSearchChange={(e) => setSearchQuery(e.target.value)}
//             />
//           ) : (
//             // Chat Tab
//             <>
//               <ChatHeader
//                 conversation={selectedConversation}
//                 onBack={handleBackToConversations}
//                 onRefresh={refreshMessages}
//               />
//               <ChatMessages
//                 messages={messages}
//                 loading={loadingMessages}
//                 currentUserId={user?.id}
//                 hasMore={false}
//               />
//               <MessageInput
//                 onSendMessage={handleSendMessage}
//                 disabled={!selectedConversation}
//                 onAttachFile={handleAttachFile}
//               />
//             </>
//           )}
//         </Box>

//         {/* Snackbar */}
//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={3000}
//           onClose={handleCloseSnackbar}
//         >
//           <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
//             {snackbar.message}
//           </Alert>
//         </Snackbar>
//       </Box>
//     );
//   }

//   // Desktop Layout
//   return (
//     <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', py: 2 }}>
//       <Grid container spacing={2} sx={{ height: '100%' }}>
//         {/* Left Panel - Profiles */}
//         <Grid item md={4} lg={3} sx={{ height: '100%' }}>
//           <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//             {/* Header */}
//             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
//               <Typography variant="h6" gutterBottom>
//                 Discover {profileType === PROFILE_TYPES.BRAND ? 'Brands' : 'Influencers'}
//               </Typography>
              
//               {/* Search */}
//               <TextField
//                 fullWidth
//                 size="small"
//                 placeholder={`Search ${profileType}s...`}
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon />
//                     </InputAdornment>
//                   ),
//                   endAdornment: searchQuery && (
//                     <InputAdornment position="end">
//                       <IconButton size="small" onClick={() => setSearchQuery('')}>
//                         <ClearIcon />
//                       </IconButton>
//                     </InputAdornment>
//                   )
//                 }}
//                 sx={{ mt: 1 }}
//               />
//             </Box>

//             {/* Filters */}
//             <Box sx={{ p: 2 }}>
//               <ProfileFilters
//                 type={profileType}
//                 filters={profileFilters}
//                 onFilterChange={setProfileFilters}
//               />
//             </Box>

//             {/* Profiles List */}
//             <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
//               {loadingProfiles ? (
//                 <Box display="flex" justifyContent="center" py={4}>
//                   <CircularProgress />
//                 </Box>
//               ) : filteredProfiles.length > 0 ? (
//                 filteredProfiles.map((profile) => (
//                   <ProfileCard
//                     key={profile.id}
//                     profile={profile}
//                     type={profileType}
//                     onClick={handleProfileSelect}
//                     isSelected={selectedProfile?.id === profile.id}
//                     onStartChat={handleStartChat}
//                   />
//                 ))
//               ) : (
//                 <Box textAlign="center" py={4}>
//                   <PeopleIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//                   <Typography color="text.secondary">
//                     No {profileType}s found
//                   </Typography>
//                   <Typography variant="body2" color="text.disabled">
//                     Try adjusting your filters or search
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </Paper>
//         </Grid>

//         {/* Middle Panel - Profile Detail or Chat */}
//         <Grid item md={4} lg={5} sx={{ height: '100%' }}>
//           <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//             {showProfileDetail ? (
//               <ProfileDetailPanel
//                 profile={detailedProfile}
//                 type={profileType}
//                 onClose={handleCloseProfileDetail}
//                 matchAnalysis={matchAnalysis}
//                 onStartChat={handleStartChat}
//               />
//             ) : selectedConversation ? (
//               <>
//                 <ChatHeader
//                   conversation={selectedConversation}
//                   onRefresh={refreshMessages}
//                 />
//                 <ChatMessages
//                   messages={messages}
//                   loading={loadingMessages}
//                   currentUserId={user?.id}
//                   hasMore={false}
//                 />
//                 <MessageInput
//                   onSendMessage={handleSendMessage}
//                   disabled={!selectedConversation}
//                   onAttachFile={handleAttachFile}
//                 />
//               </>
//             ) : (
//               <Box
//                 display="flex"
//                 justifyContent="center"
//                 alignItems="center"
//                 height="100%"
//                 flexDirection="column"
//                 gap={2}
//               >
//                 <Avatar sx={{ width: 80, height: 80, mb: 2 }}>
//                   {profileType === PROFILE_TYPES.BRAND ? (
//                     <BusinessIcon sx={{ fontSize: 40 }} />
//                   ) : (
//                     <PeopleIcon sx={{ fontSize: 40 }} />
//                   )}
//                 </Avatar>
//                 <Typography variant="h6" color="text.secondary">
//                   Select a {profileType} to view details
//                 </Typography>
//                 <Typography variant="body2" color="text.disabled" align="center">
//                   Click on any {profileType} card to see their profile,<br />
//                   compatibility analysis, and start a conversation
//                 </Typography>
//               </Box>
//             )}
//           </Paper>
//         </Grid>

//         {/* Right Panel - Conversations */}
//         <Grid item md={4} lg={4} sx={{ height: '100%' }}>
//           <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//             <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
//               <Typography variant="h6">Conversations</Typography>
//             </Box>
//             <ConversationList
//               conversations={filteredConversations}
//               selectedConversation={selectedConversation}
//               onSelectConversation={setSelectedConversation}
//               loading={loadingConversations}
//               onRefresh={refreshConversations}
//               searchQuery={searchQuery}
//               onSearchChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default ChatContainer;