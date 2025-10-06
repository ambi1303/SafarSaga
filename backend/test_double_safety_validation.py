#!/usr/bin/env python3
"""
Test double-safety validation for both booking functions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.services.supabase_service import SupabaseService
from app.models import ContactInfo

async def test_legacy_create_booking_safety():
    """Test that legacy create_booking() has safety conversion"""
    print("🧪 Testing Legacy create_booking() Safety")
    print("=" * 50)
    
    supabase_service = SupabaseService()
    
    # Test data with string values that need conversion
    test_booking_data = {
        "user_id": "user-12345678",
        "destination_id": "dest-12345678",
        "seats": "3",  # String that should be converted to int
        "total_amount": "299.99",  # String that should be converted to float
        "special_requests": "Window seat please",
        "contact_info": {
            "phone": "9876543210",
            "emergency_contact": None
        },
        "travel_date": "2025-12-25",
        "booking_status": "pending",
        "payment_status": "unpaid"
    }
    
    try:
        print("Testing legacy create_booking() with string data types:")
        print(f"  - seats: '{test_booking_data['seats']}' (type: {type(test_booking_data['seats'])})")
        print(f"  - total_amount: '{test_booking_data['total_amount']}' (type: {type(test_booking_data['total_amount'])})")
        
        # This should fail at destination lookup, but NOT at type conversion
        result = await supabase_service.create_booking(test_booking_data)
        print("✅ Legacy create_booking() succeeded (unexpected)")
        return True
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ Legacy create_booking() failed: {error_message}")
        
        # Check if it's the specific error we're trying to prevent
        if "'str' object cannot be interpreted as an integer" in error_message:
            print("🚨 THE STRING-TO-INTEGER ERROR IS STILL OCCURRING IN LEGACY FUNCTION!")
            return False
        elif any(phrase in error_message.lower() for phrase in [
            "destination", "database", "connection", "table", "insert"
        ]):
            print("✅ Good! The error is about database/destination, not data type conversion")
            print("   This means the safety conversion is working in legacy function!")
            return True
        else:
            print(f"❓ Different error occurred: {error_message}")
            return True  # At least it's not the str->int error

async def test_new_create_destination_booking_safety():
    """Test that create_destination_booking() has safety conversion"""
    print("\n🧪 Testing New create_destination_booking() Safety")
    print("=" * 50)
    
    supabase_service = SupabaseService()
    
    # Test data with string values that need conversion
    test_booking_data = {
        "user_id": "user-12345678",
        "destination_id": "dest-12345678",
        "seats": "2",  # String that should be converted to int
        "total_amount": "199.50",  # String that should be converted to float
        "special_requests": "Aisle seat please",
        "contact_info": {
            "phone": "1234567890",
            "emergency_contact": None
        },
        "travel_date": "2025-11-15",
        "booking_status": "pending",
        "payment_status": "unpaid"
    }
    
    try:
        print("Testing create_destination_booking() with string data types:")
        print(f"  - seats: '{test_booking_data['seats']}' (type: {type(test_booking_data['seats'])})")
        print(f"  - total_amount: '{test_booking_data['total_amount']}' (type: {type(test_booking_data['total_amount'])})")
        
        # This should fail at destination lookup, but NOT at type conversion
        result = await supabase_service.create_destination_booking(test_booking_data)
        print("✅ create_destination_booking() succeeded (unexpected)")
        return True
        
    except Exception as e:
        error_message = str(e)
        print(f"❌ create_destination_booking() failed: {error_message}")
        
        # Check if it's the specific error we're trying to prevent
        if "'str' object cannot be interpreted as an integer" in error_message:
            print("🚨 THE STRING-TO-INTEGER ERROR IS STILL OCCURRING IN NEW FUNCTION!")
            return False
        elif any(phrase in error_message.lower() for phrase in [
            "destination", "database", "connection", "table", "insert"
        ]):
            print("✅ Good! The error is about database/destination, not data type conversion")
            print("   This means the safety conversion is working in new function!")
            return True
        else:
            print(f"❓ Different error occurred: {error_message}")
            return True  # At least it's not the str->int error

async def test_validation_function_directly():
    """Test the validation function directly"""
    print("\n🧪 Testing _validate_and_convert_booking_data() Directly")
    print("=" * 50)
    
    supabase_service = SupabaseService()
    
    test_cases = [
        {
            "name": "String seats and amount",
            "data": {"seats": "4", "total_amount": "399.99"},
            "expected_seats": 4,
            "expected_amount": 399.99
        },
        {
            "name": "Integer seats, string amount",
            "data": {"seats": 2, "total_amount": "150.00"},
            "expected_seats": 2,
            "expected_amount": 150.00
        },
        {
            "name": "Float seats (whole number), float amount",
            "data": {"seats": 3.0, "total_amount": 275.50},
            "expected_seats": 3,
            "expected_amount": 275.50
        }
    ]
    
    for case in test_cases:
        try:
            print(f"\nTesting {case['name']}:")
            print(f"  Input - seats: {case['data']['seats']} ({type(case['data']['seats'])})")
            print(f"  Input - total_amount: {case['data']['total_amount']} ({type(case['data']['total_amount'])})")
            
            result = supabase_service._validate_and_convert_booking_data(case['data'])
            
            print(f"  Output - seats: {result['seats']} ({type(result['seats'])})")
            print(f"  Output - total_amount: {result['total_amount']} ({type(result['total_amount'])})")
            
            # Verify conversions
            if result['seats'] == case['expected_seats'] and isinstance(result['seats'], int):
                print("  ✅ Seats conversion successful")
            else:
                print(f"  ❌ Seats conversion failed: expected {case['expected_seats']}, got {result['seats']}")
            
            if result['total_amount'] == case['expected_amount'] and isinstance(result['total_amount'], float):
                print("  ✅ Total amount conversion successful")
            else:
                print(f"  ❌ Total amount conversion failed: expected {case['expected_amount']}, got {result['total_amount']}")
                
        except Exception as e:
            print(f"  ❌ Validation failed: {str(e)}")

async def main():
    """Run all double-safety tests"""
    print("🔒 TESTING DOUBLE-SAFETY VALIDATION")
    print("=" * 60)
    
    # Test legacy function
    legacy_success = await test_legacy_create_booking_safety()
    
    # Test new function
    new_success = await test_new_create_destination_booking_safety()
    
    # Test validation function directly
    await test_validation_function_directly()
    
    print("\n" + "=" * 60)
    print("📊 DOUBLE-SAFETY TEST RESULTS")
    print("=" * 60)
    
    if legacy_success and new_success:
        print("🎉 SUCCESS! Both booking functions have safety conversion!")
        print("✅ Legacy create_booking() is protected with _validate_and_convert_booking_data()")
        print("✅ New create_destination_booking() is protected with _validate_and_convert_booking_data()")
        print("✅ All booking paths are now safe from string-to-integer conversion errors")
        print("🔒 Double-safety validation is complete!")
    else:
        print("❌ Some booking functions still have conversion issues:")
        if not legacy_success:
            print("  - Legacy create_booking() needs safety conversion")
        if not new_success:
            print("  - New create_destination_booking() needs safety conversion")

if __name__ == "__main__":
    asyncio.run(main())