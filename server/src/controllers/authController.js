const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');
const { createCompleteUser, createMockUser } = require('../utils/userUtils');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 days
  });
};

// Send JWT as cookie and in response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Register a new user
exports.signup = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const newUser = await User.create({
        email,
        password,
        displayName,
        credits: 10 // Give new users 10 free credits
      });

      // Send token
      createSendToken(newUser, 201, req, res);
    } catch (dbError) {
      console.error('Database error during signup:', dbError);

      // For development, create a mock user if MongoDB is not available
      if (process.env.NODE_ENV !== 'production') {
        console.log('Creating mock user for development...');
        const mockUser = {
          _id: '123456789012345678901234',
          email,
          displayName,
          credits: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Send token for mock user
        createSendToken(mockUser, 201, req, res);
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    try {
      // Find user by email and include password field
      const user = await User.findOne({ email }).select('+password');

      // Check if user exists and password is correct
      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect email or password'
        });
      }

      // Send token
      createSendToken(user, 200, req, res);
    } catch (dbError) {
      console.error('Database error during login:', dbError);

      // For development, create a mock user if MongoDB is not available
      if (process.env.NODE_ENV !== 'production') {
        console.log('Creating mock user for development...');
        // For demo purposes, allow login with test@example.com/password
        if (email === 'test@example.com' && password === 'password') {
          const mockUser = {
            _id: '123456789012345678901234',
            email,
            displayName: 'Test User',
            credits: 100,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Send token for mock user
          createSendToken(mockUser, 200, req, res);
        } else {
          return res.status(401).json({
            status: 'fail',
            message: 'Incorrect email or password'
          });
        }
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

// Protect routes - middleware to check if user is logged in
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    try {
      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      try {
        // Check if user still exists
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
          // For development or when user not found, create a complete mock user
          if (process.env.NODE_ENV !== 'production') {
            // Create a complete mock user with all required fields
            const mockUser = createMockUser(decoded.id);

            // Grant access to protected route with mock user
            req.user = mockUser;
            return next();
          } else {
            return res.status(401).json({
              status: 'fail',
              message: 'The user belonging to this token no longer exists.'
            });
          }
        }

        // Convert to plain object and ensure all required fields are present
        const userObject = currentUser.toObject ? currentUser.toObject() : { ...currentUser };
        const completeUser = createCompleteUser(userObject);

        // Grant access to protected route with complete user object
        req.user = completeUser;
        next();
      } catch (dbError) {
        // For development, create a mock user if MongoDB is not available
        if (process.env.NODE_ENV !== 'production') {
          // Create a complete mock user with all required fields
          const mockUser = createMockUser(decoded.id, 'error');

          // Grant access to protected route with mock user
          req.user = mockUser;
          next();
        } else {
          throw dbError;
        }
      }
    } catch (jwtError) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token or token expired'
      });
    }
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Authentication failed'
    });
  }
};

// Store for OTP codes (in production, use Redis or database)
const otpStore = new Map();

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide current password and new password'
      });
    }

    try {
      // Get user with password
      const user = await User.findById(userId).select('+password');

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }

      // Check if current password is correct
      if (!(await user.correctPassword(currentPassword, user.password))) {
        return res.status(400).json({
          status: 'fail',
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (dbError) {
      console.error('Database error during password update:', dbError);

      // For development, simulate success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Simulating password update for development...');
        res.status(200).json({
          status: 'success',
          message: 'Password updated successfully (development mode)'
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating password'
    });
  }
};

// Send OTP for forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email address'
      });
    }

    try {
      // Check if user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'No user found with that email address'
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP with expiration (5 minutes)
      otpStore.set(email, {
        otp,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      // Send OTP via email
      try {
        const emailResult = await emailService.sendOTPEmail(email, otp);

        console.log(`✅ OTP email sent successfully to ${email}`);

        res.status(200).json({
          status: 'success',
          message: 'A 6-digit verification code has been sent to your email address. Please check your inbox and spam folder.',
          emailSent: true
        });
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${email}:`, emailError.message);

        // If email fails, still allow the process to continue but inform the user
        res.status(500).json({
          status: 'error',
          message: 'Failed to send email. Please check your email address and try again, or contact support if the problem persists.'
        });
      }
    } catch (dbError) {
      console.error('Database error during forgot password:', dbError);

      // For development, simulate OTP generation and email sending
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Database unavailable, using fallback email service...');

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiration (5 minutes)
        otpStore.set(email, {
          otp,
          expires: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // Try to send email even in fallback mode
        try {
          await emailService.sendOTPEmail(email, otp);
          console.log(`✅ Fallback: OTP email sent successfully to ${email}`);

          res.status(200).json({
            status: 'success',
            message: 'A 6-digit verification code has been sent to your email address. Please check your inbox and spam folder.',
            emailSent: true
          });
        } catch (emailError) {
          console.error(`❌ Fallback email failed for ${email}:`, emailError.message);

          res.status(500).json({
            status: 'error',
            message: 'Failed to send email. Please check your email address and try again, or contact support if the problem persists.'
          });
        }
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while sending OTP'
    });
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email, OTP, and new password'
      });
    }

    // Check OTP
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
      return res.status(400).json({
        status: 'fail',
        message: 'OTP not found or expired'
      });
    }

    if (storedOtpData.expires < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({
        status: 'fail',
        message: 'OTP has expired'
      });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid OTP'
      });
    }

    try {
      // Find user and update password
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Remove OTP from store
      otpStore.delete(email);

      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (dbError) {
      console.error('Database error during password reset:', dbError);

      // For development, simulate success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Simulating password reset for development...');

        // Remove OTP from store
        otpStore.delete(email);

        res.status(200).json({
          status: 'success',
          message: 'Password reset successfully (development mode)'
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while resetting password'
    });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your password to confirm account deletion'
      });
    }

    try {
      // Get user with password
      const user = await User.findById(userId).select('+password');

      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }

      // Verify password
      if (!(await user.correctPassword(password, user.password))) {
        return res.status(400).json({
          status: 'fail',
          message: 'Incorrect password. Account deletion cancelled.'
        });
      }

      // Delete the user account
      await User.findByIdAndDelete(userId);

      // Clear the JWT cookie
      res.cookie('jwt', 'deleted', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
      });

      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully'
      });
    } catch (dbError) {
      console.error('Database error during account deletion:', dbError);

      // For development, simulate success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Simulating account deletion for development...');

        // Clear the JWT cookie
        res.cookie('jwt', 'deleted', {
          expires: new Date(Date.now() + 10 * 1000),
          httpOnly: true
        });

        res.status(200).json({
          status: 'success',
          message: 'Account deleted successfully (development mode)'
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting account'
    });
  }
};
