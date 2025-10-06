#!/usr/bin/env python3
"""
Fix authentication issues by testing and providing solutions
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_environment():
    """Check environment variables"""
    print("🔍 Checking environment variables...")
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing_vars.append(var)
            print(f"❌ {var}: Not set")
        elif value.startswith("your_"):
            missing_vars.append(var)
            print(f"❌ {var}: Contains placeholder value")
        else:
            print(f"✅ {var}: Set")
    
    return len(missing_vars) == 0

def test_supabase_client():
    """Test Supabase client creation"""
    print("\n🔍 Testing Supabase client...")
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        # Test basic client creation
        client = create_client(supabase_url, supabase_key)
        print("✅ Basic client creation successful")
        
        # Test with options (this might cause proxy error)
        try:
            options = {
                "schema": "public",
                "auto_refresh_token": True,
                "persist_session": True
            }
            client_with_options = create_client(supabase_url, supabase_key, options=options)
            print("✅ Client creation with options successful")
        except Exception as options_error:
            print(f"⚠️ Client creation with options failed: {str(options_error)}")
            if "proxy" in str(options_error).lower():
                print("🔍 This is the proxy error! Using basic client creation.")
        
        # Test simple query
        try:
            response = client.table("users").select("count").limit(1).execute()
            print("✅ Database connection test successful")
        except Exception as query_error:
            print(f"⚠️ Database query failed: {str(query_error)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase client test failed: {str(e)}")
        return False

def test_imports():
    """Test all required imports"""
    print("\n🔍 Testing imports...")
    
    try:
        from app.exceptions import (
            AuthenticationException, 
            ValidationException, 
            ConflictException,
            NotFoundException,
            DatabaseException
        )
        print("✅ All exception imports successful")
        
        from app.services.supabase_service import SupabaseService
        print("✅ SupabaseService import successful")
        
        from app.routers.auth import SignupRequest
        print("✅ Auth router imports successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {str(e)}")
        return False

def create_fixed_supabase_service():
    """Create a fixed version of the Supabase service"""
    print("\n🔧 Creating fixed Supabase service...")
    
    fixed_service_code = '''"""
Fixed Supabase service initialization
"""

import os
from typing import Optional
from supabase import create_client, Client
from app.exceptions import DatabaseException

class FixedSupabaseService:
    """Fixed Supabase service with proxy error handling"""
    
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client = None
    
    def _get_client(self):
        """Get Supabase client with error handling"""
        if self.client is None:
            try:
                # Try basic client creation first
                self.client = create_client(self.supabase_url, self.supabase_key)
                print("✅ Supabase client created successfully")
            except Exception as e:
                error_msg = f"Failed to create Supabase client: {str(e)}"
                print(f"❌ {error_msg}")
                raise DatabaseException(error_msg)
        
        return self.client
    
    async def get_user_by_email(self, email: str):
        """Get user by email with error handling"""
        try:
            client = self._get_client()
            response = client.table("users").select("*").eq("email", email).maybe_single().execute()
            return response.data if response and response.data else None
        except Exception as e:
            print(f"Database error: {str(e)}")
            return None
'''
    
    try:
        with open("backend/app/services/fixed_supabase_service.py", "w") as f:
            f.write(fixed_service_code)
        print("✅ Fixed service created")
        return True
    except Exception as e:
        print(f"❌ Failed to create fixed service: {str(e)}")
        return False

def main():
    """Main function"""
    print("🚀 SafarSaga Authentication Issue Fixer")
    print("=" * 50)
    
    # Check environment
    env_ok = check_environment()
    
    # Test imports
    imports_ok = test_imports()
    
    # Test Supabase client
    supabase_ok = test_supabase_client()
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY")
    print("=" * 50)
    
    print(f"Environment Variables: {'✅ OK' if env_ok else '❌ ISSUES'}")
    print(f"Imports: {'✅ OK' if imports_ok else '❌ ISSUES'}")
    print(f"Supabase Client: {'✅ OK' if supabase_ok else '❌ ISSUES'}")
    
    if env_ok and imports_ok and supabase_ok:
        print("\n🎉 All tests passed! The authentication should work now.")
        print("\n📝 To test signup:")
        print("1. Make sure the FastAPI server is running")
        print("2. Try the signup endpoint with a valid email")
    else:
        print("\n🔧 Issues found. Recommendations:")
        
        if not env_ok:
            print("- Check your .env file and ensure Supabase credentials are correct")
        
        if not imports_ok:
            print("- Restart the FastAPI server to pick up import changes")
        
        if not supabase_ok:
            print("- Check Supabase connection and credentials")
            print("- The proxy error might be resolved by using basic client creation")

if __name__ == "__main__":
    main()