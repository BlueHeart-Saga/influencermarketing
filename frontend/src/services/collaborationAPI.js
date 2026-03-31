// src/services/collaborationAPI.js
import api from "./api"; // your axios instance

// Utility: always return safe string IDs
const safeString = (val) => (val != null ? String(val) : "");

// Utility: normalize errors from FastAPI
const handleError = (error) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (data.detail) {
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      }
      return typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    }
    return JSON.stringify(data);
  }
  return error.message || "Unknown error occurred";
};

export const collaborationAPI = {
  // Get all collaborations for a user (brand or influencer)
  async getUserCollaborations(userId) {
    try {
      const response = await api.get(
        `/collaborations/user/${safeString(userId)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Get all influencers available for collaboration
  async getInfluencers(brandId) {
    try {
      const response = await api.get(
        `/collaborations/influencers/${safeString(brandId)}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Create a new collaboration
  async createCollaboration(brandId, influencerId, initialMessage) {
    try {
      const response = await api.post(`/collaborations/`, {
        brand_id: safeString(brandId),
        influencer_id: safeString(influencerId),
        initial_message: initialMessage,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Get messages for a collaboration
  async getMessages(collaborationId, userId) {
    try {
      const response = await api.get(
        `/collaborations/${safeString(collaborationId)}/messages`,
        {
          params: { user_id: safeString(userId) },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Send a message inside a collaboration
  async sendMessage(collaborationId, senderId, content) {
    try {
      const response = await api.post(
        `/collaborations/${safeString(collaborationId)}/messages`,
        {
          sender_id: safeString(senderId),
          content,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },

  // Mark all messages as read for a user in a collaboration
  async markAsRead(collaborationId, userId) {
    try {
      const response = await api.post(
        `/collaborations/${safeString(collaborationId)}/read`,
        {
          user_id: safeString(userId),
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  },
};
