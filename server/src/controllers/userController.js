const User = require('../models/User');
const { createCompleteUser } = require('../utils/userUtils');
const { addCreditsToUser, getCreditHistory } = require('../middleware/creditMiddleware');
const { getTimeUntilReset, checkAndResetCredits } = require('../services/creditResetService');

// Throttling map to limit update frequency
// Key: userId, Value: timestamp of last update
const updateThrottleMap = new Map();

/**
 * Filter object to only include allowed fields
 * @param {Object} obj - Object to filter
 * @param  {...String} allowedFields - Fields to allow
 * @returns {Object} Filtered object
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    // If no user in request, return error
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }

    // Ensure we have a proper user object with all required fields
    const completeUser = createCompleteUser(req.user);

    return res.status(200).json({
      status: 'success',
      data: {
        user: completeUser
      }
    });
  } catch (error) {
    // Even in case of error, try to return a valid user object if req.user exists
    if (req.user) {
      // Create a fallback user with error-specific values
      const fallbackUser = createCompleteUser({
        ...req.user,
        bio: 'This is a fallback user created after an error.'
      });

      return res.status(200).json({
        status: 'success',
        data: {
          user: fallbackUser
        }
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve user data'
    });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Implement throttling to prevent excessive updates
    const now = Date.now();
    const lastUpdate = updateThrottleMap.get(userId);
    const THROTTLE_WINDOW = 500; // 500ms minimum between updates

    if (lastUpdate && now - lastUpdate < THROTTLE_WINDOW) {
      return res.status(429).json({
        status: 'throttled',
        message: 'Too many update requests. Please wait before trying again.'
      });
    }

    // Update throttle map with current timestamp
    updateThrottleMap.set(userId, now);

    // Filter out fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'displayName', 'profilePicture', 'bio', 'imagesGenerated', 'imagesEdited');

    // Only proceed if there are fields to update
    if (Object.keys(filteredBody).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No valid fields to update'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    // Convert MongoDB document to plain object and ensure all required fields are present
    const userObject = updatedUser.toObject();
    const completeUser = createCompleteUser(userObject);

    res.status(200).json({
      status: 'success',
      data: {
        user: completeUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Add credits to user
exports.addCredits = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid amount'
      });
    }

    // Use the credit middleware function for consistency
    const updatedUser = await addCreditsToUser(
      req.user.id,
      amount,
      description || `Added ${amount} credits`
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Use credits
exports.useCredits = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid amount'
      });
    }

    // Find user
    const user = await User.findById(req.user.id);

    // Check if user has enough credits
    if (user.credits < amount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough credits'
      });
    }

    // Update credits
    user.credits -= amount;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get user's credit history
exports.getCreditHistory = async (req, res) => {
  try {
    const { limit } = req.query;
    const history = await getCreditHistory(req.user.id, limit ? parseInt(limit) : 50);

    res.status(200).json({
      status: 'success',
      data: {
        history
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get dashboard data with recent activity and credit information
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get updated user data with potential credit reset
    const user = await checkAndResetCredits(userId);

    // Get recent credit history (last 20 items)
    const recentActivity = await getCreditHistory(userId, 20);

    // Filter activity for different types
    const imageGenerations = recentActivity.filter(item => item.operation === 'text-to-image');
    const backgroundRemovals = recentActivity.filter(item => item.operation === 'remove-background');
    const creditResets = recentActivity.filter(item => item.operation === 'daily-reset');

    // Get time until next reset
    const resetInfo = getTimeUntilReset(user);

    // Calculate today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysActivity = recentActivity.filter(item => {
      const itemDate = new Date(item.timestamp);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    const todaysCreditsUsed = todaysActivity
      .filter(item => item.amount < 0)
      .reduce((total, item) => total + Math.abs(item.amount), 0);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          displayName: user.displayName,
          email: user.email,
          credits: user.credits,
          imagesGenerated: user.imagesGenerated,
          imagesEdited: user.imagesEdited,
          lastCreditReset: user.lastCreditReset,
          dailyCreditResetCount: user.dailyCreditResetCount
        },
        creditInfo: {
          currentCredits: user.credits,
          dailyLimit: 10,
          todaysUsage: todaysCreditsUsed,
          remainingToday: Math.max(0, 10 - todaysCreditsUsed),
          timeUntilReset: resetInfo
        },
        recentActivity: {
          all: recentActivity.slice(0, 10), // Last 10 activities
          imageGenerations: imageGenerations.slice(0, 5),
          backgroundRemovals: backgroundRemovals.slice(0, 5),
          creditResets: creditResets.slice(0, 3)
        },
        statistics: {
          totalImagesGenerated: user.imagesGenerated || 0,
          totalImagesEdited: user.imagesEdited || 0,
          totalCreditResets: user.dailyCreditResetCount || 0,
          memberSince: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load dashboard data'
    });
  }
};

// Get current credit status and reset information
exports.getCreditStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get updated user data with potential credit reset
    const user = await checkAndResetCredits(userId);

    // Get time until next reset
    const resetInfo = getTimeUntilReset(user);

    res.status(200).json({
      status: 'success',
      data: {
        credits: user.credits,
        lastReset: user.lastCreditReset,
        resetCount: user.dailyCreditResetCount,
        timeUntilReset: resetInfo,
        dailyLimit: 10
      }
    });
  } catch (error) {
    console.error('Error getting credit status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get credit status'
    });
  }
};

