import React, { useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { formatNaira } from '../lib/api';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (idOrSlug: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  const [imageError, setImageError] = useState(false);

  const mainImage = property.image_urls?.[0] || '/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg';

  const isSoldOrRented = property.status === 'Sold' || property.status === 'Rented';

  return (
    <div
      onClick={() => onViewDetails(property.slug || property.id)}
      className="group relative bg-[#071C1A] border border-[#143330] hover:border-[#E8AA35]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#E8AA35]/5 flex flex-col cursor-pointer"
    >
      {/* Property Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A2220]">
        {!imageError ? (
          <img
            src={mainImage}
            alt={property.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#071C1A] to-[#0A2220] p-6 text-center">
            <div className="text-slate-500">
              <span className="block text-2xl font-serif text-[#E8AA35] mb-1">SkyHome</span>
              <span className="text-xs">Luxury Property Preview</span>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061413] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Status */}
          <span
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm ${
              property.status === 'Available'
                ? 'bg-[#061413]/80 text-[#E8AA35] border border-[#E8AA35]/30'
                : property.status === 'Sold'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
            }`}
          >
            {property.status}
          </span>

          {/* Category */}
          <span className="px-3 py-1 text-xs font-medium text-slate-200 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
            {property.category}
          </span>
        </div>

        {/* Verified Indicator if applicable */}
        {property.is_verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#061413]/85 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Title</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="mb-2">
            <span className="text-2xl font-bold tracking-tight text-white font-sans tabular-nums">
              {formatNaira(property.price)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-100 line-clamp-1 group-hover:text-[#E8AA35] transition-colors mb-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#E8AA35] shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Specs & Action Row */}
        <div>
          {/* Specs: Zero-pill unboxed metadata with separators */}
          <div className="pt-3 border-t border-[#143330] flex items-center justify-between text-xs text-slate-400 mb-4">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5" title={`${property.bedrooms} Bedrooms`}>
                <Bed className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-200 tabular-nums">{property.bedrooms}</span>
                <span>Beds</span>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5" title={`${property.bathrooms} Bathrooms`}>
                <Bath className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-200 tabular-nums">{property.bathrooms}</span>
                <span>Baths</span>
              </div>
            )}

            {(property.building_size || property.land_size) && (
              <div className="flex items-center gap-1.5" title="Property Size">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-200">{property.building_size || property.land_size}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(property.slug || property.id);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0A2220] hover:bg-[#E8AA35] text-slate-200 hover:text-black font-semibold text-xs tracking-wider transition-all duration-300 border border-[#143330] hover:border-[#E8AA35]"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
