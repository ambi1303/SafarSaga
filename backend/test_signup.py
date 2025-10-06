#!/usr/bin/env python3
"""
Test script to verify signup functionality
"""

import requests
import json
import sys

def test_signup():
    """Test the signup endpoint"""
    print("🧪 Testing signup endpoint...")
    
    # Test data
    signup_data = {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "phone": "+91-9876543210"
    }
    
    try:
        # Make signup request
        response = requests.post(
            "http://localhost:8000/auth/signup",
            json=signup_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Signup successful!")
            data = response.json()
            if "access_token" in data:
                print("✅ JWT token received")
            if "user" in data:
                print("✅ User data received")
            return True
        else:
            print(f"❌ Signup failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_password_validation():
    """Test password validation"""
    print("\n🔒 Testing password validation...")
    
    weak_passwords = [
        "123",  # Too short
        "password",  # No uppercase, numbers, special chars
        "Password",  # No numbers, special chars
        "Password123",  # No special chars
    ]
    
    for password in weak_passwords:
        signup_data = {
            "email": "test2@example.com",
            "password": password,
            "full_name": "Test User"
        }
        
        try:
            response = requests.post(
                "http://localhost:8000/auth/signup",
                json=signup_data
            )
            
            if response.status_code == 422:
                print(f"✅ Weak password '{password}' correctly rejected")
            else:
                print(f"⚠️  Weak password '{password}' was accepted (status: {response.status_code})")
                
        except Exception as e:
            print(f"❌ Error testing password '{password}': {e}")

if __name__ == "__main__":
    print("🚀 SafarSaga Signup Test")
    print("=" * 40)
    
    success = test_signup()
    test_password_validation()
    
    if success:
        print("\n✅ Signup functionality is working!")
    else:
        print("\n❌ Signup has issues that need to be fixed")
    
    sys.exit(0 if success else 1)