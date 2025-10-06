#!/usr/bin/env python3
"""
Test Supabase client initialization to debug the proxy parameter issue
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_init():
    """Test Supabase client initialization"""
    
    print("Testing Supabase client initialization...")
    
    # Get environment variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"SUPABASE_URL: {supabase_url}")
    print(f"SUPABASE_KEY: {'*' * 20 if supabase_key else 'Not set'}")
    
    # Check for proxy-related environment variables
    proxy_vars = [
        'HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy',
        'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'
    ]
    
    print("\nChecking for proxy environment variables:")
    for var in proxy_vars:
        value = os.getenv(var)
        if value:
            print(f"{var}: {value}")
        else:
            print(f"{var}: Not set")
    
    # Try to import and create Supabase client
    try:
        print("\nImporting Supabase...")
        from supabase import create_client, Client
        print("✅ Supabase import successful")
        
        print("\nCreating Supabase client...")
        
        # Try with minimal parameters first
        client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client created successfully")
        
        # Test a simple operation
        print("\nTesting client connection...")
        try:
            # Try a simple query that should work
            response = client.table("users").select("count").limit(1).execute()
            print("✅ Client connection test successful")
            print(f"Response: {response}")
        except Exception as query_error:
            print(f"⚠️ Client connection test failed: {str(query_error)}")
            # This might fail due to table not existing, but client should be working
        
    except Exception as e:
        print(f"❌ Error creating Supabase client: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Try to get more details about the error
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        
        # Check if it's specifically about the proxy parameter
        if "proxy" in str(e).lower():
            print("\n🔍 This appears to be a proxy-related error.")
            print("Possible solutions:")
            print("1. Update Supabase client version")
            print("2. Check for proxy environment variables")
            print("3. Use different client initialization parameters")
            
            # Try alternative initialization
            print("\nTrying alternative client initialization...")
            try:
                # Try with explicit options
                client = create_client(
                    supabase_url, 
                    supabase_key,
                    options={
                        "schema": "public",
                        "auto_refresh_token": True,
                        "persist_session": True
                    }
                )
                print("✅ Alternative client initialization successful")
            except Exception as alt_error:
                print(f"❌ Alternative initialization also failed: {str(alt_error)}")

if __name__ == "__main__":
    test_supabase_init()