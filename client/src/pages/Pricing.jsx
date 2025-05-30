import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardContentWrapper from '../components/DashboardContentWrapper';

const Pricing = () => {
  const { user, addCredits } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Define available plans
  const plans = [
    {
      id: 'free',
      name: 'Free',
      credits: 10,
      price: 0,
      features: [
        'One-time 10 free credits',
        '5 AI image generations',
        'Free image editing (unlimited)',
        'Standard resolution (1024×1024)'
      ],
      recommended: false,
      color: 'green'
    },
    {
      id: 'standard',
      name: 'Standard',
      credits: 100,
      price: 15,
      features: [
        '50 AI image generations',
        'All editing tools (unlimited)',
        'High resolution (1024×1024)',
        'Priority processing'
      ],
      recommended: true,
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'Premium',
      credits: 500,
      price: 50,
      features: [
        '250 AI image generations',
        'All editing tools (unlimited)',
        'Maximum resolution (1024×1024)',
        'Priority processing',
        'Dedicated support'
      ],
      recommended: false,
      color: 'gold'
    }
  ];

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add credits to user account
      await addCredits(selectedPlan.credits);

      // Show success message
      setSuccessMessage(`Successfully purchased ${selectedPlan.credits} credits!`);

      // Reset selected plan
      setSelectedPlan(null);

      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error purchasing credits:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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
    <DashboardContentWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get more credits to unlock unlimited creativity with our AI-powered tools
          </p>
        </motion.div>

        {/* User Credits Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 p-6">
              <p className="text-purple-600 dark:text-purple-400 font-medium text-lg">
                Current balance: {user.credits || 0} credits
              </p>
              {user.credits === 10 && (
                <p className="mt-2 text-green-600 dark:text-green-400 text-sm">
                  🎉 Welcome! You've received 10 free credits to get started.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {successMessage ? (
          <motion.div
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{successMessage}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your credits have been added to your account. You will be redirected to the dashboard shortly.
            </p>
            <div className="mt-6">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Return to Dashboard
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 ${
                    selectedPlan?.id === plan.id
                      ? `border-${plan.color}-500 dark:border-${plan.color}-400`
                      : 'border-transparent'
                  } ${
                    plan.recommended
                      ? 'ring-2 ring-purple-500 dark:ring-purple-400'
                      : ''
                  }`}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.recommended && (
                    <div className="bg-purple-500 text-white text-xs font-bold uppercase tracking-wider py-1 text-center">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold text-${plan.color}-600 dark:text-${plan.color}-400 mb-2`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">one-time</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {plan.credits} credits
                    </p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                          <svg className={`h-5 w-5 text-${plan.color}-500 mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      className={`w-full py-2 px-4 rounded-md ${
                        selectedPlan?.id === plan.id
                          ? `bg-${plan.color}-600 hover:bg-${plan.color}-700 text-white`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } transition-colors`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handlePurchase}
                disabled={!selectedPlan || isProcessing}
                className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : selectedPlan ? (
                  selectedPlan.price === 0 ?
                  `Claim ${selectedPlan.credits} Free Credits` :
                  `Purchase ${selectedPlan.credits} Credits for $${selectedPlan.price}`
                ) : (
                  'Select a Plan'
                )}
              </motion.button>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Secure payment processing. No recurring charges.
              </p>
            </motion.div>
          </>
        )}

        <motion.div
          className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                How do credits work?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Credits are consumed for AI-powered operations: Text-to-Image generation, Background removal, Image upscaling, and Uncrop tool. Each operation costs 2 credits. Image Editor tools (filters, adjustments, cropping) are completely free.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Do credits expire?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No, your credits never expire. Use them at your own pace.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer refunds within 7 days of purchase if you haven't used any of the credits.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardContentWrapper>
  );
};

export default Pricing;
