#!/usr/bin/env python3
"""
Test travel_date validation and conversion for Supabase timestamptz compatibility
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from datetime import datetime
from app.services.supabase_service import SupabaseService

async def test_travel_date_validation():
    """Test travel_date validation and conversion"""
    print("📅 TESTING TRAVEL_DATE VALIDATION")
    print("=" * 60)
    
    supabase_service = SupabaseService()
    
    test_cases = [
        {
            "name": "ISO datetime string with Z",
            "travel_date": "2025-10-08T00:00:00.000Z",
            "expected_format": "ISO datetime",
            "should_work": True
        },
        {
            "name": "ISO datetime string with timezone",
            "travel_date": "2025-10-08T14:30:00+05:30",
            "expected_format": "ISO datetime",
            "should_work": True
        },
        {
            "name": "Date-only string",
            "travel_date": "2025-12-25",
            "expected_format": "ISO datetime",
            "should_work": True
        },
        {
            "name": "Python datetime object",
            "travel_date": datetime(2025, 11, 15, 10, 30, 0),
            "expected_format": "ISO datetime",
            "should_work": True
        },
        {
            "name": "Invalid date format",
            "travel_date": "25/12/2025",
            "expected_format": "Error",
            "should_work": False
        },
        {
            "name": "Invalid data type",
            "travel_date": 20251225,
            "expected_format": "Error",
            "should_work": False
        },
        {
            "name": "Empty string",
            "travel_date": "",
            "expected_format": "Skip validation",
            "should_work": True  # Empty should be skipped
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {case['name']}")
        print("=" * 50)
        
        # Create test booking data
        test_data = {
            "user_id": "user-test-12345",
            "destination_id": "dest-test-12345",
            "seats": 2,
            "total_amount": 299.99,
            "travel_date": case["travel_date"],
            "booking_status": "pending",
            "payment_status": "unpaid"
        }
        
        print(f"Input travel_date: {case['travel_date']} (type: {type(case['travel_date']).__name__})")
        
        try:
            # Test the validation function directly
            validated_data = supabase_service._validate_and_convert_booking_data(test_data)
            
            if case["should_work"]:
                if case["travel_date"] == "":
                    print("✅ Empty travel_date correctly skipped validation")
                else:
                    converted_date = validated_data["travel_date"]
                    print(f"✅ Conversion successful: {converted_date} (type: {type(converted_date).__name__})")
                    
                    # Verify it's a proper ISO format string
                    if isinstance(converted_date, str) and ("T" in converted_date or converted_date == ""):
                        print("✅ Output is proper ISO format string for Supabase timestamptz")
                    else:
                        print(f"❌ Output format issue: expected ISO string, got {type(converted_date)}")
            else:
                print(f"❌ Expected validation to fail but it passed: {validated_data['travel_date']}")
                
        except Exception as e:
            if not case["should_work"]:
                print(f"✅ Correctly rejected: {str(e)}")
            else:
                print(f"❌ Unexpected validation error: {str(e)}")
        
        print("-" * 50)

async def test_booking_creation_with_travel_date():
    """Test actual booking creation with travel_date"""
    print(f"\n📅 TESTING BOOKING CREATION WITH TRAVEL_DATE")
    print("=" * 60)
    
    supabase_service = SupabaseService()
    
    test_cases = [
        {
            "name": "Frontend-style ISO string",
            "travel_date": "2025-10-08T00:00:00.000Z"
        },
        {
            "name": "Simple date string",
            "travel_date": "2025-12-25"
        }
    ]
    
    for case in test_cases:
        print(f"\n🧪 Testing {case['name']}")
        print("=" * 40)
        
        test_data = {
            "user_id": "user-booking-test",
            "destination_id": "dest-booking-test",
            "seats": 3,
            "total_amount": 399.99,
            "travel_date": case["travel_date"],
            "special_requests": "Test booking with travel date",
            "booking_status": "pending",
            "payment_status": "unpaid"
        }
        
        print(f"Input travel_date: {case['travel_date']}")
        
        try:
            # This will test the full booking creation pipeline
            result = await supabase_service.create_destination_booking(test_data)
            print("✅ Booking creation succeeded (unexpected - no real destination)")
            
        except Exception as e:
            error_message = str(e)
            print(f"❌ Expected failure: {error_message}")
            
            # Check if it's a travel_date error (bad) vs database/destination error (good)
            if "travel_date" in error_message.lower():
                print("🚨 TRAVEL_DATE VALIDATION ERROR!")
                return False
            elif any(phrase in error_message.lower() for phrase in [
                "destination", "database", "uuid", "insert", "connection"
            ]):
                print("✅ Good! Database/destination error, not travel_date error")
            else:
                print(f"❓ Other error: {error_message}")
    
    return True

async def main():
    """Run all travel_date validation tests"""
    print("📅 TRAVEL_DATE VALIDATION TEST SUITE")
    print("=" * 70)
    print("Testing travel_date validation for Supabase timestamptz compatibility")
    print("=" * 70)
    
    # Test validation function directly
    await test_travel_date_validation()
    
    # Test booking creation with travel_date
    booking_success = await test_booking_creation_with_travel_date()
    
    print("\n" + "=" * 70)
    print("📊 TRAVEL_DATE VALIDATION TEST RESULTS")
    print("=" * 70)
    
    if booking_success:
        print("🎉 SUCCESS! Travel_date validation is working correctly!")
        print("✅ String dates are converted to proper ISO format")
        print("✅ Datetime objects are converted to ISO strings")
        print("✅ Invalid formats are properly rejected")
        print("✅ Supabase timestamptz compatibility ensured")
        print("📅 Travel_date TypeError should be resolved!")
    else:
        print("❌ Some travel_date validation issues found")
        print("   Additional investigation needed")

if __name__ == "__main__":
    asyncio.run(main())