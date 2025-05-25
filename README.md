# PromptPix 🖼️✨

PromptPix is a modern web application that provides powerful AI-powered image generation and editing tools. Transform your creative process with text-to-image generation, image upscaling, uncropping, background removal, and more.

## 🎮 Demo

Visit our [live demo](https://promptpix-demo.vercel.app) to try out PromptPix without installation.

> Note: The demo has limited credits for AI operations. Sign up for a full account to access all features.

## ✨ Features

### AI Image Tools

- **Text to Image**: Generate stunning images from text descriptions using advanced AI models
- **Image Upscaling**: Enhance image resolution and quality without losing details
- **Image Uncropping**: Expand your images beyond their original boundaries with AI-powered content generation
- **Background Removal**: Automatically remove backgrounds from images with precision
- **Image Editor**: Edit your images with a comprehensive set of tools

### User Features

- **User Authentication**: Secure login and registration system
- **Personal Gallery**: Save and organize your generated images
- **Credit System**: Manage usage of AI tools with a credit-based system
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing

## 🏗️ Project Structure

The project follows a client-server architecture:

```
PromptPix/
├── client/             # Frontend React application
│   ├── public/         # Static assets
│   ├── src/            # Source code
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Page components
│   │   ├── services/   # API and utility services
│   │   └── styles/     # CSS and styling files
│   ├── .env.example    # Example environment variables
│   └── package.json    # Frontend dependencies
└── server/             # Backend Express server
    ├── src/            # Source code
    │   └── index.js    # Server entry point
    ├── .env.example    # Example environment variables
    └── package.json    # Backend dependencies
```

## 🚀 Technologies Used

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Next-generation frontend tooling
- **React Router**: For navigation and routing
- **Framer Motion**: For smooth animations and transitions
- **TailwindCSS**: For styling and responsive design

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **Cors**: For cross-origin resource sharing

### APIs
- **ClipDrop API**: For AI image processing capabilities

## 🛠️ Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Clone the Repository
```bash
git clone https://github.com/yourusername/promptpix.git
cd promptpix
```

### Complete Application Setup
The easiest way to set up the entire application:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Ensure MongoDB is running
# For local MongoDB: mongod --dbpath /path/to/data/directory
# For MongoDB Atlas: Make sure your connection string is in server/.env

# Start the server
cd ../server
npm run dev

# In a new terminal, start the client
cd ../client
npm run dev
```

### Frontend Setup (Manual)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Add your ClipDrop API key to the .env file
# VITE_CLIPDROP_API_KEY=your_clipdrop_api_key

# Start development server
npm run dev
```

### Backend Setup (Manual)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Add your MongoDB connection string to the .env file
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start development server
npm run dev
```

## 🚦 Getting Started

### Quick Start
For a quick start with both frontend and backend:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start the MongoDB server (if not running)
# This step depends on your MongoDB installation method

# Start the backend server
cd ../server
npm run dev

# In a new terminal, start the frontend
cd ../client
npm run dev
```

## 📝 Usage

### Development Mode
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

### Starting the Server Manually
If you need to start just the server:

```bash
# Navigate to server directory
cd server

# Start in development mode (with auto-restart)
npm run dev

# OR start in production mode
npm start
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Browser Support
PromptPix supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🖼️ Image Resources

### Development Images
To download placeholder images for development:
```bash
cd client/public
node download-images.js
```

This will download 12 random AI-themed images from Unsplash and save them to the `client/public/images` directory.

### Image Naming Convention
Images should follow the naming convention:
- `ai-image-1.jpg`
- `ai-image-2.jpg`
- etc.

## 🔑 API Integration

PromptPix uses the ClipDrop API for AI image processing. You'll need to:

1. Sign up for a ClipDrop API key at [https://clipdrop.co/apis](https://clipdrop.co/apis)
2. Add your API key to the `.env` file in the client directory

## 💻 Development

### Client
The client is built with React and uses Vite for development and building. Key features:

- **React Router**: For navigation with future flags enabled
- **Context API**: For state management (auth, theme, etc.)
- **Framer Motion**: For animations and transitions
- **TailwindCSS**: For styling with a custom theme

### Server
The server is a simple Express application that serves the API and static files in production.

### Performance Optimizations
The application includes several performance optimizations:

- **Debouncing**: Form inputs use debouncing to prevent excessive API calls
- **Batched Updates**: Changes are batched and sent in a single request
- **Differential Updates**: Only changed fields are sent to the server
- **Optimistic UI Updates**: UI updates immediately while changes are saved in the background
- **Server-side Throttling**: Prevents excessive requests from overwhelming the server

### Code Organization
The codebase follows best practices for organization and maintainability:

- **Utility Functions**: Common functionality is extracted into reusable utility functions
- **Consistent Naming**: Files and components follow consistent naming conventions
- **Documentation**: Code is well-documented with JSDoc comments
- **Separation of Concerns**: Logic is separated into appropriate layers (UI, services, utilities)
- **Error Handling**: Comprehensive error handling throughout the application

### Local Storage
For development simplicity, the application uses localStorage for:
- User authentication
- Image gallery storage
- User preferences

## 📄 License

[MIT License](LICENSE)

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
- Ensure MongoDB is running locally or your Atlas connection string is correct
- Check that your IP address is whitelisted in MongoDB Atlas
- Verify the connection string in your `.env` file

#### Server Won't Start
- Check if port 5001 is already in use (try a different port in `.env`)
- Ensure all dependencies are installed (`npm install` in server directory)
- Check server logs for specific error messages

#### Client Won't Start
- Ensure port 5173 is available
- Check if all dependencies are installed (`npm install` in client directory)
- Clear browser cache if you're seeing stale data

#### Authentication Issues
- Clear localStorage in your browser
- Check that JWT_SECRET is set in server `.env`
- Ensure MongoDB is properly storing user data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the PromptPix Team
