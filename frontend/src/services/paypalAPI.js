// services/paypalAPI.js - Unified PayPal API Service
import api from './api';

const paypalAPI = {
  /**
   * Create a PayPal order for payment
   * @param {Object} orderData - Order creation data
   * @param {string} orderData.campaign_id - Campaign ID
   * @param {string} orderData.influencer_id - Influencer ID
   * @param {number} orderData.amount - Payment amount
   * @param {string} orderData.currency - Currency code
   * @param {string} orderData.description - Order description
   * @returns {Promise<Object>} Order creation response
   */
  createOrder: async (orderData) => {
    try {
      console.log('🔄 Creating PayPal order:', orderData);
      const response = await api.post('/paypal/create-order', orderData);
      console.log('✅ PayPal order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal order creation failed:', error);
      throw error;
    }
  },

  /**
   * Capture a PayPal payment after user approval
   * @param {Object} captureData - Capture data
   * @param {string} captureData.order_id - PayPal Order ID
   * @param {string} captureData.payer_id - PayPal Payer ID
   * @returns {Promise<Object>} Capture response
   */
  captureOrder: async (captureData) => {
    try {
      console.log('🔄 Capturing PayPal order:', captureData.order_id);
      const response = await api.post('/paypal/capture-order', captureData);
      console.log('✅ PayPal order captured:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal order capture failed:', error);
      throw error;
    }
  },

  /**
   * Get PayPal order details
   * @param {string} orderId - PayPal Order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderDetails: async (orderId) => {
    try {
      console.log('🔄 Fetching PayPal order details:', orderId);
      const response = await api.get(`/paypal/orders/${orderId}`);
      console.log('✅ PayPal order details fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch PayPal order details:', error);
      throw error;
    }
  },

  /**
   * Get PayPal payment history for current user
   * @returns {Promise<Array>} Array of payment records
   */
  getPaymentHistory: async () => {
    try {
      console.log('🔄 Fetching PayPal payment history');
      const response = await api.get('/paypal/payment-history');
      console.log('✅ PayPal payment history fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch payment history:', error);
      throw error;
    }
  },

  /**
   * Create payout to influencer (admin only)
   * @param {Object} payoutData - Payout data
   * @param {string} payoutData.email - Influencer PayPal email
   * @param {number} payoutData.amount - Payout amount
   * @param {string} payoutData.currency - Currency code
   * @param {string} payoutData.note - Payout note
   * @returns {Promise<Object>} Payout response
   */
  createPayout: async (payoutData) => {
    try {
      console.log('🔄 Creating PayPal payout:', payoutData);
      const response = await api.post('/paypal/create-payout', payoutData);
      console.log('✅ PayPal payout created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal payout creation failed:', error);
      throw error;
    }
  },

  /**
   * Get payout status
   * @param {string} payoutBatchId - PayPal Payout Batch ID
   * @returns {Promise<Object>} Payout status
   */
  getPayoutStatus: async (payoutBatchId) => {
    try {
      console.log('🔄 Fetching payout status:', payoutBatchId);
      const response = await api.get(`/paypal/payouts/${payoutBatchId}`);
      console.log('✅ Payout status fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch payout status:', error);
      throw error;
    }
  },

  /**
   * Refund a PayPal payment
   * @param {Object} refundData - Refund data
   * @param {string} refundData.capture_id - PayPal Capture ID
   * @param {number} refundData.amount - Refund amount (optional)
   * @param {string} refundData.currency - Currency code
   * @returns {Promise<Object>} Refund response
   */
  refundPayment: async (refundData) => {
    try {
      console.log('🔄 Processing PayPal refund:', refundData);
      const response = await api.post('/paypal/refund', refundData);
      console.log('✅ PayPal refund processed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal refund failed:', error);
      throw error;
    }
  },

  /**
   * Check payment eligibility for campaign and influencer
   * @param {string} campaignId - Campaign ID
   * @param {string} influencerId - Influencer ID
   * @returns {Promise<Object>} Eligibility check response
   */
  checkPaymentEligibility: async (campaignId, influencerId) => {
    try {
      console.log('🔄 Checking payment eligibility:', { campaignId, influencerId });
      const response = await api.get(`/paypal/campaigns/${campaignId}/influencer/${influencerId}/eligibility`);
      console.log('✅ Payment eligibility checked:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment eligibility check failed:', error);
      throw error;
    }
  },

  /**
   * Get payment details by ID
   * @param {string} paymentId - Payment record ID
   * @returns {Promise<Object>} Payment details
   */
  getPaymentDetails: async (paymentId) => {
    try {
      console.log('🔄 Fetching payment details:', paymentId);
      const response = await api.get(`/paypal/payments/${paymentId}`);
      console.log('✅ Payment details fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch payment details:', error);
      throw error;
    }
  },

  /**
   * Get transaction details by ID
   * @param {string} transactionId - PayPal Transaction ID
   * @returns {Promise<Object>} Transaction details
   */
  getTransactionDetails: async (transactionId) => {
    try {
      console.log('🔄 Fetching transaction details:', transactionId);
      const response = await api.get(`/paypal/transactions/${transactionId}`);
      console.log('✅ Transaction details fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch transaction details:', error);
      throw error;
    }
  },

  /**
   * Cancel a PayPal order
   * @param {string} orderId - PayPal Order ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  cancelOrder: async (orderId) => {
    try {
      console.log('🔄 Canceling PayPal order:', orderId);
      const response = await api.post(`/paypal/orders/${orderId}/cancel`);
      console.log('✅ PayPal order canceled:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal order cancellation failed:', error);
      throw error;
    }
  },

  /**
   * Test PayPal API connectivity
   * @returns {Promise<Object>} Connectivity test result
   */
  testConnection: async () => {
    try {
      console.log('🔄 Testing PayPal API connection');
      const response = await api.get('/paypal/health');
      console.log('✅ PayPal API connection test passed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal API connection test failed:', error);
      throw error;
    }
  },

  /**
   * Get PayPal account information (admin only)
   * @returns {Promise<Object>} Account information
   */
  getAccountInfo: async () => {
    try {
      console.log('🔄 Fetching PayPal account information');
      const response = await api.get('/paypal/account');
      console.log('✅ PayPal account info fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch PayPal account info:', error);
      throw error;
    }
  },

  /**
   * Get available PayPal balance (admin only)
   * @returns {Promise<Object>} Balance information
   */
  getBalance: async () => {
    try {
      console.log('🔄 Fetching PayPal balance');
      const response = await api.get('/paypal/balance');
      console.log('✅ PayPal balance fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch PayPal balance:', error);
      throw error;
    }
  },

  /**
   * Verify PayPal webhook signature
   * @param {Object} webhookData - Webhook data
   * @param {string} webhookData.payload - Webhook payload
   * @param {string} webhookData.signature - Webhook signature
   * @returns {Promise<Object>} Verification result
   */
  verifyWebhook: async (webhookData) => {
    try {
      console.log('🔄 Verifying PayPal webhook signature');
      const response = await api.post('/paypal/verify-webhook', webhookData);
      console.log('✅ Webhook signature verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Webhook verification failed:', error);
      throw error;
    }
  },

  /**
   * Sync PayPal transactions with local database (admin only)
   * @param {Object} syncData - Sync parameters
   * @param {string} syncData.start_date - Start date for sync
   * @param {string} syncData.end_date - End date for sync
   * @returns {Promise<Object>} Sync result
   */
  syncTransactions: async (syncData) => {
    try {
      console.log('🔄 Syncing PayPal transactions:', syncData);
      const response = await api.post('/paypal/sync/transactions', syncData);
      console.log('✅ PayPal transactions synced:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PayPal transaction sync failed:', error);
      throw error;
    }
  },

  /**
   * Generate payment report (admin only)
   * @param {Object} reportData - Report parameters
   * @param {string} reportData.start_date - Start date (YYYY-MM-DD)
   * @param {string} reportData.end_date - End date (YYYY-MM-DD)
   * @param {string} reportData.format - Report format (csv, pdf, json)
   * @returns {Promise<Object>} Report generation result
   */
  generatePaymentReport: async (reportData) => {
    try {
      console.log('🔄 Generating payment report:', reportData);
      const response = await api.post('/paypal/reports/payments', reportData);
      console.log('✅ Payment report generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment report generation failed:', error);
      throw error;
    }
  },

  /**
   * Get brand applications for PayPal payments
   * @returns {Promise<Array>} Array of applications ready for payment
   */
  getBrandApplications: async () => {
    try {
      console.log('🔄 Fetching brand applications for PayPal');
      const response = await api.get('/api/brand/applications');
      console.log('✅ Brand applications fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching brand applications:', error);
      throw error;
    }
  }
};

export default paypalAPI;