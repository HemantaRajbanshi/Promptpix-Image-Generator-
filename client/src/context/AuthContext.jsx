import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

  // Add a debounce timer reference to prevent too many update requests
  const updateTimerRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const refreshIntervalRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem('token');

    if (token) {
      // Fetch current user data
      fetchCurrentUser();
    } else {
      setLoading(false);
    }

    // Cleanup function to clear any pending timers when component unmounts
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    };
  }, []);

  // Fetch current user data from API
  const fetchCurrentUser = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Make the API request
      const response = await userAPI.getCurrentUser();

      if (response && response.data && response.data.user) {
        // Create a complete user object with all required fields
        const userData = {
          ...response.data.user,
          // Ensure these critical fields are always present
          id: response.data.user.id || response.data.user._id || 'user-id',
          _id: response.data.user._id || response.data.user.id || 'user-id',
          displayName: response.data.user.displayName || 'User',
          email: response.data.user.email || 'user@example.com',

          profilePicture: response.data.user.profilePicture || '',
          bio: response.data.user.bio || '',
          imagesGenerated: response.data.user.imagesGenerated || 0,
          imagesEdited: response.data.user.imagesEdited || 0,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          updatedAt: response.data.user.updatedAt || new Date().toISOString()
        };

        // Set the user in state
        setUser(userData);
      } else {
        // Try to recover by making a second request after a short delay
        setTimeout(async () => {
          try {
            const retryResponse = await userAPI.getCurrentUser();

            if (retryResponse && retryResponse.data && retryResponse.data.user) {
              const retryUserData = {
                ...retryResponse.data.user,
                id: retryResponse.data.user.id || retryResponse.data.user._id || 'user-id',
                _id: retryResponse.data.user._id || retryResponse.data.user.id || 'user-id',
                displayName: retryResponse.data.user.displayName || 'User',
                email: retryResponse.data.user.email || 'user@example.com',

                profilePicture: retryResponse.data.user.profilePicture || '',
                bio: retryResponse.data.user.bio || '',
                imagesGenerated: retryResponse.data.user.imagesGenerated || 0,
                imagesEdited: retryResponse.data.user.imagesEdited || 0
              };

              setUser(retryUserData);
              return;
            }

            // If retry fails and we're in development, create a mock user
            if (process.env.NODE_ENV !== 'production') {
              createMockUser();
            } else {
              // In production, clear the token
              localStorage.removeItem('token');
            }
          } catch (retryErr) {
            // If retry fails and we're in development, create a mock user
            if (process.env.NODE_ENV !== 'production') {
              createMockUser();
            } else {
              // In production, clear the token
              localStorage.removeItem('token');
            }
          }
        }, 1000);
      }
    } catch (err) {
      // For development purposes, create a mock user if fetch fails
      if (process.env.NODE_ENV !== 'production') {
        createMockUser();
      } else {
        // If token is invalid and not in development, clear it
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create a mock user for development
  const createMockUser = () => {
    const mockUser = {
      id: 'mock-user-id',
      _id: 'mock-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      credits: 100,
      profilePicture: '',
      bio: 'This is a mock user for development purposes.',
      imagesGenerated: 5,
      imagesEdited: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUser(mockUser);
  };

  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Login with API
      const response = await authAPI.login({ email, password });

      if (response && response.data && response.data.user) {
        // Ensure the user object has all required fields
        const userData = {
          ...response.data.user,
          // Add default values for any missing fields
          id: response.data.user.id || response.data.user._id || 'user-id',
          _id: response.data.user._id || response.data.user.id || 'user-id',
          displayName: response.data.user.displayName || 'User',
          email: response.data.user.email || email,

          profilePicture: response.data.user.profilePicture || '',
          bio: response.data.user.bio || '',
          imagesGenerated: response.data.user.imagesGenerated || 0,
          imagesEdited: response.data.user.imagesEdited || 0
        };

        setUser(userData);
      } else {
        throw new Error('Invalid response from server. Please try again.');
      }

      setLoading(false);
      return response.data.user;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, displayName) => {
    setError(null);
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password || !displayName) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Register with API
      const response = await authAPI.register({ email, password, displayName });

      if (response && response.data && response.data.user) {
        // Ensure the user object has all required fields
        const userData = {
          ...response.data.user,
          // Add default values for any missing fields
          id: response.data.user.id || response.data.user._id || 'user-id',
          _id: response.data.user._id || response.data.user.id || 'user-id',
          displayName: response.data.user.displayName || displayName,
          email: response.data.user.email || email,

          profilePicture: response.data.user.profilePicture || '',
          bio: response.data.user.bio || '',
          imagesGenerated: response.data.user.imagesGenerated || 0,
          imagesEdited: response.data.user.imagesEdited || 0
        };

        setUser(userData);
      } else {
        throw new Error('Invalid response from server. Please try again.');
      }

      setLoading(false);
      return response.data.user;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore logout errors - we'll clear local state anyway
    } finally {
      // Clear user data regardless of API response
      setUser(null);
      // Clear all authentication tokens and session data
      localStorage.removeItem('token');
      localStorage.removeItem('promptpix_current_user');
      // Clear any other user-specific data
      sessionStorage.clear();
    }
  };

  // Complete logout with full cleanup (for account deletion)
  const completeLogout = async () => {
    setError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      // Ignore logout errors - we'll clear local state anyway
    } finally {
      // Clear user data
      setUser(null);

      // Clear all localStorage data
      localStorage.clear();

      // Clear all sessionStorage data
      sessionStorage.clear();

      // Clear any pending timers
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      // Reset internal state
      lastUpdateTimeRef.current = 0;
      setCreditsLoading(false);
      setLoading(false);
      setError(null);
    }
  };

  const updateUser = async (updatedUserData) => {
    setError(null);

    // Clear any existing update timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    }

    // Implement debouncing - only allow updates every 2 seconds
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const MIN_UPDATE_INTERVAL = 2000; // 2 seconds

    if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
      // Update UI optimistically without making API call
      const allowedFields = {};
      Object.keys(updatedUserData).forEach(key => {
        if (['displayName', 'profilePicture', 'bio', 'imagesGenerated', 'imagesEdited'].includes(key)) {
          allowedFields[key] = updatedUserData[key];
        }
      });

      // Update local state optimistically
      if (Object.keys(allowedFields).length > 0) {
        setUser(prev => ({
          ...prev,
          ...allowedFields
        }));
      }

      // Schedule the actual update for later
      return new Promise((resolve) => {
        updateTimerRef.current = setTimeout(() => {
          // Call updateUser again after the debounce period
          updateUser(updatedUserData)
            .then(resolve)
            .catch(() => {
              // Even if the delayed update fails, we've already updated the UI
              resolve(user);
            });
        }, MIN_UPDATE_INTERVAL - timeSinceLastUpdate);
      });
    }

    // If we're past the debounce period, proceed with the update
    setLoading(true);

    try {
      // If we have the current user, only send fields that have actually changed
      const changedFields = {};

      if (user) {
        // Compare each field in updatedUserData with current user data
        Object.keys(updatedUserData).forEach(key => {
          // Skip internal fields like _id that shouldn't be updated
          if (key === '_id') return;

          // Only include fields that have changed and are allowed to be updated
          if (updatedUserData[key] !== user[key] &&
              ['displayName', 'profilePicture', 'bio', 'imagesGenerated', 'imagesEdited'].includes(key)) {
            changedFields[key] = updatedUserData[key];
          }
        });
      } else {
        // If we don't have current user data, send only allowed fields
        Object.keys(updatedUserData).forEach(key => {
          if (['displayName', 'profilePicture', 'bio', 'imagesGenerated', 'imagesEdited'].includes(key)) {
            changedFields[key] = updatedUserData[key];
          }
        });
      }

      // Only make API call if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        try {
          // Update user with API
          const response = await userAPI.updateProfile(changedFields);

          // Update the last update time
          lastUpdateTimeRef.current = Date.now();

          // Update local state with the full user object returned from server
          setUser(response.data.user);
        } catch (apiError) {
          // Check if it's a throttling error (contains throttle or 429 in the message)
          if (apiError.message && (
            apiError.message.toLowerCase().includes('throttle') ||
            apiError.message.toLowerCase().includes('too many') ||
            apiError.message.includes('429')
          )) {

            // Update the UI optimistically anyway
            setUser(prev => ({
              ...prev,
              ...changedFields
            }));

            // Don't throw the error for throttling
            setLoading(false);
            return user;
          }

          // For other errors, rethrow
          throw apiError;
        }
      }

      setLoading(false);
      return user;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Credit management functions
  const addCredits = async (amount) => {
    if (!user) return false;

    try {
      const response = await userAPI.addCredits(amount);
      setUser(response.data.user);
      return true;
    } catch (err) {
      setError('Failed to add credits');
      return false;
    }
  };







  const value = {
    user,
    loading,
    error,
    creditsLoading,
    login,
    signup,
    logout,
    completeLogout, // For account deletion with full cleanup
    updateUser,
    addCredits,
    useCredits,
    hasEnoughCredits,
    refreshCredits,
    fetchCurrentUser, // Expose this function to components
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
