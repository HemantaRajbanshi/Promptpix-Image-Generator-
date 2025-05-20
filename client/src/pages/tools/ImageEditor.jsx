import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernImageEditor from '../../components/ModernImageEditor';
import { downloadImage } from '../../utils/download';
import { addGalleryItem } from '../../services/local-storage/gallery';

const ImageEditorTool = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef(null);

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
    setUploadedImage(imageBlob);
    setEditedImage(imageBlob); // Initially, edited image is the same as uploaded
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

  // Handle save from editor
  const handleSaveEdit = (editedBlob) => {
    setEditedImage(editedBlob);
    setSuccessMessage('Image edited successfully!');

    // Save to gallery
    const imageUrl = URL.createObjectURL(editedBlob);
    addGalleryItem({
      imageUrl: imageUrl,
      prompt: 'Edited image',
      type: 'image-editor',
      blob: editedBlob
    });

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

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
    setUploadedImage(null);
    setEditedImage(null);
    setIsEditing(false);
    setErrorMessage('');
    setSuccessMessage('');

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Image Editor</h2>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              className="bg-red-50 text-red-500 p-4 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {!uploadedImage ? (
          /* Upload Area */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
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
            <svg
              className={`w-16 h-16 mx-auto mb-4 ${
                isDragging ? 'text-purple-500' : 'text-gray-400 dark:text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload an Image
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Drag and drop an image here, or click to select a file
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supports: JPEG, PNG, WebP, GIF (Max size: 10MB)
            </p>
          </div>
        ) : (
          /* Editor Area */
          <div className="editor-container">
            {!isEditing ? (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Edit Your Image
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Image
                  </motion.button>
                  <motion.button
                    onClick={handleReset}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upload New Image
                  </motion.button>
                  <motion.button
                    onClick={handleDownload}
                    className="px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </motion.button>
                </div>
              </div>
            ) : (
              <ModernImageEditor
                imageUrl={URL.createObjectURL(uploadedImage)}
                onSave={handleSaveEdit}
                onClose={() => setIsEditing(false)}
              />
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImageEditorTool;
