import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import DashboardContentWrapper from '../../components/DashboardContentWrapper';
import Card from '../../components/md3/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardHome = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format time until reset
  const formatTimeUntilReset = (timeInfo) => {
    if (!timeInfo) return 'Calculating...';
    
    const { hours, minutes } = timeInfo;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get operation icon
  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'text-to-image':
        return '🎨';
      case 'remove-background':
        return '✂️';
      case 'daily-reset':
        return '🔄';
      default:
        return '⚡';
    }
  };

  // Get operation display name
  const getOperationName = (operation) => {
    switch (operation) {
      case 'text-to-image':
        return 'Image Generation';
      case 'remove-background':
        return 'Background Removal';
      case 'daily-reset':
        return 'Daily Credit Reset';
      default:
        return operation;
    }
  };

  if (loading) {
    return (
      <DashboardContentWrapper>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </DashboardContentWrapper>
    );
  }

  if (error) {
    return (
      <DashboardContentWrapper>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary-40 text-white rounded-lg hover:bg-primary-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardContentWrapper>
    );
  }

  const { creditInfo, recentActivity, statistics } = dashboardData || {};

  return (
    <DashboardContentWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.displayName || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your creative dashboard overview
          </p>
        </div>

        {/* Credit Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-200/50 dark:border-purple-700/50">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {creditInfo?.currentCredits || 0}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Available Credits
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Out of {creditInfo?.dailyLimit || 10} daily
              </div>
            </Card>
          </motion.div>

          {/* Credits Used Today */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200/50 dark:border-blue-700/50">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {creditInfo?.todaysUsage || 0}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Used Today
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {creditInfo?.remainingToday || 0} remaining
              </div>
            </Card>
          </motion.div>

          {/* Time Until Reset */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200/50 dark:border-green-700/50">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatTimeUntilReset(creditInfo?.timeUntilReset)}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Until Reset
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                Daily refresh
              </div>
            </Card>
          </motion.div>

          {/* Total Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-200/50 dark:border-orange-700/50">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {statistics?.totalImagesGenerated || 0}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Images Created
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                All time
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            
            {recentActivity?.all?.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.all.map((activity, index) => (
                  <motion.div
                    key={`${activity.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getOperationIcon(activity.operation)}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getOperationName(activity.operation)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      activity.amount > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {activity.amount > 0 ? '+' : ''}{activity.amount} credits
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎨</div>
                <p>No recent activity yet</p>
                <p className="text-sm">Start creating to see your activity here!</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎨</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Generate Image
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    2 credits per generation
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">✂️</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Remove Background
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    2 credits per removal
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </DashboardContentWrapper>
  );
};

export default DashboardHome;
