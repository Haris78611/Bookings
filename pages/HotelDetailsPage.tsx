
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Modal, Input, AmenityPill, StarRating, Card, Badge } from '../components/UI';
import { BookingStatus, Room } from '../types';

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
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
              className={`h-1.5 transition-all duration-300 rounded-full shadow-sm ${idx === activeIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
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
  
  const [bookingDetails, setBookingDetails] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    checkIn: '2026-03-01', 
    checkOut: '2026-04-01',
    promoCode: ''
  });
  
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
    // Reset promo state when opening modal
    setDiscount(0);
    setPromoMessage({ text: '', type: 'success' });
    setBookingDetails(prev => ({ ...prev, promoCode: ''}));
  };
  
  const applyPromoCode = () => {
    if (!bookingDetails.promoCode.trim()) {
        setPromoMessage({ text: 'Please enter a code.', type: 'error' });
        return;
    }
    const code = promoCodes.find(p => p.code.toUpperCase() === bookingDetails.promoCode.toUpperCase());
    if (code && selectedRoom) {
        let calculatedDiscount = 0;
        if (code.type === 'percentage') {
            calculatedDiscount = (selectedRoom.customerPricePerNight * code.discount) / 100;
        } else {
            calculatedDiscount = code.discount;
        }
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
    if (!selectedRoom) return;

    if (!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    const bookingId = `BK${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    addBooking({
      id: bookingId,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: selectedRoom.id,
      roomType: selectedRoom.type,
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      guestName: bookingDetails.name,
      guestEmail: bookingDetails.email,
      guestPhone: bookingDetails.phone,
      totalPrice: finalPrice, 
      status: BookingStatus.PENDING,
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
      promoCode: discount > 0 ? bookingDetails.promoCode : undefined
    });
    setIsBookingModalOpen(false);
    navigate(`/confirmation/${bookingId}`);
  };

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20">
      {/* 1. Header Section */}
      <div className="bg-white pt-8 pb-10 md:pt-12 md:pb-16 border-b border-gray-100 shadow-sm relative z-30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-10">
            <div className="space-y-3 md:space-y-5 max-w-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                 <Badge variant="info" className="bg-[#006D77] text-white px-4 md:px-5 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black tracking-widest rounded-full">{hotel.stars}-STAR REGISTRY</Badge>
                 <StarRating count={hotel.stars} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#006D77] tracking-tighter leading-tight uppercase">{hotel.name}</h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                <span className="flex items-center gap-2">📍 {hotel.city} Sanctuary</span>
                <span className="flex items-center gap-2">🕋 {hotel.distanceToHaram}M From Masjid Al-Haram</span>
              </div>
            </div>
            <div className="w-full lg:w-auto bg-[#F0F7F8] px-8 py-6 md:px-12 md:py-10 rounded-2xl md:rounded-[2.5rem] border border-[#DCEEF0] text-left lg:text-right shadow-inner">
              <span className="text-[9px] md:text-[10px] text-[#006D77]/50 block font-black uppercase tracking-[0.3em] mb-1 md:mb-2">Registry Starting From</span>
              <span className="text-3xl md:text-5xl font-black text-[#006D77] tracking-tighter">{formatPrice(hotel.rooms[0].customerPricePerNight)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Area - Full Width No Sidebar */}
          <div className="flex flex-col gap-12 md:gap-24">
            
            {/* Gallery Block */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
              <div className="md:col-span-2 relative overflow-hidden rounded-2xl md:rounded-[3rem] aspect-[4/3] md:aspect-auto md:h-[520px] shadow-xl md:shadow-2xl border-2 md:border-4 border-white">
                 <img src={hotel.images[0]} className="w-full h-full object-cover" alt={hotel.name} />
              </div>
              <div className="hidden md:flex flex-col gap-4 md:gap-8 h-[520px]">
                 <div className="h-1/2 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                   <img src={hotel.images[1] || hotel.images[0]} className="w-full h-full object-cover" alt="Interior" />
                 </div>
                 <div className="h-1/2 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative">
                   <img src={hotel.images[0]} className="w-full h-full object-cover blur-[2px] opacity-80" alt="More" />
                   <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[11px] uppercase tracking-[0.4em] bg-black/30">Gallery</div>
                 </div>
              </div>
            </section>

            {/* Narrative Block */}
            <section className="bg-white p-6 md:p-14 rounded-2xl md:rounded-[3.5rem] border border-gray-100 shadow-xl relative z-20">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 md:gap-12 mb-10 md:mb-16">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-[#006D77] tracking-tighter uppercase mb-2">Stay Amenities</h2>
                  <div className="h-1 w-12 md:h-1.5 md:w-16 bg-secondary rounded-full"></div>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {hotel.amenities.map(a => <AmenityPill key={a} name={a} />)}
                </div>
              </div>
              <div className="border-t border-gray-50 pt-8 md:pt-12">
                 <p className="text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 md:mb-6 flex items-center gap-4">
                   Official Narrative
                 </p>
                 <p className="text-gray-600 leading-relaxed text-lg md:text-2xl font-medium italic opacity-90">"{hotel.description}"</p>
              </div>
            </section>

            {/* Allocation Units */}
            <section className="flex flex-col gap-8 md:gap-16 pb-12 md:pb-20 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-4xl font-black text-[#006D77] tracking-tighter uppercase">
                  Unit Allocation
                </h2>
                <div className="h-0.5 flex-1 bg-gray-200/50 ml-8 hidden md:block"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {hotel.rooms.map(room => (
                  <Card key={room.id} className="bg-white overflow-hidden flex flex-col items-start hover:shadow-2xl transition-all duration-700 border-none shadow-md rounded-2xl group">
                    <div className="w-full h-56 md:h-64 relative overflow-hidden">
                       <RoomGallery images={room.images} />
                       <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/95 backdrop-blur-md px-4 py-1.5 md:px-6 md:py-2 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[#006D77] shadow-lg z-10">Registry Unit</div>
                    </div>
                    <div className="p-6 md:p-10 w-full flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg md:text-2xl font-black text-neutralDark uppercase tracking-tight leading-tight">{room.type}</h3>
                        <div className="bg-[#F0F7F8] px-3 py-1 rounded-lg text-[10px] font-black text-[#006D77] uppercase tracking-widest border border-[#DCEEF0]">
                          Cap: {room.capacity}
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm mb-8 md:mb-12 font-medium italic leading-relaxed line-clamp-2 opacity-80">"{room.description}"</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                        {room.amenities.map(am => (
                          <span key={am} className="text-[8px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 px-2 py-1 rounded-md">
                            {am}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-6 md:pt-8 border-t border-gray-50 flex items-center justify-between">
                        <div className="space-y-0.5 md:space-y-1">
                          <span className="text-[7px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest block">Nightly Rate</span>
                          <span className="text-xl md:text-3xl font-black text-[#006D77] tracking-tighter">{formatPrice(room.customerPricePerNight)}</span>
                        </div>
                        <Button 
                          variant="teal" 
                          className="h-10 md:h-14 px-5 md:px-8 text-[9px] md:text-[10px] rounded-xl" 
                          onClick={() => handleBookNow(room.id)}
                        >
                          Book Unit
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

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
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Arrival</label>
                        <div className="relative">
                            <input type="date" required value={bookingDetails.checkIn} onChange={e => setBookingDetails({...bookingDetails, checkIn: e.target.value})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Departure</label>
                        <div className="relative">
                            <input type="date" required value={bookingDetails.checkOut} onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                    <input type="text" placeholder="As per Passport..." required value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Registry</label>
                        <input type="email" placeholder="pilgrim@registry.com" required value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Vector</label>
                        <input type="tel" placeholder="+XX XXXXXXXX" required value={bookingDetails.phone} onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Promo Code (Optional)</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter code" value={bookingDetails.promoCode} onChange={e => setBookingDetails({...bookingDetails, promoCode: e.target.value.toUpperCase()})} className="w-full bg-gray-100 border-none rounded-lg p-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/50 uppercase" />
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
