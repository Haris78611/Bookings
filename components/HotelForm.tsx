
import React, { useState, useEffect } from 'react';
import { Hotel, Room } from '../types';
import { useAppContext } from '../context/AppContext';
import { Input, Button, Select } from './UI';
import { TableWrapper } from './AdminUI';


interface HotelFormProps {
  hotel?: Hotel | null;
  onSubmit: (hotelData: Hotel | Omit<Hotel, 'id'>) => void;
  onCancel: () => void;
}

const initialRoomData: Omit<Room, 'id' | 'images'> = {
    type: 'Double Room',
    description: 'A comfortable room for two.',
    amenities: ['Wifi', 'AC'],
    purchasePricePerNight: 0,
    agentPricePerNight: 0,
    customerPricePerNight: 0,
    capacity: 2,
};

const HotelForm: React.FC<HotelFormProps> = ({ hotel, onSubmit, onCancel }) => {
  const { formatPrice } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState<Omit<Hotel, 'id'> | Hotel>(() => {
    return hotel || {
        name: '',
        city: 'Makkah',
        address: '',
        stars: 5,
        distanceToHaram: 100,
        description: '',
        images: ['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop'],
        amenities: [],
        rooms: [],
        availableFrom: today,
        availableTo: tomorrowStr,
    };
  });
  
  const [isEditingRoom, setIsEditingRoom] = useState<Room | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Omit<Room, 'id' | 'images'> | (Omit<Room, 'images'> & {id: string})>(initialRoomData);

  const inputStyle = "!rounded-lg bg-gray-50 border-gray-200 shadow-inner";

  useEffect(() => {
    if (hotel) {
      setFormData({ ...hotel });
    } else {
        setFormData({
            name: '', city: 'Makkah', address: '', stars: 5, distanceToHaram: 100, description: '',
            images: ['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop'],
            amenities: [], rooms: [], availableFrom: today, availableTo: tomorrowStr,
        });
    }
  }, [hotel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'stars' || name === 'distanceToHaram') ? Number(value) : value }));
  };
  
  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const amenities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
      setFormData(prev => ({ ...prev, amenities }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentRoom(prev => ({ ...prev, [name]: name.includes('Price') || name === 'capacity' ? Number(value) : value }));
  };
  
  const handleRoomAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
    setCurrentRoom(prev => ({...prev, amenities}));
  }

  const handleSaveRoom = () => {
    if (isEditingRoom) {
      const updatedRooms = formData.rooms.map(room => room.id === isEditingRoom.id ? { ...isEditingRoom, ...currentRoom } : room);
      setFormData(prev => ({ ...prev, rooms: updatedRooms }));
    } else {
      const newRoom: Room = { ...currentRoom, id: `R-${Date.now()}`, images: ['https://placehold.co/600x400?text=Room'] } as Room;
      setFormData(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    }
    setShowRoomForm(false);
    setIsEditingRoom(null);
    setCurrentRoom(initialRoomData);
  };
  
  const handleEditRoom = (room: Room) => {
    setIsEditingRoom(room);
    setCurrentRoom(room);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
        const updatedRooms = formData.rooms.filter(room => room.id !== roomId);
        setFormData(prev => ({ ...prev, rooms: updatedRooms }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-gray-50/50">
      <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
        <section>
          <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Hotel Details</h3>
          <div className="space-y-4">
            <Input name="name" label="Hotel Name" value={formData.name} onChange={handleChange} required className={inputStyle} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="city" label="City" value={formData.city} onChange={handleChange} required className={inputStyle} options={[{value: 'Makkah', label: 'Makkah'}, {value: 'Madina', label: 'Madina'}]} />
              <Input name="address" label="Address" value={formData.address} onChange={handleChange} required className={inputStyle} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="availableFrom" label="Available From" type="date" value={formData.availableFrom} onChange={handleChange} className={inputStyle} />
              <Input name="availableTo" label="Available To" type="date" value={formData.availableTo} onChange={handleChange} className={inputStyle} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="stars" label="Star Rating (1-5)" type="number" min="1" max="5" value={formData.stars} onChange={handleChange} required className={inputStyle} />
              <Input name="distanceToHaram" label="Distance to Haram (m)" type="number" value={formData.distanceToHaram} onChange={handleChange} required className={inputStyle} />
            </div>
            <Input name="amenities" label="Amenities (comma-separated)" value={formData.amenities.join(', ')} onChange={handleAmenitiesChange} className={inputStyle} />
            <div>
              <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="block w-full p-3 md:p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg shadow-inner focus:ring-0 focus:border-[#005B5C] focus:bg-white outline-none transition-all font-bold text-xs md:text-sm" required></textarea>
            </div>
          </div>
        </section>

        <section className="pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-primary">Room Inventory</h3>
                {!showRoomForm && <Button type="button" variant="secondary" size="sm" onClick={() => { setShowRoomForm(true); setIsEditingRoom(null); setCurrentRoom(initialRoomData);}} className="!rounded-lg">+ Add Room</Button>}
            </div>

            {showRoomForm ? (
                <div className="p-6 bg-white rounded-xl space-y-4 border border-gray-200 animate-in fade-in duration-300">
                    <h5 className="font-bold text-sm uppercase tracking-widest text-secondary">{isEditingRoom ? 'Edit Room Unit' : 'Add New Room Unit'}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="type" label="Room Type (e.g. Quad, Suite)" value={currentRoom.type} onChange={handleRoomChange} required className={inputStyle} />
                      <Input name="capacity" label="Capacity" type="number" min="1" value={currentRoom.capacity} onChange={handleRoomChange} required className={inputStyle} />
                    </div>
                    <div>
                      <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">Description</label>
                      <textarea name="description" value={currentRoom.description} onChange={e => setCurrentRoom({...currentRoom, description: e.target.value})} rows={2} className="block w-full p-3 md:p-4 bg-white border border-gray-200 text-gray-900 rounded-lg shadow-inner focus:ring-0 focus:border-[#005B5C] outline-none transition-all font-bold text-xs md:text-sm"></textarea>
                    </div>
                    <Input name="amenities" label="Amenities (comma-separated)" value={Array.isArray(currentRoom.amenities) ? currentRoom.amenities.join(', ') : ''} onChange={handleRoomAmenitiesChange} className={inputStyle} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input name="purchasePricePerNight" label="Purchase Price" type="number" value={currentRoom.purchasePricePerNight} onChange={handleRoomChange} className={inputStyle} />
                      <Input name="agentPricePerNight" label="Agent Price" type="number" value={currentRoom.agentPricePerNight} onChange={handleRoomChange} className={inputStyle} />
                      <Input name="customerPricePerNight" label="Customer Price" type="number" value={currentRoom.customerPricePerNight} onChange={handleRoomChange} className={inputStyle} />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowRoomForm(false)} className="!rounded-lg">Cancel</Button>
                        <Button type="button" variant="primary" size="sm" onClick={handleSaveRoom} className="!rounded-lg">Save Room</Button>
                    </div>
                </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {formData.rooms.length > 0 ? (
                  <TableWrapper>
                      <table className="w-full text-left text-xs">
                         <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-3 px-4">Type</th><th className="py-3 px-4">Capacity</th><th className="py-3 px-4">Customer Price</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
                         <tbody>
                            {formData.rooms.map(room => (
                                <tr key={room.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                    <td className="py-3 px-4 font-bold text-gray-800">{room.type}</td>
                                    <td className="py-3 px-4">{room.capacity}</td>
                                    <td className="py-3 px-4 font-bold text-primary">{formatPrice(room.customerPricePerNight)}</td>
                                    <td className="py-3 px-4 text-right space-x-4 font-bold uppercase tracking-widest text-[10px]">
                                        <button type="button" className="text-primary hover:underline" onClick={() => handleEditRoom(room)}>Edit</button>
                                        <button type="button" className="text-red-500 hover:underline" onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                      </table>
                  </TableWrapper>
                ) : <p className="text-center text-gray-400 text-xs py-8 font-bold uppercase tracking-widest">No rooms added yet.</p>}
              </div>
            )}
        </section>
      </div>

      <div className="bg-white p-4 flex justify-end gap-2 border-t mt-auto shrink-0">
        <Button type="button" variant="outline" onClick={onCancel} className="!rounded-lg">Cancel</Button>
        <Button type="submit" variant="primary" className="!rounded-lg">{hotel ? 'Save Hotel Changes' : 'Create Hotel'}</Button>
      </div>
    </form>
  );
};

export default HotelForm;
