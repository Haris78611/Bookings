
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header, Footer } from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import AgentPortal from './pages/AgentPortal';
import AdminPortal from './pages/AdminPortal';
import MyBookingsPage from './pages/MyBookingsPage';
import TrackBookingPage from './pages/TrackBookingPage';
import SupportPage from './pages/SupportPage';
import { UserRole } from './types';
import { Card, Button, Input } from './components/UI';

// Helper component to reset scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const LoginPage = () => {
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });

  const handleLogin = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      if (credentials.email === '990990' && credentials.password === 'Haris@1122@11') {
        setCurrentUser({
          id: 'ADM-1',
          name: 'System Administrator',
          email: 'admin@umrahstay.com',
          role: UserRole.ADMIN
        });
        navigate('/admin');
        return;
      } else if (credentials.email !== '990990') {
        alert("Enter '990990' in the ID field to access Admin Demo.");
        return;
      }
    }

    setCurrentUser({
      id: role === UserRole.AGENT ? 'AGENT-1' : 'CUST-1',
      name: role === UserRole.AGENT ? 'Travel Partner X' : 'Sami Khan',
      email: credentials.email || 'user@test.com',
      role,
      agencyId: role === UserRole.AGENT ? 'AG-001' : undefined
    });
    
    if (role === UserRole.AGENT) navigate('/agent');
    else navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutralLight px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#006D77 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <Card className="w-full max-w-md p-10 text-center relative z-10 border-none shadow-2xl rounded-2xl">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-primary mb-2 italic tracking-tighter">UmrahStay</h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Portal Authentication</p>
        </div>
        <div className="space-y-5 text-left">
          <Input label="Registry ID" placeholder="e.g. 990990" value={credentials.email} onChange={e => setCredentials({...credentials, email: e.target.value})} />
          <Input label="Security Password" type="password" placeholder="••••••••" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} />
          <Button onClick={() => handleLogin(UserRole.CUSTOMER)} fullWidth size="lg">Continue as Pilgrim</Button>
          <div className="flex items-center gap-3 py-6 text-gray-300">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Partner Access</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => handleLogin(UserRole.AGENT)} fullWidth variant="outline" size="sm">Partner Portal</Button>
            <Button onClick={() => handleLogin(UserRole.ADMIN)} fullWidth variant="ghost" size="sm" className="border border-gray-100">Control Desk</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { bookings, formatPrice } = useAppContext();
  const navigate = useNavigate();
  
  const booking = bookings.find(b => b.id === id);

  if (!booking) return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  const displayTotalPrice = formatPrice(Number(booking.totalPrice) || 0);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutralLight py-16 px-4">
      <Card className="max-w-md w-full text-center p-8 md:p-12 border-none shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-[#FFF9DB] rounded-full flex items-center justify-center text-3xl mx-auto mb-6 text-[#FCC419] shadow-sm">
          🕒
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2 tracking-tight">Booking Received!</h1>
        <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed px-4 mx-auto">
          Thank you, <span className="text-primary font-bold">{booking.guestName}</span>. Your request is pending. We will notify you via email shortly.
        </p>

        <div className="bg-gray-50/50 rounded-xl p-6 text-left border border-gray-100 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reference</span>
            <span className="text-secondary font-black text-xs uppercase tracking-widest">{booking.id}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-primary leading-tight">{booking.hotelName}</h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{booking.roomType}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Check-in</p>
              <p className="font-bold text-neutralDark text-sm">{booking.checkIn}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Check-out</p>
              <p className="font-bold text-neutralDark text-sm">{booking.checkOut}</p>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 pt-3">
            <span className="text-sm font-bold text-gray-600">Amount</span>
            <span className="text-2xl font-black text-primary">{displayTotalPrice}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
          <Button onClick={() => navigate('/my-bookings')} variant="secondary" className="h-11 rounded-lg font-bold text-xs shadow-md">My Bookings</Button>
          <Button onClick={() => navigate('/')} variant="primary" className="h-11 rounded-lg font-bold text-xs shadow-md">Home Portal</Button>
        </div>
      </Card>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminPortal view="dashboard" />} />
          <Route path="/admin/hotels" element={<AdminPortal view="hotels" />} />
          <Route path="/admin/agencies" element={<AdminPortal view="agencies" />} />
          <Route path="/admin/bookings" element={<AdminPortal view="bookings" />} />
          <Route path="/admin/requests" element={<AdminPortal view="requests" />} />
          <Route path="/admin/bulk-orders" element={<AdminPortal view="bulk-orders" />} />
          <Route path="/admin/invoices" element={<AdminPortal view="invoices" />} />
          <Route path="/admin/financials" element={<AdminPortal view="financials" />} />
          <Route path="/admin/settings" element={<AdminPortal view="settings" />} />
          <Route path="/admin/notifications" element={<AdminPortal view="notifications" />} />

          <Route path="/*" element={
            <>
              <Header />
              <main className="min-h-[70vh]">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/hotel/:id" element={<HotelDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<LoginPage />} />
                  <Route path="/confirmation/:id" element={<BookingConfirmation />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/track" element={<TrackBookingPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/agent" element={<AgentPortal />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
