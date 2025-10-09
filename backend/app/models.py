"""
SafarSaga Data Models
"""

from pydantic import BaseModel, Field, validator, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum

# Enums
class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"

class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MODERATE = "Moderate"
    CHALLENGING = "Challenging"


class BookingBusinessRules:
    """A container for booking-related business logic."""
    @staticmethod
    def calculate_booking_amount(
        cost_per_day: Optional[Decimal],
        seats: int,
        duration_days: int = 1
    ) -> Decimal:
        """Calculates the total booking amount."""
        if cost_per_day is None or cost_per_day < 0:
            cost_per_day = Decimal('0')
        
        if seats < 1:
            seats = 1
        
        if duration_days < 1:
            duration_days = 1
        
        return (cost_per_day * Decimal(seats) * Decimal(duration_days))


# Base Models
class ContactInfo(BaseModel):
    """Contact information model"""
    phone: str = Field(..., description="Phone number")
    emergency_contact: Optional[str] = Field(None, description="Emergency contact number")
    
    @validator('phone', pre=True)
    def validate_phone_format(cls, v):
        """Enhanced phone number validation"""
        if not v:
            raise ValueError('Phone number is required')
        
        if not isinstance(v, str):
            raise ValueError(f'Phone number must be a string, got {type(v).__name__}')
        
        v = v.strip()
        if not v:
            raise ValueError('Phone number cannot be empty')
        
        phone_digits = v.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        
        if not phone_digits.isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, parentheses, and plus sign')
        
        if len(phone_digits) < 10:
            raise ValueError(f'Phone number must be at least 10 digits, got {len(phone_digits)} digits')
        elif len(phone_digits) > 15:
            raise ValueError(f'Phone number cannot exceed 15 digits, got {len(phone_digits)} digits')
        
        return v

class BookingBase(BaseModel):
    """Base booking model"""
    seats: int = Field(..., ge=1, le=10, description="Number of seats booked (1-10)")
    special_requests: Optional[str] = Field(None, max_length=500, description="Special requests")

class BookingCreate(BookingBase):
    """Model for creating a new booking"""
    destination_id: str = Field(..., description="Destination ID to book")
    travel_date: Optional[str] = Field(None, description="Preferred travel date as ISO string")
    contact_info: ContactInfo = Field(..., description="Contact information (required)")
    
    @validator('seats', pre=True)
    def validate_seats_count(cls, v):
        """Enhanced validation and conversion for seats count"""
        if isinstance(v, str):
            v = v.strip()
            
            if not v:
                raise ValueError('Seat count cannot be empty')
            
            if not v.isdigit():
                if v.lower() in ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']:
                    raise ValueError(f'Please enter seat count as a number, not as text: "{v}"')
                elif '.' in v:
                    raise ValueError(f'Seat count must be a whole number, not a decimal: "{v}"')
                elif v.lower() in ['none', 'null', 'undefined']:
                    raise ValueError('Seat count is required and cannot be null')
                else:
                    raise ValueError(f'Invalid seat count: "{v}" is not a valid number')
            
            v = int(v)
            
        elif isinstance(v, float):
            if not v.is_integer():
                raise ValueError(f'Seat count must be a whole number, not a decimal: {v}')
            v = int(v)
            
        elif isinstance(v, int):
            pass  # Already an integer
            
        elif v is None:
            raise ValueError('Seat count is required and cannot be null')
            
        else:
            raise ValueError(f'Invalid seat count data type: {type(v).__name__}. Expected a number.')
        
        # Validate range
        if v < 1:
            raise ValueError(f'Number of seats must be at least 1, got: {v}')
        elif v > 10:
            raise ValueError(f'Number of seats cannot exceed 10, got: {v}')
        
        return v

class BookingUpdate(BaseModel):
    """Model for updating a booking"""
    seats: Optional[int] = Field(None, ge=1, le=10)
    special_requests: Optional[str] = Field(None, max_length=500)
    booking_status: Optional[BookingStatus] = None
    payment_status: Optional[PaymentStatus] = None

class Booking(BaseModel):
    """Complete booking model"""
    id: str
    user_id: str
    destination_id: Optional[str] = None
    event_id: Optional[str] = None
    seats: int
    total_amount: float
    booking_status: BookingStatus
    payment_status: PaymentStatus
    travel_date: Optional[str] = None
    special_requests: Optional[str] = None
    booked_at: str
    created_at: Optional[str] = None  # Alias for booked_at or separate field
    updated_at: Optional[str] = None
    payment_confirmed_at: Optional[str] = None
    
    # Enriched fields (populated by joins)
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    destination_name: Optional[str] = None
    
    @validator("created_at", pre=True, always=True)
    def set_created_at(cls, v, values):
        """Set created_at from booked_at if not provided"""
        if v is None and 'booked_at' in values:
            return values['booked_at']
        return v
    
    class Config:
        extra = "ignore"  # Ignore extra fields from database

class User(BaseModel):
    """User model"""
    id: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_admin: bool = False
    is_active: Optional[bool] = True
    promoted_by: Optional[str] = None  # ID of admin who promoted this user
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Destination(BaseModel):
    """Destination model"""
    id: str
    name: str
    location: Optional[str] = None
    state: Optional[str] = None
    description: Optional[str] = None
    featured_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    package_price: Optional[Decimal] = None
    difficulty_level: Optional[DifficultyLevel] = None
    best_time_to_visit: Optional[str] = None
    popular_activities: Optional[List[str]] = None
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        extra = "ignore"  # Ignore extra fields from database

class DestinationCreate(BaseModel):
    """Model for creating destinations"""
    name: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    featured_image_url: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[List[str]] = None
    package_price: Optional[Decimal] = Field(None, ge=0)
    difficulty_level: Optional[DifficultyLevel] = None
    best_time_to_visit: Optional[str] = Field(None, max_length=200)
    popular_activities: Optional[List[str]] = None
    is_active: bool = True

class DestinationUpdate(BaseModel):
    """Model for updating destinations"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=2000)
    featured_image_url: Optional[str] = Field(None, max_length=500)
    gallery_images: Optional[List[str]] = None
    package_price: Optional[Decimal] = Field(None, ge=0)
    difficulty_level: Optional[DifficultyLevel] = None
    best_time_to_visit: Optional[str] = Field(None, max_length=200)
    popular_activities: Optional[List[str]] = None
    is_active: Optional[bool] = None

class Event(BaseModel):
    """Event model"""
    id: str
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    max_capacity: Optional[int] = None
    current_bookings: int = 0
    price: Optional[Decimal] = None
    is_active: bool = True

class EventCreate(BaseModel):
    """Model for creating events"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=200)
    max_capacity: Optional[int] = Field(None, ge=1)
    price: Optional[Decimal] = Field(None, ge=0)
    is_active: bool = True

class EventUpdate(BaseModel):
    """Model for updating events"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = Field(None, max_length=200)
    max_capacity: Optional[int] = Field(None, ge=1)
    price: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


# New Album-based Gallery System Models
class GalleryAlbum(BaseModel):
    """Gallery album model"""
    id: str
    title: str
    description: Optional[str] = None
    destination_id: Optional[str] = None
    created_at: str
    updated_at: str
    
    # Enriched fields
    destination_name: Optional[str] = None
    image_count: Optional[int] = 0
    cover_image_url: Optional[str] = None  # First image in the album
    
    class Config:
        extra = "ignore"

class GalleryAlbumCreate(BaseModel):
    """Model for creating gallery albums"""
    title: str = Field(..., min_length=1, max_length=200, description="Album title")
    description: Optional[str] = Field(None, max_length=1000, description="Album description")
    destination_id: Optional[str] = Field(None, description="Associated destination ID")

    @field_validator("destination_id", mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty string to None for UUID validation"""
        if v == "":
            return None
        return v

class GalleryAlbumUpdate(BaseModel):
    """Model for updating gallery albums"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    destination_id: Optional[str] = None

    @field_validator("destination_id", mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Convert empty string to None for UUID validation"""
        if v == "":
            return None
        return v

class GalleryAlbumImage(BaseModel):
    """Gallery image within an album"""
    id: str
    album_id: str
    image_url: str
    caption: Optional[str] = None
    display_order: int
    created_at: str
    updated_at: str
    
    class Config:
        extra = "ignore"

class GalleryAlbumImageCreate(BaseModel):
    """Model for creating gallery images in an album"""
    image_url: str = Field(..., max_length=2000, description="Direct image URL from storage")
    caption: Optional[str] = Field(None, max_length=500, description="Image caption")
    display_order: Optional[int] = Field(0, ge=0, description="Display order (0-based)")

class GalleryAlbumImageUpdate(BaseModel):
    """Model for updating gallery images"""
    image_url: Optional[str] = Field(None, max_length=2000)
    caption: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = Field(None, ge=0)

class GalleryAlbumWithImages(GalleryAlbum):
    """Gallery album with all its images"""
    images: List[GalleryAlbumImage] = []

class EventFilters(BaseModel):
    """Event filtering options"""
    location: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    is_active: Optional[bool] = None
    search: Optional[str] = None

class PaginatedResponse(BaseModel):
    """Paginated response model"""
    items: List[Any]
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool

class LoginRequest(BaseModel):
    """Login request model"""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str
    token_type: str = "bearer"
    user: User

class UserCreate(BaseModel):
    """User creation model"""
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")
    full_name: Optional[str] = Field(None, description="User full name")

class ApiResponse(BaseModel):
    """Generic API response model"""
    message: str
    success: bool = True
    data: Optional[Any] = None


# App Settings Models
class AppSettings(BaseModel):
    """Complete app settings model"""
    id: int = 1
    
    # General Settings (Company Profile)
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    
    # Social Media Links
    social_facebook_url: Optional[str] = None
    social_instagram_url: Optional[str] = None
    social_twitter_url: Optional[str] = None
    social_linkedin_url: Optional[str] = None
    social_youtube_url: Optional[str] = None
    
    # Booking & Payment Settings
    payment_gateway_key: Optional[str] = None
    payment_gateway_secret: Optional[str] = None
    currency: Optional[str] = None
    gstin: Optional[str] = None
    gst_rate: Optional[Decimal] = None
    terms_and_conditions: Optional[str] = None
    
    # System Settings
    maintenance_mode: Optional[bool] = None
    notify_on_new_booking: Optional[bool] = None
    notify_on_new_user: Optional[bool] = None
    notify_on_payment: Optional[bool] = None
    
    # Metadata
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        extra = "ignore"

class AppSettingsUpdate(BaseModel):
    """Model for updating app settings"""
    # General Settings (Company Profile)
    company_name: Optional[str] = Field(None, max_length=200)
    logo_url: Optional[str] = Field(None, max_length=500)
    contact_email: Optional[str] = Field(None, max_length=100)
    contact_phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = Field(None, max_length=500)
    
    # Social Media Links
    social_facebook_url: Optional[str] = Field(None, max_length=200)
    social_instagram_url: Optional[str] = Field(None, max_length=200)
    social_twitter_url: Optional[str] = Field(None, max_length=200)
    social_linkedin_url: Optional[str] = Field(None, max_length=200)
    social_youtube_url: Optional[str] = Field(None, max_length=200)
    
    # Booking & Payment Settings
    payment_gateway_key: Optional[str] = Field(None, max_length=200)
    payment_gateway_secret: Optional[str] = Field(None, max_length=200)
    currency: Optional[str] = Field(None, max_length=10)
    gstin: Optional[str] = Field(None, max_length=20)
    gst_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    terms_and_conditions: Optional[str] = Field(None, max_length=5000)
    
    # System Settings
    maintenance_mode: Optional[bool] = None
    notify_on_new_booking: Optional[bool] = None
    notify_on_new_user: Optional[bool] = None
    notify_on_payment: Optional[bool] = None

class AppSettingsResponse(AppSettings):
    """Response model for app settings (excludes sensitive data)"""
    # Override sensitive fields to exclude them from responses
    payment_gateway_key: Optional[str] = Field(None, description="Hidden for security")
    payment_gateway_secret: Optional[str] = Field(None, description="Hidden for security")
    
    @validator('payment_gateway_key', 'payment_gateway_secret', pre=True, always=True)
    def mask_sensitive_data(cls, v):
        """Mask sensitive payment gateway data in responses"""
        if v and len(v) > 4:
            return f"****{v[-4:]}"  # Show only last 4 characters
        return "****" if v else None
