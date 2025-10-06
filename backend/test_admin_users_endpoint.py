"""
Test script for admin users endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_admin_users_endpoint():
    """Test the admin users endpoint"""
    print("Testing Admin Users Endpoint...")
    print("=" * 50)
    
    # First, try to access without authentication (should fail)
    print("\n1. Testing without authentication (should fail):")
    response = requests.get(f"{BASE_URL}/api/users/")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Note: To test with authentication, you would need to:
    # 1. Login as an admin user
    # 2. Get the JWT token
    # 3. Include it in the Authorization header
    
    print("\n" + "=" * 50)
    print("To test with authentication:")
    print("1. Login as admin user at /auth/login")
    print("2. Get the JWT token from response")
    print("3. Include header: Authorization: Bearer <token>")
    print("4. Make request to /api/users/")

if __name__ == "__main__":
    try:
        test_admin_users_endpoint()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend server.")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"Error: {e}")
