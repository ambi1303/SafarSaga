"""
Events/Trips routes for SafarSaga API
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timezone

from app.models import (
    Event, EventCreate, EventUpdate, EventFilters, 
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

def get_supabase_service():
    return SupabaseService()


@router.get(
    "/",
    response_model=PaginatedResponse,
    tags=["Events"],
    summary="List Events",
    description="Get list of travel events/trips with filtering and pagination"
)
async def get_events(
    destination: Optional[str] = Query(None, description="Filter by destination"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty level"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
    start_date: Optional[datetime] = Query(None, description="Filter events starting from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter events ending before this date"),
    is_active: bool = Query(True, description="Show only active events"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Offset from start"),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get paginated list of travel events/trips with optional filtering.
    
    **Filters:**
    - **destination**: Search by destination name (case-insensitive)
    - **difficulty**: Filter by difficulty level (Easy, Moderate, Challenging)
    - **min_price/max_price**: Price range filtering
    - **start_date/end_date**: Date range filtering
    - **is_active**: Show only active events (default: true)
    
    **Pagination:**
    - **limit**: Items per page (1-100, default: 20)
    - **offset**: Skip items (default: 0)
    
    Returns paginated list with metadata.
    """
    try:

        # Build filters
        filters = {
            "is_active": is_active
        }
        
        if destination:
            filters["destination"] = destination
        if difficulty:
            filters["difficulty"] = difficulty.value
        if min_price is not None:
            filters["min_price"] = min_price
        if max_price is not None:
            filters["max_price"] = max_price
        if start_date:
            filters["start_date"] = start_date.isoformat()
        if end_date:
            filters["end_date"] = end_date.isoformat()
        
        # If not admin, only show active events
        if not current_user or not current_user.is_admin:
            filters["is_active"] = True
        
        # Get events from database
        events, total = await get_supabase_service().get_events(filters, limit, offset)
        
        # Calculate pagination metadata
        has_next = offset + limit < total
        has_prev = offset > 0
        
        return PaginatedResponse(
            items=events,
            total=total,
            limit=limit,
            offset=offset,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}"
        )


@router.get(
    "/{event_id}",
    response_model=Event,
    tags=["Events"],
    summary="Get Event",
    description="Get specific event/trip by ID"
)
async def get_event(
    event_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Get specific event/trip by ID.
    
    - **event_id**: UUID of the event
    
    Returns complete event details including itinerary, inclusions, and creator info.
    """
    try:
        event = await get_supabase_service().get_event_by_id(event_id)
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if user can view inactive events
        if not event.is_active:
            if not current_user or not current_user.is_admin:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Event not found"
                )
        
        return event
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch event: {str(e)}"
        )


@router.post(
    "/",
    response_model=Event,
    tags=["Events"],
    summary="Create Event",
    description="Create new travel event/trip (Admin only)",
    status_code=status.HTTP_201_CREATED
)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_admin_user)
):
    """
    Create new travel event/trip.
    
    **Required fields:**
    - **name**: Event name
    - **destination**: Travel destination
    - **price**: Event price
    - **max_capacity**: Maximum number of participants
    - **start_date**: Event start date
    - **end_date**: Event end date
    
    **Optional fields:**
    - **description**: Event description
    - **difficulty_level**: Easy, Moderate, or Challenging
    - **itinerary**: Day-by-day itinerary
    - **inclusions**: What's included in the package
    - **exclusions**: What's not included
    - **featured_image_url**: Main event image
    - **gallery_images**: Additional images
    
    Requires admin privileges.
    """
    try:
        # Validate business rules
        if event_data.start_date and event_data.end_date:
            if event_data.end_date <= event_data.start_date:
                raise ValidationException("End date must be after start date")
        
        if event_data.start_date and event_data.start_date <= datetime.now(timezone.utc):
            raise ValidationException("Start date must be in the future")
        
        # Prepare data for database
        create_data = event_data.dict(exclude_unset=True)
        create_data["created_by"] = current_user.id
        
        # Convert datetime objects to ISO strings
        if "start_date" in create_data and create_data["start_date"]:
            create_data["start_date"] = create_data["start_date"].isoformat()
        if "end_date" in create_data and create_data["end_date"]:
            create_data["end_date"] = create_data["end_date"].isoformat()
        
        # Create event
        event = await get_supabase_service().create_event(create_data)
        
        return event
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}"
        )


@router.put(
    "/{event_id}",
    response_model=Event,
    tags=["Events"],
    summary="Update Event",
    description="Update existing event/trip (Admin only)"
)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: User = Depends(get_admin_user)
):
    """
    Update existing travel event/trip.
    
    - **event_id**: UUID of the event to update
    
    All fields are optional. Only provided fields will be updated.
    
    **Business Rules:**
    - Cannot update events that have started
    - End date must be after start date
    - Cannot reduce capacity below current bookings
    
    Requires admin privileges.
    """
    try:
        # Check if event exists
        existing_event = await supabase_service.get_event_by_id(event_id)
        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if event has already started
        if existing_event.start_date and existing_event.start_date <= datetime.now(timezone.utc):
            raise BusinessLogicException(
                "Cannot update event that has already started",
                "event_started"
            )
        
        # Validate date changes
        start_date = event_data.start_date or existing_event.start_date
        end_date = event_data.end_date or existing_event.end_date
        
        if start_date and end_date and end_date <= start_date:
            raise ValidationException("End date must be after start date")
        
        # Validate capacity changes
        if event_data.max_capacity is not None:
            if event_data.max_capacity < existing_event.current_bookings:
                raise BusinessLogicException(
                    f"Cannot reduce capacity below current bookings ({existing_event.current_bookings})",
                    "insufficient_capacity"
                )
        
        # Prepare update data
        update_data = event_data.dict(exclude_unset=True, exclude_none=True)
        
        # Convert datetime objects to ISO strings
        if "start_date" in update_data and update_data["start_date"]:
            update_data["start_date"] = update_data["start_date"].isoformat()
        if "end_date" in update_data and update_data["end_date"]:
            update_data["end_date"] = update_data["end_date"].isoformat()
        
        # Update event
        updated_event = await supabase_service.update_event(event_id, update_data)
        
        return updated_event
        
    except (ValidationException, BusinessLogicException) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}"
        )


@router.delete(
    "/{event_id}",
    tags=["Events"],
    summary="Delete Event",
    description="Delete event/trip (Admin only)",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_event(
    event_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Delete travel event/trip.
    
    - **event_id**: UUID of the event to delete
    
    **Business Rules:**
    - Cannot delete events with confirmed bookings
    - Cannot delete events that have started
    
    Requires admin privileges.
    """
    try:
        # Check if event exists
        existing_event = await supabase_service.get_event_by_id(event_id)
        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if event has bookings
        if existing_event.current_bookings > 0:
            raise BusinessLogicException(
                "Cannot delete event with existing bookings",
                "has_bookings"
            )
        
        # Check if event has started
        if existing_event.start_date and existing_event.start_date <= datetime.now(timezone.utc):
            raise BusinessLogicException(
                "Cannot delete event that has already started",
                "event_started"
            )
        
        # Delete event
        deleted = await supabase_service.delete_event(event_id)
        
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete event"
            )
        
        return {"message": "Event deleted successfully"}
        
    except BusinessLogicException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}"
        )


@router.get(
    "/{event_id}/availability",
    tags=["Events"],
    summary="Check Event Availability",
    description="Check available seats for an event"
)
async def check_event_availability(event_id: str):
    """
    Check available seats for an event.
    
    - **event_id**: UUID of the event
    
    Returns availability information including:
    - Available seats
    - Total capacity
    - Current bookings
    - Booking status (open/closed/full)
    """
    try:
        event = await supabase_service.get_event_by_id(event_id)
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        if not event.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        available_seats = event.max_capacity - event.current_bookings if event.max_capacity else 0
        
        # Determine booking status
        booking_status = "open"
        if event.start_date and event.start_date <= datetime.now(timezone.utc):
            booking_status = "closed"
        elif available_seats <= 0:
            booking_status = "full"
        
        return {
            "event_id": event.id,
            "event_name": event.name,
            "total_capacity": event.max_capacity,
            "current_bookings": event.current_bookings,
            "available_seats": available_seats,
            "booking_status": booking_status,
            "start_date": event.start_date,
            "end_date": event.end_date,
            "price": event.price
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check availability: {str(e)}"
        )


@router.get(
    "/{event_id}/bookings",
    tags=["Events"],
    summary="Get Event Bookings",
    description="Get all bookings for an event (Admin only)"
)
async def get_event_bookings(
    event_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Get all bookings for a specific event.
    
    - **event_id**: UUID of the event
    
    Returns list of all bookings with user details.
    Requires admin privileges.
    """
    try:
        # Check if event exists
        event = await supabase_service.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Get bookings for this event
        filters = {"event_id": event_id}
        bookings, total = await supabase_service.get_bookings(filters, limit=100, offset=0)
        
        return {
            "event": {
                "id": event.id,
                "name": event.name,
                "destination": event.destination,
                "start_date": event.start_date,
                "end_date": event.end_date,
                "max_capacity": event.max_capacity,
                "current_bookings": event.current_bookings
            },
            "bookings": bookings,
            "total_bookings": total
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch event bookings: {str(e)}"
        )


@router.post(
    "/{event_id}/toggle-status",
    response_model=Event,
    tags=["Events"],
    summary="Toggle Event Status",
    description="Activate or deactivate an event (Admin only)"
)
async def toggle_event_status(
    event_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Toggle event active status (activate/deactivate).
    
    - **event_id**: UUID of the event
    
    Toggles the is_active flag of the event.
    Requires admin privileges.
    """
    try:
        # Check if event exists
        event = await supabase_service.get_event_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Toggle status
        new_status = not event.is_active
        update_data = {"is_active": new_status}
        
        updated_event = await supabase_service.update_event(event_id, update_data)
        
        return updated_event
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle event status: {str(e)}"
        )