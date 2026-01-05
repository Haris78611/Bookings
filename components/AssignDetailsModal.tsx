import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { Modal, Input, Button } from './UI';
import { useAppContext } from '../context/AppContext';

interface AssignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const AssignDetailsModal: React.FC<AssignDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  const { assignBookingDetails, addToast } = useAppContext();
  const [key, setKey] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (booking) {
      setKey(booking.activationKey || '');
      setRoom(booking.roomNumber || '');
    }
  }, [booking, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !key.trim() || !room.trim()) {
      addToast("Please provide both an activation key and room number.", "error");
      return;
    }
    assignBookingDetails(booking.id, { activationKey: key, roomNumber: room });
    addToast(`Details assigned to booking ${booking.id}.`);
    onClose();
  };

  if (!booking) return null;
  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Details: ${booking.id}`}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
          <p className="text-sm text-gray-500">Provide the final check-in details provided by the hotel for the guest.</p>
          <Input label="Activation Key" value={key} onChange={(e) => setKey(e.target.value)} required className={inputStyle} placeholder="e.g., K-987654" />
          <Input label="Room Number" value={room} onChange={(e) => setRoom(e.target.value)} required className={inputStyle} placeholder="e.g., 1204" />
        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button type="submit" variant="primary" className="!rounded-lg">Save Details</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignDetailsModal;