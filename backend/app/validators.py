"""
Validation functions for SafarSaga booking system
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from decimal import Decimal

from app.models import Destination, BookingCreate, ContactInfo
from app.exceptions import ValidationException, NotFoundException, BusinessLogicException


class DestinationBookingValidator:
    """Validator for destination-based bookings"""
    
    @staticmethod
    def validate_destination_exists_and_active(destination: Optional[Destination]) -> None:
        """Validate that destination exists and is active"""
        if not destination:
            raise NotFoundException("Destination", "provided destination ID")
        
        if not destination.is_active:
            raise BusinessLogicException(
                "This destination is currently not available for booking",
                "destination_inactive"
            )
    
    @staticmethod
    def validate_booking_data(booking_data: BookingCreate) -> None:
        """Validate booking creation data"""
        # Validate seats count
        if booking_data.seats < 1 or booking_data.seats > 10:
            raise ValidationException("Number of seats must be between 1 and 10")
        
        # Validate travel date if provided
        if booking_data.travel_date:
            try:
                # Parse the date string
                travel_date = datetime.fromisoformat(booking_data.travel_date.replace('Z', '+00:00'))
                
                # Check if date is in the future
                if travel_date.date() <= datetime.now(timezone.utc).date():
                    raise ValidationException("Travel date must be in the future")
                
                # Check if date is not too far in the future (e.g., 2 years)
                max_future_date = datetime.now(timezone.utc).replace(year=datetime.now().year + 2)
                if travel_date > max_future_date:
                    raise ValidationException("Travel date cannot be more than 2 years in the future")
                    
            except ValueError as e:
                if "Travel date must be in the future" in str(e):
                    raise ValidationException(str(e))
                raise ValidationException("Invalid travel date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
    
    @staticmethod
    def validate_contact_info(contact_info: ContactInfo) -> None:
        """Validate contact information"""
        if not contact_info.phone:
            raise ValidationException("Phone number is required")
        
        # Basic phone number validation
        phone_digits = contact_info.phone.replace('+', '').replace('-', '').replace(' ', '')
        if not phone_digits.isdigit():
            raise ValidationException("Phone number must contain only digits, spaces, hyphens, and plus sign")
        
        if len(phone_digits) < 10 or len(phone_digits) > 15:
            raise ValidationException("Phone number must be between 10 and 15 digits")
        
        # Validate emergency contact if provided
        if contact_info.emergency_contact:
            emergency_digits = contact_info.emergency_contact.replace('+', '').replace('-', '').replace(' ', '')
            if not emergency_digits.isdigit():
                raise ValidationException("Emergency contact must contain only digits, spaces, hyphens, and plus sign")
            
            if len(emergency_digits) < 10 or len(emergency_digits) > 15:
                raise ValidationException("Emergency contact must be between 10 and 15 digits")
    
    @staticmethod
    def calculate_booking_amount(destination: Destination, seats: int, duration_days: int = 3) -> Decimal:
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
        
        if not destination.average_cost_per_day:
            # Default price if not set
            base_price = Decimal('2000.00')
        else:
            base_price = destination.average_cost_per_day
        
        # Calculate total: base_price * seats * duration
        total_amount = base_price * Decimal(str(seats)) * Decimal(str(duration_days))
        
        return total_amount
    
    @staticmethod
    def calculate_package_booking_amount(destination: Destination, seats: int) -> Decimal:
        """Calculate total package booking amount for destination"""
        # SAFETY: Ensure seats is properly converted
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
        
        if not destination.package_price:
            # Default price if not set
            package_price = Decimal('15000.00')
        else:
            package_price = destination.package_price
        
        # Calculate total: package_price * seats (no duration multiplier)
        total_amount = package_price * Decimal(str(seats))
        
        return total_amount
    
    @staticmethod
    def validate_booking_status_transition(current_status: str, new_status: str) -> None:
        """Validate booking status transitions"""
        valid_transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['cancelled'],  # Can only cancel confirmed bookings
            'cancelled': []  # Cannot change from cancelled
        }
        
        if current_status not in valid_transitions:
            raise ValidationException(f"Invalid current booking status: {current_status}")
        
        if new_status not in valid_transitions[current_status]:
            raise ValidationException(
                f"Cannot change booking status from {current_status} to {new_status}"
            )
    
    @staticmethod
    def validate_payment_status_transition(current_payment_status: str, new_payment_status: str, booking_status: str) -> None:
        """Validate payment status transitions"""
        # Payment can only be confirmed for pending or confirmed bookings
        if new_payment_status == 'paid' and booking_status == 'cancelled':
            raise ValidationException("Cannot confirm payment for cancelled booking")
        
        # Cannot change from paid to unpaid (except refund)
        if current_payment_status == 'paid' and new_payment_status == 'unpaid':
            raise ValidationException("Cannot change payment status from paid to unpaid. Use refunded status instead.")
        
        # Refund only allowed for paid bookings
        if new_payment_status == 'refunded' and current_payment_status != 'paid':
            raise ValidationException("Can only refund paid bookings")


class BookingBusinessRules:
    """Business rules for booking operations"""
    
    @staticmethod
    def can_cancel_booking(booking_status: str, travel_date: Optional[datetime] = None) -> tuple[bool, str]:
        """Check if booking can be cancelled"""
        if booking_status == 'cancelled':
            return False, "Booking is already cancelled"
        
        if travel_date:
            # Check if travel date is in the past
            if travel_date <= datetime.now(timezone.utc):
                return False, "Cannot cancel booking for past travel dates"
            
            # Check cancellation policy (e.g., 48 hours before travel)
            hours_until_travel = (travel_date - datetime.now(timezone.utc)).total_seconds() / 3600
            if hours_until_travel < 48:
                return False, "Cannot cancel booking less than 48 hours before travel date"
        
        return True, "Booking can be cancelled"
    
    @staticmethod
    def calculate_refund_amount(total_amount: Decimal, travel_date: Optional[datetime] = None) -> Decimal:
        """Calculate refund amount based on cancellation policy"""
        if not travel_date:
            return total_amount * Decimal('0.9')  # 90% refund if no travel date
        
        hours_until_travel = (travel_date - datetime.now(timezone.utc)).total_seconds() / 3600
        
        if hours_until_travel >= 168:  # 7 days or more
            return total_amount * Decimal('0.95')  # 95% refund
        elif hours_until_travel >= 72:  # 3-7 days
            return total_amount * Decimal('0.80')  # 80% refund
        elif hours_until_travel >= 48:  # 2-3 days
            return total_amount * Decimal('0.60')  # 60% refund
        else:
            return Decimal('0.00')  # No refund for cancellations within 48 hours
    
    @staticmethod
    def get_duration_days(travel_date: Optional[str] = None) -> int:
        """Get estimated duration for destination booking"""
        # Default duration is 3 days for destination bookings
        # In the future, this could be based on destination type or user selection
        return 3


# Convenience functions for common validations
def validate_destination_booking(destination: Destination, booking_data: BookingCreate) -> Dict[str, Any]:
    """Complete validation for destination booking creation"""
    validator = DestinationBookingValidator()
    
    # Validate destination
    validator.validate_destination_exists_and_active(destination)
    
    # Validate booking data
    validator.validate_booking_data(booking_data)
    
    # Validate contact info
    validator.validate_contact_info(booking_data.contact_info)
    
    # Calculate package amount (no duration multiplier)
    total_amount = validator.calculate_package_booking_amount(destination, booking_data.seats)
    
    return {
        'destination': destination,
        'total_amount': total_amount,
        'validated': True
    }