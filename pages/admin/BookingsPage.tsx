
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Select } from '../../components/UI';
import { BookingStatus } from '../../types';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';
import AdminEditBookingModal from '../../components/AdminEditBookingModal';
import BookingDetailsModal from '../../components/BookingDetailsModal';
import { Booking } from '../../types';

const BookingsPage: React.FC = () => {
  const { bookings, updateBookingStatus, deleteBookings, agencies, addToast } = useAppContext();
  const [selected, setSelected] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const agencyIdFilter = searchParams.get('agencyId');

  const filteredBookings = useMemo(() => {
    if (agencyIdFilter) {
      return bookings.filter(b => b.agencyId === agencyIdFilter);
    }
    return bookings;
  }, [bookings, agencyIdFilter]);
  
  const filteringAgency = agencyIdFilter ? agencies.find(a => a.id === agencyIdFilter) : null;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? filteredBookings.map(b => b.id) : []);
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Bookings data synchronized.');
    }, 800);
  };
  
  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
  };
  
  const openViewModal = (booking: Booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };
  
  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus);
    addToast(`Booking ${bookingId} status updated to ${newStatus}.`);
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} booking(s)? This cannot be undone.`)) {
        deleteBookings(selected);
        addToast(`${selected.length} booking(s) deleted successfully.`, 'error');
        setSelected([]);
    }
  }

  return (
    <>
      <PageHeader title={filteringAgency ? `Bookings for ${filteringAgency.agencyName}` : "All Bookings"}>
        {filteringAgency && (
          <Link to="/admin/bookings" className="text-sm font-bold text-secondary hover:underline">&larr; Show All Bookings</Link>
        )}
        <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
      </PageHeader>
      <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
        {selected.length > 0 && 
          <div className="p-4 bg-primary/5 border-b border-primary/10 text-primary flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-widest">{selected.length} Selected</span>
            <Button variant="danger" size="sm" onClick={handleDeleteSelected} className="!rounded-lg">Delete Selected</Button>
          </div>
        }
        <TableWrapper>
          <table className="w-full text-left text-xs">
            <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selected.length === filteredBookings.length && filteredBookings.length > 0} className="w-4 h-4 accent-[#005B5C] align-middle" /></th><th className="py-4 px-4">Guest</th><th className="py-4 px-4">Hotel</th><th className="py-4 px-4">Dates</th><th className="py-4 px-4">Agency</th><th className="py-4 px-4">Status</th><th className="py-4 px-4 text-right">Actions</th></tr></thead>
            <tbody>
              {filteredBookings.map(b => {
                const agency = agencies.find(a => a.id === b.agencyId);
                return (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6"><input type="checkbox" checked={selected.includes(b.id)} onChange={() => setSelected(p => p.includes(b.id) ? p.filter(i => i !== b.id) : [...p, b.id])} className="w-4 h-4 accent-[#005B5C] align-middle" /></td>
                    <td className="py-4 px-4"><div><p className="font-bold text-gray-800">{b.guestName}</p><p className="text-[10px] text-gray-400 font-mono">{b.id}</p></div></td>
                    <td className="py-4 px-4">{b.hotelName}</td>
                    <td className="py-4 px-4">{b.checkIn} to {b.checkOut}</td>
                    <td className="py-4 px-4">{agency?.agencyName || 'Direct'}</td>
                    <td className="py-4 px-4">
                      <Select 
                        value={b.status} 
                        onChange={e => handleStatusChange(b.id, e.target.value as BookingStatus)} 
                        className="!text-[10px] !font-black !py-1.5 !pl-3 !pr-8 !rounded-md w-full" 
                        options={Object.values(BookingStatus).map(s => ({label: s, value: s}))}
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-xs space-x-2">
                      <Button size="sm" variant="ghost" className="!rounded-md" onClick={() => openViewModal(b)}>View</Button>
                      <Button size="sm" variant="outline" className="!rounded-md" onClick={() => openEditModal(b)}>Edit</Button>
                      <Link to={`/admin/voucher/${b.id}`}><Button size="sm" variant="secondary" className="!rounded-md">Voucher</Button></Link>
                    </td>
                  </tr>
                )
              })}
              {filteredBookings.length === 0 && <EmptyState message={filteringAgency ? `No bookings found for ${filteringAgency.agencyName}.` : "No bookings found."} />}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
      <AdminEditBookingModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={editingBooking}
      />
      <BookingDetailsModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        booking={viewingBooking}
      />
    </>
  );
};

export default BookingsPage;