import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Form validation
  useEffect(() => {
    const errors = {};

    if (step === 1 && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (step === 2 && formData.otp && formData.otp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }

    if (step === 3) {
      if (formData.newPassword && formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
  }, [formData, step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (validationErrors.email) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(formData.email);

      setStep(2);
      setResendTimer(60);
      setCanResend(false);
      setSuccess('A 6-digit verification code has been sent to your email address. Please check your inbox and spam folder.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    if (validationErrors.otp) return;

    setLoading(true);
    setError('');

    try {
      // For OTP verification, we'll proceed to step 3 and validate during password reset
      // The server validates the OTP when resetting the password
      setStep(3);
      setSuccess('Please enter your new password');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (validationErrors.newPassword || validationErrors.confirmPassword) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword(formData.email, formData.otp, formData.newPassword);

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(formData.email);

      setResendTimer(60);
      setCanResend(false);
      setSuccess('A new verification code has been sent to your email address');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const stepTitles = {
    1: 'Reset Your Password',
    2: 'Enter Verification Code',
    3: 'Create New Password'
  };

  const stepDescriptions = {
    1: 'Enter your email address and we\'ll send you a verification code',
    2: 'We\'ve sent a 6-digit code to your email address',
    3: 'Choose a strong password for your account'
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-100 via-white to-indigo-100 dark:from-gray-900 dark:via-black dark:to-purple-900">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 dark:bg-purple-400/30 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-400/30 rounded-full blur-3xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200/30 dark:border-purple-700/30 p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {stepTitles[step]}
            </motion.h1>

            <motion.p
              className="text-gray-600 dark:text-gray-300 text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {stepDescriptions[step]}
            </motion.p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            className="flex justify-center mb-8"
            variants={itemVariants}
          >
            <div className="flex space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <motion.div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-all duration-medium ${
                    stepNumber === step
                      ? 'bg-primary-40 scale-125'
                      : stepNumber < step
                        ? 'bg-primary-40/60'
                        : 'bg-surface-container-high'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                className="mb-6 bg-success-container/20 border border-success/20 text-success p-4 rounded-2xl text-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 bg-error-container/20 border border-error/20 text-error p-4 rounded-2xl text-sm"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <motion.form
              className="space-y-6"
              onSubmit={handleEmailSubmit}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 ${
                      validationErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : formData.email
                          ? 'border-purple-500 focus:border-purple-600'
                          : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                    }`}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
                <AnimatePresence>
                  {validationErrors.email && (
                    <motion.p
                      className="mt-2 text-sm text-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {validationErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading || validationErrors.email || !formData.email}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                  loading || validationErrors.email || !formData.email
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
                whileHover={!loading && !validationErrors.email && formData.email ? { scale: 1.02 } : {}}
                whileTap={!loading && !validationErrors.email && formData.email ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </motion.svg>
                    Sending Code...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.form
              className="space-y-6"
              onSubmit={handleOTPSubmit}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 text-center text-2xl tracking-widest ${
                      validationErrors.otp
                        ? 'border-red-500 focus:border-red-500'
                        : formData.otp
                          ? 'border-purple-500 focus:border-purple-600'
                          : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                    }`}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleInputChange}
                  />
                </div>
                <AnimatePresence>
                  {validationErrors.otp && (
                    <motion.p
                      className="mt-2 text-sm text-error"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {validationErrors.otp}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300"
                  >
                    Resend Code
                  </button>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Resend code in {resendTimer}s
                  </p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading || validationErrors.otp || !formData.otp}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                  loading || validationErrors.otp || !formData.otp
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
                whileHover={!loading && !validationErrors.otp && formData.otp ? { scale: 1.02 } : {}}
                whileTap={!loading && !validationErrors.otp && formData.otp ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </motion.svg>
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.form
              className="space-y-6"
              onSubmit={handlePasswordSubmit}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 ${
                      validationErrors.newPassword
                        ? 'border-red-500 focus:border-red-500'
                        : formData.newPassword
                          ? 'border-purple-500 focus:border-purple-600'
                          : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                    }`}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  <AnimatePresence>
                    {validationErrors.newPassword && (
                      <motion.p
                        className="mt-2 text-sm text-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {validationErrors.newPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 ${
                      validationErrors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : formData.confirmPassword
                          ? 'border-purple-500 focus:border-purple-600'
                          : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                    }`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <AnimatePresence>
                    {validationErrors.confirmPassword && (
                      <motion.p
                        className="mt-2 text-sm text-error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {validationErrors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || validationErrors.newPassword || validationErrors.confirmPassword || !formData.newPassword || !formData.confirmPassword}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${
                  loading || validationErrors.newPassword || validationErrors.confirmPassword || !formData.newPassword || !formData.confirmPassword
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                }`}
                whileHover={!loading && !validationErrors.newPassword && !validationErrors.confirmPassword && formData.newPassword && formData.confirmPassword ? { scale: 1.02 } : {}}
                whileTap={!loading && !validationErrors.newPassword && !validationErrors.confirmPassword && formData.newPassword && formData.confirmPassword ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.svg
                      className="w-5 h-5 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </motion.svg>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Footer */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-300"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
