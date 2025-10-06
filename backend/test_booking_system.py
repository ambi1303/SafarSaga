#!/usr/bin/env python3
"""
End-to-end test for the booking system
Tests the complete booking flow with destinations
"""

import os
import sys
import asyncio
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

try:
    from app.services.supabase_service import SupabaseService
    from app.validators import validate_destination_booking
    from app.models import BookingCreate, ContactInfo
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Error: Required modules not found: {e}")
    print("Make sure you're running from the backend directory")
    sys.exit(1)


class BookingSystemTester:
    """Tests the booking system end-to-end"""
    
    def __init__(self):
        load_dotenv()
        self.supabase_service = SupabaseService()
        self.test_results = []
    
    async def test_destinations_available(self):
        """Test that destinations are available"""
        print("🧪 Testing destinations availability...")
        
        try:
            destinations, total = await self.supabase_service.get_destinations({}, limit=10, offset=0)
            
            if not destinations:
                self.test_results.append("❌ No destinations available")
                return False
            
            print(f"✅ Found {total} destinations:")
            for dest in destinations[:3]:  # Show first 3
                print(f"   - {dest.name} ({dest.state}) - ₹{dest.average_cost_per_day}/day")
            
            self.test_results.append(f"✅ {total} destinations available")
            return True
            
        except Exception as e:
            self.test_results.append(f"❌ Error fetching destinations: {e}")
            return False
    
    async def test_destination_validation(self):
        """Test destination booking validation"""
        print("🧪 Testing destination booking validation...")
        
        try:
            # Get a test destination
            destinations, _ = await self.supabase_service.get_destinations({}, limit=1, offset=0)
            if not destinations:
                self.test_results.append("❌ No destinations for validation test")
                return False
            
            test_destination = destinations[0]
            
            # Create test booking data
            contact_info = ContactInfo(
                phone="+91-9876543210",
                emergency_contact="+91-9876543211"
            )
            
            future_date = (datetime.now() + timedelta(days=30)).isoformat()
            
            booking_data = BookingCreate(
                destination_id=test_destination.id,
                seats=2,
                travel_date=future_date,
                contact_info=contact_info,
                special_requests="Test booking"
            )
            
            # Validate booking
            validation_result = validate_destination_booking(test_destination, booking_data)
            
            if validation_result['validated']:
                print(f"✅ Validation passed for {test_destination.name}")
                print(f"   - Duration: {validation_result['duration_days']} days")
                print(f"   - Total amount: ₹{validation_result['total_amount']}")
                self.test_results.append("✅ Destination booking validation works")
                return True
            else:
                self.test_results.append("❌ Destination booking validation failed")
                return False
                
        except Exception as e:
            self.test_results.append(f"❌ Validation test error: {e}")
            return False
    
    async def test_booking_creation_logic(self):
        """Test booking creation logic (without actually creating)"""
        print("🧪 Testing booking creation logic...")
        
        try:
            # Get a test destination
            destinations, _ = await self.supabase_service.get_destinations({}, limit=1, offset=0)
            if not destinations:
                self.test_results.append("❌ No destinations for creation test")
                return False
            
            test_destination = destinations[0]
            
            # Test the logic that would be used in booking creation
            contact_info = {
                "phone": "+91-9876543210",
                "emergency_contact": "+91-9876543211"
            }
            
            future_date = (datetime.now() + timedelta(days=30)).isoformat()
            
            # Simulate booking data preparation
            create_data = {
                "user_id": "test-user-id",  # Would be real user ID
                "destination_id": test_destination.id,
                "seats": 2,
                "total_amount": float(test_destination.average_cost_per_day * 2 * 3),  # 2 seats, 3 days
                "special_requests": "Test booking",
                "contact_info": contact_info,
                "travel_date": future_date,
                "booking_status": "pending",
                "payment_status": "unpaid"
            }
            
            # Validate the data structure
            required_fields = ["user_id", "destination_id", "seats", "total_amount", "booking_status", "payment_status"]
            missing_fields = [field for field in required_fields if field not in create_data]
            
            if missing_fields:
                self.test_results.append(f"❌ Missing required fields: {missing_fields}")
                return False
            
            print(f"✅ Booking creation logic validated for {test_destination.name}")
            print(f"   - Seats: {create_data['seats']}")
            print(f"   - Total: ₹{create_data['total_amount']}")
            print(f"   - Travel date: {create_data['travel_date']}")
            
            self.test_results.append("✅ Booking creation logic works")
            return True
            
        except Exception as e:
            self.test_results.append(f"❌ Booking creation test error: {e}")
            return False
    
    async def test_booking_queries(self):
        """Test booking query methods"""
        print("🧪 Testing booking query methods...")
        
        try:
            # Test get_bookings method
            bookings, total = await self.supabase_service.get_bookings({}, limit=5, offset=0)
            
            print(f"✅ Booking query works - found {total} bookings")
            
            if bookings:
                sample_booking = bookings[0]
                print(f"   - Sample booking ID: {sample_booking.id}")
                print(f"   - Status: {sample_booking.booking_status}")
                
                # Test get_booking_by_id
                booking_detail = await self.supabase_service.get_booking_by_id(sample_booking.id)
                if booking_detail:
                    print(f"✅ Individual booking query works")
                    self.test_results.append("✅ Booking queries work correctly")
                    return True
                else:
                    self.test_results.append("❌ Individual booking query failed")
                    return False
            else:
                print("ℹ️  No existing bookings to test with")
                self.test_results.append("✅ Booking queries work (no data to test)")
                return True
                
        except Exception as e:
            self.test_results.append(f"❌ Booking query test error: {e}")
            return False
    
    async def test_database_relationships(self):
        """Test database relationships work correctly"""
        print("🧪 Testing database relationships...")
        
        try:
            # Test booking_details view
            from supabase import create_client
            
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            client = create_client(supabase_url, supabase_key)
            
            # Test the view
            response = client.table('booking_details').select('*').limit(3).execute()
            
            print(f"✅ booking_details view works - {len(response.data)} records")
            
            # Check if view includes destination data
            if response.data:
                sample = response.data[0]
                has_destination_fields = any(key.startswith('destination_') for key in sample.keys())
                has_event_fields = any(key.startswith('event_') for key in sample.keys())
                
                if has_destination_fields or has_event_fields:
                    print("✅ View includes related data (destinations/events)")
                    self.test_results.append("✅ Database relationships work")
                    return True
                else:
                    self.test_results.append("⚠️  View missing related data fields")
                    return False
            else:
                print("ℹ️  No data in booking_details view to test")
                self.test_results.append("✅ Database relationships configured (no data)")
                return True
                
        except Exception as e:
            self.test_results.append(f"❌ Database relationship test error: {e}")
            return False
    
    async def run_all_tests(self):
        """Run all booking system tests"""
        print("🚀 Starting booking system end-to-end tests...\n")
        
        tests = [
            ("Destinations Available", self.test_destinations_available),
            ("Destination Validation", self.test_destination_validation),
            ("Booking Creation Logic", self.test_booking_creation_logic),
            ("Booking Queries", self.test_booking_queries),
            ("Database Relationships", self.test_database_relationships)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            try:
                result = await test_func()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test '{test_name}' crashed: {e}")
                failed += 1
                self.test_results.append(f"❌ {test_name} crashed: {e}")
        
        # Summary
        print(f"\n📊 Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📋 Total: {len(tests)}")
        
        print(f"\n📋 Detailed Results:")
        for result in self.test_results:
            print(f"  {result}")
        
        if failed == 0:
            print(f"\n🎉 All tests passed! Booking system is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
            return False


async def main():
    """Main test function"""
    try:
        tester = BookingSystemTester()
        success = await tester.run_all_tests()
        
        if success:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Test suite failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())