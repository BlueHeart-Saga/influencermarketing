// frontend/src/services/autopayAPI.js
import api from './api';

const autopayAPI = {
  // Get all autopay schedules for current brand
  getMyAutopays: async () => {
    const response = await api.get('/autopay/my-autopays');
    return response.data;
  },

  // Setup new autopay schedule
  setupAutopay: async (autopayData) => {
    const response = await api.post('/autopay/setup', autopayData);
    return response.data;
  },

  // Make direct payment
  makeDirectPayment: async (paymentData) => {
    const response = await api.post('/autopay/direct-payment', paymentData);
    return response.data;
  },

  // Update autopay schedule
  updateAutopay: async (autopayId, updateData) => {
    const response = await api.put(`/autopay/${autopayId}`, updateData);
    return response.data;
  },

  // Cancel autopay schedule
  cancelAutopay: async (autopayId) => {
    const response = await api.delete(`/autopay/${autopayId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/autopay/payment-history');
    return response.data;
  },

  // Get all autopays (admin only)
  getAllAutopays: async () => {
    const response = await api.get('/autopay/admin/all-autopays');
    return response.data;
  },

  // Process payments (admin only)
  processPayments: async () => {
    const response = await api.post('/autopay/admin/process-payments');
    return response.data;
  }
};

export default autopayAPI;