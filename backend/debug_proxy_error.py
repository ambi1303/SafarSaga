#!/usr/bin/env python3
"""
Debug the proxy parameter error in Supabase client
"""

import os
import sys
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_supabase_creation():
    """Debug Supabase client creation step by step"""
    
    print("🔍 Debugging Supabase client creation...")
    
    # Step 1: Check imports
    try:
        print("Step 1: Importing Supabase...")
        from supabase import create_client, Client
        print("✅ Import successful")
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        return
    
    # Step 2: Get environment variables
    print("\nStep 2: Getting environment variables...")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"URL: {supabase_url}")
    print(f"Key: {'*' * 20 if supabase_key else 'Not set'}")
    
    # Step 3: Try basic client creation
    print("\nStep 3: Creating client with basic parameters...")
    try:
        client = create_client(supabase_url, supabase_key)
        print("✅ Basic client creation successful")
    except Exception as e:
        print(f"❌ Basic client creation failed: {str(e)}")
        print("Full traceback:")
        traceback.print_exc()
        
        # Check if it's the proxy error
        if "proxy" in str(e).lower():
            print("\n🔍 This is the proxy error!")
            
            # Try to inspect the create_client function
            print("Inspecting create_client function...")
            import inspect
            sig = inspect.signature(create_client)
            print(f"Function signature: {sig}")
            
            # Check if there are any default parameters
            for param_name, param in sig.parameters.items():
                print(f"Parameter: {param_name} = {param.default}")
        
        return
    
    # Step 4: Test the client
    print("\nStep 4: Testing client functionality...")
    try:
        response = client.table("users").select("count").limit(1).execute()
        print("✅ Client test successful")
        print(f"Response: {response}")
    except Exception as e:
        print(f"⚠️ Client test failed: {str(e)}")
        # This might fail due to table structure, but client should be working

def debug_service_creation():
    """Debug the SupabaseService creation"""
    
    print("\n" + "="*50)
    print("🔍 Debugging SupabaseService creation...")
    
    try:
        # Add the app directory to path
        sys.path.append('.')
        
        print("Step 1: Importing SupabaseService...")
        from app.services.supabase_service import SupabaseService
        print("✅ Import successful")
        
        print("\nStep 2: Creating service instance...")
        service = SupabaseService()
        print("✅ Service instance created")
        
        print("\nStep 3: Getting client from service...")
        client = service._get_client()
        print("✅ Service client creation successful")
        
    except Exception as e:
        print(f"❌ Service creation failed: {str(e)}")
        print("Full traceback:")
        traceback.print_exc()
        
        if "proxy" in str(e).lower():
            print("\n🔍 The proxy error is in the service!")
            
            # Let's check the service code
            print("Checking service initialization code...")
            try:
                import inspect
                from app.services.supabase_service import SupabaseService
                
                # Get the _get_client method source
                source = inspect.getsource(SupabaseService._get_client)
                print("_get_client method source:")
                print(source)
                
            except Exception as inspect_error:
                print(f"Could not inspect source: {str(inspect_error)}")

def check_environment_variables():
    """Check for any environment variables that might affect HTTP clients"""
    
    print("\n" + "="*50)
    print("🔍 Checking environment variables...")
    
    # Check all environment variables for anything HTTP/proxy related
    proxy_related = []
    http_related = []
    
    for key, value in os.environ.items():
        key_lower = key.lower()
        if 'proxy' in key_lower:
            proxy_related.append((key, value))
        elif any(term in key_lower for term in ['http', 'ssl', 'cert', 'ca']):
            http_related.append((key, value))
    
    print("Proxy-related variables:")
    if proxy_related:
        for key, value in proxy_related:
            print(f"  {key}: {value}")
    else:
        print("  None found")
    
    print("\nHTTP-related variables:")
    if http_related:
        for key, value in http_related:
            print(f"  {key}: {value}")
    else:
        print("  None found")

def main():
    """Main debugging function"""
    print("🚀 Supabase Proxy Error Debugger")
    print("=" * 50)
    
    # Check environment variables first
    check_environment_variables()
    
    # Debug basic Supabase creation
    debug_supabase_creation()
    
    # Debug service creation
    debug_service_creation()
    
    print("\n" + "=" * 50)
    print("🎯 DEBUGGING COMPLETE")
    print("If the proxy error occurred, check the traceback above for clues.")

if __name__ == "__main__":
    main()