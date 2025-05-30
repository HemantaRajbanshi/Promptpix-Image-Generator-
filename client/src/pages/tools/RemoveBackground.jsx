import { useState } from 'react';
import { removeBackground } from '../../services/clipdrop';
import { downloadImage } from '../../utils/download';
import { addGalleryItem } from '../../services/local-storage/gallery';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CreditCheck from '../../components/CreditCheck';
import DashboardContentWrapper from '../../components/DashboardContentWrapper';

const RemoveBackground = () => {
  const { useCredits, refreshCredits, user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      setFile(null);
      setPreview(null);
      return;
    }

    setError('');
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Use 2 credits for background removal
      const creditSuccess = await useCredits(2);

      if (!creditSuccess) {
        throw new Error('Failed to use credits. Please try again.');
      }

      // Call the ClipDrop API to remove background
      const imageBlob = await removeBackground(file);

      // Create a URL for the blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // Create result object
      const newResult = {
        id: Date.now().toString(),
        url: imageUrl,
        originalName: file.name,
        createdAt: new Date().toISOString()
      };

      // Save to gallery with user ID
      addGalleryItem({
        imageUrl: imageUrl,
        prompt: `Background removed from ${file.name}`,
        type: 'remove-bg',
        userId: user?.id || user?._id, // Associate with current user
        blob: imageBlob
      });

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('galleryUpdated'));

      // Update state
      setResult(newResult);

      // Refresh credits to ensure UI shows updated balance
      setTimeout(() => {
        refreshCredits();
      }, 500);
    } catch (err) {
      setError('Failed to remove background. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
            <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Remove Background
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Instantly remove backgrounds with AI precision</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Image</h2>
                  <p className="text-gray-600 dark:text-gray-400">Select an image to process</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Choose Image File
                  </label>

                  <div className="relative">
                    <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-all duration-300">
                      <div className="space-y-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-xl font-medium hover:from-pink-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105"
                          >
                            <span>Choose file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-3 self-center">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {preview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white">Preview</h4>
                    <div className="relative group">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800/30 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-pink-600 dark:text-pink-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-pink-900 dark:text-pink-100 text-sm mb-1">AI Background Removal</h4>
                      <p className="text-pink-700 dark:text-pink-300 text-xs">
                        Uses 2 credits • Precise edge detection • Transparent PNG output
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 rounded-2xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  whileHover={{ scale: loading || !file ? 1 : 1.02 }}
                  whileTap={{ scale: loading || !file ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Removing Background...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Remove Background</span>
                    </div>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          >
            {result ? (
              <div className="p-8 md:p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Background Removed</h2>
                    <p className="text-gray-600 dark:text-gray-400">Ready to download</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="aspect-square bg-checkered rounded-2xl overflow-hidden shadow-inner">
                      <img
                        src={result.url}
                        alt="No Background"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Original File</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{result.originalName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Format:</span>
                        <p className="text-gray-900 dark:text-white">Transparent PNG</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                        <p className="text-gray-900 dark:text-white">{new Date(result.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => {
                      fetch(result.url)
                        .then(response => response.blob())
                        .then(blob => {
                          downloadImage(blob, `promptpix-nobg-${Date.now()}.png`);
                        });
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Transparent Image</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-10 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Process</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    Upload an image and watch as AI precisely removes the background
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Background Removal Failed</h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardContentWrapper>
  );
};

// Wrap the component with CreditCheck to ensure user has enough credits
export default function RemoveBackgroundWithCreditCheck() {
  return (
    <CreditCheck requiredCredits={2} toolName="Remove Background">
      <RemoveBackground />
    </CreditCheck>
  );
}
