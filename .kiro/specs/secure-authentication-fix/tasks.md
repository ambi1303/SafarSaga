# Implementation Plan

- [ ] 1. Remove dangerous authentication utilities and custom JWT logic
  - Delete the entire `AuthUtils` class from `backend/app/middleware/auth.py`
  - Remove `create_access_token` method from `AuthMiddleware` class
  - Remove `verify_token` method from `AuthMiddleware` class  
  - Remove JWT configuration constants (`JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRATION_HOURS`)
  - Remove all password hashing and verification utilities
  - _Requirements: 1.4, 1.5, 2.2, 2.4, 2.5_

- [ ] 2. Implement secure Supabase-only token verification
  - Refactor `get_current_user` dependency to use only `verify_supabase_token` method
  - Remove dangerous fallback logic that tries custom JWT validation after Supabase failure
  - Ensure invalid tokens are immediately rejected without fallback attempts
  - Simplify authentication flow to single secure path
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Refactor user registration to use Supabase auth.sign_up exclusively
  - Update `/signup` endpoint in `backend/app/routers/auth.py` to use only Supabase `auth.sign_up`
  - Remove custom user creation logic that bypasses Supabase authentication
  - Ensure user profiles are properly linked to Supabase auth users
  - Remove custom JWT token generation from signup response
  - Return Supabase-generated tokens directly
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1_

- [ ] 4. Refactor user login to use Supabase auth.sign_in_with_password exclusively  
  - Update `/login` endpoint in `backend/app/routers/auth.py` to use only Supabase `auth.sign_in_with_password`
  - Remove custom JWT token generation from login response
  - Return Supabase-generated tokens directly
  - Ensure proper error handling for invalid credentials
  - _Requirements: 5.2_

- [ ] 5. Update logout and token refresh endpoints for Supabase-only authentication
  - Refactor `/logout` endpoint to use only Supabase `auth.sign_out`
  - Update `/refresh` endpoint to use Supabase token refresh mechanisms
  - Remove custom JWT refresh logic
  - Ensure proper token lifecycle management
  - _Requirements: 5.3, 5.4_

- [ ] 6. Clean up Supabase service authentication methods
  - Ensure `get_user_from_token` in `backend/app/services/supabase_service.py` uses proper Supabase auth verification
  - Remove any custom user creation logic that bypasses Supabase auth
  - Implement proper user registration through Supabase auth.sign_up if not already present
  - Verify all authentication methods use Supabase exclusively
  - _Requirements: 4.4_

- [ ] 7. Update authentication middleware dependencies and security
  - Simplify `get_current_active_user` and `get_admin_user` dependencies to use secure authentication
  - Remove any references to custom JWT validation in middleware
  - Ensure all protected endpoints use only Supabase token verification
  - Update optional authentication dependency to use secure methods
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Remove unused imports and clean up authentication modules
  - Remove imports related to JWT library and custom authentication
  - Remove passlib imports and password hashing dependencies
  - Clean up unused authentication utility imports
  - Remove JWT-related environment variable references
  - _Requirements: 2.4, 6.2_

- [ ] 9. Write comprehensive tests for secure authentication flow
  - Create unit tests for Supabase-only token verification
  - Test authentication endpoints with valid and invalid Supabase tokens
  - Test user registration and login flows using only Supabase methods
  - Verify no fallback authentication occurs in any scenario
  - Test protected endpoints reject custom JWT tokens
  - _Requirements: 3.4, 5.1, 5.2, 5.3_

- [ ] 10. Validate security improvements and perform final cleanup
  - Verify no plain-text password handling remains in codebase
  - Confirm no custom JWT generation or verification exists
  - Test that invalid tokens are immediately rejected
  - Ensure all authentication flows use Supabase exclusively
  - Update error messages to be consistent and secure
  - _Requirements: 1.3, 2.1, 3.2, 6.5_