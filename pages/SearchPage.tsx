
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, StarRating, Badge, LoadingSpinner } from '../components/UI';

const SearchPage: React.FC = () => {
  const { hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: 'All',
    priceRange: 500000,
    distanceRange: 2000,
    minStars: 0,
    sortBy: 'price-asc'
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredHotels = useMemo(() => {
    let result = hotels.filter(h => {
      const matchesCity = filters.city === 'All' || h.city === filters.city;
      const matchesPrice = h.rooms.some(r => r.customerPricePerNight <= filters.priceRange);
      const matchesStars = h.stars >= filters.minStars;
      const matchesDistance = h.distanceToHaram <= filters.distanceRange;
      return matchesCity && matchesPrice && matchesStars && matchesDistance;
    });

    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => (a.rooms[0]?.customerPricePerNight || 0) - (b.rooms[0]?.customerPricePerNight || 0));
    } else if (filters.sortBy === 'price-desc') {
      result.sort((a, b) => (b.rooms[0]?.customerPricePerNight || 0) - (a.rooms[0]?.customerPricePerNight || 0));
    }

    return result;
  }, [hotels, filters]);

  if (isLoading) return <div className="min-h-screen bg-[#F8F9FA]"><LoadingSpinner /></div>;

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-16">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12">
        
        {/* Sidebar Filter Card - Restored Styling with Enhancements */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border-2 border-primary/5 sticky top-28 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
            
            <h3 className="font-black text-xl text-[#006D77] mb-8 uppercase text-xs tracking-[0.2em] relative">Refine Catalog</h3>
            
            <div className="space-y-10 relative">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Target Region</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-700 outline-none shadow-inner"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                >
                  <option value="All">All Regions</option>
                  <option value="Makkah">Makkah</option>
                  <option value="Madina">Madina</option>
                </select>
              </div>

              <div>
                <label className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Price Ceiling <span>{formatPrice(filters.priceRange)}</span>
                </label>
                <input 
                  type="range" min="0" max="1000000" step="10000"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="mt-3 flex justify-between text-[9px] font-black text-[#006D77] opacity-60">
                  <span>PKR 0</span>
                  <span>1M+</span>
                </div>
              </div>

              <div>
                <label className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Distance: <span>{filters.distanceRange}m</span>
                </label>
                <input 
                  type="range" min="0" max="3000" step="100"
                  value={filters.distanceRange}
                  onChange={(e) => setFilters({...filters, distanceRange: Number(e.target.value)})}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="mt-3 flex justify-between text-[9px] font-black text-[#006D77] opacity-60">
                  <span>Direct</span>
                  <span>3km</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Min Stars</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setFilters({...filters, minStars: s})}
                      className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${filters.minStars === s ? 'bg-[#006D77] text-white border-[#006D77] shadow-lg shadow-[#006D77]/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20'}`}
                    >
                      {s}★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Display Logic</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-gray-700 outline-none shadow-inner"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <Button 
              variant="outline" fullWidth className="mt-12 rounded-xl py-3 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5"
              onClick={() => setFilters({ city: 'All', priceRange: 500000, distanceRange: 2000, minStars: 0, sortBy: 'price-asc' })}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-[#006D77] tracking-tight">Hotel Directory</h1>
              <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">{filteredHotels.length} Verified Properties Found</p>
            </div>
            <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Inventory</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredHotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-50 flex flex-col hover:shadow-2xl transition duration-500 group">
                <div className="relative h-64 overflow-hidden">
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute top-4 right-4"><Badge variant="star">{hotel.stars}-Star</Badge></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black text-primary uppercase tracking-widest shadow-sm">
                      {hotel.distanceToHaram}m to Haram
                    </div>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#006D77] leading-tight mb-2 group-hover:text-secondary transition">{hotel.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                    <span className="mr-2 text-[#E29578]">📍</span>
                    <span>{hotel.city} Sanctuary</span>
                  </div>
                  <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Starts from</span>
                      <span className="text-2xl font-black text-[#006D77]">{formatPrice(hotel.rooms[0]?.customerPricePerNight || 0)}</span>
                    </div>
                    <Button variant="teal" className="rounded-xl px-10 h-12 shadow-lg shadow-primary/10" onClick={() => navigate(`/hotel/${hotel.id}`)}>Details</Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredHotels.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="text-8xl mb-6">🕋</div>
                <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">No properties match your refined search</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
