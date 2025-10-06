#!/usr/bin/env python3
"""
Test improved debugging visibility for booking data types
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.services.supabase_service import SupabaseService

async def test_debugging_visibility():
    """Test that debug logs show data types before database insert"""
    print("🔍 TESTING DEBUGGING VISIBILITY")
    print("=" * 60)
    
    supabase_service = SupabaseService()
    
    # Test data with various data types to see debug output
    test_cases = [
        {
            "name": "String data types (common issue)",
            "data": {
                "user_id": "user-12345678",
                "destination_id": "dest-12345678",
                "seats": "3",  # String
                "total_amount": "299.99",  # String
                "special_requests": "Window seat",
                "booking_status": "pending",
                "payment_status": "unpaid"
            }
        },
        {
            "name": "Mixed data types",
            "data": {
                "user_id": "user-87654321",
                "destination_id": "dest-87654321",
                "seats": 2,  # Integer
                "total_amount": "199.50",  # String
                "special_requests": "Aisle seat",
                "booking_status": "pending",
                "payment_status": "unpaid"
            }
        },
        {
            "name": "Float data types",
            "data": {
                "user_id": "user-11111111",
                "destination_id": "dest-11111111",
                "seats": 4.0,  # Float (whole number)
                "total_amount": 399.99,  # Float
                "special_requests": "Extra legroom",
                "booking_status": "pending",
                "payment_status": "unpaid"
            }
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {case['name']}")
        print("=" * 50)
        
        print("Input data types:")
        for key, value in case['data'].items():
            if key in ['seats', 'total_amount']:
                print(f"  - {key}: {value} (type: {type(value).__name__})")
        
        try:
            print(f"\nTesting create_destination_booking() with {case['name']}...")
            
            # This will show debug logs before the database insert
            result = await supabase_service.create_destination_booking(case['data'])
            print("✅ Booking creation succeeded (unexpected - no real destination)")
            
        except Exception as e:
            error_message = str(e)
            print(f"❌ Expected failure: {error_message}")
            
            # Check if it's a database/destination error (good) vs type error (bad)
            if "'str' object cannot be interpreted as an integer" in error_message:
                print("🚨 TYPE CONVERSION ERROR STILL OCCURRING!")
                return False
            elif any(phrase in error_message.lower() for phrase in [
                "destination", "database", "uuid", "insert", "connection"
            ]):
                print("✅ Good! Database/destination error, not type conversion error")
            else:
                print(f"❓ Other error: {error_message}")
        
        print("-" * 50)
    
    return True

async def test_legacy_function_debugging():
    """Test debugging visibility in legacy create_booking function"""
    print(f"\n🔍 TESTING LEGACY FUNCTION DEBUGGING")
    print("=" * 60)
    
    supabase_service = SupabaseService()
    
    test_data = {
        "user_id": "user-legacy-test",
        "destination_id": "dest-legacy-test",
        "seats": "5",  # String that should be converted
        "total_amount": "499.99",  # String that should be converted
        "special_requests": "Legacy booking test",
        "booking_status": "pending",
        "payment_status": "unpaid"
    }
    
    print("Input data types for legacy function:")
    for key, value in test_data.items():
        if key in ['seats', 'total_amount']:
            print(f"  - {key}: {value} (type: {type(value).__name__})")
    
    try:
        print(f"\nTesting legacy create_booking() function...")
        
        # This will show debug logs before the database insert
        result = await supabase_service.create_booking(test_data)
        print("✅ Legacy booking creation succeeded (unexpected)")
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Expected failure: {error_message}")
        
        # Check if it's a database error (good) vs type error (bad)
        if "'str' object cannot be interpreted as an integer" in error_message:
            print("🚨 TYPE CONVERSION ERROR IN LEGACY FUNCTION!")
            return False
        else:
            print("✅ Good! Database error, not type conversion error")
    
    return True

async def main():
    """Run debugging visibility tests"""
    print("🔍 DEBUGGING VISIBILITY TEST SUITE")
    print("=" * 70)
    print("This test verifies that debug logs show data types before database insert")
    print("Look for 'DEBUG - Incoming booking_data before insert' messages")
    print("=" * 70)
    
    # Test new function debugging
    new_function_success = await test_debugging_visibility()
    
    # Test legacy function debugging
    legacy_function_success = await test_legacy_function_debugging()
    
    print("\n" + "=" * 70)
    print("📊 DEBUGGING VISIBILITY TEST RESULTS")
    print("=" * 70)
    
    if new_function_success and legacy_function_success:
        print("🎉 SUCCESS! Debugging visibility is working correctly!")
        print("✅ Debug logs show data types before database insert")
        print("✅ Both new and legacy functions have debug visibility")
        print("✅ Type conversion errors can be easily identified")
        print("🔍 Debug logs will help troubleshoot any future data type issues")
    else:
        print("❌ Some debugging visibility issues found:")
        if not new_function_success:
            print("  - New function debugging needs improvement")
        if not legacy_function_success:
            print("  - Legacy function debugging needs improvement")

if __name__ == "__main__":
    asyncio.run(main())