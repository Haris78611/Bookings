
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge } from '../components/UI';
import { BookingStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, formatPrice } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-neutralLight p-4">
      <Card className="max-w-md text-center p-12 shadow-2xl border-none">
        <div className="text-5xl mb-6">🔐</div>
        <h2 className="text-2xl font-bold mb-4">Secure Access</h2>
        <p className="text-gray-500 mb-8">Please login to access your personal booking history and digital travel documents.</p>
        <Button onClick={() => navigate('/login')} fullWidth size="lg">Portal Login</Button>
      </Card>
    </div>
  );

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const getStatusVariant = (status: BookingStatus) => {
    if (status === BookingStatus.CONFIRMED) return 'success';
    if (status === BookingStatus.CANCELLED) return 'danger';
    return 'warning';
  };

  return (
    <div className="bg-[#f8fafa] min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl font-black text-primary tracking-tighter">Your Bookings</h1>
            <p className="text-gray-500 mt-3 text-lg">Manage your upcoming stays and historical records in the Holy Cities.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/search')} className="shadow-xl">New Reservation</Button>
        </div>
        
        {myBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-1000">
            {myBookings.map(booking => (
              <Card key={booking.id} className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none shadow-sm rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row">
                  {/* Status Sidebar */}
                  <div className={`w-full md:w-4 ${booking.status === 'Confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  
                  <div className="flex-1 p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">REGISTRY: {booking.id}</span>
                        </div>
                        <h2 className="text-3xl font-black text-neutralDark leading-tight">{booking.hotelName}</h2>
                        <p className="text-lg text-gray-500 font-medium mt-1">{booking.roomType} • Guest: {booking.guestName}</p>
                      </div>
                      <div className="text-left md:text-right bg-primary/5 p-4 rounded-2xl border border-primary/5">
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Total Stay Valuation</p>
                         <p className="text-3xl font-black text-primary">{formatPrice(booking.totalPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Check-in</p>
                        <p className="text-lg font-black text-neutralDark">{booking.checkIn}</p>
                        <p className="text-xs text-gray-400">After 14:00 AST</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Check-out</p>
                        <p className="text-lg font-black text-neutralDark">{booking.checkOut}</p>
                        <p className="text-xs text-gray-400">Before 12:00 AST</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Pilgrim Group</p>
                        <p className="text-lg font-black text-neutralDark">2 Adults</p>
                        <p className="text-xs text-gray-400">Standard Occupancy</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Holy City</p>
                        <p className="text-lg font-black text-neutralDark">KSA Region</p>
                        <p className="text-xs text-gray-400">Authorized Zone</p>
                      </div>
                    </div>
                    
                    <div className="mt-10 flex flex-wrap gap-6 justify-between items-center">
                      <div className="flex items-center gap-3 text-xs text-green-600 bg-green-50 px-5 py-2.5 rounded-full font-black uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                        Refundable Cancellation Active
                      </div>
                      <div className="flex gap-4">
                        <Button variant="outline" className="px-10 rounded-2xl">Modify</Button>
                        <Button variant="secondary" className="px-10 rounded-2xl">Get Voucher</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-24 text-center rounded-[3rem] border-none shadow-xl">
            <div className="text-8xl mb-8">🕌</div>
            <h2 className="text-4xl font-black text-neutralDark mb-4 tracking-tighter">Your Registry is Empty</h2>
            <p className="text-gray-500 mb-12 max-w-sm mx-auto text-lg leading-relaxed">Prepare for your spiritual journey by reserving your sanctuary in Makkah or Madina today.</p>
            <Button variant="primary" size="lg" className="px-12 rounded-2xl shadow-2xl" onClick={() => navigate('/search')}>Explore Directory</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
