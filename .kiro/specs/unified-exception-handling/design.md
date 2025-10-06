# Design Document

## Overview

This design consolidates the SafarSaga backend exception handling from two competing systems (`exceptions.py` and `booking_errors.py`) into a single, unified system based on the `SafarSagaException` foundation. The unified system will be properly registered with FastAPI to ensure custom handlers are actually called, providing consistent error responses across all API endpoints.

## Architecture

### Single Exception System
- **Base**: `SafarSagaException` class as the foundation for all custom exceptions
- **Location**: Consolidated in `backend/app/exceptions.py`
- **Registration**: Properly registered with FastAPI app instance in `main.py`

### Exception Hierarchy
```
SafarSagaException (Base)
├── ValidationException (422)
├── AuthenticationException (401)
├── AuthorizationException (403)
├── NotFoundException (404)
├── ConflictException (409)
├── BusinessLogicException (400)
├── BookingException (400)
│   ├── CapacityException
│   └── PaymentException
├── ExternalServiceException (502)
├── RateLimitException (429)
├── FileUploadException (400)
└── DatabaseException (500)
```

## Components and Interfaces

### 1. Unified Exception Base Class
```python
class SafarSagaException(Exception):
    """Base exception for SafarSaga API with consistent structure"""
    def __init__(self, message: str, status_code: int = 500, 
                 error_code: Optional[str] = None, details: Optional[Dict] = None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or self.__class__.__name__.upper()
        self.details = details or {}
        super().__init__(self.message)
```

### 2. Specialized Exception Classes
Each exception type will include:
- **Appropriate HTTP status code**
- **Standardized error codes** (from booking_errors.py)
- **User-friendly messages**
- **Structured details** for debugging

### 3. Global Exception Handler
```python
async def safarsaga_exception_handler(request: Request, exc: SafarSagaException):
    """Unified handler for all SafarSaga exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### 4. FastAPI Registration
```python
# In main.py
from app.exceptions import SafarSagaException, safarsaga_exception_handler

app.add_exception_handler(SafarSagaException, safarsaga_exception_handler)
```

## Data Models

### Unified Error Response Format
```json
{
    "error": "User-friendly error message",
    "error_code": "STANDARDIZED_ERROR_CODE",
    "status_code": 400,
    "details": {
        "field": "specific_field",
        "value": "invalid_value",
        "additional_context": "..."
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Error Code Integration
Merge error codes from `booking_errors.py` into the unified system:
- `DESTINATION_NOT_FOUND` → `NotFoundException`
- `INVALID_SEATS_COUNT` → `ValidationException`
- `BOOKING_ACCESS_DENIED` → `AuthorizationException`
- `PAYMENT_ALREADY_CONFIRMED` → `BusinessLogicException`

## Error Handling

### Exception Mapping Strategy
1. **Preserve existing error codes** from `booking_errors.py`
2. **Map to appropriate exception classes** in unified system
3. **Maintain user-friendly messages**
4. **Add structured details** for debugging

### Logging Integration
```python
import logging

logger = logging.getLogger(__name__)

async def safarsaga_exception_handler(request: Request, exc: SafarSagaException):
    # Log exception with context
    logger.error(
        f"SafarSaga Exception: {exc.error_code}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )
    # Return response...
```

### Backward Compatibility
- **Preserve existing error codes** used by frontend
- **Maintain response structure** expected by clients
- **Gradual migration** from old to new system

## Testing Strategy

### Exception Handler Tests
1. **Registration Tests**: Verify handlers are properly registered
2. **Response Format Tests**: Ensure consistent JSON structure
3. **Status Code Tests**: Verify correct HTTP status codes
4. **Error Code Tests**: Confirm standardized error codes

### Integration Tests
1. **API Endpoint Tests**: Test exception handling across all routes
2. **Client Compatibility Tests**: Ensure frontend can handle responses
3. **Logging Tests**: Verify proper error logging

### Migration Tests
1. **Backward Compatibility**: Ensure existing clients still work
2. **Error Code Mapping**: Verify old codes map to new system
3. **Response Structure**: Confirm response format consistency

## Implementation Phases

### Phase 1: Consolidate Exception Classes
- Merge `booking_errors.py` functionality into `exceptions.py`
- Add error codes to existing exception classes
- Create unified error response format

### Phase 2: Register Exception Handlers
- Add handler registration to `main.py`
- Implement unified exception handler
- Add proper logging integration

### Phase 3: Update Exception Usage
- Replace `BookingHTTPException` usage with unified exceptions
- Update all raise statements to use new system
- Remove old exception handling code

### Phase 4: Testing and Validation
- Test all API endpoints for consistent error handling
- Verify frontend compatibility
- Confirm proper logging and monitoring

## Migration Strategy

### Gradual Replacement
1. **Keep both systems** temporarily during migration
2. **Update one module at a time** to use unified system
3. **Test thoroughly** before removing old code
4. **Remove `booking_errors.py`** once migration is complete

### Error Code Preservation
- **Map existing codes** to new exception classes
- **Maintain message compatibility** for frontend
- **Document migration** for API consumers