import React from 'react';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { getWhatsAppUrl } from '../lib/api';
import { SiteSettings } from '../types';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
  settings?: SiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const whatsappNum = settings?.whatsapp_number || '09024971419';
  const email = settings?.contact_email || 'contact@skyhome.ng';
  const address = settings?.office_address || '14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria';
  const tagline = settings?.tagline || 'Your Dream Home, Our Priority.';

  return (
    <footer className="bg-[#040E0D] border-t border-[#143330] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div onClick={() => onNavigate('home')} className="cursor-pointer inline-block">
              <Logo size="lg" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{tagline}"
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nigeria's foremost luxury property brokerage. Curating exceptional contemporary residences, waterfront villas, penthouses, and investment plots across Lagos and Abuja.
            </p>
          </div>

          {/* Col 2: Prime Locations */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Prime Locations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('properties', 'Banana Island')}
                  className="hover:text-[#E8AA35] transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Banana Island, Ikoyi</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', 'Ikoyi')}
                  className="hover:text-[#E8AA35] transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Old Ikoyi, Lagos</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', 'Maitama')}
                  className="hover:text-[#E8AA35] transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Maitama, Abuja</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', 'Lekki Phase 1')}
                  className="hover:text-[#E8AA35] transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Lekki Phase 1, Lagos</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties', 'Victoria Island')}
                  className="hover:text-[#E8AA35] transition-colors flex items-center justify-between w-full text-left"
                >
                  <span>Victoria Island, Lagos</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#E8AA35] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#E8AA35] transition-colors"
                >
                  All Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E8AA35] transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E8AA35] transition-colors"
                >
                  Contact & Enquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2 block"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & WhatsApp */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href={getWhatsAppUrl(whatsappNum, 'Hello SkyHome, I want to enquire about property acquisition.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all font-medium"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-[#E8AA35] shrink-0" />
                <a href={`tel:${whatsappNum}`} className="hover:text-white transition-colors">
                  {whatsappNum}
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-[#E8AA35] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </div>

              <div className="flex items-start gap-2.5 text-slate-400 text-xs">
                <MapPin className="w-4 h-4 text-[#E8AA35] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#143330] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SkyHome Real Estate Advisory Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>RC Verified Brokerage</span>
            <span>·</span>
            <span>Lagos & Abuja, Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
