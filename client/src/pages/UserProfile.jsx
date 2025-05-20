import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getGalleryItems, addGalleryItem } from '../services/local-storage/gallery';
import { debounce } from '../utils/debounce';

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Track original user data for differential updates
  const originalUserRef = useRef(null);
  // Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Track pending updates to batch them
  const pendingUpdatesRef = useRef({});

  // Calculate user statistics from gallery items
  const calculateUserStats = () => {
    if (!user) return;

    try {
      // Get all gallery items
      const galleryItems = getGalleryItems();
      console.log('Gallery items:', galleryItems);

      // Count images by type
      const generatedCount = galleryItems.filter(item =>
        item.type === 'text-to-image' ||
        item.type === 'upscale' ||
        item.type === 'remove-bg' ||
        item.type === 'uncrop'
      ).length;

      const editedCount = galleryItems.filter(item =>
        item.type === 'image-editor'
      ).length;

      console.log('Current user stats:', {
        current: {
          imagesGenerated: user.imagesGenerated,
          imagesEdited: user.imagesEdited
        },
        calculated: {
          imagesGenerated: generatedCount,
          imagesEdited: editedCount
        }
      });

      // Update user with statistics
      if (user.imagesGenerated !== generatedCount || user.imagesEdited !== editedCount) {
        console.log('Stats need updating');

        // Create a copy of the user object with updated statistics
        const updatedUser = {
          ...user,
          imagesGenerated: generatedCount,
          imagesEdited: editedCount
        };

        // Update the user in the database
        console.log('Calling updateUser with:', {
          imagesGenerated: generatedCount,
          imagesEdited: editedCount
        });

        updateUser(updatedUser);

        // Log the update for debugging
        console.log('Updated user statistics:', {
          imagesGenerated: generatedCount,
          imagesEdited: editedCount
        });
      } else {
        console.log('Stats already up to date');
      }
    } catch (error) {
      console.error('Error calculating user statistics:', error);
    }
  };

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
        profilePicture: user.profilePicture || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Reset unsaved changes state and pending updates
      setHasUnsavedChanges(false);
      pendingUpdatesRef.current = {};

      // Calculate statistics
      calculateUserStats();
    } else {
      // Check if there's a token but no user data
      const token = localStorage.getItem('token');
      if (token) {
        // Force a page reload after a short delay to try to fetch user data again
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Recalculate statistics when the component mounts
  useEffect(() => {
    if (user) {
      // Add some test gallery items if none exist
      const galleryItems = getGalleryItems();
      if (galleryItems.length === 0) {

        // Add test items
        const testItems = [
          {
            type: 'text-to-image',
            prompt: 'Test generated image 1',
            imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          },
          {
            type: 'text-to-image',
            prompt: 'Test generated image 2',
            imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          },
          {
            type: 'image-editor',
            prompt: 'Test edited image',
            imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          }
        ];

        // Add each test item to the gallery
        testItems.forEach(async (item) => {
          await addGalleryItem(item);
        });

        console.log('Added test gallery items');
      }

      // Calculate statistics
      calculateUserStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Clear password fields
      setFormData(prevData => ({
        ...prevData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
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
                  // Force refresh user data
                  window.location.reload();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  // Clear token and redirect to login
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out & Login Again
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
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
    <div className="bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile header card */}
        <motion.div
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          {/* Background pattern - toned down */}
          <div className="relative bg-gradient-to-r from-purple-700/80 to-indigo-700/80 px-6 py-12 overflow-hidden">
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

          <div className="p-6">
            {message.text && (
              <motion.div
                className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {message.text}
              </motion.div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Profile</h2>
                    {hasUnsavedChanges && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                          <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
                            {formData.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>

                      <div>
                        <motion.button
                          type="button"
                          className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => document.getElementById('profile-picture-edit').click()}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Change Photo
                        </motion.button>
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

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        disabled
                        className="py-3 px-4 block w-full shadow-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        name="bio"
                        id="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="py-3 px-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="py-3 px-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <div className="mt-1">
                          <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="py-3 px-4 block w-full shadow-sm focus:ring-purple-500 focus:border-purple-500 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <motion.button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="py-3 px-6 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </motion.button>
                    </motion.div>

                    <motion.div
                      className="relative overflow-hidden rounded-xl"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-80 blur-lg transform scale-110"></div>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Account Information Section */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Account Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700"
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</dt>
                      </div>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">{user.displayName || 'Not set'}</dd>
                    </motion.div>

                    <motion.div
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700"
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                      </div>
                      <dd className="text-base font-medium text-gray-900 dark:text-white">{user.email}</dd>
                    </motion.div>

                    <motion.div
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 md:col-span-2"
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</dt>
                      </div>
                      <dd className="text-base text-gray-900 dark:text-white">{user.bio || 'No bio provided'}</dd>
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Account Statistics</h3>
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
                        {user.imagesGenerated || 0}
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
                        {user.imagesEdited || 0}
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

                <div className="flex justify-end mt-8">
                  <motion.div
                    className="relative overflow-hidden rounded-xl"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-80 blur-lg transform scale-110"></div>
                    <motion.button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="relative py-3 px-6 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Profile
                      <span className="ml-1 text-xs opacity-80">(to change photo & details)</span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
