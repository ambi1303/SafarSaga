#!/usr/bin/env python3
"""
Test script to debug gallery album creation issue
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.supabase_service import SupabaseService

# Load environment variables
load_dotenv()

async def test_gallery_creation():
    """Test gallery album creation step by step"""
    
    print("=== Testing Gallery Album Creation ===")
    
    # Initialize service
    service = SupabaseService()
    
    # Test data
    test_album_data = {
        "title": "Test Album",
        "description": "Test description",
        "destination_id": None
    }
    
    try:
        print(f"1. Testing album creation with data: {test_album_data}")
        
        # Step 1: Create album
        created_album = await service.create_gallery_album(test_album_data.copy())
        print(f"2. Created album: {created_album}")
        
        if not created_album:
            print("ERROR: No album returned from creation")
            return
        
        album_id = created_album.get('id')
        if not album_id:
            print("ERROR: No ID in created album")
            return
        
        print(f"3. Album ID: {album_id}")
        
        # Step 2: Fetch complete album
        complete_album = await service.get_gallery_album_with_images(album_id)
        print(f"4. Complete album: {complete_album}")
        
        if not complete_album:
            print("ERROR: Could not fetch complete album")
            return
        
        print("SUCCESS: Album creation and retrieval working!")
        
        # Cleanup - delete the test album
        deleted = await service.delete_gallery_album(album_id)
        print(f"5. Cleanup - Album deleted: {deleted}")
        
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gallery_creation())
