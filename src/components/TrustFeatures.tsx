import React from 'react';
import { ShieldCheck, Lock, Headphones, MapPin } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Verified Properties',
      description: 'Genuine property listings with verified legal titles.',
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      description: 'Your safety is our priority at every transaction stage.',
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'We are here to help you navigate every inquiry.',
    },
    {
      icon: MapPin,
      title: 'Prime Locations',
      description: 'Discover desirable areas across Lagos and Abuja, Nigeria.',
    },
  ];

  return (
    <section className="bg-[#071C1A] border-y border-[#143330] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-xl bg-[#061413]/60 border border-[#143330] hover:border-[#E8AA35]/40 transition-colors"
              >
                <div className="p-3 rounded-lg bg-[#0A2220] text-[#E8AA35] border border-[#E8AA35]/20 shrink-0">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
