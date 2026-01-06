import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import DashboardLayout from '../components/DashboardLayout';

// Lazy load Admin Pages
const AdminLoginPage = lazy(() => import('./admin/AdminLoginPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const BookingsPage = lazy(() => import('./admin/BookingsPage'));
const VoucherPage = lazy(() => import('./admin/VoucherPage'));
const HotelsPage = lazy(() => import('./admin/HotelsPage'));
const HotelManagePage = lazy(() => import('./admin/HotelManagePage'));
const AgenciesPage = lazy(() => import('./admin/AgenciesPage'));
const RequestsPage = lazy(() => import('./admin/RequestsPage'));
const BulkOrdersPage = lazy(() => import('./admin/BulkOrdersPage'));
const InvoicesPage = lazy(() => import('./admin/InvoicesPage'));
const FinancialsPage = lazy(() => import('./admin/FinancialsPage'));
const PromoCodesPage = lazy(() => import('./admin/PromoCodesPage'));
const NotificationsPage = lazy(() => import('./admin/NotificationsPage'));
const SettingsPage = lazy(() => import('./admin/SettingsPage'));

const ContentSpinner = () => (
    <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
);

const AdminPortal: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return (
          <Suspense fallback={<ContentSpinner />}>
              <AdminLoginPage />
          </Suspense>
      );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <Suspense fallback={<ContentSpinner />}>
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
        </Suspense>
      </div>
    </DashboardLayout>
  );
};

export default AdminPortal;