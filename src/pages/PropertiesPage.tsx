import React, { useEffect, useState } from 'react';
import { Property, PropertyCategory, PropertyStatus } from '../types';
import { fetchProperties } from '../lib/api';
import { PropertyCard } from '../components/PropertyCard';
import { Search, SlidersHorizontal, X, RotateCcw, Building, ChevronDown } from 'lucide-react';

interface PropertiesPageProps {
  onNavigate: (tab: string, param?: string) => void;
  initialQuery?: string;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onNavigate, initialQuery }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [bedrooms, setBedrooms] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(6);

  // Parse initial query params if present (e.g. from Hero or footer clicks)
  useEffect(() => {
    if (initialQuery) {
      const params = new URLSearchParams(initialQuery);
      if (params.get('location')) setLocation(params.get('location')!);
      if (params.get('category')) setCategory(params.get('category')!);
      if (params.get('priceRange')) {
        const pr = params.get('priceRange')!;
        if (pr === 'under-500m') {
          setMinPrice('');
          setMaxPrice('500000000');
        } else if (pr === '500m-1b') {
          setMinPrice('500000000');
          setMaxPrice('1000000000');
        } else if (pr === '1b-2.5b') {
          setMinPrice('1000000000');
          setMaxPrice('2500000000');
        } else if (pr === 'above-2.5b') {
          setMinPrice('2500000000');
          setMaxPrice('');
        }
      }
    }
  }, [initialQuery]);

  // Fetch properties from database API whenever filters change
  useEffect(() => {
    loadFilteredProperties();
  }, [location, category, status, bedrooms, minPrice, maxPrice, searchTerm]);

  const loadFilteredProperties = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (location !== 'All') params.location = location;
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (bedrooms !== 'All') params.bedrooms = bedrooms;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await fetchProperties(params);
      setProperties(data.properties);
      setVisibleCount(6);
    } catch (err) {
      console.error('Failed to filter properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocation('All');
    setCategory('All');
    setStatus('All');
    setBedrooms('All');
    setMinPrice('');
    setMaxPrice('');
  };

  const visibleProperties = properties.slice(0, visibleCount);

  const categories: (PropertyCategory | 'All')[] = [
    'All',
    'Houses',
    'Apartments',
    'Duplexes',
    'Residential properties',
    'Land',
  ];

  return (
    <div className="min-h-screen bg-[#061413] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Our Properties
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-3 font-light">
            Find the perfect property that suits your lifestyle and budget.
          </p>
        </div>

        {/* Top Search & Filter Bar */}
        <div className="bg-[#071C1A] border border-[#143330] rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Keyword Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, location or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Category Tabs (Horizontal Scrollable on mobile) */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#E8AA35] text-black shadow-sm'
                    : 'bg-[#0A2220] text-slate-300 hover:text-white border border-[#143330]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0A2220] text-slate-200 border border-[#143330] text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#E8AA35]" />
            <span>Filter Criteria ({properties.length} results)</span>
          </button>
        </div>

        {/* Main Layout: Sidebar Filters + Property Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#071C1A] border border-[#143330] rounded-xl p-5 sticky top-28 space-y-6">
              <div className="flex items-center justify-between border-b border-[#143330] pb-4">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#E8AA35]" />
                  <span>Filter Properties</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#E8AA35] transition-colors"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                >
                  <option value="All">All Locations in Nigeria</option>
                  <option value="Banana Island">Banana Island, Ikoyi</option>
                  <option value="Ikoyi">Old Ikoyi, Lagos</option>
                  <option value="Victoria Island">Victoria Island, Lagos</option>
                  <option value="Lekki Phase 1">Lekki Phase 1, Lagos</option>
                  <option value="Maitama">Maitama, Abuja</option>
                  <option value="Asokoro">Asokoro, Abuja</option>
                </select>
              </div>

              {/* Property Type / Category */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Property Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Houses">Houses</option>
                  <option value="Apartments">Apartments</option>
                  <option value="Duplexes">Duplexes</option>
                  <option value="Residential properties">Residential Properties</option>
                  <option value="Land">Land & Plots</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Minimum Bedrooms
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['All', '1', '2', '3', '4+'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b === '4+' ? '4' : b)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                        (b === '4+' ? '4' : b) === bedrooms
                          ? 'bg-[#E8AA35] text-black'
                          : 'bg-[#0A2220] text-slate-300 hover:text-white border border-[#143330]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range (in Naira) */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Price Range (₦ Naira)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price (₦)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₦)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>
              </div>

              {/* Property Status */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Listing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer / Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs bg-[#071C1A] h-full p-6 overflow-y-auto space-y-6 border-l border-[#143330] z-10">
                <div className="flex items-center justify-between pb-4 border-b border-[#143330]">
                  <span className="font-semibold text-white">Filter Criteria</span>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  >
                    <option value="All">All Locations</option>
                    <option value="Banana Island">Banana Island, Lagos</option>
                    <option value="Ikoyi">Old Ikoyi, Lagos</option>
                    <option value="Victoria Island">Victoria Island, Lagos</option>
                    <option value="Lekki Phase 1">Lekki Phase 1, Lagos</option>
                    <option value="Maitama">Maitama, Abuja</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  >
                    <option value="All">Any Bedrooms</option>
                    <option value="1">1+ Bedrooms</option>
                    <option value="2">2+ Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Price Range (₦)</label>
                  <input
                    type="number"
                    placeholder="Min Price (₦)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full mb-2 bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₦)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg p-2.5 border border-[#143330]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-2.5 rounded-lg border border-[#143330] text-xs text-slate-300"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-2.5 rounded-lg bg-[#E8AA35] text-black font-bold text-xs"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid Area */}
          <div className="lg:col-span-3">
            {/* Results count */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
              <span>
                Showing <strong className="text-white">{visibleProperties.length}</strong> of{' '}
                <strong className="text-[#E8AA35]">{properties.length}</strong> matching properties
              </span>
              {(location !== 'All' || category !== 'All' || status !== 'All' || bedrooms !== 'All' || minPrice || maxPrice || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#E8AA35] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-[#071C1A] rounded-xl border border-[#143330] p-4 h-96 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-20 px-6 bg-[#071C1A] rounded-2xl border border-[#143330]">
                <Building className="w-14 h-14 text-[#E8AA35] mx-auto mb-4 opacity-75" />
                <h3 className="text-xl font-bold text-white mb-2">No Matching Properties Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                  We couldn't find any properties matching your current criteria. Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-lg bg-[#E8AA35] text-black text-xs font-bold uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Property Cards Grid */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visibleProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onViewDetails={(idOrSlug) => onNavigate('property-detail', idOrSlug)}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!loading && visibleCount < properties.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#071C1A] hover:bg-[#E8AA35] text-slate-200 hover:text-black border border-[#143330] hover:border-[#E8AA35] text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>Load More Properties</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
