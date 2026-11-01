import React from 'react';
import { SiteSettings } from '../types';
import { ShieldCheck, Target, Eye, CheckCircle2, Headphones, MessageSquare, ArrowRight } from 'lucide-react';
import { getWhatsAppUrl } from '../lib/api';

interface AboutPageProps {
  settings?: SiteSettings | null;
  onNavigate: (tab: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  const companyName = settings?.company_name || 'SkyHome';
  const tagline = settings?.tagline || 'Your Dream Home, Our Priority.';
  const whatsappNum = settings?.whatsapp_number || '09024971419';

  const about = settings?.about_content || {
    who_we_are: 'SkyHome is a premier Nigerian luxury real estate advisory and property brokerage founded to redefine how discerning individuals, families, and global investors acquire prime residential and commercial real estate in Nigeria.',
    mission: 'To provide transparent, secure, and stress-free real estate acquisition experiences backed by rigorous title verification and dedicated white-glove advisory.',
    vision: 'To be the most trusted luxury property brand in Nigeria, connecting clients to their dream homes while safeguarding generational wealth.',
    why_choose_us: [
      '100% Verified Titles: Every property undergoes thorough legal and title verification before listing.',
      'Prime Nigerian Locations: Exclusive access to off-market and prime properties in Ikoyi, Banana Island, Lekki, and Maitama.',
      'Transparent Process: No hidden charges, direct vendor communication, and end-to-end documentation handling.',
      'Dedicated Advisory: Expert real estate consultants ready to guide your purchase via WhatsApp or private viewing.'
    ],
    customer_support: 'Our dedicated advisory team is available Monday through Saturday, 8:00 AM – 7:00 PM (WAT) to arrange physical property inspections, provide title documents, and answer purchase enquiries.'
  };

  return (
    <div className="min-h-screen bg-[#061413] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E8AA35]">
            About SkyHome
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mt-3">
            Your Dream Home, Our Priority
          </h1>
          <p className="text-base sm:text-lg text-slate-300 mt-4 font-light leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Who We Are */}
        <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-8 sm:p-12 shadow-xl">
          <div className="flex items-center gap-3 text-[#E8AA35] text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Who We Are</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-6">
            Pioneering Luxury Real Estate Across Nigeria
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light whitespace-pre-line">
            {about.who_we_are}
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0A2220] border border-[#E8AA35]/30 text-[#E8AA35] flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {about.mission}
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#0A2220] border border-[#E8AA35]/30 text-[#E8AA35] flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {about.vision}
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose SkyHome */}
        <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-8 sm:p-12">
          <h3 className="text-2xl font-serif font-bold text-white mb-8">
            Why Choose {companyName}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {about.why_choose_us.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#061413] border border-[#143330]">
                <CheckCircle2 className="w-5 h-5 text-[#E8AA35] shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-gradient-to-r from-[#0B2E29] to-[#071C1A] border border-[#1E4A44] rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8AA35]">
              <Headphones className="w-4 h-4" />
              <span>Customer Support</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Dedicated Property Advisory</h3>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {about.customer_support}
            </p>
          </div>

          <a
            href={getWhatsAppUrl(whatsappNum, 'Hello SkyHome, I would like to speak with customer support regarding a property inquiry.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-lg"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
