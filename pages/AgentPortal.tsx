import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';

// Lazy load Agent Pages
const AgentLoginPage = lazy(() => import('./AgentLoginPage'));
const AgentDashboardPage = lazy(() => import('./AgentDashboardPage'));
const AgentBulkBookingPage = lazy(() => import('./AgentBulkBookingPage'));
const AgentMyBookingsPage = lazy(() => import('./AgentMyBookingsPage'));
const AgentSettingsPage = lazy(() => import('./AgentSettingsPage'));
const AgentVoucherPage = lazy(() => import('./AgentVoucherPage'));

const ContentSpinner = () => (
    <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
);

const AgentPortal: React.FC = () => {
  const { currentUser } = useAppContext();
  const location = useLocation();

  if (!currentUser || currentUser.role !== UserRole.AGENT) {
      return (
          <Suspense fallback={<ContentSpinner />}>
              <AgentLoginPage />
          </Suspense>
      );
  }
  
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('/agent/bulk')) return 'Bulk Booking';
    if (path.includes('/agent/bookings')) return 'My Bookings';
    if (path.includes('/agent/settings')) return 'Settings';
    if (path.includes('/agent/voucher')) return 'Booking Voucher';
    return 'Dashboard';
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <h2 className="text-[#005B5C] text-2xl font-bold tracking-tight mb-8">{getTitle()}</h2>
        <Suspense fallback={<ContentSpinner />}>
          <Routes>
            <Route index element={<AgentDashboardPage />} />
            <Route path="bulk" element={<AgentBulkBookingPage />} />
            <Route path="bookings" element={<AgentMyBookingsPage />} />
            <Route path="settings" element={<AgentSettingsPage />} />
            <Route path="voucher/:bookingId" element={<AgentVoucherPage />} />
          </Routes>
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default AgentPortal;