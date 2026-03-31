// // src/components/ChatApp.jsx - Updated with missing functions
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API_BASE_URL from "../config/api";
// import '../style/ChatApp.css';
// import { 
//   formatMessageTime, 
//   formatConversationTime, 
//   getLastActive,
//   getFileIcon,
//   formatFileSize,
//   validateFileUpload,
//   getProfilePictureUrl,
//   getDisplayName,
//   getUserCategories,
//   getUserBio,
//   getFollowerCount,
//   generateAvatarInitial,
//   debounce
// } from './utils/chatUtils';
// import { 
//   getPlanDisplayName, 
//   getPlanColor, 
//   checkMessagePermission,
//   fetchChatUsage,
//   checkConversationLimit 
// } from './utils/subscriptionUtils';
// import { websocketManager } from './utils/websocket';

// const ChatApp = () => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const token = localStorage.getItem('access_token');
//   const navigate = useNavigate();

//   const isBrand = user.role === 'brand';
//   const isInfluencer = user.role === 'influencer';

//   // State
//   const [conversations, setConversations] = useState([]);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [suggestedUsers, setSuggestedUsers] = useState([]);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('chats');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [userProfiles, setUserProfiles] = useState({});
//   const [onlineUsers, setOnlineUsers] = useState(new Set());
//   const [messageSending, setMessageSending] = useState(false);
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const [uploadingMedia, setUploadingMedia] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [fileCaption, setFileCaption] = useState('');
//   const [showFileModal, setShowFileModal] = useState(false);
//   const [mediaCache, setMediaCache] = useState(new Map());
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
//   const [subscriptionData, setSubscriptionData] = useState(null);

//   // Refs
//   const messagesEndRef = useRef(null);
//   const messagesStartRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const textareaRef = useRef(null);
//   const sidebarRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const isMountedRef = useRef(true);
//   const messagesContainerRef = useRef(null);
//   const heartbeatIntervalRef = useRef(null);

//   // Constants
//   const targetRole = isBrand ? 'influencer' : 'brand';
//   const searchPlaceholder = isBrand ? 'Search influencers...' : 'Search brands...';
//   const discoverTabName = isBrand ? 'Discover Influencers' : 'Discover Brands';
//   const discoverIcon = isBrand ? '⭐' : '🏢';
//   const quickMessages = isBrand ? [
//     "Hi! I'd love to collaborate with you.",
//     "Could you share your media kit?",
//     "What are your rates for sponsored content?",
//     "What type of content do you specialize in?",
//     "I'm interested in a campaign partnership.",
//     "What's your availability for collaborations?",
//     "Could you share your audience demographics?"
//   ] : [
//     "Hi! I'd love to collaborate with your brand.",
//     "Could you share more details about the campaign?",
//     "What are your expectations for this partnership?",
//     "What's the budget for this collaboration?",
//     "I'm available for a call to discuss further.",
//     "Here's my media kit for your review.",
//     "What timeline are you thinking for this campaign?"
//   ];

//   // Initialize WebSocket
//   const initializeWebSocket = useCallback(() => {
//     const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
//     const baseUrl = API_BASE_URL.replace(/^https?:\/\//, "");
//     const wsUrl = `${wsProtocol}://${baseUrl}/chat/ws`;

//     websocketManager.connect(
//       wsUrl,
//       token,
//       handleWebSocketMessage,
//       () => {
//         setConnectionStatus('connected');
//         setError(null);
        
//         // Start heartbeat
//         heartbeatIntervalRef.current = setInterval(() => {
//           if (websocketManager.isConnected()) {
//             websocketManager.send({ type: 'ping' });
//           }
//         }, 30000);
//       },
//       (event) => {
//         setConnectionStatus('disconnected');
//         clearInterval(heartbeatIntervalRef.current);
        
//         if (event.code !== 1000) {
//           setTimeout(() => initializeWebSocket(), 3000);
//         }
//       },
//       (error) => {
//         setConnectionStatus('error');
//         setError('Connection error - unable to send/receive messages');
//         clearInterval(heartbeatIntervalRef.current);
//       }
//     );
//   }, [token]);

//   // Handle WebSocket messages
//   const handleWebSocketMessage = useCallback((data) => {
//     try {
//       switch (data.type) {
//         case 'connection_established':
//           console.log('WebSocket connected:', data);
//           break;

//         case 'new_message':
//           handleIncomingMessage(data.message);
//           break;

//         case 'typing_indicator':
//           handleTypingIndicator(data);
//           break;

//         case 'message_sent':
//           handleMessageSentConfirmation(data);
//           break;

//         case 'read_receipt':
//           handleReadReceipt(data);
//           break;

//         case 'presence_update':
//           handlePresenceUpdate(data);
//           break;

//         case 'presence_info':
//           handlePresenceInfo(data);
//           break;

//         case 'message_deleted':
//           handleMessageDeleted(data);
//           break;

//         case 'message_edited':
//           handleMessageEdited(data);
//           break;

//         case 'reaction':
//           handleReaction(data);
//           break;

//         case 'conversation_read':
//           handleConversationRead(data);
//           break;

//         case 'new_conversation':
//           handleNewConversation(data);
//           break;

//         case 'heartbeat':
//           // Update connection status
//           break;

//         case 'limits_update':
//           setSubscriptionData(prev => ({
//             ...prev,
//             ...data.limits
//           }));
//           break;

//         case 'subscription_update':
//           setSubscriptionData(prev => ({
//             ...prev,
//             ...data.subscription
//           }));
//           break;

//         case 'error':
//           setError(data.message);
//           break;

//         default:
//           console.log('Unknown message type:', data.type);
//       }
//     } catch (error) {
//       console.error('Error handling WebSocket message:', error);
//     }
//   }, []);

//   // Message handlers - ADD ALL MISSING FUNCTIONS
//   const handleIncomingMessage = useCallback((message) => {
//     setMessages(prev => {
//       const messageExists = prev.some(msg => msg.id === message.id);
//       if (messageExists) return prev;

//       const newMessages = [...prev, { ...message, animate: true }];
      
//       setTimeout(() => {
//         if (isMountedRef.current) {
//           setMessages(current => 
//             current.map(msg => 
//               msg.id === message.id ? { ...msg, animate: false } : msg
//             )
//           );
//         }
//       }, 500);
      
//       return newMessages;
//     });

//     // Update conversation list
//     setConversations(prev => prev.map(conv => 
//       conv.id === message.conversation_id
//         ? { 
//             ...conv, 
//             last_message: message.content,
//             last_message_type: message.message_type,
//             last_message_timestamp: message.timestamp,
//             unread_count: selectedConversation === message.conversation_id ? 0 : (conv.unread_count || 0) + 1
//           }
//         : conv
//     ));

//     if (selectedConversation === message.conversation_id) {
//       sendReadReceipt(message.id, message.conversation_id);
//     }
//   }, [selectedConversation]);

//   const handleMessageSentConfirmation = useCallback((data) => {
//     setMessageSending(false);
//     setMessages(prev => prev.map(msg =>
//       msg.temp_id === data.temp_id 
//         ? { ...data.message, temp_id: undefined }
//         : msg
//     ));
//   }, []);

//   const handleTypingIndicator = useCallback((data) => {
//     if (data.conversation_id === selectedConversation) {
//       setOtherUserTyping(true);
//       setTimeout(() => {
//         if (isMountedRef.current) {
//           setOtherUserTyping(false);
//         }
//       }, 3000);
//     }
//   }, [selectedConversation]);

//   const handleReadReceipt = useCallback((data) => {
//     setMessages(prev => prev.map(msg =>
//       msg.id === data.message_id 
//         ? { ...msg, read: true, read_at: data.read_at }
//         : msg
//     ));
//   }, []);

//   const handlePresenceUpdate = useCallback((data) => {
//     if (data.is_online) {
//       setOnlineUsers(prev => new Set([...prev, data.user_id]));
//     } else {
//       setOnlineUsers(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(data.user_id);
//         return newSet;
//       });
//     }
//   }, []);

//   // ADD ALL MISSING HANDLER FUNCTIONS
//   const handlePresenceInfo = useCallback((data) => {
//     if (data.user_info) {
//       setUserProfiles(prev => ({
//         ...prev,
//         [data.user_info.id]: data.user_info
//       }));
//     }
//   }, []);

//   const handleMessageDeleted = useCallback((data) => {
//     setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
//   }, []);

//   const handleMessageEdited = useCallback((data) => {
//     setMessages(prev => prev.map(msg =>
//       msg.id === data.message_id
//         ? { ...msg, content: data.new_content, edited: true, edited_at: data.timestamp }
//         : msg
//     ));
//   }, []);

//   const handleReaction = useCallback((data) => {
//     setMessages(prev => prev.map(msg => {
//       if (msg.id === data.message_id) {
//         const reactions = msg.reactions || [];
//         const existingIndex = reactions.findIndex(r => r.user_id === data.user_id);
        
//         if (existingIndex >= 0) {
//           // Update existing reaction
//           const updatedReactions = [...reactions];
//           updatedReactions[existingIndex] = {
//             ...updatedReactions[existingIndex],
//             reaction: data.reaction,
//             timestamp: data.timestamp
//           };
//           return { ...msg, reactions: updatedReactions };
//         } else {
//           // Add new reaction
//           return {
//             ...msg,
//             reactions: [
//               ...reactions,
//               {
//                 user_id: data.user_id,
//                 reaction: data.reaction,
//                 timestamp: data.timestamp
//               }
//             ]
//           };
//         }
//       }
//       return msg;
//     }));
//   }, []);

//   const handleConversationRead = useCallback((data) => {
//     setConversations(prev => prev.map(conv =>
//       conv.id === data.conversation_id
//         ? { ...conv, unread_count: 0 }
//         : conv
//     ));
//   }, []);

//   const handleNewConversation = useCallback((data) => {
//     // Refresh conversations list when new conversation is created
//     loadConversations();
//   }, []);

//   // Load data functions
//   const loadConversations = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) throw new Error('Failed to load conversations');
      
//       const data = await response.json();
//       setConversations(data.conversations || []);
//     } catch (error) {
//       console.error('Error loading conversations:', error);
//       setError('Failed to load conversations');
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   const loadMessages = async (conversationId, page = 1, loadMore = false) => {
//   if (loadMore && loadingOlderMessages) return;
  
//   try {
//     if (loadMore) {
//       setLoadingOlderMessages(true);
//     } else {
//       setMessages([]);
//       setCurrentPage(1);
//       setHasMoreMessages(true);
//     }
    
//     const response = await fetch(
//       `${API_BASE_URL}/chat/conversations/${conversationId}/messages?page=${page}&limit=50`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     if (!response.ok) {
//       throw new Error('Failed to load messages');
//     }
    
//     const data = await response.json();
//     const messagesList = data.messages || [];
    
//     if (loadMore) {
//       setMessages(prev => [...messagesList, ...prev]);
//       setCurrentPage(page);
//       setHasMoreMessages(messagesList.length === 50);
//     } else {
//       setMessages(messagesList);
//       setSelectedConversation(conversationId);
      
//       // Mark messages as read
//       try {
//         await markMessagesAsRead(conversationId);
//       } catch (error) {
//         console.error('Failed to mark messages as read:', error);
//       }
//     }
//   } catch (error) {
//     console.error('Error loading messages:', error);
//     setError('Failed to load messages');
//   } finally {
//     setLoadingOlderMessages(false);
//   }
// };

//   const loadSuggestedUsers = useCallback(async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/chat/users/search?query=&role=${targetRole}&limit=10`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       if (response.ok) {
//         const data = await response.json();
//         setSuggestedUsers(data.users || []);
//       }
//     } catch (error) {
//       console.error('Error loading suggested users:', error);
//     }
//   }, [token, targetRole]);

//   const loadUserProfile = useCallback(async (userId) => {
//     if (!userId || userProfiles[userId]) return;

//     try {
//       const response = await fetch(`${API_BASE_URL}/chat/users/${userId}/profile`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setUserProfiles(prev => ({
//           ...prev,
//           [userId]: data.profile
//         }));
//       }
//     } catch (error) {
//       console.error('Error loading user profile:', error);
//     }
//   }, [token, userProfiles]);

//   const searchUsers = debounce(async (query) => {
//     if (query.length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/chat/users/search?query=${encodeURIComponent(query)}&role=${targetRole}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       if (response.ok) {
//         const data = await response.json();
//         setSearchResults(data.users || []);
//       }
//     } catch (error) {
//       console.error('Error searching users:', error);
//       setSearchResults([]);
//     }
//   }, 300);

//   // Core chat functions
//   const sendMessage = async () => {
//   if (!newMessage.trim() || !selectedConversation || messageSending) return;

//   // Check message permission
//   const permission = await checkMessagePermission(token, 'text');
//   if (!permission.allowed) {
//     setError(permission.message);
//     return;
//   }

//   // Find the conversation
//   const conversation = conversations.find(c => c.conversation_id === selectedConversation);
  
//   if (!conversation) {
//     setError('Conversation not found');
//     return;
//   }

//   const otherUserId = conversation.other_user?.id;
//   if (!otherUserId) {
//     setError('Cannot determine recipient');
//     return;
//   }

//   const tempId = `temp_${Date.now()}`;
//   const messageData = {
//     type: 'message',
//     conversation_id: selectedConversation,
//     content: newMessage.trim(),
//     receiver_id: otherUserId,
//     message_type: 'text',
//     temp_id: tempId
//   };

//   if (websocketManager.send(messageData)) {
//     setMessageSending(true);
    
//     const tempMessage = {
//       id: tempId,
//       content: newMessage.trim(),
//       sender_id: user.id,
//       receiver_id: otherUserId,
//       conversation_id: selectedConversation,
//       message_type: 'text',
//       timestamp: new Date().toISOString(),
//       read: false,
//       delivered: false,
//       temp_id: tempId
//     };
    
//     setMessages(prev => [...prev, tempMessage]);
    
//     // Update conversation
//     setConversations(prev => prev.map(conv =>
//       conv.conversation_id === selectedConversation
//         ? {
//             ...conv,
//             last_message: newMessage.trim(),
//             last_message_type: 'text',
//             last_message_timestamp: new Date().toISOString()
//           }
//         : conv
//     ));
    
//     setNewMessage('');
//     stopTyping();
//   } else {
//     setError('Not connected to chat server. Please try refreshing.');
//   }
// };

//   const sendReadReceipt = (messageId, conversationId) => {
//     websocketManager.send({
//       type: 'read_receipt',
//       message_id: messageId,
//       conversation_id: conversationId
//     });
//   };

//   const markMessagesAsRead = async (conversationId) => {
//     try {
//       await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       setConversations(prev => prev.map(conv =>
//         conv.id === conversationId
//           ? { ...conv, unread_count: 0 }
//           : conv
//       ));
//     } catch (error) {
//       console.error('Error marking messages as read:', error);
//     }
//   };

//   const handleTyping = () => {
//     if (!selectedConversation || !newMessage.trim()) return;

//     const conversation = conversations.find(c => c.id === selectedConversation);
//     const otherUserId = conversation?.other_user?.id;
//     if (!otherUserId) return;

//     clearTimeout(typingTimeoutRef.current);

//     websocketManager.send({
//       type: 'typing',
//       receiver_id: otherUserId,
//       conversation_id: selectedConversation,
//       is_typing: true
//     });

//     typingTimeoutRef.current = setTimeout(() => {
//       stopTyping();
//     }, 3000);
//   };

//   const stopTyping = () => {
//     const conversation = conversations.find(c => c.id === selectedConversation);
//     const otherUserId = conversation?.other_user?.id;
//     if (!otherUserId) return;

//     websocketManager.send({
//       type: 'typing',
//       receiver_id: otherUserId,
//       conversation_id: selectedConversation,
//       is_typing: false
//     });
//   };

//   const startConversation = async (otherUserId) => {
//   try {
//     // Check conversation limit
//     const limitCheck = await checkConversationLimit(token);
//     if (!limitCheck.allowed) {
//       setError(limitCheck.message);
//       return;
//     }

//     const requestBody = isBrand 
//       ? { brand_id: user.id, influencer_id: otherUserId }
//       : { brand_id: otherUserId, influencer_id: user.id };

//     const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(requestBody)
//     });
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to start conversation');
//     }
    
//     const data = await response.json();
    
//     setSearchQuery('');
//     setSearchResults([]);
//     setIsSearchFocused(false);
    
//     await loadConversations();
    
//     if (data.conversation_id) {
//       await loadMessages(data.conversation_id);
//     }
//     setActiveTab('chats');
//   } catch (error) {
//     console.error('Error starting conversation:', error);
//     setError(error.message || 'Failed to start conversation');
//   }
// };

//   // File upload handling
//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const validation = validateFileUpload(file, subscriptionData?.limits);
//     if (!validation.valid) {
//       setError(validation.message);
//       event.target.value = '';
//       return;
//     }

//     setSelectedFile(file);
    
//     if (file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (e) => setFilePreview(e.target.result);
//       reader.readAsDataURL(file);
//     } else {
//       setFilePreview(null);
//     }
    
//     setShowFileModal(true);
//     setFileCaption('');
//   };

//   const sendMediaMessage = async () => {
//     if (!selectedFile || !selectedConversation || uploadingMedia) return;

//     try {
//       setUploadingMedia(true);
//       const formData = new FormData();
//       formData.append('file', selectedFile);
//       if (fileCaption.trim()) {
//         formData.append('caption', fileCaption.trim());
//       }

//       const response = await fetch(
//         `${API_BASE_URL}/chat/conversations/${selectedConversation}/media`,
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           },
//           body: formData
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to upload media');
//       }

//       const data = await response.json();
      
//       // Add message to UI
//       const mediaMessage = {
//         id: data.message_id,
//         content: fileCaption.trim() || data.content,
//         sender_id: user.id,
//         receiver_id: getOtherUserId(),
//         conversation_id: selectedConversation,
//         message_type: 'media',
//         media_info: data.media_info,
//         timestamp: new Date().toISOString(),
//         read: false,
//         delivered: false
//       };

//       setMessages(prev => [...prev, mediaMessage]);
      
//       // Update conversation
//       setConversations(prev => prev.map(conv =>
//         conv.id === selectedConversation
//           ? {
//               ...conv,
//               last_message: data.content,
//               last_message_type: 'media',
//               last_message_timestamp: new Date().toISOString()
//             }
//           : conv
//       ));

//       cancelFileUpload();
//     } catch (error) {
//       console.error('Error sending media message:', error);
//       setError('Failed to send media: ' + error.message);
//     } finally {
//       setUploadingMedia(false);
//     }
//   };

//   const cancelFileUpload = () => {
//     setSelectedFile(null);
//     setFilePreview(null);
//     setFileCaption('');
//     setShowFileModal(false);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   // Utility functions
// const getOtherUserId = () => {
//   const conversation = conversations.find(c => c.conversation_id === selectedConversation);
//   if (!conversation) {
//     console.error('Conversation not found:', selectedConversation);
//     return null;
//   }
  
//   if (!conversation.other_user) {
//     console.error('other_user not found in conversation:', conversation);
//     return null;
//   }
  
//   return conversation.other_user.id;
// };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const refreshWebSocket = () => {
//     setIsRefreshing(true);
//     websocketManager.close();
//     setTimeout(() => {
//       initializeWebSocket();
//       setIsRefreshing(false);
//     }, 1000);
//   };

//   const handleUpgradeNavigation = () => {
//     navigate(`/${user.role}/subscription`);
//   };

//   // Load subscription data
//   const loadSubscriptionData = useCallback(async () => {
//     try {
//       const usageData = await fetchChatUsage(token);
//       if (usageData) {
//         setSubscriptionData(usageData);
//       }
//     } catch (error) {
//       console.error('Error loading subscription data:', error);
//     }
//   }, [token]);

//   // Effects
//   useEffect(() => {
//     isMountedRef.current = true;

//     const initialize = async () => {
//       await loadSubscriptionData();
//       await loadConversations();
//       await loadSuggestedUsers();
//       initializeWebSocket();
//     };

//     initialize();

//     return () => {
//       isMountedRef.current = false;
//       websocketManager.close();
//       clearInterval(heartbeatIntervalRef.current);
//       clearTimeout(typingTimeoutRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     if (messages.length > 0 && !loadingOlderMessages) {
//       scrollToBottom();
//     }
//   }, [messages, otherUserTyping, loadingOlderMessages]);

//   // Subscription Status Component
//   const SubscriptionStatus = () => {
//     if (!subscriptionData) return null;

//     const limits = subscriptionData.limits || {};
//     const usage = subscriptionData.usage || {};
//     const planTier = subscriptionData.subscription?.plan_type || 'trial';
//     const isTrial = subscriptionData.subscription?.is_trial;
//     const planName = getPlanDisplayName(planTier);
//     const planColor = getPlanColor(planTier);

//     return (
//       <div className="chat-subscription-status">
//         <div className="chat-plan-badge" style={{ borderLeftColor: planColor }}>
//           <span className={`chat-plan-name chat-plan-${planTier}`}>
//             {planName}
//             {isTrial && ` (Trial)`}
//           </span>
//           <button 
//             className="chat-upgrade-btn"
//             onClick={handleUpgradeNavigation}
//           >
//             {isTrial ? 'Upgrade' : 'Manage'}
//           </button>
//         </div>
        
//         <div className="chat-usage-stats">
//           <div className="chat-usage-item">
//             <span className="chat-usage-label">Conversations:</span>
//             <span className="chat-usage-value">
//               {usage.conversations?.current || 0} / {limits.max_conversations || '∞'}
//             </span>
//             {limits.max_conversations && (
//               <div className="chat-usage-bar">
//                 <div 
//                   className="chat-usage-fill" 
//                   style={{ 
//                     width: `${Math.min(
//                       ((usage.conversations?.current || 0) / limits.max_conversations) * 100,
//                       100
//                     )}%` 
//                   }}
//                 ></div>
//               </div>
//             )}
//           </div>
          
//           <div className="chat-usage-item">
//             <span className="chat-usage-label">Messages Today:</span>
//             <span className="chat-usage-value">
//               {usage.messages?.today || 0} / {limits.daily_message_limit || '∞'}
//             </span>
//             {limits.daily_message_limit && (
//               <div className="chat-usage-bar">
//                 <div 
//                   className="chat-usage-fill" 
//                   style={{ 
//                     width: `${Math.min(
//                       ((usage.messages?.today || 0) / limits.daily_message_limit) * 100,
//                       100
//                     )}%` 
//                   }}
//                 ></div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading && conversations.length === 0) {
//     return (
//       <div className="chat-loading-container">
//         <div className="chat-loading-spinner"></div>
//         <p className="chat-loading-text">Loading messages...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="chat-container">
//       {/* Mobile Header */}
//       <div className="chat-mobile-header">
//         <button 
//           className="chat-mobile-menu-btn"
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         >
//           <span></span>
//           <span></span>
//           <span></span>
//         </button>
//         <div className="chat-mobile-title">
//           {selectedConversation ? 'Chat' : 'Messages'}
//         </div>
//         <button 
//           className={`chat-refresh-btn ${isRefreshing ? 'chat-refreshing' : ''}`}
//           onClick={refreshWebSocket}
//           disabled={isRefreshing}
//         >
//           🔄
//         </button>
//       </div>

//       <div className="chat-main-content">
//         {/* Sidebar */}
//         <div 
//           className={`chat-sidebar ${isMobileMenuOpen ? 'chat-mobile-open' : ''}`}
//           ref={sidebarRef}
//         >
//           <div className="chat-sidebar-header">
//             <div className="chat-user-info">
//               <div className="chat-user-avatar">
//                 {generateAvatarInitial(getDisplayName(user))}
//               </div>
//               <div className="chat-user-details">
//                 <h2 className="chat-username">
//                   {getDisplayName(user) || user.username}
//                 </h2>
//                 <div className={`chat-connection-status chat-status-${connectionStatus}`}>
//                   {connectionStatus === 'connected' && '🟢 Online'}
//                   {connectionStatus === 'connecting' && '🟡 Connecting...'}
//                   {connectionStatus === 'disconnected' && '🔴 Offline'}
//                   {connectionStatus === 'error' && '🔴 Connection Error'}
//                 </div>
//               </div>
//             </div>
            
//             <div className="chat-header-actions">
//               <button 
//                 className={`chat-refresh-btn ${isRefreshing ? 'chat-refreshing' : ''}`}
//                 onClick={refreshWebSocket}
//                 disabled={isRefreshing}
//               >
//                 🔄
//               </button>
//               <button 
//                 className="chat-new-chat-btn"
//                 onClick={() => setActiveTab('suggested')}
//               >
//                 +
//               </button>
//             </div>
//           </div>
          
//           <SubscriptionStatus />
          
//           {/* Search */}
//           <div className="chat-search-container">
//             <div className={`chat-search-wrapper ${isSearchFocused ? 'chat-search-focused' : ''}`}>
//               <span className="chat-search-icon">🔍</span>
//               <input
//                 type="text"
//                 placeholder={searchPlaceholder}
//                 className="chat-search-input"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   searchUsers(e.target.value);
//                 }}
//                 onFocus={() => setIsSearchFocused(true)}
//                 onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
//               />
//               {searchQuery && (
//                 <button 
//                   className="chat-search-clear"
//                   onClick={() => setSearchQuery('')}
//                 >
//                   ×
//                 </button>
//               )}
//             </div>
            
//             {searchResults.length > 0 && (
//               <div className="chat-search-results">
//                 {searchResults.map(user => (
//                   <div
//                     key={user.id}
//                     className="chat-search-result-item"
//                     onClick={() => startConversation(user.id)}
//                   >
//                     <div className="chat-search-avatar">
//                       {generateAvatarInitial(getDisplayName(user))}
//                     </div>
//                     <div className="chat-search-result-info">
//                       <div className="chat-search-result-name">
//                         {getDisplayName(user)}
//                       </div>
//                       <div className="chat-search-result-categories">
//                         {getUserCategories(user).slice(0, 2).join(' • ')}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Tabs */}
//           <div className="chat-tabs-container">
//             <button
//               className={`chat-tab-button ${activeTab === 'chats' ? 'chat-tab-active' : ''}`}
//               onClick={() => setActiveTab('chats')}
//             >
//               <span className="chat-tab-icon">💬</span>
//               Chats
//             </button>
//             <button
//               className={`chat-tab-button ${activeTab === 'suggested' ? 'chat-tab-active' : ''}`}
//               onClick={() => setActiveTab('suggested')}
//             >
//               <span className="chat-tab-icon">{discoverIcon}</span>
//               {discoverTabName}
//             </button>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="chat-error-message">
//               <span className="chat-error-icon">⚠️</span>
//               <span className="chat-error-text">{error}</span>
//               <button 
//                 className="chat-error-close" 
//                 onClick={() => setError(null)}
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {/* Content */}
//           <div className="chat-conversations-list">
//             {activeTab === 'chats' ? (
//               // Conversations
//               <div className="chat-chats-container">
//                 {conversations.length === 0 ? (
//                   <div className="chat-empty-state">
//                     <div className="chat-empty-icon">💬</div>
//                     <div className="chat-empty-title">No messages yet</div>
//                     <div className="chat-empty-subtitle">
//                       {isBrand 
//                         ? 'Connect with influencers for collaborations' 
//                         : 'Connect with brands for collaborations'
//                       }
//                     </div>
//                     <button 
//                       className="chat-primary-btn"
//                       onClick={() => setActiveTab('suggested')}
//                     >
//                       {discoverTabName}
//                     </button>
//                   </div>
//                 ) : (
//                   conversations.map(conversation => (
//                     <div
//                       key={conversation.conversation_id || conversation.id}
//                       className={`chat-conversation-item ${
//                         selectedConversation === (conversation.conversation_id || conversation.id) ? 'chat-conversation-active' : ''
//                       }`}
//                       onClick={() => loadMessages(conversation.conversation_id || conversation.id)}
//                     >
//                       <div className="chat-conversation-avatar">
//                         {generateAvatarInitial(getDisplayName(conversation.other_user))}
//                       </div>
//                       <div className="chat-conversation-content">
//                         <div className="chat-conversation-header">
//                           <div className="chat-conversation-name">
//                             {getDisplayName(conversation.other_user)}
//                           </div>
//                           <div className="chat-conversation-time">
//                             {formatConversationTime(conversation.last_message_timestamp)}
//                           </div>
//                         </div>
//                         <div className="chat-conversation-preview">
//                           <p className="chat-preview-text">
//                             {conversation.last_message_type === 'media' ? '📎 Media' : conversation.last_message}
//                           </p>
//                           {conversation.unread_count > 0 && (
//                             <span className="chat-unread-badge">
//                               {conversation.unread_count}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             ) : (
//               // Suggested Users
//               <div className="chat-suggested-container">
//                 <div className="chat-suggested-header">
//                   <h3 className="chat-suggested-title">
//                     {isBrand ? 'Influencers to Connect With' : 'Brands to Connect With'}
//                   </h3>
//                   <div className="chat-suggested-count">
//                     {suggestedUsers.length} {isBrand ? 'influencers' : 'brands'}
//                   </div>
//                 </div>
//                 {suggestedUsers.length === 0 ? (
//                   <div className="chat-empty-state">
//                     <div className="chat-empty-icon">{discoverIcon}</div>
//                     <div className="chat-empty-subtitle">
//                       {isBrand 
//                         ? 'No influencer suggestions available' 
//                         : 'No brand suggestions available'
//                       }
//                     </div>
//                   </div>
//                 ) : (
//                   suggestedUsers.map(user => (
//                     <div
//                       key={user.id}
//                       className="chat-suggested-item"
//                       onClick={() => startConversation(user.id)}
//                     >
//                       <div className="chat-suggested-avatar">
//                         {generateAvatarInitial(getDisplayName(user))}
//                       </div>
//                       <div className="chat-suggested-info">
//                         <div className="chat-suggested-name">
//                           {getDisplayName(user)}
//                         </div>
//                         <div className="chat-suggested-categories">
//                           {getUserCategories(user).slice(0, 3).join(' • ')}
//                         </div>
//                         <div className="chat-suggested-bio">
//                           {getUserBio(user)?.substring(0, 80)}
//                           {getUserBio(user)?.length > 80 ? '...' : ''}
//                         </div>
//                       </div>
//                       <button className="chat-connect-btn">
//                         Connect
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Chat Area */}
//         <div className={`chat-chat-area ${!selectedConversation ? 'chat-chat-empty' : ''}`}>
//           {selectedConversation ? (
//             <>
//               {/* Chat Header */}
//               <div className="chat-chat-header">
//                 <button 
//                   className="chat-back-button"
//                   onClick={() => setSelectedConversation(null)}
//                 >
//                   ←
//                 </button>
//                 <div className="chat-chat-user-info">
//                   <div className="chat-chat-avatar">
//                     {generateAvatarInitial(getDisplayName(
//                       conversations.find(c => c.id === selectedConversation)?.other_user
//                     ))}
//                   </div>
//                   <div className="chat-chat-user-details">
//                     <div className="chat-chat-username">
//                       {getDisplayName(
//                         conversations.find(c => c.id === selectedConversation)?.other_user
//                       )}
//                     </div>
//                     <div className="chat-user-status">
//                       {otherUserTyping ? 'Typing...' : 'Online'}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Messages */}
//               <div 
//                 className="chat-messages-container"
//                 ref={messagesContainerRef}
//               >
//                 {messages.length === 0 ? (
//                   <div className="chat-chat-empty-state">
//                     <div className="chat-empty-icon">💬</div>
//                     <div className="chat-empty-title">No messages yet</div>
//                     <div className="chat-empty-subtitle">Send a message to start the conversation</div>
//                   </div>
//                 ) : (
//                   <div className="chat-messages-list">
//                     {messages.map(message => (
//                       <div
//                         key={message.id}
//                         className={`chat-message-wrapper ${
//                           message.sender_id === user.id ? 'chat-message-sent' : 'chat-message-received'
//                         }`}
//                       >
//                         {message.sender_id !== user.id && (
//                           <div className="chat-message-avatar">
//                             {generateAvatarInitial(
//                               getDisplayName(userProfiles[message.sender_id])
//                             )}
//                           </div>
//                         )}
//                         <div
//                           className={`chat-message-bubble ${
//                             message.sender_id === user.id ? 'chat-bubble-sent' : 'chat-bubble-received'
//                           } ${message.temp_id ? 'chat-message-pending' : ''}`}
//                         >
//                           {message.message_type === 'media' ? (
//                             <div className="chat-media-message">
//                               <div className="chat-file-container">
//                                 <div className="chat-file-preview">
//                                   <div className="chat-file-icon">
//                                     {getFileIcon(message.media_info?.content_type)}
//                                   </div>
//                                   <div className="chat-file-info">
//                                     <div className="chat-file-name">
//                                       {message.media_info?.filename || 'File'}
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <button 
//                                   className="chat-download-btn"
//                                   onClick={() => window.open(
//                                     `${API_BASE_URL}/chat/media/${message.media_info?.file_id}`,
//                                     '_blank'
//                                   )}
//                                 >
//                                   Download
//                                 </button>
//                               </div>
//                               {message.content && (
//                                 <div className="chat-media-caption">{message.content}</div>
//                               )}
//                             </div>
//                           ) : (
//                             <div className="chat-message-text">{message.content}</div>
//                           )}
//                           <div className="chat-message-footer">
//                             <span className="chat-message-time">
//                               {formatMessageTime(message.timestamp)}
//                             </span>
//                             {message.sender_id === user.id && (
//                               <span className="chat-message-status">
//                                 {message.read ? '✓✓' : message.delivered ? '✓' : '🕒'}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                   </div>
//                 )}
//               </div>

//               {/* Input */}
//               <div className="chat-input-container">
//                 <div className="chat-input-wrapper">
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     style={{ display: 'none' }}
//                     onChange={handleFileSelect}
//                     accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/zip"
//                   />
//                   <button 
//                     className="chat-input-action"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={uploadingMedia}
//                   >
//                     {uploadingMedia ? (
//                       <div className="chat-uploading-spinner"></div>
//                     ) : (
//                       '📎'
//                     )}
//                   </button>
//                   <div className="chat-input-main">
//                     <textarea
//                       ref={textareaRef}
//                       placeholder="Type your message..."
//                       className="chat-message-input"
//                       rows="1"
//                       value={newMessage}
//                       onChange={(e) => {
//                         setNewMessage(e.target.value);
//                         if (e.target.value) {
//                           handleTyping();
//                         } else {
//                           stopTyping();
//                         }
//                       }}
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter' && !e.shiftKey) {
//                           e.preventDefault();
//                           sendMessage();
//                         }
//                       }}
//                     />
//                   </div>
//                   <button
//                     onClick={sendMessage}
//                     className={`chat-send-btn ${
//                       newMessage.trim() && !messageSending ? 'chat-send-active' : 'chat-send-disabled'
//                     }`}
//                     disabled={!newMessage.trim() || messageSending}
//                   >
//                     {messageSending ? '⏳' : '➤'}
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             // Welcome Screen
//             <div className="chat-welcome-screen">
//               <div className="chat-welcome-icon">💼</div>
//               <h3 className="chat-welcome-title">
//                 {isBrand ? 'Brand Collaborations' : 'Your Collaborations'}
//               </h3>
//               <p className="chat-welcome-subtitle">
//                 {isBrand 
//                   ? 'Connect with influencers to discuss partnership opportunities and campaigns.'
//                   : 'Connect with brands to discuss partnership opportunities and campaigns.'
//                 }
//               </p>
//               <div className="chat-welcome-stats">
//                 <div className="chat-stat">
//                   <div className="chat-stat-number">{conversations.length}</div>
//                   <div className="chat-stat-label">Active Chats</div>
//                 </div>
//                 <div className="chat-stat">
//                   <div className="chat-stat-number">{suggestedUsers.length}</div>
//                   <div className="chat-stat-label">
//                     {isBrand ? 'Influencers' : 'Brands'} Available
//                   </div>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setActiveTab('suggested')}
//                 className="chat-primary-btn"
//               >
//                 {discoverTabName}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* File Modal */}
//       {showFileModal && (
//         <div className="chat-modal-overlay">
//           <div className="chat-modal">
//             <div className="chat-modal-header">
//               <h3>Send File</h3>
//               <button 
//                 className="chat-modal-close"
//                 onClick={cancelFileUpload}
//               >
//                 ×
//               </button>
//             </div>
//             <div className="chat-modal-content">
//               {filePreview ? (
//                 <div className="chat-file-preview-image">
//                   <img src={filePreview} alt="Preview" />
//                 </div>
//               ) : (
//                 <div className="chat-file-preview-info">
//                   <div className="chat-file-icon-large">
//                     {getFileIcon(selectedFile?.type)}
//                   </div>
//                   <div className="chat-file-details">
//                     <div className="chat-file-name-large">{selectedFile?.name}</div>
//                     <div className="chat-file-size-large">
//                       {formatFileSize(selectedFile?.size)}
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div className="chat-caption-input">
//                 <label>Add a caption (optional)</label>
//                 <textarea
//                   placeholder="Describe this file..."
//                   value={fileCaption}
//                   onChange={(e) => setFileCaption(e.target.value)}
//                   rows="3"
//                 />
//               </div>
//             </div>
//             <div className="chat-modal-actions">
//               <button
//                 className="chat-cancel-btn"
//                 onClick={cancelFileUpload}
//                 disabled={uploadingMedia}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="chat-send-file-btn"
//                 onClick={sendMediaMessage}
//                 disabled={uploadingMedia}
//               >
//                 {uploadingMedia ? 'Sending...' : 'Send File'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div 
//           className="chat-mobile-overlay"
//           onClick={() => setIsMobileMenuOpen(false)}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default ChatApp;