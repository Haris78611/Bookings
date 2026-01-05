
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Select } from '../../components/UI';
import { BulkOrderStatus } from '../../types';
import { PageHeader, EmptyState, TableWrapper } from '../../components/AdminUI';

const BulkOrdersPage: React.FC = () => {
  const { bulkOrders, updateBulkOrderStatus, agencies, hotels, formatPrice } = useAppContext();

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
                <th className="py-4 px-4">Hotel</th>
                <th className="py-4 px-4">Total Cost</th>
                <th className="py-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bulkOrders.map(order => {
                const agency = agencies.find(a => a.id === order.agencyId);
                const hotel = hotels.find(h => h.id === order.hotelId);
                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-4 px-6 font-mono text-gray-500">{order.id}</td>
                    <td className="py-4 px-4 font-bold">{agency?.agencyName}</td>
                    <td className="py-4 px-4">{hotel?.name}</td>
                    <td className="py-4 px-4 font-bold text-primary">{formatPrice(order.totalCost)}</td>
                    <td className="py-4 px-4">
                      <Select 
                        value={order.status}
                        onChange={(e) => updateBulkOrderStatus(order.id, e.target.value as BulkOrderStatus)}
                        options={Object.values(BulkOrderStatus).map(s => ({ label: s, value: s }))}
                        className="!text-[10px] !font-black !py-1.5 !pl-3 !pr-8 !rounded-md w-full"
                      />
                    </td>
                  </tr>
                );
              })}
              {bulkOrders.length === 0 && <EmptyState message="No bulk orders found." />}
            </tbody>
          </table>
        </TableWrapper>
      </Card>
    </>
  );
};

export default BulkOrdersPage;
