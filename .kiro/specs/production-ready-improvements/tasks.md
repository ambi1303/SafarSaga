# Implementation Plan

- [x] 1. Create centralized settings configuration with Pydantic


  - Create `backend/app/config.py` with comprehensive Settings class using pydantic-settings
  - Define all environment variables with proper types, validation, and defaults
  - Add separate setting groups for database, Redis, authentication, and external services
  - Install pydantic-settings dependency and update requirements
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Replace os.getenv calls with centralized settings
  - Update `supabase_service.py` to use injected settings instead of os.getenv
  - Update `cloudinary_service.py` to use settings for API credentials
  - Update `main.py` to use settings for CORS, port, and environment configuration
  - Update `auth.py` middleware to use settings for JWT configuration
  - _Requirements: 3.1, 3.3_

- [ ] 3. Fix pagination with accurate count queries
  - Update `get_events` method in supabase_service.py to use separate count query with count='exact'
  - Update `get_destinations` method to implement proper count query
  - Update `get_bookings` method to use accurate count with same filters applied
  - Update `get_gallery_images` method to implement proper pagination counting
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Replace blocking _run_sync with asyncio.to_thread
  - Remove the current `_run_sync` method that blocks the event loop
  - Replace all `_run_sync` calls with `asyncio.to_thread` for proper async execution
  - Update database operations to use true async patterns where possible
  - Add proper error handling for async operations with correlation IDs
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5. Implement Redis-based rate limiting system
  - Create `backend/app/services/rate_limiter.py` with Redis-based rate limiting
  - Implement sliding window rate limiting using Redis sorted sets
  - Add rate limit configuration to settings with different limits per endpoint type
  - Install redis dependency and add Redis connection management
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6. Create rate limiting middleware for FastAPI
  - Create rate limiting middleware that uses Redis rate limiter
  - Add proper HTTP headers for rate limit information (X-RateLimit-Limit, X-RateLimit-Remaining)
  - Implement different rate limits for different endpoint categories (auth, booking, etc.)
  - Add rate limit exception handling with proper retry-after headers
  - _Requirements: 4.1, 4.3_

- [ ] 7. Update pagination response models and metadata
  - Create comprehensive PaginatedResponse model with all pagination metadata
  - Update all router endpoints to return consistent pagination information
  - Add page number calculation and total_pages to pagination responses
  - Ensure has_next and has_prev flags are calculated correctly based on accurate counts
  - _Requirements: 1.2, 1.3_

- [ ] 8. Improve async database operations with concurrent queries
  - Implement concurrent execution of count and data queries using asyncio.gather
  - Optimize database operations to reduce blocking and improve throughput
  - Add proper connection pooling and resource management for async operations
  - Update error handling to work properly with async/await patterns
  - _Requirements: 2.1, 2.2, 5.2_

- [ ] 9. Add structured logging and correlation IDs
  - Implement correlation ID generation and propagation through requests
  - Add structured logging with proper context (user_id, request_id, operation)
  - Update error handling to include correlation IDs in logs and responses
  - Add performance metrics logging for database operations and external service calls
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 10. Update main.py to use centralized configuration
  - Modify FastAPI app initialization to use Settings dependency injection
  - Update CORS configuration to use settings instead of environment variables
  - Add proper startup/shutdown events for Redis connection management
  - Register rate limiting middleware with the FastAPI application
  - _Requirements: 3.1, 4.1_

- [ ] 11. Create comprehensive tests for production improvements
  - Write unit tests for Settings configuration validation and type safety
  - Create integration tests for Redis rate limiting functionality
  - Test pagination accuracy with various filter combinations and edge cases
  - Write performance tests to verify async improvements and non-blocking behavior
  - _Requirements: 1.1, 2.3, 3.2, 4.2_

- [ ] 12. Optimize booking conflict detection with targeted database queries
  - Create `check_for_existing_booking` method in supabase_service.py that uses a single targeted query
  - Replace the current Python-based filtering logic in create_booking with the new database query
  - Implement query that checks user_id, destination_id, travel_date, and booking status in one operation
  - Add proper indexing recommendations for optimal query performance on booking conflict checks
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. Add monitoring and health checks for production readiness
  - Update health check endpoint to include Redis connectivity status
  - Add metrics collection for rate limiting, pagination performance, and async operations
  - Implement proper graceful shutdown handling for Redis connections
  - Add environment-specific configuration validation (production vs development)
  - _Requirements: 4.2, 5.1, 5.3_