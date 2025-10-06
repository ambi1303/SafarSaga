# Design Document

## Overview

This design consolidates the SafarSaga backend data models from three separate files (`models.py`, `schemas.py`, `validators.py`) into a single, well-organized `schemas.py` file. The consolidated file will serve as the single source of truth for all API data contracts, with integrated Pydantic validation that accurately reflects the database schema.

## Architecture

### Single File Structure
- **File**: `backend/app/schemas.py`
- **Purpose**: Single source of truth for all data models and validation
- **Organization**: Logical grouping by domain (User, Destination, Event, Booking, Gallery, etc.)

### Model Hierarchy
```
BaseModel (Pydantic)
├── BaseModelWithId (UUID id field)
├── TimestampMixin (created_at, updated_at)
├── Domain Models
│   ├── UserBase → UserCreate, UserUpdate, User
│   ├── DestinationBase → DestinationCreate, DestinationUpdate, Destination
│   ├── EventBase → EventCreate, EventUpdate, Event
│   ├── BookingBase → BookingCreate, BookingUpdate, Booking
│   └── GalleryImageBase → GalleryImageCreate, GalleryImageUpdate, GalleryImage
└── Utility Models (Enums, Responses, Filters)
```

## Components and Interfaces

### 1. Base Models and Mixins
```python
class BaseModelWithId(BaseModel):
    """Base model with UUID id field matching database"""
    id: str = Field(..., description="UUID identifier")

class TimestampMixin(BaseModel):
    """Mixin for timestamp fields matching database schema"""
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
```

### 2. Enums (Database-Aligned)
```python
class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MODERATE = "Moderate" 
    CHALLENGING = "Challenging"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"
```

### 3. Domain Models with Integrated Validation

#### User Models
- **UserBase**: Core user fields (email, full_name, phone)
- **UserCreate**: Adds password field with validation
- **UserUpdate**: Optional fields for updates
- **User**: Complete model with id, timestamps, is_admin

#### Destination Models
- **DestinationBase**: Core destination fields matching database schema
- **DestinationCreate**: For creating new destinations
- **DestinationUpdate**: Optional fields for updates
- **Destination**: Complete model with all database fields

#### Event Models
- **EventBase**: Core event fields matching database schema
- **EventCreate**: Adds itinerary, inclusions, exclusions
- **EventUpdate**: Optional fields for updates
- **Event**: Complete model with relationships and computed fields

#### Booking Models
- **BookingBase**: Core booking fields (seats, special_requests)
- **BookingCreate**: Adds destination_id, travel_date, contact_info with validation
- **BookingUpdate**: Status updates and payment fields
- **Booking**: Complete model matching tickets table schema

#### Gallery Models
- **GalleryImageBase**: Core image fields
- **GalleryImageCreate**: For uploading new images
- **GalleryImageUpdate**: For updating image metadata
- **GalleryImage**: Complete model with relationships

## Data Models

### Database Schema Alignment

The models will exactly match the database schema from `project/database/schema.sql`:

#### Users Table → User Models
```sql
-- Database
id UUID, email TEXT, full_name TEXT, phone TEXT, is_admin BOOLEAN, 
created_at TIMESTAMP, updated_at TIMESTAMP
```

#### Destinations Table → Destination Models
```sql
-- Database  
id UUID, name TEXT, description TEXT, state TEXT, country TEXT,
featured_image_url TEXT, gallery_images TEXT[], difficulty_level TEXT,
best_time_to_visit TEXT, popular_activities TEXT[], 
average_cost_per_day DECIMAL(10,2), is_active BOOLEAN,
created_at TIMESTAMP, updated_at TIMESTAMP
```

#### Tickets Table → Booking Models
```sql
-- Database
id UUID, user_id UUID, event_id UUID, destination_id UUID, seats INTEGER,
total_amount DECIMAL(10,2), booking_status TEXT, payment_status TEXT,
payment_method TEXT, transaction_id TEXT, upi_qr_code TEXT,
special_requests TEXT, contact_info JSONB, travel_date TIMESTAMP,
booked_at TIMESTAMP, payment_confirmed_at TIMESTAMP
```

### Validation Integration

All validation logic from `validators.py` will be integrated using Pydantic patterns:

#### Field-Level Validation
```python
class BookingCreate(BookingBase):
    seats: int = Field(..., ge=1, le=10, description="Number of seats (1-10)")
    travel_date: Optional[str] = Field(None, description="Travel date ISO string")
    
    @validator('travel_date')
    def validate_travel_date(cls, v):
        if v:
            # Parse and validate date logic here
            pass
        return v
```

#### Model-Level Validation
```python
class ContactInfo(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    emergency_contact: Optional[str] = Field(None, min_length=10, max_length=15)
    
    @validator('phone', 'emergency_contact')
    def validate_phone_format(cls, v):
        # Phone validation logic here
        return v
```

## Error Handling

### Validation Errors
- Use Pydantic's built-in validation error handling
- Provide clear, user-friendly error messages
- Include field-specific error details

### Database Constraint Alignment
- Model validation will match database constraints exactly
- No defensive coding needed in service layer
- Consistent error handling between model and database validation

## Testing Strategy

### Model Validation Tests
1. **Field Validation Tests**: Test each field's constraints and validators
2. **Model Creation Tests**: Test valid and invalid model creation scenarios
3. **Database Alignment Tests**: Verify models match database schema exactly

### Integration Tests
1. **Service Layer Tests**: Ensure no defensive coding is needed
2. **API Tests**: Verify consistent validation across all endpoints
3. **Database Tests**: Confirm models work seamlessly with database operations

### Migration Tests
1. **Backward Compatibility**: Ensure existing API contracts remain valid
2. **Data Integrity**: Verify existing data works with new models
3. **Performance**: Confirm no performance regression from consolidation

## Implementation Phases

### Phase 1: Create Consolidated Schema
- Create new `schemas.py` with all models
- Integrate validation logic from `validators.py`
- Ensure exact database schema alignment

### Phase 2: Update Imports
- Update all imports across the codebase
- Replace model imports to use new consolidated file
- Update service layer to remove defensive patterns

### Phase 3: Remove Old Files
- Delete `models.py` and `validators.py`
- Clean up any remaining references
- Update documentation and examples

### Phase 4: Testing and Validation
- Run comprehensive test suite
- Verify API functionality
- Confirm database operations work correctly