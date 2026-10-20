import { Link } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8e4d9] bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18392e]">
              <Hotel className="h-5 w-5 text-[#e9bd68]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#18392e]">Woliso Hotel</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/rooms" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Rooms
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <Link to="/dashboard" className="btn-secondary flex items-center gap-2 text-sm">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {user.role === 'GUEST' && (
                  <Link to="/bookings" className="btn-secondary flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    My Bookings
                  </Link>
                )}
                <button
                  onClick={() => logout.mutate()}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/" className="block text-gray-600 hover:text-primary-600 font-medium py-2">
            Home
          </Link>
          <Link to="/rooms" className="block text-gray-600 hover:text-primary-600 font-medium py-2">
            Rooms
          </Link>
          {user ? (
            <>
              {user.role === 'GUEST' ? (
                <Link to="/bookings" className="block text-gray-600 font-medium py-2">
                  My Bookings
                </Link>
              ) : (
                <Link to="/dashboard" className="block text-gray-600 font-medium py-2">
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => logout.mutate()}
                className="block w-full text-left text-red-600 font-medium py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block btn-secondary text-center">
                Sign In
              </Link>
              <Link to="/register" className="block btn-primary text-center">
                Book Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
