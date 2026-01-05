
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
  const { addRoomToHotel, updateRoomInHotel, addToast } = useAppContext();
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
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
    };
    
    if (room) {
      updateRoomInHotel(hotelId, { ...room, ...roomData } as Room);
      addToast(`Room "${room.type}" updated.`);
    } else {
      const newRoom: Room = {
        id: `R-${Date.now()}`,
        images: ['https://placehold.co/600x400?text=Room'],
        ...roomData
      } as Room;
      addRoomToHotel(hotelId, newRoom);
      addToast(`New room "${newRoom.type}" added.`);
    }
    onClose();
  };

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
            <Input name="type" label="Room Type" value={formData.type} onChange={handleChange} required className={inputStyle} />
            <div>
                <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className={`block w-full p-3 md:p-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-lg shadow-inner focus:ring-0 focus:border-[#005B5C] focus:bg-white outline-none transition-all font-bold text-xs md:text-sm`} rows={2}/>
            </div>
            <Input name="amenities" label="Amenities (comma-separated)" value={formData.amenities} onChange={handleChange} className={inputStyle} />
            <div className="grid grid-cols-3 gap-4">
                <Input name="purchasePricePerNight" label="Purchase Price" type="number" value={formData.purchasePricePerNight} onChange={handleChange} className={inputStyle} />
                <Input name="agentPricePerNight" label="Agent Price" type="number" value={formData.agentPricePerNight} onChange={handleChange} className={inputStyle} />
                <Input name="customerPricePerNight" label="Customer Price" type="number" value={formData.customerPricePerNight} onChange={handleChange} className={inputStyle} />
            </div>
            <Input name="capacity" label="Capacity" type="number" value={formData.capacity} onChange={handleChange} className={inputStyle} />
        </div>
        <div className="bg-white p-4 flex justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="!rounded-lg">Cancel</Button>
          <Button type="submit" className="!rounded-lg">{room ? 'Save Changes' : 'Add Room'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomFormModal;