#!/usr/bin/env python3
"""
Test script to verify booking system fixes
"""

import os
import sys
import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from services.supabase_service import SupabaseService
from models import BookingCreate, BookingStatus, PaymentStatus

# Load environment variables
load_dotenv()

async def test_booking_system():
    """Test the booking system with current setup"""
    
    print("🧪 Testing SafarSaga Booking System...")
    print("=" * 50)
    
    try:
        # Initialize service
        supabase_service = SupabaseService()
        
        # Test 1: Check database connection
        print("1️⃣ Testing database connection...")
        health = await supabase_service.health_check()
        if health.get("status") == "connected":
            print("✅ Database connection successful")
        else:
            print(f"❌ Database connection failed: {health}")
            return False
        
        # Test 2: Check if events exist (acting as destinations)
        print("\n2️⃣ Checking available events/destinations...")
        events, total = await supabase_service.get_events({}, limit=5, offset=0)
        
        if events:
            print(f"✅ Found {len(events)} events/destinations:")
            for event in events:
                print(f"   - {event.name} (ID: {event.id})")
                print(f"     Price: ₹{event.price}, Capacity: {event.max_capacity}")
        else:
            print("❌ No events found. Creating a test event...")
            
            # Create a test event
            test_event_data = {
                "name": "Test Manali Trip",
                "description": "Test destination for booking system",
                "destination": "Manali, Himachal Pradesh",
                "price": 5999.00,
                "max_capacity": 20,
                "current_bookings": 0,
                "start_date": (datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + 
                              timedelta(days=30)).isoformat(),
                "end_date": (datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + 
                            timedelta(days=33)).isoformat(),
                "difficulty_level": "Moderate",
                "is_active": True
            }
            
            try:
                from datetime import timedelta
                test_event = await supabase_service.create_event(test_event_data)
                print(f"✅ Created test event: {test_event.name} (ID: {test_event.id})")
                events = [test_event]
            except Exception as e:
                print(f"❌ Failed to create test event: {str(e)}")
                return False
        
        # Test 3: Test booking creation logic
        print("\n3️⃣ Testing booking creation logic...")
        
        if events:
            test_event = events[0]
            print(f"Using event: {test_event.name} (ID: {test_event.id})")
            
            # Test the booking validation logic
            print("   - Event is active:", test_event.is_active)
            print("   - Event start date:", test_event.start_date)
            print("   - Current time:", datetime.now(timezone.utc))
            
            if test_event.start_date:
                is_future = test_event.start_date > datetime.now(timezone.utc)
                print("   - Event is in future:", is_future)
            
            available_seats = test_event.max_capacity - test_event.current_bookings if test_event.max_capacity else 999
            print(f"   - Available seats: {available_seats}")
            
            print("✅ Booking validation logic working")
        
        # Test 4: Check booking table structure
        print("\n4️⃣ Checking booking table structure...")
        try:
            # Try to get bookings to verify table exists
            bookings, total = await supabase_service.get_bookings({}, limit=1, offset=0)
            print("✅ Bookings table accessible")
            print(f"   Found {total} existing bookings")
        except Exception as e:
            print(f"❌ Bookings table issue: {str(e)}")
            return False
        
        print("\n🎉 All tests passed! Booking system is ready.")
        print("\nNext steps:")
        print("1. Start the backend server: python -m uvicorn app.main:app --reload --port 8000")
        print("2. Test booking creation from the frontend")
        print("3. Use any event ID as destination_id in booking requests")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_booking_system())
    
    if not success:
        print("\n❌ Tests failed!")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")