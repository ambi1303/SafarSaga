# Admin Bookings Display Fix

## Issue
The admin bookings page was showing "N/A" for user names and "-" for destination names because the Booking model didn't include the enriched fields that were being added by the backend.

## Root Cause
1. The `get_bookings` method in `supabase_service.py` was enriching booking data with `user_name`, `user_email`, and `destination_name`
2. However, the `Booking` Pydantic model didn't have these fields defined
3. Pydantic was silently dropping these extra fields during validation
4. The frontend received bookings without the enriched data

## Solution
Added the enriched fields to the `Booking` model as optional fields:

```python
class Booking(BaseModel):
    """Complete booking model"""
    id: str
    user_id: str
    destination_id: Optional[str] = None
    event_id: Optional[str] = None
    seats: int
    total_amount: float
    booking_status: BookingStatus
    payment_status: PaymentStatus
    travel_date: Optional[str] = None
    special_requests: Optional[str] = None
    booked_at: str
    payment_confirmed_at: Optional[str] = None
    
    # Enriched fields (populated by joins)
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    destination_name: Optional[str] = None
    
    class Config:
        extra = "ignore"  # Ignore extra fields from database
```

## How It Works

1. **Backend enrichment** (already implemented in `supabase_service.py`):
   - Fetches booking data from tickets table
   - Joins with users table to get `user_name` and `user_email`
   - Joins with destinations/events tables to get `destination_name`

2. **Model validation** (now fixed):
   - Pydantic validates the booking data
   - Includes the enriched fields in the response
   - Frontend receives complete data

3. **Frontend display**:
   - Admin bookings page displays user names and emails
   - Shows destination names
   - No more "N/A" or "-" placeholders

## Files Changed

- `backend/app/models.py` - Added enriched fields to Booking model

## Testing

After restarting the backend:

1. Navigate to http://localhost:3000/admin/bookings
2. Verify that user names and emails are displayed
3. Verify that destination names are shown
4. Check that all booking data is complete

## Expected Result

The admin bookings table should now show:
- ✅ User names (from users.full_name)
- ✅ User emails (from users.email)
- ✅ Destination names (from destinations.name or events.name)
- ✅ All other booking details

No more "N/A" or "-" placeholders!
