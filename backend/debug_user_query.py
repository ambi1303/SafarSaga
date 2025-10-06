#!/usr/bin/env python3
"""
Debug user query issues
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.supabase_service import SupabaseService

async def debug_user_query():
    """Debug user query operations"""
    print("Debugging user query operations...")
    
    try:
        service = SupabaseService()
        
        print("\n1. Testing direct table access...")
        def _test_direct_access():
            client = service._get_client()
            response = client.table("users").select("*").limit(5).execute()
            return response
        
        direct_result = await service._run_sync(_test_direct_access)
        print(f"Direct table access result: {direct_result}")
        print(f"Data: {direct_result.data if hasattr(direct_result, 'data') else 'No data attribute'}")
        
        print("\n2. Testing maybe_single with non-existent email...")
        def _test_maybe_single():
            client = service._get_client()
            response = client.table("users").select("*").eq("email", "nonexistent@example.com").maybe_single().execute()
            return response
        
        maybe_single_result = await service._run_sync(_test_maybe_single)
        print(f"Maybe single result: {maybe_single_result}")
        print(f"Data: {maybe_single_result.data if hasattr(maybe_single_result, 'data') else 'No data attribute'}")
        
        print("\n3. Testing service method...")
        try:
            user = await service.get_user_by_email("nonexistent@example.com")
            print(f"Service method result: {user}")
        except Exception as e:
            print(f"Service method error: {e}")
            print(f"Error type: {type(e)}")
            import traceback
            traceback.print_exc()
        
        print("\n4. Testing with a simple select count...")
        def _test_count():
            client = service._get_client()
            response = client.table("users").select("count", count="exact").execute()
            return response
        
        count_result = await service._run_sync(_test_count)
        print(f"Count result: {count_result}")
        
    except Exception as e:
        print(f"\n❌ Error during debugging: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_user_query())