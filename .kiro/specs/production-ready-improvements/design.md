# Design Document

## Overview

This design addresses critical production-readiness issues in the SafarSaga backend by implementing proper pagination with accurate counts, replacing blocking operations with true async patterns, centralizing configuration management with Pydantic settings, and implementing Redis-based rate limiting for horizontal scalability.

## Architecture

### Configuration Management
- **Centralized Settings**: Single `Settings` class using `pydantic-settings`
- **Type Safety**: All environment variables validated and typed
- **Dependency Injection**: Settings injected where needed, not scattered `os.getenv` calls

### Async Performance
- **Non-blocking Operations**: Replace `_run_sync` with `asyncio.to_thread`
- **True Async**: Leverage async Supabase client capabilities
- **Concurrent Processing**: Enable proper request concurrency

### Pagination System
- **Accurate Counts**: Separate count queries with `count='exact'`
- **Consistent Metadata**: Proper `has_next`/`has_prev` calculation
- **Performance Optimization**: Efficient count queries

### Rate Limiting
- **Redis Backend**: External store for production scalability
- **Distributed Limits**: Shared across multiple instances
- **Configurable Policies**: Different limits per endpoint/user type

## Components and Interfaces

### 1. Centralized Settings
```python
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Database
    supabase_url: str
    supabase_service_role_key: str
    
    # Authentication
    jwt_secret: str = "change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # External Services
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Application
    environment: str = "development"
    cors_origins: List[str] = ["http://localhost:3000"]
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

### 2. Improved Async Database Operations
```python
async def get_events_with_count(self, filters: dict = None, limit: int = 20, offset: int = 0):
    """Get events with accurate total count"""
    
    # Count query
    async def _count_events():
        query = self._get_client().table("events").select("*", count='exact')
        # Apply same filters as main query
        if filters:
            # Apply filters...
        return query.execute()
    
    # Data query  
    async def _get_events():
        query = self._get_client().table("events").select("*")
        # Apply filters and pagination
        return query.range(offset, offset + limit - 1).execute()
    
    # Execute both queries concurrently
    count_result, data_result = await asyncio.gather(
        asyncio.to_thread(_count_events),
        asyncio.to_thread(_get_events)
    )
    
    total = count_result.count
    events = [Event(**item) for item in data_result.data]
    
    return events, total
```

### 3. Redis-Based Rate Limiting
```python
import redis.asyncio as redis
from datetime import datetime, timedelta

class RedisRateLimiter:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def is_rate_limited(self, key: str, limit: int, window: int) -> tuple[bool, dict]:
        """Check rate limit using Redis sliding window"""
        now = datetime.utcnow().timestamp()
        pipeline = self.redis.pipeline()
        
        # Remove expired entries
        pipeline.zremrangebyscore(key, 0, now - window)
        
        # Count current requests
        pipeline.zcard(key)
        
        # Add current request
        pipeline.zadd(key, {str(now): now})
        
        # Set expiration
        pipeline.expire(key, window)
        
        results = await pipeline.execute()
        current_count = results[1]
        
        is_limited = current_count >= limit
        
        return is_limited, {
            "current": current_count,
            "limit": limit,
            "reset_time": now + window,
            "retry_after": window if is_limited else None
        }
```

## Data Models

### Settings Model Structure
```python
class DatabaseSettings(BaseModel):
    supabase_url: str = Field(..., description="Supabase project URL")
    supabase_service_role_key: str = Field(..., description="Supabase service role key")
    
    @validator('supabase_url')
    def validate_supabase_url(cls, v):
        if not v.startswith('https://'):
            raise ValueError('Supabase URL must start with https://')
        return v

class RedisSettings(BaseModel):
    redis_url: str = Field("redis://localhost:6379", description="Redis connection URL")
    redis_password: Optional[str] = Field(None, description="Redis password")
    redis_db: int = Field(0, description="Redis database number")

class RateLimitSettings(BaseModel):
    enabled: bool = Field(True, description="Enable rate limiting")
    default_limit: int = Field(100, description="Default requests per window")
    default_window: int = Field(3600, description="Default window in seconds")
    
    # Endpoint-specific limits
    auth_limit: int = Field(10, description="Auth endpoint limit")
    booking_limit: int = Field(50, description="Booking endpoint limit")
```

### Pagination Response Model
```python
class PaginatedResponse(BaseModel):
    items: List[Any] = Field(..., description="List of items")
    total: int = Field(..., ge=0, description="Total number of items")
    limit: int = Field(..., ge=1, description="Items per page")
    offset: int = Field(..., ge=0, description="Offset from start")
    has_next: bool = Field(..., description="Has next page")
    has_prev: bool = Field(..., description="Has previous page")
    page: int = Field(..., ge=1, description="Current page number")
    total_pages: int = Field(..., ge=1, description="Total number of pages")
```

## Error Handling

### Async Error Handling
```python
async def safe_async_operation(operation, *args, **kwargs):
    """Safely execute async operations with proper error handling"""
    try:
        return await asyncio.to_thread(operation, *args, **kwargs)
    except Exception as e:
        logger.error(f"Async operation failed: {str(e)}", exc_info=True)
        raise handle_database_error(e)
```

### Rate Limit Error Responses
```python
class RateLimitResponse(BaseModel):
    error: str = "Rate limit exceeded"
    limit: int
    current: int
    reset_time: datetime
    retry_after: int
```

## Testing Strategy

### Configuration Testing
1. **Settings Validation**: Test all environment variable validation
2. **Type Safety**: Verify type conversion and validation
3. **Default Values**: Test fallback to default values

### Async Performance Testing
1. **Concurrency Tests**: Verify non-blocking operations
2. **Load Testing**: Test under high concurrent load
3. **Performance Benchmarks**: Compare before/after performance

### Pagination Testing
1. **Count Accuracy**: Verify total counts are correct
2. **Edge Cases**: Test empty results, single page, etc.
3. **Consistency**: Ensure counts remain stable during pagination

### Rate Limiting Testing
1. **Redis Integration**: Test Redis connectivity and operations
2. **Distributed Limits**: Test across multiple instances
3. **Edge Cases**: Test limit boundaries and reset behavior

## Implementation Phases

### Phase 1: Centralized Configuration
- Create `Settings` class with pydantic-settings
- Replace all `os.getenv` calls with settings injection
- Add configuration validation and type safety

### Phase 2: Fix Pagination
- Implement separate count queries with `count='exact'`
- Update all list endpoints with accurate pagination
- Add proper pagination metadata calculation

### Phase 3: Improve Async Performance
- Replace `_run_sync` with `asyncio.to_thread`
- Optimize database operations for true async
- Add concurrent query execution where beneficial

### Phase 4: Redis Rate Limiting
- Implement Redis-based rate limiter
- Replace in-memory rate limiting
- Add rate limit middleware with proper headers

### Phase 5: Enhanced Error Handling
- Improve error logging with correlation IDs
- Add structured logging for better debugging
- Implement proper fallback mechanisms

## Migration Strategy

### Backward Compatibility
- **Gradual Migration**: Update one component at a time
- **Feature Flags**: Use environment variables to enable new features
- **Monitoring**: Add metrics to track performance improvements

### Configuration Migration
- **Environment Variables**: Maintain existing variable names
- **Validation**: Add validation without breaking existing deployments
- **Documentation**: Update deployment guides with new requirements

### Performance Monitoring
- **Metrics Collection**: Track response times and throughput
- **Error Rates**: Monitor error rates during migration
- **Resource Usage**: Track memory and CPU usage improvements