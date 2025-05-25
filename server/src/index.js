// Load environment variables FIRST before any other imports
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Now import other modules after environment is loaded
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes (these will now have access to environment variables)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clipdropRoutes = require('./routes/clipdropRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB with fallback to local connection
const connectToMongoDB = async () => {
  try {
    // Try to connect with the provided URI
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/promptpix');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Connected to MongoDB');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);

    // For development purposes, we can continue without MongoDB
    // In a production environment, you would want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting process due to MongoDB connection failure in production');
      process.exit(1);
    } else {
      console.log('Attempting to continue without MongoDB...');
    }
  }
};

// Initialize MongoDB connection
connectToMongoDB();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];

    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clipdrop', clipdropRoutes);

// Health check route
app.use('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PromptPix API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
  }
});
