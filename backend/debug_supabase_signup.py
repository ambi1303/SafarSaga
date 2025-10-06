#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def debug_supabase_signup():
    """Debug Supabase signup to see the exact error"""
    
    print("🔍 Debugging Supabase Signup")
    print("=" * 40)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Initialize service
        service = SupabaseService()
        client = service._get_client()
        
        print("✅ Supabase client initialized")
        
        # Test signup data
        signup_data = {
            "email": "kallu@gmail.com",
            "password": "Kallu@12345",
            "options": {
                "data": {
                    "full_name": "Kallu Test",
                    "phone": "1234567890"
                }
            }
        }
        
        print(f"Testing signup with: {signup_data['email']}")
        
        # Try the signup
        try:
            response = client.auth.sign_up(signup_data)
            print(f"✅ Signup successful!")
            print(f"User: {response.user}")
            print(f"Session: {response.session}")
            
        except Exception as signup_error:
            print(f"❌ Supabase signup error: {str(signup_error)}")
            print(f"Error type: {type(signup_error)}")
            
            # Check if it's a specific Supabase error
            if hasattr(signup_error, 'message'):
                print(f"Error message: {signup_error.message}")
            if hasattr(signup_error, 'details'):
                print(f"Error details: {signup_error.details}")
            if hasattr(signup_error, 'code'):
                print(f"Error code: {signup_error.code}")
            
            # Try with a different email format
            print("\n🔄 Trying with a different email...")
            try:
                alt_signup_data = {
                    "email": "test.user@example.com",
                    "password": "TestUser@12345",
                    "options": {
                        "data": {
                            "full_name": "Test User",
                            "phone": "1234567890"
                        }
                    }
                }
                
                alt_response = client.auth.sign_up(alt_signup_data)
                print(f"✅ Alternative email signup successful!")
                print(f"This suggests the issue is specific to 'kallu@gmail.com'")
                
            except Exception as alt_error:
                print(f"❌ Alternative email also failed: {str(alt_error)}")
                print("This suggests a broader Supabase configuration issue")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to debug Supabase signup: {str(e)}")
        return False

if __name__ == "__main__":
    debug_supabase_signup()