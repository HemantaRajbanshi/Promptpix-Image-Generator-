import { useState, useEffect } from 'react';
import { generateImage } from '../../services/clipdrop';
import { downloadImage } from '../../utils/download';
import { addGalleryItem } from '../../services/local-storage/gallery';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CreditCheck from '../../components/CreditCheck';
import PortraitPromptAssistant from '../../components/PortraitPromptAssistant';
import { useLocation } from 'react-router-dom';

const TextToImage = () => {
  const { useCredits } = useAuth();
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

      // Save to gallery
      addGalleryItem({
        imageUrl: imageUrl,
        prompt: prompt,
        resolution: `${width}x${height}`,
        type: 'text-to-image',
        blob: imageBlob
      });

      // Update state
      setResult(newResult);
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

  // No development mode indicators needed

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Text to Image
      </h1>

      {showPromptAssistant ? (
        <PortraitPromptAssistant onPromptGenerated={handlePromptFromAssistant} />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Describe the image you want to create
                </label>
                <motion.button
                  type="button"
                  onClick={() => setShowPromptAssistant(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Use Portrait Assistant
                </motion.button>
              </div>
              <textarea
                id="prompt"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="An elegant woman with soft flowing hair, shot on 85mm telephoto lens with f/1.4 aperture, golden hour lighting..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>



            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All images are generated at 1024×1024 resolution in high-quality PNG format (typical file size: 700KB-1.5MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generated Image</h2>
          <div className="aspect-square max-w-md mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
            <img
              src={result.url}
              alt={result.prompt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <p className="mb-1"><strong>Prompt:</strong> {result.prompt}</p>
            <p className="mb-1"><strong>Format:</strong> 1024×1024 PNG (high-quality, lossless)</p>
            <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex justify-center">
            <motion.button
              onClick={() => {
                try {
                  // Use the blob directly if available, otherwise use the URL
                  // Our enhanced downloadImage function can handle both
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
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Image
            </motion.button>
          </div>
        </div>
      )}
    </div>
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
