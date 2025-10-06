# Admin Dashboard Design Document

## Overview

The SafarSaga Admin Dashboard is a comprehensive React-based administrative interface that provides full control over the travel booking platform. Built with Next.js 14, TypeScript, Tailwind CSS, and ShadCN UI components, the dashboard integrates seamlessly with the existing FastAPI backend to enable administrators to manage bookings, payments, users, and travel packages through an intuitive, responsive interface.

The design follows modern dashboard patterns with a fixed sidebar navigation, centralized API management, role-based access control, and real-time data updates. The architecture prioritizes security, performance, and user experience while maintaining consistency with the existing SafarSaga frontend codebase.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard UI                       │
│                    (Next.js 14 + React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Admin      │  │   Shared     │      │
│  │   Context    │  │   Pages      │  │   Components │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Centralized API Client (Axios)             │   │
│  │         - Request Interceptors (Auth Token)          │   │
│  │         - Response Interceptors (Error Handling)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                           │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Bookings │  │   Auth   │  │  Users   │  │  Trips   │   │
│  │  Router  │  │  Router  │  │  Router  │  │  Router  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Supabase Service Layer                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Supabase Database                         │
│         (PostgreSQL + Auth + Storage)                        │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
project/
├── app/
│   └── admin/
│       ├── layout.tsx                 # Admin layout with sidebar
│       ├── login/
│       │   └── page.tsx              # Admin login page
│       ├── dashboard/
│       │   └── page.tsx              # Main dashboard with stats
│       ├── bookings/
│       │   ├── page.tsx              # Bookings list & management
│       │   └── [id]/
│       │       └── page.tsx          # Booking details
│       ├── payments/
│       │   └── page.tsx              # Payment management
│       ├── users/
│       │   ├── page.tsx              # Users list
│       │   └── [id]/
│       │       └── page.tsx          # User details & bookings
│       └── trips/
│           ├── page.tsx              # Trips list (already exists)
│           ├── new/
│           │   └── page.tsx          # Create trip (already exists)
│           └── [id]/
│               └── edit/
│                   └── page.tsx      # Edit trip
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx          # Fixed sidebar navigation
│       ├── AdminNavbar.tsx           # Top navbar with user menu
│       ├── StatsCard.tsx             # Reusable stats card
│       ├── DataTable.tsx             # Reusable table component
│       ├── BookingStatusBadge.tsx    # Status badge component
│       ├── PaymentStatusBadge.tsx    # Payment status badge
│       ├── ConfirmDialog.tsx         # Confirmation dialog
│       ├── EmptyState.tsx            # Empty state component
│       └── charts/
│           ├── BookingsChart.tsx     # Bookings trend chart
│           └── RevenueChart.tsx      # Revenue chart
├── lib/
│   ├── admin-api.ts                  # Admin-specific API client
│   ├── bookings-admin.ts             # Booking management service
│   ├── payments-admin.ts             # Payment management service
│   └── users-admin.ts                # User management service
└── hooks/
    ├── useAdminStats.ts              # Hook for admin statistics
    ├── useBookings.ts                # Hook for bookings data
    └── usePayments.ts                # Hook for payments data
```

## Components and Interfaces

### 1. Authentication & Authorization

#### AdminLoginPage (`app/admin/login/page.tsx`)

**Purpose:** Secure login interface for administrators

**Key Features:**
- Email and password input fields
- Form validation with error display
- JWT token storage in localStorage
- Role verification (is_admin check)
- Redirect to dashboard on success
- Error handling for invalid credentials

**State Management:**
```typescript
interface LoginState {
  email: string
  password: string
  loading: boolean
  error: string | null
}
```

**Integration:**
- Uses existing `AuthContext` for authentication
- Calls `/api/auth/login` endpoint
- Verifies `user.is_admin === true` before allowing access
- Redirects non-admin users to regular dashboard

#### ProtectedAdminRoute Component

**Purpose:** HOC to protect admin routes

**Implementation:**
```typescript
interface ProtectedAdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Checks:
// 1. User is authenticated
// 2. User has is_admin = true
// 3. Token is valid and not expired
// 4. Redirects to /admin/login if checks fail
```

### 2. Admin Layout

#### AdminLayout (`app/admin/layout.tsx`)

**Purpose:** Consistent layout for all admin pages

**Structure:**
```
┌─────────────────────────────────────────────────┐
│              AdminNavbar (Top)                   │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│  Admin   │                                       │
│ Sidebar  │        Page Content                  │
│ (Fixed)  │                                       │
│          │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

**Features:**
- Fixed sidebar on desktop (250px width)
- Collapsible sidebar on mobile (hamburger menu)
- Top navbar with user info and logout
- Breadcrumb navigation
- Responsive grid layout

#### AdminSidebar Component

**Navigation Items:**
```typescript
const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Trips', href: '/admin/trips', icon: MapPin },
  { label: 'Gallery', href: '/admin/gallery', icon: Camera },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings }
]
```

**Features:**
- Active route highlighting
- Icon + label for each item
- Collapsible on mobile
- Smooth transitions
- Logout button at bottom

#### AdminNavbar Component

**Features:**
- Breadcrumb navigation
- Search bar (global search)
- Notifications dropdown
- User profile dropdown with:
  - Profile link
  - Settings link
  - Logout button
- Mobile menu toggle

### 3. Dashboard Page

#### AdminDashboard (`app/admin/dashboard/page.tsx`)

**Purpose:** Overview of key metrics and recent activity

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Stats Cards (4 columns)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │Total │ │Pending│ │Confirm│ │Cancel│          │
│  │Books │ │Payment│ │Payment│ │Books │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
├─────────────────────────────────────────────────┤
│  Charts Section (2 columns)                     │
│  ┌──────────────────┐ ┌──────────────────┐    │
│  │ Bookings Trend   │ │ Top Destinations │    │
│  │ (Line Chart)     │ │ (Bar Chart)      │    │
│  └──────────────────┘ └──────────────────┘    │
├─────────────────────────────────────────────────┤
│  Recent Activity Table                          │
│  - Latest bookings                              │
│  - Recent payments                              │
│  - Quick actions                                │
└─────────────────────────────────────────────────┘
```

**Data Sources:**
- `GET /api/bookings/admin/stats` for statistics
- Auto-refresh every 5 minutes
- Real-time updates on user actions

**Stats Cards:**
```typescript
interface AdminStats {
  total_bookings: number
  total_revenue: number
  pending_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  bookings_by_month: Array<{
    month: string
    count: number
    revenue: number
  }>
  top_destinations: Array<{
    destination_id: string
    destination_name: string
    booking_count: number
  }>
}
```

**Charts:**
- Recharts library for visualizations
- Responsive charts that adapt to screen size
- Interactive tooltips
- Export functionality

### 4. Bookings Management

#### BookingsPage (`app/admin/bookings/page.tsx`)

**Purpose:** Comprehensive booking management interface

**Features:**
- Searchable and filterable table
- Bulk actions support
- Status updates
- Export to CSV
- Pagination

**Table Columns:**
```typescript
interface BookingTableRow {
  id: string
  booking_id: string // Display ID
  user_name: string
  user_email: string
  destination_name: string
  travel_date: string
  seats: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  created_at: string
  actions: JSX.Element
}
```

**Filters:**
- Search by: User name, email, booking ID, destination
- Filter by: Booking status, Payment status, Date range
- Sort by: Date, Amount, Status

**Actions:**
- View details (modal or detail page)
- Update status (dropdown)
- Cancel booking (with confirmation)
- View payment info
- Send notification to user

**Status Update Flow:**
```typescript
const updateBookingStatus = async (
  bookingId: string,
  newStatus: BookingStatus
) => {
  // 1. Show confirmation dialog
  // 2. Call PUT /api/bookings/{bookingId}
  // 3. Update local state
  // 4. Show success toast
  // 5. Refresh booking list
}
```

#### BookingDetailsModal Component

**Purpose:** Display detailed booking information

**Sections:**
- Booking Information (ID, dates, status)
- User Information (name, email, phone)
- Destination Details (name, location, price)
- Payment Information (amount, status, method)
- Contact Information (phone, special requests)
- Action Buttons (Update, Cancel, Contact User)

### 5. Payment Management

#### PaymentsPage (`app/admin/payments/page.tsx`)

**Purpose:** Review and approve payments

**Features:**
- Pending payments highlighted
- Payment info viewer
- Approve/Reject actions
- Payment history
- Revenue analytics

**Table Columns:**
```typescript
interface PaymentTableRow {
  booking_id: string
  user_name: string
  user_email: string
  destination_name: string
  amount: number
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  actions: JSX.Element
}
```

**Payment Info Modal:**
```typescript
interface PaymentInfo {
  booking_id: string
  amount: number
  currency: string
  payment_method: string
  transaction_id: string
  payment_date: string
  payer_name: string
  payer_email: string
  payment_proof_url?: string
  notes?: string
}
```

**Approval Flow:**
```typescript
const approvePayment = async (bookingId: string) => {
  // 1. Show confirmation dialog
  // 2. Call POST /api/bookings/{bookingId}/confirm-payment
  // 3. Update booking status to 'confirmed'
  // 4. Update payment status to 'paid'
  // 5. Send confirmation email to user
  // 6. Show success toast
  // 7. Refresh payments list
}
```

**Rejection Flow:**
```typescript
const rejectPayment = async (
  bookingId: string,
  reason: string
) => {
  // 1. Show rejection reason dialog
  // 2. Update booking with rejection reason
  // 3. Notify user via email
  // 4. Show success toast
  // 5. Refresh payments list
}
```

### 6. User Management

#### UsersPage (`app/admin/users/page.tsx`)

**Purpose:** Manage user accounts and view user activity

**Features:**
- User list with search and filters
- View user bookings
- Deactivate/Activate users
- Delete users (with warnings)
- User statistics

**Table Columns:**
```typescript
interface UserTableRow {
  id: string
  full_name: string
  email: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  total_bookings: number
  total_spent: number
  status: 'active' | 'inactive'
  actions: JSX.Element
}
```

**User Details Modal:**
- Personal Information
- Booking History (from `GET /api/bookings/user/{user_id}`)
- Payment History
- Account Status
- Activity Log

**Actions:**
- View Bookings
- Deactivate/Activate
- Delete (with confirmation)
- Send Email
- Reset Password

### 7. Trip Management

**Note:** Trip management pages already exist (`/admin/trips`, `/admin/trips/new`). We'll enhance them with:

**Enhancements:**
- Better image upload with Cloudinary integration
- Bulk operations (activate/deactivate multiple trips)
- Duplicate trip functionality
- Advanced filtering and sorting
- Trip analytics (views, bookings, revenue)

### 8. Shared Components

#### StatsCard Component

```typescript
interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  loading?: boolean
}
```

**Features:**
- Icon with colored background
- Large value display
- Optional trend indicator
- Loading skeleton state
- Responsive sizing

#### DataTable Component

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    column: string
    direction: 'asc' | 'desc'
    onSortChange: (column: string, direction: 'asc' | 'desc') => void
  }
  filters?: FilterConfig[]
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
}
```

**Features:**
- Sortable columns
- Filterable columns
- Pagination controls
- Loading states
- Empty states
- Row selection
- Bulk actions
- Export functionality

#### ConfirmDialog Component

```typescript
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  loading?: boolean
}
```

#### EmptyState Component

```typescript
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

## Data Models

### Admin API Models

```typescript
// Admin Statistics
interface AdminBookingStats {
  total_bookings: number
  total_revenue: number
  pending_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  bookings_by_month: MonthlyStats[]
  top_destinations: DestinationStats[]
}

interface MonthlyStats {
  month: string // "2025-01"
  count: number
  revenue: number
}

interface DestinationStats {
  destination_id: string
  destination_name: string
  booking_count: number
  total_revenue: number
}

// Booking Management
interface BookingListItem {
  id: string
  user_id: string
  user_name: string
  user_email: string
  destination_id: string
  destination_name: string
  travel_date: string
  seats: number
  total_amount: number
  booking_status: BookingStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

interface BookingDetails extends BookingListItem {
  special_requests?: string
  contact_info?: {
    phone: string
    email: string
  }
  destination_details: {
    name: string
    location: string
    average_cost_per_day: number
  }
  payment_info?: PaymentInfo
}

// Payment Management
interface PaymentInfo {
  booking_id: string
  amount: number
  currency: string
  payment_method?: string
  transaction_id?: string
  payment_date?: string
  payment_confirmed_at?: string
  payer_name: string
  payer_email: string
  payment_proof_url?: string
  notes?: string
}

// User Management
interface UserListItem {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  total_bookings: number
  total_spent: number
  last_booking_date?: string
}

interface UserDetails extends UserListItem {
  bookings: BookingListItem[]
  account_status: 'active' | 'inactive' | 'suspended'
}

// API Response Types
interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  has_next: boolean
  has_prev: boolean
}

interface ApiError {
  detail: string
  status_code: number
  error_code?: string
}
```

## Error Handling

### Error Handling Strategy

**1. API Error Interceptor:**
```typescript
// In admin-api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          TokenManager.clear()
          window.location.href = '/admin/login'
          break
        case 403:
          // Forbidden - show access denied
          toast.error('Access denied. Admin privileges required.')
          break
        case 404:
          // Not found
          toast.error('Resource not found')
          break
        case 422:
          // Validation error
          const validationError = error.response.data.detail
          toast.error(validationError || 'Validation failed')
          break
        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error('An unexpected error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    }
    return Promise.reject(error)
  }
)
```

**2. Component-Level Error Boundaries:**
```typescript
class AdminErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Admin dashboard error:', error, errorInfo)
    // Show user-friendly error page
  }
}
```

**3. Form Validation:**
- Client-side validation with react-hook-form
- Server-side validation error display
- Field-level error messages
- Form-level error summary

**4. Loading States:**
- Skeleton screens for initial loads
- Spinners for actions
- Disabled buttons during operations
- Progress indicators for uploads

**5. Empty States:**
- Helpful messages when no data
- Action buttons to create content
- Illustrations or icons
- Search/filter reset options

## Testing Strategy

### Unit Tests

**Components to Test:**
- StatsCard rendering and props
- DataTable sorting and filtering
- ConfirmDialog interactions
- Form validation logic
- API client functions

**Tools:**
- Jest for test runner
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

### Integration Tests

**Flows to Test:**
- Admin login flow
- Booking status update flow
- Payment approval flow
- User management operations
- Trip CRUD operations

### E2E Tests

**Critical Paths:**
- Admin login → Dashboard → View stats
- Bookings → Search → Update status
- Payments → View info → Approve
- Users → View bookings → Deactivate
- Trips → Create → Edit → Delete

**Tools:**
- Playwright or Cypress for E2E testing

### Manual Testing Checklist

- [ ] Responsive design on mobile, tablet, desktop
- [ ] Dark mode compatibility (if implemented)
- [ ] Keyboard navigation
- [ ] Screen reader accessibility
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Performance with large datasets
- [ ] Error handling for all failure scenarios
- [ ] Security: Token expiration, role verification

## Security Considerations

### Authentication & Authorization

**1. Token Management:**
- JWT tokens stored in localStorage
- Automatic token refresh before expiration
- Token validation on every protected route
- Secure token transmission (HTTPS only)

**2. Role Verification:**
- Client-side role check (is_admin)
- Server-side role verification for all admin endpoints
- Protected routes with ProtectedAdminRoute HOC
- Redirect non-admin users immediately

**3. CSRF Protection:**
- CSRF tokens for state-changing operations
- SameSite cookie attributes
- Origin validation

### Data Security

**1. Sensitive Data Handling:**
- Never log passwords or tokens
- Mask sensitive user data in logs
- Secure file uploads (validation, size limits)
- Sanitize user inputs

**2. API Security:**
- HTTPS for all API calls
- Request rate limiting
- Input validation on client and server
- SQL injection prevention (parameterized queries)

### Audit Logging

**Admin Actions to Log:**
- User account modifications
- Booking status changes
- Payment approvals/rejections
- Trip deletions
- Bulk operations

**Log Format:**
```typescript
interface AuditLog {
  timestamp: string
  admin_id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id: string
  changes: Record<string, any>
  ip_address: string
  user_agent: string
}
```

## Performance Optimization

### Frontend Optimization

**1. Code Splitting:**
- Lazy load admin pages
- Dynamic imports for charts
- Separate bundle for admin routes

**2. Data Fetching:**
- SWR or React Query for caching
- Optimistic updates
- Pagination for large lists
- Debounced search inputs

**3. Rendering Optimization:**
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Virtual scrolling for long lists

### Backend Optimization

**1. Database Queries:**
- Use PostgreSQL functions for aggregations
- Indexed columns for filtering
- Efficient joins
- Query result caching

**2. API Response:**
- Pagination for all list endpoints
- Field selection (only return needed fields)
- Response compression
- CDN for static assets

## Accessibility

### WCAG 2.1 AA Compliance

**1. Keyboard Navigation:**
- Tab order for all interactive elements
- Focus indicators
- Keyboard shortcuts for common actions
- Skip navigation links

**2. Screen Reader Support:**
- Semantic HTML elements
- ARIA labels and roles
- Alt text for images
- Descriptive link text

**3. Visual Accessibility:**
- Sufficient color contrast (4.5:1 minimum)
- Text resizing support
- No information conveyed by color alone
- Focus indicators

**4. Forms:**
- Label associations
- Error announcements
- Required field indicators
- Helpful error messages

## Deployment Considerations

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.safarsaga.com
NEXT_PUBLIC_ADMIN_API_URL=https://api.safarsaga.com/admin

# Authentication
NEXT_PUBLIC_JWT_SECRET=<secret>
NEXT_PUBLIC_TOKEN_EXPIRY=3600

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
```

### Build Configuration

```javascript
// next.config.js
module.exports = {
  // Admin routes optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

### Monitoring & Analytics

**1. Error Tracking:**
- Sentry for error monitoring
- Custom error boundaries
- API error logging

**2. Performance Monitoring:**
- Web Vitals tracking
- API response time monitoring
- User interaction tracking

**3. Usage Analytics:**
- Admin action tracking
- Feature usage metrics
- User flow analysis

## Future Enhancements

### Phase 2 Features

1. **Advanced Analytics:**
   - Custom date range reports
   - Revenue forecasting
   - Booking trends analysis
   - User behavior analytics

2. **Bulk Operations:**
   - Bulk booking updates
   - Bulk email notifications
   - CSV import/export
   - Batch payment processing

3. **Communication:**
   - In-app messaging with users
   - Email template management
   - SMS notifications
   - Push notifications

4. **Advanced User Management:**
   - User roles and permissions
   - Custom user groups
   - Activity logs per user
   - User segmentation

5. **Reporting:**
   - Scheduled reports
   - Custom report builder
   - PDF export
   - Email reports

6. **Dark Mode:**
   - Theme toggle
   - Persistent theme preference
   - System theme detection

7. **Mobile App:**
   - React Native admin app
   - Push notifications
   - Offline support
   - Quick actions

## Design System

### Color Palette

```css
/* Primary Colors */
--admin-primary: #f97316; /* Orange 500 */
--admin-primary-hover: #ea580c; /* Orange 600 */

/* Status Colors */
--status-success: #10b981; /* Green 500 */
--status-warning: #f59e0b; /* Amber 500 */
--status-error: #ef4444; /* Red 500 */
--status-info: #3b82f6; /* Blue 500 */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-900: #111827;

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
```

### Typography

```css
/* Headings */
h1: 2.25rem (36px), font-bold
h2: 1.875rem (30px), font-semibold
h3: 1.5rem (24px), font-semibold
h4: 1.25rem (20px), font-medium

/* Body */
body: 1rem (16px), font-normal
small: 0.875rem (14px), font-normal
```

### Spacing

```css
/* Consistent spacing scale */
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Component Patterns

**Cards:**
- White background
- Subtle shadow
- Rounded corners (8px)
- Padding: 1.5rem

**Buttons:**
- Primary: Orange background
- Secondary: Gray outline
- Destructive: Red background
- Height: 40px (default)
- Border radius: 6px

**Tables:**
- Striped rows
- Hover state
- Sticky header
- Responsive horizontal scroll

**Forms:**
- Label above input
- Error message below input
- Required field indicator (*)
- Focus ring on inputs

## Conclusion

This design document provides a comprehensive blueprint for building the SafarSaga Admin Dashboard. The architecture prioritizes security, performance, and user experience while maintaining consistency with the existing codebase. The modular component structure allows for easy maintenance and future enhancements.

The implementation will follow React and Next.js best practices, utilize TypeScript for type safety, and integrate seamlessly with the existing FastAPI backend. The responsive design ensures administrators can manage the platform from any device, while the comprehensive error handling and security measures protect sensitive data and operations.
