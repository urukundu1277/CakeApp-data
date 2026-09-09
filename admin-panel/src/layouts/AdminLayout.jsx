import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Products', href: '/products', icon: '🎂' },
    { name: 'Categories', href: '/categories', icon: '📁' },
    { name: 'Orders', href: '/orders', icon: '📦' },
    { name: 'Notifications', href: '/notifications', icon: '🔔' },
    { name: 'Customers', href: '/customers', icon: '👥' },
    { name: 'Sliders', href: '/sliders', icon: '🖼️' },
    { name: 'Banners', href: '/announcements', icon: '📢' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-4">
            <h1 className="text-2xl font-bold">OrderCake Admin</h1>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 ${
                  isActive(item.href) ? 'bg-gray-800 text-white' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
