import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Modal, Input, StarRating, Card } from '../components/UI';
import { BookingStatus } from '../types';

// --- SVG Icons for Amenities ---
const WifiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.562a4.5 4.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.008zM3.055 11.888a15 15 0 0121.89 0" /></svg>;
const TVIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 003 3h4a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ACIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10-10 10 10M2 12l10-10 10 10" /></svg>;
const RestaurantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.41-4.148L12 17.747l5.41-4.148" /></svg>;
const HaramViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const RoomServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-6 4a2 2 0 100-4 2 2 0 000 4z" /></svg>;

const amenityIcons: { [key: string]: React.FC } = {
  "free wifi": WifiIcon,
  "flat-screen tv": TVIcon,
  "air conditioning": ACIcon,
  "restaurants": RestaurantIcon,
  "haram view": HaramViewIcon,
  "room service": RoomServiceIcon
};

const AmenityItem: React.FC<{ name: string }> = ({ name }) => {
  const Icon = amenityIcons[name.toLowerCase()] || (() => <span className="text-primary">•</span>);
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <Icon />
      <span className="text-sm font-semibold text-gray-700">{name}</span>
    </div>
  );
};


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
  // Fix: Added 'openAuthModal' to the destructuring and corrected the import.
  const { hotels, formatPrice, currentUser, addBooking, addToast, promoCodes, openAuthModal } = useAppContext();
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
    if (!currentUser) { openAuthModal('customer-login'); return; }
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
    <div className="bg-white min-h-screen">
      {/* 1. Gallery and Header */}
      <section className="h-[550px] relative bg-gray-900 text-white">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-2">
            <div className="col-span-3 row-span-2"><img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover"/></div>
            <div className="col-span-1 row-span-1"><img src={hotel.images[1] || hotel.images[0]} alt="" className="w-full h-full object-cover"/></div>
            <div className="col-span-1 row-span-1"><img src={hotel.images[2] || hotel.images[0]} alt="" className="w-full h-full object-cover"/></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10 animate-in fade-in duration-700">
          <StarRating count={hotel.stars} />
          <h1 className="text-4xl md:text-6xl font-black mt-3 tracking-tight drop-shadow-lg">{hotel.name}</h1>
          <p className="mt-3 text-lg opacity-90 font-medium max-w-2xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            {hotel.address}
          </p>
        </div>
      </section>

      {/* 2. Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-neutralDark mb-4">About this Sanctuary</h2>
              <div className="prose prose-lg text-gray-600 leading-relaxed">
                <p>{hotel.description}</p>
              </div>
            </section>
            <section>
              <h2 className="text-3xl font-bold text-neutralDark mb-6">Key Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map(a => <AmenityItem key={a} name={a} />)}
              </div>
            </section>
          </div>
          {/* Right Column */}
          <aside className="lg:col-span-4 lg:sticky top-24 self-start">
            <Card className="p-6 !rounded-xl shadow-lg border-gray-100 space-y-6">
              <div>
                <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(hotel.address)}&zoom=15&size=400x200&markers=color:red%7C${encodeURIComponent(hotel.address)}&key=YOUR_API_KEY`} alt="Map" className="rounded-lg w-full h-40 object-cover bg-gray-200" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">City:</span><span className="font-bold text-gray-800">{hotel.city}</span></div>
                <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Distance to Haram:</span><span className="font-bold text-gray-800">{hotel.distanceToHaram}m</span></div>
                <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Star Rating:</span><StarRating count={hotel.stars} /></div>
              </div>
              <Button onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })} fullWidth size="lg" className="mt-6 !rounded-lg">Select Your Room</Button>
            </Card>
          </aside>
        </div>
      </div>

      {/* 3. Rooms Section */}
      <section id="rooms-section" className="bg-gray-50 py-20 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary text-center mb-12 uppercase tracking-tight">Select Your Sanctuary</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {hotel.rooms.map(room => (
              <Card key={room.id} className="flex flex-col md:flex-row overflow-hidden !rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 group">
                <div className="md:w-[280px] h-48 md:h-auto shrink-0"><RoomGallery images={room.images} /></div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-neutralDark">{room.type}</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4 flex-grow line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.map(am => <span key={am} className="text-[10px] font-bold bg-teal-50 text-teal-800 px-3 py-1 rounded-full">{am}</span>)}
                  </div>
                  <div className="mt-auto flex flex-col sm:flex-row justify-between sm:items-end gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 font-bold block">Starts from</span>
                      <span className="text-3xl font-black text-primary">{formatPrice(room.customerPricePerNight)}</span>
                      <span className="text-sm font-semibold text-gray-500">/night</span>
                    </div>
                    <Button variant="secondary" onClick={() => handleBookNow(room.id)} className="!rounded-lg !px-8 h-12">Book Now</Button>
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