import { useState, useEffect } from 'react';
import { generateImage } from '../../services/clipdrop';
import { downloadImage } from '../../utils/download';
import { addGalleryItem } from '../../services/local-storage/gallery';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CreditCheck from '../../components/CreditCheck';
import PortraitPromptAssistant from '../../components/PortraitPromptAssistant';
import { useLocation } from 'react-router-dom';
import DashboardContentWrapper from '../../components/DashboardContentWrapper';

const TextToImage = () => {
  const { useCredits, refreshCredits, user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  // Use the ClipDrop API's fixed resolution of 1024x1024
  const API_RESOLUTION = '1024x1024';
  const location = useLocation();

  // Check for prompt in URL params when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const promptParam = queryParams.get('prompt');
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [location]);

  // Handle prompt from the assistant
  const handlePromptFromAssistant = ({ prompt: assistantPrompt }) => {
    setPrompt(assistantPrompt);
    setShowPromptAssistant(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate prompt
    if (!prompt || !prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use 2 credits for text-to-image generation
      const creditSuccess = await useCredits(2);

      if (!creditSuccess) {
        throw new Error('Failed to use credits. Please try again.');
      }

      // Parse API's fixed resolution into width and height
      const [width, height] = API_RESOLUTION.split('x').map(Number);

      // Call the ClipDrop API to generate an image at high resolution
      const imageBlob = await generateImage(prompt, {
        width,
        height
      });

      // Create a URL for the blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // Store the blob in the gallery item for better download reliability
      // Also store a reference to the blob in sessionStorage as backup
      sessionStorage.setItem('lastGeneratedImageType', imageBlob.type);
      sessionStorage.setItem('lastGeneratedImageId', Date.now().toString());

      // Create result object with the actual blob for reliable downloading
      const newResult = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        resolution: `${width}x${height}`,
        createdAt: new Date().toISOString(),
        blobType: imageBlob.type,
        blob: imageBlob // Store the actual blob for direct access
      };

      // Save to gallery with user ID
      addGalleryItem({
        imageUrl: imageUrl,
        prompt: prompt,
        resolution: `${width}x${height}`,
        type: 'text-to-image',
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
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Network error: The server might not be running or the API key might not be configured. Try refreshing the page or check server logs.');
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('Authentication error: The API key may be invalid or expired. Please check your API configuration.');
      } else if (err.message.includes('429')) {
        setError('Rate limit exceeded: Too many requests to the API. Please try again later.');
      } else if (err.message.includes('Failed to use credits')) {
        setError('Insufficient credits: You need more credits to generate images.');
      } else {
        setError('Failed to generate image. Please try again.');
      }

      console.error('Image generation error:', err);
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
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Text to Image
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Transform your ideas into stunning visuals with AI</p>
            </div>
          </div>
        </motion.div>

        {showPromptAssistant ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          >
            <PortraitPromptAssistant onPromptGenerated={handlePromptFromAssistant} />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Vision</h2>
                    <p className="text-gray-600 dark:text-gray-400">Describe what you want to see</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Image Description
                      </label>
                      <motion.button
                        type="button"
                        onClick={() => setShowPromptAssistant(true)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 hover:from-purple-200 hover:to-indigo-200 dark:hover:from-purple-800/40 dark:hover:to-indigo-800/40 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Portrait Assistant
                      </motion.button>
                    </div>

                    <div className="relative">
                      <textarea
                        id="prompt"
                        rows={6}
                        className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                        placeholder="An elegant woman with soft flowing hair, shot on 85mm telephoto lens with f/1.4 aperture, golden hour lighting, professional portrait photography..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
                        {prompt.length}/500
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">High-Quality Output</h4>
                        <p className="text-blue-700 dark:text-blue-300 text-xs">
                          All images are generated at 1024×1024 resolution in high-quality PNG format (700KB-1.5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    whileHover={{ scale: loading || !prompt.trim() ? 1 : 1.02 }}
                    whileTap={{ scale: loading || !prompt.trim() ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Creating Magic...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Generate Image</span>
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
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden"
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
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Creation</h2>
                      <p className="text-gray-600 dark:text-gray-400">Ready to download</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden shadow-inner">
                        <img
                          src={result.url}
                          alt={result.prompt}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Prompt</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{result.prompt}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">Format:</span>
                          <p className="text-gray-900 dark:text-white">1024×1024 PNG</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                          <p className="text-gray-900 dark:text-white">{new Date(result.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => {
                        try {
                          if (result.blob) {
                            downloadImage(result.blob, `promptpix-${Date.now()}.png`);
                          } else {
                            downloadImage(result.url, `promptpix-${Date.now()}.png`);
                          }
                        } catch (error) {
                          console.error('Error in download handler:', error);
                          alert('Failed to download image. Please try again.');
                        }
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download High-Quality Image</span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Create</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                      Enter your prompt and watch as AI transforms your words into stunning visual art
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

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
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Generation Failed</h3>
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
export default function TextToImageWithCreditCheck() {
  return (
    <CreditCheck requiredCredits={2} toolName="Text to Image">
      <TextToImage />
    </CreditCheck>
  );
}
