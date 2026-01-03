
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Hotel, Booking, User, Currency, Agent, BulkOrder, Invoice, SiteSettings, 
  UserRole, BookingStatus, BulkOrderStatus, PromoCode 
} from '../types';
import { INITIAL_HOTELS, INITIAL_SITE_SETTINGS, CURRENCY_RATES } from '../constants';

interface AppContextType {
  siteSettings: SiteSettings;
  setSiteSettings: (settings: SiteSettings) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInPKR: number) => string;
  hotels: Hotel[];
  setHotels: React.Dispatch<React.SetStateAction<Hotel[]>>;
  addHotel: (hotel: Hotel) => void;
  updateHotel: (hotel: Hotel) => void;
  deleteHotel: (id: string) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBookings: (ids: string[]) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  agencies: Agent[];
  addAgency: (agency: Agent) => void;
  updateAgency: (agency: Agent) => void;
  deleteAgency: (id: string) => void;
  updateAgentWallet: (agencyId: string, amount: number, type: 'Credit' | 'Debit', desc: string) => void;
  bulkOrders: BulkOrder[];
  addBulkOrder: (order: BulkOrder) => void;
  updateBulkOrderStatus: (id: string, status: BulkOrderStatus) => void;
  invoices: Invoice[];
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  notifications: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [notifications, setNotifications] = useState<string[]>([
    "UmrahStay V2.5 Live - Professional Sanctuary Portal Active",
    "Special Ramadan 2025 Inventory now available for Partners",
    "New High-Speed Voucher Generation active for all Pilgrims",
    "Partner Wallet Approval queue currently under 10 minutes"
  ]);
  
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-9901',
      hotelId: 'h1',
      hotelName: 'Makkah Clock Royal Tower, A Fairmont Hotel',
      roomId: 'r1',
      roomType: 'Signature Haram View Suite',
      checkIn: '2025-05-10',
      checkOut: '2025-05-15',
      guestName: 'Sami Khan',
      guestEmail: 'sami@example.com',
      guestPhone: '+923001234567',
      totalPrice: 264500,
      purchaseCost: 180000,
      status: BookingStatus.CONFIRMED,
      userId: 'CUST-1',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'ADM-1',
    name: 'Haris Administrator',
    email: 'admin@umrahstay.com',
    role: UserRole.ADMIN,
  });

  const [agencies, setAgencies] = useState<Agent[]>([
    { id: 'AG-001', agencyName: 'Hajj & Umrah Travel PK', email: 'agent@travel.com', status: 'Active', walletBalance: 500000 },
    { id: 'AG-002', agencyName: 'Universal Pilgrims Ltd', email: 'universal@travel.com', status: 'Active', walletBalance: 1250000 }
  ]);

  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-101', agencyId: 'AG-001', amount: 500000, type: 'Credit', description: 'Opening Balance', date: '2025-01-01' }
  ]);
  
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: 'p1', code: 'WELCOME10', discount: 10, type: 'percentage' }
  ]);

  const formatPrice = (priceInPKR: number) => {
    const rate = CURRENCY_RATES[currency];
    const converted = priceInPKR * rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(converted);
  };

  const addHotel = (hotel: Hotel) => setHotels(prev => [hotel, ...prev]);
  const updateHotel = (hotel: Hotel) => setHotels(prev => prev.map(h => h.id === hotel.id ? hotel : h));
  const deleteHotel = (id: string) => setHotels(prev => prev.filter(h => h.id !== id));

  const addBooking = (booking: Booking) => {
    const hotel = hotels.find(h => h.id === booking.hotelId);
    const room = hotel?.rooms.find(r => r.id === booking.roomId);
    const cost = room ? room.purchasePricePerNight : 0;
    setBookings(prev => [{ ...booking, purchaseCost: cost }, ...prev]);
    setNotifications(prev => [...prev, `Booking Alert: ${booking.id} created for ${booking.guestName}`]);
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    setNotifications(prev => [...prev, `Status Change: Booking ${id} is now ${status}`]);
  };

  const deleteBookings = (ids: string[]) => setBookings(prev => prev.filter(b => !ids.includes(b.id)));

  const addAgency = (agency: Agent) => setAgencies(prev => [agency, ...prev]);
  const updateAgency = (agency: Agent) => setAgencies(prev => prev.map(a => a.id === agency.id ? agency : a));
  const deleteAgency = (id: string) => setAgencies(prev => prev.filter(a => a.id !== id));

  const updateAgentWallet = (agencyId: string, amount: number, type: 'Credit' | 'Debit', desc: string) => {
    setAgencies(prev => prev.map(a => a.id === agencyId ? { 
      ...a, 
      walletBalance: type === 'Credit' ? a.walletBalance + amount : a.walletBalance - amount 
    } : a));
    const invId = `INV-${Date.now()}`;
    setInvoices(prev => [{ 
      id: invId, agencyId, amount, type, description: desc, date: new Date().toISOString() 
    }, ...prev]);
    setNotifications(prev => [...prev, `Wallet Transaction: ${invId} issued to ${agencyId} for ${amount} PKR`]);
  };

  const addBulkOrder = (order: BulkOrder) => setBulkOrders(prev => [order, ...prev]);
  const updateBulkOrderStatus = (id: string, status: BulkOrderStatus) => {
    setBulkOrders(prev => prev.map(o => {
      if (o.id === id) {
        if (status === BulkOrderStatus.REJECTED && o.status === BulkOrderStatus.PENDING) {
          updateAgentWallet(o.agencyId, o.totalCost, 'Credit', `Refund for Rejected Order ${id}`);
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  const addPromoCode = (promo: PromoCode) => setPromoCodes(prev => [promo, ...prev]);
  const deletePromoCode = (id: string) => setPromoCodes(prev => prev.filter(p => p.id !== id));

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      siteSettings, setSiteSettings, currency, setCurrency, formatPrice, hotels, setHotels, addHotel, updateHotel, deleteHotel,
      bookings, addBooking, updateBookingStatus, deleteBookings, currentUser, setCurrentUser, logout,
      agencies, addAgency, updateAgency, deleteAgency, updateAgentWallet, 
      bulkOrders, addBulkOrder, updateBulkOrderStatus, invoices, promoCodes, addPromoCode, deletePromoCode,
      notifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
