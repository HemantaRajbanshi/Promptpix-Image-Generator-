/**
 * Script to install missing dependencies for PromptPix
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing server dependencies...');

// Server dependencies
const serverDeps = [
  'axios',
  'bcrypt',
  'cookie-parser',
  'express-rate-limit',
  'form-data',
  'helmet',
  'jsonwebtoken',
  'mongoose',
  'morgan',
  'multer',
  'validator'
];

try {
  // Install server dependencies
  console.log('Installing server dependencies...');
  execSync(`cd server && npm install ${serverDeps.join(' ')} --save`, { stdio: 'inherit' });
  console.log('Server dependencies installed successfully!');
  
  console.log('\nAll dependencies installed successfully!');
  console.log('\nTo start the application:');
  console.log('1. Make sure MongoDB is running');
  console.log('2. Start the server: cd server && npm run dev');
  console.log('3. Start the client: cd client && npm run dev');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}
