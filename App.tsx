
import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#006D77 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <Card className="w-full max-w-md p-10 text-center relative z-10 border-none">
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
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa]">
      <LoadingSpinner />
    </div>
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white py-20 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Yellow Clock Icon */}
        <div className="w-16 h-16 bg-[#FFF9DB] rounded-full flex items-center justify-center text-3xl mx-auto mb-8 text-[#FCC419]">
          🕒
        </div>

        <h1 className="text-4xl font-bold text-[#006D77] mb-6 tracking-tight">Booking Received!</h1>
        
        <p className="text-gray-600 mb-12 text-lg font-medium leading-relaxed max-w-xl mx-auto">
          Thank you, {booking.guestName}. Your booking request is pending approval. You will receive an email once it's confirmed.
        </p>

        <div className="border-t border-gray-100 pt-10 text-left space-y-6 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutralDark text-sm">Booking ID:</span>
            <span className="text-[#E29578] font-bold text-sm tracking-wide uppercase">{booking.id}</span>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <h3 className="text-xl font-bold text-[#006D77] leading-tight">{booking.hotelName}</h3>
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutralDark text-sm">Room:</span>
            <span className="text-gray-500 font-medium text-sm">{booking.roomType.split(' ')[0]}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutralDark">Check-in:</span>
              <span className="text-gray-500 font-medium">{formatDate(booking.checkIn)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutralDark">Check-out:</span>
              <span className="text-gray-500 font-medium">{formatDate(booking.checkOut)}</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex justify-end items-center gap-2">
            <span className="text-xl font-bold text-neutralDark">Total:</span>
            <span className="text-xl font-bold text-[#006D77]">{formatPrice(booking.totalPrice)}</span>
          </div>

          <div className="h-px bg-gray-100 w-full pt-4"></div>

          <div className="flex gap-4 pt-6">
            <Button 
              onClick={() => navigate('/my-bookings')} 
              variant="secondary" 
              className="flex-1 h-14 rounded-xl font-bold shadow-lg"
            >
              View My Bookings
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="teal" 
              className="flex-1 h-14 rounded-xl font-bold"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
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
