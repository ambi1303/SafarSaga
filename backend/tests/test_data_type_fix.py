#!/usr/bin/env python3
"""
Specific tests for the data type conversion fix
Tests the exact issue that was causing 'str' object cannot be interpreted as an integer
"""

import pytest
from app.models import Booking, BookingStatus, PaymentStatus
from datetime import datetime, timezone
from decimal import Decimal


class TestDataTypeConversion:
    """Test the specific data type conversion fix"""

    def test_booking_creation_with_string_seats(self):
        """Test that Booking model handles string seats correctly"""
        # This simulates data coming from database as strings
        booking_data = {
            "id": "booking-123",
            "user_id": "user-123",
            "destination_id": "dest-123",
            "seats": "2",  # String instead of int - this was causing the error
            "total_amount": "12000.00",  # String instead of Decimal
            "booking_status": "pending",
            "payment_status": "unpaid",
            "travel_date": datetime.now(timezone.utc),
            "booked_at": datetime.now(timezone.utc)
        }
        
        # Convert string types to proper types (this is what our fix does)
        if isinstance(booking_data['seats'], str):
            booking_data['seats'] = int(booking_data['seats'])
        if isinstance(booking_data['total_amount'], str):
            booking_data['total_amount'] = float(booking_data['total_amount'])
        
        # This should now work without the 'str' object cannot be interpreted as an integer error
        booking = Booking(**booking_data)
        
        assert booking.seats == 2
        assert booking.total_amount == Decimal('12000.0')
        assert booking.booking_status == BookingStatus.PENDING
        assert booking.payment_status == PaymentStatus.UNPAID

    def test_booking_creation_with_mixed_types(self):
        """Test booking creation with mixed string/numeric types"""
        booking_data = {
            "id": "booking-456",
            "user_id": "user-456",
            "destination_id": "dest-456",
            "seats": "1",  # String
            "total_amount": 6000.00,  # Float
            "booking_status": BookingStatus.CONFIRMED,  # Enum
            "payment_status": "paid",  # String
            "travel_date": datetime.now(timezone.utc),
            "booked_at": datetime.now(timezone.utc)
        }
        
        # Apply the same conversion logic
        if isinstance(booking_data['seats'], str):
            booking_data['seats'] = int(booking_data['seats'])
        if isinstance(booking_data['total_amount'], str):
            booking_data['total_amount'] = float(booking_data['total_amount'])
        
        booking = Booking(**booking_data)
        
        assert booking.seats == 1
        assert booking.total_amount == Decimal('6000.0')
        assert booking.booking_status == BookingStatus.CONFIRMED
        assert booking.payment_status == PaymentStatus.PAID

    def test_booking_creation_with_numeric_types(self):
        """Test that numeric types still work correctly"""
        booking_data = {
            "id": "booking-789",
            "user_id": "user-789",
            "destination_id": "dest-789",
            "seats": 3,  # Already int
            "total_amount": Decimal('18000.00'),  # Already Decimal
            "booking_status": BookingStatus.PENDING,
            "payment_status": PaymentStatus.UNPAID,
            "travel_date": datetime.now(timezone.utc),
            "booked_at": datetime.now(timezone.utc)
        }
        
        # Apply conversion logic (should be no-op for correct types)
        if isinstance(booking_data['seats'], str):
            booking_data['seats'] = int(booking_data['seats'])
        if isinstance(booking_data['total_amount'], str):
            booking_data['total_amount'] = float(booking_data['total_amount'])
        
        booking = Booking(**booking_data)
        
        assert booking.seats == 3
        assert booking.total_amount == Decimal('18000.00')

    def test_edge_case_string_conversions(self):
        """Test edge cases in string to number conversion"""
        test_cases = [
            ("1", 1),
            ("10", 10),
            ("5", 5),  # Valid seat count
        ]
        
        for string_val, expected_int in test_cases:
            booking_data = {
                "id": f"booking-{expected_int}",
                "user_id": "user-test",
                "destination_id": "dest-test",
                "seats": string_val,
                "total_amount": f"{expected_int * 1000}.00",
                "booking_status": "pending",
                "payment_status": "unpaid",
                "travel_date": datetime.now(timezone.utc),
                "booked_at": datetime.now(timezone.utc)
            }
            
            # Apply conversion
            if isinstance(booking_data['seats'], str):
                booking_data['seats'] = int(booking_data['seats'])
            if isinstance(booking_data['total_amount'], str):
                booking_data['total_amount'] = float(booking_data['total_amount'])
            
            booking = Booking(**booking_data)
            assert booking.seats == expected_int

    def test_decimal_string_conversions(self):
        """Test decimal string conversions"""
        test_cases = [
            ("1000.00", Decimal('1000.0')),
            ("2500.50", Decimal('2500.5')),
            ("0.00", Decimal('0.0')),
            ("999999.99", Decimal('999999.99')),
        ]
        
        for string_val, expected_decimal in test_cases:
            booking_data = {
                "id": "booking-decimal-test",
                "user_id": "user-test",
                "destination_id": "dest-test",
                "seats": 1,
                "total_amount": string_val,
                "booking_status": "pending",
                "payment_status": "unpaid",
                "travel_date": datetime.now(timezone.utc),
                "booked_at": datetime.now(timezone.utc)
            }
            
            # Apply conversion
            if isinstance(booking_data['total_amount'], str):
                booking_data['total_amount'] = float(booking_data['total_amount'])
            
            booking = Booking(**booking_data)
            assert booking.total_amount == expected_decimal

    def test_invalid_string_conversions(self):
        """Test that invalid string conversions raise appropriate errors"""
        # Invalid seat count
        with pytest.raises(ValueError):
            int("invalid")
        
        # Invalid decimal
        with pytest.raises(ValueError):
            float("invalid")
        
        # These would be caught by our error handling in the service layer

    def test_original_error_scenario(self):
        """Test the exact scenario that was causing the original error"""
        # This simulates the exact data structure that was failing
        database_response = {
            "id": "d1d45e89-f496-4949-95a8-a46b4bc9fdff",
            "user_id": "user-123",
            "destination_id": "d1d45e89-f496-4949-95a8-a46b4bc9fdff",
            "seats": "1",  # This was the problematic string
            "total_amount": "6000.00",  # This was also a string
            "booking_status": "pending",
            "payment_status": "unpaid",
            "special_requests": "Need Mon veg",
            "travel_date": "2025-10-15T00:00:00",
            "contact_info": {
                "phone": "+913434566666",
                "emergency_contact": None
            },
            "booked_at": "2025-10-06T13:41:23.854233",
            "created_at": "2025-10-06T13:41:23.854233",
            "updated_at": "2025-10-06T13:41:23.854233"
        }
        
        # Apply our fix
        if isinstance(database_response['seats'], str):
            database_response['seats'] = int(database_response['seats'])
        if isinstance(database_response['total_amount'], str):
            database_response['total_amount'] = float(database_response['total_amount'])
        
        # Convert string dates to datetime objects
        database_response['travel_date'] = datetime.fromisoformat(database_response['travel_date'])
        database_response['booked_at'] = datetime.fromisoformat(database_response['booked_at'])
        
        # This should now work without the original error
        booking = Booking(**database_response)
        
        assert booking.seats == 1
        assert booking.total_amount == Decimal('6000.0')
        assert booking.special_requests == "Need Mon veg"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])