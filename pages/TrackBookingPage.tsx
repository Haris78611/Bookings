
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge } from '../components/UI';
import { BookingStatus } from '../types';

const TrackBookingPage: React.FC = () => {
  const { bookings, formatPrice, siteSettings } = useAppContext();
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const found = bookings.find(b => b.id.toLowerCase() === searchId.toLowerCase().trim());
    setResult(found || 'not_found');
  };

  const getStatusVariant = (status: BookingStatus) => {
    if (status === BookingStatus.CONFIRMED) return 'success';
    if (status === BookingStatus.CANCELLED) return 'danger';
    return 'warning';
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-16 px-4">
      <div className="container mx-auto">
        
        {/* Track Your Booking Card - Compact & Clean */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-10 md:p-14 text-center">
            <h1 className="text-4xl font-bold text-[#006D77] mb-3">Track Your Booking</h1>
            <p className="text-gray-500 mb-10 text-sm">Enter your Booking ID to see its status.</p>
            
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                placeholder="Enter Booking ID (e.g., BK12345)" 
                value={searchId} 
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-5 py-3.5 outline-none focus:ring-2 focus:ring-[#006D77]/20 focus:border-[#006D77] transition-all text-gray-700"
              />
              <Button 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="rounded-lg px-10"
              >
                Track
              </Button>
            </form>
          </Card>
        </div>

        {result === 'not_found' && (
          <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center animate-in fade-in zoom-in duration-300 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-red-700 mb-1">Booking Not Found</h3>
            <p className="text-red-600 text-sm">We couldn't locate a verified reservation with ID <strong>{searchId}</strong>.</p>
          </div>
        )}

        {result && result !== 'not_found' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto">
            <Card className="overflow-hidden border-none shadow-xl">
              <div className="bg-[#006D77] p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold italic">{siteSettings.name}</h2>
                  <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Official Voucher Registry</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusVariant(result.status)}>{result.status}</Badge>
                  <p className="text-xs mt-2 opacity-60">ID: {result.id}</p>
                </div>
              </div>
              
              <div className="p-8 md:p-10 bg-white space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-3xl font-bold text-neutralDark mb-2">{result.hotelName}</h3>
                    <p className="text-gray-500 font-medium">{result.roomType} • Makkah/Madina</p>
                  </div>
                  <div className="flex flex-col md:items-end justify-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stay Cost</p>
                    <p className="text-3xl font-bold text-primary">{formatPrice(result.totalPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-in</p>
                    <p className="text-lg font-bold text-neutralDark">{result.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Check-out</p>
                    <p className="text-lg font-bold text-neutralDark">{result.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Main Pilgrim</p>
                    <p className="text-lg font-bold text-neutralDark">{result.guestName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Email</p>
                    <p className="text-lg font-bold text-neutralDark truncate">{result.guestEmail}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400">CORPORATE SUPPORT</p>
                    <p className="text-sm font-bold text-[#006D77]">{siteSettings.contactEmail} • {siteSettings.contactPhone}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">Download PDF</Button>
                    <Button variant="secondary" size="sm">Modify Stay</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackBookingPage;
