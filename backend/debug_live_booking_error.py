#!/usr/bin/env python3
"""
Debug script to trace the exact location of the 'str' to int conversion error
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.services.supabase_service import SupabaseService
from app.models import BookingCreate, ContactInfo
from app.exceptions import ValidationException

async def test_live_booking_flow():
    """Test the exact booking flow that's failing"""
    print("🔍 Testing Live Booking Flow")
    print("=" * 50)
    
    # Simulate the exact data that would come from the frontend
    test_cases = [
        {
            "name": "Frontend FormData simulation",
            "data": {
                "destination_id": "dest-12345678",
                "seats": "2",  # This is likely coming as a string from FormData
                "travel_date": "2025-12-25",
                "special_requests": "Window seat",
                "contact_info": {
                    "phone": "9876543210"
                }
            }
        },
        {
            "name": "JSON payload simulation",
            "data": {
                "destination_id": "dest-12345678",
                "seats": 2,  # This might be coming as an integer
                "travel_date": "2025-12-25",
                "special_requests": "Window seat",
                "contact_info": {
                    "phone": "9876543210"
                }
            }
        }
    ]
    
    service = SupabaseService()
    
    for case in test_cases:
        print(f"\n--- Testing: {case['name']} ---")
        
        try:
            # Test Pydantic model validation first
            print("1. Testing Pydantic model validation...")
            contact_info = ContactInfo(**case['data']['contact_info'])
            booking_create = BookingCreate(
                destination_id=case['data']['destination_id'],
                seats=case['data']['seats'],
                travel_date=case['data']['travel_date'],
                special_requests=case['data']['special_requests'],
                contact_info=contact_info
            )
            print(f"   ✅ Pydantic validation passed")
            print(f"   - seats: {booking_create.seats} (type: {type(booking_create.seats)})")
            
            # Test service layer validation
            print("2. Testing service layer validation...")
            create_data = {
                "user_id": "user-12345678",
                "destination_id": booking_create.destination_id,
                "seats": booking_create.seats,
                "total_amount": 1500.0,
                "special_requests": booking_create.special_requests,
                "contact_info": booking_create.contact_info.model_dump(),
                "travel_date": booking_create.travel_date,
                "booking_status": "pending",
                "payment_status": "unpaid"
            }
            
            validated_data = service._validate_and_convert_booking_data(create_data)
            print(f"   ✅ Service validation passed")
            print(f"   - seats: {validated_data['seats']} (type: {type(validated_data['seats'])})")
            
            # Test the actual database insertion (without actually inserting)
            print("3. Testing database preparation...")
            print(f"   - Final data types before DB:")
            for key, value in validated_data.items():
                print(f"     {key}: {value} (type: {type(value)})")
            
            print(f"   ✅ All validations passed for {case['name']}")
            
        except Exception as e:
            print(f"   ❌ Error in {case['name']}: {str(e)}")
            print(f"   Error type: {type(e)}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()}")

def check_supabase_service_directly():
    """Check if there are any other places in the service that might cause the error"""
    print("\n🔍 Checking Supabase Service for potential str->int conversions")
    print("=" * 60)
    
    # Read the service file and look for int() calls
    try:
        with open('app/services/supabase_service.py', 'r') as f:
            content = f.read()
        
        lines = content.split('\n')
        int_calls = []
        
        for i, line in enumerate(lines, 1):
            if 'int(' in line and 'print' not in line:
                int_calls.append((i, line.strip()))
        
        print(f"Found {len(int_calls)} int() calls in supabase_service.py:")
        for line_num, line in int_calls:
            print(f"  Line {line_num}: {line}")
        
        # Also check for any other potential conversion issues
        str_conversions = []
        for i, line in enumerate(lines, 1):
            if ('str(' in line or 'float(' in line) and 'print' not in line:
                str_conversions.append((i, line.strip()))
        
        print(f"\nFound {len(str_conversions)} other type conversions:")
        for line_num, line in str_conversions:
            print(f"  Line {line_num}: {line}")
            
    except Exception as e:
        print(f"Error reading service file: {e}")

def main():
    """Run the debugging"""
    print("🚨 DEBUGGING LIVE BOOKING ERROR")
    print("=" * 60)
    
    # Check the service file for potential issues
    check_supabase_service_directly()
    
    # Test the booking flow
    asyncio.run(test_live_booking_flow())
    
    print("\n" + "=" * 60)
    print("🔍 DEBUGGING COMPLETE")
    print("If the error persists, it might be in:")
    print("1. Database schema constraints")
    print("2. Supabase client library internal conversions")
    print("3. Some other part of the code not covered by our validation")

if __name__ == "__main__":
    main()