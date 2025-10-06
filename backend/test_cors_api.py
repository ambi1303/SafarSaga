#!/usr/bin/env python3
"""
Test CORS and API accessibility
"""

import requests
import json
import sys

def test_api_accessibility():
    """Test if the API is accessible and CORS is working"""
    
    print("🧪 Testing API Accessibility and CORS...")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    try:
        # Test 1: Health check
        print("1️⃣ Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test 2: API info
        print("\n2️⃣ Testing API info endpoint...")
        response = requests.get(f"{base_url}/api", timeout=5)
        
        if response.status_code == 200:
            print("✅ API info endpoint working")
        else:
            print(f"❌ API info endpoint failed: {response.status_code}")
        
        # Test 3: Events endpoint (acting as destinations)
        print("\n3️⃣ Testing events endpoint...")
        response = requests.get(f"{base_url}/api/events", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Events endpoint working")
            print(f"   Found {len(data.get('items', []))} events")
            
            # Show available events
            if data.get('items'):
                print("   Available events:")
                for event in data['items'][:3]:  # Show first 3
                    print(f"   - {event.get('name')} (ID: {event.get('id')})")
        else:
            print(f"❌ Events endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
        
        # Test 4: CORS headers
        print("\n4️⃣ Testing CORS headers...")
        response = requests.options(f"{base_url}/api/events", 
                                  headers={
                                      'Origin': 'http://localhost:3000',
                                      'Access-Control-Request-Method': 'GET'
                                  }, timeout=5)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        print("✅ CORS headers:")
        for header, value in cors_headers.items():
            print(f"   {header}: {value}")
        
        print("\n🎉 API accessibility test completed!")
        print(f"\nAPI Base URL: {base_url}")
        print("Frontend should be able to access the API now.")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("   Make sure the backend server is running on port 8000")
        print("   Run: python start_server.py")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timeout - server might be slow to respond")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_api_accessibility()
    
    if not success:
        print("\n❌ API accessibility test failed!")
        print("\nTroubleshooting steps:")
        print("1. Start the backend server: python start_server.py")
        print("2. Check if port 8000 is available")
        print("3. Verify .env file has correct Supabase credentials")
        sys.exit(1)
    else:
        print("\n✅ API is accessible and ready for frontend!")