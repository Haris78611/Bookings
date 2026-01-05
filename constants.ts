import { Hotel, SiteSettings } from './types';

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Makkah Clock Royal Tower, A Fairmont Hotel',
    city: 'Makkah',
    address: 'Ibrahim Al Khalil St, Jabal Omar, Makkah 21955, Saudi Arabia',
    stars: 5,
    distanceToHaram: 100,
    description: 'Located adjacent to the Masjid al Haram, this luxury hotel offers unparalleled views and premium services for pilgrims.',
    images: ['https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800&auto=format&fit=crop'],
    amenities: ['Free WiFi', 'Room Service', 'Air Conditioning', 'Flat-screen TV', 'Haram View'],
    isFeatured: true,
    rooms: [
      {
        id: 'r1',
        type: 'Signature Haram View Suite',
        description: 'Breathtaking direct views of the Holy Kaaba.',
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop'
        ],
        amenities: ['Butler Service', 'Haram View', 'WiFi', 'Espresso Machine'],
        purchasePricePerNight: 180000,
        agentPricePerNight: 220000,
        customerPricePerNight: 264500,
        capacity: 2
      }
    ]
  },
  {
    id: 'h2',
    name: 'Pullman ZamZam Makkah',
    city: 'Makkah',
    address: 'Abraj Al Bait Complex, Makkah, Saudi Arabia',
    stars: 5,
    distanceToHaram: 150,
    description: 'Facing the King Abdulaziz Gate, this hotel provides easy access to the Holy Mosque and features modern, comfortable rooms with partial Haram views.',
    images: ['https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=800&auto=format&fit=crop'],
    amenities: ['Breakfast', 'City View', 'WiFi', 'Restaurants'],
    isFeatured: true,
    rooms: [
      {
        id: 'r2',
        type: 'Deluxe City View',
        description: 'Spacious and modern with premium bedding.',
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop'
        ],
        amenities: ['AC', 'WiFi', 'Shower'],
        purchasePricePerNight: 150000,
        agentPricePerNight: 180000,
        customerPricePerNight: 222800,
        capacity: 2
      }
    ]
  },
  {
    id: 'h3',
    name: 'Dar Al-Hijra InterContinental Madinah',
    city: 'Madina',
    address: 'Central Northern Area, Madinah, Saudi Arabia',
    stars: 5,
    distanceToHaram: 300,
    description: 'Overlooking the Prophet\'s Mosque, this hotel is a favorite among pilgrims for its prime location and traditional hospitality.',
    images: ['https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=800&auto=format&fit=crop'],
    amenities: ['Prophet\'s Mosque View', 'Executive Lounge', 'WiFi'],
    isFeatured: true,
    rooms: [
      {
        id: 'r3',
        type: 'Superior Twin Room',
        description: 'Classic comfort in the heart of the city.',
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800&auto=format&fit=crop'
        ],
        amenities: ['AC', 'WiFi', 'Mini Bar'],
        purchasePricePerNight: 140000,
        agentPricePerNight: 170000,
        customerPricePerNight: 208900,
        capacity: 2
      }
    ]
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  name: 'UmrahStay',
  logo: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><rect width='200' height='200' rx='30' fill='%23005B5C'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='90' font-family='Poppins, sans-serif' font-weight='900' fill='%23ffffff'>US</text></svg>`,
  bannerImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1920&auto=format&fit=crop',
  announcement: 'Welcome to UmrahStay - Your Partner for Sacred Journeys',
  contactEmail: 'support@umrahstay.com',
  contactPhone: '+92 300 1234567',
  contactAddress: 'Authorized Logistics Desk, King Abdulaziz Road, Makkah, KSA',
  facebookUrl: 'https://facebook.com/umrahstay',
  instagramUrl: 'https://instagram.com/umrahstay',
  whatsappNumber: '+923001234567',
  twitterUrl: 'https://twitter.com/umrahstay',
  cancellationFee: 10,
  dateChangeFee: 5
};