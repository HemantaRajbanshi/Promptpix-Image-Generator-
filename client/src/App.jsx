import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routerConfig } from './router-config';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import UserProfile from './pages/UserProfile';
import UpgradePlans from './pages/UpgradePlans';

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
    {
      path: "/",
      element: (
        <AuthProvider>
          <Layout>
            <Outlet />
          </Layout>
        </AuthProvider>
      ),
      children: [
        { index: true, element: <LandingPage /> },
        { path: "about", element: <AboutUs /> },
        { path: "contact", element: <ContactUs /> },
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },

        {
          path: "dashboard",
          element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
          children: [
            { path: "text-to-image", element: <TextToImage /> },
            { path: "upscale", element: <Upscale /> },
            { path: "uncrop", element: <Uncrop /> },
            { path: "remove-bg", element: <RemoveBackground /> },
            { path: "image-editor", element: <ImageEditor /> },
            { path: "gallery", element: <Gallery /> },
            { path: "profile", element: <UserProfile /> },
            { path: "upgrade", element: <UpgradePlans /> }
          ]
        },
        { path: "*", element: <Navigate to="/" /> }
      ]
    }
  ],
  routerConfig
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
