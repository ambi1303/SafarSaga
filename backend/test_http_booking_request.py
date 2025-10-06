#!/usr/bin/env python3
"""
Test the exact HTTP request that would be sent from frontend
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
import json
import httpx

async def test_http_booking_request():
    """Test the exact HTTP request that would be sent from frontend"""
    print("🌐 TESTING HTTP BOOKING REQUEST")
    print("=" * 60)
    
    # This is the exact payload that would be sent from the frontend
    payload = {
        "user_id": "user-12345678",
        "destination_id": "dest-12345678",
        "seats": 2,  # Number from frontend
        "total_amount": 6000.0,  # Number from frontend
        "travel_date": "2025-12-25T00:00:00.000Z",
        "contact_info": {
            "phone": "9876543210",
            "emergency_contact": None
        },
        "special_requests": "Window seat please"
    }
    
    print("Payload being sent:")
    print(json.dumps(payload, indent=2))
    print(f"seats type: {type(payload['seats'])}")
    print(f"total_amount type: {type(payload['total_amount'])}")
    
    # Test with httpx to simulate the exact HTTP request
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/api/bookings",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer fake-token-for-testing"
                },
                timeout=30.0
            )
            
            print(f"\nResponse status: {response.status_code}")
            
            if response.status_code == 200 or response.status_code == 201:
                print("✅ Request successful!")
                response_data = response.json()
                print("Response data:", json.dumps(response_data, indent=2))
            else:
                print("❌ Request failed!")
                try:
                    error_data = response.json()
                    print("Error response:", json.dumps(error_data, indent=2))
                    
                    # Check if it's our specific error
                    error_message = str(error_data)
                    if "'str' object cannot be interpreted as an integer" in error_message:
                        print("🚨 FOUND THE EXACT ERROR IN HTTP REQUEST!")
                        return False
                except:
                    print("Error response (text):", response.text)
                    
        except httpx.ConnectError:
            print("❌ Could not connect to backend server")
            print("   Make sure the FastAPI server is running on localhost:8000")
            return None
        except Exception as e:
            print(f"❌ Request error: {str(e)}")
            if "'str' object cannot be interpreted as an integer" in str(e):
                print("🚨 FOUND THE ERROR IN HTTP CLIENT!")
                return False
    
    return True

async def test_json_serialization():
    """Test if JSON serialization is causing the issue"""
    print(f"\n📄 TESTING JSON SERIALIZATION")
    print("=" * 60)
    
    # Test different data types through JSON serialization
    test_data = {
        "seats_int": 2,
        "seats_float": 2.0,
        "seats_str": "2",
        "total_amount_int": 6000,
        "total_amount_float": 6000.0,
        "total_amount_str": "6000.0"
    }
    
    print("Original data types:")
    for key, value in test_data.items():
        print(f"  {key}: {value} (type: {type(value).__name__})")
    
    # Serialize to JSON and back
    json_str = json.dumps(test_data)
    print(f"\nJSON string: {json_str}")
    
    deserialized = json.loads(json_str)
    print("\nDeserialized data types:")
    for key, value in deserialized.items():
        print(f"  {key}: {value} (type: {type(value).__name__})")
    
    # Check if any integers became strings
    type_changes = []
    for key in test_data:
        original_type = type(test_data[key]).__name__
        new_type = type(deserialized[key]).__name__
        if original_type != new_type:
            type_changes.append(f"{key}: {original_type} -> {new_type}")
    
    if type_changes:
        print(f"\n⚠️  Type changes during JSON serialization:")
        for change in type_changes:
            print(f"  - {change}")
    else:
        print(f"\n✅ No unexpected type changes during JSON serialization")

async def main():
    """Run the HTTP request tests"""
    print("🔍 HTTP BOOKING REQUEST DEBUGGING")
    print("=" * 70)
    
    # Test JSON serialization first
    await test_json_serialization()
    
    # Test the actual HTTP request
    result = await test_http_booking_request()
    
    print("\n" + "=" * 70)
    print("📊 HTTP REQUEST TEST RESULTS")
    print("=" * 70)
    
    if result is None:
        print("⚠️  Could not test HTTP request - server not running")
        print("   Start the FastAPI server and try again")
    elif result:
        print("✅ HTTP request completed without string-to-integer error")
        print("   The error might be in a different scenario or code path")
    else:
        print("❌ Found the string-to-integer error in HTTP request")
        print("   This confirms the error is happening during HTTP processing")

if __name__ == "__main__":
    asyncio.run(main())