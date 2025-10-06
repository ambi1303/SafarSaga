# Social Authentication Setup Guide

## Overview
SafarSaga now supports comprehensive social authentication with Google, Facebook, and GitHub sign-in options. This guide will help you set up the required credentials and environment variables.

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Google Sign-In Setup

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
8. Copy the Client ID and add it to your environment variables

### 2. Configure Google Sign-In

The Google Sign-In is automatically loaded and configured in the `SocialLogin` component. No additional setup required on the frontend.

## Facebook Sign-In Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Facebook Login" product to your app
4. In Facebook Login settings, add valid OAuth redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
5. Copy the App ID and add it to your environment variables

### 2. Configure Facebook SDK

The Facebook SDK is automatically loaded in the `SocialLogin` component. The configuration includes:
- Email and public profile permissions
- Secure cookie handling
- Latest API version (v18.0)

## GitHub Sign-In Setup

### 1. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: SafarSaga
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback` (development)
4. Copy the Client ID and add it to your environment variables
5. Generate a Client Secret (needed for backend)

### 2. GitHub OAuth Flow

The GitHub OAuth flow works as follows:
1. User clicks "Continue with GitHub"
2. User is redirected to GitHub authorization page
3. After authorization, GitHub redirects to `/auth/github/callback`
4. The callback page handles the authorization code and completes sign-in

## Backend Integration

### Required Backend Endpoints

Your backend should implement these endpoints for social authentication:

```python
# FastAPI example endpoints

@app.post("/auth/social")
async def social_auth(auth_request: SocialAuthRequest):
    """Handle social authentication"""
    if auth_request.provider == "google":
        # Verify Google ID token
        user_info = verify_google_token(auth_request.credential)
    elif auth_request.provider == "facebook":
        # Verify Facebook access token
        user_info = verify_facebook_token(auth_request.credential)
    elif auth_request.provider == "github":
        # Exchange GitHub code for access token
        user_info = verify_github_code(auth_request.credential)
    
    # Create or update user
    user = create_or_update_social_user(user_info, auth_request.provider)
    
    # Generate JWT token
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
```

### Social Auth Request Schema

```python
class SocialAuthRequest(BaseModel):
    provider: Literal["google", "facebook", "github"]
    credential: str  # ID token for Google, access token for Facebook, code for GitHub
    client_id: Optional[str] = None
```

### User Model Updates

Update your user model to support social authentication:

```python
class User(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    provider: Optional[str] = "email"  # "email", "google", "facebook", "github"
    is_verified: bool = False
    # ... other fields
```

## Security Considerations

### 1. Token Verification

Always verify social authentication tokens on the backend:

- **Google**: Verify ID tokens using Google's token verification API
- **Facebook**: Verify access tokens using Facebook's debug token API
- **GitHub**: Exchange authorization codes for access tokens securely

### 2. HTTPS in Production

Always use HTTPS in production for OAuth redirects and token exchange.

### 3. Environment Variables

Keep all client IDs and secrets secure:
- Use environment variables
- Never commit secrets to version control
- Use different credentials for development and production

### 4. CORS Configuration

Configure CORS properly for social authentication:

```python
# FastAPI CORS example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing Social Authentication

### 1. Development Testing

1. Set up test apps with each provider
2. Use localhost URLs for development
3. Test the complete flow: click → redirect → callback → sign-in

### 2. Error Handling

Test error scenarios:
- User cancels authentication
- Invalid tokens
- Network errors
- Backend errors

### 3. User Experience

Verify:
- Loading states during authentication
- Error messages are user-friendly
- Successful authentication redirects properly
- User profile data is populated correctly

## Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check client ID is correct
   - Verify authorized domains are configured

2. **CORS errors**
   - Ensure backend CORS is configured for your domain
   - Check redirect URIs match exactly

3. **Token verification fails**
   - Verify backend token validation logic
   - Check API keys and secrets

4. **Redirect loops**
   - Check redirect URI configuration
   - Verify callback handling logic

### Debug Tips

1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check backend logs for authentication errors
4. Test with different browsers and incognito mode

## Production Deployment

### 1. Update Environment Variables

Replace development values with production values:
- Use production domain URLs
- Use production OAuth app credentials
- Enable HTTPS

### 2. Update OAuth App Settings

Update redirect URIs in each provider's console:
- Google Cloud Console
- Facebook Developers
- GitHub OAuth Apps

### 3. Test Production Flow

Thoroughly test the complete authentication flow in production environment.

## Features Included

### ✅ Google Sign-In
- One-click Google authentication
- Automatic user profile import
- Secure token verification

### ✅ Facebook Sign-In
- Facebook Login integration
- Email and profile permissions
- Secure token handling

### ✅ GitHub Sign-In
- GitHub OAuth flow
- Developer-friendly authentication
- Secure code exchange

### ✅ Enhanced User Experience
- Loading states during authentication
- Error handling and user feedback
- Seamless integration with existing auth flow
- Responsive design for all devices

### ✅ Security Features
- Secure token storage
- Backend token verification
- HTTPS enforcement in production
- CORS protection

## Support

For issues with social authentication setup:

1. Check the provider's documentation
2. Verify environment variables are set correctly
3. Test with browser dev tools open
4. Check backend logs for errors

The social authentication system is now fully integrated and ready for production use!