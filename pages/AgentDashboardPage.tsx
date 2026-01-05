
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card } from '../components/UI';
import ReportGenerationModal from '../components/ReportGenerationModal';

// Icons
const BookingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21V5" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const RefreshIcon: React.FC<{ isRefreshing: boolean }> = ({ isRefreshing }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.693L19.015 7.74M4.036 7.74l3.182 3.182" /></svg>;

// Stat Card component
const StatCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ReactNode; linkTo?: string; className?: string }> = ({ title, value, icon, linkTo, className }) => {
    const content = (
        <div className={`bg-white p-6 rounded-xl shadow-md flex items-center h-full border border-gray-100 ${linkTo ? 'transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer' : ''} ${className}`}>
            <div className="bg-secondary/10 text-secondary p-4 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{title}</p>
                <div className="text-2xl font-bold text-primary">{value}</div>
            </div>
        </div>
    );

    return linkTo ? <Link to={linkTo} className="block h-full">{content}</Link> : <div className="h-full">{content}</div>;
};


const AgentDashboardPage: React.FC = () => {
  const { currentUser, agencies, formatPrice, bookings, addToast } = useAppContext();
  const agent = agencies.find(a => a.id === currentUser?.agencyId);
  const agentBookings = bookings.filter(b => b.agencyId === agent?.id);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        setIsRefreshing(false);
        addToast('Dashboard data has been synchronized.', 'success');
    }, 1200);
  };

  if (!agent) return null;

  // Inactive Account Screen
  if (agent.status === 'Inactive') {
    return (
        <Card className="p-12 rounded-lg shadow-lg text-center bg-red-50 border border-red-200">
            <h1 className="text-2xl font-bold text-red-600">Account Inactive</h1>
            <p className="text-gray-600 mt-2">Your agency account is currently inactive. Please contact administration for assistance.</p>
        </Card>
    );
  }

  // Active Account Dashboard
  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-2xl font-bold text-primary">Welcome, {agent?.agencyName}!</h1>
                <p className="text-gray-500 mt-1">
                  This is your central hub for managing hotel bookings for your clients.
                </p>
            </div>
            <button onClick={handleRefresh} disabled={isRefreshing} className="group flex items-center bg-white text-primary font-semibold py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                <RefreshIcon isRefreshing={isRefreshing} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Wallet Balance" value={formatPrice(agent?.walletBalance || 0)} icon={<WalletIcon />} />
            <StatCard title="Create Bulk Booking" value={<span className="text-lg">Start New Order &rarr;</span>} icon={<HotelIcon />} linkTo="/agent/bulk" />
            <StatCard title="My Agency's Bookings" value={`${agentBookings.length} Bookings`} icon={<BookingIcon />} linkTo="/agent/bookings" />
        </div>

        {/* Info/Actions Card */}
        <Card className="p-8 border-none shadow-sm rounded-xl bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-[#005B5C] text-lg font-bold mb-4">Quick Actions</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-4xl font-medium">
                  Use the quick links above to start a new bulk purchase or review your existing bookings. You can also generate a detailed performance report for your records.
                </p>
              </div>
              <Button variant="secondary" className="!rounded-lg mt-4 sm:mt-0" onClick={() => setIsReportModalOpen(true)}>
                Generate Report
              </Button>
            </div>
        </Card>
      </div>
      
      {agent && <ReportGenerationModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        agent={agent}
      />}
    </>
  );
};

export default AgentDashboardPage;
