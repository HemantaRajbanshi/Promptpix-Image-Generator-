import { createContext, useState, useContext, useEffect } from 'react';
import { registerUser, loginUser, getUserById, logoutUser, updateUserProfile } from '../services/local-storage/auth';
import { initStorage, getCurrentUser } from '../services/local-storage/index';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize storage
    initStorage();

    // Check if user is logged in from localStorage
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      // Login with localStorage
      const userData = await loginUser(email, password);

      // User data is already stored in localStorage by the auth service
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, name) => {
    setError(null);
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password || !name) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Register with localStorage
      const userData = await registerUser(email, password, name);

      // User data is already stored in localStorage by the auth service
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    logoutUser(); // This will clear the user from localStorage
    setUser(null);
  };

  const updateUser = async (updatedUserData) => {
    setError(null);
    setLoading(true);

    try {
      // In a real app, you would send this to your backend
      // For now, we'll just update the local storage
      const updatedUser = await updateUserProfile(updatedUserData);
      setUser(updatedUser);
      setLoading(false);
      return updatedUser;
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
      const currentCredits = user.credits || 0;
      const updatedUser = await updateUserProfile({
        ...user,
        credits: currentCredits + amount
      });

      setUser(updatedUser);
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
      const updatedUser = await updateUserProfile({
        ...user,
        credits: currentCredits - amount
      });

      setUser(updatedUser);
      return true;
    } catch (err) {
      setError('Failed to use credits');
      return false;
    }
  };

  const hasEnoughCredits = (amount) => {
    if (!user) return false;
    const currentCredits = user.credits || 0;
    return currentCredits >= amount;
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    addCredits,
    useCredits,
    hasEnoughCredits,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
