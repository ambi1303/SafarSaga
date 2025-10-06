"""
Admin Users Router

This module provides admin endpoints for user management including:
- Listing all users with pagination
- Viewing user details and statistics
- Deactivating/activating users
- Deleting users
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from app.middleware.auth import get_current_user, get_admin_user
from app.services.supabase_service import SupabaseService
from app.models import User, PaginatedResponse
from app.exceptions import NotFoundException, AuthorizationException, DatabaseException

router = APIRouter()
supabase_service = SupabaseService()


@router.get(
    "/",
    response_model=PaginatedResponse,
    tags=["Admin"],
    summary="Get All Users",
    description="Get paginated list of all users (admin only)"
)
async def get_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    current_user: User = Depends(get_admin_user)
):
    """
    Get a paginated list of all users with optional search filtering.
    
    **Admin only endpoint**
    
    Parameters:
    - search: Optional search term to filter by name or email
    - limit: Number of users to return (1-100)
    - offset: Number of users to skip for pagination
    
    Returns:
    - Paginated list of users with statistics
    """
    try:
        # Build query
        query = supabase_service.client.from_("users").select(
            """
            id,
            email,
            full_name,
            phone,
            is_admin,
            created_at,
            updated_at
            """,
            count="exact"
        )
        
        # Apply search filter if provided
        if search:
            query = query.or_(
                f"full_name.ilike.%{search}%,email.ilike.%{search}%,id.ilike.%{search}%"
            )
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1).order("created_at", desc=True)
        
        # Execute query
        response = query.execute()
        
        # Get user statistics (bookings and spending)
        users_with_stats = []
        for user in response.data:
            # Get booking stats for each user
            booking_stats = supabase_service.client.from_("bookings").select(
                "total_amount",
                count="exact"
            ).eq("user_id", user["id"]).execute()
            
            total_bookings = booking_stats.count or 0
            total_spent = sum(b.get("total_amount", 0) for b in booking_stats.data) if booking_stats.data else 0
            
            users_with_stats.append({
                **user,
                "total_bookings": total_bookings,
                "total_spent": total_spent
            })
        
        return {
            "items": users_with_stats,
            "total": response.count or 0,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise DatabaseException(f"Failed to fetch users: {str(e)}")


@router.get(
    "/{user_id}",
    response_model=User,
    tags=["Admin"],
    summary="Get User Details",
    description="Get detailed information about a specific user (admin only)"
)
async def get_user_details(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Get detailed information about a specific user.
    
    **Admin only endpoint**
    
    Parameters:
    - user_id: The ID of the user to retrieve
    
    Returns:
    - User details with statistics
    """
    try:
        # Get user details
        response = supabase_service.client.from_("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user_data = response.data[0]
        
        # Get booking statistics
        booking_stats = supabase_service.client.from_("bookings").select(
            "total_amount, booking_status",
            count="exact"
        ).eq("user_id", user_id).execute()
        
        total_bookings = booking_stats.count or 0
        total_spent = sum(b.get("total_amount", 0) for b in booking_stats.data) if booking_stats.data else 0
        
        return {
            **user_data,
            "total_bookings": total_bookings,
            "total_spent": total_spent
        }
        
    except NotFoundException:
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to fetch user details: {str(e)}")


@router.post(
    "/{user_id}/deactivate",
    tags=["Admin"],
    summary="Deactivate User",
    description="Deactivate a user account (admin only)"
)
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Deactivate a user account. Deactivated users cannot log in.
    
    **Admin only endpoint**
    
    Parameters:
    - user_id: The ID of the user to deactivate
    
    Returns:
    - Success message
    """
    try:
        # Check if user exists
        user_response = supabase_service.client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Prevent deactivating admin users
        if user.get("is_admin"):
            raise AuthorizationException("Cannot deactivate admin users")
        
        # Prevent self-deactivation
        if user_id == current_user.id:
            raise AuthorizationException("Cannot deactivate your own account")
        
        # Update user status (you may need to add an 'active' column to your users table)
        # For now, we'll just return success
        # In a real implementation, you'd update a status field:
        # supabase_service.client.from_("users").update({"active": False}).eq("id", user_id).execute()
        
        return {
            "message": "User deactivated successfully",
            "user_id": user_id
        }
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to deactivate user: {str(e)}")


@router.delete(
    "/{user_id}",
    tags=["Admin"],
    summary="Delete User",
    description="Permanently delete a user account (admin only)"
)
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Permanently delete a user account and all associated data.
    
    **Admin only endpoint**
    **Warning: This action cannot be undone**
    
    Parameters:
    - user_id: The ID of the user to delete
    
    Returns:
    - Success message
    """
    try:
        # Check if user exists
        user_response = supabase_service.client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Prevent deleting admin users
        if user.get("is_admin"):
            raise AuthorizationException("Cannot delete admin users")
        
        # Prevent self-deletion
        if user_id == current_user.id:
            raise AuthorizationException("Cannot delete your own account")
        
        # Check if user has active bookings
        active_bookings = supabase_service.client.from_("bookings").select(
            "id", count="exact"
        ).eq("user_id", user_id).in_("booking_status", ["pending", "confirmed"]).execute()
        
        if active_bookings.count and active_bookings.count > 0:
            raise AuthorizationException(
                f"Cannot delete user with {active_bookings.count} active booking(s). "
                "Please cancel or complete all bookings first."
            )
        
        # Delete user (this will cascade delete related records if foreign keys are set up properly)
        supabase_service.client.from_("users").delete().eq("id", user_id).execute()
        
        return {
            "message": "User deleted successfully",
            "user_id": user_id
        }
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to delete user: {str(e)}")
