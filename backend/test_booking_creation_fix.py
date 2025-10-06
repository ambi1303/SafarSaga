#!/usr/bin/env python3
"""
Test script to verify booking creation fix
"""

import asyncio
import json
from datetime import datetime, timezone
from app.services.supabase_service import SupabaseService
from app.models import BookingCreate, ContactInfo

async def test_booking_creation():
    """Test booking creation with proper data types"""
    
    # Initialize service
    supabase_service = SupabaseService()
    
    # Test data with proper types
    test_booking_data = {
        "user_id": "test-user-id",
        "destination_id": "test-destination-id", 
        "seats": 2,  # Integer
        "total_amount": 2499.5,  # Float
        "special_requests": "Test booking creation",
        "contact_info": {
            "phone": "+91-9876543210",
            "emergency_contact": "+91-9876543211"
        },
        "travel_date": "2025-12-15T10:00:00Z",
        "booking_status": "pending",
        "payment_status": "unpaid"
    }
    
    print("Testing booking creation with data:")
    print(json.dumps(test_booking_data, indent=2, default=str))
    
    try:
        # Test the create_destination_booking method
        booking = await supabase_service.create_destination_booking(test_booking_data)
        print(f"\n✅ Booking created successfully!")
        print(f"Booking ID: {booking.id}")
        print(f"Seats: {booking.seats} (type: {type(booking.seats)})")
        print(f"Total Amount: {booking.total_amount} (type: {type(booking.total_amount)})")
        
    except Exception as e:
        print(f"\n❌ Booking creation failed: {str(e)}")
        print(f"Error type: {type(e)}")
        
        # Print more details for debugging
        import traceback
        traceback.print_exc()

async def test_pydantic_validation():
    """Test Pydantic model validation"""
    
    print("\n" + "="*50)
    print("Testing Pydantic BookingCreate validation")
    print("="*50)
    
    # Test contact info
    contact_info = ContactInfo(
        phone="+91-9876543210",
        emergency_contact="+91-9876543211"
    )
    
    # Test booking create model
    booking_create = BookingCreate(
        destination_id="test-destination-id",
        seats=2,
        travel_date="2025-12-15T10:00:00Z",
        special_requests="Test booking",
        contact_info=contact_info
    )
    
    print(f"✅ BookingCreate model validation passed!")
    print(f"Seats: {booking_create.seats} (type: {type(booking_create.seats)})")
    print(f"Destination ID: {booking_create.destination_id}")
    print(f"Travel Date: {booking_create.travel_date}")
    print(f"Contact Info: {booking_create.contact_info}")

if __name__ == "__main__":
    print("🧪 Testing Booking Creation Fix")
    print("="*50)
    
    # Run Pydantic validation test
    asyncio.run(test_pydantic_validation())
    
    # Run booking creation test (this will likely fail due to missing user/destination)
    # but it will help us identify data type issues
    asyncio.run(test_booking_creation())