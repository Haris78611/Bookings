import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select, LoadingSpinner } from '../components/UI';
import { BookingStatus, Booking } from '../types';
import { useNavigate } from 'react-router-dom';
import { VoucherTemplate } from '../components/VoucherTemplate';

const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, agencies, formatPrice, updateBookingStatus, siteSettings, addToast, isLoading } = useAppContext();
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
        <div className="min-h-screen flex items-center justify-center bg-neutralLight p-4">
          <Card className="max-w-md text-center p-12 shadow-2xl border-none rounded-2xl">
            <div className="text-5xl mb-6">🔐</div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Secure Access</h2>
            <p className="text-gray-500 mb-8 font-medium">Please login to access your personal booking history and digital travel documents.</p>
            <Button onClick={() => navigate('/login')} fullWidth size="lg">Portal Login</Button>
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
   
  const getStatusVariant = (status: BookingStatus) => {
    if (status === BookingStatus.CONFIRMED) return 'success';
    if (status === BookingStatus.CANCELLED) return 'danger';
    return 'warning';
  };

  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <h1 className="text-5xl font-black text-primary tracking-tighter uppercase">My Bookings</h1>
        </div>
        
        {isLoading ? <LoadingSpinner /> : myBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {myBookings.map(booking => {
              const agent = booking.agencyId ? agencies.find(a => a.id === booking.agencyId) : null;
              const isModificationPending = booking.status === BookingStatus.CANCEL_REQUESTED || booking.status === BookingStatus.DATE_CHANGE_REQUESTED;

              return (
              <Card key={booking.id} className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border border-gray-100 shadow-sm rounded-2xl">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-3 ${booking.status === BookingStatus.CONFIRMED ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1 p-8 md:p-10">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {booking.id}</span>
                    </div>
                    <h2 className="text-3xl font-black text-neutralDark leading-tight uppercase tracking-tight">{booking.hotelName}</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-2">{booking.roomType}</p>
                    
                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50 my-8">
                        <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Check-in</p><p className="text-lg font-black text-neutralDark">{booking.checkIn}</p></div>
                        <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Check-out</p><p className="text-lg font-black text-neutralDark">{booking.checkOut}</p></div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                       <div className="text-left">
                         <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Total Price</p>
                         <p className="text-3xl font-black text-primary">{formatPrice(booking.totalPrice)}</p>
                       </div>
                      <div className="flex w-full sm:w-auto gap-4">
                        <Button variant="outline" onClick={() => openModifyModal(booking)} disabled={isModificationPending} className="flex-1">
                          {isModificationPending ? 'Request Pending' : 'Modify'}
                        </Button>
                        
                        {booking.status === BookingStatus.CONFIRMED ? (
                          <Button variant="teal" onClick={() => handleDownloadVoucher(booking)} disabled={isGeneratingPdf} className="flex-1">
                            {isGeneratingPdf ? '...' : 'Voucher'}
                          </Button>
                        ) : (
                           <div className="flex items-center px-4 py-2 border border-dashed rounded-xl"><span className="text-[10px] font-black text-gray-400 uppercase">Pending</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px' }}>
                    <VoucherTemplate booking={booking} agent={agent} id={`voucher-template-${booking.id}`} />
                </div>
              </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-24 text-center rounded-2xl border-none shadow-xl">
            <h2 className="text-2xl font-bold">No bookings found.</h2>
          </Card>
        )}
      </div>

      <Modal isOpen={isModifyModalOpen} onClose={() => setIsModifyModalOpen(false)} title="Stay Adjustment Request">
        <form onSubmit={handleModifySubmit}>
            <div className="p-6 md:p-8 space-y-6">
              <Select label="Request Type" value={modifyForm.requestType} onChange={e => setModifyForm({...modifyForm, requestType: e.target.value})} options={[{ label: 'Date Change', value: 'Date Change' }, { label: 'Cancellation', value: 'Cancellation' }]} />
              {modifyForm.requestType === 'Date Change' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input label="New Check-in" type="date" value={modifyForm.checkIn} onChange={e => setModifyForm({...modifyForm, checkIn: e.target.value})} />
                  <Input label="New Check-out" type="date" value={modifyForm.checkOut} onChange={e => setModifyForm({...modifyForm, checkOut: e.target.value})} />
                </div>
              )}
              <div>
                <label>Reason for Request</label>
                <textarea value={modifyForm.reason} onChange={e => setModifyForm({...modifyForm, reason: e.target.value})} required className="w-full border p-2 rounded-lg" />
              </div>
            </div>
             <div className="bg-gray-100 p-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModifyModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;