import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Modal, Input, StarRating, Card, LoadingSpinner } from '../components/UI';
import { BookingStatus, Hotel, PromoCode } from '../types';

// Icons
const WifiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.562a4.5 4.5 0 017.778 0M12 20.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.008z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-.008zM3.055 11.888a15 15 0 0121.89 0" /></svg>;
const TVIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a3 3 0 003 3h4a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ACIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10-10 10 10M2 12l10-10 10 10" /></svg>;
const RestaurantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.41-4.148L12 17.747l5.41-4.148" /></svg>;
const HaramViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const RoomServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-6 4a2 2 0 100-4 2 2 0 000 4z" /></svg>;

const amenityIcons: { [key: string]: React.FC } = { "free wifi": WifiIcon, "flat-screen tv": TVIcon, "air conditioning": ACIcon, "restaurants": RestaurantIcon, "haram view": HaramViewIcon, "room service": RoomServiceIcon };

const AmenityItem: React.FC<{ name: string }> = ({ name }) => {
  const Icon = amenityIcons[name.toLowerCase()] || (() => <span className="text-primary">•</span>);
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="text-primary"><Icon /></div>
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
      <img src={images[activeIdx]} className="w-full h-full object-cover" alt="Room" />
    </div>
  );
};

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hotels, formatPrice, currentUser, addBooking, addToast, openAuthModal, isLoading, validatePromoCode } = useAppContext();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    if (!isLoading) {
        const foundHotel = hotels.find(h => h.id === id);
        setHotel(foundHotel || null);
    }
  }, [id, hotels, isLoading]);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const [bookingDetails, setBookingDetails] = useState({ name: '', email: '', phone: '', checkIn: '2026-03-01', checkOut: '2026-04-01' });
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const selectedRoom = hotel?.rooms.find(r => r.id === selectedRoomId);
  
  const basePrice = useMemo(() => {
    if (!selectedRoom || !bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
    const nights = Math.max(0, (new Date(bookingDetails.checkOut).getTime() - new Date(bookingDetails.checkIn).getTime()) / (1000 * 3600 * 24));
    return nights * selectedRoom.customerPricePerNight;
  }, [selectedRoom, bookingDetails.checkIn, bookingDetails.checkOut]);
  
  const discount = useMemo(() => {
      if (!appliedPromo || basePrice === 0) return 0;
      if (appliedPromo.type === 'fixed') return Math.min(basePrice, appliedPromo.discount);
      return basePrice * (appliedPromo.discount / 100);
  }, [appliedPromo, basePrice]);

  const finalPrice = basePrice - discount;

  const handleBookNow = (roomId: string) => {
    if (!currentUser) { openAuthModal('customer-login'); return; }
    setSelectedRoomId(roomId);
    setPromoCodeInput('');
    setAppliedPromo(null);
    setIsBookingModalOpen(true);
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    const promo = await validatePromoCode(promoCodeInput);
    if (promo) {
        setAppliedPromo(promo);
        addToast(`Promo code "${promo.code}" applied!`);
    }
  };
  
  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !bookingDetails.name || !bookingDetails.email || !bookingDetails.phone) {
      addToast("Please fill in all required fields.", "error"); return;
    }
    
    try {
        const bookingId = await addBooking({
          hotelId: hotel!.id, hotelName: hotel!.name, roomId: selectedRoom.id, roomType: selectedRoom.type,
          checkIn: bookingDetails.checkIn, checkOut: bookingDetails.checkOut, guestName: bookingDetails.name, guestEmail: bookingDetails.email,
          guestPhone: bookingDetails.phone, totalPrice: finalPrice, userId: currentUser?.id, promoCode: appliedPromo?.code
        });
        if(bookingId) {
            setIsBookingModalOpen(false);
            navigate(`/confirmation/${bookingId}`);
        } else {
            addToast("Booking failed. Please try again.", 'error');
        }
    } catch(error: any) {
        addToast(error.message, 'error');
    }
  };

  if (isLoading || !hotel) return (
    <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Gallery and Header */}
      <section className="h-[550px] relative bg-gray-900 text-white">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-2">
            <div className="col-span-3 row-span-2"><img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover"/></div>
            <div className="col-span-1 row-span-1"><img src={hotel.images[1] || hotel.images[0]} alt="" className="w-full h-full object-cover"/></div>
            <div className="col-span-1 row-span-1"><img src={hotel.images[2] || hotel.images[0]} alt="" className="w-full h-full object-cover"/></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative z-10">
          <StarRating count={hotel.stars} />
          <h1 className="text-4xl md:text-6xl font-black mt-3">{hotel.name}</h1>
          <p className="mt-3 text-lg opacity-90">{hotel.address}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-neutralDark mb-4">About this Sanctuary</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </section>
            <section>
              <h2 className="text-3xl font-bold text-neutralDark mb-6">Key Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map(a => <AmenityItem key={a} name={a} />)}
              </div>
            </section>
          </div>
          {/* Right Column */}
          <aside className="lg:sticky top-24 self-start">
            <Card className="p-6 rounded-xl shadow-lg border-gray-100 space-y-6">
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">City:</span><span className="font-bold text-gray-800">{hotel.city}</span></div>
              <div className="flex justify-between items-center"><span className="font-semibold text-gray-500">Distance:</span><span className="font-bold text-gray-800">{hotel.distanceToHaram}m</span></div>
              <Button onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })} fullWidth size="lg">Select Room</Button>
            </Card>
          </aside>
        </div>
      </div>

      {/* Rooms Section */}
      <section id="rooms-section" className="bg-gray-50 py-20 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary text-center mb-12">Select Your Sanctuary</h2>
          <div className="max-w-5xl mx-auto space-y-8">
            {hotel.rooms.map(room => (
              <Card key={room.id} className="grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
                  <div className="md:col-span-1 h-56 md:h-full">
                      <RoomGallery images={room.images} />
                  </div>
                  <div className="md:col-span-2 p-8 flex flex-col">
                      <h3 className="text-2xl font-black text-primary tracking-tight">{room.type}</h3>
                      <p className="text-sm text-gray-500 mt-2 mb-6 flex-grow">{room.description}</p>

                      <div className="mb-6">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Includes</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {room.amenities.map(amenity => (
                                  <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
                                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                      <span>{amenity}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-end">
                          <div>
                              <span className="text-[11px] text-gray-400 block font-medium">Price per night</span>
                              <div className="text-primary font-black whitespace-nowrap">
                                  <span className="text-3xl">{formatPrice(room.customerPricePerNight)}</span>
                              </div>
                          </div>
                          <Button variant="secondary" onClick={() => handleBookNow(room.id)} className="!rounded-lg !px-8 !py-3 !text-base shadow-lg">
                              Book Now
                          </Button>
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
                <Input label="Arrival" type="date" required value={bookingDetails.checkIn} onChange={e => setBookingDetails({...bookingDetails, checkIn: e.target.value})} />
                <Input label="Departure" type="date" required value={bookingDetails.checkOut} onChange={e => setBookingDetails({...bookingDetails, checkOut: e.target.value})} />
                <Input label="Full Name" required value={bookingDetails.name} onChange={e => setBookingDetails({...bookingDetails, name: e.target.value})} />
                <Input label="Email" type="email" required value={bookingDetails.email} onChange={e => setBookingDetails({...bookingDetails, email: e.target.value})} />
                <Input label="Phone" type="tel" required value={bookingDetails.phone} onChange={e => setBookingDetails({...bookingDetails, phone: e.target.value})} />
                
                <div className="pt-4 border-t">
                    <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Promo Code</label>
                    <div className="flex gap-2">
                        <Input placeholder="Enter code" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} disabled={!!appliedPromo} />
                        <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={!!appliedPromo || !promoCodeInput}>
                            {appliedPromo ? 'Applied' : 'Apply'}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 p-4 flex justify-between items-center mt-auto">
                 <div>
                    {discount > 0 && <p className="text-xs text-green-600 font-bold">Discount: -{formatPrice(discount)}</p>}
                    <span className="text-2xl font-black text-primary">{formatPrice(finalPrice)}</span>
                 </div>
                 <Button type="submit">Confirm Booking</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default HotelDetailsPage;