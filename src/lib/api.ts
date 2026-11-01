import { Property, Enquiry, SiteSettings, UserProfile, SupabaseConfigStatus } from '../types';

const API_BASE = '/api';

export function formatNaira(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return '₦' + amount.toLocaleString('en-NG');
}

export function formatNairaShort(amount: number): string {
  if (!amount) return '₦0';
  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(2).replace(/\.00$/, '');
    return `₦${val} Billion`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `₦${val} Million`;
  }
  return formatNaira(amount);
}

export function getWhatsAppUrl(phone: string = '09024971419', message: string = ''): string {
  // Format to international 234...
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.slice(1);
  } else if (!cleaned.startsWith('234')) {
    cleaned = '234' + cleaned;
  }
  const encodedText = encodeURIComponent(message || 'Hello SkyHome, I am interested in exploring available luxury properties.');
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}

function getStoredToken(): string | null {
  return localStorage.getItem('skyhome_auth_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('skyhome_auth_token', token);
  } else {
    localStorage.removeItem('skyhome_auth_token');
  }
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Public API
export async function fetchProperties(params: Record<string, string> = {}): Promise<{ total: number; properties: Property[] }> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/properties${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load properties');
  return res.json();
}

export async function fetchProperty(idOrSlug: string): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error('Property not found');
  const data = await res.json();
  return data.property;
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load site settings');
  const data = await res.json();
  return data.settings;
}

export async function submitCustomerEnquiry(payload: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
  property_id?: string;
  property_title?: string;
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit enquiry');
  return data;
}

// Admin Auth API
export async function adminLogin(username: string, password: string): Promise<{ token: string; profile: UserProfile; message: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setStoredToken(data.token);
  return data;
}

export async function checkAdminSession(): Promise<UserProfile | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      setStoredToken(null);
      return null;
    }
    const data = await res.json();
    return data.profile;
  } catch {
    return null;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  } finally {
    setStoredToken(null);
  }
}

export async function adminChangePassword(currentPassword: string, newPassword: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update password');
  return data.message;
}

// Admin Operations
export async function fetchAdminMetrics(): Promise<{
  totalProperties: number;
  activeListings: number;
  totalEnquiries: number;
  unreadMessages: number;
}> {
  const res = await fetch(`${API_BASE}/admin/metrics`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load metrics');
  return res.json();
}

export async function createProperty(propertyData: Partial<Property>): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(propertyData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create property');
  return data.property;
}

export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
  const res = await fetch(`${API_BASE}/properties/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(propertyData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update property');
  return data.property;
}

export async function deleteProperty(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/properties/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete property');
  }
}

export async function uploadPropertyImages(files: File[]): Promise<string[]> {
  const token = getStoredToken();
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload images');
  return data.urls;
}

export async function fetchEnquiries(): Promise<{
  total: number;
  unread_count: number;
  enquiries: Enquiry[];
}> {
  const res = await fetch(`${API_BASE}/enquiries`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch enquiries');
  return res.json();
}

export async function updateEnquiryStatus(id: string, status: 'unread' | 'read' | 'resolved'): Promise<void> {
  const res = await fetch(`${API_BASE}/enquiries/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update enquiry');
}

export async function deleteEnquiry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/enquiries/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete enquiry');
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data.settings;
}

export async function fetchSupabaseStatus(): Promise<{ status: SupabaseConfigStatus; sqlSchema: string }> {
  const res = await fetch(`${API_BASE}/supabase/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch Supabase status');
  return res.json();
}

export async function configureSupabase(project_url: string, anon_key: string): Promise<void> {
  const res = await fetch(`${API_BASE}/supabase/configure`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ project_url, anon_key }),
  });
  if (!res.ok) throw new Error('Failed to save Supabase configuration');
}
