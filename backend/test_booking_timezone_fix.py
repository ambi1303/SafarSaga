#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def test_booking_creation():
    """Test booking creation with proper timezone handling"""
    
    # Test data
    future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    
    booking_data = {
        "destination_id": 1,
        "travel_date": future_date,
        "travelers": 2,
        "special_requests": "Test booking after timezone fix"
    }
    
    print(f"Testing booking creation with date: {future_date}")
    print(f"Booking data: {json.dumps(booking_data, indent=2)}")
    
    try:
        # Test the booking endpoint
        response = requests.post(
            "http://localhost:8000/api/bookings/",
            json=booking_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Booking creation successful!")
            return True
        else:
            print(f"❌ Booking creation failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing booking: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Booking System After Timezone Fix")
    print("=" * 50)
    
    success = test_booking_creation()
    
    if success:
        print("\n🎉 All tests passed! Booking system is working.")
    else:
        print("\n💥 Tests failed. Check the server logs for details.")