# SafarSaga Backend API

Backend service for the SafarSaga Travel Platform, providing RESTful APIs for trip management, bookings, and gallery operations.

## Features

- **Trip Management**: CRUD operations for travel packages
- **Booking System**: Handle reservations and payments
- **Gallery Management**: Image operations with Cloudinary integration
- **Authentication**: JWT-based auth with Supabase
- **FastAPI**: High-performance API with automatic documentation
- **Type Safety**: Full Pydantic models and type hints

## Tech Stack

- **Runtime**: Python 3.9+
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudinary
- **Testing**: Pytest
- **Documentation**: Auto-generated OpenAPI/Swagger

## Getting Started

### Prerequisites

- Python 3.9+
- pip or poetry
- Supabase account and project
- Cloudinary account

### Installation

#### Quick Setup (Recommended)

1. Create virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

2. Run installation script:
```bash
python install.py
```

3. Update `.env` with your credentials:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Manual Installation

1. Create virtual environment and activate it
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and update values

### Development

#### Quick Start
```bash
python start.py
```

#### Manual Start
```bash
uvicorn app.main:app --reload --port 8000
```

#### Alternative Start
```bash
python -m app.main
```

The API will be available at:
- **API**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Testing

Run tests:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app
```

### Code Quality

Format code:
```bash
black app/
```

Lint code:
```bash
flake8 app/
```

Type checking:
```bash
mypy app/
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Trips
- `GET /api/trips` - List trips with filtering
- `POST /api/trips` - Create new trip (admin)
- `GET /api/trips/:id` - Get specific trip
- `PUT /api/trips/:id` - Update trip (admin)
- `DELETE /api/trips/:id` - Delete trip (admin)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking (admin)
- `DELETE /api/bookings/:id` - Cancel booking

### Gallery
- `GET /api/gallery` - Fetch gallery images
- `POST /api/gallery` - Handle Cloudinary webhooks

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Environment Variables

Set these in your deployment platform:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CORS_ORIGIN`

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, CORS, validation
│   ├── services/        # Business logic
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helper functions
│   └── app.ts          # Express app setup
├── dist/               # Compiled JavaScript
├── coverage/           # Test coverage reports
└── package.json        # Dependencies and scripts
```
## AP
I Endpoints

### Health Check
- `GET /health` - Service health status

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

### Trips
- `GET /api/trips` - List trips with filtering
- `POST /api/trips` - Create new trip (admin)
- `GET /api/trips/{id}` - Get specific trip
- `PUT /api/trips/{id}` - Update trip (admin)
- `DELETE /api/trips/{id}` - Delete trip (admin)

### Bookings
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get specific booking
- `PUT /api/bookings/{id}` - Update booking (admin)
- `DELETE /api/bookings/{id}` - Cancel booking

### Gallery
- `GET /api/gallery` - Fetch gallery images
- `POST /api/gallery` - Handle Cloudinary webhooks

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/main.py"
    }
  ]
}
```

3. Deploy:
```bash
vercel
```

### Railway

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables

Set these in your deployment platform:

- `ENVIRONMENT=production`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CORS_ORIGINS`

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app setup
│   ├── models/             # Pydantic models
│   ├── routers/            # API route handlers
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, CORS, validation
│   └── utils/              # Helper functions
├── tests/                  # Test files
├── requirements.txt        # Python dependencies
├── pyproject.toml         # Project configuration
└── README.md              # This file
```

## FastAPI Features

- **Automatic Documentation**: Interactive API docs at `/docs`
- **Type Safety**: Full Pydantic validation and serialization
- **High Performance**: Built on Starlette and Pydantic
- **Modern Python**: Async/await support throughout
- **Standards-based**: OpenAPI and JSON Schema