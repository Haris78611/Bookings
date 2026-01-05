
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import AgentLoginPage from './AgentLoginPage';

// Import Agent Pages
import AgentDashboardPage from './AgentDashboardPage';
import AgentBulkBookingPage from './AgentBulkBookingPage';
import AgentMyBookingsPage from './AgentMyBookingsPage';
import AgentSettingsPage from './AgentSettingsPage';

const AgentPortal: React.FC = () => {
  const { currentUser } = useAppContext();
  const location = useLocation();

  if (!currentUser || currentUser.role !== UserRole.AGENT) {
      // Show a dedicated login page if not authenticated
      return <AgentLoginPage />;
  }
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/agent/bulk')) return 'Bulk Booking';
    if (path.includes('/agent/bookings')) return 'My Bookings';
    if (path.includes('/agent/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <h2 className="text-[#005B5C] text-2xl font-bold tracking-tight mb-8">{getTitle()}</h2>
        <Routes>
          <Route index element={<AgentDashboardPage />} />
          <Route path="bulk" element={<AgentBulkBookingPage />} />
          <Route path="bookings" element={<AgentMyBookingsPage />} />
          <Route path="settings" element={<AgentSettingsPage />} />
        </Routes>
      </div>
    </DashboardLayout>
  );
};

export default AgentPortal;
