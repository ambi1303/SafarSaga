"""
Standardized error responses for booking system
"""

from typing import Dict, Any, Optional
from fastapi import HTTPException, status


class BookingErrorCodes:
    """Standardized error codes for booking operations"""
    
    # Destination errors
    DESTINATION_NOT_FOUND = "DESTINATION_NOT_FOUND"
    DESTINATION_INACTIVE = "DESTINATION_INACTIVE"
    
    # Validation errors
    INVALID_SEATS_COUNT = "INVALID_SEATS_COUNT"
    INVALID_TRAVEL_DATE = "INVALID_TRAVEL_DATE"
    INVALID_CONTACT_INFO = "INVALID_CONTACT_INFO"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    
    # Business logic errors
    DUPLICATE_BOOKING = "DUPLICATE_BOOKING"
    BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND"
    BOOKING_ALREADY_CANCELLED = "BOOKING_ALREADY_CANCELLED"
    BOOKING_CANNOT_BE_CANCELLED = "BOOKING_CANNOT_BE_CANCELLED"
    BOOKING_ALREADY_CONFIRMED = "BOOKING_ALREADY_CONFIRMED"
    
    # Payment errors
    PAYMENT_ALREADY_CONFIRMED = "PAYMENT_ALREADY_CONFIRMED"
    PAYMENT_CANNOT_BE_REFUNDED = "PAYMENT_CANNOT_BE_REFUNDED"
    INVALID_PAYMENT_STATUS_TRANSITION = "INVALID_PAYMENT_STATUS_TRANSITION"
    
    # Authorization errors
    BOOKING_ACCESS_DENIED = "BOOKING_ACCESS_DENIED"
    ADMIN_REQUIRED = "ADMIN_REQUIRED"
    
    # System errors
    BOOKING_CREATION_FAILED = "BOOKING_CREATION_FAILED"
    DATABASE_ERROR = "DATABASE_ERROR"


class BookingErrorMessages:
    """User-friendly error messages"""
    
    ERROR_MESSAGES = {
        BookingErrorCodes.DESTINATION_NOT_FOUND: "The selected destination is not available or does not exist.",
        BookingErrorCodes.DESTINATION_INACTIVE: "This destination is currently not available for booking.",
        
        BookingErrorCodes.INVALID_SEATS_COUNT: "Number of travelers must be between 1 and 10.",
        BookingErrorCodes.INVALID_TRAVEL_DATE: "Please select a valid travel date in the future.",
        BookingErrorCodes.INVALID_CONTACT_INFO: "Please provide a valid phone number.",
        BookingErrorCodes.MISSING_REQUIRED_FIELD: "Please fill in all required fields.",
        
        BookingErrorCodes.DUPLICATE_BOOKING: "You already have an active booking for this destination.",
        BookingErrorCodes.BOOKING_NOT_FOUND: "Booking not found or you don't have permission to access it.",
        BookingErrorCodes.BOOKING_ALREADY_CANCELLED: "This booking has already been cancelled.",
        BookingErrorCodes.BOOKING_CANNOT_BE_CANCELLED: "This booking cannot be cancelled at this time.",
        BookingErrorCodes.BOOKING_ALREADY_CONFIRMED: "This booking has already been confirmed.",
        
        BookingErrorCodes.PAYMENT_ALREADY_CONFIRMED: "Payment for this booking has already been confirmed.",
        BookingErrorCodes.PAYMENT_CANNOT_BE_REFUNDED: "This payment cannot be refunded.",
        BookingErrorCodes.INVALID_PAYMENT_STATUS_TRANSITION: "Invalid payment status change.",
        
        BookingErrorCodes.BOOKING_ACCESS_DENIED: "You don't have permission to access this booking.",
        BookingErrorCodes.ADMIN_REQUIRED: "Admin privileges required for this operation.",
        
        BookingErrorCodes.BOOKING_CREATION_FAILED: "Failed to create booking. Please try again.",
        BookingErrorCodes.DATABASE_ERROR: "A system error occurred. Please try again later."
    }
    
    @classmethod
    def get_message(cls, error_code: str, default: str = "An error occurred") -> str:
        """Get user-friendly message for error code"""
        return cls.ERROR_MESSAGES.get(error_code, default)


class BookingHTTPException(HTTPException):
    """Custom HTTP exception for booking operations"""
    
    def __init__(
        self,
        error_code: str,
        message: Optional[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.user_message = message or BookingErrorMessages.get_message(error_code)
        
        detail = {
            "error_code": error_code,
            "message": self.user_message,
            "details": details or {}
        }
        
        super().__init__(status_code=status_code, detail=detail)


# Convenience functions for common booking errors
def destination_not_found_error(destination_id: str) -> BookingHTTPException:
    """Destination not found error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.DESTINATION_NOT_FOUND,
        status_code=status.HTTP_404_NOT_FOUND,
        details={"destination_id": destination_id}
    )


def destination_inactive_error(destination_name: str) -> BookingHTTPException:
    """Destination inactive error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.DESTINATION_INACTIVE,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"destination_name": destination_name}
    )


def invalid_seats_error(seats: int) -> BookingHTTPException:
    """Invalid seats count error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.INVALID_SEATS_COUNT,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"seats": seats, "valid_range": "1-10"}
    )


def invalid_travel_date_error(travel_date: str, reason: str) -> BookingHTTPException:
    """Invalid travel date error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.INVALID_TRAVEL_DATE,
        message=f"Invalid travel date: {reason}",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"travel_date": travel_date, "reason": reason}
    )


def invalid_contact_info_error(field: str, reason: str) -> BookingHTTPException:
    """Invalid contact info error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.INVALID_CONTACT_INFO,
        message=f"Invalid {field}: {reason}",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"field": field, "reason": reason}
    )


def duplicate_booking_error(destination_name: str) -> BookingHTTPException:
    """Duplicate booking error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.DUPLICATE_BOOKING,
        status_code=status.HTTP_409_CONFLICT,
        details={"destination_name": destination_name}
    )


def booking_not_found_error(booking_id: str) -> BookingHTTPException:
    """Booking not found error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.BOOKING_NOT_FOUND,
        status_code=status.HTTP_404_NOT_FOUND,
        details={"booking_id": booking_id}
    )


def booking_access_denied_error(booking_id: str) -> BookingHTTPException:
    """Booking access denied error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.BOOKING_ACCESS_DENIED,
        status_code=status.HTTP_403_FORBIDDEN,
        details={"booking_id": booking_id}
    )


def booking_already_cancelled_error(booking_id: str) -> BookingHTTPException:
    """Booking already cancelled error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.BOOKING_ALREADY_CANCELLED,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"booking_id": booking_id}
    )


def booking_cannot_be_cancelled_error(booking_id: str, reason: str) -> BookingHTTPException:
    """Booking cannot be cancelled error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.BOOKING_CANNOT_BE_CANCELLED,
        message=f"Booking cannot be cancelled: {reason}",
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"booking_id": booking_id, "reason": reason}
    )


def payment_already_confirmed_error(booking_id: str) -> BookingHTTPException:
    """Payment already confirmed error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.PAYMENT_ALREADY_CONFIRMED,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        details={"booking_id": booking_id}
    )


def booking_creation_failed_error(reason: str) -> BookingHTTPException:
    """Booking creation failed error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.BOOKING_CREATION_FAILED,
        message=f"Failed to create booking: {reason}",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        details={"reason": reason}
    )


def database_error(operation: str, error_message: str) -> BookingHTTPException:
    """Database error"""
    return BookingHTTPException(
        error_code=BookingErrorCodes.DATABASE_ERROR,
        message="A system error occurred. Please try again later.",
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        details={"operation": operation, "error": error_message}
    )


# Error handler for validation exceptions
def handle_validation_error(error: Exception) -> BookingHTTPException:
    """Convert validation errors to standardized booking errors"""
    error_message = str(error).lower()
    
    if "phone" in error_message:
        return invalid_contact_info_error("phone", str(error))
    elif "travel date" in error_message or "date" in error_message:
        return invalid_travel_date_error("", str(error))
    elif "seats" in error_message:
        return BookingHTTPException(
            error_code=BookingErrorCodes.INVALID_SEATS_COUNT,
            message=str(error),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
    else:
        return BookingHTTPException(
            error_code=BookingErrorCodes.MISSING_REQUIRED_FIELD,
            message=str(error),
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )


# Error response format for API documentation
BOOKING_ERROR_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "error_code": {
            "type": "string",
            "description": "Standardized error code for programmatic handling"
        },
        "message": {
            "type": "string", 
            "description": "User-friendly error message"
        },
        "details": {
            "type": "object",
            "description": "Additional error details and context"
        }
    },
    "required": ["error_code", "message"]
}