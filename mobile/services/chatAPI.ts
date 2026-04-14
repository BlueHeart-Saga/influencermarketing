import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

import { format, formatDistanceToNow } from "date-fns"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';




export { formatDistanceToNow };


export interface Message {
  id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'video' | 'audio';
  attachment_url?: string;
  sender_id: string;
  receiver_id?: string;
  conversation_id?: string;
  group_id?: string;
  is_read: boolean;
  is_delivered: boolean;
  is_edited: boolean;
  is_deleted?: boolean;
  created_at: string;
  updated_at?: string;
  sender?: {
    id: string;
    username: string;
    profile_picture?: string;
    role?: string;
  };
  receiver?: {
    id: string;
    username: string;
    profile_picture?: string;
  };
  metadata?: {
    attachment_type?: string;
    attachment_name?: string;
    attachment_size?: number;
  };
}

export interface Conversation {
  id: string;
  title?: string;
  type: 'direct' | 'group';
  other_participant?: {
    id: string;
    username: string;
    profile_picture?: string;
    role?: string;
    is_online?: boolean;
    company_name?: string;
    niche?: string;
    display_name?: string;
  };
  last_message?: {
    message_id?: string;
    content: string;
    sender_id: string;
    timestamp: string;
    has_attachment?: boolean;
  };
  unread_count: number;
  message_count: number;
  updated_at: string;
  created_at?: string;
  status?: string;
  is_muted?: boolean;
  is_archived?: boolean;
  has_unread?: boolean;
  
  // Group specific fields
  name?: string;
  description?: string;
  avatar_url?: string;
  creator_id?: string;
  participant_count?: number;
  is_admin?: boolean;
  is_public?: boolean;
  participants?: any[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  creator_id: string;
  participants: string[];
  participant_count: number;
  admins: string[];
  is_public: boolean;
  last_message?: any;
  unread_count: number;
  message_count: number;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface GroupsResponse {
  groups: Group[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface UnreadCountResponse {
  total_unread_messages: number;
  conversations_with_unread: number;
}

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: string;
  profile: {
    name?: string;
    profile_picture?: string;
    display_name?: string;
    contact_person?: string;
    industry?: string;
    categories?: string[];
    location?: string;
    niche?: string;
    company_name?: string;
  };
  is_online: boolean;
}

class ChatApiService {
  private socket: Socket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((data: any) => void)[] = [];
  private connectionListeners: ((status: boolean) => void)[] = [];

  // ==================== HTTP METHODS ====================

  private async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (requiresAuth) {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(
    status?: string,
    hasUnread?: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<ConversationsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (hasUnread !== undefined) params.append('has_unread', String(hasUnread));
    params.append('limit', String(limit));
    params.append('offset', String(offset));

    const response = await this.request<any>(`/messages/conversations?${params}`);
    return {
      conversations: response.data?.conversations || response.conversations || [],
      pagination: response.data?.pagination || response.pagination || {
        total: 0,
        limit,
        offset,
        has_more: false
      }
    };
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MessagesResponse> {
    const response = await this.request<any>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    
    const data = response.data || response;
    return {
      messages: data.messages || [],
      pagination: data.pagination || {
        page,
        limit,
        total: 0,
        has_more: false
      }
    };
  }

  async sendMessage(data: {
    receiver_id: string;
    content: string;
    message_type?: string;
    conversation_id?: string;
    attachment_url?: string;
    attachment_type?: string;
    attachment_name?: string;
    attachment_size?: number;
    metadata?: any;
  }): Promise<Message> {
    const response = await this.request<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data || response.message || response;
  }

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const response = await this.request<any>(`/messages/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    
    return response.data || response;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const response = await this.request<any>(`/messages/messages/${messageId}`, {
      method: 'DELETE',
    });
    
    return response.success || true;
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    await this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  async updateConversationSettings(
    conversationId: string,
    settings: { is_muted?: boolean; is_archived?: boolean }
  ): Promise<void> {
    const params = new URLSearchParams();
    if (settings.is_muted !== undefined) params.append('is_muted', String(settings.is_muted));
    if (settings.is_archived !== undefined) params.append('is_archived', String(settings.is_archived));

    await this.request(`/messages/conversations/${conversationId}/settings?${params}`, {
      method: 'PUT',
    });
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await this.request<any>('/messages/unread-count');
    return response.data || response;
  }

  async searchMessages(query: string, conversationId?: string, limit: number = 20): Promise<Message[]> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', String(limit));

    const response = await this.request<any>(`/messages/search?${params}`);
    return response.results || [];
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await this.request<any>(`/messages/user/${userId}/details`);
    return response.data || response;
  }

  // ==================== GROUP METHODS ====================

  async createGroup(data: {
    name: string;
    description?: string;
    participant_ids: string[];
    avatar_url?: string;
    is_public?: boolean;
  }): Promise<Group> {
    const response = await this.request<any>('/messages/groups/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data || response;
  }

  async getGroups(limit: number = 20, offset: number = 0): Promise<GroupsResponse> {
    const response = await this.request<any>(`/messages/groups?limit=${limit}&offset=${offset}`);
    return {
      groups: response.data?.groups || response.groups || [],
      pagination: response.data?.pagination || response.pagination || {
        total: 0,
        limit,
        offset,
        has_more: false
      }
    };
  }

  async getGroupDetails(groupId: string): Promise<Group> {
    const response = await this.request<any>(`/messages/groups/${groupId}`);
    return response.data || response;
  }

  async sendGroupMessage(data: {
    group_id: string;
    content: string;
    message_type?: string;
    attachment_url?: string;
    metadata?: any;
  }): Promise<Message> {
    const response = await this.request<any>(`/messages/groups/${data.group_id}/message`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.data || response.message || response;
  }

  async getGroupMessages(
    groupId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MessagesResponse> {
    const response = await this.request<any>(
      `/messages/groups/${groupId}/messages?page=${page}&limit=${limit}`
    );
    
    const data = response.data || response;
    return {
      messages: data.messages || [],
      pagination: data.pagination || {
        page,
        limit,
        total: 0,
        has_more: false
      }
    };
  }

  // ==================== WEBSOCKET METHODS ====================

  async connectWebSocket(userId: string): Promise<void> {
    if (this.socket?.connected) return;

    const token = await this.getToken();
    if (!token) throw new Error('No authentication token');

    this.socket = io(API_BASE_URL, {
      path: '/ws',
      query: { user_id: userId, token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.connectionListeners.forEach(listener => listener(true));
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.connectionListeners.forEach(listener => listener(false));
    });

    this.socket.on('new_message', (data: any) => {
      const message = data.message || data;
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('new_group_message', (data: any) => {
      this.messageListeners.forEach(listener => listener(data.message || data));
    });

    this.socket.on('message_updated', (data: any) => {
      // Handle message update
    });

    this.socket.on('message_deleted', (data: any) => {
      // Handle message deletion
    });

    this.socket.on('typing', (data: any) => {
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('user_online', (data: any) => {
      console.log('User online:', data);
    });

    this.socket.on('user_offline', (data: any) => {
      console.log('User offline:', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendTypingIndicator(conversationId: string, receiverId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        conversation_id: conversationId,
        receiver_id: receiverId,
        is_typing: isTyping,
      });
    }
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: any) => void): () => void {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const chatApi = new ChatApiService();