import { Link, useLocation } from 'react-router-dom';
import { Shield, Settings, BookOpen, Clock, Home } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Analyze', path: '/analyze', icon: <Shield size={20} /> },
    { name: 'History', path: '/history', icon: <Clock size={20} /> },
    { name: 'Education', path: '/education', icon: <BookOpen size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen hidden lg:block">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2 mb-6">
          <Shield size={24} />
          <span className="text-xl font-bold">VigilAi</span>
        </Link>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-700 transition ${
                location.pathname === item.path ? 'bg-indigo-700' : ''
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
