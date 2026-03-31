// services/subscriptionService.js
import api from './api';

export const subscriptionService = {
  // Get current user subscription
  async getCurrentSubscription() {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch subscription');
    }
  },

  // Get user plan status from users collection
  async getUserPlanStatus() {
    try {
      const response = await api.get('/subscriptions/user-plan-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching user plan status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch user plan status');
    }
  },

  // Get trial status
  async getTrialStatus() {
    try {
      const response = await api.get('/auth/trial-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching trial status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch trial status');
    }
  },

  // Create new subscription
  createSubscription: async (subscriptionData) => {
  try {
    const response = await api.post('/subscriptions/create', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription creation error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create subscription');
  }
},

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(error.response?.data?.detail || 'Failed to cancel subscription');
    }
  },

  // Sync subscription status
  async syncSubscriptionStatus() {
    try {
      const response = await api.post('/subscriptions/sync-status');
      return response.data;
    } catch (error) {
      console.error('Error syncing subscription:', error);
      // Fallback to legacy endpoint
      try {
        const response = await api.post('/subscriptions/sync-subscription');
        return response.data;
      } catch (fallbackError) {
        throw new Error('Failed to sync subscription');
      }
    }
  },

  // Get available plans
  async getAvailablePlans() {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch plans');
    }
  },

  // Force immediate sync
  async forceSync(userEmail) {
    try {
      const response = await api.post('/subscriptions/fix-user-status');
      return response.data;
    } catch (error) {
      console.error('Error forcing sync:', error);
      throw new Error(error.response?.data?.detail || 'Failed to force sync');
    }
  },

  // Debug subscription data
  async debugSubscription(userEmail) {
    try {
      const response = await api.get(`/subscriptions/debug/${userEmail}`);
      return response.data;
    } catch (error) {
      console.error('Error debugging subscription:', error);
      throw new Error(error.response?.data?.detail || 'Failed to debug subscription');
    }
  }
};