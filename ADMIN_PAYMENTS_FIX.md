# Admin Payments Page Fix

## Issues Fixed

### 1. Missing User and Destination Data
**Problem**: The admin payments page was showing "N/A" for user names, emails, and destination names because the backend wasn't including this data in the booking responses.

**Root Cause**: The `get_bookings` method in `supabase_service.py` was only fetching booking data from the tickets table without joining user and destination information.

**Solution**: Enhanced the `get_bookings` method to fetch and include:
- User data (full_name, email) from the users table
- Destination names from the destinations table
- Event names as fallback for destination_name

### Changes Made

#### File: `backend/app/services/supabase_service.py`

Added user data fetching in the enriched_bookings loop:

```python
# Get user data if user_id exists
if booking.get('user_id'):
    try:
        user_response = self._get_client().table("users").select("id, email, full_name").eq("id", booking['user_id']).execute()
        if user_response.data:
            user_data = user_response.data[0]
            enriched_booking['user_name'] = user_data.get('full_name')
            enriched_booking['user_email'] = user_data.get('email')
    except Exception as user_error:
        print(f"Warning: Could not fetch user {booking.get('user_id')}: {str(user_error)}")
        enriched_booking['user_name'] = None
        enriched_booking['user_email'] = None
```

Also added destination_name extraction:

```python
# Get destination data if destination_id exists
if booking.get('destination_id'):
    try:
        dest_response = self._get_client().table("destinations").select("*").eq("id", booking['destination_id']).execute()
        if dest_response.data:
            dest_data = dest_response.data[0]
            enriched_booking['destination'] = dest_data
            enriched_booking['destination_name'] = dest_data.get('name')
    except Exception as dest_error:
        print(f"Warning: Could not fetch destination {booking.get('destination_id')}: {str(dest_error)}")
        enriched_booking['destination'] = None
        enriched_booking['destination_name'] = None
```

## Expected Results

After the backend restarts, the admin payments page should now display:
- ✅ User names (from users.full_name)
- ✅ User emails (from users.email)
- ✅ Destination names (from destinations.name or events.name)
- ✅ Booking IDs (truncated to 8 characters)
- ✅ Payment amounts
- ✅ Payment statuses
- ✅ Payment dates

## Testing

1. Ensure the backend has restarted successfully
2. Navigate to http://localhost:3000/admin/payments
3. Verify that user names, emails, and destination names are now displayed
4. Test the View, Approve, and Reject buttons
5. Check that filtering by payment status works correctly

## Notes

- The enrichment happens at the database query level, so it applies to all booking endpoints
- Error handling is in place - if user or destination data can't be fetched, it will show null/None instead of crashing
- This fix also benefits other admin pages that display booking data (bookings, dashboard)
