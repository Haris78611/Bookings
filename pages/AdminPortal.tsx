
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';

// Import Pages
import AdminLoginPage from './admin/AdminLoginPage';
import DashboardPage from './admin/DashboardPage';
import BookingsPage from './admin/BookingsPage';
import VoucherPage from './admin/VoucherPage';
import HotelsPage from './admin/HotelsPage';
import HotelManagePage from './admin/HotelManagePage';
import AgenciesPage from './admin/AgenciesPage';
import RequestsPage from './admin/RequestsPage';
import BulkOrdersPage from './admin/BulkOrdersPage';
import InvoicesPage from './admin/InvoicesPage';
import FinancialsPage from './admin/FinancialsPage';
import PromoCodesPage from './admin/PromoCodesPage';
import NotificationsPage from './admin/NotificationsPage';
import SettingsPage from './admin/SettingsPage';

const AdminPortal: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return <AdminLoginPage />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="voucher/:bookingId" element={<VoucherPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="bulk-orders" element={<BulkOrdersPage />} />
          <Route path="hotels" element={<HotelsPage />} />
          <Route path="hotels/manage/:hotelId" element={<HotelManagePage />} />
          <Route path="agencies" element={<AgenciesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="financials" element={<FinancialsPage />} />
          <Route path="promo-codes" element={<PromoCodesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </DashboardLayout>
  );
};

export default AdminPortal;
