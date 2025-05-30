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
    console.log('AuthContext initialized, token exists:', !!token);

    if (token) {
      // Fetch current user data
      fetchCurrentUser();
    } else {
      console.log('No token found, skipping user data fetch');
      setLoading(false);
    }

    // Cleanup function to clear any pending timers when component unmounts
    return () => {
      if (updateTimerRef.current) {
        console.log('Cleaning up pending update timer');
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
          credits: response.data.user.credits || 0,
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
                credits: retryResponse.data.user.credits || 0,
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
      console.log('Login response:', response);

      if (response && response.data && response.data.user) {
        // Ensure the user object has all required fields
        const userData = {
          ...response.data.user,
          // Add default values for any missing fields
          id: response.data.user.id || response.data.user._id || 'user-id',
          _id: response.data.user._id || response.data.user.id || 'user-id',
          displayName: response.data.user.displayName || 'User',
          email: response.data.user.email || email,
          credits: response.data.user.credits || 0,
          profilePicture: response.data.user.profilePicture || '',
          bio: response.data.user.bio || '',
          imagesGenerated: response.data.user.imagesGenerated || 0,
          imagesEdited: response.data.user.imagesEdited || 0
        };

        console.log('Processed user data after login:', userData);
        setUser(userData);
      } else {
        console.error('Invalid user data in login response:', response);

        // For development, create a mock user if no valid response
        if (process.env.NODE_ENV !== 'production') {
          console.log('Creating mock user after login...');
          const mockUser = {
            id: 'mock-user-id',
            _id: 'mock-user-id',
            email: email,
            displayName: email.split('@')[0],
            credits: 100,
            profilePicture: '',
            bio: '',
            imagesGenerated: 0,
            imagesEdited: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(mockUser);
        }
      }

      setLoading(false);
      return response.data.user;
    } catch (err) {
      console.error('Login error:', err);
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
      console.log('Signup response:', response);

      if (response && response.data && response.data.user) {
        // Ensure the user object has all required fields
        const userData = {
          ...response.data.user,
          // Add default values for any missing fields
          id: response.data.user.id || response.data.user._id || 'user-id',
          _id: response.data.user._id || response.data.user.id || 'user-id',
          displayName: response.data.user.displayName || displayName,
          email: response.data.user.email || email,
          credits: response.data.user.credits || 0,
          profilePicture: response.data.user.profilePicture || '',
          bio: response.data.user.bio || '',
          imagesGenerated: response.data.user.imagesGenerated || 0,
          imagesEdited: response.data.user.imagesEdited || 0
        };

        console.log('Processed user data after signup:', userData);
        setUser(userData);
      } else {
        console.error('Invalid user data in signup response:', response);

        // For development, create a mock user if no valid response
        if (process.env.NODE_ENV !== 'production') {
          console.log('Creating mock user after signup...');
          const mockUser = {
            id: 'mock-user-id',
            _id: 'mock-user-id',
            email: email,
            displayName: displayName,
            credits: 100,
            profilePicture: '',
            bio: '',
            imagesGenerated: 0,
            imagesEdited: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(mockUser);
        }
      }

      setLoading(false);
      return response.data.user;
    } catch (err) {
      console.error('Signup error:', err);
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
      console.error('Logout error:', err);
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
      console.error('Logout error:', err);
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
      console.log(`Debouncing update request. Last update was ${timeSinceLastUpdate}ms ago`);

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
    console.log('updateUser called with:', updatedUserData);

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
        console.log('Sending changes to server:', changedFields);

        try {
          // Update user with API
          const response = await userAPI.updateProfile(changedFields);

          // Update the last update time
          lastUpdateTimeRef.current = Date.now();

          console.log('Server response:', response.data);

          // Update local state with the full user object returned from server
          setUser(response.data.user);
        } catch (apiError) {
          console.log('API Error in updateUser:', apiError);

          // Check if it's a throttling error (contains throttle or 429 in the message)
          if (apiError.message && (
            apiError.message.toLowerCase().includes('throttle') ||
            apiError.message.toLowerCase().includes('too many') ||
            apiError.message.includes('429')
          )) {
            console.log('Throttling error detected, updating UI optimistically');

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

  const useCredits = async (amount) => {
    if (!user) return false;

    const currentCredits = user.credits || 0;

    if (currentCredits < amount) {
      setError('Not enough credits');
      return false;
    }

    try {
      const response = await userAPI.useCredits(amount);

      if (response && response.data && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        // For development mode, handle the case where the server might not return a proper user object
        if (process.env.NODE_ENV !== 'production') {
          // Update the user credits locally
          setUser(prevUser => ({
            ...prevUser,
            credits: Math.max(0, (prevUser.credits || 0) - amount)
          }));
          return true;
        } else {
          console.error('Invalid response from useCredits API:', response);
          setError('Failed to use credits: Invalid server response');
          return false;
        }
      }
    } catch (err) {
      console.error('Error using credits:', err);

      // For development mode, allow credit usage even if the API fails
      if (process.env.NODE_ENV !== 'production') {
        // Update the user credits locally
        setUser(prevUser => ({
          ...prevUser,
          credits: Math.max(0, (prevUser.credits || 0) - amount)
        }));
        return true;
      }

      setError('Failed to use credits');
      return false;
    }
  };

  const hasEnoughCredits = (amount) => {
    if (!user) return false;
    const currentCredits = user.credits || 0;
    return currentCredits >= amount;
  };

  // Function to refresh user credits specifically
  const refreshCredits = async () => {
    if (!user || creditsLoading) return;

    setCreditsLoading(true);
    try {
      const response = await userAPI.getCurrentUser();
      if (response && response.data && response.data.user) {
        setUser(prevUser => ({
          ...prevUser,
          credits: response.data.user.credits || 0
        }));

        // Dispatch a custom event to notify components of successful refresh
        window.dispatchEvent(new CustomEvent('creditsRefreshed', {
          detail: { credits: response.data.user.credits || 0 }
        }));

        return true; // Indicate success
      }
      return false;
    } catch (err) {
      console.error('Error refreshing credits:', err);
      // Don't set error for credit refresh failures to avoid disrupting UX
      return false;
    } finally {
      setCreditsLoading(false);
    }
  };

  // Set up automatic credit refresh when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      // Refresh credits every 30 seconds
      refreshIntervalRef.current = setInterval(refreshCredits, 30000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [user, loading]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

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
