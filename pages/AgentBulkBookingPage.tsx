import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button, Card, TableWrapper, Input, Select, Badge } from '../components/UI';
import { BulkOrderStatus, BulkOrder, BulkOrderItem } from '../types';
import AgentBookingModal from '../components/AgentBookingModal';

const AgentBulkBookingPage: React.FC = () => {
  const { 
    currentUser, agencies, formatPrice, hotels, bulkOrders, addBulkOrder, 
    deleteBulkOrder, addToast
  } = useAppContext();
  
  const agent = agencies.find(a => a.id === currentUser?.agencyId);
  
  const [cart, setCart] = useState<BulkOrderItem[]>([]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  
  const [purchaseForm, setPurchaseForm] = useState({ hotelId: '', roomId: '', checkIn: '2026-04-01', checkOut: '2026-05-01', quantity: 1 });
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ orderId: string, item: BulkOrderItem } | null>(null);

  const selectedHotel = hotels.find(h => h.id === purchaseForm.hotelId);
  const selectedRoom = selectedHotel?.rooms.find(r => r.id === purchaseForm.roomId);
  
  if (!agent) return null;
  const agentBulkOrders = bulkOrders.filter(o => o.agencyId === agent.id);

  const calculateNights = (checkIn: string, checkOut: string) => Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.hotelId || !purchaseForm.roomId || !selectedRoom || !selectedHotel) {
      addToast("Please select a valid hotel and room.", "error"); return;
    }
    const nights = calculateNights(purchaseForm.checkIn, purchaseForm.checkOut);
    if (nights <= 0) { addToast("Check-out must be after check-in.", "error"); return; }
    
    const subtotal = selectedRoom.agentPricePerNight * purchaseForm.quantity * nights;

    const newItem: BulkOrderItem = {
      id: `ITEM-${Date.now()}`,
      hotelId: selectedHotel.id, hotelName: selectedHotel.name, roomId: selectedRoom.id, roomType: selectedRoom.type,
      checkIn: purchaseForm.checkIn, checkOut: purchaseForm.checkOut, quantity: purchaseForm.quantity,
      assignments: [], pricePerNight: selectedRoom.agentPricePerNight, subtotal,
    };
    setCart(prev => [...prev, newItem]);
    addToast(`${newItem.quantity} x ${newItem.roomType} added to purchase.`);
  };

  const handleRemoveFromCart = (itemId: string) => setCart(prev => prev.filter(item => item.id !== itemId));

  const handleConfirmPurchase = () => {
    if (cart.length === 0) { addToast("Purchase cart is empty.", "error"); return; }
    if (agent.walletBalance < cartTotal) { addToast(`Insufficient Wallet Balance. Needed: ${formatPrice(cartTotal)}`, "error"); return; }

    const newOrder: BulkOrder = {
      id: `BO-${Date.now()}`, agencyId: agent.id, items: cart, totalCost: cartTotal,
      status: BulkOrderStatus.PENDING, createdAt: new Date().toISOString()
    };
    addBulkOrder(newOrder);
    addToast(`Bulk purchase request ${newOrder.id} submitted for approval.`);
    setCart([]);
  };
  
  const handleAssign = (orderId: string, item: BulkOrderItem) => {
    setAssignTarget({ orderId, item });
    setIsAssignModalOpen(true);
  };
  
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this bulk purchase record? This does not refund the transaction.')) {
        deleteBulkOrder(orderId);
        addToast(`Bulk order ${orderId} deleted.`, 'error');
    }
  }
  
  const getStatusBadgeVariant = (status: BulkOrderStatus) => {
      switch (status) {
          case BulkOrderStatus.CONFIRMED: return 'success';
          case BulkOrderStatus.PENDING: return 'warning';
          case BulkOrderStatus.REJECTED: return 'danger';
          default: return 'info';
      }
  };


  return (
    <div className="space-y-10">
      <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
        <h3 className="text-[#005B5C] text-xl font-bold mb-8">1. Create New Bulk Purchase</h3>
        <form onSubmit={handleAddToCart} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select label="Hotel" value={purchaseForm.hotelId} onChange={e => setPurchaseForm({...purchaseForm, hotelId: e.target.value, roomId: ''})} options={[{label:'Select Hotel', value:''}, ...hotels.map(h => ({label: h.name, value: h.id}))]} className="!rounded-md"/>
            <Select label="Room" value={purchaseForm.roomId} disabled={!purchaseForm.hotelId} onChange={e => setPurchaseForm({...purchaseForm, roomId: e.target.value})} options={[{label:'Select Type', value:''}, ...(selectedHotel?.rooms || []).map(r => ({label: r.type, value: r.id}))]} className="!rounded-md"/>
            <Input label="Check-in" type="date" value={purchaseForm.checkIn} onChange={e => setPurchaseForm({...purchaseForm, checkIn: e.target.value})} className="!rounded-md" />
            <Input label="Check-out" type="date" value={purchaseForm.checkOut} onChange={e => setPurchaseForm({...purchaseForm, checkOut: e.target.value})} className="!rounded-md" />
            <Input label="# Rooms" type="number" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: Number(e.target.value)})} className="!rounded-md" />
          </div>
          <Button type="submit">+ Add to Purchase Cart</Button>
        </form>

        {cart.length > 0 && (
          <div className="mt-8 pt-6 border-t animate-in fade-in duration-500">
            <h4 className="text-primary font-bold mb-4">Purchase Cart</h4>
            <div className="space-y-3 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-bold">{item.hotelName} - {item.roomType} (x{item.quantity})</p>
                    <p className="text-xs text-gray-500">{item.checkIn} to {item.checkOut}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-sm">{formatPrice(item.subtotal)}</p>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveFromCart(item.id)} className="!rounded-full !w-6 !h-6 !p-0 text-xs">X</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-primary/5 rounded-lg">
              <p className="font-bold">Cart Total: <span className="text-primary text-xl">{formatPrice(cartTotal)}</span></p>
              <Button onClick={handleConfirmPurchase} variant="secondary" className="w-full sm:w-auto">Submit for Approval</Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
        <h3 className="text-[#005B5C] text-xl font-bold mb-8">2. My Bulk Purchases</h3>
        <div className="space-y-4">
          {agentBulkOrders.length === 0 ? <p className="py-20 text-center text-gray-400 italic">No bulk purchases found.</p> : 
          agentBulkOrders.map(order => (
            <div key={order.id} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <div><p className="font-bold">{order.id}</p><p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p></div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  <span className="font-bold text-primary">{formatPrice(order.totalCost)}</span>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteOrder(order.id)} className="!rounded-lg">Delete</Button>
                </div>
              </div>
              <TableWrapper>
                <table className="w-full text-left text-xs">
                  <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-3 px-4">Details</th><th className="py-3 px-4">Dates</th><th className="py-3 px-4">Qty</th><th className="py-3 px-4">Utilization</th><th className="py-3 px-4 text-right">Actions</th></tr></thead>
                  <tbody>
                    {order.items.map(item => {
                      const totalNightsAvailable = calculateNights(item.checkIn, item.checkOut) * item.quantity;
                      const totalNightsAssigned = (item.assignments || []).reduce((sum, ass) => sum + ass.nights, 0);
                      const nightsRemaining = totalNightsAvailable - totalNightsAssigned;
                      
                      return (
                        <tr key={item.id}>
                          <td className="py-4 px-4"><div><p className="font-bold text-gray-800">{item.hotelName}</p><p className="text-[10px] text-gray-400">{item.roomType}</p></div></td>
                          <td className="py-4 px-4">{item.checkIn} to {item.checkOut}</td>
                          <td className="py-4 px-4 font-bold">{item.quantity}</td>
                          <td className="py-4 px-4 font-bold">{totalNightsAssigned} / {totalNightsAvailable} nights</td>
                          <td className="py-4 px-4 text-right">
                            <Button size="sm" onClick={() => handleAssign(order.id, item)} disabled={order.status !== BulkOrderStatus.CONFIRMED || nightsRemaining <= 0}>Assign</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrapper>
            </div>
          ))}
        </div>
      </Card>
      
      <AgentBookingModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        assignTarget={assignTarget} 
      />
    </div>
  );
};

export default AgentBulkBookingPage;