import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '',
  animate = true 
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const SkeletonShimmer = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {animate && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      )}
    </div>
  );

  // Image Card Skeleton
  const ImageCardSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 overflow-hidden"
      style={{
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <SkeletonShimmer className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
      <div className="p-6 space-y-4">
        <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-3/4" />
        <SkeletonShimmer className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/2" />
      </div>
    </motion.div>
  );

  // Gallery Grid Skeleton
  const GalleryGridSkeleton = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="break-inside-avoid mb-6"
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 overflow-hidden">
            <SkeletonShimmer 
              className={`bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600`}
              style={{ height: `${200 + (index % 3) * 100}px` }}
            />
            <div className="p-4 space-y-3">
              <SkeletonShimmer className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-2/3" />
              <SkeletonShimmer className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/3" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Tool Card Skeleton
  const ToolCardSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 p-8"
      style={{
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-center mb-6">
        <SkeletonShimmer className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl" />
        <div className="ml-4 flex-1">
          <SkeletonShimmer className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-3/4 mb-2" />
        </div>
      </div>
      <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-full mb-2" />
      <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-2/3" />
    </motion.div>
  );

  // Profile Stats Skeleton
  const ProfileStatsSkeleton = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 p-6 text-center"
        >
          <SkeletonShimmer className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mx-auto mb-4" />
          <SkeletonShimmer className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-16 mx-auto mb-2" />
          <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-20 mx-auto" />
        </motion.div>
      ))}
    </motion.div>
  );

  // Content Block Skeleton
  const ContentBlockSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-violet-500/20 p-8 space-y-6"
    >
      <div className="space-y-4">
        <SkeletonShimmer className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-1/3" />
        <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-full" />
        <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-3/4" />
        <SkeletonShimmer className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/2" />
      </div>
    </motion.div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'gallery':
        return <GalleryGridSkeleton />;
      case 'tools':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {Array.from({ length: count }).map((_, index) => (
              <ToolCardSkeleton key={index} />
            ))}
          </motion.div>
        );
      case 'profile-stats':
        return <ProfileStatsSkeleton />;
      case 'content':
        return <ContentBlockSkeleton />;
      case 'card':
      default:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {Array.from({ length: count }).map((_, index) => (
              <ImageCardSkeleton key={index} />
            ))}
          </motion.div>
        );
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
