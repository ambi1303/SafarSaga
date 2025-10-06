# Booking System Fixes - Design Document

## Overview

This design addresses the critical architectural issues in the current booking system by restructuring the backend to properly handle destination-based bookings instead of the current event-based approach. The solution ensures payload consistency, proper database relationships, and reliable frontend-backend integration.

## Architecture

### Current Architecture Issues
```
Frontend (Destinations) → Backend (Events Logic) → Database (Mixed Tables)
     ↓                         ↓                        ↓
Destination IDs          Queries Events Table    Stores event_id in tickets
```

### New Architecture
```
Frontend (Destinations) → Backend (Destinations Logic) → Database (Proper Relations)
     ↓                         ↓                           ↓
Destination IDs          Queries Destinations Table   Stores destination_id in tickets
```

## Components and Interfaces

### 1. Backend API Layer Fixes

#### Updated Booking Router (`/api/bookings`)
```python
# Current (Broken)
event = await supabase_service.get_event_by_id(booking_data.destination_id)

# Fixed
destination = await supabase_service.get_destination_by_id(booking_data.destination_id)
```

#### New Booking Creation Flow
1. **Validate Destination**: Check destination exists and is active
2. **Calculate Price**: Use `destination.average_cost_per_day * seats * duration`
3. **Create Booking**: Store with `destination_id` field
4. **Return Response**: Include destination details (not event details)

### 2. Database Schema Updates

#### Tickets Table Enhancement
```sql
-- Add destination_id column if not exists
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES destinations(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON tickets(destination_id);

-- Update existing bookings (migration)
UPDATE tickets SET destination_id = (
  SELECT d.id FROM destinations d 
  JOIN events e ON e.destination_id = d.id 
  WHERE e.id = tickets.event_id
) WHERE destination_id IS NULL AND event_id IS NOT NULL;
```

#### Updated Booking Queries
```sql
-- New booking fetch query
SELECT t.*, d.name, d.state, d.average_cost_per_day, d.featured_image_url
FROM tickets t
JOIN destinations d ON t.destination_id = d.id
WHERE t.user_id = $1;
```

### 3. Payload Structure Standardization

#### Frontend Booking Request
```typescript
interface BookingRequest {
  destinationId: string;        // UUID of destination
  seats: number;               // Number of travelers
  travelDate?: string;         // ISO date string (optional)
  specialRequests?: string;    // Optional requests
  contactInfo: {
    phone: string;             // Required phone number
    emergencyContact?: string; // Optional emergency contact
  };
}
```

#### Backend Booking Response
```python
{
  "id": "booking-uuid",
  "destination_id": "dest-uuid",
  "user_id": "user-uuid",
  "seats": 2,
  "total_amount": 5000.00,
  "booking_status": "pending",
  "payment_status": "unpaid",
  "travel_date": "2024-12-01T00:00:00Z",
  "contact_info": {
    "phone": "+91-9876543210",
    "emergency_contact": "+91-9876543211"
  },
  "destination": {
    "id": "dest-uuid",
    "name": "Manali",
    "state": "Himachal Pradesh",
    "average_cost_per_day": 2500.00,
    "featured_image_url": "https://...",
    "difficulty_level": "Moderate"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 4. Service Layer Restructuring

#### Updated Supabase Service Methods
```python
async def create_destination_booking(self, booking_data: dict) -> Booking:
    """Create booking for destination (not event)"""
    # Validate destination exists and is active
    destination = await self.get_destination_by_id(booking_data["destination_id"])
    if not destination or not destination.is_active:
        raise NotFoundException("Active destination", booking_data["destination_id"])
    
    # Calculate pricing
    base_price = destination.average_cost_per_day or Decimal('2000')
    duration_days = self._calculate_duration(booking_data.get("travel_date"))
    total_amount = base_price * booking_data["seats"] * duration_days
    
    # Create booking record
    booking_record = {
        **booking_data,
        "destination_id": booking_data["destination_id"],  # Explicit destination link
        "total_amount": float(total_amount),
        "booking_status": "pending",
        "payment_status": "unpaid",
        "booked_at": datetime.utcnow().isoformat()
    }
    
    return await self._create_booking_record(booking_record)
```

#### Updated Booking Fetch Methods
```python
async def get_bookings_with_destinations(self, filters: dict, limit: int, offset: int):
    """Fetch bookings with destination details"""
    query = self._get_client().table("tickets").select("""
        *,
        user:users(id, full_name, email, phone),
        destination:destinations(id, name, state, average_cost_per_day, featured_image_url, difficulty_level)
    """)
    # Apply filters and return results with destination data
```

### 5. Frontend Integration Updates

#### Updated Booking Service
```typescript
class BookingService {
  static async createBooking(request: BookingRequest): Promise<BookingResponse> {
    const payload = {
      destination_id: request.destinationId,
      seats: request.seats,
      special_requests: request.specialRequests || '',
      travel_date: request.travelDate ? new Date(request.travelDate).toISOString() : null,
      contact_info: {
        phone: request.contactInfo.phone,
        emergency_contact: request.contactInfo.emergencyContact
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const data = await response.json();
      return this.transformDestinationBooking(data); // New transform method
    }
    
    throw new Error('Booking failed');
  }
  
  private static transformDestinationBooking(backendBooking: any): BookingResponse {
    return {
      id: backendBooking.id,
      bookingReference: this.generateBookingReference(backendBooking.id),
      destination: {
        id: backendBooking.destination.id,
        name: backendBooking.destination.name,
        location: `${backendBooking.destination.name}, ${backendBooking.destination.state}`,
        price: Number(backendBooking.destination.average_cost_per_day),
        // ... other destination fields
      },
      seats: backendBooking.seats,
      totalAmount: Number(backendBooking.total_amount),
      bookingStatus: backendBooking.booking_status,
      paymentStatus: backendBooking.payment_status,
      // ... other booking fields
    };
  }
}
```

## Data Models

### Updated Booking Model
```python
class Booking(BaseModelWithId, BookingBase):
    user_id: str = Field(..., description="User ID who made the booking")
    destination_id: str = Field(..., description="Destination ID that was booked")
    total_amount: Decimal = Field(..., ge=0, description="Total booking amount")
    booking_status: BookingStatus = Field(BookingStatus.PENDING)
    payment_status: PaymentStatus = Field(PaymentStatus.UNPAID)
    travel_date: Optional[datetime] = Field(None, description="Preferred travel date")
    contact_info: dict = Field(..., description="Contact information")
    booked_at: Optional[datetime] = Field(None, description="Booking timestamp")
    
    # Relationships
    user: Optional[User] = Field(None, description="User details")
    destination: Optional[Destination] = Field(None, description="Destination details")
    
    # Remove event relationship (legacy cleanup)
    # event: Optional[Event] = Field(None, description="Event details (legacy)")
```

### Contact Info Validation
```python
class ContactInfo(BaseModel):
    phone: str = Field(..., min_length=10, description="Phone number")
    emergency_contact: Optional[str] = Field(None, description="Emergency contact")
    
class BookingCreate(BookingBase):
    destination_id: str = Field(..., description="Destination ID to book")
    travel_date: Optional[str] = Field(None, description="Travel date as ISO string")
    contact_info: ContactInfo = Field(..., description="Contact information")
```

## Error Handling

### Standardized Error Responses
```python
class BookingError(Exception):
    def __init__(self, message: str, error_code: str, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}

# Error types
DESTINATION_NOT_FOUND = "DESTINATION_NOT_FOUND"
DESTINATION_INACTIVE = "DESTINATION_INACTIVE" 
INVALID_TRAVEL_DATE = "INVALID_TRAVEL_DATE"
INVALID_CONTACT_INFO = "INVALID_CONTACT_INFO"
BOOKING_CREATION_FAILED = "BOOKING_CREATION_FAILED"
```

### Frontend Error Handling
```typescript
try {
  const booking = await BookingService.createBooking(request);
  // Handle success
} catch (error) {
  if (error.message.includes('DESTINATION_NOT_FOUND')) {
    setError('Selected destination is no longer available');
  } else if (error.message.includes('INVALID_CONTACT_INFO')) {
    setError('Please provide a valid phone number');
  } else {
    setError('Booking failed. Please try again.');
  }
}
```

## Testing Strategy

### Unit Tests
1. **Destination Booking Creation**: Test booking creation with valid destination IDs
2. **Price Calculation**: Test pricing logic with different seat counts and durations
3. **Payload Validation**: Test request/response payload transformations
4. **Error Scenarios**: Test invalid destination IDs, inactive destinations

### Integration Tests
1. **End-to-End Booking Flow**: Frontend → Backend → Database → Response
2. **Payment Processing**: Booking creation → Payment → Status updates
3. **User Booking Retrieval**: Fetch user bookings with destination details
4. **Admin Booking Management**: Admin operations on destination bookings

### API Tests
```python
def test_create_destination_booking():
    # Test booking creation with valid destination
    payload = {
        "destination_id": "valid-dest-uuid",
        "seats": 2,
        "contact_info": {"phone": "+91-9876543210"}
    }
    response = client.post("/api/bookings", json=payload, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["destination"]["name"] == "Expected Destination"

def test_invalid_destination_booking():
    # Test booking creation with invalid destination
    payload = {
        "destination_id": "invalid-uuid",
        "seats": 2,
        "contact_info": {"phone": "+91-9876543210"}
    }
    response = client.post("/api/bookings", json=payload, headers=auth_headers)
    assert response.status_code == 404
    assert "Destination not found" in response.json()["detail"]
```

## Migration Strategy

### Phase 1: Database Schema Updates
1. Add `destination_id` column to tickets table
2. Create foreign key relationship to destinations
3. Migrate existing event-based bookings to destination-based

### Phase 2: Backend Logic Updates
1. Update booking router to use destinations instead of events
2. Modify Supabase service methods for destination queries
3. Update response transformations

### Phase 3: Frontend Integration
1. Update booking service to handle new payload structure
2. Modify booking modal to work with destination data
3. Update booking display components

### Phase 4: Testing and Validation
1. Run comprehensive test suite
2. Validate booking flow end-to-end
3. Performance testing with destination queries

This design ensures a robust, consistent booking system that properly handles destination-based bookings with correct payload structures and reliable data relationships.