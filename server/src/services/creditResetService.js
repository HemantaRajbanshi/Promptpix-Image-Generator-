const User = require('../models/User');

/**
 * Daily Credit Reset Service
 * Handles the daily credit reset mechanism for users
 */

const DAILY_CREDIT_AMOUNT = 10;

/**
 * Check if a user needs a daily credit reset
 * @param {Object} user - User object
 * @returns {boolean} - True if reset is needed
 */
const needsDailyReset = (user) => {
  if (!user.lastCreditReset) {
    return true; // First time user, needs reset
  }

  const now = new Date();
  const lastReset = new Date(user.lastCreditReset);
  
  // Calculate hours since last reset
  const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
  
  // Reset if 24 hours have passed
  return hoursSinceReset >= 24;
};

/**
 * Reset user's daily credits
 * @param {string} userId - User ID
 * @returns {Object} - Updated user object
 */
const resetUserCredits = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if reset is needed
    if (!needsDailyReset(user)) {
      return user; // No reset needed
    }

    const now = new Date();
    const resetDescription = `Daily credit reset - ${now.toISOString().split('T')[0]}`;

    // Reset credits to exactly 10 (not additive)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          credits: DAILY_CREDIT_AMOUNT,
          lastCreditReset: now
        },
        $inc: {
          dailyCreditResetCount: 1
        },
        $push: {
          creditHistory: {
            operation: 'daily-reset',
            amount: DAILY_CREDIT_AMOUNT,
            timestamp: now,
            description: resetDescription,
            metadata: {
              resetType: 'daily',
              previousCredits: user.credits,
              resetCount: user.dailyCreditResetCount + 1
            }
          }
        }
      },
      { new: true, runValidators: true }
    );

    console.log(`Daily credit reset completed for user ${userId}. Credits set to ${DAILY_CREDIT_AMOUNT}`);
    return updatedUser;

  } catch (error) {
    console.error('Error resetting user credits:', error);
    throw error;
  }
};

/**
 * Check and reset credits for a user if needed
 * This is called during user authentication and activity
 * @param {string} userId - User ID
 * @returns {Object} - User object (potentially updated)
 */
const checkAndResetCredits = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (needsDailyReset(user)) {
      return await resetUserCredits(userId);
    }

    return user;
  } catch (error) {
    console.error('Error checking/resetting credits:', error);
    throw error;
  }
};

/**
 * Get time until next credit reset for a user
 * @param {Object} user - User object
 * @returns {Object} - Time information
 */
const getTimeUntilReset = (user) => {
  if (!user.lastCreditReset) {
    return {
      hours: 0,
      minutes: 0,
      canReset: true
    };
  }

  const now = new Date();
  const lastReset = new Date(user.lastCreditReset);
  const nextReset = new Date(lastReset.getTime() + (24 * 60 * 60 * 1000)); // 24 hours later
  
  const timeUntilReset = nextReset - now;
  
  if (timeUntilReset <= 0) {
    return {
      hours: 0,
      minutes: 0,
      canReset: true
    };
  }

  const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  return {
    hours,
    minutes,
    canReset: false,
    nextResetTime: nextReset
  };
};

/**
 * Batch reset credits for all users (for scheduled jobs)
 * @returns {Object} - Reset statistics
 */
const batchResetAllUsers = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // Find users who need credit reset
    const usersNeedingReset = await User.find({
      $or: [
        { lastCreditReset: { $lt: twentyFourHoursAgo } },
        { lastCreditReset: { $exists: false } }
      ]
    });

    let resetCount = 0;
    let errorCount = 0;

    for (const user of usersNeedingReset) {
      try {
        await resetUserCredits(user._id);
        resetCount++;
      } catch (error) {
        console.error(`Failed to reset credits for user ${user._id}:`, error);
        errorCount++;
      }
    }

    console.log(`Batch credit reset completed. Reset: ${resetCount}, Errors: ${errorCount}`);
    
    return {
      totalUsers: usersNeedingReset.length,
      resetCount,
      errorCount,
      timestamp: now
    };

  } catch (error) {
    console.error('Error in batch credit reset:', error);
    throw error;
  }
};

module.exports = {
  needsDailyReset,
  resetUserCredits,
  checkAndResetCredits,
  getTimeUntilReset,
  batchResetAllUsers,
  DAILY_CREDIT_AMOUNT
};
