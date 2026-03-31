import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Badge
} from '@mui/material';
import {
  Chat,
  Search,
  Circle,
  Refresh,
  Message,
  Favorite,
  ArrowBack,
  MoreVert,
  EmojiEmotions,
  AttachFile,
  Close,
  Send as SendIcon
} from '@mui/icons-material';
import { collaborationAPI } from '../../services/api';
import '../../style/InfluencerCollaborations.css';

const InfluencerCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [showFollowDialog, setShowFollowDialog] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [followingUsers, setFollowingUsers] = useState([]);
  
  const [currentUser] = useState({
    id: localStorage.getItem('user_id'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  });

  const fetchCollaborations = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setIsLoading(true);
      setError('');
      const collaborations = await collaborationAPI.getCollaborations(currentUser.id, 'influencer');
      setCollaborations(collaborations || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      setError('Failed to load collaborations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const fetchBrands = useCallback(async () => {
    try {
      setError('');
      const users = await collaborationAPI.getUsers('brand', currentUser.id);
      setBrands(users || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Failed to load brands. Please try again.');
    }
  }, [currentUser.id]);

  const fetchFollowingUsers = useCallback(async () => {
    try {
      // This would be an API call to get users the current user follows
      const users = await collaborationAPI.getFollowingUsers(currentUser.id);
      setFollowingUsers(users || []);
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchCollaborations();
    fetchBrands();
    fetchFollowingUsers();
  }, [fetchCollaborations, fetchBrands, fetchFollowingUsers]);

  const findExistingCollaboration = (brandId) => {
    return collaborations.find(collab => collab.brand_id === brandId);
  };

  const handleStartNewChat = async (brand) => {
    try {
      setCreatingChat(true);
      setError('');
      
      // Create new collaboration
      const newCollab = await collaborationAPI.createCollaboration({
        brand_id: brand.id,
        influencer_id: currentUser.id,
        status: 'active',
        brand_name: brand.username,
        influencer_name: currentUser.username
      });
      
      // Refresh collaborations and select the new one
      await fetchCollaborations();
      setSelectedChat(newCollab);
      setShowNewMessageDialog(false);
      setSelectedBrand(null);
      setSuccess('Conversation started successfully!');
      
    } catch (error) {
      console.error('Error creating collaboration:', error);
      setError(error.response?.data?.detail || 'Failed to start conversation. Please try again.');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleBrandClick = async (brand) => {
    try {
      // Check if collaboration already exists with this brand
      const existingCollaboration = findExistingCollaboration(brand.id);
      
      if (existingCollaboration) {
        // If collaboration exists, select it directly
        setSelectedChat(existingCollaboration);
      } else {
        // If no collaboration exists, start a new one
        await handleStartNewChat(brand);
      }
    } catch (error) {
      console.error('Error handling brand click:', error);
      setError('Failed to open conversation. Please try again.');
    }
  };

  const handleOpenNewMessage = (brand) => {
    setSelectedBrand(brand);
    setShowNewMessageDialog(true);
  };

  const handleCloseNewMessage = () => {
    setShowNewMessageDialog(false);
    setSelectedBrand(null);
    setError('');
  };

  const filteredCollaborations = collaborations.filter(collab =>
    collab.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = brands.filter(brand =>
    brand.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setError('');
    setSuccess('');
    fetchCollaborations();
    fetchBrands();
  };

  const handleCloseAlert = () => {
    setError('');
    setSuccess('');
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      // Send message API call would go here
      setMessageInput('');
      // Refresh messages
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      // API call to follow user
      await collaborationAPI.followUser(currentUser.id, userId);
      fetchFollowingUsers();
    } catch (error) {
      setError('Failed to follow user');
    }
  };

  const handleUnfollowUser = async (userId) => {
    try {
      // API call to unfollow user
      await collaborationAPI.unfollowUser(currentUser.id, userId);
      fetchFollowingUsers();
    } catch (error) {
      setError('Failed to unfollow user');
    }
  };

  // Format brand data for consistent structure
  const formatBrand = (brand) => ({
    id: brand.id || brand._id,
    username: brand.username,
    email: brand.email,
    avatar: brand.avatar
  });

  return (
    <Box className="instagram-collaborations">
      {/* Header */}
      <Box className="instagram-header">
        <Box className="instagram-header-content">
          <Typography variant="h6" className="instagram-logo">
            Chat
          </Typography>
          
          <Box className="instagram-search-container">
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              fullWidth
              className="instagram-search"
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Box>
          
          <Box className="instagram-nav-icons">
            <IconButton onClick={() => setShowFollowDialog(true)} className="instagram-nav-icon">
              <Favorite />
            </IconButton>
            <IconButton onClick={handleRefresh} disabled={isLoading} className="instagram-nav-icon">
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="instagram-main-container">
        {/* Sidebar */}
        <Box className="instagram-sidebar">
          <Box className="instagram-sidebar-header">
            <Typography className="instagram-sidebar-title">
              Messages
            </Typography>
            <Button 
              className="instagram-new-message-btn"
              onClick={() => setShowNewMessageDialog(true)}
            >
              New Message
            </Button>
          </Box>
          
          <Box className="instagram-search-chats">
            <TextField
              placeholder="Search messages"
              variant="outlined"
              size="small"
              fullWidth
              className="instagram-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Box>
          
          {/* Chats List */}
          <Box className="instagram-chats-list">
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {filteredCollaborations.map((collab) => (
                  <Box 
                    key={collab.id}
                    className={`instagram-chat-item ${selectedChat?.id === collab.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(collab)}
                  >
                    <Avatar 
                      className="instagram-chat-avatar"
                      src={collab.brand_avatar}
                    >
                      {collab.brand_name?.charAt(0)?.toUpperCase() || 'B'}
                    </Avatar>
                    
                    <Box className="instagram-chat-info">
                      <Box className="instagram-chat-name">
                        {collab.brand_name || 'Unknown Brand'}
                        {collab.status === 'active' && (
                          <Circle sx={{ fontSize: 8, color: 'success.main' }} />
                        )}
                      </Box>
                      
                      {collab.last_message && (
                        <Typography className="instagram-chat-preview">
                          {collab.last_message.content.length > 50 
                            ? `${collab.last_message.content.substring(0, 50)}...` 
                            : collab.last_message.content}
                        </Typography>
                      )}
                      
                      <Typography className="instagram-chat-time">
                        {collab.last_message_time}
                      </Typography>
                    </Box>
                    
                    {collab.unread_count > 0 && (
                      <Badge badgeContent={collab.unread_count} color="primary" className="instagram-chat-unread" />
                    )}
                  </Box>
                ))}
                
                {!isLoading && filteredCollaborations.length === 0 && (
                  <Box className="instagram-no-collaborations">
                    <Typography className="instagram-no-collaborations-title">
                      No Active Collaborations
                    </Typography>
                    
                    <Box className="instagram-users-list">
                      {brands.map((brand) => {
                        const formattedBrand = formatBrand(brand);
                        const isFollowing = followingUsers.some(user => user.id === formattedBrand.id);
                        
                        return (
                          <Box key={formattedBrand.id} className="instagram-user-item">
                            <Avatar 
                              className="instagram-user-avatar"
                              src={formattedBrand.avatar}
                            >
                              {formattedBrand.username?.charAt(0)?.toUpperCase() || 'B'}
                            </Avatar>
                            
                            <Box className="instagram-user-info">
                              <Typography className="instagram-user-name">
                                {formattedBrand.username || 'Unknown Brand'}
                              </Typography>
                              <Typography className="instagram-user-username">
                                {formattedBrand.email || 'No email provided'}
                              </Typography>
                            </Box>
                            
                            <Box className="instagram-user-actions">
                              <Button 
                                className={`instagram-follow-btn ${isFollowing ? 'following' : ''}`}
                                onClick={() => isFollowing 
                                  ? handleUnfollowUser(formattedBrand.id) 
                                  : handleFollowUser(formattedBrand.id)
                                }
                                size="small"
                              >
                                {isFollowing ? 'Following' : 'Follow'}
                              </Button>
                              
                              <IconButton 
                                className="instagram-message-user-btn"
                                onClick={() => handleBrandClick(formattedBrand)}
                                size="small"
                              >
                                <Message />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
        
        {/* Chat Content */}
        {selectedChat ? (
          <Box className="instagram-chat-content">
            <Box className="instagram-chat-header">
              <Box className="instagram-chat-user">
                <IconButton onClick={() => setSelectedChat(null)} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Avatar 
                  className="instagram-chat-user-avatar"
                  src={selectedChat.brand_avatar}
                >
                  {selectedChat.brand_name?.charAt(0)?.toUpperCase() || 'B'}
                </Avatar>
                <Typography className="instagram-chat-user-name">
                  {selectedChat.brand_name}
                </Typography>
              </Box>
              
              <Box className="instagram-chat-actions">
                <Button 
                  className={`instagram-follow-btn ${selectedChat.is_following ? 'following' : ''}`}
                  onClick={() => selectedChat.is_following 
                    ? handleUnfollowUser(selectedChat.brand_id) 
                    : handleFollowUser(selectedChat.brand_id)
                  }
                >
                  {selectedChat.is_following ? 'Following' : 'Follow'}
                </Button>
                <IconButton className="instagram-chat-action-btn">
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
            
            <Box className="instagram-chat-messages">
              {/* Messages would be rendered here */}
              <Box className="instagram-message received">
                <Box className="instagram-message-bubble">
                  Hello! I'm interested in collaborating with you.
                </Box>
                <Typography className="instagram-message-time">
                  10:30 AM
                </Typography>
              </Box>
              
              <Box className="instagram-message sent">
                <Box className="instagram-message-bubble">
                  That sounds great! Tell me more about your brand.
                </Box>
                <Typography className="instagram-message-time">
                  10:32 AM
                </Typography>
              </Box>
            </Box>
            
            <Box className="instagram-chat-input">
              <Box className="instagram-message-form">
                <IconButton>
                  <EmojiEmotions />
                </IconButton>
                <IconButton>
                  <AttachFile />
                </IconButton>
                <TextField
                  placeholder="Message..."
                  multiline
                  maxRows={3}
                  fullWidth
                  className="instagram-message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <IconButton 
                  className="instagram-send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box className="instagram-empty-chat">
            <Chat className="instagram-empty-chat-icon" />
            <Typography className="instagram-empty-chat-text">
              Your Messages
            </Typography>
            <Typography className="instagram-empty-chat-subtext">
              Send private messages to brands you'd like to collaborate with.
            </Typography>
            <Button 
              variant="contained"
              className="instagram-follow-btn"
              onClick={() => setShowNewMessageDialog(true)}
            >
              Send Message
            </Button>
          </Box>
        )}
      </Box>

      {/* Following Users Dialog */}
      <Box className={`instagram-follow-dialog ${showFollowDialog ? 'open' : ''}`}>
        <Box className="instagram-follow-header">
          <Typography className="instagram-follow-title">
            Following
          </Typography>
          <IconButton 
            className="instagram-follow-close"
            onClick={() => setShowFollowDialog(false)}
          >
            <Close />
          </IconButton>
        </Box>
        
        <Box className="instagram-follow-list">
          {followingUsers.map(user => (
            <Box key={user.id} className="instagram-follow-item">
              <Avatar 
                className="instagram-follow-avatar"
                src={user.avatar}
              >
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              
              <Box className="instagram-follow-info">
                <Typography className="instagram-follow-name">
                  {user.username}
                </Typography>
                <Typography className="instagram-follow-username">
                  {user.full_name || user.email}
                </Typography>
              </Box>
              
              <Box className="instagram-follow-action">
                <Button 
                  className={`instagram-follow-btn ${user.is_following ? 'following' : ''}`}
                  onClick={() => user.is_following 
                    ? handleUnfollowUser(user.id) 
                    : handleFollowUser(user.id)
                  }
                >
                  {user.is_following ? 'Following' : 'Follow'}
                </Button>
              </Box>
            </Box>
          ))}
          
          {followingUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                You're not following anyone yet
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Message Dialog */}
      <Dialog 
        open={showNewMessageDialog} 
        onClose={handleCloseNewMessage}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #dbdbdb' }}>
          New Message
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <TextField
            placeholder="Search brands..."
            fullWidth
            sx={{ mb: 2 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredBrands.map((brand) => {
              const formattedBrand = formatBrand(brand);
              return (
                <Box 
                  key={formattedBrand.id}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1.5, 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                  onClick={() => handleBrandClick(formattedBrand)}
                >
                  <Avatar 
                    src={formattedBrand.avatar} 
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {formattedBrand.username?.charAt(0)?.toUpperCase() || 'B'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {formattedBrand.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formattedBrand.email}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #dbdbdb' }}>
          <Button onClick={handleCloseNewMessage} disabled={creatingChat}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleStartNewChat(selectedBrand)} 
            variant="contained"
            disabled={!selectedBrand || creatingChat}
            startIcon={creatingChat ? <CircularProgress size={16} /> : null}
          >
            {creatingChat ? 'Starting...' : 'Start Conversation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error and Success Alerts */}
      {error && (
        <Alert 
          severity="error" 
          onClose={handleCloseAlert} 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            minWidth: 300,
            borderRadius: '8px'
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          onClose={handleCloseAlert} 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            minWidth: 300,
            borderRadius: '8px'
          }}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default InfluencerCollaborations;