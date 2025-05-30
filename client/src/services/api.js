/**
 * API Service
 *
 * This service provides functions to interact with the backend API
 */

import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Make a request to the API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} - Response data
 */
const apiRequest = async (endpoint, options = {}) => {
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
  };

  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    mergedOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

    // Try to parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Handle non-JSON responses (like HTML error pages)
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      throw new Error('Invalid response format');
    }

    // Check if response is ok
    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        throw new Error(data.message || 'Too many requests. Please try again later.');
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // If the error is related to authentication, clear the token
    if (error.message && (
      error.message.includes('token') ||
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('not logged in')
    )) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
    }

    return data;
  },

  // Logout user
  logout: async () => {
    const data = await apiRequest('/auth/logout');

    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    return data;
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/update-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
    });
  },

  // Send OTP for forgot password
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp,
        newPassword
      }),
    });
  },

  // Delete account
  deleteAccount: async (password) => {
    const data = await apiRequest('/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        password
      }),
    });

    // Clear all authentication tokens immediately after successful deletion
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    return data;
  },
};

// User API
export const userAPI = {
  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/users/me');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiRequest('/users/updateMe', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  // Add credits
  addCredits: async (amount) => {
    return apiRequest('/users/addCredits', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // Use credits
  useCredits: async (amount) => {
    return apiRequest('/users/useCredits', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  // Get credit history
  getCreditHistory: async (limit = 50) => {
    return apiRequest(`/users/credit-history?limit=${limit}`);
  },
};

// ClipDrop API
export const clipdropAPI = {
  // Text to image
  textToImage: async (prompt, options = {}) => {
    // ClipDrop API uses a fixed 1024x1024 resolution and doesn't support negative prompts
    const requestBody = {
      prompt
    };

    const response = await fetch(`${API_URL}/clipdrop/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      } catch (jsonError) {
        // Handle non-JSON error responses
        throw new Error(`Failed to generate image: ${response.status} ${response.statusText}`);
      }
    }

    return response.blob();
  },

  // Upscale image
  upscaleImage: async (imageFile, targetWidth, targetHeight) => {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    if (targetWidth && targetHeight) {
      formData.append('target_width', targetWidth);
      formData.append('target_height', targetHeight);
    }

    const response = await fetch(`${API_URL}/clipdrop/upscale`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upscale image');
      } catch (jsonError) {
        // Handle non-JSON error responses
        throw new Error(`Failed to upscale image: ${response.status} ${response.statusText}`);
      }
    }

    return response.blob();
  },

  // Uncrop image
  uncropImage: async (imageFile, extendOptions = {}) => {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    // Add extend options if provided
    if (extendOptions.extend_left) formData.append('extend_left', extendOptions.extend_left);
    if (extendOptions.extend_right) formData.append('extend_right', extendOptions.extend_right);
    if (extendOptions.extend_up) formData.append('extend_up', extendOptions.extend_up);
    if (extendOptions.extend_down) formData.append('extend_down', extendOptions.extend_down);

    const response = await fetch(`${API_URL}/clipdrop/uncrop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to uncrop image');
      } catch (jsonError) {
        // Handle non-JSON error responses
        throw new Error(`Failed to uncrop image: ${response.status} ${response.statusText}`);
      }
    }

    return response.blob();
  },

  // Remove background
  removeBackground: async (imageFile) => {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch(`${API_URL}/clipdrop/remove-background`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove background');
      } catch (jsonError) {
        // Handle non-JSON error responses
        throw new Error(`Failed to remove background: ${response.status} ${response.statusText}`);
      }
    }

    return response.blob();
  },
};
