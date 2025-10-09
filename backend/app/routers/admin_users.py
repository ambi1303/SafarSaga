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
from app.exceptions import NotFoundException, AuthorizationException, DatabaseException, ConflictException

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
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Use RPC to get users with stats in a single efficient query (solves N+1 problem)
        response = client.rpc(
            'get_users_with_stats',
            {
                'search_term': search,
                'page_limit': limit,
                'page_offset': offset
            }
        ).execute()
        
        # Get total count for pagination
        count_response = client.rpc(
            'get_users_count',
            {'search_term': search}
        ).execute()
        
        total_count = count_response.data if count_response.data else 0
        
        # Calculate pagination metadata
        has_next = offset + limit < total_count
        has_prev = offset > 0
        
        return {
            "items": response.data or [],
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_next": has_next,
            "has_prev": has_prev
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
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Get user details
        response = client.from_("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user_data = response.data[0]
        
        # Get booking statistics
        booking_stats = client.from_("tickets").select(
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
    "/{user_id}/activate",
    tags=["Admin"],
    summary="Activate User",
    description="Activate a user account (admin only)"
)
async def activate_user(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Activate a user account. Activated users can log in.
    
    **Admin only endpoint**
    
    Parameters:
    - user_id: The ID of the user to activate
    
    Returns:
    - Success message
    """
    try:
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Check if user exists
        user_response = client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Prevent activating deleted users
        if user.get("deleted_at"):
            raise AuthorizationException("Cannot activate a deleted user. Please restore the user first.")
        
        # Activate the user by setting is_active to True
        client.from_("users").update({"is_active": True}).eq("id", user_id).execute()
        
        return {
            "message": "User activated successfully",
            "user_id": user_id
        }
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to activate user: {str(e)}")


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
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Check if user exists
        user_response = client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Prevent deactivating admin users
        if user.get("is_admin"):
            raise AuthorizationException("Cannot deactivate admin users")
        
        # Prevent self-deactivation
        if user_id == current_user.id:
            raise AuthorizationException("Cannot deactivate your own account")
        
        # Deactivate the user by setting is_active to False
        client.from_("users").update({"is_active": False}).eq("id", user_id).execute()
        
        return {
            "message": "User deactivated successfully",
            "user_id": user_id
        }
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to deactivate user: {str(e)}")


@router.post(
    "/{user_id}/promote-admin",
    response_model=User,
    tags=["Admin"],
    summary="Promote User to Admin",
    description="Promote an existing user to admin status (admin only)"
)
async def promote_to_admin(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Promote an existing user to admin status.
    
    **Admin only endpoint**
    
    Parameters:
    - user_id: The ID of the user to promote to admin
    
    Returns:
    - Updated user information
    """
    try:
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Check if user exists
        user_response = client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Check if user is already admin
        if user.get("is_admin"):
            raise ConflictException("User is already an admin")
        
        # Prevent promoting inactive users
        if not user.get("is_active"):
            raise AuthorizationException("Cannot promote inactive users to admin. Please activate the user first.")
        
        # Promote user to admin and record who promoted them
        update_response = client.from_("users").update({
            "is_admin": True,
            "promoted_by": current_user.id
        }).eq("id", user_id).execute()
        
        if not update_response.data:
            raise DatabaseException("Failed to update user admin status")
        
        return update_response.data[0]
        
    except (NotFoundException, ConflictException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to promote user to admin: {str(e)}")


@router.post(
    "/{user_id}/revoke-admin",
    response_model=User,
    tags=["Admin"],
    summary="Revoke Admin Status",
    description="Revoke admin status from a user (admin only)"
)
async def revoke_admin_status(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """
    Revoke admin status from a user.
    
    **Admin only endpoint**
    
    Parameters:
    - user_id: The ID of the user to revoke admin status from
    
    Returns:
    - Updated user information
    """
    try:
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Check if user exists
        user_response = client.from_("users").select("*").eq("id", user_id).execute()
        
        if not user_response.data:
            raise NotFoundException(f"User with ID {user_id} not found")
        
        user = user_response.data[0]
        
        # Check if user is admin
        if not user.get("is_admin"):
            raise ConflictException("User is not an admin")
        
        # Prevent self-demotion
        if user_id == current_user.id:
            raise AuthorizationException("Cannot revoke your own admin status")
        
        # Check admin hierarchy - only allow revoking if:
        # 1. Current user promoted this admin (promoted_by = current_user.id)
        # 2. Current user is a root admin (promoted_by = NULL) and target is not a root admin
        promoted_by = user.get("promoted_by")
        current_user_promoted_by = None
        
        # Get current user's promoted_by status
        current_user_response = client.from_("users").select("promoted_by").eq("id", current_user.id).execute()
        if current_user_response.data:
            current_user_promoted_by = current_user_response.data[0].get("promoted_by")
        
        # Authorization logic:
        # - Root admins (promoted_by = NULL) can revoke any non-root admin
        # - Non-root admins can only revoke admins they promoted
        # - Nobody can revoke root admins except other root admins
        if promoted_by is None:  # Target is root admin
            if current_user_promoted_by is not None:  # Current user is not root admin
                raise AuthorizationException("Only root administrators can revoke root admin status")
        elif promoted_by != current_user.id:  # Target was promoted by someone else
            if current_user_promoted_by is not None:  # Current user is not root admin
                raise AuthorizationException("You can only revoke admin status from users you promoted")
        
        # Revoke admin status and clear promoted_by
        update_response = client.from_("users").update({
            "is_admin": False,
            "promoted_by": None
        }).eq("id", user_id).execute()
        
        if not update_response.data:
            raise DatabaseException("Failed to update user admin status")
        
        return update_response.data[0]
        
    except (NotFoundException, ConflictException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to revoke admin status: {str(e)}")


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
        # Get the initialized client
        client = supabase_service._get_client()
        
        # Check if user exists
        user_response = client.from_("users").select("*").eq("id", user_id).execute()
        
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
        active_bookings = client.from_("tickets").select(
            "id", count="exact"
        ).eq("user_id", user_id).in_("booking_status", ["pending", "confirmed"]).execute()
        
        if active_bookings.count and active_bookings.count > 0:
            raise AuthorizationException(
                f"Cannot delete user with {active_bookings.count} active booking(s). "
                "Please cancel or complete all bookings first."
            )
        
        # Perform soft delete by setting deleted_at timestamp and deactivating the user
        client.from_("users").update({
            "deleted_at": datetime.utcnow().isoformat(),
            "is_active": False
        }).eq("id", user_id).execute()
        
        return {
            "message": "User deleted successfully",
            "user_id": user_id
        }
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        raise DatabaseException(f"Failed to delete user: {str(e)}")
