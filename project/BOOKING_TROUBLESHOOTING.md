# 🔧 Booking System Troubleshooting Guide

## Current Issues Identified

### **Issue 1: Database Error During Event Lookup**
**Error**: `Failed to create booking: database error during get event by ID`

**Root Cause**: The frontend was converting UUID event IDs to integers, causing database lookup failures.

### **Issue 2: API Endpoint Mismatches**
**Error**: `404 Not Found` on `/events` endpoint

**Root Cause**: Frontend calling `/events` but backend routes are at `/api/events`.

## ✅ **Fixes Applied**

### **1. Fixed Event ID Format Issues**

#### **Before (Broken):**
```typescript
// ❌ Converting UUID to integer
id: parseInt(dest.id) || Math.random()
```

#### **After (Fixed):**
```typescript
// ✅ Keeping original UUID format
id: dest.id // Keep original UUID format
```

### **2. Fixed API Endpoint Paths**

#### **Before (Broken):**
```typescript
// ❌ Wrong API paths
fetch(`${API_BASE_URL}/events`)
fetch(`${API_BASE_URL}/bookings`)
```

#### **After (Fixed):**
```typescript
// ✅ Correct API paths
fetch(`${API_BASE_URL}/api/events`)
fetch(`${API_BASE_URL}/api/bookings`)
```

## 🚀 **Setup Instructions**

### **Step 1: Backend Setup**
```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Update .env with your Supabase credentials

# 3. Verify setup
python verify_setup.py

# 4. Fix any issues
python fix_booking_issues.py

# 5. Start backend
python -m uvicorn app.main:app --reload --port 8000
```

### **Step 2: Frontend Setup**
```bash
cd project

# 1. Install dependencies
npm install

# 2. Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 3. Start frontend
npm run dev
```

## 🧪 **Testing the Fixes**

### **1. Test Backend Endpoints**
```bash
# Health check
curl http://localhost:8000/health

# Events endpoint
curl http://localhost:8000/api/events

# Expected: 200 OK with destinations data
```

### **2. Test Frontend Integration**
1. **Navigate to**: http://localhost:3000/destinations
2. **Check**: Destinations load without errors
3. **Verify**: Browser console shows no 404 errors
4. **Test**: Click "Book Now" on any destination

### **3. Test Complete Booking Flow**
1. **Click**: "Book Now" on any destination
2. **Fill**: Booking form with valid details
3. **Submit**: Should create booking successfully
4. **Verify**: No "database error during get event by ID" errors

## 🔍 **Verification Checklist**

### **Backend Verification:**
- [ ] Backend running on http://localhost:8000
- [ ] Health endpoint returns 200: `/health`
- [ ] Events endpoint returns data: `/api/events`
- [ ] Database has destinations populated
- [ ] Event IDs are proper UUIDs

### **Frontend Verification:**
- [ ] Destinations page loads from backend
- [ ] No 404 errors in browser console
- [ ] Event IDs are UUIDs (not integers)
- [ ] Booking modal opens with correct data
- [ ] Booking creation works without errors

### **Database Verification:**
- [ ] Supabase credentials configured in `.env`
- [ ] Database connection successful
- [ ] Events table has 8 destinations
- [ ] All event IDs are valid UUIDs

## 🐛 **Common Issues & Solutions**

### **Issue: "Database error during get event by ID"**

**Cause**: Event ID format mismatch or missing destinations

**Solution:**
```bash
cd backend
python fix_booking_issues.py
```

### **Issue: "404 Not Found" on API calls**

**Cause**: Wrong API endpoint paths

**Solution**: Verify frontend uses `/api/events` not `/events`

### **Issue: "No destinations found"**

**Cause**: Database not populated

**Solution:**
```bash
cd backend
python setup_complete_database.py
```

### **Issue: "Authentication required"**

**Cause**: User not logged in

**Solution**: Make sure user is authenticated before booking

### **Issue: "CORS errors"**

**Cause**: Backend CORS configuration

**Solution**: Backend should handle CORS automatically

## 📊 **Expected API Responses**

### **Events Endpoint (`/api/events`):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Manali & Kasol 2N/3D",
      "destination": "Himachal Pradesh",
      "price": 5499.00,
      "is_active": true
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

### **Booking Creation (`/api/bookings`):**
```json
{
  "id": "booking-uuid",
  "booking_status": "pending",
  "payment_status": "unpaid",
  "total_amount": 10998.00,
  "seats": 2,
  "event": {
    "id": "event-uuid",
    "name": "Manali & Kasol 2N/3D"
  }
}
```

## 🎯 **Success Criteria**

### **✅ System Working When:**
- [ ] Destinations load from backend without errors
- [ ] Booking modal opens with correct destination details
- [ ] Booking creation completes successfully
- [ ] Dashboard shows real bookings from database
- [ ] Payment processing works end-to-end
- [ ] No 404 or database errors in logs

### **✅ Data Flow Working:**
```
Frontend → Load destinations → /api/events → Backend → Database
Frontend → Create booking → /api/bookings → Backend → Database
Frontend → Load bookings → /api/bookings → Backend → Database
```

## 🚀 **Final Verification**

Run this complete test:

1. **Start Backend**: `python -m uvicorn app.main:app --reload`
2. **Start Frontend**: `npm run dev`
3. **Open**: http://localhost:3000/destinations
4. **Verify**: Destinations load (check network tab)
5. **Click**: "Book Now" on any destination
6. **Fill**: Booking form and submit
7. **Success**: Booking created without errors

If all steps pass, the booking system is working correctly! 🎉