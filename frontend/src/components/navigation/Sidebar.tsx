import { Link, useLocation } from 'react-router-dom';
import {
  Hotel,
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Tag,
  Bell,
  BookOpen,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Rooms', icon: BedDouble, href: '/admin/rooms' },
  { label: 'Room Types', icon: Tag, href: '/admin/room-types' },
  { label: 'Bookings', icon: CalendarCheck, href: '/admin/bookings' },
  { label: 'Guests', icon: Users, href: '/admin/guests' },
  { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
];

const guestNavItems = [
  { label: 'My Bookings', icon: BookOpen, href: '/bookings' },
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Profile', icon: User, href: '/profile' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = user?.role === 'GUEST' ? guestNavItems : adminNavItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <Hotel className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900">HMS</p>
          <p className="text-xs text-gray-500">Hotel Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-100'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
