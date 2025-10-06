#!/usr/bin/env python3
"""
Test script to check if the FastAPI app can be imported without errors
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def test_imports():
    """Test importing the main components"""
    print("🧪 Testing imports...")
    
    try:
        print("  - Testing models...")
        from app.models import User, Event, Booking, GalleryImage
        print("    ✅ Models imported successfully")
        
        print("  - Testing exceptions...")
        from app.exceptions import SafarSagaException
        print("    ✅ Exceptions imported successfully")
        
        print("  - Testing services...")
        from app.services.supabase_service import SupabaseService
        from app.services.cloudinary_service import CloudinaryService
        print("    ✅ Services imported successfully")
        
        print("  - Testing middleware...")
        from app.middleware.auth import AuthMiddleware
        print("    ✅ Middleware imported successfully")
        
        print("  - Testing routers...")
        from app.routers import auth, events, bookings, gallery
        print("    ✅ Routers imported successfully")
        
        print("  - Testing main app...")
        from app.main import app
        print("    ✅ FastAPI app imported successfully")
        
        print("\n🎉 All imports successful!")
        return True
        
    except Exception as e:
        print(f"\n❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_service_initialization():
    """Test service initialization with environment variables"""
    print("\n🔧 Testing service initialization...")
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or supabase_url.startswith("your_"):
        print("  ⚠️  SUPABASE_URL not set or using placeholder")
        return False
    
    if not supabase_key or supabase_key.startswith("your_"):
        print("  ⚠️  SUPABASE_SERVICE_ROLE_KEY not set or using placeholder")
        return False
    
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        # Test lazy initialization
        client = service._get_client()
        print("  ✅ Supabase service initialized successfully")
        return True
    except Exception as e:
        print(f"  ❌ Supabase service initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 SafarSaga Backend Import Test")
    print("=" * 50)
    
    success = test_imports()
    
    if success:
        env_success = test_service_initialization()
        if not env_success:
            print("\n⚠️  Services need proper environment variables to work")
            print("Please update your .env file with actual credentials")
    
    if success:
        print("\n✅ Backend is ready to start!")
        print("Run: uvicorn app.main:app --reload --port 8000")
    else:
        print("\n❌ Backend has import issues that need to be fixed")
    
    sys.exit(0 if success else 1)