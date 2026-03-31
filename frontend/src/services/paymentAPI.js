// import API_BASE_URL from '../config/api';

// class PaymentAPI {
//   async createPaymentOrder(paymentData) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(paymentData)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Create payment order error:', error);
//       throw error;
//     }
//   }

//   async verifyPayment(verificationData) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(verificationData)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Payment verification error:', error);
//       throw error;
//     }
//   }

//   async processManualPayment(paymentData) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/payments/manual`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(paymentData)
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Manual payment error:', error);
//       throw error;
//     }
//   }

//   async getPaymentStatus(paymentId) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Get payment status error:', error);
//       throw error;
//     }
//   }
// }


// // Assign instance to a variable first
// const paymentAPI = new PaymentAPI();

// // Export the instance
// export default paymentAPI;


// services/paymentAPI.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const paymentsAPI = {
  // Get all pending direct payments
  getPendingDirectPayments: async () => {
    const user = JSON.parse(localStorage.getItem("quickbox-user"));

  if (user?.role !== "brand") {
    return []; // silently ignore instead of throwing
  }
    try {
      const response = await api.get('/api/payments/pending-direct-payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  },

  // Get payment history
  getDirectPaymentHistory: async (page = 1, limit = 20, status = null, paymentType = null) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);
      if (paymentType) params.append('payment_type', paymentType);
      
      const response = await api.get(`/api/payments/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Direct pay influencer
 directPayInfluencer: async (
  campaignId,
  influencerId,
  amount,
  paymentMethod = "bank_transfer",
  notes = ""
) => {
  try {
    const response = await api.post('/api/payments/direct-pay', {
      campaign_id: campaignId,
      influencer_id: influencerId,
      amount: Number(amount),
      payment_method: paymentMethod,
      notes: notes
    });

    return response.data;
  } catch (error) {
    console.error(
      'Direct payment error:',
      error.response?.data || error.message
    );
    throw error;
  }
},


  // Get campaign applications with bank accounts
  getApplicationsWithAccounts: async (campaignId) => {
    try {
      const response = await api.get(`/api/payments/campaigns/${campaignId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications with accounts:', error);
      throw error;
    }
  },
//    directPayInfluencerAlt: async (campaignId, influencerId, amount, paymentMethod = "bank_transfer", notes = "") => {
//     try {
//       const params = new URLSearchParams({
//         campaign_id: campaignId,
//         influencer_id: influencerId,
//         amount: amount,
//         payment_method: paymentMethod,
//         notes: notes
//       }).toString();
      
//       const response = await api.post(`/payments/direct-pay?${params}`);
//       return response.data;
//     } catch (error) {
//       console.error('Direct payment error:', error.response?.data || error.message);
//       throw error;
//     }
//   },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await api.get(`/api/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  // Cancel payment
  cancelPayment: async (paymentId, reason = '') => {
    try {
      const response = await api.post(`/api/payments/${paymentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },

  // Get payment statistics
  getPaymentStatistics: async () => {
    try {
      const response = await api.get('/api/payments/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw error;
    }
  },

  // Upload receipt/proof of payment
  uploadPaymentProof: async (paymentId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('payment_id', paymentId);
      
      const response = await api.post('/api/payments/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/api/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Get wallet balance
  getWalletBalance: async () => {
    try {
      const response = await api.get('/api/payments/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  // Add funds to wallet
  addFundsToWallet: async (amount, paymentMethod) => {
    try {
      const response = await api.post('/api/payments/wallet/add-funds', {
        amount: Number(amount),
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error adding funds to wallet:', error);
      throw error;
    }
  }
};

export default paymentsAPI;