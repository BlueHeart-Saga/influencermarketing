import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface LogoInfo {
  current_file_id: number | null;
  filename: string | null;
  uploaded_at: string | null;
  content_type: string;
  has_logo: boolean;
}

export interface LogoHistoryItem {
  file_id: number;
  filename: string;
  uploaded_at: string;
  type: 'upload' | 'revert';
  content_type: string;
  file_size?: number;
  is_current: boolean;
}

export interface PlatformNameResponse {
  platform_name: string;
}

export interface PlatformNameHistoryItem {
  name: string;
  changed_at: string;
  type: 'name_change' | 'revert';
  is_current: boolean;
}

export interface UploadResponse {
  message: string;
  file_id: number;
  filename: string;
  file_size: number;
}

export interface RevertResponse {
  message: string;
  new_file_id: number;
  reverted_from: number;
}

export interface HealthCheckResponse {
  service: string;
  status: string;
  has_logo: boolean;
  logo_count: number;
  current_logo: {
    file_id: number | null;
    filename: string | null;
  };
}

class AdminLogoAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  private getUploadHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };
  }

  private handleError(error: any): never {
    if (error.response) {
      throw new Error(error.response.data?.detail || error.response.data?.message || 'API request failed');
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message || 'Request failed');
    }
  }

  // ==================== LOGO MANAGEMENT ====================

  /**
   * Upload a new logo
   */
  async uploadLogo(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/logo/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get current logo as blob URL
   */
  async getCurrentLogo(): Promise<string | null> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/logo/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob',
        timeout: 10000
      });
      
      if (response.data && response.data.size > 0) {
        return URL.createObjectURL(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching logo:', error);
      return null;
    }
  }

  /**
   * Get logo information (metadata)
   */
  async getLogoInfo(): Promise<LogoInfo> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/logo/info`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get logo history
   */
  async getLogoHistory(): Promise<LogoHistoryItem[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/logo/history`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Revert to a previous logo version
   */
  async revertLogo(fileId: number): Promise<RevertResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/logo/revert/${fileId}`, {}, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete current logo
   */
  async deleteCurrentLogo(): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/logo/current`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Clear logo history (keep current)
   */
  async clearLogoHistory(): Promise<{ message: string; current_file_id: number | null }> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/logo/history`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== PLATFORM NAME MANAGEMENT ====================

  /**
   * Get current platform name
   */
  async getPlatformName(): Promise<PlatformNameResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/platform/name`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update platform name
   */
  async updatePlatformName(name: string): Promise<{ message: string; platform_name: string }> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/platform/name`, { name }, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get platform name history
   */
  async getPlatformNameHistory(): Promise<PlatformNameHistoryItem[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/platform/name/history`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Revert platform name to a previous version
   */
  async revertPlatformName(name: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/platform/name/revert`, { name }, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check logo service health
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/logo/health`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get history type label
   */
  getHistoryTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'upload': 'Upload',
      'revert': 'Revert',
      'name_change': 'Change'
    };
    return labels[type] || type;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size too large. Maximum 50MB.' };
    }

    // Check file is not empty
    if (file.size === 0) {
      return { valid: false, error: 'File is empty.' };
    }

    // Accept all image formats - relaxed validation
    const allowedExtensions = [
      '.png', '.jpg', '.jpeg', '.svg', '.ico', '.gif',
      '.webp', '.bmp', '.tiff', '.tif', '.avif', '.heic', '.heif'
    ];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      // Warning but allow upload (matching backend behavior)
      console.warn(`Uploading file with non-standard extension: ${file.name}`);
    }

    return { valid: true };
  }
}

export default new AdminLogoAPI();