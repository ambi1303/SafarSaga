#!/usr/bin/env python3
"""
Debug the actual booking error by tracing the exact flow
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.models import BookingCreate, ContactInfo
from app.services.supabase_service import SupabaseService

async def debug_booking_flow():
    """Debug the exact booking flow that's causing the error"""
    print("🚨 DEBUGGING ACTUAL BOOKING ERROR")
    print("=" * 60)
    
    # Simulate the exact data that would come from the frontend
    frontend_data = {
        "destination_id": "dest-12345678",
        "seats": "2",  # This is likely coming as a string from frontend
        "travel_date": "2025-12-25",
        "special_requests": "Window seat please",
        "contact_info": {
            "phone": "9876543210",
            "emergency_contact": None
        }
    }
    
    print("1. Frontend data (before Pydantic validation):")
    for key, value in frontend_data.items():
        if key != "contact_info":
            print(f"   - {key}: {value} (type: {type(value).__name__})")
        else:
            print(f"   - {key}: {value}")
    
    try:
        print("\n2. Testing Pydantic validation...")
        contact_info = ContactInfo(**frontend_data["contact_info"])
        booking_data = BookingCreate(
            destination_id=frontend_data["destination_id"],
            seats=frontend_data["seats"],
            travel_date=frontend_data["travel_date"],
            special_requests=frontend_data["special_requests"],
            contact_info=contact_info
        )
        
        print("   ✅ Pydantic validation passed!")
        print(f"   - seats after Pydantic: {booking_data.seats} (type: {type(booking_data.seats).__name__})")
        print(f"   - destination_id: {booking_data.destination_id}")
        print(f"   - travel_date: {booking_data.travel_date}")
        
        # Now test the business rules calculation that's causing the error
        print("\n3. Testing business rules calculation...")
        from app.models import BookingBusinessRules
        from decimal import Decimal
        
        # Simulate destination cost
        destination_cost = Decimal('1000.00')
        duration_days = 3
        
        print(f"   - destination_cost: {destination_cost}")
        print(f"   - seats for calculation: {booking_data.seats} (type: {type(booking_data.seats).__name__})")
        print(f"   - duration_days: {duration_days}")
        
        # This is the line that's likely causing the error
        total_amount = BookingBusinessRules.calculate_booking_amount(
            destination_cost, 
            booking_data.seats, 
            duration_days
        )
        
        print(f"   ✅ Calculation successful: {total_amount}")
        
        # Test service layer validation
        print("\n4. Testing service layer validation...")
        supabase_service = SupabaseService()
        
        create_data = {
            "user_id": "user-12345678",
            "destination_id": booking_data.destination_id,
            "seats": booking_data.seats,
            "total_amount": float(total_amount),
            "special_requests": booking_data.special_requests,
            "contact_info": booking_data.contact_info.model_dump() if booking_data.contact_info else None,
            "travel_date": booking_data.travel_date,
            "booking_status": "pending",
            "payment_status": "unpaid"
        }
        
        print("   Data going to service layer:")
        for key, value in create_data.items():
            if key != "contact_info":
                print(f"     - {key}: {value} (type: {type(value).__name__})")
        
        validated_data = supabase_service._validate_and_convert_booking_data(create_data)
        print("   ✅ Service layer validation passed!")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error occurred: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        
        # Check if it's the specific error we're debugging
        if "'str' object cannot be interpreted as an integer" in str(e):
            print("   🚨 FOUND THE EXACT ERROR!")
            
            # Let's trace where it's happening
            import traceback
            print("   Traceback:")
            traceback.print_exc()
        
        return False

async def test_direct_calculation():
    """Test the calculation function directly with different data types"""
    print(f"\n🧮 TESTING DIRECT CALCULATION")
    print("=" * 60)
    
    from app.models import BookingBusinessRules
    from decimal import Decimal
    
    destination_cost = Decimal('1000.00')
    duration_days = 3
    
    test_cases = [
        {"name": "Integer seats", "seats": 2},
        {"name": "String seats", "seats": "2"},
        {"name": "Float seats", "seats": 2.0},
    ]
    
    for case in test_cases:
        try:
            print(f"\nTesting {case['name']}: {case['seats']} (type: {type(case['seats']).__name__})")
            
            total_amount = BookingBusinessRules.calculate_booking_amount(
                destination_cost, 
                case['seats'], 
                duration_days
            )
            
            print(f"   ✅ Success: {total_amount}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            if "'str' object cannot be interpreted as an integer" in str(e):
                print("   🚨 FOUND THE ERROR SOURCE!")

async def main():
    """Run the debugging"""
    print("🔍 DEEP INSPECTION OF BOOKING ERROR")
    print("=" * 70)
    
    # Test the full booking flow
    flow_success = await debug_booking_flow()
    
    # Test the calculation function directly
    await test_direct_calculation()
    
    print("\n" + "=" * 70)
    print("📊 DEBUGGING RESULTS")
    print("=" * 70)
    
    if flow_success:
        print("✅ Booking flow completed without the string-to-integer error")
        print("   The error might be in a different code path")
    else:
        print("❌ Found the string-to-integer error in the booking flow")
        print("   This helps identify the exact location of the problem")

if __name__ == "__main__":
    asyncio.run(main())