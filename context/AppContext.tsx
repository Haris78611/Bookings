import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  Hotel, Booking, User, Currency, Agent, BulkOrder, Invoice, SiteSettings, 
  UserRole, BookingStatus, BulkOrderStatus, PromoCode, Room, Notification,
  Toast, Assignment
} from '../types';

const API_URL = './api.php'; // URL to your PHP backend

type AuthMode = 'customer-login' | 'customer-signup' | 'agent-login';
type CurrencyRates = { SAR: number; USD: number };

interface AppContextType {
  // Loading and Error State
  isLoading: boolean;
  error: string | null;
  
  // Data State
  siteSettings: SiteSettings | null;
  hotels: Hotel[];
  bookings: Booking[];
  currentUser: User | null;
  agencies: Agent[];
  bulkOrders: BulkOrder[];
  invoices: Invoice[];
  promoCodes: PromoCode[];
  emailNotifications: Notification[];

  // UI State
  currency: Currency;
  currencyRates: CurrencyRates;
  toasts: Toast[];

  // State Setters & Actions
  setSiteSettings: (settings: SiteSettings) => Promise<void>;
  setCurrency: (c: Currency) => void;
  setCurrencyRates: (rates: CurrencyRates) => Promise<void>;
  formatPrice: (priceInPKR: number) => string;
  
  addHotel: (hotel: Omit<Hotel, 'id'>) => Promise<void>;
  updateHotel: (hotel: Hotel) => Promise<void>;
  deleteHotel: (id: string) => Promise<void>;
  addRoomToHotel: (hotelId: string, room: Omit<Room, 'id'>) => Promise<void>;
  updateRoomInHotel: (hotelId: string, room: Room) => Promise<void>;
  deleteRoomFromHotel: (hotelId: string, roomId: string) => Promise<void>;

  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'> | Booking) => Promise<string | null>;
  updateBooking: (bookingId: string, updatedDetails: Partial<Booking>) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus, details?: { requestedCheckIn?: string, requestedCheckOut?: string }) => Promise<void>;
  assignBookingDetails: (bookingId: string, details: { activationKey: string; roomNumber: string }) => Promise<void>;
  approveBookingRequest: (id: string) => Promise<void>;
  rejectBookingRequest: (id: string) => Promise<void>;
  deleteBookings: (ids: string[]) => Promise<void>;
  
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  
  addAgency: (agency: Omit<Agent, 'id' | 'walletBalance'>) => Promise<void>;
  updateAgency: (agency: Agent) => Promise<void>;
  deleteAgency: (id: string) => Promise<void>;
  updateAgentWallet: (agencyId: string, amount: number, type: 'Credit' | 'Debit', desc: string) => Promise<void>;
  
  addToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;
  
  // Auth Modal State
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;

  // Auth Functions
  customerLogin: (email: string, pass: string) => Promise<boolean>;
  customerSignUp: (name: string, email: string, pass: string) => Promise<boolean>;
  agentLogin: (agencyId: string, pass: string) => Promise<boolean>;

  addBulkOrder: (order: Omit<BulkOrder, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateBulkOrderStatus: (id: string, status: BulkOrderStatus) => Promise<void>;
  deleteBulkOrder: (id: string) => Promise<void>;
  assignBulkOrderItem: (orderId: string, itemId: string, booking: Booking) => Promise<void>;

  addPromoCode: (promoCode: Omit<PromoCode, 'id'>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// API Fetcher
const apiCall = async (action: string, body?: any) => {
    try {
        const response = await fetch(`${API_URL}?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API call failed for action "${action}":`, error);
        throw error;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- All app data state ---
    const [siteSettings, _setSiteSettings] = useState<SiteSettings | null>(null);
    const [currency, setCurrency] = useState<Currency>('PKR');
    const [currencyRates, _setCurrencyRates] = useState<CurrencyRates>({ SAR: 74.1, USD: 278.4 });
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [agencies, setAgencies] = useState<Agent[]>([]);
    const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [emailNotifications, setEmailNotifications] = useState<Notification[]>([]);
    
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    // --- Auth Modal State ---
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('customer-login');
    
    // --- Initial Data Fetch ---
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiCall('getAllData');
            _setSiteSettings(data.siteSettings);
            _setCurrencyRates({ SAR: data.siteSettings.sar_rate || 74.1, USD: data.siteSettings.usd_rate || 278.4});
            setHotels(data.hotels || []);
            setBookings(data.bookings || []);
            setAgencies(data.agencies || []);
            setInvoices(data.invoices || []);
            setPromoCodes(data.promoCodes || []);
            setEmailNotifications(data.emailNotifications || []);
            setBulkOrders(data.bulkOrders || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data from server.');
            addToast(err.message || 'Failed to fetch data from server.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    // --- UI Helpers ---
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [{ id, message, type }, ...prev]);
        setTimeout(() => removeToast(id), 5000);
    };
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };
    const formatPrice = (priceInPKR: number) => {
        if (isNaN(priceInPKR)) return '...';
        let converted = priceInPKR;
        if (currency === 'SAR') converted = priceInPKR / currencyRates.SAR;
        else if (currency === 'USD') converted = priceInPKR / currencyRates.USD;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted);
    };
    
    // --- Auth Modal Handlers ---
    const openAuthModal = (mode: AuthMode) => { setAuthMode(mode); setIsAuthModalOpen(true); };
    const closeAuthModal = () => setIsAuthModalOpen(false);
    
    // --- API-driven Actions ---
    
    // Auth
    const customerLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await apiCall('login', { email, password, role: 'CUSTOMER' });
            if (res.success) {
                setCurrentUser(res.user);
                addToast(`Welcome back, ${res.user.name}!`);
                closeAuthModal();
                return true;
            }
        } catch (error: any) {
            addToast(error.message || 'Invalid credentials.', 'error');
        }
        return false;
    };
    
    const customerSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const res = await apiCall('signup', { name, email, password });
            if (res.success) {
                setCurrentUser(res.user);
                addToast(`Welcome, ${res.user.name}! Account created.`);
                closeAuthModal();
                return true;
            }
        } catch(error: any) {
            addToast(error.message || 'Signup failed.', 'error');
        }
        return false;
    };
    
    const agentLogin = async (agencyId: string, password: string): Promise<boolean> => {
        try {
            const res = await apiCall('login', { agencyId, password, role: 'AGENT' });
            if (res.success) {
                setCurrentUser(res.user);
                addToast(`Welcome, ${res.user.name}!`);
                closeAuthModal();
                return true;
            }
        } catch(error: any) {
            addToast(error.message || 'Invalid credentials.', 'error');
        }
        return false;
    };
    const logout = () => setCurrentUser(null);
    
    // Hotels & Rooms
    const addHotel = async (hotel: Omit<Hotel, 'id'>) => { await apiCall('createHotel', hotel); await fetchData(); };
    const updateHotel = async (hotel: Hotel) => { await apiCall('updateHotel', hotel); await fetchData(); };
    const deleteHotel = async (id: string) => { await apiCall('deleteHotel', { id }); await fetchData(); };
    const addRoomToHotel = async (hotelId: string, room: Omit<Room, 'id'>) => { await apiCall('createRoom', { hotelId, room }); await fetchData(); };
    const updateRoomInHotel = async (hotelId: string, room: Room) => { await apiCall('updateRoom', { hotelId, room }); await fetchData(); };
    const deleteRoomFromHotel = async (hotelId: string, roomId: string) => { await apiCall('deleteRoom', { hotelId, roomId }); await fetchData(); };

    // Bookings
    const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'> | Booking) => {
        const bookingToSend = 'id' in booking ? booking : {
            ...booking,
            id: `BK${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: BookingStatus.PENDING,
        };
        const res = await apiCall('createBooking', bookingToSend);
        await fetchData();
        return res.success ? bookingToSend.id : null;
    };
    const updateBooking = async (bookingId: string, updatedDetails: Partial<Booking>) => { await apiCall('updateBooking', { id: bookingId, ...updatedDetails }); await fetchData(); };
    const updateBookingStatus = async (id: string, status: BookingStatus, details?: any) => { await apiCall('updateBookingStatus', { id, status, details }); await fetchData(); };
    const assignBookingDetails = async (bookingId: string, details: any) => { await apiCall('assignBookingDetails', { bookingId, ...details }); await fetchData(); };
    const approveBookingRequest = async (id: string) => { await apiCall('approveBookingRequest', { id }); await fetchData(); };
    const rejectBookingRequest = async (id: string) => { await apiCall('rejectBookingRequest', { id }); await fetchData(); };
    const deleteBookings = async (ids: string[]) => { await apiCall('deleteBookings', { ids }); await fetchData(); };

    // Agencies
    const addAgency = async (agency: Omit<Agent, 'id' | 'walletBalance'>) => { await apiCall('createAgency', agency); await fetchData(); };
    const updateAgency = async (agency: Agent) => { await apiCall('updateAgency', agency); await fetchData(); };
    const deleteAgency = async (id: string) => { await apiCall('deleteAgency', { id }); await fetchData(); };
    const updateAgentWallet = async (agencyId: string, amount: number, type: 'Credit' | 'Debit', description: string) => {
        await apiCall('updateWallet', { agencyId, amount, type, description });
        await fetchData();
    };
    
    // Bulk Orders
    const addBulkOrder = async (order: Omit<BulkOrder, 'id' | 'createdAt' | 'status'>) => {
        const newOrder = {
            ...order,
            id: `BO-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: BookingStatus.PENDING
        };
        await apiCall('createBulkOrder', newOrder); 
        await fetchData(); 
    };
    const updateBulkOrderStatus = async (id: string, status: BulkOrderStatus) => { await apiCall('updateBulkOrderStatus', { id, status }); await fetchData(); };
    const deleteBulkOrder = async (id: string) => { await apiCall('deleteBulkOrder', { id }); await fetchData(); };
    const assignBulkOrderItem = async (orderId: string, itemId: string, booking: Booking) => { await apiCall('assignBulkOrderItem', { orderId, itemId, booking }); await fetchData(); };

    // Promo Codes
    const addPromoCode = async (promoCode: Omit<PromoCode, 'id'>) => {
        await apiCall('createPromoCode', promoCode); 
        await fetchData(); 
    };
    const deletePromoCode = async (id: string) => { await apiCall('deletePromoCode', { id }); await fetchData(); };

    // Settings
    const setSiteSettings = async (settings: SiteSettings) => { await apiCall('updateSettings', { ...settings, ...currencyRates }); await fetchData(); };
    const setCurrencyRates = async (rates: CurrencyRates) => { if(siteSettings) { await apiCall('updateSettings', { ...siteSettings, ...rates }); await fetchData(); }};

    if (error) {
        return <div className="h-screen w-screen flex items-center justify-center bg-red-50 text-red-700 p-8"><strong>Error:</strong> {error}</div>;
    }
    
    // Only render children when settings are loaded to avoid issues.
    return (
        <AppContext.Provider value={{
            isLoading, error, siteSettings, hotels, bookings, currentUser, agencies, bulkOrders, invoices, promoCodes, emailNotifications,
            currency, currencyRates, toasts, setCurrency, formatPrice, addToast, removeToast,
            setSiteSettings, setCurrencyRates,
            addHotel, updateHotel, deleteHotel, addRoomToHotel, updateRoomInHotel, deleteRoomFromHotel,
            addBooking, updateBooking, updateBookingStatus, assignBookingDetails, approveBookingRequest, rejectBookingRequest, deleteBookings,
            setCurrentUser, logout,
            addAgency, updateAgency, deleteAgency, updateAgentWallet,
            addBulkOrder, updateBulkOrderStatus, deleteBulkOrder, assignBulkOrderItem,
            addPromoCode, deletePromoCode,
            isAuthModalOpen, authMode, openAuthModal, closeAuthModal, setAuthMode,
            customerLogin, customerSignUp, agentLogin
        }}>
            {isLoading && !siteSettings ? (
                <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-primary font-bold tracking-widest uppercase text-sm">Initializing Registry...</p>
                </div>
            ) : children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within AppProvider');
    return context;
};