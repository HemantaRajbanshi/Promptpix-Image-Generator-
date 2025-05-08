import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for user's preference on component mount
  useEffect(() => {
    // Add transition class to HTML element for smooth transitions
    document.documentElement.classList.add('transition-colors', 'duration-300');

    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-gray-700 dark:text-gray-200 hover:shadow-md transition-all"
      whileHover={{ scale: 1.1, rotate: isDarkMode ? -15 : 15 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.svg
              key="sun"
              className="absolute w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="moon"
              className="absolute w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-yellow-300 dark:bg-blue-400 opacity-70 animate-pulse" style={{ animationDelay: '0.1s' }}></span>
      <span className="absolute bottom-1 left-0 w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-600 opacity-70 animate-pulse" style={{ animationDelay: '0.3s' }}></span>
    </motion.button>
  );
};

export default DarkModeToggle;
