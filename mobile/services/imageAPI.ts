import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageGenerationRequest {
  prompt: string;
  num_images: number;
  model?: string;
  resolution?: string;
}

export interface ImageGenerationResponse {
  status: string;
  prompt: string;
  images_generated: number;
  images: Array<{
    url: string;
    id?: string;
    width?: number;
    height?: number;
  }>;
  usage_info: {
    today_used: number;
    daily_limit: number;
    remaining: number;
    reset_time: string;
  };
  quota_info: QuotaInfo;
}

export interface QuotaInfo {
  plan: Plan;
  limits: Limits;
  usage: Usage;
  remaining: Remaining;
  can_generate_images: boolean;
}

export interface Plan {
  name: string;
  type: string;
  key: string;
}

export interface Limits {
  max_image_generations_per_day: number;
  max_images_per_request: number;
  can_generate_images: boolean;
  allowed_resolutions: string[];
  allowed_models: string[];
  features: string[];
}

export interface Usage {
  today_used: number;
  total_used: number;
  daily_usage_percent: number;
  last_used: string | null;
  reset_time: string;
}

export interface Remaining {
  daily: number | string;
  reset_in: string;
}

export interface UsageResponse {
  plan: Plan;
  limits: Limits;
  usage: Usage;
  remaining: Remaining;
  can_generate_images: boolean;
}

export interface CanGenerateResponse {
  can_generate: boolean;
  reason: string;
  message: string;
  usage: {
    current: number;
    limit: number;
    remaining: number;
    requested: number;
  };
  plan: string;
  limits: {
    max_images_per_day: number;
    max_images_per_request: number;
    features: string[];
  };
}

export interface UsageHistoryResponse {
  total_records: number;
  filtered_records: number;
  recent_usage: Array<{
    timestamp: string;
    action: string;
    count: number;
    prompt: string;
    images_generated: number;
  }>;
  summary: {
    total_used: number;
    today_used: number;
    last_used: string | null;
    period_days: number;
  };
}

export interface DownloadResult {
  uri: string;
  savedToGallery: boolean;
  fileSize?: number;
}

export interface PlanFeature {
  icon: keyof typeof import('@expo/vector-icons/build/Ionicons').glyphMap;
  label: string;
  value: string;
  color: string;
}

export interface UpgradeMessage {
  title: string;
  description: string;
  buttonText: string;
  buttonAction?: () => void;
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class ImageAPIError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ImageAPIError';
    this.status = status;
    this.code = code;
  }
}

export class PaymentRequiredError extends ImageAPIError {
  constructor(message: string = 'Payment required. Please upgrade your plan.') {
    super(message, 402, 'PAYMENT_REQUIRED');
    this.name = 'PaymentRequiredError';
  }
}

export class PermissionError extends ImageAPIError {
  constructor(message: string = 'You don\'t have permission to generate images.') {
    super(message, 403, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

export class RateLimitError extends ImageAPIError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends ImageAPIError {
  constructor(message: string = 'Request timeout. Please try again.') {
    super(message, 408, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// MAIN API CLASS
// ============================================================================

class ImageAPI {
  private baseURL: string;
  private timeout: number;
  private cachePrefix = 'image_api_cache_';
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(baseURL: string = API_BASE_URL, timeout: number = 60000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = await this.getAuthToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${this.baseURL}/api/images${endpoint}`;
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle specific status codes
      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        throw new PaymentRequiredError(errorData.detail || 'Payment required. Please upgrade your plan.');
      }

      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new PermissionError(errorData.detail || 'You don\'t have permission to generate images.');
      }

      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        throw new RateLimitError(errorData.detail || 'Rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            const messages = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
            throw new ImageAPIError(messages, response.status);
          }
          throw new ImageAPIError(errorData.detail, response.status);
        }

        throw new ImageAPIError(errorData.message || `HTTP error! status: ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timeout. Image generation is taking longer than expected. Please try again.');
      }

      throw error;
    }
  }

  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.cachePrefix}${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < this.cacheTTL) {
          return data as T;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  private async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.cachePrefix}${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Get image generation usage
   */
  async getImageUsage(options?: { signal?: AbortSignal; forceRefresh?: boolean }): Promise<UsageResponse> {
    if (!options?.forceRefresh) {
      const cached = await this.getCachedData<UsageResponse>('usage');
      if (cached) return cached;
    }

    const data = await this.request<UsageResponse>('/usage', {
      signal: options?.signal,
    });

    await this.setCachedData('usage', data);
    return data;
  }

  /**
   * Check if user can generate images
   */
  async canGenerateImages(
    numImages: number = 1,
    options?: { signal?: AbortSignal }
  ): Promise<CanGenerateResponse> {
    return this.request<CanGenerateResponse>(
      `/can-generate?num_images=${numImages}`,
      { signal: options?.signal }
    );
  }

  /**
   * Generate multiple images
   */
  async generateImages(
    data: ImageGenerationRequest,
    options?: { signal?: AbortSignal }
  ): Promise<ImageGenerationResponse> {
    // Clear usage cache to refresh after generation
    await AsyncStorage.removeItem(`${this.cachePrefix}usage`);

    return this.request<ImageGenerationResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify(data),
      signal: options?.signal,
    });
  }

  /**
   * Get usage history
   */
  async getUsageHistory(
    limit: number = 50,
    days: number = 30,
    options?: { signal?: AbortSignal }
  ): Promise<UsageHistoryResponse> {
    return this.request<UsageHistoryResponse>(
      `/usage-history?limit=${limit}&days=${days}`,
      { signal: options?.signal }
    );
  }

  /**
   * Download image to device
   */
  async downloadImage(
    imageUrl: string,
    fileName?: string,
    saveToGallery: boolean = true
  ): Promise<DownloadResult> {
    try {
      // Validate URL
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('Invalid image URL');
      }

      // Generate filename
      const timestamp = Date.now();
      const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const finalFileName = fileName || `ai-image-${timestamp}.${ext}`;

      // Local path
      const localPath = `${FileSystem.documentDirectory}${finalFileName}`;

      console.log(`📥 Downloading image from: ${imageUrl}`);
      console.log(`📦 Saving to: ${localPath}`);

      // Download file
      const downloadResult = await FileSystem.downloadAsync(imageUrl, localPath, {
        md5: true,
      });

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }

      console.log(`✅ Download complete: ${downloadResult.uri}`);
      console.log(`📊 File size: ${downloadResult.size} bytes`);

      let savedToGallery = false;

      // Save to gallery if requested and not on web
      if (saveToGallery && Platform.OS !== 'web') {
        const hasPermission = await this.requestPermissions();

        if (hasPermission) {
          try {
            const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
            await MediaLibrary.createAlbumAsync('Brio AI', asset, false);
            savedToGallery = true;
            console.log('✅ Saved to gallery');
          } catch (error) {
            console.error('Error saving to gallery:', error);
            // Don't throw, just log the error
          }
        }
      }

      const finalUri = downloadResult.uri.startsWith('file://') ? downloadResult.uri : `file://${downloadResult.uri}`;

      return {
        uri: finalUri,
        savedToGallery,
        fileSize: downloadResult.size,
      };
    } catch (error) {
      console.error('Download error:', error);
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Share image
   */
  async shareImage(imageUrl: string, message?: string): Promise<void> {
    try {
      // First check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        // Fallback for platforms without sharing
        if (Platform.OS === 'android') {
          // On Android, try to open the URL directly
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: imageUrl,
          });
          return;
        }
        throw new Error('Sharing is not available on this device');
      }

      // Download the image first
      const { uri } = await this.downloadImage(imageUrl, `share-${Date.now()}.jpg`, false);

      // Share the local file
      const shareUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/jpeg',
        dialogTitle: message || 'AI Generated Image',
        UTI: 'public.jpeg',
      });

      console.log('✅ Image shared successfully');
    } catch (error) {
      console.error('Share error:', error);
      throw new Error(`Failed to share image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Share multiple images
   */
  async shareMultipleImages(imageUrls: string[], message?: string): Promise<void> {
    try {
      if (imageUrls.length === 0) {
        throw new Error('No images to share');
      }

      if (imageUrls.length === 1) {
        // Single image share
        await this.shareImage(imageUrls[0], message);
        return;
      }

      // For multiple images, share the first one with a message
      // Note: Most platforms don't support sharing multiple images directly
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      const { uri } = await this.downloadImage(imageUrls[0], `share-${Date.now()}.jpg`, false);

      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: message || `Generated ${imageUrls.length} AI Images`,
        UTI: 'public.jpeg',
      });

      console.log(`✅ Shared ${imageUrls.length} images`);
    } catch (error) {
      console.error('Share multiple error:', error);
      throw new Error(`Failed to share images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached generation status
   */
  async getCachedGenerationStatus(): Promise<{
    canGenerate: boolean;
    remaining: number;
    limit: number;
    used: number;
  } | null> {
    try {
      const usage = await this.getCachedData<UsageResponse>('usage');

      if (usage) {
        const todayUsed = usage.usage?.today_used || 0;
        const dailyLimit = usage.limits?.max_image_generations_per_day || 0;
        const isUnlimited = dailyLimit === -1;
        const remaining = isUnlimited ? Infinity : Math.max(0, dailyLimit - todayUsed);

        return {
          canGenerate: isUnlimited || todayUsed < dailyLimit,
          remaining,
          limit: dailyLimit,
          used: todayUsed,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting cached status:', error);
      return null;
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('✅ Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Get plan tier from usage
   */
  getPlanTier(usage: UsageResponse | null): string {
    return usage?.plan?.type || 'trial';
  }

  /**
   * Get remaining images text
   */
  getRemainingText(usage: UsageResponse | null): string {
    if (!usage) return 'Loading...';
    if (usage.limits.max_image_generations_per_day === -1) return 'Unlimited';

    const remaining = usage.remaining.daily;
    if (typeof remaining === 'number') {
      return remaining.toString();
    }

    // Try to parse if it's a string number
    const parsed = parseInt(remaining as string, 10);
    return isNaN(parsed) ? '0' : parsed.toString();
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(usage: UsageResponse | null): number {
    if (!usage) return 0;
    if (usage.limits.max_image_generations_per_day === -1) return 0;
    return usage.usage.daily_usage_percent || 0;
  }

  /**
   * Get plan features based on tier
   */
  getPlanFeatures(usage: UsageResponse | null): PlanFeature[] {
    const planTier = this.getPlanTier(usage);
    const dailyLimit = usage?.limits.max_image_generations_per_day;

    const baseFeatures: PlanFeature[] = [
      {
        icon: 'rocket',
        label: 'Daily Generations',
        value: dailyLimit === -1 ? 'Unlimited' : `${dailyLimit}/day`,
        color: '#0F6EEA'
      },
      {
        icon: 'image',
        label: 'Resolution',
        value: this.getResolutionText(planTier),
        color: '#9C27B0'
      },
    ];

    const tierFeatures: Record<string, PlanFeature[]> = {
      trial: [
        { icon: 'speedometer', label: 'Generation Speed', value: 'Standard', color: '#2196F3' },
        { icon: 'shield', label: 'Commercial Use', value: 'Limited', color: '#FF9800' },
      ],
      starter: [
        { icon: 'speedometer', label: 'Generation Speed', value: 'Fast', color: '#2196F3' },
        { icon: 'shield', label: 'Commercial Use', value: 'Basic', color: '#FF9800' },
      ],
      pro: [
        { icon: 'magic', label: 'Advanced Styles', value: 'Available', color: '#2196F3' },
        { icon: 'shield', label: 'Commercial Use', value: 'Full', color: '#4CAF50' },
      ],
      enterprise: [
        { icon: 'infinite', label: 'Custom Models', value: 'Available', color: '#2196F3' },
        { icon: 'headset', label: 'Priority Support', value: '24/7', color: '#4CAF50' },
      ],
    };

    return [...baseFeatures, ...(tierFeatures[planTier] || tierFeatures.trial)];
  }

  /**
   * Get resolution text based on plan tier
   */
  private getResolutionText(planTier: string): string {
    switch (planTier) {
      case 'trial': return '512x512';
      case 'starter': return '768x768';
      case 'pro': return '1024x1024';
      case 'enterprise': return 'Up to 4K';
      default: return 'Standard';
    }
  }

  /**
   * Get upgrade message based on current plan
   */
  getUpgradeMessage(usage: UsageResponse | null): UpgradeMessage {
    const planTier = this.getPlanTier(usage);

    const messages: Record<string, UpgradeMessage> = {
      trial: {
        title: 'Upgrade to Starter',
        description: 'Get 5x more daily generations and higher resolution images',
        buttonText: 'Upgrade Now',
      },
      starter: {
        title: 'Go Pro',
        description: 'Unlock advanced styles and full commercial usage rights',
        buttonText: 'Upgrade to Pro',
      },
      pro: {
        title: 'Enterprise Power',
        description: 'Get unlimited generations and custom model training',
        buttonText: 'Contact Sales',
      },
    };

    return messages[planTier] || {
      title: 'Upgrade Your Plan',
      description: 'Get more features and higher limits',
      buttonText: 'Upgrade Now',
    };
  }

  /**
   * Check if user is on a paid plan
   */
  isPaidPlan(usage: UsageResponse | null): boolean {
    const planTier = this.getPlanTier(usage);
    return planTier !== 'trial' && planTier !== 'free';
  }

  /**
   * Get image URL with authentication if needed
   */
  async getAuthenticatedImageUrl(imageUrl: string): Promise<string> {
    const token = await this.getAuthToken();

    if (!token) return imageUrl;

    // If the image is from our API, add token as query param
    if (imageUrl.includes(this.baseURL)) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}token=${token}`;
    }

    return imageUrl;
  }
}

// Create and export singleton instance
export const imageApi = new ImageAPI();

// Export default for convenience
export default imageApi;