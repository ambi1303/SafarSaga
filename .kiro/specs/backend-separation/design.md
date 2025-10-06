# Backend Separation Design Document

## Overview

This design outlines the separation of the existing Next.js monolithic application into a dedicated backend service and a pure frontend client. The backend will be built using Express.js with TypeScript, maintaining all existing API functionality while providing better deployment flexibility and scalability.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   Frontend      │ ◄─────────────────► │   Backend       │
│   (Next.js)     │                     │   (Express.js)  │
│   - UI/UX       │                     │   - API Routes  │
│   - Client Logic│                     │   - Auth Logic  │
│   - Static Pages│                     │   - DB Operations│
└─────────────────┘                     └─────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │   Database      │
                                        │   (Supabase)    │
                                        │   - PostgreSQL  │
                                        │   - Auth        │
                                        └─────────────────┘
```

### Directory Structure

```
project/                          # Frontend (Next.js)
├── app/                         # Next.js app directory (no API routes)
├── components/                  # React components
├── lib/                        # Client-side utilities
└── ...                         # Other frontend files

backend/                         # New backend service
├── src/
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, CORS, validation
│   ├── services/               # Business logic
│   ├── types/                  # TypeScript interfaces
│   ├── utils/                  # Helper functions
│   └── app.ts                  # Express app setup
├── package.json                # Backend dependencies
├── tsconfig.json              # TypeScript config
├── .env.example               # Environment variables template
└── vercel.json                # Deployment config
```

## Components and Interfaces

### Backend Components

#### 1. Express Application Setup (`src/app.ts`)
- CORS configuration for frontend communication
- Middleware setup (auth, validation, error handling)
- Route registration
- Health check endpoint

#### 2. Controllers (`src/controllers/`)
- **TripsController**: Handle trip CRUD operations
- **BookingsController**: Manage booking operations
- **GalleryController**: Handle gallery and image operations
- **AuthController**: Authentication middleware integration

#### 3. Services (`src/services/`)
- **SupabaseService**: Database operations and connection management
- **CloudinaryService**: Image management operations
- **AuthService**: User authentication and authorization

#### 4. Middleware (`src/middleware/`)
- **authMiddleware**: JWT token validation
- **adminMiddleware**: Admin role verification
- **corsMiddleware**: Cross-origin request handling
- **errorMiddleware**: Global error handling

### API Endpoints

#### Trips API (`/api/trips`)
```typescript
GET    /api/trips              # Fetch trips with filtering
POST   /api/trips              # Create new trip (admin)
GET    /api/trips/:id          # Get specific trip
PUT    /api/trips/:id          # Update trip (admin)
DELETE /api/trips/:id          # Delete trip (admin)
```

#### Bookings API (`/api/bookings`)
```typescript
GET    /api/bookings           # Fetch user bookings
POST   /api/bookings           # Create new booking
GET    /api/bookings/:id       # Get specific booking
PUT    /api/bookings/:id       # Update booking status (admin)
DELETE /api/bookings/:id       # Cancel booking
```

#### Gallery API (`/api/gallery`)
```typescript
GET    /api/gallery            # Fetch gallery images
POST   /api/gallery            # Handle Cloudinary webhooks
```

#### Health Check (`/health`)
```typescript
GET    /health                 # Service health status
```

### Frontend Updates

#### 1. API Client Service (`lib/api-client.ts`)
```typescript
class ApiClient {
  private baseURL: string
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
  
  // HTTP methods with auth headers
  async get(endpoint: string, options?: RequestOptions)
  async post(endpoint: string, data: any, options?: RequestOptions)
  async put(endpoint: string, data: any, options?: RequestOptions)
  async delete(endpoint: string, options?: RequestOptions)
}
```

#### 2. Environment Configuration
```typescript
// Frontend environment variables
NEXT_PUBLIC_API_URL=http://localhost:3001  # Development
NEXT_PUBLIC_API_URL=https://api.safarsaga.com  # Production
```

## Data Models

### Shared Type Definitions (`backend/src/types/`)

```typescript
// User types
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Trip types
export interface Trip {
  id: string
  name: string
  description: string
  destination: string
  price: number
  max_capacity: number
  current_bookings: number
  start_date: string
  end_date: string
  itinerary?: ItineraryItem[]
  inclusions?: string[]
  exclusions?: string[]
  difficulty_level?: string
  featured_image_url?: string
  gallery_images?: string[]
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Booking types
export interface Booking {
  id: string
  user_id: string
  event_id: string
  seats: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_method?: string
  transaction_id?: string
  special_requests?: string
  booked_at: string
  payment_confirmed_at?: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  limit: number
  offset: number
}
```

## Error Handling

### Backend Error Handling

#### 1. Global Error Middleware
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
```

#### 2. Custom Error Classes
```typescript
export class ApiError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401)
  }
}
```

### Frontend Error Handling

#### 1. API Client Error Handling
```typescript
class ApiClient {
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API request failed')
    }
    return response.json()
  }
}
```

#### 2. React Error Boundaries
- Implement error boundaries for API call failures
- Show user-friendly error messages
- Retry mechanisms for failed requests

## Testing Strategy

### Backend Testing

#### 1. Unit Tests
- **Controllers**: Test route handlers with mocked services
- **Services**: Test business logic with mocked database calls
- **Middleware**: Test authentication and validation logic

#### 2. Integration Tests
- **API Endpoints**: Test complete request/response cycles
- **Database Operations**: Test Supabase integration
- **Authentication Flow**: Test JWT token validation

#### 3. Testing Tools
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "supertest": "^6.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### Frontend Testing

#### 1. API Integration Tests
- Test API client methods
- Mock backend responses
- Test error handling scenarios

#### 2. Component Tests
- Test components that make API calls
- Mock API responses
- Test loading and error states

## Deployment Configuration

### Backend Deployment

#### 1. Vercel Configuration (`backend/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 2. Environment Variables
```bash
# Backend environment variables
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=https://safarsaga.com
```

### Frontend Deployment

#### 1. Updated Environment Variables
```bash
# Frontend environment variables
NEXT_PUBLIC_API_URL=https://api-safarsaga.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. Build Configuration
- Remove API routes from Next.js build
- Update API calls to use external backend URL
- Configure CORS for cross-origin requests

## Security Considerations

### Backend Security

#### 1. CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

#### 2. Authentication
- JWT token validation middleware
- Supabase auth integration
- Role-based access control

#### 3. Input Validation
- Request body validation using Zod
- SQL injection prevention
- Rate limiting for API endpoints

### Frontend Security

#### 1. Environment Variables
- Use NEXT_PUBLIC_ prefix only for client-safe variables
- Keep sensitive keys on backend only

#### 2. API Communication
- Always use HTTPS in production
- Include auth tokens in request headers
- Handle token refresh logic

## Migration Strategy

### Phase 1: Backend Setup
1. Create backend directory structure
2. Set up Express.js application
3. Configure TypeScript and build tools
4. Set up testing framework

### Phase 2: API Migration
1. Migrate trips API endpoints
2. Migrate bookings API endpoints  
3. Migrate gallery API endpoints
4. Test all endpoints independently

### Phase 3: Frontend Updates
1. Create API client service
2. Update all API calls to use new backend
3. Remove API routes from Next.js
4. Update environment configuration

### Phase 4: Deployment
1. Deploy backend to Vercel/Railway
2. Update frontend environment variables
3. Deploy updated frontend
4. Test end-to-end functionality

### Phase 5: Cleanup
1. Remove unused API route files
2. Clean up dependencies
3. Update documentation
4. Monitor performance and errors