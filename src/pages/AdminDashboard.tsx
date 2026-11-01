import React, { useState, useEffect } from 'react';
import {
  Property,
  PropertyCategory,
  PropertyStatus,
  Enquiry,
  SiteSettings,
  UserProfile,
  SupabaseConfigStatus,
} from '../types';
import {
  fetchProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  fetchEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  fetchSiteSettings,
  updateSiteSettings,
  fetchAdminMetrics,
  adminChangePassword,
  adminLogout,
  fetchSupabaseStatus,
  configureSupabase,
  formatNaira,
} from '../lib/api';
import {
  LayoutDashboard,
  Building,
  Mail,
  Settings,
  Database,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Upload,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Search,
  ExternalLink,
  Menu,
  X,
  Star,
  Sparkles,
  Phone,
  Clock,
  Shield,
} from 'lucide-react';

interface AdminDashboardProps {
  userProfile: UserProfile;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userProfile,
  onLogout,
  onNavigateHome,
}) => {
  // Navigation tabs: 'overview' | 'properties' | 'enquiries' | 'settings' | 'supabase'
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'enquiries' | 'settings' | 'supabase'>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalEnquiries: 0,
    unreadMessages: 0,
  });

  // Properties state
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyFilterCategory, setPropertyFilterCategory] = useState('All');
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Property Modal (Add / Edit)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyFormData, setPropertyFormData] = useState({
    title: '',
    category: 'Houses' as PropertyCategory,
    price: '',
    location: '',
    address: '',
    description: '',
    bedrooms: '4',
    bathrooms: '4',
    building_size: '',
    land_size: '',
    featuresInput: '',
    image_urls: [] as string[],
    status: 'Available' as PropertyStatus,
    is_featured: false,
    is_verified: true,
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [propertySaveError, setPropertySaveError] = useState<string | null>(null);

  // Property Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [viewingEnquiry, setViewingEnquiry] = useState<Enquiry | null>(null);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  // Supabase state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus | null>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseSaveMsg, setSupabaseSaveMsg] = useState<string | null>(null);

  // Temporary password modal state
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [isTempPassword, setIsTempPassword] = useState(userProfile.is_temporary_password);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadMetrics(),
      loadPropertiesList(),
      loadEnquiriesList(),
      loadSettingsData(),
      loadSupabaseInfo(),
    ]);
  };

  const loadMetrics = async () => {
    try {
      const data = await fetchAdminMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    }
  };

  const loadPropertiesList = async () => {
    try {
      setLoadingProperties(true);
      const data = await fetchProperties();
      setProperties(data.properties);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadEnquiriesList = async () => {
    try {
      setLoadingEnquiries(true);
      const data = await fetchEnquiries();
      setEnquiries(data.enquiries);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const loadSettingsData = async () => {
    try {
      const data = await fetchSiteSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const loadSupabaseInfo = async () => {
    try {
      const data = await fetchSupabaseStatus();
      setSupabaseStatus(data.status);
      setSqlSchema(data.sqlSchema);
    } catch (err) {
      console.error('Failed to load Supabase status', err);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploadingImages(true);
      const files = Array.from(e.target.files);
      const urls = await uploadPropertyImages(files);
      setPropertyFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...urls],
      }));
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setPropertyFormData({
      title: '',
      category: 'Houses',
      price: '',
      location: '',
      address: '',
      description: '',
      bedrooms: '4',
      bathrooms: '4',
      building_size: '500 sqm',
      land_size: '600 sqm',
      featuresInput: 'Swimming Pool, 24/7 Power, Governor\'s Consent, Fitted Kitchen, CCTV Security',
      image_urls: ['/src/assets/images/prop_banana_island_waterfront_1792828924150.jpg'],
      status: 'Available',
      is_featured: false,
      is_verified: true,
    });
    setPropertySaveError(null);
    setPropertyModalOpen(true);
  };

  const handleOpenEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setPropertyFormData({
      title: prop.title,
      category: prop.category,
      price: prop.price.toString(),
      location: prop.location,
      address: prop.address || prop.location,
      description: prop.description,
      bedrooms: prop.bedrooms.toString(),
      bathrooms: prop.bathrooms.toString(),
      building_size: prop.building_size || '',
      land_size: prop.land_size || '',
      featuresInput: prop.features ? prop.features.join(', ') : '',
      image_urls: prop.image_urls || [],
      status: prop.status,
      is_featured: prop.is_featured,
      is_verified: prop.is_verified,
    });
    setPropertySaveError(null);
    setPropertyModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyFormData.title || !propertyFormData.price || !propertyFormData.location) {
      setPropertySaveError('Title, price, and location are required fields.');
      return;
    }

    const features = propertyFormData.featuresInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setPropertySaveError(null);
      const payload: Partial<Property> = {
        title: propertyFormData.title,
        category: propertyFormData.category,
        price: Number(propertyFormData.price),
        location: propertyFormData.location,
        address: propertyFormData.address || propertyFormData.location,
        description: propertyFormData.description,
        bedrooms: Number(propertyFormData.bedrooms) || 0,
        bathrooms: Number(propertyFormData.bathrooms) || 0,
        building_size: propertyFormData.building_size,
        land_size: propertyFormData.land_size,
        features,
        image_urls: propertyFormData.image_urls.length > 0
          ? propertyFormData.image_urls
          : ['/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'],
        status: propertyFormData.status,
        is_featured: propertyFormData.is_featured,
        is_verified: propertyFormData.is_verified,
      };

      if (editingProperty) {
        await updateProperty(editingProperty.id, payload);
      } else {
        await createProperty(payload);
      }

      setPropertyModalOpen(false);
      await loadPropertiesList();
      await loadMetrics();
    } catch (err: any) {
      setPropertySaveError(err.message || 'Failed to save property.');
    }
  };

  const handleDeletePropertyConfirm = async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete.id);
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
      await loadPropertiesList();
      await loadMetrics();
    } catch (err: any) {
      alert(err.message || 'Failed to delete property.');
    }
  };

  const handleToggleFeatured = async (prop: Property) => {
    try {
      await updateProperty(prop.id, { is_featured: !prop.is_featured });
      await loadPropertiesList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (prop: Property, newStatus: PropertyStatus) => {
    try {
      await updateProperty(prop.id, { status: newStatus });
      await loadPropertiesList();
      await loadMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnquiryStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      await updateEnquiryStatus(id, newStatus);
      await loadEnquiriesList();
      await loadMetrics();
      if (viewingEnquiry && viewingEnquiry.id === id) {
        setViewingEnquiry({ ...viewingEnquiry, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer enquiry?')) return;
    try {
      await deleteEnquiry(id);
      if (viewingEnquiry?.id === id) setViewingEnquiry(null);
      await loadEnquiriesList();
      await loadMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      setSettingsSaving(true);
      await updateSiteSettings(settings);
      setSettingsSavedMessage('Website settings successfully saved and applied.');
      setTimeout(() => setSettingsSavedMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput || !newPasswordInput) {
      setPasswordChangeError('Please fill in both fields.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setPasswordChangeError(null);
      const msg = await adminChangePassword(currentPasswordInput, newPasswordInput);
      setPasswordChangeSuccess(msg);
      setIsTempPassword(false);
      setTimeout(() => {
        setChangePasswordModalOpen(false);
        setPasswordChangeSuccess(null);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      }, 2000);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Failed to change password');
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configureSupabase(supabaseUrlInput, supabaseAnonKeyInput);
      setSupabaseSaveMsg('Supabase credentials configured.');
      await loadSupabaseInfo();
      setTimeout(() => setSupabaseSaveMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save Supabase config');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      propertySearch === '' ||
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.location.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesCategory =
      propertyFilterCategory === 'All' || p.category === propertyFilterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredEnquiries = enquiries.filter((e) => {
    if (enquiryFilter === 'unread') return e.status === 'unread';
    if (enquiryFilter === 'resolved') return e.status === 'resolved';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#061413] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#071C1A] border-b border-[#143330] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#E8AA35]" />
          <span className="font-bold text-white text-sm">SkyHome Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-[#071C1A] border-r border-[#143330] flex flex-col justify-between shrink-0 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-6">
          {/* Brand & User Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-white font-serif font-bold text-lg mb-1">
              <span className="text-white">Sky</span>
              <span className="text-[#E8AA35]">Home</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E8AA35]/20 text-[#E8AA35] border border-[#E8AA35]/30 ml-auto">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Logged in as {userProfile.username}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'properties', label: 'Manage Properties', icon: Building, badge: properties.length },
              { id: 'enquiries', label: 'Enquiries & Leads', icon: Mail, badge: metrics.unreadMessages },
              { id: 'settings', label: 'Website Settings', icon: Settings },
              { id: 'supabase', label: 'Supabase Database', icon: Database },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-[#E8AA35] text-black shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-[#0A2220] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                        isActive ? 'bg-black text-[#E8AA35]' : 'bg-[#E8AA35]/20 text-[#E8AA35]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-6 border-t border-[#143330] space-y-2">
          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#0A2220] transition-colors"
          >
            <Key className="w-4 h-4 text-[#E8AA35]" />
            <span>Change Password</span>
          </button>

          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#0A2220] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Site</span>
          </button>

          <button
            onClick={async () => {
              await adminLogout();
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Temporary Password Security Notice */}
        {isTempPassword && (
          <div className="mb-8 p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-amber-200 block">
                  Action Required: Temporary Password in Use
                </strong>
                <p className="text-xs text-amber-300/80">
                  You are currently authenticated using the default temporary credentials (<code className="font-mono text-white">sky123</code>). Please update your password immediately before public launch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setChangePasswordModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#E8AA35] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F7CB75] transition-all shrink-0 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Executive Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time metrics calculated from active database records.
              </p>
            </div>

            {/* Metrics 4-Box Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#071C1A] border border-[#143330] p-6 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Total Properties
                </span>
                <span className="text-3xl font-bold text-white tabular-nums">
                  {metrics.totalProperties}
                </span>
                <span className="text-[11px] text-slate-400 block mt-2">All registered listings</span>
              </div>

              <div className="bg-[#071C1A] border border-[#143330] p-6 rounded-2xl">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                  Active Listings
                </span>
                <span className="text-3xl font-bold text-emerald-400 tabular-nums">
                  {metrics.activeListings}
                </span>
                <span className="text-[11px] text-slate-400 block mt-2">Available for purchase</span>
              </div>

              <div className="bg-[#071C1A] border border-[#143330] p-6 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Total Enquiries
                </span>
                <span className="text-3xl font-bold text-white tabular-nums">
                  {metrics.totalEnquiries}
                </span>
                <span className="text-[11px] text-slate-400 block mt-2">Customer leads received</span>
              </div>

              <div className="bg-[#071C1A] border border-[#143330] p-6 rounded-2xl">
                <span className="text-xs font-semibold text-[#E8AA35] uppercase tracking-wider block mb-2">
                  Unread Messages
                </span>
                <span className="text-3xl font-bold text-[#E8AA35] tabular-nums">
                  {metrics.unreadMessages}
                </span>
                <span className="text-[11px] text-slate-400 block mt-2">Awaiting advisory follow-up</span>
              </div>
            </div>

            {/* Quick Actions & Recent Listings Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Enquiries (2 Cols) */}
              <div className="lg:col-span-2 bg-[#071C1A] border border-[#143330] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Recent Customer Enquiries</h3>
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs text-[#E8AA35] hover:underline"
                  >
                    View all ({enquiries.length})
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No enquiries yet.</p>
                ) : (
                  <div className="divide-y divide-[#143330]">
                    {enquiries.slice(0, 4).map((enq) => (
                      <div key={enq.id} className="py-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{enq.customer_name}</span>
                            {enq.status === 'unread' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{enq.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(enq.created_at).toLocaleDateString()} · {enq.customer_phone}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setViewingEnquiry(enq);
                            setActiveTab('enquiries');
                          }}
                          className="px-2.5 py-1 rounded bg-[#0A2220] hover:bg-[#E8AA35] hover:text-black text-slate-300 text-xs transition-colors shrink-0"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Card (1 Col) */}
              <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Quick Actions</h3>
                <button
                  onClick={handleOpenAddProperty}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E8AA35] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F7CB75] transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add New Property</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A2220] hover:bg-[#0E2C2A] text-slate-200 border border-[#143330] text-xs font-semibold transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#E8AA35]" />
                  <span>Update Contact & WhatsApp</span>
                </button>

                <button
                  onClick={() => setActiveTab('supabase')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0A2220] hover:bg-[#0E2C2A] text-slate-200 border border-[#143330] text-xs font-semibold transition-colors"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Supabase Storage</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">Manage Properties</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Create, edit, feature, or remove property listings in Nigeria.
                </p>
              </div>
              <button
                onClick={handleOpenAddProperty}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8AA35] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F7CB75] transition-all shadow-md self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Property</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#071C1A] border border-[#143330] p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title or location..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Houses', 'Duplexes', 'Apartments', 'Residential properties', 'Land'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPropertyFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      propertyFilterCategory === cat
                        ? 'bg-[#E8AA35] text-black'
                        : 'bg-[#0A2220] text-slate-300 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Properties Table / Responsive List */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl overflow-hidden shadow-xl">
              {loadingProperties ? (
                <div className="py-16 text-center text-slate-400 text-xs">Loading listings...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  No properties found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0A2220] text-slate-400 border-b border-[#143330] uppercase tracking-wider font-semibold">
                        <th className="py-3.5 px-4">Property</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Price (₦)</th>
                        <th className="py-3.5 px-4">Beds/Baths</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Featured</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#143330]">
                      {filteredProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-[#0A2220]/60 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <img
                              src={prop.image_urls?.[0] || '/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'}
                              alt=""
                              className="w-12 h-10 object-cover rounded-md bg-[#0A2220] shrink-0"
                            />
                            <div className="min-w-0 max-w-[200px] sm:max-w-[260px]">
                              <span className="font-semibold text-white block truncate">{prop.title}</span>
                              <span className="text-[11px] text-slate-400">{prop.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 max-w-[140px] truncate">
                            {prop.location}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#E8AA35] font-sans tabular-nums whitespace-nowrap">
                            {formatNaira(prop.price)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 tabular-nums">
                            {prop.bedrooms}b / {prop.bathrooms}ba
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              value={prop.status}
                              onChange={(e) => handleQuickStatusChange(prop, e.target.value as PropertyStatus)}
                              className="bg-[#0A2220] text-slate-200 text-xs px-2 py-1 rounded border border-[#143330]"
                            >
                              <option value="Available">Available</option>
                              <option value="Sold">Sold</option>
                              <option value="Rented">Rented</option>
                              <option value="Pending">Pending</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(prop)}
                              title={prop.is_featured ? 'Featured on Homepage' : 'Not Featured'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                prop.is_featured ? 'text-[#E8AA35] bg-[#E8AA35]/10' : 'text-slate-600 hover:text-slate-400'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${prop.is_featured ? 'fill-current' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => handleOpenEditProperty(prop)}
                              className="p-1.5 text-slate-300 hover:text-[#E8AA35] hover:bg-[#0A2220] rounded-md transition-colors"
                              title="Edit listing"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPropertyToDelete(prop);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-white">Customer Enquiries</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Private customer inquiries submitted via property pages and contact forms.
                </p>
              </div>

              <div className="flex gap-2">
                {(['all', 'unread', 'resolved'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setEnquiryFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
                      enquiryFilter === filter
                        ? 'bg-[#E8AA35] text-black font-bold'
                        : 'bg-[#071C1A] text-slate-300 hover:text-white border border-[#143330]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enquiries List (1 or 2 Cols) */}
              <div className="lg:col-span-1 space-y-3">
                {loadingEnquiries ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Loading enquiries...</div>
                ) : filteredEnquiries.length === 0 ? (
                  <div className="bg-[#071C1A] border border-[#143330] p-8 text-center rounded-2xl text-slate-400 text-xs">
                    No enquiries found.
                  </div>
                ) : (
                  filteredEnquiries.map((enq) => {
                    const isSelected = viewingEnquiry?.id === enq.id;
                    return (
                      <div
                        key={enq.id}
                        onClick={() => setViewingEnquiry(enq)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0A2220] border-[#E8AA35]'
                            : 'bg-[#071C1A] border-[#143330] hover:border-[#1E4A44]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {enq.customer_name}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                              enq.status === 'unread'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : enq.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {enq.message}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{enq.customer_phone}</span>
                          <span>{new Date(enq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Enquiry Detail View (2 Cols) */}
              <div className="lg:col-span-2">
                {viewingEnquiry ? (
                  <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-start justify-between border-b border-[#143330] pb-6">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                          Enquiry Details
                        </span>
                        <h2 className="text-xl font-bold text-white">{viewingEnquiry.customer_name}</h2>
                        <span className="text-xs text-slate-400">
                          Received on {new Date(viewingEnquiry.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {viewingEnquiry.status !== 'resolved' && (
                          <button
                            onClick={() => handleEnquiryStatusChange(viewingEnquiry.id, 'resolved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEnquiry(viewingEnquiry.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Delete enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0A2220] border border-[#143330] text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Phone Number (WhatsApp)</span>
                        <a
                          href={`https://wa.me/${viewingEnquiry.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#25D366] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{viewingEnquiry.customer_phone}</span>
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">Email Address</span>
                        <span className="font-semibold text-slate-200">
                          {viewingEnquiry.customer_email || 'Not provided'}
                        </span>
                      </div>

                      {viewingEnquiry.property_title && (
                        <div className="sm:col-span-2 pt-2 border-t border-[#143330]">
                          <span className="text-slate-400 block mb-1">Referenced Property</span>
                          <span className="font-semibold text-[#E8AA35]">
                            {viewingEnquiry.property_title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Customer Message
                      </h4>
                      <div className="p-4 rounded-xl bg-[#061413] border border-[#143330] text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                        {viewingEnquiry.message}
                      </div>
                    </div>

                    {/* Quick WhatsApp Reply Button */}
                    <div className="pt-4 border-t border-[#143330]">
                      <a
                        href={`https://wa.me/${viewingEnquiry.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${viewingEnquiry.customer_name}, this is SkyHome Real Estate regarding your enquiry.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#22c35e] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                        <span>Reply to Customer on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-12 text-center text-slate-400 text-xs">
                    Select an enquiry on the left to read customer details and message.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WEBSITE SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Website Settings</h1>
              <p className="text-xs text-slate-400 mt-1">
                Update brand identity, WhatsApp contact number, and public About Us content.
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{settingsSavedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Company Info */}
              <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-[#143330] pb-3">
                  Company Identity & Contacts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">WhatsApp Number (e.g. 09024971419)</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Office Address (Optional)</label>
                  <input
                    type="text"
                    value={settings.office_address || ''}
                    onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>
              </div>

              {/* About Us Content */}
              <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-[#143330] pb-3">
                  About Us Content
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Who We Are</label>
                  <textarea
                    rows={4}
                    value={settings.about_content?.who_we_are || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        about_content: { ...settings.about_content, who_we_are: e.target.value },
                      })
                    }
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Our Mission</label>
                    <textarea
                      rows={3}
                      value={settings.about_content?.mission || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          about_content: { ...settings.about_content, mission: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Our Vision</label>
                    <textarea
                      rows={3}
                      value={settings.about_content?.vision || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          about_content: { ...settings.about_content, vision: e.target.value },
                        })
                      }
                      className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Customer Support Description</label>
                  <textarea
                    rows={2}
                    value={settings.about_content?.customer_support || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        about_content: { ...settings.about_content, customer_support: e.target.value },
                      })
                    }
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="px-8 py-3 rounded-xl bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {settingsSaving ? 'Saving...' : 'Save Settings to Database'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: SUPABASE SETTINGS & STATUS */}
        {activeTab === 'supabase' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Supabase Cloud Integration</h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor connection health, storage bucket readiness, and database schemas.
              </p>
            </div>

            {/* Status Panel */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-[#143330] pb-3">
                Connection Status Panel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0A2220] border border-[#143330]">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Connection
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        supabaseStatus?.is_configured ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <strong className="text-xs font-semibold text-white">
                      {supabaseStatus?.is_configured ? 'Online / Connected' : 'Local Persistent'}
                    </strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A2220] border border-[#143330]">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Project URL
                  </span>
                  <strong className="text-xs font-semibold text-white truncate block">
                    {supabaseStatus?.project_url || 'Not configured'}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0A2220] border border-[#143330]">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Database Status
                  </span>
                  <strong className="text-xs font-semibold text-emerald-400 block">
                    {supabaseStatus?.database_status === 'connected' ? 'Active / Synchronized' : 'Operational (Local DB)'}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0A2220] border border-[#143330]">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                    Property Storage
                  </span>
                  <strong className="text-xs font-semibold text-emerald-400 block">
                    Ready (Disk + S3 API)
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061413] border border-[#143330] text-xs text-slate-300">
                {supabaseStatus?.message}
              </div>
            </div>

            {/* Optional Cloud Credentials Configuration */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-[#143330] pb-3">
                Configure Supabase Credentials (Optional)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SkyHome is pre-configured with a zero-setup persistent storage engine. If you wish to connect your personal Supabase project, enter your Project URL and Publishable Anon Key below:
              </p>

              {supabaseSaveMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
                  {supabaseSaveMsg}
                </div>
              )}

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Supabase Anon Key</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseAnonKeyInput}
                    onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Save Credentials
                </button>
              </form>
            </div>

            {/* Complete SQL Schema Viewer */}
            <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#143330] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">Supabase SQL Schema & RLS Policies</h3>
                  <span className="text-xs text-slate-400">
                    Run this SQL script in your Supabase SQL editor to create all required tables & RLS rules.
                  </span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A2220] hover:bg-[#E8AA35] hover:text-black text-slate-200 text-xs font-semibold transition-all border border-[#143330]"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#040E0D] border border-[#143330] text-slate-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                {sqlSchema}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PROPERTY */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#071C1A] border border-[#143330] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#143330] mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingProperty ? 'Edit Property Listing' : 'Add New Luxury Property'}
              </h2>
              <button
                onClick={() => setPropertyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {propertySaveError && (
              <div className="p-3 bg-rose-950/60 border border-rose-900 rounded-lg text-rose-300 text-xs mb-4">
                {propertySaveError}
              </div>
            )}

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Imperial Residence — 5 Bedroom Detached Duplex"
                  value={propertyFormData.title}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, title: e.target.value })}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={propertyFormData.category}
                    onChange={(e) =>
                      setPropertyFormData({ ...propertyFormData, category: e.target.value as PropertyCategory })
                    }
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  >
                    <option value="Houses">Houses</option>
                    <option value="Apartments">Apartments</option>
                    <option value="Duplexes">Duplexes</option>
                    <option value="Residential properties">Residential properties</option>
                    <option value="Land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Price in Naira (₦) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500000000"
                    value={propertyFormData.price}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, price: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                  {propertyFormData.price && (
                    <span className="text-[11px] text-[#E8AA35] block mt-1 font-semibold">
                      Preview: {formatNaira(Number(propertyFormData.price))}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikoyi, Lagos"
                    value={propertyFormData.location}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, location: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Bourdillon Road, Ikoyi, Lagos"
                    value={propertyFormData.address}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, address: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={propertyFormData.bedrooms}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bedrooms: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={propertyFormData.bathrooms}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bathrooms: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Building Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 850 sqm"
                    value={propertyFormData.building_size}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, building_size: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Land Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1,000 sqm"
                    value={propertyFormData.land_size}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, land_size: e.target.value })}
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={4}
                  value={propertyFormData.description}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, description: e.target.value })}
                  placeholder="Comprehensive description of the residence, architecture, finishes, views..."
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Features & Amenities (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Swimming Pool, Smart Automation, Fitted Kitchen, CCTV, Private Cinema"
                  value={propertyFormData.featuresInput}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, featuresInput: e.target.value })}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                />
              </div>

              {/* Photos & Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Property Photographs
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#0A2220] hover:bg-[#0E2C2A] text-slate-200 border border-[#143330] rounded-lg text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#E8AA35]" />
                    <span>{uploadingImages ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">Multiple files supported (JPG, PNG, WEBP)</span>
                </div>

                {/* Image Previews */}
                {propertyFormData.image_urls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {propertyFormData.image_urls.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-12 rounded overflow-hidden shrink-0 group border border-[#143330]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setPropertyFormData({
                              ...propertyFormData,
                              image_urls: propertyFormData.image_urls.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Featured Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#143330]">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={propertyFormData.status}
                    onChange={(e) =>
                      setPropertyFormData({ ...propertyFormData, status: e.target.value as PropertyStatus })
                    }
                    className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330]"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={propertyFormData.is_featured}
                    onChange={(e) =>
                      setPropertyFormData({ ...propertyFormData, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#E8AA35] focus:ring-[#E8AA35]"
                  />
                  <label htmlFor="is_featured" className="text-xs text-slate-200 font-semibold cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={propertyFormData.is_verified}
                    onChange={(e) =>
                      setPropertyFormData({ ...propertyFormData, is_verified: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_verified" className="text-xs text-slate-200 font-semibold cursor-pointer">
                    Verified Title
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#143330]">
                <button
                  type="button"
                  onClick={() => setPropertyModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-[#143330] text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {editingProperty ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteModalOpen && propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Property Listing?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{propertyToDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#143330] text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePropertyConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#071C1A] border border-[#143330] rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#143330]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#E8AA35]" />
                <h3 className="text-base font-bold text-white">Update Admin Password</h3>
              </div>
              <button onClick={() => setChangePasswordModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordChangeSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                {passwordChangeSuccess}
              </div>
            )}

            {passwordChangeError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 text-xs">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (e.g. sky123)"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-xs rounded-lg p-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#143330] text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
