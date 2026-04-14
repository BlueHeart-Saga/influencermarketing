import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL configuration - change this to your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

interface SearchParams {
  query: string;
  maxResults?: number;
  order?: string;
  minSubscribers?: number;
  maxSubscribers?: number;
}

interface ChannelFilters {
  minSubscribers: number;
  maxSubscribers: number;
  category: string;
  engagementMin: number;
  sortBy: string;
}

class YouTubeAPI {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      // Add auth token if available
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  // Search channels with filters
  async searchChannels(
    query: string,
    maxResults: number = 12,
    order: string = 'relevance',
    minSubscribers: number = 0,
    maxSubscribers: number = 100000000
  ): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      max_results: maxResults.toString(),
      order,
      min_subscribers: minSubscribers.toString(),
      max_subscribers: maxSubscribers.toString(),
    });

    return this.request(`/youtube/search/channels?${params.toString()}`);
  }

  // Get single channel details
  async getChannel(channelId: string): Promise<any> {
    return this.request(`/youtube/channel/${channelId}`);
  }

  // Get channel videos
  async getChannelVideos(
    channelId: string,
    maxResults: number = 20,
    includeDetails: boolean = true
  ): Promise<any> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      include_details: includeDetails.toString(),
    });
    return this.request(
      `/youtube/channel/${channelId}/videos?${params.toString()}`
    );
  }

  // Get video details
  async getVideoDetails(videoId: string): Promise<any> {
    return this.request(`/youtube/video/${videoId}`);
  }

  // Analyze influencer
  async analyzeInfluencer(channelId: string): Promise<any> {
    return this.request(`/youtube/influencer/analyze/${channelId}`);
  }

  // Get trending categories
  async getTrendingCategories(): Promise<any> {
    return this.request('/youtube/trending/categories');
  }

  // Get multiple channels in batch
  async getMultipleChannels(channelIds: string[]): Promise<any> {
    const params = new URLSearchParams({
      channel_ids: channelIds.join(','),
    });
    return this.request(`/youtube/batch/channels?${params.toString()}`);
  }

  // Cache management
  async cacheSearchResults(key: string, data: any): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`search_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  async getCachedSearchResults(key: string, maxAge: number = 5 * 60 * 1000): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`search_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  // Clear cache
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const searchKeys = keys.filter(key => key.startsWith('search_'));
      await AsyncStorage.multiRemove(searchKeys);
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }
}

export const youtubeApi = new YouTubeAPI();
export default YouTubeAPI;