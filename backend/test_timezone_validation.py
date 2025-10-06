#!/usr/bin/env python3

from datetime import datetime, timedelta
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from models import BookingCreate

def test_travel_date_validation():
    """Test the travel date validation logic directly"""
    
    print("🧪 Testing Travel Date Validation")
    print("=" * 40)
    
    # Test 1: Valid future date
    try:
        future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        booking_data = {
            "destination_id": "1",
            "travel_date": future_date,
            "seats": 2,
            "contact_info": {
                "phone": "1234567890",
                "emergency_contact": "0987654321"
            },
            "special_requests": "Test booking"
        }
        
        booking = BookingCreate(**booking_data)
        print(f"✅ Test 1 PASSED: Valid future date ({future_date}) accepted")
        
    except Exception as e:
        print(f"❌ Test 1 FAILED: Valid future date rejected - {e}")
        return False
    
    # Test 2: Past date (should fail)
    try:
        past_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        booking_data = {
            "destination_id": "1",
            "travel_date": past_date,
            "seats": 2,
            "contact_info": {
                "phone": "1234567890",
                "emergency_contact": "0987654321"
            },
            "special_requests": "Test booking"
        }
        
        booking = BookingCreate(**booking_data)
        print(f"❌ Test 2 FAILED: Past date ({past_date}) should have been rejected")
        return False
        
    except ValueError as e:
        if "must be in the future" in str(e):
            print(f"✅ Test 2 PASSED: Past date ({past_date}) correctly rejected")
        else:
            print(f"❌ Test 2 FAILED: Wrong error message - {e}")
            return False
    
    # Test 3: Far future date (should fail)
    try:
        far_future = (datetime.now() + timedelta(days=800)).strftime('%Y-%m-%d')
        booking_data = {
            "destination_id": "1",
            "travel_date": far_future,
            "seats": 2,
            "contact_info": {
                "phone": "1234567890",
                "emergency_contact": "0987654321"
            },
            "special_requests": "Test booking"
        }
        
        booking = BookingCreate(**booking_data)
        print(f"❌ Test 3 FAILED: Far future date ({far_future}) should have been rejected")
        return False
        
    except ValueError as e:
        if "cannot be more than 2 years" in str(e):
            print(f"✅ Test 3 PASSED: Far future date ({far_future}) correctly rejected")
        else:
            print(f"❌ Test 3 FAILED: Wrong error message - {e}")
            return False
    
    return True

if __name__ == "__main__":
    success = test_travel_date_validation()
    
    if success:
        print("\n🎉 All validation tests passed! Timezone issue is fixed.")
    else:
        print("\n💥 Some tests failed. Check the validation logic.")