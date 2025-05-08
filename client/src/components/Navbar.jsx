import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  // Don't show navbar on login and signup pages
  const hideNavbarPaths = ['/login', '/signup'];
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
              PromptPix
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:justify-center flex-1">
            <div className="flex space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${location.pathname === '/'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${location.pathname === '/about'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${location.pathname === '/contact'
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <DarkModeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                    <span className="mr-2">{user?.displayName || 'User'}</span>
                    <div className="h-8 w-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user?.displayName || 'User'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to="/dashboard/profile"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={closeMenu}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  Log in
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <DarkModeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          height: isMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={closeMenu}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={closeMenu}
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center mr-3 overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.displayName || 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800 dark:text-white">{user?.displayName || 'User'}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <div className="px-3 py-2">
                  <Link
                    to="/signup"
                    className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    onClick={closeMenu}
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
