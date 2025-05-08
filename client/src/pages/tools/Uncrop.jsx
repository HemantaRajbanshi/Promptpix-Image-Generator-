import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CreditCheck from '../../components/CreditCheck';

const Uncrop = () => {
  const { useCredits } = useAuth();
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
      // Use 3 credits for uncropping
      const creditSuccess = await useCredits(3);

      if (!creditSuccess) {
        throw new Error('Failed to use credits. Please try again.');
      }

      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, just show a placeholder image
      setResult({
        id: Date.now().toString(),
        url: 'https://via.placeholder.com/1024x768?text=Uncropped+Image',
        originalName: file.name,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to uncrop image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Uncrop Image</h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload an image to uncrop
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md dark:bg-gray-700">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {preview && (
            <div className="mb-4">
              <p className="block text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div className="aspect-square max-w-xs mx-auto bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Uncrop Image'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Uncropped Image</h2>
          <div className="max-w-md mx-auto mb-4 bg-gray-100 rounded-md overflow-hidden">
            <img
              src={result.url}
              alt="Uncropped"
              className="w-full h-auto"
            />
          </div>
          <div className="text-sm text-gray-500">
            <p className="mb-1"><strong>Original file:</strong> {result.originalName}</p>
            <p><strong>Created:</strong> {new Date(result.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap the component with CreditCheck to ensure user has enough credits
export default function UncropWithCreditCheck() {
  return (
    <CreditCheck requiredCredits={3} toolName="Uncrop">
      <Uncrop />
    </CreditCheck>
  );
}
