#!/usr/bin/env python3
"""
Debug the booking issue by checking the exact data flow
"""

import asyncio
import requests
import json
from datetime import datetime, timezone, timedelta

async def debug_booking_creation():
    """Debug the booking creation process step by step"""
    
    print("🔍 Debugging Booking Creation Issue")
    print("=" * 50)
    
    # Step 1: Check backend health
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return
    
    # Step 2: Get a destination
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
                destination_id = destinations[0]['id']
                print(f"✅ Using destination: {destinations[0]['name']} (ID: {destination_id})")
            else:
                print("❌ No destinations available")
                return
        else:
            print(f"❌ Failed to get destinations: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error getting destinations: {str(e)}")
        return
    
    # Step 3: Authenticate
    login_data = {
        "email": "test@example.com",
        "password": "TestPassword123!"
    }
    
    try:
        response = requests.post("http://localhost:8000/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            auth_data = response.json()
            token = auth_data.get('access_token')
            print("✅ Authentication successful")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Authentication error: {str(e)}")
        return
    
    # Step 4: Test booking creation with detailed logging
    future_date = datetime.now(timezone.utc) + timedelta(days=30)
    travel_date = future_date.isoformat()
    
    booking_data = {
        "destination_id": destination_id,
        "seats": 2,  # Integer
        "special_requests": "Debug test booking",
        "travel_date": travel_date,
        "contact_info": {
            "phone": "+91-9876543210",
            "emergency_contact": "+91-9876543211"
        }
    }
    
    print(f"\n📝 Booking Data:")
    print(f"destination_id: {booking_data['destination_id']} (type: {type(booking_data['destination_id'])})")
    print(f"seats: {booking_data['seats']} (type: {type(booking_data['seats'])})")
    print(f"travel_date: {booking_data['travel_date']} (type: {type(booking_data['travel_date'])})")
    print(f"special_requests: {booking_data['special_requests']} (type: {type(booking_data['special_requests'])})")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🚀 Making booking request...")
    
    try:
        response = requests.post("http://localhost:8000/api/bookings", 
                               json=booking_data, 
                               headers=headers, 
                               timeout=10)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Booking created successfully!")
            result = response.json()
            print(f"Booking ID: {result.get('id')}")
        else:
            print(f"❌ Booking failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(debug_booking_creation())