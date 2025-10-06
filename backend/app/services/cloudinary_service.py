"""
Cloudinary service for image management
"""

import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.exceptions import (
    ExternalServiceException,
    FileUploadException,
    NotFoundException,
    handle_cloudinary_error
)

class CloudinaryService:
    """Service class for Cloudinary image operations"""
    
    def __init__(self):
        self.cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        self.api_key = os.getenv("CLOUDINARY_API_KEY")
        self.api_secret = os.getenv("CLOUDINARY_API_SECRET")
        self.configured = False
        self.executor = ThreadPoolExecutor(max_workers=5)
    
    def _ensure_configured(self):
        """Lazy initialization of Cloudinary configuration"""
        if not self.configured:
            if not all([self.cloud_name, self.api_key, self.api_secret]):
                raise ValueError("Cloudinary credentials must be provided in environment variables")
            
            if (self.cloud_name and self.cloud_name.startswith("your_")) or \
               (self.api_key and self.api_key.startswith("your_")) or \
               (self.api_secret and self.api_secret.startswith("your_")):
                raise ValueError("Please update .env file with actual Cloudinary credentials")
            
            # Configure Cloudinary
            cloudinary.config(
                cloud_name=self.cloud_name,
                api_key=self.api_key,
                api_secret=self.api_secret,
                secure=True
            )
            self.configured = True
    
    async def _run_sync(self, func, *args, **kwargs):
        """Run synchronous Cloudinary operations asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, func, *args, **kwargs)
    
    async def upload_image(
        self, 
        file_content: bytes, 
        filename: str,
        folder: str = "safarsaga",
        tags: Optional[List[str]] = None,
        transformation: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Upload image to Cloudinary
        
        Args:
            file_content: Image file content as bytes
            filename: Original filename
            folder: Cloudinary folder to upload to
            tags: List of tags for the image
            transformation: Image transformation parameters
            
        Returns:
            Dictionary with upload result including public_id, url, etc.
        """
        try:
            self._ensure_configured()
            
            def _upload():
                upload_options = {
                    "folder": folder,
                    "use_filename": True,
                    "unique_filename": True,
                    "overwrite": False,
                    "resource_type": "image",
                    "format": "auto",
                    "quality": "auto:good"
                }
                
                if tags:
                    upload_options["tags"] = tags
                
                if transformation:
                    upload_options["transformation"] = transformation
                
                # Generate public_id from filename
                base_name = os.path.splitext(filename)[0]
                timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                upload_options["public_id"] = f"{folder}/{base_name}_{timestamp}"
                
                return cloudinary.uploader.upload(file_content, **upload_options)
            
            result = await self._run_sync(_upload)
            
            return {
                "public_id": result["public_id"],
                "url": result["secure_url"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "created_at": result.get("created_at"),
                "version": result.get("version"),
                "signature": result.get("signature")
            }
            
        except Exception as e:
            raise handle_cloudinary_error(e, "image upload")
    
    async def delete_image(self, public_id: str) -> bool:
        """
        Delete image from Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the image
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            self._ensure_configured()
            
            def _delete():
                result = cloudinary.uploader.destroy(public_id)
                return result.get("result") == "ok"
            
            return await self._run_sync(_delete)
            
        except Exception as e:
            raise handle_cloudinary_error(e, "image deletion")
    
    async def get_image_info(self, public_id: str) -> Dict[str, Any]:
        """
        Get image information from Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the image
            
        Returns:
            Dictionary with image information
        """
        try:
            def _get_info():
                return cloudinary.api.resource(public_id)
            
            result = await self._run_sync(_get_info)
            
            return {
                "public_id": result["public_id"],
                "url": result["secure_url"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes"),
                "created_at": result.get("created_at"),
                "tags": result.get("tags", []),
                "version": result.get("version")
            }
            
        except Exception as e:
            if "not found" in str(e).lower():
                raise NotFoundException("Image")
            raise handle_cloudinary_error(e, "get image info")
    
    async def list_images(
        self,
        folder: str = "safarsaga",
        max_results: int = 12,
        next_cursor: Optional[str] = None,
        tags: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Dict[str, Any]:
        """
        List images from Cloudinary
        
        Args:
            folder: Cloudinary folder to list from
            max_results: Maximum number of results
            next_cursor: Pagination cursor
            tags: Filter by tags
            sort_by: Sort field
            sort_order: Sort order (asc/desc)
            
        Returns:
            Dictionary with images list and pagination info
        """
        try:
            def _list_images():
                search_options = {
                    "resource_type": "image",
                    "max_results": max_results,
                    "sort_by": [{"created_at": sort_order}] if sort_by == "created_at" else [{"public_id": sort_order}]
                }
                
                if next_cursor:
                    search_options["next_cursor"] = next_cursor
                
                # Build search expression
                expressions = [f"folder:{folder}"]
                
                if tags:
                    tag_expr = " OR ".join([f"tags:{tag}" for tag in tags])
                    expressions.append(f"({tag_expr})")
                
                search_options["expression"] = " AND ".join(expressions)
                
                return cloudinary.api.resources(**search_options)
            
            result = await self._run_sync(_list_images)
            
            images = []
            for resource in result.get("resources", []):
                images.append({
                    "public_id": resource["public_id"],
                    "url": resource["secure_url"],
                    "width": resource.get("width"),
                    "height": resource.get("height"),
                    "format": resource.get("format"),
                    "bytes": resource.get("bytes"),
                    "created_at": resource.get("created_at"),
                    "tags": resource.get("tags", [])
                })
            
            return {
                "images": images,
                "next_cursor": result.get("next_cursor"),
                "total_count": result.get("total_count", len(images))
            }
            
        except Exception as e:
            raise handle_cloudinary_error(e, "list images")
    
    async def search_images(
        self,
        query: str,
        folder: str = "safarsaga",
        max_results: int = 12,
        next_cursor: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search images in Cloudinary
        
        Args:
            query: Search query
            folder: Cloudinary folder to search in
            max_results: Maximum number of results
            next_cursor: Pagination cursor
            
        Returns:
            Dictionary with search results and pagination info
        """
        try:
            def _search():
                search_options = {
                    "max_results": max_results,
                    "sort_by": [{"created_at": "desc"}]
                }
                
                if next_cursor:
                    search_options["next_cursor"] = next_cursor
                
                # Build search expression
                # Search in filename, tags, and context
                search_expr = f"folder:{folder} AND (filename:{query}* OR tags:{query})"
                search_options["expression"] = search_expr
                
                return cloudinary.api.resources(**search_options)
            
            result = await self._run_sync(_search)
            
            images = []
            for resource in result.get("resources", []):
                images.append({
                    "public_id": resource["public_id"],
                    "url": resource["secure_url"],
                    "width": resource.get("width"),
                    "height": resource.get("height"),
                    "format": resource.get("format"),
                    "bytes": resource.get("bytes"),
                    "created_at": resource.get("created_at"),
                    "tags": resource.get("tags", [])
                })
            
            return {
                "images": images,
                "next_cursor": result.get("next_cursor"),
                "total_count": result.get("total_count", len(images)),
                "query": query
            }
            
        except Exception as e:
            raise handle_cloudinary_error(e, "search images")
    
    async def update_image_tags(self, public_id: str, tags: List[str]) -> Dict[str, Any]:
        """
        Update image tags in Cloudinary
        
        Args:
            public_id: Cloudinary public ID of the image
            tags: New list of tags
            
        Returns:
            Updated image information
        """
        try:
            def _update_tags():
                # Remove all existing tags first
                cloudinary.uploader.remove_all_tags(public_id)
                # Add new tags
                return cloudinary.uploader.add_tag(",".join(tags), public_id)
            
            await self._run_sync(_update_tags)
            
            # Get updated image info
            return await self.get_image_info(public_id)
            
        except Exception as e:
            raise handle_cloudinary_error(e, "update image tags")
    
    async def generate_transformation_url(
        self,
        public_id: str,
        transformation: Dict[str, Any]
    ) -> str:
        """
        Generate transformed image URL
        
        Args:
            public_id: Cloudinary public ID of the image
            transformation: Transformation parameters
            
        Returns:
            Transformed image URL
        """
        try:
            def _generate_url():
                return cloudinary.CloudinaryImage(public_id).build_url(**transformation)
            
            return await self._run_sync(_generate_url)
            
        except Exception as e:
            raise handle_cloudinary_error(e, "generate transformation URL")
    
    async def get_upload_signature(
        self,
        params: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate upload signature for client-side uploads
        
        Args:
            params: Upload parameters
            
        Returns:
            Dictionary with signature and timestamp
        """
        try:
            def _generate_signature():
                timestamp = int(datetime.utcnow().timestamp())
                params["timestamp"] = timestamp
                
                signature = cloudinary.utils.api_sign_request(params, self.api_secret)
                
                return {
                    "signature": signature,
                    "timestamp": str(timestamp),
                    "api_key": self.api_key,
                    "cloud_name": self.cloud_name
                }
            
            return await self._run_sync(_generate_signature)
            
        except Exception as e:
            raise handle_cloudinary_error(e, "generate upload signature")
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check Cloudinary service health
        
        Returns:
            Dictionary with health status
        """
        try:
            def _health_check():
                # Simple API call to test connectivity
                return cloudinary.api.ping()
            
            result = await self._run_sync(_health_check)
            
            return {
                "status": "connected",
                "cloud_name": self.cloud_name,
                "timestamp": datetime.utcnow().isoformat(),
                "response": result
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_optimized_url(
        self,
        public_id: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        quality: str = "auto:good",
        format: str = "auto"
    ) -> str:
        """
        Get optimized image URL with transformations
        
        Args:
            public_id: Cloudinary public ID
            width: Target width
            height: Target height
            quality: Image quality
            format: Image format
            
        Returns:
            Optimized image URL
        """
        transformation = {
            "quality": quality,
            "format": format
        }
        
        if width:
            transformation["width"] = width
        if height:
            transformation["height"] = height
        
        if width or height:
            transformation["crop"] = "fill"
        
        return cloudinary.CloudinaryImage(public_id).build_url(**transformation)
    
    def get_thumbnail_url(self, public_id: str, size: int = 300) -> str:
        """
        Get thumbnail URL
        
        Args:
            public_id: Cloudinary public ID
            size: Thumbnail size (square)
            
        Returns:
            Thumbnail image URL
        """
        return cloudinary.CloudinaryImage(public_id).build_url(
            width=size,
            height=size,
            crop="fill",
            quality="auto:good",
            format="auto"
        )