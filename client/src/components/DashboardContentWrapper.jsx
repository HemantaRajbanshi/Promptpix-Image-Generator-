import { motion } from 'framer-motion';

const DashboardContentWrapper = ({ 
  children, 
  className = '', 
  delay = 0,
  enablePadding = true,
  enableScrolling = true 
}) => {
  return (
    <motion.div
      className={`h-full ${enableScrolling ? 'overflow-y-auto' : 'overflow-hidden'} ${enablePadding ? 'p-6 md:p-8' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: delay
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: delay + 0.1
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default DashboardContentWrapper;
