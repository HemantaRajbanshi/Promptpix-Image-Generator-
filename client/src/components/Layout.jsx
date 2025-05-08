import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Don't show footer on dashboard pages
  const isDashboardPage = location.pathname.includes('/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className={`flex-grow ${isDashboardPage ? 'pb-0' : 'pb-4'}`}>
        {children}
      </main>
      {!isDashboardPage && <Footer />}
    </div>
  );
};

export default Layout;
