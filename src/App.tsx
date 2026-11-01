/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserProfile, SiteSettings } from './types';
import { checkAdminSession, fetchSiteSettings } from './lib/api';
import { Search, X, ArrowRight, Building } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedPropertyParam, setSelectedPropertyParam] = useState<string>('');
  const [initialPropertiesQuery, setInitialPropertiesQuery] = useState<string>('');
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Quick Search Modal state
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchInput, setQuickSearchInput] = useState('');

  useEffect(() => {
    // Check existing admin session
    checkAdminSession().then((profile) => {
      if (profile) setAdminProfile(profile);
    });

    // Load site settings
    fetchSiteSettings().then((settings) => {
      setSiteSettings(settings);
    }).catch(console.error);

    // Read URL hash on initial load
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      if (hash.startsWith('property/')) {
        const slug = hash.replace('property/', '');
        setCurrentTab('property-detail');
        setSelectedPropertyParam(slug);
      } else if (['home', 'properties', 'about', 'contact', 'admin-login', 'admin-dashboard'].includes(hash)) {
        setCurrentTab(hash);
      }
    }

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h.startsWith('property/')) {
        setCurrentTab('property-detail');
        setSelectedPropertyParam(h.replace('property/', ''));
      } else if (h) {
        setCurrentTab(h);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tab === 'property-detail' && param) {
      setSelectedPropertyParam(param);
      setCurrentTab('property-detail');
      window.location.hash = `property/${param}`;
      return;
    }

    if (tab === 'properties' && param) {
      setInitialPropertiesQuery(param);
    } else {
      setInitialPropertiesQuery('');
    }

    if (tab === 'admin-dashboard' && !adminProfile) {
      setCurrentTab('admin-login');
      window.location.hash = 'admin-login';
      return;
    }

    if (tab === 'admin-login' && adminProfile) {
      setCurrentTab('admin-dashboard');
      window.location.hash = 'admin-dashboard';
      return;
    }

    setCurrentTab(tab);
    window.location.hash = tab;
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      setQuickSearchOpen(false);
      handleNavigate('properties', `search=${encodeURIComponent(quickSearchInput.trim())}`);
      setQuickSearchInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#061413] text-slate-100 flex flex-col font-sans selection:bg-[#E8AA35] selection:text-black">
      {/* Top Header (shown on public pages and admin login) */}
      {currentTab !== 'admin-dashboard' && (
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          adminProfile={adminProfile}
          onOpenSearch={() => setQuickSearchOpen(true)}
        />
      )}

      {/* Main Page Content */}
      <div className="flex-1">
        {currentTab === 'home' && (
          <HomePage onNavigate={handleNavigate} settings={siteSettings} />
        )}

        {currentTab === 'properties' && (
          <PropertiesPage
            onNavigate={handleNavigate}
            initialQuery={initialPropertiesQuery}
          />
        )}

        {currentTab === 'property-detail' && (
          <PropertyDetailPage
            idOrSlug={selectedPropertyParam}
            onNavigate={handleNavigate}
            settings={siteSettings}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage settings={siteSettings} onNavigate={handleNavigate} />
        )}

        {currentTab === 'contact' && (
          <ContactPage settings={siteSettings} />
        )}

        {currentTab === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={(profile) => {
              setAdminProfile(profile);
              handleNavigate('admin-dashboard');
            }}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentTab === 'admin-dashboard' && adminProfile && (
          <AdminDashboard
            userProfile={adminProfile}
            onLogout={() => {
              setAdminProfile(null);
              handleNavigate('home');
            }}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}
      </div>

      {/* Footer (shown on public pages) */}
      {currentTab !== 'admin-dashboard' && currentTab !== 'admin-login' && (
        <Footer onNavigate={handleNavigate} settings={siteSettings} />
      )}

      {/* Quick Search Modal */}
      {quickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#071C1A] border border-[#143330] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#143330] mb-4">
              <span className="text-xs uppercase font-semibold text-[#E8AA35] tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Search SkyHome Listings</span>
              </span>
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Banana Island, Penthouse, Duplex, Swimming pool..."
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-100 text-sm rounded-xl pl-12 pr-4 py-3.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Search across titles, locations, and luxury features
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#E8AA35] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F7CB75] transition-all flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
