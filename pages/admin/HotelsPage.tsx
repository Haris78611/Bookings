import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Modal, LoadingSpinner } from '../../components/UI';
import { Hotel } from '../../types';
import HotelForm from '../../components/HotelForm';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';

const HotelsPage: React.FC = () => {
    const { hotels, addHotel, updateHotel, deleteHotel, addToast, isLoading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (hotel: Hotel | null = null) => {
      setEditingHotel(hotel);
      setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
      setEditingHotel(null);
      setIsModalOpen(false);
    }
    
    const handleSubmit = async (hotelData: Hotel | Omit<Hotel, 'id'>) => {
      setIsSubmitting(true);
      try {
        if ('id' in hotelData) {
          await updateHotel(hotelData);
          addToast(`Hotel "${hotelData.name}" updated successfully.`);
        } else {
          await addHotel(hotelData);
          addToast(`Hotel created successfully.`);
        }
        handleCloseModal();
      } catch (error: any) {
        addToast(`Error: ${error.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = async (hotel: Hotel) => {
      if (window.confirm(`Are you sure you want to delete "${hotel.name}"? This action is irreversible.`)) {
        try {
          await deleteHotel(hotel.id);
          addToast(`Hotel "${hotel.name}" has been deleted.`, 'error');
        } catch(error: any) {
           addToast(`Error: ${error.message}`, 'error');
        }
      }
    };

    return (
      <>
        <PageHeader title="Hotel Management">
          <Button onClick={() => handleOpenModal()} variant="primary" className="!rounded-lg">+ Add New Hotel</Button>
        </PageHeader>
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
            <TableWrapper>
                <table className="w-full text-left text-xs">
                    <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6">Name</th><th className="py-4 px-4">City</th><th className="py-4 px-4">Stars</th><th className="py-4 px-4">Rooms</th><th className="py-4 px-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5}><LoadingSpinner/></td></tr>
                        ) : hotels.map(h => (
                          <tr key={h.id} className="border-b last:border-0 hover:bg-gray-50/50">
                            <td className="py-4 px-6 font-bold text-gray-800">{h.name}</td>
                            <td className="py-4 px-4 font-medium">{h.city}</td>
                            <td className="py-4 px-4 font-medium">{h.stars} ★</td>
                            <td className="py-4 px-4 font-medium">{h.rooms.length}</td>
                            <td className="py-4 px-4 text-right font-bold text-xs space-x-4">
                               <button onClick={() => handleOpenModal(h)} className="text-secondary hover:underline uppercase tracking-widest">Manage</button>
                               <button onClick={() => handleDelete(h)} className="text-red-500 hover:underline uppercase tracking-widest">Delete</button>
                            </td>
                          </tr>
                        ))}
                        {!isLoading && hotels.length === 0 && <EmptyState message="No hotels in registry." />}
                    </tbody>
                </table>
            </TableWrapper>
        </Card>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingHotel ? 'Edit Hotel & Inventory' : 'Add New Hotel'} size="4xl">
          {isSubmitting ? <LoadingSpinner /> : <HotelForm hotel={editingHotel} onSubmit={handleSubmit} onCancel={handleCloseModal} />}
        </Modal>
      </>
    );
};

export default HotelsPage;
