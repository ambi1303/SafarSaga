"""
Unit tests for gallery API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
from io import BytesIO

from app.main import app
from app.models import GalleryImage, User

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

mock_gallery_image = GalleryImage(
    id="image-123",
    cloudinary_public_id="safarsaga/test_image_123",
    url="https://res.cloudinary.com/test/image/upload/v123/safarsaga/test_image_123.jpg",
    filename="test_image.jpg",
    alt_text="Test image",
    caption="A test image",
    description="This is a test image for the gallery",
    tags=["test", "gallery", "image"],
    event_id="event-123",
    uploaded_by="admin-123",
    is_featured=False,
    uploaded_at=datetime.utcnow()
)


class TestGalleryAPI:
    """Test cases for gallery API endpoints"""
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_get_gallery_images_success(self, mock_get_images):
        """Test successful retrieval of gallery images"""
        mock_get_images.return_value = ([mock_gallery_image], 1)
        
        response = client.get("/api/gallery/")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 1
        assert data["total"] == 1
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_get_gallery_images_with_filters(self, mock_get_images):
        """Test gallery images retrieval with filters"""
        mock_get_images.return_value = ([mock_gallery_image], 1)
        
        response = client.get(
            "/api/gallery/",
            params={
                "tags": "test,gallery",
                "event_id": "event-123",
                "is_featured": "true",
                "max_results": 10
            }
        )
        
        assert response.status_code == 200
        mock_get_images.assert_called_once()
    
    @patch('app.services.cloudinary_service.CloudinaryService.search_images')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_get_gallery_images_with_search(self, mock_get_images, mock_search):
        """Test gallery images search functionality"""
        mock_get_images.return_value = ([mock_gallery_image], 1)
        mock_search.return_value = {
            "images": [{
                "public_id": "safarsaga/test_image_123",
                "url": "https://res.cloudinary.com/test/image/upload/v123/safarsaga/test_image_123.jpg",
                "tags": ["test"]
            }],
            "total_count": 1
        }
        
        response = client.get(
            "/api/gallery/",
            params={"query": "test"}
        )
        
        assert response.status_code == 200
        mock_search.assert_called_once()
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    def test_get_gallery_image_by_id_success(self, mock_get_image):
        """Test successful retrieval of single gallery image"""
        mock_get_image.return_value = mock_gallery_image
        
        response = client.get("/api/gallery/image-123")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "image-123"
        assert data["filename"] == "test_image.jpg"
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    def test_get_gallery_image_not_found(self, mock_get_image):
        """Test gallery image not found"""
        mock_get_image.return_value = None
        
        response = client.get("/api/gallery/nonexistent")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.cloudinary_service.CloudinaryService.upload_image')
    @patch('app.services.supabase_service.SupabaseService.create_gallery_image')
    def test_upload_image_success(self, mock_create_image, mock_upload, mock_get_admin):
        """Test successful image upload"""
        mock_get_admin.return_value = mock_admin
        mock_upload.return_value = {
            "public_id": "safarsaga/test_image_123",
            "url": "https://res.cloudinary.com/test/image/upload/v123/safarsaga/test_image_123.jpg"
        }
        mock_create_image.return_value = mock_gallery_image
        
        # Create a mock file
        file_content = b"fake image content"
        files = {"file": ("test.jpg", BytesIO(file_content), "image/jpeg")}
        data = {
            "alt_text": "Test image",
            "caption": "A test image",
            "tags": "test,gallery"
        }
        
        response = client.post(
            "/api/gallery/upload",
            files=files,
            data=data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 201
        mock_upload.assert_called_once()
        mock_create_image.assert_called_once()
    
    @patch('app.middleware.auth.get_admin_user')
    def test_upload_image_invalid_file_type(self, mock_get_admin):
        """Test upload with invalid file type"""
        mock_get_admin.return_value = mock_admin
        
        # Create a mock non-image file
        file_content = b"not an image"
        files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
        
        response = client.post(
            "/api/gallery/upload",
            files=files,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 422
        assert "must be an image" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_admin_user')
    def test_upload_image_file_too_large(self, mock_get_admin):
        """Test upload with file too large"""
        mock_get_admin.return_value = mock_admin
        
        # Create a mock large file (>10MB)
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        files = {"file": ("large.jpg", BytesIO(large_content), "image/jpeg")}
        
        response = client.post(
            "/api/gallery/upload",
            files=files,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 422
        assert "10MB" in response.json()["detail"]
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    @patch('app.services.supabase_service.SupabaseService.update_gallery_image')
    def test_update_gallery_image_success(self, mock_update_image, mock_get_image, mock_get_admin):
        """Test successful gallery image update"""
        mock_get_admin.return_value = mock_admin
        mock_get_image.return_value = mock_gallery_image
        mock_update_image.return_value = mock_gallery_image
        
        update_data = {
            "alt_text": "Updated alt text",
            "caption": "Updated caption",
            "tags": ["updated", "test"]
        }
        
        response = client.put(
            "/api/gallery/image-123",
            json=update_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        mock_update_image.assert_called_once()
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    def test_update_gallery_image_not_found(self, mock_get_image, mock_get_admin):
        """Test updating non-existent gallery image"""
        mock_get_admin.return_value = mock_admin
        mock_get_image.return_value = None
        
        update_data = {"alt_text": "Updated alt text"}
        
        response = client.put(
            "/api/gallery/nonexistent",
            json=update_data,
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 404
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    @patch('app.services.supabase_service.SupabaseService.delete_gallery_image')
    @patch('app.services.cloudinary_service.CloudinaryService.delete_image')
    def test_delete_gallery_image_success(self, mock_cloudinary_delete, mock_db_delete, mock_get_image, mock_get_admin):
        """Test successful gallery image deletion"""
        mock_get_admin.return_value = mock_admin
        mock_get_image.return_value = mock_gallery_image
        mock_db_delete.return_value = True
        mock_cloudinary_delete.return_value = True
        
        response = client.delete(
            "/api/gallery/image-123",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 204
        mock_db_delete.assert_called_once()
        mock_cloudinary_delete.assert_called_once()
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    @patch('app.services.supabase_service.SupabaseService.delete_gallery_image')
    def test_delete_gallery_image_db_only(self, mock_db_delete, mock_get_image, mock_get_admin):
        """Test gallery image deletion from database only"""
        mock_get_admin.return_value = mock_admin
        mock_get_image.return_value = mock_gallery_image
        mock_db_delete.return_value = True
        
        response = client.delete(
            "/api/gallery/image-123?delete_from_cloudinary=false",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 204
        mock_db_delete.assert_called_once()
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    @patch('app.services.cloudinary_service.CloudinaryService.get_optimized_url')
    @patch('app.services.cloudinary_service.CloudinaryService.get_thumbnail_url')
    def test_get_image_transformations_success(self, mock_thumbnail, mock_optimized, mock_get_image):
        """Test getting image transformations"""
        mock_get_image.return_value = mock_gallery_image
        mock_thumbnail.return_value = "https://res.cloudinary.com/test/image/upload/c_fill,h_300,w_300/safarsaga/test_image_123.jpg"
        mock_optimized.return_value = "https://res.cloudinary.com/test/image/upload/w_600/safarsaga/test_image_123.jpg"
        
        response = client.get("/api/gallery/image-123/transformations")
        
        assert response.status_code == 200
        data = response.json()
        assert "transformations" in data
        assert "thumbnail" in data["transformations"]
        assert "small" in data["transformations"]
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_image_by_id')
    def test_get_image_transformations_not_found(self, mock_get_image):
        """Test transformations for non-existent image"""
        mock_get_image.return_value = None
        
        response = client.get("/api/gallery/nonexistent/transformations")
        
        assert response.status_code == 404
    
    @patch('app.middleware.auth.get_admin_user')
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_get_gallery_stats_success(self, mock_get_images, mock_get_admin):
        """Test getting gallery statistics"""
        mock_get_admin.return_value = mock_admin
        
        # Mock multiple images with different properties
        images = [
            mock_gallery_image,
            GalleryImage(**{**mock_gallery_image.dict(), "id": "image-2", "is_featured": True}),
            GalleryImage(**{**mock_gallery_image.dict(), "id": "image-3", "event_id": None})
        ]
        mock_get_images.return_value = (images, 3)
        
        response = client.get(
            "/api/gallery/stats/summary",
            headers={"Authorization": "Bearer fake-admin-token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_images"] == 3
        assert data["featured_images"] == 1
        assert data["images_with_events"] == 2
        assert data["images_without_events"] == 1
        assert "popular_tags" in data
    
    def test_unauthorized_upload(self):
        """Test uploading without admin privileges"""
        file_content = b"fake image content"
        files = {"file": ("test.jpg", BytesIO(file_content), "image/jpeg")}
        
        response = client.post("/api/gallery/upload", files=files)
        
        assert response.status_code == 401
    
    def test_unauthorized_update(self):
        """Test updating without admin privileges"""
        update_data = {"alt_text": "Updated"}
        
        response = client.put("/api/gallery/image-123", json=update_data)
        
        assert response.status_code == 401
    
    def test_unauthorized_delete(self):
        """Test deleting without admin privileges"""
        response = client.delete("/api/gallery/image-123")
        
        assert response.status_code == 401
    
    def test_unauthorized_stats(self):
        """Test getting stats without admin privileges"""
        response = client.get("/api/gallery/stats/summary")
        
        assert response.status_code == 401


# Integration and performance tests
class TestGalleryPerformance:
    """Performance tests for gallery API"""
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_large_gallery_dataset(self, mock_get_images):
        """Test performance with large gallery dataset"""
        # Mock large dataset
        large_dataset = [mock_gallery_image] * 50
        mock_get_images.return_value = (large_dataset, 500)
        
        response = client.get("/api/gallery/?max_results=50")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 50
        assert data["total"] == 500
    
    def test_pagination_limits(self):
        """Test pagination parameter limits"""
        # Test maximum limit
        response = client.get("/api/gallery/?max_results=51")
        assert response.status_code == 422
        
        # Test minimum limit
        response = client.get("/api/gallery/?max_results=0")
        assert response.status_code == 422
    
    @patch('app.services.cloudinary_service.CloudinaryService.search_images')
    def test_search_performance(self, mock_search):
        """Test search functionality performance"""
        mock_search.return_value = {
            "images": [{"public_id": f"test_{i}", "url": f"url_{i}"} for i in range(20)],
            "total_count": 100
        }
        
        response = client.get("/api/gallery/?query=test&max_results=20")
        
        assert response.status_code == 200
        mock_search.assert_called_once()


# Edge case tests
class TestGalleryEdgeCases:
    """Edge case tests for gallery API"""
    
    @patch('app.services.supabase_service.SupabaseService.get_gallery_images')
    def test_empty_gallery(self, mock_get_images):
        """Test behavior with empty gallery"""
        mock_get_images.return_value = ([], 0)
        
        response = client.get("/api/gallery/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["total"] == 0
    
    @patch('app.services.cloudinary_service.CloudinaryService.search_images')
    def test_search_no_results(self, mock_search):
        """Test search with no results"""
        mock_search.return_value = {
            "images": [],
            "total_count": 0
        }
        
        response = client.get("/api/gallery/?query=nonexistent")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
    
    def test_invalid_image_id_format(self):
        """Test with invalid image ID format"""
        response = client.get("/api/gallery/invalid-uuid-format")
        
        # Should still try to fetch and return 404
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__])