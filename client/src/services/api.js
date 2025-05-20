/**
 * API Service
 *
 * This service provides functions to interact with the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
  const token = localStorage.getItem('token');
  if (token) {
    console.log(`Adding token to request for ${endpoint}`);
    mergedOptions.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log(`No token available for request to ${endpoint}`);
  }

  try {
    console.log(`Making API request to ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);

    // Try to parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      throw new Error('Invalid response format');
    }

    // Check if response is ok
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);

    // If the error is related to authentication, clear the token
    if (error.message && (
      error.message.includes('token') ||
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('not logged in')
    )) {
      console.warn('Authentication error detected, clearing token');
      localStorage.removeItem('token');
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
      console.log('Login successful, saving token');
      localStorage.setItem('token', data.token);
    } else {
      console.warn('Login response did not contain a token:', data);
    }

    return data;
  },

  // Logout user
  logout: async () => {
    const data = await apiRequest('/auth/logout');

    // Remove token from localStorage
    localStorage.removeItem('token');

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
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
