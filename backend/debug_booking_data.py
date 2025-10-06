#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def debug_booking_data():
    """Debug what data is actually being returned from the database"""
    
    print("🔍 Debugging Booking Data from Database")
    print("=" * 60)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Initialize service
        service = SupabaseService()
        client = service._get_client()
        
        print("✅ Supabase client initialized")
        
        # Test 1: Check if tickets table exists and has data
        print("\n📋 Test 1: Raw tickets table data")
        try:
            response = client.table("tickets").select("*").limit(2).execute()
            if response.data:
                print(f"✅ Found {len(response.data)} tickets in database")
                for i, ticket in enumerate(response.data):
                    print(f"  Ticket {i+1}:")
                    print(f"    ID: {ticket.get('id', 'N/A')}")
                    print(f"    User ID: {ticket.get('user_id', 'N/A')}")
                    print(f"    Destination ID: {ticket.get('destination_id', 'N/A')}")
                    print(f"    Event ID: {ticket.get('event_id', 'N/A')}")
                    print(f"    Seats: {ticket.get('seats', 'N/A')}")
                    print(f"    Total Amount: {ticket.get('total_amount', 'N/A')}")
                    print(f"    Status: {ticket.get('booking_status', 'N/A')}")
            else:
                print("❌ No tickets found in database")
        except Exception as e:
            print(f"❌ Error querying tickets table: {str(e)}")
        
        # Test 2: Check if destinations table exists and has data
        print("\n🏔️  Test 2: Destinations table data")
        try:
            response = client.table("destinations").select("*").limit(2).execute()
            if response.data:
                print(f"✅ Found {len(response.data)} destinations in database")
                for i, dest in enumerate(response.data):
                    print(f"  Destination {i+1}:")
                    print(f"    ID: {dest.get('id', 'N/A')}")
                    print(f"    Name: {dest.get('name', 'N/A')}")
                    print(f"    State: {dest.get('state', 'N/A')}")
                    print(f"    Active: {dest.get('is_active', 'N/A')}")
            else:
                print("❌ No destinations found in database")
        except Exception as e:
            print(f"❌ Error querying destinations table: {str(e)}")
        
        # Test 3: Try the join query manually
        print("\n🔗 Test 3: Join query test")
        try:
            response = client.table("tickets").select("""
                *,
                destination:destinations(*),
                event:events(*)
            """).limit(2).execute()
            
            if response.data:
                print(f"✅ Join query returned {len(response.data)} results")
                for i, booking in enumerate(response.data):
                    print(f"  Booking {i+1}:")
                    print(f"    ID: {booking.get('id', 'N/A')}")
                    print(f"    Destination ID: {booking.get('destination_id', 'N/A')}")
                    print(f"    Destination Data: {booking.get('destination', 'N/A')}")
                    print(f"    Event ID: {booking.get('event_id', 'N/A')}")
                    print(f"    Event Data: {booking.get('event', 'N/A')}")
                    
                    # Check destination details
                    dest_data = booking.get('destination')
                    if dest_data:
                        print(f"    ✅ Destination Name: {dest_data.get('name', 'N/A')}")
                        print(f"    ✅ Destination State: {dest_data.get('state', 'N/A')}")
                    else:
                        print(f"    ❌ No destination data in join")
            else:
                print("❌ Join query returned no results")
                
        except Exception as e:
            print(f"❌ Error with join query: {str(e)}")
        
        # Test 4: Test the service method
        print("\n🔧 Test 4: Service method test")
        try:
            bookings, total = await service.get_bookings(limit=2, offset=0)
            print(f"✅ Service returned {len(bookings)} bookings (total: {total})")
            
            for i, booking in enumerate(bookings):
                print(f"  Service Booking {i+1}:")
                print(f"    ID: {booking.id}")
                print(f"    Destination ID: {getattr(booking, 'destination_id', 'N/A')}")
                print(f"    Has destination attr: {hasattr(booking, 'destination')}")
                if hasattr(booking, 'destination'):
                    print(f"    Destination value: {getattr(booking, 'destination', 'N/A')}")
                
        except Exception as e:
            print(f"❌ Error with service method: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to debug booking data: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    
    async def main():
        success = await debug_booking_data()
        
        if success:
            print("\n🎉 Booking data debug completed!")
        else:
            print("\n💥 Booking data debug failed!")
    
    asyncio.run(main())