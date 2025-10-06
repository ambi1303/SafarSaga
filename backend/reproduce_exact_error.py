#!/usr/bin/env python3
"""
Reproduce the exact error by testing different scenarios
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from decimal import Decimal
from app.models import BookingBusinessRules

def test_calculate_booking_amount():
    """Test the calculate_booking_amount function with different data types"""
    print("🧮 TESTING calculate_booking_amount FUNCTION")
    print("=" * 60)
    
    destination_cost = Decimal('1000.00')
    duration_days = 3
    
    test_cases = [
        {"name": "Integer seats", "seats": 2},
        {"name": "String seats", "seats": "2"},
        {"name": "Float seats", "seats": 2.0},
        {"name": "String with spaces", "seats": " 2 "},
        {"name": "Invalid string", "seats": "abc"},
    ]
    
    for case in test_cases:
        try:
            print(f"\nTesting {case['name']}: {case['seats']} (type: {type(case['seats']).__name__})")
            
            result = BookingBusinessRules.calculate_booking_amount(
                destination_cost, 
                case['seats'], 
                duration_days
            )
            
            print(f"   ✅ Success: {result}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print(f"   Error type: {type(e).__name__}")
            
            if "'str' object cannot be interpreted as an integer" in str(e):
                print("   🚨 FOUND THE EXACT ERROR!")
                
                # Let's trace what's happening
                print(f"   Debugging:")
                print(f"     - seats value: {case['seats']}")
                print(f"     - seats type: {type(case['seats'])}")
                print(f"     - str(seats): {str(case['seats'])}")
                print(f"     - Decimal(str(seats)): attempting...")
                
                try:
                    decimal_result = Decimal(str(case['seats']))
                    print(f"     - Decimal conversion successful: {decimal_result}")
                except Exception as decimal_error:
                    print(f"     - Decimal conversion failed: {decimal_error}")

def test_arithmetic_operations():
    """Test if the error occurs in arithmetic operations"""
    print(f"\n🔢 TESTING ARITHMETIC OPERATIONS")
    print("=" * 60)
    
    # Test different scenarios that might cause the error
    test_cases = [
        {"name": "String in multiplication", "operation": lambda: "2" * 3},
        {"name": "String in addition", "operation": lambda: "2" + 1},
        {"name": "String in Decimal multiplication", "operation": lambda: Decimal('1000') * Decimal("2") * Decimal("3")},
    ]
    
    for case in test_cases:
        try:
            print(f"\nTesting {case['name']}...")
            result = case['operation']()
            print(f"   ✅ Success: {result}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            if "'str' object cannot be interpreted as an integer" in str(e):
                print("   🚨 FOUND THE ERROR SOURCE!")

def test_pydantic_validation():
    """Test if Pydantic validation is working correctly"""
    print(f"\n📝 TESTING PYDANTIC VALIDATION")
    print("=" * 60)
    
    from app.models import BookingCreate, ContactInfo
    
    test_cases = [
        {
            "name": "String seats",
            "data": {
                "destination_id": "dest-12345678",
                "seats": "2",
                "travel_date": "2025-12-25",
                "special_requests": "Test",
                "contact_info": {"phone": "9876543210"}
            }
        },
        {
            "name": "Integer seats",
            "data": {
                "destination_id": "dest-12345678",
                "seats": 2,
                "travel_date": "2025-12-25",
                "special_requests": "Test",
                "contact_info": {"phone": "9876543210"}
            }
        }
    ]
    
    for case in test_cases:
        try:
            print(f"\nTesting {case['name']}...")
            contact_info = ContactInfo(**case['data']['contact_info'])
            booking = BookingCreate(
                destination_id=case['data']['destination_id'],
                seats=case['data']['seats'],
                travel_date=case['data']['travel_date'],
                special_requests=case['data']['special_requests'],
                contact_info=contact_info
            )
            
            print(f"   ✅ Pydantic validation passed")
            print(f"   - seats: {booking.seats} (type: {type(booking.seats).__name__})")
            
            # Now test the calculation with the validated data
            print(f"   Testing calculation with validated data...")
            result = BookingBusinessRules.calculate_booking_amount(
                Decimal('1000.00'), 
                booking.seats, 
                3
            )
            print(f"   ✅ Calculation successful: {result}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            if "'str' object cannot be interpreted as an integer" in str(e):
                print("   🚨 FOUND THE ERROR IN PYDANTIC FLOW!")

def main():
    """Run all tests to reproduce the error"""
    print("🔍 REPRODUCING EXACT BOOKING ERROR")
    print("=" * 70)
    
    # Test the calculation function directly
    test_calculate_booking_amount()
    
    # Test arithmetic operations
    test_arithmetic_operations()
    
    # Test Pydantic validation flow
    test_pydantic_validation()
    
    print("\n" + "=" * 70)
    print("📊 ERROR REPRODUCTION RESULTS")
    print("=" * 70)
    print("If the exact error was found, it will be marked with 🚨")
    print("This will help identify the exact location and cause of the issue")

if __name__ == "__main__":
    main()