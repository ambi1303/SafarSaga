#!/usr/bin/env python3
"""
Test the complete booking flow to identify where the error occurs
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
import json
from fastapi.testclient import TestClient
from app.main import app
from app.models import BookingCreate, ContactInfo

def test_with_test_client():
    """Test using FastAPI TestClient to simulate exact HTTP request"""
    print("🌐 TESTING WITH FASTAPI TEST CLIENT")
    print("=" * 60)
    
    client = TestClient(app)
    
    # This simulates the exact payload from frontend
    payload = {
        "destination_id": "dest-12345678",
        "seats": "2",  # String as it might come from frontend form
        "travel_date": "2025-12-25",
        "special_requests": "Window seat please",
        "contact_info": {
            "phone": "9876543210",
            "emergency_contact": None
        }
    }
    
    print("Payload being sent:")
    print(json.dumps(payload, indent=2))
    print(f"seats type: {type(payload['seats'])}")
    
    try:
        # Make the request without authentication first to see the error
        response = client.post("/api/bookings", json=payload)
        
        print(f"\nResponse status: {response.status_code}")
        
        if response.status_code == 401:
            print("❌ Authentication required (expected)")
            print("Let's test with mock authentication...")
            
            # Test with mock headers
            headers = {"Authorization": "Bearer mock-token"}
            response = client.post("/api/bookings", json=payload, headers=headers)
            print(f"Response status with auth: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ Request successful!")
            response_data = response.json()
            print("Response data:", json.dumps(response_data, indent=2))
        else:
            print("❌ Request failed!")
            try:
                error_data = response.json()
                print("Error response:", json.dumps(error_data, indent=2))
                
                # Check for our specific error
                error_str = str(error_data)
                if "'str' object cannot be interpreted as an integer" in error_str:
                    print("🚨 FOUND THE EXACT ERROR IN TEST CLIENT!")
                    return False
            except:
                print("Error response (text):", response.text)
                if "'str' object cannot be interpreted as an integer" in response.text:
                    print("🚨 FOUND THE EXACT ERROR IN RESPONSE TEXT!")
                    return False
                    
    except Exception as e:
        print(f"❌ Test client error: {str(e)}")
        if "'str' object cannot be interpreted as an integer" in str(e):
            print("🚨 FOUND THE ERROR IN TEST CLIENT EXCEPTION!")
            return False
    
    return True

def test_direct_endpoint_call():
    """Test calling the endpoint function directly"""
    print(f"\n🎯 TESTING DIRECT ENDPOINT CALL")
    print("=" * 60)
    
    from app.routers.bookings import create_booking
    from app.models import User
    
    # Mock user
    class MockUser:
        def __init__(self):
            self.id = "user-12345678"
            self.email = "test@example.com"
            self.is_admin = False
    
    try:
        # Create BookingCreate object
        contact_info = ContactInfo(phone="9876543210")
        booking_data = BookingCreate(
            destination_id="dest-12345678",
            seats="2",  # String input
            travel_date="2025-12-25",
            special_requests="Window seat please",
            contact_info=contact_info
        )
        
        print(f"BookingCreate object created successfully")
        print(f"  - seats: {booking_data.seats} (type: {type(booking_data.seats)})")
        
        # Mock user
        current_user = MockUser()
        
        # Call the endpoint function directly
        print("Calling create_booking endpoint function...")
        
        import asyncio
        result = asyncio.run(create_booking(booking_data, current_user))
        
        print("✅ Direct endpoint call successful!")
        return True
        
    except Exception as e:
        print(f"❌ Direct endpoint call failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        if "'str' object cannot be interpreted as an integer" in str(e):
            print("🚨 FOUND THE EXACT ERROR IN DIRECT ENDPOINT CALL!")
            
            # Print full traceback
            import traceback
            print("Full traceback:")
            traceback.print_exc()
            return False
        
        return True

def test_json_parsing():
    """Test if JSON parsing is causing type issues"""
    print(f"\n📄 TESTING JSON PARSING EFFECTS")
    print("=" * 60)
    
    # Simulate what happens when JSON is parsed
    json_payload = '{"seats": "2", "total_amount": "6000.0"}'
    print(f"JSON string: {json_payload}")
    
    parsed = json.loads(json_payload)
    print(f"Parsed data: {parsed}")
    print(f"seats type after JSON parsing: {type(parsed['seats'])}")
    print(f"total_amount type after JSON parsing: {type(parsed['total_amount'])}")
    
    # Test if this causes issues in our validation
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        
        test_data = {
            "user_id": "user-12345678",
            "destination_id": "dest-12345678",
            "seats": parsed["seats"],  # This will be a string
            "total_amount": float(parsed["total_amount"]),
            "booking_status": "pending",
            "payment_status": "unpaid"
        }
        
        print(f"\nTesting service validation with JSON-parsed data...")
        validated = service._validate_and_convert_booking_data(test_data)
        print(f"✅ Service validation successful")
        
    except Exception as e:
        print(f"❌ Service validation failed: {str(e)}")
        if "'str' object cannot be interpreted as an integer" in str(e):
            print("🚨 FOUND THE ERROR IN JSON PARSING FLOW!")
            return False
    
    return True

async def main():
    """Run all tests to find the exact error location"""
    print("🔍 COMPLETE BOOKING FLOW TESTING")
    print("=" * 70)
    
    # Test with FastAPI test client
    test_client_success = test_with_test_client()
    
    # Test direct endpoint call
    direct_call_success = test_direct_endpoint_call()
    
    # Test JSON parsing effects
    json_parsing_success = test_json_parsing()
    
    print("\n" + "=" * 70)
    print("📊 COMPLETE FLOW TEST RESULTS")
    print("=" * 70)
    
    results = {
        "Test Client": test_client_success,
        "Direct Endpoint Call": direct_call_success,
        "JSON Parsing": json_parsing_success
    }
    
    for test_name, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED (ERROR FOUND)"
        print(f"{test_name}: {status}")
    
    if all(results.values()):
        print("\n🤔 All tests passed - the error might be in a different scenario")
        print("   Try testing with the actual frontend or check server logs")
    else:
        print("\n🎯 Found the error location! Check the failed tests above")

if __name__ == "__main__":
    asyncio.run(main())