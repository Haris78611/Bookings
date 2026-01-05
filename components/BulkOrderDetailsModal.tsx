
import React from 'react';
import { BulkOrder } from '../types';
import { Modal, Button, Badge, TableWrapper } from './UI';
import { useAppContext } from '../context/AppContext';

interface BulkOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: BulkOrder | null;
}

const BulkOrderDetailsModal: React.FC<BulkOrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  const { agencies, formatPrice } = useAppContext();

  if (!order) return null;
  
  const agent = agencies.find(a => a.id === order.agencyId);
  
  const getStatusVariant = (status: string) => {
    if (status === 'Confirmed') return 'success';
    if (status === 'Pending') return 'warning';
    return 'danger';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Order: ${order.id}`} size="4xl">
        <div className="bg-gray-50/50">
            <div className="p-6 md:p-8 space-y-6">
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-inner flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Agency</p>
                        <p className="text-xl font-bold text-neutralDark">{agent?.agencyName || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Cost</p>
                        <p className="text-2xl font-black text-primary">{formatPrice(order.totalCost)}</p>
                    </div>
                    <div className="text-center">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                         <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <TableWrapper>
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                                    <th className="py-3 px-4">Hotel & Room</th>
                                    <th className="py-3 px-4">Dates</th>
                                    <th className="py-3 px-4 text-center">Qty</th>
                                    <th className="py-3 px-4 text-center">Assigned</th>
                                    <th className="py-3 px-4 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-gray-800">{item.hotelName}</p>
                                            <p className="text-[10px] text-gray-500">{item.roomType}</p>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-xs">{item.checkIn} &rarr; {item.checkOut}</td>
                                        <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                                        <td className="py-3 px-4 text-center font-bold">{item.assignedCount}</td>
                                        <td className="py-3 px-4 text-right font-bold text-primary">{formatPrice(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableWrapper>
                </div>
            </div>
            <div className="bg-white p-4 flex justify-end gap-2 border-t">
            <Button type="button" variant="primary" onClick={onClose} className="!rounded-lg">Close</Button>
            </div>
        </div>
    </Modal>
  );
};

export default BulkOrderDetailsModal;