"""
Bookings/Tickets routes for SafarSaga API
"""

import logging
from fastapi import APIRouter, HTTPException, Depends, status, Query, Response,Body
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, timezone

from app.models import (
    Booking, BookingCreate, BookingUpdate, BookingStatus, PaymentStatus,
    PaginatedResponse, User, Event, Destination, BookingBusinessRules
)
from app.validators import DestinationBookingValidator
from pydantic import BaseModel
from app.middleware.auth import get_current_user, get_admin_user
from app.services.supabase_service import SupabaseService
from app.exceptions import (
    NotFoundException, 
    ValidationException, 
    BusinessLogicException,
    CapacityException,
    ConflictException,
    AuthorizationException
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
        
        # Calculate package booking amount (no duration multiplier)
        total_amount = DestinationBookingValidator.calculate_package_booking_amount(
            destination, 
            booking_data.seats
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
        
        # Prepare create data with proper validation and conversion
        create_data = {
            "user_id": current_user.id,
            "destination_id": booking_data.destination_id,
            "seats": booking_data.seats,
            "total_amount": float(total_amount),
            "special_requests": booking_data.special_requests,
            "contact_info": booking_data.contact_info.model_dump() if booking_data.contact_info else None,
            "travel_date": travel_date_iso,
            "booking_status": BookingStatus.PENDING.value,
            "payment_status": PaymentStatus.UNPAID.value
        }
        
        # Apply data validation and conversion before creating booking
        validated_data = supabase_service._validate_and_convert_booking_data(create_data)
        
        # Create destination booking
        booking = await supabase_service.create_destination_booking(validated_data)
        
        return booking
        
    except (ValidationException, BusinessLogicException, CapacityException, ConflictException, NotFoundException):
        # Let these propagate to global exception handler
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_booking: {str(e)}")
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


@router.post(
    "/{booking_id}/confirm-payment",
    tags=["Bookings"],
    summary="Confirm Payment for a Booking",
    description="Confirms a booking's payment. Users can confirm their own bookings, while admins can confirm any booking."
)
async def confirm_payment(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    transaction_id: str = Body(..., embed=True, description="The payment transaction ID"),
    payment_method: str = Body("UPI", embed=True, description="The payment method used (e.g., UPI, Card)")
):
    """
    Confirm payment for a booking.

    - **booking_id**: UUID of the booking
    - **transaction_id**: Payment transaction ID
    - **payment_method**: Payment method used

    **Access Control:**
    - Users can confirm payment for their own bookings.
    - Admins can confirm payment for any booking.

    Updates booking and payment status upon successful confirmation.
    """
    try:
        booking = await supabase_service.get_booking_by_id(booking_id)

        if not booking:
            raise NotFoundException("Booking", booking_id)

        # 🔒 Check access permissions
        if not current_user.is_admin and booking.user_id != current_user.id:
            raise AuthorizationException("Access denied: You can only confirm payment for your own bookings.")

        # Check if payment already confirmed
        if booking.payment_status == PaymentStatus.PAID:
            raise BusinessLogicException("Payment has already been confirmed for this booking.", "payment_confirmed")

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
            "booking": updated_booking
        }

    except (ValidationException, BusinessLogicException, AuthorizationException) as e:
        # Let the global exception handler manage these specific errors
        raise e
    except HTTPException:
        # Re-raise known HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Failed to confirm payment for booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while confirming the payment."
        )
    

class RejectPaymentRequest(BaseModel):
    """Request model for rejecting payment"""
    reason: str


@router.post(
    "/{booking_id}/reject-payment",
    tags=["Admin"],
    summary="Reject Payment",
    description="Reject payment for a booking (Admin only)",
    status_code=status.HTTP_200_OK
)
async def reject_payment(
    booking_id: str,
    request: RejectPaymentRequest,
    current_user: User = Depends(get_admin_user)
):
    """
    Reject payment for a booking.
    
    - **booking_id**: UUID of the booking
    - **reason**: Reason for rejection
    
    **Admin Only**: Requires admin privileges.
    
    **Actions:**
    - Cancels the booking
    - Adds rejection reason to special_requests
    """
    try:
        # Get existing booking
        existing_booking = await supabase_service.get_booking_by_id(booking_id)
        if not existing_booking:
            raise NotFoundException("Booking", booking_id)
        
        # Update booking with rejection
        rejection_note = f"Payment rejected by admin: {request.reason}"
        existing_requests = existing_booking.special_requests or ""
        
        update_data = {
            "booking_status": BookingStatus.CANCELLED.value,
            "special_requests": f"{existing_requests}\n{rejection_note}".strip()
        }
        
        updated_booking = await supabase_service.update_booking(booking_id, update_data)
        
        return {"message": "Payment rejected successfully", "booking": updated_booking}
        
    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting payment for booking {booking_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject payment: {str(e)}"
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


# Removed redundant /stats/summary endpoint - use /admin/stats instead
# The /admin/stats endpoint uses efficient PostgreSQL RPC function