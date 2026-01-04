
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
            <Link to="/my-bookings" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">Bookings</Link>
            <Link to="/track" className="hover:text-accent transition-colors font-bold text-[11px] uppercase tracking-widest">Verify</Link>
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
                 <Link to="/login" className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-lg text-primary hover:bg-accent transition-all">Login</Link>
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
                { label: 'Personal Bookings', path: '/my-bookings' },
                { label: 'Voucher Verification', path: '/track' },
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
            <li><Link to="/track" className="hover:text-white transition">Verify Voucher</Link></li>
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
          <h4 className="font-bold mb-6 text-[#E29578] text-[10px] uppercase tracking-widest">Authorized Contact</h4>
          <div className="text-gray-400 text-xs space-y-4 font-medium">
            <p className="flex items-center gap-3"><span className="opacity-50 text-base">✉️</span> {siteSettings.contactEmail}</p>
            <p className="flex items-center gap-3"><span className="opacity-50 text-base">📞</span> {siteSettings.contactPhone}</p>
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

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Bookings', path: '/admin/bookings', icon: '🎫' },
    { label: 'Requests', path: '/admin/requests', icon: '📩' },
    { label: 'Bulk Orders', path: '/admin/bulk-orders', icon: '📦' },
    { label: 'Hotels', path: '/admin/hotels', icon: '🏨' },
    { label: 'Agencies', path: '/admin/agencies', icon: '🤝' },
    { label: 'Invoices', path: '/admin/invoices', icon: '🧾' },
    { label: 'Financials', path: '/admin/financials', icon: '💰' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
    { label: 'Events', path: '/admin/notifications', icon: '🔔' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[200] w-14 h-14 bg-[#005B5C] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-white"
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Sidebar Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-[150] lg:hidden" onClick={() => setIsOpen(false)}></div>}

      <aside className={`fixed lg:sticky top-0 left-0 z-[160] h-screen w-64 bg-white border-r shadow-2xl lg:shadow-none transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic">Control Desk</h2>
          <button className="lg:hidden text-xl" onClick={() => setIsOpen(false)}>&times;</button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t bg-gray-50/50">
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-3 px-4 py-3 w-full text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <span className="text-lg">🚪</span> Exit Portal
          </button>
        </div>
      </aside>
    </>
  );
};
