// src/components/BrandInfluencerMessenger.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
  ArrowBack as ArrowBackIcon,
 Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as DoubleCheckIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Videocam as VideocamIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  VolumeUp as VolumeUpIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';






const BrandInfluencerMessenger = () => {
  const theme = useTheme();
   const { user } = useAuth();
  const userRole = user?.role; // 'brand' | 'influencer'
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
 const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  
  // State Management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    search: false
  });
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedForMenu, setSelectedForMenu] = useState(null);
  const [typingAnimation, setTypingAnimation] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [page, setPage] = useState(1);
const messagesContainerRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
const [currentPreview, setCurrentPreview] = useState(null);
const [previewType, setPreviewType] = useState('image'); // 'image', 'file', 'video'

const [groups, setGroups] = useState([]);
const [selectedGroup, setSelectedGroup] = useState(null);
const [groupMessages, setGroupMessages] = useState([]);
const [showNewGroup, setShowNewGroup] = useState(false);
const [activeTab, setActiveTab] = useState('direct'); // 'direct' or 'groups'
const [groupPage, setGroupPage] = useState(1);
const [hasMoreGroupMessages, setHasMoreGroupMessages] = useState(true);
const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const shouldAutoScrollRef = useRef(true);

  const handleViewProfile = (participant) => {
  if (!participant?.id || !participant?.role) return;

  // viewer role = logged-in user role
  // profile role = other participant role
  navigate(`/${userRole}/profile/view/${participant.role}/${participant.id}`);
};
// const participant = selectedConversation?.other_participant || null;

const headerData =
  activeTab === 'groups'
    ? selectedGroup
    : selectedConversation?.other_participant;



  // ==================== WEBSOCKET SETUP ====================
  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to messaging server');
    });

    newSocket.on('new_message', (data) => {
      handleIncomingMessage(data);
    });

    newSocket.on('message_updated', (data) => {
      handleMessageUpdated(data);
    });

    newSocket.on('message_deleted', (data) => {
      handleMessageDeleted(data);
    });

    newSocket.on('typing', (data) => {
      handleTypingIndicator(data);
    });

    newSocket.on('user_online', (data) => {
      showNotification(`${data.username} is now online`, 'info');
      updateUserOnlineStatus(data.userId, true);
    });

    newSocket.on('user_offline', (data) => {
      showNotification(`${data.username} is now offline`, 'info');
      updateUserOnlineStatus(data.userId, false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      showNotification('Connection error. Please refresh.', 'error');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const sortByTime = (arr) =>
  [...arr].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );


  // ==================== DATA LOADING ====================
  useEffect(() => {
    if (user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [user]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  useEffect(() => {
  if (!shouldAutoScrollRef.current) return;
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);


  useEffect(() => {
    if (showNewChat) {
      loadUsers();
    } else {
      setSearchQuery('');
      setSelectedUsers([]);
    }
  }, [showNewChat]);


 useEffect(() => {
  if (!socket) return;

  socket.on("receive_message", (raw) => {
    // normalize message object safely
    const msg = raw?.message || raw;

    if (!msg) return;

    const safe = {
      id: msg.id || msg._id || `sock_${Date.now()}`,
      content: msg.content ?? msg.text ?? '',
      sender_id: msg.sender_id || msg.sender?.id,
      sender: msg.sender || {},
      receiver_id: msg.receiver_id,
      conversation_id: msg.conversation_id,
      created_at: msg.created_at || new Date().toISOString(),
      message_type: msg.message_type || 'text',
    };

    // Append to active chat if open
    setMessages(prev => [...prev, safe]);
    shouldAutoScrollRef.current = true;


    // If message belongs to other chat increase unread
    setConversations(prev =>
      prev.map(c =>
        c.id === safe.conversation_id
          ? { ...c, unread_count: (c.unread_count || 0) + 1 }
          : c
      )
    );
  });

  return () => socket.off("receive_message");
}, [socket]);


// Add this useEffect to clean up timeouts
useEffect(() => {
  return () => {
    // Clear all timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Clear socket timeouts
    if (typingTimeoutRef.current) {
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    }
  };
}, []);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

// Add to WebSocket setup
useEffect(() => {
  if (!socket) return;

  // Handle group messages
  socket.on('new_group_message', (data) => {
    if (selectedGroup && selectedGroup.id === data.group_id) {
      setGroupMessages(prev => [...prev, data.message]);
    } else {
      // Update groups list
      setGroups(prev => prev.map(g => {
        if (g.id === data.group_id) {
          return {
            ...g,
            last_message: {
              content: data.message.content?.substring(0, 100),
              timestamp: data.message.created_at,
              sender_id: data.message.sender_id
            },
            unread_count: (g.unread_count || 0) + 1,
            updated_at: data.message.created_at
          };
        }
        return g;
      }));
      
      // Show notification
      const groupName = groups.find(g => g.id === data.group_id)?.name || 'Group';
      showNotification(`New message in ${groupName}`, 'info');
    }
  });

  // Add other group-related socket events...

  return () => {
    socket.off('new_group_message');
  };
}, [socket, selectedGroup, groups]);

  // ==================== API FUNCTIONS ====================
  const api = {
    get: async (endpoint, params = {}) => {
      try {
        const queryString = Object.keys(params).length > 0 
          ? `?${new URLSearchParams(params)}` 
          : '';
        const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`GET ${endpoint} response:`, data);
        return data;
      } catch (error) {
        console.error(`API GET error for ${endpoint}:`, error);
        throw error;
      }
    },
    
    post: async (endpoint, data) => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`POST ${endpoint} response:`, responseData);
        return responseData;
      } catch (error) {
        console.error(`API POST error for ${endpoint}:`, error);
        throw error;
      }
    },
    
    put: async (endpoint, data) => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`PUT ${endpoint} response:`, responseData);
        return responseData;
      } catch (error) {
        console.error(`API PUT error for ${endpoint}:`, error);
        throw error;
      }
    },
    
    delete: async (endpoint) => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log(`DELETE ${endpoint} response:`, responseData);
        return responseData;
      } catch (error) {
        console.error(`API DELETE error for ${endpoint}:`, error);
        throw error;
      }
    }
  };


  // Update get user display info function
const getProfileDisplayName = (user) => {
  if (!user) return 'Unknown User';
  
  // Use profile name if available
  if (user.display_name) return user.display_name;
  if (user.name) return user.name;
  if (user.username) return user.username;
  if (user.company_name) return user.company_name;
  
  return 'Unknown User';
};

const getProfileImage = (user) => {
  if (!user) return null;
  
  // Use profile picture if available
  if (user.profile_picture) {
    // Convert file ID to URL if needed
    if (user.profile_picture.startsWith('68')) {
      return `${API_URL}/profiles/image/${user.profile_picture}`;
    }
    return user.profile_picture;
  }
  
  if (user.logo) {
    if (user.logo.startsWith('68')) {
      return `${API_URL}/profiles/image/${user.logo}`;
    }
    return user.logo;
  }
  
  return null;
};

const getProfileDetails = (user) => {
  if (!user) return {};
  
  if (user.role === 'brand') {
    return {
      company_name: user.company_name,
      contact_person: user.contact_person,
      industry: user.industry,
      categories: user.categories || [],
      location: user.location
    };
  } else if (user.role === 'influencer') {
    return {
      full_name: user.full_name,
      nickname: user.nickname,
      niche: user.niche,
      categories: user.categories || [],
      location: user.location
    };
  }
  
  return {};
};

  // ==================== DATA LOADING FUNCTIONS ====================
  // Update loadConversations function to fetch profile data for each conversation
const loadConversations = async () => {
  try {
    setLoading(prev => ({ ...prev, conversations: true }));
    setError('');
    
    console.log('Loading conversations...');
    const response = await api.get('/messages/conversations');
    
    console.log('Conversations response:', response);
    
    let conversationsData = [];
    if (response && (response.conversations || response.data)) {
      conversationsData = response.conversations || response.data?.conversations || [];
    } else if (response && Array.isArray(response)) {
      conversationsData = response;
    }
    
    // Fetch profile data for each conversation's other participant
    const conversationsWithProfiles = await Promise.all(
      conversationsData.map(async (conv) => {
        if (!conv.other_participant?.id) return conv;
        
        // Check if we already have the profile cached
        if (userProfiles[conv.other_participant.id]) {
          return {
            ...conv,
            other_participant: {
              ...conv.other_participant,
              ...userProfiles[conv.other_participant.id]
            }
          };
        }
        
        // Fetch profile details
        try {
          const userDetails = await getUserDetails(conv.other_participant.id);
          if (userDetails) {
            // Update cache
            setUserProfiles(prev => ({
              ...prev,
              [conv.other_participant.id]: userDetails.profile
            }));
            
            return {
              ...conv,
              other_participant: {
                ...conv.other_participant,
                ...userDetails.profile
              }
            };
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
        
        return conv;
      })
    );
    
    console.log('Setting conversations with profiles:', conversationsWithProfiles);
    setConversations(conversationsWithProfiles);
    
  } catch (err) {
    console.error('Error loading conversations:', err);
    setError('Failed to load conversations. Please try again.');
    setConversations([]);
  } finally {
    setLoading(prev => ({ ...prev, conversations: false }));
  }
};

 const loadMessages = async (conversationId, loadMore = false) => {
  try {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(prev => ({ ...prev, messages: true }));
      setPage(1);
    }
    
    setError('');
    
    console.log(`Loading messages for conversation ${conversationId}, page ${page}...`);
    const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
      page: loadMore ? page + 1 : 1,
      limit: 20
    });
    
    console.log('Messages response:', response);
    
    if (!response) {
      console.warn('Empty response from server');
      setMessages([]);
      return;
    }
    
    // Handle different response structures
    let messagesData = [];
    let pagination = {};
    
    if (Array.isArray(response)) {
      messagesData = response;
    } else if (response.messages && Array.isArray(response.messages)) {
      messagesData = response.messages;
      pagination = response.pagination || {};
    } else if (response.data?.messages && Array.isArray(response.data.messages)) {
      messagesData = response.data.messages;
      pagination = response.data.pagination || {};
    } else if (response.data && Array.isArray(response.data)) {
      messagesData = response.data;
    }
    
    // Filter out any null/undefined messages
    const filteredMessages = messagesData.filter(msg => msg != null);
    
    // Ensure each message has required fields
    const safeMessages = filteredMessages.map((msg, index) => ({
      id: msg.id || msg._id || `msg_${conversationId}_${index}_${Date.now()}`,
      content: msg.content || msg.text || msg.body || '',
      sender: msg.sender || { 
        id: msg.sender_id,
        username: 'Unknown User'
      },
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
      message_type: msg.message_type || 'text',
      attachment_url: msg.attachment_url || null,
      is_read: msg.is_read || false,
      is_delivered: msg.is_delivered || false
    }));
    
    if (loadMore) {
      setMessages(prev =>
  sortByTime([...safeMessages, ...prev])
);
shouldAutoScrollRef.current = true;

      setPage(prev => prev + 1);
      setHasMoreMessages(pagination.has_more || safeMessages.length > 0);
    } else {
      setMessages(sortByTime(safeMessages));
      setPage(1);
      setHasMoreMessages(pagination.has_more || false);
    }
    
    // Mark conversation as read
    if (!loadMore) {
      await markConversationAsRead(conversationId);
    }
  } catch (err) {
    console.error('Error loading messages:', err);
    setError('Failed to load messages. Please try again.');
  } finally {
    if (loadMore) {
      setIsLoadingMore(false);
    } else {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }
};

// Add scroll event handler for infinite scroll
useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMessages(selectedConversation.id, true);
    }
  };

  container.addEventListener('scroll', handleScroll);
  return () => container.removeEventListener('scroll', handleScroll);
}, [selectedConversation, hasMoreMessages, isLoadingMore]);
  

 // Add to API functions
const loadGroups = async () => {
  try {
    setIsLoadingGroups(true);
    const response = await api.get('/messages/groups');
    
    let groupsData = [];
    if (response && (response.groups || response.data)) {
      groupsData = response.groups || response.data?.groups || [];
    } else if (response && Array.isArray(response)) {
      groupsData = response;
    }
    
    setGroups(groupsData);
  } catch (err) {
    console.error('Error loading groups:', err);
    setGroups([]);
  } finally {
    setIsLoadingGroups(false);
  }
};

useEffect(() => {
  if (user && activeTab === 'groups') {
    loadGroups();
  }
}, [user, activeTab]);

const createGroup = async (groupData) => {
  try {
    const response = await api.post('/messages/groups/create', groupData);
    
    if (response && (response.data || response.group)) {
      const newGroup = response.data || response.group;
      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      setActiveTab('groups');
      setShowNewGroup(false);
      showNotification('Group created successfully', 'success');
      return newGroup;
    }
  } catch (err) {
    console.error('Error creating group:', err);
    showNotification('Failed to create group', 'error');
    throw err;
  }
};

const sendGroupMessage = async (groupId, content, attachment = null) => {
  try {
    const messageData = {
      group_id: groupId,
      content: content,
      message_type: attachment ? 'file' : 'text',
      ...(attachment && { attachment_url: attachment.url })
    };

    const response = await api.post(`/messages/groups/${groupId}/message`, messageData);
    
    if (response && (response.data || response.message)) {
      const newMessage = response.data || response.message;
      
      // Update group messages
      setGroupMessages(prev => [...prev, {
        ...newMessage,
        id: newMessage.id || `group_${Date.now()}`,
        group_id: groupId
      }]);
      
      // Update group in list
      setGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            last_message: {
              content: content.substring(0, 100),
              timestamp: new Date().toISOString(),
              sender_id: user.id
            },
            updated_at: new Date().toISOString(),
            message_count: (g.message_count || 0) + 1
          };
        }
        return g;
      }));
      
      // Move to top
      setGroups(prev => {
        const groupIndex = prev.findIndex(g => g.id === groupId);
        if (groupIndex > 0) {
          const [group] = prev.splice(groupIndex, 1);
          return [group, ...prev];
        }
        return prev;
      });
      
      // Emit socket event for group message
      if (socket) {
        socket.emit('group_message', {
          group_id: groupId,
          sender_id: user.id,
          content: content,
          message_type: attachment ? 'file' : 'text',
          attachment_url: attachment?.url || null
        });
      }
      
      showNotification('Group message sent', 'success');
      return newMessage;
    }
  } catch (err) {
    console.error('Error sending group message:', err);
    showNotification('Failed to send group message', 'error');
    throw err;
  }
};

const loadGroupMessages = async (groupId, loadMore = false) => {
  try {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(prev => ({ ...prev, messages: true }));
    }
    
    const response = await api.get(`/messages/groups/${groupId}/messages`, {
      page: loadMore ? groupPage + 1 : 1,
      limit: 20
    });
    
    let messagesData = [];
    if (response && response.data?.messages) {
      messagesData = response.data.messages;
    } else if (response && Array.isArray(response)) {
      messagesData = response;
    }
    
    if (loadMore) {
      setGroupMessages(prev => [...messagesData, ...prev]);
      setGroupPage(prev => prev + 1);
    } else {
      setGroupMessages(messagesData);
      setGroupPage(1);
    }
    
    setHasMoreGroupMessages(messagesData.length > 0);
  } catch (err) {
    console.error('Error loading group messages:', err);
    showNotification('Failed to load group messages', 'error');
  } finally {
    if (loadMore) {
      setIsLoadingMore(false);
    } else {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }
};


  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      console.log('Unread count response:', response);
      
      if (response && (response.total_unread_messages !== undefined || response.data)) {
        const count = response.total_unread_messages || response.data?.total_unread_messages || 0;
        console.log('Setting unread count:', count);
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
      setUnreadCount(0);
    }
  };

// Add to your API functions
const getUserDetails = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/messages/user/${userId}/details`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
};

// Add state for storing user profile data
const [userProfiles, setUserProfiles] = useState({});
  

  const loadUsers = async () => {
    try {
      const targetRole = userRole === 'brand' ? 'influencer' : 'brand';
      console.log(`Loading ${targetRole} users...`);
      
      const response = await api.get('/auth/users', { role: targetRole });
      console.log('Users response:', response);
      
      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data?.users || [];
        console.log('Setting users:', usersData);
        setUsers(usersData);
      } else if (response && Array.isArray(response)) {
        console.log('Setting users (array response):', response);
        setUsers(response);
      } else {
        console.warn('No users found in response:', response);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  };

  // ==================== MESSAGE HANDLING ====================
  const handleIncomingMessage = useCallback((data) => {
  console.log('New message received:', data);
  
  // Add safety checks
  if (!data) return;
  
  const message = data.message || data;
  const conversationId = data.conversation_id || message?.conversation_id;
  
  if (!message || !conversationId) {
    console.error('Invalid message data:', data);
    return;
  }
  
  if (selectedConversation && selectedConversation.id === conversationId) {
    // Add message to current chat with safety checks
    const safeMessage = {
      id: message.id || `temp_${Date.now()}`,
      content: message.content || '',
      sender: message.sender || { id: message.sender_id },
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      conversation_id: conversationId,
      created_at: message.created_at || new Date().toISOString(),
      message_type: message.message_type || 'text',
      attachment_url: message.attachment_url || null
    };
    
    setMessages(prev => [...prev, safeMessage]);
    updateConversationList(data, false);
    shouldAutoScrollRef.current = true;

  } else {
    // Update conversation list and show notification
    updateConversationList(data, true);
    setUnreadCount(prev => prev + 1);
    
    const senderName = message.sender?.username || 'User';
    showNotification(`New message from ${senderName}`, 'info');
  }
}, [selectedConversation]);

  const handleMessageUpdated = (data) => {
    console.log('Message updated:', data);
    
    if (selectedConversation && selectedConversation.id === data.conversation_id) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message.id ? { ...msg, ...data.message } : msg
      ));
    }
  };

  const handleMessageDeleted = (data) => {
    console.log('Message deleted:', data);
    
    if (selectedConversation && selectedConversation.id === data.conversation_id) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message_id ? { ...msg, content: '[Message deleted]', is_deleted: true } : msg
      ));
    }
  };

  const handleTypingIndicator = (data) => {
  if (selectedConversation && selectedConversation.id === data.conversation_id) {
    setTypingUsers(prev => ({
      ...prev,
      [data.user_id]: {
        username: data.username,
        timestamp: Date.now(),
        isTyping: data.is_typing
      }
    }));
    setTypingAnimation(true);

    // Clear timeout
    if (typingTimeoutRef.current[data.user_id]) {
      clearTimeout(typingTimeoutRef.current[data.user_id]);
    }

    // Set new timeout
    typingTimeoutRef.current[data.user_id] = setTimeout(() => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[data.user_id];
        return newTyping;
      });
      setTypingAnimation(false);
    }, 3000);
  }
};
const TypingIndicator = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      mt: 1, 
      ml: 1,
      animation: typingAnimation ? 'fadeIn 0.3s ease' : 'none'
    }}>
      <Avatar sx={{ 
        width: 24, 
        height: 24, 
        bgcolor: 'primary.light',
        animation: 'pulse 1.5s infinite'
      }}>
        {users[0]?.charAt(0) || 'T'}
      </Avatar>
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: 2,
        p: 1.5,
        maxWidth: 200,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Box sx={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            backgroundColor: 'grey.500',
            animation: 'bounce 1.4s infinite'
          }} />
          <Box sx={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            backgroundColor: 'grey.500',
            animation: 'bounce 1.4s infinite 0.2s'
          }} />
          <Box sx={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            backgroundColor: 'grey.500',
            animation: 'bounce 1.4s infinite 0.4s'
          }} />
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            {users.length === 1 ? `${users[0]} is typing` : `${users.length} people typing`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};


const renderGroupItem = (group) => {
  if (!group) return null;
  
  const isSelected = selectedGroup?.id === group.id;
  const lastMessageTime = group.last_message?.timestamp 
    ? formatDistanceToNow(new Date(group.last_message.timestamp), { addSuffix: true })
    : 'No messages';
  const lastMessagePreview = group.last_message?.content || 'Start a conversation...';
  const isSender = group.last_message?.sender_id === user.id;

  return (
    <ListItem
      key={group.id}
      button
      selected={isSelected}
      onClick={() => {
        setSelectedGroup(group);
        setSelectedConversation(null); // Clear direct conversation selection
        shouldAutoScrollRef.current = true;
        setShowInfo(false);
        loadGroupMessages(group.id);
      }}
      sx={{
        borderLeft: isSelected ? '4px solid' : 'none',
        borderLeftColor: 'primary.main',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
    >
      <ListItemAvatar>
        <Badge
          color="primary"
          variant="dot"
          invisible={!group.unread_count || group.unread_count === 0}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar
            src={group.avatar_url}
            sx={{ 
              bgcolor: 'secondary.main',
              width: 40,
              height: 40
            }}
          >
            {group.name?.charAt(0)?.toUpperCase() || 'G'}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
              {group.name}
            </Typography>
            {group.is_public && (
              <Chip
                label="Public"
                size="small"
                variant="outlined"
                color="success"
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color={group.unread_count > 0 ? 'primary' : 'text.secondary'}
              noWrap
              sx={{ fontWeight: group.unread_count > 0 ? 'bold' : 'normal' }}
            >
              {isSender && group.last_message && 'You: '}
              {lastMessagePreview}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.participant_count} members • {lastMessageTime}
              {group.unread_count > 0 && (
                <Box component="span" sx={{ ml: 1 }}>
                  • {group.unread_count} unread
                </Box>
              )}
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchorEl(e.currentTarget);
            setSelectedForMenu(group);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

  const updateConversationList = (data, isNewNotification) => {
  // Add safety check
  if (!data || !data.message) {
    console.error('Invalid data in updateConversationList:', data);
    return;
  }
  
  const message = data.message;
  const conversationId = data.conversation_id;
  
  if (!conversationId) {
    console.error('No conversation ID in updateConversationList:', data);
    return;
  }

  setConversations(prev => {
    const existingConv = prev.find(c => c.id === conversationId);
    
    if (existingConv) {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          const newConv = {
            ...conv,
            last_message: {
              content: (message.content || '').substring(0, 100),
              timestamp: message.created_at || new Date().toISOString(),
              sender_id: message.sender?.id || user?.id || message.sender_id
            },
            updated_at: message.created_at || new Date().toISOString(),
            unread_count: conv.id === selectedConversation?.id ? 0 : conv.unread_count + (isNewNotification ? 1 : 0),
            has_unread: conv.id !== selectedConversation?.id
          };
          return newConv;
        }
        return conv;
      });
      
      // Move conversation to top
      const convIndex = updated.findIndex(c => c.id === conversationId);
      if (convIndex > 0) {
        const [conv] = updated.splice(convIndex, 1);
        updated.unshift(conv);
      }
      
      return updated;
    } else {
      // New conversation - ensure we have required data
      const senderUsername = message.sender?.username || 'Unknown User';
      const senderId = message.sender?.id || message.sender_id;
      
      if (!senderId) {
        console.error('Missing sender ID for new conversation:', data);
        return prev; // Don't add invalid conversation
      }
      
      const newConv = {
        id: conversationId,
        title: senderUsername,
        other_participant: message.sender || {
          id: senderId,
          username: senderUsername,
          role: userRole === 'brand' ? 'influencer' : 'brand'
        },
        last_message: {
          content: (message.content || '').substring(0, 100),
          timestamp: message.created_at || new Date().toISOString(),
          sender_id: senderId
        },
        updated_at: message.created_at || new Date().toISOString(),
        unread_count: 1,
        message_count: 1,
        type: 'direct',
        has_unread: true
      };
      return [newConv, ...prev];
    }
  });
};

  const updateUserOnlineStatus = (userId, isOnline) => {
    setConversations(prev => prev.map(conv => 
      conv.other_participant?.id === userId 
        ? { 
            ...conv, 
            other_participant: { 
              ...conv.other_participant, 
              is_online: isOnline 
            } 
          }
        : conv
    ));
  };

  // Update message status logic
const getMessageStatus = (message) => {
  if (message.is_sending) {
    return { icon: <ScheduleIcon fontSize="small" color="disabled" />, text: 'Sending' };
  }
  if (message.is_deleted) {
    return { icon: <ErrorIcon fontSize="small" color="error" />, text: 'Failed' };
  }
  if (message.is_read) {
    return { icon: <DoubleCheckIcon fontSize="small" color="primary" />, text: 'Read' };
  }
  if (message.is_delivered) {
    return { icon: <DoubleCheckIcon fontSize="small" color="action" />, text: 'Delivered' };
  }
  if (message.is_sent) {
    return { icon: <CheckCircleIcon fontSize="small" color="action" />, text: 'Sent' };
  }
  return { icon: <CheckIcon fontSize="small" color="disabled" />, text: 'Pending' };
};

  // ==================== MESSAGE ACTIONS ====================
const sendMessage = async () => {
  // keep trimmed text safe BEFORE clearing state
  const text = newMessage.trim();

  // 1) block if no text and no attachment
  if (!text && !attachment) {
    showNotification('Please enter a message or attach a file', 'warning');
    return;
  }

  try {
    if (!selectedConversation || !selectedConversation.other_participant?.id) {
      showNotification('Please select a conversation first', 'error');
      return;
    }

    const isNewConversation =
      !selectedConversation.id ||
      selectedConversation.id.startsWith('new_');

    // Determine message type based on attachment
    let messageType = 'text';
    let attachmentType = null;
    
    if (attachment) {
      if (attachment.type.startsWith('image/')) {
        messageType = 'image';
        attachmentType = 'image';
      } else if (attachment.type.startsWith('video/')) {
        messageType = 'video';
        attachmentType = 'video';
      } else if (attachment.type.startsWith('audio/')) {
        messageType = 'audio';
        attachmentType = 'audio';
      } else {
        messageType = 'file';
        attachmentType = 'file';
      }
    }

    // 2) build payload safely
    const messageData = {
      receiver_id: selectedConversation.other_participant.id,
      content: text,
      message_type: messageType,
      conversation_id: isNewConversation ? null : selectedConversation.id,
      ...(attachment && { 
        attachment_url: attachment.url,
        attachment_type: attachmentType,
        attachment_name: attachment.name,
        attachment_size: attachment.size
      })
    };

    console.log('Sending message with data:', messageData);

    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      content: text,
      message_type: messageType,
      sender: user,
      receiver_id: selectedConversation.other_participant.id,
      conversation_id: selectedConversation.id,
      created_at: new Date().toISOString(),
      status: 'sending',
      ...(attachment && {
        attachment_url: attachment.url,
        metadata: {
          attachment_type: attachmentType,
          attachment_name: attachment.name,
          attachment_size: attachment.size
        }
      })
    };

    // 3) call API
    const response = await api.post('/messages/send', messageData);
    console.log('Send message response:', response);

    if (!response) {
      throw new Error('No response from server');
    }

    // Handle error response
    if (response.detail) {
      throw new Error(response.detail);
    }

    // 4) handle new conversation id
    if (isNewConversation && (response.conversation_id || response.data?.conversation_id)) {
      const newConvId = response.conversation_id || response.data.conversation_id;
      const updatedConversation = {
        ...selectedConversation,
        id: newConvId
      };
      setSelectedConversation(updatedConversation);
      
      // Update conversation in list
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id ? updatedConversation : conv
      ));
    }

    // 5) normalize message response
    const normalizeMessage = (msg) => ({
      id: msg.id || msg._id || `msg_${Date.now()}`,
      content: msg.content || msg.text || '',
      sender: msg.sender || { 
        id: msg.sender_id || user.id,
        username: user.username,
        profile_picture: user.profile_picture
      },
      sender_id: msg.sender_id || user.id,
      receiver_id: msg.receiver_id || selectedConversation.other_participant.id,
      conversation_id: msg.conversation_id || selectedConversation.id,
      created_at: msg.created_at || new Date().toISOString(),
      message_type: msg.message_type || 'text',
      attachment_url: msg.attachment_url || null,
      metadata: msg.metadata || {},
      is_read: false,
      is_delivered: true,
      is_edited: false
    });

    // Remove optimistic message and add the real one
    setMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
      const responseMessage = response.data || response.message || response;
      return [...filtered, normalizeMessage(responseMessage)];
    });

    // 6) SOCKET EMIT
    if (socket) {
      socket.emit('send_message', {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        receiver_id: selectedConversation.other_participant.id,
        content: text,
        message_type: messageType,
        attachment_url: attachment?.url || null,
        metadata: attachment ? {
          attachment_type: attachmentType,
          attachment_name: attachment.name,
          attachment_size: attachment.size
        } : null
      });
    }

    // 7) clear input AFTER everything succeeds
    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
    setIsTyping(false);

    // 8) update conversation preview text
    const previewContent = attachment 
      ? `[${attachmentType === 'image' ? 'Image' : attachmentType === 'video' ? 'Video' : 'File'}]`
      : text;
    updateConversationAfterSend(previewContent);

    showNotification('Message sent successfully', 'success');

  } catch (err) {
    console.error('Error sending message:', err);
    
    // Remove optimistic message if it failed
    setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
    
    const errorMessage = err.message || 'Failed to send message. Please try again.';
    showNotification(errorMessage, 'error');
  }
};



      // Add new group dialog component
// Add new group dialog component
const NewGroupDialog = ({ open, onClose, user, api }) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load all users when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open]);

  const loadAvailableUsers = async () => {
    const targetRole = userRole === 'brand' ? 'influencer' : 'brand';
    try {
      setIsLoadingUsers(true);
      // Load ALL users (both brands and influencers)
      const response = await api.get('/auth/users', { role: targetRole });
      
      if (response && (response.users || response.data)) {
        const usersData = response.users || response.data?.users || [];
        
        // Filter out current user and already selected users
        const filteredUsers = usersData.filter(u => 
          u.id !== user.id && 
          !selectedUsers.some(su => su.id === u.id)
        );
        
        // Enhance users with profile data
        const enhancedUsers = await Promise.all(
          filteredUsers.map(async (userData) => {
            try {
              const userDetails = await getUserDetails(userData.id);
              if (userDetails) {
                return {
                  ...userData,
                  ...userDetails.profile,
                  display_name: getProfileDisplayName(userDetails.profile)
                };
              }
            } catch (err) {
              console.error('Error fetching user details:', err);
            }
            return userData;
          })
        );
        
        setAvailableUsers(enhancedUsers);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      showNotification('Failed to load users', 'error');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      showNotification('Please enter group name and select members', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const groupData = {
        name: groupName,
        description: groupDescription,
        participant_ids: selectedUsers.map(u => u.id),
        is_public: false
      };

      await createGroup(groupData);
      onClose();
      
      // Reset form
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      setSearchUsers('');
      
    } catch (err) {
      // Error handled in createGroup function
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user role chip
  const getUserRoleChip = (user) => {
    const role = user.role || user.user?.role;
    if (!role) return null;
    
    return (
      <Chip
        label={role === 'brand' ? 'Brand' : 'Influencer'}
        size="small"
        color={role === 'brand' ? 'primary' : 'secondary'}
        variant="outlined"
        sx={{ ml: 1 }}
      />
    );
  };

  // Helper function to get user avatar
  const getUserAvatar = (user) => {
    const profilePic = getProfileImage(user) || user.profile_picture;
    const displayName = getProfileDisplayName(user) || user.username || user.name;
    
    return (
      <Avatar src={profilePic} sx={{ 
        bgcolor: user.role === 'brand' ? 'primary.main' : 'secondary.main'
      }}>
        {displayName?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Group</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Group Name *"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                fullWidth
                helperText="Choose a name for your group"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                multiline
                rows={2}
                fullWidth
                helperText="Describe what this group is about"
              />
            </Grid>
          </Grid>
          
          {selectedUsers.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Members ({selectedUsers.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                {selectedUsers.map(u => (
                  <Chip
                    key={u.id}
                    avatar={getUserAvatar(u)}
                    label={getProfileDisplayName(u) || u.username || u.name}
                    onDelete={() => setSelectedUsers(prev => prev.filter(su => su.id !== u.id))}
                    color="primary"
                    variant="outlined"
                    size="medium"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Add Members
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (Select from all users)
              </Typography>
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search users by name, username, or role..."
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchUsers && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchUsers('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ maxHeight: 300, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {isLoadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading users...
                  </Typography>
                </Box>
              ) : availableUsers.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try a different search term
                  </Typography>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {availableUsers
                    .filter(u => {
                      if (!searchUsers.trim()) return true;
                      
                      const query = searchUsers.toLowerCase();
                      const displayName = getProfileDisplayName(u) || '';
                      const username = u.username || '';
                      const name = u.name || '';
                      const role = u.role || '';
                      const company = u.company_name || '';
                      const niche = u.niche || '';
                      
                      return (
                        displayName.toLowerCase().includes(query) ||
                        username.toLowerCase().includes(query) ||
                        name.toLowerCase().includes(query) ||
                        role.toLowerCase().includes(query) ||
                        company.toLowerCase().includes(query) ||
                        niche.toLowerCase().includes(query)
                      );
                    })
                    .map(u => {
                      const isSelected = selectedUsers.some(su => su.id === u.id);
                      const displayName = getProfileDisplayName(u) || u.username || u.name;
                      const role = u.role || u.user?.role;
                      
                      return (
                        <ListItem
                          key={u.id}
                          button
                          selected={isSelected}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUsers(prev => prev.filter(su => su.id !== u.id));
                            } else {
                              setSelectedUsers(prev => [...prev, u]);
                            }
                          }}
                          sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              '&:hover': { backgroundColor: 'primary.light' }
                            }
                          }}
                        >
                          <ListItemAvatar>
                            {getUserAvatar(u)}
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">
                                  {displayName}
                                </Typography>
                                {getUserRoleChip(u)}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {role === 'brand' 
                                    ? u.company_name || u.industry || 'Brand'
                                    : u.niche || u.full_name || 'Influencer'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {u.email || 'No email'}
                                </Typography>
                              </Box>
                            }
                          />
                          {isSelected ? (
                            <CheckIcon color="primary" />
                          ) : (
                            <AddIcon color="action" />
                          )}
                        </ListItem>
                      );
                    })}
                </List>
              )}
            </Box>
            
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Found {availableUsers.length} users
              </Typography>
              <Button
                size="small"
                onClick={loadAvailableUsers}
                startIcon={<RefreshIcon />}
                disabled={isLoadingUsers}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateGroup}
          disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <PeopleIcon />}
        >
          {isLoading ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  const updateConversationAfterSend = (content) => {
    if (!selectedConversation) return;

    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            last_message: {
              content: content.substring(0, 100),
              timestamp: new Date().toISOString(),
              sender_id: user.id
            },
            updated_at: new Date().toISOString(),
            message_count: (conv.message_count || 0) + 1
          };
        }
        return conv;
      });
      
      // Move to top
      const convIndex = updated.findIndex(c => c.id === selectedConversation.id);
      if (convIndex > 0) {
        const [conv] = updated.splice(convIndex, 1);
        updated.unshift(conv);
      }
      
      return updated;
    });
  };

  const sendTypingIndicator = useCallback((isTyping) => {
    if (socket && selectedConversation && selectedConversation.id) {
      socket.emit('typing', {
        conversation_id: selectedConversation.id,
        receiver_id: selectedConversation.other_participant.id,
        is_typing: isTyping
      });
    }
  }, [socket, selectedConversation]);

  const handleLocalTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  }, [isTyping, sendTypingIndicator]);

  const editMessage = async () => {
    if (!editingMessage?.content.trim()) return;

    try {
      const response = await api.put(`/messages/messages/${editingMessage.id}`, { 
        content: editingMessage.content 
      });
      
      if (response && (response.success || response.data)) {
        const updatedMessage = response.data || response;
        setMessages(prev => prev.map(msg => 
          msg.id === editingMessage.id ? { ...msg, ...updatedMessage, is_edited: true } : msg
        ));
        setEditingMessage(null);
        setMenuAnchorEl(null);
        
        if (socket) {
          socket.emit('update_message', {
            conversation_id: selectedConversation.id,
            message_id: editingMessage.id,
            updates: updatedMessage
          });
        }
        
        showNotification('Message updated', 'success');
      }
    } catch (err) {
      console.error('Error editing message:', err);
      showNotification('Failed to edit message', 'error');
    }
  };

  const deleteMessage = async () => {
    if (!selectedForMenu) return;

    try {
      const response = await api.delete(`/messages/messages/${selectedForMenu.id}`);
      
      if (response && (response.success || response.data)) {
        setMessages(prev => prev.map(msg => 
          msg.id === selectedForMenu.id ? { ...msg, content: '[Message deleted]', is_deleted: true } : msg
        ));
        setMenuAnchorEl(null);
        
        if (socket) {
          socket.emit('delete_message', {
            conversation_id: selectedConversation.id,
            message_id: selectedForMenu.id
          });
        }
        
        showNotification('Message deleted', 'success');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      showNotification('Failed to delete message', 'error');
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await api.put(`/messages/conversations/${conversationId}/read`);
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0, has_unread: false } : conv
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  // ==================== CONVERSATION ACTIONS ====================
  const handleConversationSelect = async (conversation) => {
    console.log('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    shouldAutoScrollRef.current = true;
    setShowInfo(false);
    await loadMessages(conversation.id);
  };

  const startNewConversation = async () => {
    if (selectedUsers.length === 0) {
      showNotification('Please select a user to start a conversation', 'error');
      return;
    }

    try {
      const participant = selectedUsers[0];
      
      // Check if conversation already exists
      const existingConv = conversations.find(conv => 
        conv.other_participant?.id === participant.id
      );
      
      if (existingConv) {
        handleConversationSelect(existingConv);
      } else {
        // Create new conversation object
        const newConv = {
          id: `new_${Date.now()}`,
          title: participant.username || participant.name || 'New User',
          other_participant: {
            id: participant.id,
            username: participant.username || participant.name || 'New User',
            role: participant.role || (userRole === 'brand' ? 'influencer' : 'brand'),
            profile_picture: participant.profile_picture
          },
          last_message: null,
          updated_at: new Date().toISOString(),
          unread_count: 0,
          message_count: 0,
          type: 'direct',
          has_unread: false
        };
        
        setSelectedConversation(newConv);
        setMessages([]);
        
        // Add to conversations list
        setConversations(prev => [newConv, ...prev]);
      }
      
      setShowNewChat(false);
      setSelectedUsers([]);
      setSearchQuery('');
      
      showNotification('New conversation started', 'success');
    } catch (err) {
      console.error('Error starting conversation:', err);
      showNotification('Failed to start conversation', 'error');
    }
  };

  const handleToggleFavorite = (conversationId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(conversationId)) {
      newFavorites.delete(conversationId);
    } else {
      newFavorites.add(conversationId);
    }
    setFavorites(newFavorites);
    setMenuAnchorEl(null);
    showNotification(favorites.has(conversationId) ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const updateConversationSettings = async (settings) => {
    if (!selectedConversation) return;
    
    try {
      const response = await api.put(
        `/messages/conversations/${selectedConversation.id}/settings`, 
        settings
      );
      
      if (response && (response.success || response.data)) {
        setSelectedConversation(prev => ({ ...prev, ...settings }));
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id ? { ...conv, ...settings } : conv
        ));
        showNotification('Settings updated', 'success');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      showNotification('Failed to update settings', 'error');
    }
  };

  // Preview Modal Component
const AttachmentPreview = () => {
  if (!currentPreview) return null;

  const isImage = previewType === 'image';
  const isVideo = previewType === 'video';
  const fileName = currentPreview.name || currentPreview.split('/').pop();

  return (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6">
          {isImage ? 'Image Preview' : isVideo ? 'Video Preview' : 'File Preview'}
        </Typography>
        <IconButton onClick={() => setPreviewOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 0,
        overflow: 'hidden'
      }}>
        {isImage ? (
          <img
            src={currentPreview.url || currentPreview}
            alt="Preview"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
            }}
          />
        ) : isVideo ? (
          <video
            controls
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          >
            <source src={currentPreview.url || currentPreview} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            width: '100%'
          }}>
            <FileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This file cannot be previewed in the browser
            </Typography>
            <Button
              variant="contained"
              startIcon={<FileIcon />}
              onClick={() => window.open(currentPreview.url || currentPreview, '_blank')}
            >
              Download File
            </Button>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Button
          startIcon={<AttachIcon />}
          onClick={() => {
            const link = document.createElement('a');
            link.href = currentPreview.url || currentPreview;
            link.download = fileName;
            link.click();
          }}
        >
          Download
        </Button>
        <Button
          variant="contained"
          onClick={() => setPreviewOpen(false)}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};



  // ==================== UI HELPER FUNCTIONS ====================
  const filteredConversations = conversations
    .filter(conv => {
      if (!conv) return false;
      
      if (filter === 'unread') return conv.unread_count > 0;
      if (filter === 'archived') return conv.is_archived;
      if (filter === 'favorites') return favorites.has(conv.id);
      return !conv.is_archived;
    })
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (u.username?.toLowerCase().includes(query)) ||
      (u.name?.toLowerCase().includes(query)) ||
      (userRole === 'brand' && u.niche?.toLowerCase().includes(query)) ||
      (userRole === 'influencer' && u.company_name?.toLowerCase().includes(query))
    );
  });

  const typingUsersList = Object.values(typingUsers).map(u => u.username).filter(Boolean);
  const typingIndicator = typingUsersList.length > 0 
    ? `${typingUsersList.join(', ')} ${typingUsersList.length === 1 ? 'is' : 'are'} typing...`
    : null;

  const getRoleIcon = (role) => role === 'brand' ? <BusinessIcon /> : <PersonIcon />;
  const getRoleColor = (role) => role === 'brand' ? 'primary' : 'secondary';
  const getRoleLabel = (role) => role === 'brand' ? 'Brand' : 'Influencer';

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';
      if (isToday(date)) return format(date, 'HH:mm');
      if (isYesterday(date)) return 'Yesterday ' + format(date, 'HH:mm');
      return format(date, 'MMM d, HH:mm');
    } catch (err) {
      return 'Just now';
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

 const handleAttachment = (type) => {
  const input = document.createElement('input');
  input.type = 'file';
  
  // Set accept based on type
  if (type === 'image') {
    input.accept = 'image/*';
  } else if (type === 'video') {
    input.accept = 'video/*';
  } else if (type === 'audio') {
    input.accept = 'audio/*';
  } else {
    input.accept = '*/*';  // All files
  }
  
  input.multiple = false;
  
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification(`File size should be less than ${maxSize / (1024 * 1024)}MB`, 'error');
      return;
    }
    
    try {
      // Create a local URL for preview
      const fileUrl = URL.createObjectURL(file);
      
      // Prepare attachment data
      const attachmentData = {
        file,
        url: fileUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
      
      setAttachment(attachmentData);
      showNotification(`Attached: ${file.name}`, 'success');
      
    } catch (err) {
      console.error('Error handling attachment:', err);
      showNotification('Failed to attach file', 'error');
    }
  };
  
  input.click();
};

  const clearNotifications = () => {
    setUnreadCount(0);
    setConversations(prev => prev.map(conv => 
      conv ? { ...conv, unread_count: 0, has_unread: false } : conv
    ));
    showNotification('All notifications cleared', 'success');
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderMessageBubble = (message) => {
    if (!message) return null;
    
    const isOwnMessage = message.sender?.id === user.id || message.sender_id === user.id;
    const senderUsername = message.sender?.username || 'Unknown User';
    const senderProfilePic = message.sender?.profile_picture;
    
    const getStatusIcon = () => {
      if (message.is_sending) return <ScheduleIcon fontSize="small" color="disabled" />;
      if (message.is_deleted) return <ErrorIcon fontSize="small" color="error" />;
      if (message.is_read) return <CheckCircleIcon fontSize="small" color="primary" />;
      if (message.is_delivered) return <CheckCircleIcon fontSize="small" color="action" />;
      return <CheckIcon fontSize="small" color="action" />;
    };
      const displayContent = 
    message.content || 
    message.text || 
    message.body || 
    '[Empty message]';

    
// Update attachment handling in message bubble
const handleAttachmentClick = (attachment, type) => {
  setCurrentPreview(attachment);
  setPreviewType(type);
  setPreviewOpen(true);
};


    return (
      <Box
        key={message.id || `msg-${Date.now()}`}
        sx={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          mb: 2,
          px: 1,
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        {!isOwnMessage && (
          <Avatar
            src={senderProfilePic}
            sx={{ width: 32, height: 32, mt: 'auto', mr: 1 }}
          >
            {senderUsername?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        )}

        <Box sx={{ maxWidth: '70%' }}>
          {!isOwnMessage && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block' }}>
              {senderUsername}
            </Typography>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
              color: isOwnMessage ? 'white' : 'text.primary',
              borderRadius: 2,
              borderTopLeftRadius: isOwnMessage ? 2 : 0,
              borderTopRightRadius: isOwnMessage ? 0 : 2,
            }}
          >
            {message.is_deleted ? (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                [Message deleted]
              </Typography>
            ) : message.attachment_url ? (
  message.message_type === 'image' || message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
    <Box sx={{ maxWidth: 300, cursor: 'pointer' }}>
      <Paper
        elevation={0}
        sx={{
          p: 1,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            // backgroundColor: 'action.hover'
          }
        }}
        onClick={() => handleAttachmentClick(message.attachment_url, 'image')}
      >
        <img
          src={message.attachment_url}
          alt="Attachment"
          style={{ 
            width: '100%', 
            borderRadius: 4,
            maxHeight: 200,
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <ImageIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
          <Typography variant="caption" color="text.secondary">
            Click to preview
          </Typography>
        </Box>
      </Paper>
    </Box>
  ) : message.message_type === 'video' || message.attachment_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
    <Paper
      variant="outlined"
      sx={{ 
        p: 2, 
        maxWidth: 300, 
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
      onClick={() => handleAttachmentClick(message.attachment_url, 'video')}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <VideocamIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2" fontWeight="bold">
          Video Attachment
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Click to preview video
      </Typography>
    </Paper>
  ) : (
    <Paper
      variant="outlined"
      sx={{ 
        p: 2, 
        maxWidth: 300, 
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
      onClick={() => handleAttachmentClick(message.attachment_url, 'file')}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <FileIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2" fontWeight="bold" noWrap>
          {message.attachment_url.split('/').pop() || 'File Attachment'}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Click to download
      </Typography>
    </Paper>
  )
) : (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                { displayContent ||  '[Empty message]'}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
  {message.is_edited && (
    <Typography variant="caption" sx={{ opacity: 0.7, mr: 0.5 }}>
      (edited)
    </Typography>
  )}
  <Typography variant="caption" sx={{ opacity: 0.7 }}>
    {formatMessageTime(message.created_at)}
  </Typography>
  {isOwnMessage && (
    <Tooltip title={getMessageStatus(message).text}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {getMessageStatus(message).icon}
      </Box>
    </Tooltip>
  )}
</Box>
          </Paper>
        </Box>

        {isOwnMessage && (
          <Avatar
            src={user.profile_picture}
            sx={{ width: 32, height: 32, mt: 'auto', ml: 1 }}
          >
            {user.username?.charAt(0)?.toUpperCase() || 'Y'}
          </Avatar>
        )}
      </Box>
    );
  };

  const renderConversationItem = (conversation) => {
  if (!conversation) return null;
  
  const isSelected = selectedConversation?.id === conversation.id;
  const lastMessageTime = conversation.last_message?.timestamp 
    ? formatDistanceToNow(new Date(conversation.last_message.timestamp), { addSuffix: true })
    : 'No messages';
  const lastMessagePreview = conversation.last_message?.content || 'Start a conversation...';
  const isSender = conversation.last_message?.sender_id === user.id;
  
  // Use profile data
  const otherParticipant = conversation.other_participant || {};
  const displayName = getProfileDisplayName(otherParticipant);
  const profileImage = getProfileImage(otherParticipant);
  const role = otherParticipant.role || (userRole === 'brand' ? 'influencer' : 'brand');
  const profileDetails = getProfileDetails(otherParticipant);
  
  // Additional info for subtitle
  const subtitleInfo = role === 'brand' 
    ? profileDetails.company_name || profileDetails.contact_person || profileDetails.industry
    : profileDetails.nickname || profileDetails.niche || profileDetails.full_name;

  return (
    <ListItem
      key={conversation.id}
      button
      selected={isSelected}
      onClick={() => handleConversationSelect(conversation)}
      sx={{
        borderLeft: isSelected ? '4px solid' : 'none',
        borderLeftColor: 'primary.main',
        '&:hover': { backgroundColor: 'action.hover' }
      }}
    >
      <ListItemAvatar>
        <Badge
          color="primary"
          variant="dot"
          invisible={!conversation.has_unread}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Avatar
            src={profileImage}
            sx={{ 
              bgcolor: role === 'brand' ? 'primary.main' : 'secondary.main',
              width: 40,
              height: 40
            }}
          >
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
              {displayName}
            </Typography>
            {/* <Chip
              icon={getRoleIcon(role)}
              label={getRoleLabel(role)}
              size="small"
              variant="outlined"
              color={getRoleColor(role)}
            /> */}
            {favorites.has(conversation.id) && (
              <StarIcon fontSize="small" color="warning" />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography
              variant="body2"
              color={conversation.has_unread ? 'primary' : 'text.secondary'}
              noWrap
              sx={{ fontWeight: conversation.has_unread ? 'bold' : 'normal' }}
            >
              {isSender && conversation.last_message && 'You: '}
              {lastMessagePreview}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitleInfo && `${subtitleInfo} • `}
              {lastMessageTime}
              {conversation.unread_count > 0 && (
                <Box component="span" sx={{ ml: 1 }}>
                  • {conversation.unread_count} unread
                </Box>
              )}
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchorEl(e.currentTarget);
            setSelectedForMenu(conversation);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

  // ==================== MAIN RENDER ====================
  if (loading.conversations && conversations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)',  overflow: 'hidden' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ 
  height: '100%', 
  margin: 0,
  flexWrap: 'nowrap' // Prevent wrapping
}}>
  {/* Left Sidebar - Conversation List */}
  <Grid item sx={{ 
    width: { xs: '100%', md: 320 }, // Fixed width on desktop
    height: '100%', 
    display: { xs: selectedConversation ? 'none' : 'block', md: 'block' },
    flexShrink: 0 // Prevent shrinking
  }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
  p: 2, 
  borderBottom: 1, 
  borderColor: 'divider',
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center' 
}}>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Tabs 
      value={activeTab} 
      onChange={(e, newValue) => setActiveTab(newValue)}
      sx={{ minHeight: 'auto' }}
    >
      <Tab 
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ChatIcon fontSize="small" />
            <Typography variant="body2">Direct</Typography>
            {conversations.some(c => c.unread_count > 0) && (
              <Badge 
                badgeContent={conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)} 
                color="error" 
                size="small"
              />
            )}
          </Box>
        } 
        value="direct" 
      />
      {/* <Tab 
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon fontSize="small" />
            <Typography variant="body2">Groups</Typography>
            {groups.some(g => g.unread_count > 0) && (
              <Badge 
                badgeContent={groups.reduce((acc, g) => acc + (g.unread_count || 0), 0)} 
                color="error" 
                size="small"
              />
            )}
          </Box>
        } 
        value="groups" 
      /> */}
    </Tabs>
  </Box>
  <Box>
    {activeTab === 'direct' ? (
      <Tooltip title="New Conversation">
        <IconButton onClick={() => setShowNewChat(true)} size="small">
          <ChatIcon />
        </IconButton>
      </Tooltip>
    ) : (
      <Tooltip title="New Group">
        <IconButton onClick={() => setShowNewGroup(true)} size="small">
          <PeopleIcon />
        </IconButton>
      </Tooltip>
    )}
    <Tooltip title="Clear Notifications">
      <IconButton onClick={clearNotifications} size="small">
        <NotificationsIcon />
      </IconButton>
    </Tooltip>
  </Box>
</Box>
            
            {/* Search and Filter */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label="All" 
                  size="small" 
                  color={filter === 'all' ? 'primary' : 'default'} 
                  onClick={() => setFilter('all')} 
                />
                <Chip 
                  label="Unread" 
                  size="small" 
                  color={filter === 'unread' ? 'primary' : 'default'} 
                  onClick={() => setFilter('unread')} 
                />
                <Chip 
                  label="Favorites" 
                  size="small" 
                  color={filter === 'favorites' ? 'primary' : 'default'} 
                  onClick={() => setFilter('favorites')} 
                  icon={<StarIcon fontSize="small" />} 
                />
              </Box>
            </Box>

            {/* Conversation List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
               {activeTab === 'direct' ? (
              filteredConversations.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <ChatIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {searchQuery ? 'Try a different search term' : 'Start a new conversation to begin'}
                  </Typography>
                  <Button 
                    startIcon={<AddIcon />}
                    onClick={() => setShowNewChat(true)}
                    variant="outlined"
                    size="small"
                  >
                    Start New Conversation
                  </Button>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {filteredConversations.map(renderConversationItem)}
                </List>
              )
                ) : (
  /* Group list */
  
    groups.length === 0 ? (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary" gutterBottom>
          No groups yet
        </Typography>
        <Button 
          startIcon={<AddIcon />}
          onClick={() => setShowNewGroup(true)}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          Create New Group
        </Button>
      </Box>
    ) : (
      <List sx={{ py: 0 }}>
        {groups.map(renderGroupItem)}
      </List>
    )
    )}
  </Box>

      
            
            {/* Refresh Button */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={loadConversations}
                disabled={loading.conversations}
                startIcon={loading.conversations ? <CircularProgress size={20} /> : <ChatIcon />}
              >
                {loading.conversations ? 'Refreshing...' : 'Refresh Conversations'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Chat Area */}
     <Grid item sx={{ 
    flex: 1, // Take remaining space
    height: '100%',
    display: { xs: selectedConversation ? 'block' : 'none', md: 'block' },
    minWidth: 0, // Allow shrinking below content size
  }}>

          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation || selectedGroup ? (
              <>
                {/* Chat Header */}
            
{/* Chat Header */}
<Box sx={{ 
  p: 2, 
  borderBottom: 1, 
  borderColor: 'divider',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'background.paper'
}}>
  {selectedConversation ? (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isMobile && (
          <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        
        {/* Add null check for other_participant */}
        {selectedConversation.other_participant && (
          <>
            <Badge
              color={selectedConversation.other_participant.role === 'influencer' ? 'success' : 'primary'}
              variant="dot"
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar
                src={getProfileImage(selectedConversation.other_participant)}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: selectedConversation.other_participant.role === 'brand' ? 'primary.main' : 'secondary.main'
                }}
              >
                {getProfileDisplayName(selectedConversation.other_participant)?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Badge>

            <Box>
              <Typography
                variant="h6"
                onClick={() => handleViewProfile(selectedConversation.other_participant)}
                role="button"
                aria-label="View profile"
                sx={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    textDecoration: 'none',
                    color: 'primary.main'
                  }
                }}
              >
                {getProfileDisplayName(selectedConversation.other_participant)}
                <Chip
                  label={getRoleLabel(selectedConversation.other_participant.role || 'user')}
                  size="small"
                  color={getRoleColor(selectedConversation.other_participant.role || 'user')}
                  variant="outlined"
                  clickable={false}
                />
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedConversation.other_participant.role === 'brand'
                  ? selectedConversation.other_participant.company_name || selectedConversation.other_participant.industry
                  : selectedConversation.other_participant.nickname || selectedConversation.other_participant.niche}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {typingIndicator || (selectedConversation.other_participant.is_online ? '🟢 Online' : 'Last seen recently')}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        {selectedConversation.other_participant && (
          <Tooltip title="View Profile">
            <IconButton
              onClick={() => handleViewProfile(selectedConversation.other_participant)}
              color="primary"
            >
              <AccountCircleIcon />
            </IconButton>
          </Tooltip>
        )}

        <IconButton onClick={() => setShowInfo(!showInfo)} title="Conversation Info">
          <InfoIcon />
        </IconButton>

        <Tooltip title="Refresh Messages">
          <IconButton 
            onClick={() => loadMessages(selectedConversation.id)} 
            disabled={loading.messages}
          >
            {loading.messages ? <CircularProgress size={20} /> : <ChatIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </>
  ) : (
    // Show something when no conversation is selected
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h6">Select a conversation</Typography>
    </Box>
  )}
</Box>

                {previewOpen && <AttachmentPreview />}

                {/* Messages Area */}
                <Box
  ref={messagesContainerRef}
  sx={{ 
    flex: 1, 
    overflow: 'auto', 
    p: 2,
    backgroundColor: 'grey.50',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }}
>
  {isLoadingMore && (
    <Box sx={{ 
      position: 'absolute', 
      top: 10, 
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 1 
    }}>
      <CircularProgress size={24} />
    </Box>
  )}
  
  {!isLoadingMore && hasMoreMessages && (
    <Box sx={{ textAlign: 'center', mb: 2 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => loadMessages(selectedConversation.id, true)}
        sx={{ borderRadius: 20 }}
      >
        Load More Messages
      </Button>
    </Box>
  )}
  
  {/* Your messages list here */}
  {/* {messages.map(renderMessageBubble)} */}
  {activeTab === 'direct'
  ? messages.map(renderMessageBubble)
  : groupMessages.map(renderMessageBubble)
}

   {/* Typing indicator */}
  {typingUsersList.length > 0 && <TypingIndicator users={typingUsersList} />}
  
  {/* Scroll to bottom anchor */}
  <div ref={messagesEndRef} />
  
  {/* View more indicator at top */}
  {hasMoreMessages && !isLoadingMore && (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      mt: 1,
      mb: 2
    }}>
      <Typography variant="caption" color="text.secondary">
        Scroll up to load more messages
      </Typography>
    </Box>
  )}

                  {loading.messages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      color: 'text.secondary',
                      textAlign: 'center'
                    }}>
                      <Avatar
                        src={selectedConversation.other_participant?.profile_picture}
                        sx={{ 
                          width: 100, 
                          height: 100,
                          mb: 3,
                          bgcolor: selectedConversation.other_participant?.role === 'brand' ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        {selectedConversation.other_participant?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Typography variant="h5" gutterBottom>
                        {selectedConversation.other_participant?.username || 'Unknown User'}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {getRoleLabel(selectedConversation.other_participant?.role || 'user')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2, maxWidth: 400 }}>
                        This is the beginning of your conversation with {selectedConversation.other_participant?.username || 'this user'}.
                        Send a message to start the conversation!
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ mb: 2, textAlign: 'center' }}>
                        <Chip
                          label={`${messages.length} message${messages.length === 1 ? '' : 's'}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {/* {messages?.filter(Boolean).map((m, index) => {
  const base = m?.message || m;
  
  // Ensure base is not null/undefined
  if (!base) return null;
  
  return renderMessageBubble({
    id: base?.id || base?._id || `msg_${Date.now()}_${index}`,
    content: base?.content ?? base?.text ?? base?.body ?? '',
    sender: base?.sender || { 
      id: base?.sender_id,
      username: 'Unknown User',
      profile_picture: null 
    },
    sender_id: base?.sender_id || base?.sender?.id,
    receiver_id: base?.receiver_id,
    created_at: base?.created_at || base?.timestamp || new Date().toISOString(),
    message_type: base?.message_type || 'text',
    attachment_url: base?.attachment_url || null,
    is_deleted: base?.is_deleted || false,
    is_read: base?.is_read || false,
    is_delivered: base?.is_delivered || false
  });
}).filter(Boolean)} */}

                      {typingIndicator && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, ml: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                            {typingUsersList[0]?.charAt(0) || 'T'}
                          </Avatar>
                          <Box sx={{ 
                            backgroundColor: 'white',
                            borderRadius: 2,
                            p: 1.5,
                            maxWidth: 200,
                            animation: 'pulse 1.5s infinite'
                          }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Box sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                backgroundColor: 'grey.500',
                                animation: 'bounce 1.4s infinite'
                              }} />
                              <Box sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                backgroundColor: 'grey.500',
                                animation: 'bounce 1.4s infinite 0.2s'
                              }} />
                              <Box sx={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                backgroundColor: 'grey.500',
                                animation: 'bounce 1.4s infinite 0.4s'
                              }} />
                            </Box>
                          </Box>
                        </Box>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                {/* Message Input */}
                <Box sx={{ 
                  p: 2, 
                  borderTop: 1, 
                  borderColor: 'divider',
                  backgroundColor: 'background.paper'
                }}>
                  {attachment && (
                    <Box sx={{ 
                      mb: 1, 
                      p: 1, 
                      backgroundColor: 'grey.100', 
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileIcon />
                        <Typography variant="body2" noWrap>
                          {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => setAttachment(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <IconButton onClick={() => handleAttachment('image')} title="Attach Image">
                      <ImageIcon />
                    </IconButton>
                    <IconButton onClick={() => handleAttachment('file')} title="Attach File">
                      <AttachIcon />
                    </IconButton>
                    
                    <TextField
  multiline
  minRows={1}
  maxRows={4}
  fullWidth
  placeholder="Type a message..."
  value={newMessage}
  onChange={(e) => {
    setNewMessage(e.target.value);
    handleLocalTyping();
  }}
  onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    activeTab === 'groups'
      ? sendGroupMessage(selectedGroup.id, newMessage, attachment)
      : sendMessage();
  }
}}
  variant="outlined"
  size="small"
  disabled={activeTab === 'direct' && !selectedConversation}
  sx={{
    '& .MuiOutlinedInput-root': {
      padding: 0,
      alignItems: 'flex-start', // Align items to top for multiline
      // borderRadius: 20,
      backgroundColor: '#f5f7fb',
      '&:hover': {
        backgroundColor: '#f0f2f5',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
      }
    },
    '& .MuiOutlinedInput-input': {
      padding: '8px 14px',
      lineHeight: '20px',
      fontSize: '14px',
      overflowY: 'auto',
      maxHeight: '80px', // Increased max height
      minHeight: '20px', // Minimum height for one line
    },
    '& textarea': {
      resize: 'none',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#c1c1c1',
        borderRadius: '3px',
      },
    }
  }}
/>

                    <Tooltip title={!selectedConversation ? "Select a conversation first" : "Send message"}>
                      <span>
                        <IconButton 
                          color="primary"
                          onClick={sendMessage}
                          disabled={(!newMessage.trim() && !attachment) || !selectedConversation}
                          sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': { 
                              backgroundColor: 'primary.dark',
                              transform: 'scale(1.05)'
                            },
                            '&.Mui-disabled': { 
                              backgroundColor: 'grey.300',
                              color: 'grey.500'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                p: 3,
                textAlign: 'center'
              }}>
                <ChatIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  {userRole === 'brand' ? 'Brand Messenger' : 'Influencer Messenger'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                  Connect and communicate with {userRole === 'brand' ? 'influencers' : 'brands'} seamlessly.
                  Start new conversations, manage existing ones, and collaborate effectively.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setShowNewChat(true)}
                    startIcon={<ChatIcon />}
                    size="large"
                  >
                    Start New Chat
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={loadConversations}
                    startIcon={loading.conversations ? <CircularProgress size={20} /> : <ChatIcon />}
                    size="large"
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar - Conversation Info */}
    {showInfo && selectedConversation && selectedConversation.other_participant && (
    <Grid item sx={{ 
      width: { md: 280, lg: 320 }, // Fixed width
      height: '100%',
      display: { xs: 'none', md: 'block' },
      flexShrink: 0
    }}>
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        p: 2,
        overflowY: 'auto'
      }}
    >

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Conversation Info</Typography>
                <IconButton onClick={() => setShowInfo(false)} size="small">
                  <CloseIcon />
                </IconButton>
               
              </Box>
              
 {/* Define participant here, safely */}
      {(() => {
        const participant = selectedConversation.other_participant;
        return (
              
<Box sx={{ textAlign: 'center', mb: 3 }}>
 

<Avatar
  src={getProfileImage(participant)}
  onClick={() => participant && handleViewProfile(participant)}
  role="button"
  aria-label="View profile"
  sx={{ 
    width: 80,
    height: 80,
    mx: 'auto',
    mb: 2,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    bgcolor: participant?.role === 'brand' ? 'primary.main' : 'secondary.main',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: 3
    }
  }}
>
  {getProfileDisplayName(participant)?.charAt(0)?.toUpperCase() || 'U'}
</Avatar>

<Typography
  variant="h6"
  gutterBottom
  role="button"
  aria-label="View profile"
  onClick={() => participant && handleViewProfile(participant)}
  sx={{
    cursor: 'pointer',
    display: 'inline-block',
    '&:hover': {
      textDecoration: 'underline',
      color: 'primary.main'
    }
  }}
>
  {getProfileDisplayName(participant)}
</Typography>

  
  {selectedConversation.other_participant?.role === 'brand' ? (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {selectedConversation.other_participant?.company_name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Contact: {selectedConversation.other_participant?.contact_person}
      </Typography>
    </Box>
  ) : (
    <Box>
      <Typography variant="body2" color="text.secondary">
        {selectedConversation.other_participant?.nickname || selectedConversation.other_participant?.full_name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {selectedConversation.other_participant?.niche}
      </Typography>
    </Box>
  )}
  
  <Chip
    label={getRoleLabel(selectedConversation.other_participant?.role || 'user')}
    color={getRoleColor(selectedConversation.other_participant?.role || 'user')}
    sx={{ mt: 1, mb: 1 }}
  />
  
  {selectedConversation.other_participant?.categories?.length > 0 && (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Categories: {selectedConversation.other_participant.categories.join(', ')}
      </Typography>
    </Box>
  )}
  
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
    {selectedConversation.other_participant?.is_online ? '🟢 Online' : '⚫ Last seen recently'}
  </Typography>
</Box>
 );
      })()}
              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Actions</Typography>
                <Button
                  fullWidth
                  startIcon={favorites.has(selectedConversation.id) ? <StarIcon /> : <StarBorderIcon />}
                  onClick={() => handleToggleFavorite(selectedConversation.id)}
                  sx={{ mb: 1 }}
                  variant="outlined"
                >
                  {favorites.has(selectedConversation.id) ? 'Remove Favorite' : 'Add to Favorites'}
                </Button>
                <Button
                  fullWidth
                  startIcon={selectedConversation.is_muted ? <VolumeUpIcon /> : <MuteIcon />}
                  onClick={() => updateConversationSettings({ is_muted: !selectedConversation.is_muted })}
                  sx={{ mb: 1 }}
                  variant="outlined"
                >
                  {selectedConversation.is_muted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  fullWidth
                  startIcon={<ArchiveIcon />}
                  onClick={() => updateConversationSettings({ is_archived: !selectedConversation.is_archived })}
                  variant="outlined"
                  color="secondary"
                  sx={{ mb: 1 }}
                >
                  {selectedConversation.is_archived ? 'Unarchive' : 'Archive'}
                </Button>
                
                 <Button
  fullWidth
  startIcon={<AccountCircleIcon />}
  variant="outlined"
  sx={{ mb: 1 }}
  onClick={() => handleViewProfile(selectedConversation.other_participant)}
>
  View Profile
</Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Messages</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedConversation.message_count || messages.length || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Unread Messages</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {selectedConversation.unread_count || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Last Active</Typography>
                  <Typography variant="body2">
                    {formatDistanceToNow(new Date(selectedConversation.updated_at), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Conversation ID</Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    wordBreak: 'break-all',
                    backgroundColor: 'grey.100',
                    p: 1,
                    borderRadius: 1,
                    fontFamily: 'monospace'
                  }}
                >
                  {selectedConversation.id}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* New Conversation Dialog */}
      <Dialog 
        open={showNewChat} 
        onClose={() => setShowNewChat(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { maxHeight: '80vh' } }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">New Conversation</Typography>
            <IconButton onClick={() => setShowNewChat(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedUsers.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedUsers.map(user => (
                <Chip
                  key={user.id}
                  avatar={<Avatar src={user.profile_picture}>{user.username?.charAt(0) || user.name?.charAt(0) || 'U'}</Avatar>}
                  label={user.username || user.name || 'User'}
                  onDelete={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                  color={getRoleColor(user.role)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          )}

          <TextField
            fullWidth
            placeholder={`Search ${userRole === 'brand' ? 'influencers' : 'brands'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 3 }}
          />

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography color="text.secondary">
                  {searchQuery ? 'No users found' : `No ${userRole === 'brand' ? 'influencers' : 'brands'} available`}
                </Typography>
                {searchQuery && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Try a different search term
                  </Typography>
                )}
              </Box>
            ) : (
              <List>
                {filteredUsers.map(user => (
                  <ListItem
                    key={user.id}
                    button
                    selected={selectedUsers.some(u => u.id === user.id)}
                    // onClick={() => {
                    //   if (selectedUsers.some(u => u.id === user.id)) {
                    //     setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                    //   } else {
                    //     setSelectedUsers(prev => [...prev, user]);
                    //   }
                    // }}
                    onClick={() => {
  setSelectedUsers([user]); // ALWAYS one user
}}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': { backgroundColor: 'primary.light' }
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profile_picture} sx={{ bgcolor: `${getRoleColor(user.role)}.main` }}>
                        {user.username?.charAt(0) || user.name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {user.username || user.name || 'Unknown User'}
                          </Typography>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={getRoleLabel(user.role)}
                            size="small"
                            color={getRoleColor(user.role)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        userRole === 'brand' 
                          ? `${user.niche || 'No niche specified'} • ${user.follower_count ? `${user.follower_count.toLocaleString()} followers` : 'No follower data'}`
                          : `${user.company_name || 'No company name'} • ${user.industry || 'No industry specified'}`
                      }
                    />
                    {selectedUsers.some(u => u.id === user.id) ? (
                      <CheckIcon color="primary" />
                    ) : (
                      <AddIcon />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setShowNewChat(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={startNewConversation}
            disabled={selectedUsers.length === 0}
            startIcon={<AddIcon />}
          >
            {selectedUsers.length === 1 ? 'Start Conversation' : `Start Group (${selectedUsers.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedForMenu && selectedForMenu.id && (
          <>
          <Button
  fullWidth
  startIcon={<AccountCircleIcon />}
  variant="outlined"
  sx={{ mb: 1 }}
  onClick={() => handleViewProfile(selectedConversation.other_participant)}
>
  View Profile
</Button>
            <MenuItem onClick={() => {
              handleToggleFavorite(selectedForMenu.id);
              setMenuAnchorEl(null);
            }}>
              {favorites.has(selectedForMenu.id) ? (
                <>
                  <StarBorderIcon fontSize="small" sx={{ mr: 1 }} />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <StarIcon fontSize="small" sx={{ mr: 1 }} />
                  Add to Favorites
                </>
              )}
            </MenuItem>
            <MenuItem onClick={() => {
              updateConversationSettings({ is_muted: !selectedForMenu.is_muted });
              setMenuAnchorEl(null);
            }}>
              {selectedForMenu.is_muted ? (
                <>
                  <VolumeUpIcon fontSize="small" sx={{ mr: 1 }} />
                  Unmute
                </>
              ) : (
                <>
                  <MuteIcon fontSize="small" sx={{ mr: 1 }} />
                  Mute
                </>
              )}
            </MenuItem>
            <MenuItem onClick={() => {
              updateConversationSettings({ is_archived: !selectedForMenu.is_archived });
              setMenuAnchorEl(null);
            }}>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              {selectedForMenu.is_archived ? 'Unarchive' : 'Archive'}
            </MenuItem>
            
            <Divider />
            <MenuItem 
              sx={{ color: 'error.main' }}
              onClick={() => {
                setMenuAnchorEl(null);
                // Implement delete conversation logic
                showNotification('Delete conversation feature coming soon', 'info');
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Conversation
            </MenuItem>
          </>
        )}
      </Menu>
      {previewOpen && <AttachmentPreview />}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>


<NewGroupDialog 
  open={showNewGroup}
  onClose={() => setShowNewGroup(false)}
  user={user}
  api={api}
/>


      {/* Global Styles */}
      <style>{`

      .messages-container {
    scroll-behavior: smooth;
  }
  
  .messages-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .messages-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .messages-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  .messages-container::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(20px); opacity: 0; }
  }
  
  @keyframes typingDots {
    0%, 20% { opacity: 0.4; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-2px); }
    100% { opacity: 0.4; transform: translateY(0); }
  }
  
  .message-enter {
    animation: slideIn 0.3s ease-out;
  }
  
  .message-exit {
    animation: slideOut 0.3s ease-out;
  }
  
  .typing-dot {
    animation: typingDots 1.4s infinite;
  }
  
  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  .attachment-preview {
    transition: transform 0.2s ease;
  }
  
  .attachment-preview:hover {
    transform: scale(1.02);
  }
  
  .status-icon {
    transition: color 0.3s ease;
  }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .message-bubble {
          animation: fadeIn 0.3s ease-out;
        }
        
        .messages-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .messages-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .messages-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        
        @media (max-width: 768px) {
          .messenger-container {
            height: calc(100vh - 80px);
          }
        }
      `}</style>
    </Container>
  );
};

export default BrandInfluencerMessenger;