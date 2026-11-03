import { Link, useLocation } from 'react-router-dom';
import {
  Hotel, Building2, LayoutDashboard, BedDouble, CalendarCheck,
  Users, CreditCard, BarChart3, X, Tag, Bell, BookOpen, User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

interface SidebarProps { isOpen: boolean; onClose: () => void; }

const adminNav = [
  { label: 'Dashboard',  icon: LayoutDashboard, href: '/dashboard',       section: 'Overview' },
  { label: 'Rooms',      icon: BedDouble,        href: '/admin/rooms',     section: 'Manage' },
  { label: 'Branches',   icon: Building2,        href: '/admin/branches',  section: 'Manage' },
  { label: 'Room Types', icon: Tag,              href: '/admin/room-types',section: 'Manage' },
  { label: 'Bookings',   icon: CalendarCheck,    href: '/admin/bookings',  section: 'Manage' },
  { label: 'Guests',     icon: Users,            href: '/admin/guests',    section: 'Manage' },
  { label: 'Payments',   icon: CreditCard,       href: '/admin/payments',  section: 'Reports' },
  { label: 'Analytics',  icon: BarChart3,        href: '/admin/analytics', section: 'Reports' },
];

const guestNav = [
  { label: 'My Bookings',   icon: BookOpen, href: '/bookings',      section: 'Account' },
  { label: 'Notifications', icon: Bell,     href: '/notifications', section: 'Account' },
  { label: 'Profile',       icon: User,     href: '/profile',       section: 'Account' },
];

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation();
  const { user }     = useAuthStore();

  const items = user?.role === 'GUEST'
    ? guestNav
    : adminNav.filter((i) => !['/admin/branches', '/admin/room-types'].includes(i.href) || user?.role === 'ADMIN');

  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <div className="flex h-full flex-col bg-white border-r border-stone-200">
      {/* Logo */}
      <div className="flex h-[68px] items-center gap-2.5 border-b border-stone-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8501e]">
          <Hotel className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-display text-[16px] font-semibold text-stone-900">Woliso</p>
          <p className="font-ui text-[8px] font-medium uppercase tracking-[0.2em] text-stone-400">Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => {
          const sectionItems = items.filter((i) => i.section === section);
          return (
            <div key={section} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c8c2b8]">{section}</p>
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                        active
                          ? 'bg-[#fff3ee] text-[#e8501e]'
                          : 'text-[#5a5650] hover:bg-[#f5f3f0] hover:text-[#1a1a1a]',
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#e8501e]' : 'text-[#a09890]')} />
                      {item.label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e8501e]" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-[#eceae5] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#faf9f7] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8501e] text-xs font-bold text-white">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1a1a1a]">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#a09890]">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <SidebarContent onClose={onClose} />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative w-60 shadow-xl">
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-[#787068] hover:bg-[#f5f3f0]"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
