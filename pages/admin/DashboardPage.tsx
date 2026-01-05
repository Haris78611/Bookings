
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button, Card, Badge } from '../../components/UI';
import { PageHeader, RefreshButton, EmptyState, TableWrapper } from '../../components/AdminUI';
import { Link } from 'react-router-dom';

// --- UI Components adapted from user's code ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
    <div className="bg-[#006D77]/10 text-[#006D77] p-4 rounded-full mr-5">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-primary">{value}</p>
    </div>
  </div>
);

const BookingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const HotelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21V5" />
    </svg>
);

const RevenueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);

// --- Main Dashboard Page Component ---

const DashboardPage: React.FC = () => {
  const { siteSettings, setSiteSettings, bookings, hotels, formatPrice, agencies } = useAppContext();
  const [announcementText, setAnnouncementText] = useState(siteSettings.announcement);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);
  const totalRevenue = useMemo(() => bookings.reduce((sum, booking) => sum + booking.totalPrice, 0), [bookings]);

  const handleUpdateAnnouncement = () => {
    setSiteSettings({ ...siteSettings, announcement: announcementText });
    alert("Website announcement updated successfully.");
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        setIsRefreshing(false);
        alert('Data successfully synchronized.');
    }, 800);
  };

  return (
    <>
      <PageHeader title="Dashboard">
        <RefreshButton isRefreshing={isRefreshing} onClick={handleRefresh} />
      </PageHeader>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Bookings" value={bookings.length.toString()} icon={<BookingIcon />} />
            <StatCard title="Listed Hotels" value={hotels.length.toString()} icon={<HotelIcon />} />
            <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} icon={<RevenueIcon />} />
        </div>

        <Card className="p-8 border-none shadow-sm rounded-xl bg-white space-y-6">
          <h3 className="text-[#005B5C] text-lg font-bold">Global Announcement Control</h3>
          <p className="text-xs text-gray-500 font-medium">Use `|` to separate multiple messages for the scrolling ticker effect.</p>
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm min-h-[120px] outline-none focus:border-[#005B5C] transition-all resize-none shadow-inner"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Enter announcement. Use '|' to separate messages."
          />
          <div className="flex justify-end"><Button onClick={handleUpdateAnnouncement} variant="secondary" className="!rounded-lg">Update Announcement</Button></div>
        </Card>

        <div>
          <h3 className="text-[#005B5C] text-lg font-bold mb-4">Recent Bookings</h3>
          <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden border border-gray-100">
            <TableWrapper>
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-gray-50/80 text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b"><th className="py-4 px-6">Booking ID</th><th className="py-4 px-4">Guest</th><th className="py-4 px-4">Hotel</th><th className="py-4 px-4">Agency</th><th className="py-4 px-4">Status</th><th className="py-4 px-4 text-right">Value</th></tr></thead>
                <tbody>
                  {recentBookings.map(b => {
                    const agency = agencies.find(a => a.id === b.agencyId);
                    return (<tr key={b.id} className="border-b last:border-0 hover:bg-gray-50/50"><td className="py-4 px-6 font-mono text-gray-500">{b.id}</td><td className="py-4 px-4 font-bold text-gray-800">{b.guestName}</td><td className="py-4 px-4">{b.hotelName}</td><td className="py-4 px-4">{agency?.agencyName || 'Direct'}</td><td className="py-4 px-4"><Badge variant={b.status === 'Confirmed' ? 'success' : 'warning'}>{b.status}</Badge></td><td className="py-4 px-4 text-right font-bold text-primary">{formatPrice(b.totalPrice)}</td></tr>)
                  })}
                  {recentBookings.length === 0 && <EmptyState message="No recent bookings." />}
                </tbody>
              </table>
            </TableWrapper>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
