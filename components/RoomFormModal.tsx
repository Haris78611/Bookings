
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from './UI';
import { Room } from '../types';
import { useAppContext } from '../context/AppContext';

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  hotelId: string;
}

const RoomFormModal: React.FC<RoomFormModalProps> = ({ isOpen, onClose, room, hotelId }) => {
  const { addRoomToHotel, updateRoomInHotel } = useAppContext();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    amenities: '',
    purchasePricePerNight: 0,
    agentPricePerNight: 0,
    customerPricePerNight: 0,
    capacity: 2,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        type: room.type,
        description: room.description,
        amenities: room.amenities.join(', '),
        purchasePricePerNight: room.purchasePricePerNight,
        agentPricePerNight: room.agentPricePerNight,
        customerPricePerNight: room.customerPricePerNight,
        capacity: room.capacity,
      });
    } else {
      setFormData({
        type: '', description: '', amenities: '',
        purchasePricePerNight: 0, agentPricePerNight: 0, customerPricePerNight: 0, capacity: 2,
      });
    }
  }, [room, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('Price') || name === 'capacity' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roomData: Partial<Room> = {
      ...formData,
      amenities: formData.amenities.split(',').map(a => a.trim()),
    };
    
    if (room) {
      updateRoomInHotel(hotelId, { ...room, ...roomData } as Room);
    } else {
      const newRoom: Room = {
        id: `R-${Date.now()}`,
        images: ['https://placehold.co/600x400?text=Room'],
        ...roomData
      } as Room;
      addRoomToHotel(hotelId, newRoom);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="type" label="Room Type" value={formData.type} onChange={handleChange} required />
        <div>
          <label className="text-xs font-bold uppercase">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <Input name="amenities" label="Amenities (comma-separated)" value={formData.amenities} onChange={handleChange} />
        <div className="grid grid-cols-3 gap-2">
          <Input name="purchasePricePerNight" label="Purchase Price" type="number" value={formData.purchasePricePerNight} onChange={handleChange} />
          <Input name="agentPricePerNight" label="Agent Price" type="number" value={formData.agentPricePerNight} onChange={handleChange} />
          <Input name="customerPricePerNight" label="Customer Price" type="number" value={formData.customerPricePerNight} onChange={handleChange} />
        </div>
        <Input name="capacity" label="Capacity" type="number" value={formData.capacity} onChange={handleChange} />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{room ? 'Save Changes' : 'Add Room'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomFormModal;
