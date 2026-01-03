
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Button, StarRating, Badge, LoadingSpinner } from '../components/UI';

const HomePage: React.FC = () => {
  const { siteSettings, hotels, formatPrice } = useAppContext();
  const navigate = useNavigate();
  
  const [searchData, setSearchData] = useState({ city: 'Makkah', checkIn: '', checkOut: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [filters, setFilters] = useState({
    priceRange: 500000,
    distanceRange: 2000,
    minStars: 0,
    sortBy: 'price-asc'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setShowResults(false);
    
    // Simulate high-speed processing
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      // Scroll to results
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 1200);
  };

  const dateOptions = useMemo(() => {
    const dates = [];
    const baseDate = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dates.push({
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return dates;
  }, []);

  const filteredHotels = useMemo(() => {
    let result = hotels.filter(h => {
      const matchesCity = searchData.city === 'All' || h.city === searchData.city;
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
  }, [hotels, searchData.city, filters]);

  const featuredHotels = hotels.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center text-center text-white pt-24 pb-32 overflow-hidden"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${siteSettings.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="container mx-auto px-4 z-10">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 mb-12">
            <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">Sacred Journey,<br/>Guaranteed Comfort</h1>
            <p className="text-lg md:text-2xl max-w-2xl mx-auto opacity-90 font-light">Experience luxury within footsteps of the Haram with UmrahStay's verified hotel network.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-1">
              <div className="flex-1 w-full border-r border-gray-100 px-4 py-2">
                <label className="block text-[10px] text-gray-400 font-bold uppercase text-left pl-2">Destination</label>
                <select 
                  className="w-full bg-transparent p-2 text-gray-800 font-semibold outline-none appearance-none cursor-pointer"
                  value={searchData.city}
                  onChange={(e) => setSearchData({...searchData, city: e.target.value})}
                >
                  <option value="Makkah">Makkah Al-Mukarramah</option>
                  <option value="Madina">Madinah Al-Munawwarah</option>
                </select>
              </div>
              <div className="flex-1 w-full border-r border-gray-100 px-4 py-2 relative">
                <label className="block text-[10px] text-gray-400 font-bold uppercase text-left pl-2">Check-in</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent p-2 text-gray-800 font-semibold outline-none cursor-pointer" 
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
                  required 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006D77] pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </span>
              </div>
              <div className="flex-1 w-full border-r border-gray-100 px-4 py-2 relative">
                <label className="block text-[10px] text-gray-400 font-bold uppercase text-left pl-2">Check-out</label>
                <input 
                  type="date" 
                  className="w-full bg-transparent p-2 text-gray-800 font-semibold outline-none cursor-pointer" 
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
                  required 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006D77] pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </span>
              </div>
              <div className="w-full md:w-auto p-1">
                <Button 
                  type="submit" 
                  variant="teal" 
                  className="h-[60px] w-full md:w-auto px-10 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-80"
                  disabled={isSearching}
                >
                  {isSearching ? 'Processing...' : 'Search Hotels'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Dynamic Results or Featured Content */}
      <div className="bg-gray-50 min-h-[400px]">
        {isSearching ? (
          <LoadingSpinner />
        ) : showResults ? (
          <section className="py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-[#006D77] mb-8">Search Results in {searchData.city}</h2>
              
              {/* 30 Day Date Scroller */}
              <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-3 min-w-max">
                  {dateOptions.map((d) => (
                    <button 
                      key={d.full}
                      onClick={() => setSelectedDate(d.full)}
                      className={`flex flex-col items-center justify-center min-w-[85px] h-[110px] rounded-xl border transition-all duration-300 shadow-sm ${
                        selectedDate === d.full 
                        ? 'bg-[#006D77] border-[#006D77] text-white' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-[#006D77]/30'
                      }`}
                    >
                      <span className="text-xs font-bold mb-2">{d.day}</span>
                      <span className="text-3xl font-black mb-1">{d.date}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Refine Catalog Filters - High Fidelity Styling */}
              <div className="bg-white p-10 rounded-3xl shadow-xl shadow-[#006D77]/5 border-2 border-[#006D77]/10 flex flex-wrap items-end gap-10 mb-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition duration-1000">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </div>
                
                <div className="flex-1 min-w-[240px]">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary font-black italic">PKR</span>
                    Price Ceiling: <span className="text-primary">{formatPrice(filters.priceRange)}</span>
                  </label>
                  <input 
                    type="range" min="0" max="1000000" step="5000"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({...filters, priceRange: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase">
                    <span>Free</span>
                    <span>1M+</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[240px]">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    <span className="text-sm">🕋</span>
                    Distance from Haram: <span className="text-primary">{filters.distanceRange}m</span>
                  </label>
                  <input 
                    type="range" min="0" max="3000" step="100"
                    value={filters.distanceRange}
                    onChange={(e) => setFilters({...filters, distanceRange: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase">
                    <span>Direct</span>
                    <span>3km+</span>
                  </div>
                </div>

                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Minimum Quality</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setFilters({...filters, minStars: s})}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-black transition-all duration-300 ${filters.minStars === s ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/20'}`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Sort Strategy</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-xl p-3 text-xs font-black text-neutralDark outline-none appearance-none cursor-pointer hover:border-primary/10 transition shadow-inner"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] opacity-30">▼</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                ))}
                {filteredHotels.length === 0 && (
                  <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="text-6xl mb-6 grayscale">🏨</div>
                    <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No sanctuary matches found for these parameters.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="mb-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">Top Rated Sanctuary Stays</h2>
                <div className="h-1 w-20 bg-[#006D77] mx-auto rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredHotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} formatPrice={formatPrice} navigate={navigate} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const HotelCard = ({ hotel, formatPrice, navigate }: any) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:shadow-2xl transition duration-500 group">
    <div className="relative h-64 overflow-hidden">
      <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
      <div className="absolute top-4 right-4"><Badge variant="star">{hotel.stars}-Star</Badge></div>
    </div>
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4 gap-2">
        <h3 className="text-xl font-bold text-[#006D77] leading-tight">{hotel.name}</h3>
        <div className="shrink-0"><StarRating count={hotel.stars} /></div>
      </div>
      <div className="flex items-center text-sm text-gray-500 mb-4 font-medium">
        <span className="mr-2 text-[#E29578]">📍</span>
        <span>{hotel.city} - {hotel.distanceToHaram}m from Haram</span>
      </div>
      <p className="text-gray-600 text-sm mb-8 line-clamp-3 leading-relaxed opacity-70 font-light">{hotel.description}</p>
      <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
        <div>
          <span className="text-[11px] text-gray-400 block font-bold uppercase tracking-widest mb-1">Starts from</span>
          <span className="text-2xl font-black text-[#006D77]">{formatPrice(hotel.rooms[0]?.customerPricePerNight || 0)}</span>
          <span className="text-xs text-gray-400 font-medium">/night</span>
        </div>
        <Button variant="teal" size="md" className="rounded-lg px-8 font-semibold" onClick={() => navigate(`/hotel/${hotel.id}`)}>Details</Button>
      </div>
    </div>
  </div>
);

export default HomePage;
