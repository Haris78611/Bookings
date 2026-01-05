
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Hotel, Booking, User, Currency, Agent, BulkOrder, Invoice, SiteSettings, 
  UserRole, BookingStatus, BulkOrderStatus, PromoCode, Room, Notification,
  Toast
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
  addRoomToHotel: (hotelId: string, room: Room) => void;
  updateRoomInHotel: (hotelId: string, room: Room) => void;
  deleteRoomFromHotel: (hotelId: string, roomId: string) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: BookingStatus, details?: { requestedCheckIn?: string, requestedCheckOut?: string }) => void;
  approveBookingRequest: (id: string) => void;
  rejectBookingRequest: (id: string) => void;
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
  deleteBulkOrder: (id: string) => void;
  updateBulkOrderStatus: (id: string, status: BulkOrderStatus) => void;
  assignBulkOrderItem: (orderId: string, itemId: string) => void;
  invoices: Invoice[];
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  notifications: string[];
  emailNotifications: Notification[];
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [currency, setCurrency] = useState<Currency>('PKR');
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [notifications, setNotifications] = useState<string[]>([
    "Booking Open for Ramadan 1447, Good Luck",
    "Good Morning • Make Bookings for Ramadan and Hajj 2026 • good luck",
    "Special Partner Rates active for Clock Tower properties"
  ]);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [agencies, setAgencies] = useState<Agent[]>([
    { id: '1234', agencyName: 'Haris T&Q', email: 'socialpalaces@gmail.com', status: 'Active', walletBalance: 2300800, iataCode: '24-58671', contactNumber: '+923001234567' },
    { id: 'AG-002', agencyName: 'Universal Pilgrims Ltd', email: 'universal@travel.com', status: 'Active', walletBalance: 1250000, iataCode: '96-01234', contactNumber: '+442071234567' }
  ]);

  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<Notification[]>([
    { id: 'N1', to: 'socialpalaces@gmail.com', subject: 'Wallet Credited Successfully', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'N2', to: 'pilgrim@registry.com', subject: 'Booking BK12345 Confirmed', sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'N3', to: 'universal@travel.com', subject: 'Bulk Purchase Order Processed', sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const formatPrice = (priceInPKR: number) => {
    const rate = CURRENCY_RATES[currency];
    const converted = priceInPKR * rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const addHotel = (hotel: Hotel) => setHotels(prev => [hotel, ...prev]);
  const updateHotel = (hotel: Hotel) => setHotels(prev => prev.map(h => h.id === hotel.id ? hotel : h));
  const deleteHotel = (id: string) => setHotels(prev => prev.filter(h => h.id !== id));

  const addRoomToHotel = (hotelId: string, room: Room) => {
    setHotels(prev => prev.map(h => h.id === hotelId ? { ...h, rooms: [room, ...h.rooms] } : h));
  };
  const updateRoomInHotel = (hotelId: string, room: Room) => {
    setHotels(prev => prev.map(h => h.id === hotelId ? { ...h, rooms: h.rooms.map(r => r.id === room.id ? room : r) } : h));
  };
  const deleteRoomFromHotel = (hotelId: string, roomId: string) => {
    setHotels(prev => prev.map(h => h.id === hotelId ? { ...h, rooms: h.rooms.filter(r => r.id !== roomId) } : h));
  };

  const addBooking = (booking: Booking) => setBookings(prev => [booking, ...prev]);
  
  const updateBookingStatus = (id: string, status: BookingStatus, details?: { requestedCheckIn?: string, requestedCheckOut?: string }) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        if (status === BookingStatus.DATE_CHANGE_REQUESTED && details) {
          return { ...b, status, requestedCheckIn: details.requestedCheckIn, requestedCheckOut: details.requestedCheckOut };
        }
        return { ...b, status };
      }
      return b;
    }));
  };

  const approveBookingRequest = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      if (b.status === BookingStatus.DATE_CHANGE_REQUESTED) {
        return { ...b, status: BookingStatus.CONFIRMED, checkIn: b.requestedCheckIn || b.checkIn, checkOut: b.requestedCheckOut || b.checkOut, requestedCheckIn: undefined, requestedCheckOut: undefined };
      }
      if (b.status === BookingStatus.CANCEL_REQUESTED) {
        return { ...b, status: BookingStatus.CANCELLED };
      }
      return b;
    }));
  };
  
  const rejectBookingRequest = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...b, status: BookingStatus.CONFIRMED, requestedCheckIn: undefined, requestedCheckOut: undefined };
    }));
  };

  const deleteBookings = (ids: string[]) => setBookings(prev => prev.filter(b => !ids.includes(b.id)));

  const addAgency = (agency: Agent) => setAgencies(prev => [agency, ...prev]);
  const updateAgency = (agency: Agent) => setAgencies(prev => prev.map(a => a.id === agency.id ? agency : a));
  const deleteAgency = (id: string) => setAgencies(prev => prev.filter(a => a.id !== id));

  const updateAgentWallet = (agencyId: string, amount: number, type: 'Credit' | 'Debit', desc: string) => {
    setAgencies(prev => prev.map(a => a.id === agencyId ? { ...a, walletBalance: type === 'Credit' ? a.walletBalance + amount : a.walletBalance - amount } : a));
    setInvoices(prev => [{ id: `INV-${Date.now()}`, agencyId, amount, type, description: desc, date: new Date().toISOString() }, ...prev]);
  };

  const addBulkOrder = (order: BulkOrder) => setBulkOrders(prev => [order, ...prev]);
  const deleteBulkOrder = (id: string) => setBulkOrders(prev => prev.filter(o => o.id !== id));
  const updateBulkOrderStatus = (id: string, status: BulkOrderStatus) => setBulkOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const assignBulkOrderItem = (orderId: string, itemId: string) => {
    setBulkOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.id === itemId && item.assignedCount < item.quantity) {
            return { ...item, assignedCount: item.assignedCount + 1 };
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    }));
  };

  const addPromoCode = (promo: PromoCode) => setPromoCodes(prev => [promo, ...prev]);
  const deletePromoCode = (id: string) => setPromoCodes(prev => prev.filter(p => p.id !== id));

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      siteSettings, setSiteSettings, currency, setCurrency, formatPrice, hotels, setHotels, addHotel, updateHotel, deleteHotel,
      addRoomToHotel, updateRoomInHotel, deleteRoomFromHotel,
      bookings, addBooking, updateBookingStatus, approveBookingRequest, rejectBookingRequest, deleteBookings, currentUser, setCurrentUser, logout,
      agencies, addAgency, updateAgency, deleteAgency, updateAgentWallet, 
      bulkOrders, addBulkOrder, deleteBulkOrder, updateBulkOrderStatus, assignBulkOrderItem, invoices, promoCodes, addPromoCode, deletePromoCode,
      notifications,
      emailNotifications,
      toasts, addToast, removeToast
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