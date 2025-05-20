/**
 * Script to install missing dependencies for the PromptPix server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Dependencies to install
const dependencies = [
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

console.log('Installing missing dependencies...');

try {
  // Install dependencies
  const command = `npm install ${dependencies.join(' ')} --save`;
  execSync(command, { stdio: 'inherit' });
  
  console.log('\nAll dependencies installed successfully!');
  console.log('\nPlease restart your server with:');
  console.log('npm run dev');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}
