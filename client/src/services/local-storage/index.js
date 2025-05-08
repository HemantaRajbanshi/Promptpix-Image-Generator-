/**
 * Local Storage Service
 * This service provides functions to interact with browser's localStorage
 * for storing user data and images
 */

// Storage keys
const USERS_KEY = 'promptpix_users';
const IMAGES_KEY = 'promptpix_images';
const CURRENT_USER_KEY = 'promptpix_current_user';

/**
 * Initialize storage with default values if not exists
 */
export const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(IMAGES_KEY)) {
    localStorage.setItem(IMAGES_KEY, JSON.stringify([]));
  }
};

/**
 * Get all users
 * @returns {Array} - Array of users
 */
export const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

/**
 * Get all images
 * @returns {Array} - Array of images
 */
export const getImages = () => {
  const images = localStorage.getItem(IMAGES_KEY);
  return images ? JSON.parse(images) : [];
};

/**
 * Save users to localStorage
 * @param {Array} users - Array of users
 */
export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Save images to localStorage
 * @param {Array} images - Array of images
 */
export const saveImages = (images) => {
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
};

/**
 * Get current user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Set current user
 * @param {Object} user - User object
 */
export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

/**
 * Clear current user
 */
export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
