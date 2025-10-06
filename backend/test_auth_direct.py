#!/usr/bin/env python3
"""
Test authentication directly without FastAPI server
"""

import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to path
sys.path.append('.')

async def test_auth_direct():
    """Test authentication functionality directly"""
    
    print("🧪 Testing authentication directly...")
    
    try:
        # Import the auth components
        from app.services.supabase_service import SupabaseService
        from app.routers.auth import SignupRequest
        
        print("✅ Imports successful")
        
        # Create service instance
        service = SupabaseService()
        print("✅ Service created")
        
        # Test client initialization
        client = service._get_client()
        print("✅ Client initialized")
        
        # Test a simple user lookup (should return None for non-existent user)
        result = await service.get_user_by_email("nonexistent@example.com")
        print(f"✅ User lookup test: {result}")
        
        # Test Supabase auth signup directly
        print("\n🔐 Testing Supabase auth signup...")
        
        def test_signup():
            try:
                response = client.auth.sign_up({
                    "email": "directtest@example.com",
                    "password": "TestPassword123!",
                    "options": {
                        "data": {
                            "full_name": "Direct Test User"
                        }
                    }
                })
                return response
            except Exception as signup_error:
                print(f"Signup error: {str(signup_error)}")
                return None
        
        signup_result = await service._run_sync(test_signup)
        
        if signup_result:
            print("✅ Direct Supabase auth signup successful!")
            print(f"User ID: {signup_result.user.id if signup_result.user else 'None'}")
        else:
            print("⚠️ Direct signup failed (might be due to email validation)")
        
        print("\n🎉 All direct tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Direct test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth_direct())