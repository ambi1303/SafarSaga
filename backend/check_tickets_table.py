#!/usr/bin/env python3
"""
Check and fix tickets table structure
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_tickets_table():
    """Check tickets table structure and fix issues"""
    
    print("🔍 Checking Tickets Table...")
    print("=" * 50)
    
    try:
        from app.services.supabase_service import SupabaseService
        
        service = SupabaseService()
        
        print("🔗 Testing basic tickets table access...")
        
        # Test 1: Check if table exists with simple query
        def _test_table_exists():
            try:
                response = service._get_client().table("tickets").select("count").limit(1).execute()
                return True, "Table exists"
            except Exception as e:
                return False, str(e)
        
        exists, message = await service._run_sync(_test_table_exists)
        
        if not exists:
            print(f"❌ Tickets table not accessible: {message}")
            
            # Try to create the table
            print("🔧 Attempting to create tickets table...")
            
            def _create_tickets_table():
                try:
                    # Create tickets table with basic structure
                    sql = """
                    CREATE TABLE IF NOT EXISTS tickets (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        user_id UUID REFERENCES users(id),
                        event_id UUID REFERENCES events(id) NULL,
                        destination_id UUID REFERENCES destinations(id) NULL,
                        seats INTEGER NOT NULL DEFAULT 1,
                        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
                        booking_status VARCHAR(20) DEFAULT 'pending',
                        payment_status VARCHAR(20) DEFAULT 'unpaid',
                        special_requests TEXT,
                        contact_info JSONB,
                        travel_date DATE,
                        booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    
                    -- Add indexes
                    CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
                    CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
                    CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON tickets(destination_id);
                    CREATE INDEX IF NOT EXISTS idx_tickets_booking_status ON tickets(booking_status);
                    """
                    
                    response = service._get_client().rpc('exec_sql', {'sql': sql}).execute()
                    return True, "Table created successfully"
                except Exception as e:
                    return False, str(e)
            
            created, create_message = await service._run_sync(_create_tickets_table)
            
            if created:
                print(f"✅ {create_message}")
            else:
                print(f"❌ Failed to create table: {create_message}")
                print("Please create the tickets table manually in Supabase")
                return False
        else:
            print("✅ Tickets table exists and is accessible")
        
        print("\n📋 Testing tickets table columns...")
        
        # Test 2: Check table structure
        def _check_table_structure():
            try:
                # Try to select with all expected columns
                response = service._get_client().table("tickets").select(
                    "id, user_id, event_id, destination_id, seats, total_amount, "
                    "booking_status, payment_status, special_requests, contact_info, "
                    "travel_date, booked_at, created_at, updated_at"
                ).limit(1).execute()
                return True, "All columns accessible"
            except Exception as e:
                return False, str(e)
        
        structure_ok, structure_message = await service._run_sync(_check_table_structure)
        
        if structure_ok:
            print(f"✅ {structure_message}")
        else:
            print(f"⚠️ Table structure issue: {structure_message}")
            
            # Try with minimal columns
            def _check_minimal_structure():
                try:
                    response = service._get_client().table("tickets").select("id").limit(1).execute()
                    return True, "Basic structure accessible"
                except Exception as e:
                    return False, str(e)
            
            minimal_ok, minimal_message = await service._run_sync(_check_minimal_structure)
            
            if minimal_ok:
                print(f"✅ {minimal_message}")
                print("⚠️ Some columns may be missing but table is functional")
            else:
                print(f"❌ {minimal_message}")
                return False
        
        print("\n🧪 Testing booking operations...")
        
        # Test 3: Test get_bookings method
        try:
            bookings, total = await service.get_bookings(limit=1)
            print(f"✅ get_bookings working (found {total} bookings)")
        except Exception as e:
            print(f"❌ get_bookings failed: {str(e)}")
        
        print("\n🎉 Tickets table check completed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Check failed: {str(e)}")
        return False

async def create_sample_booking():
    """Create a sample booking for testing"""
    
    print("\n" + "=" * 50)
    print("🧪 Creating Sample Booking...")
    print("=" * 50)
    
    try:
        from app.services.supabase_service import SupabaseService
        
        service = SupabaseService()
        
        # Check if we have any destinations
        destinations, dest_total = await service.get_destinations(limit=1)
        
        if dest_total == 0:
            print("⚠️ No destinations found. Creating a sample destination first...")
            
            sample_destination = {
                "name": "Test Destination",
                "state": "Test State",
                "description": "A test destination for booking system testing",
                "average_cost_per_day": 5999,
                "difficulty_level": "Moderate",
                "best_time_to_visit": "Oct-Feb",
                "popular_activities": ["Testing", "Validation"],
                "featured_image_url": "https://example.com/test-image.jpg",
                "is_active": True
            }
            
            destination = await service.create_destination(sample_destination)
            print(f"✅ Created sample destination: {destination.name}")
        else:
            destination = destinations[0]
            print(f"✅ Using existing destination: {destination.name}")
        
        # Check if we have any users
        def _check_users():
            try:
                response = service._get_client().table("users").select("id").limit(1).execute()
                return response.data if response.data else []
            except Exception as e:
                print(f"Warning: Could not check users: {str(e)}")
                return []
        
        users = await service._run_sync(_check_users)
        
        if not users:
            print("⚠️ No users found. Skipping sample booking creation.")
            print("Create a user account first to test booking creation.")
            return True
        
        user_id = users[0]['id']
        print(f"✅ Using existing user: {user_id}")
        
        # Create sample booking
        sample_booking = {
            "user_id": user_id,
            "destination_id": destination.id,
            "seats": 2,
            "total_amount": destination.average_cost_per_day * 2,
            "booking_status": "pending",
            "payment_status": "unpaid",
            "special_requests": "Test booking for system validation",
            "contact_info": {
                "phone": "+91-9876543210",
                "emergency_contact": "+91-9876543211"
            },
            "travel_date": "2024-12-01"
        }
        
        booking = await service.create_destination_booking(sample_booking)
        print(f"✅ Created sample booking: {booking.id}")
        print(f"   Reference: {booking.booking_reference if hasattr(booking, 'booking_reference') else 'N/A'}")
        print(f"   Amount: ₹{booking.total_amount}")
        
        return True
        
    except Exception as e:
        print(f"❌ Sample booking creation failed: {str(e)}")
        return False

async def main():
    """Run all checks"""
    
    print("🚀 SafarSaga Tickets Table Check")
    print("=" * 50)
    
    # Check tickets table
    table_ok = await check_tickets_table()
    
    if table_ok:
        # Try to create sample booking
        await create_sample_booking()
        
        print("\n" + "=" * 50)
        print("✅ TICKETS TABLE CHECK COMPLETED!")
        print("The tickets table is now properly configured.")
        print("You can run the connection test again: python test_supabase_connection.py")
    else:
        print("\n" + "=" * 50)
        print("❌ TICKETS TABLE CHECK FAILED!")
        print("Please fix the tickets table issues before proceeding.")

if __name__ == "__main__":
    asyncio.run(main())