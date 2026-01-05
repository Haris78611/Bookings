import React, { useState, useEffect } from 'react';
import { Booking, Currency } from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal, Button, Select, Input } from './UI';
import { VoucherTemplate } from './VoucherTemplate';

interface VoucherCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const VoucherCustomizationModal: React.FC<VoucherCustomizationModalProps> = ({ isOpen, onClose, booking }) => {
  const { hotels, agencies, addToast } = useAppContext();

  const [showPrice, setShowPrice] = useState<boolean | null>(null);
  const [priceType, setPriceType] = useState<'original' | 'agent' | 'custom'>('original');
  const [customAmount, setCustomAmount] = useState('');
  const [customCurrency, setCustomCurrency] = useState<Currency>('PKR');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // This state holds the final props for the hidden template to ensure it's rendered correctly before PDF generation
  const [pdfProps, setPdfProps] = useState<{booking: Booking, priceDisplay?: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShowPrice(null);
      setPriceType('original');
      setCustomAmount('');
      setCustomCurrency('PKR');
      setIsGenerating(false);
      setPdfProps(null);
    }
  }, [isOpen]);

  // When pdfProps is updated, trigger the PDF generation
  useEffect(() => {
    if (pdfProps) {
        // Timeout ensures the DOM has updated with the new props
        setTimeout(() => generatePdf(), 100);
    }
  }, [pdfProps]);

  if (!booking) return null;

  const agent = agencies.find(a => a.id === booking.agencyId);
  const hotel = hotels.find(h => h.id === booking.hotelId);
  const room = hotel?.rooms.find(r => r.id === booking.roomId);

  const getPrice = (type: 'original' | 'agent'): number => {
    if (!room) return 0;
    const nights = Math.max(1, (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 3600 * 24));
    if (type === 'original') return nights * room.customerPricePerNight;
    return nights * room.agentPricePerNight;
  };

  const formatPriceLocal = (price: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const generatePdf = async () => {
    const voucherId = `voucher-pdf-gen-${booking.id}`;
    const input = document.getElementById(voucherId);
    if (!input) {
      addToast("Voucher template not found for PDF generation.", "error");
      setIsGenerating(false);
      return;
    }

    try {
      const canvas = await (window as any).html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = (window as any).jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Voucher_${booking.id}.pdf`);
      addToast("Voucher downloaded successfully!");
      onClose();
    } catch (error) {
      console.error("PDF generation error:", error);
      addToast("Error generating PDF voucher.", "error");
    } finally {
      setIsGenerating(false);
      setPdfProps(null);
    }
  };
  
  const handleDownload = () => {
    setIsGenerating(true);
    let finalPriceDisplay: string | undefined = undefined;
    let bookingForPdf = { ...booking, showPriceOnVoucher: showPrice ?? false };

    if (showPrice) {
        if (priceType === 'original') finalPriceDisplay = formatPriceLocal(getPrice('original'), 'PKR');
        else if (priceType === 'agent') finalPriceDisplay = formatPriceLocal(getPrice('agent'), 'PKR');
        else if (priceType === 'custom') finalPriceDisplay = formatPriceLocal(Number(customAmount), customCurrency);
    }
    
    setPdfProps({ booking: bookingForPdf, priceDisplay: finalPriceDisplay });
  };

  const renderInitialStep = () => (
    <>
      <p className="text-center font-semibold text-gray-700">Do you want to display a price on the voucher?</p>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button variant="primary" size="lg" onClick={() => setShowPrice(true)}>Yes, show price</Button>
        <Button variant="outline" size="lg" onClick={() => setShowPrice(false)}>No, hide price</Button>
      </div>
    </>
  );

  const renderNoPriceStep = () => (
    <>
      <p className="text-center text-gray-600">The voucher will be generated without any price information.</p>
      <Button fullWidth size="lg" variant="secondary" onClick={handleDownload} disabled={isGenerating} className="mt-6">
        {isGenerating ? 'Generating...' : 'Download without Price'}
      </Button>
    </>
  );

  const renderPriceStep = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-3">Which price would you like to display?</label>
        <div className="space-y-2">
          {(['original', 'agent', 'custom'] as const).map(type => (
            <div key={type} onClick={() => setPriceType(type)} className={`p-4 border rounded-lg cursor-pointer transition-all ${priceType === type ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center">
                  <input type="radio" name="priceType" id={type} checked={priceType === type} readOnly className="h-4 w-4 mr-3 border-gray-300 text-primary focus:ring-primary"/>
                  <label htmlFor={type} className="font-bold capitalize">{type} Price</label>
              </div>
              {type === 'original' && <p className="text-xs text-gray-500 ml-7">The standard customer price: {formatPriceLocal(getPrice('original'), 'PKR')}</p>}
              {type === 'agent' && <p className="text-xs text-gray-500 ml-7">Your confidential purchase price: {formatPriceLocal(getPrice('agent'), 'PKR')}</p>}
              {type === 'custom' && <p className="text-xs text-gray-500 ml-7">Manually enter a price and currency.</p>}
            </div>
          ))}
        </div>
      </div>
      
      {priceType === 'custom' && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg animate-in fade-in duration-300">
          <Input label="Custom Amount" type="number" placeholder="e.g., 50000" value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
          <Select label="Currency" value={customCurrency} onChange={e => setCustomCurrency(e.target.value as Currency)} options={[{label:'PKR', value:'PKR'}, {label:'SAR', value:'SAR'}, {label:'USD', value:'USD'}]} />
        </div>
      )}

      <Button fullWidth size="lg" variant="secondary" onClick={handleDownload} disabled={isGenerating || (priceType === 'custom' && !customAmount)}>
        {isGenerating ? 'Generating...' : 'Download with Price'}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voucher Customization">
      <div className="p-8">
        {showPrice === null && renderInitialStep()}
        {showPrice === false && renderNoPriceStep()}
        {showPrice === true && renderPriceStep()}
        
        {showPrice !== null && (
            <div className="text-center mt-6">
                <Button variant="ghost" size="sm" onClick={() => setShowPrice(null)}>
                    &larr; Back
                </Button>
            </div>
        )}
      </div>
      
      {pdfProps && (
          <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
             <VoucherTemplate 
                booking={pdfProps.booking} 
                agent={agent} 
                id={`voucher-pdf-gen-${booking.id}`} 
                priceDisplay={pdfProps.priceDisplay} 
             />
          </div>
      )}
    </Modal>
  );
};

export default VoucherCustomizationModal;
