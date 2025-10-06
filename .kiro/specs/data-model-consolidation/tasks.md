# Implementation Plan

- [ ] 1. Create consolidated schemas.py with base models and enums
  - Create new `backend/app/schemas.py` file with proper imports and base classes
  - Define BaseModelWithId, TimestampMixin, and all enum classes matching database constraints
  - Implement utility classes for common validation patterns
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 2. Implement User models with integrated validation
  - Create UserBase, UserCreate, UserUpdate, and User models matching users table schema
  - Integrate email validation, phone number validation, and password requirements
  - Add proper Field constraints and @validator decorators for all user-related validation
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 3. Implement Destination models with database alignment
  - Create DestinationBase, DestinationCreate, DestinationUpdate, and Destination models
  - Match exact field names and types from destinations table schema
  - Integrate validation for difficulty levels, cost validation, and array field handling
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 4. Implement Event models with relationship handling
  - Create EventBase, EventCreate, EventUpdate, and Event models matching events table
  - Add validation for date ranges, capacity constraints, and JSONB itinerary field
  - Implement proper handling of array fields (inclusions, exclusions, gallery_images)
  - _Requirements: 2.1, 2.2, 3.1_

- [x] 5. Implement Booking models with complex validation logic



  - Create BookingBase, BookingCreate, BookingUpdate, and Booking models matching tickets table
  - Integrate all validation logic from validators.py using Pydantic @validator decorators
  - Implement ContactInfo model with phone validation and travel date validation
  - Add business rule validation for booking status transitions and payment status
  - _Requirements: 2.1, 2.2, 4.1_

- [ ] 6. Implement Gallery models and utility models
  - Create GalleryImageBase, GalleryImageCreate, GalleryImageUpdate, and GalleryImage models
  - Implement API response models (ApiResponse, ErrorResponse, PaginatedResponse)
  - Create authentication models (LoginRequest, LoginResponse, TokenData)
  - Add filter and query parameter models (EventFilters, GalleryFilters, etc.)
  - _Requirements: 1.1, 2.1, 5.1_

- [ ] 7. Update all import statements across the codebase
  - Update imports in all router files (auth.py, bookings.py, events.py, destinations.py, gallery.py)
  - Update imports in service files (supabase_service.py, cloudinary_service.py)
  - Update imports in middleware and exception handling files
  - Update imports in all test files
  - _Requirements: 1.2, 5.3_

- [ ] 8. Remove defensive coding patterns from supabase_service.py
  - Remove try/except blocks for multiple column sorting (booked_at, created_at, updated_at fallbacks)
  - Remove fallback logic in booking creation that handles model creation failures
  - Update all database queries to use exact field names matching the new schema models
  - _Requirements: 3.2, 3.3_

- [ ] 9. Delete redundant files and clean up
  - Delete backend/app/models.py file
  - Delete backend/app/validators.py file
  - Update any remaining references or imports that might have been missed
  - _Requirements: 4.1, 4.2_

- [ ] 10. Create comprehensive tests for consolidated models
  - Write unit tests for all model validation logic using pytest
  - Test field constraints, @validator decorators, and model creation/update scenarios
  - Create integration tests to verify models work correctly with database operations
  - Test error handling and validation error messages
  - _Requirements: 2.2, 3.1, 3.3_

- [ ] 11. Verify API functionality and database operations
  - Run existing test suite to ensure no regressions
  - Test all API endpoints to confirm they work with consolidated models
  - Verify database CRUD operations work without defensive coding patterns
  - Test booking creation, user registration, and other critical flows
  - _Requirements: 1.1, 3.2, 5.2_