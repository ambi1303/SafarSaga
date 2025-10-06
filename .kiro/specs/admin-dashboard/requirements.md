# Requirements Document

## Introduction

This document outlines the requirements for building a comprehensive Admin Dashboard for the SafarSaga travel booking platform. The admin dashboard will provide administrators with full control over bookings, payments, users, and travel packages through a modern, responsive React-based interface integrated with the existing FastAPI backend.

The dashboard will enable administrators to monitor booking statistics, manage payment approvals, handle user accounts, and perform CRUD operations on travel packages, all while maintaining secure role-based access control.

## Requirements

### Requirement 1: Admin Authentication & Authorization

**User Story:** As an administrator, I want to securely log in to the admin dashboard so that I can access administrative functions while preventing unauthorized access.

#### Acceptance Criteria

1. WHEN an admin navigates to `/admin/login` THEN the system SHALL display a login form with email and password fields
2. WHEN an admin submits valid credentials THEN the system SHALL authenticate against the backend `/api/auth/login` endpoint
3. WHEN authentication succeeds THEN the system SHALL store the JWT token in localStorage and verify the user role is "admin"
4. WHEN authentication succeeds AND the user role is "admin" THEN the system SHALL redirect to `/admin/dashboard`
5. WHEN authentication fails OR the user role is not "admin" THEN the system SHALL display an appropriate error message
6. WHEN an unauthenticated user attempts to access any `/admin/*` route THEN the system SHALL redirect to `/admin/login`
7. WHEN an authenticated non-admin user attempts to access any `/admin/*` route THEN the system SHALL display an "Access Denied" message
8. WHEN an admin clicks logout THEN the system SHALL clear the JWT token and redirect to `/admin/login`

### Requirement 2: Admin Dashboard Overview

**User Story:** As an administrator, I want to view comprehensive booking statistics and trends at a glance so that I can monitor the overall health of the booking system.

#### Acceptance Criteria

1. WHEN an admin accesses `/admin/dashboard` THEN the system SHALL fetch statistics from `/api/bookings/admin/stats`
2. WHEN statistics are loaded THEN the system SHALL display summary cards showing Total Bookings, Pending Payments, Confirmed Payments, and Cancelled Bookings
3. WHEN statistics are loaded THEN the system SHALL display a visual chart (bar or line) showing bookings by month for the last 12 months
4. WHEN statistics are loaded THEN the system SHALL display top destinations by booking count
5. WHEN the statistics API call fails THEN the system SHALL display an error message with retry option
6. WHEN statistics are loading THEN the system SHALL display loading indicators on each card
7. WHEN the dashboard is displayed THEN the system SHALL auto-refresh statistics every 5 minutes

### Requirement 3: Booking Management

**User Story:** As an administrator, I want to view, search, filter, and manage all bookings in the system so that I can efficiently handle booking operations and customer requests.

#### Acceptance Criteria

1. WHEN an admin accesses `/admin/bookings` THEN the system SHALL fetch all bookings from `/api/bookings/`
2. WHEN bookings are loaded THEN the system SHALL display them in a table with columns: Booking ID, User Name, Trip/Destination, Travel Date, Booking Status, Payment Status, and Actions
3. WHEN an admin enters text in the search field THEN the system SHALL filter bookings by user name, trip name, or booking ID
4. WHEN an admin selects a status filter THEN the system SHALL display only bookings matching that status
5. WHEN an admin clicks on a booking row THEN the system SHALL display detailed booking information including contact info and special requests
6. WHEN an admin updates a booking status THEN the system SHALL call `PUT /api/bookings/{booking_id}` with the new status
7. WHEN a booking status update succeeds THEN the system SHALL refresh the booking list and display a success notification
8. WHEN the booking list exceeds 20 items THEN the system SHALL implement pagination with configurable page size
9. WHEN bookings are loading THEN the system SHALL display a loading skeleton
10. WHEN no bookings match the filters THEN the system SHALL display an empty state message

### Requirement 4: Payment Management

**User Story:** As an administrator, I want to review pending payments and approve or reject them so that I can ensure proper payment processing and booking confirmation.

#### Acceptance Criteria

1. WHEN an admin accesses `/admin/payments` THEN the system SHALL fetch bookings with payment_status of "unpaid" or "paid"
2. WHEN payments are loaded THEN the system SHALL display them in a table with columns: User Name, Trip/Destination, Amount, Payment Status, and Actions
3. WHEN an admin clicks "View Payment Info" THEN the system SHALL call `GET /api/bookings/{booking_id}/payment-info` and display payment details in a modal
4. WHEN an admin clicks "Approve Payment" THEN the system SHALL call `POST /api/bookings/{booking_id}/confirm-payment`
5. WHEN payment approval succeeds THEN the system SHALL update the payment status to "Confirmed" and display a success notification
6. WHEN an admin clicks "Reject Payment" THEN the system SHALL prompt for a rejection reason and update the booking accordingly
7. WHEN payment information is unavailable THEN the system SHALL display a message indicating no payment details found
8. WHEN the payments list is displayed THEN the system SHALL highlight pending payments requiring attention
9. WHEN a payment action is in progress THEN the system SHALL disable the action button and show a loading indicator

### Requirement 5: User Management

**User Story:** As an administrator, I want to view and manage user accounts so that I can handle user-related issues and monitor user activity.

#### Acceptance Criteria

1. WHEN an admin accesses `/admin/users` THEN the system SHALL fetch all users from the backend
2. WHEN users are loaded THEN the system SHALL display them in a table with columns: User ID, Name, Email, Phone, Registration Date, Status, and Actions
3. WHEN an admin clicks "View Bookings" for a user THEN the system SHALL call `GET /api/bookings/user/{user_id}` and display the user's booking history
4. WHEN an admin searches for a user THEN the system SHALL filter users by name, email, or user ID
5. WHEN an admin clicks "Deactivate User" THEN the system SHALL prompt for confirmation and update the user status
6. WHEN an admin clicks "Delete User" THEN the system SHALL display a warning about data deletion and require confirmation
7. WHEN user data is modified THEN the system SHALL log the admin action for audit purposes
8. WHEN the user list is displayed THEN the system SHALL implement pagination for large datasets

### Requirement 6: Trip/Package Management

**User Story:** As an administrator, I want to create, edit, and delete travel packages so that I can maintain an up-to-date catalog of available trips.

#### Acceptance Criteria

1. WHEN an admin accesses `/admin/trips` THEN the system SHALL fetch all trips/destinations from the backend
2. WHEN trips are loaded THEN the system SHALL display them in a grid or table with name, location, price, duration, and status
3. WHEN an admin clicks "Add New Trip" THEN the system SHALL navigate to `/admin/trips/new` with a form for trip details
4. WHEN an admin submits a new trip form THEN the system SHALL validate all required fields (name, location, price, duration)
5. WHEN trip creation succeeds THEN the system SHALL redirect to `/admin/trips` and display a success notification
6. WHEN an admin clicks "Edit" on a trip THEN the system SHALL populate the form with existing trip data
7. WHEN an admin updates a trip THEN the system SHALL call the appropriate API endpoint and refresh the trip list
8. WHEN an admin clicks "Delete" on a trip THEN the system SHALL prompt for confirmation and check for existing bookings
9. WHEN a trip has active bookings THEN the system SHALL prevent deletion and display a warning message
10. WHEN an admin uploads a trip image THEN the system SHALL integrate with Cloudinary or the backend upload endpoint
11. WHEN trip images are displayed THEN the system SHALL show thumbnails with the ability to view full-size images

### Requirement 7: Responsive UI & Navigation

**User Story:** As an administrator, I want a clean, responsive interface that works on desktop and mobile devices so that I can manage the system from anywhere.

#### Acceptance Criteria

1. WHEN the admin dashboard is displayed THEN the system SHALL show a fixed sidebar on the left with navigation links
2. WHEN the viewport width is less than 768px THEN the system SHALL collapse the sidebar into a hamburger menu
3. WHEN an admin clicks a navigation link THEN the system SHALL highlight the active page in the sidebar
4. WHEN the dashboard is displayed THEN the system SHALL show a top navbar with the admin's name and logout button
5. WHEN the admin dashboard is viewed on mobile THEN all tables SHALL be horizontally scrollable or stack responsively
6. WHEN the admin dashboard is displayed THEN the system SHALL use a neutral color palette with white cards on a light gray background
7. WHEN interactive elements are displayed THEN the system SHALL use icons from lucide-react or react-icons
8. WHEN the dashboard loads THEN the system SHALL apply smooth transitions and animations for better UX

### Requirement 8: Error Handling & User Feedback

**User Story:** As an administrator, I want clear feedback on my actions and helpful error messages so that I can quickly understand and resolve any issues.

#### Acceptance Criteria

1. WHEN any API call succeeds THEN the system SHALL display a success toast notification
2. WHEN any API call fails THEN the system SHALL display an error toast notification with the error message
3. WHEN data is loading THEN the system SHALL display loading spinners or skeleton screens
4. WHEN a list or table is empty THEN the system SHALL display an empty state with helpful text and action buttons
5. WHEN a form validation fails THEN the system SHALL highlight invalid fields with error messages
6. WHEN a destructive action is initiated THEN the system SHALL display a confirmation dialog
7. WHEN the user's session expires THEN the system SHALL redirect to login with a session expired message
8. WHEN network connectivity is lost THEN the system SHALL display an offline indicator

### Requirement 9: API Integration & Data Management

**User Story:** As a developer, I want a centralized API client with proper error handling and authentication so that all admin features can reliably communicate with the backend.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL create an Axios instance with the backend base URL
2. WHEN any API request is made THEN the system SHALL automatically attach the JWT token from localStorage in the Authorization header
3. WHEN a 401 Unauthorized response is received THEN the system SHALL clear the token and redirect to login
4. WHEN a 403 Forbidden response is received THEN the system SHALL display an access denied message
5. WHEN a 500 Internal Server Error is received THEN the system SHALL display a user-friendly error message
6. WHEN API responses are received THEN the system SHALL properly parse and validate the response data
7. WHEN multiple API calls are needed THEN the system SHALL implement proper loading states and error boundaries

### Requirement 10: Security & Access Control

**User Story:** As a system administrator, I want robust security measures in place so that only authorized administrators can access sensitive functions.

#### Acceptance Criteria

1. WHEN a JWT token is stored THEN the system SHALL decode and verify the user role before granting admin access
2. WHEN a token expires THEN the system SHALL automatically log out the user and clear stored credentials
3. WHEN admin routes are accessed THEN the system SHALL implement a ProtectedRoute HOC that checks token validity
4. WHEN sensitive actions are performed THEN the system SHALL re-verify the admin role with the backend
5. WHEN the admin dashboard is accessed THEN the system SHALL implement CSRF protection for state-changing operations
6. WHEN passwords are handled THEN the system SHALL never log or display them in plain text
7. WHEN API errors occur THEN the system SHALL not expose sensitive system information to the user
