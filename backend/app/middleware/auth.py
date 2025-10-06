"""
Authentication middleware for SafarSaga API
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os
import re
from datetime import datetime

from app.models import User
from app.exceptions import AuthenticationException, AuthorizationException
from app.services.supabase_service import SupabaseService

# Security scheme
security = HTTPBearer()

# Supabase service will be initialized when needed
supabase_service = None

def get_supabase_service():
    """Get or create Supabase service instance"""
    global supabase_service
    if supabase_service is None:
        supabase_service = SupabaseService()
    return supabase_service


class AuthMiddleware:
    """Authentication middleware class - Supabase only"""
    
    @staticmethod
    async def verify_supabase_token(token: str) -> dict:
        """Verify Supabase JWT token"""
        try:
            # Use Supabase client to verify the token
            user_response = await get_supabase_service().get_user_from_token(token)
            if not user_response:
                raise AuthenticationException("Invalid Supabase token")
            
            return user_response
        except Exception as e:
            raise AuthenticationException(f"Supabase token verification failed: {str(e)}")


# Dependency functions
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get current authenticated user from Supabase JWT token
    """
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify with Supabase only - no fallback
        supabase_user = await AuthMiddleware.verify_supabase_token(token)
        
        # Get user details from database
        user = await get_supabase_service().get_user_by_id(supabase_user["id"])
        if not user:
            raise AuthenticationException("User not found")
        
        return user
            
    except AuthenticationException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current active user (additional checks can be added here)
    """
    # Add any additional user validation here
    # For example, check if user is banned, email verified, etc.
    
    return current_user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current user and verify admin privileges
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user


# Optional authentication (for endpoints that work with or without auth)
async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


# Rate limiting middleware (production-ready with Redis recommendation)
class RateLimitMiddleware:
    """Rate limiting middleware - use Redis in production"""
    
    def __init__(self):
        # In-memory storage for development only
        # TODO: Replace with Redis in production
        self.requests = {}
    
    def is_rate_limited(self, client_ip: str, limit: int = 100, window: int = 3600) -> bool:
        """
        Check if client is rate limited
        
        Args:
            client_ip: Client IP address
            limit: Number of requests allowed
            window: Time window in seconds
        
        Returns:
            True if rate limited, False otherwise
        """
        now = datetime.utcnow().timestamp()
        
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Remove old requests outside the window
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < window
        ]
        
        # Check if limit exceeded
        if len(self.requests[client_ip]) >= limit:
            return True
        
        # Add current request
        self.requests[client_ip].append(now)
        return False


# CORS middleware configuration
def get_cors_middleware_config():
    """Get CORS middleware configuration with safe parsing"""
    cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    
    # Safe parsing using comma delimiter instead of ast.literal_eval
    if cors_origins_str.startswith("[") and cors_origins_str.endswith("]"):
        # Handle list format from environment
        try:
            import ast
            origins = ast.literal_eval(cors_origins_str)
        except (ValueError, SyntaxError):
            # Fallback to safe default
            origins = ["http://localhost:3000"]
    else:
        # Handle comma-separated format
        origins = [origin.strip() for origin in cors_origins_str.split(",")]
    
    return {
        "allow_origins": origins,
        "allow_credentials": True,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["*"],
    }


# Security headers middleware
async def add_security_headers(request, call_next):
    """Add security headers to responses"""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Add HSTS header in production
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


# Request logging middleware
async def log_requests(request, call_next):
    """Log API requests"""
    start_time = datetime.utcnow()
    
    # Get client IP
    client_ip = request.client.host
    if "x-forwarded-for" in request.headers:
        client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Log request (in production, use proper logging)
    print(f"{client_ip} - {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    
    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response


# Minimal authentication utilities (validation moved to Pydantic models and Supabase)
class AuthUtils:
    """Minimal authentication utility functions"""
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate password reset token"""
        import secrets
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """
        Basic email validation - prefer using Pydantic EmailStr in models
        This is kept for backward compatibility only
        """
        if not email or not isinstance(email, str):
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def is_strong_password(password: str) -> tuple[bool, str]:
        """
        Basic password strength check - prefer configuring in Supabase
        This is kept for backward compatibility only
        """
        if not password or not isinstance(password, str):
            return False, "Password is required"
        
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is strong"