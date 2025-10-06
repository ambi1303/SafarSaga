"""
Bookings/Tickets routes for SafarSaga API
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status, Query, Response
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timezone

from app.models import (
    Booking, BookingCreate, BookingUpdate, BookingStatus, PaymentStatus,
    PaginatedResponse, User, Event, Destination
)
from pydantic import BaseModel
from app.middleware.auth import get_current_user, get_admin_user
from app.services.supabase_service import SupabaseService
from app.exceptions import (
    NotFoundException, 
    ValidationException, 
    BusinessLogicException,
    CapacityException,
    ConflictException
)
# Using consolidated exceptions instead of booking_errors
# from app.booking_errors import (...) - removed to use unified exceptions

router = APIRouter()
supabase_service = SupabaseService()
logger = logging.getLogger(__name__)


class BookingStats(BaseModel):
    """Booking statistics model"""
    total_bookings: int
    upcoming_trips: int
    completed_trips: int
    total_spent: float
    pending_bookings: int
    cancelled_bookings: int
    average_booking_amount: float
    most_recent_booking: Optional[dict] = None


class AdminBookingStats(BaseModel):
    """Admin booking statistics model"""
    total_bookings: int
    total_revenue: float
    pending_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    bookings_by_month: List[dict]
    top_destinations: List[dict]


@router.get(
    "/",
    response_model=PaginatedResponse,
    tags=["Bookings"],
    summary="List Bookings",
    description="Get list of bookings with filtering and pagination"
)
async def get_bookings(
    user_id: Optional[str] = Query(None, description="Filter by user ID (admin only)"),
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    booking_status: Optional[BookingStatus] = Query(None, description="Filter by booking status"),
    payment_status: Optional[PaymentStatus] = Query(None, description="Filter by payment status"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Offset from start"),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of bookings with optional filtering.
    
    **For regular users:**
    - Only shows their own bookings
    - Cannot filter by user_id
    
    **For admins:**
    - Can see all bookings
    - Can filter by any user_id
    
    **Filters:**
    - **user_id**: Filter by specific user (admin only)
    - **event_id**: Filter by specific event
    - **booking_status**: pending, confirmed, cancelled
    - **payment_status**: unpaid, paid, refunded
    
    **Pagination:**
    - **limit**: Items per page (1-100, default: 20)
    - **offset**: Skip items (default: 0)
    """
    try:
        # Build filters
        filters = {}
        
        # Non-admin users can only see their own bookings
        if not current_user.is_admin:
            filters["user_id"] = current_user.id
        elif user_id:
            # Admin can filter by specific user
            filters["user_id"] = user_id
        
        if event_id:
            filters["event_id"] = event_id
        if booking_status:
            filters["booking_status"] = booking_status.value
        if payment_status:
            filters["payment_status"] = payment_status.value
        
        # Get bookings from database
        bookings, total = await supabase_service.get_bookings(filters, limit, offset)
        
        # Calculate pagination metadata
        has_next = offset + limit < total
        has_prev = offset > 0
        
        return PaginatedResponse(
            items=bookings,
            total=total,
            limit=limit,
            offset=offset,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookings: {str(e)}"
        )


@router.get(
    "/stats",
    response_model=BookingStats,
    tags=["Bookings"],
    summary="Get User Booking Statistics",
    description="Get optimized booking statistics for the current user"
)
async def get_user_booking_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive booking statistics for the current user.
    
    This endpoint uses database-level aggregation for optimal performance.
    All calculations are performed in PostgreSQL using a custom function.
    
    **Returns:**
    - **total_bookings**: Total number of bookings
    - **upcoming_trips**: Confirmed bookings with future travel dates
    - **completed_trips**: Confirmed bookings with past travel dates
    - **total_spent**: Total amount spent on paid bookings
    - **pending_bookings**: Number of pending bookings
    - **cancelled_bookings**: Number of cancelled bookings
    - **average_booking_amount**: Average amount per paid booking
    - **most_recent_booking**: Details of the most recent booking
    """
    try:
        def _get_user_stats():
            # Use PostgreSQL function for efficient aggregation
            response = supabase_service._get_client().rpc(
                'get_user_booking_stats', 
                {'user_uuid': current_user.id}
            ).execute()
            return response.data
        
        stats_data = await supabase_service._run_sync(_get_user_stats)
        
        if not stats_data:
            # Return default stats if no data
            return BookingStats(
                total_bookings=0,
                upcoming_trips=0,
                completed_trips=0,
                total_spent=0.0,
                pending_bookings=0,
                cancelled_bookings=0,
                average_booking_amount=0.0,
                most_recent_booking=None
            )
        
        # Convert to BookingStats model
        return BookingStats(
            total_bookings=stats_data.get('total_bookings', 0),
            upcoming_trips=stats_data.get('upcoming_trips', 0),
            completed_trips=stats_data.get('completed_trips', 0),
            total_spent=float(stats_data.get('total_spent', 0)),
            pending_bookings=stats_data.get('pending_bookings', 0),
            cancelled_bookings=stats_data.get('cancelled_bookings', 0),
            average_booking_amount=float(stats_data.get('average_booking_amount', 0)),
            most_recent_booking=stats_data.get('most_recent_booking')
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch booking statistics: {str(e)}"
        )


@router.get(
    "/admin/stats",
    response_model=AdminBookingStats,
    tags=["Admin"],
    summary="Get Admin Booking Statistics",
    description="Get comprehensive booking statistics for administrators"
)
async def get_admin_booking_stats(
    current_user: User = Depends(get_admin_user)
):
    """
    Get comprehensive booking statistics for administrators.
    
    This endpoint uses database-level aggregation for optimal performance.
    All calculations are performed in PostgreSQL using a custom function.
    
    **Admin Only**: Requires admin privileges.
    
    **Returns:**
    - **total_bookings**: Total bookings across all users
    - **total_revenue**: Total revenue from paid bookings
    - **pending_bookings**: Number of pending bookings
    - **confirmed_bookings**: Number of confirmed bookings
    - **cancelled_bookings**: Number of cancelled bookings
    - **bookings_by_month**: Monthly booking trends (last 12 months)
    - **top_destinations**: Most popular destinations by booking count
    """
    try:
        def _get_admin_stats():
            # Use PostgreSQL function for efficient aggregation
            response = supabase_service._get_client().rpc('get_admin_booking_stats').execute()
            return response.data
        
        stats_data = await supabase_service._run_sync(_get_admin_stats)
        
        if not stats_data:
            # Return default stats if no data
            return AdminBookingStats(
                total_bookings=0,
                total_revenue=0.0,
                pending_bookings=0,
                confirmed_bookings=0,
                cancelled_bookings=0,
                bookings_by_month=[],
                top_destinations=[]
            )
        
        # Convert to AdminBookingStats model
        return AdminBookingStats(
            total_bookings=stats_data.get('total_bookings', 0),
            total_revenue=float(stats_data.get('total_revenue', 0)),
            pending_bookings=stats_data.get('pending_bookings', 0),
            confirmed_bookings=stats_data.get('confirmed_bookings', 0),
            cancelled_bookings=stats_data.get('cancelled_bookings', 0),
            bookings_by_month=stats_data.get('bookings_by_month', []),
            top_destinations=stats_data.get('top_destinations', [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin booking statistics: {str(e)}"
        )


@router.get(
    "/{booking_id}",
    response_model=Booking,
    tags=["Bookings"],
    summary="Get Booking",
    description="Get specific booking by ID"
)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get specific booking by ID.
    
    - **booking_id**: UUID of the booking
    
    **Access Control:**
    - Users can only view their own bookings
    - Admins can view any booking
    
    Returns complete booking details including user and event information.
    """
    try:
        booking = await supabase_service.get_booking_by_id(booking_id)
        
        if not booking:
            raise NotFoundException("Booking", booking_id)
        
        # Check access permissions
        if not current_user.is_admin and booking.user_id != current_user.id:
            from app.exceptions import AuthorizationException
            raise AuthorizationException("Access denied: You can only view your own bookings")
        
        return booking
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch booking: {str(e)}"
        )


@router.post(
    "/",
    response_model=Booking,
    tags=["Bookings"],
    summary="Create Booking",
    description="Create new booking for an event",
    status_code=status.HTTP_201_CREATED
)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new booking for an event.
    
    **Required fields:**
    - **event_id**: UUID of the event to book
    - **seats**: Number of seats to book (1-10)
    
    **Optional fields:**
    - **special_requests**: Any special requests or notes
    
    **Business Rules:**
    - Event must be active and available
    - Event must not have started
    - Sufficient seats must be available
    - User cannot have duplicate pending/confirmed bookings for same event
    
    Returns created booking with payment information.
    """

    try:
        # Import validation functions from models
        from app.models import BookingBusinessRules
        
        # Get destination details
        destination = await supabase_service.get_destination_by_id(booking_data.destination_id)
        
        if not destination:
            raise NotFoundException("Destination", booking_data.destination_id)
        
        # Validate destination exists and is active
        if not destination.is_active:
            raise BusinessLogicException(
                "This destination is currently not available for booking",
                "destination_inactive"
            )
        
        # 🔒 SAFETY: Ensure seats is integer before calculation (double-check)
        seats_for_calculation = booking_data.seats
        if isinstance(seats_for_calculation, str):
            try:
                seats_for_calculation = int(seats_for_calculation.strip())
            except (ValueError, AttributeError):
                raise ValidationException(
                    f"Invalid seat count: '{seats_for_calculation}' is not a valid number",
                    field="seats",
                    value=seats_for_calculation
                )
        elif isinstance(seats_for_calculation, float):
            if seats_for_calculation.is_integer():
                seats_for_calculation = int(seats_for_calculation)
            else:
                raise ValidationException(
                    f"Seat count must be a whole number: {seats_for_calculation}",
                    field="seats",
                    value=seats_for_calculation
                )
        
        # Calculate booking amount (with safely converted seats)
        duration_days = 3  # Default duration for destination bookings
        total_amount = BookingBusinessRules.calculate_booking_amount(
            destination.average_cost_per_day, 
            seats_for_calculation, 
            duration_days
        )
        
        # Check for duplicate bookings only if travel date is specified
        if booking_data.travel_date:
            existing_filters = {
                "user_id": current_user.id,
                "destination_id": booking_data.destination_id
            }
            existing_bookings, _ = await supabase_service.get_bookings(existing_filters, limit=50, offset=0)
            
            # Parse the requested travel date for comparison
            try:
                requested_date = datetime.fromisoformat(booking_data.travel_date.replace('Z', '+00:00')).date()
                
                # Check if user has pending or confirmed booking for this destination on the same date
                same_date_bookings = []
                for booking in existing_bookings:
                    if booking.booking_status in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
                        if booking.travel_date:
                            try:
                                existing_date = datetime.fromisoformat(booking.travel_date.replace('Z', '+00:00')).date()
                                if existing_date == requested_date:
                                    same_date_bookings.append(booking)
                            except (ValueError, AttributeError):
                                # Skip bookings with invalid dates
                                continue
                
                if same_date_bookings:
                    raise ConflictException(f"You already have a booking for {destination.name} on {requested_date.strftime('%B %d, %Y')}. Please choose a different date.")
                    
            except ValueError:
                # If travel date parsing fails, allow the booking (date validation will happen elsewhere)
                pass
        
        # Note: Users can now book the same destination multiple times for different dates
        
        # Prepare booking data for destination booking
        travel_date_iso = None
        if booking_data.travel_date:
            try:
                travel_date_iso = datetime.fromisoformat(booking_data.travel_date.replace('Z', '+00:00')).isoformat()
            except ValueError:
                travel_date_iso = booking_data.travel_date
        
        # Enhanced validation with detailed logging and error handling
        print(f"DEBUG - Incoming booking_data.seats: {booking_data.seats} (type: {type(booking_data.seats)})")
        
        # Robust seats validation with comprehensive error handling
        try:
            seats_value = booking_data.seats
            
            # Handle different input types
            if isinstance(seats_value, str):
                # Handle string conversion with detailed validation
                seats_value = seats_value.strip()
                
                # Check for empty string
                if not seats_value:
                    raise ValidationException(
                        "Seat count cannot be empty", 
                        field="seats", 
                        value=booking_data.seats
                    )
                
                # Check for non-numeric strings
                if not seats_value.isdigit():
                    # Check for common invalid inputs
                    if seats_value.lower() in ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']:
                        raise ValidationException(
                            f"Please enter seat count as a number, not as text: '{seats_value}'",
                            field="seats",
                            value=seats_value
                        )
                    elif '.' in seats_value:
                        raise ValidationException(
                            f"Seat count must be a whole number, not a decimal: '{seats_value}'",
                            field="seats",
                            value=seats_value
                        )
                    else:
                        raise ValidationException(
                            f"Invalid seat count: '{seats_value}' is not a valid number",
                            field="seats",
                            value=seats_value
                        )
                
                # Convert to integer
                seats_int = int(seats_value)
                
            elif isinstance(seats_value, float):
                # Handle float conversion
                if not seats_value.is_integer():
                    raise ValidationException(
                        f"Seat count must be a whole number, not a decimal: {seats_value}",
                        field="seats",
                        value=seats_value
                    )
                seats_int = int(seats_value)
                
            elif isinstance(seats_value, int):
                # Already an integer
                seats_int = seats_value
                
            else:
                # Unsupported type
                raise ValidationException(
                    f"Invalid seat count data type: {type(seats_value).__name__}. Expected number.",
                    field="seats",
                    value=str(seats_value)
                )
            
            # Validate seats range with specific error messages
            if seats_int < 1:
                raise ValidationException(
                    f"Number of seats must be at least 1, got: {seats_int}",
                    field="seats",
                    value=seats_int
                )
            elif seats_int > 10:
                raise ValidationException(
                    f"Number of seats cannot exceed 10, got: {seats_int}",
                    field="seats",
                    value=seats_int
                )
                
        except ValidationException:
            # Re-raise ValidationException as-is
            raise
        except (ValueError, TypeError) as e:
            # Handle unexpected conversion errors
            raise ValidationException(
                f"Failed to process seat count: {str(e)}",
                field="seats",
                value=str(booking_data.seats)
            )
        
        print(f"DEBUG - Successfully converted seats: {seats_int} (type: {type(seats_int)})")
        
        # Validate and convert total_amount
        try:
            total_amount_float = float(total_amount)
            if total_amount_float < 0:
                raise ValidationException(
                    f"Total amount cannot be negative: {total_amount_float}",
                    field="total_amount",
                    value=total_amount_float
                )
            elif total_amount_float == 0:
                raise ValidationException(
                    "Total amount cannot be zero. Please check destination pricing.",
                    field="total_amount",
                    value=total_amount_float
                )
        except (ValueError, TypeError) as e:
            raise ValidationException(
                f"Invalid total amount calculation: {str(e)}",
                field="total_amount",
                value=str(total_amount)
            )
        
        # Validate contact info if provided
        if booking_data.contact_info:
            contact_info = booking_data.contact_info
            
            # Validate phone number
            if not contact_info.phone or not contact_info.phone.strip():
                raise ValidationException(
                    "Phone number is required",
                    field="contact_info.phone",
                    value=contact_info.phone
                )
            
            # Basic phone number format validation
            phone_digits = contact_info.phone.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
            if not phone_digits.isdigit():
                raise ValidationException(
                    "Phone number must contain only digits, spaces, hyphens, parentheses, and plus sign",
                    field="contact_info.phone",
                    value=contact_info.phone
                )
            
            if len(phone_digits) < 10 or len(phone_digits) > 15:
                raise ValidationException(
                    f"Phone number must be between 10 and 15 digits, got {len(phone_digits)} digits",
                    field="contact_info.phone",
                    value=contact_info.phone
                )
        
        create_data = {
            "user_id": current_user.id,
            "destination_id": booking_data.destination_id,
            "seats": seats_int,  # Use the safely converted integer
            "total_amount": total_amount_float,  # Use the validated float
            "special_requests": booking_data.special_requests,
            "contact_info": booking_data.contact_info.model_dump() if booking_data.contact_info else None,
            "travel_date": travel_date_iso,
            "booking_status": BookingStatus.PENDING.value,
            "payment_status": PaymentStatus.UNPAID.value
        }
        
        print(f"DEBUG - Final create_data validation:")
        print(f"  - seats: {create_data['seats']} (type: {type(create_data['seats'])})")
        print(f"  - total_amount: {create_data['total_amount']} (type: {type(create_data['total_amount'])})")
        print(f"  - destination_id: {create_data['destination_id']} (type: {type(create_data['destination_id'])})")
        
        # Create destination booking
        booking = await supabase_service.create_destination_booking(create_data)
        
        return booking
        
    except ValidationException as e:
        # ValidationException should propagate to global exception handler
        # Log the validation error for debugging
        print(f"DEBUG - ValidationException caught: {e.message}")
        print(f"  - Field: {e.details.get('field', 'unknown')}")
        print(f"  - Value: {e.details.get('value', 'unknown')}")
        raise e
    except (BusinessLogicException, CapacityException) as e:
        # These should also propagate to global exception handler
        print(f"DEBUG - Business/Capacity Exception caught: {str(e)}")
        raise e
    except Exception as e:
        # Log unexpected errors with more context
        print(f"DEBUG - Unexpected error in create_booking: {str(e)}")
        print(f"  - Error type: {type(e).__name__}")
        import traceback
        print(f"  - Traceback: {traceback.format_exc()}")
        
        # Convert to a more specific exception if possible
        error_message = str(e).lower()
        if "integer" in error_message and "str" in error_message:
            raise ValidationException(
                "Data type conversion error. Please ensure all numeric fields contain valid numbers.",
                field="data_conversion",
                value=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create booking: {str(e)}"
            )


@router.put(
    "/{booking_id}",
    response_model=Booking,
    tags=["Bookings"],
    summary="Update Booking",
    description="Update booking details"
)
async def update_booking(
    booking_id: str,
    booking_data: BookingUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update booking details.
    
    - **booking_id**: UUID of the booking to update
    
    **User permissions:**
    - Users can only update their own bookings
    - Users can only update special_requests
    
    **Admin permissions:**
    - Admins can update any booking
    - Admins can update status, payment info, etc.
    
    **Business Rules:**
    - Cannot modify confirmed bookings (except by admin)
    - Cannot modify bookings for events that have started
    """
    try:
        # Get existing booking
        existing_booking = await supabase_service.get_booking_by_id(booking_id)
        if not existing_booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check access permissions
        if not current_user.is_admin and existing_booking.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only update your own bookings"
            )
        
        # Get event details for validation
        event = await supabase_service.get_event_by_id(existing_booking.event_id)
        if event and event.start_date and event.start_date <= datetime.now(timezone.utc):
            raise BusinessLogicException("Cannot modify booking for event that has started", "event_started")
        
        # Prepare update data based on user role
        update_data = {}
        
        if current_user.is_admin:
            # Admin can update any field
            update_data = booking_data.dict(exclude_unset=True, exclude_none=True)
            
            # If confirming booking, update payment confirmation time
            if (booking_data.booking_status == BookingStatus.CONFIRMED and 
                existing_booking.booking_status != BookingStatus.CONFIRMED):
                update_data["payment_confirmed_at"] = datetime.now(timezone.utc).isoformat()
        else:
            # Regular users can only update special requests
            if booking_data.special_requests is not None:
                update_data["special_requests"] = booking_data.special_requests
            
            # Users cannot modify confirmed bookings
            if existing_booking.booking_status == BookingStatus.CONFIRMED:
                raise BusinessLogicException("Cannot modify confirmed booking", "booking_confirmed")
        
        if not update_data:
            raise ValidationException("No valid fields to update")
        
        # Update booking
        updated_booking = await supabase_service.update_booking(booking_id, update_data)
        
        return updated_booking
        
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
            detail=f"Failed to update booking: {str(e)}"
        )


@router.delete(
    "/{booking_id}",
    tags=["Bookings"],
    summary="Cancel Booking",
    description="Cancel a booking",
    status_code=status.HTTP_204_NO_CONTENT
)
async def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a booking.
    
    - **booking_id**: UUID of the booking to cancel
    
    **Access Control:**
    - Users can cancel their own bookings
    - Admins can cancel any booking
    
    **Business Rules:**
    - Cannot cancel bookings for events that have started
    - Confirmed bookings may have cancellation policies
    - Refund processing depends on payment status
    """
    try:
        # Get existing booking
        existing_booking = await supabase_service.get_booking_by_id(booking_id)
        if not existing_booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        # Check access permissions
        if not current_user.is_admin and existing_booking.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only cancel your own bookings"
            )
        # Check if already cancelled
        if existing_booking.booking_status == BookingStatus.CANCELLED:
            raise BusinessLogicException("Booking is already cancelled", "already_cancelled")
        
        # Gracefully handle potentially missing event references
        event = None
        event_id = getattr(existing_booking, 'event_id', None)
        
        if event_id:
            try:
                event = await supabase_service.get_event_by_id(event_id)
            except Exception as e:
                # Log the data inconsistency but don't block cancellation
                logger.warning(
                    f"Could not fetch event {event_id} during booking cancellation: {str(e)}",
                    extra={
                        "booking_id": booking_id,
                        "event_id": event_id,
                        "operation": "cancel_booking",
                        "user_id": current_user.id
                    }
                )
                event = None
        
        # Perform event-related validations only if event exists
        if event and getattr(event, 'start_date', None):
            if event.start_date <= datetime.now(timezone.utc):
                raise BusinessLogicException("Cannot cancel booking for event that has started", "event_started")
        
        # Update booking status to cancelled
        update_data = {
            "booking_status": BookingStatus.CANCELLED.value
        }
        
        # If payment was made, mark for refund processing
        if existing_booking.payment_status == PaymentStatus.PAID:
            update_data["payment_status"] = PaymentStatus.REFUNDED.value
        
        await supabase_service.update_booking(booking_id, update_data)
        
        # Return proper HTTP 204 response with no body (compliant with RFC standards)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
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
            detail=f"Failed to cancel booking: {str(e)}"
        )


@router.get(
    "/{booking_id}/payment-info",
    tags=["Bookings"],
    summary="Get Payment Information",
    description="Get payment information for a booking"
)
async def get_payment_info(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get payment information for a booking.
    
    - **booking_id**: UUID of the booking
    
    Returns payment details including amount, status, and payment methods.
    """
    try:
        booking = await supabase_service.get_booking_by_id(booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check access permissions
        if not current_user.is_admin and booking.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Prepare booking item info (destination or event)
        booking_item = {}
        if booking.destination:
            booking_item = {
                "id": booking.destination.id,
                "name": booking.destination.name,
                "location": f"{booking.destination.name}, {booking.destination.state}",
                "type": "destination"
            }
        elif booking.event:
            booking_item = {
                "id": booking.event.id,
                "name": booking.event.name,
                "location": booking.event.destination,
                "type": "event"
            }
        
        return {
            "booking_id": booking.id,
            "total_amount": booking.total_amount,
            "payment_status": booking.payment_status,
            "payment_method": booking.payment_method,
            "transaction_id": booking.transaction_id,
            "upi_qr_code": booking.upi_qr_code,
            "payment_confirmed_at": booking.payment_confirmed_at,
            "currency": "INR",
            "booking_item": booking_item,
            # Legacy fields for backward compatibility
            "event": booking_item if booking_item.get("type") == "event" else None,
            "destination": booking_item if booking_item.get("type") == "destination" else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment info: {str(e)}"
        )


@router.post(
    "/{booking_id}/confirm-payment",
    tags=["Bookings"],
    summary="Confirm Payment",
    description="Confirm payment for a booking"
)
async def confirm_payment(
    booking_id: str,
    payment_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Confirm payment for a booking.
    
    - **booking_id**: UUID of the booking
    - **transaction_id**: Payment transaction ID
    - **payment_method**: Payment method used (UPI, Card, etc.)
    
    **Access Control:**
    - Users can confirm payment for their own bookings
    - Admins can confirm payment for any booking
    
    Updates booking and payment status upon successful confirmation.
    """
    try:
        booking = await supabase_service.get_booking_by_id(booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Check access permissions
        if not current_user.is_admin and booking.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Validate payment data
        transaction_id = payment_data.get("transaction_id")
        payment_method = payment_data.get("payment_method", "UPI")
        
        if not transaction_id:
            raise ValidationException("Transaction ID is required")
        
        # Check if payment already confirmed
        if booking.payment_status == PaymentStatus.PAID:
            raise BusinessLogicException("Payment already confirmed", "payment_confirmed")
        
        # Update booking with payment confirmation
        update_data = {
            "payment_status": PaymentStatus.PAID.value,
            "booking_status": BookingStatus.CONFIRMED.value,
            "transaction_id": transaction_id,
            "payment_method": payment_method,
            "payment_confirmed_at": datetime.now(timezone.utc).isoformat()
        }
        
        updated_booking = await supabase_service.update_booking(booking_id, update_data)
        
        return {
            "message": "Payment confirmed successfully",
            "booking": updated_booking,
            "payment_status": "confirmed",
            "transaction_id": transaction_id
        }
        
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
            detail=f"Failed to confirm payment: {str(e)}"
        )


@router.get(
    "/user/{user_id}",
    response_model=PaginatedResponse,
    tags=["Bookings"],
    summary="Get User Bookings",
    description="Get all bookings for a specific user (Admin only)"
)
async def get_user_bookings(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_admin_user)
):
    """
    Get all bookings for a specific user.
    
    - **user_id**: UUID of the user
    
    Returns paginated list of user's bookings with event details.
    Requires admin privileges.
    """
    try:
        filters = {"user_id": user_id}
        bookings, total = await supabase_service.get_bookings(filters, limit, offset)
        
        has_next = offset + limit < total
        has_prev = offset > 0
        
        return PaginatedResponse(
            items=bookings,
            total=total,
            limit=limit,
            offset=offset,
            has_next=has_next,
            has_prev=has_prev
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user bookings: {str(e)}"
        )


@router.get(
    "/stats/summary",
    tags=["Bookings"],
    summary="Get Booking Statistics",
    description="Get booking statistics and metrics (Admin only)"
)
async def get_booking_stats(current_user: User = Depends(get_admin_user)):
    """
    Get comprehensive booking statistics and metrics.
    
    Returns:
    - Total bookings by status
    - Revenue metrics
    - Popular events
    - Recent booking trends
    
    Requires admin privileges.
    """
    try:
        # Get all bookings for statistics
        all_bookings, total = await supabase_service.get_bookings({}, limit=1000, offset=0)
        
        # Calculate statistics
        stats = {
            "total_bookings": total,
            "pending_bookings": len([b for b in all_bookings if b.booking_status == BookingStatus.PENDING]),
            "confirmed_bookings": len([b for b in all_bookings if b.booking_status == BookingStatus.CONFIRMED]),
            "cancelled_bookings": len([b for b in all_bookings if b.booking_status == BookingStatus.CANCELLED]),
            "paid_bookings": len([b for b in all_bookings if b.payment_status == PaymentStatus.PAID]),
            "unpaid_bookings": len([b for b in all_bookings if b.payment_status == PaymentStatus.UNPAID]),
            "total_revenue": sum([float(b.total_amount) for b in all_bookings if b.payment_status == PaymentStatus.PAID]),
            "average_booking_value": 0,
            "total_seats_booked": sum([b.seats for b in all_bookings if b.booking_status == BookingStatus.CONFIRMED])
        }
        
        # Calculate average booking value
        paid_bookings = [b for b in all_bookings if b.payment_status == PaymentStatus.PAID]
        if paid_bookings:
            stats["average_booking_value"] = stats["total_revenue"] / len(paid_bookings)
        
        # Event popularity (top 5)
        event_bookings = {}
        for booking in all_bookings:
            if booking.event and booking.booking_status == BookingStatus.CONFIRMED:
                event_id = booking.event.id
                if event_id not in event_bookings:
                    event_bookings[event_id] = {
                        "event_name": booking.event.name,
                        "destination": booking.event.destination,
                        "bookings": 0,
                        "seats": 0
                    }
                event_bookings[event_id]["bookings"] += 1
                event_bookings[event_id]["seats"] += booking.seats
        
        popular_events = sorted(
            event_bookings.values(), 
            key=lambda x: x["bookings"], 
            reverse=True
        )[:5]
        
        stats["popular_events"] = popular_events
        
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch booking statistics: {str(e)}"
        )