"""
Custom exceptions for SafarSaga API
"""

from fastapi import HTTPException
from typing import Optional, Dict, Any


class SafarSagaException(Exception):
    """Base exception for SafarSaga API"""
    
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(SafarSagaException):
    """Exception for validation errors"""
    
    def __init__(self, message: str, field: Optional[str] = None, value: Optional[Any] = None):
        details = {}
        if field:
            details["field"] = field
        if value is not None:
            details["value"] = value
        
        super().__init__(message, status_code=422, details=details)


class AuthenticationException(SafarSagaException):
    """Exception for authentication errors"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status_code=401)


class AuthorizationException(SafarSagaException):
    """Exception for authorization errors"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403)


class NotFoundException(SafarSagaException):
    """Exception for resource not found errors"""
    
    def __init__(self, resource: str, identifier: Optional[str] = None):
        message = f"{resource} not found"
        if identifier:
            message += f" with ID: {identifier}"
        
        super().__init__(message, status_code=404, details={"resource": resource, "identifier": identifier})


class ConflictException(SafarSagaException):
    """Exception for resource conflict errors"""
    
    def __init__(self, message: str, resource: Optional[str] = None):
        details = {}
        if resource:
            details["resource"] = resource
        
        super().__init__(message, status_code=409, details=details)


class BusinessLogicException(SafarSagaException):
    """Exception for business logic violations"""
    
    def __init__(self, message: str, rule: Optional[str] = None):
        details = {}
        if rule:
            details["business_rule"] = rule
        
        super().__init__(message, status_code=400, details=details)


class ExternalServiceException(SafarSagaException):
    """Exception for external service errors"""
    
    def __init__(self, service: str, message: str = "External service error"):
        super().__init__(
            f"{service}: {message}", 
            status_code=502, 
            details={"service": service}
        )


class RateLimitException(SafarSagaException):
    """Exception for rate limiting"""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: Optional[int] = None):
        details = {}
        if retry_after:
            details["retry_after"] = retry_after
        
        super().__init__(message, status_code=429, details=details)


class FileUploadException(SafarSagaException):
    """Exception for file upload errors"""
    
    def __init__(self, message: str, filename: Optional[str] = None):
        details = {}
        if filename:
            details["filename"] = filename
        
        super().__init__(message, status_code=400, details=details)


class PaymentException(SafarSagaException):
    """Exception for payment processing errors"""
    
    def __init__(self, message: str, payment_id: Optional[str] = None, gateway: Optional[str] = None):
        details = {}
        if payment_id:
            details["payment_id"] = payment_id
        if gateway:
            details["gateway"] = gateway
        
        super().__init__(message, status_code=402, details=details)


class BookingException(SafarSagaException):
    """Exception for booking-related errors"""
    
    def __init__(self, message: str, booking_id: Optional[str] = None, event_id: Optional[str] = None):
        details = {}
        if booking_id:
            details["booking_id"] = booking_id
        if event_id:
            details["event_id"] = event_id
        
        super().__init__(message, status_code=400, details=details)


class CapacityException(BookingException):
    """Exception for event capacity issues"""
    
    def __init__(self, available_seats: int, requested_seats: int, event_id: Optional[str] = None):
        message = f"Insufficient capacity. Available: {available_seats}, Requested: {requested_seats}"
        
        # Call parent constructor with proper parameters
        super().__init__(message, booking_id=None, event_id=event_id)
        
        # Add capacity-specific details
        self.details.update({
            "available_seats": available_seats,
            "requested_seats": requested_seats
        })


class EventException(SafarSagaException):
    """Exception for event-related errors"""
    
    def __init__(self, message: str, event_id: Optional[str] = None):
        details = {}
        if event_id:
            details["event_id"] = event_id
        
        super().__init__(message, status_code=400, details=details)


class DatabaseException(SafarSagaException):
    """Exception for database errors"""
    
    def __init__(self, message: str = "Database operation failed", operation: Optional[str] = None):
        details = {}
        if operation:
            details["operation"] = operation
        
        super().__init__(message, status_code=500, details=details)


# Utility functions for converting exceptions to HTTP responses
def exception_to_http_exception(exc: SafarSagaException) -> HTTPException:
    """Convert SafarSagaException to FastAPI HTTPException"""
    return HTTPException(
        status_code=exc.status_code,
        detail={
            "error": exc.message,
            "status_code": exc.status_code,
            **exc.details
        }
    )


def handle_supabase_error(error: Exception, operation: str = "database operation") -> SafarSagaException:
    """Convert Supabase errors to SafarSagaException"""
    error_message = str(error).lower()
    
    if "not found" in error_message or "no rows" in error_message:
        return NotFoundException("Resource", "unknown")
    elif "duplicate" in error_message or "unique constraint" in error_message:
        return ConflictException("Resource already exists")
    elif "foreign key" in error_message:
        return ValidationException("Invalid reference to related resource")
    elif "check constraint" in error_message:
        return ValidationException("Data validation failed")
    elif "permission denied" in error_message or "rls" in error_message:
        return AuthorizationException("Insufficient database permissions")
    else:
        return DatabaseException(f"Database error during {operation}", operation)


def handle_cloudinary_error(error: Exception, operation: str = "image operation") -> SafarSagaException:
    """Convert Cloudinary errors to SafarSagaException"""
    error_message = str(error).lower()
    
    if "not found" in error_message:
        return NotFoundException("Image")
    elif "invalid" in error_message or "bad request" in error_message:
        return ValidationException("Invalid image or parameters")
    elif "unauthorized" in error_message:
        return AuthenticationException("Invalid Cloudinary credentials")
    elif "quota" in error_message or "limit" in error_message:
        return RateLimitException("Cloudinary quota exceeded")
    else:
        return ExternalServiceException("Cloudinary", f"Error during {operation}")


# Unified Exception Handler for FastAPI
from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def safarsaga_exception_handler(request: Request, exc: SafarSagaException) -> JSONResponse:
    """
    Unified handler for all SafarSaga exceptions.
    
    This handler provides consistent error responses across the entire API,
    proper logging, and structured error details for debugging.
    """
    # Log exception with context
    logger.error(
        f"SafarSaga Exception: {exc.__class__.__name__} - {exc.message}",
        extra={
            "error_type": exc.__class__.__name__,
            "status_code": exc.status_code,
            "error_message": exc.message,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method,
            "client_ip": request.client.host if request.client else "unknown"
        }
    )
    
    # Return consistent JSON response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "error_type": exc.__class__.__name__,
            "status_code": exc.status_code,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )