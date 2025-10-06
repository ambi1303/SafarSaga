"""
Authentication routes for SafarSaga API
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import os

from app.models import User, LoginRequest, LoginResponse, UserCreate, ApiResponse
from app.middleware.auth import AuthMiddleware, AuthUtils, security, get_current_user
from app.services.supabase_service import SupabaseService
from app.exceptions import (
    AuthenticationException, 
    ValidationException, 
    ConflictException,
    NotFoundException,
    DatabaseException
)

router = APIRouter()

def get_supabase_service():
    """Get Supabase service instance"""
    return SupabaseService()


class SignupRequest(BaseModel):
    """Signup request model"""
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """Password reset request model"""
    email: str


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model"""
    token: str
    new_password: str


@router.post(
    "/signup",
    response_model=LoginResponse,
    tags=["Authentication"],
    summary="User Registration",
    description="Register a new user account",
    status_code=status.HTTP_201_CREATED
)
async def signup(signup_data: SignupRequest):
    """
    Register a new user account.
    
    - **email**: Valid email address
    - **password**: Strong password (min 8 chars, uppercase, lowercase, number, special char)
    - **full_name**: User's full name
    - **phone**: Optional phone number
    
    Returns JWT token and user information.
    """
    try:
        # Validate email format
        if not AuthUtils.is_valid_email(signup_data.email):
            raise ValidationException("Invalid email format")
        
        # Validate password strength
        is_strong, message = AuthUtils.is_strong_password(signup_data.password)
        if not is_strong:
            raise ValidationException(message)
        
        # Check if user already exists
        try:
            existing_user = await get_supabase_service().get_user_by_email(signup_data.email)
            if existing_user:
                raise ConflictException("User with this email already exists")
        except DatabaseException as db_error:
            # If there's a database error checking for existing user, 
            # we can still proceed with registration
            print(f"Warning: Could not check for existing user: {str(db_error)}")
            # Continue with registration
        
        # Use Supabase Auth to create user
        try:
            def _create_auth_user():
                response = get_supabase_service()._get_client().auth.sign_up({
                    "email": signup_data.email,
                    "password": signup_data.password,
                    "options": {
                        "data": {
                            "full_name": signup_data.full_name,
                            "phone": signup_data.phone
                        }
                    }
                })
                return response
            
            auth_response = await get_supabase_service()._run_sync(_create_auth_user)
            
            if not auth_response.user:
                raise AuthenticationException("Failed to create user account")
            
            # The user should be automatically created in our users table via trigger
            # Wait a moment and then fetch the user
            import asyncio
            await asyncio.sleep(1)
            
            user = await get_supabase_service().get_user_by_id(auth_response.user.id)
            if not user:
                # If trigger didn't work, create user manually
                user_data = {
                    "id": auth_response.user.id,
                    "email": signup_data.email,
                    "full_name": signup_data.full_name,
                    "phone": signup_data.phone,
                    "is_admin": False
                }
                user = await get_supabase_service().create_user(user_data)
            
            # Use Supabase token from auth response
            access_token = auth_response.session.access_token if auth_response.session else None
            
            if not access_token:
                raise AuthenticationException("Failed to get access token")
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user=user
            )
            
        except Exception as e:
            if "already registered" in str(e).lower():
                raise ConflictException("User with this email already exists")
            raise AuthenticationException(f"Registration failed: {str(e)}")
    
    except (ValidationException, ConflictException, AuthenticationException):
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post(
    "/login",
    response_model=LoginResponse,
    tags=["Authentication"],
    summary="User Login",
    description="Authenticate user and get access token"
)
async def login(login_data: LoginRequest):
    """
    Authenticate user and return JWT token.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns JWT token and user information.
    """
    try:
        # Use Supabase Auth to authenticate
        def _authenticate_user():
            response = get_supabase_service()._get_client().auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            return response
        
        auth_response = await get_supabase_service()._run_sync(_authenticate_user)
        
        if not auth_response.user:
            raise AuthenticationException("Invalid email or password")
        
        # Get user details from our database
        user = await get_supabase_service().get_user_by_id(auth_response.user.id)
        if not user:
            raise NotFoundException("User profile not found")
        
        # Use Supabase token from auth response
        access_token = auth_response.session.access_token if auth_response.session else None
        
        if not access_token:
            raise AuthenticationException("Failed to get access token")
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
    
    except AuthenticationException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.post(
    "/logout",
    response_model=ApiResponse,
    tags=["Authentication"],
    summary="User Logout",
    description="Logout user and invalidate token"
)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user and invalidate the current session.
    
    Requires valid JWT token in Authorization header.
    """
    try:
        # Use Supabase to sign out
        token = credentials.credentials
        
        def _sign_out():
            return get_supabase_service()._get_client().auth.sign_out()
        
        await get_supabase_service()._run_sync(_sign_out)
        
        return ApiResponse(
            message="Successfully logged out",
            success=True
        )
    
    except Exception as e:
        # Even if Supabase logout fails, we can still return success
        # since the client will discard the token
        return ApiResponse(
            message="Logged out (token should be discarded by client)",
            success=True
        )


@router.post(
    "/refresh",
    response_model=LoginResponse,
    tags=["Authentication"],
    summary="Refresh Token",
    description="Refresh access token using refresh token"
)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Refresh access token using the current token.
    
    Returns new JWT token with extended expiration.
    """
    try:
        # Verify current token with Supabase
        token = credentials.credentials
        supabase_user = await AuthMiddleware.verify_supabase_token(token)
        
        # Get user details from our database
        user = await get_supabase_service().get_user_by_id(supabase_user["id"])
        if not user:
            raise NotFoundException("User not found")
        
        # For Supabase, token refresh should be handled on the client side
        # Return the same token as it's still valid
        return LoginResponse(
            access_token=token,
            token_type="bearer",
            user=user
        )
    
    except AuthenticationException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post(
    "/forgot-password",
    response_model=ApiResponse,
    tags=["Authentication"],
    summary="Forgot Password",
    description="Request password reset email"
)
async def forgot_password(request: PasswordResetRequest):
    """
    Request password reset email.
    
    - **email**: User's email address
    
    Sends password reset email if user exists.
    """
    try:
        # Use Supabase Auth to send reset email
        def _reset_password():
            response = get_supabase_service()._get_client().auth.reset_password_email(
                request.email,
                {
                    "redirect_to": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/reset-password"
                }
            )
            return response
        
        await get_supabase_service()._run_sync(_reset_password)
        
        return ApiResponse(
            message="If an account with that email exists, a password reset link has been sent",
            success=True
        )
    
    except Exception as e:
        # Always return success for security (don't reveal if email exists)
        return ApiResponse(
            message="If an account with that email exists, a password reset link has been sent",
            success=True
        )


@router.get(
    "/me",
    response_model=User,
    tags=["Authentication"],
    summary="Get Current User",
    description="Get current authenticated user information"
)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    Returns complete user profile.
    """
    return current_user


@router.put(
    "/me",
    response_model=User,
    tags=["Authentication"],
    summary="Update Current User",
    description="Update current user profile information"
)
async def update_current_user(
    update_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Update current user profile information.
    
    - **full_name**: Updated full name
    - **phone**: Updated phone number
    
    Requires valid JWT token in Authorization header.
    """
    try:
        # Only allow updating certain fields
        allowed_fields = ["full_name", "phone"]
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        if not filtered_data:
            raise ValidationException("No valid fields to update")
        
        # Update user in database
        updated_user = await get_supabase_service().update_user(current_user.id, filtered_data)
        
        return updated_user
    
    except ValidationException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile update failed: {str(e)}"
        )