import { motion } from 'framer-motion';
import MasonryGallery from '../components/MasonryGallery';

const Gallery = () => {
  return (
    <div className="w-full px-6">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-2">
          <div className="bg-gradient-to-r from-purple-400 to-indigo-500 p-2 rounded-lg mr-3 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Gallery
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-12">
          View and manage your generated images
        </p>
      </motion.div>

      <MasonryGallery />
    </div>
  );
};

export default Gallery;
