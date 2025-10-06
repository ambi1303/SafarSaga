#!/usr/bin/env python3
"""
Test script to check if the FastAPI server can start properly
"""

import sys
import traceback

try:
    print("🔍 Testing imports...")
    
    # Test basic imports
    from app.main import app
    print("✅ Main app import successful")
    
    from app.routers.bookings import router as bookings_router
    print("✅ Bookings router import successful")
    
    from app.exceptions import CapacityException
    print("✅ CapacityException import successful")
    
    # Test if we can create the app
    print("🔍 Testing app creation...")
    if app:
        print("✅ FastAPI app created successfully")
    
    # Test if we can access the routes
    print("🔍 Testing routes...")
    routes = [route.path for route in app.routes]
    print(f"✅ Found {len(routes)} routes")
    
    print("🎉 All tests passed! Server should start successfully.")
    
except Exception as e:
    print(f"❌ Error occurred: {str(e)}")
    print("📋 Full traceback:")
    traceback.print_exc()
    sys.exit(1)