
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Modal, Input, AmenityPill, StarRating, Card } from '../components/UI';
import { BookingStatus } from '../types';

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hotels, formatPrice, currentUser, addBooking } = useAppContext();
  const navigate = useNavigate();
  
  const hotel = hotels.find(h => h.id === id);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [bookingDetails, setBookingDetails] = useState({ name: '', email: '', phone: '', checkIn: '', checkOut: '' });

  if (!hotel) return <div className="p-20 text-center text-2xl font-bold">Sanctuary not found in registry.</div>;

  const handleBookNow = (roomId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSelectedRoomId(roomId);
    setIsBookingModalOpen(true);
  };

  const confirmBooking = () => {
    const room = hotel.rooms.find(r => r.id === selectedRoomId);
    if (!room) return;

    const bookingId = `BK${Date.now().toString().slice(-10)}`;
    const newBooking = {
      id: bookingId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomType: room.type,
      checkIn: bookingDetails.checkIn || new Date().toISOString().split('T')[0],
      checkOut: bookingDetails.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      guestName: bookingDetails.name || currentUser?.name || '',
      guestEmail: bookingDetails.email || currentUser?.email || '',
      guestPhone: bookingDetails.phone || '',
      totalPrice: room.customerPricePerNight, 
      status: BookingStatus.PENDING,
      userId: currentUser?.id,
      createdAt: new Date().toISOString()
    };

    addBooking(newBooking);
    setIsBookingModalOpen(false);
    navigate(`/confirmation/${bookingId}`);
  };

  const selectedRoom = hotel.rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-[#006D77] tracking-tight">{hotel.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating count={hotel.stars} />
                <span className="text-sm font-semibold text-gray-500">{hotel.stars.toFixed(1)} Stars</span>
              </div>
              <div className="flex items-center text-[#E29578] font-bold text-sm mt-4">
                <span className="mr-2 text-xl">📍</span>
                {hotel.distanceToHaram}m from Haram
              </div>
            </div>
            <div className="md:text-right">
              <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-widest">Starts from</span>
              <span className="text-4xl font-black text-[#006D77]">{formatPrice(hotel.rooms[0].customerPricePerNight)}</span>
              <span className="text-sm text-gray-400 font-medium">/night</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <div className="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide">
              {hotel.images.map((img, idx) => (
                <div key={idx} className="min-w-[85vw] md:min-w-0 snap-center h-[300px] md:h-[400px]">
                  <img src={img} className="w-full h-full object-cover rounded-2xl shadow-sm" alt={`Hotel view ${idx+1}`} />
                </div>
              ))}
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-[#006D77] mb-8">Available Amenities</h2>
              <div className="flex flex-wrap gap-4">
                {hotel.amenities.map(a => <AmenityPill key={a} name={a} />)}
                <AmenityPill name="24-hour front desk" />
                <AmenityPill name="Family Rooms" />
              </div>
              <div className="mt-12 border-t pt-10">
                 <h2 className="text-2xl font-bold text-[#006D77] mb-6">Hotel Narrative</h2>
                 <p className="text-gray-600 leading-relaxed text-lg font-light">{hotel.description}</p>
              </div>
            </div>

            <div className="space-y-8 text-center">
              <h2 className="text-3xl font-bold text-[#006D77]">Available Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hotel.rooms.map(room => (
                  <div key={room.id} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all duration-500">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-4xl mb-6">🛏️</div>
                    <h3 className="text-2xl font-extrabold text-neutralDark mb-4">{room.type}</h3>
                    <div className="mb-8">
                      <span className="text-3xl font-black text-[#006D77]">{formatPrice(room.customerPricePerNight)}</span>
                      <span className="text-sm text-gray-400 font-medium">/night</span>
                    </div>
                    <Button variant="teal" fullWidth size="lg" className="rounded-2xl h-14" onClick={() => handleBookNow(room.id)}>Book Room Now</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-primary text-white border-none shadow-2xl rounded-3xl">
              <h3 className="text-xl font-bold mb-6">Reservation Assistance</h3>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">Dedicated to ensuring your pilgrimage stays are as peaceful as your journey.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">📞</span>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Hotline</div>
                    <div className="font-bold text-lg">+92 300 1234567</div>
                  </div>
                </div>
              </div>
              <Button variant="secondary" fullWidth className="mt-10 h-14 rounded-2xl font-bold">Request Callback</Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Confirm Your Booking">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 font-medium mb-8">{hotel.name} - {selectedRoom?.type}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Check-in" type="date" value={bookingDetails.checkIn} onChange={e => setBookingDetails({...bookingDetails, checkIn: e.target.value})} />
            <Input label="Check-out" type="date" value={bookingDetails.checkOut} onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} />
          </div>

          <div className="mb-6">
            <Input label="Full Name" placeholder="Enter your full name" value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Email Address" placeholder="Enter email address" value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} />
            <Input label="Contact Number" placeholder="Enter contact number" value={bookingDetails.phone} onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})} />
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Promo Code (Optional)</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#006D77]/20 outline-none transition-all placeholder:text-gray-400 font-medium" 
                placeholder="e.g. UMRAH2024"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
              />
              <Button variant="ghost" className="bg-[#E9ECEF] text-neutralDark px-8">Apply</Button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Price</span>
            <div className="text-3xl font-black text-primary">
              {formatPrice(selectedRoom?.customerPricePerNight || 0)}
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <Button variant="ghost" className="bg-[#E9ECEF] text-neutralDark flex-1 h-14 rounded-xl" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button variant="secondary" className="flex-[1.5] h-14 rounded-xl shadow-lg font-bold text-lg" onClick={confirmBooking}>Confirm Booking</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HotelDetailsPage;
