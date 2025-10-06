#!/usr/bin/env python3
"""
Complete Booking System Test Suite
Tests the entire booking system from backend to frontend integration
"""

import asyncio
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx
import uuid

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_TIMEOUT = 30.0

# Test data
TEST_USER = {
    "email": "test@safarsaga.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "phone": "+91-9876543210"
}

TEST_DESTINATION = {
    "name": "Test Destination",
    "state": "Test State",
    "description": "A test destination for booking system testing",
    "average_cost_per_day": 5999,
    "difficulty_level": "Moderate",
    "best_time_to_visit": "Oct-Feb",
    "popular_activities": ["Testing", "Validation", "Integration"],
    "featured_image_url": "https://example.com/test-image.jpg",
    "is_active": True
}

class BookingSystemTester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=TEST_TIMEOUT)
        self.auth_token: Optional[str] = None
        self.test_user_id: Optional[str] = None
        self.test_destination_id: Optional[str] = None
        self.test_booking_id: Optional[str] = None
        self.results = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"    {message}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message
        })

    async def test_server_health(self) -> bool:
        """Test if the backend server is running"""
        try:
            response = await self.client.get(f"{API_BASE_URL}/health")
            success = response.status_code == 200
            self.log_test("Server Health Check", success, 
                         f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("Server Health Check", False, f"Error: {str(e)}")
            return False

    async def test_user_registration(self) -> bool:
        """Test user registration"""
        try:
            response = await self.client.post(
                f"{API_BASE_URL}/api/auth/register",
                json=TEST_USER
            )
            
            if response.status_code == 201:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                self.log_test("User Registration", True, 
                             f"User ID: {self.test_user_id}")
                return True
            elif response.status_code == 400:
                # User might already exist, try login
                return await self.test_user_login()
            else:
                self.log_test("User Registration", False, 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False

    async def test_user_login(self) -> bool:
        """Test user login"""
        try:
            response = await self.client.post(
                f"{API_BASE_URL}/api/auth/login",
                json={
                    "email": TEST_USER["email"],
                    "password": TEST_USER["password"]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.test_user_id = data.get("user", {}).get("id")
                self.log_test("User Login", True, 
                             f"Token received: {bool(self.auth_token)}")
                return True
            else:
                self.log_test("User Login", False, 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
            return False

    async def test_destinations_api(self) -> bool:
        """Test destinations API"""
        try:
            response = await self.client.get(
                f"{API_BASE_URL}/api/destinations",
                params={"is_active": True, "limit": 10}
            )
            
            if response.status_code == 200:
                data = response.json()
                destinations = data.get("items", [])
                
                if destinations:
                    # Use first destination for testing
                    self.test_destination_id = destinations[0]["id"]
                    self.log_test("Destinations API", True, 
                                 f"Found {len(destinations)} destinations")
                else:
                    self.log_test("Destinations API", True, 
                                 "No destinations found (empty database)")
                return True
            else:
                self.log_test("Destinations API", False, 
                             f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Destinations API", False, f"Error: {str(e)}")
            return False

    async def test_booking_creation(self) -> bool:
        """Test booking creation"""
        if not self.auth_token:
            self.log_test("Booking Creation", False, "No auth token")
            return False
            
        if not self.test_destination_id:
            self.log_test("Booking Creation", False, "No destination ID")
            return False

        try:
            booking_data = {
                "destination_id": self.test_destination_id,
                "seats": 2,
                "travel_date": (datetime.now() + timedelta(days=30)).isoformat()[:10],
                "special_requests": "Test booking request",
                "contact_info": {
                    "phone": "+91-9876543210",
                    "emergency_contact": "+91-9876543211"
                }
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=booking_data,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            if response.status_code == 201:
                data = response.json()
                self.test_booking_id = data.get("id")
                booking_ref = data.get("booking_reference")
                total_amount = data.get("total_amount")
                
                self.log_test("Booking Creation", True, 
                             f"Booking ID: {self.test_booking_id}, "
                             f"Reference: {booking_ref}, "
                             f"Amount: ₹{total_amount}")
                return True
            else:
                error_data = response.json() if response.content else {}
                self.log_test("Booking Creation", False, 
                             f"Status: {response.status_code}, "
                             f"Error: {error_data.get('detail', 'Unknown')}")
                return False
                
        except Exception as e:
            self.log_test("Booking Creation", False, f"Error: {str(e)}")
            return False

    async def test_booking_retrieval(self) -> bool:
        """Test booking retrieval"""
        if not self.auth_token or not self.test_booking_id:
            self.log_test("Booking Retrieval", False, "Missing auth token or booking ID")
            return False

        try:
            # Test get user bookings
            response = await self.client.get(
                f"{API_BASE_URL}/api/bookings",
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            if response.status_code != 200:
                self.log_test("Booking Retrieval", False, 
                             f"List bookings failed: {response.status_code}")
                return False
            
            list_data = response.json()
            bookings_count = len(list_data.get("items", []))
            
            # Test get specific booking
            response = await self.client.get(
                f"{API_BASE_URL}/api/bookings/{self.test_booking_id}",
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                destination_name = data.get("destination", {}).get("name", "Unknown")
                booking_status = data.get("booking_status")
                
                self.log_test("Booking Retrieval", True, 
                             f"Found {bookings_count} bookings, "
                             f"Destination: {destination_name}, "
                             f"Status: {booking_status}")
                return True
            else:
                self.log_test("Booking Retrieval", False, 
                             f"Get booking failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Booking Retrieval", False, f"Error: {str(e)}")
            return False

    async def test_payment_confirmation(self) -> bool:
        """Test payment confirmation"""
        if not self.auth_token or not self.test_booking_id:
            self.log_test("Payment Confirmation", False, "Missing auth token or booking ID")
            return False

        try:
            payment_data = {
                "payment_method": "UPI",
                "transaction_id": f"TXN{int(datetime.now().timestamp())}"
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings/{self.test_booking_id}/confirm-payment",
                json=payment_data,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                booking_status = data.get("booking", {}).get("booking_status")
                payment_status = data.get("booking", {}).get("payment_status")
                
                self.log_test("Payment Confirmation", True, 
                             f"Booking Status: {booking_status}, "
                             f"Payment Status: {payment_status}")
                return True
            else:
                error_data = response.json() if response.content else {}
                self.log_test("Payment Confirmation", False, 
                             f"Status: {response.status_code}, "
                             f"Error: {error_data.get('detail', 'Unknown')}")
                return False
                
        except Exception as e:
            self.log_test("Payment Confirmation", False, f"Error: {str(e)}")
            return False

    async def test_booking_cancellation(self) -> bool:
        """Test booking cancellation"""
        if not self.auth_token or not self.test_booking_id:
            self.log_test("Booking Cancellation", False, "Missing auth token or booking ID")
            return False

        try:
            response = await self.client.delete(
                f"{API_BASE_URL}/api/bookings/{self.test_booking_id}",
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                refund_amount = data.get("refund_amount", 0)
                refund_percentage = data.get("refund_percentage", 0)
                
                self.log_test("Booking Cancellation", True, 
                             f"Refund: ₹{refund_amount} ({refund_percentage}%)")
                return True
            else:
                error_data = response.json() if response.content else {}
                self.log_test("Booking Cancellation", False, 
                             f"Status: {response.status_code}, "
                             f"Error: {error_data.get('detail', 'Unknown')}")
                return False
                
        except Exception as e:
            self.log_test("Booking Cancellation", False, f"Error: {str(e)}")
            return False

    async def test_error_handling(self) -> bool:
        """Test error handling scenarios"""
        if not self.auth_token:
            self.log_test("Error Handling", False, "No auth token")
            return False

        try:
            # Test invalid destination booking
            invalid_booking = {
                "destination_id": str(uuid.uuid4()),  # Random UUID
                "seats": 1,
                "contact_info": {"phone": "+91-9876543210"}
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=invalid_booking,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            invalid_dest_handled = response.status_code in [404, 422]
            
            # Test missing required fields
            missing_field_booking = {
                "destination_id": self.test_destination_id or str(uuid.uuid4()),
                "seats": 1
                # Missing contact_info
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=missing_field_booking,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            missing_field_handled = response.status_code == 422
            
            # Test unauthorized access
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=invalid_booking
                # No authorization header
            )
            
            unauthorized_handled = response.status_code == 401
            
            success = invalid_dest_handled and missing_field_handled and unauthorized_handled
            
            self.log_test("Error Handling", success, 
                         f"Invalid destination: {invalid_dest_handled}, "
                         f"Missing field: {missing_field_handled}, "
                         f"Unauthorized: {unauthorized_handled}")
            return success
            
        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False

    async def test_data_validation(self) -> bool:
        """Test data validation"""
        if not self.auth_token:
            self.log_test("Data Validation", False, "No auth token")
            return False

        try:
            # Test invalid phone number format
            invalid_phone_booking = {
                "destination_id": self.test_destination_id or str(uuid.uuid4()),
                "seats": 1,
                "contact_info": {"phone": "invalid-phone"}
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=invalid_phone_booking,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            phone_validation = response.status_code == 422
            
            # Test invalid seat count
            invalid_seats_booking = {
                "destination_id": self.test_destination_id or str(uuid.uuid4()),
                "seats": 0,  # Invalid seat count
                "contact_info": {"phone": "+91-9876543210"}
            }
            
            response = await self.client.post(
                f"{API_BASE_URL}/api/bookings",
                json=invalid_seats_booking,
                headers={"Authorization": f"Bearer {self.auth_token}"}
            )
            
            seats_validation = response.status_code == 422
            
            success = phone_validation and seats_validation
            
            self.log_test("Data Validation", success, 
                         f"Phone validation: {phone_validation}, "
                         f"Seats validation: {seats_validation}")
            return success
            
        except Exception as e:
            self.log_test("Data Validation", False, f"Error: {str(e)}")
            return False

    async def run_all_tests(self) -> bool:
        """Run all tests in sequence"""
        print("🚀 Starting Complete Booking System Tests\n")
        
        tests = [
            ("Server Health", self.test_server_health),
            ("User Registration/Login", self.test_user_registration),
            ("Destinations API", self.test_destinations_api),
            ("Booking Creation", self.test_booking_creation),
            ("Booking Retrieval", self.test_booking_retrieval),
            ("Payment Confirmation", self.test_payment_confirmation),
            ("Error Handling", self.test_error_handling),
            ("Data Validation", self.test_data_validation),
            ("Booking Cancellation", self.test_booking_cancellation),
        ]
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            success = await test_func()
            
            if not success and test_name in ["Server Health", "User Registration/Login"]:
                print(f"❌ Critical test '{test_name}' failed - stopping tests")
                break
            
            # Small delay between tests
            await asyncio.sleep(1)
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        for result in self.results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
        
        print(f"\n🎯 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Booking system is working correctly.")
        else:
            print("⚠️ Some tests failed. Please check the issues above.")
        
        return passed == total

async def main():
    """Main test runner"""
    async with BookingSystemTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test runner failed: {e}")
        sys.exit(1)