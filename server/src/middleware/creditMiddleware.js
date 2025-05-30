const User = require('../models/User');

/**
 * Credit validation middleware for operations that consume credits
 * @param {number} requiredCredits - Number of credits required for the operation
 * @param {string} operationType - Type of operation (for logging)
 */
const validateCredits = (requiredCredits, operationType) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: 'fail',
          message: 'Authentication required'
        });
      }

      // Get current user with latest credit balance
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }

      // Check if user has enough credits
      if (user.credits < requiredCredits) {
        return res.status(400).json({
          status: 'fail',
          message: 'Insufficient credits',
          data: {
            required: requiredCredits,
            available: user.credits,
            operationType
          }
        });
      }

      // Store user and operation info in request for later use
      req.creditInfo = {
        user,
        requiredCredits,
        operationType
      };

      next();
    } catch (error) {
      console.error('Credit validation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Credit validation failed'
      });
    }
  };
};

/**
 * Deduct credits after successful operation
 * This should be called after the operation completes successfully
 */
const deductCredits = async (req, res, next) => {
  try {
    if (!req.creditInfo) {
      // If no credit info, skip deduction (operation might be free)
      return next();
    }

    const { user, requiredCredits, operationType } = req.creditInfo;

    // Use atomic operation to deduct credits and add to history
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { credits: -requiredCredits },
        $push: {
          creditHistory: {
            operation: operationType,
            amount: -requiredCredits,
            timestamp: new Date(),
            description: `Used ${requiredCredits} credits for ${operationType}`
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found during credit deduction'
      });
    }

    // Double-check that credits weren't over-deducted due to race conditions
    if (updatedUser.credits < 0) {
      // Rollback the transaction
      await User.findByIdAndUpdate(
        user._id,
        {
          $inc: { credits: requiredCredits },
          $pop: { creditHistory: 1 }
        }
      );

      return res.status(400).json({
        status: 'fail',
        message: 'Insufficient credits - operation cancelled'
      });
    }

    // Store updated user info for response
    req.user = updatedUser;
    req.creditDeducted = true;

    next();
  } catch (error) {
    console.error('Credit deduction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Credit deduction failed'
    });
  }
};

/**
 * Add credits to user account (for purchases)
 */
const addCreditsToUser = async (userId, amount, description = 'Credits purchased') => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { credits: amount },
        $push: {
          creditHistory: {
            operation: 'purchase',
            amount: amount,
            timestamp: new Date(),
            description
          }
        }
      },
      { new: true, runValidators: true }
    );

    return updatedUser;
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
};

/**
 * Get user's credit history
 */
const getCreditHistory = async (userId, limit = 50) => {
  try {
    const user = await User.findById(userId).select('creditHistory');
    if (!user) {
      throw new Error('User not found');
    }

    // Sort by timestamp descending and limit results
    const history = user.creditHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return history;
  } catch (error) {
    console.error('Error getting credit history:', error);
    throw error;
  }
};

module.exports = {
  validateCredits,
  deductCredits,
  addCreditsToUser,
  getCreditHistory
};
