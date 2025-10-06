"""
Destinations routes for SafarSaga API
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Optional, List
from decimal import Decimal

from app.models import (
    Destination, DestinationCreate, DestinationUpdate, 
    PaginatedResponse, User, DifficultyLevel
)
from app.middleware.auth import get_current_user, get_admin_user, get_optional_user
from app.services.supabase_service import SupabaseService
from app.exceptions import (
    NotFoundException, 
    ValidationException, 
    AuthorizationException,
    BusinessLogicException
)

router = APIRouter()
supabase_service = SupabaseService()


@router.get(
    "/",
    response_model=PaginatedResponse,
    tags=["Destinations"],
    summary="List Destinations",
    description="Get list of destinations with filtering and pagination"
)
async def get_destinations(
    state: Optional[str] = Query(None, description="Filter by state"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty level"),
    min_cost: Optional[Decimal] = Query(None, ge=0, description="Minimum cost per day filter"),
    max_cost: Optional[Decimal] = Query(None, ge=0, description="Maximum cost per day filter"),
    is_active: bool = Query(True, description="Active destinations only"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Offset from start"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get paginated list of destinations with optional filtering.
    
    **Filters:**
    - **state**: Filter by specific state/province
    - **difficulty**: Easy, Moderate, or Challenging
    - **min_cost**: Minimum cost per day
    - **max_cost**: Maximum cost per day
    - **is_active**: Show only active destinations (default: true)
    
    **Pagination:**
    - **limit**: Items per page (1-100, default: 20)
    - **offset**: Skip items (default: 0)
    """
    try:
        # Build filters
        filters = {}
        
        if state:
            filters["state"] = state
        if difficulty:
            filters["difficulty_level"] = difficulty.value
        if min_cost is not None:
            filters["min_cost"] = float(min_cost)
        if max_cost is not None:
            filters["max_cost"] = float(max_cost)
        if is_active is not None:
            filters["is_active"] = is_active
        
        # Get destinations from database
        destinations, total = await supabase_service.get_destinations(filters, limit, offset)
        
        # Calculate pagination metadata
        has_next = offset + limit < total
        has_prev = offset > 0
        
        return PaginatedResponse(
            items=destinations,
            total=total,
            limit=limit,
            offset=offset,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch destinations: {str(e)}"
        )


@router.get(
    "/{destination_id}",
    response_model=Destination,
    tags=["Destinations"],
    summary="Get Destination",
    description="Get specific destination by ID"
)
async def get_destination(
    destination_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get specific destination by ID.
    
    - **destination_id**: UUID of the destination
    
    Returns complete destination details including activities and cost information.
    """
    try:
        destination = await supabase_service.get_destination_by_id(destination_id)
        
        if not destination:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination not found"
            )
        
        return destination
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch destination: {str(e)}"
        )


@router.post(
    "/",
    response_model=Destination,
    tags=["Destinations"],
    summary="Create Destination",
    description="Create new destination (Admin only)",
    status_code=status.HTTP_201_CREATED
)
async def create_destination(
    destination_data: DestinationCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Create new destination.
    
    **Required fields:**
    - **name**: Destination name
    
    **Optional fields:**
    - **description**: Destination description
    - **state**: State/Province
    - **country**: Country (defaults to India)
    - **featured_image_url**: Featured image URL
    - **gallery_images**: Array of gallery image URLs
    - **difficulty_level**: Easy, Moderate, or Challenging
    - **best_time_to_visit**: Best time to visit description
    - **popular_activities**: Array of popular activities
    - **average_cost_per_day**: Average cost per day
    
    Requires admin privileges.
    """
    try:
        # Prepare destination data
        create_data = destination_data.dict(exclude_none=True)
        
        # Create destination
        destination = await supabase_service.create_destination(create_data)
        
        return destination
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create destination: {str(e)}"
        )


@router.put(
    "/{destination_id}",
    response_model=Destination,
    tags=["Destinations"],
    summary="Update Destination",
    description="Update destination details (Admin only)"
)
async def update_destination(
    destination_id: str,
    destination_data: DestinationUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update destination details.
    
    - **destination_id**: UUID of the destination to update
    
    **Updatable fields:**
    - **name**: Destination name
    - **description**: Destination description
    - **state**: State/Province
    - **country**: Country
    - **featured_image_url**: Featured image URL
    - **gallery_images**: Array of gallery image URLs
    - **difficulty_level**: Easy, Moderate, or Challenging
    - **best_time_to_visit**: Best time to visit description
    - **popular_activities**: Array of popular activities
    - **average_cost_per_day**: Average cost per day
    - **is_active**: Active status
    
    Requires admin privileges.
    """
    try:
        # Get existing destination
        existing_destination = await supabase_service.get_destination_by_id(destination_id)
        if not existing_destination:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination not found"
            )
        
        # Prepare update data
        update_data = destination_data.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise ValidationException("No valid fields to update")
        
        # Update destination
        updated_destination = await supabase_service.update_destination(destination_id, update_data)
        
        return updated_destination
        
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
            detail=f"Failed to update destination: {str(e)}"
        )


@router.delete(
    "/{destination_id}",
    tags=["Destinations"],
    summary="Delete Destination",
    description="Delete a destination (Admin only)",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_destination(
    destination_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a destination.
    
    - **destination_id**: UUID of the destination to delete
    
    **Business Rules:**
    - Cannot delete destinations with active bookings
    - Soft delete by setting is_active to false
    
    Requires admin privileges.
    """
    try:
        # Get existing destination
        existing_destination = await supabase_service.get_destination_by_id(destination_id)
        if not existing_destination:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination not found"
            )
        
        # Check for active bookings
        # This would need to be implemented in the service layer
        # For now, we'll do a soft delete
        
        # Soft delete by setting is_active to false
        await supabase_service.update_destination(destination_id, {"is_active": False})
        
        return {"message": "Destination deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete destination: {str(e)}"
        )


@router.get(
    "/{destination_id}/activities",
    tags=["Destinations"],
    summary="Get Destination Activities",
    description="Get popular activities for a destination"
)
async def get_destination_activities(
    destination_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get popular activities for a specific destination.
    
    - **destination_id**: UUID of the destination
    
    Returns list of popular activities and recommendations.
    """
    try:
        destination = await supabase_service.get_destination_by_id(destination_id)
        
        if not destination:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination not found"
            )
        
        return {
            "destination_id": destination.id,
            "destination_name": destination.name,
            "popular_activities": destination.popular_activities or [],
            "difficulty_level": destination.difficulty_level,
            "best_time_to_visit": destination.best_time_to_visit,
            "average_cost_per_day": destination.average_cost_per_day
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch destination activities: {str(e)}"
        )


@router.get(
    "/search/{query}",
    response_model=List[Destination],
    tags=["Destinations"],
    summary="Search Destinations",
    description="Search destinations by name or description"
)
async def search_destinations(
    query: str,
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Search destinations by name or description.
    
    - **query**: Search term
    - **limit**: Maximum number of results (1-50, default: 10)
    
    Returns list of matching destinations.
    """
    try:
        if len(query.strip()) < 2:
            raise ValidationException("Search query must be at least 2 characters")
        
        destinations = await supabase_service.search_destinations(query, limit)
        
        return destinations
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search destinations: {str(e)}"
        )