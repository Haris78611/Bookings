import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
// Fix: Corrected the import path for HotelCard. It should be imported from '../components/UI'.
import { LoadingSpinner, Card, Input, Select, HotelCard } from '../components/UI';

const SearchPage: React.FC = () => {
  const { hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  
  // Comprehensive filter state
  const [filters, setFilters] = useState({
    city: 'All',
    minStars: 0,
    maxDistance: 3000,
    maxPrice: 1000000,
    sortBy: 'price-asc'
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredHotels = useMemo(() => {
    let result = hotels.filter(h => {
      const matchesCity = filters.city === 'All' || h.city === filters.city;
      const matchesStars = filters.minStars === 0 || h.stars === filters.minStars;
      const matchesDistance = h.distanceToHaram <= filters.maxDistance;
      const matchesPrice = h.rooms.some(r => r.customerPricePerNight <= filters.maxPrice);
      return matchesCity && matchesStars && matchesDistance && matchesPrice;
    });

    if (filters.sortBy === 'price-asc') {
      result.sort((a, b) => (a.rooms[0]?.customerPricePerNight || 0) - (b.rooms[0]?.customerPricePerNight || 0));
    } else if (filters.sortBy === 'price-desc') {
      result.sort((a, b) => (b.rooms[0]?.customerPricePerNight || 0) - (a.rooms[0]?.customerPricePerNight || 0));
    }

    return result;
  }, [hotels, filters]);

  const handleReset = () => {
    setFilters({
      city: 'All',
      minStars: 0,
      maxDistance: 3000,
      maxPrice: 1000000,
      sortBy: 'price-asc'
    });
  };

  if (isLoading) return <div className="min-h-screen bg-[#f2f4f5]"><LoadingSpinner /></div>;

  return (
    <div className="bg-[#f2f4f5] min-h-screen py-16">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Refine Search Sidebar - All Functions Restored */}
        <div className="w-full lg:w-80 shrink-0">
          <Card className="p-6 sticky top-28 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
               <h3 className="font-black text-xs text-[#006D77] uppercase tracking-widest">Refine Search</h3>
               <button 
                  className="text-[10px] font-black text-secondary uppercase hover:underline tracking-widest"
                  onClick={handleReset}
               >
                 Reset All
               </button>
            </div>
            
            <div className="space-y-8">
              {/* City Filter */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                >
                  <option value="All">All Holy Cities</option>
                  <option value="Makkah">Makkah Al-Mukarramah</option>
                  <option value="Madina">Al-Madinah Al-Munawwarah</option>
                </select>
              </div>

              {/* Star Rating Filter */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Star Rating</label>
                <div className="grid grid-cols-4 gap-2">
                   {[5, 4, 3].map(star => (
                     <button 
                        key={star}
                        onClick={() => setFilters({...filters, minStars: star})}
                        className={`py-2 rounded-lg text-[10px] font-black border transition-all ${filters.minStars === star ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#006D77]'}`}
                     >
                       {star}★
                     </button>
                   ))}
                   <button 
                      onClick={() => setFilters({...filters, minStars: 0})}
                      className={`py-2 rounded-lg text-[10px] font-black border transition-all ${filters.minStars === 0 ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100'}`}
                   >
                     ALL
                   </button>
                </div>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance to Haram</label>
                  <span className="text-[10px] font-black text-primary uppercase">{filters.maxDistance}m</span>
                </div>
                <input 
                  type="range" min="100" max="3000" step="100"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({...filters, maxDistance: Number(e.target.value)})}
                  className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#006D77]"
                />
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Price</label>
                  <span className="text-[10px] font-black text-primary uppercase">{formatPrice(filters.maxPrice)}</span>
                </div>
                <input 
                  type="range" min="10000" max="1000000" step="10000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                  className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#006D77]"
                />
              </div>

              {/* Sorting Filter */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sort Results By</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="distance-asc">Proximity to Haram</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Content Area */}
        <div className="flex-1">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#006D77] tracking-tight uppercase">Registry Hotels</h1>
            <p className="text-gray-400 font-black text-[10px] mt-1 uppercase tracking-widest">{filteredHotels.length} Sanctuary properties available</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
            ))}
            {filteredHotels.length === 0 && (
               <div className="col-span-full py-32 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="text-5xl mb-6 opacity-20">🏨</div>
                  <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs italic">No matching sanctuary inventory found.</p>
                  <button onClick={handleReset} className="mt-6 text-[10px] font-black text-[#006D77] uppercase tracking-widest underline decoration-2 underline-offset-4">Clear All Filters</button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;