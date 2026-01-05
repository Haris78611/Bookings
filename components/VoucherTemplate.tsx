import React from 'react';
import { Booking, Agent } from '../types';
import { useAppContext } from '../context/AppContext';

export const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
};

export const VoucherTemplate: React.FC<{ booking: Booking, agent?: Agent | null, id: string, priceDisplay?: string }> = ({ booking, agent, id, priceDisplay }) => {
    const { formatPrice, siteSettings } = useAppContext();

    if (!siteSettings) return null; // Or a loading state
    
    const isLogoUrl = siteSettings.logo && (
        siteSettings.logo.startsWith('data:image') || 
        siteSettings.logo.startsWith('http') || 
        siteSettings.logo.includes('/') ||
        siteSettings.logo.includes('.')
    );

    return (
        <div id={id} className="w-full max-w-4xl mx-auto bg-white p-0 font-sans text-neutralDark shadow-2xl border-t-8 border-[#005B5C]">
            <div className="p-12">
                <header className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-4">
                        {isLogoUrl ? (
                            <img src={siteSettings.logo} alt="Logo" className="h-12 w-12 object-contain bg-gray-100 p-1 rounded-lg shadow-lg" />
                        ) : (
                            <div className="w-12 h-12 bg-[#006D77] flex items-center justify-center rounded-lg shadow-lg">
                                <span className="text-2xl text-white">{siteSettings.logo || '🕋'}</span>
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-black text-[#006D77] tracking-tighter uppercase italic">{siteSettings.name}</h1>
                            <p className="text-[10px] font-black text-[#006D77]/60 tracking-widest uppercase">{siteSettings.contactEmail}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Booking ID</p>
                        <p className="text-xl font-black text-[#E29578] uppercase mb-4">{booking.id}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-black text-green-600 uppercase">{booking.status}</p>
                    </div>
                </header>

                <h2 className="text-3xl font-black text-gray-800 mb-8 tracking-tighter uppercase">Booking Voucher</h2>
                <div className="h-px bg-gray-100 mb-10"></div>

                <div className="grid grid-cols-2 gap-16 mb-12">
                    <div>
                        <h3 className="text-sm font-black text-[#006D77] uppercase tracking-widest mb-2">Guest Information</h3>
                        <div className="h-0.5 w-full bg-[#006D77] mb-4 opacity-30"></div>
                        <p className="text-2xl font-black text-gray-800 mb-1">{booking.guestName}</p>
                        <p className="text-sm font-bold text-gray-400">{booking.guestPhone}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[#006D77] uppercase tracking-widest mb-2">Hotel Details</h3>
                        <div className="h-0.5 w-full bg-[#006D77] mb-4 opacity-30"></div>
                        <p className="text-2xl font-black text-gray-800 mb-1">{booking.hotelName}</p>
                        <p className="text-sm font-bold text-gray-400">{siteSettings.contactAddress}</p>
                    </div>
                </div>
                
                {agent && (
                    <div className="mb-12">
                        <h3 className="text-sm font-black text-[#006D77] uppercase tracking-widest mb-2">Booked By</h3>
                        <div className="h-0.5 w-full bg-[#006D77] mb-4 opacity-30"></div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div>
                                <p className="font-bold text-lg text-gray-800 leading-tight">{agent.agencyName}</p>
                                <p className="text-xs text-gray-400 font-mono">ID: {agent.id}</p>
                            </div>
                            <div className="text-right">
                                {agent.iataCode && <p className="font-semibold text-gray-600">IATA: <span className="font-bold">{agent.iataCode}</span></p>}
                                {agent.contactNumber && <p className="font-semibold text-gray-600">Contact: <span className="font-bold">{agent.contactNumber}</span></p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-[#F0F7F8] p-8 flex justify-between items-center mb-12 rounded-xl">
                    <div className="text-center flex-1 border-r border-[#DCEEF0]"><p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-in Date</p><p className="text-lg font-black text-[#006D77]">{formatDateLabel(booking.checkIn)}</p></div>
                    <div className="text-center flex-1 border-r border-[#DCEEF0]"><p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-out Date</p><p className="text-lg font-black text-[#006D77]">{formatDateLabel(booking.checkOut)}</p></div>
                    <div className="text-center flex-1"><p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Room Type</p><p className="text-lg font-black text-[#006D77] uppercase">{booking.roomType.split(' ')[0]}</p></div>
                </div>

                {booking.activationKey && booking.roomNumber && (
                    <div className="bg-teal-50/50 p-8 flex justify-between items-center mb-16 rounded-xl border border-teal-200">
                        <div className="text-center flex-1">
                            <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest mb-2">Activation Key</p>
                            <p className="text-xl font-black text-teal-800 font-mono tracking-widest">{booking.activationKey}</p>
                        </div>
                        <div className="text-center flex-1 border-l border-teal-200">
                            <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest mb-2">Room Number</p>
                            <p className="text-xl font-black text-teal-800 font-mono tracking-widest">{booking.roomNumber}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-end mb-16">
                    {booking.showPriceOnVoucher !== false ? (
                      <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-5xl font-black text-[#006D77] tracking-tighter">
                            {priceDisplay !== undefined ? priceDisplay : formatPrice(booking.totalPrice)}
                          </p>
                      </div>
                    ) : (
                      <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                          <p className="text-2xl font-black text-[#006D77] tracking-tighter">CONFIDENTIAL</p>
                      </div>
                    )}
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Scan to Verify Registry</p>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/#/track?id=' + booking.id)}`} alt="Verification QR" className="w-24 h-24 border-2 border-[#006D77]/10 p-1 bg-white" />
                        <p className="text-[8px] font-bold text-gray-400 mt-2 max-w-[120px] mx-auto leading-tight">
                            Scan within 24 hours of check-in for activation key & room no.
                       </p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-8"></div>
                <footer className="flex justify-between items-start">
                    <div className="flex-1"><h4 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-widest">Important Notes:</h4><ul className="space-y-3">{['Please present this voucher upon check-in.', 'This booking is non-refundable unless otherwise stated.', `For assistance, contact us at ${siteSettings.contactEmail}.`].map((note, i) => (<li key={i} className="flex gap-3 text-xs font-bold text-gray-400 leading-relaxed"><span className="text-[#006D77]">•</span>{note}</li>))}</ul></div>
                    <div className="text-right pl-10"><h4 className="text-xs font-black text-gray-800 mb-3 uppercase tracking-widest">Authorized Contact</h4><p className="text-[10px] font-bold text-gray-500 mb-1">{siteSettings.contactEmail}</p><p className="text-[10px] font-bold text-gray-500 mb-1">{siteSettings.contactPhone}</p><p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mt-4">www.umrahstay.com</p></div>
                </footer>
            </div>
        </div>
    );
};