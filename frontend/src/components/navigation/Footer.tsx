import { Hotel } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#132c24] py-12 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e9bd68]">
                <Hotel className="h-5 w-5 text-[#18392e]" />
              </div>
              <span className="font-bold text-xl text-white">Woliso Hotel</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Woliso Hotel welcomes guests at our branches in Woliso, Oromia, Ethiopia.
              Browse rooms and book your stay in Ethiopian Birr (ETB).
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[#f2dca7]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-white transition-colors">Rooms</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-[#f2dca7]">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Woliso, Oromia</li>
              <li>Ethiopia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} Woliso Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
