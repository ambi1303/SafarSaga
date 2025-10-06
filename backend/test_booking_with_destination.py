#!/usr/bin/env python3

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_booking_with_destination():
    """Test fetching bookings with destination data"""
    
    print("🧪 Testing Booking with Destination Data")
    print("=" * 50)
    
    try:
        from services.supabase_service import SupabaseService
        
        # Initialize service
        service = SupabaseService()
        
        print("✅ Supabase service initialized")
        
        # Test fetching bookings
        try:
            bookings, total = await service.get_bookings(limit=5, offset=0)
            print(f"✅ Fetched {len(bookings)} bookings (total: {total})")
            
            if bookings:
                for i, booking in enumerate(bookings[:2]):  # Show first 2 bookings
                    print(f"\n📋 Booking {i+1}:")
                    print(f"  ID: {booking.id}")
                    print(f"  Destination ID: {getattr(booking, 'destination_id', 'N/A')}")
                    print(f"  Event ID: {getattr(booking, 'event_id', 'N/A')}")
                    print(f"  Seats: {booking.seats}")
                    print(f"  Total Amount: {booking.total_amount}")
                    print(f"  Status: {booking.booking_status}")
                    print(f"  Payment: {booking.payment_status}")
                    
                    # Check if destination data is included
                    if hasattr(booking, 'destination') and booking.destination:
                        print(f"  ✅ Destination Data Found:")
                        print(f"    Name: {getattr(booking.destination, 'name', 'N/A')}")
                        print(f"    State: {getattr(booking.destination, 'state', 'N/A')}")
                    else:
                        print(f"  ❌ No destination data found")
                    
                    # Check if event data is included
                    if hasattr(booking, 'event') and booking.event:
                        print(f"  ✅ Event Data Found:")
                        print(f"    Name: {getattr(booking.event, 'name', 'N/A')}")
                        print(f"    Destination: {getattr(booking.event, 'destination', 'N/A')}")
                    else:
                        print(f"  ❌ No event data found")
            else:
                print("📝 No bookings found in database")
                
        except Exception as fetch_error:
            print(f"❌ Error fetching bookings: {str(fetch_error)}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to test booking with destination: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    
    async def main():
        success = await test_booking_with_destination()
        
        if success:
            print("\n🎉 Booking destination test completed!")
        else:
            print("\n💥 Booking destination test failed!")
    
    asyncio.run(main())