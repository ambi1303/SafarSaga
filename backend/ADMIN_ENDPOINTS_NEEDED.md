# Admin Dashboard - Backend Endpoints Checklist

This document lists the backend endpoints required by the admin dashboard and their implementation status.

## ✅ Existing Endpoints (Already Implemented)

### Authentication
- ✅ `POST /auth/login` - User login
- ✅ `POST /auth/logout` - User logout
- ✅ `GET /auth/me` - Get current user

### Bookings
- ✅ `GET /bookings/` - List bookings with filters
- ✅ `GET /bookings/admin/stats` - Admin statistics
- ✅ `GET /bookings/{id}` - Get booking details
- ✅ `PUT /bookings/{id}` - Update booking
- ✅ `DELETE /bookings/{id}` - Cancel booking
- ✅ `GET /bookings/user/{user_id}` - Get user's bookings

## 🔄 Endpoints That May Need Implementation

### Payment Management
- ❓ `GET /bookings/{id}/payment-info` - Get payment information
- ❓ `POST /bookings/{id}/confirm-payment` - Confirm payment

### User Management
- ❓ `GET /users/` - List all users (with pagination)
- ❓ `GET /users/{id}` - Get user details
- ❓ `PUT /users/{id}` - Update user
- ❓ `DELETE /users/{id}` - Delete user

## 📝 Implementation Guide

### 1. Payment Info Endpoint

If not implemented, add to `app/routers/bookings.py`:

```python
@router.get(
    "/{booking_id}/payment-info",
    tags=["Payments"],
    summary="Get Payment Information"
)
async def get_payment_info(
    booking_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Get payment information for a booking (admin only)"""
    booking = await supabase_service.get_booking_by_id(booking_id)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {
        "booking_id": booking.id,
        "amount": booking.total_amount,
        "currency": "INR",
        "payment_status": booking.payment_status,
        "payment_method": booking.payment_method if hasattr(booking, 'payment_method') else None,
        "transaction_id": booking.transaction_id if hasattr(booking, 'transaction_id') else None,
        "payment_date": booking.payment_date if hasattr(booking, 'payment_date') else None,
        "payment_confirmed_at": booking.payment_confirmed_at if hasattr(booking, 'payment_confirmed_at') else None,
        "payer_name": booking.user_name,
        "payer_email": booking.user_email,
        "notes": booking.special_requests
    }
```

### 2. Confirm Payment Endpoint

If not implemented, add to `app/routers/bookings.py`:

```python
@router.post(
    "/{booking_id}/confirm-payment",
    tags=["Payments"],
    summary="Confirm Payment"
)
async def confirm_payment(
    booking_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Confirm payment and update booking status (admin only)"""
    booking = await supabase_service.get_booking_by_id(booking_id)
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update booking and payment status
    updated_booking = await supabase_service.update_booking(
        booking_id,
        {
            "payment_status": "paid",
            "booking_status": "confirmed",
            "payment_confirmed_at": datetime.now(timezone.utc).isoformat()
        }
    )
    
    return {"message": "Payment confirmed successfully", "booking": updated_booking}
```

### 3. Users List Endpoint

Create `app/routers/users.py` if it doesn't exist:

```python
from fastapi import APIRouter, Depends, Query
from app.middleware.auth import get_admin_user
from app.models import User
from app.services.supabase_service import SupabaseService

router = APIRouter()
supabase_service = SupabaseService()

@router.get(
    "/",
    tags=["Users"],
    summary="List Users"
)
async def get_users(
    search: str = Query(None, description="Search by name or email"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_admin_user)
):
    """Get list of users (admin only)"""
    
    # Build query
    query = supabase_service._get_client().table('users').select('*', count='exact')
    
    # Apply search filter
    if search:
        query = query.or_(f'full_name.ilike.%{search}%,email.ilike.%{search}%')
    
    # Apply pagination
    query = query.range(offset, offset + limit - 1)
    
    # Execute query
    response = query.execute()
    
    return {
        "items": response.data,
        "total": response.count,
        "limit": limit,
        "offset": offset
    }

@router.get(
    "/{user_id}",
    tags=["Users"],
    summary="Get User"
)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Get user details (admin only)"""
    user = await supabase_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put(
    "/{user_id}",
    tags=["Users"],
    summary="Update User"
)
async def update_user(
    user_id: str,
    updates: dict,
    current_user: User = Depends(get_admin_user)
):
    """Update user (admin only)"""
    user = await supabase_service.update_user(user_id, updates)
    return user

@router.delete(
    "/{user_id}",
    tags=["Users"],
    summary="Delete User"
)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Delete user (admin only)"""
    
    # Check if user is admin
    user = await supabase_service.get_user_by_id(user_id)
    if user and user.is_admin:
        raise HTTPException(status_code=403, detail="Cannot delete admin users")
    
    await supabase_service.delete_user(user_id)
    return {"message": "User deleted successfully"}
```

### 4. Register Users Router

Add to `app/main.py`:

```python
from app.routers import users

app.include_router(users.router, prefix="/users", tags=["Users"])
```

## 🧪 Testing Endpoints

### Test Payment Info
```bash
curl -X GET "http://localhost:8000/bookings/{booking_id}/payment-info" \
  -H "Authorization: Bearer {admin_token}"
```

### Test Confirm Payment
```bash
curl -X POST "http://localhost:8000/bookings/{booking_id}/confirm-payment" \
  -H "Authorization: Bearer {admin_token}"
```

### Test List Users
```bash
curl -X GET "http://localhost:8000/users/?limit=20&offset=0" \
  -H "Authorization: Bearer {admin_token}"
```

### Test Get User
```bash
curl -X GET "http://localhost:8000/users/{user_id}" \
  -H "Authorization: Bearer {admin_token}"
```

## 📊 Database Schema Requirements

### Bookings Table
Ensure these columns exist:
- `payment_method` (optional)
- `transaction_id` (optional)
- `payment_date` (optional)
- `payment_confirmed_at` (optional)

### Users Table
Should have:
- `id` (UUID)
- `email` (string)
- `full_name` (string)
- `phone` (string, optional)
- `is_admin` (boolean)
- `is_verified` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🔐 Admin Middleware

Ensure `get_admin_user` is implemented in `app/middleware/auth.py`:

```python
async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verify user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return current_user
```

## ✅ Verification Checklist

- [ ] All authentication endpoints work
- [ ] Booking endpoints return correct data
- [ ] Admin stats endpoint returns proper statistics
- [ ] Payment info endpoint exists and works
- [ ] Payment confirmation endpoint exists and works
- [ ] Users list endpoint exists and works
- [ ] User CRUD operations work
- [ ] Admin middleware protects endpoints
- [ ] CORS is configured for frontend
- [ ] Error responses are consistent

## 🚀 Quick Test Script

Create `test_admin_endpoints.py`:

```python
import requests

BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = "your_admin_token_here"

headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}

# Test admin stats
response = requests.get(f"{BASE_URL}/bookings/admin/stats", headers=headers)
print(f"Admin Stats: {response.status_code}")

# Test users list
response = requests.get(f"{BASE_URL}/users/", headers=headers)
print(f"Users List: {response.status_code}")

# Test payment info (replace with real booking_id)
# response = requests.get(f"{BASE_URL}/bookings/{{booking_id}}/payment-info", headers=headers)
# print(f"Payment Info: {response.status_code}")
```

## 📝 Notes

- All admin endpoints should require authentication
- Use `get_admin_user` dependency for admin-only endpoints
- Return consistent error responses
- Include proper pagination for list endpoints
- Add proper logging for admin actions
- Consider adding audit logs for sensitive operations

## 🎯 Priority

1. **High Priority** (Required for core functionality)
   - Payment info endpoint
   - Payment confirmation endpoint
   - Users list endpoint

2. **Medium Priority** (Nice to have)
   - User update endpoint
   - User delete endpoint
   - Enhanced statistics

3. **Low Priority** (Future enhancements)
   - Audit logs
   - Advanced analytics
   - Bulk operations

---

**Status**: Review and implement missing endpoints as needed for full admin dashboard functionality.
