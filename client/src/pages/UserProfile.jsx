import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from '../components/SkeletonLoader';
import DashboardContentWrapper from '../components/DashboardContentWrapper';
import { useAuth } from '../context/AuthContext';
import { getUserGalleryItems, getUserStatistics, addGalleryItem } from '../services/local-storage/gallery';
import { debounce } from '../utils/debounce';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Form state - removed password fields
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    profilePicture: ''
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Statistics state
  const [statistics, setStatistics] = useState({
    imagesGenerated: 0,
    imagesEdited: 0,
    totalImages: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Gallery state
  const [userGalleryItems, setUserGalleryItems] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState(null);

  // Track original user data for differential updates
  const originalUserRef = useRef(null);
  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Track pending updates to batch them
  const pendingUpdatesRef = useRef({});

  // Load user statistics and gallery items
  const loadUserData = useCallback(async () => {
    if (!user?.id && !user?._id) {
      setIsLoadingStats(false);
      setIsLoadingGallery(false);
      return;
    }

    const userId = user.id || user._id;

    try {
      setIsLoadingStats(true);
      setIsLoadingGallery(true);
      setStatsError(null);
      setGalleryError(null);

      // Load user's gallery items
      const userItems = getUserGalleryItems(userId);
      setUserGalleryItems(userItems);

      // Calculate statistics from user's items
      const stats = getUserStatistics(userId);
      setStatistics(stats);

      // Update user object with real-time statistics if they differ
      if (user.imagesGenerated !== stats.imagesGenerated || user.imagesEdited !== stats.imagesEdited) {
        const updatedUser = {
          ...user,
          imagesGenerated: stats.imagesGenerated,
          imagesEdited: stats.imagesEdited
        };
        updateUser(updatedUser);
      }

      setIsLoadingStats(false);
      setIsLoadingGallery(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setStatsError('Failed to load statistics');
      setGalleryError('Failed to load gallery');
      setIsLoadingStats(false);
      setIsLoadingGallery(false);
    }
  }, [user, updateUser]);

  // Load user data and calculate statistics
  useEffect(() => {
    if (user) {
      // Store original user data for differential updates
      originalUserRef.current = { ...user };

      // Set form data from user object
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });

      // Reset unsaved changes state and pending updates
      setHasUnsavedChanges(false);
      pendingUpdatesRef.current = {};

      // Load user data and statistics
      loadUserData();
    } else {
      // Check if there's a token but no user data
      const token = localStorage.getItem('token');
      if (token) {
        // Try to refresh user data after a short delay
        setTimeout(() => {
          // Instead of reloading, try to fetch user data again
          const { fetchCurrentUser } = useAuth();
          fetchCurrentUser();
        }, 2000);
      }
    }
  }, [user, loadUserData]);

  // Refresh data when user creates new images (listen for storage changes)
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        loadUserData();
      }
    };

    // Listen for storage changes to update statistics in real-time
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events when images are added
    window.addEventListener('galleryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('galleryUpdated', handleStorageChange);
    };
  }, [user, loadUserData]);

  // Create a debounced update function that only sends changes after 500ms of inactivity
  const debouncedUpdateUser = useCallback(
    debounce((fieldName, fieldValue) => {
      console.log(`Debounced update for field: ${fieldName}, value: ${fieldValue}`);

      // Store the pending update
      pendingUpdatesRef.current[fieldName] = fieldValue;

      // Mark form as having unsaved changes
      setHasUnsavedChanges(true);

      // We don't send the update immediately - it will be sent when the form is saved
    }, 500),
    [] // Empty dependency array means this function is created only once
  );

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form state immediately for responsive UI
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Only debounce non-password fields that should be sent to the server
    if (name !== 'currentPassword' && name !== 'newPassword' && name !== 'confirmPassword') {
      debouncedUpdateUser(name, value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate passwords if trying to change password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
      }

      // Collect all changes from form data and pending updates
      const changedFields = {};

      // Add fields from form data
      if (formData.displayName !== originalUserRef.current.displayName) {
        changedFields.displayName = formData.displayName;
      }

      if (formData.bio !== originalUserRef.current.bio) {
        changedFields.bio = formData.bio;
      }

      if (formData.profilePicture && formData.profilePicture !== originalUserRef.current.profilePicture) {
        changedFields.profilePicture = formData.profilePicture;
      }

      // Add any other pending updates
      Object.assign(changedFields, pendingUpdatesRef.current);

      // Only proceed if there are actual changes
      if (Object.keys(changedFields).length === 0) {
        setMessage({
          type: 'info',
          text: 'No changes to save'
        });
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }

      console.log('Saving changes:', changedFields);

      // Create updated user object with only the changed fields
      const updatedUser = {
        ...user,
        ...changedFields
      };

      // Optimistic UI update - update the UI immediately
      const previousUser = { ...user };

      // Update local state optimistically
      setMessage({
        type: 'info',
        text: 'Saving changes...'
      });

      try {
        // Send update to server
        await updateUser(updatedUser);

        // Update was successful
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });

        // Reset unsaved changes state and pending updates
        setHasUnsavedChanges(false);
        pendingUpdatesRef.current = {};

        // Update original user reference
        originalUserRef.current = { ...updatedUser };

        setIsEditing(false);
      } catch (updateError) {
        // If update fails, revert to previous state
        console.error('Failed to update profile:', updateError);

        // Revert optimistic update
        updateUser(previousUser);

        throw new Error('Failed to save changes. Please try again.');
      }


    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: 'beforeChildren'
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 10 } },
    tap: { scale: 0.95 }
  };

  // Debug user data
  console.log('UserProfile component - user data:', user);

  // Check if user data is available
  if (!user) {
    // Check if there's a token but no user data
    const hasToken = !!localStorage.getItem('token');
    console.log('UserProfile - No user data, token exists:', hasToken);

    // If token exists but no user data, try to fetch user data again
    if (hasToken) {
      // This will trigger a re-render when the user data is fetched
      const { fetchCurrentUser } = useAuth();

      // Use useEffect to avoid calling fetchCurrentUser during render
      useEffect(() => {
        console.log('Attempting to fetch user data again from UserProfile component');

        // Set a timeout to avoid infinite loops
        const timeoutId = setTimeout(() => {
          fetchCurrentUser();
        }, 1000);

        return () => clearTimeout(timeoutId);
      }, []);
    }

    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-purple-200 dark:border-purple-900/30"></div>
            <motion.div
              className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            ></motion.div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>

          {/* Show different buttons based on token existence */}
          {hasToken ? (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attempting to load your profile data...
              </p>
              <button
                onClick={() => {
                  // Try to refresh user data
                  const { fetchCurrentUser } = useAuth();
                  fetchCurrentUser();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Refresh Data
              </button>
              <button
                onClick={() => {
                  // Clear token and redirect to login
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out & Login Again
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardContentWrapper>
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Modern Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Manage your account information and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Profile header card */}
        <motion.div
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl overflow-hidden mb-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          {/* Background pattern - modern gradient */}
          <div className="relative bg-gradient-to-r from-blue-600/90 to-purple-600/90 px-8 py-16 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center">
              {/* Profile avatar - can only be changed in edit mode */}
              <div className="relative mb-6 md:mb-0 md:mr-8">
                <motion.div
                  className="relative h-28 w-28 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  {isUploadingPhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : null}
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </motion.div>

                <motion.div
                  className="absolute -bottom-1 -right-1 bg-green-400 h-5 w-5 rounded-full border-2 border-white dark:border-gray-800"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                />
              </div>

              <div className="text-center md:text-left">
                <motion.h1
                  className="text-3xl font-bold text-white mb-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {user.displayName || 'User'}
                </motion.h1>

                <motion.p
                  className="text-purple-200 flex items-center justify-center md:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user.email}
                </motion.p>

                {user.bio && (
                  <motion.p
                    className="mt-3 text-white max-w-lg bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <svg className="w-4 h-4 inline-block mr-1 mb-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {user.bio}
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Modern Message Display */}
            {message.text && (
              <motion.div
                className={`mb-8 p-6 rounded-2xl border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {message.type === 'success' ? (
                      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="font-medium">{message.text}</p>
                  <button
                    type="button"
                    onClick={() => setMessage({ type: '', text: '' })}
                    className="ml-auto p-2 rounded-xl hover:bg-white/50 transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}

            {isEditing ? (
              <div>
                {/* Modern Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                    <p className="text-gray-600 dark:text-gray-300">Update your personal information and preferences</p>
                  </div>
                  {hasUnsavedChanges && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Unsaved changes
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Profile Picture Upload */}
                  <div className="bg-gray-50 rounded-3xl p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-8">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-lg">
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        {formData.profilePicture || user.profilePicture ? (
                          <img
                            src={formData.profilePicture || user.profilePicture}
                            alt={formData.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-600">
                            {formData.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <motion.button
                          type="button"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center space-x-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => document.getElementById('profile-picture-edit').click()}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Change Photo</span>
                        </motion.button>
                        <p className="text-sm text-gray-500 mt-2">Upload a new profile picture (JPG, PNG, GIF)</p>
                        <input
                          type="file"
                          id="profile-picture-edit"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setIsUploadingPhoto(true);

                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({
                                  ...formData,
                                  profilePicture: reader.result
                                });
                                setIsUploadingPhoto(false);
                              };

                              reader.onerror = () => {
                                setMessage({ type: 'error', text: 'Failed to load image. Please try again.' });
                                setIsUploadingPhoto(false);
                              };

                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-4 pl-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your display name"
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-4 pl-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email cannot be changed for security reasons</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        name="bio"
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="absolute top-4 right-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share a brief description about yourself</p>
                  </div>



                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <motion.button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 border border-gray-300 dark:border-gray-600 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Account Information Section */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-xl p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Information</h3>
                      <p className="text-gray-600 dark:text-gray-300">Your personal details and contact information</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/30 shadow-lg"
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <dt className="text-sm font-semibold text-blue-800 dark:text-blue-300">Display Name</dt>
                      </div>
                      <dd className="text-lg font-bold text-blue-900 dark:text-blue-100">{user.displayName || 'Not set'}</dd>
                    </motion.div>

                    <motion.div
                      className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800/30 shadow-lg"
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <dt className="text-sm font-semibold text-purple-800 dark:text-purple-300">Email Address</dt>
                      </div>
                      <dd className="text-lg font-bold text-purple-900 dark:text-purple-100">{user.email}</dd>
                    </motion.div>

                    <motion.div
                      className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800/30 shadow-lg md:col-span-2"
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <dt className="text-sm font-semibold text-green-800 dark:text-green-300">Bio</dt>
                      </div>
                      <dd className="text-base text-green-900 dark:text-green-100">{user.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}</dd>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Account Statistics Section */}
                <motion.div
                  variants={itemVariants}
                  className="pt-6"
                >
                  <div className="flex items-center mb-6">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Statistics</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 shadow-md border border-purple-100 dark:border-purple-800/30 relative overflow-hidden"
                      whileHover={{ y: -5, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-purple-200 dark:bg-purple-700/20 rounded-full opacity-50"></div>
                      <dt className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2 relative z-10">Images Generated</dt>
                      <dd className="text-3xl font-bold text-purple-600 dark:text-purple-400 relative z-10">
                        {isLoadingStats ? (
                          <div className="animate-pulse bg-purple-200 dark:bg-purple-700 h-8 w-12 rounded"></div>
                        ) : statsError ? (
                          <span className="text-red-500">--</span>
                        ) : (
                          statistics.imagesGenerated
                        )}
                      </dd>
                      <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-300 opacity-70">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>AI-powered creations</span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 shadow-md border border-blue-100 dark:border-blue-800/30 relative overflow-hidden"
                      whileHover={{ y: -5, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-200 dark:bg-blue-700/20 rounded-full opacity-50"></div>
                      <dt className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 relative z-10">Images Edited</dt>
                      <dd className="text-3xl font-bold text-blue-600 dark:text-blue-400 relative z-10">
                        {isLoadingStats ? (
                          <div className="animate-pulse bg-blue-200 dark:bg-blue-700 h-8 w-12 rounded"></div>
                        ) : statsError ? (
                          <span className="text-red-500">--</span>
                        ) : (
                          statistics.imagesEdited
                        )}
                      </dd>
                      <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-300 opacity-70">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Enhanced with tools</span>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-5 shadow-md border border-indigo-100 dark:border-indigo-800/30 relative overflow-hidden"
                      whileHover={{ y: -5, boxShadow: '0 12px 20px -5px rgba(0, 0, 0, 0.1)' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-200 dark:bg-indigo-700/20 rounded-full opacity-50"></div>
                      <dt className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2 relative z-10">Account Age</dt>
                      <dd className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 relative z-10">
                        {user.createdAt ? (
                          `${Math.max(1, Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)))} days`
                        ) : '0 days'}
                      </dd>
                      <div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-300 opacity-70">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Joined on {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <div className="flex justify-center mt-10">
                  <motion.button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center space-x-3 transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Profile</span>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      Update Info
                    </div>
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardContentWrapper>
  );
};

export default UserProfile;
