from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Create FastAPI app with comprehensive documentation
app = FastAPI(
    title="SafarSaga Backend API",
    description="""
    ## SafarSaga Travel Platform Backend API
    
    A comprehensive REST API for managing travel bookings, events, and gallery images.
    
    ### Features:
    - **Authentication**: JWT-based user authentication with Supabase
    - **Trip Management**: CRUD operations for travel packages and events
    - **Booking System**: Complete booking workflow with payment integration
    - **Gallery Management**: Image upload and management with Cloudinary
    - **Admin Panel**: Administrative functions for managing users and content
    - **Payment Processing**: UPI QR code generation and payment confirmation
    
    ### Authentication:
    Most endpoints require authentication. Include the JWT token in the Authorization header:
    ```
    Authorization: Bearer <your_jwt_token>
    ```
    
    ### Rate Limiting:
    API requests are rate-limited to prevent abuse. Check response headers for rate limit information.
    
    ### Error Handling:
    All errors follow a consistent format with appropriate HTTP status codes and detailed error messages.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and system status endpoints"
        },
        {
            "name": "Authentication", 
            "description": "User authentication and authorization"
        },
        {
            "name": "Users",
            "description": "User management and profile operations"
        },
        {
            "name": "Events",
            "description": "Travel events and trip management"
        },
        {
            "name": "Bookings",
            "description": "Booking management and reservations"
        },
        {
            "name": "Gallery Albums",
            "description": "Album-based gallery management system"
        },
        {
            "name": "Gallery Images",
            "description": "Gallery image management within albums"
        },
        {
            "name": "Payments",
            "description": "Payment processing and UPI integration"
        },
        {
            "name": "Admin",
            "description": "Administrative functions (admin only)"
        }
    ],
    contact={
        "name": "SafarSaga Support",
        "email": "support@safarsaga.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# CORS configuration
allowed_origins = [
    "http://localhost:3000",
    "https://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://127.0.0.1:3000",
    "http://localhost:3001",
    "https://localhost:3001",
    "https://safarsaga.co.in",
    "http://safarsaga.co.in",
    "https://www.safarsaga.co.in",
    "http://www.safarsaga.co.in"
]

# Get origins from environment or use defaults
cors_origins_env = os.getenv("CORS_ORIGINS")
if cors_origins_env:
    try:
        import ast
        origins = ast.literal_eval(cors_origins_env)
    except:
        origins = allowed_origins
else:
    origins = allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)



# CORS is handled by the middleware above

# API info endpoint
@app.get(
    "/api",
    tags=["Health"],
    summary="API Information",
    description="Get API information and available endpoints",
    response_description="API metadata and endpoint information"
)
async def api_info():
    """
    Get comprehensive API information including available endpoints and documentation links.
    
    Returns:
    - API version and metadata
    - Available endpoint categories
    - Documentation links
    - Authentication information
    """
    return {
        "message": "SafarSaga Backend API",
        "version": "1.0.0",
        "description": "Backend service for SafarSaga Travel Platform",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json"
        },
        "endpoints": {
            "health": "/health",
            "authentication": "/auth/*",
            "events": "/api/events/*",
            "bookings": "/api/bookings/*",
            "gallery": "/api/gallery/*",
            "gallery_albums": "/api/gallery-albums/*",
            "payments": "/api/payments/*"
        },
        "authentication": {
            "type": "Bearer JWT",
            "header": "Authorization: Bearer <token>",
            "login_endpoint": "/auth/login"
        },
        "features": [
            "User Authentication & Authorization",
            "Travel Event Management", 
            "Booking & Reservation System",
            "Image Gallery Management",
            "Payment Processing (UPI)",
            "Admin Dashboard APIs",
            "Real-time Notifications"
        ]
    }

# Import custom exceptions and handlers
from app.exceptions import (
    SafarSagaException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    BusinessLogicException,
    BookingException,
    CapacityException,
    PaymentException,
    ExternalServiceException,
    RateLimitException,
    FileUploadException,
    DatabaseException,
    safarsaga_exception_handler
)

# Register custom exception handlers
app.add_exception_handler(SafarSagaException, safarsaga_exception_handler)
app.add_exception_handler(ValidationException, safarsaga_exception_handler)
app.add_exception_handler(AuthenticationException, safarsaga_exception_handler)
app.add_exception_handler(AuthorizationException, safarsaga_exception_handler)
app.add_exception_handler(NotFoundException, safarsaga_exception_handler)
app.add_exception_handler(ConflictException, safarsaga_exception_handler)
app.add_exception_handler(BusinessLogicException, safarsaga_exception_handler)
app.add_exception_handler(BookingException, safarsaga_exception_handler)
app.add_exception_handler(CapacityException, safarsaga_exception_handler)
app.add_exception_handler(PaymentException, safarsaga_exception_handler)
app.add_exception_handler(ExternalServiceException, safarsaga_exception_handler)
app.add_exception_handler(RateLimitException, safarsaga_exception_handler)
app.add_exception_handler(FileUploadException, safarsaga_exception_handler)
app.add_exception_handler(DatabaseException, safarsaga_exception_handler)

# Global exception handler for HTTPException (fallback)
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )


@app.exception_handler(TypeError)
async def type_error_handler(request: Request, exc: TypeError):
    """Handle TypeError exceptions, especially string-to-integer conversion errors"""
    error_message = str(exc)
    
    if "'str' object cannot be interpreted as an integer" in error_message:
        return JSONResponse(
            status_code=422,
            content={
                "error": "Data type validation error. Please ensure numeric fields contain valid numbers.",
                "detail": "Invalid data type: expected number but received text",
                "status_code": 422,
                "timestamp": datetime.utcnow().isoformat(),
                "path": str(request.url.path)
            }
        )
    
    # Re-raise other TypeErrors
    raise exc

# General exception handler (last resort)
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # Log unexpected exceptions
    import logging
    logger = logging.getLogger(__name__)
    logger.error(
        f"Unhandled exception: {exc.__class__.__name__} - {str(exc)}",
        extra={
            "error_type": exc.__class__.__name__,
            "error_message": str(exc),
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_type": "UnhandledException",
            "message": str(exc) if os.getenv("ENVIRONMENT") == "development" else "Something went wrong",
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )

# Include routers
from app.routers import auth, events, bookings, destinations, admin_users, gallery_albums, settings
from app.middleware.auth import add_security_headers, log_requests
from app.services.supabase_service import SupabaseService

# Add middleware
app.middleware("http")(add_security_headers)
app.middleware("http")(log_requests)

# Include authentication routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include events routes
app.include_router(events.router, prefix="/api/events", tags=["Events"])

# Include bookings routes
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])

# Include gallery routes

# Include gallery albums routes
app.include_router(gallery_albums.router, prefix="/api/gallery-albums", tags=["Gallery Albums"])

# Include destinations routes
app.include_router(destinations.router, prefix="/api/destinations", tags=["Destinations"])

# Include admin users routes
app.include_router(admin_users.router, prefix="/api/users", tags=["Admin"])

# Include settings routes
app.include_router(settings.router, tags=["Settings"])

# Initialize services for health checks
supabase_service = SupabaseService()

# Update health check to include database status
@app.get(
    "/health",
    tags=["Health"],
    summary="Health Check",
    description="Check the health status of the API and its dependencies",
    response_description="API health status and system information"
)
async def health_check():
    """
    Health check endpoint to verify API status and connectivity to external services.
    
    Returns:
    - API status and version
    - Current timestamp
    - Database connectivity status
    - External service status
    """
    # Check database connectivity
    db_status = await supabase_service.health_check()
    
    return {
        "status": "OK",
        "message": "SafarSaga Backend API is running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "services": {
            "database": db_status.get("status", "unknown"),
            "cloudinary": "not_implemented",  # Will be updated when we add Cloudinary
            "storage": "available"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development"
    )