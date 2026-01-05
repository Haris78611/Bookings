
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import { Card } from '../../components/UI';
import { PageHeader, EmptyState, TableWrapper } from '../../components/AdminUI';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; iconBgClass: string }> = ({ title, value, icon, iconBgClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center border border-gray-100">
    <div className={`p-4 rounded-full mr-5 ${iconBgClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-primary">{value}</p>
    </div>
  </div>
);

const RevenueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CostIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1M5 21V5" /></svg>;
const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;

type TimeFilter = 'today' | 'week' | 'month' | 'year';

const parseDate = (dateString: string) => new Date(dateString);

const AdminFinancialsPage: React.FC = () => {
    const { bookings, hotels, formatPrice } = useAppContext();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

    const filteredBookings = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        return bookings.filter(b => {
            if (b.status !== BookingStatus.CONFIRMED) return false;
            const checkInDate = parseDate(b.checkIn);
            switch (timeFilter) {
                case 'today': return checkInDate >= startOfToday;
                case 'week': return checkInDate >= startOfWeek;
                case 'month': return checkInDate >= startOfMonth;
                case 'year': return checkInDate >= startOfYear;
                default: return true;
            }
        });
    }, [bookings, timeFilter]);

    const calculateBookingCost = (booking: Booking): number => {
        const hotel = hotels.find(h => h.id === booking.hotelId);
        const room = hotel?.rooms.find(r => r.id === booking.roomId);
        if (!room) return 0;
        
        const nights = Math.max(0, Math.round((parseDate(booking.checkOut).getTime() - parseDate(booking.checkIn).getTime()) / (1000 * 3600 * 24)));
        return nights * room.purchasePricePerNight;
    };

    const financialSummary = useMemo(() => {
        return filteredBookings.reduce((acc, booking) => {
            acc.totalSales += booking.totalPrice;
            acc.totalCost += calculateBookingCost(booking);
            return acc;
        }, { totalSales: 0, totalCost: 0, netRevenue: 0 });
    }, [filteredBookings, hotels]);
    
    financialSummary.netRevenue = financialSummary.totalSales - financialSummary.totalCost;

    return (
        <>
            <PageHeader title="Financials & Analytics">
                <div className="flex items-center bg-white p-1 rounded-lg shadow-sm border">
                    {(['today', 'week', 'month', 'year'] as TimeFilter[]).map(filter => (
                         <button 
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${timeFilter === filter ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                         >
                             {filter === 'week' || filter === 'month' || filter === 'year' ? `This ${filter}`: 'Today'}
                         </button>
                    ))}
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Sales" value={formatPrice(financialSummary.totalSales)} icon={<RevenueIcon />} iconBgClass="bg-primary/10 text-primary" />
                <StatCard title="Hotel Costs" value={formatPrice(financialSummary.totalCost)} icon={<CostIcon />} iconBgClass="bg-secondary/10 text-secondary" />
                <StatCard title="Net Revenue" value={formatPrice(financialSummary.netRevenue)} icon={<ProfitIcon />} iconBgClass="bg-green-500/10 text-green-600" />
            </div>

            <Card className="p-0 border-none shadow-sm rounded-xl bg-white overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-bold text-primary">Profitable Transactions</h2>
                </div>
                <TableWrapper>
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-50/80">
                            <tr className="text-gray-400 font-bold uppercase tracking-widest text-[9px] border-b">
                                <th className="px-6 py-4 text-left">Booking ID</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-right">Sale Price</th>
                                <th className="px-6 py-4 text-right">Cost</th>
                                <th className="px-6 py-4 text-right">Profit</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-100">
                            {filteredBookings.map(booking => {
                                const cost = calculateBookingCost(booking);
                                const profit = booking.totalPrice - cost;

                                return (
                                    <tr key={booking.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-secondary">{booking.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{booking.agencyId ? 'Agent' : 'Customer'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-800 font-semibold">{formatPrice(booking.totalPrice)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-semibold">{formatPrice(cost)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-600">{formatPrice(profit)}</td>
                                    </tr>
                                )
                            })}
                            {filteredBookings.length === 0 && <EmptyState message="No confirmed bookings found for this period." />}
                         </tbody>
                    </table>
                </TableWrapper>
            </Card>
        </>
    );
};

export default AdminFinancialsPage;
