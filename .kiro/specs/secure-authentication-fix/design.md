# Design Document

## Overview

This design document outlines the comprehensive refactoring of the authentication system to eliminate security vulnerabilities and implement proper Supabase-based authentication. The current system has dangerous parallel authentication mechanisms that expose users to security risks through plain-text password handling, custom JWT generation, and insecure fallback logic.

## Architecture

### Current Architecture Issues

The existing authentication system has several critical flaws:

1. **Parallel Authentication Systems**: Both custom JWT and Supabase tokens are supported with dangerous fallback logic
2. **Plain-text Password Exposure**: Backend processes and stores plain-text passwords
3. **Custom JWT Generation**: Insecure custom token creation bypassing Supabase security
4. **Dangerous Fallback Logic**: Failed Supabase tokens fall back to custom validation
5. **Password Utilities**: Custom password hashing/verification that shouldn't exist

### Target Architecture

The secure architecture will implement:

1. **Single Authentication Source**: Only Supabase auth tokens will be accepted
2. **Zero Password Exposure**: Backend never sees plain-text passwords
3. **Secure Token Verification**: Only Supabase's built-in token verification
4. **Fail-Secure Logic**: Invalid tokens are immediately rejected
5. **Clean Dependencies**: Simplified authentication middleware

## Components and Interfaces

### 1. Authentication Middleware Refactoring

**File**: `backend/app/middleware/auth.py`

**Changes Required**:
- Remove `AuthUtils` class entirely
- Remove `create_access_token` method from `AuthMiddleware`
- Remove `verify_token` method (custom JWT verification)
- Simplify `get_current_user` to use only Supabase verification
- Remove JWT configuration constants (`JWT_SECRET`, `JWT_ALGORITHM`, etc.)
- Remove dangerous fallback logic in authentication

**New Interface**:
```python
class AuthMiddleware:
    @staticmethod
    async def verify_supabase_token(token: str) -> dict:
        """Verify Supabase JWT token - ONLY method for token verification"""
        
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user - simplified, secure implementation"""
```

### 2. Supabase Service Authentication Methods

**File**: `backend/app/services/supabase_service.py`

**Changes Required**:
- Ensure `get_user_from_token` uses proper Supabase auth verification
- Remove any custom user creation logic that bypasses Supabase auth
- Implement proper user registration through Supabase auth.sign_up

**Enhanced Interface**:
```python
class SupabaseService:
    async def create_authenticated_user(self, email: str, password: str, metadata: dict) -> dict:
        """Create user through Supabase auth.sign_up"""
        
    async def authenticate_user(self, email: str, password: str) -> dict:
        """Authenticate user through Supabase auth.sign_in_with_password"""
        
    async def get_user_from_token(self, token: str) -> Optional[dict]:
        """Verify token and get user through Supabase auth.get_user"""
```

### 3. Authentication Routes Refactoring

**File**: `backend/app/routers/auth.py`

**Changes Required**:
- Refactor `/signup` to use only `supabase.auth.sign_up`
- Refactor `/login` to use only `supabase.auth.sign_in_with_password`
- Remove custom JWT token generation
- Use Supabase tokens directly in responses
- Simplify `/logout` to use `supabase.auth.sign_out`
- Remove password validation logic (handled by Supabase)

**New Endpoint Behavior**:
```python
@router.post("/signup")
async def signup(signup_data: SignupRequest):
    # Use ONLY Supabase auth.sign_up
    # Return Supabase-generated tokens
    
@router.post("/login") 
async def login(login_data: LoginRequest):
    # Use ONLY Supabase auth.sign_in_with_password
    # Return Supabase-generated tokens
```

## Data Models

### Authentication Models

**No changes required** to the following models as they remain compatible:
- `User` - Core user model
- `LoginRequest` - Login request structure  
- `LoginResponse` - Login response structure
- `TokenData` - Token data structure (will be simplified)

### Removed Models/Classes

The following will be completely removed:
- `AuthUtils` class and all its methods
- Custom JWT configuration constants
- Custom password hashing/verification utilities
- Fallback authentication logic

## Error Handling

### Simplified Error Flow

**Current Complex Flow**:
1. Try Supabase token verification
2. If fails, try custom JWT verification  
3. If fails, try fallback authentication
4. Multiple error paths and security holes

**New Secure Flow**:
1. Verify token with Supabase auth.get_user
2. If verification fails, immediately reject with 401
3. Single error path, fail-secure behavior

### Error Response Standardization

All authentication errors will use consistent error responses:
```python
# Invalid token - immediate rejection
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired token"
)

# Registration conflicts
raise HTTPException(
    status_code=status.HTTP_409_CONFLICT, 
    detail="User already exists"
)
```

## Testing Strategy

### Unit Tests

**Authentication Middleware Tests**:
- Test `verify_supabase_token` with valid tokens
- Test `verify_supabase_token` with invalid tokens
- Test `get_current_user` dependency with valid authentication
- Test `get_current_user` dependency with invalid authentication
- Verify no fallback authentication occurs

**Supabase Service Tests**:
- Test user registration through `auth.sign_up`
- Test user authentication through `auth.sign_in_with_password`
- Test token verification through `auth.get_user`
- Test user profile creation/linking

**Authentication Routes Tests**:
- Test `/signup` endpoint with valid data
- Test `/signup` endpoint with duplicate email
- Test `/login` endpoint with valid credentials
- Test `/login` endpoint with invalid credentials
- Test `/logout` endpoint functionality
- Test protected endpoints with Supabase tokens

### Integration Tests

**End-to-End Authentication Flow**:
- Complete user registration flow
- Complete user login flow
- Token-based API access
- Token expiration handling
- User profile management

**Security Tests**:
- Verify no plain-text password exposure
- Verify no custom JWT acceptance
- Verify proper token validation
- Verify fail-secure behavior
- Test for authentication bypass attempts

### Security Validation

**Code Review Checklist**:
- [ ] No plain-text password handling in backend
- [ ] No custom JWT generation or verification
- [ ] No fallback authentication logic
- [ ] Only Supabase auth methods used
- [ ] Proper error handling without information leakage
- [ ] All authentication endpoints use Supabase exclusively

**Penetration Testing**:
- Attempt to bypass authentication with custom tokens
- Test for password exposure in logs/responses
- Verify token validation cannot be circumvented
- Test for timing attacks on authentication endpoints

## Implementation Phases

### Phase 1: Remove Dangerous Code
1. Remove `AuthUtils` class completely
2. Remove custom JWT generation methods
3. Remove fallback authentication logic
4. Remove JWT configuration constants

### Phase 2: Implement Secure Authentication
1. Refactor `get_current_user` to use only Supabase verification
2. Update authentication routes to use only Supabase methods
3. Ensure proper error handling

### Phase 3: Testing and Validation
1. Implement comprehensive unit tests
2. Perform security validation
3. Test all authentication flows
4. Verify no security regressions

### Phase 4: Cleanup and Documentation
1. Remove unused imports and dependencies
2. Update API documentation
3. Update environment variable requirements
4. Document security improvements

## Security Considerations

### Eliminated Vulnerabilities

1. **Plain-text Password Exposure**: Completely eliminated by using only Supabase auth
2. **Custom JWT Vulnerabilities**: Removed by eliminating custom token generation
3. **Authentication Bypass**: Prevented by removing fallback logic
4. **Token Validation Weaknesses**: Fixed by using only Supabase verification

### Enhanced Security Features

1. **Single Source of Truth**: Only Supabase handles authentication
2. **Fail-Secure Design**: Invalid tokens are immediately rejected
3. **No Password Handling**: Backend never processes plain-text passwords
4. **Proper Token Lifecycle**: Supabase manages token generation, validation, and expiration

### Environment Variables

**Removed Variables**:
- `JWT_SECRET` - No longer needed
- `JWT_ALGORITHM` - No longer needed
- `JWT_EXPIRATION_HOURS` - No longer needed

**Required Variables** (unchanged):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Migration Considerations

### Backward Compatibility

**Breaking Changes**:
- Custom JWT tokens will no longer be accepted
- Users with custom tokens must re-authenticate
- Password reset flows must use Supabase methods

**Migration Strategy**:
1. Deploy new authentication system
2. Invalidate all existing custom JWT tokens
3. Force re-authentication for all users
4. Update frontend to handle new token format

### Database Considerations

**User Table**:
- No changes required to user table structure
- Existing user records remain compatible
- User IDs will continue to match Supabase auth user IDs

**Authentication Flow**:
- New users will be created through Supabase auth.sign_up
- Existing users can continue logging in through Supabase auth.sign_in_with_password
- User profiles will be properly linked to Supabase auth users