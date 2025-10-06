#!/usr/bin/env python3
"""
Test backend health and basic functionality
"""

import asyncio
import requests
import json

async def test_backend_health():
    """Test if backend is running and healthy"""
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running and healthy")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {str(e)}")
        return False

async def test_destinations_endpoint():
    """Test destinations endpoint"""
    
    try:
        response = requests.get("http://localhost:8000/api/destinations", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Destinations endpoint working")
            
            # Handle different response formats
            if isinstance(data, list):
                destinations = data
            elif isinstance(data, dict) and 'items' in data:
                destinations = data['items']
            else:
                destinations = []
            
            print(f"Found {len(destinations)} destinations")
            
            if destinations:
                first_dest = destinations[0]
                print(f"First destination: {first_dest.get('name')} (ID: {first_dest.get('id')})")
                return first_dest.get('id')
            else:
                print("⚠️ No destinations found in database")
                return None
        else:
            print(f"❌ Destinations endpoint failed: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to destinations endpoint: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Backend Health and Connectivity")
    print("="*50)
    
    # Test backend health
    asyncio.run(test_backend_health())
    
    print("\n" + "="*50)
    
    # Test destinations endpoint
    asyncio.run(test_destinations_endpoint())