import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';



// Types for API requests and responses
export interface CampaignCreateData {
  title: string;
  description: string;
  requirements: string;
  budget: number;
  category: string;
  deadline: string;
  currency?: string;
  status?: 'active' | 'paused' | 'completed' | 'draft';
  brand_id: string;
  campaign_image?: any;
  campaign_video?: any;
}

export interface CampaignUpdateData {
  title?: string;
  description?: string;
  requirements?: string;
  budget?: number;
  category?: string;
  deadline?: string;
  currency?: string;
  status?: 'active' | 'paused' | 'completed' | 'draft';
  campaign_image_id?: string;
  campaign_video_id?: string;
  campaign_image?: any;
  campaign_video?: any;
}

export interface ApplicationStatusUpdate {
  status: 'pending' | 'approved' | 'rejected' | 'contracted' | 'media_submitted' | 'completed';
}

export interface ApplicationCreate {
  message?: string;
}

export interface LikeRequest {
  campaign_id: string;
  like: boolean;
}

export interface BookmarkRequest {
  campaign_id: string;
  bookmark: boolean;
}

export interface ContractAgreement {
  campaign_id: string;
  influencer_id: string;
  terms_accepted: boolean;
}

export interface MessageCreate {
  content: string;
  message_type?: string;
}

export interface MediaSubmission {
  campaign_id: string;
  description?: string;
  media_type?: 'image' | 'video' | 'document' | 'audio' | 'other';
}

export interface CampaignUsageResponse {
  plan: {
    name: string;
    type: string;
    is_trial: boolean;
    trial_remaining_days: number;
    limits: {
      max_campaigns_total?: number;
      max_campaigns_per_day?: number;
      can_create_campaigns: boolean;
    };
  };
  usage: {
    total_campaigns: number;
    today_campaigns: number;
    active_campaigns: number;
    paused_campaigns: number;
    completed_campaigns: number;
    usage_percentages: {
      total: number;
      daily: number;
    };
  };
  remaining: {
    total: number | null;
    daily: number | null;
  };
  can_create_more: boolean;
}

export interface CampaignLimitsResponse {
  plan: {
    name: string;
    description: string;
    type: string;
    is_trial: boolean;
    trial_remaining_days: number;
  };
  limits: {
    max_campaigns_total?: number;
    max_campaigns_per_day?: number;
    can_create_campaigns: boolean;
  };
  features: string[];
  subscription_status: {
    is_active: boolean;
    status: string;
    billing_cycle?: string;
    current_period_end?: string;
  };
}

export interface CanCreateResponse {
  can_create: boolean;
  reason: string;
  message: string;
  current_usage?: {
    total_campaigns: number;
    today_campaigns?: number;
  };
  remaining?: {
    total: number | string;
    daily: number | string;
  };
  plan_name: string;
  reset_time?: string;
  limit?: number;
  current_count?: number;
}

export interface ViewStatsResponse {
  total_views: number;
  unique_views: number;
  daily_views: Record<string, { total: number; unique: number }>;
  view_history_count: number;
}

export interface LikeStatusResponse {
  campaign_id: string;
  likes_count: number;
  user_liked: boolean;
  user_bookmarked: boolean;
}

export interface PopularCampaign {
  _id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  brand_id: string;
  brand_name?: string;
  total_views: number;
  unique_views: number;
  recent_total_views: number;
  recent_unique_views: number;
  campaign_image_id?: string;
  user_liked?: boolean;
  user_bookmarked?: boolean;
}

export interface ApplicationResponse {
  application_id: string;
  influencer_id: string;
  influencer_name: string;
  status: string;
  message?: string;
  applied_at: string;
  contract_signed?: boolean;
  contract_signed_at?: string;
  submitted_media?: any[];
  media_submitted_at?: string;
  campaign_id: string;
  campaign_title: string;
  campaign_description: string;
  campaign_requirements: string;
  campaign_budget: number;
  campaign_category: string;
  campaign_deadline: string;
  campaign_status: string;
  campaign_currency: string;
  campaign_image_id?: string;
  campaign_video_id?: string;
  campaign_created_at: string;
  brand_id: string;
  brand_name?: string;
  brand_email?: string;
  influencer_email?: string;
  influencer_phone?: string;
  influencer_bio?: string;
  influencer_social_media?: any;
}

export interface MediaFileResponse {
  file_id: string;
  filename: string;
  content_type: string;
  media_type: string;
  size: number;
  description?: string;
  submitted_at: string;
  download_url: string;
  influencer_id?: string;
  influencer_name?: string;
}

export interface MessageResponse {
  _id: string;
  sender_id: string;
  receiver_id: string;
  campaign_id: string;
  content: string;
  message_type: string;
  attachments?: any[];
  created_at: string;
  read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

export interface ConversationResponse {
  _id: {
    campaign_id: string;
    other_user_id: string;
  };
  last_message: MessageResponse;
  unread_count: number;
  other_user_name?: string;
  other_user_email?: string;
  campaign_title?: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  link?: string;
  metadata?: any;
  read: boolean;
  created_at: string;
  real_time_alert?: boolean;
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net' : 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net');

// Create axios instance with default config
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 60000,
    headers: {
      'Accept': 'application/json',
    },
  });

  // Request interceptor to add auth token
  // In the request interceptor, make sure we're not modifying FormData
  instance.interceptors.request.use(
    async (config) => {
      try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ Simple log only
      if (__DEV__) {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      // Log responses in development
      if (__DEV__) {
        console.log(`✅ ${response.config.url} - success (${response.status})`);
      }
      return response;
    },
    async (error) => {
      // Log errors in development
      if (__DEV__) {
        console.error('❌ API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // Handle token expiration
      if (error.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });

            if (response.data.access_token) {
              await AsyncStorage.setItem('access_token', response.data.access_token);

              // Retry original request
              error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
              return axios(error.config);
            }
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
          // You can emit an event here to handle navigation
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Campaign API class
class CampaignAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = createAxiosInstance();
  }

  // Helper method for FormData handling
  private async createFormDataWithFileInfo(data: Record<string, any>): Promise<FormData> {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;

      if (key === 'campaign_image' || key === 'campaign_video') {
        if (value && value.uri) {
          // Get file info for better debugging
          let fileInfo;
          try {
            // Try to get file info using expo-file-system
            const fileUri = value.uri;
            const fileInfoResult = await FileSystem.getInfoAsync(fileUri);
            fileInfo = fileInfoResult;
            console.log(`📁 File info for ${key}:`, fileInfo);
          } catch (e) {
            console.log(`Could not get file info for ${key}:`, e);
          }

          // Create the file object
          const file = {
            uri: value.uri,
            type: value.type || (key === 'campaign_image' ? 'image/jpeg' : 'video/mp4'),
            name: value.name || (key === 'campaign_image' ? `campaign_image_${Date.now()}.jpg` : `campaign_video_${Date.now()}.mp4`),
          };

          formData.append(key, file as any);
          console.log(`📎 Appended ${key}:`, file.name, file.type);
        }
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }

    return formData;
  }

  // ==================== CAMPAIGN CRUD OPERATIONS ====================

  /**
   * Create a new campaign with subscription-based limits
   */
  // In campaignAPI.ts, update the createCampaign method:

  // In campaignAPI.ts, update the createCampaign method:

  async createCampaign(campaignData: FormData | CampaignCreateData) {
    try {
      const finalData = campaignData instanceof FormData
        ? campaignData
        : this.createFormData(campaignData);

      // Log the FormData content for debugging
      if (__DEV__ && finalData instanceof FormData) {
        console.log('📦 FormData content:');
        // @ts-ignore
        if (finalData._parts) {
          // @ts-ignore
          finalData._parts.forEach(([key, value]) => {
            if (key === 'campaign_image' || key === 'campaign_video') {
              console.log(`- ${key}: ${value.name} (${value.type}, size: ${value.size || 'unknown'})`);
            } else {
              console.log(`- ${key}: ${value}`);
            }
          });
        }
      }

      const response = await this.api.post('/campaigns', finalData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': undefined, // Let axios set the boundary
        },
        transformRequest: [(data) => data], // CRITICAL: Stop Axios from trying to process FormData on RN
        timeout: 120000, // Increase timeout to 2 minutes for file uploads
        maxBodyLength: Infinity, // Remove body size limit
        maxContentLength: Infinity, // Remove content size limit
      });

      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ Create campaign detailed error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout,
        }
      });
      throw error;
    }
  }

  /**
   * Get all campaigns for the authenticated brand
   */
  async getBrandCampaigns() {
    try {
      const response = await this.api.get('/brand/campaigns');
      return response;
    } catch (error) {
      console.error('Get brand campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get all available campaigns for the authenticated influencer
   */
  async getAvailableCampaigns() {
    try {
      const response = await this.api.get('/influencer/campaigns');
      return response;
    } catch (error) {
      console.error('Get available campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaignById(campaignId: string) {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}`);
      return response;
    } catch (error) {
      console.error('Get campaign by ID error:', error);
      throw error;
    }
  }

  /**
   * Update an existing campaign
   */
  async updateCampaign(campaignId: string, updateData: FormData | CampaignUpdateData) {
    try {
      let config: AxiosRequestConfig = {};

      if (updateData instanceof FormData) {
        config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      } else {
        // Check if there are files to upload
        const hasFiles = updateData.campaign_image || updateData.campaign_video;
        if (hasFiles) {
          const formData = this.createFormData(updateData);
          updateData = formData;
          config = {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          };
        }
      }

      const response = await this.api.put(`/campaigns/${campaignId}`, updateData, config);
      return response.data;
    } catch (error) {
      console.error('Update campaign error:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   */
  async deleteBrandCampaign(campaignId: string) {
    try {
      const response = await this.api.delete(`/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Delete campaign error:', error);
      throw error;
    }
  }

  // ==================== CAMPAIGN LIMITS & USAGE ====================

  /**
   * Get campaign usage statistics for the authenticated user
   */
  async getCampaignUsage(): Promise<CampaignUsageResponse> {
    try {
      const response = await this.api.get('/campaigns/usage');
      return response.data;
    } catch (error) {
      console.error('Get campaign usage error:', error);
      throw error;
    }
  }

  /**
   * Get campaign creation limits for the current user's subscription
   */
  async getCampaignLimits(): Promise<CampaignLimitsResponse> {
    try {
      const response = await this.api.get('/campaigns/limits');
      return response.data;
    } catch (error) {
      console.error('Get campaign limits error:', error);
      throw error;
    }
  }

  /**
   * Check if user can create a new campaign
   */
  async checkCanCreateCampaign(): Promise<CanCreateResponse> {
    try {
      const response = await this.api.get('/campaigns/can-create');
      return response.data;
    } catch (error) {
      console.error('Check can create campaign error:', error);
      throw error;
    }
  }

  // ==================== VIEW TRACKING ====================

  /**
   * Track a campaign view
   */
  async trackCampaignView(campaignId: string) {
    try {
      const response = await this.api.post(`/campaigns/${campaignId}/view`);
      return response.data;
    } catch (error) {
      console.error('Track campaign view error:', error);
      throw error;
    }
  }

  /**
   * Get view statistics for a campaign
   */
  async getCampaignViews(campaignId: string): Promise<ViewStatsResponse> {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}/views`);
      return response.data;
    } catch (error) {
      console.error('Get campaign views error:', error);
      throw error;
    }
  }

  /**
   * Get popular campaigns
   */
  async getPopularCampaigns(limit: number = 10, days: number = 30): Promise<PopularCampaign[]> {
    try {
      const response = await this.api.get('/campaigns/popular', {
        params: { limit, days },
      });
      return response.data;
    } catch (error) {
      console.error('Get popular campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get view statistics for all campaigns of a brand
   */
  async getBrandCampaignViews() {
    try {
      const response = await this.api.get('/brand/campaigns/views');
      return response.data;
    } catch (error) {
      console.error('Get brand campaign views error:', error);
      throw error;
    }
  }

  // ==================== LIKE & BOOKMARK ====================

  /**
   * Like or unlike a campaign
   */
  async likeCampaign(campaignId: string, like: boolean = true) {
    try {
      const response = await this.api.post('/campaigns/like', {
        campaign_id: campaignId,
        like,
      });
      return response.data;
    } catch (error) {
      console.error('Like campaign error:', error);
      throw error;
    }
  }

  /**
   * Bookmark or remove bookmark from a campaign
   */
  async bookmarkCampaign(campaignId: string, bookmark: boolean = true) {
    try {
      const response = await this.api.post('/campaigns/bookmark', {
        campaign_id: campaignId,
        bookmark,
      });
      return response.data;
    } catch (error) {
      console.error('Bookmark campaign error:', error);
      throw error;
    }
  }

  /**
   * Get like and bookmark status for a campaign
   */
  async getCampaignLikeStatus(campaignId: string): Promise<LikeStatusResponse> {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}/like-status`);
      return response.data;
    } catch (error) {
      console.error('Get campaign like status error:', error);
      throw error;
    }
  }

  /**
   * Get all campaigns liked by the current user
   */
  async getUserLikedCampaigns() {
    try {
      const response = await this.api.get('/user/likes');
      return response.data;
    } catch (error) {
      console.error('Get user liked campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get all campaigns bookmarked by the current user
   */
  async getUserBookmarkedCampaigns() {
    try {
      const response = await this.api.get('/user/bookmarks');
      return response.data;
    } catch (error) {
      console.error('Get user bookmarked campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get popular campaigns based on likes
   */
  async getPopularCampaignsByLikes(limit: number = 10): Promise<PopularCampaign[]> {
    try {
      const response = await this.api.get('/campaigns/popular/likes', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get popular campaigns by likes error:', error);
      throw error;
    }
  }

  /**
   * Get users who liked a campaign (brand owners and admins only)
   */
  async getCampaignLikers(campaignId: string) {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}/likers`);
      return response.data;
    } catch (error) {
      console.error('Get campaign likers error:', error);
      throw error;
    }
  }

  // ==================== APPLICATIONS ====================

  /**
   * Apply to a campaign (influencer only)
   */
  async applyToCampaign(campaignId: string, application: ApplicationCreate) {
    try {
      const response = await this.api.post(`/campaigns/${campaignId}/apply`, application);
      return response.data;
    } catch (error) {
      console.error('Apply to campaign error:', error);
      throw error;
    }
  }

  /**
   * Get all applications for the brand
   */
  async getBrandApplications(): Promise<ApplicationResponse[]> {
    try {
      const response = await this.api.get('/brand/applications');
      return response.data;
    } catch (error) {
      console.error('Get brand applications error:', error);
      throw error;
    }
  }

  /**
   * Get all applications for the influencer
   */
  async getInfluencerApplications(): Promise<ApplicationResponse[]> {
    try {
      const response = await this.api.get('/influencer/applications');
      return response.data;
    } catch (error) {
      console.error('Get influencer applications error:', error);
      throw error;
    }
  }

  /**
   * Update application status (brand only)
   */
  async updateApplicationStatus(
    campaignId: string,
    influencerId: string,
    statusUpdate: ApplicationStatusUpdate
  ) {
    try {
      const response = await this.api.put(
        `/applications/${campaignId}/${influencerId}`,
        statusUpdate
      );
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  }

  /**
   * Send contract to approved influencer (brand only)
   */
  async sendContractAgreement(campaignId: string, influencerId: string) {
    try {
      const response = await this.api.post(
        `/applications/${campaignId}/${influencerId}/send-contract`
      );
      return response.data;
    } catch (error) {
      console.error('Send contract agreement error:', error);
      throw error;
    }
  }

  /**
   * Accept contract agreement (influencer only)
   */
  async acceptContract(contract: ContractAgreement) {
    try {
      const response = await this.api.post('/contracts/accept', contract);
      return response.data;
    } catch (error) {
      console.error('Accept contract error:', error);
      throw error;
    }
  }

  // ==================== MEDIA SUBMISSION ====================

  /**
   * Submit media files for a campaign (influencer only)
   */
  async submitMediaFiles(
    campaignId: string,
    mediaFiles: any[],
    description?: string
  ) {
    try {
      const formData = new FormData();
      formData.append('campaign_id', campaignId);

      if (description) {
        formData.append('description', description);
      }

      mediaFiles.forEach((file, index) => {
        formData.append('media_files', {
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || `media_${index}.jpg`,
        } as any);
      });

      const response = await this.api.post('/media/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Submit media files error:', error);
      throw error;
    }
  }

  /**
   * Get all media files for a specific campaign
   */
  async getCampaignMediaFiles(campaignId: string): Promise<MediaFileResponse[]> {
    try {
      const response = await this.api.get(`/media/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Get campaign media files error:', error);
      throw error;
    }
  }

  /**
   * Get all media files submitted by the influencer
   */
  async getInfluencerMediaFiles(): Promise<MediaFileResponse[]> {
    try {
      const response = await this.api.get('/media/influencer');
      return response.data;
    } catch (error) {
      console.error('Get influencer media files error:', error);
      throw error;
    }
  }

  // ==================== MESSAGES ====================

  /**
   * Send a message to influencer or brand
   */
  async sendMessage(
    campaignId: string,
    receiverId: string,
    content: string,
    attachments: any[] = []
  ) {
    try {
      const formData = new FormData();
      formData.append('campaign_id', campaignId);
      formData.append('influencer_id', receiverId);
      formData.append('message', content);

      attachments.forEach((file, index) => {
        formData.append('attachments', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name || `attachment_${index}`,
        } as any);
      });

      const response = await this.api.post('/applications/contact', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Get messages between users for a campaign
   */
  async getMessages(campaignId: string, otherUserId: string): Promise<MessageResponse[]> {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}/messages/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<ConversationResponse[]> {
    try {
      const response = await this.api.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadMessageCount(): Promise<UnreadCountResponse> {
    try {
      const response = await this.api.get('/messages/unread/count');
      return response.data;
    } catch (error) {
      console.error('Get unread message count error:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications specific to a campaign (brand only)
   */
  async getCampaignNotifications(campaignId: string): Promise<NotificationResponse[]> {
    try {
      const response = await this.api.get(`/campaigns/${campaignId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Get campaign notifications error:', error);
      throw error;
    }
  }

  /**
   * Get brand notifications summary
   */
  async getBrandNotificationsSummary() {
    try {
      const response = await this.api.get('/brand/notifications/summary');
      return response.data;
    } catch (error) {
      console.error('Get brand notifications summary error:', error);
      throw error;
    }
  }

  /**
   * Get real-time notifications for influencer dashboard
   */
  async getInfluencerRealTimeNotifications(limit: number = 20): Promise<NotificationResponse[]> {
    try {
      const response = await this.api.get('/influencer/notifications/real-time', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Get influencer real-time notifications error:', error);
      throw error;
    }
  }

  /**
   * Get campaign-specific notifications for influencer
   */
  async getCampaignSpecificNotifications(campaignId: string): Promise<NotificationResponse[]> {
    try {
      const response = await this.api.get(`/influencer/notifications/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Get campaign specific notifications error:', error);
      throw error;
    }
  }

  // ==================== AI FEATURES ====================

  /**
   * Analyze product link using AI
   */
  async analyzeProductLink(productLink: string) {
    try {
      const response = await this.api.post('/ai/analyze-product', { product_link: productLink });
      return response.data;
    } catch (error) {
      console.error('Analyze product link error:', error);
      throw error;
    }
  }

  // ==================== PAYMENTS ====================

  /**
   * Complete payment for influencer (brand only)
   */
  async completePayment(paymentId: string, transactionId: string) {
    try {
      const response = await this.api.put(`/payments/${paymentId}/complete`, {
        transaction_id: transactionId,
      });
      return response.data;
    } catch (error) {
      console.error('Complete payment error:', error);
      throw error;
    }
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all campaigns (admin only)
   */
  async getAllCampaignsAdmin() {
    try {
      const response = await this.api.get('/admin/campaigns');
      return response.data;
    } catch (error) {
      console.error('Get all campaigns admin error:', error);
      throw error;
    }
  }

  /**
   * Update campaign status (admin only)
   */
  async adminUpdateCampaignStatus(campaignId: string, status: string) {
    try {
      const response = await this.api.put(`/admin/campaigns/${campaignId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Admin update campaign status error:', error);
      throw error;
    }
  }

  /**
   * Delete campaign (admin only)
   */
  async adminDeleteCampaign(campaignId: string) {
    try {
      const response = await this.api.delete(`/admin/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Admin delete campaign error:', error);
      throw error;
    }
  }

  /**
   * Get campaign stats (admin only)
   */
  async getCampaignStatsAdmin() {
    try {
      const response = await this.api.get('/admin/campaigns/stats');
      return response.data;
    } catch (error) {
      console.error('Get campaign stats admin error:', error);
      throw error;
    }
  }

  /**
   * Get campaign detail (admin only)
   */
  async getCampaignDetailAdmin(campaignId: string) {
    try {
      const response = await this.api.get(`/admin/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Get campaign detail admin error:', error);
      throw error;
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Health check endpoint
   */
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Clear all campaign-related cache/data
   */
  async clearCache() {
    try {
      // Implement cache clearing logic if needed
      console.log('Campaign cache cleared');
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }

  /**
   * Format campaign data for display
   */
  formatCampaignForDisplay(campaign: any) {
    return {
      ...campaign,
      formattedBudget: this.formatCurrency(campaign.budget, campaign.currency),
      formattedDeadline: campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline',
      formattedCreatedAt: campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown',
      applicationCount: campaign.applications?.length || 0,
      pendingCount: campaign.applications?.filter((a: any) => a.status === 'pending').length || 0,
      approvedCount: campaign.applications?.filter((a: any) => a.status === 'approved').length || 0,
      rejectedCount: campaign.applications?.filter((a: any) => a.status === 'rejected').length || 0,
      completionRate: campaign.applications?.length > 0
        ? Math.round((campaign.applications.filter((a: any) =>
          ['completed', 'media_submitted', 'contracted'].includes(a.status)
        ).length / campaign.applications.length) * 100)
        : 0,
    };
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number, currency: string = 'USD') {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹',
    };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount?.toFixed(2) || '0.00'}`;
  }
}

// Export a singleton instance
export const campaignAPI = new CampaignAPI();

// Also export the class for testing or custom instances
export default CampaignAPI;