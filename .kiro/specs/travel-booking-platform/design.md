# Travel Booking Platform Design Document

## Overview

This design document outlines the architecture for transforming SafarSaga into a comprehensive travel booking platform. The system integrates Supabase for database management, Cloudinary for media storage, UPI payment systems, and provides both user and admin interfaces for complete travel booking management.

## Architecture

### System Architecture Overview

```
SafarSaga Travel Booking Platform
├── Frontend Layer (Next.js 13)
│   ├── Public Pages (Landing, Gallery, Trips)
│   ├── User Dashboard (Bookings, Profile, History)
│   ├── Admin Dashboard (Management Interface)
│   └── Authentication (Login, Register, Role-based)
├── API Layer (Next.js API Routes)
│   ├── Authentication API (Supabase Auth)
│   ├── Trip Management API
│   ├── Booking Management API
│   ├── Payment Processing API
│   └── Gallery Management API
├── Database Layer (Supabase PostgreSQL)
│   ├── Users Table
│   ├── Events/Trips Table
│   ├── Tickets/Bookings Table
│   └── Gallery Images Table
├── External Services
│   ├── Cloudinary (Image Management)
│   ├── UPI Payment Gateway
│   └── Email Service (Notifications)
└── Analytics & Monitoring
    ├── User Behavior Tracking
    ├── Booking Analytics
    └── Performance Monitoring
```

### Database Schema Design

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Handled by Supabase Auth
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Events/Trips Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  price DECIMAL(10,2),
  max_capacity INTEGER,
  current_bookings INTEGER DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  itinerary JSONB,
  inclusions TEXT[],
  exclusions TEXT[],
  difficulty_level TEXT,
  featured_image_url TEXT,
  gallery_images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tickets/Bookings Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  seats INTEGER NOT NULL,
  total_amount DECIMAL(10,2),
  booking_status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_method TEXT,
  transaction_id TEXT,
  upi_qr_code TEXT,
  special_requests TEXT,
  booked_at TIMESTAMP DEFAULT NOW(),
  payment_confirmed_at TIMESTAMP
);
```

#### Gallery Images Table
```sql
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_public_id TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  tags TEXT[],
  event_id UUID REFERENCES events(id), -- Optional link to specific trip
  uploaded_by UUID REFERENCES users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## Components and Interfaces

### 1. Authentication System

**Purpose**: Handle user registration, login, and role-based access control

**Key Features**:
- Supabase Auth integration
- Role-based permissions (admin/user)
- Protected routes and API endpoints
- Session management

**Interface Structure**:
```typescript
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}
```

### 2. Trip Management System

**Purpose**: Admin interface for creating and managing travel packages

**Key Features**:
- CRUD operations for trips/events
- Capacity management
- Pricing and availability control
- Image gallery integration

**Interface Structure**:
```typescript
interface Trip {
  id: string;
  name: string;
  description: string;
  destination: string;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  startDate: string;
  endDate: string;
  itinerary: ItineraryItem[];
  inclusions: string[];
  exclusions: string[];
  difficultyLevel: 'Easy' | 'Moderate' | 'Challenging';
  featuredImageUrl: string;
  galleryImages: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}
```

### 3. Booking Management System

**Purpose**: Handle trip bookings, payments, and customer management

**Key Features**:
- Booking creation and management
- Payment processing integration
- Booking confirmation and notifications
- Admin booking oversight

**Interface Structure**:
```typescript
interface Booking {
  id: string;
  userId: string;
  eventId: string;
  seats: number;
  totalAmount: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  upiQrCode?: string;
  specialRequests?: string;
  bookedAt: string;
  paymentConfirmedAt?: string;
  
  // Populated fields
  user?: AuthUser;
  event?: Trip;
}
```

### 4. Payment Integration System

**Purpose**: Handle UPI payments and transaction verification

**Key Features**:
- UPI QR code generation
- Transaction ID verification
- Payment status tracking
- Admin payment management

**Interface Structure**:
```typescript
interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PaymentResponse {
  qrCodeUrl: string;
  paymentId: string;
  expiresAt: string;
}

interface PaymentVerification {
  transactionId: string;
  bookingId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
}
```

### 5. Enhanced Gallery System

**Purpose**: Manage travel photos with trip associations and metadata

**Key Features**:
- Cloudinary integration with database metadata
- Trip-specific image galleries
- SEO-optimized image management
- Admin image organization tools

**Interface Structure**:
```typescript
interface GalleryImage {
  id: string;
  cloudinaryPublicId: string;
  url: string;
  filename: string;
  altText: string;
  caption: string;
  description: string;
  tags: string[];
  eventId?: string;
  uploadedBy: string;
  isFeatured: boolean;
  uploadedAt: string;
  
  // Populated fields
  event?: Trip;
  uploader?: AuthUser;
}
```

## Data Models

### API Response Models

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Dashboard Analytics Models

```typescript
interface AdminDashboardData {
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  totalUsers: number;
  recentBookings: Booking[];
  popularTrips: Trip[];
  monthlyRevenue: MonthlyRevenue[];
  bookingTrends: BookingTrend[];
}

interface UserDashboardData {
  upcomingTrips: Booking[];
  pastTrips: Booking[];
  totalTripsBooked: number;
  totalAmountSpent: number;
  favoriteDestinations: string[];
}
```

## Error Handling

### API Error Handling

1. **Authentication Errors**: Invalid credentials, expired sessions, insufficient permissions
2. **Validation Errors**: Invalid input data, missing required fields
3. **Business Logic Errors**: Booking capacity exceeded, trip not available, payment failures
4. **Database Errors**: Connection issues, constraint violations, transaction failures
5. **External Service Errors**: Cloudinary upload failures, payment gateway issues

### User Experience Error Handling

1. **Graceful Degradation**: Fallback UI when services are unavailable
2. **Error Messages**: User-friendly error messages with actionable guidance
3. **Retry Mechanisms**: Automatic retry for transient failures
4. **Offline Support**: Basic functionality when network is unavailable

## Testing Strategy

### Unit Testing

1. **API Route Testing**: Test all CRUD operations and business logic
2. **Component Testing**: Test React components with various props and states
3. **Utility Function Testing**: Test helper functions and data transformations
4. **Authentication Testing**: Test login, registration, and permission checks

### Integration Testing

1. **Database Integration**: Test Supabase operations and data consistency
2. **Payment Integration**: Test UPI payment flow and verification
3. **Cloudinary Integration**: Test image upload and management
4. **Email Integration**: Test notification sending and delivery

### End-to-End Testing

1. **User Journey Testing**: Complete booking flow from discovery to payment
2. **Admin Workflow Testing**: Trip creation, booking management, gallery management
3. **Cross-Device Testing**: Ensure functionality across desktop, tablet, and mobile
4. **Performance Testing**: Load testing for concurrent bookings and high traffic

## Implementation Specifications

### Supabase Configuration

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Row Level Security (RLS) Policies**:
```sql
-- Users can only view/edit their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Only admins can manage events
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON tickets
  FOR SELECT USING (auth.uid() = user_id);
```

### Payment Integration Implementation

**UPI QR Code Generation**:
```typescript
async function generateUPIQRCode(paymentRequest: PaymentRequest): Promise<string> {
  const upiString = `upi://pay?pa=safarsaga@paytm&pn=SafarSaga Travel&am=${paymentRequest.amount}&cu=INR&tn=Trip Booking ${paymentRequest.bookingId}`;
  
  // Generate QR code using a QR code library
  const qrCodeUrl = await QRCode.toDataURL(upiString);
  return qrCodeUrl;
}
```

### Analytics Implementation

**Booking Analytics**:
```typescript
async function getBookingAnalytics(dateRange: DateRange): Promise<BookingAnalytics> {
  const { data } = await supabase
    .from('tickets')
    .select(`
      *,
      events(name, destination),
      users(full_name, email)
    `)
    .gte('booked_at', dateRange.start)
    .lte('booked_at', dateRange.end);

  return {
    totalBookings: data.length,
    totalRevenue: data.reduce((sum, booking) => sum + booking.total_amount, 0),
    popularDestinations: getPopularDestinations(data),
    conversionRate: calculateConversionRate(data)
  };
}
```

### Real-time Updates

**Supabase Realtime Integration**:
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('booking-updates')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'tickets' },
      (payload) => {
        // Update UI with new booking
        setBookings(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

This comprehensive design provides the foundation for building a full-featured travel booking platform that scales with SafarSaga's business needs while maintaining excellent user experience and administrative efficiency.