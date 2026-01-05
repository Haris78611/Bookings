
export type Currency = 'PKR' | 'SAR' | 'USD';

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  CANCEL_REQUESTED = 'Cancellation Requested',
  DATE_CHANGE_REQUESTED = 'Date Change Requested'
}

export enum BulkOrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REJECTED = 'Rejected'
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export interface Room {
  id: string;
  type: string;
  description: string;
  images: string[]; // Changed from image?: string to images: string[]
  amenities: string[];
  purchasePricePerNight: number; // PKR
  agentPricePerNight: number;    // PKR
  customerPricePerNight: number; // PKR
  capacity: number;
}

export interface Hotel {
  id: string;
  name: string;
  city: 'Makkah' | 'Madina';
  address: string;
  stars: number;
  distanceToHaram: number;
  description: string;
  images: string[];
  amenities: string[];
  rooms: Room[];
  isFeatured?: boolean;
  availableFrom?: string;
  availableTo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId?: string;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  purchaseCost?: number;
  status: BookingStatus;
  userId?: string;
  agencyId?: string;
  createdAt: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
}

export interface Agent {
  id: string;
  agencyName: string;
  email: string;
  password?: string;
  status: 'Active' | 'Inactive';
  walletBalance: number;
  iataCode?: string;
  contactNumber?: string;
}

export interface BulkOrder {
  id: string;
  agencyId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  quantity: number;
  totalCost: number;
  status: BulkOrderStatus;
  createdAt: string;
}

export interface Invoice {
  id:string;
  agencyId: string;
  amount: number;
  type: 'Credit' | 'Debit';
  description: string;
  date: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

export interface SiteSettings {
  name: string;
  logo: string;
  bannerImage: string;
  announcement: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  twitterUrl?: string;
  cancellationFee: number;
  dateChangeFee: number;
}

export interface Notification {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
}
