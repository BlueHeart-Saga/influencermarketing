import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { chatApi, Conversation, Message, Group } from '../../services/chatAPI';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';

import { Video } from 'expo-video';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from "react-native-safe-area-context";



const { width } = Dimensions.get('window');

interface ChatScreenProps {
  role: 'brand' | 'influencer';
  initialUserId?: string;
  initialCampaignId?: string;
  navigation?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ role, initialUserId, initialCampaignId, navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: false,
    groups: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});
  const [attachment, setAttachment] = useState<any>(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<any>(null);
  const socketConnectedRef = useRef(false);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // ==================== INITIALIZATION ====================

  // Effect to load data when screen is focused (tab active)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshData();
        setupWebSocket();
      }

      return () => {
        // We might want to keep the socket alive if it's not too heavy,
        // but the user asked for optimization when tab is active.
        // chatApi.disconnectWebSocket(); 
      };
    }, [user])
  );

  // Still keep a one-time setup for WebSocket if needed, 
  // or handle it in useFocusEffect. Let's stick to useFocusEffect for data.
  // We'll keep the disconnect on unmount (not on unfocus) for smoother UX.
  useEffect(() => {
    return () => {
      chatApi.disconnectWebSocket();
    };
  }, []);

  // Handle initial user/campaign from props
  const initialNavDoneRef = useRef(false);
  useEffect(() => {
    if (initialUserId && !loading.conversations && !initialNavDoneRef.current) {
      const existingConv = conversations.find(
        conv => conv.other_participant?.id === initialUserId
      );

      if (existingConv) {
        handleConversationSelect(existingConv);
        initialNavDoneRef.current = true;
      } else {
        // If not found in conversations, user target might be new
        const tryCreateInitialChat = async () => {
          try {
            const targetRole = role === 'brand' ? 'influencer' : 'brand';
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/users?role=${targetRole}`, {
              headers: {
                'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
              },
            });
            const data = await res.json();
            const allUsers = data.users || data.data?.users || [];
            const participant = allUsers.find((u: any) => u.id === initialUserId);

            if (participant) {
              const newConv: Conversation = {
                id: `new_${Date.now()}`,
                type: 'direct',
                other_participant: {
                  id: participant.id,
                  username: participant.username || participant.name || 'User',
                  profile_picture: participant.profile_picture,
                  role: participant.role,
                },
                unread_count: 0,
                message_count: 0,
                updated_at: new Date().toISOString(),
              };
              setConversations(prev => [newConv, ...prev]);
              handleConversationSelect(newConv);
              initialNavDoneRef.current = true;
            }
          } catch (error) {
            console.error('Error auto-starting conversation:', error);
          }
        };
        tryCreateInitialChat();
      }
    }
  }, [initialUserId, conversations, loading.conversations]);

  const setupWebSocket = async () => {
    if (!user) return;

    try {
      await chatApi.connectWebSocket(user.id);

      chatApi.onMessage(handleIncomingMessage);
      chatApi.onTyping(handleTypingIndicator);
      chatApi.onConnectionChange((connected) => {
        socketConnectedRef.current = connected;
      });
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  // ==================== DATA LOADING ====================

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      loadConversations(),
      loadGroups(),
      loadUnreadCount()
    ]);
    setRefreshing(false);
  };

  const loadConversations = async () => {
    try {
      if (!refreshing) {
        setLoading(prev => ({ ...prev, conversations: true }));
      }
      const response = await chatApi.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Only alert if not a background refresh
      if (!refreshing) {
        Alert.alert('Error', 'Failed to load conversations');
      }
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  const loadGroups = async () => {
    try {
      if (!refreshing) {
        setLoading(prev => ({ ...prev, groups: true }));
      }
      const response = await chatApi.getGroups();
      setGroups(response.groups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const loadMessages = async (conversationId: string, reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(prev => ({ ...prev, messages: true }));
        setPage(1);
        setHasMoreMessages(true);
      } else {
        setLoadingMore(true);
      }

      const response = await chatApi.getMessages(
        conversationId,
        reset ? 1 : page + 1,
        20
      );

      if (reset) {
        const ordered = [...response.messages].reverse();

        setMessages(ordered);
        setPage(1);

        // Scroll to bottom after loading messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);

      } else {
        const olderMessages = [...response.messages].reverse();

        setMessages(prev => [
          ...olderMessages,
          ...prev
        ]);

        setPage(prev => prev + 1);
      }

      setHasMoreMessages(response.pagination.has_more);

      // Mark as read
      await chatApi.markConversationAsRead(conversationId);

      // Update unread count in UI
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0, has_unread: false }
            : conv
        )
      );

    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      if (reset) {
        setLoading(prev => ({ ...prev, messages: false }));
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadGroupMessages = async (groupId: string, reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(prev => ({ ...prev, messages: true }));
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const response = await chatApi.getGroupMessages(
        groupId,
        reset ? 1 : page + 1,
        20
      );

      if (reset) {
        // reverse so newest message appears at bottom
        setMessages([...response.messages].reverse());
        setPage(1);

        // scroll to bottom after loading
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);

      } else {
        // prepend older messages when loading more
        setMessages(prev => [
          ...response.messages.reverse(),
          ...prev
        ]);
        setPage(prev => prev + 1);
      }

      setHasMoreMessages(response.pagination.has_more);

    } catch (error) {
      console.error('Error loading group messages:', error);
    } finally {
      if (reset) {
        setLoading(prev => ({ ...prev, messages: false }));
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await chatApi.getUnreadCount();
      setUnreadCount(response.total_unread_messages);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const targetRole = role === 'brand' ? 'influencer' : 'brand';
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/users?role=${targetRole}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
        },
      });
      const data = await response.json();
      setUsers(data.users || data.data?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // ==================== MESSAGE HANDLING ====================

  const handleIncomingMessage = (message: Message) => {
    if (selectedConversation && message.conversation_id === selectedConversation.id) {
      setMessages(prev => {
        const updated = [...prev, message];

        // set divider when user not near bottom
        if (!isNearBottom && !firstUnreadId) {
          setFirstUnreadId(message.id);
        }

        return updated;
      });

      if (isNearBottom) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }

    } else if (selectedGroup && message.group_id === selectedGroup.id) {
      setMessages(prev => {
        const updated = [...prev, message];

        if (!isNearBottom && !firstUnreadId) {
          setFirstUnreadId(message.id);
        }

        return updated;
      });

      if (isNearBottom) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    } else {
      setConversations(prev =>
        prev.map(conv =>
          conv.id === message.conversation_id
            ? { ...conv, unread_count: (conv.unread_count || 0) + 1, has_unread: true }
            : conv
        )
      );

      setUnreadCount(prev => prev + 1);
    }
  };

  const handleTypingIndicator = (data: any) => {
    if (selectedConversation && data.conversation_id === selectedConversation.id) {
      setTypingUsers(prev => ({
        ...prev,
        [data.user_id]: {
          username: data.username,
          timestamp: Date.now(),
        }
      }));

      // Clear after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => {
          const newTyping = { ...prev };
          delete newTyping[data.user_id];
          return newTyping;
        });
      }, 3000);
    }
  };

  const sendMessage = async () => {
    if ((!inputText.trim() && !attachment) || !selectedConversation) return;

    const text = inputText.trim();

    try {
      let messageType = 'text';
      let attachmentData: any = null;

      if (attachment) {
        if (attachment.type?.startsWith('image/')) {
          messageType = 'image';
        } else if (attachment.type?.startsWith('video/')) {
          messageType = 'video';
        } else if (attachment.type?.startsWith('audio/')) {
          messageType = 'audio';
        } else {
          messageType = 'file';
        }

        attachmentData = {
          attachment_url: attachment.uri,
          attachment_type: messageType,
          attachment_name: attachment.name,
          attachment_size: attachment.size,
        };
      }

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        content: text,
        message_type: messageType as any,
        sender_id: user?.id || '',
        receiver_id: selectedConversation.other_participant?.id,
        conversation_id: selectedConversation.id,
        is_read: false,
        is_delivered: false,
        is_edited: false,
        created_at: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          username: user?.username || '',
          profile_picture: user?.profile_picture,
        },
        ...(attachment && { attachment_url: attachment.uri, metadata: attachmentData }),
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setInputText('');
      setAttachment(null);
      setShowAttachmentPreview(false);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // Send to API
      const sentMessage = await chatApi.sendMessage({
        receiver_id: selectedConversation.other_participant?.id!,
        content: text,
        message_type: messageType,
        conversation_id: selectedConversation.id,
        ...attachmentData,
      });

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // Update conversation list
      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
            ...conv,
            last_message: {
              content: text.substring(0, 100),
              timestamp: new Date().toISOString(),
              sender_id: user?.id || '',
              has_attachment: !!attachment,
            },
            updated_at: new Date().toISOString(),
          }
          : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendGroupMessage = async () => {
    if ((!inputText.trim() && !attachment) || !selectedGroup) return;

    const text = inputText.trim();

    try {
      let messageType = 'text';

      if (attachment) {
        if (attachment.type?.startsWith('image/')) messageType = 'image';
        else if (attachment.type?.startsWith('video/')) messageType = 'video';
        else if (attachment.type?.startsWith('audio/')) messageType = 'audio';
        else messageType = 'file';
      }

      // Optimistic update
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        content: text,
        message_type: messageType as any,
        sender_id: user?.id || '',
        group_id: selectedGroup.id,
        is_read: false,
        is_delivered: false,
        is_edited: false,
        created_at: new Date().toISOString(),
        sender: {
          id: user?.id || '',
          username: user?.username || '',
          profile_picture: user?.profile_picture,
        },
        ...(attachment && { attachment_url: attachment.uri }),
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setInputText('');
      setAttachment(null);
      setShowAttachmentPreview(false);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      // Send to API
      const sentMessage = await chatApi.sendGroupMessage({
        group_id: selectedGroup.id,
        content: text,
        message_type: messageType,
        ...(attachment && { attachment_url: attachment.uri }),
      });

      setMessages(prev =>
        prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg)
      );

    } catch (error) {
      console.error('Error sending group message:', error);
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = useCallback(() => {
    if (!selectedConversation || !socketConnectedRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      chatApi.sendTypingIndicator(
        selectedConversation.id,
        selectedConversation.other_participant?.id!,
        true
      );
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedConversation) {
        chatApi.sendTypingIndicator(
          selectedConversation.id,
          selectedConversation.other_participant?.id!,
          false
        );
      }
    }, 1000);
  }, [isTyping, selectedConversation]);

  // ==================== ATTACHMENT HANDLING ====================

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri) as any;

      setAttachment({
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.uri.split('/').pop() || 'image.jpg',
        size: fileInfo.size || 0,
      });
      setShowAttachmentPreview(true);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          name: asset.name,
          size: asset.size || 0,
        });
        setShowAttachmentPreview(true);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri) as any;

        setAttachment({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}.jpg`,
          size: fileInfo.size || 0,
        });
        setShowAttachmentPreview(true);
      }
    }
  };

  // ==================== CONVERSATION ACTIONS ====================

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedGroup(null);
    setMessages([]);
    loadMessages(conversation.id);
    setShowInfoPanel(false);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setSelectedConversation(null);
    setMessages([]);
    loadGroupMessages(group.id);
    setShowInfoPanel(false);
  };

  const startNewConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select a user');
      return;
    }

    const participant = selectedUsers[0];

    // Check if conversation already exists
    const existingConv = conversations.find(
      conv => conv.other_participant?.id === participant.id
    );

    if (existingConv) {
      handleConversationSelect(existingConv);
    } else {
      // Create new conversation object
      const newConv: Conversation = {
        id: `new_${Date.now()}`,
        type: 'direct',
        other_participant: {
          id: participant.id,
          username: participant.username || participant.name || 'User',
          profile_picture: participant.profile_picture,
          role: participant.role,
        },
        unread_count: 0,
        message_count: 0,
        updated_at: new Date().toISOString(),
      };

      setSelectedConversation(newConv);
      setMessages([]);
      setConversations(prev => [newConv, ...prev]);
    }

    setShowNewChatModal(false);
    setSelectedUsers([]);
    setSearchQuery('');
  };

  const createNewGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      Alert.alert('Error', 'Please enter group name and select members');
      return;
    }

    try {
      const newGroup = await chatApi.createGroup({
        name: groupName,
        description: groupDescription,
        participant_ids: selectedUsers.map(u => u.id),
      });

      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      setShowNewGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setSelectedUsers([]);
      setActiveTab('groups');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const toggleFavorite = (conversationId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(conversationId)) {
        newFavorites.delete(conversationId);
      } else {
        newFavorites.add(conversationId);
      }
      return newFavorites;
    });
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      await chatApi.updateConversationSettings(conversationId, { is_archived: true });
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const muteConversation = async (conversationId: string, mute: boolean) => {
    try {
      await chatApi.updateConversationSettings(conversationId, { is_muted: mute });
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, is_muted: mute } : conv
      ));
    } catch (error) {
      console.error('Error muting conversation:', error);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) return format(date, 'HH:mm');
      if (isYesterday(date)) return 'Yesterday ' + format(date, 'HH:mm');
      return format(date, 'MMM d, HH:mm');
    } catch {
      return '';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getDisplayName = (participant?: any) => {
    if (!participant) return 'Unknown';
    return participant.display_name || participant.username || participant.name || 'User';
  };

  const getProfileImage = (participant?: any) => {
    return participant?.profile_picture || null;
  };

  const getRoleColor = (userRole?: string) => {
    return userRole === 'brand' ? '#4CAF50' : '#2196F3';
  };

  const filteredConversations = conversations
    .filter(conv => !conv.is_archived)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    const username = String(u.username || "").toLowerCase();
    const name = String(u.name || "").toLowerCase();
    const company = String(u.company_name || "").toLowerCase();

    let nicheMatch = false;

    if (Array.isArray(u.niche)) {
      nicheMatch = u.niche.some((n: string) =>
        String(n).toLowerCase().includes(query)
      );
    } else if (typeof u.niche === "string") {
      nicheMatch = u.niche.toLowerCase().includes(query);
    }

    return (
      username.includes(query) ||
      name.includes(query) ||
      company.includes(query) ||
      nicheMatch
    );
  });

  const typingUsersList = Object.values(typingUsers).map(u => u.username);

  // ==================== RENDER FUNCTIONS ====================

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isFavorite = favorites.has(item.id);
    const lastMessageTime = item.last_message?.timestamp
      ? formatDistanceToNow(new Date(item.last_message.timestamp), { addSuffix: true })
      : '';

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          selectedConversation?.id === item.id && styles.selectedConversation
        ]}
        onPress={() => handleConversationSelect(item)}
      >
        <View style={styles.avatarContainer}>
          {item.other_participant?.profile_picture ? (
            <Image
              source={{ uri: item.other_participant.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={[
              styles.avatarPlaceholder,
              { backgroundColor: getRoleColor(item.other_participant?.role) }
            ]}>
              <Text style={styles.avatarText}>
                {getInitials(getDisplayName(item.other_participant))}
              </Text>
            </View>
          )}
          {item.has_unread && <View style={styles.unreadBadge} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {getDisplayName(item.other_participant)}
            </Text>
            {lastMessageTime ? (
              <Text style={styles.conversationTime}>{lastMessageTime}</Text>
            ) : null}
          </View>

          <View style={styles.conversationFooter}>
            <Text style={[
              styles.lastMessage,
              item.has_unread && styles.unreadMessage
            ]} numberOfLines={1}>
              {item.last_message?.sender_id === user?.id ? 'You: ' : ''}
              {item.last_message?.content || 'No messages yet'}
            </Text>

            {isFavorite && (
              <Ionicons name="star" size={16} color="#FFC107" style={styles.favoriteIcon} />
            )}

            {item.unread_count > 0 && (
              <View style={styles.unreadCount}>
                <Text style={styles.unreadCountText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    const lastMessageTime = item.last_message?.timestamp
      ? formatDistanceToNow(new Date(item.last_message.timestamp), { addSuffix: true })
      : '';

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          selectedGroup?.id === item.id && styles.selectedConversation
        ]}
        onPress={() => handleGroupSelect(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#9C27B0' }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          {item.unread_count > 0 && <View style={styles.unreadBadge} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </Text>
            {lastMessageTime ? (
              <Text style={styles.conversationTime}>{lastMessageTime}</Text>
            ) : null}
          </View>

          <View style={styles.conversationFooter}>
            <Text style={[
              styles.lastMessage,
              item.unread_count > 0 && styles.unreadMessage
            ]} numberOfLines={1}>
              {item.last_message?.content || 'No messages yet'}
            </Text>

            <Text style={styles.groupMemberCount}>
              {item.participant_count} members
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    const showAvatar = !isOwnMessage && (activeTab === 'groups' || activeTab === 'direct');
    const showDivider = item.id === firstUnreadId;

    return (

      <>
        {showDivider && (
          <View style={styles.newMessageDivider}>
            <Text style={styles.newMessageDividerText}>New Messages</Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage
        ]}>
          {showAvatar && (
            <View style={styles.messageAvatar}>
              {item.sender?.profile_picture ? (
                <Image source={{ uri: item.sender.profile_picture }} style={styles.messageAvatarImage} />
              ) : (
                <View style={[styles.messageAvatarPlaceholder, { backgroundColor: getRoleColor(item.sender?.role) }]}>
                  <Text style={styles.messageAvatarText}>
                    {getInitials(item.sender?.username)}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
            item.message_type !== 'text' && styles.attachmentBubble
          ]}>
            {item.message_type === 'text' ? (
              <Text style={[
                styles.messageText,
                isOwnMessage && styles.ownMessageText
              ]}>
                {item.content}
              </Text>
            ) : item.message_type === 'image' ? (
              <TouchableOpacity onPress={() => {/* Open image viewer */ }}>
                <Image
                  source={{ uri: item.attachment_url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : item.message_type === 'video' ? (
              <TouchableOpacity style={styles.videoContainer}>
                <Video
                  source={{ uri: item.attachment_url! }}
                  style={styles.messageVideo}
                  useNativeControls
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.fileContainer}>
                <Ionicons name="document" size={24} color={isOwnMessage ? '#fff' : '#666'} />
                <Text style={[styles.fileName, isOwnMessage && styles.ownMessageText]}>
                  {item.metadata?.attachment_name || 'File'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.messageFooter}>
              <Text style={[
                styles.messageTime,
                isOwnMessage && styles.ownMessageTime
              ]}>
                {formatMessageTime(item.created_at)}
              </Text>

              {isOwnMessage && (
                <Ionicons
                  name={item.is_read ? 'checkmark-done' : 'checkmark'}
                  size={16}
                  color={item.is_read ? '#4CAF50' : (isOwnMessage ? '#fff' : '#666')}
                  style={styles.messageStatus}
                />
              )}
            </View>
          </View>
        </View>

      </>
    );
  };

  const renderAttachmentPreview = () => (
    <Modal
      visible={showAttachmentPreview}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAttachmentPreview(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.attachmentPreview}>
          <View style={styles.attachmentPreviewHeader}>
            <Text style={styles.attachmentPreviewTitle}>Attachment Preview</Text>
            <TouchableOpacity onPress={() => setShowAttachmentPreview(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.attachmentPreviewContent}>
            {attachment?.type?.startsWith('image/') ? (
              <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
            ) : attachment?.type?.startsWith('video/') ? (
              <Video
                source={{ uri: attachment.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="cover"
              />
            ) : (
              <View style={styles.previewFile}>
                <Ionicons name="document" size={60} color="#666" />
                <Text style={styles.previewFileName}>{attachment?.name}</Text>
                <Text style={styles.previewFileSize}>
                  {(attachment?.size / 1024).toFixed(2)} KB
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.attachmentPreviewFooter}>
            <TouchableOpacity
              style={[styles.previewButton, styles.cancelButton]}
              onPress={() => {
                setAttachment(null);
                setShowAttachmentPreview(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.previewButton, styles.sendButton]}
              onPress={() => {
                setShowAttachmentPreview(false);
                activeTab === 'groups' ? sendGroupMessage() : sendMessage();
              }}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderNewChatModal = () => (
    <Modal
      visible={showNewChatModal}
      animationType="slide"
      onRequestClose={() => setShowNewChatModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New Conversation</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalSearchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.modalSearchInput}
            placeholder={`Search ${role === 'brand' ? 'influencers' : 'brands'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => {
                setSelectedUsers([item]);
                startNewConversation();
              }}
            >
              <View style={styles.userAvatar}>
                {item.profile_picture ? (
                  <Image source={{ uri: item.profile_picture }} style={styles.userAvatarImage} />
                ) : (
                  <View style={[styles.userAvatarPlaceholder, { backgroundColor: getRoleColor(item.role) }]}>
                    <Text style={styles.userAvatarText}>
                      {getInitials(item.username || item.name)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.username || item.name || 'User'}</Text>
                <Text style={styles.userRole}>
                  {item.role === 'brand'
                    ? item.company_name || 'Brand'
                    : Array.isArray(item.niche)
                      ? item.niche.join(', ')
                      : item.niche || 'Influencer'}
                </Text>
              </View>

              <Ionicons name="chatbubble-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyListText}>No users found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );

  const renderNewGroupModal = () => (
    <Modal
      visible={showNewGroupModal}
      animationType="slide"
      onRequestClose={() => setShowNewGroupModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowNewGroupModal(false)}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create New Group</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView>
          <View style={styles.groupForm}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Group Name *"
              value={groupName}
              onChangeText={setGroupName}
            />

            <TextInput
              style={styles.groupDescriptionInput}
              placeholder="Description (Optional)"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.sectionTitle}>Selected Members ({selectedUsers.length})</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedMembersContainer}>
              {selectedUsers.map(user => (
                <View key={user.id} style={styles.selectedMemberChip}>
                  <Text style={styles.selectedMemberName}>
                    {user.username || user.name || 'User'}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}>
                    <Ionicons name="close-circle" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Add Members</Text>

            <View style={styles.modalSearchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedUsers.some(u => u.id === item.id);
                return (
                  <TouchableOpacity
                    style={[styles.userItem, isSelected && styles.selectedUserItem]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedUsers(prev => prev.filter(u => u.id !== item.id));
                      } else {
                        setSelectedUsers(prev => [...prev, item]);
                      }
                    }}
                  >
                    <View style={styles.userAvatar}>
                      {item.profile_picture ? (
                        <Image source={{ uri: item.profile_picture }} style={styles.userAvatarImage} />
                      ) : (
                        <View style={[styles.userAvatarPlaceholder, { backgroundColor: getRoleColor(item.role) }]}>
                          <Text style={styles.userAvatarText}>
                            {getInitials(item.username || item.name)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.username || item.name || 'User'}</Text>
                      <Text style={styles.userRole}>{item.role}</Text>
                    </View>

                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                      size={24}
                      color={isSelected ? '#4CAF50' : '#666'}
                    />
                  </TouchableOpacity>
                );
              }}
              style={styles.userList}
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.createButton, (!groupName || selectedUsers.length === 0) && styles.createButtonDisabled]}
            onPress={createNewGroup}
            disabled={!groupName || selectedUsers.length === 0}
          >
            <Text style={styles.createButtonText}>
              Create Group ({selectedUsers.length} members)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderInfoPanel = () => (
    <Modal
      visible={showInfoPanel}
      animationType="slide"
      transparent
      onRequestClose={() => setShowInfoPanel(false)}
    >
      <View style={styles.infoPanelOverlay}>
        <View style={styles.infoPanel}>
          <View style={styles.infoPanelHeader}>
            <Text style={styles.infoPanelTitle}>Conversation Info</Text>
            <TouchableOpacity onPress={() => setShowInfoPanel(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {selectedConversation && (
            <ScrollView>
              <View style={styles.infoPanelContent}>
                <View style={styles.infoAvatarContainer}>
                  {selectedConversation.other_participant?.profile_picture ? (
                    <Image
                      source={{ uri: selectedConversation.other_participant.profile_picture }}
                      style={styles.infoAvatar}
                    />
                  ) : (
                    <View style={[
                      styles.infoAvatarPlaceholder,
                      { backgroundColor: getRoleColor(selectedConversation.other_participant?.role) }
                    ]}>
                      <Text style={styles.infoAvatarText}>
                        {getInitials(getDisplayName(selectedConversation.other_participant))}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.infoName}>
                    {getDisplayName(selectedConversation.other_participant)}
                  </Text>

                  <View style={styles.infoRoleBadge}>
                    <Text style={styles.infoRoleText}>
                      {selectedConversation.other_participant?.role || 'User'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Actions</Text>

                  <TouchableOpacity
                    style={styles.infoAction}
                    onPress={() => toggleFavorite(selectedConversation.id)}
                  >
                    <Ionicons
                      name={favorites.has(selectedConversation.id) ? 'star' : 'star-outline'}
                      size={20}
                      color="#FFC107"
                    />
                    <Text style={styles.infoActionText}>
                      {favorites.has(selectedConversation.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.infoAction}
                    onPress={() => muteConversation(selectedConversation.id, !selectedConversation.is_muted)}
                  >
                    <Ionicons
                      name={selectedConversation.is_muted ? 'volume-high' : 'volume-mute'}
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.infoActionText}>
                      {selectedConversation.is_muted ? 'Unmute' : 'Mute'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.infoAction}
                    onPress={() => {
                      archiveConversation(selectedConversation.id);
                      setShowInfoPanel(false);
                    }}
                  >
                    <Ionicons name="archive-outline" size={20} color="#666" />
                    <Text style={styles.infoActionText}>Archive</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>Statistics</Text>

                  <View style={styles.infoStat}>
                    <Text style={styles.infoStatLabel}>Total Messages</Text>
                    <Text style={styles.infoStatValue}>
                      {selectedConversation.message_count || messages.length}
                    </Text>
                  </View>

                  <View style={styles.infoStat}>
                    <Text style={styles.infoStatLabel}>Unread Messages</Text>
                    <Text style={styles.infoStatValue}>
                      {selectedConversation.unread_count || 0}
                    </Text>
                  </View>

                  <View style={styles.infoStat}>
                    <Text style={styles.infoStatLabel}>Last Active</Text>
                    <Text style={styles.infoStatValue}>
                      {formatDistanceToNow(new Date(selectedConversation.updated_at), { addSuffix: true })}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // ==================== MAIN RENDER ====================

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
      <View style={styles.header}>


        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
            onPress={() => setActiveTab('direct')}
          >
            <Ionicons
              name="chatbubble"
              size={20}
              color={activeTab === 'direct' ? '#007AFF' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>
              Direct
            </Text>
            {unreadCount > 0 && activeTab === 'direct' && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}
          >
            <Ionicons
              name="people"
              size={20}
              color={activeTab === 'groups' ? '#007AFF' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
              Groups
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => {
            if (activeTab === 'direct') {
              loadUsers();
              setShowNewChatModal(true);
            } else {
              loadUsers();
              setShowNewGroupModal(true);
            }
          }}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>

        {/* Conversations List */}
        {(!selectedConversation && !selectedGroup) && (
          <View style={styles.sidebarFull}>
            {activeTab === 'direct' ? (
              <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversationItem}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshData}
                    tintColor="#007AFF"
                    colors={["#007AFF"]}
                  />
                }
                ListEmptyComponent={
                  loading.conversations ? (
                    <ActivityIndicator size="large" style={styles.loader} />
                  ) : (
                    <View style={styles.emptyList}>
                      <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyListText}>No conversations yet</Text>
                      <TouchableOpacity
                        style={styles.startChatButton}
                        onPress={() => {
                          loadUsers();
                          setShowNewChatModal(true);
                        }}
                      >
                        <Text style={styles.startChatButtonText}>Start New Chat</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
              />
            ) : (
              <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={renderGroupItem}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshData}
                    tintColor="#007AFF"
                    colors={["#007AFF"]}
                  />
                }
                ListEmptyComponent={
                  loading.groups ? (
                    <ActivityIndicator size="large" style={styles.loader} />
                  ) : (
                    <View style={styles.emptyList}>
                      <Ionicons name="people-outline" size={48} color="#ccc" />
                      <Text style={styles.emptyListText}>No groups yet</Text>
                      <TouchableOpacity
                        style={styles.startChatButton}
                        onPress={() => {
                          loadUsers();
                          setShowNewGroupModal(true);
                        }}
                      >
                        <Text style={styles.startChatButtonText}>Create New Group</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
              />
            )}
          </View>
        )}

        {/* Chat Area */}
        {(selectedConversation || selectedGroup) && (
          <KeyboardAvoidingView
            style={styles.chatArea}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setSelectedConversation(null);
                    setSelectedGroup(null);
                    setMessages([]);
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.chatHeaderInfo}>
                  {selectedConversation?.other_participant?.profile_picture ? (
                    <Image
                      source={{ uri: selectedConversation.other_participant.profile_picture }}
                      style={styles.chatHeaderAvatar}
                    />
                  ) : selectedGroup?.avatar_url ? (
                    <Image source={{ uri: selectedGroup.avatar_url }} style={styles.chatHeaderAvatar} />
                  ) : (
                    <View style={[
                      styles.chatHeaderAvatarPlaceholder,
                      {
                        backgroundColor: selectedConversation
                          ? getRoleColor(selectedConversation.other_participant?.role)
                          : '#9C27B0'
                      }
                    ]}>
                      <Text style={styles.chatHeaderAvatarText}>
                        {selectedConversation
                          ? getInitials(getDisplayName(selectedConversation.other_participant))
                          : selectedGroup?.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View>
                    <Text style={styles.chatHeaderName}>
                      {selectedConversation
                        ? getDisplayName(selectedConversation.other_participant)
                        : selectedGroup?.name}
                    </Text>
                    {typingUsersList.length > 0 ? (
                      <Text style={styles.chatHeaderStatus}>
                        {typingUsersList.join(', ')} {typingUsersList.length === 1 ? 'is' : 'are'} typing...
                      </Text>
                    ) : selectedConversation ? (
                      <Text style={styles.chatHeaderStatus}>
                        {selectedConversation.other_participant?.is_online ? '🟢 Online' : 'Last seen recently'}
                      </Text>
                    ) : (
                      <Text style={styles.chatHeaderStatus}>
                        {selectedGroup?.participant_count} members
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowInfoPanel(true)}>
                <Ionicons name="information-circle-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}

              initialNumToRender={20}
              maxToRenderPerBatch={10}
              windowSize={10}

              maintainVisibleContentPosition={{ minIndexForVisible: 1 }}

              onScroll={(e) => {
                const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

                const distanceFromBottom =
                  contentSize.height - (layoutMeasurement.height + contentOffset.y);

                const nearBottom = distanceFromBottom < 120;

                setIsNearBottom(nearBottom);

                // show floating button when user scrolls up
                setShowScrollToBottom(!nearBottom);

                // clear unread divider
                if (nearBottom && firstUnreadId) {
                  setFirstUnreadId(null);
                }
              }}

              scrollEventThrottle={16}
              onEndReached={() => {
                if (hasMoreMessages && !loadingMore) {
                  if (selectedConversation) {
                    loadMessages(selectedConversation.id, false);
                  } else if (selectedGroup) {
                    loadGroupMessages(selectedGroup.id, false);
                  }
                }
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                loadingMore ? <ActivityIndicator size="small" style={styles.loader} /> : null
              }
              ListEmptyComponent={
                loading.messages ? (
                  <ActivityIndicator size="large" style={styles.loader} />
                ) : (
                  <View style={styles.emptyMessages}>
                    <Text style={styles.emptyMessagesText}>
                      No messages yet. Start the conversation!
                    </Text>
                  </View>
                )
              }
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.attachButton} onPress={pickDocument}>
                <Ionicons name="document" size={24} color="#666" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  handleTyping();
                }}
                multiline
              />

              {attachment ? (
                <TouchableOpacity
                  style={styles.attachmentPreviewButton}
                  onPress={() => setShowAttachmentPreview(true)}
                >
                  <Ionicons name="attach" size={24} color="#007AFF" />
                  <View style={styles.attachmentBadge} />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() && !attachment) && styles.sendButtonDisabled
                ]}
                onPress={activeTab === 'groups' ? sendGroupMessage : sendMessage}
                disabled={!inputText.trim() && !attachment}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={(!inputText.trim() && !attachment) ? '#ccc' : '#007AFF'}
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )

          // : (
          //   <View style={styles.noChatSelected}>
          //     <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          //     <Text style={styles.noChatText}>
          //       {activeTab === 'direct'
          //         ? 'Select a conversation to start messaging'
          //         : 'Select a group to start messaging'}
          //     </Text>
          //   </View>
          // )

        }
      </View>

      {/* Modals */}
      {renderAttachmentPreview()}
      {renderNewChatModal()}
      {renderNewGroupModal()}
      {renderInfoPanel()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },


  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newChatButton: {
    padding: 8,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // sidebar: {
  //   width: 300,
  //   backgroundColor: '#fff',
  //   borderRightWidth: 1,
  //   borderRightColor: '#e0e0e0',
  // },

  sidebarFull: {
    flex: 1,
    backgroundColor: '#fff',
  },

  fullWidth: {
    width: '100%',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedConversation: {
    backgroundColor: '#f0f7ff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  favoriteIcon: {
    marginRight: 8,
  },
  unreadCount: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupMemberCount: {
    fontSize: 12,
    color: '#999',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#fff',


  },

  newMessageDivider: {
    alignSelf: 'center',
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 10,
  },

  newMessageDividerText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#999',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  attachmentBubble: {
    padding: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  ownMessageText: {
    color: '#fff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  videoContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
  },
  messageVideo: {
    width: '100%',
    height: '100%',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 150,
  },
  fileName: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginRight: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 14,
  },
  attachmentPreviewButton: {
    padding: 8,
    position: 'relative',
  },
  attachmentBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  noChatText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  loader: {
    marginTop: 20,
  },
  emptyList: {
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 16,
  },
  startChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyMessages: {
    alignItems: 'center',
    padding: 40,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentPreview: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  attachmentPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  attachmentPreviewContent: {
    padding: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
  },
  previewVideo: {
    width: width * 0.8,
    height: width * 0.6,
  },
  previewFile: {
    alignItems: 'center',
    padding: 20,
  },
  previewFileName: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  previewFileSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  attachmentPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  previewButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedUserItem: {
    backgroundColor: '#f0f7ff',
  },
  userAvatar: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  userAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  groupForm: {
    padding: 16,
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  groupDescriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedMemberName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  userList: {
    maxHeight: 300,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoPanelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  infoPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  infoPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoPanelContent: {
    padding: 16,
  },
  infoAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  infoAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoRoleBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  infoRoleText: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoActionText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#333',
  },
  infoStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default ChatScreen;