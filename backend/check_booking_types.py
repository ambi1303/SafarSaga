#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def check_booking_types():
    """Check what types of bookings exist in the database"""
    
    print("🔍 Checking Booking Types in Database")
    print("=" * 50)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Initialize service
        service = SupabaseService()
        client = service._get_client()
        
        print("✅ Supabase client initialized")
        
        # Check all bookings and categorize them
        print("\n📊 Analyzing all bookings...")
        try:
            response = client.table("tickets").select("*").execute()
            if response.data:
                event_bookings = []
                destination_bookings = []
                
                for booking in response.data:
                    if booking.get('event_id') and not booking.get('destination_id'):
                        event_bookings.append(booking)
                    elif booking.get('destination_id') and not booking.get('event_id'):
                        destination_bookings.append(booking)
                    elif booking.get('event_id') and booking.get('destination_id'):
                        print(f"⚠️  Mixed booking found: {booking.get('id')}")
                    else:
                        print(f"❓ Unknown booking type: {booking.get('id')}")
                
                print(f"📅 Event-based bookings: {len(event_bookings)}")
                print(f"🏔️  Destination-based bookings: {len(destination_bookings)}")
                
                # Show sample of each type
                if event_bookings:
                    print(f"\n📅 Sample Event Booking:")
                    sample = event_bookings[0]
                    print(f"  ID: {sample.get('id')}")
                    print(f"  Event ID: {sample.get('event_id')}")
                    print(f"  Destination ID: {sample.get('destination_id')}")
                    print(f"  Seats: {sample.get('seats')}")
                    print(f"  Amount: {sample.get('total_amount')}")
                
                if destination_bookings:
                    print(f"\n🏔️  Sample Destination Booking:")
                    sample = destination_bookings[0]
                    print(f"  ID: {sample.get('id')}")
                    print(f"  Event ID: {sample.get('event_id')}")
                    print(f"  Destination ID: {sample.get('destination_id')}")
                    print(f"  Seats: {sample.get('seats')}")
                    print(f"  Amount: {sample.get('total_amount')}")
                
            else:
                print("❌ No bookings found")
        except Exception as e:
            print(f"❌ Error analyzing bookings: {str(e)}")
        
        # Check if events table has data
        print("\n🎭 Checking Events table...")
        try:
            response = client.table("events").select("*").limit(3).execute()
            if response.data:
                print(f"✅ Found {len(response.data)} events")
                for i, event in enumerate(response.data):
                    print(f"  Event {i+1}:")
                    print(f"    ID: {event.get('id')}")
                    print(f"    Name: {event.get('name', 'N/A')}")
                    print(f"    Destination: {event.get('destination', 'N/A')}")
            else:
                print("❌ No events found")
        except Exception as e:
            print(f"❌ Error checking events: {str(e)}")
        
        # Test join with events
        print("\n🔗 Testing join with events...")
        try:
            response = client.table("tickets").select("""
                *,
                destination:destinations(*),
                event:events(*)
            """).limit(2).execute()
            
            if response.data:
                for i, booking in enumerate(response.data):
                    print(f"  Booking {i+1}:")
                    print(f"    Has Event Data: {booking.get('event') is not None}")
                    print(f"    Has Destination Data: {booking.get('destination') is not None}")
                    
                    if booking.get('event'):
                        event = booking.get('event')
                        print(f"    Event Name: {event.get('name', 'N/A')}")
                        print(f"    Event Destination: {event.get('destination', 'N/A')}")
                    
                    if booking.get('destination'):
                        dest = booking.get('destination')
                        print(f"    Destination Name: {dest.get('name', 'N/A')}")
                        print(f"    Destination State: {dest.get('state', 'N/A')}")
        except Exception as e:
            print(f"❌ Error testing joins: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to check booking types: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    
    async def main():
        success = await check_booking_types()
        
        if success:
            print("\n🎉 Booking type analysis completed!")
        else:
            print("\n💥 Booking type analysis failed!")
    
    asyncio.run(main())