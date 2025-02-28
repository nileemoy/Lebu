import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if current page is the extension popup
  const isExtensionPopup = location.pathname === '/popup';
  
  // Different layout for extension popup
  if (isExtensionPopup) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow p-4">
          {children}
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;