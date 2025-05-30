/**
 * Application Constants
 * Centralized location for all application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DEFAULT_QUALITY: 0.9,
  TARGET_RESOLUTION: 1080, // For downloads
  CLIPDROP_RESOLUTION: 1024, // ClipDrop API fixed resolution
};

// User Configuration
export const USER_CONFIG = {
  DEFAULT_CREDITS: 10,
  MIN_PASSWORD_LENGTH: 6,
  MAX_BIO_LENGTH: 500,
  MAX_DISPLAY_NAME_LENGTH: 50,
};

// Credit Configuration
export const CREDIT_CONFIG = {
  OPERATION_COST: 2, // Credits required per AI operation
  LOW_CREDIT_THRESHOLD: 5, // Show warning when credits are at or below this
  OPERATIONS: {
    TEXT_TO_IMAGE: 2,
    UPSCALE: 2,
    UNCROP: 2,
    REMOVE_BACKGROUND: 2,
    IMAGE_EDITOR: 0, // Image editor is free
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  GALLERY: 'promptpix_gallery',
  USERS: 'promptpix_users',
  IMAGES: 'promptpix_images',
  CURRENT_USER: 'promptpix_current_user',
  THEME: 'promptpix_theme',
  AUTH_TOKEN: 'token',
};

// Animation Configuration
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_OUT: [0.0, 0.0, 0.2, 1],
    EASE_IN_OUT: [0.4, 0.0, 0.2, 1],
  },
};

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  RESEND_TIMER: 60, // seconds
  PAGINATION_SIZE: 12,
};

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'peacemusic80@gmail.com',
  PHONE: '+977 9816927699',
  ADDRESS: {
    LINE1: 'Mechi Multiple Campus',
    LINE2: 'H36P+WV3, Bhadrapur 57200',
    COUNTRY: 'Nepal',
  },
  COORDINATES: {
    LAT: 26.561046,
    LNG: 88.087163,
  },
};

// Social Media Links
export const SOCIAL_LINKS = {
  TWITTER: '#',
  FACEBOOK: '#',
  LINKEDIN: '#',
  INSTAGRAM: '#',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  FILE_TOO_LARGE: `File size must be less than ${IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  INVALID_FILE_TYPE: 'Please select a valid image file (JPEG, PNG, WebP)',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  IMAGE_GENERATED: 'Image generated successfully!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_UPDATED: 'Password updated successfully!',
  EMAIL_SENT: 'Email sent successfully!',
};
