import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

const CreditsDisplay = () => {
  const { user, addCredits, creditsLoading, refreshCredits } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const creditRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Get user credits with fallback to 0
  const credits = user?.credits || 0;

  // Determine credit status
  const getCreditStatus = () => {
    if (credits <= 0) return 'empty';
    if (credits < 5) return 'low';
    if (credits < 20) return 'medium';
    return 'high';
  };

  const creditStatus = getCreditStatus();

  // Get color based on credit status
  const getStatusColor = () => {
    switch (creditStatus) {
      case 'empty':
        return 'bg-red-500 dark:bg-red-600';
      case 'low':
        return 'bg-orange-500 dark:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'high':
        return 'bg-green-500 dark:bg-green-600';
      default:
        return 'bg-gray-500 dark:bg-gray-600';
    }
  };

  // Update position when hovering
  useEffect(() => {
    if (isHovering && creditRef.current) {
      const rect = creditRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 10
      });
    }
  }, [isHovering]);

  return (
    <div
      className="relative z-[999] flex items-center justify-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        ref={creditRef}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <motion.div
          className={`w-3 h-3 rounded-full ${creditsLoading ? 'bg-blue-500' : getStatusColor()}`}
          animate={creditsLoading ?
            { scale: [1, 1.3, 1], rotate: [0, 180, 360] } :
            { scale: [1, 1.2, 1] }
          }
          transition={creditsLoading ?
            { duration: 1, repeat: Infinity, ease: "easeInOut" } :
            { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <div className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
          <span className="mr-1">
            {creditsLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ...
              </motion.span>
            ) : (
              credits
            )}
          </span>
          <motion.span
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Credits
          </motion.span>
        </div>
      </div>

      {/* Removed backdrop blur effect */}

      {/* Use portal for hover box */}
      {isHovering && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 z-[9999] border border-purple-100 dark:border-purple-800/30"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transformOrigin: 'center left'
            }}
          >
            {/* Arrow pointing to the credits display */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white dark:border-r-gray-800 z-10"></div>
            <div className="absolute -left-2.5 top-4 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-purple-100 dark:border-r-purple-800/30 z-0"></div>

              <div className="relative z-10">
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center text-sm">
                      <svg className="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Credits
                    </h3>

                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {creditsLoading ? (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ...
                        </motion.span>
                      ) : (
                        credits
                      )}
                    </span>
                  </div>

                  {/* Animated progress bar */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={`h-full ${getStatusColor()} bg-gradient-to-r ${creditStatus === 'empty' ? 'from-red-500 to-red-600' :
                        creditStatus === 'low' ? 'from-orange-500 to-red-500' :
                        creditStatus === 'medium' ? 'from-yellow-400 to-orange-500' :
                        'from-green-400 to-emerald-500'}`}
                      style={{ width: '0%', boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)' }}
                      animate={{ width: `${Math.min(credits * 5, 100)}%` }}
                      transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  </div>
                </div>

                {/* Action button - compact */}
                <Link
                  to="/dashboard/upgrade"
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all duration-300 mt-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Get More
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Mobile version - positioned below */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 z-[1000] border border-purple-100 dark:border-purple-800/30 md:hidden block"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformOrigin: 'top center' }}
            >
              {/* Arrow pointing up to the credits display */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white dark:border-b-gray-800 z-10"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2.5 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-purple-100 dark:border-b-purple-800/30 z-0"></div>

              <div className="relative z-10">
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center text-sm">
                      <svg className="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Credits
                    </h3>

                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {creditsLoading ? (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ...
                        </motion.span>
                      ) : (
                        credits
                      )}
                    </span>
                  </div>

                  {/* Animated progress bar */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={`h-full ${getStatusColor()} bg-gradient-to-r ${creditStatus === 'empty' ? 'from-red-500 to-red-600' :
                        creditStatus === 'low' ? 'from-orange-500 to-red-500' :
                        creditStatus === 'medium' ? 'from-yellow-400 to-orange-500' :
                        'from-green-400 to-emerald-500'}`}
                      style={{ width: '0%', boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)' }}
                      animate={{ width: `${Math.min(credits * 5, 100)}%` }}
                      transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  </div>
                </div>

                {/* Action button - compact */}
                <Link
                  to="/dashboard/upgrade"
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-md text-xs font-medium shadow-sm hover:shadow transition-all duration-300 mt-2"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Get More
                  </div>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CreditsDisplay;
