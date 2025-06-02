import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Import Material Design 3 components
import Button from '../components/md3/Button';
import Card from '../components/md3/Card';
import Section from '../components/md3/Section';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.2, 0.0, 0, 1.0] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
      ease: [0.2, 0.0, 0, 1.0]
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.05, 0.7, 0.1, 1.0]
    }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.2, 0.0, 0, 1.0]
    }
  }
};

// Helper function to get display name for image types
const getTypeDisplayName = (type) => {
  const typeMap = {
    'text-to-image': 'AI Generated Image',
    'upscale': 'Enhanced Image',
    'uncrop': 'Expanded Image',
    'remove-bg': 'Background Removed',
    'image-editor': 'Edited Image'
  };
  return typeMap[type] || 'Image';
};

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const LandingPage = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // Refs for scroll animations
  const heroRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  // Scroll animation for the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  // This useEffect was moved to the InspiringCreativeHub component

  // Scroll indicator animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollIndicatorRef.current) {
        if (window.scrollY > 100) {
          scrollIndicatorRef.current.style.opacity = '0';
        } else {
          scrollIndicatorRef.current.style.opacity = '1';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      quote: "PromptPix has completely transformed how I create visuals for my projects. The quality is incredible!",
      author: "Sarah J.",
      role: "Graphic Designer",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzY3NTBBNCIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+UzwvdGV4dD48L3N2Zz4="
    },
    {
      quote: "I've tried many AI image tools, but PromptPix stands out with its intuitive interface and amazing results.",
      author: "Michael T.",
      role: "Content Creator",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzYyNUI3MSIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+TTwvdGV4dD48L3N2Zz4="
    },
    {
      quote: "As someone with no design skills, PromptPix has been a game-changer for my marketing materials.",
      author: "Elena R.",
      role: "Small Business Owner",
      avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzdENTI2MCIvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRkZGRiI+RTwvdGV4dD48L3N2Zz4="
    }
  ];

  // Inspiring Creative Hub for Authenticated Users
  const InspiringCreativeHub = () => {
    const [userStats, setUserStats] = useState({
      totalImages: 0,
      imagesGenerated: 0,
      imagesEdited: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [copiedPrompt, setCopiedPrompt] = useState(null);

    // Copy prompt to clipboard
    const copyPromptToClipboard = async (promptText, index) => {
      try {
        await navigator.clipboard.writeText(promptText);
        setCopiedPrompt(index);

        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopiedPrompt(null);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy prompt:', err);
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = promptText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopiedPrompt(index);
          setTimeout(() => {
            setCopiedPrompt(null);
          }, 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
        }
      }
    };

    // Initialize with empty data - real data would come from API calls
    useEffect(() => {
      if (user) {
        // For now, we'll use empty arrays since the actual data loading
        // functions don't exist yet. In a real implementation, these would
        // be API calls to fetch user's gallery items and statistics.
        setRecentActivity([]);
        setUserStats({
          totalImages: 0,
          imagesGenerated: 0,
          imagesEdited: 0
        });
      }
    }, [user]);

    return (
    <Section
      id="creative-hub"
      background="surface-container-low"
      fullHeight={true}
      className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.0, 0, 1.0] }}
      >
        {/* Inspiring Welcome Header - Repositioned Lower */}
        <div className="text-center mb-20 mt-8 sm:mt-12 lg:mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="display-large text-gray-900 dark:text-white mb-6 font-bold leading-tight">
              Your Creative Journey
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Continues Here
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="headline-small text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.displayName || user?.name || 'Creator'}</span>!
            Let's turn your imagination into stunning reality.
          </motion.p>

        </div>

        {/* Creative Insights and Inspiration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Your Creative Impact */}
          <motion.div
            variants={slideUp}
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card variant="elevated" className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-100/50 dark:border-purple-800/50">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="title-large text-on-surface font-bold">Your Creative Impact</h3>
                </div>

                {/* Real User Stats Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <motion.div
                    className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border border-purple-100/50 dark:border-purple-700/50"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {user?.credits || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Creative Credits</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Ready to create</div>
                  </motion.div>

                  <motion.div
                    className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100/50 dark:border-blue-700/50"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {userStats.totalImages}
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Images Created</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Your gallery</div>
                  </motion.div>
                </div>



                {/* Recent Activity */}
                <div>
                  <h4 className="title-medium text-on-surface mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Activity
                  </h4>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          className="flex items-center p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                            {activity.type === 'text-to-image' && (
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            )}
                            {activity.type === 'upscale' && (
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                            )}
                            {activity.type === 'uncrop' && (
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                              </svg>
                            )}
                            {activity.type === 'remove-bg' && (
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                            {activity.type === 'image-editor' && (
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{activity.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No recent activity</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Start creating to see your activity here</p>
                      <Button
                        variant="filled"
                        size="medium"
                        to="/dashboard/text-to-image"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Create Your First Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Creative Inspiration Hub */}
          <motion.div
            variants={slideUp}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card variant="elevated" className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-100/50 dark:border-purple-800/50">
              <div className="p-6">
                {/* Header */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Creative Inspiration
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Trending prompts and creative tips
                  </p>
                </motion.div>

                {/* Trending Prompts */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    Trending Now
                  </h4>
                  <div className="space-y-3">
                    {[
                      { text: "Ethereal forest with glowing mushrooms", category: "Fantasy" },
                      { text: "Minimalist geometric architecture", category: "Design" },
                      { text: "Vintage film photography aesthetic", category: "Style" }
                    ].map((prompt, index) => (
                      <motion.div
                        key={index}
                        className="p-3 bg-gradient-to-r from-gray-50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/20 rounded-lg border border-gray-100/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 1.6 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 2 }}
                        onClick={() => copyPromptToClipboard(prompt.text, index)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                              {prompt.text}
                            </p>
                            <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                              {prompt.category}
                            </span>
                          </div>
                          {copiedPrompt === index ? (
                            <svg className="w-4 h-4 text-green-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Quick Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 }}
                >
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Pro Tips
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Use specific adjectives for better results",
                      "Try different aspect ratios for variety",
                      "Combine multiple art styles creatively"
                    ].map((tip, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 2.0 + index * 0.1 }}
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Quick Access Footer */}
                <motion.div
                  className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.2 }}
                >
                  <div className="flex items-center justify-between">
                    <Button
                      variant="text"
                      size="small"
                      to="/dashboard/text-to-image"
                      className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-sm font-medium"
                    >
                      Start Creating
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      to="/dashboard"
                      className="text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      View Tools
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Section>
    );
  };

  // Sample AI-generated images for carousel
  const sampleImages = [
    {
      url: "/images/testimonials/Ethereal forest with glowing mushrooms.png",
      prompt: "Ethereal forest with glowing mushrooms",
      type: "Fantasy Art"
    },
    {
      url: "/images/testimonials/Professional portrait photography.png",
      prompt: "Professional portrait photography",
      type: "Portrait"
    },
    {
      url: "/images/testimonials/Sunset mountain landscape.png",
      prompt: "Sunset mountain landscape",
      type: "Landscape"
    }
  ];

  // Public Hero Section for Non-Authenticated Users
  const PublicHeroSection = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Auto-rotate images
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % sampleImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    return (
      <Section
        id="hero"
        background="surface-container-low"
        fullHeight={true}
        className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950"
        ref={heroRef}
      >
        {/* Enhanced Background with Glassmorphism */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/40 rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: `${20 + i * 8}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <motion.div
              className="text-center lg:text-left"
              style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.0, 0, 1.0] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Transform Your{' '}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Imagination
                  </span>{' '}
                  Into Stunning Visuals
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Create professional-quality images in seconds with our AI-powered platform.
                  <span className="font-semibold text-purple-600 dark:text-purple-400"> Get 10 free credits</span> to start your creative journey today.
                </p>

                {/* Value Proposition Points */}
                <motion.div
                  className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {[
                    { icon: "⚡", text: "Instant Generation" },
                    { icon: "🎨", text: "Professional Quality" },
                    { icon: "🆓", text: "Free to Start" }
                  ].map((point, index) => (
                    <div key={index} className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-100/50 dark:border-purple-800/50">
                      <span className="text-lg mr-2">{point.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{point.text}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Button
                    variant="filled"
                    size="large"
                    to="/signup"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🚀 Start Creating Free
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    to="/login"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    Sign In
                  </Button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  className="mt-8 text-center lg:text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Trusted by creators worldwide</p>
                  <div className="flex items-center justify-center lg:justify-start space-x-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">10K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Images Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">5K+</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Happy Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">99.9%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - Dynamic Image Showcase */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative max-w-md mx-auto lg:max-w-lg">
                {/* Main Image Display */}
                <motion.div
                  className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-2xl"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <img
                        src={sampleImages[currentImageIndex].url}
                        alt={sampleImages[currentImageIndex].prompt}
                        className="w-full h-64 object-cover rounded-2xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                            "{sampleImages[currentImageIndex].prompt}"
                          </p>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                            {sampleImages[currentImageIndex].type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Image Navigation Dots */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {sampleImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-purple-600 w-6'
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-400'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ✨ AI Powered
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🎨 High Quality
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          ref={scrollIndicatorRef}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-100/50 dark:border-purple-800/50"
          >
            <span className="text-gray-600 dark:text-gray-400 text-sm mb-1">Explore Features</span>
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </Section>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Authentication-based Hero Section */}
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="authenticated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16 md:pt-20" // Add responsive top padding to account for fixed navbar
          >
            <InspiringCreativeHub />
          </motion.div>
        ) : (
          <motion.div
            key="public"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-16 md:pt-20" // Add responsive top padding to account for fixed navbar
          >
            <PublicHeroSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Public Marketing Sections - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <div>
          {/* Section 2: Enhanced Features Section */}
          <Section id="features" background="surface" className="bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-purple-950/30">
            <motion.div
              className="text-center mb-16"
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Powerful AI Tools at Your{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Fingertips
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
                Our comprehensive suite of AI-powered tools makes it easy to create, edit, and enhance images with professional results in seconds.
              </p>

              {/* Credit System Information */}
              <motion.div
                className="inline-flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200/50 dark:border-purple-700/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span className="text-2xl mr-3">🎁</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Start with 10 Free Credits
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Each AI operation costs 2 credits • Image Editor is free
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced Features Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
              variants={staggerContainer}
            >
              {/* Text to Image Feature */}
              <motion.div variants={fadeInLeft} className="space-y-6">
                <Card
                  variant="elevated"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100/50 dark:border-purple-800/50 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Text to Image</h3>
                        <p className="text-purple-600 dark:text-purple-400 font-medium">2 credits per generation</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Transform your imagination into stunning visuals with our advanced AI models. Simply describe what you want to see, and watch as our AI creates professional-quality images in seconds.
                    </p>

                    {/* Before/After Demo */}
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50/50 dark:from-gray-800/50 dark:to-purple-900/20 rounded-xl p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          💭 "A majestic dragon flying over a mystical forest"
                        </p>
                        <div className="flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-3 py-1 rounded-full">
                            ⚡ Generated in 3 seconds
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {['Concept Art', 'Illustrations', 'Marketing Materials', 'Social Media'].map((tag, index) => (
                        <span key={index} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Image Enhancement Feature */}
              <motion.div variants={fadeInRight} className="space-y-6">
                <Card
                  variant="elevated"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100/50 dark:border-blue-800/50 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Image Enhancement</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">2 credits per operation</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      Enhance your images with powerful AI tools. Upscale for higher resolution, remove backgrounds instantly, or expand images beyond their borders with intelligent uncropping.
                    </p>

                    {/* Enhancement Tools */}
                    <div className="space-y-3 mb-6">
                      {[
                        { name: 'Upscale', desc: 'Increase resolution up to 4x', icon: '🔍' },
                        { name: 'Remove Background', desc: 'Clean background removal', icon: '✂️' },
                        { name: 'Uncrop', desc: 'Expand image boundaries', icon: '📐' }
                      ].map((tool, index) => (
                        <div key={index} className="flex items-center p-3 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-lg">
                          <span className="text-lg mr-3">{tool.icon}</span>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{tool.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tool.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['Photo Enhancement', 'Product Images', 'Professional Photos'].map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>

            {/* Additional Features Row */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              {/* Image Editor Feature */}
              <motion.div variants={scaleIn}>
                <Card
                  variant="elevated"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-green-100/50 dark:border-green-800/50 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Editor</h3>
                        <p className="text-green-600 dark:text-green-400 font-medium">✨ Completely Free</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Professional image editing tools with filters, adjustments, and effects. No credits required - edit as much as you want!
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {['Filters', 'Adjustments', 'Rotate'].map((feature, index) => (
                        <span key={index} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Security Feature */}
              <motion.div variants={scaleIn}>
                <Card
                  variant="elevated"
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-orange-100/50 dark:border-orange-800/50 h-full"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure & Private</h3>
                        <p className="text-orange-600 dark:text-orange-400 font-medium">🔒 Enterprise-grade</p>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Your images and prompts are encrypted and stored securely. We prioritize your privacy and never share your creative work.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {['End-to-End Encryption', 'Private Storage', 'GDPR Compliant'].map((feature, index) => (
                        <span key={index} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </Section>

      {/* Section 3: Enhanced Testimonials Section */}
      <Section id="testimonials" background="surface-container" className="bg-gradient-to-br from-indigo-50 to-purple-50/30 dark:from-indigo-950 dark:to-purple-950/30">
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            What Our{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Join thousands of satisfied creators who are already using PromptPix to bring their ideas to life.
          </p>

          {/* Social Proof Stats */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { number: '10,000+', label: 'Images Generated', icon: '🎨' },
              { number: '5,000+', label: 'Happy Users', icon: '😊' },
              { number: '4.9/5', label: 'Average Rating', icon: '⭐' },
              { number: '99.9%', label: 'Uptime', icon: '🚀' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={staggerContainer}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
            >
              <Card
                variant="elevated"
                className="h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100/50 dark:border-purple-800/50"
              >
                <div className="p-6">
                  <div className="flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-700 mr-4">
                      <img
                        src={testimonial.avatar || `https://ui-avatars.com/api/?name=${testimonial.author}&background=random`}
                        alt={testimonial.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Section 4: FAQ Section */}
      <Section id="faq" background="surface" className="bg-gradient-to-br from-gray-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <motion.div
          className="text-center mb-16"
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about PromptPix and our AI-powered image generation platform.
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={staggerContainer}
        >
          {[
            {
              question: "How does the credit system work?",
              answer: "You start with 10 free credits when you sign up. Each AI operation (text-to-image, upscale, uncrop, remove background) costs 2 credits. The Image Editor is completely free to use with no credit requirements. You can purchase additional credits anytime."
            },
            {
              question: "What image formats and sizes are supported?",
              answer: "PromptPix generates high-quality 1024×1024 PNG images. You can upload JPEG, PNG, and WebP files up to 10MB for editing and enhancement. All downloads are provided in high-resolution PNG format for the best quality."
            },
            {
              question: "Is my data secure and private?",
              answer: "Absolutely! We use enterprise-grade encryption to protect your images and prompts. Your creative work is stored securely and never shared with third parties. We're GDPR compliant and prioritize your privacy above all else."
            },
            {
              question: "Can I use PromptPix for commercial projects?",
              answer: "Yes! All images generated with PromptPix can be used for both personal and commercial projects. You retain full rights to the images you create, making them perfect for marketing materials, social media, and business use."
            },
            {
              question: "How fast is image generation?",
              answer: "Our AI models typically generate images in 3-5 seconds. Image enhancement operations like upscaling and background removal usually complete in 2-3 seconds. Processing times may vary slightly during peak usage."
            },
            {
              question: "What makes PromptPix different from other AI image tools?",
              answer: "PromptPix combines multiple AI tools in one platform with a user-friendly interface, competitive pricing, and a free image editor. We focus on quality, speed, and privacy while providing excellent customer support and regular feature updates."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="mb-6"
            >
              <Card
                variant="elevated"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors duration-300"
              >
                <div className="p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-11">
                    {faq.answer}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-indigo-200/50 dark:border-indigo-700/50">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our support team is here to help you get the most out of PromptPix.
            </p>
            <Button
              variant="filled"
              size="medium"
              to="/contact"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              📧 Contact Support
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* Section 5: Enhanced CTA Section */}
      <Section id="cta" background="primary-container" className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-700 dark:via-indigo-700 dark:to-blue-700">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div
              className="md:w-1/2 text-center md:text-left"
              variants={fadeInLeft}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Transform Your{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Creative Process?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Join thousands of creators, designers, and marketers who are already using PromptPix to bring their ideas to life.
                Start your creative journey today with <span className="font-semibold text-yellow-300">10 free credits</span>.
              </p>

              {/* Benefits List */}
              <motion.div
                className="flex flex-col sm:flex-row gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { icon: '🚀', text: 'Start in seconds' },
                  { icon: '💳', text: 'No credit card required' },
                  { icon: '🎨', text: '10 free credits included' }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center text-white/90">
                    <span className="text-2xl mr-2">{benefit.icon}</span>
                    <span className="font-medium">{benefit.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="filled"
                    size="large"
                    to="/signup"
                    className="bg-white text-purple-600 hover:bg-gray-50 hover:text-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold border border-transparent hover:border-purple-200"
                  >
                    🎉 Start Creating Free
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="outlined"
                    size="large"
                    to="/login"
                    className="border-2 border-white bg-white/20 text-white hover:bg-white/35 hover:border-white backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="mt-8 flex flex-wrap justify-center md:justify-start gap-6 text-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">No setup required</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Secure & private</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="md:w-1/2 flex justify-center"
              variants={fadeInRight}
            >
              <div className="relative w-full max-w-lg">
                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -left-6 bg-yellow-400 text-purple-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ✨ 10 Free Credits
                </motion.div>

                <motion.div
                  className="absolute -top-6 -right-6 bg-green-400 text-green-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  🚀 Instant Setup
                </motion.div>

                <motion.div
                  className="absolute -bottom-6 -left-6 bg-blue-400 text-blue-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  🔒 100% Secure
                </motion.div>

                {/* Main Preview */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg mr-3"></div>
                      <h3 className="text-lg font-bold text-gray-800">PromptPix Dashboard</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full"></div>
                      <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full w-4/5"></div>
                      <div className="h-3 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full w-3/5"></div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <div className="h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Scroll to Top */}
          <motion.div
            className="flex justify-center mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white/20 backdrop-blur-sm text-white p-4 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 group"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </Section>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
