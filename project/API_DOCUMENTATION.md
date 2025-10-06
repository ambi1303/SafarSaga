# SafarSaga API Documentation

## Overview
Complete API documentation for the SafarSaga travel booking platform with destination-based booking system.

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://your-api-domain.com`

## Authentication
All booking-related endpoints require authentication via Bearer token.

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91-9876543210",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### POST /api/auth/google
Google OAuth authentication.

**Request Body:**
```json
{
  "credential": "google_id_token"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/..."
  },
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Destinations Endpoints

#### GET /api/destinations
Get list of available destinations.

**Query Parameters:**
- `is_active` (boolean): Filter active destinations
- `state` (string): Filter by state
- `difficulty_level` (string): Filter by difficulty
- `limit` (integer): Number of results (default: 20)
- `offset` (integer): Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Manali Adventure Trek",
      "state": "Himachal Pradesh",
      "description": "Experience breathtaking mountain views...",
      "average_cost_per_day": 5999,
      "difficulty_level": "Moderate",
      "best_time_to_visit": "Oct-Feb",
      "popular_activities": ["Trekking", "Mountain Views", "Local Culture"],
      "featured_image_url": "https://example.com/image.jpg",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/destinations/{destination_id}
Get specific destination details.

**Response:**
```json
{
  "id": "uuid",
  "name": "Manali Adventure Trek",
  "state": "Himachal Pradesh",
  "description": "Experience breathtaking mountain views...",
  "average_cost_per_day": 5999,
  "difficulty_level": "Moderate",
  "best_time_to_visit": "Oct-Feb",
  "popular_activities": ["Trekking", "Mountain Views", "Local Culture"],
  "featured_image_url": "https://example.com/image.jpg",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Booking Endpoints

#### POST /api/bookings
Create a new destination booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "destination_id": "uuid",
  "seats": 2,
  "travel_date": "2024-12-01",
  "special_requests": "Vegetarian meals preferred",
  "contact_info": {
    "phone": "+91-9876543210",
    "emergency_contact": "+91-9876543211"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "booking_reference": "SS123456",
  "destination_id": "uuid",
  "destination": {
    "id": "uuid",
    "name": "Manali Adventure Trek",
    "state": "Himachal Pradesh",
    "average_cost_per_day": 5999,
    "featured_image_url": "https://example.com/image.jpg"
  },
  "seats": 2,
  "total_amount": 35994,
  "booking_status": "pending",
  "payment_status": "unpaid",
  "travel_date": "2024-12-01",
  "special_requests": "Vegetarian meals preferred",
  "contact_info": {
    "phone": "+91-9876543210",
    "emergency_contact": "+91-9876543211"
  },
  "booked_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/bookings
Get user's bookings list.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string): Filter by booking status
- `limit` (integer): Number of results (default: 20)
- `offset` (integer): Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "booking_reference": "SS123456",
      "destination": {
        "id": "uuid",
        "name": "Manali Adventure Trek",
        "state": "Himachal Pradesh",
        "average_cost_per_day": 5999,
        "featured_image_url": "https://example.com/image.jpg"
      },
      "seats": 2,
      "total_amount": 35994,
      "booking_status": "confirmed",
      "payment_status": "paid",
      "travel_date": "2024-12-01",
      "booked_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/bookings/{booking_id}
Get specific booking details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "booking_reference": "SS123456",
  "destination": {
    "id": "uuid",
    "name": "Manali Adventure Trek",
    "state": "Himachal Pradesh",
    "description": "Experience breathtaking mountain views...",
    "average_cost_per_day": 5999,
    "difficulty_level": "Moderate",
    "popular_activities": ["Trekking", "Mountain Views"],
    "featured_image_url": "https://example.com/image.jpg"
  },
  "seats": 2,
  "total_amount": 35994,
  "booking_status": "confirmed",
  "payment_status": "paid",
  "travel_date": "2024-12-01",
  "special_requests": "Vegetarian meals preferred",
  "contact_info": {
    "phone": "+91-9876543210",
    "emergency_contact": "+91-9876543211"
  },
  "booked_at": "2024-01-01T00:00:00Z",
  "payment_details": {
    "method": "UPI",
    "transaction_id": "TXN123456789",
    "paid_at": "2024-01-01T01:00:00Z"
  }
}
```

#### POST /api/bookings/{booking_id}/confirm-payment
Confirm payment for a booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "payment_method": "UPI",
  "transaction_id": "TXN123456789"
}
```

**Response:**
```json
{
  "booking": {
    "id": "uuid",
    "booking_reference": "SS123456",
    "booking_status": "confirmed",
    "payment_status": "paid",
    "payment_details": {
      "method": "UPI",
      "transaction_id": "TXN123456789",
      "paid_at": "2024-01-01T01:00:00Z"
    }
  },
  "message": "Payment confirmed successfully"
}
```

#### DELETE /api/bookings/{booking_id}
Cancel a booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Booking cancelled successfully",
  "refund_amount": 25195.8,
  "refund_percentage": 70
}
```

## Error Responses

### Standard Error Format
```json
{
  "detail": {
    "code": "VALIDATION_ERROR",
    "message": "Phone number is required",
    "field": "contact_info.phone"
  }
}
```

### Common Error Codes

#### Authentication Errors
- `INVALID_CREDENTIALS` - Invalid email/password
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_INVALID` - Invalid JWT token
- `USER_NOT_FOUND` - User account not found

#### Booking Errors
- `DESTINATION_NOT_FOUND` - Destination does not exist
- `DESTINATION_INACTIVE` - Destination is not active
- `BOOKING_NOT_FOUND` - Booking does not exist
- `BOOKING_NOT_OWNED` - User doesn't own this booking
- `BOOKING_ALREADY_CANCELLED` - Booking is already cancelled
- `CANCELLATION_NOT_ALLOWED` - Booking cannot be cancelled (too late)

#### Validation Errors
- `VALIDATION_ERROR` - Request validation failed
- `MISSING_REQUIRED_FIELD` - Required field is missing
- `INVALID_FIELD_FORMAT` - Field format is invalid
- `INVALID_DATE_RANGE` - Date is in invalid range

#### Server Errors
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service unavailable

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited:
- **Authentication endpoints**: 5 requests per minute
- **Booking endpoints**: 10 requests per minute
- **Destinations endpoints**: 30 requests per minute

## Pagination

List endpoints support pagination:
- `limit`: Number of items per page (max 100)
- `offset`: Number of items to skip
- Response includes `total`, `limit`, and `offset` fields

## Data Types

### Booking Status
- `pending` - Booking created, payment pending
- `confirmed` - Booking confirmed, payment received
- `cancelled` - Booking cancelled

### Payment Status
- `unpaid` - Payment not received
- `paid` - Payment completed
- `refunded` - Payment refunded

### Difficulty Levels
- `Easy` - Suitable for beginners
- `Moderate` - Requires some experience
- `Challenging` - For experienced travelers

## Example Usage

### Complete Booking Flow

1. **Get Destinations**
```bash
curl -X GET "http://localhost:8000/api/destinations?is_active=true&limit=10"
```

2. **Create Booking**
```bash
curl -X POST "http://localhost:8000/api/bookings" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "destination_id": "uuid",
    "seats": 2,
    "travel_date": "2024-12-01",
    "contact_info": {
      "phone": "+91-9876543210"
    }
  }'
```

3. **Confirm Payment**
```bash
curl -X POST "http://localhost:8000/api/bookings/<booking_id>/confirm-payment" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "UPI",
    "transaction_id": "TXN123456789"
  }'
```

4. **Get Booking Details**
```bash
curl -X GET "http://localhost:8000/api/bookings/<booking_id>" \
  -H "Authorization: Bearer <token>"
```

## Testing

### Test Credentials
- **Email**: `test@safarsaga.com`
- **Password**: `testpassword123`

### Test Destinations
The API includes several test destinations for development:
- Manali Adventure Trek (Himachal Pradesh)
- Goa Beach Paradise (Goa)
- Kerala Backwaters Cruise (Kerala)

### Postman Collection
Import the Postman collection for easy API testing:
[Download Collection](./postman_collection.json)

## Support

For API support, contact:
- **Email**: dev@safarsaga.com
- **Documentation**: https://docs.safarsaga.com
- **Status Page**: https://status.safarsaga.com