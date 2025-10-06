#!/usr/bin/env python3
"""
Debug script to identify specific server startup issues
"""

import sys
import traceback
import asyncio

def test_server_startup():
    """Test actual server startup process"""
    print("🔍 Testing server startup process...")
    
    try:
        import uvicorn
        from app.main import app
        
        print("✅ Uvicorn and app imported successfully")
        
        # Test if we can access the app routes
        print(f"✅ App has {len(app.routes)} routes")
        
        # Test specific booking routes
        booking_routes = [route for route in app.routes if hasattr(route, 'path') and '/bookings' in route.path]
        print(f"✅ Found {len(booking_routes)} booking routes")
        
        # Test if we can create a test client
        from fastapi.testclient import TestClient
        client = TestClient(app)
        print("✅ Test client created successfully")
        
        # Test a simple endpoint
        response = client.get("/")
        print(f"✅ Root endpoint responds with status: {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ Server startup test failed: {str(e)}")
        traceback.print_exc()
        return False

def test_booking_endpoint():
    """Test booking endpoint specifically"""
    print("\n🔍 Testing booking endpoint...")
    
    try:
        from fastapi.testclient import TestClient
        from app.main import app
        
        client = TestClient(app)
        
        # Test GET /api/bookings (should require auth, but should not crash)
        response = client.get("/api/bookings/")
        print(f"✅ GET /api/bookings/ responds with status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Endpoint correctly requires authentication")
        elif response.status_code == 500:
            print("❌ Internal server error on booking endpoint")
            print(f"Response: {response.text}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Booking endpoint test failed: {str(e)}")
        traceback.print_exc()
        return False

def test_exception_handling():
    """Test exception handling in booking creation"""
    print("\n🔍 Testing exception handling...")
    
    try:
        from app.exceptions import CapacityException, NotFoundException, ValidationException, BusinessLogicException
        
        # Test creating each exception
        exceptions_to_test = [
            ("CapacityException", lambda: CapacityException(5, 10, "test-event")),
            ("NotFoundException", lambda: NotFoundException("Event", "test-123")),
            ("ValidationException", lambda: ValidationException("Test validation error")),
            ("BusinessLogicException", lambda: BusinessLogicException("Test business logic error"))
        ]
        
        for exc_name, exc_creator in exceptions_to_test:
            try:
                exc = exc_creator()
                print(f"✅ {exc_name} created successfully: {exc.message}")
            except Exception as e:
                print(f"❌ {exc_name} creation failed: {str(e)}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Exception handling test failed: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Run all debug tests"""
    print("🐛 Running server debug tests...")
    print("=" * 60)
    
    tests = [
        ("Server Startup", test_server_startup),
        ("Booking Endpoint", test_booking_endpoint),
        ("Exception Handling", test_exception_handling)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 40)
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 60)
    print("📊 DEBUG RESULTS")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All debug tests passed!")
        print("✅ The server should start without issues")
    else:
        print("\n❌ Some debug tests failed!")
        print("🔧 Check the errors above for specific issues")

if __name__ == "__main__":
    main()