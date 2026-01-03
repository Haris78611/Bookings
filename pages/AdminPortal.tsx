
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Input, Select, Modal, Card, Badge, NotificationTicker } from '../components/UI';
import { AdminSidebar } from '../components/Layout';
import { 
  Hotel, BookingStatus, BulkOrderStatus, Booking, Agent, Room, BulkOrder, PromoCode, Invoice 
} from '../types';

/**
 * DASHBOARD VIEW
 */
const DashboardView: React.FC = () => {
  const { bookings, hotels, formatPrice, siteSettings, setSiteSettings, notifications } = useAppContext();
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcement);

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    listedHotels: hotels.length,
    totalRevenue: bookings
      .filter(b => b.status === BookingStatus.CONFIRMED)
      .reduce((acc, b) => acc + b.totalPrice, 0)
  }), [bookings, hotels]);

  const handleUpdateAnnouncement = () => {
    setSiteSettings({ ...siteSettings, announcement: announcementText });
    alert("Website announcement updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Control Desk</h1>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>🔄 Refresh Analytics</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Confirmed Vouchers" value={stats.totalBookings.toString()} icon="🎫" color="teal" />
        <StatCard title="Sanctuary Properties" value={stats.listedHotels.toString()} icon="🏨" color="orange" />
        <StatCard title="Portfolio Revenue" value={formatPrice(stats.totalRevenue)} icon="💰" color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 uppercase text-[10px] tracking-widest">Broadcast Announcement</h3>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-4 text-sm h-32 text-gray-900 bg-white focus:ring-primary outline-none font-medium leading-relaxed"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Special Offer: Use code UMRAH2025..."
          />
          <Button variant="secondary" className="mt-4" fullWidth onClick={handleUpdateAnnouncement}>Deploy to Public Portal</Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 uppercase text-[10px] tracking-widest">Recent System Events</h3>
          <div className="space-y-3">
             {notifications.slice(-5).reverse().map((n, i) => (
               <div key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <span className="w-2 h-2 bg-primary rounded-full"></span>
                 {n}
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: 'teal' | 'orange' }) => (
  <Card className={`p-8 border-l-8 ${color === 'teal' ? 'border-primary' : 'border-secondary'} shadow-lg hover:translate-y-[-2px] transition duration-300`}>
    <div className="flex items-center gap-6">
      <div className="w-16 h-16 bg-accent/30 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-neutralDark">{value}</p>
      </div>
    </div>
  </Card>
);

/**
 * HOTELS VIEW
 */
const HotelsView: React.FC = () => {
  const { hotels, deleteHotel, addHotel, updateHotel } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const openForm = (h?: Hotel) => {
    setEditingHotel(h || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Hotel Portfolio</h1>
        <Button onClick={() => openForm()}>+ Onboard Property</Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b font-black text-gray-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-5">Property Identity</th>
              <th className="px-6 py-5">Holy Region</th>
              <th className="px-6 py-5">Unit Capacity</th>
              <th className="px-6 py-5 text-right">Commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {hotels.map(h => (
              <tr key={h.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5">
                  <p className="font-black text-gray-800 text-base">{h.name}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{h.stars} Stars • {h.distanceToHaram}m from Sanctuary</p>
                </td>
                <td className="px-6 py-5 text-gray-700">{h.city}</td>
                <td className="px-6 py-5 font-bold text-primary">{h.rooms.length} Room Types</td>
                <td className="px-6 py-5 text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openForm(h)} className="border font-black text-[10px] uppercase">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => { if(confirm('Permanently erase property?')) deleteHotel(h.id); }} className="font-black text-[10px] uppercase">Del</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHotel ? "Update Sanctuary Registry" : "Initialize New Sanctuary stay"}>
        <HotelForm hotel={editingHotel} onSave={(h) => { editingHotel ? updateHotel(h) : addHotel(h); setIsModalOpen(false); }} />
      </Modal>
    </div>
  );
};

const HotelForm = ({ hotel, onSave }: { hotel: Hotel | null, onSave: (h: Hotel) => void }) => {
  const [formData, setFormData] = useState<Hotel>(hotel || {
    id: `h-${Date.now()}`,
    name: '',
    city: 'Makkah',
    address: '',
    stars: 5,
    distanceToHaram: 0,
    description: '',
    images: ['https://picsum.photos/800/600'],
    amenities: [],
    rooms: [],
    availableFrom: '',
    availableTo: ''
  });

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const handleSaveRoom = () => {
    if (!activeRoom) return;
    const exists = formData.rooms.find(r => r.id === activeRoom.id);
    const updatedRooms = exists 
      ? formData.rooms.map(r => r.id === activeRoom.id ? activeRoom : r)
      : [...formData.rooms, activeRoom];
    setFormData({ ...formData, rooms: updatedRooms });
    setActiveRoom(null);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Hotel Title" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="font-black text-lg" />
        <Select label="Sanctuary City" options={[{label: 'Makkah Al-Mukarramah', value: 'Makkah'}, {label: 'Al-Madinah Al-Munawwarah', value: 'Madina'}]} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value as any})} />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Input label="Inventory Start" type="date" value={formData.availableFrom} onChange={e => setFormData({...formData, availableFrom: e.target.value})} />
        <Input label="Inventory End" type="date" value={formData.availableTo} onChange={e => setFormData({...formData, availableTo: e.target.value})} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Input label="Quality Stars" type="number" min="1" max="5" value={formData.stars} onChange={e => setFormData({...formData, stars: Number(e.target.value)})} />
        <Input label="Distance (m)" type="number" value={formData.distanceToHaram} onChange={e => setFormData({...formData, distanceToHaram: Number(e.target.value)})} />
        <Input label="Gallery Thumb URL" value={formData.images[0]} onChange={e => setFormData({...formData, images: [e.target.value]})} />
      </div>

      <textarea 
        className="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-900 bg-white min-h-[120px] font-medium leading-relaxed"
        placeholder="Detailed sanctuary narrative..."
        value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
      />

      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Sanctuary Units (Rooms)</h4>
          <Button size="sm" variant="outline" className="text-[10px] uppercase font-black" onClick={() => setActiveRoom({ 
            id: `r-${Date.now()}`, type: '', description: '', amenities: [], purchasePricePerNight: 0, agentPricePerNight: 0, customerPricePerNight: 0, capacity: 2 
          })}>+ New Room Class</Button>
        </div>

        <div className="space-y-3">
          {formData.rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <p className="font-black text-gray-800 uppercase text-xs">{room.type}</p>
                <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">Cap: {room.capacity} • Base PKR: {room.purchasePricePerNight}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveRoom(room)} className="text-primary font-black text-[10px] uppercase hover:underline">Edit</button>
                <button onClick={() => setFormData({...formData, rooms: formData.rooms.filter(r => r.id !== room.id)})} className="text-red-500 font-black text-[10px] uppercase hover:underline">Drop</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeRoom && (
        <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 space-y-6 shadow-xl animate-in slide-in-from-top-4 duration-300">
           <div className="flex justify-between items-center mb-2">
             <h5 className="font-black text-primary text-[10px] uppercase tracking-widest">Unit Specification</h5>
             <button onClick={() => setActiveRoom(null)} className="text-gray-400 hover:text-gray-900 transition">✕</button>
           </div>
           <Input label="Room Category Title" value={activeRoom.type} onChange={e => setActiveRoom({...activeRoom, type: e.target.value})} />
           <div className="grid grid-cols-3 gap-6">
             <Input label="Purchase (Cost)" type="number" value={activeRoom.purchasePricePerNight} onChange={e => setActiveRoom({...activeRoom, purchasePricePerNight: Number(e.target.value)})} />
             <Input label="Agent (B2B Sale)" type="number" value={activeRoom.agentPricePerNight} onChange={e => setActiveRoom({...activeRoom, agentPricePerNight: Number(e.target.value)})} />
             <Input label="Public (B2C Sale)" type="number" value={activeRoom.customerPricePerNight} onChange={e => setActiveRoom({...activeRoom, customerPricePerNight: Number(e.target.value)})} />
           </div>
           <Button variant="primary" fullWidth size="lg" className="rounded-xl font-black text-xs uppercase" onClick={handleSaveRoom}>Apply Unit Config</Button>
        </div>
      )}

      <Button variant="secondary" fullWidth size="lg" className="h-20 text-xl font-black tracking-tighter shadow-xl hover:scale-[1.01]" onClick={() => onSave(formData)}>Finalize Global Property Deployment</Button>
    </div>
  );
};

/**
 * AGENCIES VIEW
 */
const AgenciesView: React.FC = () => {
  const { agencies, deleteAgency, addAgency, updateAgency, updateAgentWallet, formatPrice } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agent | null>(null);
  const [walletAmount, setWalletAmount] = useState(0);

  const openForm = (a?: Agent) => {
    setSelectedAgency(a || null);
    setIsModalOpen(true);
  };

  const openWallet = (a: Agent) => {
    setSelectedAgency(a);
    setIsWalletModalOpen(true);
  };

  const handleWalletTx = (type: 'Credit' | 'Debit') => {
    if (!selectedAgency) return;
    updateAgentWallet(selectedAgency.id, walletAmount, type, `Administrative Wallet Adjustment: Manual ${type}`);
    setIsWalletModalOpen(false);
    setWalletAmount(0);
    alert(`Wallet ${type} successful for ${selectedAgency.agencyName}`);
  };

  const toggleStatus = (a: Agent) => {
    updateAgency({ ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">B2B Network Management</h1>
        <Button onClick={() => openForm()}>+ Authorize Agency</Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b font-black text-gray-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-5">Partner Identity</th>
              <th className="px-6 py-5">Wallet Liquidity</th>
              <th className="px-6 py-5 text-center">Lifecycle</th>
              <th className="px-6 py-5 text-right">Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {agencies.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5">
                  <p className="font-black text-gray-800 text-base">{a.agencyName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {a.id} • {a.email}</p>
                </td>
                <td className="px-6 py-5 font-black text-primary text-lg">{formatPrice(a.walletBalance)}</td>
                <td className="px-6 py-5 text-center">
                  <button onClick={() => toggleStatus(a)} className="hover:scale-105 transition">
                    <Badge variant={a.status === 'Active' ? 'success' : 'danger'}>{a.status}</Badge>
                  </button>
                </td>
                <td className="px-6 py-5 text-right flex justify-end gap-2 mt-1">
                  <Button variant="ghost" size="sm" onClick={() => openWallet(a)} className="border font-black text-[10px] uppercase text-primary">Manage Wallet</Button>
                  <Button variant="ghost" size="sm" onClick={() => openForm(a)} className="border font-black text-[10px] uppercase">Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => { if(confirm('Revoke agency access?')) deleteAgency(a.id); }} className="font-black text-[10px] uppercase">Del</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} title={`Ledger Flux: ${selectedAgency?.agencyName}`}>
        <div className="space-y-8">
          <Input label="Value Amount (PKR)" type="number" value={walletAmount} onChange={e => setWalletAmount(Number(e.target.value))} className="text-3xl font-black text-gray-900 h-16" />
          <div className="grid grid-cols-2 gap-6">
            <Button variant="primary" fullWidth size="lg" className="font-black uppercase text-xs h-16 rounded-xl" onClick={() => handleWalletTx('Credit')}>+ Credit Balance</Button>
            <Button variant="danger" fullWidth size="lg" className="font-black uppercase text-xs h-16 rounded-xl" onClick={() => handleWalletTx('Debit')}>- Debit Balance</Button>
          </div>
          <p className="text-[10px] text-gray-400 uppercase text-center font-bold tracking-[0.2em] opacity-60 italic">Permanent invoice history will be recorded</p>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedAgency ? "Edit Partner Registry" : "Initialize New Partner Access"}>
         <div className="space-y-6">
            <Input label="Corporate Entity Title" value={selectedAgency?.agencyName || ''} onChange={e => setSelectedAgency(prev => prev ? {...prev, agencyName: e.target.value} : null)} />
            <Input label="Authorized Contact Email" value={selectedAgency?.email || ''} onChange={e => setSelectedAgency(prev => prev ? {...prev, email: e.target.value} : null)} />
            <Select label="Partner Lifecycle Status" options={[{label: 'Active Network Partner', value: 'Active'}, {label: 'Inactive/Suspended', value: 'Inactive'}]} value={selectedAgency?.status || 'Active'} onChange={e => setSelectedAgency(prev => prev ? {...prev, status: e.target.value as any} : null)} />
            <Button variant="secondary" fullWidth className="mt-4 font-black text-xs uppercase h-14" onClick={() => { selectedAgency ? updateAgency(selectedAgency) : addAgency({ ...selectedAgency!, id: `AG-${Date.now()}`, walletBalance: 0 }); setIsModalOpen(false); }}>Update Partner Registry</Button>
         </div>
      </Modal>
    </div>
  );
};

/**
 * FINANCIALS VIEW
 */
const FinancialsView: React.FC = () => {
  const { bookings, formatPrice } = useAppContext();
  
  const metrics = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const cost = confirmed.reduce((sum, b) => sum + (b.purchaseCost || 0), 0);
    return { revenue, cost, profit: revenue - cost, count: confirmed.length };
  }, [bookings]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Financial Intelligence</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-10 border-l-8 border-primary bg-white shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Retail Yield</p>
          <p className="text-4xl font-black text-gray-800">{formatPrice(metrics.revenue)}</p>
          <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">{metrics.count} Successful Reservations</p>
        </Card>
        <Card className="p-10 border-l-8 border-red-500 bg-white shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inventory Cost Basis</p>
          <p className="text-4xl font-black text-red-600">{formatPrice(metrics.cost)}</p>
          <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">Internal Hotel procurement</p>
        </Card>
        <Card className="p-10 border-l-8 border-green-500 bg-green-50/20 shadow-xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Operational Profit</p>
          <p className="text-4xl font-black text-green-600">{formatPrice(metrics.profit)}</p>
          <p className="text-xs text-green-600 mt-4 font-black uppercase tracking-widest">Growth: {metrics.revenue > 0 ? Math.round((metrics.profit/metrics.revenue)*100) : 0}% Margin</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-none shadow-sm">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <h3 className="font-black text-gray-700 uppercase tracking-tight text-lg">Detailed Transaction Yields</h3>
          <Badge variant="success">Audited Records</Badge>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Voucher REF</th>
              <th className="px-6 py-5">Sanctuary</th>
              <th className="px-6 py-5">Sale Val</th>
              <th className="px-6 py-5">Cost Val</th>
              <th className="px-6 py-5 text-right">Net Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {bookings.filter(b => b.status === BookingStatus.CONFIRMED).map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-5 font-mono font-black text-primary">{b.id}</td>
                <td className="px-6 py-5 font-bold text-gray-800">{b.hotelName}</td>
                <td className="px-6 py-5 text-gray-800">{formatPrice(b.totalPrice)}</td>
                <td className="px-6 py-5 text-red-500 font-bold">{formatPrice(b.purchaseCost || 0)}</td>
                <td className={`px-6 py-5 text-right font-black ${b.totalPrice - (b.purchaseCost || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPrice(b.totalPrice - (b.purchaseCost || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/**
 * SETTINGS VIEW (Comprehensive)
 */
const SettingsView: React.FC = () => {
  const { siteSettings, setSiteSettings, promoCodes, addPromoCode, deletePromoCode } = useAppContext();
  const [localSettings, setLocalSettings] = useState(siteSettings);
  const [newPromo, setNewPromo] = useState<PromoCode>({ id: '', code: '', discount: 0, type: 'percentage' });

  const handleGlobalSave = () => {
    setSiteSettings(localSettings);
    alert("Global system parameters locked and deployed.");
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Global System Parameters</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <Card className="p-10 space-y-12 shadow-sm">
          <div className="space-y-6">
            <h3 className="font-black text-primary border-b pb-3 uppercase text-[10px] tracking-[0.3em]">Platform Branding</h3>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Application Identity" value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} />
              <Input label="Navigation Logo Symbol" value={localSettings.logo} onChange={e => setLocalSettings({...localSettings, logo: e.target.value})} />
            </div>
            <Input label="Hero Sanctuary Banner URL" value={localSettings.bannerImage} onChange={e => setLocalSettings({...localSettings, bannerImage: e.target.value})} />
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-primary border-b pb-3 uppercase text-[10px] tracking-[0.3em]">Corporate Support & Socials</h3>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Customer Support Email" value={localSettings.contactEmail} onChange={e => setLocalSettings({...localSettings, contactEmail: e.target.value})} />
              <Input label="Corporate Hotline" value={localSettings.contactPhone} onChange={e => setLocalSettings({...localSettings, contactPhone: e.target.value})} />
            </div>
            <Input label="HQ Physical Address" value={localSettings.contactAddress} onChange={e => setLocalSettings({...localSettings, contactAddress: e.target.value})} />
            <div className="grid grid-cols-3 gap-4">
               <Input label="Facebook URL" value={localSettings.facebookUrl} onChange={e => setLocalSettings({...localSettings, facebookUrl: e.target.value})} />
               <Input label="Instagram URL" value={localSettings.instagramUrl} onChange={e => setLocalSettings({...localSettings, instagramUrl: e.target.value})} />
               <Input label="WhatsApp Line" value={localSettings.whatsappNumber} onChange={e => setLocalSettings({...localSettings, whatsappNumber: e.target.value})} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-primary border-b pb-3 uppercase text-[10px] tracking-[0.3em]">Arithmetic Fees</h3>
            <div className="grid grid-cols-2 gap-6">
              <Input label="Cancellation Penalty (%)" type="number" value={localSettings.cancellationFee} onChange={e => setLocalSettings({...localSettings, cancellationFee: Number(e.target.value)})} />
              <Input label="Reschedule Charge (%)" type="number" value={localSettings.dateChangeFee} onChange={e => setLocalSettings({...localSettings, dateChangeFee: Number(e.target.value)})} />
            </div>
          </div>

          <Button variant="secondary" fullWidth size="lg" className="h-16 font-black text-sm uppercase tracking-widest shadow-xl" onClick={handleGlobalSave}>Save Global Configuration</Button>
        </Card>

        <Card className="p-10 bg-gray-50/50 shadow-sm border-dashed border-2">
          <h3 className="font-black text-primary border-b pb-6 uppercase text-[10px] tracking-[0.3em] mb-8">Campaign Engine (Promo Codes)</h3>
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-md space-y-6 border border-gray-100">
               <Input label="Registry Code" placeholder="e.g. RAMADAN2025" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className="font-black text-primary text-lg" />
               <div className="grid grid-cols-2 gap-6">
                 <Input label="Discount Magnitude" type="number" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: Number(e.target.value)})} />
                 <Select label="Arithmetic Logic" options={[{label: 'Percentage %', value: 'percentage'}, {label: 'Fixed Value (PKR)', value: 'fixed'}]} value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value as any})} />
               </div>
               <Button fullWidth variant="primary" size="lg" className="font-black text-xs uppercase rounded-xl" onClick={() => { if(newPromo.code) { addPromoCode({...newPromo, id: `p-${Date.now()}`}); setNewPromo({id:'', code:'', discount:0, type:'percentage'}); } }}>Deploy Campaign</Button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Campaigns</p>
              {promoCodes.map(pc => (
                <div key={pc.id} className="flex justify-between items-center bg-white border border-gray-100 p-5 rounded-2xl text-sm shadow-sm group hover:border-primary transition">
                  <span className="font-black text-primary text-base tracking-tighter">{pc.code}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-900 font-black uppercase text-xs">{pc.discount}{pc.type === 'percentage' ? '%' : ' PKR'} off</span>
                    <button onClick={() => deletePromoCode(pc.id)} className="text-red-300 hover:text-red-600 transition font-black text-lg">✕</button>
                  </div>
                </div>
              ))}
              {promoCodes.length === 0 && <p className="text-center py-10 text-gray-400 font-black uppercase tracking-widest text-[10px] opacity-40">Zero Deployed Campaigns</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * INVOICES VIEW
 */
const InvoicesView: React.FC = () => {
  const { invoices, formatPrice, agencies } = useAppContext();
  const [filterAgency, setFilterAgency] = useState('All');

  const filtered = filterAgency === 'All' 
    ? invoices 
    : invoices.filter(inv => inv.agencyId === filterAgency);

  const agencyOptions = useMemo(() => [
    { label: 'All Registered Agencies', value: 'All' },
    ...agencies.map(a => ({ label: a.agencyName, value: a.id }))
  ], [agencies]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Ledger Flux History</h1>
        <div className="w-72 shadow-sm">
          <Select options={agencyOptions} value={filterAgency} onChange={e => setFilterAgency(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm border-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Statement REF</th>
              <th className="px-6 py-4">Partner Entity</th>
              <th className="px-6 py-4">Narration</th>
              <th className="px-6 py-4 text-center">Arithmetic Value</th>
              <th className="px-6 py-4 text-right">Documents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-5 font-mono font-black text-primary">{inv.id}</td>
                <td className="px-6 py-4 font-black text-gray-800 uppercase text-xs">
                  {agencies.find(a => a.id === inv.agencyId)?.agencyName || 'Legacy Entity'}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs italic leading-relaxed">{inv.description}</td>
                <td className={`px-6 py-4 text-center font-black text-lg ${inv.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {inv.type === 'Credit' ? '▲ ' : '▼ '}{formatPrice(inv.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => alert('Mock: Downloading Statement PDF for ' + inv.id)} className="border font-black text-[10px] uppercase">Download</Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-24 text-center text-gray-400 font-black uppercase tracking-widest opacity-30 text-xs">Zero Registry flux documented</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/**
 * NOTIFICATIONS VIEW
 */
const NotificationsView: React.FC = () => {
  const { notifications } = useAppContext();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">System Events Log</h1>
      <Card className="p-0 overflow-hidden shadow-sm border-none">
         <div className="divide-y divide-gray-100">
           {notifications.slice().reverse().map((n, i) => (
             <div key={i} className="p-6 flex items-start gap-5 hover:bg-gray-50 transition">
                <div className="w-12 h-12 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary text-2xl shadow-inner border border-primary/10">📧</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-bold leading-relaxed">{n}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase mt-1.5 tracking-widest">Authorized Transmission • Dispatched via Simulated SMTP</p>
                </div>
                <Badge variant="info">Dispatched</Badge>
             </div>
           ))}
           {notifications.length === 0 && <p className="p-24 text-center text-gray-400 font-black uppercase tracking-widest opacity-30 text-xs">Zero Dispatch events recorded</p>}
         </div>
      </Card>
    </div>
  );
};

/**
 * MAIN ADMIN DISPATCHER
 */
const AdminPortal: React.FC<{ view: string }> = ({ view }) => {
  return (
    <div className="flex bg-[#F1F5F9] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-10 overflow-y-auto h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && <DashboardView />}
          {view === 'hotels' && <HotelsView />}
          {view === 'bookings' && <BookingsView />}
          {view === 'requests' && <RequestsView />}
          {view === 'bulk-orders' && <BulkOrdersView />}
          {view === 'agencies' && <AgenciesView />}
          {view === 'invoices' && <InvoicesView />}
          {view === 'financials' && <FinancialsView />}
          {view === 'settings' && <SettingsView />}
          {view === 'notifications' && <NotificationsView />}
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;

/**
 * SHARED TABLE VIEWS
 */
const BookingsView: React.FC = () => {
  const { bookings, updateBookingStatus, agencies } = useAppContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const agencyFilter = queryParams.get('agencyId');

  const [filters, setFilters] = useState({ id: '', guest: '' });

  const filtered = bookings.filter(b => {
    const matchesId = b.id.toLowerCase().includes(filters.id.toLowerCase());
    const matchesGuest = b.guestName.toLowerCase().includes(filters.guest.toLowerCase());
    const matchesAgency = !agencyFilter || b.agencyId === agencyFilter;
    return matchesId && matchesGuest && matchesAgency;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Voucher Registry</h1>
      <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-sm">
        <Input label="Search Registry REF" value={filters.id} onChange={e => setFilters({...filters, id: e.target.value})} placeholder="e.g. BK-9901" />
        <Input label="Search Pilgrim Entity" value={filters.guest} onChange={e => setFilters({...filters, guest: e.target.value})} placeholder="e.g. Sami Khan" />
      </Card>
      <Card className="overflow-hidden border-none shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b font-black text-gray-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-5">Voucher REF</th>
              <th className="px-6 py-5">Pilgrim Identity</th>
              <th className="px-6 py-5">Property Stay</th>
              <th className="px-6 py-5 text-center">Sanctuary Status</th>
              <th className="px-6 py-5 text-right">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-5 font-mono font-black text-primary text-base">{b.id}</td>
                <td className="px-6 py-5">
                  <p className="font-black text-gray-800 text-base">{b.guestName}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Partner: {agencies.find(a => a.id === b.agencyId)?.agencyName || 'B2C Direct'}</p>
                </td>
                <td className="px-6 py-5">
                   <p className="text-xs text-gray-700 font-bold">{b.hotelName}</p>
                   <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">{b.roomType}</p>
                </td>
                <td className="px-6 py-5 text-center">
                  <select 
                    value={b.status} 
                    onChange={e => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                    className={`text-[10px] font-black rounded-lg px-4 py-2 outline-none border transition-all appearance-none cursor-pointer ${
                      b.status === BookingStatus.CONFIRMED ? 'bg-green-50 text-green-700 border-green-200' : 
                      b.status === BookingStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    <option value={BookingStatus.PENDING}>Pending</option>
                    <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                    <option value={BookingStatus.CANCELLED}>Cancelled</option>
                    <option value={BookingStatus.CANCEL_REQUESTED}>Cancel Req</option>
                    <option value={BookingStatus.DATE_CHANGE_REQUESTED}>Change Req</option>
                  </select>
                </td>
                <td className="px-6 py-5 text-right">
                  <a href={`#/confirmation/${b.id}`} className="text-primary text-[10px] font-black uppercase underline hover:no-underline tracking-widest">View Doc</a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-24 text-center text-gray-400 font-black uppercase tracking-widest opacity-30 text-xs">Zero Registry entries found</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const RequestsView: React.FC = () => {
  const { bookings, updateBookingStatus } = useAppContext();
  const requests = bookings.filter(b => 
    b.status === BookingStatus.CANCEL_REQUESTED || b.status === BookingStatus.DATE_CHANGE_REQUESTED
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Modification Incidents</h1>
      <Card className="overflow-hidden border-none shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b uppercase text-[10px] font-black text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-5">Pilgrim Identity</th>
              <th className="px-6 py-5">Modification Intent</th>
              <th className="px-6 py-5 text-right">Administrative Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5">
                  <p className="font-black text-gray-800 text-base">{r.guestName}</p>
                  <p className="font-mono text-[10px] text-primary font-black uppercase tracking-widest">{r.id}</p>
                </td>
                <td className="px-6 py-5"><Badge variant="warning">{r.status}</Badge></td>
                <td className="px-6 py-5 text-right space-x-3">
                  <Button variant="primary" size="sm" className="font-black text-[10px] uppercase rounded-lg" onClick={() => updateBookingStatus(r.id, BookingStatus.CONFIRMED)}>Authorize</Button>
                  <Button variant="danger" size="sm" className="font-black text-[10px] uppercase rounded-lg" onClick={() => updateBookingStatus(r.id, BookingStatus.CANCELLED)}>Deny</Button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan={3} className="p-24 text-center text-gray-400 font-black uppercase tracking-widest opacity-30 text-xs">Zero Pending Incidents</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const BulkOrdersView: React.FC = () => {
  const { bulkOrders, updateBulkOrderStatus, formatPrice, agencies } = useAppContext();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Wholesale Allocation Flux</h1>
      <Card className="overflow-hidden border-none shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-5">Allocation Identity</th>
              <th className="px-6 py-5">Corporate Partner</th>
              <th className="px-6 py-5">Allocation Value</th>
              <th className="px-6 py-5 text-center">Workflow state</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {bulkOrders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition duration-300">
                <td className="px-6 py-5 font-mono font-black text-primary text-base">{o.id}</td>
                <td className="px-6 py-5 font-black text-gray-800 uppercase text-xs">
                  {agencies.find(a => a.id === o.agencyId)?.agencyName}
                </td>
                <td className="px-6 py-5 font-black text-neutralDark text-lg">{formatPrice(o.totalCost)}</td>
                <td className="px-6 py-5 text-center">
                  <select 
                    value={o.status}
                    onChange={e => updateBulkOrderStatus(o.id, e.target.value as BulkOrderStatus)}
                    className={`text-[10px] font-black rounded-lg px-4 py-2 outline-none border transition-all appearance-none cursor-pointer ${
                      o.status === BulkOrderStatus.CONFIRMED ? 'bg-green-50 text-green-700 border-green-200' : 
                      o.status === BulkOrderStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    <option value={BulkOrderStatus.PENDING}>Reviewing</option>
                    <option value={BulkOrderStatus.CONFIRMED}>Authorized</option>
                    <option value={BulkOrderStatus.REJECTED}>Denied</option>
                  </select>
                </td>
              </tr>
            ))}
            {bulkOrders.length === 0 && <tr><td colSpan={4} className="p-24 text-center text-gray-400 font-black uppercase tracking-widest opacity-30 text-xs">Zero Wholesale Flux Recorded</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
