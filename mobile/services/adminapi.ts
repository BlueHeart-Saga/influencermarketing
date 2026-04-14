import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variable for API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://quickbox-backend-docker-b9cbaye9a3bvhad5.southindia-01.azurewebsites.net';

// Types
export interface User {
    _id: string;
    email: string;
    username: string;
    role: 'brand' | 'influencer' | 'admin';
    status: 'active' | 'suspended' | 'banned';
    created_at: string;
    last_login?: string;
    brand_profile?: {
        company_name: string;
        logo?: string;
        description?: string;
        location?: string;
        industry?: string;
        website?: string;
        phone_number?: string;
        contact_person_name?: string;
        categories?: string[];
        social_links?: Record<string, string>;
    };
    influencer_profile?: {
        full_name?: string;
        nickname?: string;
        profile_picture?: string;
        bio?: string;
        location?: string;
        niche?: string;
        phone_number?: string;
        social_links?: Record<string, string>;
        engagement_rate?: number;
        follower_count?: number;
    };
    subscription?: {
        type: 'free' | 'trial' | 'paid';
        plan: string;
        status: string;
        has_active_subscription: boolean;
        current_plan: string;
        is_trial_active: boolean;
        current_period_start?: string;
        current_period_end?: string;
        remaining_days?: number;
        details?: any;
    };
    activity_metrics?: {
        post_count: number;
        followers_count: number;
        following_count: number;
        days_since_registration: number;
        days_since_last_login: number | null;
    };
    profile_completed?: boolean;
}

export interface DashboardData {
    platform_overview: {
        total_users: number;
        brands: number;
        influencers: number;
        admins: number;
        total_posts: number;
        total_collaborations: number;
        active_collaborations: number;
    };
    subscription_analytics: {
        active_subscriptions: number;
        trial_users: number;
        free_users: number;
    };
    engagement_metrics: {
        total_likes: number;
        total_comments: number;
        total_views: number;
    };
    recent_activity: {
        last_24h_posts: number;
        last_7d_users: number;
        last_7d_posts: number;
    };
}

export interface Activity {
    type: 'user' | 'subscription' | 'post' | 'admin';
    title: string;
    description: string;
    time: string;
    data?: any;
}

export interface QuickStats {
    total_users: number;
    total_posts: number;
    active_subscriptions: number;
    new_users_24h: number;
    updated: string;
}

export interface UserStats {
    status_distribution: Record<string, number>;
    role_distribution: Record<string, number>;
    new_users_7d: number;
    active_users_24h: number;
    total_users: number;
}

export interface SubscriptionOverview {
    plan_distribution: Array<{
        _id: string;
        count: number;
        trialing: number;
        active: number;
    }>;
    total_metrics: {
        total_subscriptions: number;
        active_subscriptions: number;
        trial_subscriptions: number;
    };
    recent_subscriptions: any[];
    expiring_soon: {
        count: number;
        subscriptions: any[];
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

class AdminAPI {
    private async getAuthHeaders(): Promise<{ headers: { Authorization: string; 'Content-Type': string } }> {
        const token = await AsyncStorage.getItem('access_token');

        if (!token) {
            throw new Error('Authentication required');
        }
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    }

    private handleError(error: any): never {
        if (error.response) {
            throw new Error(error.response.data?.detail || error.response.data?.message || 'API request failed');
        } else if (error.request) {
            throw new Error('No response from server. Please check your connection.');
        } else {
            throw new Error(error.message || 'Request failed');
        }
    }

    // Dashboard APIs
    async getDashboard(): Promise<DashboardData> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async refreshDashboard(): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(`${API_BASE_URL}/admin/dashboard/refresh`, {}, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // User Management APIs
    async getUsers(params?: {
        role?: string;
        search?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ users: User[]; pagination: any; total?: number }> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.role) queryParams.append('role', params.role);
            if (params?.search) queryParams.append('search', params.search);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? `?${queryParams}` : ''}`;
            const headers = await this.getAuthHeaders();
            const response = await axios.get(url, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getAllUsers(role?: string): Promise<User[]> {
        try {
            const queryParams = role ? `?role=${role}` : '';
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/users${queryParams}`, headers);
            const data = response.data;
            return data.users || data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getUserDetails(userId: string): Promise<User> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getUserCompleteDetails(userId: string): Promise<any> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/users/${userId}/complete`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateUserStatus(userId: string, status: string): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${userId}/status`,
                { status },
                headers
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async suspendUser(userId: string): Promise<{ message: string; user_id: string; email: string; status: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${userId}/suspend`,
                {},
                headers
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async activateUser(userId: string): Promise<{ message: string; user_id: string; email: string; status: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/admin/users/${userId}/activate`,
                {},
                headers
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteUser(userId: string): Promise<{ message: string }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getUserQuickStats(): Promise<UserStats> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/users/quick-stats`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getQuickStats(): Promise<QuickStats> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/quick/stats`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Subscription APIs
    async getSubscriptionsOverview(): Promise<SubscriptionOverview> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions/overview`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getSubscriptions(params?: {
        plan?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{ subscriptions: any[]; pagination: any }> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.plan) queryParams.append('plan', params.plan);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `${API_BASE_URL}/admin/subscriptions${queryParams.toString() ? `?${queryParams}` : ''}`;
            const headers = await this.getAuthHeaders();
            const response = await axios.get(url, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Post APIs
    async getPosts(params?: {
        user_id?: string;
        page?: number;
        limit?: number;
    }): Promise<{ posts: any[]; pagination: any }> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.user_id) queryParams.append('user_id', params.user_id);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `${API_BASE_URL}/admin/posts${queryParams.toString() ? `?${queryParams}` : ''}`;
            const headers = await this.getAuthHeaders();
            const response = await axios.get(url, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getPostStats(days: number = 7): Promise<any> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/posts/stats?days=${days}`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Activity APIs
    async getRecentActivities(limit: number = 20): Promise<{ activities: Activity[]; total: number }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/activities/recent?limit=${limit}`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Report APIs
    async getSummaryReport(): Promise<{
        dashboard: DashboardData;
        user_stats: UserStats;
        subscription_overview: SubscriptionOverview;
        post_stats: any;
        timestamp: string;
    }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/reports/summary`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // System APIs
    async getSystemHealth(): Promise<{
        database: {
            users: string;
            posts: string;
            subscriptions: string;
            collaborations: string;
        };
        cache: string;
        timestamp: string;
    }> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/system/health`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Export APIs
    async exportData(exportType: 'users' | 'posts' | 'subscriptions'): Promise<any> {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${API_BASE_URL}/admin/export/data?export_type=${exportType}`, headers);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }
}

export default new AdminAPI();