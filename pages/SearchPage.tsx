
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, LoadingSpinner, Card } from '../components/UI';

const SearchPage: React.FC = () => {
  const { hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    minStars: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredHotels = useMemo(() => {
    return hotels.filter(h => {
      const matchesStars = filters.minStars === 0 || h.stars === filters.minStars;
      return matchesStars;
    });
  }, [hotels, filters]);

  if (isLoading) return <div className="min-h-screen bg-[#f2f4f5]"><LoadingSpinner /></div>;

  return (
    <div className="bg-[#f2f4f5] min-h-screen py-16">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Simplified Sidebar - ONLY Star Rating filter as requested */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-28">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-3">
               <h3 className="font-bold text-sm text-[#006D77] uppercase tracking-wider">Refine Search</h3>
               <button 
                  className="text-[10px] font-black text-secondary uppercase hover:underline"
                  onClick={() => setFilters({ minStars: 0 })}
               >
                 Reset
               </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Star Rating
                </label>
                <div className="flex flex-col gap-2">
                   {[5, 4, 3].map(star => (
                     <button 
                        key={star}
                        onClick={() => setFilters({ minStars: star })}
                        className={`w-full py-2.5 px-4 rounded-lg text-[11px] font-bold transition-all border flex justify-between items-center ${filters.minStars === star ? 'bg-[#006D77] text-white border-[#006D77] shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-[#006D77]/40'}`}
                     >
                       <span>{star} Star Hotels</span>
                       <span className={filters.minStars === star ? 'text-white' : 'text-yellow-400'}>{'★'.repeat(star)}</span>
                     </button>
                   ))}
                   <button 
                      onClick={() => setFilters({ minStars: 0 })}
                      className={`w-full py-2.5 px-4 rounded-lg text-[11px] font-bold transition-all border ${filters.minStars === 0 ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100'}`}
                   >
                     All Properties
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#006D77] tracking-tight uppercase">Hotels</h1>
            <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{filteredHotels.length} Properties matched</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
            ))}
            {filteredHotels.length === 0 && (
               <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No results match your criteria.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HotelCard = ({ hotel, formatPrice, navigate }: any) => (
  <Card 
    className="bg-white overflow-hidden border border-gray-100 flex flex-col h-full transition-shadow duration-300 group cursor-pointer shadow-md rounded-xl" 
    onClick={() => navigate(`/hotel/${hotel.id}`)}
  >
    <div className="relative h-56 overflow-hidden shrink-0">
      <img 
        src={hotel.images[0] || 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=60&w=800'} 
        alt={hotel.name} 
        className="w-full h-full object-cover transition-transform duration-700" 
      />
      <div className="absolute top-0 right-0 bg-[#E29578] text-white px-3 py-1 text-[11px] font-bold rounded-bl-lg">
        {hotel.stars}-Star
      </div>
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[17px] font-bold text-[#006D77] tracking-tight leading-tight flex-1">
          {hotel.name}
        </h3>
        <div className="flex gap-0.5 ml-3 shrink-0">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-sm ${i < hotel.stars ? 'text-[#FFCC00]' : 'text-gray-200'}`}>★</span>
          ))}
        </div>
      </div>

      <div className="flex items-center text-[12px] text-gray-500 mb-5 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>{hotel.city} - {hotel.distanceToHaram}m from Haram</span>
      </div>

      <p className="text-gray-500 text-[13px] mb-8 line-clamp-3 leading-relaxed font-normal opacity-90 flex-1">
        {hotel.description}
      </p>
      
      <div className="pt-5 border-t border-gray-50 flex justify-between items-end">
        <div>
          <span className="text-[11px] text-gray-400 block font-medium mb-1">Starts from</span>
          <div className="text-[#006D77] font-bold whitespace-nowrap">
            <span className="text-[18px]">{formatPrice(hotel.rooms[0]?.customerPricePerNight || 0)}</span>
            <span className="text-[13px] text-gray-500 font-medium lowercase">/night</span>
          </div>
        </div>
        <button 
          className="bg-[#006D77] hover:bg-[#005c65] text-white px-6 py-2.5 rounded-lg font-bold text-[13px] transition-all shadow-sm active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/hotel/${hotel.id}`);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  </Card>
);

export default SearchPage;
