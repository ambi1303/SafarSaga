# SafarSaga Admin Dashboard - Quick Start Guide

## ✅ Installation Complete!

The admin dashboard has been successfully installed with all dependencies.

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

The backend should be running at `http://localhost:8000`

### 2. Start the Frontend

```bash
cd project
npm run dev
```

The frontend should be running at `http://localhost:3000`

### 3. Access the Admin Dashboard

1. Open your browser and navigate to: `http://localhost:3000/admin/login`
2. Sign in with admin credentials (any user with `is_admin = true`)
3. You'll be redirected to the dashboard at `/admin/dashboard`

## 📋 Admin Dashboard Features

### Available Pages

- **Dashboard** (`/admin/dashboard`) - Overview with statistics and charts
- **Bookings** (`/admin/bookings`) - Manage all bookings
- **Payments** (`/admin/payments`) - Approve/reject payments
- **Users** (`/admin/users`) - Manage user accounts
- **Trips** (`/admin/trips`) - Manage travel packages
- **Analytics** (`/admin/analytics`) - Coming soon
- **Gallery** (`/admin/gallery`) - Coming soon
- **Settings** (`/admin/settings`) - Coming soon

### Key Features

✅ **Authentication**
- Secure admin login
- Role-based access control
- JWT token management

✅ **Dashboard**
- Real-time statistics
- Monthly booking trends
- Top destinations
- Quick actions

✅ **Bookings Management**
- Search and filter bookings
- Update booking status
- View detailed information
- Cancel bookings

✅ **Payment Management**
- Approve pending payments
- Reject payments with reason
- View payment details
- Automatic booking confirmation

✅ **User Management**
- Search users
- View booking history
- Deactivate accounts
- Delete users

## 🔧 Configuration

### Environment Variables

Make sure you have the following in your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Requirements

The admin dashboard requires these backend endpoints:

- `POST /auth/login` - Admin authentication
- `GET /bookings/admin/stats` - Dashboard statistics
- `GET /bookings/` - List bookings
- `GET /bookings/{id}` - Get booking details
- `PUT /bookings/{id}` - Update booking
- `DELETE /bookings/{id}` - Cancel booking
- `GET /bookings/{id}/payment-info` - Payment information
- `POST /bookings/{id}/confirm-payment` - Approve payment
- `GET /users/` - List users (may need to be created)

## 🎯 First Steps

### 1. Create an Admin User

If you don't have an admin user yet, update a user in your database:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### 2. Test the Login

1. Go to `/admin/login`
2. Enter your admin credentials
3. You should be redirected to the dashboard

### 3. Explore the Dashboard

- Check the statistics cards
- View the bookings list
- Try filtering and searching
- Test the payment approval workflow

## 🐛 Troubleshooting

### "Module not found: Can't resolve 'axios'"

This has been fixed! Axios was installed automatically.

### "Access denied. Admin privileges required."

Make sure your user has `is_admin = true` in the database.

### "Failed to fetch statistics"

Check that:
1. Backend is running at `http://localhost:8000`
2. The `/bookings/admin/stats` endpoint exists
3. You're logged in with a valid admin token

### API Errors

Check the browser console (F12) for detailed error messages. Common issues:

- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Not an admin user
- **404 Not Found**: Endpoint doesn't exist
- **500 Server Error**: Backend issue

## 📱 Mobile Testing

The dashboard is fully responsive. Test on:
- Mobile (< 768px) - Hamburger menu
- Tablet (768px - 1024px) - Collapsible sidebar
- Desktop (> 1024px) - Fixed sidebar

## 🎨 Customization

### Change Colors

Edit the color scheme in `components/admin/StatsCard.tsx`:

```typescript
const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
}
```

### Add New Pages

1. Create page in `app/admin/[page-name]/page.tsx`
2. Add route to `components/admin/AdminSidebar.tsx`
3. Use existing components for consistency

## 📚 Documentation

- **Full Documentation**: See `ADMIN_DASHBOARD.md`
- **Implementation Details**: See `ADMIN_DASHBOARD_IMPLEMENTATION.md`
- **API Integration**: See service files in `lib/`

## ✨ What's Next?

### Immediate Tasks

1. ✅ Install dependencies (Done!)
2. ✅ Start backend and frontend
3. ✅ Create admin user
4. ✅ Test login
5. ✅ Explore features

### Future Enhancements

- Add advanced analytics with charts
- Implement bulk operations
- Add export functionality (CSV, PDF)
- Create email notification system
- Add real-time updates

## 🎉 You're All Set!

The admin dashboard is ready to use. Start by logging in at `/admin/login` and exploring the features.

For questions or issues, check the full documentation in `ADMIN_DASHBOARD.md`.

Happy managing! 🚀
