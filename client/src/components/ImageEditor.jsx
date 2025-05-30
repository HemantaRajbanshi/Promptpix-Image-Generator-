import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FilterTool from './FilterTool';
import AdjustmentTool from './AdjustmentTool';
import RotateTool from './RotateTool';
import LoadingSpinner from './LoadingSpinner';
import { addGalleryItem } from '../services/local-storage/gallery';
import blobUrlManager from '../utils/blobUrlManager';
import { downloadImage } from '../utils/download';
import { useAuth } from '../context/AuthContext';

const ImageEditor = ({ imageUrl, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState('filters');
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [canvasMode, setCanvasMode] = useState('virtual');
  const [imagePreviewReady, setImagePreviewReady] = useState(false);
  const [isInitializingCanvas, setIsInitializingCanvas] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const originalImageUrl = useRef(imageUrl);
  const savedMessageTimeoutRef = useRef(null);
  const saveErrorTimeoutRef = useRef(null);
  const virtualImageRef = useRef(null);

  // Load virtual image immediately for preview
  useEffect(() => {
    if (imageUrl) {
      console.log('🖼️ Loading virtual image for preview...');
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log('✅ Virtual image loaded successfully');
        virtualImageRef.current = img;
        setImagePreviewReady(true);
        setCurrentImageUrl(imageUrl);
      };

      img.onerror = () => {
        console.error('❌ Failed to load virtual image');
        setError('Failed to load image. Please check the image format and try again.');
      };

      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Canvas initialization function
  const ensureCanvasReady = useCallback(() => {
    if (!virtualImageRef.current || !canvasRef.current || isInitializingCanvas) {
      return;
    }

    console.log('🎨 Initializing canvas for editing...');
    setIsInitializingCanvas(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = virtualImageRef.current;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setCanvasMode('real');
      console.log('✅ Canvas initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing canvas:', error);
    } finally {
      setIsInitializingCanvas(false);
    }
  }, [isInitializingCanvas]);

  // Handle image updates from tools
  const handleImageUpdate = (newImageBlob) => {
    if (!newImageBlob) return;

    console.log('🔄 Updating image from tool...');

    if (currentImageUrl && currentImageUrl !== originalImageUrl.current) {
      blobUrlManager.revoke(currentImageUrl);
    }

    const newImageUrl = blobUrlManager.create(newImageBlob);
    if (newImageUrl) {
      setCurrentImageUrl(newImageUrl);
      setCanvasMode('real');
      console.log('✅ Image updated successfully');
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      let blob;

      if (canvasMode === 'real' && canvasRef.current) {
        await new Promise((resolve) => {
          canvasRef.current.toBlob((canvasBlob) => {
            blob = canvasBlob;
            resolve();
          }, 'image/png', 0.9);
        });
      } else if (virtualImageRef.current) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = virtualImageRef.current;

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        await new Promise((resolve) => {
          tempCanvas.toBlob((canvasBlob) => {
            blob = canvasBlob;
            resolve();
          }, 'image/png', 0.9);
        });
      }

      if (blob) {
        downloadImage(blob, 'promptpix-edited-image.png');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Initialize canvas when image is ready
  useEffect(() => {
    if (imagePreviewReady && virtualImageRef.current && canvasMode === 'virtual') {
      console.log('🚀 Image ready - initializing canvas for tools...');
      setTimeout(() => {
        ensureCanvasReady();
      }, 200);
    }
  }, [imagePreviewReady, canvasMode, ensureCanvasReady]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (savedMessageTimeoutRef.current) {
        clearTimeout(savedMessageTimeoutRef.current);
      }
      if (saveErrorTimeoutRef.current) {
        clearTimeout(saveErrorTimeoutRef.current);
      }
    };
  }, []);

  // Handle save to gallery with proper blob URL management
  const handleSaveToGallery = async () => {
    if (isSaving) return;

    setIsSaving(true);
    console.log('💾 Starting save to gallery process...');

    setError(null);
    setSaveError(null);

    try {
      let blob;

      if (canvasMode === 'real' && canvasRef.current) {
        console.log('📸 Using real canvas for save');
        await new Promise((resolve) => {
          canvasRef.current.toBlob((canvasBlob) => {
            blob = canvasBlob;
            resolve();
          }, 'image/png', 0.9);
        });
      } else if (virtualImageRef.current) {
        console.log('🖼️ Converting virtual image to blob');

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = virtualImageRef.current;

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        await new Promise((resolve) => {
          tempCanvas.toBlob((canvasBlob) => {
            blob = canvasBlob;
            resolve();
          }, 'image/png', 0.9);
        });
      } else if (currentImageUrl) {
        console.log('🌐 Fetching image from URL as fallback');
        try {
          const response = await fetch(currentImageUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          blob = await response.blob();
        } catch (fetchError) {
          console.error('❌ Failed to fetch image:', fetchError);
          throw new Error('Failed to load image for saving');
        }
      }

      if (!blob) {
        throw new Error('No image data available to save');
      }

      console.log('✅ Successfully created blob for saving');

      const url = blobUrlManager.create(blob);
      if (!url) {
        throw new Error('Failed to create blob URL for gallery image');
      }

      const result = await addGalleryItem({
        imageUrl: url,
        prompt: 'Edited image',
        type: 'image-editor',
        userId: user?.id || user?._id,
        blob: blob
      });

      window.dispatchEvent(new CustomEvent('galleryUpdated'));

      console.log('✅ Successfully saved to gallery:', result);

      setError(null);
      setSaveError(null);

      setShowSavedMessage(true);

      setTimeout(() => {
        setShowSavedMessage(false);
        console.log('🚀 Redirecting to gallery...');

        onClose();

        setTimeout(() => {
          navigate('/dashboard/gallery');
        }, 300);
      }, 1500);

      console.log('✅ Save operation completed successfully');

    } catch (error) {
      console.error('❌ Error saving to gallery:', error);
      setSaveError(`Failed to save image: ${error.message}`);

      saveErrorTimeoutRef.current = setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (currentImageUrl && currentImageUrl !== originalImageUrl.current) {
        blobUrlManager.revoke(currentImageUrl);
      }
    };
  }, [currentImageUrl]);

  // Only show full-screen error for critical errors
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Image</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
            >
              Close Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/90 via-violet-900/20 to-purple-900/30 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-violet-500/30 w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(139,92,246,0.1) 50%, rgba(168,85,247,0.1) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-violet-500/20 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z" />
              </svg>
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent">
                Image Editor
              </h2>
              <p className="text-white/70 text-sm font-medium">Edit and enhance your images with professional tools</p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-3 hover:bg-white/10 dark:hover:bg-violet-500/20 rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6 text-white/80 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tools */}
          <div className="w-96 bg-white/5 dark:bg-black/10 backdrop-blur-xl border-r border-white/10 dark:border-violet-500/20 flex flex-col">
            {/* Tab Navigation */}
            <div className="p-6 border-b border-white/10 dark:border-violet-500/20">
              <div className="flex space-x-1 bg-white/10 dark:bg-black/20 rounded-2xl p-1.5 backdrop-blur-sm border border-white/10">
                {[
                  { id: 'filters', label: 'Filters', icon: '🎨' },
                  { id: 'adjustments', label: 'Adjust', icon: '⚙️' },
                  { id: 'rotate', label: 'Rotate', icon: '🔄' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl border border-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-violet-500/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tool Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'filters' && (
                <FilterTool
                  imageUrl={currentImageUrl}
                  onSave={handleImageUpdate}
                  canvasRef={canvasRef}
                />
              )}
              {activeTab === 'adjustments' && (
                <AdjustmentTool
                  imageUrl={currentImageUrl}
                  onSave={handleImageUpdate}
                  canvasRef={canvasRef}
                />
              )}
              {activeTab === 'rotate' && (
                <RotateTool
                  imageUrl={currentImageUrl}
                  onSave={handleImageUpdate}
                  canvasRef={canvasRef}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Image Preview */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Canvas Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-purple-900/30 to-indigo-900/20 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-purple-500/10" />

            {/* Preview Area */}
            <div className="relative flex-1 flex items-center justify-center p-8">
              {imagePreviewReady ? (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Canvas Container with Enhanced Styling */}
                  <div
                    className="relative bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 dark:border-violet-500/30 shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(168,85,247,0.15) 100%)',
                      backdropFilter: 'blur(25px)',
                      boxShadow: '0 30px 60px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)'
                    }}
                  >
                    {/* Inner Canvas Frame */}
                    <div className="relative bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-4 border border-white/10">
                      {/* Virtual Image Preview */}
                      {canvasMode === 'virtual' && virtualImageRef.current && (
                        <motion.img
                          src={currentImageUrl}
                          alt="Image preview"
                          className="max-w-full max-h-full object-contain rounded-2xl shadow-xl"
                          style={{
                            maxHeight: 'calc(100vh - 400px)',
                            maxWidth: 'calc(100vw - 500px)',
                            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
                          }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Real Canvas */}
                      <motion.canvas
                        ref={canvasRef}
                        className={`max-w-full max-h-full object-contain rounded-2xl shadow-xl ${
                          canvasMode === 'real' ? 'block' : 'hidden'
                        }`}
                        style={{
                          maxHeight: 'calc(100vh - 400px)',
                          maxWidth: 'calc(100vw - 500px)',
                          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Canvas Overlay Effects */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/5 via-transparent to-white/5 pointer-events-none" />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/30 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/30 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/30 rounded-br-lg" />
                  </div>

                  {/* Floating Canvas Info */}
                  <motion.div
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20 shadow-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 10px 25px rgba(139, 92, 246, 0.15)'
                    }}
                  >
                    <div className="flex items-center space-x-2 text-white/80 text-sm font-medium">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Ready for editing</span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center space-y-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Enhanced Loading Animation */}
                  <div className="relative">
                    {/* Outer Ring */}
                    <div className="w-32 h-32 rounded-full border-4 border-white/10 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 border-r-purple-500 animate-spin" />
                    </div>

                    {/* Inner Ring */}
                    <div className="absolute inset-4 w-24 h-24 rounded-full border-4 border-white/5 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-b-indigo-500 border-l-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                    </div>

                    {/* Center Pulse */}
                    <div className="absolute inset-8 w-16 h-16 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full animate-pulse" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-violet-400/60 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 0'
                          }}
                          animate={{
                            rotate: [0, 360],
                            scale: [0.5, 1, 0.5],
                            opacity: [0.3, 1, 0.3]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Loading Text */}
                  <motion.div
                    className="text-center bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl px-8 py-6 border border-white/20 shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent mb-3">
                      Loading Image
                    </h3>
                    <p className="text-white/70 text-sm font-medium mb-2">Preparing your image for editing</p>
                    <div className="flex items-center justify-center space-x-2 text-violet-300 text-xs">
                      <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              className="relative p-6 border-t border-white/10 dark:border-violet-500/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(139,92,246,0.08) 50%, rgba(168,85,247,0.08) 100%)',
                backdropFilter: 'blur(25px)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-indigo-500/5 rounded-b-3xl" />

              <div className="relative flex space-x-4">
                {/* Download Button */}
                <motion.button
                  onClick={handleDownload}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white py-4 rounded-2xl font-semibold shadow-xl border border-white/20 transition-all duration-300 flex items-center justify-center space-x-3 group"
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 15px 35px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="font-semibold relative z-10">Download</span>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                </motion.button>

                {/* Save to Gallery Button */}
                <motion.button
                  onClick={handleSaveToGallery}
                  disabled={isSaving}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold shadow-xl border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
                  whileHover={{ scale: isSaving ? 1 : 1.02, y: isSaving ? 0 : -3 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 15px 35px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {isSaving ? (
                    <>
                      <LoadingSpinner size="h-5 w-5" color="text-white" />
                      <span className="font-semibold relative z-10">Saving to Gallery...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold relative z-10">Save to Gallery</span>

                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full opacity-60" />
            </motion.div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSavedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-8 left-1/2 transform -translate-x-1/2 z-60 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-semibold border border-white/20 backdrop-blur-xl"
              style={{
                boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Image saved to gallery successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Error Toast */}
        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-8 left-1/2 transform -translate-x-1/2 z-60 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-semibold max-w-md text-center border border-white/20 backdrop-blur-xl"
              style={{
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span>{saveError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ImageEditor;