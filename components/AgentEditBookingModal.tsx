
import React, { useState, useEffect, useMemo } from 'react';
import { Booking } from '../types';
import { useAppContext } from '../context/AppContext';
import { Button, Input, Modal } from './UI';

interface AgentEditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
}

const AgentEditBookingModal: React.FC<AgentEditBookingModalProps> = ({ isOpen, onClose, booking }) => {
    const { updateBooking, addToast, formatPrice } = useAppContext();
    
    const [formData, setFormData] = useState({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkIn: '',
        checkOut: '',
        showPriceOnVoucher: true,
    });

    useEffect(() => {
      if (isOpen && booking) {
        setFormData({
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            showPriceOnVoucher: booking.showPriceOnVoucher ?? true,
        });
      }
    }, [isOpen, booking]);
    
    const totalPrice = useMemo(() => {
        if (!booking || !formData.checkIn || !formData.checkOut) return 0;
        const nights = Math.max(0, (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 3600 * 24));
        const originalNights = Math.max(1, (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 3600 * 24));
        const pricePerNight = booking.totalPrice / originalNights;
        return nights * pricePerNight;
    }, [formData.checkIn, formData.checkOut, booking]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        if (!formData.guestName.trim() || !formData.guestEmail.trim() || !formData.guestPhone.trim()) {
            addToast("Please fill in all customer details.", 'error');
            return;
        }

        const nights = (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 3600 * 24);
        if (nights <= 0) {
            addToast("Check-out date must be after check-in date.", 'error');
            return;
        }

        updateBooking(booking.id, { ...formData, totalPrice });
        
        addToast(`Booking ${booking.id} updated for ${formData.guestName}.`);
        onClose();
    };

    const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Voucher: ${booking?.id}`}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
                    <div className="text-center bg-white p-4 rounded-lg border shadow-inner">
                        <h4 className="font-bold text-lg text-primary">{booking?.hotelName}</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{booking?.roomType}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Check-in" type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} required className={inputStyle} />
                        <Input label="Check-out" type="date" value={formData.checkOut} onChange={e => setFormData({...formData, checkOut: e.target.value})} required className={inputStyle} />
                    </div>
                    <Input 
                        label="Pilgrim Full Name" 
                        required 
                        value={formData.guestName} 
                        onChange={e => setFormData({...formData, guestName: e.target.value})} 
                        className={inputStyle}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Contact Email" 
                            type="email" 
                            required 
                            value={formData.guestEmail} 
                            onChange={e => setFormData({...formData, guestEmail: e.target.value})} 
                            className={inputStyle}
                        />
                        <Input 
                            label="WhatsApp/Phone" 
                            required 
                            value={formData.guestPhone} 
                            onChange={e => setFormData({...formData, guestPhone: e.target.value})} 
                            className={inputStyle}
                        />
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="editShowPriceOnVoucher"
                                checked={formData.showPriceOnVoucher}
                                onChange={(e) => setFormData({...formData, showPriceOnVoucher: e.target.checked})}
                                className="h-5 w-5 accent-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="editShowPriceOnVoucher" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">
                                Show Price on Voucher
                            </label>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Price</p>
                            <p className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                        </div>
                    </div>
                </div>
                 <div className="bg-white p-4 flex justify-end gap-2 border-t">
                    <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
                    <Button type="submit" variant="primary" className="!rounded-lg">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AgentEditBookingModal;
