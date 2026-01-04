
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card } from '../components/UI';

const HomePage: React.FC = () => {
  const { siteSettings, hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();
  
  const [searchData, setSearchData] = useState({ city: 'Makkah', checkIn: '2026-04-01', checkOut: '2026-05-01' });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Comprehensive state to lock search criteria for results
  const [appliedSearch, setAppliedSearch] = useState({ 
    city: 'Makkah', 
    minStars: 0,
    maxDistance: 3000,
    maxPrice: 1000000,
    sortBy: 'price-asc'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShowResults(false);
    
    // Simulate API delay and commit the search
    setTimeout(() => {
      setAppliedSearch({ 
        city: searchData.city, 
        minStars: 0,
        maxDistance: 3000,
        maxPrice: 1000000,
        sortBy: 'price-asc'
      });
      setIsSearching(false);
      setShowResults(true);
      setTimeout(() => {
        const resultsEl = document.getElementById('search-results-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1200);
  };

  const filteredHotels = useMemo(() => {
    let result = hotels.filter(h => {
      const matchesCity = appliedSearch.city === 'All' || h.city === appliedSearch.city;
      const matchesStars = appliedSearch.minStars === 0 || h.stars === appliedSearch.minStars;
      const matchesDistance = h.distanceToHaram <= appliedSearch.maxDistance;
      const matchesPrice = h.rooms.some(r => r.customerPricePerNight <= appliedSearch.maxPrice);
      return matchesCity && matchesStars && matchesDistance && matchesPrice;
    });

    if (appliedSearch.sortBy === 'price-asc') {
      result.sort((a, b) => (a.rooms[0]?.customerPricePerNight || 0) - (b.rooms[0]?.customerPricePerNight || 0));
    } else if (appliedSearch.sortBy === 'price-desc') {
      result.sort((a, b) => (b.rooms[0]?.customerPricePerNight || 0) - (a.rooms[0]?.customerPricePerNight || 0));
    } else if (appliedSearch.sortBy === 'distance-asc') {
      result.sort((a, b) => a.distanceToHaram - b.distanceToHaram);
    }

    return result;
  }, [hotels, appliedSearch]);

  const featuredHotels = hotels.slice(0, 3);

  const handleReset = () => {
    setAppliedSearch({
      city: 'All',
      minStars: 0,
      maxDistance: 3000,
      maxPrice: 1000000,
      sortBy: 'price-asc'
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[550px] flex items-center justify-center text-center text-white pt-20 pb-28 overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${siteSettings.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-[#005B5C]/10 backdrop-blur-[1px]"></div>
        <div className="container mx-auto px-6 z-10">
          <div className="animate-fade-up duration-1000 mb-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight drop-shadow-2xl">
              Sacred Journey,<br/>
              <span className="text-secondary">Divine Comfort</span>
            </h1>
            <p className="text-sm md:text-lg max-w-xl mx-auto opacity-90 font-medium italic uppercase tracking-widest">
              "Providing elite sanctuary inventory in the Holy Cities."
            </p>
          </div>
          
          {/* SEARCH ENGINE COMPONENT */}
          <div className="max-w-5xl mx-auto transform animate-fade-up stagger-1 opacity-0 fill-mode-forwards">
            <div className="bg-white p-4 md:p-6 rounded-none shadow-2xl border border-gray-100">
              <form onSubmit={handleSearch} className="flex flex-col">
                <div className="flex justify-end mb-3 pr-1">
                  <Link to="/track" className="text-[12px] md:text-sm font-bold text-[#006D77] hover:underline flex items-center gap-1">
                    Manage Booking
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="text-left">
                    <label className="block text-[11px] md:text-xs text-gray-500 font-bold mb-1.5 ml-1">City</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>
                      <select 
                        className="w-full bg-white border border-gray-200 p-3 pl-10 pr-10 rounded-none text-gray-700 font-bold text-sm outline-none appearance-none cursor-pointer focus:border-[#006D77]/50 transition-all"
                        value={searchData.city}
                        onChange={(e) => setSearchData({...searchData, city: e.target.value})}
                      >
                        <option value="Makkah">Makkah</option>
                        <option value="Madina">Madina</option>
                      </select>
                      <div className="absolute right-3.5 text-gray-400 pointer-events-none text-[8px]">▼</div>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] md:text-xs text-gray-500 font-bold mb-1.5 ml-1">Check-in</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full bg-white border border-gray-200 p-3 px-4 rounded-none text-gray-700 font-bold text-sm outline-none cursor-pointer focus:border-[#006D77]/50 transition-all" 
                        value={searchData.checkIn}
                        onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                        required 
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#006D77]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-[11px] md:text-xs text-gray-500 font-bold mb-1.5 ml-1">Check-out</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full bg-white border border-gray-200 p-3 px-4 rounded-none text-gray-700 font-bold text-sm outline-none cursor-pointer focus:border-[#006D77]/50 transition-all" 
                        value={searchData.checkOut}
                        onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                        required 
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#006D77]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#E29578] hover:bg-[#d88465] text-white p-3.5 rounded-none font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <span>Search Hotels</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Area */}
      <div className="bg-[#f2f4f5] relative py-16">
        <div id="search-results-anchor" className="absolute -top-24"></div>
        
        <div className="container mx-auto px-4">
          {showResults ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Full Refine Search Sidebar */}
              <aside className="w-full lg:w-80 shrink-0">
                <Card className="p-6 sticky top-28 bg-white border border-gray-100 shadow-sm !rounded-none">
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
                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-none text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50"
                        value={appliedSearch.city}
                        onChange={(e) => setAppliedSearch({...appliedSearch, city: e.target.value})}
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
                              onClick={() => setAppliedSearch({...appliedSearch, minStars: star})}
                              className={`py-2 rounded-none text-[10px] font-black border transition-all ${appliedSearch.minStars === star ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#006D77]'}`}
                           >
                             {star}★
                           </button>
                         ))}
                         <button 
                            onClick={() => setAppliedSearch({...appliedSearch, minStars: 0})}
                            className={`py-2 rounded-none text-[10px] font-black border transition-all ${appliedSearch.minStars === 0 ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100'}`}
                         >
                           ALL
                         </button>
                      </div>
                    </div>

                    {/* Distance Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance to Haram</label>
                        <span className="text-[10px] font-black text-primary uppercase">{appliedSearch.maxDistance}m</span>
                      </div>
                      <input 
                        type="range" min="100" max="3000" step="100"
                        value={appliedSearch.maxDistance}
                        onChange={(e) => setAppliedSearch({...appliedSearch, maxDistance: Number(e.target.value)})}
                        className="w-full h-1 bg-gray-100 rounded-none appearance-none cursor-pointer accent-[#006D77]"
                      />
                    </div>

                    {/* Price Range Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Price</label>
                        <span className="text-[10px] font-black text-primary uppercase">{formatPrice(appliedSearch.maxPrice)}</span>
                      </div>
                      <input 
                        type="range" min="10000" max="1000000" step="10000"
                        value={appliedSearch.maxPrice}
                        onChange={(e) => setAppliedSearch({...appliedSearch, maxPrice: Number(e.target.value)})}
                        className="w-full h-1 bg-gray-100 rounded-none appearance-none cursor-pointer accent-[#006D77]"
                      />
                    </div>

                    {/* Sorting Filter */}
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sort Results By</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-none text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50"
                        value={appliedSearch.sortBy}
                        onChange={(e) => setAppliedSearch({...appliedSearch, sortBy: e.target.value})}
                      >
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="distance-asc">Proximity to Haram</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </aside>

              <div className="flex-1">
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-[#006D77] tracking-tight uppercase">Search Results</h2>
                  <p className="text-gray-400 font-black text-[10px] mt-1 uppercase tracking-widest">{filteredHotels.length} Sanctuary properties available</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                  ))}
                </div>
                {filteredHotels.length === 0 && (
                  <div className="py-20 text-center bg-white border border-gray-100 shadow-sm !rounded-none">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">No hotels found in this criteria.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#343A40] tracking-tighter uppercase mb-2">Sacred Collection</h2>
                <div className="h-1 w-12 bg-[#006D77] mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredHotels.map((hotel, index) => (
                  <div key={hotel.id} className={`animate-fade-up stagger-${index + 1} opacity-0 fill-mode-forwards`}>
                    <HotelCard hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>
    </div>
  );
};

export const HotelCard = ({ hotel, formatPrice, navigate }: any) => (
  <Card 
    className="bg-white overflow-hidden border border-gray-100 flex flex-col h-full transition-shadow duration-300 group cursor-pointer shadow-md !rounded-none" 
    onClick={() => navigate(`/hotel/${hotel.id}`)}
  >
    {/* Image Container - Strictly 0px rounded corners */}
    <div className="relative h-56 overflow-hidden shrink-0 !rounded-none">
      <img 
        src={hotel.images[0] || 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=60&w=800'} 
        alt={hotel.name} 
        className="w-full h-full object-cover transition-transform duration-700 !rounded-none" 
      />
      {/* 5-Star Badge - Matching Salmon color with sharp edges */}
      <div className="absolute top-0 right-0 bg-[#E29578] text-white px-3 py-1 text-[11px] font-bold !rounded-none">
        {hotel.stars}-Star
      </div>
    </div>

    {/* Content Container */}
    <div className="p-6 flex-1 flex flex-col !rounded-none">
      {/* Title & Stars Header */}
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

      {/* Location with Pin */}
      <div className="flex items-center text-[12px] text-gray-500 mb-5 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>{hotel.city} - {hotel.distanceToHaram}m from Haram</span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-[13px] mb-8 line-clamp-3 leading-relaxed font-normal opacity-90 flex-1">
        {hotel.description}
      </p>
      
      {/* Footer - Price on Left, Button on Right */}
      <div className="pt-5 border-t border-gray-50 flex justify-between items-end !rounded-none">
        <div>
          <span className="text-[11px] text-gray-400 block font-medium mb-1">Starts from</span>
          <div className="text-[#006D77] font-bold whitespace-nowrap">
            <span className="text-[18px]">{formatPrice(hotel.rooms[0]?.customerPricePerNight || 0)}</span>
            <span className="text-[13px] text-gray-500 font-medium lowercase">/night</span>
          </div>
        </div>
        <button 
          className="bg-[#006D77] hover:bg-[#005c65] text-white px-6 py-2.5 !rounded-none font-bold text-[13px] transition-all shadow-sm active:scale-95"
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

export default HomePage;
