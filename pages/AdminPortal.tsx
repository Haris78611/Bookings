
import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card, Badge, TableWrapper, Input, Select, Modal } from '../components/UI';
import { UserRole, BookingStatus, BulkOrderStatus, Agent, Hotel, SiteSettings, Invoice } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import HotelForm from '../components/HotelForm';
import AgencyFormModal from '../components/AgencyFormModal';
import WalletModal from '../components/WalletModal';

// --- Reusable Components ---
const PageHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
    <h2 className="text-[#005B5C] text-2xl font-bold tracking-tight">{title}</h2>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

const RefreshButton: React.FC<{ isRefreshing: boolean; onClick: () => void }> = ({ isRefreshing, onClick }) => (
  <Button variant="outline" onClick={onClick} className="bg-white border text-[#005B5C] px-5 py-2 !rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50">
    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    Refresh Data
  </Button>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <tr>
    <td colSpan={10} className="py-20 text-center text-sm text-gray-400 font-medium italic">{message}</td>
  </tr>
);


// --- View Components ---
const DashboardView: React.FC = () => {
  const { siteSettings, setSiteSettings, bookings: allBookings, hotels, formatPrice } = useAppContext();
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcement);
  const recentBookings = useMemo(() => allBookings.filter(b => !b.agencyId).slice(0, 5), [allBookings]);
  const totalRevenue = useMemo(() => allBookings.reduce((sum, booking) => sum + booking.totalPrice, 0), [allBookings]);

  const handleUpdateAnnouncement = () => {
    setSiteSettings({ ...siteSettings, announcement: announcementText });
    alert("Website announcement updated successfully.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
          <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">📋</div>
          <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Bookings</p><p className="text-[#005B5C] text-2xl font-black">{allBookings.length}</p></div>
        </Card>
        <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
          <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">🏢</div>
          <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Listed Hotels</p><p className="text-[#005B5C] text-2xl font-black">{hotels.length}</p></div>
        </Card>
        <Card className="p-8 border-none shadow-sm rounded-xl flex items-center gap-6 bg-white">
           <div className="bg-[#FDE2D1] p-4 rounded-xl text-[#E29578] text-2xl">💰</div>
          <div><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p><p className="text-[#005B5C] text-2xl font-black">{formatPrice(totalRevenue)}</p></div>
        </Card>
      </div>

      <Card className="p-10 border-none shadow-sm rounded-xl bg-white space-y-6">
        <h3 className="text-[#005B5C] text-xl font-bold">Global Website Announcement Control</h3>
        <p className="text-xs text-gray-500 font-medium">Use the pipe character `|` to separate multiple messages for the scrolling ticker effect.</p>
        <textarea 
          className="w-full bg-white border border-gray-200 p-6 rounded-xl text-sm font-medium min-h-[140px] outline-none focus:border-[#005B5C] transition-all resize-none shadow-inner"
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="Enter announcement. Use '|' to separate messages."
        />
        <div className="flex justify-end"><Button onClick={handleUpdateAnnouncement} variant="secondary">Update Announcement</Button></div>
      </Card>

      <div>
        <h3 className="text-[#005B5C] text-xl font-bold mb-4">Recent Customer Bookings</h3>
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden border border-gray-100">
          <TableWrapper>
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-[#F8F9FA] text-[#919699] font-bold uppercase tracking-widest text-[10px] border-b"><th className="py-5 px-6">Booking ID</th><th className="py-5 px-4">Guest</th><th className="py-5 px-4">Hotel</th><th className="py-5 px-4">Status</th></tr></thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map(b => (
                  <tr key={b.id}><td className="py-4 px-6 font-bold text-gray-500">{b.id}</td><td className="py-4 px-4 font-medium">{b.guestName}</td><td className="py-4 px-4 font-medium">{b.hotelName}</td><td className="py-4 px-4"><Badge>{b.status}</Badge></td></tr>
                )) : <EmptyState message="No direct customer bookings recorded." />}
              </tbody>
            </table>
          </TableWrapper>
        </Card>
      </div>
    </div>
  );
};

const BookingsView: React.FC = () => {
  const { bookings, updateBookingStatus, deleteBookings } = useAppContext();
  const [selected, setSelected] = useState<string[]>([]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? bookings.map(b => b.id) : []);
  };

  return (
    <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
      {selected.length > 0 && <div className="p-4 bg-primary/10 text-primary flex items-center justify-between"><span className="font-bold text-sm">{selected.length} selected</span><Button variant="danger" size="sm" onClick={() => deleteBookings(selected)}>Delete</Button></div>}
      <TableWrapper>
        <table className="w-full text-left text-xs">
          <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-5 px-6"><input type="checkbox" onChange={handleSelectAll} className="w-4 h-4 accent-[#005B5C]" /></th><th className="py-5 px-4">Guest</th><th className="py-5 px-4">Hotel</th><th className="py-5 px-4">Dates</th><th className="py-5 px-4">Status</th><th className="py-5 px-4 text-right">Actions</th></tr></thead>
          <tbody>
            {bookings.map(b => (<tr key={b.id}><td className="py-4 px-6"><input type="checkbox" checked={selected.includes(b.id)} onChange={() => setSelected(p => p.includes(b.id) ? p.filter(i => i !== b.id) : [...p, b.id])} className="w-4 h-4 accent-[#005B5C]" /></td><td className="py-4 px-4"><div><p className="font-bold text-gray-800">{b.guestName}</p><p className="text-[10px] text-gray-400 font-mono">{b.id}</p></div></td><td className="py-4 px-4">{b.hotelName}</td><td className="py-4 px-4">{b.checkIn} to {b.checkOut}</td><td className="py-4 px-4"><Select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value as BookingStatus)} className="!text-xs !font-bold !py-2 !pl-3 !pr-8" options={Object.values(BookingStatus).map(s => ({label: s, value: s}))}/></td><td className="py-4 px-4 text-right"><Link to={`/confirmation/${b.id}`} className="text-primary font-bold hover:underline">View</Link></td></tr>))}
            {bookings.length === 0 && <EmptyState message="No bookings found." />}
          </tbody>
        </table>
      </TableWrapper>
    </Card>
  );
};

const HotelsView: React.FC = () => {
    const { hotels, addHotel, updateHotel, deleteHotel } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

    const handleOpenModal = (hotel: Hotel | null = null) => {
      setEditingHotel(hotel);
      setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleSubmit = (hotelData: Partial<Hotel>) => {
      if (editingHotel) {
        updateHotel({ ...editingHotel, ...hotelData });
      } else {
        const newHotel: Hotel = { id: `H-${Date.now()}`, rooms: [], images: ['https://placehold.co/800x600'], amenities: ['Free Wifi'], ...hotelData } as Hotel;
        addHotel(newHotel);
      }
      handleCloseModal();
    };

    return (
      <>
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
            <TableWrapper>
                <table className="w-full text-left text-xs">
                    <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-5 px-4">Name</th><th className="py-5 px-4">City</th><th className="py-5 px-4">Rooms</th><th className="py-5 px-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {hotels.map(h => (<tr key={h.id} className="border-b"><td className="py-4 px-4 font-bold text-gray-800">{h.name}</td><td className="py-4 px-4 font-medium">{h.city}</td><td className="py-4 px-4 font-medium">{h.rooms.length}</td><td className="py-4 px-4 text-right font-bold text-sm space-x-4"><button onClick={() => handleOpenModal(h)} className="text-primary hover:underline">Edit</button><button onClick={() => deleteHotel(h.id)} className="text-red-500 hover:underline">Delete</button></td></tr>))}
                    </tbody>
                </table>
            </TableWrapper>
        </Card>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingHotel ? 'Edit Hotel' : 'Add Hotel'}>
          <HotelForm hotel={editingHotel} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>
      </>
    );
};

const AgenciesView: React.FC = () => {
    const { agencies, addAgency, updateAgency } = useAppContext();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isWalletModalOpen, setWalletModalOpen] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState<Agent | null>(null);

    const handleOpenForm = (agency: Agent | null = null) => { setSelectedAgency(agency); setFormModalOpen(true); };
    const handleOpenWallet = (agency: Agent) => { setSelectedAgency(agency); setWalletModalOpen(true); };
    const handleSubmit = (agencyData: Partial<Agent>) => {
      if (selectedAgency) {
        updateAgency({ ...selectedAgency, ...agencyData });
      } else {
        addAgency({ id: `AG-${Date.now()}`, walletBalance: 0, ...agencyData } as Agent);
      }
      setFormModalOpen(false);
    };

    return (
        <>
        <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
            <TableWrapper>
                <table className="w-full text-left text-xs">
                    <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-5 px-4">Agency</th><th className="py-5 px-4">Wallet Balance</th><th className="py-5 px-4">Status</th><th className="py-5 px-4 text-right">Actions</th></tr></thead>
                    <tbody>
                        {agencies.map(a => (<tr key={a.id} className="border-b"><td className="py-4 px-4"><p className="font-bold text-gray-800">{a.agencyName}</p><p className="text-[10px] text-gray-400">{a.id}</p></td><td className="py-4 px-4 font-bold text-primary">{a.walletBalance}</td><td className="py-4 px-4"><Badge variant={a.status === 'Active' ? 'success' : 'danger'}>{a.status}</Badge></td><td className="py-4 px-4 text-right text-primary font-bold text-sm space-x-4"><button onClick={() => handleOpenForm(a)} className="hover:underline">Edit</button><button onClick={() => handleOpenWallet(a)} className="hover:underline">Wallet</button></td></tr>))}
                    </tbody>
                </table>
            </TableWrapper>
        </Card>
        <AgencyFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSubmit={handleSubmit} agency={selectedAgency} />
        <WalletModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} agent={selectedAgency} />
        </>
    );
};

// --- Main Admin Portal Component ---
const AdminPortal: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return (<div className="min-h-screen flex items-center justify-center bg-[#F8FAFB]"><Card className="p-12 text-center max-w-sm shadow-2xl rounded-2xl border-none"><h2 className="text-2xl font-black text-[#005B5C] mb-4 uppercase tracking-tighter">Access Denied</h2><Button fullWidth onClick={() => navigate('/login')}>Admin Login</Button></Card></div>);
  }
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => { setIsRefreshing(false); alert('Data successfully synchronized.'); }, 800);
  };
  
  const renderView = () => {
    const view = location.pathname.split('/').pop();
    switch(view) {
      case 'admin': return <DashboardView />;
      case 'bookings': return <BookingsView />;
      case 'hotels': return <HotelsView />;
      case 'agencies': return <AgenciesView />;
      // Add other cases here for requests, bulk-orders etc.
      default: return <DashboardView />;
    }
  };

  const getPageHeader = () => {
    const view = location.pathname.split('/').pop();
    const baseTitle = view?.replace('-', ' ') || 'dashboard';
    const title = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);

    const actions: { [key: string]: React.ReactNode } = {
      hotels: <Button onClick={() => {}} variant="primary" className="!rounded-lg">+ Add New Hotel</Button>,
      agencies: <Button onClick={() => {}} variant="primary" className="!rounded-lg">+ Add New Agency</Button>,
    };

    return (
      <PageHeader title={title}>
        {actions[view || '']}<RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
      </PageHeader>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {getPageHeader()}
        {renderView()}
      </div>
    </DashboardLayout>
  );
};

export default AdminPortal;
