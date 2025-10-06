#!/usr/bin/env python3
"""
Simple server test without external dependencies
"""

def test_basic_imports():
    """Test basic imports that might be failing"""
    print("🔍 Testing basic imports...")
    
    try:
        from app.main import app
        print("✅ Main app imported")
        
        from app.routers.bookings import router
        print("✅ Bookings router imported")
        
        from app.exceptions import CapacityException
        print("✅ CapacityException imported")
        
        from app.models import BookingCreate
        print("✅ BookingCreate imported")
        
        return True
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_server_creation():
    """Test creating the server"""
    print("\n🔍 Testing server creation...")
    
    try:
        import uvicorn
        from app.main import app
        
        print("✅ Server components ready")
        print("📍 To start server manually, run:")
        print("   uvicorn app.main:app --reload --port 8000 --host 0.0.0.0")
        
        return True
    except Exception as e:
        print(f"❌ Server creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run simple tests"""
    print("🧪 Running simple server tests...")
    print("=" * 50)
    
    import_ok = test_basic_imports()
    server_ok = test_server_creation()
    
    print("\n" + "=" * 50)
    if import_ok and server_ok:
        print("✅ All basic tests passed!")
        print("\n🚀 Try starting the server with:")
        print("   uvicorn app.main:app --reload --port 8000")
    else:
        print("❌ Some tests failed - check errors above")

if __name__ == "__main__":
    main()