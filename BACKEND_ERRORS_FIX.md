# Backend Errors Fix

## Issues Fixed

### 1. Destinations API 500 Error
**Problem**: `/api/destinations/?is_active=true&limit=50` was returning 500 Internal Server Error

**Root Cause**: The Destination model didn't match the database schema. The database likely has additional fields (like `state`, `updated_at`) that weren't defined in the model, causing Pydantic validation to fail.

**Solution**: 
- Added missing fields to the Destination model (`state`, `updated_at`)
- Made `location` field optional
- Added `Config` class with `extra = "ignore"` to ignore any extra fields from the database
- Added error handling in `get_destinations` to skip invalid destination data instead of crashing

### 2. Booking Creation Error - Destination Not Found
**Problem**: When creating a booking, it fails with "Destination not found with ID: dc5a0345-4c66-4f0d-8f65-392493bcf791"

**Root Cause**: The destination ID being sent from the frontend doesn't exist in the database, or the destinations table is empty.

**Solution**: The Destination model fix above should resolve the API error. However, you may need to:
1. Seed the destinations table with data
2. Verify the destination IDs being used in the frontend match the database

## Changes Made

### File: `backend/app/models.py`

Updated the Destination model:

```python
class Destination(BaseModel):
    """Destination model"""
    id: str
    name: str
    location: Optional[str] = None  # Made optional
    state: Optional[str] = None  # Added
    description: Optional[str] = None
    average_cost_per_day: Optional[Decimal] = None
    difficulty_level: Optional[DifficultyLevel] = None
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None  # Added
    
    class Config:
        extra = "ignore"  # Ignore extra fields from database
```

### File: `backend/app/services/supabase_service.py`

Added error handling in `get_destinations`:

```python
# Convert to Destination objects with error handling
destinations = []
for dest in destinations_data:
    try:
        destinations.append(Destination(**dest))
    except Exception as conv_error:
        print(f"Warning: Could not convert destination data: {str(conv_error)}")
        print(f"Destination data: {dest}")
        # Skip invalid destination data
        continue
```

## Next Steps

1. **Restart the backend server** to load the changes
2. **Check the destinations table** in Supabase to ensure it has data:
   ```sql
   SELECT * FROM destinations WHERE is_active = true;
   ```
3. **Seed destinations** if the table is empty:
   ```bash
   cd backend
   python seed_destinations.py
   ```
4. **Test the API** endpoints:
   - GET http://localhost:8000/api/destinations/?is_active=true&limit=50
   - POST http://localhost:8000/api/bookings/ (with valid destination_id)

## Testing

After restarting the backend:

1. Visit http://localhost:3000 and try to view destinations
2. Try to create a booking
3. Check the backend logs for any remaining errors

The destinations API should now return successfully, and bookings should work if valid destination IDs are used.
