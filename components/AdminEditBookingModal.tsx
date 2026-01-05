
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../types';
import { Modal, Input, Button, Select } from './UI';
import { useAppContext } from '../context/AppContext';

interface AdminEditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const AdminEditBookingModal: React.FC<AdminEditBookingModalProps> = ({ isOpen, onClose, booking }) => {
  const { updateBookingStatus, addToast } = useAppContext();
  const [formData, setFormData] = useState<Partial<Booking>>({});

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (booking && formData.status) {
      // In a real app, you'd update the whole booking object.
      // For now, we only have a function to update status.
      updateBookingStatus(booking.id, formData.status as BookingStatus);
      addToast(`Booking ${booking.id} has been updated.`);
      onClose();
    }
  };

  if (!booking) return null;
  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Booking: ${booking.id}`}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
          <Input label="Guest Name" name="guestName" value={formData.guestName || ''} onChange={handleChange} className={inputStyle} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Check-in Date" name="checkIn" type="date" value={formData.checkIn || ''} onChange={handleChange} className={inputStyle} />
            <Input label="Check-out Date" name="checkOut" type="date" value={formData.checkOut || ''} onChange={handleChange} className={inputStyle} />
          </div>
          <Select
            label="Booking Status"
            name="status"
            value={formData.status || ''}
            onChange={handleChange}
            options={Object.values(BookingStatus).map(s => ({ value: s, label: s }))}
            className={inputStyle}
          />
        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button type="submit" className="!rounded-lg">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminEditBookingModal;