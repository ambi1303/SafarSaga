#!/usr/bin/env python3
"""
Create sample gallery data for testing
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.supabase_service import SupabaseService

# Load environment variables
load_dotenv()

async def create_sample_data():
    """Create sample albums and images for testing"""
    
    print("=== Creating Sample Gallery Data ===")
    
    # Initialize service
    service = SupabaseService()
    
    # Sample albums data
    albums_data = [
        {
            "title": "Manali Adventure",
            "description": "Beautiful landscapes and adventure activities in Manali",
            "destination_id": None
        },
        {
            "title": "Kasol Trek",
            "description": "Scenic trekking routes and mountain views in Kasol",
            "destination_id": None
        },
        {
            "title": "Goa Beaches",
            "description": "Stunning beach views and coastal experiences",
            "destination_id": None
        }
    ]
    
    # Sample images (using placeholder URLs for now)
    sample_images = [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop"
    ]
    
    try:
        created_albums = []
        
        # Create albums
        for i, album_data in enumerate(albums_data):
            print(f"\n{i+1}. Creating album: {album_data['title']}")
            
            created_album = await service.create_gallery_album(album_data.copy())
            if created_album:
                print(f"   ✓ Album created with ID: {created_album['id']}")
                created_albums.append(created_album)
                
                # Add 2-3 images to each album
                num_images = 2 + (i % 2)  # 2 or 3 images per album
                for j in range(num_images):
                    image_data = {
                        "image_url": sample_images[(i * 3 + j) % len(sample_images)],
                        "caption": f"Beautiful view {j+1} from {album_data['title']}",
                        "display_order": j
                    }
                    
                    try:
                        created_image = await service.create_gallery_album_image({
                            **image_data,
                            "album_id": created_album['id']
                        })
                        if created_image:
                            print(f"   ✓ Added image {j+1}: {image_data['caption']}")
                        else:
                            print(f"   ✗ Failed to add image {j+1}")
                    except Exception as e:
                        print(f"   ✗ Error adding image {j+1}: {str(e)}")
            else:
                print(f"   ✗ Failed to create album")
        
        print(f"\n=== Summary ===")
        print(f"Created {len(created_albums)} albums")
        
        # Fetch and display final results
        print(f"\n=== Verifying Data ===")
        albums = await service.get_gallery_albums()
        for album in albums:
            print(f"Album: {album['title']} - {album['image_count']} images")
            if album.get('cover_image_url'):
                print(f"  Cover: {album['cover_image_url'][:50]}...")
        
        print(f"\n✅ Sample data creation completed!")
        
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_sample_data())
