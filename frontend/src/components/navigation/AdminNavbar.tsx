import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useNotifications';
import { getInitials } from '../../lib/utils';

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { data: unreadData } = useUnreadCount();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = unreadData?.count || 0;
  const pageTitle = ({
    '/dashboard': 'Dashboard',
    '/admin/rooms': 'Rooms',
    '/admin/branches': 'Branches',
    '/admin/room-types': 'Room types',
    '/admin/bookings': 'Bookings',
    '/admin/guests': 'Guests',
    '/admin/payments': 'Payments',
    '/admin/analytics': 'Analytics',
    '/bookings': 'My bookings',
    '/profile': 'Your profile',
    '/notifications': 'Notifications',
  } as Record<string, string>)[pathname] || (pathname.startsWith('/bookings/') ? 'Booking details' : 'Hotel workspace');

  return (
    <header className="flex h-[4.5rem] flex-shrink-0 items-center justify-between border-b border-[#e3e2dc] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="rounded-xl border border-[#e7e5dc] p-2 text-[#526056] transition-colors hover:bg-[#f4f3ed] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#898a82] sm:block">Woliso Hotel · Workspace</p>
          <h1 className="truncate text-base font-bold tracking-tight text-[#171a17] sm:mt-0.5 sm:text-lg">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="relative rounded-xl border border-transparent p-2.5 text-[#55574f] transition-colors hover:border-[#e3e2dc] hover:bg-[#f4f3ef]"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f05a3a] px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:border-[#e3e2dc] hover:bg-[#f4f3ef]"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#171a17]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-[#ff8060]">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </span>
              )}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-[#20231f]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#858d83]">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 animate-fade-in rounded-2xl border border-[#e3e2dc] bg-white p-1.5 shadow-[0_16px_40px_rgba(24,25,20,0.14)]">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#f7f5ef]"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <hr className="my-1 border-[#eeede7]" />
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout.mutate();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
