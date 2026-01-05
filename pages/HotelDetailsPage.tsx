import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Modal, Input, AmenityPill, StarRating, Card } from '../components/UI';
import { BookingStatus } from '../types';

const RoomGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
  );

  return (
    <div className="relative group w-full h-full">
      <img 
        src={images[activeIdx]} 
        className="w-full h-full object-cover transition-all duration-500" 
        alt="Room" 
      />
      {images.length > 1 && (
        <>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                className={`h-1.5 transition-all duration-300 rounded-full shadow-sm ${idx === activeIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
          <button onClick={(e) => { e.stopPropagation(); setActiveIdx(p => (p - 1 + images.length) % images.length)}} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&larr;</button>
          <button onClick={(e) => { e.stopPropagation(); setActiveIdx(p => (p + 1) % images.length)}} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&rarr;</button>
        </>
      )}
    </div>
  );
};

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hotels, formatPrice, currentUser, addBooking, addToast, promoCodes } = useAppContext();
  const navigate = useNavigate();
  
  const hotel = hotels.find(h => h.id === id);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const [bookingDetails, setBookingDetails] = useState({ name: '', email: '', phone: '', checkIn: '2026-03-01', checkOut: '2026-04-01', promoCode: '' });
  
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: 'success' });

  const selectedRoom = hotel?.rooms.find(r => r.id === selectedRoomId);
  
  const finalPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    return Math.max(0, selectedRoom.customerPricePerNight - discount);
  }, [selectedRoom, discount]);

  if (!hotel) return (
    <div className="p-10 md:p-20 text-center min-h-screen flex flex-col items-center justify-center bg-neutralLight">
      <h2 className="text-xl md:text-2xl font-bold text-[#006D77]">Registry Entry Not Found</h2>
      <Button variant="outline" className="mt-6" onClick={() => navigate('/search')}>Return to Catalog</Button>
    </div>
  );

  const handleBookNow = (roomId: string) => {
    if (!currentUser) { navigate('/login'); return; }
    setSelectedRoomId(roomId);
    setIsBookingModalOpen(true);
    setDiscount(0);
    setPromoMessage({ text: '', type: 'success' });
    setBookingDetails(prev => ({ ...prev, promoCode: ''}));
  };
  
  const applyPromoCode = () => {
    if (!bookingDetails.promoCode.trim()) { setPromoMessage({ text: 'Please enter a code.', type: 'error' }); return; }
    const code = promoCodes.find(p => p.code.toUpperCase() === bookingDetails.promoCode.toUpperCase());
    if (code && selectedRoom) {
        let calculatedDiscount = code.type === 'percentage' ? (selectedRoom.customerPricePerNight * code.discount) / 100 : code.discount;
        setDiscount(calculatedDiscount);
        setPromoMessage({ text: `Success! ${formatPrice(calculatedDiscount)} discount applied.`, type: 'success' });
        addToast(`Promo code applied successfully!`);
    } else {
        setDiscount(0);
        setPromoMessage({ text: 'Invalid or expired promo code.', type: 'error' });
    }
  };

  const confirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      addToast("Please fill in all required fields.", "error");
      return;
    }
    const bookingId = `BK${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    addBooking({
      id: bookingId, hotelId: hotel.id, hotelName: hotel.name, roomId: selectedRoom.id, roomType: selectedRoom.type,
      checkIn: bookingDetails.checkIn, checkOut: bookingDetails.checkOut, guestName: bookingDetails.name, guestEmail: bookingDetails.email,
      guestPhone: bookingDetails.phone, totalPrice: finalPrice, status: BookingStatus.PENDING, userId: currentUser?.id,
      createdAt: new Date().toISOString(), promoCode: discount > 0 ? bookingDetails.promoCode : undefined
    });
    setIsBookingModalOpen(false);
    navigate(`/confirmation/${bookingId}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. Gallery and Header */}
      <section className="h-[450px] relative text-white bg-gray-800">
        <img src={hotel.images[0]} alt={hotel.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <StarRating count={hotel.stars} />
          <h1 className="text-5xl font-black mt-2 tracking-tight drop-shadow-lg">{hotel.name}</h1>
          <p className="mt-2 text-lg opacity-90 font-medium max-w-2xl">{hotel.address}</p>
        </div>
      </section>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-neutralDark mb-4 border-b pb-3">About this Sanctuary</h2>
              <p className="text-gray-600 leading-relaxed text-lg italic">"{hotel.description}"</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-neutralDark mb-6 border-b pb-3">Key Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {hotel.amenities.map(a => <AmenityPill key={a} name={a} />)}
              </div>
            </section>
          </div>
          {/* Right Column */}
          <aside className="lg:sticky top-24 self-start">
            <Card className="p-6 !rounded-xl shadow-lg border-2">
              <h3 className="font-bold text-lg text-primary mb-4">Hotel at a Glance</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">City:</span>
                  <span className="font-bold">{hotel.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Distance to Haram:</span>
                  <span className="font-bold">{hotel.distanceToHaram}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Star Rating:</span>
                  <span className="font-bold">{hotel.stars} Stars</span>
                </div>
              </div>
              <Button onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })} fullWidth className="mt-6 !rounded-lg">View Available Units</Button>
            </Card>
          </aside>
        </div>
      </div>

      {/* 3. Rooms Section */}
      <section id="rooms-section" className="bg-white py-20 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary text-center mb-12 uppercase tracking-tight">Available Units</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {hotel.rooms.map(room => (
              <Card key={room.id} className="flex flex-col md:flex-row overflow-hidden !rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="md:w-1/3 h-48 md:h-auto shrink-0"><RoomGallery images={room.images} /></div>
                <div className="md:w-2/3 p-6 flex flex-col">
                  <h3 className="text-xl font-bold text-neutralDark">{room.type}</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4 flex-grow line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.map(am => <span key={am} className="text-[9px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">{am}</span>)}
                  </div>
                  <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 font-bold block">Starts from</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(room.customerPricePerNight)}</span>
                      <span className="text-sm text-gray-500">/night</span>
                    </div>
                    <Button variant="secondary" onClick={() => handleBookNow(room.id)} className="!rounded-lg">Book Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
       <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Confirm Your Stay">
        <form onSubmit={confirmBooking}>
            <div className="p-6 md:p-8 space-y-6">
                <div className="bg-[#F0F7F8] p-4 rounded-xl border border-gray-200/80 flex items-center gap-4 shadow-inner">
                   <img src={selectedRoom?.images[0] || hotel.images[0]} className="w-16 h-16 rounded-lg object-cover shadow-md shrink-0" alt="Unit" />
                   <div>
                      <h4 className="text-sm font-black text-[#005B5C] tracking-tight leading-tight uppercase truncate">{hotel.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">{selectedRoom?.type}</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Arrival" type="date" required value={bookingDetails.checkIn} onChange={e => setBookingDetails({...bookingDetails, checkIn: e.target.value})} className="!rounded-lg" />
                    <Input label="Departure" type="date" required value={bookingDetails.checkOut} onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} className="!rounded-lg" />
                </div>
                <Input label="Full Legal Name" placeholder="As per Passport..." required value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} className="!rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Email Registry" type="email" placeholder="pilgrim@registry.com" required value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} className="!rounded-lg" />
                    <Input label="Contact Vector" type="tel" placeholder="+XX XXXXXXXX" required value={bookingDetails.phone} onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})} className="!rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Promo Code (Optional)</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter code" value={bookingDetails.promoCode} onChange={e => setBookingDetails({...bookingDetails, promoCode: e.target.value.toUpperCase()})} className="w-full bg-gray-100 border-gray-200 rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50 uppercase" />
                        <Button type="button" variant="outline" onClick={applyPromoCode} className="!rounded-lg h-full px-5 text-xs">Apply</Button>
                    </div>
                    {promoMessage.text && <p className={`text-xs mt-2 font-bold ${promoMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{promoMessage.text}</p>}
                </div>
            </div>
            <div className="bg-white p-4 md:p-6 border-t mt-auto">
                 <div className="flex justify-between items-end mb-4">
                    <div>
                       <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">Grand Total Allocation</span>
                       <div className="text-3xl md:text-4xl font-black text-[#005B5C] tracking-tight">
                        {discount > 0 && <span className="text-lg line-through text-gray-400 mr-2">{formatPrice(selectedRoom?.customerPricePerNight || 0)}</span>}
                        {formatPrice(finalPrice)}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Guaranteed Rate</div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-12 text-xs !rounded-lg" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="teal" className="h-12 text-xs !rounded-lg shadow-lg shadow-teal-900/20">Confirm Booking</Button>
                 </div>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default HotelDetailsPage;