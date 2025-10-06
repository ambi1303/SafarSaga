#!/usr/bin/env python3
"""
Test the complete booking flow to identify the data type issue
"""

import asyncio
import requests
import json
from datetime import datetime, timezone, timedelta

# Test data
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_NAME = "Test User"

async def test_auth_flow():
    """Test authentication flow"""
    
    print("🔐 Testing Authentication Flow")
    print("-" * 30)
    
    # Try to signup (might fail if user exists)
    signup_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD,
        "full_name": TEST_USER_NAME
    }
    
    try:
        response = requests.post("http://localhost:8000/auth/signup", 
                               json=signup_data, timeout=10)
        if response.status_code == 201:
            print("✅ User signup successful")
            auth_data = response.json()
            return auth_data.get('access_token')
        else:
            print(f"⚠️ Signup failed (user might exist): {response.status_code}")
    except Exception as e:
        print(f"⚠️ Signup error: {str(e)}")
    
    # Try to login
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    try:
        response = requests.post("http://localhost:8000/auth/login", 
                               json=login_data, timeout=10)
        if response.status_code == 200:
            print("✅ User login successful")
            auth_data = response.json()
            return auth_data.get('access_token')
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

async def test_booking_creation(token, destination_id):
    """Test booking creation with real data"""
    
    print("\n📝 Testing Booking Creation")
    print("-" * 30)
    
    # Calculate future date
    future_date = datetime.now(timezone.utc) + timedelta(days=30)
    travel_date = future_date.isoformat()
    
    # Prepare booking data exactly as frontend sends it
    booking_data = {
        "destination_id": destination_id,
        "seats": 2,  # This should be an integer
        "special_requests": "Test booking from API",
        "travel_date": travel_date,
        "contact_info": {
            "phone": "+91-9876543210",
            "emergency_contact": "+91-9876543211"
        }
    }
    
    print(f"Booking data being sent:")
    print(json.dumps(booking_data, indent=2))
    print(f"Seats type: {type(booking_data['seats'])}")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post("http://localhost:8000/api/bookings", 
                               json=booking_data, 
                               headers=headers, 
                               timeout=10)
        
        print(f"\nResponse status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Booking created successfully!")
            booking_result = response.json()
            print(f"Booking ID: {booking_result.get('id')}")
            print(f"Booking Status: {booking_result.get('booking_status')}")
            return booking_result
        else:
            print(f"❌ Booking creation failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Booking creation error: {str(e)}")
        return None

async def get_first_destination():
    """Get the first available destination"""
    
    try:
        response = requests.get("http://localhost:8000/api/destinations", timeout=5)
        if response.status_code == 200:
            data = response.json()
            
            # Handle different response formats
            if isinstance(data, list):
                destinations = data
            elif isinstance(data, dict) and 'items' in data:
                destinations = data['items']
            else:
                destinations = []
            
            if destinations:
                return destinations[0]['id']
        return None
    except Exception as e:
        print(f"Error fetching destinations: {str(e)}")
        return None

async def main():
    """Main test function"""
    
    print("🧪 Testing Complete Booking Flow")
    print("=" * 50)
    
    # Get destination
    destination_id = await get_first_destination()
    if not destination_id:
        print("❌ No destinations available for testing")
        return
    
    print(f"Using destination ID: {destination_id}")
    
    # Test authentication
    token = await test_auth_flow()
    if not token:
        print("❌ Authentication failed, cannot test booking")
        return
    
    print(f"✅ Got auth token: {token[:20]}...")
    
    # Test booking creation
    booking = await test_booking_creation(token, destination_id)
    if booking:
        print("\n🎉 Complete booking flow test successful!")
    else:
        print("\n❌ Booking flow test failed")

if __name__ == "__main__":
    asyncio.run(main())