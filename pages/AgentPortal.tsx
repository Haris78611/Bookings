
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, TableWrapper, Input, Select, Modal } from '../components/UI';
import { UserRole, Currency, BulkOrderStatus, BulkOrder, BookingStatus, Booking } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import ReportGenerationModal from '../components/ReportGenerationModal';

const DashboardView: React.FC = () => {
  const { currentUser, agencies, formatPrice, bookings } = useAppContext();
  const agent = agencies.find(a => a.id === currentUser?.agencyId);
  const agentBookings = bookings.filter(b => b.agencyId === agent?.id);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  if (!agent) return null;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
            <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">💳</div>
            <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Wallet Balance</p><p className="text-[#005B5C] text-2xl font-bold">{formatPrice(agent?.walletBalance || 0)}</p></div>
          </Card>
          <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
            <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">🏢</div>
            <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</p><p className="text-[#005B5C] text-2xl font-bold">{agentBookings.length}</p></div>
          </Card>
          <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
            <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">📋</div>
            <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Agency Status</p><p className="text-[#005B5C] text-2xl font-bold">{agent?.status}</p></div>
          </Card>
        </div>
        <Card className="p-8 border-none shadow-sm rounded-xl bg-white border border-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-[#005B5C] text-lg font-bold mb-4">Welcome, {agent?.agencyName}!</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-4xl font-medium">
                  This is your central hub for managing hotel bookings for your clients. 
                  You can create new bulk orders or view and manage your existing agency bookings using the sections in the sidebar.
                </p>
              </div>
              <Button variant="secondary" className="!rounded-lg" onClick={() => setIsReportModalOpen(true)}>
                Generate Report
              </Button>
            </div>
        </Card>
      </div>
      <ReportGenerationModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        agent={agent}
      />
    </>
  );
};

const BulkBookingView: React.FC = () => {
  const { currentUser, agencies, formatPrice, hotels, bulkOrders, addBulkOrder, deleteBulkOrder, updateAgentWallet, addBooking } = useAppContext();
  const agent = agencies.find(a => a.id === currentUser?.agencyId)!;
  const agentBulkOrders = bulkOrders.filter(o => o.agencyId === agent.id);

  const [purchaseForm, setPurchaseForm] = useState({ hotelId: '', roomId: '', checkIn: '2026-04-01', checkOut: '2026-05-01', quantity: 1 });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<BulkOrder | null>(null);
  const [assignForm, setAssignForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', showPriceOnVoucher: true });

  const selectedHotel = hotels.find(h => h.id === purchaseForm.hotelId);
  const selectedRoom = selectedHotel?.rooms.find(r => r.id === purchaseForm.roomId);

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.hotelId || !purchaseForm.roomId || !selectedRoom) {
      alert("Please select a valid hotel and room."); return;
    }
    const nights = (new Date(purchaseForm.checkOut).getTime() - new Date(purchaseForm.checkIn).getTime()) / 86400000;
    if (nights <= 0) { alert("Check-out must be after check-in."); return; }
    
    const totalCost = selectedRoom.agentPricePerNight * purchaseForm.quantity * nights;
    if (agent.walletBalance < totalCost) {
      alert(`Insufficient Wallet Balance. Needed: ${formatPrice(totalCost)}`); return;
    }

    const order: BulkOrder = {
      id: `BO-${Date.now()}`, agencyId: agent.id, hotelId: purchaseForm.hotelId, roomId: purchaseForm.roomId, checkIn: purchaseForm.checkIn, checkOut: purchaseForm.checkOut,
      quantity: purchaseForm.quantity, totalCost, status: BulkOrderStatus.CONFIRMED, createdAt: new Date().toISOString()
    };
    addBulkOrder(order);
    updateAgentWallet(agent.id, totalCost, 'Debit', `Bulk Purchase: ${order.id}`);
    alert(`Bulk purchase ${order.id} confirmed.`);
    setPurchaseForm({ hotelId: '', roomId: '', checkIn: '2026-04-01', checkOut: '2026-05-01', quantity: 1 });
  };
  
  const handleAssign = (order: BulkOrder) => {
    setAssignTarget(order);
    setAssignForm({ guestName: '', guestEmail: '', guestPhone: '', showPriceOnVoucher: true });
    setIsAssignModalOpen(true);
  };
  
  const submitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget) return;
    const hotel = hotels.find(h => h.id === assignTarget.hotelId);
    const room = hotel?.rooms.find(r => r.id === assignTarget.roomId);
    
    addBooking({
      id: `VCH-${Date.now()}`, hotelId: assignTarget.hotelId, hotelName: hotel?.name || 'N/A', roomId: assignTarget.roomId, roomType: room?.type || 'N/A',
      checkIn: assignTarget.checkIn, checkOut: assignTarget.checkOut, guestName: assignForm.guestName, guestEmail: assignForm.guestEmail, guestPhone: assignForm.guestPhone,
      totalPrice: assignTarget.totalCost / assignTarget.quantity, status: BookingStatus.CONFIRMED, agencyId: agent.id, createdAt: new Date().toISOString()
    });
    
    setIsAssignModalOpen(false);
    alert(`Voucher issued for ${assignForm.guestName}.`);
  };

  return (
    <div className="space-y-10">
      <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
        <h3 className="text-[#005B5C] text-xl font-bold mb-8">1. Create New Bulk Purchase</h3>
        <form onSubmit={handleBulkSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select label="Hotel" value={purchaseForm.hotelId} onChange={e => setPurchaseForm({...purchaseForm, hotelId: e.target.value, roomId: ''})} options={[{label:'Select Hotel', value:''}, ...hotels.map(h => ({label: h.name, value: h.id}))]} className="!rounded-md"/>
            <Select label="Room" value={purchaseForm.roomId} disabled={!purchaseForm.hotelId} onChange={e => setPurchaseForm({...purchaseForm, roomId: e.target.value})} options={[{label:'Select Type', value:''}, ...(selectedHotel?.rooms || []).map(r => ({label: r.type, value: r.id}))]} className="!rounded-md"/>
            <Input label="Check-in" type="date" value={purchaseForm.checkIn} onChange={e => setPurchaseForm({...purchaseForm, checkIn: e.target.value})} className="!rounded-md" />
            <Input label="Check-out" type="date" value={purchaseForm.checkOut} onChange={e => setPurchaseForm({...purchaseForm, checkOut: e.target.value})} className="!rounded-md" />
            <Input label="# Rooms" type="number" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: Number(e.target.value)})} className="!rounded-md" />
          </div>
          <Button type="submit">+ Add to Purchase</Button>
        </form>
      </Card>

      <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
        <h3 className="text-[#005B5C] text-xl font-bold mb-8">2. My Bulk Purchases</h3>
        <TableWrapper>
           <table className="w-full text-left text-xs">
              <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-5 px-4">Order</th><th className="py-5 px-4">Details</th><th className="py-5 px-4">Qty</th><th className="py-5 px-4">Cost</th><th className="py-5 px-4 text-right">Actions</th></tr></thead>
              <tbody>
                {agentBulkOrders.length === 0 ? <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic">No bulk purchases found.</td></tr> : 
                agentBulkOrders.map(o => {
                  const hotel = hotels.find(h => h.id === o.hotelId);
                  const room = hotel?.rooms.find(r => r.id === o.roomId);
                  return <tr key={o.id}><td className="py-4 px-4 font-bold">{o.id}</td><td><div><p className="font-bold text-gray-800">{hotel?.name}</p><p className="text-[10px] text-gray-400">{room?.type}</p></div></td><td className="py-4 px-4 font-bold">{o.quantity}</td><td className="py-4 px-4 font-bold text-primary">{formatPrice(o.totalCost)}</td><td className="py-4 px-4 text-right space-x-2"><Button size="sm" onClick={() => handleAssign(o)}>Assign</Button><Button variant="danger" size="sm" onClick={() => deleteBulkOrder(o.id)}>X</Button></td></tr>
                })}
              </tbody>
           </table>
        </TableWrapper>
      </Card>
      
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Inventory Unit">
        <form onSubmit={submitAssignment} className="space-y-6"><Input label="Pilgrim Full Name" required value={assignForm.guestName} onChange={e => setAssignForm({...assignForm, guestName: e.target.value})} /><Input label="Contact Email" type="email" required value={assignForm.guestEmail} onChange={e => setAssignForm({...assignForm, guestEmail: e.target.value})} /><Input label="WhatsApp/Phone" required value={assignForm.guestPhone} onChange={e => setAssignForm({...assignForm, guestPhone: e.target.value})} /><Button type="submit" fullWidth>Confirm Assignment</Button></form>
      </Modal>
    </div>
  );
};

const MyBookingsView: React.FC = () => {
    const { currentUser, bookings, formatPrice } = useAppContext();
    const agentBookings = bookings.filter(b => b.agencyId === currentUser?.agencyId);
    
    return (
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
           <TableWrapper>
              <table className="w-full text-left text-xs">
                 <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-5 px-4">Booking ID</th><th className="py-5 px-4">Guest</th><th className="py-5 px-4">Hotel</th><th className="py-5 px-4">Total Price</th><th className="py-5 px-4">Status</th><th className="py-5 px-4 text-right">Actions</th></tr></thead>
                 <tbody>
                    {agentBookings.length === 0 ? <tr><td colSpan={6} className="py-20 text-center text-gray-400 italic">No bookings found.</td></tr> : 
                    agentBookings.map(b => (
                        <tr key={b.id}><td>{b.id}</td><td>{b.guestName}</td><td>{b.hotelName}</td><td>{formatPrice(b.totalPrice)}</td><td><Badge variant="success">{b.status}</Badge></td><td className="text-right"><a href={`/#/confirmation/${b.id}`} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Voucher</a></td></tr>
                    ))}
                 </tbody>
              </table>
           </TableWrapper>
        </Card>
    );
};

const SettingsView: React.FC = () => {
    const { currentUser, agencies, updateAgency } = useAppContext();
    const agent = agencies.find(a => a.id === currentUser?.agencyId)!;
    const [form, setForm] = useState({ agencyName: agent.agencyName, email: agent.email });

    useEffect(() => { setForm({ agencyName: agent.agencyName, email: agent.email }); }, [agent]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAgency({ ...agent, ...form });
        alert("Settings updated.");
    };

    return (
      <Card className="p-8 border-none shadow-sm rounded-xl bg-white max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Agency Name" value={form.agencyName} onChange={e => setForm({...form, agencyName: e.target.value})} />
          <Input label="Contact Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <div className="flex justify-end pt-4"><Button type="submit">Save Changes</Button></div>
        </form>
      </Card>
    );
};

const AgentPortal: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser || currentUser.role !== UserRole.AGENT) {
    return (<div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4"><Card className="p-12 text-center max-w-sm border-none shadow-2xl rounded-2xl bg-white"><div className="text-6xl mb-6">💼</div><h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Partner Login Required</h2><Button fullWidth variant="primary" onClick={() => navigate('/login')}>Login as Partner</Button></Card></div>);
  }

  const renderView = () => {
    const view = location.pathname.split('/')[2] || 'dashboard';
    switch (view) {
      case 'dashboard': return <DashboardView />;
      case 'bulk': return <BulkBookingView />;
      case 'bookings': return <MyBookingsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  const getTitle = () => {
    const view = location.pathname.split('/')[2] || 'dashboard';
    return view.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <h2 className="text-[#005B5C] text-2xl font-bold tracking-tight mb-8">{getTitle()}</h2>
        {renderView()}
      </div>
    </DashboardLayout>
  );
};

export default AgentPortal;