"""
Unit tests for events API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models import Event, User, DifficultyLevel

client = TestClient(app)


# Mock data
mock_user = User(
    id="user-123",
    email="test@example.com",
    full_name="Test User",
    is_admin=False,
    created_at=datetime.utcnow()
)

mock_admin = User(
    id="admin-123",
    email="admin@example.com",
    full_name="Admin User",
    is_admin=True,
    created_at=datetime.utcnow()
)

mock_event = Event(
    id="event-123",
    name="Test Adventure",
    description="A test adventure trip",
    destination="Test Destination",
    price=15999.00,
    max_capacity=20,
    current_bookings=5,
    start_date=datetime.utcnow() + timedelta(days=30),
    end_date=datetime.utcnow() + timedelta(days=33),
    difficulty_level=DifficultyLevel.MODERATE,
    is_active=True,
    created_by="admin-123",
    created_at=datetime.utcnow()
)


class TestEventsAPI:
    """Test cases for events API endpoints"""
    
    @patch('app.services.supabase_service.SupabaseService.get_events')
    def test_get_events_success(self, mock_get_events):
        """Test successful retrieval of events"""
        mock_get_events.return_value = ([mock_event], 1)
        
        response = client.get("/api/events/")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 1
        assert data["total"] == 1
    
    @patch('app.services.supabase_service.SupabaseService.get_events')
    def test_get_events_with_filters(self, mock_get_events):
        """Test events retrieval with filters"""
        mock_get_events.return_value = ([mock_event], 1)
        
        response = client.get(
            "/api/events/",
            params={
                "destination": "Test",
                "difficulty": "Moderate",
                "min_price": 10000,
                "max_price": 20000,
                "limit": 10,
                "offset": 0
            }
        )
        
        assert response.status_code == 200
        mock_get_events.assert_called_once()
    
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_get_event_by_id_success(self, mock_get_event):
        """Test successful retrieval of single event"""
        mock_get_event.return_value = mock_event
        
        response = client.get("/api/events/event-123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "event-123"
        assert data["name"] == "Test Adventure"
    
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_get_event_not_found(self, mock_get_event):
        """Test event not found"""
        mock_get_event.return_value = None
        
        response = client.get("/api/events/nonexistent")
        
        assert response.status_code == 404
        assert "Event not found" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.create_event')
    def test_create_event_success(self, mock_create_event, mock_get_admin):
        """Test successful event creation"""
        mock_get_admin.return_value = mock_admin
        mock_create_event.return_value = mock_event
        
        event_data = {
            "name": "New Adventure",
            "description": "A new adventure trip",
            "destination": "New Destination",
            "price": 18999.00,
            "max_capacity": 25,
            "start_date": (datetime.utcnow() + timedelta(days=60)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=63)).isoformat(),
            "difficulty_level": "Moderate"
        }
        
        response = client.post(
            "/api/events/",
            json=event_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 201
    
    @patch('app.middleware.auth.get_admin_user')
    def test_create_event_validation_error(self, mock_get_admin):
        """Test event creation with validation error"""
        mock_get_admin.return_value = mock_admin
        
        # Invalid data: end date before start date
        event_data = {
            "name": "Invalid Event",
            "start_date": (datetime.utcnow() + timedelta(days=60)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=50)).isoformat(),
        }
        
        response = client.post(
            "/api/events/",
            json=event_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 422
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_event')
    def test_update_event_success(self, mock_update_event, mock_get_event, mock_get_admin):
        """Test successful event update"""
        mock_get_admin.return_value = mock_admin
        mock_get_event.return_value = mock_event
        mock_update_event.return_value = mock_event
        
        update_data = {
            "name": "Updated Adventure",
            "price": 17999.00
        }
        
        response = client.put(
            "/api/events/event-123",
            json=update_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_update_event_not_found(self, mock_get_event, mock_get_admin):
        """Test updating non-existent event"""
        mock_get_admin.return_value = mock_admin
        mock_get_event.return_value = None
        
        update_data = {"name": "Updated Adventure"}
        
        response = client.put(
            "/api/events/nonexistent",
            json=update_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 404
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.delete_event')
    def test_delete_event_success(self, mock_delete_event, mock_get_event, mock_get_admin):
        """Test successful event deletion"""
        mock_get_admin.return_value = mock_admin
        
        # Event with no bookings
        event_no_bookings = Event(**{**mock_event.dict(), "current_bookings": 0})
        mock_get_event.return_value = event_no_bookings
        mock_delete_event.return_value = True
        
        response = client.delete(
            "/api/events/event-123",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 204
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_delete_event_with_bookings(self, mock_get_event, mock_get_admin):
        """Test deleting event with existing bookings"""
        mock_get_admin.return_value = mock_admin
        mock_get_event.return_value = mock_event  # Has 5 bookings
        
        response = client.delete(
            "/api/events/event-123",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 422
        assert "existing bookings" in response.json()["detail"]
    
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_check_availability_success(self, mock_get_event):
        """Test checking event availability"""
        mock_get_event.return_value = mock_event
        
        response = client.get("/api/events/event-123/availability")
        
        assert response.status_code == 200
        data = response.json()
        assert data["event_id"] == "event-123"
        assert data["total_capacity"] == 20
        assert data["current_bookings"] == 5
        assert data["available_seats"] == 15
        assert data["booking_status"] == "open"
    
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_check_availability_full_event(self, mock_get_event):
        """Test checking availability for full event"""
        full_event = Event(**{**mock_event.dict(), "current_bookings": 20})
        mock_get_event.return_value = full_event
        
        response = client.get("/api/events/event-123/availability")
        
        assert response.status_code == 200
        data = response.json()
        assert data["available_seats"] == 0
        assert data["booking_status"] == "full"
    
    def test_unauthorized_create_event(self):
        """Test creating event without admin privileges"""
        event_data = {
            "name": "Unauthorized Event",
            "destination": "Test"
        }
        
        response = client.post("/api/events/", json=event_data)
        
        assert response.status_code == 401
    
    def test_unauthorized_update_event(self):
        """Test updating event without admin privileges"""
        update_data = {"name": "Unauthorized Update"}
        
        response = client.put("/api/events/event-123", json=update_data)
        
        assert response.status_code == 401
    
    def test_unauthorized_delete_event(self):
        """Test deleting event without admin privileges"""
        response = client.delete("/api/events/event-123")
        
        assert response.status_code == 401


# Integration test fixtures
@pytest.fixture
def mock_supabase_service():
    """Mock Supabase service for testing"""
    with patch('app.services.supabase_service.SupabaseService') as mock:
        yield mock


@pytest.fixture
def authenticated_admin_client():
    """Test client with admin authentication"""
    with patch('app.middleware.auth.get_admin_user', return_value=mock_admin):
        yield client


@pytest.fixture
def authenticated_user_client():
    """Test client with user authentication"""
    with patch('app.middleware.auth.get_current_user', return_value=mock_user):
        yield client


# Performance tests
class TestEventsPerformance:
    """Performance tests for events API"""
    
    @patch('app.services.supabase_service.SupabaseService.get_events')
    def test_get_events_large_dataset(self, mock_get_events):
        """Test performance with large dataset"""
        # Mock large dataset
        large_dataset = [mock_event] * 100
        mock_get_events.return_value = (large_dataset, 1000)
        
        response = client.get("/api/events/?limit=100")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 100
        assert data["total"] == 1000
    
    def test_pagination_limits(self):
        """Test pagination parameter limits"""
        # Test maximum limit
        response = client.get("/api/events/?limit=101")
        assert response.status_code == 422  # Validation error
        
        # Test negative offset
        response = client.get("/api/events/?offset=-1")
        assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__])