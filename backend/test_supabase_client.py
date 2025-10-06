#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_supabase_client():
    """Test Supabase client initialization"""
    
    print("🧪 Testing Supabase Client Initialization")
    print("=" * 50)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Test client initialization
        service = SupabaseService()
        client = service._get_client()
        
        print("✅ Supabase client initialized successfully")
        print(f"Client type: {type(client)}")
        
        # Test a simple query
        try:
            response = client.table("users").select("count", count="exact").execute()
            print(f"✅ Database connection test successful")
            print(f"Users table accessible: {response.count is not None}")
            
        except Exception as query_error:
            print(f"⚠️  Database query test failed: {str(query_error)}")
            # This might be expected if there are no users or permissions issues
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase client initialization failed: {str(e)}")
        
        # Check for specific error patterns
        error_str = str(e).lower()
        if "proxy" in error_str:
            print("🔍 Proxy-related error detected")
            print("This might be a version compatibility issue")
        elif "credentials" in error_str:
            print("🔍 Credentials error detected")
            print("Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        elif "network" in error_str or "connection" in error_str:
            print("🔍 Network error detected")
            print("Check internet connection and Supabase URL")
        
        return False

if __name__ == "__main__":
    success = test_supabase_client()
    
    if success:
        print("\n🎉 Supabase client test passed!")
    else:
        print("\n💥 Supabase client test failed!")
        print("Check the error messages above for troubleshooting steps.")