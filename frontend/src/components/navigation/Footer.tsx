import { Hotel, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-white/50">
      {/* Gold top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">

          {/* Brand */}
          <div>
            <Link to="/" className="group mb-7 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8501e] shadow-brand transition-all duration-200 group-hover:scale-105">
                <Hotel className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <span className="font-display block text-xl font-semibold text-white tracking-wide">Woliso</span>
                <span className="font-ui block text-[8.5px] font-medium uppercase tracking-[0.22em] text-white/30 mt-0.5">Hotel · Ethiopia</span>
              </div>
            </Link>
            <p className="font-sans max-w-xs text-sm leading-7 text-white/40">
              Welcoming guests at two branches in Woliso, Oromia. Transparent ETB pricing and genuine local hospitality.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#c9a96e]/70">
              <MapPin className="h-3.5 w-3.5 text-[#c9a96e]" />
              Woliso, Oromia, Ethiopia
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-ui mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/25">Explore</h3>
            <ul className="space-y-3.5">
              {[
                { label: 'Home',     to: '/' },
                { label: 'Rooms',    to: '/rooms' },
                { label: 'Sign In',  to: '/login' },
                { label: 'Register', to: '/register' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="font-ui text-sm transition-colors duration-150 hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Find us */}
          <div>
            <h3 className="font-ui mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/25">Find Us</h3>
            <address className="not-italic space-y-1.5 text-sm text-white/40">
              <p className="font-sans">Woliso, Oromia</p>
              <p className="font-sans">Ethiopia</p>
            </address>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-ui mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/25">Ready to Stay?</h3>
            <p className="font-sans mb-6 text-sm leading-6 text-white/40">
              "Baga nagaan dhuftan" — a warm welcome is waiting for you.
            </p>
            <Link to="/rooms"
              className="btn-primary font-ui group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm">
              Browse Rooms
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-ui text-xs text-white/20">© {new Date().getFullYear()} Woliso Hotel. All rights reserved.</p>
          <p className="font-ui text-xs text-white/15">Hospitality rooted in Woliso, Oromia.</p>
        </div>
      </div>
    </footer>
  );
}
