"""
Database schemas and validation utilities for SafarSaga API
"""

from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
import re


# Validation utilities
class ValidationUtils:
    """Utility class for common validations"""
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """Validate Indian phone number format"""
        if not phone:
            return phone
        
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Check if it's a valid Indian mobile number
        if len(digits_only) == 10 and digits_only.startswith(('6', '7', '8', '9')):
            return f"+91{digits_only}"
        elif len(digits_only) == 12 and digits_only.startswith('91'):
            return f"+{digits_only}"
        else:
            raise ValueError("Invalid Indian phone number format")
    
    @staticmethod
    def validate_upi_id(upi_id: str) -> str:
        """Validate UPI ID format"""
        upi_pattern = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$'
        if not re.match(upi_pattern, upi_id):
            raise ValueError("Invalid UPI ID format")
        return upi_id.lower()
    
    @staticmethod
    def validate_transaction_id(txn_id: str) -> str:
        """Validate transaction ID format"""
        if not txn_id or len(txn_id) < 8:
            raise ValueError("Transaction ID must be at least 8 characters")
        return txn_id.upper()


# Database connection schemas
class DatabaseConfig(BaseModel):
    """Database configuration schema"""
    supabase_url: str
    supabase_service_role_key: str
    
    @validator('supabase_url')
    def validate_supabase_url(cls, v):
        if not v.startswith('https://'):
            raise ValueError('Supabase URL must start with https://')
        return v


# Cloudinary configuration
class CloudinaryConfig(BaseModel):
    """Cloudinary configuration schema"""
    cloud_name: str
    api_key: str
    api_secret: str
    
    @validator('cloud_name')
    def validate_cloud_name(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Cloud name must be at least 3 characters')
        return v


# API configuration
class APIConfig(BaseModel):
    """API configuration schema"""
    environment: str = "development"
    port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000"]
    jwt_secret: Optional[str] = None
    
    @validator('environment')
    def validate_environment(cls, v):
        if v not in ['development', 'staging', 'production']:
            raise ValueError('Environment must be development, staging, or production')
        return v
    
    @validator('port')
    def validate_port(cls, v):
        if not 1000 <= v <= 65535:
            raise ValueError('Port must be between 1000 and 65535')
        return v


# Request validation schemas
class PaginationSchema(BaseModel):
    """Pagination parameters schema"""
    limit: int = 20
    offset: int = 0
    
    @validator('limit')
    def validate_limit(cls, v):
        if not 1 <= v <= 100:
            raise ValueError('Limit must be between 1 and 100')
        return v
    
    @validator('offset')
    def validate_offset(cls, v):
        if v < 0:
            raise ValueError('Offset must be non-negative')
        return v


class SortSchema(BaseModel):
    """Sorting parameters schema"""
    sort_by: str = "created_at"
    sort_order: str = "desc"
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v.lower() not in ['asc', 'desc']:
            raise ValueError('Sort order must be asc or desc')
        return v.lower()


class DateRangeSchema(BaseModel):
    """Date range filtering schema"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError('End date must be after start date')
        return v


# File upload schemas
class FileUploadSchema(BaseModel):
    """File upload validation schema"""
    filename: str
    content_type: str
    file_size: int
    
    @validator('content_type')
    def validate_content_type(cls, v):
        allowed_types = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
        ]
        if v not in allowed_types:
            raise ValueError(f'Content type must be one of: {", ".join(allowed_types)}')
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v):
        max_size = 10 * 1024 * 1024  # 10MB
        if v > max_size:
            raise ValueError('File size must not exceed 10MB')
        return v
    
    @validator('filename')
    def validate_filename(cls, v):
        if not v or len(v) < 1:
            raise ValueError('Filename is required')
        
        # Check for valid file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        if not any(v.lower().endswith(ext) for ext in allowed_extensions):
            raise ValueError(f'File must have one of these extensions: {", ".join(allowed_extensions)}')
        
        return v


# Search schemas
class SearchSchema(BaseModel):
    """Search parameters schema"""
    query: str
    fields: Optional[List[str]] = None
    fuzzy: bool = False
    
    @validator('query')
    def validate_query(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Search query must be at least 2 characters')
        return v.strip()


# Booking validation schemas
class BookingValidationSchema(BaseModel):
    """Booking validation schema"""
    event_id: str
    seats: int
    user_id: str
    
    @validator('seats')
    def validate_seats(cls, v):
        if not 1 <= v <= 10:
            raise ValueError('Seats must be between 1 and 10')
        return v


class PaymentValidationSchema(BaseModel):
    """Payment validation schema"""
    amount: Decimal
    currency: str = "INR"
    payment_method: str
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        if v > Decimal('999999.99'):
            raise ValueError('Amount cannot exceed ₹9,99,999.99')
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        if v != "INR":
            raise ValueError('Only INR currency is supported')
        return v
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        allowed_methods = ['UPI', 'Card', 'NetBanking', 'Wallet']
        if v not in allowed_methods:
            raise ValueError(f'Payment method must be one of: {", ".join(allowed_methods)}')
        return v


# Response schemas
class HealthCheckSchema(BaseModel):
    """Health check response schema"""
    status: str = "OK"
    message: str
    timestamp: datetime
    version: str
    database_connected: bool = True
    cloudinary_connected: bool = True


class ErrorDetailSchema(BaseModel):
    """Detailed error response schema"""
    error_code: str
    error_message: str
    field: Optional[str] = None
    value: Optional[Any] = None


class ValidationErrorSchema(BaseModel):
    """Validation error response schema"""
    error: str = "Validation Error"
    details: List[ErrorDetailSchema]
    status_code: int = 422


# Metrics and analytics schemas
class BookingMetricsSchema(BaseModel):
    """Booking metrics schema"""
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    total_revenue: Decimal
    average_booking_value: Decimal


class EventMetricsSchema(BaseModel):
    """Event metrics schema"""
    total_events: int
    active_events: int
    upcoming_events: int
    past_events: int
    average_capacity_utilization: float


class UserMetricsSchema(BaseModel):
    """User metrics schema"""
    total_users: int
    active_users: int
    admin_users: int
    new_users_this_month: int


# Notification schemas
class NotificationSchema(BaseModel):
    """Notification schema"""
    user_id: str
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    read: bool = False
    created_at: datetime
    
    @validator('type')
    def validate_notification_type(cls, v):
        allowed_types = ['info', 'success', 'warning', 'error']
        if v not in allowed_types:
            raise ValueError(f'Notification type must be one of: {", ".join(allowed_types)}')
        return v


# Audit log schemas
class AuditLogSchema(BaseModel):
    """Audit log schema"""
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    
    @validator('action')
    def validate_action(cls, v):
        allowed_actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
        if v.upper() not in allowed_actions:
            raise ValueError(f'Action must be one of: {", ".join(allowed_actions)}')
        return v.upper()
    
    @validator('resource_type')
    def validate_resource_type(cls, v):
        allowed_types = ['USER', 'EVENT', 'BOOKING', 'GALLERY_IMAGE', 'PAYMENT']
        if v.upper() not in allowed_types:
            raise ValueError(f'Resource type must be one of: {", ".join(allowed_types)}')
        return v.upper()