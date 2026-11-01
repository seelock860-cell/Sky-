import React, { useState } from 'react';
import { Search, MapPin, Home, Banknote, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (filters: { location?: string; category?: string; priceRange?: string }) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: location !== 'All' ? location : undefined,
      category: category !== 'All' ? category : undefined,
      priceRange: priceRange !== 'All' ? priceRange : undefined,
    });
  };

  return (
    <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg"
          alt="Luxury Nigerian contemporary mansion"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Dark Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061413]/95 via-[#061413]/85 to-[#061413]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061413] via-transparent to-[#061413]/50" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center flex flex-col items-center">
        {/* Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#071C1A]/80 border border-[#E8AA35]/30 text-[#E8AA35] text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prime Nigerian Real Estate</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight max-w-4xl leading-[1.15] mb-6 drop-shadow-md">
          Find Your <span className="text-[#E8AA35]">Dream Property</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-10 drop-shadow">
          Discover the best houses and properties for sale in Nigeria. We help you find the perfect home, in the right location, at the right price.
        </p>

        {/* Property Search Form */}
        <div className="w-full max-w-4xl bg-[#071C1A]/95 backdrop-blur-xl border border-[#143330] p-4 sm:p-5 rounded-2xl shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Location Selector */}
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8AA35]" />
                <span>Select Location</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-3.5 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none transition-colors"
              >
                <option value="All">All Locations in Nigeria</option>
                <option value="Banana Island">Banana Island, Lagos</option>
                <option value="Ikoyi">Old Ikoyi, Lagos</option>
                <option value="Victoria Island">Victoria Island, Lagos</option>
                <option value="Lekki Phase 1">Lekki Phase 1, Lagos</option>
                <option value="Maitama">Maitama, Abuja</option>
                <option value="Asokoro">Asokoro, Abuja</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#E8AA35]" />
                <span>Property Type</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-3.5 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none transition-colors"
              >
                <option value="All">All Categories</option>
                <option value="Houses">Houses</option>
                <option value="Apartments">Apartments</option>
                <option value="Duplexes">Duplexes</option>
                <option value="Residential properties">Residential Properties</option>
                <option value="Land">Land & Plots</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold tracking-wide uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#E8AA35]" />
                <span>Price Range</span>
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg px-3.5 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none transition-colors"
              >
                <option value="All">Any Price</option>
                <option value="under-500m">Under ₦500 Million</option>
                <option value="500m-1b">₦500M - ₦1.0 Billion</option>
                <option value="1b-2.5b">₦1.0B - ₦2.5 Billion</option>
                <option value="above-2.5b">Above ₦2.5 Billion</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex flex-col justify-end pt-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-semibold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#E8AA35]/20 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
