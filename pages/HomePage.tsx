import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, Card, HotelCard } from '../components/UI';

const HomePage: React.FC = () => {
  const { siteSettings, hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    city: 'Makkah',
    checkIn: '2026-04-01',
    checkOut: '2026-05-01',
    minStars: 0,
    maxDistance: 3000,
    maxPrice: 1000000,
    sortBy: 'price-asc',
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchInitiated(false);
    
    setTimeout(() => {
      setIsSearching(false);
      setSearchInitiated(true);
      setTimeout(() => {
        document.getElementById('search-results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 1200);
  };

  const filteredHotels = useMemo(() => {
    if (!searchInitiated) return [];
    
    let result = hotels.filter(h => {
      const matchesCity = filters.city === 'All' || h.city === filters.city;
      const matchesStars = filters.minStars === 0 || h.stars >= filters.minStars;
      const matchesDistance = h.distanceToHaram <= filters.maxDistance;
      const matchesPrice = h.rooms.some(r => r.customerPricePerNight <= filters.maxPrice);
      return matchesCity && matchesStars && matchesDistance && matchesPrice;
    });

    switch(filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.rooms[0]?.customerPricePerNight || 0) - (b.rooms[0]?.customerPricePerNight || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.rooms[0]?.customerPricePerNight || 0) - (a.rooms[0]?.customerPricePerNight || 0));
        break;
      case 'distance-asc':
         result.sort((a, b) => a.distanceToHaram - b.distanceToHaram);
        break;
    }

    return result;
  }, [hotels, filters, searchInitiated]);

  const latestHotels = hotels.slice(0, 6);

  const handleReset = () => {
    setFilters(prev => ({
      ...prev,
      city: 'All',
      minStars: 0,
      maxDistance: 3000,
      maxPrice: 1000000,
      sortBy: 'price-asc'
    }));
  };

  const searchLabelClasses = "block text-sm font-semibold text-gray-800 mb-2";
  const searchInputBaseClasses = "w-full bg-white border border-gray-300 p-4 rounded-xl font-medium text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#006D77] transition";

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
          
          <div className="max-w-4xl mx-auto animate-fade-up stagger-1" style={{animationFillMode: 'forwards'}}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <form onSubmit={handleSearch} className="flex flex-col">
                <div className="flex justify-end mb-4">
                  <Link to="/track" className="text-sm font-bold text-[#006D77] hover:underline">
                    Manage Booking
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                  <div className="text-left">
                    <label className={searchLabelClasses}>City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      </div>
                      <select 
                        className={`${searchInputBaseClasses} pl-11`}
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                      >
                        <option value="Makkah">Makkah</option>
                        <option value="Madina">Madina</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className={searchLabelClasses}>Check-in</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className={`${searchInputBaseClasses} pr-11`}
                        value={filters.checkIn}
                        onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                        required 
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className={searchLabelClasses}>Check-out</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className={`${searchInputBaseClasses} pr-11`}
                        value={filters.checkOut}
                        onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                        required 
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#E29578] hover:bg-opacity-90 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.99]"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          {searchInitiated ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Full Refine Search Sidebar */}
              <aside className="w-full lg:w-80 shrink-0">
                <Card className="p-6 sticky top-28 bg-white border border-gray-100 shadow-sm rounded-2xl">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                     <h3 className="font-black text-xs text-[#006D77] uppercase tracking-widest">Refine Search</h3>
                     <button className="text-[10px] font-black text-secondary uppercase hover:underline tracking-widest" onClick={handleReset}>Reset All</button>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location</label>
                      <select className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
                        <option value="All">All Holy Cities</option>
                        <option value="Makkah">Makkah Al-Mukarramah</option>
                        <option value="Madina">Al-Madinah Al-Munawwarah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Star Rating</label>
                      <div className="grid grid-cols-4 gap-2">
                         {[5, 4, 3].map(star => (
                           <button key={star} onClick={() => handleFilterChange('minStars', star)} className={`py-2 rounded-lg text-[10px] font-black border transition-all ${filters.minStars === star ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#006D77]'}`}>
                             {star}★+
                           </button>
                         ))}
                         <button onClick={() => handleFilterChange('minStars', 0)} className={`py-2 rounded-lg text-[10px] font-black border transition-all ${filters.minStars === 0 ? 'bg-[#006D77] text-white border-[#006D77]' : 'bg-white text-gray-400 border-gray-100'}`}>
                           ALL
                         </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</label>
                        <span className="text-[10px] font-black text-primary uppercase">{filters.maxDistance}m</span>
                      </div>
                      <input type="range" min="100" max="3000" step="100" value={filters.maxDistance} onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#006D77]" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Price</label>
                        <span className="text-[10px] font-black text-primary uppercase">{formatPrice(filters.maxPrice)}</span>
                      </div>
                      <input type="range" min="10000" max="1000000" step="10000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))} className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#006D77]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sort By</label>
                      <select className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs font-bold text-neutralDark outline-none focus:border-[#006D77]/50" value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
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
                  <p className="text-gray-400 font-black text-[10px] mt-1 uppercase tracking-widest">{filteredHotels.length} properties found</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                  ))}
                </div>
                {filteredHotels.length === 0 && (
                  <div className="py-20 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm italic">No hotels found for this criteria.</p>
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
                {latestHotels.map((hotel, index) => (
                  <div key={hotel.id} className={`animate-fade-up stagger-${index + 1}`}>
                    <HotelCard hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-8">
                  <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => navigate('/search')}
                      className="shadow-xl px-12"
                  >
                      View More Hotels
                  </Button>
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

export default HomePage;