#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

def test_multiple_bookings():
    """Test that users can book the same destination on different dates"""
    
    print("🧪 Testing Multiple Destination Bookings")
    print("=" * 50)
    
    # Test data - same destination, different dates
    base_booking = {
        "destination_id": "bc37dadb-2515-4f7d-930c-da45eb1c3425",  # Manali
        "seats": 1,
        "special_requests": "Multiple booking test",
        "contact_info": {
            "phone": "1234567890",
            "emergency_contact": "0987654321"
        }
    }
    
    # Different travel dates
    date1 = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
    date2 = (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d')
    same_date = date1  # For testing same date conflict
    
    bookings_to_test = [
        {**base_booking, "travel_date": date1, "test_name": "First booking"},
        {**base_booking, "travel_date": date2, "test_name": "Second booking (different date)"},
        {**base_booking, "travel_date": same_date, "test_name": "Third booking (same date as first)"}
    ]
    
    print(f"Testing with dates: {date1}, {date2}")
    
    results = []
    
    for i, booking_data in enumerate(bookings_to_test):
        test_name = booking_data.pop("test_name")
        print(f"\n📋 Test {i+1}: {test_name}")
        print(f"Travel Date: {booking_data['travel_date']}")
        
        try:
            response = requests.post(
                "http://localhost:8000/api/bookings/",
                json=booking_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_TOKEN_HERE"  # Replace with actual token
                }
            )
            
            print(f"Response Status: {response.status_code}")
            
            if response.status_code == 201:
                print("✅ Booking created successfully")
                results.append({"test": test_name, "status": "success"})
            elif response.status_code == 422:
                error_data = response.json()
                error_detail = error_data.get('detail', 'Unknown error')
                print(f"❌ Booking rejected: {error_detail}")
                results.append({"test": test_name, "status": "rejected", "reason": error_detail})
            elif response.status_code == 401:
                print("🔐 Authentication required - cannot test without valid token")
                results.append({"test": test_name, "status": "auth_required"})
                break
            else:
                print(f"❓ Unexpected response: {response.status_code}")
                results.append({"test": test_name, "status": "unexpected", "code": response.status_code})
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            results.append({"test": test_name, "status": "error", "error": str(e)})
    
    # Summary
    print(f"\n📊 Test Summary:")
    print("=" * 30)
    for result in results:
        status_icon = {
            "success": "✅",
            "rejected": "❌", 
            "auth_required": "🔐",
            "error": "💥",
            "unexpected": "❓"
        }.get(result["status"], "❓")
        
        print(f"{status_icon} {result['test']}: {result['status']}")
        if "reason" in result:
            print(f"   Reason: {result['reason']}")
    
    print(f"\n💡 Expected Results:")
    print("✅ First booking: Should succeed")
    print("✅ Second booking (different date): Should succeed") 
    print("❌ Third booking (same date): Should be rejected with date conflict message")

if __name__ == "__main__":
    test_multiple_bookings()