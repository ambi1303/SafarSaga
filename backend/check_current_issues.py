#!/usr/bin/env python3
"""
Check what specific issues are occurring
"""

import requests
import sys

def check_server_running():
    """Check if the server is running on port 8000"""
    print("🔍 Checking if server is running on localhost:8000...")
    
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Server is running! Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running on localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error checking server: {str(e)}")
        return False

def check_destinations_endpoint():
    """Check the destinations endpoint specifically"""
    print("\n🔍 Checking destinations endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/api/destinations/", timeout=5)
        print(f"✅ Destinations endpoint responds with status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Destinations data: {len(data.get('items', []))} items")
        else:
            print(f"Response: {response.text}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to destinations endpoint")
        return False
    except Exception as e:
        print(f"❌ Error checking destinations: {str(e)}")
        return False

def check_events_endpoint():
    """Check the events endpoint"""
    print("\n🔍 Checking events endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/api/events/", timeout=5)
        print(f"✅ Events endpoint responds with status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Events data: {len(data.get('items', []))} items")
        else:
            print(f"Response: {response.text}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to events endpoint")
        return False
    except Exception as e:
        print(f"❌ Error checking events: {str(e)}")
        return False

def main():
    """Check current server status"""
    print("🔍 Checking current server status and issues...")
    print("=" * 60)
    
    server_running = check_server_running()
    
    if server_running:
        check_destinations_endpoint()
        check_events_endpoint()
    else:
        print("\n💡 To start the server, run:")
        print("   uvicorn app.main:app --reload --port 8000")
        print("   or")
        print("   python start_server.py")

if __name__ == "__main__":
    main()