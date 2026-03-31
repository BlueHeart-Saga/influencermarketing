// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API_BASE_URL from "../../config/api";
// import '../../style/InfluencerMessage.css';

// const InfluencerMessage = () => {
//     // State Management
//     const [conversations, setConversations] = useState([]);
//     const [selectedConversation, setSelectedConversation] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [suggestedBrands, setSuggestedBrands] = useState([]);
//     const [otherUserTyping, setOtherUserTyping] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [ws, setWs] = useState(null);
//     const [activeTab, setActiveTab] = useState('chats');
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [connectionStatus, setConnectionStatus] = useState('disconnected');
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const [userProfiles, setUserProfiles] = useState({});
//     const [onlineUsers, setOnlineUsers] = useState(new Set());
//     const [messageSending, setMessageSending] = useState(false);
//     const [isSearchFocused, setIsSearchFocused] = useState(false);
//     const [uploadingMedia, setUploadingMedia] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [filePreview, setFilePreview] = useState(null);
//     const [fileCaption, setFileCaption] = useState('');
//     const [showFileModal, setShowFileModal] = useState(false);
//     const [mediaCache, setMediaCache] = useState(new Map());
    
//     // Subscription Management
//     const [subscriptionData, setSubscriptionData] = useState({
//         type: 'free',
//         plan: 'free',
//         status: 'active',
//         is_active: true,
//         is_trial: false,
//         trial_remaining_days: 0,
//         current_conversations: 0,
//         today_messages: 0,
//         media_uploads_used: 0,
//         campaigns_created: 0,
//         campaign_limits: {
//             max_conversations: 5,
//             max_media_uploads: 10,
//             allowed_message_types: ['text', 'image', 'video', 'audio', 'document'],
//             daily_message_limit: 50,
//             can_create_campaigns: true,
//             max_campaigns_total: 3
//         }
//     });

//     // Refs
//     const messagesEndRef = useRef(null);
//     const typingTimeoutRef = useRef(null);
//     const textareaRef = useRef(null);
//     const sidebarRef = useRef(null);
//     const searchInputRef = useRef(null);
//     const fileInputRef = useRef(null);
//     const reconnectTimeoutRef = useRef(null);
//     const isMountedRef = useRef(true);

//     const navigate = useNavigate();
//     const token = localStorage.getItem('access_token');
//     const user = JSON.parse(localStorage.getItem('user') || '{}');

//     // Auth header helper
//     const getAuthHeader = () => {
//         const token = localStorage.getItem('access_token');
//         return token ? { Authorization: `Bearer ${token}` } : {};
//     };

//     // Default plan limits (fallback) - Moved before functions that use it
//     const getDefaultPlanLimits = useCallback((planKey, isTrial = false) => {
//         if (isTrial || planKey === 'trial' || planKey === 'free') {
//             return {
//                 max_conversations: 1,
//                 max_media_uploads: 1,
//                 allowed_message_types: ['text', 'image/jpeg', 'image/png', 'image/gif'],
//                 daily_message_limit: 50,
//                 can_create_campaigns: true,
//                 max_campaigns_total: 1,
//                 max_message_length: 500,
//                 max_media_size: 5 * 1024 * 1024 // 5MB
//             };
//         }

//         const planLimits = {
//             starter: {
//                 max_conversations: 10,
//                 max_media_uploads: 50,
//                 allowed_message_types: ['text', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'],
//                 daily_message_limit: 200,
//                 can_create_campaigns: true,
//                 max_campaigns_total: 10,
//                 max_message_length: 1000,
//                 max_media_size: 10 * 1024 * 1024 // 10MB
//             },
//             pro: {
//                 max_conversations: 25,
//                 max_media_uploads: 200,
//                 allowed_message_types: ['text', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/ogg', 'audio/mpeg', 'application/pdf', 'application/msword'],
//                 daily_message_limit: 1000,
//                 can_create_campaigns: true,
//                 max_campaigns_total: 25,
//                 max_message_length: 5000,
//                 max_media_size: 25 * 1024 * 1024 // 25MB
//             },
//             enterprise: {
//                 max_conversations: null, // Unlimited
//                 max_media_uploads: null, // Unlimited
//                 allowed_message_types: ['text', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/ogg', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
//                 daily_message_limit: null, // Unlimited
//                 can_create_campaigns: true,
//                 max_campaigns_total: null, // Unlimited
//                 max_message_length: 10000,
//                 max_media_size: 100 * 1024 * 1024 // 100MB
//             }
//         };

//         return planLimits[planKey] || planLimits.starter;
//     }, []);

//     // Get plan limits from backend based on subscription type
//     const getPlanLimits = useCallback(async (planKey, isTrial = false) => {
//         try {
//             // First try to get actual limits from backend
//             const response = await fetch(`${API_BASE_URL}/chat/chat/usage`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (response.ok) {
//                 const usageData = await response.json();
//                 const limits = usageData.limits || {};
                
//                 console.log('📋 Backend plan limits:', limits);
                
//                 return {
//                     max_conversations: limits.max_conversations,
//                     max_media_uploads: limits.max_media_per_day,
//                     allowed_message_types: limits.allowed_media_types || ['text', 'image', 'video', 'audio', 'document'],
//                     daily_message_limit: limits.daily_message_limit,
//                     can_create_campaigns: limits.can_initiate_chat !== false,
//                     max_campaigns_total: limits.max_conversations,
//                     max_message_length: limits.max_message_length || 1000,
//                     max_media_size: limits.max_media_size || 25 * 1024 * 1024 // 25MB default
//                 };
//             }
//         } catch (error) {
//             console.error('❌ Error fetching plan limits from backend, using defaults:', error);
//         }
        
//         // Fallback to frontend defaults if backend is unavailable
//         return getDefaultPlanLimits(planKey, isTrial);
//     }, [token, getDefaultPlanLimits]);

//     // Get default subscription data (trial)
//     const getDefaultSubscriptionData = useCallback(async () => {
//         const limits = await getPlanLimits('trial', true);
        
//         return {
//             type: 'trial',
//             plan: 'trial',
//             status: 'active',
//             is_active: true,
//             is_trial: true,
//             trial_remaining_days: 15,
//             current_conversations: 0,
//             today_messages: 0,
//             media_uploads_used: 0,
//             campaigns_created: 0,
//             campaign_limits: limits
//         };
//     }, [getPlanLimits]);

//     // Enhanced mapSubscriptionData to use backend limits
//     const mapSubscriptionData = useCallback(async (subscription) => {
//         if (!subscription) return await getDefaultSubscriptionData();

//         const planKey = subscription.plan || subscription.type || 'trial';
//         const isTrial = subscription.type === 'trial' || subscription.is_trial;
        
//         // Get limits from backend
//         const limits = await getPlanLimits(planKey, isTrial);
        
//         return {
//             type: subscription.type || 'trial',
//             plan: planKey,
//             status: subscription.status || 'active',
//             is_active: subscription.is_active !== false,
//             is_trial: isTrial,
//             trial_remaining_days: subscription.trial_remaining_days || 15,
//             current_conversations: subscription.current_conversations || 0,
//             today_messages: subscription.today_messages || 0,
//             media_uploads_used: subscription.media_uploads_used || 0,
//             campaigns_created: subscription.campaigns_created || 0,
//             campaign_limits: limits
//         };
//     }, [getPlanLimits, getDefaultSubscriptionData]);

//     // Fetch chat-specific usage data from backend
//     const fetchChatUsageData = useCallback(async () => {
//         try {
//             const response = await fetch(`${API_BASE_URL}/chat/chat/usage`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (response.ok) {
//                 const usageData = await response.json();
//                 console.log('📊 Chat usage data:', usageData);
                
//                 // Update subscription data with usage information
//                 setSubscriptionData(prev => ({
//                     ...prev,
//                     current_conversations: usageData.usage?.conversations?.current || 0,
//                     today_messages: usageData.usage?.messages_today?.current || 0,
//                     media_uploads_used: usageData.usage?.media_today?.current || 0,
//                     campaign_limits: {
//                         ...prev.campaign_limits,
//                         max_conversations: usageData.limits?.max_conversations,
//                         max_media_uploads: usageData.limits?.max_media_per_day,
//                         allowed_message_types: usageData.limits?.allowed_media_types || ['text', 'image', 'video', 'audio', 'document'],
//                         daily_message_limit: usageData.limits?.daily_message_limit,
//                         can_create_campaigns: usageData.limits?.can_initiate_chat !== false,
//                         max_campaigns_total: usageData.limits?.max_conversations
//                     }
//                 }));
//             }
//         } catch (error) {
//             console.error('❌ Error fetching chat usage data:', error);
//         }
//     }, [token]);

//     // Enhanced Subscription Data Fetching
//     const fetchSubscriptionData = useCallback(async () => {
//         try {
//             console.log('🔍 Fetching subscription data...');
            
//             const response = await fetch(`${API_BASE_URL}/subscriptions/me`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (response.ok) {
//                 const subscription = await response.json();
//                 console.log('✅ Subscription data loaded:', subscription);
                
//                 // Map subscription data to our format
//                 const mappedSubscription = await mapSubscriptionData(subscription);
//                 setSubscriptionData(mappedSubscription);
                
//                 // Also fetch chat-specific usage data
//                 await fetchChatUsageData();
                
//                 // Update user data in localStorage
//                 const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//                 const updatedUser = { ...currentUser, subscription: mappedSubscription };
//                 localStorage.setItem('user', JSON.stringify(updatedUser));
                
//                 return mappedSubscription;
//             } else {
//                 console.warn('⚠️ Could not fetch subscription data, using defaults');
//                 // Set default trial data if no subscription found
//                 const defaultSubscription = await getDefaultSubscriptionData();
//                 setSubscriptionData(defaultSubscription);
//                 return defaultSubscription;
//             }
//         } catch (error) {
//             console.error('❌ Error fetching subscription data:', error);
//             // Set default trial data on error
//             const defaultSubscription = await getDefaultSubscriptionData();
//             setSubscriptionData(defaultSubscription);
//             return defaultSubscription;
//         }
//     }, [token, mapSubscriptionData, fetchChatUsageData, getDefaultSubscriptionData]);

//     // Enhanced conversation permission check - FIXED: Added missing function
//     const checkConversationPermission = useCallback(async () => {
//         const limits = subscriptionData.campaign_limits || {};
//         const planTier = subscriptionData.plan || 'trial';
//         const planName = getPlanDisplayName(planTier);

//         if (limits.max_conversations && subscriptionData.current_conversations >= limits.max_conversations) {
//             return {
//                 allowed: false,
//                 message: `Conversation limit reached (${limits.max_conversations}). Upgrade your plan to start more conversations.`,
//                 action: "upgrade"
//             };
//         }

//         return { allowed: true };
//     }, [subscriptionData]);

//     // Enhanced permission checking with backend validation
//     const checkMessagePermission = useCallback(async (messageType = 'text') => {
//         const limits = subscriptionData.campaign_limits || {};
//         const planTier = subscriptionData.plan || 'trial';
//         const isTrial = subscriptionData.is_trial;
//         const planName = getPlanDisplayName(planTier);

//         // Check if subscription is active
//         if (!subscriptionData.is_active) {
//             return {
//                 allowed: false,
//                 message: "Your subscription is not active. Please upgrade to continue messaging.",
//                 action: "upgrade"
//             };
//         }

//         // Check daily message limit
//         if (limits.daily_message_limit && subscriptionData.today_messages >= limits.daily_message_limit) {
//             return {
//                 allowed: false,
//                 message: `Daily message limit reached (${limits.daily_message_limit}). Upgrade your plan to continue messaging.`,
//                 action: "upgrade"
//             };
//         }

//         // Check media permissions
//         if (messageType !== 'text') {
//             const allowedTypes = limits.allowed_message_types || ['text'];
            
//             // Check if this specific media type is allowed
//             const isMediaTypeAllowed = allowedTypes.some(allowedType => {
//                 if (allowedType === 'all') return true;
//                 if (messageType === 'image' && allowedType.startsWith('image/')) return true;
//                 if (messageType === 'video' && allowedType.startsWith('video/')) return true;
//                 if (messageType === 'audio' && allowedType.startsWith('audio/')) return true;
//                 return allowedType === messageType;
//             });

//             if (!isMediaTypeAllowed) {
//                 const mediaType = messageType === 'media' ? 'media files' : `${messageType} files`;
//                 return {
//                     allowed: false,
//                     message: `Your ${planName} doesn't support ${mediaType}. Upgrade to send media messages.`,
//                     action: "upgrade"
//                 };
//             }

//             // Check media upload limit
//             if (limits.max_media_uploads && subscriptionData.media_uploads_used >= limits.max_media_uploads) {
//                 return {
//                     allowed: false,
//                     message: `Media upload limit reached (${limits.max_media_uploads}). Upgrade your plan for more media uploads.`,
//                     action: "upgrade"
//                 };
//             }
//         }

//         return { allowed: true };
//     }, [subscriptionData]);

//     // Get plan display name
//     const getPlanDisplayName = (planKey) => {
//         const planNames = {
//             'free': 'Free Plan',
//             'trial': 'Trial Plan',
//             'starter': 'Starter Plan',
//             'starter_monthly': 'Starter Plan',
//             'starter_yearly': 'Starter Plan',
//             'pro': 'Pro Plan',
//             'pro_monthly': 'Pro Plan',
//             'pro_yearly': 'Pro Plan',
//             'enterprise': 'Enterprise Plan',
//             'enterprise_monthly': 'Enterprise Plan',
//             'enterprise_yearly': 'Enterprise Plan'
//         };
//         return planNames[planKey] || 'Current Plan';
//     };

//     const handlePermissionError = (permissionCheck) => {
//         if (!permissionCheck.allowed) {
//             setError(permissionCheck.message);
//             // Auto-clear error after 5 seconds
//             setTimeout(() => setError(null), 5000);
//             return false;
//         }
//         return true;
//     };

//     const handleUpgradeNavigation = () => {
//         navigate('/influencer/subscription');
//     };

//     // Enhanced WebSocket Management
//     const initializeWebSocket = useCallback(() => {
//         if (!isMountedRef.current || !token) return;

//         try {
//             setConnectionStatus('connecting');
//             const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
//             const baseUrl = API_BASE_URL.replace(/^https?:\/\//, "");
            
//             const websocket = new WebSocket(
//                 `${wsProtocol}://${baseUrl}/chat/ws?token=${token}`
//             );

//             websocket.onopen = () => {
//                 if (!isMountedRef.current) {
//                     websocket.close();
//                     return;
//                 }
//                 console.log('✅ WebSocket connected successfully');
//                 setWs(websocket);
//                 setConnectionStatus('connected');
//                 setError(null);
                
//                 // Send initial presence notification
//                 const presenceData = {
//                     type: 'presence',
//                     status: 'online',
//                     user_id: user?.id
//                 };
//                 websocket.send(JSON.stringify(presenceData));
//             };

//             websocket.onmessage = (event) => {
//                 if (!isMountedRef.current) return;
                
//                 try {
//                     const data = JSON.parse(event.data);
//                     handleWebSocketMessage(data);
//                 } catch (error) {
//                     console.error('❌ Error parsing WebSocket message:', error);
//                 }
//             };

//             websocket.onerror = (error) => {
//                 if (!isMountedRef.current) return;
//                 console.error('❌ WebSocket error:', error);
//                 setError('Connection error - unable to send/receive messages');
//                 setConnectionStatus('error');
//             };

//             websocket.onclose = (event) => {
//                 if (!isMountedRef.current) return;
                
//                 console.log('🔌 WebSocket disconnected:', event.code, event.reason);
//                 setWs(null);
//                 setConnectionStatus('disconnected');

//                 // Only reconnect if it wasn't a normal closure and component is still mounted
//                 if (event.code !== 1000 && isMountedRef.current) {
//                     console.log('🔄 Attempting to reconnect in 3 seconds...');
//                     reconnectTimeoutRef.current = setTimeout(() => {
//                         if (isMountedRef.current) {
//                             initializeWebSocket();
//                         }
//                     }, 3000);
//                 }
//             };

//         } catch (error) {
//             console.error('❌ Error initializing WebSocket:', error);
//             if (isMountedRef.current) {
//                 setError('Failed to establish connection');
//                 setConnectionStatus('error');
//             }
//         }
//     }, [token, user?.id]);

//     // WebSocket Message Handler - FIXED: Added missing dependencies
//     const handleWebSocketMessage = useCallback((data) => {
//         try {
//             console.log('📨 WebSocket message received:', data);
            
//             switch (data.type) {
//                 case 'message':
//                     handleIncomingMessage(data.message);
//                     break;
//                 case 'typing':
//                     handleTypingIndicator(data);
//                     break;
//                 case 'message_sent':
//                     handleMessageSentConfirmation(data);
//                     break;
//                 case 'read_receipt':
//                     handleReadReceipt(data);
//                     break;
//                 case 'presence':
//                     handlePresenceUpdate(data);
//                     break;
//                 case 'presence_info':
//                     handlePresenceInfo(data);
//                     break;
//                 case 'limits_update':
//                     console.log('📊 Limits updated via WebSocket:', data.limits);
//                     // Update subscription data when limits change
//                     setSubscriptionData(prev => ({
//                         ...prev,
//                         ...data.limits,
//                         campaign_limits: data.limits
//                     }));
//                     break;
//                 case 'subscription_update':
//                     console.log('🔄 Subscription updated:', data.subscription);
//                     // Use the subscription data directly instead of calling mapSubscriptionData
//                     // to avoid async issues in WebSocket handler
//                     setSubscriptionData(prev => ({
//                         ...prev,
//                         ...data.subscription
//                     }));
//                     break;
//                 case 'error':
//                     console.error('❌ WebSocket error:', data.message);
//                     setError(data.message);
//                     break;
//                 default:
//                     console.log('❓ Unknown message type:', data.type);
//             }
//         } catch (error) {
//             console.error('❌ Error handling WebSocket message:', error);
//         }
//     }, []);

//     // Data Loading Functions
//     const loadConversations = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError(null);
//             const response = await fetch(`${API_BASE_URL}/chat/conversations?page=1&limit=50`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (!response.ok) {
//                 throw new Error(`Failed to load conversations: ${response.status}`);
//             }
            
//             const data = await response.json();
//             const conversationsList = data.conversations || [];
            
//             if (isMountedRef.current) {
//                 setConversations(conversationsList);
                
//                 // Update conversation count in subscription data
//                 setSubscriptionData(prev => ({
//                     ...prev,
//                     current_conversations: conversationsList.length
//                 }));
//             }
//         } catch (error) {
//             console.error('❌ Error loading conversations:', error);
//             if (isMountedRef.current) {
//                 setError('Failed to load conversations. Please try refreshing.');
//                 setConversations([]);
//             }
//         } finally {
//             if (isMountedRef.current) {
//                 setLoading(false);
//             }
//         }
//     }, [token]);

//     const loadSuggestedBrands = useCallback(async () => {
//         try {
//             const response = await fetch(`${API_BASE_URL}/chat/users/search?query=&role=brand&limit=10`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (response.ok) {
//                 const brands = await response.json();
//                 const brandsList = Array.isArray(brands) ? brands : [];
                
//                 if (isMountedRef.current) {
//                     setSuggestedBrands(brandsList);
//                 }
//             }
//         } catch (error) {
//             console.error('❌ Error loading suggested brands:', error);
//         }
//     }, [token]);

//     const loadUserProfile = useCallback(async (userId) => {
//         if (!userId || userProfiles[userId]) return;

//         try {
//             const response = await fetch(`${API_BASE_URL}/profiles/user/${userId}`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (response.ok) {
//                 const profile = await response.json();
//                 if (isMountedRef.current && profile) {
//                     setUserProfiles(prev => ({
//                         ...prev,
//                         [userId]: profile
//                     }));
//                 }
//             }
//         } catch (error) {
//             console.error(`❌ Error loading profile for user ${userId}:`, error);
//         }
//     }, [token, userProfiles]);

   

//     const handleMessageSentConfirmation = useCallback((data) => {
//         setMessageSending(false);
        
//         // Update the temporary message with the real message data
//         setMessages(prev => prev.map(msg =>
//             msg.is_temp && msg.temp_id === data.temp_id 
//                 ? { ...data.message, animate: true }
//                 : msg
//         ));
//     }, []);

//     const handleTypingIndicator = useCallback((data) => {
//         if (data.conversation_id === selectedConversation) {
//             setOtherUserTyping(data.is_typing);
            
//             // Auto-hide typing indicator after 3 seconds
//             if (data.is_typing) {
//                 setTimeout(() => {
//                     if (isMountedRef.current) {
//                         setOtherUserTyping(false);
//                     }
//                 }, 3000);
//             }
//         }
//     }, [selectedConversation]);

//     const handleReadReceipt = useCallback((data) => {
//         setMessages(prev => prev.map(msg =>
//             msg.id === data.message_id 
//                 ? { ...msg, read: true, read_at: data.read_at }
//                 : msg
//         ));
//     }, []);

//      // Core Chat Functions
//     const sendReadReceipt = useCallback((messageId, conversationId) => {
//         if (!ws || ws.readyState !== WebSocket.OPEN) return;

//         const readData = {
//             type: 'read_receipt',
//             message_id: messageId,
//             conversation_id: conversationId
//         };

//         ws.send(JSON.stringify(readData));
//     }, [ws]);


//      // Message Handling Functions - FIXED: Added missing dependencies
//     const handleIncomingMessage = useCallback((message) => {
//         setMessages(prev => {
//             const messageExists = prev.some(msg => msg.id === message.id);
//             if (messageExists) return prev;

//             const newMessages = [...prev, { ...message, animate: true }];
            
//             // Remove animation after 500ms
//             setTimeout(() => {
//                 if (isMountedRef.current) {
//                     setMessages(current => 
//                         current.map(msg => 
//                             msg.id === message.id ? { ...msg, animate: false } : msg
//                         )
//                     );
//                 }
//             }, 500);
            
//             return newMessages;
//         });
        
//         // Update conversations list
//         setConversations(prev => prev.map(conv => 
//             conv.conversation_id === message.conversation_id
//                 ? { 
//                     ...conv, 
//                     last_message: message.content,
//                     last_message_type: message.message_type,
//                     last_message_timestamp: message.timestamp,
//                     unread_count: selectedConversation === message.conversation_id ? 0 : (conv.unread_count || 0) + 1
//                 }
//                 : conv
//         ));

//         // Send read receipt if this is the active conversation
//         if (selectedConversation === message.conversation_id) {
//             sendReadReceipt(message.id, message.conversation_id);
//         }
//     }, [selectedConversation, sendReadReceipt]);

//     const handlePresenceUpdate = useCallback((data) => {
//         if (data.is_online) {
//             setOnlineUsers(prev => new Set([...prev, data.user_id]));
//         } else {
//             setOnlineUsers(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(data.user_id);
//                 return newSet;
//             });
//         }
//     }, []);

//     const handlePresenceInfo = useCallback((data) => {
//         if (data.user_info) {
//             setUserProfiles(prev => ({
//                 ...prev,
//                 [data.user_info.id]: data.user_info
//             }));
//         }
//     }, []);

   

//     const loadMessages = async (conversationId) => {
//         try {
//             setError(null);
//             const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages?page=1&limit=100`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (!response.ok) {
//                 throw new Error(`Failed to load messages: ${response.status}`);
//             }
            
//             const messagesList = await response.json();
            
//             if (isMountedRef.current) {
//                 setMessages(Array.isArray(messagesList.messages) ? messagesList.messages : []);
//                 setSelectedConversation(conversationId);
//                 await markMessagesAsRead(conversationId);
//             }
//         } catch (error) {
//             console.error('❌ Error loading messages:', error);
//             if (isMountedRef.current) {
//                 setError('Failed to load messages. Please try again.');
//             }
//         }
//     };

//     const markMessagesAsRead = async (conversationId) => {
//         try {
//             await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/read`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             setConversations(prev => prev.map(conv =>
//                 conv.conversation_id === conversationId
//                     ? { ...conv, unread_count: 0 }
//                     : conv
//             ));
//         } catch (error) {
//             console.error('❌ Error marking messages as read:', error);
//         }
//     };

//     const searchUsers = async (query) => {
//         if (query.length < 2) {
//             setSearchResults([]);
//             return;
//         }

//         try {
//             const response = await fetch(`${API_BASE_URL}/chat/users/search?query=${encodeURIComponent(query)}&role=brand`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });
            
//             if (!response.ok) {
//                 throw new Error(`Search failed: ${response.status}`);
//             }
            
//             const results = await response.json();
//             const resultsList = Array.isArray(results) ? results : [];
            
//             if (isMountedRef.current) {
//                 setSearchResults(resultsList);
//             }
//         } catch (error) {
//             console.error('❌ Error searching users:', error);
//             if (isMountedRef.current) {
//                 setSearchResults([]);
//             }
//         }
//     };

//     // Update the startConversation function to use async permission check
//     const startConversation = async (brandId) => {
//         try {
//             // Check subscription limits
//             const permission = await checkConversationPermission();
//             if (!handlePermissionError(permission)) {
//                 return;
//             }

//             setError(null);
//             const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     brand_id: brandId,
//                     influencer_id: user.id
//                 })
//             });
            
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || `Failed to start conversation: ${response.status}`);
//             }
            
//             const data = await response.json();
            
//             if (isMountedRef.current) {
//                 setSearchQuery('');
//                 setSearchResults([]);
//                 setIsSearchFocused(false);
                
//                 // Refresh usage data after creating conversation
//                 await fetchChatUsageData();
                
//                 await loadConversations();
                
//                 if (data.conversation_id) {
//                     await loadMessages(data.conversation_id);
//                 }
//                 setActiveTab('chats');
//             }
//         } catch (error) {
//             console.error('❌ Error starting conversation:', error);
//             if (isMountedRef.current) {
//                 setError(error.message || 'Failed to start conversation. Please try again.');
//             }
//         }
//     };

//     // Update the sendMessage function to check permissions
//     const sendMessage = async () => {
//         if (!newMessage.trim() || !selectedConversation || messageSending) return;

//         // Check subscription limits
//         const permission = await checkMessagePermission('text');
//         if (!handlePermissionError(permission)) {
//             return;
//         }

//         const otherUserId = getOtherUserId();
//         if (!otherUserId) {
//             setError('Cannot determine recipient');
//             return;
//         }

//         const tempId = Date.now().toString();
//         const messageData = {
//             type: 'message',
//             conversation_id: selectedConversation,
//             content: newMessage.trim(),
//             receiver_id: otherUserId,
//             message_type: 'text',
//             temp_id: tempId
//         };

//         if (ws && ws.readyState === WebSocket.OPEN) {
//             setMessageSending(true);
//             ws.send(JSON.stringify(messageData));
            
//             // Add temporary message immediately for better UX
//             const tempMessage = {
//                 id: tempId,
//                 content: newMessage.trim(),
//                 sender_id: user.id,
//                 receiver_id: otherUserId,
//                 conversation_id: selectedConversation,
//                 message_type: 'text',
//                 timestamp: new Date().toISOString(),
//                 read: false,
//                 delivered: false,
//                 is_temp: true,
//                 temp_id: tempId,
//                 animate: true
//             };
            
//             setMessages(prev => [...prev, tempMessage]);
            
//             // Update message count and refresh usage data
//             setSubscriptionData(prev => ({
//                 ...prev,
//                 today_messages: (prev.today_messages || 0) + 1
//             }));
            
//             // Refresh usage data from backend
//             setTimeout(() => fetchChatUsageData(), 1000);
            
//             setConversations(prev => prev.map(conv =>
//                 conv.conversation_id === selectedConversation
//                     ? {
//                         ...conv,
//                         last_message: newMessage.trim(),
//                         last_message_type: 'text',
//                         last_message_timestamp: new Date().toISOString()
//                     }
//                     : conv
//             ));
//         } else {
//             setError('Not connected to chat server. Please refresh the page.');
//         }
        
//         setNewMessage('');
//         stopTyping();
//     };

//     const handleFileSelect = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             // Check subscription limits for media - FIXED: Made async call synchronous for event handler
//             const checkMediaPermission = async () => {
//                 const permission = await checkMessagePermission('media');
//                 if (!handlePermissionError(permission)) {
//                     event.target.value = ''; // Reset file input
//                     return false;
//                 }
//                 return true;
//             };

//             // Validate file size and type
//             const maxSize = 25 * 1024 * 1024; // 25MB
//             if (file.size > maxSize) {
//                 setError('File too large. Maximum size is 25MB');
//                 event.target.value = ''; // Reset file input
//                 return;
//             }

//             // Check permission and proceed if allowed
//             checkMediaPermission().then(allowed => {
//                 if (allowed) {
//                     setSelectedFile(file);
                    
//                     // Create preview for images
//                     if (file.type.startsWith('image/')) {
//                         const reader = new FileReader();
//                         reader.onload = (e) => {
//                             setFilePreview(e.target.result);
//                         };
//                         reader.readAsDataURL(file);
//                     } else {
//                         setFilePreview(null);
//                     }
                    
//                     setShowFileModal(true);
//                     setFileCaption('');
//                 }
//             });
//         }
//     };

//     const sendMediaMessage = async () => {
//         if (!selectedFile || !selectedConversation || uploadingMedia) return;

//         try {
//             setUploadingMedia(true);
//             const formData = new FormData();
//             formData.append('file', selectedFile);
//             if (fileCaption.trim()) {
//                 formData.append('caption', fileCaption.trim());
//             }

//             const response = await fetch(`${API_BASE_URL}/chat/conversations/${selectedConversation}/media`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: formData
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || 'Failed to upload media');
//             }

//             const data = await response.json();
            
//             // Add the media message to the chat
//             const mediaMessage = {
//                 id: data.message_id,
//                 content: fileCaption.trim() || data.content,
//                 sender_id: user.id,
//                 receiver_id: getOtherUserId(),
//                 conversation_id: selectedConversation,
//                 message_type: 'media',
//                 media_info: data.media_info,
//                 timestamp: new Date().toISOString(),
//                 read: false,
//                 delivered: false,
//                 animate: true
//             };

//             setMessages(prev => [...prev, mediaMessage]);
//             setConversations(prev => prev.map(conv =>
//                 conv.conversation_id === selectedConversation
//                     ? {
//                         ...conv,
//                         last_message: data.content,
//                         last_message_type: 'media',
//                         last_message_timestamp: new Date().toISOString()
//                     }
//                     : conv
//             ));

//             // Reset file state
//             setSelectedFile(null);
//             setFilePreview(null);
//             setFileCaption('');
//             setShowFileModal(false);
            
//             // Reset file input
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//             }

//             // Refresh usage data
//             await fetchChatUsageData();
//         } catch (error) {
//             console.error('❌ Error sending media message:', error);
//             setError('Failed to send media: ' + error.message);
//         } finally {
//             setUploadingMedia(false);
//         }
//     };

//     const cancelFileUpload = () => {
//         setSelectedFile(null);
//         setFilePreview(null);
//         setFileCaption('');
//         setShowFileModal(false);
        
//         // Reset file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const sendQuickMessage = (message) => {
//         setNewMessage(message);
//         setTimeout(() => sendMessage(), 100);
//     };

//     const getOtherUserId = () => {
//         const conversation = conversations.find(c => c.conversation_id === selectedConversation);
//         return conversation?.other_user?.id ?? null;
//     };

//     const handleTyping = () => {
//         if (!selectedConversation || !newMessage.trim()) return;

//         const otherUserId = getOtherUserId();
//         if (!otherUserId) return;

//         if (typingTimeoutRef.current) {
//             clearTimeout(typingTimeoutRef.current);
//         }

//         const typingData = {
//             type: 'typing',
//             receiver_id: otherUserId,
//             conversation_id: selectedConversation,
//             is_typing: true
//         };

//         if (ws && ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify(typingData));
//         }

//         typingTimeoutRef.current = setTimeout(() => {
//             stopTyping();
//         }, 3000);
//     };

//     const stopTyping = () => {
//         const otherUserId = getOtherUserId();
//         if (!otherUserId) return;

//         const typingData = {
//             type: 'typing',
//             receiver_id: otherUserId,
//             conversation_id: selectedConversation,
//             is_typing: false
//         };

//         if (ws && ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify(typingData));
//         }
//     };

//     const refreshWebSocket = () => {
//         if (isRefreshing) return;
        
//         setIsRefreshing(true);
        
//         // Clear any pending reconnection
//         if (reconnectTimeoutRef.current) {
//             clearTimeout(reconnectTimeoutRef.current);
//         }
        
//         // Close existing connection
//         if (ws) {
//             ws.close(1000, "Manual refresh");
//         } else {
//             // If no WebSocket exists, initialize a new one
//             initializeWebSocket();
//         }
        
//         setTimeout(() => {
//             if (isMountedRef.current) {
//                 setIsRefreshing(false);
//             }
//         }, 1000);
//     };

//     // Utility Functions
//     const scrollToBottom = () => {
//         if (messagesEndRef.current && isMountedRef.current) {
//             messagesEndRef.current.scrollIntoView({ 
//                 behavior: "smooth",
//                 block: "nearest"
//             });
//         }
//     };

//     const getProfilePicture = (userId) => {
//         const profile = userProfiles[userId];
//         if (!profile) return null;
        
//         if (profile.profile?.logo) {
//             return `${API_BASE_URL}/profiles/image/${profile.profile.logo}`;
//         }
//         if (profile.profile?.profile_picture) {
//             return `${API_BASE_URL}/profiles/image/${profile.profile.profile_picture}`;
//         }
//         return null;
//     };

//     const getDisplayName = (userId) => {
//         const profile = userProfiles[userId];
//         if (!profile) return 'User';
        
//         if (profile.profile?.company_name) {
//             return profile.profile.company_name;
//         }
//         if (profile.profile?.full_name) {
//             return profile.profile.full_name;
//         }
//         if (profile.profile?.username) {
//             return profile.profile.username;
//         }
//         return 'User';
//     };

//     const getUserBio = (userId) => {
//         const profile = userProfiles[userId];
//         if (!profile) return '';
        
//         return profile.profile?.description || profile.profile?.bio || '';
//     };

//     const getUserCategories = (userId) => {
//         const profile = userProfiles[userId];
//         if (!profile) return [];
        
//         return profile.profile?.categories || [];
//     };

//     const isUserOnline = (userId) => {
//         return onlineUsers.has(userId);
//     };

//     const getFileIcon = (fileType) => {
//         if (fileType.startsWith('image/')) return '🖼️';
//         if (fileType.startsWith('video/')) return '🎥';
//         if (fileType.startsWith('audio/')) return '🎵';
//         if (fileType === 'application/pdf') return '📄';
//         if (fileType.includes('word')) return '📝';
//         if (fileType.includes('excel')) return '📊';
//         if (fileType.includes('powerpoint')) return '📈';
//         if (fileType.startsWith('text/')) return '📃';
//         if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '📦';
//         return '📎';
//     };

//     const formatTime = (timestamp) => {
//         if (!timestamp) return '';
//         const date = new Date(timestamp);
//         const now = new Date();
//         const diffInHours = (now - date) / (1000 * 60 * 60);
        
//         if (diffInHours < 24) {
//             return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//         } else if (diffInHours < 48) {
//             return 'Yesterday';
//         } else {
//             return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//         }
//     };

//     const getLastActive = (userId, timestamp) => {
//         if (isUserOnline(userId)) return 'Online now';
//         if (!timestamp) return 'Never active';
        
//         const date = new Date(timestamp);
//         const now = new Date();
//         const diffInMinutes = (now - date) / (1000 * 60);
        
//         if (diffInMinutes < 1) return 'Just now';
//         if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
//         if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
//         return `${Math.floor(diffInMinutes / 1440)}d ago`;
//     };

//     const toggleMobileMenu = () => {
//         setIsMobileMenuOpen(!isMobileMenuOpen);
//     };

//     const handleSearchFocus = () => {
//         setIsSearchFocused(true);
//     };

//     const handleSearchBlur = () => {
//         setTimeout(() => setIsSearchFocused(false), 200);
//     };

//     // Auto-resize textarea
//     useEffect(() => {
//         if (textareaRef.current) {
//             textareaRef.current.style.height = 'auto';
//             textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
//         }
//     }, [newMessage]);

//     // Close mobile menu when conversation is selected on mobile
//     useEffect(() => {
//         if (selectedConversation && window.innerWidth < 768) {
//             setIsMobileMenuOpen(false);
//         }
//     }, [selectedConversation]);

//     // Scroll to bottom when messages change
//     useEffect(() => {
//         scrollToBottom();
//     }, [messages, otherUserTyping]);

//     // Load user profiles when conversations or suggested brands change
//     useEffect(() => {
//         const loadAllProfiles = async () => {
//             const allUserIds = [
//                 ...conversations.map(conv => conv.other_user?.id),
//                 ...suggestedBrands.map(brand => brand.id)
//             ].filter(Boolean);
            
//             for (const userId of allUserIds) {
//                 await loadUserProfile(userId);
//             }
//         };
        
//         loadAllProfiles();
//     }, [conversations, suggestedBrands, loadUserProfile]);

//     // Main useEffect for initial setup - FIXED: Added proper dependencies
//     useEffect(() => {
//         isMountedRef.current = true;
        
//         const initializeApp = async () => {
//             try {
//                 // Fetch subscription data first
//                 await fetchSubscriptionData();
//                 await loadConversations();
//                 await loadSuggestedBrands();
//                 initializeWebSocket();
//             } catch (error) {
//                 console.error('❌ Error initializing app:', error);
//                 setError('Failed to initialize application');
//             }
//         };

//         initializeApp();

//         const handleResize = () => {
//             if (window.innerWidth >= 768) {
//                 setIsMobileMenuOpen(false);
//             }
//         };

//         window.addEventListener('resize', handleResize);
        
//         return () => {
//             isMountedRef.current = false;
//             window.removeEventListener('resize', handleResize);
            
//             // Clean up WebSocket
//             if (ws) {
//                 ws.close(1000, "Component unmounting");
//             }
            
//             // Clean up timeouts
//             if (reconnectTimeoutRef.current) {
//                 clearTimeout(reconnectTimeoutRef.current);
//             }
//             if (typingTimeoutRef.current) {
//                 clearTimeout(typingTimeoutRef.current);
//             }
            
//             // Clean up blob URLs
//             mediaCache.forEach(url => {
//                 if (typeof url === 'string' && url.startsWith('blob:')) {
//                     URL.revokeObjectURL(url);
//                 }
//             });
//         };
//     }, [fetchSubscriptionData, loadConversations, loadSuggestedBrands, initializeWebSocket]);

//     // Enhanced Subscription Status Component
//     const SubscriptionStatus = () => {
//         if (!subscriptionData) return null;

//         const limits = subscriptionData.campaign_limits || {};
//         const planTier = subscriptionData.plan || 'trial';
//         const isTrial = subscriptionData.is_trial;
//         const trialDays = subscriptionData.trial_remaining_days || 0;
//         const planName = getPlanDisplayName(planTier);
        
//         const progress = {
//             conversations: limits.max_conversations ? 
//                 ((subscriptionData.current_conversations || 0) / limits.max_conversations) * 100 : 100,
//             messages: limits.daily_message_limit ? 
//                 ((subscriptionData.today_messages || 0) / limits.daily_message_limit) * 100 : 100,
//             media: limits.max_media_uploads ? 
//                 ((subscriptionData.media_uploads_used || 0) / limits.max_media_uploads) * 100 : 100
//         };

//         // Get plan color based on tier
//         const getPlanColor = () => {
//             switch (planTier) {
//                 case 'trial': return '#10B981'; // green
//                 case 'starter':
//                 case 'starter_monthly':
//                 case 'starter_yearly': return '#3B82F6'; // blue
//                 case 'pro':
//                 case 'pro_monthly':
//                 case 'pro_yearly': return '#8B5CF6'; // purple
//                 case 'enterprise':
//                 case 'enterprise_monthly':
//                 case 'enterprise_yearly': return '#F59E0B'; // amber
//                 default: return '#6B7280'; // gray
//             }
//         };

//         return (
//             <div className="im-subscription-status">
//                 <div className="im-plan-badge" style={{ borderLeftColor: getPlanColor() }}>
//                     <span className={`im-plan-name im-plan-${planTier}`}>
//                         {planName}
//                         {isTrial && trialDays > 0 && ` (${trialDays} days left)`}
//                     </span>
//                     <button 
//                         className="im-upgrade-btn"
//                         onClick={handleUpgradeNavigation}
//                     >
//                         {isTrial ? 'Upgrade' : 'Manage'}
//                     </button>
//                 </div>
                
//                 <div className="im-usage-stats">
//                     <div className="im-usage-item">
//                         <span className="im-usage-label">Conversations:</span>
//                         <span className="im-usage-value">
//                             {subscriptionData.current_conversations || 0} / {limits.max_conversations || '∞'}
//                         </span>
//                         {limits.max_conversations && (
//                             <div className="im-usage-bar">
//                                 <div 
//                                     className={`im-usage-fill ${progress.conversations > 80 ? 'im-usage-warning' : ''}`} 
//                                     style={{ width: `${Math.min(progress.conversations, 100)}%` }}
//                                 ></div>
//                             </div>
//                         )}
//                     </div>
                    
//                     <div className="im-usage-item">
//                         <span className="im-usage-label">Messages Today:</span>
//                         <span className="im-usage-value">
//                             {subscriptionData.today_messages || 0} / {limits.daily_message_limit || '∞'}
//                         </span>
//                         {limits.daily_message_limit && (
//                             <div className="im-usage-bar">
//                                 <div 
//                                     className={`im-usage-fill ${progress.messages > 80 ? 'im-usage-warning' : ''}`} 
//                                     style={{ width: `${Math.min(progress.messages, 100)}%` }}
//                                 ></div>
//                             </div>
//                         )}
//                     </div>
                    
//                     {limits.max_media_uploads && (
//                         <div className="im-usage-item">
//                             <span className="im-usage-label">Media Uploads:</span>
//                             <span className="im-usage-value">
//                                 {subscriptionData.media_uploads_used || 0} / {limits.max_media_uploads}
//                             </span>
//                             <div className="im-usage-bar">
//                                 <div 
//                                     className={`im-usage-fill ${progress.media > 80 ? 'im-usage-warning' : ''}`} 
//                                     style={{ width: `${Math.min(progress.media, 100)}%` }}
//                                 ></div>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Trial Warning */}
//                 {isTrial && trialDays <= 3 && (
//                     <div className="im-trial-warning">
//                         <span className="im-warning-icon">⚠️</span>
//                         <span className="im-warning-text">
//                             {trialDays === 0 
//                                 ? "Your trial has ended. Upgrade to continue messaging."
//                                 : `Your trial ends in ${trialDays} day${trialDays > 1 ? 's' : ''}. Upgrade now!`
//                             }
//                         </span>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const MediaMessageContent = ({ message }) => {
//         const [mediaUrl, setMediaUrl] = useState(null);
//         const [loading, setLoading] = useState(true);
//         const [error, setError] = useState(null);

//         useEffect(() => {
//             const loadMedia = async () => {
//                 if (!message.media_info) return;
                
//                 try {
//                     setLoading(true);
//                     const response = await fetch(`${API_BASE_URL}/chat/media/${message.media_info.file_id}`, {
//                         headers: {
//                             'Authorization': `Bearer ${token}`
//                         }
//                     });
                    
//                     if (response.ok) {
//                         const blob = await response.blob();
//                         const url = URL.createObjectURL(blob);
//                         setMediaUrl(url);
//                         // Add to cache
//                         setMediaCache(prev => new Map(prev).set(message.media_info.file_id, url));
//                     } else {
//                         setError('Failed to load media');
//                     }
//                 } catch (err) {
//                     setError('Failed to load media');
//                 } finally {
//                     setLoading(false);
//                 }
//             };

//             // Check cache first
//             const cachedUrl = mediaCache.get(message.media_info.file_id);
//             if (cachedUrl) {
//                 setMediaUrl(cachedUrl);
//                 setLoading(false);
//             } else {
//                 loadMedia();
//             }
//         }, [message.media_info, mediaCache]);

//         if (!message.media_info) {
//             return <div className="im-message-text">{message.content}</div>;
//         }

//         const mediaInfo = message.media_info;
//         const isImage = mediaInfo.content_type?.startsWith('image/');
//         const isVideo = mediaInfo.content_type?.startsWith('video/');
//         const isAudio = mediaInfo.content_type?.startsWith('audio/');
//         const fileIcon = getFileIcon(mediaInfo.content_type);

//         if (loading) {
//             return (
//                 <div className="im-media-loading">
//                     <div className="im-media-spinner"></div>
//                     <span>Loading media...</span>
//                 </div>
//             );
//         }

//         if (error || !mediaUrl) {
//             return (
//                 <div className="im-media-error">
//                     <div className="im-file-container">
//                         <div className="im-file-preview">
//                             <div className="im-file-icon">{fileIcon}</div>
//                             <div className="im-file-info">
//                                 <div className="im-file-name">{mediaInfo.filename}</div>
//                                 <div className="im-file-details">
//                                     <span className="im-file-type">{mediaInfo.content_type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
//                                 </div>
//                                 <div className="im-file-error">{error || 'File not available'}</div>
//                             </div>
//                         </div>
//                         <a 
//                             href={`${API_BASE_URL}/chat/media/${mediaInfo.file_id}`}
//                             download={mediaInfo.filename}
//                             className="im-download-btn"
//                         >
//                             Download
//                         </a>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="im-media-message">
//                 {isImage ? (
//                     <div className="im-media-image-container">
//                         <img 
//                             src={mediaUrl} 
//                             alt={mediaInfo.filename}
//                             className="im-media-image"
//                             onClick={() => window.open(mediaUrl, '_blank')}
//                             onError={() => setError('Failed to load image')}
//                         />
//                     </div>
//                 ) : isVideo ? (
//                     <div className="im-video-container">
//                         <video 
//                             controls 
//                             className="im-media-video"
//                             onError={() => setError('Failed to load video')}
//                         >
//                             <source src={mediaUrl} type={mediaInfo.content_type} />
//                             Your browser does not support the video tag.
//                         </video>
//                     </div>
//                 ) : isAudio ? (
//                     <div className="im-audio-container">
//                         <audio 
//                             controls 
//                             className="im-media-audio"
//                             onError={() => setError('Failed to load audio')}
//                         >
//                             <source src={mediaUrl} type={mediaInfo.content_type} />
//                             Your browser does not support the audio tag.
//                         </audio>
//                     </div>
//                 ) : (
//                     <div className="im-file-container">
//                         <div className="im-file-preview">
//                             <div className="im-file-icon">{fileIcon}</div>
//                             <div className="im-file-info">
//                                 <div className="im-file-name">{mediaInfo.filename}</div>
//                                 <div className="im-file-details">
//                                     <span className="im-file-type">{mediaInfo.content_type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
//                                 </div>
//                             </div>
//                         </div>
//                         <a 
//                             href={mediaUrl}
//                             download={mediaInfo.filename}
//                             className="im-download-btn"
//                         >
//                             Download
//                         </a>
//                     </div>
//                 )}
//                 {message.content && (
//                     <div className="im-media-caption">{message.content}</div>
//                 )}
//             </div>
//         );
//     };

//     const renderMediaMessage = (message) => {
//         return <MediaMessageContent message={message} />;
//     };

//     const renderAvatar = (userId, username, className = 'im-avatar', showOnline = false) => {
//         const profilePicture = getProfilePicture(userId);
//         const isOnline = showOnline && isUserOnline(userId);
//         const displayName = getDisplayName(userId);
        
//         return (
//             <div className={`${className}-container`}>
//                 {profilePicture ? (
//                     <img 
//                         src={profilePicture} 
//                         alt={displayName}
//                         className={`${className} im-profile-picture`}
//                         onError={(e) => {
//                             e.target.style.display = 'none';
//                             if (e.target.nextSibling) {
//                                 e.target.nextSibling.style.display = 'flex';
//                             }
//                         }}
//                     />
//                 ) : null}
//                 <div 
//                     className={`${className} ${!profilePicture ? 'im-avatar-visible' : 'im-avatar-hidden'}`}
//                 >
//                     {displayName?.charAt(0).toUpperCase() || 'U'}
//                 </div>
//                 {isOnline && <div className="im-online-indicator"></div>}
//             </div>
//         );
//     };

//     // Quick messages for influencers
//     const quickMessages = [
//         "Hi! I'd love to collaborate with your brand.",
//         "Could you share more details about the campaign?",
//         "What are your expectations for this partnership?",
//         "What's the budget for this collaboration?",
//         "I'm available for a call to discuss further.",
//         "Here's my media kit for your review.",
//         "What timeline are you thinking for this campaign?"
//     ];

//     if (loading) {
//         return (
//             <div className="im-loading-container">
//                 <div className="im-loading-spinner"></div>
//                 <p className="im-loading-text">Loading messages...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="im-container">
//             {/* Mobile Header */}
//             <div className="im-mobile-header">
//                 <button 
//                     className="im-mobile-menu-btn"
//                     onClick={toggleMobileMenu}
//                 >
//                     <span></span>
//                     <span></span>
//                     <span></span>
//                 </button>
//                 <div className="im-mobile-title">
//                     {selectedConversation ? 
//                         getDisplayName(conversations.find(c => c.conversation_id === selectedConversation)?.other_user.id)
//                         : 'Messages'
//                     }
//                 </div>
//                 <button 
//                     className={`im-refresh-btn ${isRefreshing ? 'im-refreshing' : ''}`}
//                     onClick={refreshWebSocket}
//                     title="Refresh connection"
//                     disabled={isRefreshing}
//                 >
//                     🔄
//                 </button>
//             </div>

//             <div className="im-main-content">
//                 {/* Left Sidebar - Conversations & Search */}
//                 <div 
//                     ref={sidebarRef}
//                     className={`im-sidebar ${isMobileMenuOpen ? 'im-mobile-open' : ''}`}
//                 >
//                     {/* Header */}
//                     <div className="im-sidebar-header">
//                         <div className="im-user-info">
//                             {renderAvatar(user.id, user.username, 'im-user-avatar', false)}
//                             <div className="im-user-details">
//                                 <h2 className="im-username">
//                                     {getDisplayName(user.id) || user.username}
//                                 </h2>
//                                 <div className={`im-connection-status im-status-${connectionStatus}`}>
//                                     {connectionStatus === 'connected' && '🟢 Online'}
//                                     {connectionStatus === 'connecting' && '🟡 Connecting...'}
//                                     {connectionStatus === 'disconnected' && '🔴 Offline'}
//                                     {connectionStatus === 'error' && '🔴 Connection Error'}
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className="im-header-actions">
//                             <button 
//                                 className={`im-refresh-btn ${isRefreshing ? 'im-refreshing' : ''}`}
//                                 onClick={refreshWebSocket}
//                                 title="Refresh connection"
//                                 disabled={isRefreshing}
//                             >
//                                 🔄
//                             </button>
//                             <button 
//                                 className="im-new-chat-btn" 
//                                 title="New message"
//                                 onClick={() => setActiveTab('suggested')}
//                             >
//                                 +
//                             </button>
//                         </div>
//                     </div>
                    
//                     {/* Subscription Status */}
//                     <SubscriptionStatus />
                    
//                     {/* Search Bar */}
//                     <div className="im-search-container">
//                         <div className={`im-search-wrapper ${isSearchFocused ? 'im-search-focused' : ''}`}>
//                             <span className="im-search-icon">🔍</span>
//                             <input
//                                 ref={searchInputRef}
//                                 type="text"
//                                 placeholder="Search brands..."
//                                 className="im-search-input"
//                                 value={searchQuery}
//                                 onChange={(e) => {
//                                     setSearchQuery(e.target.value);
//                                     searchUsers(e.target.value);
//                                 }}
//                                 onFocus={handleSearchFocus}
//                                 onBlur={handleSearchBlur}
//                             />
//                             {searchQuery && (
//                                 <button 
//                                     className="im-search-clear"
//                                     onClick={() => setSearchQuery('')}
//                                 >
//                                     ×
//                                 </button>
//                             )}
//                         </div>
                        
//                         {/* Search results dropdown */}
//                         {searchResults.length > 0 && (
//                             <div className="im-search-results">
//                                 {searchResults.map(user => (
//                                     <div
//                                         key={user.id}
//                                         className="im-search-result-item"
//                                         onClick={() => startConversation(user.id)}
//                                     >
//                                         {renderAvatar(user.id, user.username, 'im-search-avatar')}
//                                         <div className="im-search-result-info">
//                                             <div className="im-search-result-name">
//                                                 {getDisplayName(user.id)}
//                                             </div>
//                                             <div className="im-search-result-categories">
//                                                 {getUserCategories(user.id).slice(0, 2).join(' • ')}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Tabs */}
//                     <div className="im-tabs-container">
//                         <button
//                             className={`im-tab-button ${activeTab === 'chats' ? 'im-tab-active' : ''}`}
//                             onClick={() => setActiveTab('chats')}
//                         >
//                             <span className="im-tab-icon">💬</span>
//                             Chats
//                         </button>
//                         <button
//                             className={`im-tab-button ${activeTab === 'suggested' ? 'im-tab-active' : ''}`}
//                             onClick={() => setActiveTab('suggested')}
//                         >
//                             <span className="im-tab-icon">🏢</span>
//                             Brands
//                         </button>
//                     </div>

//                     {/* Error Display */}
//                     {error && (
//                         <div className="im-error-message">
//                             <span className="im-error-icon">⚠️</span>
//                             <span className="im-error-text">{error}</span>
//                             <button className="im-error-close" onClick={() => setError(null)}>
//                                 ×
//                             </button>
//                         </div>
//                     )}

//                     {/* Content Area */}
//                     <div className="im-conversations-list">
//                         {activeTab === 'chats' ? (
//                             /* Conversations List */
//                             <div className="im-chats-container">
//                                 {conversations.length === 0 ? (
//                                     <div className="im-empty-state">
//                                         <div className="im-empty-icon">💬</div>
//                                         <div className="im-empty-title">No messages yet</div>
//                                         <div className="im-empty-subtitle">Connect with brands for collaborations</div>
//                                         <button 
//                                             className="im-primary-btn"
//                                             onClick={() => setActiveTab('suggested')}
//                                         >
//                                             Discover Brands
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     conversations.map(conversation => (
//                                         <div
//                                             key={conversation.conversation_id}
//                                             className={`im-conversation-item ${
//                                                 selectedConversation === conversation.conversation_id ? 'im-conversation-active' : ''
//                                             }`}
//                                             onClick={() => loadMessages(conversation.conversation_id)}
//                                         >
//                                             {renderAvatar(
//                                                 conversation.other_user.id, 
//                                                 conversation.other_user.username, 
//                                                 'im-conversation-avatar',
//                                                 true
//                                             )}
//                                             <div className="im-conversation-content">
//                                                 <div className="im-conversation-header">
//                                                     <div className="im-conversation-name">
//                                                         {getDisplayName(conversation.other_user.id)}
//                                                     </div>
//                                                     <div className="im-conversation-time">
//                                                         {formatTime(conversation.last_message_timestamp)}
//                                                     </div>
//                                                 </div>
//                                                 <div className="im-conversation-preview">
//                                                     <p className="im-preview-text">
//                                                         {conversation.last_message_type === 'media' ? '📎 Media' : conversation.last_message}
//                                                     </p>
//                                                     {conversation.unread_count > 0 && (
//                                                         <span className="im-unread-badge">
//                                                             {conversation.unread_count}
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         ) : (
//                             /* Suggested Brands */
//                             <div className="im-suggested-container">
//                                 <div className="im-suggested-header">
//                                     <h3 className="im-suggested-title">Brands to Connect With</h3>
//                                     <div className="im-suggested-count">{suggestedBrands.length} brands</div>
//                                 </div>
//                                 {suggestedBrands.length === 0 ? (
//                                     <div className="im-empty-state">
//                                         <div className="im-empty-icon">🏢</div>
//                                         <div className="im-empty-subtitle">No brand suggestions available</div>
//                                     </div>
//                                 ) : (
//                                     suggestedBrands.map(brand => (
//                                         <div
//                                             key={brand.id}
//                                             className="im-suggested-item"
//                                             onClick={() => startConversation(brand.id)}
//                                         >
//                                             {renderAvatar(brand.id, brand.username, 'im-suggested-avatar')}
//                                             <div className="im-suggested-info">
//                                                 <div className="im-suggested-name">
//                                                     {getDisplayName(brand.id)}
//                                                 </div>
//                                                 <div className="im-suggested-categories">
//                                                     {getUserCategories(brand.id).slice(0, 3).join(' • ')}
//                                                 </div>
//                                                 <div className="im-suggested-stats">
//                                                     {isUserOnline(brand.id) && (
//                                                         <span className="im-online-badge">Online</span>
//                                                     )}
//                                                 </div>
//                                                 <div className="im-suggested-bio">
//                                                     {getUserBio(brand.id)?.substring(0, 80)}
//                                                     {getUserBio(brand.id)?.length > 80 ? '...' : ''}
//                                                 </div>
//                                             </div>
//                                             <button className="im-connect-btn">
//                                                 Connect
//                                             </button>
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Chat Area */}
//                 <div className={`im-chat-area ${!selectedConversation ? 'im-chat-empty' : ''} ${isMobileMenuOpen ? 'im-mobile-hidden' : ''}`}>
//                     {selectedConversation ? (
//                         <>
//                             {/* Chat Header */}
//                             <div className="im-chat-header">
//                                 <button 
//                                     className="im-back-button"
//                                     onClick={() => {
//                                         setSelectedConversation(null);
//                                         if (window.innerWidth < 768) {
//                                             setIsMobileMenuOpen(true);
//                                         }
//                                     }}
//                                 >
//                                     ←
//                                 </button>
//                                 <div className="im-chat-user-info">
//                                     {renderAvatar(
//                                         getOtherUserId(),
//                                         getDisplayName(getOtherUserId()),
//                                         'im-chat-avatar',
//                                         true
//                                     )}
//                                     <div className="im-chat-user-details">
//                                         <div className="im-chat-username">
//                                             {getDisplayName(getOtherUserId())}
//                                         </div>
//                                         <div className="im-chat-categories">
//                                             {getUserCategories(getOtherUserId()).join(' • ')}
//                                         </div>
//                                         <div className="im-user-status">
//                                             {otherUserTyping ? (
//                                                 <span className="im-typing-status">Typing...</span>
//                                             ) : (
//                                                 getLastActive(
//                                                     getOtherUserId(),
//                                                     conversations.find(c => c.conversation_id === selectedConversation)?.last_message_timestamp
//                                                 )
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="im-chat-actions">
//                                     <button 
//                                         className="im-chat-action-btn"
//                                         onClick={() => {
//                                             const otherUserId = getOtherUserId();
//                                             if (otherUserId) {
//                                                 window.open(`/profile/${otherUserId}`, '_blank');
//                                             }
//                                         }}
//                                         title="View Profile"
//                                     >
//                                         👤
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Quick Messages */}
//                             {messages.length === 0 && (
//                                 <div className="im-quick-messages">
//                                     <h4 className="im-quick-title">Quick Starters</h4>
//                                     <div className="im-quick-grid">
//                                         {quickMessages.map((msg, index) => (
//                                             <button
//                                                 key={index}
//                                                 className="im-quick-btn"
//                                                 onClick={() => sendQuickMessage(msg)}
//                                             >
//                                                 {msg}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Messages */}
//                             <div className="im-messages-container">
//                                 {messages.length === 0 ? (
//                                     <div className="im-chat-empty-state">
//                                         <div className="im-empty-icon">💬</div>
//                                         <div className="im-empty-title">No messages yet</div>
//                                         <div className="im-empty-subtitle">Send a message to start the conversation</div>
//                                     </div>
//                                 ) : (
//                                     <div className="im-messages-list">
//                                         {messages.map(message => (
//                                             <div
//                                                 key={message.id}
//                                                 className={`im-message-wrapper ${
//                                                     message.sender_id === user.id ? 'im-message-sent' : 'im-message-received'
//                                                 } ${message.animate ? 'im-message-animate' : ''}`}
//                                             >
//                                                 {message.sender_id !== user.id && (
//                                                     renderAvatar(message.sender_id, '', 'im-message-avatar')
//                                                 )}
//                                                 <div
//                                                     className={`im-message-bubble ${
//                                                         message.sender_id === user.id ? 'im-bubble-sent' : 'im-bubble-received'
//                                                     } ${message.is_temp ? 'im-message-pending' : ''}`}
//                                                 >
//                                                     {message.message_type === 'media' ? 
//                                                         renderMediaMessage(message) : 
//                                                         <div className="im-message-text">{message.content}</div>
//                                                     }
//                                                     <div className="im-message-footer">
//                                                         <span className="im-message-time">
//                                                             {formatTime(message.timestamp)}
//                                                         </span>
//                                                         {message.sender_id === user.id && (
//                                                             <span className="im-message-status">
//                                                                 {message.read ? '✓✓' : 
//                                                                  message.delivered ? '✓✓' : 
//                                                                  message.is_temp ? '🕒' : '✓'}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                         {otherUserTyping && (
//                                             <div className="im-message-wrapper im-message-received">
//                                                 {renderAvatar(getOtherUserId(), '', 'im-message-avatar')}
//                                                 <div className="im-typing-indicator">
//                                                     <span></span>
//                                                     <span></span>
//                                                     <span></span>
//                                                 </div>
//                                             </div>
//                                         )}
//                                         <div ref={messagesEndRef} className="im-messages-anchor" />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Message Input */}
//                             <div className="im-input-container">
//                                 <div className="im-input-wrapper">
//                                     <input
//                                         type="file"
//                                         ref={fileInputRef}
//                                         style={{ display: 'none' }}
//                                         onChange={handleFileSelect}
//                                         accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,application/rtf,application/zip,application/x-rar-compressed,application/x-7z-compressed,application/x-tar"
//                                     />
//                                     <button 
//                                         className="im-input-action"
//                                         onClick={() => fileInputRef.current?.click()}
//                                         disabled={uploadingMedia}
//                                         title="Attach file"
//                                     >
//                                         {uploadingMedia ? (
//                                             <div className="im-uploading-spinner"></div>
//                                         ) : (
//                                             '📎'
//                                         )}
//                                     </button>
//                                     <div className="im-input-main">
//                                         <textarea
//                                             ref={textareaRef}
//                                             placeholder="Type your message..."
//                                             className="im-message-input"
//                                             rows="1"
//                                             value={newMessage}
//                                             onChange={(e) => {
//                                                 setNewMessage(e.target.value);
//                                                 if (e.target.value) {
//                                                     handleTyping();
//                                                 } else {
//                                                     stopTyping();
//                                                 }
//                                             }}
//                                             onKeyPress={(e) => {
//                                                 if (e.key === 'Enter' && !e.shiftKey) {
//                                                     e.preventDefault();
//                                                     sendMessage();
//                                                 }
//                                             }}
//                                         />
//                                     </div>
//                                     <button
//                                         onClick={sendMessage}
//                                         className={`im-send-btn ${newMessage.trim() && !messageSending ? 'im-send-active' : 'im-send-disabled'}`}
//                                         disabled={!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN || messageSending}
//                                     >
//                                         {messageSending ? '⏳' : '➤'}
//                                     </button>
//                                 </div>
//                             </div>
//                         </>
//                     ) : (
//                         /* Welcome Screen */
//                         <div className="im-welcome-screen">
//                             <div className="im-welcome-icon">💼</div>
//                             <h3 className="im-welcome-title">Your Collaborations</h3>
//                             <p className="im-welcome-subtitle">
//                                 Connect with brands to discuss partnership opportunities and campaigns.
//                                 Start meaningful conversations that lead to successful collaborations.
//                             </p>
//                             <div className="im-welcome-stats">
//                                 <div className="im-stat">
//                                     <div className="im-stat-number">{conversations.length}</div>
//                                     <div className="im-stat-label">Active Chats</div>
//                                 </div>
//                                 <div className="im-stat">
//                                     <div className="im-stat-number">{suggestedBrands.length}</div>
//                                     <div className="im-stat-label">Brands Available</div>
//                                 </div>
//                                 <div className="im-stat">
//                                     <div className="im-stat-number">{onlineUsers.size}</div>
//                                     <div className="im-stat-label">Online Now</div>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setActiveTab('suggested')}
//                                 className="im-primary-btn"
//                             >
//                                 Discover Brands
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* File Upload Modal */}
//             {showFileModal && selectedFile && (
//                 <div className="im-modal-overlay">
//                     <div className="im-modal">
//                         <div className="im-modal-header">
//                             <h3>Send File</h3>
//                             <button 
//                                 className="im-modal-close"
//                                 onClick={cancelFileUpload}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                         <div className="im-modal-content">
//                             {filePreview ? (
//                                 <div className="im-file-preview-image">
//                                     <img src={filePreview} alt="Preview" />
//                                 </div>
//                             ) : (
//                                 <div className="im-file-preview-info">
//                                     <div className="im-file-icon-large">
//                                         {getFileIcon(selectedFile.type)}
//                                     </div>
//                                     <div className="im-file-details">
//                                         <div className="im-file-name-large">{selectedFile.name}</div>
//                                         <div className="im-file-size-large">
//                                             {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                             <div className="im-caption-input">
//                                 <label>Add a caption (optional)</label>
//                                 <textarea
//                                     placeholder="Describe this file..."
//                                     value={fileCaption}
//                                     onChange={(e) => setFileCaption(e.target.value)}
//                                     rows="3"
//                                 />
//                             </div>
//                         </div>
//                         <div className="im-modal-actions">
//                             <button
//                                 className="im-cancel-btn"
//                                 onClick={cancelFileUpload}
//                                 disabled={uploadingMedia}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 className="im-send-file-btn"
//                                 onClick={sendMediaMessage}
//                                 disabled={uploadingMedia}
//                             >
//                                 {uploadingMedia ? 'Sending...' : 'Send File'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Mobile Overlay */}
//             {isMobileMenuOpen && (
//                 <div 
//                     className="im-mobile-overlay"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                 ></div>
//             )}
//         </div>
//     );
// };

// export default InfluencerMessage;