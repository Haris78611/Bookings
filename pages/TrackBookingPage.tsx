
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select } from '../components/UI';
import { BookingStatus, Booking } from '../types';

const TrackBookingPage: React.FC = () => {
  const { bookings, formatPrice, siteSettings, updateBookingStatus, addToast } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<Booking | 'not_found' | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Modification State
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [modifyForm, setModifyForm] = useState({ 
    checkIn: '', 
    checkOut: '', 
    roomType: '', 
    reason: '',
    requestType: 'Date Change'
  });

  // Handle URL parameters (e.g., ?id=BK12345) for QR scanning
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setSearchId(idParam);
      const found = bookings.find(b => b.id.toLowerCase() === idParam.toLowerCase().trim());
      setResult(found || 'not_found');
    }
  }, [location, bookings]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    const found = bookings.find(b => b.id.toLowerCase() === searchId.toLowerCase().trim());
    setResult(found || 'not_found');
    // Update URL without reloading to reflect current search
    navigate(`?id=${searchId.trim()}`, { replace: true });
  };

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
      addToast("Error generating digital voucher.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const openModifyModal = (booking: Booking) => {
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
    if (result && result !== 'not_found') {
      const newStatus = modifyForm.requestType === 'Cancellation' 
        ? BookingStatus.CANCEL_REQUESTED 
        : BookingStatus.DATE_CHANGE_REQUESTED;
        
      if (newStatus === BookingStatus.DATE_CHANGE_REQUESTED) {
        updateBookingStatus(result.id, newStatus, { requestedCheckIn: modifyForm.checkIn, requestedCheckOut: modifyForm.checkOut });
      } else {
        updateBookingStatus(result.id, newStatus);
      }
      
      addToast(`${modifyForm.requestType} request for ${result.id} has been sent.`);
      setIsModifyModalOpen(false);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-10 md:p-14 text-center border-none shadow-xl !rounded-none">
            <h1 className="text-4xl font-black text-[#006D77] mb-3 uppercase tracking-tighter italic">Track Booking</h1>
            <p className="text-gray-500 mb-10 text-sm font-medium">Search for your reservation ID or scan your voucher QR code.</p>
            
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                placeholder="Enter Booking ID (e.g., BK12345)" 
                value={searchId} 
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-white border border-gray-200 px-5 py-3.5 outline-none focus:border-[#006D77] transition-all text-gray-700 font-bold !rounded-none"
              />
              <Button 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="!rounded-none px-10"
              >
                Track
              </Button>
            </form>
          </Card>
        </div>

        {result === 'not_found' && (
          <div className="bg-red-50 border border-red-200 p-8 rounded-none text-center animate-in fade-in zoom-in duration-300 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-red-700 mb-1">Unverified ID</h3>
            <p className="text-red-600 text-sm">Registry ID <strong>{searchId}</strong> is not present in our authorized ledger.</p>
          </div>
        )}

        {result && result !== 'not_found' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto">
            <Card className="overflow-hidden border-none shadow-2xl !rounded-none">
              <div className="bg-[#006D77] p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Umrah Hotels</h2>
                  <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.3em]">Official Voucher Registry</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusVariant(result.status)}>{result.status}</Badge>
                  <p className="text-[10px] font-black mt-2 opacity-60 uppercase tracking-widest">GDS: {result.id}</p>
                </div>
              </div>
              
              <div className="p-8 md:p-10 bg-white space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-3xl font-black text-neutralDark mb-2 uppercase tracking-tight">{result.hotelName}</h3>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{result.roomType} • {result.status} STAY</p>
                  </div>
                  <div className="flex flex-col md:items-end justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Valuation</p>
                    <p className="text-3xl font-black text-primary">{formatPrice(result.totalPrice)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Arrival</p>
                    <p className="text-lg font-black text-neutralDark">{result.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Departure</p>
                    <p className="text-lg font-black text-neutralDark">{result.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Main Pilgrim</p>
                    <p className="text-lg font-black text-neutralDark">{result.guestName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Registry QR</p>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/#/track?id=' + result.id)}`} 
                          alt="Verification QR"
                          className="w-14 h-14 border-2 border-primary/10 p-1"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Vector</p>
                        <p className="text-lg font-black text-neutralDark truncate">{result.guestPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Channel Support</p>
                    <p className="text-sm font-bold text-[#006D77]">{siteSettings.contactEmail}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:px-8 !rounded-none font-black text-[10px] uppercase tracking-widest"
                      onClick={() => handleDownloadVoucher(result)}
                      disabled={isGeneratingPdf}
                    >
                      {isGeneratingPdf ? 'Processing...' : 'Download PDF'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1 sm:px-8 !rounded-none font-black text-[10px] uppercase tracking-widest shadow-lg"
                      onClick={() => openModifyModal(result)}
                    >
                      Modify Stay
                    </Button>
                  </div>
                </div>
              </div>

              {/* HIDDEN VOUCHER TEMPLATE FOR PDF CAPTURE */}
              <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                <div id={`voucher-template-${result.id}`} className="w-[800px] bg-white p-0 font-sans text-neutralDark">
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
                        <p className="text-xl font-black text-[#E29578] uppercase mb-4">{result.id}</p>
                        
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Expires On</p>
                        <p className="text-sm font-black text-gray-800 uppercase">{formatDateLabel(result.checkOut)}</p>
                      </div>
                    </header>

                    <h2 className="text-3xl font-black text-gray-800 mb-8 tracking-tighter uppercase">Booking Voucher</h2>
                    <div className="h-px bg-gray-100 mb-10"></div>

                    <div className="grid grid-cols-2 gap-16 mb-12">
                      <div>
                        <h3 className="text-sm font-black text-[#006D77] uppercase tracking-widest mb-2">Guest Information</h3>
                        <div className="h-0.5 w-full bg-[#006D77] mb-4 opacity-30"></div>
                        <p className="text-2xl font-black text-gray-800 mb-1">{result.guestName}</p>
                        <p className="text-sm font-bold text-gray-400">{result.guestPhone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#006D77] uppercase tracking-widest mb-2">Hotel Details</h3>
                        <div className="h-0.5 w-full bg-[#006D77] mb-4 opacity-30"></div>
                        <p className="text-2xl font-black text-gray-800 mb-1">{result.hotelName}</p>
                        <p className="text-sm font-bold text-gray-400">Authorized Logistics Region, Makkah KSA</p>
                      </div>
                    </div>

                    <div className="bg-[#F0F7F8] p-8 flex justify-between items-center mb-16 rounded-xl">
                      <div className="text-center flex-1 border-r border-[#DCEEF0]">
                        <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-in Date</p>
                        <p className="text-lg font-black text-[#006D77]">{formatDateLabel(result.checkIn)}</p>
                      </div>
                      <div className="text-center flex-1 border-r border-[#DCEEF0]">
                        <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Check-out Date</p>
                        <p className="text-lg font-black text-[#006D77]">{formatDateLabel(result.checkOut)}</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] font-black text-[#006D77] uppercase tracking-widest mb-2">Room Type</p>
                        <p className="text-lg font-black text-[#006D77] uppercase">{result.roomType.split(' ')[0]}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-16">
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount Paid</p>
                        <p className="text-5xl font-black text-[#006D77] tracking-tighter">{formatPrice(result.totalPrice)}</p>
                        <p className="text-sm font-black text-green-600 uppercase tracking-widest mt-2">Status: {result.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Scan to Verify Registry</p>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/#/track?id=' + result.id)}`} 
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
          </div>
        )}
      </div>

      {/* Modify Stay Modal */}
      <Modal 
        isOpen={isModifyModalOpen} 
        onClose={() => setIsModifyModalOpen(false)} 
        title="Stay Adjustment"
      >
        <form onSubmit={handleModifySubmit} className="space-y-6">
          <p className="text-xs text-gray-500 font-medium italic">
            "Request stay adjustments directly from our authorized registry desk. Please select the type of request below."
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
              placeholder="Provide context for our review team..."
              value={modifyForm.reason}
              onChange={e => setModifyForm({...modifyForm, reason: e.target.value})}
            />
          </div>

          <Button type="submit" variant="teal" fullWidth className="!rounded-none h-14 font-black uppercase tracking-widest">Submit Request</Button>
        </form>
      </Modal>
    </div>
  );
};

export default TrackBookingPage;