"""
Destinations routes for SafarSaga API
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.responses import JSONResponse
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
    "/search",
    response_model=List[Destination],
    tags=["Destinations"],
    summary="Search Destinations",
    description="Search destinations by name or description"
)
async def search_destinations(
    query: str = Query(..., min_length=2, description="Search term (minimum 2 characters)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Search destinations by name or description.
    
    - **query**: Search term (minimum 2 characters)
    - **limit**: Maximum number of results (1-50, default: 10)
    
    Returns list of matching destinations.
    """
    try:
        destinations = await supabase_service.search_destinations(query.strip(), limit)
        return destinations
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search destinations: {str(e)}"
        )


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
    is_active: Optional[bool] = Query(True, description="Active destinations only"),
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
            raise NotFoundException(f"Destination with ID {destination_id} not found")
        
        return destination
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {destination_id} not found"
        )
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
    - **name**: Destination name (unique)
    
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
        # Validate required fields
        if not destination_data.name or not destination_data.name.strip():
            raise ValidationException("Destination name is required")
        
        # Prepare destination data
        create_data = destination_data.dict(exclude_none=True)
        
        # Ensure name is trimmed
        create_data['name'] = create_data['name'].strip()
        
        # Set default values
        if 'country' not in create_data or not create_data['country']:
            create_data['country'] = 'India'
        
        if 'is_active' not in create_data:
            create_data['is_active'] = True
        
        # Create destination
        destination = await supabase_service.create_destination(create_data)
        
        return destination
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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
            raise NotFoundException(f"Destination with ID {destination_id} not found")
        
        # Prepare update data (only include fields that were set)
        update_data = destination_data.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise ValidationException("No valid fields to update")
        
        # Trim name if provided
        if 'name' in update_data:
            update_data['name'] = update_data['name'].strip()
            if not update_data['name']:
                raise ValidationException("Destination name cannot be empty")
        
        # Update destination
        updated_destination = await supabase_service.update_destination(destination_id, update_data)
        
        return updated_destination
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {destination_id} not found"
        )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update destination: {str(e)}"
        )


@router.patch(
    "/{destination_id}",
    response_model=Destination,
    tags=["Destinations"],
    summary="Partially Update Destination",
    description="Partially update destination details (Admin only)"
)
async def patch_destination(
    destination_id: str,
    destination_data: DestinationUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Partially update destination details (same as PUT for this implementation).
    
    - **destination_id**: UUID of the destination to update
    
    Requires admin privileges.
    """
    return await update_destination(destination_id, destination_data, current_user)


@router.delete(
    "/{destination_id}",
    tags=["Destinations"],
    summary="Delete Destination",
    description="Delete a destination (Admin only)",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_destination(
    destination_id: str,
    hard_delete: bool = Query(False, description="Permanently delete (true) or soft delete (false)"),
    current_user: User = Depends(get_admin_user)
):
    """
    Delete a destination.
    
    - **destination_id**: UUID of the destination to delete
    - **hard_delete**: If true, permanently delete; if false, soft delete (default)
    
    **Business Rules:**
    - Cannot delete destinations with active bookings
    - Default is soft delete (sets is_active to false)
    - Hard delete requires explicit confirmation
    
    Requires admin privileges.
    """
    try:
        # Get existing destination
        existing_destination = await supabase_service.get_destination_by_id(destination_id)
        if not existing_destination:
            raise NotFoundException(f"Destination with ID {destination_id} not found")
        
        # Check for active bookings (implement in service layer)
        has_active_bookings = await supabase_service.destination_has_active_bookings(destination_id)
        if has_active_bookings:
            raise BusinessLogicException(
                "Cannot delete destination with active bookings. "
                "Please wait for bookings to complete or cancel them first."
            )
        
        if hard_delete:
            # Hard delete - permanently remove from database
            await supabase_service.delete_destination(destination_id)
        else:
            # Soft delete - set is_active to false
            await supabase_service.update_destination(destination_id, {"is_active": False})
        
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content=None
        )
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {destination_id} not found"
        )
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
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
            raise NotFoundException(f"Destination with ID {destination_id} not found")
        
        return {
            "destination_id": destination.id,
            "destination_name": destination.name,
            "popular_activities": destination.popular_activities or [],
            "difficulty_level": destination.difficulty_level,
            "best_time_to_visit": destination.best_time_to_visit,
            "package_price": destination.package_price
        }
        
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Destination with ID {destination_id} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch destination activities: {str(e)}"
        )