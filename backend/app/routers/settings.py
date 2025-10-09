"""
Settings API endpoints for admin dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from app.models import AppSettings, AppSettingsUpdate, AppSettingsResponse
from app.services.supabase_service import SupabaseService
from app.middleware.auth import get_admin_user
from app.exceptions import DatabaseException, NotFoundException
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/", response_model=AppSettingsResponse)
async def get_settings(
    current_user = Depends(get_admin_user),
    supabase_service: SupabaseService = Depends()
):
    """
    Get application settings
    Requires admin authentication
    """
    try:
        logger.info(f"Admin user {current_user.email} fetching app settings")
        
        settings_data = await supabase_service.get_app_settings()
        
        # Convert to response model (masks sensitive data)
        settings = AppSettingsResponse(**settings_data)
        
        logger.info("App settings retrieved successfully")
        return settings
        
    except DatabaseException as e:
        logger.error(f"Database error fetching settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch application settings"
        )

@router.put("/", response_model=AppSettingsResponse)
async def update_settings(
    settings_update: AppSettingsUpdate,
    current_user = Depends(get_admin_user),
    supabase_service: SupabaseService = Depends()
):
    """
    Update application settings
    Requires admin authentication
    """
    try:
        logger.info(f"Admin user {current_user.email} updating app settings")
        
        # Convert Pydantic model to dict, excluding None values
        update_data = settings_update.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Update settings in database
        updated_settings_data = await supabase_service.update_app_settings(update_data)
        
        # Convert to response model (masks sensitive data)
        updated_settings = AppSettingsResponse(**updated_settings_data)
        
        logger.info(f"App settings updated successfully with fields: {list(update_data.keys())}")
        return updated_settings
        
    except DatabaseException as e:
        logger.error(f"Database error updating settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    except ValueError as e:
        logger.error(f"Validation error updating settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error updating settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application settings"
        )

@router.get("/maintenance-status")
async def get_maintenance_status(supabase_service: SupabaseService = Depends()):
    """
    Get maintenance mode status (public endpoint for frontend to check)
    """
    try:
        settings_data = await supabase_service.get_app_settings()
        maintenance_mode = settings_data.get("maintenance_mode", False)
        
        return {
            "maintenance_mode": maintenance_mode,
            "message": "Site is currently under maintenance. Please check back later." if maintenance_mode else None
        }
        
    except Exception as e:
        logger.error(f"Error fetching maintenance status: {str(e)}")
        # Default to not in maintenance mode if there's an error
        return {
            "maintenance_mode": False,
            "message": None
        }
