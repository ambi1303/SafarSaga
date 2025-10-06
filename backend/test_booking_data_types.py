#!/usr/bin/env python3
"""
Test script to verify booking data type handling
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models import Booking

def test_booking_creation():
    """Test booking creation with different data types"""
    
    # Test data that might come from database (strings)
    booking_data_strings = {
        "id": "test-id-123",
        "user_id": "user-123",
        "destination_id": "dest-123",
        "event_id": None,
        "seats": "1",  # String instead of int
        "total_amount": "2000.00",  # String instead of float
        "booking_status": "pending",
        "payment_status": "unpaid",
        "special_requests": "Need Mon veg",
        "travel_date": "2025-10-15"
    }
    
    print("Testing booking creation with string data types...")
    print(f"Original data types: {[(k, type(v)) for k, v in booking_data_strings.items()]}")
    
    try:
        # Convert string types to proper types
        if 'seats' in booking_data_strings and isinstance(booking_data_strings['seats'], str):
            booking_data_strings['seats'] = int(booking_data_strings['seats'])
        if 'total_amount' in booking_data_strings and isinstance(booking_data_strings['total_amount'], str):
            booking_data_strings['total_amount'] = float(booking_data_strings['total_amount'])
        
        print(f"Converted data types: {[(k, type(v)) for k, v in booking_data_strings.items()]}")
        
        # Try to create Booking object
        booking = Booking(**booking_data_strings)
        print("✅ Booking creation successful!")
        print(f"Booking: {booking}")
        return True
        
    except Exception as e:
        print(f"❌ Booking creation failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_booking_creation()
    sys.exit(0 if success else 1)