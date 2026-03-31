// frontend/src/api/contentAPI.js
import axios from "axios";

// const API_URL = "http://localhost:8000/content/generate";

// export const generateText = async (prompt) => {
//   try {
//     const res = await axios.post(API_URL, { prompt });
//     return res.data.generated_text;
//   } catch (err) {
//     console.error(err);
//     return "Error generating content.";
//   }
// };
 


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Content generation API calls
export const generateContent = async (token, data) => {
  try {
    const response = await api.post('/api/content/generate', data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error;
  }
};

export const getContentLimits = async () => {
  try {
    const response = await api.get('/api/content/limits');
    return response.data;
  } catch (error) {
    console.error('Error fetching content limits:', error);
    // Return fallback data
    return {
      success: false,
      plan: "Free Trial",
      plan_key: "trial",
      plan_type: "trial",
      can_generate: true,
      upgrade_required: false,
      limits: {
        max_generations_per_day: 10,
        max_tokens: 500,
        allowed_models: ["command-a-03-2025"],
        can_generate_content: true
      },
      subscription_data: {
        is_active: true,
        is_trial: true,
        remaining_days: 15,
        trial_remaining_days: 15
      }
    };
  }
};

export const getUserContentStats = async () => {
  try {
    const response = await api.get('/api/content/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return fallback data
    return {
      success: false,
      stats: {
        today_usage: 0,
        daily_limit: 10,
        remaining_today: 10,
        total_generations: 0,
        max_tokens: 500,
        allowed_models: ["command-a-03-2025"],
        plan_name: "Free Trial"
      }
    };
  }
};

export const resetContentUsage = async (token) => {
  try {
    const response = await api.post('/api/content/reset-usage');
    return response.data;
  } catch (error) {
    console.error('Error resetting usage:', error);
    throw error;
  }
};

const contentAPI = {
  generateContent,
  getContentLimits,
  getUserContentStats,
  resetContentUsage,
};

export default contentAPI;
