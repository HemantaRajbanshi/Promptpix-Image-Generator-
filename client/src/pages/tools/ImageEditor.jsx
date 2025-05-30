import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageEditor from '../../components/ImageEditor';
import { downloadImage } from '../../utils/download';
import DashboardContentWrapper from '../../components/DashboardContentWrapper';

const ImageEditorTool = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [editedImageUrl, setEditedImageUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (editedImageUrl) {
        URL.revokeObjectURL(editedImageUrl);
      }
    };
  }, [editedImageUrl]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  // Handle image file processing
  const handleImageFile = (file) => {
    if (!file) return;

    // Reset states
    setErrorMessage('');
    setSuccessMessage('');

    // Clean up previous blob URL
    if (editedImageUrl) {
      URL.revokeObjectURL(editedImageUrl);
    }

    // Check if file is an image
    if (!file.type.match('image.*')) {
      setErrorMessage('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 10MB');
      return;
    }

    // Create blob URL for the image
    const imageBlob = new Blob([file], { type: file.type });
    const imageUrl = URL.createObjectURL(imageBlob);

    setUploadedImage(imageBlob);
    setEditedImage(imageBlob); // Initially, edited image is the same as uploaded
    setEditedImageUrl(imageUrl);
    setIsEditing(false); // Don't start editing automatically

    setSuccessMessage('Image uploaded successfully! Click "Edit Image" to start editing.');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Note: Save handling is now done entirely in the modal ImageEditor component
  // This prevents double saving and error conflicts

  // Handle download
  const handleDownload = () => {
    if (editedImage) {
      // Download high-quality PNG
      downloadImage(editedImage, `promptpix-edited-${Date.now()}.png`);
      setSuccessMessage('Image downloaded successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };

  // Reset everything
  const handleReset = () => {
    // Clean up blob URL
    if (editedImageUrl) {
      URL.revokeObjectURL(editedImageUrl);
    }

    setUploadedImage(null);
    setEditedImage(null);
    setEditedImageUrl(null);
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardContentWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Image Editor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Professional image editing tools at your fingertips</p>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Upload Error</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-3xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Success</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!uploadedImage ? (
          /* Upload Area */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Image</h2>
                  <p className="text-gray-600 dark:text-gray-400">Select an image to edit</p>
                </div>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDragging
                      ? 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 scale-110'
                      : 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30'
                  }`}>
                    <svg
                      className={`w-10 h-10 transition-all duration-300 ${
                        isDragging ? 'text-violet-600 dark:text-violet-400 scale-110' : 'text-violet-600 dark:text-violet-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isDragging ? 'Drop your image here' : 'Upload an Image'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag and drop an image here, or click to select a file
                    </p>

                    <motion.button
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Choose File
                    </motion.button>
                  </div>

                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/30 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-violet-900 dark:text-violet-100 text-sm mb-1">Supported Formats</h4>
                        <p className="text-violet-700 dark:text-violet-300 text-xs">
                          JPEG, PNG, WebP, GIF • Maximum size: 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Editor Area */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          >
            {!isEditing ? (
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image Ready</h2>
                      <p className="text-gray-600 dark:text-gray-400">Choose your editing action</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner">
                      <img
                        src={editedImageUrl}
                        alt="Uploaded"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 min-w-[200px] bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit Image</span>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={handleDownload}
                      className="flex-1 min-w-[200px] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download Image</span>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={handleReset}
                      className="px-6 py-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl font-medium transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Upload New Image
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>

      {/* Full-screen Image Editor Overlay */}
      {isEditing && editedImageUrl && (
        <ImageEditor
          imageUrl={editedImageUrl}
          onClose={() => setIsEditing(false)}
        />
      )}
    </DashboardContentWrapper>
  );
};

export default ImageEditorTool;
