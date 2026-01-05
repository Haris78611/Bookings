
import React, { useState, useEffect, useMemo } from 'react';
import { BulkOrderItem, BookingStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import { Button, Input, Modal } from './UI';

interface AgentBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignTarget: { orderId: string, item: BulkOrderItem } | null;
}

const AgentBookingModal: React.FC<AgentBookingModalProps> = ({ isOpen, onClose, assignTarget }) => {
    const { addBooking, currentUser, addToast, assignBulkOrderItem, formatPrice } = useAppContext();
    
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [showPriceOnVoucher, setShowPriceOnVoucher] = useState(true);

    useEffect(() => {
      if (isOpen && assignTarget) {
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setCheckIn(assignTarget.item.checkIn);
        setCheckOut(assignTarget.item.checkOut);
        setShowPriceOnVoucher(true);
      }
    }, [isOpen, assignTarget]);
    
    const totalPrice = useMemo(() => {
        if (!assignTarget || !checkIn || !checkOut) return 0;
        const nights = Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
        return nights * assignTarget.item.pricePerNight;
    }, [checkIn, checkOut, assignTarget]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignTarget || !currentUser?.agencyId) return;
        
        const { orderId, item } = assignTarget;

        if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
            addToast("Please fill in all customer details.", 'error');
            return;
        }

        const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24);
        if (nights <= 0) {
            addToast("Check-out date must be after check-in date.", 'error');
            return;
        }

        addBooking({
            id: `VCH-${Date.now()}`,
            hotelId: item.hotelId,
            hotelName: item.hotelName,
            roomId: item.roomId,
            roomType: item.roomType,
            checkIn: checkIn,
            checkOut: checkOut,
            guestName: guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
            totalPrice: totalPrice,
            status: BookingStatus.CONFIRMED,
            agencyId: currentUser.agencyId,
            createdAt: new Date().toISOString(),
            showPriceOnVoucher: showPriceOnVoucher,
        });

        assignBulkOrderItem(orderId, item.id);
        
        addToast(`Voucher issued for ${guestName}.`);
        onClose();
    };

    const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Inventory Unit">
            <form onSubmit={handleSubmit}>
                <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
                    <div className="text-center bg-white p-4 rounded-lg border shadow-inner">
                        <h4 className="font-bold text-lg text-primary">{assignTarget?.item.hotelName}</h4>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{assignTarget?.item.roomType}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Check-in" type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required className={inputStyle} />
                        <Input label="Check-out" type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required className={inputStyle} />
                    </div>
                    <Input 
                        label="Pilgrim Full Name" 
                        required 
                        value={guestName} 
                        onChange={e => setGuestName(e.target.value)} 
                        className={inputStyle}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="Contact Email" 
                            type="email" 
                            required 
                            value={guestEmail} 
                            onChange={e => setGuestEmail(e.target.value)} 
                            className={inputStyle}
                        />
                        <Input 
                            label="WhatsApp/Phone" 
                            required 
                            value={guestPhone} 
                            onChange={e => setGuestPhone(e.target.value)} 
                            className={inputStyle}
                        />
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="showPriceOnVoucher"
                                checked={showPriceOnVoucher}
                                onChange={(e) => setShowPriceOnVoucher(e.target.checked)}
                                className="h-5 w-5 accent-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="showPriceOnVoucher" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">
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
                    <Button type="submit" variant="primary" className="!rounded-lg">Confirm & Issue Voucher</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AgentBookingModal;
