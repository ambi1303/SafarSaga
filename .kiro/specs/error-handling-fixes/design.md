# Design Document

## Overview

This design addresses two critical error handling issues in the SafarSaga backend: (1) custom exceptions being re-raised as generic HTTPExceptions, losing structured error details, and (2) HTTP 204 standard violations where endpoints return response bodies despite declaring no-content status. The solution focuses on immediate fixes while maintaining compatibility with existing code.

## Architecture

### Exception Flow Optimization
- **Current Problem**: Custom exceptions → HTTPException → Generic error response
- **Solution**: Custom exceptions → Global exception handler → Structured JSON response
- **Benefit**: Preserves error codes, details, and context for clients and debugging

### HTTP Standards Compliance
- **Current Problem**: HTTP 204 endpoints returning JSON bodies
- **Solution**: Proper Response objects with empty bodies for 204 status codes
- **Benefit**: Standards-compliant responses that work correctly with all HTTP clients

## Components and Interfaces

### 1. Exception Handler Registration
```python
# In main.py - ensure global exception handlers are registered
from app.exceptions import (
    ValidationException, ConflictException, BusinessLogicException,
    AuthorizationException, NotFoundException
)

app.add_exception_handler(ValidationException, validation_exception_handler)
app.add_exception_handler(ConflictException, conflict_exception_handler)
app.add_exception_handler(BusinessLogicException, business_logic_exception_handler)
app.add_exception_handler(AuthorizationException, authorization_exception_handler)
app.add_exception_handler(NotFoundException, not_found_exception_handler)
```

### 2. Structured Exception Handlers
```python
async def validation_exception_handler(request: Request, exc: ValidationException):
    return JSONResponse(
        status_code=422,
        content={
            "error": exc.message,
            "error_code": getattr(exc, 'error_code', 'VALIDATION_ERROR'),
            "details": getattr(exc, 'details', {}),
            "status_code": 422
        }
    )

async def conflict_exception_handler(request: Request, exc: ConflictException):
    return JSONResponse(
        status_code=409,
        content={
            "error": str(exc),
            "error_code": getattr(exc, 'error_code', 'CONFLICT_ERROR'),
            "details": getattr(exc, 'details', {}),
            "status_code": 409
        }
    )
```

### 3. HTTP 204 Compliance Fix
```python
# Before (violates HTTP 204 standard):
@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(...):
    # ... cancellation logic ...
    return {"message": "Booking cancelled successfully"}  # ❌ Body with 204

# After (compliant with HTTP 204 standard):
@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(...):
    # ... cancellation logic ...
    return Response(status_code=status.HTTP_204_NO_CONTENT)  # ✅ No body
```

### 4. Router Exception Handling Cleanup
```python
# Remove try/except blocks that re-raise custom exceptions as HTTPException
# Before:
try:
    # ... business logic ...
except ValidationException as e:
    raise HTTPException(status_code=422, detail=str(e))  # ❌ Loses structure

# After:
try:
    # ... business logic ...
except ValidationException:
    raise  # ✅ Let global handler manage it
```

## Data Models

### Enhanced Exception Classes
```python
class ValidationException(Exception):
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code or "VALIDATION_ERROR"
        self.details = details or {}
        super().__init__(self.message)

class ConflictException(Exception):
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code or "CONFLICT_ERROR"
        self.details = details or {}
        super().__init__(self.message)

class BusinessLogicException(Exception):
    def __init__(self, message: str, error_code: str = None, details: dict = None):
        self.message = message
        self.error_code = error_code or "BUSINESS_LOGIC_ERROR"
        self.details = details or {}
        super().__init__(self.message)
```

### Structured Error Response Format
```json
{
    "error": "User-friendly error message",
    "error_code": "SPECIFIC_ERROR_CODE",
    "details": {
        "field": "problematic_field",
        "value": "invalid_value",
        "constraint": "validation_rule_violated"
    },
    "status_code": 422
}
```

## Error Handling

### Exception Propagation Strategy
1. **Custom exceptions raised in business logic** → Propagate unchanged
2. **Global exception handlers catch specific types** → Return structured JSON
3. **Generic Exception fallback** → Return safe error message
4. **HTTPException preservation** → For cases where generic HTTP errors are appropriate

### Logging Integration
```python
import logging

logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: ValidationException):
    logger.warning(
        f"Validation error: {exc.error_code}",
        extra={
            "error_code": exc.error_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )
    return JSONResponse(...)
```

### Backward Compatibility
- **Preserve existing error messages** that clients expect
- **Maintain HTTP status codes** for existing endpoints
- **Add structured details** without breaking existing error handling
- **Gradual migration** approach for complex endpoints

## Testing Strategy

### Exception Handler Tests
1. **Registration Verification**: Ensure handlers are properly registered in FastAPI
2. **Response Structure Tests**: Verify JSON format matches expected structure
3. **Error Code Preservation**: Confirm error codes are included in responses
4. **Details Preservation**: Ensure structured details are maintained

### HTTP Standards Compliance Tests
1. **204 Response Tests**: Verify no body is returned with 204 status
2. **Content-Length Tests**: Ensure proper headers for empty responses
3. **Client Compatibility Tests**: Test with various HTTP clients
4. **Standards Validation**: Verify compliance with RFC specifications

### Integration Tests
1. **End-to-End Error Flows**: Test complete error handling from request to response
2. **Client Error Handling**: Verify frontend can process structured errors
3. **Logging Verification**: Ensure proper error logging occurs
4. **Performance Impact**: Confirm error handling doesn't degrade performance

## Implementation Phases

### Phase 1: Exception Handler Setup
- Create or update exception classes with structured attributes
- Implement global exception handlers for each custom exception type
- Register handlers in main.py FastAPI application
- Test handler registration and basic functionality

### Phase 2: HTTP 204 Compliance Fix
- Identify all endpoints with 204 status that return bodies
- Update cancel_booking endpoint to return proper Response object
- Test compliance with HTTP standards
- Verify client compatibility with empty responses

### Phase 3: Router Exception Cleanup
- Remove try/except blocks that re-raise custom exceptions as HTTPException
- Update exception raising to use structured custom exceptions
- Preserve HTTPException usage where appropriate (generic HTTP errors)
- Test all affected endpoints for proper error responses

### Phase 4: Testing and Validation
- Comprehensive testing of all error scenarios
- Frontend compatibility verification
- Performance and logging validation
- Documentation updates for API consumers

## Migration Strategy

### Immediate Fixes (High Priority)
1. **HTTP 204 Compliance**: Fix cancel_booking endpoint immediately
2. **Critical Exception Handlers**: Register handlers for most common exceptions
3. **High-Traffic Endpoints**: Fix exception handling in booking creation/updates

### Gradual Improvements (Medium Priority)
1. **Remaining Endpoints**: Update other routers systematically
2. **Enhanced Error Details**: Add more structured details to exceptions
3. **Logging Improvements**: Enhance error logging and monitoring

### Long-term Enhancements (Low Priority)
1. **Error Code Standardization**: Implement comprehensive error code system
2. **Client SDK Updates**: Update client libraries to handle structured errors
3. **Monitoring Integration**: Add error tracking and alerting systems

## Graceful Handling of Data Inconsistencies

### Problem: Orphaned Event References
When bookings reference events that no longer exist in the database, cancellation operations fail with 500 errors because `get_event_by_id()` raises an exception when the event is not found.

### Solution: Defensive Programming in Cancellation Flow
```python
# In cancel_booking endpoint
async def cancel_booking(booking_id: str, ...):
    # ... existing booking fetch logic ...
    
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
                    "operation": "cancel_booking"
                }
            )
            event = None
    
    # Continue with cancellation logic
    # Event-dependent validations will be skipped if event is None
    if event:
        # Perform event-related validations
        pass
    
    # Proceed with cancellation regardless
    # ...
```

### Benefits
1. **User Experience**: Users can cancel bookings even with data inconsistencies
2. **Operational Resilience**: System continues functioning despite data integrity issues
3. **Visibility**: Data problems are logged for administrative review
4. **Graceful Degradation**: Operations degrade gracefully rather than failing completely

### Alternative Approaches Considered
1. **Fix data inconsistency first**: Requires manual DB intervention, blocks users
2. **Make get_event_by_id return None**: Changes behavior globally, may hide bugs elsewhere
3. **Add event existence check**: Adds extra query overhead for all operations

The chosen approach (defensive programming in cancellation) provides the best balance of robustness, user experience, and maintainability.

## Security Considerations

### Error Information Disclosure
- **Sanitize error messages** to avoid exposing sensitive information
- **Limit stack traces** in production error responses
- **Validate error details** before including in responses
- **Log sensitive information** separately from client-facing errors

### Input Validation
- **Validate exception parameters** to prevent injection attacks
- **Sanitize user input** in error messages
- **Limit error detail size** to prevent DoS attacks
- **Rate limit error responses** to prevent abuse