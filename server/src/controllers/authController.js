const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');
const { createCompleteUser, createMockUser } = require('../utils/userUtils');

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
