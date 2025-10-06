#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_supabase_joins():
    """Test different Supabase join syntaxes"""
    
    print("🔍 Testing Supabase Join Syntaxes")
    print("=" * 50)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Initialize service
        service = SupabaseService()
        client = service._get_client()
        
        print("✅ Supabase client initialized")
        
        # Test 1: Current join syntax
        print("\n🔗 Test 1: Current join syntax")
        try:
            response = client.table("tickets").select("""
                *,
                destination:destinations(*),
                event:events(*)
            """).limit(1).execute()
            
            print(f"Response: {response}")
            if response.data:
                booking = response.data[0]
                print(f"✅ Query executed successfully")
                print(f"Destination data: {booking.get('destination')}")
                print(f"Event data: {booking.get('event')}")
            else:
                print("❌ No data returned")
        except Exception as e:
            print(f"❌ Current syntax failed: {str(e)}")
        
        # Test 2: Alternative join syntax
        print("\n🔗 Test 2: Alternative join syntax")
        try:
            response = client.table("tickets").select("""
                *,
                destinations(*),
                events(*)
            """).limit(1).execute()
            
            if response.data:
                booking = response.data[0]
                print(f"✅ Alternative syntax worked")
                print(f"Destinations data: {booking.get('destinations')}")
                print(f"Events data: {booking.get('events')}")
            else:
                print("❌ No data returned")
        except Exception as e:
            print(f"❌ Alternative syntax failed: {str(e)}")
        
        # Test 3: Manual join approach - get destination separately
        print("\n🔗 Test 3: Manual join approach")
        try:
            # Get a booking first
            tickets_response = client.table("tickets").select("*").limit(1).execute()
            if tickets_response.data:
                booking = tickets_response.data[0]
                print(f"✅ Got booking: {booking.get('id')}")
                
                # Get destination if destination_id exists
                if booking.get('destination_id'):
                    dest_response = client.table("destinations").select("*").eq("id", booking.get('destination_id')).execute()
                    if dest_response.data:
                        destination = dest_response.data[0]
                        print(f"✅ Got destination: {destination.get('name')}")
                        
                        # Manually combine the data
                        combined_booking = {**booking, 'destination': destination}
                        print(f"✅ Manual join successful")
                        print(f"Combined booking destination: {combined_booking['destination']['name']}")
                    else:
                        print(f"❌ No destination found for ID: {booking.get('destination_id')}")
                
                # Get event if event_id exists
                if booking.get('event_id'):
                    event_response = client.table("events").select("*").eq("id", booking.get('event_id')).execute()
                    if event_response.data:
                        event = event_response.data[0]
                        print(f"✅ Got event: {event.get('name')}")
                    else:
                        print(f"❌ No event found for ID: {booking.get('event_id')}")
            else:
                print("❌ No bookings to test with")
        except Exception as e:
            print(f"❌ Manual join failed: {str(e)}")
        
        # Test 4: Check foreign key constraints
        print("\n🔗 Test 4: Check foreign key relationships")
        try:
            # Get a destination booking
            dest_booking_response = client.table("tickets").select("*").not_.is_("destination_id", "null").limit(1).execute()
            if dest_booking_response.data:
                booking = dest_booking_response.data[0]
                dest_id = booking.get('destination_id')
                print(f"✅ Found destination booking with destination_id: {dest_id}")
                
                # Check if destination exists
                dest_check = client.table("destinations").select("*").eq("id", dest_id).execute()
                if dest_check.data:
                    print(f"✅ Destination exists: {dest_check.data[0].get('name')}")
                else:
                    print(f"❌ Destination not found for ID: {dest_id}")
            else:
                print("❌ No destination bookings found")
        except Exception as e:
            print(f"❌ Foreign key check failed: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to test joins: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    
    async def main():
        success = await test_supabase_joins()
        
        if success:
            print("\n🎉 Join syntax testing completed!")
        else:
            print("\n💥 Join syntax testing failed!")
    
    asyncio.run(main())