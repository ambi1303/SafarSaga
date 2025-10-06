#!/usr/bin/env python3
"""
Diagnostic script to check backend setup
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def diagnose_backend():
    print("🔍 SafarSaga Backend Diagnostics")
    print("=" * 40)
    
    # Check environment variables
    print("\n1. Environment Variables:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"   SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
    print(f"   SUPABASE_SERVICE_ROLE_KEY: {'✅ Set' if supabase_key else '❌ Missing'}")
    
    if supabase_url and supabase_url.startswith("your_"):
        print("   ⚠️  SUPABASE_URL appears to be placeholder")
    if supabase_key and supabase_key.startswith("your_"):
        print("   ⚠️  SUPABASE_SERVICE_ROLE_KEY appears to be placeholder")
    
    # Test Supabase connection
    print("\n2. Database Connection:")
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        health = await service.health_check()
        
        if health.get("status") == "connected":
            print("   ✅ Database connection successful")
        else:
            print(f"   ❌ Database connection failed: {health.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"   ❌ Database connection error: {str(e)}")
    
    # Test events query
    print("\n3. Events Query:")
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        events, total = await service.get_events({}, limit=5, offset=0)
        print(f"   ✅ Found {total} events in database")
        
        if events:
            print("   📋 Sample events:")
            for event in events[:3]:
                print(f"      - {event.name} (₹{event.price})")
        else:
            print("   ⚠️  No events found - run setup_complete_database.py")
            
    except Exception as e:
        print(f"   ❌ Events query failed: {str(e)}")
    
    # Check FastAPI imports
    print("\n4. FastAPI Setup:")
    try:
        from app.main import app
        from app.routers import events, bookings, auth
        print("   ✅ FastAPI app imports successful")
        print("   ✅ All routers imported successfully")
    except Exception as e:
        print(f"   ❌ FastAPI import error: {str(e)}")
    
    print("\n" + "=" * 40)
    print("💡 Recommendations:")
    
    if not supabase_url or supabase_url.startswith("your_"):
        print("   1. Update SUPABASE_URL in .env file")
    if not supabase_key or supabase_key.startswith("your_"):
        print("   2. Update SUPABASE_SERVICE_ROLE_KEY in .env file")
    
    print("   3. Run: python setup_complete_database.py")
    print("   4. Start backend: python -m uvicorn app.main:app --reload")
    print("   5. Test API: python test_api_endpoints.py")

if __name__ == "__main__":
    asyncio.run(diagnose_backend())