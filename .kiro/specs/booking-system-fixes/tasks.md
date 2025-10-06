# Implementation Plan

- [x] 1. Update Database Schema for Destination Bookings



  - Add destination_id column to tickets table with foreign key constraint
  - Create database indexes for performance optimization
  - Write migration script to update existing event-based bookings to destination-based
  - Test database schema changes with sample data




  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Fix Backend Booking Models and Validation
  - [ ] 2.1 Update Booking model to use destination_id instead of event_id
    - Modify Booking class in models.py to include destination relationship


    - Remove legacy event relationship from booking model
    - Add ContactInfo validation model for structured contact data
    - Update BookingCreate model to accept travel_date as string
    - _Requirements: 2.2, 2.3, 7.1_





  - [ ] 2.2 Create destination booking validation logic
    - Implement destination existence and active status validation
    - Add contact info validation with required phone field
    - Create travel date string to datetime conversion logic

    - Implement booking status validation for updates
    - _Requirements: 2.1, 7.1, 7.2, 7.5_

- [ ] 3. Restructure Supabase Service for Destination Bookings
  - [x] 3.1 Update booking creation methods to use destinations table





    - Modify create_booking method to query destinations instead of events
    - Implement destination-based price calculation logic
    - Add duration calculation for multi-day bookings
    - Create booking record with destination_id field
    - _Requirements: 1.1, 1.2, 5.1, 5.2_



  - [ ] 3.2 Update booking retrieval methods with destination joins
    - Modify get_bookings query to join with destinations table






    - Update get_booking_by_id to include destination details
    - Remove event table joins from booking queries
    - Add destination data to booking response objects

    - _Requirements: 1.3, 2.3, 6.4_

- [ ] 4. Fix Backend Booking Router Logic
  - [ ] 4.1 Update create_booking endpoint to handle destinations
    - Replace event lookup with destination lookup in booking creation




    - Implement proper destination validation and error handling
    - Update price calculation to use destination.average_cost_per_day
    - Fix booking data structure to use destination_id field
    - _Requirements: 1.1, 1.2, 1.5, 5.1_

  - [x] 4.2 Update booking response transformations


    - Modify booking responses to include destination details instead of event details
    - Update payment info endpoint to return destination-based data
    - Fix booking statistics to work with destination bookings
    - Ensure all booking endpoints return consistent destination data
    - _Requirements: 2.3, 2.4, 6.4_

- [ ] 5. Update Frontend Booking Service Integration
  - [ ] 5.1 Fix booking request payload structure
    - Update BookingService.createBooking to send proper destination_id
    - Convert travel_date to ISO string format before sending to backend
    - Structure contact_info object with required phone field
    - Add proper error handling for destination booking failures
    - _Requirements: 2.1, 2.2, 4.2, 4.5_

  - [ ] 5.2 Update booking response transformation
    - Create transformDestinationBooking method to handle new response format




    - Update booking reference generation for destination bookings
    - Fix price display to use destination pricing data
    - Ensure booking status and payment status are properly handled
    - _Requirements: 2.3, 2.4, 6.1, 6.2_


- [ ] 6. Fix Booking Modal and UI Components
  - [ ] 6.1 Update BookingModal to work with destination data
    - Ensure modal receives destination object with proper pricing
    - Fix total amount calculation using destination price
    - Update booking submission to send destination_id correctly








    - Add proper error display for destination booking failures
    - _Requirements: 4.1, 4.2, 4.5, 5.4_



  - [ ] 6.2 Update booking display components
    - Modify booking list components to show destination details
    - Update booking detail pages to display destination information




    - Fix booking status indicators and payment status display
    - Ensure booking cancellation works with destination bookings
    - _Requirements: 6.3, 6.4, 4.3_

- [-] 7. Implement Comprehensive Error Handling

  - [ ] 7.1 Create standardized booking error responses
    - Define specific error codes for destination booking failures
    - Implement proper error messages for validation failures
    - Add error handling for inactive or non-existent destinations
    - Create user-friendly error messages for frontend display
    - _Requirements: 1.5, 7.5, 8.2_

  - [ ] 7.2 Update frontend error handling
    - Add specific error handling for destination booking errors
    - Display appropriate error messages in booking modal
    - Implement retry logic for transient booking failures
    - Add error logging for debugging booking issues
    - _Requirements: 4.5, 8.2_

- [ ] 8. Create Migration Scripts and Data Consistency
  - [ ] 8.1 Write database migration script
    - Create script to add destination_id column to tickets table
    - Implement data migration from event-based to destination-based bookings
    - Add database constraints and indexes for destination bookings
    - Create rollback script for migration reversal if needed
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 8.2 Implement data validation and consistency checks
    - Create script to validate existing booking data integrity
    - Implement checks for orphaned bookings without valid destinations
    - Add validation for booking status and payment status consistency
    - Create data cleanup script for invalid booking records
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Update API Documentation and Testing




  - [ ] 9.1 Update API documentation for destination bookings
    - Document new booking request/response payload structures
    - Update API endpoint descriptions to reflect destination-based booking
    - Add examples showing destination booking flow
    - Document error codes and responses for booking failures
    - _Requirements: 8.1, 8.3, 8.5_


  - [ ] 9.2 Create comprehensive test suite for destination bookings
    - Write unit tests for destination booking creation and validation
    - Create integration tests for end-to-end booking flow
    - Add API tests for all booking endpoints with destination data
    - Implement performance tests for destination booking queries
    - _Requirements: 8.4_

- [ ] 10. Deploy and Validate Booking System Fixes
  - [ ] 10.1 Deploy database schema changes
    - Run migration scripts on staging environment
    - Validate data migration completed successfully
    - Test booking creation with new schema
    - Verify existing bookings still work correctly
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ] 10.2 Deploy backend and frontend changes
    - Deploy updated backend with destination booking logic
    - Deploy frontend with fixed booking service integration
    - Test complete booking flow from frontend to database
    - Validate booking status updates and payment processing work correctly
    - _Requirements: 4.1, 4.2, 4.3, 4.4_