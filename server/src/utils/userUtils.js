/**
 * Utility functions for user-related operations
 *
 * This module provides utility functions for creating and manipulating user objects.
 * It ensures consistent user data structure throughout the application and handles
 * edge cases like missing fields and ObjectId conversion.
 *
 * @module userUtils
 */

/**
 * Create a complete user object with all required fields
 *
 * This function takes a user data object and ensures that all required fields are present.
 * It handles edge cases like missing fields, ObjectId conversion, and provides default values.
 * This ensures consistent user data structure throughout the application.
 *
 * @param {Object} userData - User data object which may be incomplete
 * @param {boolean} isMock - Whether this is a mock user (affects default values)
 * @returns {Object} Complete user object with all required fields
 *
 * @example
 * // Create a complete user object from a database user
 * const completeUser = createCompleteUser(dbUser);
 *
 * // Create a mock user for development
 * const mockUser = createCompleteUser({id: 'mock-id'}, true);
 */
exports.createCompleteUser = (userData, isMock = false) => {
  // Base user object
  const completeUser = {
    id: userData.id || userData._id || (isMock ? 'mock-id' : undefined),
    _id: userData._id || userData.id || (isMock ? 'mock-id' : undefined),
    email: userData.email || (isMock ? 'test@example.com' : undefined),
    displayName: userData.displayName || (isMock ? 'Test User' : 'User'),
    credits: userData.credits || (isMock ? 100 : 0),
    profilePicture: userData.profilePicture || '',
    bio: userData.bio || '',
    imagesGenerated: userData.imagesGenerated || 0,
    imagesEdited: userData.imagesEdited || 0,
    createdAt: userData.createdAt || new Date(),
    updatedAt: userData.updatedAt || new Date()
  };

  // Convert any ObjectId to string to ensure consistent data format
  if (completeUser.id && typeof completeUser.id !== 'string') {
    completeUser.id = completeUser.id.toString();
  }
  if (completeUser._id && typeof completeUser._id !== 'string') {
    completeUser._id = completeUser._id.toString();
  }

  return completeUser;
};

/**
 * Create a mock user for development
 *
 * This function creates a mock user object for development purposes.
 * It's useful when the real user data is not available, such as when:
 * - The database is not accessible
 * - The user doesn't exist in the database
 * - We're running in development mode and want to bypass authentication
 *
 * @param {string} id - User ID to use for the mock user
 * @param {string} type - Type of mock user: 'default' or 'error'
 * @returns {Object} Complete mock user object with all required fields
 *
 * @example
 * // Create a default mock user
 * const mockUser = createMockUser('mock-id');
 *
 * // Create a mock user for error handling
 * const errorMockUser = createMockUser('error-id', 'error');
 */
exports.createMockUser = (id = 'mock-id', type = 'default') => {
  const bio = type === 'error'
    ? 'This is a mock user created after an error.'
    : 'This is a mock user for development.';

  return this.createCompleteUser({
    _id: id,
    id: id,
    email: 'test@example.com',
    displayName: 'Test User',
    credits: 100,
    bio,
    imagesGenerated: 5,
    imagesEdited: 3
  }, true);
};
