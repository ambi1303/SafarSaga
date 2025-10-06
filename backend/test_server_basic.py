#!/usr/bin/env python3
"""
Basic server test - just check if it can start
"""

import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

def test_app_creation():
    """Test that the FastAPI app can be created"""
    print("🧪 Testing FastAPI app creation...")
    
    try:
        from app.main import app
        
        if app:
            print("✅ FastAPI app created successfully")
            
            # Check if routes are registered
            routes = [route.path for route in app.routes]
            
            expected_routes = ["/api/destinations", "/api/bookings"]
            found_routes = []
            
            for expected in expected_routes:
                if any(expected in route for route in routes):
                    found_routes.append(expected)
            
            print(f"✅ Found {len(found_routes)} expected API routes")
            
            if len(found_routes) >= 2:
                return True
            else:
                print(f"❌ Missing some expected routes")
                return False
        else:
            print("❌ Failed to create FastAPI app")
            return False
            
    except Exception as e:
        print(f"❌ App creation error: {e}")
        return False

def test_router_imports():
    """Test that routers can be imported"""
    print("🧪 Testing router imports...")
    
    try:
        from app.routers import bookings, destinations, auth, events
        
        print("✅ All routers import successfully")
        
        # Check if routers have the expected endpoints
        booking_routes = [route.path for route in bookings.router.routes]
        destination_routes = [route.path for route in destinations.router.routes]
        
        if "/" in booking_routes and "/" in destination_routes:
            print("✅ Routers have expected endpoints")
            return True
        else:
            print("❌ Routers missing expected endpoints")
            return False
            
    except Exception as e:
        print(f"❌ Router import error: {e}")
        return False

def test_database_models():
    """Test that database models work"""
    print("🧪 Testing database models...")
    
    try:
        from app.models import Destination, Booking, ContactInfo
        
        # Test creating a destination model
        dest_data = {
            "id": "test-id",
            "name": "Test Destination",
            "state": "Test State",
            "average_cost_per_day": 2500.0,
            "is_active": True
        }
        
        destination = Destination(**dest_data)
        if destination.name == "Test Destination":
            print("✅ Destination model works")
        
        # Test contact info model
        contact = ContactInfo(phone="+91-9876543210")
        if contact.phone == "+91-9876543210":
            print("✅ ContactInfo model works")
        
        return True
        
    except Exception as e:
        print(f"❌ Model test error: {e}")
        return False

def main():
    """Run basic server tests"""
    print("🚀 Starting basic server tests...\n")
    
    tests = [
        ("Database Models", test_database_models),
        ("Router Imports", test_router_imports),
        ("FastAPI App Creation", test_app_creation)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            failed += 1
    
    # Summary
    print(f"\n📊 Basic Server Test Summary:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📋 Total: {len(tests)}")
    
    if failed == 0:
        print(f"\n🎉 All basic server tests passed! Backend structure is solid.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)