// src/services/stripeAPI.js
import api from './api';

const stripeAPI = {
  // Create payment intent
  createPaymentIntent: async (paymentData) => {
    try {
      const response = await api.post('/payments/stripe/create-payment-intent', paymentData);
      return response.data;
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw error;
    }
  },

  // Confirm payment
  confirmPayment: async (paymentData) => {
    try {
      const response = await api.post('/payments/stripe/confirm-payment', paymentData);
      return response.data;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error;
    }
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  },

  // Check payment eligibility
  checkPaymentEligibility: async (campaignId, influencerId) => {
    try {
      const response = await api.get(`/payments/campaigns/${campaignId}/influencer/${influencerId}/eligibility`);
      return response.data;
    } catch (error) {
      console.error('Check eligibility error:', error);
      throw error;
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/stripe/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch payment status');
    }
  },

  // Get brand payment applications
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
};

export default stripeAPI;