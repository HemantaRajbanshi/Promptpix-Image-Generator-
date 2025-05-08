// Simple hash function for client-side demo purposes only
// In a real app, password hashing should be done on the server
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16); // Convert to hex string
};

// Simple compare function
const compareHash = (plainText, hashedText) => {
  return simpleHash(plainText) === hashedText;
};
import { getUsers, saveUsers, setCurrentUser, clearCurrentUser, generateId, getCurrentUser } from './index';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User display name
 * @returns {Promise<Object>} - User data
 */
export const registerUser = async (email, password, name) => {
  try {
    // Get all users
    const users = getUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password (simple client-side hash for demo)
    const hashedPassword = simpleHash(password);

    // Create new user
    const newUser = {
      uid: generateId(),
      email,
      password: hashedPassword,
      displayName: name,
      credits: 10, // Give new users 10 free credits
      createdAt: new Date().toISOString()
    };

    // Add user to users array
    users.push(newUser);

    // Save users to localStorage
    saveUsers(users);

    // Return user data (without password)
    const userData = { ...newUser };
    delete userData.password;

    // Set current user
    setCurrentUser(userData);

    return userData;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data
 */
export const loginUser = async (email, password) => {
  try {
    // Get all users
    const users = getUsers();

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Check password (simple client-side comparison for demo)
    const isPasswordValid = compareHash(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Return user data (without password)
    const userData = { ...user };
    delete userData.password;

    // Set current user
    setCurrentUser(userData);

    return userData;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
  clearCurrentUser();
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserById = async (userId) => {
  try {
    // Get all users
    const users = getUsers();

    // Find user by ID
    const user = users.find(user => user.uid === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user data (without password)
    const userData = { ...user };
    delete userData.password;

    return userData;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Object} Updated user data
 */
export const updateUserProfile = async (userData) => {
  try {
    // Get current user
    const currentUser = getCurrentUser();

    if (!currentUser) {
      throw new Error('No user is currently logged in');
    }

    // Get all users
    const users = getUsers();

    // Find user by ID
    const userIndex = users.findIndex(user => user.id === userData.id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user data
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    // Save updated user
    users[userIndex] = updatedUser;
    saveUsers(users);

    // Update current user
    setCurrentUser(updatedUser);

    // Return user data without password
    const returnData = { ...updatedUser };
    delete returnData.password;

    return returnData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};