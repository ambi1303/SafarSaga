#!/usr/bin/env python3

import requests
import json

def test_signup_endpoint():
    """Test the signup endpoint directly"""
    
    print("🧪 Testing Signup Endpoint")
    print("=" * 40)
    
    # Test data
    signup_data = {
        "email": "kallu@gmail.com",
        "password": "Kallu@12345",
        "full_name": "Kallu Test",
        "phone": "1234567890"
    }
    
    print(f"Testing signup with data: {json.dumps(signup_data, indent=2)}")
    
    try:
        # Test the signup endpoint
        response = requests.post(
            "http://localhost:8000/auth/signup",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 201:
            print("✅ Signup successful!")
            return True
        else:
            print(f"❌ Signup failed with status {response.status_code}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse error response as JSON")
            
            return False
            
    except Exception as e:
        print(f"❌ Error testing signup: {e}")
        return False

if __name__ == "__main__":
    success = test_signup_endpoint()
    
    if success:
        print("\n🎉 Signup test passed!")
    else:
        print("\n💥 Signup test failed!")