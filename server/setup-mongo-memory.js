/**
 * MongoDB Memory Server Setup
 * 
 * This script sets up an in-memory MongoDB server for development purposes.
 * It's useful when you don't have MongoDB installed locally.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function setupMongoMemoryServer() {
  console.log('Setting up MongoDB Memory Server...');
  
  // Create MongoDB Memory Server
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  console.log(`MongoDB Memory Server running at: ${uri}`);
  
  // Update .env file with MongoDB URI
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.error('Error reading .env file:', error);
    process.exit(1);
  }
  
  // Replace MongoDB URI in .env file
  const updatedEnvContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${uri}`
  );
  
  try {
    fs.writeFileSync(envPath, updatedEnvContent);
    console.log('Updated .env file with MongoDB Memory Server URI');
  } catch (error) {
    console.error('Error writing .env file:', error);
    process.exit(1);
  }
  
  console.log('MongoDB Memory Server setup complete!');
  console.log('You can now start the server with: npm run dev');
  
  // Return mongod instance so it can be stopped later if needed
  return mongod;
}

// If this script is run directly
if (require.main === module) {
  setupMongoMemoryServer().catch(console.error);
}

module.exports = setupMongoMemoryServer;
