import React, { useEffect, useState } from 'react';
import { Property, SiteSettings } from '../types';
import { fetchProperty, formatNaira, getWhatsAppUrl, submitCustomerEnquiry } from '../lib/api';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  Share2,
  Calendar,
  Send,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

interface PropertyDetailPageProps {
  idOrSlug: string;
  onNavigate: (tab: string, param?: string) => void;
  settings?: SiteSettings | null;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  idOrSlug,
  onNavigate,
  settings,
}) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enquiry form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const whatsappNum = settings?.whatsapp_number || '09024971419';

  useEffect(() => {
    loadDetails();
  }, [idOrSlug]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProperty(idOrSlug);
      setProperty(data);
      if (data.image_urls && data.image_urls.length > 0) {
        setSelectedImage(data.image_urls[0]);
      }
      // Prefill customer message
      setMessage(
        `Hello SkyHome, I am interested in inspecting "${data.title}" in ${data.location}. Please contact me with further details.`
      );
    } catch (err: any) {
      setError(err.message || 'Unable to load property details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !message) {
      setSubmitError('Please provide your name, phone number, and message.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await submitCustomerEnquiry({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        message,
        property_id: property?.id,
        property_title: property?.title,
      });

      setSubmitSuccess(res.message);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061413] py-20 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#E8AA35] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm tracking-wide">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#061413] py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#071C1A] border border-[#143330] p-8 rounded-2xl">
          <Building2 className="w-12 h-12 text-[#E8AA35] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Property Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The property listing you are seeking is either unavailable or has been archived.
          </p>
          <button
            onClick={() => onNavigate('properties')}
            className="px-6 py-2.5 bg-[#E8AA35] text-black font-semibold text-xs tracking-wider rounded-lg uppercase"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const images = property.image_urls && property.image_urls.length > 0
    ? property.image_urls
    : ['/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'];

  const whatsappMessage = `Hello SkyHome, I am interested in "${property.title}" located at ${property.location} listed for ${formatNaira(property.price)}. Please share further details and schedule a private inspection.`;

  return (
    <div className="min-h-screen bg-[#061413] pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => onNavigate('properties')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#E8AA35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Properties</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071C1A] border border-[#143330] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Listing'}</span>
          </button>
        </div>

        {/* Gallery Section */}
        <div className="space-y-4 mb-10">
          {/* Main Photo Showcase */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#0A2220] border border-[#143330] shadow-2xl">
            <img
              src={selectedImage || images[0]}
              alt={property.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Status & Category Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3.5 py-1.5 rounded-md bg-[#061413]/90 backdrop-blur-md text-[#E8AA35] border border-[#E8AA35]/40 text-xs font-bold uppercase tracking-wider">
                {property.status}
              </span>
              <span className="px-3.5 py-1.5 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                {property.category}
              </span>
            </div>

            {property.is_verified && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#061413]/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Legal Title</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery (when multiple images exist) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`relative aspect-[4/3] w-24 sm:w-32 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === imgUrl ? 'border-[#E8AA35] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info (2 Cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title & Price Header */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-300 text-sm mt-3">
                    <MapPin className="w-4 h-4 text-[#E8AA35] shrink-0" />
                    <span>{property.address || property.location}</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Asking Price</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#E8AA35] font-sans tabular-nums">
                    {formatNaira(property.price)}
                  </span>
                </div>
              </div>

              {/* Key Specs Bar: Clean unboxed metadata with separators */}
              <div className="mt-8 pt-6 border-t border-[#143330] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {property.bedrooms > 0 && (
                  <div className="p-3 bg-[#0A2220] rounded-xl border border-[#143330]">
                    <Bed className="w-5 h-5 text-[#E8AA35] mx-auto mb-1" />
                    <span className="text-lg font-bold text-white block tabular-nums">{property.bedrooms}</span>
                    <span className="text-xs text-slate-400">Bedrooms</span>
                  </div>
                )}

                {property.bathrooms > 0 && (
                  <div className="p-3 bg-[#0A2220] rounded-xl border border-[#143330]">
                    <Bath className="w-5 h-5 text-[#E8AA35] mx-auto mb-1" />
                    <span className="text-lg font-bold text-white block tabular-nums">{property.bathrooms}</span>
                    <span className="text-xs text-slate-400">Bathrooms</span>
                  </div>
                )}

                {property.building_size && (
                  <div className="p-3 bg-[#0A2220] rounded-xl border border-[#143330]">
                    <Maximize2 className="w-5 h-5 text-[#E8AA35] mx-auto mb-1" />
                    <span className="text-sm font-bold text-white block truncate">{property.building_size}</span>
                    <span className="text-xs text-slate-400">Building Size</span>
                  </div>
                )}

                {property.land_size && (
                  <div className="p-3 bg-[#0A2220] rounded-xl border border-[#143330]">
                    <Building2 className="w-5 h-5 text-[#E8AA35] mx-auto mb-1" />
                    <span className="text-sm font-bold text-white block truncate">{property.land_size}</span>
                    <span className="text-xs text-slate-400">Land Area</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>Property Overview</span>
              </h2>
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-light whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Features & Amenities (Only administrator-entered features) */}
            {property.features && property.features.length > 0 && (
              <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6">
                  Available Amenities & Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {property.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#0A2220] border border-[#143330]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E8AA35] shrink-0" />
                      <span className="text-sm text-slate-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: WhatsApp Action & Enquiry Form (1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prominent WhatsApp Card */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 shadow-xl sticky top-28 space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                  Direct WhatsApp Inspection
                </span>
                <h3 className="text-lg font-bold text-white">Speak with SkyHome Advisory</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Get prompt answers, verify title status, or arrange physical site viewing today.
                </p>
              </div>

              {/* Prominent Green WhatsApp Button */}
              <a
                href={getWhatsAppUrl(whatsappNum, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#25D366]/25 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Verified Title Trust Marker */}
              {property.is_verified && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#061413] border border-emerald-500/20 text-xs text-slate-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-400 block">Verified Listing</strong>
                    <span>Title documentation verified by SkyHome real estate legal counsel.</span>
                  </div>
                </div>
              )}

              {/* Customer Enquiry Form */}
              <div className="pt-6 border-t border-[#143330]">
                <h4 className="text-sm font-semibold text-white mb-4">Send Confidential Enquiry</h4>

                {submitSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs space-y-2">
                    <p className="font-semibold">Enquiry Received!</p>
                    <p>{submitSuccess}</p>
                    <button
                      onClick={() => setSubmitSuccess(null)}
                      className="text-[#E8AA35] hover:underline pt-1 block"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                    {submitError && (
                      <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded border border-rose-900">
                        {submitError}
                      </p>
                    )}

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adebayo Ogunlesi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Phone Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Your Message *</label>
                      <textarea
                        rows={3}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg px-3 py-2 border border-[#143330] focus:border-[#E8AA35] focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 rounded-xl bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
