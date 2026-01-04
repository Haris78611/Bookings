
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Input, Modal, Select, Card, Badge, TableWrapper } from '../components/UI';
import { BulkOrderStatus, UserRole, BookingStatus } from '../types';

const AgentPortal: React.FC = () => {
  const { 
    currentUser, formatPrice, agencies, hotels, bulkOrders, addBulkOrder, updateAgentWallet, addBooking 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchase' | 'wallet'>('inventory');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [purchaseForm, setPurchaseForm] = useState({ hotelId: '', roomId: '', quantity: 1, checkIn: '', checkOut: '' });
  const [assignForm, setAssignForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', orderId: '' });

  const agent = agencies.find(a => a.id === currentUser?.agencyId);
  const agentOrders = bulkOrders.filter(o => o.agencyId === agent?.id);
  
  if (!currentUser || currentUser.role !== UserRole.AGENT || !agent) return (
    <div className="min-h-screen flex items-center justify-center bg-neutralLight px-4">
      <Card className="p-8 md:p-12 text-center max-w-sm">
         <div className="text-4xl md:text-5xl mb-6">💼</div>
         <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4">Partner Login</h2>
         <p className="text-gray-500 text-sm mb-8 font-medium">Authorized travel partner access required for B2B portal.</p>
         <Button fullWidth variant="primary" onClick={() => window.location.hash = '#/login'}>Partner Auth</Button>
      </Card>
    </div>
  );

  const handleBulkPurchase = () => {
    const hotel = hotels.find(h => h.id === purchaseForm.hotelId);
    const room = hotel?.rooms.find(r => r.id === purchaseForm.roomId);
    if (!hotel || !room) return;

    const totalCost = room.agentPricePerNight * purchaseForm.quantity;
    if (agent.walletBalance < totalCost) {
      alert("Insufficient wallet balance for this wholesale operation!");
      return;
    }

    const newOrder = {
      id: `WHL-${Date.now()}`,
      agencyId: agent.id,
      hotelId: hotel.id,
      roomId: room.id,
      checkIn: purchaseForm.checkIn,
      checkOut: purchaseForm.checkOut,
      quantity: purchaseForm.quantity,
      totalCost,
      status: BulkOrderStatus.PENDING,
      createdAt: new Date().toLocaleDateString()
    };

    updateAgentWallet(agent.id, totalCost, 'Debit', `Bulk Order Allocation: ${hotel.name}`);
    addBulkOrder(newOrder);
    setIsPurchaseModalOpen(false);
  };

  const handleAssign = (orderId: string) => {
    const order = bulkOrders.find(o => o.id === orderId);
    if (!order) return;

    const hotel = hotels.find(h => h.id === order.hotelId);
    const room = hotel?.rooms.find(r => r.id === order.roomId);

    const newBooking = {
      id: `VCH-${Date.now()}`,
      hotelId: order.hotelId,
      hotelName: hotel?.name || 'Unknown',
      roomId: order.roomId,
      roomType: room?.type || 'Standard',
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      guestName: assignForm.guestName,
      guestEmail: assignForm.guestEmail,
      guestPhone: assignForm.guestPhone,
      totalPrice: 0, 
      status: BookingStatus.CONFIRMED,
      agencyId: agent.id,
      createdAt: new Date().toLocaleDateString()
    };

    addBooking(newBooking);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="bg-[#fcfdfd] min-h-screen">
      <div className="bg-white border-b py-8 md:py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight uppercase">{agent.agencyName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {agent.id}</span>
              <Badge variant="success">Verified Partner</Badge>
            </div>
          </div>
          <Card className="w-full md:w-auto flex flex-col items-center md:items-end p-5 md:p-6 border-none shadow-xl bg-primary text-white">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 md:mb-2">Partner Balance</span>
            <div className="text-2xl md:text-4xl font-black">{formatPrice(agent.walletBalance)}</div>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex overflow-x-auto gap-3 mb-8 md:mb-12 pb-2 custom-scrollbar">
          {['inventory', 'purchase', 'wallet'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all shrink-0 ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-8 md:space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-black text-neutralDark uppercase tracking-tighter">Allocations</h2>
              <Button variant="secondary" size="sm" onClick={() => setIsPurchaseModalOpen(true)}>Wholesale Buy</Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {agentOrders.filter(o => o.status === BulkOrderStatus.CONFIRMED).map(order => {
                 const hotel = hotels.find(h => h.id === order.hotelId);
                 const room = hotel?.rooms.find(r => r.id === order.roomId);
                 return (
                   <Card key={order.id} className="p-0 overflow-hidden hover:shadow-xl transition-all border-none ring-1 ring-gray-100">
                     <div className="p-6 md:p-8">
                       <div className="flex justify-between items-center mb-6">
                          <Badge variant="info">{hotel?.city}</Badge>
                          <span className="text-[8px] font-mono text-gray-400">REF: {order.id.slice(-8)}</span>
                       </div>
                       <h3 className="font-black text-lg md:text-xl mb-1 text-neutralDark uppercase truncate">{hotel?.name}</h3>
                       <p className="text-[10px] md:text-xs text-gray-400 mb-6 font-bold uppercase tracking-widest">{room?.type} • {order.quantity} Units</p>
                       <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8 pb-4 border-b">
                         <div>IN: <span className="text-neutralDark">{order.checkIn}</span></div>
                         <div>OUT: <span className="text-neutralDark">{order.checkOut}</span></div>
                       </div>
                       <Button variant="outline" fullWidth size="sm" onClick={() => { setAssignForm({ ...assignForm, orderId: order.id }); setIsAssignModalOpen(true); }}>Assign Voucher</Button>
                     </div>
                   </Card>
                 );
              })}
              {agentOrders.filter(o => o.status === BulkOrderStatus.CONFIRMED).length === 0 && (
                 <div className="col-span-full py-20 text-center opacity-30">
                    <div className="text-5xl md:text-6xl mb-4 md:mb-6">📦</div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Zero Active Inventory</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <Card className="overflow-hidden">
             <TableWrapper>
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                   <tr>
                     <th className="px-6 py-5">Order ID</th>
                     <th className="px-6 py-5">Asset</th>
                     <th className="px-6 py-5">Units</th>
                     <th className="px-6 py-5">Value</th>
                     <th className="px-6 py-5">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 text-[11px] md:text-sm">
                   {agentOrders.map(order => (
                     <tr key={order.id} className="hover:bg-gray-50/50 transition">
                       <td className="px-6 py-6 font-bold text-neutralDark font-mono">{order.id.slice(-8)}</td>
                       <td className="px-6 py-6">
                          <div className="font-black text-gray-800 uppercase text-[10px] md:text-xs truncate max-w-[150px]">{hotels.find(h => h.id === order.hotelId)?.name}</div>
                          <div className="text-[9px] text-gray-400">{order.checkIn}</div>
                       </td>
                       <td className="px-6 py-6 font-black">{order.quantity}</td>
                       <td className="px-6 py-6 font-black text-primary">{formatPrice(order.totalCost)}</td>
                       <td className="px-6 py-6">
                          <Badge variant={order.status === BulkOrderStatus.CONFIRMED ? 'success' : order.status === BulkOrderStatus.REJECTED ? 'danger' : 'warning'}>
                            {order.status}
                          </Badge>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </TableWrapper>
          </Card>
        )}
      </div>

      {/* Modals are already responsive via UI.tsx update */}
      <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Wholesale Allocation">
        <div className="space-y-6">
          <Select 
            label="Property" 
            options={hotels.map(h => ({ label: `${h.name}`, value: h.id }))} 
            onChange={e => setPurchaseForm({ ...purchaseForm, hotelId: e.target.value })}
          />
          {purchaseForm.hotelId && (
            <Select 
              label="Unit Type" 
              options={hotels.find(h => h.id === purchaseForm.hotelId)?.rooms.map(r => ({ label: `${r.type}`, value: r.id })) || []}
              onChange={e => setPurchaseForm({ ...purchaseForm, roomId: e.target.value })}
            />
          )}
          <Input label="Quantity" type="number" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Arrival" type="date" value={purchaseForm.checkIn} onChange={e => setPurchaseForm({ ...purchaseForm, checkIn: e.target.value })} />
            <Input label="Departure" type="date" value={purchaseForm.checkOut} onChange={e => setPurchaseForm({ ...purchaseForm, checkOut: e.target.value })} />
          </div>
          <Button variant="secondary" fullWidth className="mt-4 font-black text-[10px] uppercase" onClick={handleBulkPurchase}>Submit Request</Button>
        </div>
      </Modal>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Generate Voucher">
        <div className="space-y-6">
           <p className="text-xs text-gray-500 font-medium">Assign reserved unit instantly to pilgrim group.</p>
           <Input label="Full Name" placeholder="As per ID" value={assignForm.guestName} onChange={e => setAssignForm({ ...assignForm, guestName: e.target.value })} />
           <Input label="Contact Email" value={assignForm.guestEmail} onChange={e => setAssignForm({ ...assignForm, guestEmail: e.target.value })} />
           <Input label="Phone" value={assignForm.guestPhone} onChange={e => setAssignForm({ ...assignForm, guestPhone: e.target.value })} />
           <Button variant="primary" fullWidth className="mt-4 font-black text-[10px] uppercase" onClick={() => handleAssign(assignForm.orderId)}>Activate Voucher</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AgentPortal;
