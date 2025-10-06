#!/usr/bin/env python3
"""
Comprehensive verification script for the CapacityException fix
"""

import sys
import traceback

def test_imports():
    """Test all critical imports"""
    print("🔍 Testing imports...")
    
    try:
        # Test exception imports
        from app.exceptions import CapacityException, NotFoundException, ValidationException, BusinessLogicException
        print("✅ All exceptions imported successfully")
        
        # Test model imports
        from app.models import BookingCreate, BookingUpdate, BookingStatus, PaymentStatus
        print("✅ All models imported successfully")
        
        # Test router imports
        from app.routers.bookings import router, create_booking
        print("✅ Bookings router imported successfully")
        
        # Test main app
        from app.main import app
        print("✅ Main FastAPI app imported successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {str(e)}")
        traceback.print_exc()
        return False

def test_exception_usage():
    """Test that CapacityException can be used properly"""
    print("\n🔍 Testing CapacityException usage...")
    
    try:
        from app.exceptions import CapacityException
        
        # Test creating the exception
        exc = CapacityException(available_seats=5, requested_seats=10, event_id="test-123")
        print(f"✅ CapacityException created: {exc.message}")
        
        # Test exception details
        assert exc.details["available_seats"] == 5
        assert exc.details["requested_seats"] == 10
        assert exc.details["event_id"] == "test-123"
        print("✅ Exception details are correct")
        
        return True
    except Exception as e:
        print(f"❌ CapacityException test error: {str(e)}")
        traceback.print_exc()
        return False

def test_booking_model():
    """Test BookingCreate model"""
    print("\n🔍 Testing BookingCreate model...")
    
    try:
        from app.models import BookingCreate
        
        # Test creating a booking request
        booking_data = BookingCreate(
            destination_id="test-destination-123",
            seats=2,
            special_requests="Window seat please"
        )
        
        print(f"✅ BookingCreate model works: {booking_data.destination_id}, {booking_data.seats} seats")
        return True
    except Exception as e:
        print(f"❌ BookingCreate test error: {str(e)}")
        traceback.print_exc()
        return False

def test_server_readiness():
    """Test if server can be started"""
    print("\n🔍 Testing server readiness...")
    
    try:
        from app.main import app
        
        # Check if app has routes
        routes = [route.path for route in app.routes]
        booking_routes = [r for r in routes if '/bookings' in r]
        
        print(f"✅ Found {len(routes)} total routes")
        print(f"✅ Found {len(booking_routes)} booking routes")
        
        if len(booking_routes) > 0:
            print("✅ Booking routes are properly registered")
            return True
        else:
            print("❌ No booking routes found")
            return False
            
    except Exception as e:
        print(f"❌ Server readiness test error: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("🧪 Running comprehensive verification tests...")
    print("=" * 60)
    
    tests = [
        ("Import Tests", test_imports),
        ("CapacityException Tests", test_exception_usage),
        ("BookingCreate Model Tests", test_booking_model),
        ("Server Readiness Tests", test_server_readiness)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 40)
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ The FastAPI server should start successfully with:")
        print("   uvicorn app.main:app --reload --port 8000")
        print("📖 API docs will be available at: http://localhost:8000/docs")
    else:
        print("❌ SOME TESTS FAILED!")
        print("🔧 Please check the errors above and fix them before starting the server.")
        sys.exit(1)

if __name__ == "__main__":
    main()