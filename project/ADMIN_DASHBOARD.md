# SafarSaga Admin Dashboard

Complete admin dashboard implementation for managing the SafarSaga travel booking platform.

## Features Implemented

### 1. Authentication & Authorization
- **Admin Login Page** (`/admin/login`)
  - Secure login with email and password
  - Role verification (admin-only access)
  - Automatic redirect for non-admin users
  - Session management with JWT tokens

### 2. Dashboard Layout
- **Responsive Sidebar Navigation**
  - Fixed sidebar on desktop
  - Collapsible hamburger menu on mobile
  - Active route highlighting
  - Quick access to all admin sections

- **Top Navbar**
  - User profile dropdown
  - Notifications indicator
  - Logout functionality
  - Mobile menu toggle

### 3. Dashboard Overview (`/admin/dashboard`)
- **Statistics Cards**
  - Total Bookings
  - Pending Bookings
  - Confirmed Bookings
  - Cancelled Bookings
  - Total Revenue (highlighted card)

- **Visual Analytics**
  - Bookings by month (bar chart visualization)
  - Top destinations ranking
  - Auto-refresh every 5 minutes

- **Quick Actions**
  - Direct links to manage bookings, payments, and trips

### 4. Bookings Management (`/admin/bookings`)
- **Bookings List**
  - Paginated table with 20 items per page
  - Search by booking ID, user, or destination
  - Filter by booking status (pending, confirmed, cancelled)
  - Filter by payment status (unpaid, paid, refunded)
  - Sortable columns

- **Booking Details** (`/admin/bookings/[id]`)
  - Complete booking information
  - User details and contact information
  - Destination details
  - Special requests
  - Update booking status
  - Update payment status
  - Cancel booking with confirmation
  - Quick links to user profile and payment info

### 5. Payment Management (`/admin/payments`)
- **Payments List**
  - View all payments with filtering
  - Highlight pending payments
  - Filter by payment status
  - Paginated results

- **Payment Actions**
  - View detailed payment information
  - Approve payments (confirms booking)
  - Reject payments with reason
  - Confirmation dialogs for all actions

### 6. User Management (`/admin/users`)
- **Users List**
  - View all registered users
  - Search by ID, name, or email
  - Display total bookings and spending per user
  - Admin badge for admin users
  - Paginated results

- **User Actions**
  - View user's booking history
  - Deactivate user accounts
  - Delete users (with warnings)
  - Protection for admin accounts

### 7. Trip Management
- Existing trip management pages enhanced
- Located at `/admin/trips`
- Create, edit, and delete trips
- Image upload integration

### 8. Additional Pages
- **Analytics** (`/admin/analytics`) - Placeholder for future analytics
- **Gallery** (`/admin/gallery`) - Placeholder for media management
- **Settings** (`/admin/settings`) - Placeholder for system settings

## Technical Implementation

### API Integration
- **Centralized API Client** (`lib/admin-api.ts`)
  - Axios-based HTTP client
  - Automatic JWT token injection
  - Request/response interceptors
  - Error handling with status code mapping
  - Automatic redirect on 401 (unauthorized)

- **Service Modules**
  - `lib/bookings-admin.ts` - Booking management
  - `lib/payments-admin.ts` - Payment operations
  - `lib/users-admin.ts` - User management

### Shared Components
- **StatsCard** - Reusable statistics card with loading states
- **DataTable** - Feature-rich table with sorting, pagination, and filtering
- **ConfirmDialog** - Confirmation dialog for destructive actions
- **EmptyState** - Empty state component with call-to-action
- **StatusBadge** - Color-coded status badges for bookings and payments

### State Management
- React hooks for local state
- Toast notifications for user feedback (react-hot-toast)
- Loading states for all async operations
- Error handling with user-friendly messages

### Security Features
- JWT token-based authentication
- Role-based access control (admin-only)
- Protected routes with automatic redirects
- Token expiration handling
- Secure API communication

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Loading skeletons for better perceived performance
- Empty states with helpful messages
- Confirmation dialogs for destructive actions
- Toast notifications for success/error feedback
- Smooth transitions and animations
- Accessible keyboard navigation

## API Endpoints Used

### Bookings
- `GET /bookings/` - List all bookings (with filters)
- `GET /bookings/admin/stats` - Admin statistics
- `GET /bookings/{id}` - Get booking details
- `PUT /bookings/{id}` - Update booking
- `DELETE /bookings/{id}` - Cancel booking
- `GET /bookings/user/{user_id}` - Get user's bookings

### Payments
- `GET /bookings/{id}/payment-info` - Get payment information
- `POST /bookings/{id}/confirm-payment` - Approve payment

### Users
- `GET /users/` - List all users
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

## File Structure

```
project/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin layout with sidebar
│       ├── page.tsx                # Redirect to dashboard
│       ├── login/
│       │   └── page.tsx           # Admin login
│       ├── dashboard/
│       │   └── page.tsx           # Main dashboard
│       ├── bookings/
│       │   ├── page.tsx           # Bookings list
│       │   └── [id]/
│       │       └── page.tsx       # Booking details
│       ├── payments/
│       │   └── page.tsx           # Payments management
│       ├── users/
│       │   └── page.tsx           # Users management
│       ├── trips/
│       │   └── page.tsx           # Trips management (existing)
│       ├── analytics/
│       │   └── page.tsx           # Analytics (placeholder)
│       ├── gallery/
│       │   └── page.tsx           # Gallery (placeholder)
│       └── settings/
│           └── page.tsx           # Settings (placeholder)
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx       # Sidebar navigation
│       ├── AdminNavbar.tsx        # Top navbar
│       ├── StatsCard.tsx          # Statistics card
│       ├── DataTable.tsx          # Reusable table
│       ├── ConfirmDialog.tsx      # Confirmation dialog
│       ├── EmptyState.tsx         # Empty state
│       └── StatusBadge.tsx        # Status badges
└── lib/
    ├── admin-api.ts               # API client
    ├── bookings-admin.ts          # Bookings service
    ├── payments-admin.ts          # Payments service
    └── users-admin.ts             # Users service
```

## Usage

### Accessing the Admin Dashboard

1. Navigate to `/admin/login`
2. Sign in with admin credentials
3. You'll be redirected to `/admin/dashboard`

### Managing Bookings

1. Go to **Bookings** from the sidebar
2. Use search and filters to find specific bookings
3. Click on a booking to view details
4. Update status, payment status, or cancel bookings
5. All changes are logged and reflected immediately

### Approving Payments

1. Go to **Payments** from the sidebar
2. Filter by "Unpaid" to see pending payments
3. Click "View" to see payment details
4. Click "Approve" to confirm payment and booking
5. Click "Reject" to decline payment with a reason

### Managing Users

1. Go to **Users** from the sidebar
2. Search for specific users
3. Click "View" to see user's booking history
4. Deactivate or delete users as needed
5. Admin accounts are protected from deletion

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Dependencies

- `react-hot-toast` - Toast notifications
- `axios` - HTTP client
- `lucide-react` - Icons
- `@radix-ui/*` - UI components (via ShadCN)

## Future Enhancements

### Phase 2 Features
- Advanced analytics with charts (Recharts integration)
- Bulk operations (bulk status updates, bulk emails)
- Export functionality (CSV, PDF)
- Email template management
- SMS notifications
- Advanced filtering and search
- Custom date range reports
- Revenue forecasting
- User segmentation
- Activity logs and audit trail

### Phase 3 Features
- Dark mode support
- Real-time updates with WebSockets
- Mobile app for admins
- Advanced permissions system
- Multi-language support
- Automated reports
- Integration with payment gateways
- Customer support chat

## Troubleshooting

### Login Issues
- Ensure you're using an admin account (is_admin = true)
- Check that the backend is running
- Verify JWT token is being stored correctly
- Clear browser cache and try again

### API Errors
- Check browser console for detailed error messages
- Verify API_BASE_URL is correct
- Ensure backend endpoints are accessible
- Check network tab for failed requests

### Permission Errors
- Verify user has admin role
- Check JWT token is valid and not expired
- Ensure backend auth middleware is working

## Support

For issues or questions:
1. Check the browser console for errors
2. Review the API response in network tab
3. Verify backend logs for server-side issues
4. Check this documentation for usage guidelines

## Credits

Built with:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ShadCN UI
- FastAPI (backend)
