# 🚀 Complete Backend Setup Guide

## Overview

This guide sets up a complete backend integration with proper CRUD operations for the SafarSaga booking system. All destinations from the frontend will be populated in the database, and booking operations will use real backend APIs.

## 🏗️ **Setup Steps**

### **Step 1: Backend Environment Setup**

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
# Copy and update .env file
cp .env.example .env

# Update .env with your Supabase credentials:
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
```

### **Step 2: Database Setup**

1. **Run the complete database setup:**
```bash
python setup_complete_database.py
```

This will:
- ✅ Create all necessary tables
- ✅ Populate with all 8 destinations from the frontend
- ✅ Set up proper relationships and constraints
- ✅ Verify data integrity

2. **Expected output:**
```
🚀 Setting up complete SafarSaga database...
📊 Checking existing destinations...
🏗️  Creating/Updating destinations...
   ✅ Created: Manali & Kasol 2N/3D
   ✅ Created: Chakrata 1N/2D
   ✅ Created: Jibhi 2N/3D
   ✅ Created: Chopta 2N/3D
   ✅ Created: Udaipur 2N/3D
   ✅ Created: Auli 2N/3D
   ✅ Created: Jaisalmer 2N/3D
   ✅ Created: Manali & Kasol 3N/4D
📈 Database setup completed!
🎉 Database setup completed successfully!
```

### **Step 3: Start Backend Services**

1. **Start the FastAPI server:**
```bash
python -m uvicorn app.main:app --reload --port 8000
```

2. **Verify backend is running:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### **Step 4: Frontend Configuration**

1. **Navigate to frontend directory:**
```bash
cd ../project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update environment variables:**
```bash
# Create or update .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. **Start frontend:**
```bash
npm run dev
```

## 🎯 **What's Now Working**

### **✅ Complete CRUD Operations**

#### **1. Destinations Management**
- **GET /events** - List all destinations with filtering
- **GET /events/{id}** - Get specific destination
- **POST /events** - Create new destination (admin)
- **PUT /events/{id}** - Update destination (admin)
- **DELETE /events/{id}** - Delete destination (admin)

#### **2. Booking Management**
- **GET /bookings** - List user's bookings
- **GET /bookings/{id}** - Get specific booking
- **POST /bookings** - Create new booking
- **PUT /bookings/{id}** - Update booking
- **DELETE /bookings/{id}** - Cancel booking

#### **3. Payment Processing**
- **POST /bookings/{id}/confirm-payment** - Process payment
- **GET /bookings/{id}/payment-info** - Get payment details

### **✅ Real Database Integration**

#### **Destinations Table (events):**
```sql
- id (UUID, Primary Key)
- name (Text, Destination name)
- description (Text, Full description)
- destination (Text, Location)
- price (Decimal, Base price)
- max_capacity (Integer, Maximum travelers)
- start_date (Timestamp, Trip start)
- end_date (Timestamp, Trip end)
- difficulty_level (Enum, Easy/Moderate/Challenging)
- featured_image_url (Text, Main image)
- inclusions (Array, What's included)
- exclusions (Array, What's excluded)
- is_active (Boolean, Available for booking)
- created_at/updated_at (Timestamps)
```

#### **Bookings Table (tickets):**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to users)
- event_id (UUID, Foreign Key to events)
- seats (Integer, Number of travelers)
- total_amount (Decimal, Total cost)
- booking_status (Enum, pending/confirmed/cancelled)
- payment_status (Enum, unpaid/paid/refunded)
- payment_method (Text, UPI/Card/NetBanking)
- transaction_id (Text, Payment transaction ID)
- special_requests (Text, User requests)
- booked_at (Timestamp, Booking creation)
- payment_confirmed_at (Timestamp, Payment completion)
```

### **✅ Frontend Integration**

#### **Destinations Page:**
- Loads real destinations from `/events` API
- Dynamic filtering and search
- Real-time availability checking
- Proper error handling

#### **Packages Page:**
- Same backend integration as destinations
- Consistent data format
- Loading states and error handling

#### **Booking Modal:**
- Creates real bookings via `/bookings` API
- Proper validation and error messages
- Real transaction ID generation
- Backend payment processing

#### **Dashboard:**
- Shows real bookings from `/bookings` API
- Accurate booking details and status
- Real-time data updates
- Proper booking references

## 🔍 **Testing the Complete System**

### **1. Test Destination Loading**
```bash
# Check destinations API
curl http://localhost:8000/events

# Expected: List of 8 destinations with full details
```

### **2. Test Booking Creation**
1. **Frontend**: Go to destinations page
2. **Click**: "Book Now" on any destination
3. **Fill**: Booking form with valid details
4. **Submit**: Should create booking in database
5. **Verify**: Check backend logs and database

### **3. Test Payment Processing**
1. **Continue**: From booking creation
2. **Select**: Any payment method
3. **Process**: Should update booking status
4. **Verify**: Booking status = confirmed, payment = paid

### **4. Test Dashboard Integration**
1. **Navigate**: To dashboard page
2. **Verify**: Booking appears with correct details
3. **Check**: All information matches backend data
4. **Test**: Refresh page - data should persist

## 🐛 **Troubleshooting**

### **Backend Issues:**

#### **Database Connection Errors:**
```bash
# Check Supabase credentials
cat backend/.env

# Verify connection
python -c "from app.services.supabase_service import SupabaseService; s = SupabaseService(); print('Connected!')"
```

#### **API Errors:**
```bash
# Check backend logs
python -m uvicorn app.main:app --reload --log-level debug

# Test API endpoints
curl http://localhost:8000/docs
```

### **Frontend Issues:**

#### **API Connection Errors:**
```bash
# Check environment variables
cat project/.env.local

# Verify API URL
echo $NEXT_PUBLIC_API_URL
```

#### **Authentication Errors:**
- Ensure user is logged in
- Check JWT token in browser storage
- Verify auth headers in network tab

### **Common Solutions:**

1. **CORS Errors**: Backend should handle CORS automatically
2. **404 Errors**: Ensure backend is running on port 8000
3. **Auth Errors**: Make sure user is authenticated
4. **Data Errors**: Check database setup completed successfully

## 📊 **Database Schema Verification**

### **Check Tables:**
```sql
-- In Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: users, events, tickets, gallery_images
```

### **Check Data:**
```sql
-- Verify destinations
SELECT id, name, destination, price, is_active FROM events;

-- Verify bookings
SELECT id, booking_status, payment_status, total_amount FROM tickets;
```

## 🎉 **Success Criteria**

### **✅ Backend Setup Complete When:**
- [ ] All 8 destinations loaded in database
- [ ] FastAPI server running without errors
- [ ] API documentation accessible at /docs
- [ ] All CRUD endpoints responding correctly

### **✅ Frontend Integration Complete When:**
- [ ] Destinations page loads from backend
- [ ] Booking modal creates real bookings
- [ ] Payment processing works end-to-end
- [ ] Dashboard shows real booking data
- [ ] No 404 or mock service fallbacks

### **✅ Full System Working When:**
- [ ] Complete booking flow works without errors
- [ ] Data persists across browser sessions
- [ ] All booking details accurate and consistent
- [ ] Real-time updates and proper error handling

## 🚀 **Next Steps**

After completing this setup:

1. **Admin Features**: Use admin panel to manage destinations
2. **Advanced Features**: Implement inventory management
3. **Production**: Deploy to production environment
4. **Monitoring**: Set up logging and monitoring
5. **Testing**: Add comprehensive test suite

The system is now ready for production use with complete backend integration and proper CRUD operations! 🎯