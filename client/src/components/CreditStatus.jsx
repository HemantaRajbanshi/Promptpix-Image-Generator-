import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../services/api';
import { CREDIT_CONFIG } from '../constants';

const CreditStatus = ({ 
  variant = 'default', // 'default', 'compact', 'detailed'
  showRefresh = true,
  className = '',
  onCreditUpdate = null
}) => {
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch credit status
  const fetchCreditStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getCreditStatus();
      setCreditData(response.data);
      
      // Notify parent component of credit update
      if (onCreditUpdate) {
        onCreditUpdate(response.data);
      }
    } catch (err) {
      console.error('Error fetching credit status:', err);
      setError(err.message || 'Failed to load credit status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditStatus();
  }, []);

  // Format time until reset
  const formatTimeUntilReset = (timeInfo) => {
    if (!timeInfo) return 'Calculating...';
    
    const { hours, minutes } = timeInfo;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get credit status color
  const getCreditStatusColor = (credits) => {
    if (credits <= 0) return 'text-red-500';
    if (credits <= CREDIT_CONFIG.LOW_CREDIT_THRESHOLD) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get credit status background
  const getCreditStatusBg = (credits) => {
    if (credits <= 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (credits <= CREDIT_CONFIG.LOW_CREDIT_THRESHOLD) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        <span>⚠️ Credit status unavailable</span>
        {showRefresh && (
          <button
            onClick={fetchCreditStatus}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const { credits, timeUntilReset, dailyLimit } = creditData || {};

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getCreditStatusBg(credits)} ${className}`}
      >
        <span className="text-lg">⚡</span>
        <span className={`font-semibold ${getCreditStatusColor(credits)}`}>
          {credits}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          / {dailyLimit}
        </span>
        {showRefresh && (
          <button
            onClick={fetchCreditStatus}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Refresh credit status"
          >
            🔄
          </button>
        )}
      </motion.div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${getCreditStatusBg(credits)} ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Credit Status
          </h3>
          {showRefresh && (
            <button
              onClick={fetchCreditStatus}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Refresh credit status"
            >
              🔄
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Available Credits:
            </span>
            <span className={`font-bold ${getCreditStatusColor(credits)}`}>
              {credits} / {dailyLimit}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Reset in:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTimeUntilReset(timeUntilReset)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                credits <= 0 ? 'bg-red-500' :
                credits <= CREDIT_CONFIG.LOW_CREDIT_THRESHOLD ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(credits / dailyLimit) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Credit usage info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <div>• Image Generation: {CREDIT_CONFIG.OPERATIONS.TEXT_TO_IMAGE} credits</div>
            <div>• Background Removal: {CREDIT_CONFIG.OPERATIONS.REMOVE_BACKGROUND} credits</div>
            <div>• Image Editor: Free</div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center space-x-3 p-3 rounded-lg border ${getCreditStatusBg(credits)} ${className}`}
    >
      <div className="text-2xl">⚡</div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${getCreditStatusColor(credits)}`}>
            {credits}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            / {dailyLimit} credits
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Resets in {formatTimeUntilReset(timeUntilReset)}
        </div>
      </div>
      {showRefresh && (
        <button
          onClick={fetchCreditStatus}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Refresh credit status"
        >
          🔄
        </button>
      )}
    </motion.div>
  );
};

// Credit Warning Component
export const CreditWarning = ({ credits, operation = 'operation' }) => {
  const requiredCredits = CREDIT_CONFIG.OPERATIONS[operation.toUpperCase().replace('-', '_')] || CREDIT_CONFIG.OPERATION_COST;
  
  if (credits >= requiredCredits) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4"
      >
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <div>
            <div className="text-sm font-medium text-red-800 dark:text-red-200">
              Insufficient Credits
            </div>
            <div className="text-xs text-red-600 dark:text-red-300">
              You need {requiredCredits} credits for this operation, but you only have {credits}.
              Credits reset daily at midnight.
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Credit Success Component
export const CreditSuccess = ({ operation, creditsUsed, remainingCredits }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4"
    >
      <div className="flex items-center space-x-2">
        <span className="text-green-500">✅</span>
        <div>
          <div className="text-sm font-medium text-green-800 dark:text-green-200">
            Operation Successful
          </div>
          <div className="text-xs text-green-600 dark:text-green-300">
            Used {creditsUsed} credits for {operation}. {remainingCredits} credits remaining.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditStatus;
