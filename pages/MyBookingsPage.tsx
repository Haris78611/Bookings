
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select } from '../components/UI';
import { BookingStatus, Booking } from '../types';
import { useNavigate } from 'react-router-dom';

const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, formatPrice, updateBookingStatus, siteSettings, addToast } = useAppContext();
  const navigate = useNavigate();

  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modifyForm, setModifyForm] = useState({ 
    checkIn: '', 
    checkOut: '', 
    roomType: '', 
    reason: '',
    requestType: 'Date Change' 
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-neutralLight p-4">
      <Card className="max-w-md text-center p-12 shadow-2xl border-none !rounded-none">
        <div className="text-5xl mb-6">🔐</div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Secure Access</h2>
        <p className="text-gray-500 mb-8 font-medium">Please login to access your personal booking history and digital travel documents.</p>
        <Button onClick={() => navigate('/login')} fullWidth size="lg" className="!rounded-none">Portal Login</Button>
      </Card>
    </div>
  );

  const myBookings = bookings.filter(b => b.userId === currentUser.id || b.agencyId === currentUser.agencyId);

  const getStatusVariant = (status: BookingStatus) => {
    if (status === BookingStatus.CONFIRMED) return 'success';
    if (status === BookingStatus.CANCELLED) return 'danger';
    return 'warning';
  };

  const handleDownloadVoucher = async (booking: Booking) => {
    const input = document.getElementById(`voucher-template-${booking.id}`);
    if (!input) return;

    setIsGeneratingPdf(true);
    try {
      const canvas = await (window as any).html2canvas(input, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${booking.id}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Error generating digital voucher. Please try again.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const openModifyModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setModifyForm({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      roomType: booking.roomType,
      reason: '',
      requestType: 'Date Change'
    });
    setIsModifyModalOpen(true);
  };

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking) {
      const newStatus = modifyForm.requestType === 'Cancellation' 
        ? BookingStatus.CANCEL_REQUESTED 
        : BookingStatus.DATE_CHANGE_REQUESTED;
      
      if (newStatus === BookingStatus.DATE_CHANGE_REQUESTED) {
        updateBookingStatus(selectedBooking.id, newStatus, {
            requestedCheckIn: modifyForm.checkIn,
            requestedCheckOut: modifyForm.checkOut
        });
      } else {
        updateBookingStatus(selectedBooking.id, newStatus);
      }

      addToast(`${modifyForm.requestType} request for ${selectedBooking.id} has been sent.`);
      setIsModifyModalOpen(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-[#f8fafa] min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl font-black text-primary tracking-tighter uppercase">My Bookings</h1>
            <p className="text-gray-500 mt-3 text-lg font-medium">Access your sacred journey itinerary and digital credentials.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/search')} className="shadow-xl !rounded-none">New Reservation</Button>
        </div>
        
        {myBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-1000">
            {myBookings.map(booking => (
              <Card key={booking.id} className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100 shadow-sm !rounded-none">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-3 ${booking.status === BookingStatus.CONFIRMED ? 'bg-green-500' : 'bg-[#E29578]'}`}></div>
                  
                  <div className="flex-1 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GDS REF: {booking.id}</span>
                        </div>
                        <h2 className="text-3xl font-black text-neutralDark leading-tight uppercase tracking-tight">{booking.hotelName}</h2>
                        <div className="flex flex-wrap gap-4 mt-2">
                           <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{booking.roomType}</p>
                           <span className="text-gray-300">•</span>
                           <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Pilgrim: {booking.guestName}</p>
                        </div>
                      </div>
                      <div className="text-left md:text-right bg-primary/5 px-6 py-4 border border-primary/10 w-full md:w-auto">
                         <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Stay Valuation</p>
                         <p className="text-3xl font-black text-primary">{formatPrice(booking.totalPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-y border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Check-in</p>
                        <p className="text-lg font-black text-neutralDark">{booking.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Check-out</p>
                        <p className="text-lg font-black text-neutralDark">{booking.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Occupancy</p>
                        <p className="text-lg font-black text-neutralDark">2 Adults</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</p>
                        <p className="text-lg font-black text-neutralDark">Holy Region</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-between items-center">
                      <div className="flex items-center gap-3 text-[11px] text-primary/60 font-black uppercase tracking-widest">
                        <span className="w-2.5 h-2.5 bg-primary/30 rounded-full"></span>
                        Wholesale Rate Guaranteed
                      </div>
                      <div className="flex w-full sm:w-auto gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 sm:px-10 !rounded-none border-gray-200 font-black text-[10px] uppercase tracking-widest"
                          onClick={() => openModifyModal(booking)}
                        >
                          Modify / Support
                        </Button>
                        
                        {booking.status === BookingStatus.CONFIRMED ? (
                          <Button 
                            variant="teal" 
                            className="flex-1 sm:px-10 !rounded-none shadow-lg font-black text-[10px] uppercase tracking-widest"
                            onClick={() => handleDownloadVoucher(booking)}
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? 'Processing...' : 'Download Voucher'}
                          </Button>
                        ) : (
                          <div className="flex items-center px-4 py-2 border border-[#E29578]/30 bg-[#E29578]/5">
                             <span className="text-[10px] font-black text-[#E29578] uppercase tracking-widest italic">
                               Confirmation Pending
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HIDDEN VOUCHER TEMPLATE FOR PDF CAPTURE */}
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                  <div id={`voucher-template-${booking.id}`} className="w-[800px] bg-white p-0 font-sans text-neutralDark">
                    <div className="h-2 bg-[#006D77]"></div>
                    <div className="p-12">
                      <header className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#006D77] flex items-center justify-center rounded-lg shadow-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                             </svg>
                          </div>
                          <div>
                            <h1 className="text-3xl font-black text-[#006D77] tracking-tighter uppercase italic">Umrah Hotels</h1>
                            <p className="text-[10px] font-black text-[#006D77]/60 tracking-widest uppercase">www.umrahstay.com</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Booking ID</p>
                          <p className="text-xl font-black text-[#E29578] uppercase mb-4">{booking.id}</p>
                          
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Expires On</p>
                          <p className="text-sm font-black text-gray-800 uppercase">{formatDateLabel(booking.checkOut)}</p>
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
                          <p className="text-sm font-bold text-gray-400">Authorized Logistics Region, Makkah KSA</p>
                        </div>
                      </div>

                      <div className="bg-[#F0F7F8] p-8 flex justify-between items-center mb-16 rounded-xl">
                        <div className="text-center flex-1 border-r border-[#DCEEF0]">
                          <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-in Date</p>
                          <p className="text-lg font-black text-[#006D77]">{formatDateLabel(booking.checkIn)}</p>
                        </div>
                        <div className="text-center flex-1 border-r border-[#DCEEF0]">
                          <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-out Date</p>
                          <p className="text-lg font-black text-[#006D77]">{formatDateLabel(booking.checkOut)}</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Room Type</p>
                          <p className="text-lg font-black text-[#006D77] uppercase">{booking.roomType.split(' ')[0]}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-16">
                        {booking.showPriceOnVoucher !== false ? (
                            <div>
                               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount Paid</p>
                               <p className="text-5xl font-black text-[#006D77] tracking-tighter">{formatPrice(booking.totalPrice)}</p>
                               <p className="text-sm font-black text-green-600 uppercase tracking-widest mt-2">Status: {booking.status}</p>
                            </div>
                          ) : (
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-2xl font-black text-[#006D77] tracking-tighter">CONFIDENTIAL</p>
                                <p className="text-sm font-black text-green-600 uppercase tracking-widest mt-2">Status: {booking.status}</p>
                            </div>
                          )}
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Scan to Verify Registry</p>
                           <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/#/track?id=' + booking.id)}`} 
                              alt="Verification QR"
                              className="w-24 h-24 border-2 border-[#006D77]/10 p-1 bg-white"
                           />
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 mb-8"></div>

                      <footer className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-gray-800 mb-4 uppercase tracking-widest">Important Notes:</h4>
                          <ul className="space-y-3">
                            {['Please present this voucher upon check-in. A valid photo ID may be required.', 
                              'This booking is non-refundable unless otherwise stated in the booking policy.', 
                              'For any assistance, please contact us at support@umrahhotels.com.'].map((note, i) => (
                              <li key={i} className="flex gap-3 text-xs font-bold text-gray-400 leading-relaxed">
                                <span className="text-[#006D77]">•</span>
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right pl-10">
                           <h4 className="text-xs font-black text-gray-800 mb-3 uppercase tracking-widest">Authorized Contact</h4>
                           <p className="text-[10px] font-bold text-gray-500 mb-1">{siteSettings.contactEmail}</p>
                           <p className="text-[10px] font-bold text-gray-500 mb-1">{siteSettings.contactPhone}</p>
                           <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mt-4">www.umrahstay.com</p>
                        </div>
                      </footer>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-24 text-center !rounded-none border-none shadow-xl">
            <div className="text-8xl mb-8">🕌</div>
            <h2 className="text-4xl font-black text-neutralDark mb-4 tracking-tighter uppercase">Registry is Empty</h2>
            <p className="text-gray-500 mb-12 max-w-sm mx-auto text-lg leading-relaxed font-medium italic opacity-80">"Prepare for your spiritual journey by reserving your sanctuary today."</p>
            <Button variant="primary" size="lg" className="px-12 !rounded-none shadow-2xl" onClick={() => navigate('/search')}>Explore Inventory</Button>
          </Card>
        )}
      </div>

      <Modal 
        isOpen={isModifyModalOpen} 
        onClose={() => setIsModifyModalOpen(false)} 
        title="Stay Adjustment"
      >
        <form onSubmit={handleModifySubmit} className="space-y-6">
          <p className="text-xs text-gray-500 font-medium italic">
            "Authorized stay modification requests are reviewed within 12 hours. Please select your request type below."
          </p>
          
          <Select 
            label="Request Type" 
            value={modifyForm.requestType}
            onChange={e => setModifyForm({...modifyForm, requestType: e.target.value})}
            options={[
              { label: 'Date Change Request', value: 'Date Change' },
              { label: 'Booking Cancellation', value: 'Cancellation' },
              { label: 'Refund Inquiry', value: 'Refund' }
            ]}
          />

          {modifyForm.requestType === 'Date Change' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
              <Input 
                label="New Arrival" 
                type="date" 
                value={modifyForm.checkIn} 
                onChange={e => setModifyForm({...modifyForm, checkIn: e.target.value})} 
              />
              <Input 
                label="New Departure" 
                type="date" 
                value={modifyForm.checkOut} 
                onChange={e => setModifyForm({...modifyForm, checkOut: e.target.value})} 
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Additional Context / Reason</label>
            <textarea 
              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-none text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50 min-h-[100px]"
              placeholder="Provide details for our administrative team..."
              value={modifyForm.reason}
              onChange={e => setModifyForm({...modifyForm, reason: e.target.value})}
            />
          </div>

          <Button type="submit" variant="teal" fullWidth className="!rounded-none h-14 font-black uppercase tracking-widest">Transmit Update</Button>
        </form>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;