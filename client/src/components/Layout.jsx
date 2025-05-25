import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './md3/Footer';


const Layout = ({ children }) => {
  const location = useLocation();

  // Define routes where footer should be shown (only public marketing pages)
  const publicMarketingPages = ['/', '/about', '/contact'];
  const shouldShowFooter = publicMarketingPages.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {shouldShowFooter && <Footer />}

    </div>
  );
};

export default Layout;
