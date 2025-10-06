# Authentication Troubleshooting Guide

## 🔍 **Issue: "Database error during get user by email"**

This error occurs when the backend cannot connect to or query the Supabase database during user registration/login.

## 🛠️ **Quick Fixes Applied**

### ✅ **1. Fixed API Endpoint URLs**
**Problem**: Frontend was calling `/auth/signup` but backend expects `/api/auth/signup`

**Solution**: Updated all frontend API calls to use correct endpoints:
- ❌ `/auth/signup` → ✅ `/api/auth/signup`
- ❌ `/auth/login` → ✅ `/api/auth/login`
- ❌ `/auth/logout` → ✅ `/api/auth/logout`
- ❌ `/auth/me` → ✅ `/api/auth/me`

### ✅ **2. Enhanced Error Handling**
**Problem**: Generic error messages weren't helpful for debugging

**Solution**: Improved error handling in both frontend and backend:
- Better error message parsing in frontend
- More detailed database error logging in backend
- Graceful handling of connection issues

### ✅ **3. Improved Database Connection**
**Problem**: Supabase client initialization could fail silently

**Solution**: Enhanced Supabase service with:
- Better environment variable validation
- Connection testing during initialization
- More descriptive error messages

## 🔧 **Troubleshooting Steps**

### **Step 1: Check Backend Server**
```bash
# Navigate to backend directory
cd backend

# Check if server is running
curl http://localhost:8000/health

# If not running, start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Step 2: Test Database Connection**
```bash
# Run the database connection test
python test_supabase_connection.py
```

This will check:
- ✅ Environment variables are set
- ✅ Supabase credentials are valid
- ✅ Database tables are accessible
- ✅ Basic queries work

### **Step 3: Verify Environment Variables**
Check your `backend/.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

### **Step 4: Check Database Schema**
Ensure these tables exist in your Supabase database:
- ✅ `users` table
- ✅ `destinations` table  
- ✅ `tickets` table (for bookings)

### **Step 5: Test Registration Flow**
Try registering with a new email:
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to register
4. Check the API calls and responses

## 🚨 **Common Issues & Solutions**

### **Issue 1: "SUPABASE_URL environment variable is not set"**
**Solution**: 
```bash
# Check if .env file exists
ls -la backend/.env

# If missing, create it:
cp backend/.env.example backend/.env
# Then edit with your actual Supabase credentials
```

### **Issue 2: "Failed to initialize Supabase client"**
**Solution**:
- Verify your Supabase project is active
- Check your internet connection
- Ensure credentials are correct (no typos)

### **Issue 3: "Permission denied" or "RLS" errors**
**Solution**:
- Use Service Role Key (not anon key) for backend
- Check Row Level Security policies in Supabase
- Ensure tables have proper permissions

### **Issue 4: "Network error" or "Connection refused"**
**Solution**:
```bash
# Check if backend is running
ps aux | grep uvicorn

# Check port availability
netstat -tulpn | grep :8000

# Restart backend server
pkill -f uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Issue 5: Frontend can't reach backend**
**Solution**:
Check `project/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 **Testing Authentication**

### **Test 1: Backend Health Check**
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "timestamp": "..."}
```

### **Test 2: Registration API**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User"
  }'
```

### **Test 3: Login API**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## 📋 **Verification Checklist**

Before testing authentication, ensure:

- [ ] ✅ Backend server is running on port 8000
- [ ] ✅ Supabase credentials are set in backend/.env
- [ ] ✅ Database tables exist and are accessible
- [ ] ✅ Frontend API_URL points to correct backend
- [ ] ✅ CORS is configured for frontend domain
- [ ] ✅ No firewall blocking port 8000

## 🔄 **Complete Reset Process**

If authentication is still not working:

### **1. Reset Backend**
```bash
cd backend
pkill -f uvicorn
rm -rf __pycache__
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Reset Frontend**
```bash
cd project
rm -rf .next
npm install
npm run dev
```

### **3. Test Connection**
```bash
cd backend
python test_supabase_connection.py
```

## 🎯 **Expected Behavior**

After fixes, authentication should work as follows:

1. **Registration**:
   - User fills form → Frontend calls `/api/auth/signup`
   - Backend validates data → Checks if user exists
   - Creates user in Supabase → Returns JWT token
   - Frontend stores token → Redirects to dashboard

2. **Login**:
   - User enters credentials → Frontend calls `/api/auth/login`
   - Backend authenticates → Returns JWT token
   - Frontend stores token → Redirects to dashboard

3. **Social Login**:
   - User clicks social button → OAuth flow starts
   - Provider returns credential → Frontend calls `/api/auth/social`
   - Backend verifies token → Creates/updates user
   - Returns JWT token → Frontend completes login

## 📞 **Still Having Issues?**

If authentication is still not working after following this guide:

1. **Check Backend Logs**: Look for detailed error messages in the terminal
2. **Check Browser Console**: Look for network errors or JavaScript errors
3. **Test with Postman**: Try API calls directly to isolate frontend/backend issues
4. **Verify Database**: Check Supabase dashboard for table structure and data

## ✅ **Success Indicators**

Authentication is working correctly when:
- ✅ Registration creates new users in Supabase
- ✅ Login returns valid JWT tokens
- ✅ Protected routes require authentication
- ✅ User data persists across sessions
- ✅ Social login works for Google/Facebook/GitHub

The authentication system is now robust and should handle all common scenarios!