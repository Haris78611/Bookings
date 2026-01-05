
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole, Currency } from '../types';
import { NotificationTicker, Button } from './UI';

export const Header: React.FC = () => {
  const { siteSettings, currency, setCurrency, currentUser, logout, notifications } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <NotificationTicker notifications={notifications} />
      <header className="bg-[#005B5C] text-white sticky top-0 z-[100] shadow-lg">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <span className="text-base md:text-xl">🕋</span>
            </div>
            <span className="text-base md:text-xl font-bold tracking-tight leading-none uppercase">UmrahStay</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link to="/" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">Home</Link>
            <Link to="/search" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">Hotels</Link>
            <Link to="/my-bookings" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">My Bookings</Link>
            <Link to="/track" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">Track Booking</Link>
          </nav>

          {/* Right-side Tools */}
          <div className="flex items-center space-x-3 md:space-x-6">
            <div className="hidden sm:block relative">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-[10px] font-black outline-none appearance-none cursor-pointer min-w-[70px] hover:bg-white/20 transition-all text-white uppercase"
              >
                <option value="PKR" className="text-black">PKR</option>
                <option value="SAR" className="text-black">SAR</option>
                <option value="USD" className="text-black">USD</option>
              </select>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
              {currentUser ? (
                 <button onClick={() => { logout(); navigate('/'); }} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all">Logout</button>
              ) : (
                 <Link to="/login" className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-lg text-[#005B5C] hover:bg-gray-200 transition-all">Login</Link>
              )}
            </div>

            <button 
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-xl" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 z-[110] bg-[#004d4d] transition-all duration-500 lg:hidden ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <span className="text-xl font-bold tracking-tighter uppercase">Menu Registry</span>
              <button className="text-3xl" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
            </div>
            <nav className="flex-1 px-6 py-10 space-y-6 overflow-y-auto">
              {[
                { label: 'Home Dashboard', path: '/' },
                { label: 'Hotels Catalog', path: '/search' },
                { label: 'My Bookings', path: '/my-bookings' },
                { label: 'Track Booking', path: '/track' },
                { label: 'Global Support', path: '/support' },
              ].map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="block text-2xl font-black tracking-tight uppercase hover:text-secondary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-8 border-t border-white/10 space-y-4">
              <div className="flex gap-4 mb-6">
                {['PKR', 'SAR', 'USD'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setCurrency(c as Currency)}
                    className={`flex-1 py-3 rounded-xl font-black text-sm border transition-all ${currency === c ? 'bg-white text-primary border-white' : 'bg-transparent text-white border-white/20'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {currentUser ? (
                <Button variant="danger" fullWidth onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }}>Revoke Auth / Logout</Button>
              ) : (
                <Button variant="teal" fullWidth onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Portal Auth / Login</Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export const Footer: React.FC = () => {
  const { siteSettings } = useAppContext();
  return (
    <footer className="bg-neutralDark text-white pt-16 pb-8 border-t border-white/5">
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div>
          <h3 className="text-2xl font-black italic mb-6 text-[#006D77] uppercase tracking-tighter">UmrahStay</h3>
          <p className="text-gray-400 text-xs leading-relaxed font-medium">
            Authorized hospitality portal providing wholesale hotel rates in the Holy Cities for pilgrims worldwide since 2024.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-[#E29578] text-[10px] uppercase tracking-widest">Core Portal</h4>
          <ul className="text-gray-400 text-xs space-y-4 font-black uppercase tracking-widest">
            <li><Link to="/search" className="hover:text-white transition">Hotels Catalog</Link></li>
            <li><Link to="/track" className="hover:text-white transition">Track Booking</Link></li>
            <li><Link to="/support" className="hover:text-white transition">Global Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-[#E29578] text-[10px] uppercase tracking-widest">Partner Bridge</h4>
          <ul className="text-gray-400 text-xs space-y-4 font-black uppercase tracking-widest">
            <li><Link to="/login" className="hover:text-white transition">Agent Portal</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Admin Desk</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-[#E29578] text-[10px] uppercase tracking-widest">Contact &amp; Social</h4>
          <div className="text-gray-400 text-xs space-y-4 font-medium">
            <p className="flex items-center gap-3"><span className="opacity-50 text-base">✉️</span> {siteSettings.contactEmail}</p>
            <p className="flex items-center gap-3"><span className="opacity-50 text-base">📞</span> {siteSettings.contactPhone}</p>
          </div>
           <div className="flex items-center space-x-4 mt-6">
            <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>
            </a>
            <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>
            </a>
            <a href={`https://wa.me/${siteSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.803 6.243l-1.222 4.464 4.635-1.219z"/></svg>
            </a>
            {siteSettings.twitterUrl && <a href={siteSettings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.299 1.634 4.227 3.808 4.668-.709.192-1.468.222-2.253.084.636 1.931 2.488 3.337 4.681 3.374-1.883 1.474-4.266 2.226-6.845 2.226-.443 0-.881-.026-1.315-.077 2.291 1.464 5.028 2.322 7.917 2.322 9.471 0 14.655-7.854 14.655-14.655 0-.224-.005-.447-.015-.669.996-.716 1.862-1.618 2.557-2.656z"/></svg>
            </a>}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 pt-12 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black">
          &copy; {new Date().getFullYear()} UmrahStay Logistics Registry. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
