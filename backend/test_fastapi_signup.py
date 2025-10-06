#!/usr/bin/env python3
"""
Test FastAPI signup endpoint to reproduce the proxy error
"""

import requests
import json

def test_fastapi_signup():
    """Test the FastAPI signup endpoint"""
    
    print("Testing FastAPI signup endpoint...")
    
    # Test data
    signup_data = {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User"
    }
    
    # API endpoint
    url = "http://localhost:8000/auth/signup"
    
    try:
        print(f"Making POST request to: {url}")
        print(f"Data: {json.dumps(signup_data, indent=2)}")
        
        response = requests.post(
            url,
            json=signup_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Signup successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Signup failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw error response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to FastAPI server")
        print("Make sure the server is running with: python -m uvicorn app.main:app --reload --port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_fastapi_signup()