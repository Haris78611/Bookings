
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, AmenityPill, Badge } from '../../components/UI';
import { PageHeader, EmptyState, TableWrapper } from '../../components/AdminUI';
import { Room } from '../../types';
import RoomFormModal from '../../components/RoomFormModal';

const HotelManagePage: React.FC = () => {
    const { hotelId } = useParams<{ hotelId: string }>();
    const { hotels, deleteRoomFromHotel, formatPrice } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const hotel = hotels.find(h => h.id === hotelId);
    
    if (!hotel) {
        return <div className="p-8 text-center text-red-500">Hotel not found.</div>;
    }
    
    const handleOpenModal = (room: Room | null = null) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    return (
        <>
            <PageHeader title={hotel.name}>
                <Link to="/admin/hotels" className="text-sm font-bold text-primary hover:underline">&larr; Back to Hotels List</Link>
            </PageHeader>

            <div className="space-y-8">
                {/* Hotel Details Card */}
                <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">City</p><p className="font-bold">{hotel.city}</p></div>
                        <div><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Stars</p><p className="font-bold">{hotel.stars} ★</p></div>
                        <div><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Distance</p><p className="font-bold">{hotel.distanceToHaram}m</p></div>
                    </div>
                    <div className="mt-6 pt-6 border-t">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">{hotel.amenities.map(a => <AmenityPill key={a} name={a} />)}</div>
                    </div>
                </Card>

                {/* Rooms Management Card */}
                <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-lg font-bold text-primary">Room Inventory</h3>
                        <Button variant="secondary" size="sm" className="!rounded-lg" onClick={() => handleOpenModal()}>+ Add New Room</Button>
                    </div>
                    <TableWrapper>
                        <table className="w-full text-left text-xs">
                            <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6">Type</th><th className="py-4 px-4">Capacity</th><th className="py-4 px-4">Agent Price</th><th className="py-4 px-4">Customer Price</th><th className="py-4 px-4 text-right">Actions</th></tr></thead>
                            <tbody>
                                {hotel.rooms.map(room => (
                                    <tr key={room.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                        <td className="py-4 px-6 font-bold text-gray-800">{room.type}</td>
                                        <td className="py-4 px-4">{room.capacity}</td>
                                        <td className="py-4 px-4 font-bold">{formatPrice(room.agentPricePerNight)}</td>
                                        <td className="py-4 px-4 font-bold text-primary">{formatPrice(room.customerPricePerNight)}</td>
                                        <td className="py-4 px-4 text-right space-x-4 font-bold uppercase tracking-widest text-[10px]">
                                            <button className="text-primary hover:underline" onClick={() => handleOpenModal(room)}>Edit</button>
                                            <button className="text-red-500 hover:underline" onClick={() => deleteRoomFromHotel(hotel.id, room.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {hotel.rooms.length === 0 && <EmptyState message="No rooms configured for this hotel." />}
                            </tbody>
                        </table>
                    </TableWrapper>
                </Card>
            </div>

            <RoomFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                room={editingRoom}
                hotelId={hotel.id}
            />
        </>
    );
};

export default HotelManagePage;
