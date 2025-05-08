import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreditsDisplay from '../components/CreditsDisplay';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { scrollY } = useScroll();

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
        { id: 'upgrade', name: 'Upgrade Plan', path: '/dashboard/upgrade', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <motion.div
          className="w-64 bg-white dark:bg-gray-800 shadow-md h-full overflow-y-auto border-r border-gray-100 dark:border-gray-700 relative group"
          initial="hidden"
          animate="visible"
          variants={sidebarVariants}
          whileHover={{ x: 2 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Subtle glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 pointer-events-none"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.div
            className="p-5 border-b border-gray-100 dark:border-gray-700"
            variants={sidebarItemVariants}
          >
            <div className="flex justify-between items-center mb-3">
              <motion.h2
                className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: 0.2
                }}
              >
                Dashboard
              </motion.h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 20,
                  delay: 0.3
                }}
              >
                <CreditsDisplay />
              </motion.div>
            </div>
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-300 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome, <span className="text-purple-600 dark:text-purple-400">{user?.displayName}</span>
            </motion.p>
          </motion.div>

          <motion.nav
            className="mt-6 px-2 relative"
            variants={containerVariants}
            style={{
              opacity: useTransform(scrollY, [0, 100], [1, 0.97]),
              scale: useTransform(scrollY, [0, 100], [1, 0.98])
            }}
          >
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                className="mb-6"
                variants={sidebarSectionVariants}
                custom={sectionIndex}
              >
                <motion.h3
                  className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  variants={sidebarItemVariants}
                >
                  {section.title}
                </motion.h3>
                <motion.ul
                  className="space-y-1"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {section.items.map((item, itemIndex) => (
                    <motion.li
                      key={item.id}
                      variants={sidebarItemVariants}
                      whileHover={{ x: 4 }}
                      custom={itemIndex}
                    >
                      <Link
                        to={item.path}
                        className={`sidebar-item ${
                          isToolActive(item.path)
                            ? 'sidebar-item-active'
                            : 'sidebar-item-inactive'
                        }`}
                      >
                        <motion.div
                          variants={iconVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                        >
                          <svg
                            className={`mr-3 h-5 w-5 ${
                              isToolActive(item.path) ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={item.icon}
                            />
                          </svg>
                        </motion.div>
                        <motion.span
                          className="font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * itemIndex + 0.2 }}
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <AnimatePresence mode="wait">
            {!isAnyToolActive ? (
              <motion.div
                key="dashboard-home"
                className="p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">PromptPix</span>
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                    Select a tool from the sidebar to get started with your creative journey.
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {tools.map((tool) => (
                    <motion.div
                      key={tool.id}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                    >
                      <Link
                        to={tool.path}
                        className="dashboard-card group block p-6 h-full"
                      >
                        <div className="flex items-center mb-4">
                          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors duration-300">
                            <motion.svg
                              className="h-6 w-6 text-purple-600 dark:text-purple-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              whileHover={{ rotate: 10 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={tool.icon}
                              />
                            </motion.svg>
                          </div>
                          <h3 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {tool.name}
                          </h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
