# Booking System Fixes - Requirements Document

## Introduction

The current booking system has critical architectural issues that prevent users from booking destinations through the frontend. There are payload mismatches, incorrect database relationships, and conflicting logic between destinations and events. This spec addresses these fundamental problems to create a working destination booking system.

## Requirements

### Requirement 1: Fix Backend Booking Logic

**User Story:** As a user, I want to book destinations (not events) so that I can reserve travel packages for specific locations.

#### Acceptance Criteria

1. WHEN a user submits a booking request with a destination_id THEN the system SHALL query the destinations table (not events table)
2. WHEN calculating booking price THEN the system SHALL use destination.average_cost_per_day * seats * duration
3. WHEN storing booking data THEN the system SHALL use destination_id field in the tickets table
4. WHEN validating destination availability THEN the system SHALL check destination.is_active status
5. IF destination does not exist THEN the system SHALL return "Destination not found" error

### Requirement 2: Fix Payload Structure Mismatches

**User Story:** As a frontend developer, I want consistent payload structures so that booking requests work reliably between frontend and backend.

#### Acceptance Criteria

1. WHEN frontend sends travel_date as string THEN backend SHALL accept and convert to datetime
2. WHEN frontend sends contact_info object THEN backend SHALL validate phone field is present
3. WHEN backend returns booking data THEN it SHALL include destination details (not event details)
4. WHEN frontend receives booking response THEN it SHALL contain destination_id field
5. IF payload validation fails THEN system SHALL return specific field error messages

### Requirement 3: Update Database Schema for Destination Bookings

**User Story:** As a system administrator, I want proper database relationships so that bookings are correctly linked to destinations.

#### Acceptance Criteria

1. WHEN tickets table is queried THEN it SHALL have destination_id foreign key to destinations table
2. WHEN booking is created THEN it SHALL store destination_id (not event_id)
3. WHEN fetching booking details THEN it SHALL join with destinations table for destination info
4. WHEN migrating existing data THEN event-based bookings SHALL be preserved with proper mapping
5. IF destination is deleted THEN related bookings SHALL remain with soft-deleted destination data

### Requirement 4: Fix Frontend-Backend API Integration

**User Story:** As a user, I want the booking modal to work correctly so that I can complete destination bookings without errors.

#### Acceptance Criteria

1. WHEN user clicks "Book Now" on a destination THEN booking modal SHALL open with correct destination data
2. WHEN user submits booking form THEN frontend SHALL send properly formatted payload to backend
3. WHEN backend processes booking THEN it SHALL return booking confirmation with destination details
4. WHEN payment is processed THEN booking status SHALL update to confirmed
5. IF booking fails THEN user SHALL see specific error message explaining the issue

### Requirement 5: Implement Proper Price Calculation

**User Story:** As a user, I want accurate pricing so that I know the exact cost of my destination booking.

#### Acceptance Criteria

1. WHEN calculating total price THEN system SHALL use destination.average_cost_per_day as base price
2. WHEN user selects multiple seats THEN total SHALL be base_price * seats * estimated_duration
3. WHEN destination has no price set THEN system SHALL use default price of ₹2000/day
4. WHEN displaying price breakdown THEN frontend SHALL show per-person and total costs
5. IF price calculation fails THEN system SHALL return error with fallback pricing

### Requirement 6: Fix Booking Status and Payment Flow

**User Story:** As a user, I want clear booking status updates so that I can track my reservation and payment.

#### Acceptance Criteria

1. WHEN booking is created THEN status SHALL be "pending" and payment_status SHALL be "unpaid"
2. WHEN payment is confirmed THEN booking_status SHALL update to "confirmed" and payment_status to "paid"
3. WHEN user cancels booking THEN status SHALL update to "cancelled" with appropriate refund processing
4. WHEN fetching user bookings THEN system SHALL return bookings with destination details
5. IF booking status update fails THEN system SHALL maintain data consistency and log error

### Requirement 7: Ensure Data Consistency and Validation

**User Story:** As a system administrator, I want data validation so that bookings maintain integrity across the system.

#### Acceptance Criteria

1. WHEN creating booking THEN system SHALL validate destination exists and is active
2. WHEN processing payment THEN system SHALL verify booking exists and is in valid state
3. WHEN updating booking THEN system SHALL check user permissions and booking status
4. WHEN destination is deactivated THEN existing bookings SHALL remain valid but new bookings SHALL be blocked
5. IF data validation fails THEN system SHALL return specific validation error messages

### Requirement 8: Update API Documentation and Error Handling

**User Story:** As a developer, I want clear API documentation so that I can integrate with the booking system correctly.

#### Acceptance Criteria

1. WHEN API endpoints are called THEN they SHALL return consistent response formats
2. WHEN errors occur THEN system SHALL return standardized error responses with error codes
3. WHEN booking endpoints are documented THEN they SHALL reflect destination-based booking (not event-based)
4. WHEN testing API endpoints THEN they SHALL work with destination IDs from destinations table
5. IF API structure changes THEN documentation SHALL be updated to reflect new payload formats