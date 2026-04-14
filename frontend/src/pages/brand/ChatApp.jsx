// src/components/BrandInfluencerMessenger.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  useMediaQuery,
  LinearProgress
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
  const location = useLocation();
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
  const [userProfiles, setUserProfiles] = useState({});
  const handledParamsRef = useRef('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const shouldAutoScrollRef = useRef(true);

  const handleViewProfile = (participant) => {
    if (!participant?.id || !participant?.role) return;
    navigate(`/${userRole}/profile/view/${participant.role}/${participant.id}`);
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.json();
      } catch (error) {
        console.error(`API POST error for ${endpoint}:`, error);
        throw error;
      }
    },
    upload: async (endpoint, file, onProgress) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            if (onProgress) onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('POST', `${API_URL}${endpoint}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
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
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return await response.json();
      } catch (error) {
        console.error(`API DELETE error for ${endpoint}:`, error);
        throw error;
      }
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/messages/user/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      console.error('Error getting user details:', err);
      return null;
    }
  };

  // ==================== HELPERS ====================
  const sortByTime = (arr) => [...arr].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const getProfileDetails = (user) => {
    if (!user) return {};
    if (user.role === 'brand') {
      return { company_name: user.company_name, contact_person: user.contact_person, industry: user.industry, categories: user.categories || [], location: user.location };
    } else if (user.role === 'influencer') {
      return { full_name: user.full_name, nickname: user.nickname, niche: user.niche, categories: user.categories || [], location: user.location };
    }
    return {};
  };

  const getProfileDisplayName = (user) => {
    if (!user) return 'Unknown User';
    return user.display_name || user.company_name || user.full_name || user.name || user.username || 'User';
  };

  const getProfileImage = (user) => {
    if (!user) return null;
    const pic = user.profile_picture || user.logo || user.avatar_url;
    if (!pic) return null;
    if (pic.startsWith('http')) return pic;
    if (pic.startsWith('data:')) return pic;
    if (pic.startsWith('/static')) return `${API_URL}${pic}`;
    return `${API_URL}/profiles/image/${pic}`;
  };

  const updateGroupList = (data, isNewNotification) => {
    if (!data || !data.message) return;
    const message = data.message;
    const groupId = message.group_id;
    setGroups(prev => {
      const existingGroup = prev.find(g => g.id === groupId);
      if (existingGroup) {
        const updated = prev.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              last_message: {
                content: message.content.substring(0, 100),
                timestamp: message.created_at || new Date().toISOString(),
                sender_id: message.sender_id
              },
              updated_at: message.created_at || new Date().toISOString(),
              unread_count: (selectedGroup && selectedGroup.id === groupId) ? 0 : (group.unread_count || 0) + (isNewNotification ? 1 : 0)
            };
          }
          return group;
        });
        const idx = updated.findIndex(g => g.id === groupId);
        if (idx > 0) {
          const [g] = updated.splice(idx, 1);
          updated.unshift(g);
        }
        return updated;
      }
      return prev;
    });
  };

  const updateConversationList = (data, isNewNotification) => {
    if (!data || !data.message) return;
    const message = data.message;
    const conversationId = data.conversation_id;
    if (!conversationId) return;

    setConversations(prev => {
      const existingConv = prev.find(c => c.id === conversationId);
      if (existingConv) {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              last_message: {
                content: (message.content || '').substring(0, 100),
                timestamp: message.created_at || new Date().toISOString(),
                sender_id: message.sender?.id || user?.id || message.sender_id
              },
              updated_at: message.created_at || new Date().toISOString(),
              unread_count: (selectedConversation && selectedConversation.id === conversationId) ? 0 : (conv.unread_count || 0) + (isNewNotification ? 1 : 0),
              has_unread: (selectedConversation && selectedConversation.id === conversationId) ? false : true
            };
          }
          return conv;
        });
        const convIndex = updated.findIndex(c => c.id === conversationId);
        if (convIndex > 0) {
          const [conv] = updated.splice(convIndex, 1);
          updated.unshift(conv);
        }
        return updated;
      } else {
        if (message.group_id) return prev;
        const newConv = {
          id: conversationId,
          title: message.sender?.username || 'Unknown User',
          other_participant: message.sender || { id: message.sender_id, username: 'Unknown User', role: userRole === 'brand' ? 'influencer' : 'brand' },
          last_message: { content: (message.content || '').substring(0, 100), timestamp: message.created_at || new Date().toISOString(), sender_id: message.sender_id },
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
      conv.other_participant?.id === userId ? { ...conv, other_participant: { ...conv.other_participant, is_online: isOnline } } : conv
    ));
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await api.put(`/messages/conversations/${conversationId}/read`);
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0, has_unread: false } : conv
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error('Error marking as read:', err); }
  };

  const handleMessageUpdated = useCallback((data) => {
    if (selectedConversation && selectedConversation.id === data.conversation_id) {
      setMessages(prev => prev.map(msg => msg.id === data.message.id ? { ...msg, ...data.message } : msg));
    }
  }, [selectedConversation]);

  const handleMessageDeleted = useCallback((data) => {
    if (selectedConversation && selectedConversation.id === data.conversation_id) {
      setMessages(prev => prev.map(msg => msg.id === data.message_id ? { ...msg, content: '[Message deleted]', is_deleted: true } : msg));
    }
  }, [selectedConversation]);

  const handleTypingIndicator = useCallback((data) => {
    if (selectedConversation && selectedConversation.id === data.conversation_id) {
      setTypingUsers(prev => ({ ...prev, [data.user_id]: { username: data.username, timestamp: Date.now(), isTyping: data.is_typing } }));
      setTypingAnimation(data.is_typing);
      if (typingTimeoutRef.current[data.user_id]) clearTimeout(typingTimeoutRef.current[data.user_id]);
      typingTimeoutRef.current[data.user_id] = setTimeout(() => {
        setTypingUsers(prev => { const n = { ...prev }; delete n[data.user_id]; return n; });
        setTypingAnimation(false);
      }, 3000);
    }
  }, [selectedConversation]);

  const handleIncomingMessage = useCallback((data) => {
    if (!data) return;
    const message = data.message || data;
    const conversationId = data.conversation_id || message?.conversation_id;
    if (!message || !conversationId) return;
    const msgId = message.id || message._id || message.message_id;
    if (message.group_id) {
      if (groupMessages.some(m => (m.id || m._id) === msgId)) return;
      if (selectedGroup && selectedGroup.id === message.group_id) {
        setGroupMessages(prev => [...prev, message]);
        shouldAutoScrollRef.current = true;
      }
      updateGroupList(data, true);
    } else {
      if (messages.some(m => (m.id || m._id) === msgId)) return;
      if (selectedConversation && (selectedConversation.id === conversationId || (selectedConversation.id.startsWith('new_') && message.sender_id === selectedConversation.other_participant?.id))) {
        if (selectedConversation.id.startsWith('new_')) setSelectedConversation(prev => ({ ...prev, id: conversationId }));
        setMessages(prev => [...prev, message]);
        shouldAutoScrollRef.current = true;
      }
      updateConversationList(data, true);
      setUnreadCount(prev => prev + 1);
      if (!selectedConversation || selectedConversation.id !== conversationId) {
        showNotification(`New message from ${message.sender?.username || 'User'}`, 'info');
      }
    }
  }, [selectedConversation, selectedGroup, messages, groupMessages]);

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      if (response) setUnreadCount(response.total_unread_messages || response.data?.total_unread_messages || 0);
    } catch (err) { console.error('Unread count error:', err); }
  };

  const loadConversations = async () => {
    try {
      setLoading(prev => ({ ...prev, conversations: true }));
      const response = await api.get('/messages/conversations');
      let data = response?.conversations || response?.data?.conversations || (Array.isArray(response) ? response : []);
      const withProfiles = await Promise.all(data.map(async (conv) => {
        if (!conv?.other_participant?.id) return conv;
        if (userProfiles[conv.other_participant.id]) return { ...conv, other_participant: { ...conv.other_participant, ...userProfiles[conv.other_participant.id] } };
        const details = await getUserDetails(conv.other_participant.id);
        if (details) {
          setUserProfiles(prev => ({ ...prev, [conv.other_participant.id]: details.profile }));
          return { ...conv, other_participant: { ...conv.other_participant, ...details.profile } };
        }
        return conv;
      }));
      setConversations(withProfiles);
    } catch (err) { console.error('Load conv error:', err); setError('Failed to load conversations'); }
    finally { setLoading(prev => ({ ...prev, conversations: false })); }
  };

  const loadMessages = async (conversationId, loadMore = false) => {
    if (!conversationId || String(conversationId).startsWith('new_')) { setMessages([]); return; }
    try {
      if (loadMore) setIsLoadingMore(true); else setLoading(prev => ({ ...prev, messages: true }));
      const response = await api.get(`/messages/conversations/${conversationId}/messages`, { page: loadMore ? page + 1 : 1, limit: 20 });
      let data = response?.messages || response?.data?.messages || (Array.isArray(response) ? response : []);
      const safe = data.map((msg, i) => ({
        id: msg.id || msg._id || `msg_${Date.now()}_${i}`,
        content: msg.content || msg.text || '',
        sender: msg.sender || { id: msg.sender_id, username: 'User' },
        sender_id: msg.sender_id,
        created_at: msg.created_at || new Date().toISOString(),
        message_type: msg.message_type || 'text'
      }));
      if (loadMore) {
        setMessages(prev => sortByTime([...safe, ...prev]));
        setPage(prev => prev + 1);
        setHasMoreMessages(safe.length === 20);
      } else {
        setMessages(sortByTime(safe));
        setPage(1);
        setHasMoreMessages(safe.length === 20);
        shouldAutoScrollRef.current = true;
        await markConversationAsRead(conversationId);
      }
    } catch (err) { console.error('Load msg error:', err); }
    finally { setIsLoadingMore(false); setLoading(prev => ({ ...prev, messages: false })); }
  };

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const response = await api.get('/messages/groups');
      setGroups(response?.groups || response?.data?.groups || (Array.isArray(response) ? response : []));
    } catch (err) { console.error('Load groups error:', err); }
    finally { setIsLoadingGroups(false); }
  };

  const loadGroupMessages = async (groupId, loadMore = false) => {
    try {
      if (loadMore) setIsLoadingMore(true); else setLoading(prev => ({ ...prev, messages: true }));
      const response = await api.get(`/messages/groups/${groupId}/messages`, { page: loadMore ? groupPage + 1 : 1, limit: 20 });
      const data = response?.messages || response?.data?.messages || (Array.isArray(response) ? response : []);
      if (loadMore) {
        setGroupMessages(prev => [...data, ...prev]);
        setGroupPage(prev => prev + 1);
      } else {
        setGroupMessages(data);
        setGroupPage(1);
        shouldAutoScrollRef.current = true;
      }
      setHasMoreGroupMessages(data.length === 20);
    } catch (err) { console.error('Load group msg error:', err); }
    finally { setIsLoadingMore(false); setLoading(prev => ({ ...prev, messages: false })); }
  };

  const createGroup = async (groupData) => {
    try {
      const response = await api.post('/messages/groups/create', groupData);
      const newGroup = response?.group || response?.data;
      if (newGroup) {
        setGroups(prev => [newGroup, ...prev]);
        setSelectedGroup(newGroup);
        setActiveTab('groups');
        setShowNewGroup(false);
        showNotification('Group created', 'success');
        return newGroup;
      }
    } catch (err) { console.error('Create group error:', err); throw err; }
  };

  const loadUsers = async () => {
    try {
      const resp = await api.get('/auth/users', { role: 'all' });
      setUsers(resp?.users || resp?.data?.users || (Array.isArray(resp) ? resp : []));
    } catch (err) { console.error('Load users error:', err); }
  };

  const sendGroupMessage = async (groupId, content, attachment = null) => {
    try {
      const data = {
        group_id: groupId,
        content: content || '',
        message_type: attachment ? (attachment.message_type || 'file') : 'text',
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
        attachment_size: attachment?.size,
        attachment_type: attachment?.type
      };
      const resp = await api.post(`/messages/groups/${groupId}/message`, data);
      const msg = resp?.message || resp?.data || resp;
      if (msg) {
        setGroupMessages(prev => [...prev, msg]);
        updateGroupList({ message: msg }, false);
        if (socket) socket.emit('group_message', { ...msg, sender_id: user.id });
      }
    } catch (err) { console.error('Send group msg error:', err); }
  };

  const handleConversationSelect = (conv) => {
    setSelectedConversation(conv);
    setSelectedGroup(null);
    setSearchQuery('');
    if (!conv.id.startsWith('new_')) loadMessages(conv.id);
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    if (!user || !token) return;

    // Connect to Socket.io
    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat socket');
      newSocket.emit('user_connected', { user_id: user.id });
    });

    // Register all event handlers
    newSocket.on('new_message', handleIncomingMessage);
    newSocket.on('message_updated', handleMessageUpdated);
    newSocket.on('message_deleted', handleMessageDeleted);
    newSocket.on('typing', handleTypingIndicator);
    newSocket.on('unread_count_updated', (data) => setUnreadCount(data.total_unread_messages || data.count || 0));
    newSocket.on('user_online', (data) => updateUserStatus(data.user_id, true));
    newSocket.on('user_offline', (data) => updateUserStatus(data.user_id, false));

    setSocket(newSocket);

    // Initial Data Load
    const initLoad = async () => {
      try {
        await Promise.all([
          loadConversations(),
          loadGroups(),
          loadUnreadCount(),
          loadUsers()
        ]);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    initLoad();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user, token, handleIncomingMessage, handleMessageUpdated, handleMessageDeleted, handleTypingIndicator]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages, groupMessages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    if (!userId || !user || handledParamsRef.current === location.search) return;
    const autoSelectUser = async () => {
      const existing = conversations.find(c => String(c.other_participant?.id) === String(userId));
      if (existing) {
        handleConversationSelect(existing);
        handledParamsRef.current = location.search;
      } else if (!loading.conversations) {
        const details = await getUserDetails(userId);
        if (details?.profile) {
          const newC = { id: `new_${Date.now()}`, other_participant: { ...details.profile, id: userId }, type: 'direct' };
          setSelectedConversation(newC);
          setConversations(prev => [newC, ...prev]);
          handledParamsRef.current = location.search;
        }
      }
    };
    autoSelectUser();
  }, [location.search, conversations, loading.conversations, user]);


  const renderGroupItem = (group) => {
    if (!group) return null;

    const isSelected = selectedGroup?.id === group.id;
    const lastMessageTime = group.last_message?.timestamp
      ? formatDistanceToNow(parseDate(group.last_message.timestamp), { addSuffix: true })
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
    const text = newMessage.trim();
    if (!text && !attachment) {
      showNotification('Please enter a message or attach a file', 'warning');
      return;
    }

    try {
      // HANDLE GROUP MESSAGE
      if (activeTab === 'groups' && selectedGroup) {
        await sendGroupMessage(selectedGroup.id, text, attachment);
        setNewMessage('');
        setAttachment(null);
        return;
      }

      // HANDLE DIRECT MESSAGE
      if (!selectedConversation || (!selectedConversation.other_participant?.id && !selectedConversation.id?.startsWith('new_'))) {
        showNotification('Please select a conversation first', 'error');
        return;
      }

      const isNewConversation = !selectedConversation.id || selectedConversation.id.startsWith('new_');
      let messageType = 'text';
      let attachmentType = null;

      if (attachment) {
        if (attachment.message_type) {
          messageType = attachment.message_type;
          attachmentType = attachment.message_type;
        } else if (attachment.type?.startsWith('image/')) {
          messageType = 'image';
          attachmentType = 'image';
        } else if (attachment.type?.startsWith('video/')) {
          messageType = 'video';
          attachmentType = 'video';
        } else if (attachment.type?.startsWith('audio/')) {
          messageType = 'audio';
          attachmentType = 'audio';
        } else {
          messageType = 'file';
          attachmentType = 'file';
        }
      }

      const messageData = {
        receiver_id: selectedConversation.other_participant?.id,
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

      const optimisticMessage = {
        id: `temp_${Date.now()}`,
        content: text,
        message_type: messageType,
        sender: user,
        sender_id: user.id,
        receiver_id: selectedConversation?.other_participant?.id,
        conversation_id: selectedConversation?.id,
        created_at: new Date().toISOString(),
        status: 'sending'
      };

      setMessages(prev => [...prev, optimisticMessage]);

      const response = await api.post('/messages/send', messageData);

      if (isNewConversation && response.conversation_id) {
        const newConvId = response.conversation_id;
        setSelectedConversation(prev => ({ ...prev, id: newConvId }));
        loadConversations(); // Refresh list to get actual ID
      }

      const normalizeMessage = (msg) => ({
        id: msg.id || msg._id || `msg_${Date.now()}`,
        content: msg.content || '',
        sender: msg.sender || user,
        sender_id: msg.sender_id || user.id,
        receiver_id: msg.receiver_id,
        conversation_id: msg.conversation_id || selectedConversation.id,
        created_at: msg.created_at || new Date().toISOString(),
        message_type: msg.message_type || 'text',
        attachment_url: msg.attachment_url || null
      });

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
        return [...filtered, normalizeMessage(response.data || response)];
      });

      if (socket) {
        socket.emit('send_message', {
          conversation_id: response.conversation_id || selectedConversation?.id,
          sender_id: user.id,
          receiver_id: selectedConversation?.other_participant?.id,
          content: text,
          message_type: messageType
        });
      }

      setNewMessage('');
      setAttachment(null);
      shouldAutoScrollRef.current = true;
    } catch (err) {
      console.error('Error sending message:', err);
      showNotification('Failed to send message', 'error');
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
    }
  };



  const TypingIndicator = ({ users }) => {
    if (!users || users.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1, ml: 1 }}>
        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', animation: 'pulse 1.5s infinite' }}>T</Avatar>
        <Box sx={{ backgroundColor: 'white', borderRadius: 2, p: 1, display: 'flex', gap: 0.5, alignItems: 'center', boxShadow: 1 }}>
          <Box className="typing-dot" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'grey.500' }} />
          <Box className="typing-dot" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'grey.500' }} />
          <Box className="typing-dot" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'grey.500' }} />
          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
            {users.length === 1 ? `${users[0]} is typing...` : `${users.length} people typing...`}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Add new group dialog component
  // Add new group dialog component
  const NewGroupDialog = ({ open, onClose, user, api, initialSelectedUsers = [] }) => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [searchUsers, setSearchUsers] = useState('');
    const [selectedUsers, setSelectedUsers] = useState(initialSelectedUsers);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    // Load all users when dialog opens
    useEffect(() => {
      if (open) {
        loadAvailableUsers();
        if (initialSelectedUsers.length > 0) {
          setSelectedUsers(initialSelectedUsers);
        }
      }
    }, [open, initialSelectedUsers]);

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
                                role === 'influencer'
                                  ? `${u.niche || 'No niche specified'} • ${u.full_name || u.username}`
                                  : `${u.company_name || 'No company name'} • ${u.industry || u.username}`
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
    if (socket && selectedConversation && selectedConversation.id && selectedConversation.other_participant) {
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



  const startNewConversation = async () => {
    if (selectedUsers.length === 0) {
      showNotification('Please select a user to start a conversation', 'error');
      return;
    }

    try {
      if (selectedUsers.length > 1) {
        setShowNewChat(false);
        setShowNewGroup(true);
        return;
      }
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
          title: getProfileDisplayName(participant),
          other_participant: {
            ...participant,
            id: participant.id,
            display_name: getProfileDisplayName(participant),
            role: participant.role || (userRole === 'brand' ? 'influencer' : 'brand'),
            profile_picture: getProfileImage(participant)
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

  const updateUserStatus = (userId, isOnline) => {
    const statusData = { is_online: isOnline, last_seen: new Date().toISOString() };

    setConversations(prev => prev.map(conv => {
      if (conv.other_participant?.id === userId) {
        return { ...conv, other_participant: { ...conv.other_participant, ...statusData } };
      }
      return conv;
    }));

    if (selectedConversation?.other_participant?.id === userId) {
      setSelectedConversation(prev => ({
        ...prev,
        other_participant: { ...prev.other_participant, ...statusData }
      }));
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Last seen recently';
    try {
      const date = parseDate(timestamp);
      if (isNaN(date.getTime())) return 'Last seen recently';

      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;

      return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (err) {
      return 'Last seen recently';
    }
  };

  const parseDate = (timestamp) => {
    if (!timestamp) return new Date();
    if (typeof timestamp !== 'string') return new Date(timestamp);
    // If it doesn't have timezone info (no Z, +, or - after the time part), assume UTC
    // Direct matches for ISO strings like '2024-04-14T09:27:00'
    const hasTimeZone = timestamp.includes('Z') || (timestamp.includes('+') && timestamp.indexOf('+') > 10) || (timestamp.includes('-') && timestamp.lastIndexOf('-') > 10);
    const utcTimestamp = hasTimeZone ? timestamp : timestamp + 'Z';
    return new Date(utcTimestamp);
  };

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) return 'Just now';
      const date = parseDate(timestamp);
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

      // Validate file size (max 50MB) 
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification(`File size should be less than 50MB`, 'error');
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Show immediate optimistic feeling
        setAttachment({
          name: file.name,
          size: file.size,
          type: file.type,
          isUploading: true
        });

        const response = await api.upload('/attachments/upload', file, (progress) => {
          setUploadProgress(progress);
        });

        if (response && response.success) {
          setAttachment({
            url: response.url,
            name: response.filename,
            type: file.type,
            size: response.file_size,
            storage_id: response.storage_id,
            isUploaded: true,
            message_type: response.file_type
          });
          showNotification(`File uploaded: ${response.filename}`, 'success');
        }
      } catch (err) {
        console.error('Error handling attachment:', err);
        setAttachment(null);
        showNotification('Failed to upload file. Please try again.', 'error');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
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
    const displayName = getProfileDisplayName(message.sender);
    const profilePic = getProfileImage(message.sender);
    const myProfilePic = getProfileImage(user);
    const myDisplayName = getProfileDisplayName(user);

    const getMessageStatus = (msg) => {
      if (msg.is_sending) return { icon: <ScheduleIcon sx={{ fontSize: 14, opacity: 0.7 }} />, text: 'Sending...' };
      if (msg.is_deleted) return { icon: <ErrorIcon sx={{ fontSize: 14 }} color="error" />, text: 'Deleted' };
      if (msg.is_read) return { icon: <DoubleCheckIcon sx={{ fontSize: 16, color: '#4caf50' }} />, text: 'Read' }; // WhatsApp-style Green
      if (msg.is_delivered) return { icon: <DoubleCheckIcon sx={{ fontSize: 16, opacity: 0.6 }} />, text: 'Delivered' };
      return { icon: <CheckIcon sx={{ fontSize: 16, opacity: 0.6 }} />, text: 'Sent' };
    };

    const displayContent =
      message.content ||
      message.text ||
      message.body ||
      '[Empty message]';

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
            src={getProfileImage(message.sender)}
            sx={{ width: 36, height: 36, mt: 'auto', mr: 1, boxShadow: 1 }}
          >
            {getProfileDisplayName(message.sender)?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}

        <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isOwnMessage ? 'flex-end' : 'flex-start' }}>
          <Typography variant="caption" color="text.secondary" sx={{ [isOwnMessage ? 'mr' : 'ml']: 1, mb: 0.5, fontWeight: 500 }}>
            {getProfileDisplayName(isOwnMessage ? user : message.sender)}
          </Typography>

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
              <>
                {message.message_type === 'image' || message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ? (
                  <Box sx={{ maxWidth: 300, cursor: 'pointer' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 0.5,
                        backgroundColor: 'white',
                        borderRadius: 2,
                        border: 1,
                        borderColor: isOwnMessage ? 'primary.light' : 'divider',
                        overflow: 'hidden'
                      }}
                      onClick={() => handleAttachmentClick(message.attachment_url, 'image')}
                    >
                      <img
                        src={message.attachment_url}
                        alt="Attachment"
                        style={{
                          width: '100%',
                          borderRadius: 4,
                          maxHeight: 250,
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                      {message.content && (
                        <Typography variant="body2" sx={{ p: 1, color: 'text.primary' }}>
                          {message.content}
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                ) : message.message_type === 'video' || message.attachment_url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      width: 260,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'white',
                      border: '1px solid',
                      borderColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'grey.50' }
                    }}
                    onClick={() => handleAttachmentClick(message.attachment_url, 'video')}
                  >
                    <Box sx={{ position: 'relative', width: '100%', pt: '56.25%', bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <VideocamIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: isOwnMessage ? 'white' : 'text.primary', flex: 1 }} noWrap>
                        {message.attachment_name || 'Video Attachment'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                        {message.attachment_size ? `${Math.round(message.attachment_size / (1024 * 1024) * 10) / 10} MB` : ''}
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      width: 260,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.1)' : 'white',
                      border: '1px solid',
                      borderColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'divider',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: isOwnMessage ? 'rgba(255,255,255,0.2)' : 'grey.50' }
                    }}
                    onClick={() => window.open(message.attachment_url, '_blank')}
                  >
                    <Avatar sx={{ bgcolor: isOwnMessage ? 'white' : 'primary.main', width: 40, height: 40, boxShadow: 1 }}>
                      <FileIcon color={isOwnMessage ? 'primary' : 'inherit'} />
                    </Avatar>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: isOwnMessage ? 'white' : 'text.primary' }} noWrap>
                        {message.attachment_name || (typeof message.attachment_url === 'string' ? message.attachment_url.split('/').pop() : 'Attachment')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {message.attachment_size ? `${Math.round(message.attachment_size / 1024)} KB` : 'Download File'}
                      </Typography>
                    </Box>
                  </Paper>
                )}
                {message.content && message.message_type !== 'image' && (
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {displayContent || '[Empty message]'}
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
            src={getProfileImage(user)}
            sx={{ width: 36, height: 36, mt: 'auto', ml: 1, boxShadow: 1 }}
          >
            {getProfileDisplayName(user)?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}
      </Box>
    );
  };
  const renderConversationItem = (conversation) => {
    if (!conversation) return null;

    const isSelected = selectedConversation?.id === conversation.id;
    const lastMessageTime = conversation.last_message?.timestamp
      ? formatDistanceToNow(parseDate(conversation.last_message.timestamp), { addSuffix: true })
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
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
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
                  onChange={(e, newValue) => {
                    setActiveTab(newValue);
                    if (newValue === 'groups') loadGroups();
                  }}
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
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="small" />
                        <Typography variant="body2">Groups</Typography>
                        {groups.some(g => (g.unread_count || 0) > 0) && (
                          <Badge
                            badgeContent={groups.reduce((acc, g) => acc + (g.unread_count || 0), 0)}
                            color="error"
                            size="small"
                          />
                        )}
                      </Box>
                    }
                    value="groups"
                  />
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
                        {selectedConversation.other_participant ? (
                          <>
                            <Badge
                              color={selectedConversation.other_participant.is_online ? 'success' : 'default'}
                              variant="dot"
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              sx={{
                                '& .MuiBadge-badge': {
                                  backgroundColor: selectedConversation.other_participant.is_online ? '#44b700' : '#bdbdbd',
                                  color: selectedConversation.other_participant.is_online ? '#44b700' : '#bdbdbd',
                                  boxShadow: `0 0 0 2px #fff`,
                                  '&::after': selectedConversation.other_participant.is_online ? {
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    animation: 'ripple 1.2s infinite ease-in-out',
                                    border: '1px solid currentColor',
                                    content: '""',
                                  } : {}
                                }
                              }}
                            >
                              <Avatar
                                src={getProfileImage(selectedConversation.other_participant)}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: selectedConversation.other_participant.role === 'brand' ? 'primary.main' : 'secondary.main',
                                  border: '2px solid #fff',
                                  boxShadow: 1
                                }}
                              >
                                {getProfileDisplayName(selectedConversation.other_participant)?.charAt(0)?.toUpperCase() || 'U'}
                              </Avatar>
                            </Badge>

                            <Box>
                              <Typography
                                variant="subtitle1"
                                onClick={() => handleViewProfile(selectedConversation.other_participant)}
                                role="button"
                                sx={{
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  fontWeight: 700,
                                  '&:hover': { color: 'primary.main' }
                                }}
                              >
                                {getProfileDisplayName(selectedConversation.other_participant)}
                                <Chip
                                  label={getRoleLabel(selectedConversation.other_participant.role || 'user')}
                                  size="small"
                                  color={getRoleColor(selectedConversation.other_participant.role || 'user')}
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              </Typography>

                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.8 }}>
                                {typingIndicator ? (
                                  <Typography variant="caption" color="primary.main" className="pulse-text">
                                    {typingIndicator}
                                  </Typography>
                                ) : (
                                  <>
                                    {selectedConversation.other_participant.is_online ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 8, height: 8, bgcolor: '#44b700', borderRadius: '50%' }} />
                                        <Typography variant="caption" sx={{ color: '#44b700', fontWeight: 600 }}>Active Now</Typography>
                                      </Box>
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        {formatLastSeen(selectedConversation.other_participant.last_seen)}
                                      </Typography>
                                    )}
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <Typography variant="h6">Direct Conversation</Typography>
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
                  ) : selectedGroup ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && (
                          <IconButton onClick={() => setSelectedGroup(null)} sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                          </IconButton>
                        )}

                        <Badge
                          color="primary"
                          variant="dot"
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                          <Avatar
                            src={selectedGroup.avatar_url}
                            sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}
                          >
                            {selectedGroup.name?.charAt(0)?.toUpperCase() || 'G'}
                          </Avatar>
                        </Badge>

                        <Box>
                          <Typography variant="h6">{selectedGroup.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedGroup.participant_count || 0} participants
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={() => setShowInfo(!showInfo)} title="Group Info">
                          <InfoIcon />
                        </IconButton>

                        <Tooltip title="Refresh Messages">
                          <IconButton
                            onClick={() => loadGroupMessages(selectedGroup.id)}
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
                      <Typography variant="h6">Select a conversation or group</Typography>
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
                  {/* Prepend loading indicator / Manual load trigger */}
                  {(hasMoreMessages || isLoadingMore) && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      {isLoadingMore ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                          onClick={() => activeTab === 'direct' ? loadMessages(selectedConversation.id, true) : loadGroupMessages(selectedGroup.id, true)}
                        >
                          Scroll up or click to load previous messages
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Your messages list here */}
                  {activeTab === 'direct'
                    ? messages.map(renderMessageBubble)
                    : groupMessages.map(renderMessageBubble)
                  }

                  {/* Typing indicator */}
                  {typingUsersList.length > 0 && <TypingIndicator users={typingUsersList} />}

                  {/* Scroll to bottom anchor */}
                  <div ref={messagesEndRef} />



                  {loading.messages ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (activeTab === 'direct' ? messages.length === 0 && selectedConversation : groupMessages.length === 0 && selectedGroup) ? (
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
                        src={activeTab === 'direct' ? selectedConversation?.other_participant?.profile_picture : selectedGroup?.avatar_url}
                        sx={{
                          width: 100,
                          height: 100,
                          mb: 3,
                          bgcolor: activeTab === 'direct'
                            ? (selectedConversation?.other_participant?.role === 'brand' ? 'primary.main' : 'secondary.main')
                            : 'secondary.main'
                        }}
                      >
                        {activeTab === 'direct'
                          ? (selectedConversation?.other_participant?.username?.charAt(0)?.toUpperCase() || 'U')
                          : (selectedGroup?.name?.charAt(0)?.toUpperCase() || 'G')
                        }
                      </Avatar>
                      <Typography variant="h5" gutterBottom>
                        {activeTab === 'direct'
                          ? getProfileDisplayName(selectedConversation?.other_participant)
                          : selectedGroup?.name
                        }
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {activeTab === 'direct'
                          ? getRoleLabel(selectedConversation?.other_participant?.role || 'user')
                          : `${selectedGroup?.participant_count || 0} participants`
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2, maxWidth: 400 }}>
                        {activeTab === 'direct'
                          ? `This is the beginning of your conversation with ${getProfileDisplayName(selectedConversation?.other_participant)}. Send a message to start the conversation!`
                          : `Welcome to ${selectedGroup?.name}. Start chatting with the group members!`
                        }
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
                      mb: 1.5,
                      p: 1.5,
                      backgroundColor: attachment.isUploading ? 'primary.50' : 'grey.100',
                      border: '1px solid',
                      borderColor: attachment.isUploading ? 'primary.100' : 'grey.200',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, overflow: 'hidden' }}>
                          <Avatar sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', width: 32, height: 32 }}>
                            <FileIcon color="primary" sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {attachment.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(attachment.size / 1024)} KB • {attachment.isUploading ? 'Uploading...' : 'Done'}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setAttachment(null)}
                          disabled={isUploading}
                          sx={{ ml: 1 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {attachment.isUploading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                          <Typography variant="caption" sx={{ minWidth: 35, fontWeight: 700 }}>{uploadProgress}%</Typography>
                        </Box>
                      )}
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
                          disabled={(!newMessage.trim() && !attachment) || !selectedConversation || isUploading}
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
        {showInfo && (selectedConversation || selectedGroup) && (
          <Grid item sx={{
            width: { md: 280, lg: 320 }, // Fixed width
            height: '100%',
            display: { xs: 'none', md: 'block' },
            flexShrink: 0
          }}>
            <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedGroup ? 'Group Information' : 'Conversation Details'}
                </Typography>
                <IconButton onClick={() => setShowInfo(false)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {selectedConversation ? (
                  <>
                    {(() => {
                      const participant = selectedConversation.other_participant;
                      if (!participant) return null;

                      return (
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                          <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                            <Avatar
                              src={getProfileImage(participant)}
                              onClick={() => handleViewProfile(participant)}
                              sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                border: 4,
                                borderColor: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                backgroundColor: participant.role === 'brand' ? 'primary.main' : 'secondary.main'
                              }}
                            >
                              {getProfileDisplayName(participant)?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box sx={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              width: 16,
                              height: 16,
                              bgcolor: participant.is_online ? '#4caf50' : '#bdbdbd',
                              border: 2,
                              borderColor: 'white',
                              borderRadius: '50%'
                            }} />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 0.5, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            onClick={() => handleViewProfile(participant)}
                          >
                            {getProfileDisplayName(participant)}
                          </Typography>

                          <Chip
                            label={getRoleLabel(participant.role || 'user')}
                            color={getRoleColor(participant.role || 'user')}
                            size="small"
                            sx={{ mb: 2, fontWeight: 600 }}
                          />
                        </Box>
                      );
                    })()}

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                      Quick Actions
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={favorites.has(selectedConversation.id) ? <StarIcon /> : <StarBorderIcon />}
                        onClick={() => handleToggleFavorite(selectedConversation.id)}
                        sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                      >
                        {favorites.has(selectedConversation.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={selectedConversation.is_muted ? <VolumeUpIcon /> : <MuteIcon />}
                        onClick={() => updateConversationSettings({ is_muted: !selectedConversation.is_muted })}
                        sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                      >
                        {selectedConversation.is_muted ? 'Unmute' : 'Mute Notifications'}
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        color="secondary"
                        startIcon={<ArchiveIcon />}
                        onClick={() => updateConversationSettings({ is_archived: !selectedConversation.is_archived })}
                        sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                      >
                        {selectedConversation.is_archived ? 'Unarchive' : 'Archive Conversation'}
                      </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                      Conversation Insights
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Total Messages</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedConversation.message_count || messages.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Unread</Typography>
                        <Chip label={selectedConversation.unread_count || 0} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Last Interaction</Typography>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                          {selectedConversation.updated_at ? formatDistanceToNow(new Date(selectedConversation.updated_at), { addSuffix: true }) : 'Never'}
                        </Typography>
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        Conversation ID: {selectedConversation.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </>
                ) : selectedGroup ? (
                  <>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Avatar
                        src={selectedGroup.avatar_url}
                        sx={{
                          width: 100,
                          height: 100,
                          mx: 'auto',
                          mb: 2,
                          border: 4,
                          borderColor: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          backgroundColor: 'secondary.main'
                        }}
                      >
                        {selectedGroup.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {selectedGroup.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {selectedGroup.description || 'No description provided'}
                      </Typography>
                      <Chip
                        label={`${selectedGroup.participant_count || 0} Members`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                      Stats
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'transparent' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">Total Messages</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {selectedGroup.message_count || groupMessages.length || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Created On</Typography>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                          {selectedGroup.created_at ? format(new Date(selectedGroup.created_at), 'PP') : 'Unknown'}
                        </Typography>
                      </Box>
                    </Paper>

                    <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        Group ID: {selectedGroup.id.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </>
                ) : null}
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
              {selectedUsers.map(u => (
                <Chip
                  key={u.id}
                  avatar={<Avatar src={getProfileImage(u)}>{getProfileDisplayName(u).charAt(0)}</Avatar>}
                  label={getProfileDisplayName(u)}
                  onDelete={() => setSelectedUsers(prev => prev.filter(user => user.id !== u.id))}
                  color={getRoleColor(u.role)}
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
                    onClick={() => {
                      const isSelected = selectedUsers.some(u => u.id === user.id);
                      if (isSelected) {
                        setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                      } else {
                        setSelectedUsers(prev => [...prev, user]);
                      }
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
                      <Avatar src={getProfileImage(user)} sx={{ bgcolor: `${getRoleColor(user.role)}.main` }}>
                        {getProfileDisplayName(user).charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {getProfileDisplayName(user)}
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
                        user.role === 'influencer'
                          ? `${user.niche || 'No niche specified'} • ${user.full_name || user.username}`
                          : `${user.company_name || 'No company name'} • ${user.industry || user.username}`
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
              onClick={() => {
                const participant = selectedForMenu?.other_participant;
                if (participant) {
                  handleViewProfile(participant);
                } else if (selectedForMenu?.type === 'group') {
                  showNotification('Group profile viewing not yet available', 'info');
                }
                setMenuAnchorEl(null);
              }}
            >
              View {selectedForMenu?.type === 'group' ? 'Group Info' : 'Profile'}
            </Button>
            <MenuItem onClick={() => {
              if (selectedForMenu?.id) handleToggleFavorite(selectedForMenu.id);
              setMenuAnchorEl(null);
            }}>
              {favorites.has(selectedForMenu?.id) ? (
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
              if (selectedForMenu) updateConversationSettings({ is_muted: !selectedForMenu.is_muted });
              setMenuAnchorEl(null);
            }}>
              {selectedForMenu?.is_muted ? (
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
              if (selectedForMenu) updateConversationSettings({ is_archived: !selectedForMenu.is_archived });
              setMenuAnchorEl(null);
            }}>
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              {selectedForMenu?.is_archived ? 'Unarchive' : 'Archive'}
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
        onClose={() => {
          setShowNewGroup(false);
          setSelectedUsers([]);
        }}
        user={user}
        api={api}
        initialSelectedUsers={selectedUsers}
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
        @keyframes ripple {
          0% { transform: scale(.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .pulse-text {
          animation: pulse 1.5s infinite ease-in-out;
        }

        .online-pulse {
          animation: online-pulse 2s infinite;
        }

        @keyframes online-pulse {
          0% { box-shadow: 0 0 0 0 rgba(68, 183, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(68, 183, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(68, 183, 0, 0); }
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