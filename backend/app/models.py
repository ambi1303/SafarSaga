"""
SafarSaga Data Models
"""

from pydantic import BaseModel, Field, validator
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
    average_cost_per_day: Optional[Decimal] = None
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
    average_cost_per_day: Optional[Decimal] = Field(None, ge=0)
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
    average_cost_per_day: Optional[Decimal] = Field(None, ge=0)
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

class GalleryImage(BaseModel):
    """Gallery image model"""
    id: str
    title: str
    description: Optional[str] = None
    image_url: str
    thumbnail_url: Optional[str] = None
    cloudinary_public_id: str
    category: Optional[str] = None
    is_featured: bool = False
    created_at: str

class GalleryImageCreate(BaseModel):
    """Model for creating gallery images"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: str = Field(..., description="URL of the uploaded image")
    thumbnail_url: Optional[str] = None
    cloudinary_public_id: str = Field(..., description="Cloudinary public ID")
    category: Optional[str] = Field(None, max_length=100)
    is_featured: bool = False

class GalleryImageUpdate(BaseModel):
    """Model for updating gallery images"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, max_length=100)
    is_featured: Optional[bool] = None

class GalleryFilters(BaseModel):
    """Gallery filtering options"""
    category: Optional[str] = None
    is_featured: Optional[bool] = None
    search: Optional[str] = None

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

# Business Rules
class BookingBusinessRules:
    """Business rules for booking operations"""
    
    @staticmethod
    def calculate_booking_amount(destination_cost: Optional[Decimal], seats: int, duration_days: int = 3) -> Decimal:
        """Calculate total booking amount for destination"""
        # 🔒 SAFETY: Ensure seats is properly converted
        if isinstance(seats, str):
            try:
                seats = int(seats.strip())
            except (ValueError, AttributeError):
                raise ValueError(f"Invalid seat count: '{seats}' is not a valid number")
        elif isinstance(seats, float):
            if seats.is_integer():
                seats = int(seats)
            else:
                raise ValueError(f"Seat count must be a whole number: {seats}")
        
        if not destination_cost:
            # Default price if not set
            base_price = Decimal('2000.00')
        else:
            base_price = destination_cost
        
        # Calculate total: base_price * seats * duration
        total_amount = base_price * Decimal(str(seats)) * Decimal(str(duration_days))
        
        return total_amount
    
    @staticmethod
    def calculate_refund_amount(total_amount: Decimal, travel_date: Optional[datetime] = None) -> Decimal:
        """Calculate refund amount based on cancellation policy"""
        if not travel_date:
            return total_amount * Decimal('0.9')  # 90% refund if no travel date
        
        # Add more sophisticated refund logic here
        return total_amount * Decimal('0.8')  # 80% refund default