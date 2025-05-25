import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routerConfig } from './router-config';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import UserProfile from './pages/UserProfile';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';

// Tool Pages
import TextToImage from './pages/tools/TextToImage';
import Upscale from './pages/tools/Upscale';
import Uncrop from './pages/tools/Uncrop';
import RemoveBackground from './pages/tools/RemoveBackground';
import ImageEditor from './pages/tools/ImageEditor';
import Gallery from './pages/Gallery';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Create router with explicit future flags
const router = createBrowserRouter(
  // Routes configuration
  [
    // Public routes with Layout (Navbar + Footer)
    {
      path: "/",
      element: (
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <Outlet />
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      ),
      children: [
        { index: true, element: <LandingPage /> },
        { path: "about", element: <About /> },
        { path: "contact", element: <Contact /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        { path: "forgot-password", element: <ForgotPassword /> },
      ]
    },
    // Dashboard routes - Standalone interface without Layout
    {
      path: "/dashboard",
      element: (
        <ThemeProvider>
          <AuthProvider>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      ),
      children: [
        { path: "text-to-image", element: <TextToImage /> },
        { path: "upscale", element: <Upscale /> },
        { path: "uncrop", element: <Uncrop /> },
        { path: "remove-bg", element: <RemoveBackground /> },
        { path: "image-editor", element: <ImageEditor /> },
        { path: "gallery", element: <Gallery /> },
        { path: "profile", element: <UserProfile /> },
        { path: "upgrade", element: <Pricing /> },
        { path: "settings", element: <Settings /> }
      ]
    },
    // Catch-all redirect
    { path: "*", element: <Navigate to="/" /> }
  ],
  routerConfig
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
