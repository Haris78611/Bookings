
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole, Currency } from '../types';
import { NotificationTicker } from './UI';

export const Header: React.FC = () => {
  const { siteSettings, currency, setCurrency, currentUser, logout, notifications } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <NotificationTicker notifications={notifications} />
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>{siteSettings.logo}</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-accent transition font-medium text-sm">Home</Link>
            <Link to="/search" className="hover:text-accent transition font-medium text-sm">Hotels</Link>
            <Link to="/track" className="hover:text-accent transition font-medium text-sm">Track Booking</Link>
            <Link to="/support" className="hover:text-accent transition font-medium text-sm">Support</Link>
            
            <div className="border-l border-white/20 pl-4">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-[#005c65] border border-white/20 rounded-md px-2 py-1 text-xs outline-none cursor-pointer"
              >
                <option value="PKR">PKR</option>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                {currentUser.role === UserRole.CUSTOMER && (
                  <Link to="/my-bookings" className="text-xs bg-secondary px-4 py-1.5 rounded-md font-bold transition">My Bookings</Link>
                )}
                {currentUser.role === UserRole.AGENT && (
                  <Link to="/agent" className="text-xs bg-secondary px-4 py-1.5 rounded-md font-bold transition">Agent Portal</Link>
                )}
                {currentUser.role === UserRole.ADMIN && (
                  <Link to="/admin" className="text-xs bg-secondary px-4 py-1.5 rounded-md font-bold transition">Admin Portal</Link>
                )}
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs opacity-70 hover:opacity-100">Logout</button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-xs font-bold hover:text-accent">Login</Link>
                <Link to="/signup" className="bg-secondary px-4 py-1.5 rounded-md text-xs font-bold shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>

          <button className="md:hidden text-2xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#005c65] border-t border-white/10 px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/search" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Hotels</Link>
            <Link to="/track" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Track Booking</Link>
            <Link to="/support" className="block py-2 text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Support</Link>
            <div className="pt-2 border-t border-white/10">
               {currentUser ? (
                 <button onClick={() => { logout(); navigate('/'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-sm opacity-70">Logout</button>
               ) : (
                 <Link to="/login" className="block py-2 text-sm font-bold" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
               )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export const Footer: React.FC = () => {
  const { siteSettings } = useAppContext();
  return (
    <footer className="bg-neutralDark text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-1 md:col-span-1">
          <h3 className="text-2xl font-bold italic mb-4">{siteSettings.name}</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Leading Umrah hospitality portal providing wholesale hotel rates in the Holy Cities of Makkah and Madina.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[#E29578] text-sm">Quick Links</h4>
          <ul className="text-gray-400 text-xs space-y-2">
            <li><Link to="/search" className="hover:text-white">All Hotels</Link></li>
            <li><Link to="/track" className="hover:text-white">Track Your Booking</Link></li>
            <li><Link to="/support" className="hover:text-white">Help & Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[#E29578] text-sm">Partners</h4>
          <ul className="text-gray-400 text-xs space-y-2">
            <li><Link to="/login" className="hover:text-white">Agent Portal</Link></li>
            <li><Link to="/login" className="hover:text-white">Admin Access</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[#E29578] text-sm">Contact Support</h4>
          <div className="text-gray-400 text-xs space-y-2">
            <p>✉️ {siteSettings.contactEmail}</p>
            <p>📞 {siteSettings.contactPhone}</p>
            <p className="mt-4 pt-4 border-t border-white/10 text-[10px] uppercase opacity-50">Authorized Hospitality Partner</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 pt-8 border-t border-white/5 text-center text-gray-500 text-[10px] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} UmrahStay Global. All Rights Reserved.
      </div>
    </footer>
  );
};

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
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
    { label: 'Notifications', path: '/admin/notifications', icon: '🔔' },
  ];

  const navigate = useNavigate();
  const { logout } = useAppContext();

  return (
    <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b flex items-center justify-center">
        <h2 className="text-xl font-bold text-primary tracking-tighter italic">UmrahStay Admin</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-primary/5 text-primary border-l-4 border-primary' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};
