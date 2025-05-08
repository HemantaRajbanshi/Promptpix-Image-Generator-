import { useState } from 'react';
import { generateImage, downloadImage } from '../../services/clipdrop';
import { addGalleryItem } from '../../services/local-storage/gallery';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CreditCheck from '../../components/CreditCheck';

const TextToImage = () => {
  const { useCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use 2 credits for text-to-image generation
      const creditSuccess = await useCredits(2);

      if (!creditSuccess) {
        throw new Error('Failed to use credits. Please try again.');
      }

      // Call the ClipDrop API to generate an image
      const imageBlob = await generateImage(prompt);

      // Create a URL for the blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // Create result object
      const newResult = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        createdAt: new Date().toISOString()
      };

      // Save to gallery
      addGalleryItem({
        imageUrl: imageUrl,
        prompt: prompt,
        type: 'text-to-image',
        blob: imageBlob
      });

      // Update state
      setResult(newResult);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Text to Image</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe the image you want to create
            </label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="A beautiful sunset over mountains with a lake reflection..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
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
            <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex justify-center">
            <motion.button
              onClick={() => {
                fetch(result.url)
                  .then(response => response.blob())
                  .then(blob => {
                    downloadImage(blob, `promptpix-${Date.now()}.png`);
                  });
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
