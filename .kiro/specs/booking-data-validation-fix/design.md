# Design Document

## Overview

This design addresses the critical data type validation failure in the booking system where string values are being passed to functions expecting integers, specifically causing the error "'str' object cannot be interpreted as an integer". The solution implements comprehensive input validation and type conversion at multiple layers: frontend form handling, backend API validation, and database service layer.

## Architecture

### Data Flow Validation Strategy
- **Frontend Layer**: Convert form string inputs to proper numeric types before API submission
- **Backend API Layer**: Add robust type guards with meaningful error messages for conversion failures
- **Service Layer**: Implement defensive programming with type validation before database operations
- **Database Layer**: Ensure schema constraints match expected data types

### Error Handling Approach
- **Early Detection**: Catch type conversion errors at the earliest possible point
- **Meaningful Messages**: Provide specific field-level error information to users
- **Graceful Degradation**: Handle conversion failures without system crashes
- **Comprehensive Logging**: Track validation failures for debugging and monitoring

## Components and Interfaces

### 1. Frontend Data Type Conversion

#### BookingModal.tsx Enhancement
```typescript
// Before (problematic):
const payload = {
  destination_id: selectedDestinationId,
  seats: formData.get("seats"), // ❌ returns string
  travel_date: selectedDate,
};

// After (fixed):
const payload = {
  destination_id: selectedDestinationId,
  seats: Number(formData.get("seats")), // ✅ ensure integer
  travel_date: selectedDate.toISOString(),
  contact_info: {
    phone: formData.get("phone"),
    emergency_contact: formData.get("emergency_contact")
  }
};

// Validation before submission:
if (isNaN(payload.seats) || payload.seats < 1 || payload.seats > 10) {
  throw new Error("Please enter a valid number of seats (1-10)");
}
```

### 2. Backend API Validation Enhancement

#### Robust Type Conversion in create_booking()
```python
# In backend/app/routers/bookings.py - create_booking function

# Replace the current problematic conversion with:
try:
    seats_value = booking_data.seats
    if isinstance(seats_value, str):
        seats_value = seats_value.strip()
        if not seats_value.isdigit():
            raise ValidationException(f"Invalid seat count: '{seats_value}' is not a valid number")
        seats = int(seats_value)
    elif isinstance(seats_value, (int, float)):
        seats = int(seats_value)
    else:
        raise ValidationException(f"Invalid seat count type: {type(seats_value)}")
    
    # Validate range
    if seats < 1 or seats > 10:
        raise ValidationException("Number of seats must be between 1 and 10")
        
except (ValueError, TypeError) as e:
    raise ValidationException(f"Invalid seat count: {str(e)}")

create_data = {
    "user_id": current_user.id,
    "destination_id": booking_data.destination_id,
    "seats": seats,  # Now guaranteed to be valid integer
    "total_amount": float(total_amount),
    "special_requests": booking_data.special_requests,
    "contact_info": booking_data.contact_info.model_dump() if booking_data.contact_info else None,
    "travel_date": travel_date_iso,
    "booking_status": BookingStatus.PENDING.value,
    "payment_status": PaymentStatus.UNPAID.value
}
```

### 3. Service Layer Defensive Programming

#### Supabase Service Type Guards
```python
# In backend/app/services/supabase_service.py - create_destination_booking method

# Add before database insertion:
if isinstance(booking_data.get("seats"), str):
    try:
        booking_data["seats"] = int(booking_data["seats"])
    except ValueError:
        raise DatabaseException("Invalid 'seats' value. Expected an integer.")
```

## Testing Strategy

### Frontend Validation Tests
- Test form data conversion from strings to numbers
- Test validation error handling for invalid inputs
- Test edge cases with empty or malformed data

### Backend Validation Tests
- Test API endpoints with string numeric inputs
- Test validation error responses
- Test type conversion edge cases

### Integration Tests
- Test complete booking flow with form-like data
- Test error handling across all layers
- Test database constraints and validation

## Implementation Phases

### Phase 1: Frontend Data Type Fixes (High Priority)
- Update BookingModal.tsx to convert form data to proper types
- Add client-side validation for numeric inputs
- Test form submission with various input scenarios

### Phase 2: Backend Validation Enhancement (High Priority)
- Update create_booking endpoint with robust type conversion
- Add comprehensive error handling for validation failures
- Test API endpoints with various data type scenarios

### Phase 3: Service Layer Defensive Programming (Medium Priority)
- Add type guards in Supabase service methods
- Implement comprehensive error handling for data conversion
- Test service layer with edge cases and invalid data

### Phase 4: Database Schema Validation (Low Priority)
- Verify and update database schema constraints
- Add database-level validation for data integrity
- Test database constraints with various data scenarios