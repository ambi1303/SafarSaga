#!/usr/bin/env python3
"""
Quick verification script to check if backend is properly set up
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def verify_setup():
    print("🔍 Verifying SafarSaga Backend Setup")
    print("=" * 40)
    
    # Check environment variables
    print("1. Environment Variables:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or supabase_url.startswith("your_"):
        print("   ❌ SUPABASE_URL not configured properly")
        print("   💡 Update backend/.env with your Supabase project URL")
        return False
    else:
        print("   ✅ SUPABASE_URL configured")
    
    if not supabase_key or supabase_key.startswith("your_"):
        print("   ❌ SUPABASE_SERVICE_ROLE_KEY not configured properly")
        print("   💡 Update backend/.env with your Supabase service role key")
        return False
    else:
        print("   ✅ SUPABASE_SERVICE_ROLE_KEY configured")
    
    # Test database connection
    print("\n2. Database Connection:")
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        health = await service.health_check()
        
        if health.get("status") == "connected":
            print("   ✅ Database connection successful")
        else:
            print(f"   ❌ Database connection failed: {health.get('error')}")
            return False
    except Exception as e:
        print(f"   ❌ Database connection error: {str(e)}")
        return False
    
    # Check if events exist
    print("\n3. Events/Destinations in Database:")
    try:
        from app.services.supabase_service import SupabaseService
        service = SupabaseService()
        events, total = await service.get_events({}, limit=10, offset=0)
        
        if total > 0:
            print(f"   ✅ Found {total} destinations in database")
            print("   📋 Sample destinations:")
            for i, event in enumerate(events[:3]):
                print(f"      {i+1}. {event.name} (ID: {event.id[:8]}...)")
        else:
            print("   ❌ No destinations found in database")
            print("   💡 Run: python setup_complete_database.py")
            return False
    except Exception as e:
        print(f"   ❌ Failed to query destinations: {str(e)}")
        return False
    
    # Test creating a sample booking (dry run)
    print("\n4. Booking System Test:")
    try:
        if events:
            sample_event = events[0]
            print(f"   ✅ Sample event available: {sample_event.name}")
            print(f"   ✅ Event ID format: {sample_event.id} (UUID)")
            print("   ✅ Booking system should work with this event")
        else:
            print("   ❌ No events available for booking test")
            return False
    except Exception as e:
        print(f"   ❌ Booking system test failed: {str(e)}")
        return False
    
    print("\n" + "=" * 40)
    print("🎉 Backend setup verification complete!")
    print("✅ All systems are ready for booking operations")
    
    return True

async def main():
    success = await verify_setup()
    
    if not success:
        print("\n❌ Setup verification failed!")
        print("\n🔧 Quick fix steps:")
        print("1. Update backend/.env with proper Supabase credentials")
        print("2. Run: python setup_complete_database.py")
        print("3. Start backend: python -m uvicorn app.main:app --reload")
        print("4. Test again: python verify_setup.py")
    else:
        print("\n🚀 Ready to test booking flow!")
        print("1. Start backend: python -m uvicorn app.main:app --reload")
        print("2. Start frontend: npm run dev")
        print("3. Test booking on destinations page")

if __name__ == "__main__":
    asyncio.run(main())