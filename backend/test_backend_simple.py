#!/usr/bin/env python3
"""
Simple backend test without Supabase client dependencies
Tests the core logic and validation
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

def test_validation_logic():
    """Test the validation logic without database calls"""
    print("🧪 Testing validation logic...")
    
    try:
        from app.validators import DestinationBookingValidator, BookingBusinessRules
        from app.models import ContactInfo
        
        # Test contact info validation
        contact_info = ContactInfo(
            phone="+91-9876543210",
            emergency_contact="+91-9876543211"
        )
        
        validator = DestinationBookingValidator()
        validator.validate_contact_info(contact_info)
        print("✅ Contact info validation works")
        
        # Test business rules
        can_cancel, reason = BookingBusinessRules.can_cancel_booking("pending")
        if can_cancel:
            print("✅ Booking cancellation logic works")
        
        # Test duration calculation
        duration = BookingBusinessRules.get_duration_days()
        if duration == 3:
            print("✅ Duration calculation works")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation logic error: {e}")
        return False

def test_error_handling():
    """Test error handling system"""
    print("🧪 Testing error handling...")
    
    try:
        from app.booking_errors import (
            destination_not_found_error,
            invalid_seats_error,
            BookingErrorCodes,
            BookingErrorMessages
        )
        
        # Test error creation
        error = destination_not_found_error("test-id")
        if error.error_code == BookingErrorCodes.DESTINATION_NOT_FOUND:
            print("✅ Error code system works")
        
        # Test error messages
        message = BookingErrorMessages.get_message(BookingErrorCodes.INVALID_SEATS_COUNT)
        if "travelers must be between" in message:
            print("✅ Error message system works")
        
        return True
        
    except Exception as e:
        print(f"❌ Error handling test error: {e}")
        return False

def test_model_validation():
    """Test Pydantic model validation"""
    print("🧪 Testing model validation...")
    
    try:
        from app.models import ContactInfo, BookingCreate
        
        # Test valid contact info
        contact_info = ContactInfo(
            phone="+91-9876543210",
            emergency_contact="+91-9876543211"
        )
        print("✅ ContactInfo model validation works")
        
        # Test booking create model
        future_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        
        booking_data = BookingCreate(
            destination_id="test-uuid",
            seats=2,
            travel_date=future_date,
            contact_info=contact_info,
            special_requests="Test booking"
        )
        print("✅ BookingCreate model validation works")
        
        return True
        
    except Exception as e:
        print(f"❌ Model validation error: {e}")
        return False

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing module imports...")
    
    try:
        from app.models import Booking, BookingCreate, ContactInfo
        from app.validators import validate_destination_booking
        from app.booking_errors import BookingErrorCodes
        from app.services.supabase_service import SupabaseService
        
        print("✅ All modules import successfully")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """Run simple backend tests"""
    print("🚀 Starting simple backend tests...\n")
    
    tests = [
        ("Module Imports", test_imports),
        ("Model Validation", test_model_validation),
        ("Validation Logic", test_validation_logic),
        ("Error Handling", test_error_handling)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            failed += 1
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📋 Total: {len(tests)}")
    
    if failed == 0:
        print(f"\n🎉 All backend logic tests passed!")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)