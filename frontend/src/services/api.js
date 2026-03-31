// src/services/api.js
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from "../config/api";

/**
 * Central Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // timeout: 10000,
});

/* =========================
   Debug utilities
   ========================= */
const debugRequest = (config) => {
  try {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!config.headers?.Authorization,
      token: config.headers?.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'None',
      timestamp: new Date().toISOString(),
    });
  } catch (e) { /* ignore */ }
  return config;
};

const debugResponse = (response) => {
  try {
    console.log('API Response:', {
      url: response?.config?.url,
      status: response?.status,
      statusText: response?.statusText,
      timestamp: new Date().toISOString(),
    });
  } catch (e) { /* ignore */ }
  return response;
};

const debugError = (error) => {
  try {
    console.error('API Error:', {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      timestamp: new Date().toISOString(),
    });
  } catch (e) { /* ignore */ }
  return Promise.reject(error);
};

/* =========================
   Auth & Local Storage helpers
   ========================= */
export const setAuthData = (token, userData) => {
  try {
    if (!token || !userData) throw new Error('Token and user data required');
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      role: userData.role,
      username: userData.username,
      email: userData.email,
    }));
    return true;
  } catch (err) {
    console.error('setAuthData error', err);
    return false;
  }
};

export const logout = (redirect = true) => {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('quickbox-user'); // Sync with AuthContext
    if (redirect && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login?session=expired';
    }
    return true;
  } catch (err) {
    console.error('logout error', err);
    return false;
  }
};

export const getUserInfo = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    if (!user.id || !user.role || !user.username) {
      console.warn('Invalid user object structure');
      return null;
    }
    return user;
  } catch (err) {
    console.error('getUserInfo parse error', err);
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (!token || !user) return false;
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token format looks invalid');
      return false;
    }
    return true;
  } catch (err) {
    console.error('isAuthenticated error', err);
    return false;
  }
};

export const isAdmin = () => {
  try {
    const user = getUserInfo();
    return !!user && user.role === 'admin';
  } catch (err) {
    console.error('isAdmin error', err);
    return false;
  }
};

export const debugAuth = () => ({
  hasToken: !!localStorage.getItem('access_token'),
  hasUser: !!localStorage.getItem('user'),
  token: localStorage.getItem('access_token') ? `${localStorage.getItem('access_token').substring(0, 20)}...` : null,
  user: getUserInfo(),
  isAuthenticated: isAuthenticated(),
  isAdmin: isAdmin(),
});

/* =========================
   Single consolidated Axios interceptors
   - request: attach token, handle FormData
   - response: debug, handle network & 401
   ========================= */
api.interceptors.request.use((config) => {
  // If data is FormData, let browser set Content-Type (boundary)
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  // Skip attaching token for explicit auth endpoints if you want
  if (!config.url?.includes('/auth/')) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // no token for protected route - log but allow request to go through
      console.warn('No access token found for route:', config.url);
    }
  }

  return debugRequest(config);
}, (err) => Promise.reject(err));

api.interceptors.response.use((response) => {
  debugResponse(response);
  // Optional: auto-annotate currency or transform responses here if needed
  return response;
}, async (error) => {
  // Network error (no response)
  if (!error.response) {
    console.error('Network error - check connection / server', error);
    return Promise.reject(error);
  }

  // 401 - unauthorized
  if (error.response.status === 401) {
    // If the request is login/register or already retried, just log out/redirect
    const originalUrl = error.config?.url || '';
    const isAuthEndpoint = originalUrl.includes('/auth/login') || originalUrl.includes('/auth/register');
    if (isAuthEndpoint || error.config?._retry) {
      debugError(error);
      return Promise.reject(error);
    }

    // Clear auth and redirect to login
    console.warn('401 received, clearing auth and redirecting to login');
    logout(false); // clear storage but don't auto-redirect inside logout so we can add query
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login?session=expired';
    }
    return Promise.reject(error);
  }

  // Other errors
  return debugError(error);
});

/* =========================
   Small helper: createApiHandler
   Wraps api calls with uniform error logging
   ========================= */
const createApiHandler = (apiCall) => {
  return async (...args) => {
    try {
      const res = await apiCall(...args);
      return res;
    } catch (error) {
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          url: error.config?.url,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('No response received:', error.message);
      } else {
        console.error('Request error:', error.message);
      }
      throw error;
    }
  };
};

/* =========================
   React hooks: useApi & useApiWithMedia
   ========================= */
export const useApi = (apiCall, initialData = null, immediate = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(...args);
      setData(response.data ?? response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
};

export const useApiWithMedia = (apiCall, initialData = null, immediate = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [mediaLoading, setMediaLoading] = useState({});

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(...args);
      setData(response.data ?? response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const loadMedia = useCallback(async (campaignId, mediaType = 'image') => {
    if (!campaignId) return null;
    setMediaLoading(prev => ({ ...prev, [campaignId]: true }));
    try {
      const response = mediaType === 'image'
        ? await campaignAPI.getCampaignImage(campaignId)
        : await campaignAPI.getCampaignVideo(campaignId);

      // create blob url
      const url = window.URL.createObjectURL(new Blob([response.data]));
      return url;
    } catch (err) {
      console.error(`Error loading ${mediaType} for ${campaignId}`, err);
      return null;
    } finally {
      setMediaLoading(prev => ({ ...prev, [campaignId]: false }));
    }
  }, []);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, loading, error, execute, setData, mediaLoading, loadMedia };
};

/* =========================
   Currency helpers
   ========================= */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  const map = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹' };
  return map[currencyCode] || '$';
};

export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = getCurrencySymbol(currency);
  const num = Number(amount || 0);
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/* =========================
   Auth API
   ========================= */
export const authAPI = {
  login: createApiHandler((credentials) => api.post('/auth/login', credentials)),
  register: createApiHandler((userData) => api.post('/auth/register', userData)),
  getMe: createApiHandler(() => api.get('/auth/me')),
};

/* =========================
   Campaign API (single object)
   - Includes media upload helpers, admin checks, messaging, contract endpoints
// ---------------- MAIN API ----------------*/
// ---------------- HELPERS ----------------
// In your api.js, update the token retrieval
const getToken = () => {
  // Try multiple storage keys
  const token = localStorage.getItem('access_token') || 
                localStorage.getItem('token');
  return token;
};

const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Update the request interceptor to ensure token is always attached
api.interceptors.request.use((config) => {
  // If data is FormData, let browser set Content-Type (boundary)
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  // Always try to attach token for all requests
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return debugRequest(config);
}, (err) => Promise.reject(err));


export const campaignAPI = {
  /** ─────────────── BRAND CAMPAIGNS ─────────────── */
  createCampaign: async (formData) => {
    try {
      const response = await api.post('/api/campaigns', formData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Create campaign error:', error);
      throw error;
    }
  },

  /**
   * Analyze a product link (AI / scraping on the backend)
   * Returns the axios response so callers can read response.data
   */
  analyzeProductLink: async (productLink) => {
    try {
      const response = await api.post(
        '/api/analyze-product-link',
        { product_link: productLink },  // FIXED
        { headers: getAuthHeader() }
      );
      return response;
    } catch (error) {
      console.error('analyzeProductLink error:', error);
      throw error;
    }
  }
  ,

  updateCampaign: async (campaignId, formData) => {
    try {
      const response = await api.put(`/api/campaigns/${campaignId}`, formData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Update campaign error:', error);
      throw error;
    }
  },

  deleteBrandCampaign: async (campaignId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'brand') throw new Error('Brand role required');
    return api.delete(`/api/campaigns/${campaignId}`, { headers: getAuthHeader() });
  },

  getBrandCampaigns: async () => api.get('/api/brand/campaigns', { headers: getAuthHeader() }),

  // In your campaignAPI service, add this method if it doesn't exist:
  getBrandApplications: async () => {
    try {
      const response = await api.get('/api/brand/applications');
      console.log('Brand applications response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching brand applications:', error);
      throw error;
    }
  },

  // In your campaignAPI object, add these methods:

  /** ─────────────── VIEW COUNT & ANALYTICS ─────────────── */
  trackCampaignView: async (campaignId) => {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/view`, {}, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Track campaign view error:', error);
      throw error;
    }
  },

  getCampaignViews: async (campaignId) => {
    try {
      const response = await api.get(`/api/campaigns/${campaignId}/views`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Get campaign views error:', error);
      throw error;
    }
  },

  getPopularCampaigns: async (limit = 10, days = 30) => {
    try {
      const response = await api.get('/api/campaigns/popular', {
        params: { limit, days },
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Get popular campaigns error:', error);
      throw error;
    }
  },

  getBrandCampaignViews: async () => {
    try {
      const response = await api.get('/api/brand/campaigns/views', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Get brand campaign views error:', error);
      throw error;
    }
  },

  // Like/Unlike campaign
  toggleLike: async (campaignId, like = true) => {
    const response = await api.post('/api/campaigns/like', {
      campaign_id: campaignId,
      like: like
    });
    return response.data;
  },

  // Bookmark/Unbookmark campaign
  toggleBookmark: async (campaignId, bookmark = true) => {
    const response = await api.post('/api/campaigns/bookmark', {
      campaign_id: campaignId,
      bookmark: bookmark
    });
    return response.data;
  },

  // Get user's liked campaigns
  getUserLikes: async () => {
    const response = await api.get('/api/user/likes');
    return response.data;
  },

  // Get user's bookmarked campaigns
  getUserBookmarks: async () => {
    const response = await api.get('/api/user/bookmarks');
    return response.data;
  },

  // Get campaign like status
  getCampaignLikeStatus: async (campaignId) => {
    const response = await api.get(`/api/campaigns/${campaignId}/like-status`);
    return response.data;
  },

  /** ─────────────── INFLUENCER CAMPAIGNS ─────────────── */
  getAvailableCampaigns: async () => {
    try {
      const response = await api.get('/api/influencer/campaigns', {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get available campaigns error:', error);
      throw error;
    }
  },

  applyToCampaign: async (campaignId, applicationData) => {
    try {
      const response = await api.post(`/api/campaigns/${campaignId}/apply`, applicationData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Apply to campaign error:', error);
      throw error;
    }
  },

  getInfluencerApplications: async () => {
    try {
      const response = await api.get('/api/influencer/applications', {
        headers: getAuthHeader()
      });
      console.log('Influencer applications response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching influencer applications:', error);
      throw error;
    }
  },

  getInfluencerAnalytics: async () => api.get('/api/influencer/analytics', { headers: getAuthHeader() }),

  /** ─────────────── ADMIN CAMPAIGNS ─────────────── */
  getAllCampaigns: async () => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.get('/api/admin/campaigns', { headers: getAuthHeader() });
  },

  getCampaignStats: async () => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.get('/api/admin/campaigns/stats', { headers: getAuthHeader() });
  },

  getCampaignDetail: async (campaignId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.get(`/api/admin/campaigns/${campaignId}`, { headers: getAuthHeader() });
  },

  updateCampaignStatus: async (campaignId, statusData) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.put(`/api/admin/campaigns/${campaignId}/status`, statusData, { headers: getAuthHeader() });
  },

  deleteCampaign: async (campaignId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.delete(`/api/admin/campaigns/${campaignId}`, { headers: getAuthHeader() });
  },

  /** ─────────────── MESSAGES ─────────────── */
  getMessages: async (campaignId, influencerId) =>
    api.get(`/api/campaigns/${campaignId}/messages/${influencerId}`, { headers: getAuthHeader() }),

  /** ─────────────── APPLICATION STATUS ─────────────── */
  updateApplicationStatus: async (campaignId, influencerId, statusData) => {
    try {
      const response = await api.put(
        `/api/applications/${campaignId}/${influencerId}`,
        statusData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  },

  /** ─────────────── CONTRACTS ─────────────── */
  sendContractAgreement: async (campaignId, influencerId) => {
    const response = await api.post(
      `/api/applications/${campaignId}/${influencerId}/send-contract`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  acceptContract: async (contractData) => {
    const response = await api.post('/api/contracts/accept', contractData, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  /** ─────────────── MEDIA FILES ─────────────── */
  submitMediaFiles: async (formData) => {
    const response = await api.post('/api/media/submit', formData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getCampaignMediaFiles: async (campaignId) =>
    api.get(`/api/media/campaign/${campaignId}`, { headers: getAuthHeader() }),

  getInfluencerMediaFiles: async () =>
    api.get('/api/media/influencer', { headers: getAuthHeader() }),

  downloadMediaFile: async (fileId) =>
    api.get(`/api/media/${fileId}/download`, {
      responseType: 'blob',
      headers: getAuthHeader(),
    }),

  getMediaViewUrl: (fileId) =>
    `${API_BASE_URL}/api/media/${fileId}/view?token=${getToken()}`,

  /** ─────────────── PAYMENTS ─────────────── */
  createRazorpayOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create payment order');
      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Payment verification failed');
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  createManualPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create manual payment');
      return await response.json();
    } catch (error) {
      console.error('Manual payment error:', error);
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brand/history`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch payment history');
      return await response.json();
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  },

  getPaymentDetails: async (paymentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch payment details');
      return await response.json();
    } catch (error) {
      console.error('Payment details error:', error);
      throw error;
    }
  },

  refundPayment: async (paymentId, amount, reason) => {
    try {
      const formData = new FormData();
      formData.append('payment_id', paymentId);
      if (amount) formData.append('amount', amount.toString());
      if (reason) formData.append('reason', reason);

      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/refund`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to process refund');
      return await response.json();
    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  },

  getInfluencerAccount: async (influencerId) => {
    const res = await fetch(`/api/account/${influencerId}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  setPayoutAccount: async (formData) => {
    const body = new URLSearchParams(formData); // for FormData
    const res = await fetch(`/api/account/set`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  getAccountDetails: async (influencerId) => {
    const res = await fetch(`/api/account/${influencerId}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // Create payout ID
  createPayoutId: async (influencerId) => {
    const res = await fetch(`/api/account/${influencerId}/payout_id`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  /** ─────────────── UTILITIES ─────────────── */
  getCampaignImageUrl: (filename) => `${API_BASE_URL}/api/campaigns/image/${filename}`,
  getCampaignVideoUrl: (filename) => `${API_BASE_URL}/api/campaigns/video/${filename}`,
};


/* =========================
   Influencer API (higher-level convenience)
   ========================= */
export const influencerAPI = {
  getAvailableCampaignsWithMedia: createApiHandler(async () => {
    const response = await api.get('/api/influencer/campaigns');
    const campaigns = (response.data || []).map((c) => ({
      ...c,
      image_url: c.campaign_image ? `${API_BASE_URL}/api/campaigns/${c._id}/image` : null,
      video_url: c.campaign_video ? `${API_BASE_URL}/api/campaigns/${c._id}/video` : null,
      currency_symbol: getCurrencySymbol(c.currency || 'USD'),
    }));
    return { ...response, data: campaigns };
  }),

  getApplicationsWithMedia: createApiHandler(async () => {
    const response = await api.get('/api/influencer/applications');
    const apps = (response.data || []).map((a) => ({
      ...a,
      campaign_image_url: a.campaign_image ? `${API_BASE_URL}/api/campaigns/${a.campaign_id}/image` : null,
      campaign_video_url: a.campaign_video ? `${API_BASE_URL}/api/campaigns/${a.campaign_id}/video` : null,
      currency_symbol: getCurrencySymbol(a.currency || 'USD'),
    }));
    return { ...response, data: apps };
  }),
};

/* =========================
   User & Admin API
   ========================= */
export const userAPI = {
  getAllUsers: createApiHandler(() => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.get('/admin/users');
  }),
  deleteUser: createApiHandler((userId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.delete(`/admin/users/${userId}`);
  }),
  suspendUser: createApiHandler((userId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.put(`/admin/users/${userId}/suspend`);
  }),
  activateUser: createApiHandler((userId) => {
    const user = getUserInfo();
    if (!user || user.role !== 'admin') throw new Error('Admin role required');
    return api.put(`/admin/users/${userId}/activate`);
  }),
};

/* =========================
   Collaboration APIs & service
   ========================= */
export const collaborationAPI = {
  getCollaborations: createApiHandler(async (userId, role) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (role) params.append('role', role);
    const res = await api.get(`/collaboration/collaborations?${params.toString()}`);
    return res.data;
  }),

  getUsers: createApiHandler(async (role, excludeUser = null) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (excludeUser) params.append('exclude_user', excludeUser);
    const res = await api.get(`/collaboration/users?${params.toString()}`);
    return res.data;
  }),

  getUser: createApiHandler(async (userId) => {
    const res = await api.get(`/collaboration/users/${userId}`);
    return res.data;
  }),

  createCollaboration: createApiHandler(async (data) => {
    const res = await api.post('/collaboration/collaborations', data);
    return res.data;
  }),

  getMessages: createApiHandler(async (collabId, userId, limit = 100, skip = 0) => {
    const res = await api.get(`/collaboration/collaborations/${collabId}/messages?user_id=${userId}&limit=${limit}&skip=${skip}`);
    return res.data;
  }),

  sendMessage: createApiHandler(async (collabId, messageData) => {
    const res = await api.post(`/collaboration/collaborations/${collabId}/messages`, messageData);
    return res.data;
  }),

  getCollaboration: createApiHandler(async (collabId, userId) => {
    const res = await api.get(`/collaboration/collaborations/${collabId}?user_id=${userId}`);
    return res.data;
  }),
};

export const collaborationService = {
  findOrCreateCollaboration: async (influencerId, brandId, role, campaignTitle = null) => {
    try {
      const collaborations = await collaborationAPI.getCollaborations(influencerId, role);
      const existingCollab = (collaborations || []).find(c => c.brand_id === brandId && c.status === 'active');
      if (existingCollab) return existingCollab;
      const newCollab = await collaborationAPI.createCollaboration({ brand_id: brandId, influencer_id: influencerId, status: 'active' });
      return newCollab;
    } catch (err) {
      console.error('findOrCreateCollaboration error', err);
      throw err;
    }
  },

  refreshCollaboration: async (collabId, userId) => {
    try {
      return await collaborationAPI.getCollaboration(collabId, userId);
    } catch (err) {
      console.error('refreshCollaboration error', err);
      throw err;
    }
  },
};



/* =========================
   Messaging / Campaign sending helpers (email/sms/whatsapp)
   ========================= */
export const sendEmail = async (recipient, subject, message) => api.post(`${API_BASE_URL}/send-email`, { recipient, subject, message });
export const sendSMS = async (recipient, message) => api.post(`${API_BASE_URL}/send-sms`, { recipient, message });
export const sendWhatsApp = async (recipient, message) => api.post(`${API_BASE_URL}/send-whatsapp`, { recipient, message });
export const sendCampaign = async (name, channel, recipients, message) => api.post(`${API_BASE_URL}/send-campaign`, { name, channel, recipients, message });

/* =========================
   AI Helpers (content generation / analysis / hashtags)
   ========================= */
export const generateContent = async (prompt, mode = 'caption') => {
  if (!prompt || !prompt.trim()) return { response: '' };
  const res = await api.post('/generate', { prompt, mode });
  return res.data;
};

export const analyzeText = async (text) => {
  if (!text) return {};
  const res = await api.get('/analyze', { params: { text } });
  return res.data;
};

// export const generateHashtags = async (prompt) => {
//   if (!prompt || !prompt.trim()) return { hashtags: [] };
//   const res = await api.post('/hashtags', { prompt });
//   return res.data;
// };


// Hashtag API calls
export const generateHashtags = async ({ text }) => {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/ai/hashtags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw await res.json();
  return res.json();
};


export const getHashtagUsage = async () => {
  const response = await axios.get(`${API_BASE_URL}/ai/hashtags/usage`, {
    headers: getAuthHeader()
  });
  return response.data;
};

/* =========================
   Export default axios instance (if consumer needs it)

   ========================= */



// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.response) {
      switch (error.response.status) {
        case 403:
          error.message = 'YouTube API quota exceeded. Please try again later.';
          break;
        case 404:
          error.message = 'Resource not found. Please check the channel ID.';
          break;
        case 429:
          error.message = 'Too many requests. Please wait a moment.';
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = error.response.data?.detail || 'An error occurred.';
      }
    } else if (error.request) {
      error.message = 'No response from server. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export const youtubeApi = {
  // Search channels with advanced filters
  searchChannels: async (query, maxResults = 12, order = 'relevance', minSubscribers = 0, maxSubscribers = 10000000) => {
    const response = await api.get('/youtube/search/channels', {
      params: {
        q: query,
        max_results: maxResults,
        order: order,
        min_subscribers: minSubscribers,
        max_subscribers: maxSubscribers
      }
    });
    return response.data;
  },

  // Get comprehensive channel details
  getChannel: async (channelId) => {
    const response = await api.get(`/youtube/channel/${channelId}`);
    return response.data;
  },

  // Get channel videos with analytics
  getChannelVideos: async (channelId, maxResults = 20) => {
    const response = await api.get(`/youtube/channel/${channelId}/videos`, {
      params: { max_results: maxResults }
    });
    return response.data;
  },

  // Comprehensive influencer analysis
  analyzeInfluencer: async (channelId) => {
    const response = await api.get(`/youtube/influencer/analyze/${channelId}`);
    return response.data;
  },

  // Get video details
  getVideoDetails: async (videoId) => {
    const response = await api.get(`/youtube/video/${videoId}`);
    return response.data;
  },

  // Batch analysis for multiple channels
  getBatchChannels: async (channelIds) => {
    const response = await api.get('/youtube/batch/channels', {
      params: { channel_ids: channelIds.join(',') }
    });
    return response.data;
  },

  // Get trending categories
  getTrendingCategories: async () => {
    const response = await api.get('/youtube/trending/categories');
    return response.data;
  }
};


export const accountAPI = {
  // Bank Account Management
  getBankAccounts: () => api.get('/account/bank-accounts'),
  getPrimaryBankAccount: () => api.get('/account/bank-accounts/primary'),
  getBankAccountById: (accountId) => api.get(`/account/bank-accounts/${accountId}`),

  createBankAccount: (data) => api.post('/account/bank-accounts', data),
  updateBankAccount: (accountId, data) => api.put(`/account/bank-accounts/${accountId}`, data),
  deleteBankAccount: (accountId) => api.delete(`/account/bank-accounts/${accountId}`),

  // IFSC Validation
  validateIFSC: (ifscCode) => api.get(`/account/validate-ifsc/${ifscCode}`),

  // Account Status
  getBankAccountStatus: () => api.get('/account/bank-accounts/status'),

  getAllUsersAccounts: async () => {
    const res = await fetch("/account/report/all-users", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch all accounts");
    return res.json();
  },
};


// C:\Sagadevan\quickbox\frontend\src\services\api.js
export const paymentAPI = {
  // Razorpay Payments



  // Stripe Payments (if needed later)
  createStripePaymentIntent: (data) => api.post('/payments/stripe/create-intent', data),
  confirmStripePayment: (data) => api.post('/payments/stripe/confirm', data),

  /** ─────────────── PAYMENTS ─────────────── */
  createRazorpayOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create payment order');
      return await response.json();
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Payment verification failed');
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  createManualPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create manual payment');
      return await response.json();
    } catch (error) {
      console.error('Manual payment error:', error);
      throw error;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/history`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch payment history');
      return await response.json();
    } catch (error) {
      console.error('Payment history error:', error);
      throw error;
    }
  },

  getPaymentDetails: async (paymentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch payment details');
      return await response.json();
    } catch (error) {
      console.error('Payment details error:', error);
      throw error;
    }
  },

  refundPayment: async (paymentId, amount, reason) => {
    try {
      const formData = new FormData();
      formData.append('payment_id', paymentId);
      if (amount) formData.append('amount', amount.toString());
      if (reason) formData.append('reason', reason);

      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/refund`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      if (!response.ok) throw new Error((await response.json()).detail || 'Failed to process refund');
      return await response.json();
    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  },



  getInfluencerAccount: async (influencerId) => {
    // const token = localStorage.getItem("access_token");
    const res = await fetch(`/api/account/${influencerId}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  setPayoutAccount: async (formData) => {
    // const token = localStorage.getItem("access_token");
    const body = new URLSearchParams(formData); // for FormData
    const res = await fetch(`/api/account/set`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  getAccountDetails: async (influencerId) => {
    // const token = localStorage.getItem("access_token");
    const res = await fetch(`/api/account/${influencerId}`, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },



  // Create payout ID
  createPayoutId: async (influencerId) => {
    // const token = localStorage.getItem("access_token");
    const res = await fetch(`/api/account/${influencerId}/payout_id`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

};


// In your api.js file, add:
export { default as autopayAPI } from './autopayAPI';

export const earningAPI = {
  // Get earnings summary for a specific timeframe
  getEarningsSummary: async (timeframe = '6m') => {
    try {
      const response = await api.get(`/api/earnings/summary?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      throw error;
    }
  },

  // Get transaction history
  getTransactionHistory: async (filters = {}) => {
    try {
      const response = await api.get('/api/earnings/transactions', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  },

  // Request withdrawal
  requestWithdrawal: async (withdrawalData) => {
    try {
      const response = await api.post('/api/earnings/withdraw', withdrawalData);
      return response.data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  },

  // Get withdrawal history
  getWithdrawalHistory: async () => {
    try {
      const response = await api.get('/api/earnings/withdrawals');
      return response.data;
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  },

  // Download earnings statement
  downloadStatement: async (period) => {
    try {
      const response = await api.get(`/api/earnings/statement/${period}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading statement:', error);
      throw error;
    }
  }
};


export default api;



// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login?session=expired';
    }
    return Promise.reject(error);
  }
);

export const analyticsAPI = api;