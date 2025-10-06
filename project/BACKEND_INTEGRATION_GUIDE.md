# Backend Integration Guide

This guide explains how the frontend has been integrated with the FastAPI backend for authentication and booking management.

## 🔧 **Changes Made**

### 1. **New Authentication System**

#### **Files Created:**
- `lib/auth-api.ts` - Backend API integration service
- `components/auth/ProtectedRoute.tsx` - Route protection component
- `components/auth/LoginRequiredModal.tsx` - Login modal for booking flows

#### **Files Updated:**
- `contexts/AuthContext.tsx` - Updated to use backend API instead of Supabase
- `app/auth/login/page.tsx` - Added redirect handling after login
- `app/auth/register/page.tsx` - Added redirect handling after signup
- `components/Header.tsx` - Updated to use new auth context
- `app/dashboard/page.tsx` - Added route protection
- `app/admin/page.tsx` - Added admin route protection

### 2. **Booking System Integration**

#### **Files Updated:**
- `lib/bookings.ts` - Updated to use backend API endpoints
- `app/trips/[id]/page.tsx` - Added login requirement for booking

### 3. **Environment Configuration**

#### **Files Created:**
- `.env.local` - Frontend environment variables

## 🚀 **How It Works**

### **Authentication Flow:**

1. **Login/Signup**: Users authenticate via `/auth/login` or `/auth/signup` endpoints
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Auto-refresh**: Tokens are automatically refreshed when expired
4. **Route Protection**: Protected routes redirect to login if not authenticated
5. **Admin Access**: Admin routes check `is_admin` flag from user profile

### **Booking Flow:**

1. **Browse Trips**: Users can view trips without authentication
2. **Book Trip**: Clicking "Book Now" checks authentication
3. **Login Required**: Shows modal if not logged in
4. **Redirect**: After login, users return to the trip page
5. **Complete Booking**: Authenticated users can complete bookings

## 🔐 **Authentication Features**

### **Login Required Modal**
- Appears when unauthenticated users try to book
- Provides options to login or signup
- Remembers the page to redirect back to

### **Protected Routes**
- `/dashboard` - Requires authentication
- `/admin/*` - Requires admin privileges
- `/profile` - Requires authentication

### **Auto-redirect**
- After login/signup, users return to their intended page
- Admin users are redirected to admin dashboard
- Regular users go to user dashboard

## 📱 **User Experience**

### **For Regular Users:**
1. Browse trips freely
2. Click "Book Now" on any trip
3. If not logged in, see login modal
4. After authentication, return to booking
5. Complete booking process

### **For Admin Users:**
1. Login with admin account
2. Automatically redirected to admin dashboard
3. Access to trip management, bookings, etc.

## 🛠 **Setup Instructions**

### **1. Backend Setup**
Ensure your FastAPI backend is running on `http://localhost:8000` with:
- Authentication endpoints (`/auth/login`, `/auth/signup`, etc.)
- Booking endpoints (`/bookings`, etc.)
- Admin user created in database

### **2. Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### **3. Environment Variables**
Update `.env.local` with your backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔍 **Testing the Integration**

### **Test Authentication:**
1. Go to `/auth/login`
2. Login with: `safarsagatrips@gmail.com` (admin account)
3. Should redirect to admin dashboard

### **Test Booking Flow:**
1. Go to any trip page (e.g., `/trips/1`)
2. Click "Book Now" without being logged in
3. Should see login required modal
4. Login and verify redirect back to trip page
5. Complete booking process

### **Test Route Protection:**
1. Try accessing `/admin` without login
2. Should redirect to login page
3. Try accessing `/admin` with regular user
4. Should redirect to dashboard

## 🚨 **Important Notes**

### **Token Management:**
- Tokens are stored in localStorage
- Automatically refreshed when expired
- Cleared on logout or when invalid

### **Error Handling:**
- Network errors show user-friendly messages
- Invalid tokens trigger re-authentication
- Failed requests provide specific error messages

### **Security:**
- All API calls include Authorization header
- Admin routes verify user permissions
- Sensitive operations require authentication

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Authentication required" errors**
   - Check if backend is running
   - Verify API_URL in .env.local
   - Check browser console for network errors

2. **Login redirects not working**
   - Clear localStorage and try again
   - Check sessionStorage for redirect URLs
   - Verify user roles in database

3. **Admin access denied**
   - Verify user has `is_admin: true` in database
   - Check JWT token contains admin flag
   - Ensure admin SQL query was run

### **Debug Steps:**
1. Open browser developer tools
2. Check Network tab for API calls
3. Check Console for JavaScript errors
4. Check Application tab for localStorage tokens
5. Verify backend logs for authentication issues

## 📋 **Next Steps**

1. **Test all authentication flows**
2. **Verify booking system works end-to-end**
3. **Test admin functionality**
4. **Add error boundaries for better UX**
5. **Implement proper loading states**
6. **Add booking confirmation pages**

The integration is now complete and ready for testing!