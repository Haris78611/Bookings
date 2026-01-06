import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select, LoadingSpinner } from '../components/UI';
import { BookingStatus, Booking } from '../types';
import { useNavigate } from 'react-router-dom';
import { VoucherTemplate } from '../components/VoucherTemplate';

const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, agencies, formatPrice, updateBookingStatus, addToast, isLoading, hotels } = useAppContext();
  const navigate = useNavigate();

  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modifyForm, setModifyForm] = useState({ 
    checkIn: '', 
    checkOut: '', 
    reason: '',
    requestType: 'Date Change' 
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!currentUser) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <Card className="max-w-md text-center p-12 shadow-2xl border-none rounded-2xl">
            <div className="text-5xl mb-6">🔐</div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Secure Access</h2>
            <p className="text-gray-500 mb-8 font-medium">Please login to access your personal booking history and digital travel documents.</p>
            <Button onClick={() => navigate('/login')} fullWidth size="lg" className="rounded-full">Portal Login</Button>
          </Card>
        </div>
      );
  }

  const myBookings = bookings.filter(b => b.userId === currentUser?.id || b.agencyId === currentUser?.agencyId);

  const handleModifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking) {
      try {
        const newStatus = modifyForm.requestType === 'Cancellation' 
          ? BookingStatus.CANCEL_REQUESTED 
          : BookingStatus.DATE_CHANGE_REQUESTED;
        
        let details;
        if (newStatus === BookingStatus.DATE_CHANGE_REQUESTED) {
          details = { requestedCheckIn: modifyForm.checkIn, requestedCheckOut: modifyForm.checkOut };
        }
        
        await updateBookingStatus(selectedBooking.id, newStatus, details);
        addToast(`${modifyForm.requestType} request for ${selectedBooking.id} has been sent.`);
        setIsModifyModalOpen(false);
      } catch (error: any) {
        addToast(`Error: ${error.message}`, 'error');
      }
    }
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
      reason: '',
      requestType: 'Date Change'
    });
    setIsModifyModalOpen(true);
  };

  const getStatusBadgeClasses = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED: return 'bg-green-100 text-green-800';
      case BookingStatus.CANCELLED: return 'bg-red-100 text-red-800';
      case BookingStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-10">My Bookings</h1>
        
        {isLoading ? <LoadingSpinner /> : myBookings.length > 0 ? (
          <div className="space-y-8">
            {myBookings.map(booking => {
              const agent = booking.agencyId ? agencies.find(a => a.id === booking.agencyId) : null;
              const hotel = hotels.find(h => h.id === booking.hotelId);
              
              return (
                <Card key={booking.id} className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8 flex-1 flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${getStatusBadgeClasses(booking.status)} !rounded-full !px-3 !py-1`}>{booking.status}</Badge>
                            <span className="text-xs text-gray-400 font-medium">ID: {booking.id}</span>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-800">{booking.hotelName}</h2>
                          <p className="text-sm text-gray-500">{booking.roomType}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Stay Cost</p>
                          <p className="text-2xl font-bold text-teal-600">{formatPrice(booking.totalPrice)}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-6 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Check-in</p>
                            <p className="text-base font-bold text-gray-800">{booking.checkIn}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Check-out</p>
                            <p className="text-base font-bold text-gray-800">{booking.checkOut}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Guests</p>
                            <p className="text-base font-bold text-gray-800">2 Adults</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Location</p>
                            <p className="text-base font-bold text-gray-800">{hotel?.city}, KSA</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                          {(booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING) && (
                            <div className="flex items-center gap-2 text-green-600">
                              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                              <span className="text-xs font-bold">Refundable until check-in</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                           <Button 
                             variant="outline" 
                             onClick={() => openModifyModal(booking)} 
                             className="!rounded-lg px-6 !border-teal-600 !text-teal-600 !font-bold flex-1 !shadow-sm"
                             disabled={booking.status === BookingStatus.CANCELLED}
                           >
                             Manage Stay
                           </Button>
                           <Button 
                             variant="secondary" 
                             onClick={() => handleDownloadVoucher(booking)} 
                             disabled={isGeneratingPdf || booking.status !== BookingStatus.CONFIRMED}
                             className="!rounded-lg px-6 !font-bold flex-1"
                           >
                            {isGeneratingPdf ? '...' : 'Download Voucher'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  {/* Hidden template for PDF generation */}
                  <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px' }}>
                     <VoucherTemplate booking={booking} agent={agent} id={`voucher-template-${booking.id}`} />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-24 text-center rounded-2xl">
            <h2 className="text-2xl font-bold">No bookings found.</h2>
          </Card>
        )}
      </div>

      <Modal isOpen={isModifyModalOpen} onClose={() => setIsModifyModalOpen(false)} title="Stay Adjustment Request">
        <form onSubmit={handleModifySubmit}>
            <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                Stay modification requests are reviewed within 12 hours. Please provide the necessary details for your request below. Note that changes may be subject to availability and additional fees.
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