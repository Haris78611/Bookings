import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, Modal, Input, Select } from '../components/UI';
import { BookingStatus, Booking } from '../types';
import { VoucherTemplate } from '../components/VoucherTemplate';

const TrackBookingPage: React.FC = () => {
  const { bookings, formatPrice, siteSettings, updateBookingStatus, addToast, agencies } = useAppContext();
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

  const agent = result && result !== 'not_found' && result.agencyId ? agencies.find(a => a.id === result.agencyId) : null;

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
    if (status === BookingStatus.PENDING) return 'warning';
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

  return (
    <div className="bg-[#f1f5f9] min-h-screen py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-10 md:p-14 text-center border-none shadow-xl rounded-2xl">
            <h1 className="text-4xl font-black text-[#006D77] mb-3 uppercase tracking-tighter italic">Track Booking</h1>
            <p className="text-gray-500 mb-10 text-sm font-medium">Search for your reservation ID or scan your voucher QR code.</p>
            
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                placeholder="Enter Booking ID (e.g., BK12345)" 
                value={searchId} 
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-white border border-gray-200 px-5 py-3.5 outline-none focus:border-[#006D77] transition-all text-gray-700 font-bold rounded-xl"
              />
              <Button 
                type="submit" 
                variant="secondary" 
                size="lg"
                className="px-10"
              >
                Track
              </Button>
            </form>
          </Card>
        </div>

        {result === 'not_found' && (
          <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center animate-in fade-in zoom-in duration-300 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-red-700 mb-1">Unverified ID</h3>
            <p className="text-red-600 text-sm">Registry ID <strong>{searchId}</strong> is not present in our authorized ledger.</p>
          </div>
        )}

        {result && result !== 'not_found' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto">
            <Card className="overflow-hidden border-none shadow-2xl rounded-2xl">
              <div className="bg-[#006D77] p-8 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{siteSettings.name}</h2>
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
                    {agent ? (
                        <>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Managed By</p>
                          <p className="text-lg font-bold text-primary text-right">{agent.agencyName}</p>
                        </>
                    ) : (
                        <>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Valuation</p>
                          <p className="text-3xl font-black text-primary">{formatPrice(result.totalPrice)}</p>
                        </>
                    )}
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
                
                {(() => {
                  const isCheckInNear = new Date(result.checkIn).getTime() - new Date().getTime() <= 24 * 60 * 60 * 1000;
                  return (
                    <div>
                      {result.activationKey && result.roomNumber ? (
                          <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg grid grid-cols-2 gap-4 text-center">
                              <div>
                                  <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Activation Key</p>
                                  <p className="text-2xl font-black text-teal-800 font-mono tracking-widest">{result.activationKey}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-1">Assigned Room</p>
                                  <p className="text-2xl font-black text-teal-800 font-mono tracking-widest">{result.roomNumber}</p>
                              </div>
                          </div>
                      ) : isCheckInNear && result.status === BookingStatus.CONFIRMED ? (
                          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                              <p className="text-sm font-bold text-yellow-700">Awaiting final check-in details from hotel. Please check again shortly.</p>
                          </div>
                      ) : result.status === BookingStatus.CONFIRMED ? (
                          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
                              <p className="text-sm font-bold text-gray-500">Key & Room # will be available 24 hours before check-in.</p>
                          </div>
                      ) : null}
                    </div>
                  );
                })()}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Channel Support</p>
                    <p className="text-sm font-bold text-[#006D77]">{siteSettings.contactEmail}</p>
                  </div>
                   <div className="flex gap-3 w-full sm:w-auto">
                    {(() => {
                        const isModificationPending = result.status === BookingStatus.CANCEL_REQUESTED || result.status === BookingStatus.DATE_CHANGE_REQUESTED;

                        if (result.status === BookingStatus.CANCELLED) {
                            return (
                                <div className="w-full sm:w-auto bg-red-50 text-red-700 p-4 rounded-lg text-center font-bold text-xs border border-red-200">
                                    <p>This booking has been cancelled.</p>
                                    <p className="font-medium mt-1">Please contact support for assistance.</p>
                                </div>
                            );
                        }
                        if (result.status === BookingStatus.PENDING) {
                            return (
                                 <div className="w-full sm:w-auto bg-yellow-50 text-yellow-700 p-4 rounded-lg text-center font-bold text-xs border border-yellow-200">
                                    <p>This booking is pending confirmation.</p>
                                    <p className="font-medium mt-1">Actions will be available once approved.</p>
                                </div>
                            );
                        }
                        if (agent) {
                            return (
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button 
                                  variant="outline" 
                                  className="w-full sm:w-auto sm:px-8 font-black text-[10px] uppercase tracking-widest"
                                  onClick={() => handleDownloadVoucher(result)}
                                  disabled={isGeneratingPdf}
                                >
                                  {isGeneratingPdf ? 'Processing...' : 'Download PDF'}
                                </Button>
                                <div className="w-full sm:w-auto bg-blue-50 text-blue-700 p-3 rounded-lg text-center font-bold text-[10px] border border-blue-200">
                                    <p className="uppercase tracking-widest">For modifications, please contact:</p>
                                    <p className="font-medium mt-1">{agent.agencyName} ({agent.contactNumber})</p>
                                </div>
                              </div>
                            );
                        }
                        // Default: Confirmed direct customer booking
                        return (
                            <>
                              <Button 
                                variant="outline" 
                                className="flex-1 sm:px-8 font-black text-[10px] uppercase tracking-widest"
                                onClick={() => handleDownloadVoucher(result)}
                                disabled={isGeneratingPdf}
                              >
                                {isGeneratingPdf ? 'Processing...' : 'Download PDF'}
                              </Button>
                              <Button 
                                variant="secondary" 
                                className="flex-1 sm:px-8 font-black text-[10px] uppercase tracking-widest shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                                onClick={() => openModifyModal(result)}
                                disabled={isModificationPending}
                              >
                                {isModificationPending ? 'Request Pending' : 'Modify Stay'}
                              </Button>
                            </>
                        );
                    })()}
                  </div>
                </div>
              </div>

              {/* HIDDEN VOUCHER TEMPLATE FOR PDF CAPTURE */}
              <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '800px' }}>
                <VoucherTemplate booking={result} agent={agent} id={`voucher-template-${result.id}`} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modify Stay Modal */}
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

export default TrackBookingPage;