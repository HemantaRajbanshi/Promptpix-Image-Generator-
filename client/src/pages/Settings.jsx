import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import DashboardContentWrapper from '../components/DashboardContentWrapper';

const Settings = () => {
  const { user, completeLogout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    forgotNew: false,
    forgotConfirm: false
  });

  // Password update form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Forgot password form
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: user?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpSent, setOtpSent] = useState(false);

  // Helper function to check password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { strength: score, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: score, label: 'Strong', color: 'bg-green-500' };
  };

  // Helper function to toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Helper function to show notifications
  const showNotification = (message, type = 'success', duration = 5000) => {
    setNotification({ message, type, show: true });
    if (duration > 0) {
      setTimeout(() => {
        setNotification({ message: '', type: '', show: false });
      }, duration);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showNotification('Password updated successfully! 🎉');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password update error:', error);
      showNotification(error.message || 'Failed to update password', 'error');
    }
    setIsLoading(false);
  };

  const handleSendOTP = async () => {
    // Validation
    if (!forgotPasswordForm.email) {
      showNotification('Please enter your email address', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordForm.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.forgotPassword(forgotPasswordForm.email);
      setOtpSent(true);
      showNotification('� Verification code sent! Please check your email inbox and spam folder.', 'success');
    } catch (error) {
      console.error('OTP send error:', error);
      showNotification(error.message || 'Failed to send verification code. Please try again.', 'error');
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!forgotPasswordForm.otp || !forgotPasswordForm.newPassword || !forgotPasswordForm.confirmPassword) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (forgotPasswordForm.otp.length !== 6) {
      showNotification('OTP must be 6 digits', 'error');
      return;
    }

    if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (forgotPasswordForm.newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(
        forgotPasswordForm.email,
        forgotPasswordForm.otp,
        forgotPasswordForm.newPassword
      );
      showNotification('🎉 Password reset successfully! You can now use your new password.');
      setForgotPasswordForm({ email: user?.email || '', otp: '', newPassword: '', confirmPassword: '' });
      setOtpSent(false);
      setActiveTab('password');
    } catch (error) {
      console.error('Password reset error:', error);
      showNotification(error.message || 'Failed to reset password', 'error');
    }
    setIsLoading(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    showNotification(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} mode`);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    // Validation
    if (!deleteAccountForm.password) {
      showNotification('Please enter your password to confirm account deletion', 'error');
      return;
    }

    if (deleteAccountForm.confirmText !== 'DELETE') {
      showNotification('Please type "DELETE" to confirm account deletion', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Call delete account API
      await authAPI.deleteAccount(deleteAccountForm.password);

      // Show success message immediately with longer duration
      showNotification('🗑️ Account deleted successfully! Redirecting to home page...', 'success', 0); // 0 = no auto-hide

      // Perform complete logout with full cleanup
      await completeLogout();

      // Small delay to ensure cleanup is complete and user sees the success message
      setTimeout(() => {
        // Navigate to the main landing page (public marketing content)
        navigate('/', { replace: true });

        // Force a page reload to ensure complete state reset
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Delete account error:', error);
      showNotification(error.message || 'Failed to delete account. Please try again.', 'error');
      setIsLoading(false);
    }
    // Note: Don't set loading to false in success case since we're redirecting
  };

  // Delete account state
  const [deleteAccountForm, setDeleteAccountForm] = useState({
    password: '',
    confirmText: ''
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const tabs = [
    { id: 'password', label: 'Update Password', icon: '🔒' },
    { id: 'forgot', label: 'Forgot Password', icon: '🔑' },
    { id: 'theme', label: 'Theme Settings', icon: '🎨' },
    { id: 'delete', label: 'Delete Account', icon: '🗑️' }
  ];

  return (
    <>
      {/* Notification Toast */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border ${
            notification.type === 'error'
              ? 'bg-red-500/90 text-white border-red-400'
              : notification.message.includes('Account deleted')
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-green-500/25'
              : 'bg-emerald-500/90 text-white border-emerald-400'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3 text-lg">
              {notification.type === 'error' ? '🚫' : notification.message.includes('Account deleted') ? '🗑️' : '✅'}
            </span>
            <span className="font-medium">{notification.message}</span>
            {!notification.message.includes('Account deleted') && (
              <button
                onClick={() => setNotification({ message: '', type: '', show: false })}
                className="ml-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}

      <DashboardContentWrapper>
        <div className="max-w-6xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Customize your account and security preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Modern Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 p-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Cards */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden"
          style={{
            boxShadow: '0 25px 50px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {activeTab === 'password' && (
            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Update Password</h2>
                  <p className="text-gray-600 dark:text-gray-400">Keep your account secure with a strong password</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your current password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-4 pr-12 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordForm.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Password strength</span>
                        <span className={`text-sm font-semibold ${
                          getPasswordStrength(passwordForm.newPassword).strength <= 2 ? 'text-red-500' :
                          getPasswordStrength(passwordForm.newPassword).strength <= 4 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {getPasswordStrength(passwordForm.newPassword).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrength(passwordForm.newPassword).color}`}
                          style={{ width: `${(getPasswordStrength(passwordForm.newPassword).strength / 6) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                          ✓ At least 8 characters
                        </div>
                        <div className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                          ✓ Uppercase letter
                        </div>
                        <div className={/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                          ✓ Lowercase letter
                        </div>
                        <div className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                          ✓ Number
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Confirm your new password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {passwordForm.confirmPassword && (
                        passwordForm.newPassword === passwordForm.confirmPassword ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )
                      )}
                    </div>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Updating Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Update Password</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'forgot' && (
            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                  <p className="text-gray-600">Forgot your password? We'll help you reset it securely</p>
                </div>
              </div>

              {!otpSent ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                        <p className="text-blue-700 text-sm">Enter your email address and we'll send you a 6-digit verification code. Use this code to create a new password.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={forgotPasswordForm.email}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                          className="w-full px-4 py-4 pl-12 rounded-2xl border-2 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                          placeholder="Enter your email address"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Sending Code...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span>Send 6-Digit OTP</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-green-600">Email Sent</span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        forgotPasswordForm.otp.length === 6 ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        {forgotPasswordForm.otp.length === 6 ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-white text-sm font-bold">2</span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        forgotPasswordForm.otp.length === 6 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {forgotPasswordForm.otp.length === 6 ? 'Code Verified' : 'Enter Code'}
                      </span>
                    </div>
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        forgotPasswordForm.otp.length === 6 ? 'bg-blue-500' : 'bg-gray-300'
                      }`}>
                        <span className={`text-sm font-bold ${
                          forgotPasswordForm.otp.length === 6 ? 'text-white' : 'text-gray-500'
                        }`}>3</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        forgotPasswordForm.otp.length === 6 ? 'text-blue-600' : 'text-gray-500'
                      }`}>New Password</span>
                    </div>
                  </div>

                  {/* OTP Input Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                      <p className="text-gray-600">We've sent a 6-digit verification code to</p>
                      <p className="font-semibold text-blue-600">{forgotPasswordForm.email}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 text-center">
                          Enter 6-Digit Verification Code
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={forgotPasswordForm.otp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                              setForgotPasswordForm({ ...forgotPasswordForm, otp: value });
                            }}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-blue-500 transition-all duration-300 text-center text-2xl font-mono tracking-[0.5em] text-gray-900"
                            placeholder="000000"
                            maxLength={6}
                            required
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <span className={`text-sm font-medium ${
                              forgotPasswordForm.otp.length === 6 ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {forgotPasswordForm.otp.length}/6
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                          📧 Check your email inbox and spam folder
                        </p>
                        <p className="text-sm text-gray-500">
                          ⏰ Code expires in 5 minutes
                        </p>
                      </div>

                      {/* Resend Button - Only show if OTP not complete */}
                      {forgotPasswordForm.otp.length < 6 && (
                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Sending New Code...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Resend Code</span>
                              </div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Fields - Only show when OTP is complete */}
                  {forgotPasswordForm.otp.length === 6 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-3xl p-6 space-y-6"
                    >
                      <div className="text-center mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-green-900">Code Verified!</h3>
                        <p className="text-green-700">Now create your new password</p>
                      </div>

                      <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={forgotPasswordForm.newPassword}
                              onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, newPassword: e.target.value })}
                              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-green-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                              placeholder="Create a strong password"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={forgotPasswordForm.confirmPassword}
                              onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-green-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                              placeholder="Confirm your new password"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                              {forgotPasswordForm.confirmPassword && (
                                forgotPasswordForm.newPassword === forgotPasswordForm.confirmPassword ? (
                                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )
                              )}
                            </div>
                          </div>
                          {forgotPasswordForm.confirmPassword && forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                          )}
                        </div>

                        <div className="pt-4 space-y-3">
                          {/* Main Action Button */}
                          <button
                            type="submit"
                            disabled={isLoading || !forgotPasswordForm.newPassword || !forgotPasswordForm.confirmPassword || forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                          >
                            {isLoading ? (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Changing Password...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Change Password</span>
                              </div>
                            )}
                          </button>

                          {/* Secondary Actions */}
                          <div className="flex space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setForgotPasswordForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                            >
                              ← Start Over
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setForgotPasswordForm({ ...forgotPasswordForm, otp: '' });
                              }}
                              className="flex-1 bg-blue-100 text-blue-700 py-3 rounded-2xl font-medium hover:bg-blue-200 transition-colors border border-blue-300"
                            >
                              ↻ New Code
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Back Button - Always visible */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setForgotPasswordForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                    >
                      ← Back to Email Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="p-8 md:p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2M9 3h10a2 2 0 012 2v12a4 4 0 01-4 4H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Theme Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Customize your visual experience with Material Design 3</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/30 rounded-3xl p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        {isDarkMode ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {isDarkMode
                            ? 'Enjoy a comfortable viewing experience in low light'
                            : 'Bright and clean interface for daytime use'
                          }
                        </p>
                      </div>
                    </div>

                    <motion.button
                      onClick={handleThemeToggle}
                      className={`relative w-20 h-10 rounded-full transition-all duration-500 shadow-lg ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                          : 'bg-gray-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-500 ${
                          isDarkMode ? 'translate-x-11' : 'translate-x-1'
                        }`}
                        layout
                      >
                        {isDarkMode ? (
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </motion.div>
                    </motion.button>
                  </div>
                </div>

                {/* Theme Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className={`border-2 rounded-3xl p-6 shadow-lg transition-all duration-300 ${
                      !isDarkMode
                        ? 'bg-white border-purple-300 ring-2 ring-purple-200'
                        : 'bg-white border-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Light Theme</h4>
                        <p className="text-sm text-gray-600">Clean and bright</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                      <div className="h-2 bg-gray-100 rounded-full w-1/2"></div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`border-2 rounded-3xl p-6 shadow-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-900 border-purple-600 ring-2 ring-purple-500/30'
                        : 'bg-gray-900 border-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg"></div>
                      <div>
                        <h4 className="font-semibold text-white">Dark Theme</h4>
                        <p className="text-sm text-gray-400">Easy on the eyes</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-700 rounded-full"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-3/4"></div>
                      <div className="h-2 bg-gray-800 rounded-full w-1/2"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Tab */}
          {activeTab === 'delete' && (
            <div className="space-y-8">
              {/* Warning Section */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                      ⚠️ Danger Zone
                    </h3>
                    <p className="text-red-700 dark:text-red-300 leading-relaxed">
                      Deleting your account is permanent and cannot be undone. This action will:
                    </p>
                    <ul className="mt-4 space-y-2 text-red-700 dark:text-red-300">
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span>Permanently delete your account and profile</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span>Remove all your generated and edited images</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span>Clear all your settings and preferences</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        <span>Revoke access to all PromptPix features</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Delete Account Form */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Account
                  </h3>
                  <p className="text-red-100 mt-2">
                    Please confirm your identity to proceed with account deletion
                  </p>
                </div>

                <form onSubmit={handleDeleteAccount} className="p-8 space-y-6">
                  {/* Password Confirmation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Confirm Your Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={deleteAccountForm.password}
                        onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your current password"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteAccountForm.confirmText}
                      onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, confirmText: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Type DELETE to confirm"
                      required
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Please type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE</span> in capital letters to confirm
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setDeleteAccountForm({ password: '', confirmText: '' });
                        setActiveTab('password');
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isLoading || !deleteAccountForm.password || deleteAccountForm.confirmText !== 'DELETE'}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                      whileHover={{ scale: isLoading ? 1 : 1.02 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Deleting Account...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete Account Permanently</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* Additional Security Notice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Need Help Instead?
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      If you're having issues with your account, consider updating your password or contacting support instead of deleting your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </DashboardContentWrapper>
    </>
  );
};

export default Settings;
