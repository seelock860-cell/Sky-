import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import { Property, Enquiry, SiteSettings, UserProfile, SupabaseConfigStatus } from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Ensure data and uploads directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, and AVIF image formats are allowed.'));
    }
  },
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR));

// DB Persistence Layer
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  admin_user: {
    id: string;
    username: string;
    full_name: string;
    salt: string;
    password_hash: string;
    is_temporary_password: boolean;
    created_at: string;
  };
  sessions: Record<string, { userId: string; expiresAt: number }>;
  properties: Property[];
  enquiries: Enquiry[];
  site_settings: SiteSettings;
  supabase_config: {
    project_url: string;
    anon_key: string;
  };
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function initializeDatabase(): DatabaseSchema {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultPasswordHash = hashPassword('sky123', defaultSalt);

  const initialProperties: Property[] = [
    {
      id: 'prop-1',
      title: 'The Sovereign Villa — Waterfront Luxury Mansion',
      slug: 'the-sovereign-villa-banana-island-lagos',
      category: 'Houses',
      price: 2500000000,
      location: 'Banana Island, Ikoyi, Lagos',
      address: 'Plot 18, Zone A, Banana Island, Ikoyi, Lagos',
      description: 'An architectural masterpiece offering uninterrupted water views across Lagos Lagoon. Features a private yacht jetty, expansive infinity-edge pool, private cinema room, double-volume living area with floor-to-ceiling glass, Italian marble throughout, smart home automation, and 2-room staff quarters.',
      bedrooms: 6,
      bathrooms: 7,
      building_size: '1,100 sqm',
      land_size: '1,800 sqm',
      features: [
        'Private Boat Jetty',
        'Lagoon Infinity Pool',
        'Smart Home Automation',
        'Private Cinema (12 Seats)',
        'Private Elevator',
        'Governor\'s Consent',
        '24/7 Armed Security',
        'Standby Industrial Generator',
        'Fitted Chef\'s Kitchen'
      ],
      image_urls: [
        '/src/assets/images/prop_banana_island_waterfront_1792828924150.jpg',
        '/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'
      ],
      status: 'Available',
      is_featured: true,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'prop-2',
      title: 'The Grand Manor — Ultra-Modern Detached Duplex',
      slug: 'the-grand-manor-old-ikoyi-lagos',
      category: 'Duplexes',
      price: 1450000000,
      location: 'Old Ikoyi, Lagos',
      address: '12 Alexander Road, Old Ikoyi, Lagos',
      description: 'Sophisticated 5-bedroom contemporary detached duplex crafted with natural white limestone and custom bronze architectural louvers. Boasts a private manicured garden, Olympic-grade private lap pool, designer elevator, automated entrance gates, and solar hybrid backup power.',
      bedrooms: 5,
      bathrooms: 6,
      building_size: '850 sqm',
      land_size: '1,000 sqm',
      features: [
        'Contemporary Architecture',
        'Private Lap Pool',
        'Fitted Italian Kitchen',
        '2-Room Staff Quarters',
        'Certificate of Occupancy (C of O)',
        'Automated Gate & Access Control',
        'Dedicated 50KVA Transformer',
        'Rooftop Lounge'
      ],
      image_urls: [
        '/src/assets/images/prop_ikoyi_detached_duplex_1792828923535.jpg'
      ],
      status: 'Available',
      is_featured: true,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'prop-3',
      title: 'Skyline Presidential Penthouse with Private Terrace',
      slug: 'skyline-presidential-penthouse-maitama-abuja',
      category: 'Apartments',
      price: 980000000,
      location: 'Maitama, Abuja',
      address: 'High-Rise Tower, Aguiyi Ironsi Way, Maitama, Abuja',
      description: 'A rare top-floor duplex penthouse in diplomatic Maitama with 360-degree panoramic views of the Abuja skyline and Aso Rock. Features an open-air entertainment terrace with fire pit and dining pergola, biometric elevator entry, private wine cellar, and 4 dedicated basement car parks.',
      bedrooms: 4,
      bathrooms: 5,
      building_size: '620 sqm',
      land_size: '620 sqm',
      features: [
        'Panoramic Skyline Views',
        'Rooftop Terrace & Lounge',
        'Private Biometric Elevator',
        '24/7 Concierge Service',
        'Basement Parking (4 Cars)',
        'Federal C of O',
        'Exclusive Gym & Spa Access',
        'Wine Cellar'
      ],
      image_urls: [
        '/src/assets/images/prop_maitama_penthouse_1792828924837.jpg'
      ],
      status: 'Available',
      is_featured: true,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'prop-4',
      title: 'The Aurelia Contemporary Terrace Duplex',
      slug: 'the-aurelia-terrace-duplex-lekki-phase-1',
      category: 'Duplexes',
      price: 420000000,
      location: 'Lekki Phase 1, Lagos',
      address: 'Admiralty Way Axis, Lekki Phase 1, Lagos',
      description: 'Stunning 4-bedroom terrace duplex in a secure, serene private cul-de-sac. Features multi-level terrace balconies, sleek warm ambient architectural illumination, premium German sanitary fittings, open-plan island kitchen, and built-in acoustic ceilings.',
      bedrooms: 4,
      bathrooms: 4,
      building_size: '450 sqm',
      land_size: '500 sqm',
      features: [
        'Gated Residential Court',
        'Governor\'s Consent',
        'Rooftop Sit-Out Area',
        'Fully Fitted Kitchen & Pantry',
        'CCTV Surveillance Network',
        'Hybrid Solar Inverter',
        'Industrial Water Purification'
      ],
      image_urls: [
        '/src/assets/images/prop_lekki_terrace_duplex_1792828924893.jpg'
      ],
      status: 'Available',
      is_featured: true,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'prop-5',
      title: 'The Glass Pavilion Luxury Mansion',
      slug: 'the-glass-pavilion-luxury-mansion-victoria-island',
      category: 'Residential properties',
      price: 1800000000,
      location: 'Victoria Island, Lagos',
      address: 'Kofo Abayomi Street, Victoria Island, Lagos',
      description: 'An iconic modern residence combining commercial-grade structural steel and floor-to-ceiling glass pavilions. Features heated infinity pool, private wellness studio, manicured tropical courtyard, chef-grade preparation kitchen, and automated shade louvers.',
      bedrooms: 5,
      bathrooms: 6,
      building_size: '920 sqm',
      land_size: '1,250 sqm',
      features: [
        'Infinity Swimming Pool',
        'Double-Height Glass Atrium',
        'Wellness & Sauna Studio',
        'C of O with Governor\'s Consent',
        'Full Smart Lighting Control',
        '3-Car Enclosed Garage'
      ],
      image_urls: [
        '/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'
      ],
      status: 'Available',
      is_featured: false,
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  ];

  const initialSettings: SiteSettings = {
    id: 'settings-1',
    company_name: 'SkyHome',
    tagline: 'Your Dream Home, Our Priority.',
    whatsapp_number: '09024971419',
    contact_email: 'contact@skyhome.ng',
    office_address: '14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    about_content: {
      who_we_are: 'SkyHome is a premier Nigerian luxury real estate advisory and property brokerage founded to redefine how discerning individuals, families, and global investors acquire prime residential and commercial real estate in Nigeria. We specialize in high-value properties in Lagos (Ikoyi, Banana Island, Victoria Island, Lekki Phase 1) and Abuja (Maitama, Asokoro, Guzape).',
      mission: 'To provide transparent, secure, and stress-free real estate acquisition experiences backed by rigorous title verification and dedicated white-glove advisory.',
      vision: 'To be the most trusted luxury property brand in Nigeria, connecting clients to their dream homes while safeguarding generational wealth.',
      why_choose_us: [
        '100% Verified Titles: Every property undergoes thorough legal and title verification before listing.',
        'Prime Nigerian Locations: Exclusive access to off-market and prime properties in Ikoyi, Banana Island, Lekki, and Maitama.',
        'Transparent Process: No hidden charges, direct vendor communication, and end-to-end documentation handling.',
        'Dedicated Advisory: Expert real estate consultants ready to guide your purchase via WhatsApp or private viewing.'
      ],
      customer_support: 'Our dedicated advisory team is available Monday through Saturday, 8:00 AM – 7:00 PM (WAT) to arrange physical property inspections, provide title documents, and answer purchase enquiries.'
    },
    updated_at: new Date().toISOString(),
  };

  return {
    admin_user: {
      id: 'admin-1',
      username: 'sky',
      full_name: 'SkyHome Administrator',
      salt: defaultSalt,
      password_hash: defaultPasswordHash,
      is_temporary_password: true,
      created_at: new Date().toISOString(),
    },
    sessions: {},
    properties: initialProperties,
    enquiries: [
      {
        id: 'enquiry-1',
        property_id: 'prop-1',
        property_title: 'The Sovereign Villa — Waterfront Luxury Mansion',
        customer_name: 'Dr. Babatunde Adeleke',
        customer_phone: '+234 803 555 0192',
        customer_email: 'babatunde.adeleke@example.com',
        message: 'Good day, I am interested in scheduling a private viewing for The Sovereign Villa in Banana Island this coming Saturday. Kindly confirm if the boat jetty has deep water clearance for a 45ft yacht.',
        status: 'unread',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'enquiry-2',
        property_id: 'prop-3',
        property_title: 'Skyline Presidential Penthouse with Private Terrace',
        customer_name: 'Amina Bello Esq.',
        customer_phone: '+234 809 123 4567',
        customer_email: 'amina.bello@example.com',
        message: 'Hello, please share the title documentation and payment structure for the Maitama penthouse. Can we discuss on WhatsApp?',
        status: 'read',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      }
    ],
    site_settings: initialSettings,
    supabase_config: {
      project_url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      anon_key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    }
  };
}

let db: DatabaseSchema;
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    // Ensure essential keys exist
    if (!db.admin_user || !db.properties || !db.site_settings) {
      db = initializeDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    }
  } catch (err) {
    db = initializeDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} else {
  db = initializeDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function saveDatabase() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Authentication Middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.skyhome_session;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    return;
  }

  const session = db.sessions[token];
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDatabase();
    }
    res.status(401).json({ error: 'Session expired. Please log in again.' });
    return;
  }

  // Extend session
  session.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  saveDatabase();
  next();
}

// ======================== API ROUTES ========================

// 1. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  if (username !== db.admin_user.username) {
    res.status(401).json({ error: 'Invalid admin credentials.' });
    return;
  }

  const computedHash = hashPassword(password, db.admin_user.salt);
  if (computedHash !== db.admin_user.password_hash) {
    res.status(401).json({ error: 'Invalid admin credentials.' });
    return;
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[token] = {
    userId: db.admin_user.id,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  saveDatabase();

  res.cookie('skyhome_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const profile: UserProfile = {
    id: db.admin_user.id,
    username: db.admin_user.username,
    full_name: db.admin_user.full_name,
    role: 'admin',
    is_temporary_password: db.admin_user.is_temporary_password,
    created_at: db.admin_user.created_at,
  };

  res.json({
    token,
    profile,
    message: db.admin_user.is_temporary_password
      ? 'Logged in with temporary password. Please update your password immediately.'
      : 'Logged in successfully.',
  });
});

// 2. Auth: Check Current User
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.skyhome_session;

  if (!token || !db.sessions[token] || db.sessions[token].expiresAt < Date.now()) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const profile: UserProfile = {
    id: db.admin_user.id,
    username: db.admin_user.username,
    full_name: db.admin_user.full_name,
    role: 'admin',
    is_temporary_password: db.admin_user.is_temporary_password,
    created_at: db.admin_user.created_at,
  };

  res.json({ authenticated: true, profile });
});

// 3. Auth: Change Password
app.post('/api/auth/change-password', authenticateAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current password and new password are required.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const currentComputedHash = hashPassword(currentPassword, db.admin_user.salt);
  if (currentComputedHash !== db.admin_user.password_hash) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  // Update password with new salt
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);

  db.admin_user.salt = newSalt;
  db.admin_user.password_hash = newHash;
  db.admin_user.is_temporary_password = false;
  saveDatabase();

  res.json({ success: true, message: 'Password updated successfully. Temporary status cleared.' });
});

// 4. Auth: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.skyhome_session;

  if (token && db.sessions[token]) {
    delete db.sessions[token];
    saveDatabase();
  }

  res.clearCookie('skyhome_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 5. Properties: List (with filtering)
app.get('/api/properties', (req: Request, res: Response) => {
  const {
    location,
    category,
    minPrice,
    maxPrice,
    bedrooms,
    status,
    featured,
    search,
  } = req.query;

  let results = [...db.properties];

  if (category && category !== 'All') {
    results = results.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (location && location !== 'All') {
    const locLower = (location as string).toLowerCase();
    results = results.filter((p) => p.location.toLowerCase().includes(locLower) || p.address.toLowerCase().includes(locLower));
  }

  if (status && status !== 'All') {
    results = results.filter((p) => p.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (featured === 'true') {
    results = results.filter((p) => p.is_featured);
  }

  if (bedrooms && bedrooms !== 'All') {
    const minBeds = parseInt(bedrooms as string, 10);
    if (!isNaN(minBeds)) {
      results = results.filter((p) => p.bedrooms >= minBeds);
    }
  }

  if (minPrice) {
    const min = parseFloat(minPrice as string);
    if (!isNaN(min)) {
      results = results.filter((p) => p.price >= min);
    }
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    if (!isNaN(max)) {
      results = results.filter((p) => p.price <= max);
    }
  }

  if (search) {
    const term = (search as string).toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.features.some((f) => f.toLowerCase().includes(term))
    );
  }

  // Sort by newest
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    total: results.length,
    properties: results,
  });
});

// 6. Properties: Single property by ID or Slug
app.get('/api/properties/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const property = db.properties.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );

  if (!property) {
    res.status(404).json({ error: 'Property not found.' });
    return;
  }

  res.json({ property });
});

// 7. Properties: Create (Admin Only)
app.post('/api/properties', authenticateAdmin, (req: Request, res: Response) => {
  const {
    title,
    category,
    price,
    location,
    address,
    description,
    bedrooms,
    bathrooms,
    building_size,
    land_size,
    features,
    image_urls,
    status,
    is_featured,
    is_verified,
  } = req.body;

  if (!title || !category || !price || !location) {
    res.status(400).json({ error: 'Title, category, price, and location are required.' });
    return;
  }

  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const uniqueSuffix = Date.now().toString(36);
  const slug = `${baseSlug}-${uniqueSuffix}`;

  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    title: title.trim(),
    slug,
    category,
    price: Number(price),
    location: location.trim(),
    address: address?.trim() || location.trim(),
    description: description?.trim() || '',
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 0,
    building_size: building_size?.trim() || '',
    land_size: land_size?.trim() || '',
    features: Array.isArray(features) ? features : [],
    image_urls: Array.isArray(image_urls) && image_urls.length > 0 ? image_urls : ['/src/assets/images/hero_luxury_lagos_mansion_1792828923387.jpg'],
    status: status || 'Available',
    is_featured: Boolean(is_featured),
    is_verified: Boolean(is_verified),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.properties.unshift(newProperty);
  saveDatabase();

  res.status(201).json({ property: newProperty, message: 'Property created successfully.' });
});

// 8. Properties: Update (Admin Only)
app.put('/api/properties/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.properties.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Property not found.' });
    return;
  }

  const existing = db.properties[index];
  const updated: Property = {
    ...existing,
    ...req.body,
    id: existing.id,
    slug: existing.slug,
    updated_at: new Date().toISOString(),
  };

  if (req.body.price !== undefined) updated.price = Number(req.body.price);
  if (req.body.bedrooms !== undefined) updated.bedrooms = Number(req.body.bedrooms);
  if (req.body.bathrooms !== undefined) updated.bathrooms = Number(req.body.bathrooms);

  db.properties[index] = updated;
  saveDatabase();

  res.json({ property: updated, message: 'Property updated successfully.' });
});

// 9. Properties: Delete (Admin Only)
app.delete('/api/properties/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.properties.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Property not found.' });
    return;
  }

  const deleted = db.properties.splice(index, 1)[0];
  saveDatabase();

  res.json({ success: true, deleted, message: 'Property deleted successfully.' });
});

// 10. Uploads: Image Upload (Admin Only)
app.post('/api/upload', authenticateAdmin, upload.array('photos', 8), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded.' });
    return;
  }

  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls, message: 'Images uploaded successfully.' });
});

// 11. Enquiries: Submit Enquiry (Public)
app.post('/api/enquiries', (req: Request, res: Response) => {
  const { customer_name, customer_phone, customer_email, message, property_id, property_title } = req.body;

  if (!customer_name || !customer_phone || !message) {
    res.status(400).json({ error: 'Name, phone number, and message are required.' });
    return;
  }

  // Validate phone format
  const phoneClean = customer_phone.replace(/\s+/g, '');
  if (phoneClean.length < 8) {
    res.status(400).json({ error: 'Please enter a valid telephone number.' });
    return;
  }

  const newEnquiry: Enquiry = {
    id: `enq-${Date.now()}`,
    property_id: property_id || undefined,
    property_title: property_title || undefined,
    customer_name: customer_name.trim(),
    customer_phone: customer_phone.trim(),
    customer_email: customer_email?.trim() || '',
    message: message.trim(),
    status: 'unread',
    created_at: new Date().toISOString(),
  };

  db.enquiries.unshift(newEnquiry);
  saveDatabase();

  res.status(201).json({
    success: true,
    message: 'Your enquiry has been received. Our luxury real estate advisor will contact you shortly.',
    enquiry: { id: newEnquiry.id },
  });
});

// 12. Enquiries: List (Admin Only)
app.get('/api/enquiries', authenticateAdmin, (_req: Request, res: Response) => {
  res.json({
    total: db.enquiries.length,
    unread_count: db.enquiries.filter((e) => e.status === 'unread').length,
    enquiries: db.enquiries,
  });
});

// 13. Enquiries: Update Status (Admin Only)
app.patch('/api/enquiries/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }

  if (status && ['unread', 'read', 'resolved'].includes(status)) {
    enquiry.status = status;
    saveDatabase();
  }

  res.json({ enquiry, message: 'Enquiry status updated.' });
});

// 14. Enquiries: Delete (Admin Only)
app.delete('/api/enquiries/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.enquiries.findIndex((e) => e.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Enquiry not found.' });
    return;
  }

  db.enquiries.splice(index, 1);
  saveDatabase();

  res.json({ success: true, message: 'Enquiry removed successfully.' });
});

// 15. Settings: Get Settings (Public)
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ settings: db.site_settings });
});

// 16. Settings: Update (Admin Only)
app.put('/api/settings', authenticateAdmin, (req: Request, res: Response) => {
  db.site_settings = {
    ...db.site_settings,
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  saveDatabase();

  res.json({ settings: db.site_settings, message: 'Website settings updated successfully.' });
});

// 17. Supabase: Status & SQL Schema
app.get('/api/supabase/status', authenticateAdmin, (_req: Request, res: Response) => {
  const projectUrl = db.supabase_config?.project_url || process.env.VITE_SUPABASE_URL || '';
  const hasAnonKey = Boolean(db.supabase_config?.anon_key || process.env.VITE_SUPABASE_ANON_KEY);
  const isConfigured = Boolean(projectUrl && hasAnonKey);

  const status: SupabaseConfigStatus = {
    is_configured: isConfigured,
    project_url: projectUrl ? `${projectUrl.slice(0, 15)}...${projectUrl.slice(-8)}` : 'Not configured',
    has_anon_key: hasAnonKey,
    database_status: isConfigured ? 'connected' : 'not_configured',
    storage_status: isConfigured ? 'ready' : 'not_configured',
    message: isConfigured
      ? 'Supabase integration is configured and active for cloud storage.'
      : 'Using built-in secure persistent storage engine. Supabase cloud sync can be connected optionally.',
  };

  const sqlSchema = `-- ==========================================
-- SkyHome Real Estate: Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'agent', 'client')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Houses', 'Apartments', 'Duplexes', 'Residential properties', 'Land')),
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  building_size TEXT,
  land_size TEXT,
  features TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Sold', 'Rented', 'Pending')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  company_name TEXT DEFAULT 'SkyHome',
  tagline TEXT DEFAULT 'Your Dream Home, Our Priority.',
  whatsapp_number TEXT DEFAULT '09024971419',
  contact_email TEXT DEFAULT 'contact@skyhome.ng',
  logo_url TEXT,
  about_content JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read properties & site settings
CREATE POLICY "Public properties are readable by anyone" 
  ON public.properties FOR SELECT USING (true);

CREATE POLICY "Site settings are readable by anyone" 
  ON public.site_settings FOR SELECT USING (true);

-- Public can submit customer enquiries
CREATE POLICY "Public can submit enquiries" 
  ON public.enquiries FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can view enquiries
CREATE POLICY "Enquiries viewable by authenticated users" 
  ON public.enquiries FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users (admins) can manage properties & settings
CREATE POLICY "Admins can manage properties" 
  ON public.properties FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update site settings" 
  ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');
`;

  res.json({ status, sqlSchema });
});

// 18. Supabase: Save Config (Admin Only)
app.post('/api/supabase/configure', authenticateAdmin, (req: Request, res: Response) => {
  const { project_url, anon_key } = req.body;
  db.supabase_config = {
    project_url: project_url || '',
    anon_key: anon_key || '',
  };
  saveDatabase();

  res.json({ success: true, message: 'Supabase configuration saved.' });
});

// Stats: Overview metrics for Admin Dashboard
app.get('/api/admin/metrics', authenticateAdmin, (_req: Request, res: Response) => {
  const totalProperties = db.properties.length;
  const activeListings = db.properties.filter((p) => p.status === 'Available').length;
  const totalEnquiries = db.enquiries.length;
  const unreadMessages = db.enquiries.filter((e) => e.status === 'unread').length;

  res.json({
    totalProperties,
    activeListings,
    totalEnquiries,
    unreadMessages,
  });
});

// Vite / Static Files handler
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkyHome server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SkyHome server:', err);
  process.exit(1);
});
