import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select } from '../components/UI';
import { BookingStatus, Booking } from '../types';
import { useNavigate } from 'react-router-dom';
import { VoucherTemplate } from '../components/VoucherTemplate';

const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, agencies, formatPrice, updateBookingStatus, siteSettings, addToast } = useAppContext();
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
            {myBookings.map(booking => {
              const agent = booking.agencyId ? agencies.find(a => a.id === booking.agencyId) : null;
              const isCheckInNear = new Date(booking.checkIn).getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
              const isModificationPending = booking.status === BookingStatus.CANCEL_REQUESTED || booking.status === BookingStatus.DATE_CHANGE_REQUESTED;

              return (
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

                    <div className="mt-8">
                        {booking.activationKey && booking.roomNumber ? (
                            <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg grid grid-cols-2 gap-4 mb-8">
                                <div>
                                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Activation Key</p>
                                    <p className="text-lg font-black text-teal-800 font-mono">{booking.activationKey}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Room Number</p>
                                    <p className="text-lg font-black text-teal-800 font-mono">{booking.roomNumber}</p>
                                </div>
                            </div>
                        ) : isCheckInNear && booking.status === BookingStatus.CONFIRMED ? (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center mb-8">
                                <p className="text-xs font-bold text-yellow-700">Awaiting final check-in details from the hotel. Please check back shortly.</p>
                            </div>
                        ) : booking.status === BookingStatus.CONFIRMED ? (
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center mb-8">
                                <p className="text-xs font-bold text-gray-500">Activation Key & Room Number will be available 24 hours before check-in.</p>
                            </div>
                        ) : null}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-between items-center">
                      <div className="flex items-center gap-3 text-[11px] text-primary/60 font-black uppercase tracking-widest">
                        <span className="w-2.5 h-2.5 bg-primary/30 rounded-full"></span>
                        Wholesale Rate Guaranteed
                      </div>
                      <div className="flex w-full sm:w-auto gap-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 sm:px-10 !rounded-none border-gray-200 font-black text-[10px] uppercase tracking-widest disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          onClick={() => openModifyModal(booking)}
                          disabled={isModificationPending}
                        >
                          {isModificationPending ? 'Request Pending' : 'Modify / Support'}
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
                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px' }}>
                    <VoucherTemplate booking={booking} agent={agent} id={`voucher-template-${booking.id}`} />
                </div>
              </Card>
              );
            })}
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
        title="Stay Adjustment Request"
      >
        <form onSubmit={handleModifySubmit}>
            <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                "Stay modification requests are reviewed within 12 hours. Please provide the necessary details for your request below. Note that changes may be subject to availability and additional fees."
              </p>
              <div className="bg-white p-6 rounded-xl border space-y-4">
                  <Select 
                    label="Request Type" 
                    value={modifyForm.requestType}
                    onChange={e => setModifyForm({...modifyForm, requestType: e.target.value})}
                    options={[
                      { label: 'Date Change Request', value: 'Date Change' },
                      { label: 'Booking Cancellation', value: 'Cancellation' },
                      { label: 'Other Inquiry', value: 'Other' }
                    ]}
                    className="!rounded-lg !bg-gray-100 border-gray-200"
                  />
    
                  {modifyForm.requestType === 'Date Change' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      <Input 
                        label="New Arrival" 
                        type="date" 
                        value={modifyForm.checkIn} 
                        onChange={e => setModifyForm({...modifyForm, checkIn: e.target.value})} 
                        className="!rounded-lg"
                      />
                      <Input 
                        label="New Departure" 
                        type="date" 
                        value={modifyForm.checkOut} 
                        onChange={e => setModifyForm({...modifyForm, checkOut: e.target.value})} 
                        className="!rounded-lg"
                      />
                    </div>
                  )}
    
                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Reason for Request</label>
                    <textarea 
                      className="w-full bg-white border border-gray-200 p-3 rounded-lg text-sm font-medium text-neutralDark outline-none focus:border-[#006D77]/50 min-h-[120px] resize-y"
                      placeholder="Please provide details to help our team process your request efficiently..."
                      value={modifyForm.reason}
                      onChange={e => setModifyForm({...modifyForm, reason: e.target.value})}
                      required
                    />
                  </div>
              </div>
            </div>
             <div className="bg-white p-4 flex justify-end gap-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModifyModalOpen(false)} className="!rounded-lg">Cancel</Button>
                <Button type="submit" variant="teal" className="!rounded-lg">Submit Request</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
