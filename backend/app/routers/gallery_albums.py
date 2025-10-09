"""
Album-based Gallery Management API Router
Handles CRUD operations for gallery albums and their images
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from app.models import (
    GalleryAlbum, GalleryAlbumCreate, GalleryAlbumUpdate,
    GalleryAlbumImage, GalleryAlbumImageCreate, GalleryAlbumImageUpdate,
    GalleryAlbumWithImages, User, ApiResponse
)
from app.middleware.auth import get_current_user, get_admin_user, get_optional_user
from app.services.supabase_service import SupabaseService

router = APIRouter()
supabase_service = SupabaseService()


# ==================== ALBUM ENDPOINTS ====================

@router.post(
    "/albums",
    response_model=GalleryAlbum,
    tags=["Gallery Albums"],
    summary="Create Album",
    description="Create a new gallery album (Admin only)",
    status_code=status.HTTP_201_CREATED
)
async def create_album(
    album_data: GalleryAlbumCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Create a new gallery album.
    
    **Admin Only**
    
    Creates an empty album that can later be populated with images.
    """
    try:
        # Step 1: Create the album in the database
        print(f"DEBUG: Creating album with data: {album_data.dict()}")
        created_album = await supabase_service.create_gallery_album(album_data.dict())
        print(f"DEBUG: Created album: {created_album}")
        
        # Step 2: Add enriched fields to match GalleryAlbum model
        if not created_album or 'id' not in created_album:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create album: No ID returned"
            )
        
        # Add the required enriched fields directly to the created album
        created_album['destination_name'] = None
        created_album['image_count'] = 0
        created_album['cover_image_url'] = None
        
        print(f"DEBUG: Returning enriched album: {created_album}")
        
        return created_album
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: Exception in create_album: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create album: {str(e)}"
        )


@router.get(
    "/albums",
    response_model=List[GalleryAlbum],
    tags=["Gallery Albums"],
    summary="List Albums",
    description="Get list of all gallery albums"
)
async def get_albums(
    destination_id: Optional[str] = Query(None, description="Filter by destination"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get list of all albums.
    
    **Public Access**
    
    Returns all albums with basic information including image count and cover image.
    """
    try:
        albums = await supabase_service.get_gallery_albums(destination_id=destination_id)
        return albums
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch albums: {str(e)}"
        )


@router.get(
    "/albums/{album_id}",
    response_model=GalleryAlbumWithImages,
    tags=["Gallery Albums"],
    summary="Get Album with Images",
    description="Get specific album with all its images"
)
async def get_album_with_images(
    album_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get specific album with all its images.
    
    **Public Access**
    
    Returns album details and all associated images ordered by display_order.
    """
    try:
        album = await supabase_service.get_gallery_album_with_images(album_id)
        
        if not album:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Album not found"
            )
        
        return album
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch album: {str(e)}"
        )


@router.put(
    "/albums/{album_id}",
    response_model=GalleryAlbum,
    tags=["Gallery Albums"],
    summary="Update Album",
    description="Update album details (Admin only)"
)
async def update_album(
    album_id: str,
    album_data: GalleryAlbumUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update album title, description, or destination.
    
    **Admin Only**
    """
    try:
        # Check if album exists
        existing_album = await supabase_service.get_gallery_album_by_id(album_id)
        if not existing_album:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Album not found"
            )
        
        # Prepare update data
        update_data = album_data.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No valid fields to update"
            )
        
        # Update album
        updated_album = await supabase_service.update_gallery_album(album_id, update_data)
        return updated_album
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update album: {str(e)}"
        )


@router.delete(
    "/albums/{album_id}",
    response_model=ApiResponse,
    tags=["Gallery Albums"],
    summary="Delete Album",
    description="Delete album and all its images (Admin only)",
    status_code=status.HTTP_200_OK
)
async def delete_album(
    album_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete album and all associated images.
    
    **Admin Only**
    
    **Warning:** This will delete all images in the album due to CASCADE constraint.
    """
    try:
        # Check if album exists
        existing_album = await supabase_service.get_gallery_album_by_id(album_id)
        if not existing_album:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Album not found"
            )
        
        # Delete album (cascade will delete images)
        deleted = await supabase_service.delete_gallery_album(album_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete album"
            )
        
        return ApiResponse(message="Album deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete album: {str(e)}"
        )


# ==================== UPLOAD ENDPOINTS ====================

class UploadRequest(BaseModel):
    """Request model for generating signed upload URL"""
    file_name: str
    content_type: Optional[str] = None

@router.post(
    "/upload/signed-url",
    tags=["Gallery Upload"],
    summary="Generate Signed Upload URL",
    description="Generate a signed URL for uploading images to storage (Admin only)",
    status_code=status.HTTP_200_OK
)
async def generate_upload_url(
    upload_request: UploadRequest,
    current_user: User = Depends(get_admin_user)
):
    """
    Generate a signed URL for uploading images directly to storage.
    
    **Admin Only**
    
    Returns upload URL, file path, and final public URL.
    """
    try:
        result = await supabase_service.generate_signed_upload_url(
            upload_request.file_name,
            upload_request.content_type
        )
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}"
        )

# ==================== IMAGE ENDPOINTS ====================

@router.post(
    "/albums/{album_id}/images",
    response_model=GalleryAlbumImage,
    tags=["Gallery Images"],
    summary="Add Image to Album",
    description="Add a new image URL to an album (Admin only)",
    status_code=status.HTTP_201_CREATED
)
async def add_image_to_album(
    album_id: str,
    image_data: GalleryAlbumImageCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Add a new image to an album.
    
    **Admin Only**
    
    Admin pastes an image URL, adds optional caption, and sets display order.
    """
    try:
        # Check if album exists
        existing_album = await supabase_service.get_gallery_album_by_id(album_id)
        if not existing_album:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Album not found"
            )
        
        # Create image
        image_dict = image_data.dict()
        image_dict['album_id'] = album_id
        
        image = await supabase_service.create_gallery_album_image(image_dict)
        return image
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add image: {str(e)}"
        )


@router.put(
    "/images/{image_id}",
    response_model=GalleryAlbumImage,
    tags=["Gallery Images"],
    summary="Update Image",
    description="Update image URL, caption, or display order (Admin only)"
)
async def update_image(
    image_id: str,
    image_data: GalleryAlbumImageUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update image details.
    
    **Admin Only**
    
    Can update the image URL, caption, or display order.
    """
    try:
        # Check if image exists
        existing_image = await supabase_service.get_gallery_album_image_by_id(image_id)
        if not existing_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        # Prepare update data
        update_data = image_data.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No valid fields to update"
            )
        
        # Update image
        updated_image = await supabase_service.update_gallery_album_image(image_id, update_data)
        return updated_image
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update image: {str(e)}"
        )


@router.delete(
    "/images/{image_id}",
    response_model=ApiResponse,
    tags=["Gallery Images"],
    summary="Delete Image",
    description="Delete a single image from an album (Admin only)",
    status_code=status.HTTP_200_OK
)
async def delete_image(
    image_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a single image from an album.
    
    **Admin Only**
    
    Removes the image from the database. The image URL itself is not deleted.
    """
    try:
        # Check if image exists
        existing_image = await supabase_service.get_gallery_album_image_by_id(image_id)
        if not existing_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        # Delete image
        deleted = await supabase_service.delete_gallery_album_image(image_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete image"
            )
        
        return ApiResponse(message="Image deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )


# ==================== STATISTICS ====================

@router.get(
    "/stats",
    tags=["Gallery Albums"],
    summary="Get Gallery Statistics",
    description="Get gallery statistics (Admin only)"
)
async def get_gallery_statistics(
    current_user: User = Depends(get_admin_user)
):
    """
    Get comprehensive gallery statistics.
    
    **Admin Only**
    
    Returns total albums, total images, and other metrics.
    """
    try:
        stats = await supabase_service.get_gallery_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )
