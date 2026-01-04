
import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

// Icons
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BookingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const HotelsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21V5" /></svg>;
const AgenciesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.24-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.28.24-1.857m10.5-1.557a3 3 0 00-5.682-1.584M5.5 14.557a3 3 0 015.682-1.584M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const InvoicesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FinancialsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BulkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21V5" /></svg>;
const RequestsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 8a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const NotificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <BookingsIcon /> },
    { name: 'Requests', path: '/admin/requests', icon: <RequestsIcon /> },
    { name: 'Bulk Orders', path: '/admin/bulk-orders', icon: <BulkIcon /> },
    { name: 'Hotels', path: '/admin/hotels', icon: <HotelsIcon /> },
    { name: 'Agencies', path: '/admin/agencies', icon: <AgenciesIcon /> },
    { name: 'Invoices', path: '/admin/invoices', icon: <InvoicesIcon /> },
    { name: 'Financials', path: '/admin/financials', icon: <FinancialsIcon /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <NotificationIcon /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

const agentNav = [
    { name: 'Dashboard', path: '/agent', icon: <DashboardIcon /> },
    { name: 'Bulk Booking', path: '/agent/bulk', icon: <BulkIcon /> },
    { name: 'My Bookings', path: '/agent/bookings', icon: <BookingsIcon /> },
    { name: 'Settings', path: '/agent/settings', icon: <SettingsIcon /> },
];

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useAppContext();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (!currentUser) return null;

    const portal = currentUser.role === UserRole.ADMIN ? 'admin' : 'agent';
    const navItems = portal === 'admin' ? adminNav : agentNav;
    const title = portal === 'admin' ? 'Control Desk' : 'Agent Portal';
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-black text-primary tracking-tighter uppercase italic">{title}</h2>
                <button className="lg:hidden text-xl" onClick={() => setSidebarOpen(false)}>&times;</button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map(item => {
                    // Exact match for dashboard, startsWith for sub-pages
                    const isActive = item.path === '/admin' || item.path === '/agent' 
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="opacity-80">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t bg-gray-50/50">
                <button 
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-4 px-4 py-3 w-full text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                    <span className=""><LogoutIcon /></span> Exit Portal
                </button>
            </div>
        </div>
    );
  
    return (
        <div className="min-h-screen flex bg-[#F8FAFB]">
             <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-[200] w-14 h-14 bg-[#005B5C] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-white"
            >
                {isSidebarOpen ? '✕' : '☰'}
            </button>

            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-[150] lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            <aside className={`fixed lg:sticky top-0 left-0 z-[160] h-screen w-72 bg-white border-r shadow-2xl lg:shadow-none transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <SidebarContent />
            </aside>
            
            <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
