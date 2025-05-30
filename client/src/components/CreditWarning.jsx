import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreditWarning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const userCredits = user?.credits || 0;

  useEffect(() => {
    // Show warning if credits are low (5 or less) and not dismissed
    if (userCredits <= 5 && userCredits > 0 && !dismissed) {
      setShowWarning(true);
    } else if (userCredits === 0 && !dismissed) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [userCredits, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
  };

  const handlePurchaseCredits = () => {
    navigate('/dashboard/upgrade');
    setDismissed(true);
    setShowWarning(false);
  };

  if (!showWarning) return null;

  const isOutOfCredits = userCredits === 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-4 right-4 z-[9998] max-w-sm"
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className={`rounded-2xl shadow-2xl border p-4 backdrop-blur-sm ${
          isOutOfCredits 
            ? 'bg-red-50/95 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
            : 'bg-orange-50/95 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        }`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                isOutOfCredits 
                  ? 'bg-red-100 dark:bg-red-900/30' 
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                {isOutOfCredits ? (
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${
                  isOutOfCredits 
                    ? 'text-red-800 dark:text-red-200' 
                    : 'text-orange-800 dark:text-orange-200'
                }`}>
                  {isOutOfCredits ? 'Out of Credits' : 'Low Credits'}
                </h3>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className={`text-xs ${
              isOutOfCredits 
                ? 'text-red-700 dark:text-red-300' 
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              {isOutOfCredits 
                ? 'You have no credits left. Purchase more to continue using AI tools.'
                : `You have ${userCredits} credits remaining. Consider purchasing more to avoid interruptions.`
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <motion.button
              onClick={handlePurchaseCredits}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium text-white transition-colors ${
                isOutOfCredits 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Purchase Credits
            </motion.button>
            <motion.button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Dismiss
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditWarning;
