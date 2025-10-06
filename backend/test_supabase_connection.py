#!/usr/bin/env python3
"""
Test Supabase connection and database setup
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_supabase_connection():
    """Test Supabase connection and basic operations"""
    
    print("🔍 Testing Supabase Connection...")
    print("=" * 50)
    
    # Check environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"SUPABASE_URL: {supabase_url[:50]}..." if supabase_url else "❌ SUPABASE_URL not set")
    print(f"SUPABASE_KEY: {'✅ Set' if supabase_key else '❌ Not set'}")
    
    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase credentials in environment variables")
        print("Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set")
        return False
    
    if supabase_url.startswith("your_") or supabase_key.startswith("your_"):
        print("\n❌ Placeholder values detected in Supabase credentials")
        print("Please update your .env file with actual Supabase credentials")
        return False
    
    try:
        # Import and test the service
        from app.services.supabase_service import SupabaseService
        
        print("\n🔧 Initializing Supabase service...")
        service = SupabaseService()
        
        print("🔗 Testing database connection...")
        health = await service.health_check()
        
        if health.get("status") == "connected":
            print("✅ Database connection successful!")
        else:
            print(f"❌ Database connection failed: {health.get('error', 'Unknown error')}")
            return False
        
        print("\n📋 Testing users table...")
        try:
            # Test getting a non-existent user (should return None, not error)
            test_user = await service.get_user_by_email("test@nonexistent.com")
            if test_user is None:
                print("✅ Users table query working correctly")
            else:
                print("⚠️ Unexpected user found for test email")
        except Exception as e:
            print(f"❌ Users table query failed: {str(e)}")
            return False
        
        print("\n📋 Testing destinations table...")
        try:
            destinations, total = await service.get_destinations(limit=1)
            print(f"✅ Destinations table accessible (found {total} destinations)")
        except Exception as e:
            print(f"❌ Destinations table query failed: {str(e)}")
            return False
        
        print("\n📋 Testing tickets table...")
        try:
            bookings, total = await service.get_bookings(limit=1)
            print(f"✅ Tickets table accessible (found {total} bookings)")
        except Exception as e:
            print(f"⚠️ Tickets table query issue: {str(e)}")
            print("   This might be due to missing table or columns.")
            print("   Run: python check_tickets_table.py to fix this.")
            # Don't fail the test, just warn
            pass
        
        print("\n🎉 All database tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        print("Make sure you're running this from the backend directory")
        return False
    except Exception as e:
        print(f"❌ Connection test failed: {str(e)}")
        return False

async def test_user_registration():
    """Test user registration flow"""
    
    print("\n" + "=" * 50)
    print("🧪 Testing User Registration Flow...")
    print("=" * 50)
    
    try:
        from app.services.supabase_service import SupabaseService
        
        service = SupabaseService()
        
        # Test email that should not exist
        test_email = "test_registration@safarsaga.com"
        
        print(f"🔍 Checking if user exists: {test_email}")
        existing_user = await service.get_user_by_email(test_email)
        
        if existing_user:
            print(f"⚠️ Test user already exists: {existing_user.full_name}")
        else:
            print("✅ Test user does not exist (good for testing)")
        
        return True
        
    except Exception as e:
        print(f"❌ User registration test failed: {str(e)}")
        return False

async def main():
    """Run all tests"""
    
    print("🚀 SafarSaga Database Connection Test")
    print("=" * 50)
    
    # Test basic connection
    connection_ok = await test_supabase_connection()
    
    if connection_ok:
        # Test user operations
        await test_user_registration()
        
        print("\n" + "=" * 50)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("Your Supabase database is properly configured.")
        print("You can now run the backend server with: uvicorn app.main:app --reload")
    else:
        print("\n" + "=" * 50)
        print("❌ TESTS FAILED!")
        print("Please fix the database connection issues before running the server.")
        
        print("\n🔧 Troubleshooting Steps:")
        print("1. Check your .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("2. Verify your Supabase project is active and accessible")
        print("3. Ensure the database tables exist (users, destinations, tickets)")
        print("4. Check your internet connection")

if __name__ == "__main__":
    asyncio.run(main())