import React, { useEffect, useState } from 'react';
import { HeroSection } from '../components/HeroSection';
import { TrustFeatures } from '../components/TrustFeatures';
import { PropertyCard } from '../components/PropertyCard';
import { Property, SiteSettings } from '../types';
import { fetchProperties, getWhatsAppUrl } from '../lib/api';
import { MessageSquare, ArrowRight, Building, Award, Compass } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  settings?: SiteSettings | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, settings }) => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const whatsappNum = settings?.whatsapp_number || '09024971419';

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      setLoading(true);
      const data = await fetchProperties({ featured: 'true' });
      // If none explicitly marked featured, show newest
      if (data.properties.length > 0) {
        setFeaturedProperties(data.properties);
      } else {
        const allData = await fetchProperties();
        setFeaturedProperties(allData.properties.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching featured properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (filters: { location?: string; category?: string; priceRange?: string }) => {
    // Navigate to properties tab with search parameters
    const query = new URLSearchParams();
    if (filters.location) query.set('location', filters.location);
    if (filters.category) query.set('category', filters.category);
    if (filters.priceRange) query.set('priceRange', filters.priceRange);
    onNavigate('properties', query.toString());
  };

  return (
    <div className="min-h-screen bg-[#061413]">
      {/* Hero Section */}
      <HeroSection onSearch={handleSearchSubmit} />

      {/* Trust Indicators */}
      <TrustFeatures />

      {/* Featured Properties Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#E8AA35] uppercase mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Featured Properties
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Recently added and exclusive luxury homes, modern duplexes, and residential estates across Nigeria.
            </p>
          </div>

          <button
            onClick={() => onNavigate('properties')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-[#E8AA35] hover:text-black bg-[#071C1A] hover:bg-[#E8AA35] border border-[#E8AA35]/40 hover:border-[#E8AA35] transition-all whitespace-nowrap self-start md:self-auto"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#071C1A] rounded-xl border border-[#143330] p-4 h-96 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && featuredProperties.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#071C1A] rounded-2xl border border-[#143330]">
            <Building className="w-12 h-12 text-[#E8AA35] mx-auto mb-4 opacity-80" />
            <h3 className="text-lg font-semibold text-white mb-2">No Properties Listed Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              New luxury listings will appear here once added by our real estate acquisition team.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-2.5 bg-[#E8AA35] text-black text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              Contact Us For Off-Market Properties
            </button>
          </div>
        )}

        {/* Property Grid */}
        {!loading && featuredProperties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={(idOrSlug) => onNavigate('property-detail', idOrSlug)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Prime Nigerian Real Estate Corridor */}
      <section className="bg-[#071C1A] border-t border-[#143330] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AA35]">
              Prime Nigerian Locations
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-2">
              Prestigious Enclaves Across Nigeria
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              We focus on premium, high-capital-appreciation neighborhoods with reliable infrastructure and verified land titles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Banana Island, Ikoyi',
                state: 'Lagos State',
                desc: 'Billionaires’ haven with private boat jetties, 24/7 security, and lagoon waterfronts.',
                filter: 'Banana Island',
              },
              {
                name: 'Old Ikoyi & Parkview',
                state: 'Lagos State',
                desc: 'Classic colonial heritage meets ultra-contemporary luxury villas and embassy residences.',
                filter: 'Ikoyi',
              },
              {
                name: 'Maitama & Asokoro',
                state: 'Abuja (FCT)',
                desc: 'Diplomatic epicenter, panoramic Aso Rock views, and exclusive ambassadorial mansions.',
                filter: 'Maitama',
              },
              {
                name: 'Lekki Phase 1',
                state: 'Lagos State',
                desc: 'Dynamic coastal lifestyle, contemporary terrace duplexes, and commercial convenience.',
                filter: 'Lekki Phase 1',
              },
            ].map((loc, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('properties', `location=${encodeURIComponent(loc.filter)}`)}
                className="group p-6 rounded-xl bg-[#061413] border border-[#143330] hover:border-[#E8AA35] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#E8AA35] font-semibold mb-2">
                    <span>{loc.state}</span>
                    <Compass className="w-4 h-4 opacity-60 group-hover:rotate-45 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E8AA35] transition-colors mb-2">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {loc.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs font-semibold text-[#E8AA35] gap-1.5">
                  <span>Explore listings</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp VIP Concierge Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B2E29] to-[#071C1A] border border-[#1E4A44] p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E8AA35] mb-2 block">
              Direct Advisory Service
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Looking for an exclusive off-market property in Lagos or Abuja?
            </h3>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Connect directly with our luxury acquisition team on WhatsApp for private viewings, confidential portfolio briefs, and bespoke property searches.
            </p>
          </div>

          <a
            href={getWhatsAppUrl(whatsappNum, 'Hello SkyHome, I am looking for luxury property investment opportunities in Nigeria.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-xl hover:shadow-[#25D366]/20 shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
