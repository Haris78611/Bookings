
import React from 'react';
import { Booking } from '../types';
import { Modal, Button, Badge } from './UI';
import { useAppContext } from '../context/AppContext';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const DetailItem: React.FC<{ label: string, value: React.ReactNode, className?: string}> = ({ label, value, className }) => (
    <div className={className}>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-neutralDark">{value || 'N/A'}</p>
    </div>
);

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  const { agencies, formatPrice } = useAppContext();

  if (!booking) return null;
  
  const agent = agencies.find(a => a.id === booking.agencyId);
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Confirmed': return 'success';
        case 'Pending': return 'warning';
        case 'Cancelled': return 'danger';
        default: return 'info';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Booking: ${booking.id}`} size="xl">
      <div className="bg-gray-50/50">
        <div className="p-6 md:p-8 space-y-6">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-inner text-center">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight">{booking.guestName}</h3>
                <div className="mt-3"><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></div>
            </div>

            <div className="space-y-6">
                <section>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 pb-2 border-b">Guest Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailItem label="Email" value={booking.guestEmail} />
                        <DetailItem label="Phone" value={booking.guestPhone} />
                    </div>
                </section>
                <section>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 pb-2 border-b">Stay Details</h4>
                    <div className="space-y-4">
                        <DetailItem label="Hotel" value={booking.hotelName} />
                        <DetailItem label="Room Type" value={booking.roomType} />
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Check-in" value={booking.checkIn} />
                            <DetailItem label="Check-out" value={booking.checkOut} />
                        </div>
                    </div>
                </section>
                <section>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 pb-2 border-b">Financials</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Total Price" value={<span className="text-primary font-black text-base">{formatPrice(booking.totalPrice)}</span>} />
                        {agent && <DetailItem label="Booked By Agency" value={agent.agencyName} />}
                     </div>
                </section>
            </div>

        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="primary" onClick={onClose} className="!rounded-lg">Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;