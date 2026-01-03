
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Input, Modal, Select, Card, Badge } from '../components/UI';
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
    <div className="min-h-screen flex items-center justify-center bg-neutralLight">
      <Card className="p-12 text-center max-w-sm">
         <div className="text-5xl mb-6">💼</div>
         <h2 className="text-2xl font-bold mb-4">Agent Authorization</h2>
         <p className="text-gray-500 mb-8">Please login as a verified travel partner to access B2B inventory.</p>
         <Button fullWidth onClick={() => window.location.hash = '#/login'}>Partner Login</Button>
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
      <div className="bg-white border-b py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-primary tracking-tight">{agent.agencyName}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {agent.id}</span>
              <Badge variant="success">Verified Partner</Badge>
            </div>
          </div>
          <Card className="flex flex-col items-center md:items-end p-6 border-none shadow-xl bg-primary text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Partner Credit</span>
            <div className="text-4xl font-black">{formatPrice(agent.walletBalance)}</div>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap gap-4 mb-12">
          {['inventory', 'purchase', 'wallet'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-gray-400 hover:text-primary'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-neutralDark">Active Room Allocations</h2>
              <Button variant="secondary" onClick={() => setIsPurchaseModalOpen(true)}>Wholesale Purchase</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Changed APPROVED to CONFIRMED */}
              {agentOrders.filter(o => o.status === BulkOrderStatus.CONFIRMED).map(order => {
                 const hotel = hotels.find(h => h.id === order.hotelId);
                 const room = hotel?.rooms.find(r => r.id === order.roomId);
                 return (
                   <Card key={order.id} className="p-0 overflow-hidden group hover:shadow-xl transition-all duration-500 border-none ring-1 ring-gray-100">
                     <div className="p-8">
                       <div className="flex justify-between mb-6">
                          <Badge variant="info">{hotel?.city}</Badge>
                          <span className="text-[10px] font-mono text-gray-400">REF: {order.id}</span>
                       </div>
                       <h3 className="font-bold text-xl mb-1 text-neutralDark">{hotel?.name}</h3>
                       <p className="text-sm text-gray-500 mb-8">{room?.type} • {order.quantity} Reserved Units</p>
                       <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 pb-6 border-b">
                         <div>Check-in: <span className="text-neutralDark">{order.checkIn}</span></div>
                         <div>Check-out: <span className="text-neutralDark">{order.checkOut}</span></div>
                       </div>
                       <Button variant="outline" fullWidth onClick={() => { setAssignForm({ ...assignForm, orderId: order.id }); setIsAssignModalOpen(true); }}>Assign Voucher</Button>
                     </div>
                   </Card>
                 );
              })}
              {/* Changed APPROVED to CONFIRMED */}
              {agentOrders.filter(o => o.status === BulkOrderStatus.CONFIRMED).length === 0 && (
                 <div className="col-span-full py-20 text-center opacity-50">
                    <div className="text-6xl mb-6">📦</div>
                    <p className="font-medium">No active room blocks. Purchase wholesale inventory to begin.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <Card className="overflow-hidden animate-in fade-in duration-500">
             <table className="w-full text-left">
               <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                 <tr>
                   <th className="px-8 py-5">Order ID</th>
                   <th className="px-8 py-5">Asset Details</th>
                   <th className="px-8 py-5">Allocation</th>
                   <th className="px-8 py-5">Value</th>
                   <th className="px-8 py-5">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                 {agentOrders.map(order => (
                   <tr key={order.id} className="hover:bg-gray-50/50 transition">
                     <td className="px-8 py-6 font-bold text-neutralDark font-mono">{order.id}</td>
                     <td className="px-8 py-6">
                        <div className="font-bold">{hotels.find(h => h.id === order.hotelId)?.name}</div>
                        <div className="text-xs text-gray-400">{order.checkIn} to {order.checkOut}</div>
                     </td>
                     <td className="px-8 py-6 font-black">{order.quantity}</td>
                     <td className="px-8 py-6 font-black text-primary">{formatPrice(order.totalCost)}</td>
                     <td className="px-8 py-6">
                        {/* Changed APPROVED to CONFIRMED */}
                        <Badge variant={order.status === BulkOrderStatus.CONFIRMED ? 'success' : order.status === BulkOrderStatus.REJECTED ? 'danger' : 'warning'}>
                          {order.status}
                        </Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </Card>
        )}
      </div>

      <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Wholesale Room Allocation">
        <div className="space-y-6">
          <Select 
            label="Property Selection" 
            options={hotels.map(h => ({ label: `${h.name} (${h.city})`, value: h.id }))} 
            onChange={e => setPurchaseForm({ ...purchaseForm, hotelId: e.target.value })}
          />
          {purchaseForm.hotelId && (
            <Select 
              label="Inventory Type" 
              options={hotels.find(h => h.id === purchaseForm.hotelId)?.rooms.map(r => ({ label: `${r.type} - Wholesale: ${formatPrice(r.agentPricePerNight)}/unit`, value: r.id })) || []}
              onChange={e => setPurchaseForm({ ...purchaseForm, roomId: e.target.value })}
            />
          )}
          <Input label="Desired Quantity" type="number" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-6">
            <Input label="Arrival" type="date" value={purchaseForm.checkIn} onChange={e => setPurchaseForm({ ...purchaseForm, checkIn: e.target.value })} />
            <Input label="Departure" type="date" value={purchaseForm.checkOut} onChange={e => setPurchaseForm({ ...purchaseForm, checkOut: e.target.value })} />
          </div>
          <Button variant="secondary" fullWidth size="lg" className="mt-4" onClick={handleBulkPurchase}>Submit Allocation Request</Button>
        </div>
      </Modal>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Generate Guest Voucher">
        <div className="space-y-6">
           <p className="text-sm text-gray-500">Assign a reserved room block to your customer. This will generate a valid travel document instantly.</p>
           <Input label="Pilgrim Full Name" placeholder="As per Passport" value={assignForm.guestName} onChange={e => setAssignForm({ ...assignForm, guestName: e.target.value })} />
           <Input label="Contact Email" placeholder="customer@agency.com" value={assignForm.guestEmail} onChange={e => setAssignForm({ ...assignForm, guestEmail: e.target.value })} />
           <Input label="Phone Number" placeholder="+92 ..." value={assignForm.guestPhone} onChange={e => setAssignForm({ ...assignForm, guestPhone: e.target.value })} />
           <Button variant="primary" fullWidth size="lg" className="mt-4" onClick={() => handleAssign(assignForm.orderId)}>Activate Voucher</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AgentPortal;
