
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Select } from '../../components/UI';
import { BulkOrderStatus, BulkOrder } from '../../types';
import { PageHeader, EmptyState, TableWrapper } from '../../components/AdminUI';
import BulkOrderDetailsModal from '../../components/BulkOrderDetailsModal';

const BulkOrdersPage: React.FC = () => {
  const { bulkOrders, updateBulkOrderStatus, agencies, formatPrice } = useAppContext();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<BulkOrder | null>(null);

  const openViewModal = (order: BulkOrder) => {
    setViewingOrder(order);
    setIsViewModalOpen(true);
  };

  return (
    <>
      <PageHeader title="Agency Bulk Orders" />
      <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
        <TableWrapper>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Agency</th>
                <th className="py-4 px-4">Details</th>
                <th className="py-4 px-4">Total Cost</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bulkOrders.map(order => {
                const agency = agencies.find(a => a.id === order.agencyId);
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-mono text-gray-500">{order.id}</td>
                    <td className="py-4 px-4 font-bold">{agency?.agencyName}</td>
                    <td className="py-4 px-4">
                        {order.items.length} line item(s) across <br/>
                        {[...new Set(order.items.map(i => i.hotelName))].length} hotel(s)
                    </td>
                    <td className="py-4 px-4 font-bold text-primary">{formatPrice(order.totalCost)}</td>
                    <td className="py-4 px-4">
                      <Select 
                        value={order.status}
                        onChange={(e) => updateBulkOrderStatus(order.id, e.target.value as BulkOrderStatus)}
                        options={Object.values(BulkOrderStatus).map(s => ({ label: s, value: s }))}
                        className="!text-[10px] !font-black !py-1.5 !pl-3 !pr-8 !rounded-md w-full"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                        <Button size="sm" variant="outline" className="!rounded-md" onClick={() => openViewModal(order)}>View</Button>
                    </td>
                  </tr>
                );
              })}
              {bulkOrders.length === 0 && <EmptyState message="No bulk orders found." />}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
      <BulkOrderDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        order={viewingOrder}
      />
    </>
  );
};

export default BulkOrdersPage;