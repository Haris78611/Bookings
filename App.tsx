import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Header, Footer } from './components/Layout';
import AuthModal from './components/AuthModal';
import { Card, Button } from './components/UI';
import { ToastContainer } from './components/Toast';

// Standard imports to prevent chunking at this level
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import AdminPortal from './pages/AdminPortal';
import AgentPortal from './pages/AgentPortal';
import MyBookingsPage from './pages/MyBookingsPage';
import TrackBookingPage from './pages/TrackBookingPage';
import SupportPage from './pages/SupportPage';
import LoginRedirectPage from './pages/LoginRedirectPage';


// Helper component to reset scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Loading component for fallback
const FullPageSpinner = () => (
    <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
);

const BookingConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const { bookings, formatPrice } = useAppContext();
  const navigate = useNavigate();
  
  const booking = bookings.find(b => b.id === id);

  if (!booking) return <FullPageSpinner />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutralLight py-16 px-4">
      <Card className="max-w-md w-full text-center p-8 md:p-12 border-none shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-500 bg-white">
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
            <span className="text-2xl font-black text-primary">{formatPrice(booking.totalPrice)}</span>
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
        <ToastContainer />
        <AuthModal />
        <Routes>
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/agent/*" element={<AgentPortal />} />

          <Route path="/*" element={
            <>
              <Header />
              <main className="min-h-[70vh]">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/hotel/:id" element={<HotelDetailsPage />} />
                  <Route path="/login" element={<LoginRedirectPage />} />
                  <Route path="/signup" element={<LoginRedirectPage />} />
                  <Route path="/confirmation/:id" element={<BookingConfirmation />} />
                  <Route path="/my-bookings" element={<MyBookingsPage />} />
                  <Route path="/track" element={<TrackBookingPage />} />
                  <Route path="/support" element={<SupportPage />} />
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
