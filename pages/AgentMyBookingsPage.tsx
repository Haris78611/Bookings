import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, Badge, TableWrapper, Button, Input } from '../components/UI';
import { Booking, BookingStatus } from '../types';
import AgentEditBookingModal from '../components/AgentEditBookingModal';
import AssignDetailsModal from '../components/AssignDetailsModal';
import VoucherCustomizationModal from '../components/VoucherCustomizationModal';

const RefreshIcon: React.FC<{ isRefreshing: boolean }> = ({ isRefreshing }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.693L19.015 7.74M4.036 7.74l3.182 3.182" />
    </svg>
);

const AgentMyBookingsPage: React.FC = () => {
    const { currentUser, agencies, bookings, formatPrice, deleteBookings, addToast } = useAppContext();
    const agent = agencies.find(a => a.id === currentUser?.agencyId);
    
    const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    
    const [voucherBooking, setVoucherBooking] = useState<Booking | null>(null);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    
    const agentBookings = useMemo(() => {
        const baseBookings = bookings.filter(b => b.agencyId === currentUser?.agencyId);
        if (!searchQuery) return baseBookings;

        return baseBookings.filter(b => 
            b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.hotelName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [bookings, currentUser, searchQuery]);

    if (agent && agent.status === 'Inactive') {
        return (
            <Card className="p-12 rounded-lg shadow-lg text-center bg-red-50 border border-red-200">
                <h1 className="text-2xl font-bold text-red-600">Account Inactive</h1>
                <p className="text-gray-600 mt-2">Your agency account is currently inactive. Please contact administration for assistance.</p>
            </Card>
        );
    }
    
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            addToast('Bookings data has been synchronized.', 'success');
        }, 1200);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedBookingIds(agentBookings.map(b => b.id));
        } else {
            setSelectedBookingIds([]);
        }
    };

    const handleSelectOne = (bookingId: string) => {
        setSelectedBookingIds(prev => 
            prev.includes(bookingId) 
            ? prev.filter(id => id !== bookingId) 
            : [...prev, bookingId]
        );
    };

    const handleDeleteSelected = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedBookingIds.length} booking(s)? This cannot be undone.`)) {
            deleteBookings(selectedBookingIds);
            addToast(`${selectedBookingIds.length} booking(s) deleted successfully.`, 'error');
            setSelectedBookingIds([]);
        }
    };
    
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Cancelled': return 'danger';
            default: return 'info';
        }
    };
    
    const openEditModal = (booking: Booking) => {
        setEditingBooking(booking);
        setIsEditModalOpen(true);
    };
    
    const openAssignModal = (booking: Booking) => {
        setAssigningBooking(booking);
        setIsAssignModalOpen(true);
    };

    const openVoucherModal = (booking: Booking) => {
        setVoucherBooking(booking);
        setIsVoucherModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {selectedBookingIds.length > 0 && (
                        <Button onClick={handleDeleteSelected} variant="danger" size="sm" className="!rounded-lg">
                            Delete Selected ({selectedBookingIds.length})
                        </Button>
                    )}
                </div>
                <button onClick={handleRefresh} disabled={isRefreshing} className="group flex items-center bg-white text-primary font-semibold py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                    <RefreshIcon isRefreshing={isRefreshing} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            <Card className="p-6 border-none shadow-sm rounded-xl bg-white">
              <Input 
                placeholder="Search by Guest Name, Booking ID, or Hotel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="!rounded-lg"
              />
            </Card>

            <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
               <TableWrapper>
                  <table className="w-full text-left text-xs">
                     <thead>
                        <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                           <th className="py-5 px-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedBookingIds.length > 0 && selectedBookingIds.length === agentBookings.length} className="w-4 h-4 accent-primary align-middle"/></th>
                           <th className="py-5 px-4">Booking / Guest</th>
                           <th className="py-5 px-4">Hotel</th>
                           <th className="py-5 px-4">Price</th>
                           <th className="py-5 px-4">Status</th>
                           <th className="py-5 px-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {agentBookings.length === 0 ? (
                           <tr><td colSpan={6} className="py-20 text-center text-gray-400 italic">{searchQuery ? 'No bookings match your search.' : 'No bookings found for your agency.'}</td></tr>
                        ) : 
                        agentBookings.map(b => (
                            <tr key={b.id} className={`${selectedBookingIds.includes(b.id) ? 'bg-primary/5' : ''}`}>
                                <td className="py-4 px-4"><input type="checkbox" checked={selectedBookingIds.includes(b.id)} onChange={() => handleSelectOne(b.id)} className="w-4 h-4 accent-primary align-middle" /></td>
                                <td className="py-4 px-4">
                                    <p className="font-mono text-secondary">{b.id}</p>
                                    <p className="font-bold text-gray-800">{b.guestName}</p>
                                </td>
                                <td className="py-4 px-4">{b.hotelName}</td>
                                <td className="py-4 px-4 font-bold text-primary">{formatPrice(b.totalPrice)}</td>
                                <td className="py-4 px-4"><Badge variant={getStatusVariant(b.status)}>{b.status}</Badge></td>
                                <td className="py-4 px-4 text-right font-bold text-xs uppercase tracking-widest space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditModal(b)} className="!rounded-md">Edit</Button>
                                    <Button size="sm" variant="teal" onClick={() => openAssignModal(b)} disabled={b.status !== BookingStatus.CONFIRMED} className="!rounded-md">Assign Details</Button>
                                    <Button size="sm" variant="secondary" onClick={() => openVoucherModal(b)} className="!rounded-md">Voucher</Button>
                                </td>
                            </tr>
                        ))}
                     </tbody>
                  </table>
               </TableWrapper>
            </Card>

            <AgentEditBookingModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                booking={editingBooking}
            />
            
            <AssignDetailsModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                booking={assigningBooking}
            />

            <VoucherCustomizationModal
                isOpen={isVoucherModalOpen}
                onClose={() => setIsVoucherModalOpen(false)}
                booking={voucherBooking}
            />
        </div>
    );
};

export default AgentMyBookingsPage;
