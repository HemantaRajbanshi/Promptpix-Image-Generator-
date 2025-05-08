import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Higher-order component that checks if user has enough credits
const CreditCheck = ({ children, requiredCredits, toolName }) => {
  const { user, hasEnoughCredits } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user has enough credits
    if (user && !hasEnoughCredits(requiredCredits)) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [user, requiredCredits, hasEnoughCredits]);
  
  // If user doesn't have enough credits, show warning
  if (showWarning) {
    return (
      <motion.div 
        className="p-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Enough Credits
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need {requiredCredits} credits to use the {toolName} tool, but you only have {user?.credits || 0} credits.
            Please upgrade your plan to get more credits.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.button
              onClick={() => navigate('/dashboard/upgrade')}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upgrade Now
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // If user has enough credits, render children
  return children;
};

export default CreditCheck;
