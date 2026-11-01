export type PropertyCategory = 
  | 'Houses'
  | 'Apartments'
  | 'Duplexes'
  | 'Residential properties'
  | 'Land';

export type PropertyStatus = 'Available' | 'Sold' | 'Rented' | 'Pending';

export interface Property {
  id: string;
  title: string;
  slug: string;
  category: PropertyCategory;
  price: number; // In Naira
  location: string; // e.g. "Ikoyi, Lagos" or "Maitama, Abuja"
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  building_size?: string; // e.g. "850 sqm"
  land_size?: string; // e.g. "1,000 sqm"
  features: string[];
  image_urls: string[];
  status: PropertyStatus;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  property_id?: string;
  property_title?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  created_at: string;
}

export interface SiteSettings {
  id: string;
  company_name: string;
  tagline: string;
  whatsapp_number: string;
  contact_email: string;
  logo_url?: string;
  office_address?: string;
  about_content: {
    who_we_are: string;
    mission: string;
    vision: string;
    why_choose_us: string[];
    customer_support: string;
  };
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin';
  is_temporary_password: boolean;
  created_at: string;
}

export interface SupabaseConfigStatus {
  is_configured: boolean;
  project_url: string;
  has_anon_key: boolean;
  database_status: 'connected' | 'not_configured' | 'error';
  storage_status: 'ready' | 'not_configured';
  message: string;
}
