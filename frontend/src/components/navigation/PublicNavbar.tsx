import { Link, NavLink } from 'react-router-dom';
import { Hotel, Menu, X, User, LogOut, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

const navLinks = [
  { label: 'Home',  to: '/' },
  { label: 'Rooms', to: '/rooms' },
];

export default function PublicNavbar() {
  const [open,   setOpen]   = useState(false);
  const [lifted, setLifted] = useState(false);
  const { user }  = useAuthStore();
  const logout    = useLogout();

  useEffect(() => {
    const fn = () => setLifted(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        lifted
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
      }`}
      style={{ borderBottom: lifted ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent' }}
    >
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link to="/" onClick={() => setOpen(false)} className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8501e] shadow-brand transition-all duration-300 group-hover:scale-105">
            <Hotel className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
          </div>
          <div>
            <span className="block font-display text-xl font-semibold leading-none tracking-wide text-stone-900">Woliso</span>
            <span className="block font-ui text-[9px] font-medium uppercase tracking-[0.22em] text-stone-400 mt-0.5">Hotel · Ethiopia</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `font-ui relative px-4 py-2 text-[13px] font-semibold tracking-wide rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'text-[#e8501e]'
                    : 'text-stone-500 hover:text-stone-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-px bg-[#e8501e] rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === 'GUEST' && (
                <Link to="/bookings" className="font-ui flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                  <User className="h-3.5 w-3.5" /> My trips
                </Link>
              )}
              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link to="/dashboard" className="font-ui flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8501e] font-ui text-[11px] font-bold text-white">
                  {initials}
                </div>
                <span className="font-ui text-sm font-semibold text-stone-800">{user.firstName}</span>
              </div>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-ui px-4 py-2 text-[13px] font-semibold text-stone-500 hover:text-stone-900 transition-colors rounded-lg hover:bg-stone-100">
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary font-ui gap-1.5 rounded-xl px-4 py-2.5 text-[13px]"
              >
                Book a room
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors md:hidden"
        >
          {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="animate-[slideDown_0.25s_ease_forwards] border-t border-stone-100 bg-white/98 backdrop-blur-md px-5 pb-6 pt-3 md:hidden">
          <div className="space-y-0.5">
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-ui block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#fff5f0] text-[#e8501e]' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8501e] font-ui text-sm font-bold text-white">{initials}</div>
                  <div>
                    <p className="font-ui text-sm font-bold text-stone-900">{user.firstName} {user.lastName}</p>
                    <p className="font-ui text-[10px] uppercase tracking-[0.15em] text-stone-400">{user.role}</p>
                  </div>
                </div>
                {user.role === 'GUEST' ? (
                  <Link to="/bookings" onClick={() => setOpen(false)} className="font-ui flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
                    <User className="h-4 w-4" /> My Bookings
                  </Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="font-ui flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                )}
                <button type="button" onClick={() => { setOpen(false); logout.mutate(); }}
                  className="font-ui flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}
                  className="font-ui block w-full rounded-xl border border-stone-200 py-3 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="btn-primary font-ui block w-full rounded-xl py-3 text-center text-sm">
                  Book a room
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
