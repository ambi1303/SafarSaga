"""
Gallery routes for SafarSaga API
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File, Form
from typing import Optional, List
import os
from datetime import datetime, timezone, timedelta

from app.models import (
    GalleryImage, GalleryImageCreate, GalleryImageUpdate, GalleryFilters,
    PaginatedResponse, User
)
from app.middleware.auth import get_current_user, get_admin_user, get_optional_user
from app.services.supabase_service import SupabaseService
from app.services.cloudinary_service import CloudinaryService
from app.exceptions import (
    NotFoundException, 
    ValidationException, 
    FileUploadException,
    ExternalServiceException
)

router = APIRouter()
supabase_service = SupabaseService()
cloudinary_service = CloudinaryService()


@router.get(
    "/",
    response_model=PaginatedResponse,
    tags=["Gallery"],
    summary="List Gallery Images",
    description="Get list of gallery images with filtering and pagination"
)
async def get_gallery_images(
    folder: Optional[str] = Query(None, description="Filter by Cloudinary folder"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    is_featured: Optional[bool] = Query(None, description="Filter featured images only"),
    max_results: int = Query(12, ge=1, le=50, description="Maximum results per page"),
    next_cursor: Optional[str] = Query(None, description="Pagination cursor"),
    sort_by: str = Query("uploaded_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    query: Optional[str] = Query(None, description="Search query"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get paginated list of gallery images with optional filtering.
    
    **Public Access:** Anyone can view gallery images
    
    **Filters:**
    - **folder**: Cloudinary folder filter
    - **tags**: Comma-separated list of tags
    - **event_id**: Filter by associated event
    - **is_featured**: Show only featured images
    - **query**: Search in image names and tags
    
    **Pagination:**
    - **max_results**: Items per page (1-50, default: 12)
    - **next_cursor**: Pagination cursor from previous response
    
    **Sorting:**
    - **sort_by**: uploaded_at, public_id
    - **sort_order**: asc, desc
    """
    try:
        # Parse tags if provided
        tag_list = None
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # If search query is provided, use Cloudinary search
        if query:
            cloudinary_result = await cloudinary_service.search_images(
                query=query,
                folder=folder or "safarsaga",
                max_results=max_results,
                next_cursor=next_cursor
            )
            
            # Get database records for these images
            public_ids = [img["public_id"] for img in cloudinary_result["images"]]
            
            # Build database filters
            db_filters = {}
            if event_id:
                db_filters["event_id"] = event_id
            if is_featured is not None:
                db_filters["is_featured"] = is_featured
            
            # Get images from database
            db_images, total = await supabase_service.get_gallery_images(
                db_filters, limit=max_results, offset=0
            )
            
            # Match with Cloudinary results
            matched_images = []
            for cloudinary_img in cloudinary_result["images"]:
                for db_img in db_images:
                    if db_img.cloudinary_public_id == cloudinary_img["public_id"]:
                        matched_images.append(db_img)
                        break
            
            return PaginatedResponse(
                items=matched_images,
                total=cloudinary_result.get("total_count", len(matched_images)),
                limit=max_results,
                offset=0,
                has_next=bool(cloudinary_result.get("next_cursor")),
                has_prev=False
            )
        
        # Regular database query without search
        db_filters = {}
        if event_id:
            db_filters["event_id"] = event_id
        if is_featured is not None:
            db_filters["is_featured"] = is_featured
        if tag_list:
            db_filters["tags"] = tag_list
        
        # Get images from database
        db_images, total = await supabase_service.get_gallery_images(
            db_filters, limit=max_results, offset=0
        )
        
        return PaginatedResponse(
            items=db_images,
            total=total,
            limit=max_results,
            offset=0,
            has_next=len(db_images) == max_results,
            has_prev=False
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch gallery images: {str(e)}"
        )


@router.get(
    "/{image_id}",
    response_model=GalleryImage,
    tags=["Gallery"],
    summary="Get Gallery Image",
    description="Get specific gallery image by ID"
)
async def get_gallery_image(
    image_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get specific gallery image by ID with Cloudinary metadata."""
    try:
        # Get image from database
        image = await supabase_service.get_gallery_image_by_id(image_id)
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gallery image not found"
            )
        
        return image
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch gallery image: {str(e)}"
        )


@router.post(
    "/upload",
    response_model=GalleryImage,
    tags=["Gallery"],
    summary="Upload Image",
    description="Upload new image to gallery (Admin only)",
    status_code=status.HTTP_201_CREATED
)
async def upload_image(
    file: UploadFile = File(..., description="Image file to upload"),
    alt_text: Optional[str] = Form(None, description="Alt text for accessibility"),
    caption: Optional[str] = Form(None, description="Image caption"),
    description: Optional[str] = Form(None, description="Image description"),
    tags: Optional[str] = Form(None, description="Comma-separated tags"),
    event_id: Optional[str] = Form(None, description="Associated event ID"),
    is_featured: bool = Form(False, description="Mark as featured image"),
    folder: str = Form("safarsaga", description="Cloudinary folder"),
    current_user: User = Depends(get_admin_user)
):
    """Upload new image to gallery with metadata."""
    try:
        # Validate file
        if not file.content_type or not file.content_type.startswith("image/"):
            raise FileUploadException("File must be an image", file.filename)
        
        # Check file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise FileUploadException("File size must not exceed 10MB", file.filename)
        
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        
        # Upload to Cloudinary
        upload_result = await cloudinary_service.upload_image(
            file_content=file_content,
            filename=file.filename,
            folder=folder,
            tags=tag_list
        )
        
        # Save metadata to database
        image_data = {
            "cloudinary_public_id": upload_result["public_id"],
            "url": upload_result["url"],
            "filename": file.filename,
            "alt_text": alt_text,
            "caption": caption,
            "description": description,
            "tags": tag_list,
            "event_id": event_id,
            "uploaded_by": current_user.id,
            "is_featured": is_featured
        }
        
        gallery_image = await supabase_service.create_gallery_image(image_data)
        return gallery_image
        
    except (FileUploadException, ExternalServiceException) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.put(
    "/{image_id}",
    response_model=GalleryImage,
    tags=["Gallery"],
    summary="Update Gallery Image",
    description="Update gallery image metadata (Admin only)"
)
async def update_gallery_image(
    image_id: str,
    image_data: GalleryImageUpdate,
    current_user: User = Depends(get_admin_user)
):
    """Update gallery image metadata."""
    try:
        # Check if image exists
        existing_image = await supabase_service.get_gallery_image_by_id(image_id)
        if not existing_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gallery image not found"
            )
        
        # Prepare update data
        update_data = image_data.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise ValidationException("No valid fields to update")
        
        # Update image metadata
        updated_image = await supabase_service.update_gallery_image(image_id, update_data)
        return updated_image
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update gallery image: {str(e)}"
        )


@router.delete(
    "/{image_id}",
    tags=["Gallery"],
    summary="Delete Gallery Image",
    description="Delete gallery image (Admin only)",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_gallery_image(
    image_id: str,
    delete_from_cloudinary: bool = Query(True, description="Also delete from Cloudinary"),
    current_user: User = Depends(get_admin_user)
):
    """Delete gallery image from database and optionally from Cloudinary."""
    try:
        # Get image details
        existing_image = await supabase_service.get_gallery_image_by_id(image_id)
        if not existing_image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gallery image not found"
            )
        
        # Delete from database first
        deleted = await supabase_service.delete_gallery_image(image_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete image from database"
            )
        
        # Optionally delete from Cloudinary
        if delete_from_cloudinary and existing_image.cloudinary_public_id:
            try:
                await cloudinary_service.delete_image(existing_image.cloudinary_public_id)
            except Exception as e:
                print(f"Warning: Failed to delete from Cloudinary: {str(e)}")
        
        return {"message": "Gallery image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete gallery image: {str(e)}"
        )


@router.get(
    "/{image_id}/transformations",
    tags=["Gallery"],
    summary="Get Image Transformations",
    description="Get various transformed versions of an image"
)
async def get_image_transformations(
    image_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Get various transformed versions of an image."""
    try:
        # Get image from database
        image = await supabase_service.get_gallery_image_by_id(image_id)
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gallery image not found"
            )
        
        public_id = image.cloudinary_public_id
        
        transformations = {
            "original": image.url,
            "thumbnail": cloudinary_service.get_thumbnail_url(public_id, 300),
            "small": cloudinary_service.get_optimized_url(public_id, width=600),
            "medium": cloudinary_service.get_optimized_url(public_id, width=1200),
            "large": cloudinary_service.get_optimized_url(public_id, width=1920),
            "webp_small": cloudinary_service.get_optimized_url(public_id, width=600, format="webp"),
            "webp_medium": cloudinary_service.get_optimized_url(public_id, width=1200, format="webp")
        }
        
        return {
            "image_id": image_id,
            "public_id": public_id,
            "transformations": transformations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate transformations: {str(e)}"
        )


@router.get(
    "/stats/summary",
    tags=["Gallery"],
    summary="Get Gallery Statistics",
    description="Get gallery statistics and metrics (Admin only)"
)
async def get_gallery_stats(current_user: User = Depends(get_admin_user)):
    """Get comprehensive gallery statistics and metrics."""
    try:
        # Get all images for statistics
        all_images, total = await supabase_service.get_gallery_images({}, limit=1000, offset=0)
        
        # Calculate statistics
        stats = {
            "total_images": total,
            "featured_images": len([img for img in all_images if img.is_featured]),
            "images_with_events": len([img for img in all_images if img.event_id]),
            "images_without_events": len([img for img in all_images if not img.event_id])
        }
        
        # Tag popularity
        tag_counts = {}
        for image in all_images:
            if image.tags:
                for tag in image.tags:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        popular_tags = sorted(
            tag_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        stats["popular_tags"] = [{"tag": tag, "count": count} for tag, count in popular_tags]
        
        # Recent uploads (last 30 days)
        recent_date = datetime.now(timezone.utc) - timedelta(days=30)
        recent_images = [
            img for img in all_images 
            if img.uploaded_at and img.uploaded_at >= recent_date
        ]
        stats["recent_uploads"] = len(recent_images)
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch gallery statistics: {str(e)}"
        )
                 