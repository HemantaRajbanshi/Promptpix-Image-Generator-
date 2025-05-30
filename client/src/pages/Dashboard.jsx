import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsDisplay from '../components/CreditsDisplay';
import CreditWarning from '../components/CreditWarning';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';


const Dashboard = () => {
  const { user, logout, creditsLoading, refreshCredits } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const profileMenuRef = useRef(null);
  const mouseLeaveTimeoutRef = useRef(null);

  // Listen for credits refresh success
  useEffect(() => {
    const handleCreditsRefreshed = () => {
      setShowRefreshSuccess(true);
      setTimeout(() => setShowRefreshSuccess(false), 2000);
    };

    window.addEventListener('creditsRefreshed', handleCreditsRefreshed);
    return () => window.removeEventListener('creditsRefreshed', handleCreditsRefreshed);
  }, []);

  // Handle click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle mouse enter with immediate opening
  const handleMouseEnter = () => {
    if (mouseLeaveTimeoutRef.current) {
      clearTimeout(mouseLeaveTimeoutRef.current);
      mouseLeaveTimeoutRef.current = null;
    }
    setIsProfileMenuOpen(true);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    mouseLeaveTimeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 150); // 150ms delay to prevent accidental closing
  };

  const tools = [
    { id: 'text-to-image', name: 'Text to Image', path: '/dashboard/text-to-image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'upscale', name: 'Upscale', path: '/dashboard/upscale', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5' },
    { id: 'uncrop', name: 'Uncrop', path: '/dashboard/uncrop', icon: 'M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8m-4-4v8m-12 0V4a2 2 0 012-2h12a2 2 0 012 2v4' },
    { id: 'remove-bg', name: 'Remove Background', path: '/dashboard/remove-bg', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'image-editor', name: 'Image Editor', path: '/dashboard/image-editor', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
  ];

  const sections = [
    {
      title: 'Tools',
      items: tools
    },
    {
      title: 'My Content',
      items: [
        { id: 'gallery', name: 'My Gallery', path: '/dashboard/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', name: 'My Profile', path: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      ]
    }
  ];

  const isToolActive = (path) => {
    return location.pathname === path;
  };

  const isAnyToolActive = location.pathname !== '/dashboard';

  // Animation variants for staggered animations
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const sidebarItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  const sidebarSectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        when: 'beforeChildren',
        staggerChildren: 0.05
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 500, damping: 15 }
    },
    hover: {
      rotate: 10,
      scale: 1.1,
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-dim dark:bg-black">
      {/* Credit Warning */}
      <CreditWarning />

      <div className="flex flex-grow overflow-hidden relative">

        {/* Profile Dropdown - Integrated with sidebar */}
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              className="fixed z-[99999] bg-white/95 dark:bg-gray-900/95"
              style={{
                left: '16px', // Match sidebar position
                top: '120px', // Position below profile button
                width: '288px', // Match sidebar width (w-72)
                bottom: '16px', // Match sidebar bottom
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '0 0 24px 24px', // Match sidebar bottom corners
                border: '1px solid rgba(202, 196, 208, 0.2)',
                borderTop: 'none',
                boxShadow: `
                  0px 16px 48px rgba(103, 80, 164, 0.15),
                  0px 8px 24px rgba(0, 0, 0, 0.08),
                  0px 4px 12px rgba(103, 80, 164, 0.1)
                `,
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="p-6 pt-4">

                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-3 py-3 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all duration-medium mb-1"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <Link
                  to="/dashboard/upgrade"
                  className="flex items-center px-3 py-3 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-all duration-medium mb-1"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Purchase Credits
                </Link>
                <hr className="my-3 border-outline-variant/20" />
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm text-error hover:bg-error-container rounded-xl transition-all duration-medium"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar - Fixed Floating Panel */}
        <motion.div
          className="fixed left-4 top-4 bottom-4 w-72 bg-white/95 dark:bg-gray-900/95 overflow-hidden group z-30 flex flex-col"
          initial="hidden"
          animate="visible"
          variants={sidebarVariants}
          whileHover={{ scale: 1.005, x: 4 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `
              0px 16px 48px rgba(103, 80, 164, 0.15),
              0px 8px 24px rgba(0, 0, 0, 0.08),
              0px 4px 12px rgba(103, 80, 164, 0.1),
              inset 0px 1px 0px rgba(255, 255, 255, 0.8)
            `,
            border: '1px solid rgba(202, 196, 208, 0.2)',
          }}
        >
          {/* Subtle glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 pointer-events-none"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
          {/* Fixed Header */}
          <motion.div
            className="p-6 border-b border-outline-variant/15 flex-shrink-0 bg-white/60 dark:bg-gray-800/60"
            variants={sidebarItemVariants}
            style={{
              borderRadius: '24px 24px 0 0',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Link
              to="/"
              className="flex items-center mb-4 group cursor-pointer"
              title="Return to Home"
            >
              <motion.div
                className="w-12 h-12 bg-primary-40 rounded-2xl flex items-center justify-center mr-4 shadow-elevation-2 transition-shadow duration-medium group-hover:shadow-elevation-3"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: 0.2
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: 0.3
                }}
                className="group-hover:translate-x-1 transition-transform duration-medium"
              >
                <h1 className="text-2xl font-bold text-on-surface tracking-tight transition-colors duration-medium group-hover:text-primary-40">
                  PromptPix
                </h1>
                <div className="flex items-center mt-1">
                  <div className={`w-2 h-2 rounded-full mr-2 transition-colors duration-300 ${
                    creditsLoading ? 'bg-blue-500 animate-pulse' :
                    (user?.credits || 0) > 10 ? 'bg-green-500' :
                    (user?.credits || 0) > 5 ? 'bg-yellow-500' :
                    (user?.credits || 0) > 0 ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-on-surface-variant font-medium flex items-center">
                    {creditsLoading ? (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Loading...
                      </motion.span>
                    ) : (
                      user?.credits || 0
                    )}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      refreshCredits();
                    }}
                    className={`ml-2 p-1 rounded-full transition-colors duration-200 ${
                      showRefreshSuccess
                        ? 'bg-green-100 hover:bg-green-200'
                        : 'hover:bg-surface-container-high'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={creditsLoading}
                    title="Refresh credits"
                  >
                    <AnimatePresence mode="wait">
                      {showRefreshSuccess ? (
                        <motion.svg
                          key="success"
                          className="w-3 h-3 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      ) : (
                        <motion.svg
                          key="refresh"
                          className="w-3 h-3 text-on-surface-variant"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          animate={creditsLoading ? { rotate: 360 } : {}}
                          transition={creditsLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                          initial={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            </Link>
            <div className="flex items-center justify-between">
              <motion.p
                className="text-sm text-on-surface-variant font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Welcome, <span className="text-primary-40 font-semibold">{user?.displayName || 'Test User'}</span>
              </motion.p>

              {/* User Menu */}
              <motion.div
                ref={profileMenuRef}
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <motion.button
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-surface-container-high transition-colors duration-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <div className="w-8 h-8 bg-primary-40 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(user?.displayName || 'T').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <motion.svg
                    className="w-4 h-4 text-on-surface-variant"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>


              </motion.div>
            </div>
          </motion.div>

          {/* Fixed Navigation */}
          <motion.nav
            className="px-6 py-4 flex-1 overflow-hidden"
            variants={containerVariants}
          >
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                className="mb-6"
                variants={sidebarSectionVariants}
                custom={sectionIndex}
              >
                <motion.h3
                  className="text-xs font-semibold text-primary-40 uppercase tracking-wider mb-3 px-0"
                  variants={sidebarItemVariants}
                >
                  {section.title}
                </motion.h3>
                <motion.ul
                  className="space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {section.items.map((item, itemIndex) => (
                    <motion.li
                      key={item.id}
                      variants={sidebarItemVariants}
                      whileHover={{ scale: 1.02, x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      custom={itemIndex}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-medium ease-emphasized relative overflow-hidden ${
                          isToolActive(item.path)
                            ? 'bg-primary-40 text-white shadow-elevation-2'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:shadow-elevation-1'
                        }`}
                        style={isToolActive(item.path) ? {
                          background: 'linear-gradient(135deg, #6750A4 0%, #7F67BE 100%)',
                          boxShadow: '0px 4px 16px rgba(103, 80, 164, 0.3), 0px 2px 8px rgba(0, 0, 0, 0.1)',
                        } : {}}
                      >
                        <motion.div
                          variants={iconVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <svg
                            className={`mr-3 h-4 w-4 transition-colors duration-medium ${
                              isToolActive(item.path) ? 'text-white' : 'text-on-surface-variant'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={item.icon}
                            />
                          </svg>
                        </motion.div>
                        <motion.span
                          className={`text-sm font-medium transition-colors duration-medium ${
                            isToolActive(item.path) ? 'text-white' : 'text-on-surface-variant'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * itemIndex + 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                        {isToolActive(item.path) && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.nav>
        </motion.div>



        {/* Main Content */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            marginLeft: '304px',
          }}
        >
          {/* Main Content Container with Rounded Border */}
          <motion.div
            className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-violet-500/20 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              minHeight: 'calc(100vh - 32px)',
              margin: '16px',
              marginLeft: '16px',
              borderRadius: '32px',
              boxShadow: '0 25px 50px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <AnimatePresence mode="wait">
              {!isAnyToolActive ? (
                <motion.div
                  key="dashboard-home"
                  className="p-8 pt-12 h-full overflow-y-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.1
                  }}
                >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <h1 className="headline-large text-on-surface mb-2">
                    Welcome to <span className="text-primary-40">PromptPix</span>
                  </h1>
                  <p className="body-large text-on-surface-variant mb-8">
                    Select a tool from the sidebar to get started with your creative journey.
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {tools.map((tool) => (
                    <motion.div
                      key={tool.id}
                      variants={itemVariants}
                      whileHover={{
                        y: -12,
                        scale: 1.02,
                        transition: { type: 'spring', stiffness: 400, damping: 25 }
                      }}
                    >
                      <Link
                        to={tool.path}
                        className="bg-white/90 dark:bg-gray-800/90 block p-8 h-full rounded-3xl shadow-elevation-1 transition-all duration-medium ease-emphasized border border-outline-variant/10 group hover:shadow-elevation-4"
                        style={{
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        <div className="flex items-center mb-6">
                          <div className="bg-primary-90 p-4 rounded-2xl transition-colors duration-medium shadow-elevation-1 group-hover:bg-primary-80">
                            <motion.svg
                              className="h-6 w-6 text-primary-40"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={tool.icon}
                              />
                            </motion.svg>
                          </div>
                          <h3 className="ml-4 title-large text-on-surface transition-colors duration-medium group-hover:text-primary-40">
                            {tool.name}
                          </h3>
                        </div>
                        <p className="body-medium text-on-surface-variant transition-colors duration-medium group-hover:text-on-surface">
                          Click to start using {tool.name}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="tool-content"
                className="h-full overflow-y-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.1
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.2
                  }}
                >
                  <Outlet />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
