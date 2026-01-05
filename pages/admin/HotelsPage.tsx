
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Modal } from '../../components/UI';
import { Hotel } from '../../types';
import HotelForm from '../../components/HotelForm';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';

const HotelsPage: React.FC = () => {
    const { hotels, addHotel, updateHotel, deleteHotel } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleOpenModal = (hotel: Hotel | null = null) => {
      setEditingHotel(hotel);
      setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
      setEditingHotel(null);
      setIsModalOpen(false);
    }
    
    const handleSubmit = (hotelData: Hotel | Omit<Hotel, 'id'>) => {
      if ('id' in hotelData) {
        updateHotel(hotelData);
      } else {
        const newHotel: Hotel = { 
          id: `H-${Date.now()}`, 
          ...hotelData,
        };
        addHotel(newHotel);
      }
      handleCloseModal();
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
      <>
        <PageHeader title="Hotel Management">
          <Button onClick={() => handleOpenModal()} variant="primary" className="!rounded-lg">+ Add New Hotel</Button>
          <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
        </PageHeader>
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
            <TableWrapper>
                <table className="w-full text-left text-xs">
                    <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6">Name</th><th className="py-4 px-4">City</th><th className="py-4 px-4">Stars</th><th className="py-4 px-4">Rooms</th><th className="py-4 px-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {hotels.map(h => (
                          <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50/50">
                            <td className="py-4 px-6 font-bold text-gray-800">{h.name}</td>
                            <td className="py-4 px-4 font-medium">{h.city}</td>
                            <td className="py-4 px-4 font-medium">{h.stars} ★</td>
                            <td className="py-4 px-4 font-medium">{h.rooms.length}</td>
                            <td className="py-4 px-4 text-right font-bold text-xs space-x-4">
                               <button onClick={() => handleOpenModal(h)} className="text-secondary hover:underline uppercase tracking-widest">Manage</button>
                               <button onClick={() => deleteHotel(h.id)} className="text-red-500 hover:underline uppercase tracking-widest">Delete</button>
                            </td>
                          </tr>
                        ))}
                        {hotels.length === 0 && <EmptyState message="No hotels in registry." />}
                    </tbody>
                </table>
            </TableWrapper>
        </Card>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingHotel ? 'Edit Hotel & Inventory' : 'Add New Hotel'} size="4xl">
          <HotelForm hotel={editingHotel} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>
      </>
    );
};

export default HotelsPage;
