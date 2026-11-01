import React, { useState } from 'react';
import { Logo } from './Logo';
import { Search, Menu, X, Shield, User, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  adminProfile: UserProfile | null;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  adminProfile,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'properties', label: 'Properties' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#061413]/95 backdrop-blur-md border-b border-[#143330] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div onClick={() => handleNavClick('home')} className="shrink-0 cursor-pointer">
            <Logo size="md" />
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-2 text-sm font-medium tracking-wide transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#E8AA35]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8AA35] rounded-full animate-fade-in" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {/* Search Icon Trigger */}
            <button
              onClick={onOpenSearch || (() => handleNavClick('properties'))}
              title="Search Properties"
              className="p-2.5 text-slate-300 hover:text-[#E8AA35] hover:bg-[#071C1A] rounded-lg transition-colors border border-transparent hover:border-[#143330]"
              aria-label="Search properties"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Login / Dashboard Button */}
            {adminProfile ? (
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-black bg-[#E8AA35] hover:bg-[#F7CB75] transition-all shadow-sm whitespace-nowrap"
              >
                <Shield className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin-login')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-white bg-[#0A2220] hover:bg-[#0E2C2A] border border-[#143330] hover:border-[#E8AA35]/50 transition-all whitespace-nowrap"
              >
                <User className="w-4 h-4 text-[#E8AA35]" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onOpenSearch || (() => handleNavClick('properties'))}
              className="p-2 text-slate-300 hover:text-[#E8AA35]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071C1A] border-b border-[#143330] px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  currentTab === link.id
                    ? 'bg-[#0A2220] text-[#E8AA35] border-l-2 border-[#E8AA35]'
                    : 'text-slate-200 hover:bg-[#0A2220]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#143330] flex flex-col gap-2">
            {adminProfile ? (
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-black bg-[#E8AA35]"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin-login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[#0A2220] border border-[#143330]"
              >
                <User className="w-4 h-4 text-[#E8AA35]" />
                <span>Admin Login / Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
