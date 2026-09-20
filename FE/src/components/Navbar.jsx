import { Link, useLocation } from 'react-router-dom';
import { Layers, Package, Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:shadow-indigo-500/30 transition">
              <Layers className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-indigo-600 transition">
              CleanLanding
            </span>
          </Link>

          <nav className="flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>

            <Link
              to="/products"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/products')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sản phẩm</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
