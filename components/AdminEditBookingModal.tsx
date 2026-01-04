
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
  const { updateBookingStatus } = useAppContext();
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
      alert(`Booking ${booking.id} has been updated.`);
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Booking ${booking.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Guest Name" name="guestName" value={formData.guestName || ''} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Check-in Date" name="checkIn" type="date" value={formData.checkIn || ''} onChange={handleChange} />
          <Input label="Check-out Date" name="checkOut" type="date" value={formData.checkOut || ''} onChange={handleChange} />
        </div>
        <Select
          label="Booking Status"
          name="status"
          value={formData.status || ''}
          onChange={handleChange}
          options={Object.values(BookingStatus).map(s => ({ value: s, label: s }))}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminEditBookingModal;
