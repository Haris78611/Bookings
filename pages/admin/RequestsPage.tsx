
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Badge } from '../../components/UI';
import { Booking, BookingStatus } from '../../types';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';

const RequestsPage: React.FC = () => {
  const { bookings, approveBookingRequest, rejectBookingRequest, addToast } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const modificationRequests = bookings.filter(b => 
    b.status === BookingStatus.CANCEL_REQUESTED || 
    b.status === BookingStatus.DATE_CHANGE_REQUESTED
  );
  
  const handleApprove = (bookingId: string) => {
      approveBookingRequest(bookingId);
      addToast('Request approved. Booking has been updated.');
  };

  const handleReject = (bookingId: string) => {
      rejectBookingRequest(bookingId);
      addToast('Request rejected. Booking reverted to original state.', 'error');
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        setIsRefreshing(false);
        addToast('Modification requests synchronized.');
    }, 800);
  };
  
  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.CANCEL_REQUESTED: return 'danger';
        case BookingStatus.DATE_CHANGE_REQUESTED: return 'warning';
        default: return 'info';
    }
  };

  return (
    <>
      <PageHeader title="Modification Requests">
        <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
      </PageHeader>
      <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
        <TableWrapper>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                <th className="py-4 px-6">Booking / Guest</th>
                <th className="py-4 px-4">Request Type</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modificationRequests.map(booking => (
                <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <p className="font-mono text-gray-500">{booking.id}</p>
                    <p className="font-bold text-gray-800">{booking.guestName}</p>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    {booking.status === BookingStatus.DATE_CHANGE_REQUESTED && booking.requestedCheckIn ? (
                      <div>
                        <span className="text-gray-400">From: {booking.checkIn} to {booking.checkOut}</span><br/>
                        <span className="text-secondary font-bold">To: {booking.requestedCheckIn} to {booking.requestedCheckOut}</span>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Button size="sm" variant="primary" onClick={() => handleApprove(booking.id)} className="!rounded-md">Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(booking.id)} className="!rounded-md">Reject</Button>
                  </td>
                </tr>
              ))}
              {modificationRequests.length === 0 && <EmptyState message="No pending modification requests." />}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </>
  );
};

export default RequestsPage;