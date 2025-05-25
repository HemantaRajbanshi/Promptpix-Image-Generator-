import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const HeroSection = () => {
  // Get authentication state
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef(null);

  // Background images for the collage
  const backgroundImages = [
    '/images/ai-image-1.jpg',
    '/images/ai-image-2.jpg',
    '/images/ai-image-3.jpg',
    '/images/ai-image-4.jpg',
    '/images/ai-image-5.jpg',
    '/images/ai-image-6.jpg',
    '/images/ai-image-7.jpg',
    '/images/ai-image-8.jpg',
    '/images/ai-image-9.jpg',
    '/images/ai-image-10.jpg',
    '/images/ai-image-11.jpg',
    '/images/ai-image-12.jpg',
  ];

  // Trending prompts
  const trendingPrompts = [
    'summer beach',
    'Studio Ghibli-style',
    'human arts',
  ];

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      // Navigate to text-to-image page with the prompt
      navigate(`/dashboard/text-to-image?prompt=${encodeURIComponent(prompt)}`);
    } else {
      // Focus on the input if empty
      inputRef.current?.focus();
    }
  };

  const handleTrendingClick = (trendingPrompt) => {
    setPrompt(trendingPrompt);
    inputRef.current?.focus();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative bg-black overflow-hidden min-h-[100vh] flex items-center">
      {/* Image collage background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1 h-full">
          {backgroundImages.map((image, i) => (
            <div key={i} className="relative overflow-hidden">
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{
                  backgroundImage: `url(${image})`,
                  filter: 'brightness(0.8)',
                }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 w-full">
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full max-w-4xl"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
              <span className="block">Find your inspiration in a sea of</span>
              <span className="block">creativity</span>
            </h1>
            <motion.p
              className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10"
              variants={itemVariants}
            >
              Explore unlimited inspiration alongside other PromptPix users. Let creativity be inspired by shared excitement and
              collaborative genius.
            </motion.p>

            {/* Get Inspired button */}
            <div className="mt-8 mb-12">
              <Link
                to="/dashboard/text-to-image"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Inspired
              </Link>
            </div>

            {/* Creative Suite Section */}
            <motion.div
              className="mt-32 pt-16"
              variants={itemVariants}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Dreamina, the all-in-one AI creative<br />suite for all your artistic work
              </h2>
              <div className="mt-6">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
