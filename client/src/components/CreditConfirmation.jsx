import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreditConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  operationType, 
  requiredCredits = 2,
  description 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const userCredits = user?.credits || 0;
  const hasEnoughCredits = userCredits >= requiredCredits;

  const handleConfirm = async () => {
    if (!hasEnoughCredits) {
      navigate('/dashboard/upgrade');
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const handlePurchaseCredits = () => {
    navigate('/dashboard/upgrade');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl" />
          
          <div className="relative">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              hasEnoughCredits 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}>
              {hasEnoughCredits ? (
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              {hasEnoughCredits ? 'Confirm Operation' : 'Insufficient Credits'}
            </h2>

            {/* Description */}
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {description || `This ${operationType} operation will consume ${requiredCredits} credits.`}
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Credits:
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {requiredCredits}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Balance:
                  </span>
                  <span className={`text-sm font-bold ${
                    hasEnoughCredits 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {userCredits}
                  </span>
                </div>
                {hasEnoughCredits && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      After Operation:
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {userCredits - requiredCredits}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3">
              {hasEnoughCredits ? (
                <>
                  <motion.button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Confirm & Use ${requiredCredits} Credits`
                    )}
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="w-full py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl font-medium transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={handlePurchaseCredits}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Purchase Credits
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="w-full py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl font-medium transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreditConfirmation;
