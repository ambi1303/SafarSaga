"""
Unit tests for bookings API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch
from decimal import Decimal

from app.main import app
from app.models import Booking, User, Event, BookingStatus, PaymentStatus, DifficultyLevel

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
    price=Decimal('15999.00'),
    max_capacity=20,
    current_bookings=5,
    start_date=datetime.utcnow() + timedelta(days=30),
    end_date=datetime.utcnow() + timedelta(days=33),
    difficulty_level=DifficultyLevel.MODERATE,
    is_active=True,
    created_by="admin-123",
    created_at=datetime.utcnow()
)

mock_booking = Booking(
    id="booking-123",
    user_id="user-123",
    event_id="event-123",
    seats=2,
    total_amount=Decimal('31998.00'),
    booking_status=BookingStatus.PENDING,
    payment_status=PaymentStatus.UNPAID,
    special_requests="Vegetarian meals",
    booked_at=datetime.utcnow(),
    user=mock_user,
    event=mock_event
)


class TestBookingsAPI:
    """Test cases for bookings API endpoints"""
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_get_bookings_user_success(self, mock_get_bookings, mock_get_user):
        """Test successful retrieval of user's bookings"""
        mock_get_user.return_value = mock_user
        mock_get_bookings.return_value = ([mock_booking], 1)
        
        response = client.get(
            "/api/bookings/",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 1
        assert data["total"] == 1
        
        # Verify user filter was applied
        mock_get_bookings.assert_called_once()
        call_args = mock_get_bookings.call_args
        assert call_args[0][0]["user_id"] == "user-123"
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_get_bookings_admin_success(self, mock_get_bookings, mock_get_user):
        """Test admin can see all bookings"""
        mock_get_user.return_value = mock_admin
        mock_get_bookings.return_value = ([mock_booking], 1)
        
        response = client.get(
            "/api/bookings/",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        
        # Verify no user filter was applied for admin
        mock_get_bookings.assert_called_once()
        call_args = mock_get_bookings.call_args
        assert "user_id" not in call_args[0][0]
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_get_bookings_with_filters(self, mock_get_bookings, mock_get_user):
        """Test bookings retrieval with filters"""
        mock_get_user.return_value = mock_admin
        mock_get_bookings.return_value = ([mock_booking], 1)
        
        response = client.get(
            "/api/bookings/",
            params={
                "event_id": "event-123",
                "booking_status": "pending",
                "payment_status": "unpaid",
                "limit": 10,
                "offset": 0
            },
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        mock_get_bookings.assert_called_once()
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    def test_get_booking_by_id_success(self, mock_get_booking, mock_get_user):
        """Test successful retrieval of single booking"""
        mock_get_user.return_value = mock_user
        mock_get_booking.return_value = mock_booking
        
        response = client.get(
            "/api/bookings/booking-123",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "booking-123"
        assert data["seats"] == 2
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    def test_get_booking_access_denied(self, mock_get_booking, mock_get_user):
        """Test access denied for other user's booking"""
        mock_get_user.return_value = mock_user
        
        # Booking belongs to different user
        other_booking = Booking(**{**mock_booking.dict(), "user_id": "other-user"})
        mock_get_booking.return_value = other_booking
        
        response = client.get(
            "/api/bookings/booking-123",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 403
        assert "Access denied" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    @patch('app.services.supabase_service.SupabaseService.create_booking')
    def test_create_booking_success(self, mock_create_booking, mock_get_bookings, mock_get_event, mock_get_user):
        """Test successful booking creation"""
        mock_get_user.return_value = mock_user
        mock_get_event.return_value = mock_event
        mock_get_bookings.return_value = ([], 0)  # No existing bookings
        mock_create_booking.return_value = mock_booking
        
        booking_data = {
            "event_id": "event-123",
            "seats": 2,
            "special_requests": "Vegetarian meals"
        }
        
        response = client.post(
            "/api/bookings/",
            json=booking_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["event_id"] == "event-123"
        assert data["seats"] == 2
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_create_booking_event_not_found(self, mock_get_event, mock_get_user):
        """Test booking creation with non-existent event"""
        mock_get_user.return_value = mock_user
        mock_get_event.return_value = None
        
        booking_data = {
            "event_id": "nonexistent",
            "seats": 2
        }
        
        response = client.post(
            "/api/bookings/",
            json=booking_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    def test_create_booking_insufficient_capacity(self, mock_get_event, mock_get_user):
        """Test booking creation with insufficient capacity"""
        mock_get_user.return_value = mock_user
        
        # Event with limited capacity
        full_event = Event(**{**mock_event.dict(), "current_bookings": 19})
        mock_get_event.return_value = full_event
        
        booking_data = {
            "event_id": "event-123",
            "seats": 5  # More than available (20 - 19 = 1)
        }
        
        response = client.post(
            "/api/bookings/",
            json=booking_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422
        assert "capacity" in response.json()["detail"].lower()
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_create_booking_duplicate(self, mock_get_bookings, mock_get_event, mock_get_user):
        """Test booking creation with existing active booking"""
        mock_get_user.return_value = mock_user
        mock_get_event.return_value = mock_event
        mock_get_bookings.return_value = ([mock_booking], 1)  # Existing booking
        
        booking_data = {
            "event_id": "event-123",
            "seats": 2
        }
        
        response = client.post(
            "/api/bookings/",
            json=booking_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422
        assert "already have" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_booking')
    def test_update_booking_user_success(self, mock_update_booking, mock_get_event, mock_get_booking, mock_get_user):
        """Test successful booking update by user"""
        mock_get_user.return_value = mock_user
        mock_get_booking.return_value = mock_booking
        mock_get_event.return_value = mock_event
        mock_update_booking.return_value = mock_booking
        
        update_data = {
            "special_requests": "Updated requests"
        }
        
        response = client.put(
            "/api/bookings/booking-123",
            json=update_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 200
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_booking')
    def test_update_booking_admin_success(self, mock_update_booking, mock_get_event, mock_get_booking, mock_get_user):
        """Test successful booking update by admin"""
        mock_get_user.return_value = mock_admin
        mock_get_booking.return_value = mock_booking
        mock_get_event.return_value = mock_event
        mock_update_booking.return_value = mock_booking
        
        update_data = {
            "booking_status": "confirmed",
            "payment_status": "paid"
        }
        
        response = client.put(
            "/api/bookings/booking-123",
            json=update_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    @patch('app.services.supabase_service.SupabaseService.get_event_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_booking')
    def test_cancel_booking_success(self, mock_update_booking, mock_get_event, mock_get_booking, mock_get_user):
        """Test successful booking cancellation"""
        mock_get_user.return_value = mock_user
        mock_get_booking.return_value = mock_booking
        mock_get_event.return_value = mock_event
        mock_update_booking.return_value = mock_booking
        
        response = client.delete(
            "/api/bookings/booking-123",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 204
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    def test_cancel_booking_already_cancelled(self, mock_get_booking, mock_get_user):
        """Test cancelling already cancelled booking"""
        mock_get_user.return_value = mock_user
        
        cancelled_booking = Booking(**{**mock_booking.dict(), "booking_status": BookingStatus.CANCELLED})
        mock_get_booking.return_value = cancelled_booking
        
        response = client.delete(
            "/api/bookings/booking-123",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422
        assert "already cancelled" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    def test_get_payment_info_success(self, mock_get_booking, mock_get_user):
        """Test successful payment info retrieval"""
        mock_get_user.return_value = mock_user
        mock_get_booking.return_value = mock_booking
        
        response = client.get(
            "/api/bookings/booking-123/payment-info",
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["booking_id"] == "booking-123"
        assert data["total_amount"] == float(mock_booking.total_amount)
        assert data["payment_status"] == mock_booking.payment_status.value
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_booking')
    def test_confirm_payment_success(self, mock_update_booking, mock_get_booking, mock_get_user):
        """Test successful payment confirmation"""
        mock_get_user.return_value = mock_user
        mock_get_booking.return_value = mock_booking
        
        confirmed_booking = Booking(**{
            **mock_booking.dict(), 
            "payment_status": PaymentStatus.PAID,
            "booking_status": BookingStatus.CONFIRMED
        })
        mock_update_booking.return_value = confirmed_booking
        
        payment_data = {
            "transaction_id": "TXN123456789",
            "payment_method": "UPI"
        }
        
        response = client.post(
            "/api/bookings/booking-123/confirm-payment",
            json=payment_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "confirmed"
        assert data["transaction_id"] == "TXN123456789"
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_booking_by_id')
    def test_confirm_payment_already_paid(self, mock_get_booking, mock_get_user):
        """Test confirming payment for already paid booking"""
        mock_get_user.return_value = mock_user
        
        paid_booking = Booking(**{**mock_booking.dict(), "payment_status": PaymentStatus.PAID})
        mock_get_booking.return_value = paid_booking
        
        payment_data = {
            "transaction_id": "TXN123456789"
        }
        
        response = client.post(
            "/api/bookings/booking-123/confirm-payment",
            json=payment_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422
        assert "already confirmed" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_get_user_bookings_admin(self, mock_get_bookings, mock_get_admin):
        """Test admin getting specific user's bookings"""
        mock_get_admin.return_value = mock_admin
        mock_get_bookings.return_value = ([mock_booking], 1)
        
        response = client.get(
            "/api/bookings/user/user-123",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_get_booking_stats_admin(self, mock_get_bookings, mock_get_admin):
        """Test admin getting booking statistics"""
        mock_get_admin.return_value = mock_admin
        
        # Mock various booking statuses
        bookings = [
            mock_booking,
            Booking(**{**mock_booking.dict(), "id": "booking-2", "booking_status": BookingStatus.CONFIRMED, "payment_status": PaymentStatus.PAID}),
            Booking(**{**mock_booking.dict(), "id": "booking-3", "booking_status": BookingStatus.CANCELLED})
        ]
        mock_get_bookings.return_value = (bookings, 3)
        
        response = client.get(
            "/api/bookings/stats/summary",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_bookings"] == 3
        assert data["pending_bookings"] == 1
        assert data["confirmed_bookings"] == 1
        assert data["cancelled_bookings"] == 1
        assert "total_revenue" in data
        assert "popular_events" in data
    
    def test_unauthorized_access(self):
        """Test unauthorized access to bookings"""
        response = client.get("/api/bookings/")
        assert response.status_code == 401
    
    def test_validation_errors(self):
        """Test validation errors"""
        # Invalid seats count
        booking_data = {
            "event_id": "event-123",
            "seats": 0  # Invalid
        }
        
        response = client.post(
            "/api/bookings/",
            json=booking_data,
            headers={"Authorization": "Bearer fake-token"}
        )
        
        assert response.status_code == 422


# Performance and edge case tests
class TestBookingsPerformance:
    """Performance and edge case tests for bookings API"""
    
    @patch('app.middleware.auth.get_current_user')
    @patch('app.services.supabase_service.SupabaseService.get_bookings')
    def test_large_booking_list(self, mock_get_bookings, mock_get_user):
        """Test performance with large booking dataset"""
        mock_get_user.return_value = mock_admin
        
        # Mock large dataset
        large_dataset = [mock_booking] * 100
        mock_get_bookings.return_value = (large_dataset, 1000)
        
        response = client.get(
            "/api/bookings/?limit=100",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 100
        assert data["total"] == 1000
    
    def test_pagination_limits(self):
        """Test pagination parameter limits"""
        # Test maximum limit
        response = client.get(
            "/api/bookings/?limit=101",
            headers={"Authorization": "Bearer fake-token"}
        )
        assert response.status_code == 422
        
        # Test negative offset
        response = client.get(
            "/api/bookings/?offset=-1",
            headers={"Authorization": "Bearer fake-token"}
        )
        assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__])