#!/usr/bin/env python3
"""
Test specific API endpoints to identify the 405 error
"""

import urllib.request
import urllib.error
import json

def test_endpoints():
    """Test API endpoints"""
    
    print("🧪 Testing API Endpoints...")
    print("=" * 40)
    
    endpoints = [
        "/health",
        "/api",
        "/api/events",
        "/api/destinations",
        "/api/bookings"
    ]
    
    base_url = "http://localhost:8000"
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"\n🌐 Testing: {url}")
        
        try:
            # Test GET request
            request = urllib.request.Request(url, method='GET')
            request.add_header('Content-Type', 'application/json')
            request.add_header('Origin', 'http://localhost:3000')
            
            response = urllib.request.urlopen(request, timeout=5)
            status = response.getcode()
            
            if status == 200:
                print(f"✅ GET {endpoint} - Status: {status}")
                try:
                    data = json.loads(response.read().decode('utf-8'))
                    if isinstance(data, dict):
                        if 'items' in data:
                            print(f"   Found {len(data['items'])} items")
                        elif 'message' in data:
                            print(f"   Message: {data['message']}")
                    elif isinstance(data, list):
                        print(f"   Found {len(data)} items")
                except:
                    print("   Response received (not JSON)")
            else:
                print(f"❌ GET {endpoint} - Status: {status}")
                
        except urllib.error.HTTPError as e:
            print(f"❌ GET {endpoint} - HTTP Error: {e.code} {e.reason}")
            if e.code == 405:
                print("   This is the 405 Method Not Allowed error!")
        except urllib.error.URLError as e:
            print(f"❌ GET {endpoint} - URL Error: {e}")
        except Exception as e:
            print(f"❌ GET {endpoint} - Error: {e}")
    
    print("\n📋 Summary:")
    print("If you see 405 errors, the routes might not be properly configured.")
    print("Check that all routers are included in main.py")

if __name__ == "__main__":
    test_endpoints()