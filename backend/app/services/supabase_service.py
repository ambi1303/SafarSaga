"""
Supabase service for database operations
"""

import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.models import User, Event, Booking, GalleryImage, Destination
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
    
    def _validate_and_convert_booking_data(self, booking_data: dict) -> dict:
        """
        Comprehensive validation and type conversion for booking data.
        This is the final defensive layer before database operations.
        """
        from app.exceptions import ValidationException, DatabaseException
        
        print(f"DEBUG - Service layer validation - Input data types:")
        for key, value in booking_data.items():
            print(f"  - {key}: {value} (type: {type(value)})")
        
        # Create a copy to avoid modifying the original
        validated_data = booking_data.copy()
        
        # Validate and convert seats
        if 'seats' in validated_data:
            try:
                seats_value = validated_data['seats']
                print(f"DEBUG - Service layer seats validation: {seats_value} (type: {type(seats_value)})")
                
                if isinstance(seats_value, str):
                    # Handle string conversion with comprehensive validation
                    seats_value = seats_value.strip()
                    
                    if not seats_value:
                        raise ValidationException("Seat count cannot be empty", field="seats", value=booking_data['seats'])
                    
                    if not seats_value.isdigit():
                        # Check for common invalid patterns
                        if '.' in seats_value:
                            raise ValidationException(
                                f"Seat count must be a whole number, not a decimal: '{seats_value}'",
                                field="seats", 
                                value=seats_value
                            )
                        elif seats_value.lower() in ['none', 'null', 'undefined']:
                            raise ValidationException(
                                "Seat count is required and cannot be null",
                                field="seats", 
                                value=seats_value
                            )
                        else:
                            raise ValidationException(
                                f"Invalid seat count: '{seats_value}' is not a valid number",
                                field="seats", 
                                value=seats_value
                            )
                    
                    validated_data['seats'] = int(seats_value)
                    
                elif isinstance(seats_value, float):
                    # Handle float conversion
                    if not seats_value.is_integer():
                        raise ValidationException(
                            f"Seat count must be a whole number, not a decimal: {seats_value}",
                            field="seats", 
                            value=seats_value
                        )
                    validated_data['seats'] = int(seats_value)
                    
                elif isinstance(seats_value, int):
                    # Already an integer, validate range
                    validated_data['seats'] = seats_value
                    
                elif seats_value is None:
                    raise ValidationException(
                        "Seat count is required and cannot be null",
                        field="seats", 
                        value=None
                    )
                    
                else:
                    # Unsupported type
                    raise ValidationException(
                        f"Invalid seat count data type: {type(seats_value).__name__}. Expected a number.",
                        field="seats", 
                        value=str(seats_value)
                    )
                
                # Validate seats range
                seats_int = validated_data['seats']
                if seats_int < 1:
                    raise ValidationException(
                        f"Number of seats must be at least 1, got: {seats_int}",
                        field="seats", 
                        value=seats_int
                    )
                elif seats_int > 10:
                    raise ValidationException(
                        f"Number of seats cannot exceed 10, got: {seats_int}",
                        field="seats", 
                        value=seats_int
                    )
                
                print(f"DEBUG - Service layer seats converted: {validated_data['seats']} (type: {type(validated_data['seats'])})")
                
            except ValidationException:
                # Re-raise ValidationException as-is
                raise
            except (ValueError, TypeError) as e:
                raise ValidationException(
                    f"Failed to process seat count: {str(e)}",
                    field="seats", 
                    value=str(booking_data['seats'])
                )
        
        # Validate and convert total_amount
        if 'total_amount' in validated_data:
            try:
                amount_value = validated_data['total_amount']
                print(f"DEBUG - Service layer total_amount validation: {amount_value} (type: {type(amount_value)})")
                
                if isinstance(amount_value, str):
                    # Handle string conversion
                    amount_value = amount_value.strip()
                    
                    if not amount_value:
                        raise ValidationException(
                            "Total amount cannot be empty",
                            field="total_amount", 
                            value=booking_data['total_amount']
                        )
                    
                    try:
                        validated_data['total_amount'] = float(amount_value)
                    except ValueError:
                        raise ValidationException(
                            f"Invalid total amount: '{amount_value}' is not a valid number",
                            field="total_amount", 
                            value=amount_value
                        )
                        
                elif isinstance(amount_value, (int, float)):
                    validated_data['total_amount'] = float(amount_value)
                    
                elif amount_value is None:
                    raise ValidationException(
                        "Total amount is required and cannot be null",
                        field="total_amount", 
                        value=None
                    )
                    
                else:
                    raise ValidationException(
                        f"Invalid total amount data type: {type(amount_value).__name__}. Expected a number.",
                        field="total_amount", 
                        value=str(amount_value)
                    )
                
                # Validate amount range
                amount_float = validated_data['total_amount']
                if amount_float < 0:
                    raise ValidationException(
                        f"Total amount cannot be negative: {amount_float}",
                        field="total_amount", 
                        value=amount_float
                    )
                elif amount_float == 0:
                    raise ValidationException(
                        "Total amount cannot be zero. Please check pricing calculation.",
                        field="total_amount", 
                        value=amount_float
                    )
                
                print(f"DEBUG - Service layer total_amount converted: {validated_data['total_amount']} (type: {type(validated_data['total_amount'])})")
                
            except ValidationException:
                # Re-raise ValidationException as-is
                raise
            except (ValueError, TypeError) as e:
                raise ValidationException(
                    f"Failed to process total amount: {str(e)}",
                    field="total_amount", 
                    value=str(booking_data['total_amount'])
                )
        
        # Validate destination_id
        if 'destination_id' in validated_data:
            dest_id = validated_data['destination_id']
            
            if not dest_id:
                raise ValidationException(
                    "Destination ID is required",
                    field="destination_id", 
                    value=dest_id
                )
            
            if not isinstance(dest_id, str):
                raise ValidationException(
                    f"Destination ID must be a string, got {type(dest_id).__name__}",
                    field="destination_id", 
                    value=str(dest_id)
                )
            
            dest_id = dest_id.strip()
            if not dest_id:
                raise ValidationException(
                    "Destination ID cannot be empty",
                    field="destination_id", 
                    value=validated_data['destination_id']
                )
            
            if len(dest_id) < 8:
                raise ValidationException(
                    f"Destination ID must be at least 8 characters long, got {len(dest_id)}",
                    field="destination_id", 
                    value=dest_id
                )
            
            validated_data['destination_id'] = dest_id
        
        # Validate user_id
        if 'user_id' in validated_data:
            user_id = validated_data['user_id']
            
            if not user_id:
                raise ValidationException(
                    "User ID is required",
                    field="user_id", 
                    value=user_id
                )
            
            if not isinstance(user_id, str):
                raise ValidationException(
                    f"User ID must be a string, got {type(user_id).__name__}",
                    field="user_id", 
                    value=str(user_id)
                )
            
            user_id = user_id.strip()
            if not user_id:
                raise ValidationException(
                    "User ID cannot be empty",
                    field="user_id", 
                    value=validated_data['user_id']
                )
            
            validated_data['user_id'] = user_id
        
        # Validate contact_info if present
        if 'contact_info' in validated_data and validated_data['contact_info']:
            contact_info = validated_data['contact_info']
            
            if isinstance(contact_info, dict):
                # Validate phone number in contact_info
                if 'phone' in contact_info:
                    phone = contact_info['phone']
                    
                    if not phone or not isinstance(phone, str):
                        raise ValidationException(
                            "Phone number is required in contact info",
                            field="contact_info.phone", 
                            value=phone
                        )
                    
                    phone = phone.strip()
                    if not phone:
                        raise ValidationException(
                            "Phone number cannot be empty",
                            field="contact_info.phone", 
                            value=contact_info['phone']
                        )
                    
                    # Basic phone validation (digits, spaces, hyphens, parentheses, plus)
                    phone_digits = phone.replace('+', '').replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
                    if not phone_digits.isdigit():
                        raise ValidationException(
                            "Phone number must contain only digits, spaces, hyphens, parentheses, and plus sign",
                            field="contact_info.phone", 
                            value=phone
                        )
                    
                    if len(phone_digits) < 10 or len(phone_digits) > 15:
                        raise ValidationException(
                            f"Phone number must be between 10 and 15 digits, got {len(phone_digits)} digits",
                            field="contact_info.phone", 
                            value=phone
                        )
        
        # Validate and convert travel_date
        if "travel_date" in validated_data and validated_data["travel_date"]:
            try:
                travel_date_value = validated_data["travel_date"]
                print(f"DEBUG - Service layer travel_date validation: {travel_date_value} (type: {type(travel_date_value)})")
                
                if isinstance(travel_date_value, str):
                    # Normalize ISO 8601 format (accepts both date-only and datetime strings)
                    if "T" in travel_date_value:
                        parsed_date = datetime.fromisoformat(travel_date_value.replace("Z", "+00:00"))
                    else:
                        parsed_date = datetime.strptime(travel_date_value, "%Y-%m-%d")
                    
                    # Supabase column is timestamptz → keep full ISO timestamp
                    validated_data["travel_date"] = parsed_date.isoformat()
                elif isinstance(travel_date_value, datetime):
                    validated_data["travel_date"] = travel_date_value.isoformat()
                else:
                    raise ValidationException(
                        f"Invalid travel_date type: {type(travel_date_value).__name__}",
                        field="travel_date",
                        value=str(travel_date_value)
                    )
                
                print(f"DEBUG - Service layer travel_date converted: {validated_data['travel_date']} (type: {type(validated_data['travel_date'])})")
                
            except ValidationException:
                # Re-raise ValidationException as-is
                raise
            except Exception as e:
                raise ValidationException(
                    f"Invalid travel_date format: {e}", 
                    field="travel_date", 
                    value=str(validated_data["travel_date"])
                )
        
        print(f"DEBUG - Service layer validation complete - Output data types:")
        for key, value in validated_data.items():
            print(f"  - {key}: {value} (type: {type(value)})")
        
        return validated_data
    
    def _safe_convert_booking_data(self, booking_data: dict) -> dict:
        """
        Safely convert booking data types for Pydantic model creation.
        This is used when we get data back from the database that might have type issues.
        """
        if not booking_data:
            return booking_data
        
        # Create a copy to avoid modifying the original
        safe_data = booking_data.copy()
        
        # Safely convert seats
        if 'seats' in safe_data and isinstance(safe_data['seats'], str):
            try:
                if safe_data['seats'].strip().isdigit():
                    safe_data['seats'] = int(safe_data['seats'])
                else:
                    print(f"Warning: Invalid seats value from database: '{safe_data['seats']}'")
                    safe_data['seats'] = 1  # Default fallback
            except (ValueError, AttributeError):
                print(f"Warning: Could not convert seats from database: {safe_data['seats']}")
                safe_data['seats'] = 1  # Default fallback
        
        # Safely convert total_amount
        if 'total_amount' in safe_data and isinstance(safe_data['total_amount'], str):
            try:
                safe_data['total_amount'] = float(safe_data['total_amount'])
            except (ValueError, AttributeError):
                print(f"Warning: Could not convert total_amount from database: {safe_data['total_amount']}")
                safe_data['total_amount'] = 0.0  # Default fallback
        
        return safe_data
    
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
                    # Get bookings data first
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
                    
                    # Add pagination and ordering with fallback for missing columns
                    try:
                        # Try booked_at first (preferred)
                        query = query.order("booked_at", desc=True).range(offset, offset + limit - 1)
                    except:
                        try:
                            # Fallback to created_at
                            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
                        except:
                            try:
                                # Fallback to updated_at
                                query = query.order("updated_at", desc=True).range(offset, offset + limit - 1)
                            except:
                                # Final fallback to id
                                query = query.order("id", desc=True).range(offset, offset + limit - 1)
                    
                    response = query.execute()
                    bookings_data = response.data if response.data else []
                    
                    # Manually join destination, event, and user data
                    enriched_bookings = []
                    for booking in bookings_data:
                        enriched_booking = booking.copy()
                        
                        # Get user data if user_id exists
                        if booking.get('user_id'):
                            try:
                                user_response = self._get_client().table("users").select("id, email, full_name").eq("id", booking['user_id']).execute()
                                if user_response.data:
                                    user_data = user_response.data[0]
                                    enriched_booking['user_name'] = user_data.get('full_name')
                                    enriched_booking['user_email'] = user_data.get('email')
                            except Exception as user_error:
                                print(f"Warning: Could not fetch user {booking.get('user_id')}: {str(user_error)}")
                                enriched_booking['user_name'] = None
                                enriched_booking['user_email'] = None
                        
                        # Get destination data if destination_id exists
                        if booking.get('destination_id'):
                            try:
                                dest_response = self._get_client().table("destinations").select("*").eq("id", booking['destination_id']).execute()
                                if dest_response.data:
                                    dest_data = dest_response.data[0]
                                    enriched_booking['destination'] = dest_data
                                    enriched_booking['destination_name'] = dest_data.get('name')
                            except Exception as dest_error:
                                print(f"Warning: Could not fetch destination {booking.get('destination_id')}: {str(dest_error)}")
                                enriched_booking['destination'] = None
                                enriched_booking['destination_name'] = None
                        
                        # Get event data if event_id exists
                        if booking.get('event_id'):
                            try:
                                event_response = self._get_client().table("events").select("*").eq("id", booking['event_id']).execute()
                                if event_response.data:
                                    event_data = event_response.data[0]
                                    enriched_booking['event'] = event_data
                                    # If no destination_name, use event name
                                    if not enriched_booking.get('destination_name'):
                                        enriched_booking['destination_name'] = event_data.get('name')
                            except Exception as event_error:
                                print(f"Warning: Could not fetch event {booking.get('event_id')}: {str(event_error)}")
                                enriched_booking['event'] = None
                        
                        enriched_bookings.append(enriched_booking)
                    
                    return enriched_bookings
                    
                except Exception as inner_e:
                    print(f"Bookings query failed: {str(inner_e)}")
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
    async def get_gallery_images(self, filters: dict = None, limit: int = 12, offset: int = 0) -> tuple[List[GalleryImage], int]:
        """Get gallery images with filtering and pagination"""
        try:
            def _get_images():
                query = self._get_client().table("gallery_images").select("""
                    *,
                    event:events(id, name, destination),
                    uploader:users(id, full_name, email)
                """)
                
                # Apply filters
                if filters:
                    if filters.get("event_id"):
                        query = query.eq("event_id", filters["event_id"])
                    
                    if filters.get("is_featured") is not None:
                        query = query.eq("is_featured", filters["is_featured"])
                    
                    if filters.get("tags"):
                        # Filter by tags (PostgreSQL array contains)
                        for tag in filters["tags"]:
                            query = query.contains("tags", [tag])
                
                # Add pagination and ordering
                query = query.order("uploaded_at", desc=True).range(offset, offset + limit - 1)
                
                response = query.execute()
                return response.data if response.data else []
            
            images_data = await self._run_sync(_get_images)
            
            # Convert to GalleryImage objects
            images = [GalleryImage(**image) for image in images_data]
            
            # Get total count (simplified)
            total = len(images_data)
            
            return images, total
            
        except Exception as e:
            raise handle_supabase_error(e, "get gallery images")
    
    async def create_gallery_image(self, image_data: dict) -> GalleryImage:
        """Create new gallery image"""
        try:
            def _create_image():
                response = self._get_client().table("gallery_images").insert(image_data).execute()
                return response.data[0] if response.data else None
            
            created_image = await self._run_sync(_create_image)
            
            if not created_image:
                raise DatabaseException("Failed to create gallery image")
            
            return GalleryImage(**created_image)
            
        except Exception as e:
            raise handle_supabase_error(e, "create gallery image")
    
    async def get_gallery_image_by_id(self, image_id: str) -> Optional[GalleryImage]:
        """Get gallery image by ID"""
        try:
            def _get_image():
                response = self._get_client().table("gallery_images").select("""
                    *,
                    event:events(id, name, destination),
                    uploader:users(id, full_name, email)
                """).eq("id", image_id).maybe_single().execute()
                return response.data if response and response.data else None
            
            image_data = await self._run_sync(_get_image)
            
            if not image_data:
                return None
            
            return GalleryImage(**image_data)
            
        except Exception as e:
            error_str = str(e).lower()
            if any(phrase in error_str for phrase in ["no rows found", "not found", "pgrst116", "nonetype"]):
                return None
            raise handle_supabase_error(e, "get gallery image by ID")
    
    async def update_gallery_image(self, image_id: str, update_data: dict) -> GalleryImage:
        """Update gallery image"""
        try:
            def _update_image():
                response = self._get_client().table("gallery_images").update(update_data).eq("id", image_id).execute()
                return response.data[0] if response.data else None
            
            updated_image = await self._run_sync(_update_image)
            
            if not updated_image:
                raise NotFoundException("Gallery Image", image_id)
            
            return GalleryImage(**updated_image)
            
        except Exception as e:
            raise handle_supabase_error(e, "update gallery image")
    
    async def delete_gallery_image(self, image_id: str) -> bool:
        """Delete gallery image"""
        try:
            def _delete_image():
                response = self._get_client().table("gallery_images").delete().eq("id", image_id).execute()
                return len(response.data) > 0 if response.data else False
            
            deleted = await self._run_sync(_delete_image)
            return deleted
            
        except Exception as e:
            raise handle_supabase_error(e, "delete gallery image")
    
    # Destination operations
    async def get_destinations(self, filters: dict = None, limit: int = 20, offset: int = 0) -> tuple[List[Destination], int]:
        """Get destinations with filtering and pagination"""
        try:
            def _get_destinations():
                query = self._get_client().table("destinations").select("*")
                
                # Apply filters
                if filters:
                    if filters.get("state"):
                        query = query.ilike("state", f"%{filters['state']}%")
                    
                    if filters.get("difficulty_level"):
                        query = query.eq("difficulty_level", filters["difficulty_level"])
                    
                    if filters.get("min_cost"):
                        query = query.gte("average_cost_per_day", filters["min_cost"])
                    
                    if filters.get("max_cost"):
                        query = query.lte("average_cost_per_day", filters["max_cost"])
                    
                    if "is_active" in filters:
                        query = query.eq("is_active", filters["is_active"])
                
                # Add pagination and ordering
                query = query.order("name").range(offset, offset + limit - 1)
                
                response = query.execute()
                return response.data if response.data else []
            
            destinations_data = await self._run_sync(_get_destinations)
            
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
            
            # Get total count (simplified)
            total = len(destinations)
            
            return destinations, total
            
        except Exception as e:
            print(f"Error in get_destinations: {str(e)}")
            raise handle_supabase_error(e, "get destinations")
    
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
            def _create_destination():
                response = self._get_client().table("destinations").insert(destination_data).execute()
                return response.data[0] if response.data else None
            
            created_destination = await self._run_sync(_create_destination)
            
            if not created_destination:
                raise DatabaseException("Failed to create destination")
            
            return Destination(**created_destination)
            
        except Exception as e:
            raise handle_supabase_error(e, "create destination")
    
    async def update_destination(self, destination_id: str, update_data: dict) -> Destination:
        """Update destination"""
        try:
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
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

    # Health check
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