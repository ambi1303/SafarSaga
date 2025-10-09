"""
Supabase service for database operations
"""

import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
import uuid
import mimetypes
from app.models import User, Event, Booking, Destination,GalleryAlbum,GalleryAlbumImage
from app.exceptions import (
    DatabaseException, 
    NotFoundException, 
    ConflictException,
    ValidationException,
    handle_supabase_error
)

class SupabaseService:
    """Service class for Supabase database operations"""
    
    def __init__(self):
        # Load environment variables explicitly
        from dotenv import load_dotenv
        load_dotenv()
        
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client = None
        

    
    def _get_client(self) -> Client:
        """Initialize Supabase client (thread-safe, no proxy)"""
        if self.client is None:
            if not self.supabase_url or not self.supabase_key:
                raise ValueError("Supabase credentials are missing in environment variables")
            if not self.supabase_url.startswith("https://"):
                raise ValueError("Invalid Supabase URL. Must start with https://")
            
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                print("✅ Supabase client initialized successfully")
            except Exception as e:
                raise ValueError(f"Failed to initialize Supabase client: {str(e)}")
        
        return self.client
    
    # ==================== STORAGE METHODS ====================
    
    async def generate_signed_upload_url(self, file_name: str, content_type: str = None) -> dict:
        """Generate a signed URL for uploading files to Supabase Storage"""
        try:
            # Generate unique filename to avoid conflicts
            file_extension = os.path.splitext(file_name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Determine content type if not provided
            if not content_type:
                content_type, _ = mimetypes.guess_type(file_name)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            def _generate_url():
                # Create signed URL for upload (valid for 1 hour)
                response = self._get_client().storage.from_("gallery_images").create_signed_upload_url(unique_filename)
                return response
            
            result = await self._run_sync(_generate_url)
            
            if not result:
                raise DatabaseException("Failed to generate signed upload URL")
            
            return {
                "upload_url": result.get("signedURL"),
                "file_path": unique_filename,
                "public_url": f"{self.supabase_url}/storage/v1/object/public/gallery_images/{unique_filename}"
            }
            
        except Exception as e:
            raise handle_supabase_error(e, "generate signed upload URL")
    
    async def get_public_url(self, file_path: str) -> str:
        """Get public URL for a file in storage"""
        try:
            def _get_url():
                response = self._get_client().storage.from_("gallery_images").get_public_url(file_path)
                return response
            
            result = await self._run_sync(_get_url)
            return result
            
        except Exception as e:
            raise handle_supabase_error(e, "get public URL")
    
    async def delete_storage_file(self, file_path: str) -> bool:
        """Delete a file from storage"""
        try:
            def _delete_file():
                response = self._get_client().storage.from_("gallery_images").remove([file_path])
                return response
            
            result = await self._run_sync(_delete_file)
            return bool(result)
            
        except Exception as e:
            print(f"Warning: Failed to delete storage file {file_path}: {str(e)}")
            return False  # Don't fail the main operation if storage cleanup fails
    
    async def _run_sync(self, func, *args, **kwargs):
        """
        Wrapper for compatibility — no ThreadPoolExecutor to avoid async TaskGroup errors.
        The new Supabase client is already async-friendly.
        """
        try:
            result = func(*args, **kwargs)
            if asyncio.iscoroutine(result):
                return await result
            return result
        except Exception as e:
            raise e
    
    # User operations
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            def _get_user():
                # Use maybe_single() instead of single() to avoid exception when no rows found
                response = self._get_client().table("users").select("*").eq("id", user_id).maybe_single().execute()
                # maybe_single() returns None when no rows found, not a response object
                return response.data if response and response.data else None
            
            user_data = await self._run_sync(_get_user)
            
            if not user_data:
                return None
            
            return User(**user_data)
            
        except Exception as e:
            # Handle common Supabase errors
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116", "nonetype"]):
                return None
            raise handle_supabase_error(e, "get user by ID")
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            # Validate email parameter
            if not email or not isinstance(email, str):
                return None
            
            def _get_user():
                try:
                    # Get the client and ensure it's properly initialized
                    client = self._get_client()
                    
                    # Use maybe_single() instead of single() to avoid exception when no rows found
                    response = client.table("users").select("*").eq("email", email).maybe_single().execute()
                    
                    # Check if response is valid and has data
                    if response and hasattr(response, 'data') and response.data:
                        return response.data
                    return None
                    
                except Exception as inner_e:
                    # Log the specific error for debugging
                    print(f"Supabase query error: {str(inner_e)}")
                    raise inner_e
            
            user_data = await self._run_sync(_get_user)
            
            if not user_data:
                return None
            
            return User(**user_data)
            
        except Exception as e:
            # Handle common Supabase errors
            error_str = str(e).lower()
            print(f"Database error in get_user_by_email: {error_str}")
            
            # Check for specific error patterns
            if any(phrase in error_str for phrase in [
                "no rows found", "not found", "pgrst116", "nonetype",
                "null", "none", "empty"
            ]):
                return None
            
            # Check for connection issues
            if any(phrase in error_str for phrase in [
                "connection", "network", "timeout", "unreachable",
                "supabase_url", "supabase_key", "client"
            ]):
                raise DatabaseException(f"Database connection error: {str(e)}")
            
            # Re-raise as database exception with more context
            raise DatabaseException(f"Database error during get user by email: {str(e)}")
    
    async def create_user(self, user_data: dict) -> User:
        """Create new user"""
        try:
            def _create_user():
                response = self._get_client().table("users").insert(user_data).execute()
                return response.data[0] if response.data else None
            
            created_user = await self._run_sync(_create_user)
            
            if not created_user:
                raise DatabaseException("Failed to create user")
            
            return User(**created_user)
            
        except Exception as e:
            raise handle_supabase_error(e, "create user")
    
    async def update_user(self, user_id: str, update_data: dict) -> User:
        """Update user"""
        try:
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            def _update_user():
                response = self._get_client().table("users").update(update_data).eq("id", user_id).execute()
                return response.data[0] if response.data else None
            
            updated_user = await self._run_sync(_update_user)
            
            if not updated_user:
                raise NotFoundException("User", user_id)
            
            return User(**updated_user)
            
        except Exception as e:
            raise handle_supabase_error(e, "update user")
    
    async def get_user_from_token(self, token: str) -> Optional[dict]:
        """Get user from Supabase auth token"""
        try:
            def _get_user():
                response = self._get_client().auth.get_user(token)
                return response.user if response.user else None
            
            user = await self._run_sync(_get_user)
            return user.dict() if user else None
            
        except Exception as e:
            raise handle_supabase_error(e, "get user from token")
    
    # Event operations
    async def get_events(self, filters: dict = None, limit: int = 20, offset: int = 0) -> tuple[List[Event], int]:
        """Get events with filtering and pagination"""
        try:
            def _get_events():
                query = self._get_client().table("events").select("*, created_by_user:users!events_created_by_fkey(full_name, email)")
                
                # Apply filters
                if filters:
                    if filters.get("destination"):
                        query = query.ilike("destination", f"%{filters['destination']}%")
                    
                    if filters.get("difficulty"):
                        query = query.eq("difficulty_level", filters["difficulty"])
                    
                    if filters.get("min_price"):
                        query = query.gte("price", filters["min_price"])
                    
                    if filters.get("max_price"):
                        query = query.lte("price", filters["max_price"])
                    
                    if filters.get("start_date"):
                        query = query.gte("start_date", filters["start_date"])
                    
                    if filters.get("end_date"):
                        query = query.lte("end_date", filters["end_date"])
                    
                    if "is_active" in filters:
                        query = query.eq("is_active", filters["is_active"])
                
                # Add pagination and ordering
                query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
                
                response = query.execute()
                return response.data if response.data else []
            
            events_data = await self._run_sync(_get_events)
            
            # Convert to Event objects
            events = [Event(**event) for event in events_data]
            
            # Get total count (simplified - in production, use a separate count query)
            total = len(events_data)  # This is approximate
            
            return events, total
            
        except Exception as e:
            raise handle_supabase_error(e, "get events")
    
    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        """Get event by ID"""
        try:
            def _get_event():
                response = self._get_client().table("events").select("*, created_by_user:users!events_created_by_fkey(full_name, email)").eq("id", event_id).maybe_single().execute()
                return response.data if response and response.data else None
            
            event_data = await self._run_sync(_get_event)
            
            if not event_data:
                return None
            
            return Event(**event_data)
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116", "nonetype"]):
                return None
            raise handle_supabase_error(e, "get event by ID")
    
    async def create_event(self, event_data: dict) -> Event:
        """Create new event"""
        try:
            def _create_event():
                response = self._get_client().table("events").insert(event_data).execute()
                return response.data[0] if response.data else None
            
            created_event = await self._run_sync(_create_event)
            
            if not created_event:
                raise DatabaseException("Failed to create event")
            
            return Event(**created_event)
            
        except Exception as e:
            raise handle_supabase_error(e, "create event")
    
    async def update_event(self, event_id: str, update_data: dict) -> Event:
        """Update event"""
        try:
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            def _update_event():
                response = self._get_client().table("events").update(update_data).eq("id", event_id).execute()
                return response.data[0] if response.data else None
            
            updated_event = await self._run_sync(_update_event)
            
            if not updated_event:
                raise NotFoundException("Event", event_id)
            
            return Event(**updated_event)
            
        except Exception as e:
            raise handle_supabase_error(e, "update event")
    
    async def delete_event(self, event_id: str) -> bool:
        """Delete event"""
        try:
            def _delete_event():
                response = self._get_client().table("events").delete().eq("id", event_id).execute()
                return len(response.data) > 0 if response.data else False
            
            deleted = await self._run_sync(_delete_event)
            return deleted
            
        except Exception as e:
            raise handle_supabase_error(e, "delete event")
    
    # Booking operations
    async def get_bookings(self, filters: dict = None, limit: int = 20, offset: int = 0) -> tuple[List[Booking], int]:
        """Get bookings with filtering and pagination (supports both destinations and events)"""
        try:
            def _get_bookings():
                try:
                    # First, let's try a simple query without joins to see if basic data works
                    print("DEBUG - Testing basic query without joins...")
                    basic_query = self._get_client().table("tickets").select("*")
                    basic_response = basic_query.execute()
                    print(f"DEBUG - Basic query returned {len(basic_response.data)} records")
                    
                    # Get tickets data first
                    query = self._get_client().table("tickets").select("*")
                    
                    # Apply filters
                    if filters:
                        if filters.get("user_id"):
                            query = query.eq("user_id", filters["user_id"])
                        if filters.get("event_id"):
                            query = query.eq("event_id", filters["event_id"])
                        if filters.get("destination_id"):
                            query = query.eq("destination_id", filters["destination_id"])
                        if filters.get("booking_status"):
                            query = query.eq("booking_status", filters["booking_status"])
                        if filters.get("payment_status"):
                            query = query.eq("payment_status", filters["payment_status"])
                    
                    # Add pagination and ordering
                    query = query.order("booked_at", desc=True).range(offset, offset + limit - 1)
                    
                    response = query.execute()
                    bookings_data = response.data if response.data else []
                    
                    # Manually fetch user and destination data for each booking
                    enriched_bookings = []
                    for booking in bookings_data:
                        enriched_booking = booking.copy()
                        
                        # Fetch user data
                        if booking.get('user_id'):
                            try:
                                user_response = self._get_client().table("users").select("id, email, full_name").eq("id", booking['user_id']).execute()
                                if user_response.data and len(user_response.data) > 0:
                                    user = user_response.data[0]
                                    enriched_booking['user_name'] = user.get('full_name')
                                    enriched_booking['user_email'] = user.get('email')
                                else:
                                    enriched_booking['user_name'] = None
                                    enriched_booking['user_email'] = None
                            except Exception as e:
                                print(f"Error fetching user data: {e}")
                                enriched_booking['user_name'] = None
                                enriched_booking['user_email'] = None
                        else:
                            enriched_booking['user_name'] = None
                            enriched_booking['user_email'] = None
                        
                        # Fetch destination data
                        if booking.get('destination_id'):
                            try:
                                dest_response = self._get_client().table("destinations").select("id, name").eq("id", booking['destination_id']).execute()
                                if dest_response.data and len(dest_response.data) > 0:
                                    destination = dest_response.data[0]
                                    enriched_booking['destination_name'] = destination.get('name')
                                else:
                                    enriched_booking['destination_name'] = None
                            except Exception as e:
                                print(f"Error fetching destination data: {e}")
                                enriched_booking['destination_name'] = None
                        elif booking.get('event_id'):
                            # Fallback to event name
                            try:
                                event_response = self._get_client().table("events").select("id, name").eq("id", booking['event_id']).execute()
                                if event_response.data and len(event_response.data) > 0:
                                    event = event_response.data[0]
                                    enriched_booking['destination_name'] = event.get('name')
                                else:
                                    enriched_booking['destination_name'] = None
                            except Exception as e:
                                print(f"Error fetching event data: {e}")
                                enriched_booking['destination_name'] = None
                        else:
                            enriched_booking['destination_name'] = None
                        
                        enriched_bookings.append(enriched_booking)
                    
                    return enriched_bookings
                    
                except Exception as inner_e:
                    print(f"Bookings query failed: {str(inner_e)}")
                    print(f"Exception type: {type(inner_e)}")
                    import traceback
                    print(f"Full traceback: {traceback.format_exc()}")
                    return []
            
            bookings_data = await self._run_sync(_get_bookings)
            
            # Convert to Booking objects with error handling
            bookings = []
            for booking_data in bookings_data:
                try:
                    # Safely convert data types for Pydantic model
                    safe_booking_data = self._safe_convert_booking_data(booking_data)
                    bookings.append(Booking(**safe_booking_data))
                except Exception as e:
                    print(f"Warning: Could not convert booking data: {str(e)}")
                    print(f"Booking data types: {[(k, type(v)) for k, v in booking_data.items()]}")
                    # Skip invalid booking data
                    continue
            
            # Get total count (simplified)
            total = len(bookings_data)
            
            return bookings, total
            
        except Exception as e:
            print(f"Error in get_bookings: {str(e)}")
            # Return empty result instead of raising exception for testing
            return [], 0
    
    async def get_booking_by_id(self, booking_id: str) -> Optional[Booking]:
        """Get booking by ID (supports both destinations and events)"""
        try:
            def _get_booking():
                try:
                    # Get booking data first
                    response = self._get_client().table("tickets").select("*").eq("id", booking_id).maybe_single().execute()
                    booking_data = response.data if response and response.data else None
                    
                    if not booking_data:
                        return None
                    
                    # Manually join user, destination, and event data
                    enriched_booking = booking_data.copy()
                    
                    # Get user data if user_id exists
                    if booking_data.get('user_id'):
                        try:
                            user_response = self._get_client().table("users").select("id, email, full_name").eq("id", booking_data['user_id']).execute()
                            if user_response.data:
                                user_data = user_response.data[0]
                                enriched_booking['user_name'] = user_data.get('full_name')
                                enriched_booking['user_email'] = user_data.get('email')
                        except Exception as user_error:
                            print(f"Warning: Could not fetch user {booking_data.get('user_id')}: {str(user_error)}")
                            enriched_booking['user_name'] = None
                            enriched_booking['user_email'] = None
                    
                    # Get destination data if destination_id exists
                    if booking_data.get('destination_id'):
                        try:
                            dest_response = self._get_client().table("destinations").select("*").eq("id", booking_data['destination_id']).execute()
                            if dest_response.data:
                                dest_data = dest_response.data[0]
                                enriched_booking['destination'] = dest_data
                                enriched_booking['destination_name'] = dest_data.get('name')
                        except Exception as dest_error:
                            print(f"Warning: Could not fetch destination {booking_data.get('destination_id')}: {str(dest_error)}")
                            enriched_booking['destination'] = None
                            enriched_booking['destination_name'] = None
                    
                    # Get event data if event_id exists
                    if booking_data.get('event_id'):
                        try:
                            event_response = self._get_client().table("events").select("*").eq("id", booking_data['event_id']).execute()
                            if event_response.data:
                                event_data = event_response.data[0]
                                enriched_booking['event'] = event_data
                                # If no destination_name, use event name
                                if not enriched_booking.get('destination_name'):
                                    enriched_booking['destination_name'] = event_data.get('name')
                        except Exception as event_error:
                            print(f"Warning: Could not fetch event {booking_data.get('event_id')}: {str(event_error)}")
                            enriched_booking['event'] = None
                    
                    return enriched_booking
                    
                except Exception as inner_e:
                    print(f"Booking query failed: {str(inner_e)}")
                    return None
            
            booking_data = await self._run_sync(_get_booking)
            
            if not booking_data:
                return None
            
            try:
                # Safely convert data types for Pydantic model
                safe_booking_data = self._safe_convert_booking_data(booking_data)
                return Booking(**safe_booking_data)
            except Exception as e:
                print(f"Warning: Could not convert booking data: {str(e)}")
                print(f"Booking data types: {[(k, type(v)) for k, v in booking_data.items()]}")
                return None
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116", "nonetype"]):
                return None
            raise handle_supabase_error(e, "get booking by ID")
    
    async def create_booking(self, booking_data: dict) -> Booking:
        """Create new booking (legacy method - supports both destinations and events)"""
        try:
            # 🔒 Add safety conversion before inserting
            booking_data = self._validate_and_convert_booking_data(booking_data)
            
            # 🔍 Debug visibility: Log data types before database insert
            print("DEBUG - Incoming booking_data before insert:", booking_data)
            print(f"DEBUG - seats type: {type(booking_data.get('seats'))}, value: {booking_data.get('seats')}")
            print(f"DEBUG - total_amount type: {type(booking_data.get('total_amount'))}, value: {booking_data.get('total_amount')}")
            
            def _create_booking():
                response = self._get_client().table("tickets").insert(booking_data).execute()
                return response.data[0] if response.data else None
            
            created_booking = await self._run_sync(_create_booking)
            
            if not created_booking:
                raise DatabaseException("Failed to create booking")
            
            # Safely convert data types for Pydantic model
            safe_created_booking = self._safe_convert_booking_data(created_booking)
            return Booking(**safe_created_booking)
            
        except Exception as e:
            raise handle_supabase_error(e, "create booking")
    
    def _validate_and_convert_booking_data(self, booking_data: dict) -> dict:
        """
        Validates and converts booking data types before database insertion.
        This prevents data type mismatch errors with PostgreSQL.
        """
        # Create a copy to avoid modifying the original dict
        data = booking_data.copy()

        # Convert Decimal to float for total_amount
        if 'total_amount' in data and isinstance(data['total_amount'], Decimal):
            data['total_amount'] = float(data['total_amount'])

        # Ensure seats is an integer
        if 'seats' in data and data['seats'] is not None:
            try:
                data['seats'] = int(data['seats'])
            except (ValueError, TypeError):
                raise ValidationException(
                    "Invalid data type for 'seats'. Must be a whole number.",
                    field="seats",
                    value=data['seats']
                )

        return data

    def _safe_convert_booking_data(self, booking_data: dict) -> dict:
        """
        Safely converts booking data types for Pydantic model compatibility.
        Handles type conversion issues that may occur when creating Booking objects.
        """
        # Create a copy to avoid modifying the original dict
        data = booking_data.copy()

        # Convert Decimal to float for total_amount
        if 'total_amount' in data and isinstance(data['total_amount'], Decimal):
            data['total_amount'] = float(data['total_amount'])

        # Ensure seats is an integer
        if 'seats' in data and data['seats'] is not None:
            try:
                data['seats'] = int(data['seats'])
            except (ValueError, TypeError):
                data['seats'] = 1  # Default fallback

        # Ensure string fields are properly handled and preserved
        string_fields = ['booking_status', 'payment_status', 'user_name', 'user_email', 'destination_name']
        for field in string_fields:
            if field in data and data[field] is not None and not isinstance(data[field], str):
                data[field] = str(data[field])
            # Preserve None values for enriched fields - but don't overwrite existing values
            elif field in ['user_name', 'user_email', 'destination_name'] and field not in data:
                data[field] = None
        
        # Debug logging to track enriched field preservation
        print(f"DEBUG - _safe_convert_booking_data for booking {data.get('id', 'unknown')}:")
        print(f"  user_name: {data.get('user_name')}")
        print(f"  user_email: {data.get('user_email')}")
        print(f"  destination_name: {data.get('destination_name')}")

        return data

    async def create_destination_booking(self, booking_data: dict) -> Booking:
        """Create new destination-based booking"""

        try:
            # Ensure we have the required fields for destination booking
            if 'destination_id' not in booking_data:
                raise ValueError("destination_id is required for destination bookings")
            
            # Add timestamp and defaults
            booking_data["booked_at"] = datetime.utcnow().isoformat()
            
            # Ensure required fields have defaults
            if "booking_status" not in booking_data:
                booking_data["booking_status"] = "pending"
            if "payment_status" not in booking_data:
                booking_data["payment_status"] = "unpaid"
            
            # Enhanced comprehensive data type validation and conversion
            booking_data = self._validate_and_convert_booking_data(booking_data)
            
            # 🔍 Debug visibility: Log data types before database insert
            print("DEBUG - Incoming booking_data before insert:", booking_data)
            print(f"DEBUG - seats type: {type(booking_data.get('seats'))}, value: {booking_data.get('seats')}")
            print(f"DEBUG - total_amount type: {type(booking_data.get('total_amount'))}, value: {booking_data.get('total_amount')}")
            
            def _create_destination_booking():
                response = self._get_client().table("tickets").insert(booking_data).execute()
                return response.data[0] if response.data else None
            
            created_booking = await self._run_sync(_create_destination_booking)
            
            if not created_booking:
                raise DatabaseException("Failed to create destination booking")
            
            # Try to create Booking object directly from the created data
            try:
                # Safely convert data types for Pydantic model
                safe_created_booking = self._safe_convert_booking_data(created_booking)
                return Booking(**safe_created_booking)
            except Exception as model_error:
                print(f"Warning: Could not create Booking model: {str(model_error)}")
                print(f"Booking data types: {[(k, type(v)) for k, v in created_booking.items()]}")
                # Fallback: try to fetch with get_booking_by_id
                try:
                    return await self.get_booking_by_id(created_booking['id'])
                except Exception as fetch_error:
                    print(f"Warning: Could not fetch created booking: {str(fetch_error)}")
                    # Final fallback: return a minimal booking object with safe conversion
                    safe_created_booking = self._safe_convert_booking_data(created_booking)
                    return Booking(
                        id=safe_created_booking['id'],
                        user_id=safe_created_booking['user_id'],
                        destination_id=safe_created_booking.get('destination_id'),
                        event_id=safe_created_booking.get('event_id'),
                        seats=safe_created_booking.get('seats', 1),
                        total_amount=safe_created_booking.get('total_amount', 0.0),
                        booking_status=safe_created_booking.get('booking_status', 'pending'),
                        payment_status=safe_created_booking.get('payment_status', 'unpaid')
                    )
            
        except Exception as e:
            error_str = str(e).lower()
            print(f"Error in create_destination_booking: {str(e)}")
            
            # Enhanced error handling with specific exception types
            if "foreign key constraint" in error_str:
                if "destination_id" in error_str:
                    raise NotFoundException("Destination", booking_data.get("destination_id", "unknown"))
                elif "user_id" in error_str:
                    raise NotFoundException("User", booking_data.get("user_id", "unknown"))
                else:
                    raise ConflictException("Invalid reference in booking data")
            elif "check constraint" in error_str:
                if "seats" in error_str:
                    raise ValidationException(
                        "Seats count violates database constraints", 
                        field="seats", 
                        value=booking_data.get("seats")
                    )
                elif "booking_status" in error_str:
                    raise ValidationException(
                        "Invalid booking status", 
                        field="booking_status", 
                        value=booking_data.get("booking_status")
                    )
                elif "payment_status" in error_str:
                    raise ValidationException(
                        "Invalid payment status", 
                        field="payment_status", 
                        value=booking_data.get("payment_status")
                    )
                else:
                    raise ValidationException("Data validation failed at database level")
            elif "not null constraint" in error_str:
                # Try to identify which field is missing
                missing_field = "unknown"
                for field in ["destination_id", "user_id", "seats", "total_amount"]:
                    if field in error_str:
                        missing_field = field
                        break
                raise ValidationException(
                    f"Required field '{missing_field}' is missing", 
                    field=missing_field, 
                    value=None
                )
            elif "integer" in error_str and "str" in error_str:
                # Catch the specific error we're trying to prevent
                raise ValidationException(
                    "Data type conversion error: string cannot be converted to integer. This should have been caught earlier.",
                    field="data_conversion", 
                    value=str(e)
                )
            else:
                raise DatabaseException(f"Failed to create destination booking: {str(e)}")
    
    async def update_booking(self, booking_id: str, update_data: dict) -> Booking:
        """Update booking"""
        try:
            def _update_booking():
                response = self._get_client().table("tickets").update(update_data).eq("id", booking_id).execute()
                return response.data[0] if response.data else None
            
            updated_booking = await self._run_sync(_update_booking)
            
            if not updated_booking:
                raise NotFoundException("Booking", booking_id)
            
            return Booking(**updated_booking)
            
        except Exception as e:
            raise handle_supabase_error(e, "update booking")
    
    # Gallery operations

    async def get_destinations(self, filters: dict = None, limit: int = 20, offset: int = 0) -> tuple[List[Destination], int]:
        """Get destinations with filtering and pagination"""
        try:
            def _get_destinations():
                # Single query with both data and count (more efficient)
                query = self._get_client().table("destinations").select("*", count='exact')
                
                # Apply filters once
                if filters:
                    if filters.get("state"):
                        query = query.eq("state", filters["state"])
                    
                    if filters.get("difficulty_level"):
                        query = query.eq("difficulty_level", filters["difficulty_level"])
                    
                    if filters.get("min_cost"):
                        query = query.gte("package_price", filters["min_cost"])
                    
                    if filters.get("max_cost"):
                        query = query.lte("package_price", filters["max_cost"])
                    
                    if "is_active" in filters:
                        query = query.eq("is_active", filters["is_active"])
                
                # Add pagination and ordering
                query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
                
                # Execute single query
                response = query.execute()
                return response.data if response.data else [], response.count if hasattr(response, 'count') else 0
            
            # Run the sync function
            destinations_data, total = await self._run_sync(_get_destinations)
            
            # Convert to Destination objects with error handling
            destinations = []
            for dest in destinations_data:
                try:
                    destinations.append(Destination(**dest))
                except Exception as conv_error:
                    print(f"Warning: Could not convert destination data: {str(conv_error)}")
                    print(f"Destination data: {dest}")
                    # Skip invalid destination data
                    continue
            
            return destinations, total
            
        except Exception as e:
            print(f"Error in get_destinations: {str(e)}")
            raise DatabaseException(f"Failed to fetch destinations: {str(e)}")

    async def get_destination_by_id(self, destination_id: str) -> Optional[Destination]:
        """Get destination by ID"""
        try:
            def _get_destination():
                response = self._get_client().table("destinations").select("*").eq("id", destination_id).maybe_single().execute()
                return response.data if response and response.data else None
            
            destination_data = await self._run_sync(_get_destination)
            
            if not destination_data:
                return None
            
            return Destination(**destination_data)
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116", "nonetype"]):
                return None
            raise handle_supabase_error(e, "get destination by ID")

    async def create_destination(self, destination_data: dict) -> Destination:
        """Create new destination"""
        try:
            print(f"DEBUG - Attempting to create destination with data: {destination_data}")
            
            # Ensure required fields are present
            required_fields = ['name']
            for field in required_fields:
                if field not in destination_data or not destination_data[field]:
                    raise ValidationException(f"Missing required field: {field}")
            
            # Set default values if not provided
            destination_data.setdefault('is_active', True)
            destination_data.setdefault('country', 'India')
            
            # Convert Decimal to float for JSON serialization
            if 'package_price' in destination_data and isinstance(destination_data['package_price'], Decimal):
                destination_data['package_price'] = float(destination_data['package_price'])
                print(f"DEBUG - Converted package_price from Decimal to float: {destination_data['package_price']}")
            
            def _create_destination():
                try:
                    print(f"DEBUG - Executing insert with data: {destination_data}")
                    response = self._get_client().table("destinations").insert(destination_data).execute()
                    print(f"DEBUG - Insert response: {response}")
                    
                    # Check for Supabase error
                    if hasattr(response, 'error') and response.error:
                        print(f"SUPABASE ERROR: {response.error}")
                        print(f"DATA SENT: {destination_data}")
                        raise DatabaseException(f"Supabase error: {response.error}")
                    
                    return response.data[0] if response and hasattr(response, 'data') and response.data else None
                except Exception as db_error:
                    print(f"DEBUG - Database error in _create_destination: {str(db_error)}")
                    print(f"DEBUG - Error type: {type(db_error).__name__}")
                    if hasattr(db_error, '__dict__'):
                        print(f"DEBUG - Error details: {db_error.__dict__}")
                    raise db_error
            
            created_destination = await self._run_sync(_create_destination)
            
            if not created_destination:
                raise DatabaseException("Failed to create destination: No data returned from database")
            
            print(f"DEBUG - Successfully created destination: {created_destination}")
            return Destination(**created_destination)
            
        except Exception as e:
            error_msg = f"Failed to create destination: {str(e)}"
            print(f"ERROR - {error_msg}")
            if hasattr(e, 'message') and 'duplicate key' in str(e.message).lower():
                raise ConflictException(f"A destination with name '{destination_data.get('name')}' already exists")
            raise handle_supabase_error(e, "create destination")
    async def update_destination(self, destination_id: str, update_data: dict) -> Destination:
        """Update destination"""
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Convert Decimal to float for JSON serialization
            if 'package_price' in update_data and isinstance(update_data['package_price'], Decimal):
                update_data['package_price'] = float(update_data['package_price'])
            
            def _update_destination():
                response = self._get_client().table("destinations").update(update_data).eq("id", destination_id).execute()
                return response.data[0] if response.data else None
            
            updated_destination = await self._run_sync(_update_destination)
            
            if not updated_destination:
                raise NotFoundException("Destination", destination_id)
            
            return Destination(**updated_destination)
            
        except Exception as e:
            raise handle_supabase_error(e, "update destination")
    
    async def search_destinations(self, query: str, limit: int = 10) -> List[Destination]:
        """Search destinations by name or description"""
        try:
            def _search_destinations():
                response = self._get_client().table("destinations").select("*").or_(
                    f"name.ilike.%{query}%,description.ilike.%{query}%"
                ).eq("is_active", True).limit(limit).execute()
                return response.data if response.data else []
            
            destinations_data = await self._run_sync(_search_destinations)
            
            # Convert to Destination objects
            destinations = [Destination(**dest) for dest in destinations_data]
            
            return destinations
            
        except Exception as e:
            raise handle_supabase_error(e, "search destinations")
    
    async def destination_has_active_bookings(self, destination_id: str) -> bool:
        """Check if a destination has any active bookings"""
        try:
            def _check_bookings():
                response = self._get_client().table("tickets").select(
                    "id", count='exact'
                ).eq("destination_id", destination_id).in_("booking_status", ["pending", "confirmed"]).execute()
                
                return response.count > 0 if hasattr(response, 'count') else False
            
            has_bookings = await self._run_sync(_check_bookings)
            return has_bookings
            
        except Exception as e:
            print(f"Error checking for active bookings: {str(e)}")
            # Fail safe: assume there are bookings to prevent accidental deletion
            return True
    
    async def delete_destination(self, destination_id: str) -> bool:
        """Permanently delete a destination from the database"""
        try:
            def _delete_destination():
                response = self._get_client().table("destinations").delete().eq("id", destination_id).execute()
                return len(response.data) > 0 if response.data else False
            
            deleted = await self._run_sync(_delete_destination)
            return deleted
            
        except Exception as e:
            raise handle_supabase_error(e, "delete destination")

    async def health_check(self) -> dict:
        """Check database connectivity"""
        try:
            def _health_check():
                # Simple query to test connection
                response = self._get_client().table("users").select("count").limit(1).execute()
                return {"status": "connected", "timestamp": datetime.utcnow().isoformat()}
            
            result = await self._run_sync(_health_check)
            return result
            
        except Exception as e:
            return {
                "status": "error", 
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    # Gallery Album operations
    async def create_gallery_album(self, album_data: dict) -> dict:
        """Create new gallery album"""
        try:
            print(f"DEBUG: Service - Creating album with data: {album_data}")
            
            # Add timestamps
            album_data["created_at"] = datetime.utcnow().isoformat()
            album_data["updated_at"] = datetime.utcnow().isoformat()
            
            print(f"DEBUG: Service - Album data with timestamps: {album_data}")
            
            def _create_album():
                print("DEBUG: Service - Executing database insert")
                response = self._get_client().table("gallery_albums").insert(album_data).execute()
                print(f"DEBUG: Service - Database response: {response}")
                print(f"DEBUG: Service - Response data: {response.data if hasattr(response, 'data') else 'No data attr'}")
                return response.data[0] if response.data else None
            
            created_album = await self._run_sync(_create_album)
            print(f"DEBUG: Service - Created album result: {created_album}")
            
            if not created_album:
                raise DatabaseException("Failed to create gallery album")
            
            return created_album
            
        except Exception as e:
            print(f"DEBUG: Service - Exception in create_gallery_album: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise handle_supabase_error(e, "create gallery album")
    
    async def get_gallery_albums(self, destination_id: Optional[str] = None) -> List[dict]:
        """Get all gallery albums with enriched data"""
        try:
            def _get_albums():
                query = self._get_client().table("gallery_albums").select(
                    "*, gallery_images(*), destinations(name)"
                )
                
                if destination_id:
                    query = query.eq("destination_id", destination_id)
                
                query = query.order("created_at", desc=True)
                response = query.execute()
                
                albums_data = response.data if response.data else []
                
                # Enrich albums with image count and cover image
                enriched_albums = []
                for album in albums_data:
                    enriched_album = album.copy()
                    
                    # Extract destination name
                    if album.get('destinations'):
                        enriched_album['destination_name'] = album['destinations'].get('name')
                    else:
                        enriched_album['destination_name'] = None
                    
                    # Handle images - rename from gallery_images to images and sort by display_order
                    images = album.get('gallery_images', [])
                    if images:
                        # Sort by display_order to ensure first image is the cover
                        images.sort(key=lambda x: x.get('display_order', 0))
                    
                    enriched_album['image_count'] = len(images)
                    enriched_album['cover_image_url'] = images[0]['image_url'] if images else None
                    
                    # Remove gallery_images key and add images key for consistency
                    if 'gallery_images' in enriched_album:
                        del enriched_album['gallery_images']
                    
                    enriched_albums.append(enriched_album)
                
                return enriched_albums
            
            albums = await self._run_sync(_get_albums)
            return albums
            
        except Exception as e:
            raise handle_supabase_error(e, "get gallery albums")
    
    async def get_gallery_album_by_id(self, album_id: str) -> Optional[dict]:
        """Get gallery album by ID"""
        try:
            def _get_album():
                response = self._get_client().table("gallery_albums").select("*").eq("id", album_id).maybe_single().execute()
                return response.data if response and response.data else None
            
            album = await self._run_sync(_get_album)
            return album
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116"]):
                return None
            raise handle_supabase_error(e, "get gallery album by ID")
    
    async def get_gallery_album_with_images(self, album_id: str) -> Optional[dict]:
        """Get gallery album with all its images"""
        try:
            print(f"DEBUG: Service - Getting album with images for ID: {album_id}")
            
            def _get_album():
                print("DEBUG: Service - Building query for album with images")
                query = self._get_client().table("gallery_albums").select(
                    "*, gallery_images(*), destinations(name)"
                ).eq("id", album_id).single()
                
                print("DEBUG: Service - Executing query")
                response = query.execute()
                print(f"DEBUG: Service - Query response: {response}")
                
                if not response or not response.data:
                    print("DEBUG: Service - No response or no data")
                    return None
                
                album_data = response.data
                print(f"DEBUG: Service - Raw album data: {album_data}")
                
                # Extract destination name
                if album_data.get('destinations'):
                    album_data['destination_name'] = album_data['destinations'].get('name')
                    print(f"DEBUG: Service - Added destination_name: {album_data.get('destination_name')}")
                else:
                    album_data['destination_name'] = None
                
                # Handle images - rename from gallery_images to images for consistency
                if 'gallery_images' in album_data:
                    album_data['images'] = album_data['gallery_images']
                    del album_data['gallery_images']  # Remove the original key
                    print(f"DEBUG: Service - Renamed gallery_images to images: {len(album_data['images'])} images found")
                else:
                    album_data['images'] = []
                    print("DEBUG: Service - Set empty images array")
                
                # Sort images by display_order
                if album_data['images']:
                    album_data['images'].sort(key=lambda x: x.get('display_order', 0))
                    print("DEBUG: Service - Sorted images by display_order")
                
                album_data['image_count'] = len(album_data['images'])
                album_data['cover_image_url'] = album_data['images'][0]['image_url'] if album_data['images'] else None
                print(f"DEBUG: Service - Added image_count: {album_data['image_count']}, cover_image_url: {album_data['cover_image_url']}")
                
                return album_data
            
            album = await self._run_sync(_get_album)
            print(f"DEBUG: Service - Final album result: {album}")
            return album
            
        except Exception as e:
            print(f"DEBUG: Service - Exception in get_gallery_album_with_images: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116"]):
                return None
            raise handle_supabase_error(e, "get gallery album with images")
    
    async def update_gallery_album(self, album_id: str, update_data: dict) -> dict:
        """Update gallery album"""
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            def _update_album():
                response = self._get_client().table("gallery_albums").update(update_data).eq("id", album_id).execute()
                return response.data[0] if response.data else None
            
            updated_album = await self._run_sync(_update_album)
            
            if not updated_album:
                raise NotFoundException("Gallery Album", album_id)
            
            return updated_album
            
        except Exception as e:
            raise handle_supabase_error(e, "update gallery album")
    
    async def delete_gallery_album(self, album_id: str) -> bool:
        """Delete gallery album (cascade deletes images)"""
        try:
            def _delete_album():
                response = self._get_client().table("gallery_albums").delete().eq("id", album_id).execute()
                return len(response.data) > 0 if response.data else False
            
            deleted = await self._run_sync(_delete_album)
            return deleted
            
        except Exception as e:
            raise handle_supabase_error(e, "delete gallery album")
    
    # Gallery Album Image operations
    async def create_gallery_album_image(self, image_data: dict) -> dict:
        """Create new gallery album image"""
        try:
            def _create_image():
                response = self._get_client().table("gallery_images").insert(image_data).execute()
                return response.data[0] if response.data else None
            
            created_image = await self._run_sync(_create_image)
            
            if not created_image:
                raise DatabaseException("Failed to create gallery image")
            
            return created_image
            
        except Exception as e:
            raise handle_supabase_error(e, "create gallery image")
    
    async def get_gallery_album_image_by_id(self, image_id: str) -> Optional[dict]:
        """Get gallery album image by ID"""
        try:
            def _get_image():
                response = self._get_client().table("gallery_images").select("*").eq("id", image_id).maybe_single().execute()
                return response.data if response and response.data else None
            
            image = await self._run_sync(_get_image)
            return image
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116"]):
                return None
            raise handle_supabase_error(e, "get gallery image by ID")
    
    async def update_gallery_album_image(self, image_id: str, update_data: dict) -> dict:
        """Update gallery album image"""
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            def _update_image():
                response = self._get_client().table("gallery_images").update(update_data).eq("id", image_id).execute()
                return response.data[0] if response.data else None
            
            updated_image = await self._run_sync(_update_image)
            
            if not updated_image:
                raise NotFoundException("Gallery Image", image_id)
            
            return updated_image
            
        except Exception as e:
            raise handle_supabase_error(e, "update gallery image")
    
    async def delete_gallery_album_image(self, image_id: str) -> bool:
        """Delete gallery album image"""
        try:
            def _delete_image():
                response = self._get_client().table("gallery_images").delete().eq("id", image_id).execute()
                return len(response.data) > 0 if response.data else False
            
            deleted = await self._run_sync(_delete_image)
            return deleted
            
        except Exception as e:
            raise handle_supabase_error(e, "delete gallery image")
    
    async def get_gallery_stats(self) -> dict:
        """Get gallery statistics"""
        try:
            def _get_stats():
                # Get total albums
                albums_response = self._get_client().table("gallery_albums").select("id", count='exact').execute()
                total_albums = albums_response.count if hasattr(albums_response, 'count') else 0
                
                # Get total images
                images_response = self._get_client().table("gallery_images").select("id", count='exact').execute()
                total_images = images_response.count if hasattr(images_response, 'count') else 0
                
                return {
                    "total_albums": total_albums,
                    "total_images": total_images,
                    "average_images_per_album": round(total_images / total_albums, 2) if total_albums > 0 else 0
                }
            
            stats = await self._run_sync(_get_stats)
            return stats
            
        except Exception as e:
            raise handle_supabase_error(e, "get gallery stats")

    # App Settings Methods
    async def get_app_settings(self) -> Dict[str, Any]:
        """Get application settings"""
        try:
            def _get_settings():
                client = self._get_client()
                response = client.table("app_settings").select("*").eq("id", 1).execute()
                
                if not response.data:
                    # Return default settings if none exist
                    return {
                        "id": 1,
                        "company_name": "SafarSaga Trips",
                        "contact_email": "safarsagatrips@gmail.com",
                        "contact_phone": "+91 9311706027",
                        "address": "shop no 3 basement, Plot no 1,Tajpur Rd, Badarpur Extension,Tajpur, badarpur border, NewDelhi, Delhi 110044",
                        "currency": "INR",
                        "gst_rate": 5.00,
                        "maintenance_mode": False,
                        "notify_on_new_booking": True,
                        "notify_on_new_user": True,
                        "notify_on_payment": True,
                        "terms_and_conditions": "Standard booking terms and conditions apply. Please read carefully before confirming your booking."
                    }
                
                return response.data[0]
            
            settings = await self._run_sync(_get_settings)
            return settings
            
        except Exception as e:
            raise handle_supabase_error(e, "get app settings")

    async def update_app_settings(self, settings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update application settings"""
        try:
            def _update_settings():
                client = self._get_client()
                
                # Remove None values to avoid overwriting with nulls
                update_data = {k: v for k, v in settings_data.items() if v is not None}
                
                # Always update the updated_at timestamp
                update_data["updated_at"] = datetime.utcnow().isoformat()
                
                # Check if settings row exists
                existing = client.table("app_settings").select("id").eq("id", 1).execute()
                
                if not existing.data:
                    # Insert new settings row
                    update_data["id"] = 1
                    response = client.table("app_settings").insert(update_data).execute()
                else:
                    # Update existing settings
                    response = client.table("app_settings").update(update_data).eq("id", 1).execute()
                
                if not response.data:
                    raise DatabaseException("Failed to update app settings")
                
                return response.data[0]
            
            updated_settings = await self._run_sync(_update_settings)
            return updated_settings
            
        except Exception as e:
            raise handle_supabase_error(e, "update app settings")