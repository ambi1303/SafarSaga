#!/usr/bin/env python3
"""
Test script to validate Pydantic model validation enhancements
This tests the enhanced validators in BookingCreate and ContactInfo models
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models import BookingCreate, ContactInfo
from pydantic import ValidationError
import pytest

def test_seats_validation():
    """Test the enhanced seats validation in BookingCreate model"""
    print("=== Testing Enhanced Seats Validation ===")
    
    # Valid test cases
    valid_cases = [
        (2, "Valid integer"),
        ("3", "Valid string number"),
        (1, "Minimum valid seats"),
        (10, "Maximum valid seats"),
        (5.0, "Valid float (whole number)"),
        ("  5  ", "String with whitespace"),
    ]
    
    # Invalid test cases
    invalid_cases = [
        ("abc", "Non-numeric string"),
        ("two", "Text number"),
        ("2.5", "Decimal string"),
        (2.5, "Decimal float"),
        (0, "Zero seats"),
        (-1, "Negative seats"),
        (11, "Too many seats"),
        ("", "Empty string"),
        ("  ", "Whitespace only"),
        (None, "None value"),
        ([], "List type"),
        ("none", "String 'none'"),
        ("null", "String 'null'"),
    ]
    
    passed = 0
    failed = 0
    
    print("\n--- Valid Cases ---")
    for test_value, description in valid_cases:
        try:
            # Create a minimal valid booking data
            booking_data = {
                "destination_id": "test-destination-123",
                "seats": test_value,
                "contact_info": {
                    "phone": "9876543210"
                }
            }
            booking = BookingCreate(**booking_data)
            print(f"✅ {description}: {test_value} -> {booking.seats}")
            passed += 1
        except ValidationError as e:
            print(f"❌ {description}: Unexpected validation error: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error: {str(e)}")
            failed += 1
    
    print("\n--- Invalid Cases ---")
    for test_value, description in invalid_cases:
        try:
            booking_data = {
                "destination_id": "test-destination-123",
                "seats": test_value,
                "contact_info": {
                    "phone": "9876543210"
                }
            }
            booking = BookingCreate(**booking_data)
            print(f"❌ {description}: Expected validation error but got seats={booking.seats}")
            failed += 1
        except ValidationError as e:
            # Extract the seats-related error message
            seats_errors = [error for error in e.errors() if 'seats' in str(error.get('loc', []))]
            if seats_errors:
                error_msg = seats_errors[0].get('msg', str(e))
                print(f"✅ {description}: Correctly rejected - {error_msg}")
                passed += 1
            else:
                print(f"❌ {description}: Validation error but not for seats: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error type: {str(e)}")
            failed += 1
    
    print(f"\nSeats Validation Results: {passed} passed, {failed} failed")
    return failed == 0

def test_phone_validation():
    """Test the enhanced phone validation in ContactInfo model"""
    print("\n=== Testing Enhanced Phone Validation ===")
    
    # Valid test cases
    valid_cases = [
        ("+91 9876543210", "Valid Indian number with country code"),
        ("9876543210", "Valid 10-digit number"),
        ("+1-555-123-4567", "Valid US number with formatting"),
        ("(555) 123-4567", "Valid number with parentheses"),
        ("123456789012345", "Valid 15-digit number"),
        ("  +91 9876543210  ", "Valid number with whitespace"),
    ]
    
    # Invalid test cases
    invalid_cases = [
        ("123456789", "Too short (9 digits)"),
        ("1234567890123456", "Too long (16 digits)"),
        ("98765abc10", "Contains letters"),
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        (None, "None value"),
        (123456789, "Integer instead of string"),
        ("", "Empty string"),
        ("+91-98765-43210@", "Contains invalid characters"),
    ]
    
    passed = 0
    failed = 0
    
    print("\n--- Valid Cases ---")
    for test_value, description in valid_cases:
        try:
            contact_info = ContactInfo(phone=test_value)
            print(f"✅ {description}: '{test_value}' -> Valid")
            passed += 1
        except ValidationError as e:
            print(f"❌ {description}: Unexpected validation error: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error: {str(e)}")
            failed += 1
    
    print("\n--- Invalid Cases ---")
    for test_value, description in invalid_cases:
        try:
            contact_info = ContactInfo(phone=test_value)
            print(f"❌ {description}: Expected validation error but passed")
            failed += 1
        except ValidationError as e:
            # Extract the phone-related error message
            phone_errors = [error for error in e.errors() if 'phone' in str(error.get('loc', []))]
            if phone_errors:
                error_msg = phone_errors[0].get('msg', str(e))
                print(f"✅ {description}: Correctly rejected - {error_msg}")
                passed += 1
            else:
                print(f"❌ {description}: Validation error but not for phone: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error type: {str(e)}")
            failed += 1
    
    print(f"\nPhone Validation Results: {passed} passed, {failed} failed")
    return failed == 0

def test_emergency_contact_validation():
    """Test the enhanced emergency contact validation"""
    print("\n=== Testing Enhanced Emergency Contact Validation ===")
    
    # Valid test cases (including None/empty which should be allowed)
    valid_cases = [
        ("+91 9876543210", "Valid emergency contact"),
        ("(555) 123-4567", "Valid with parentheses"),
        (None, "None value (optional field)"),
        ("", "Empty string (optional field)"),
        ("  ", "Whitespace only (should become None)"),
    ]
    
    # Invalid test cases
    invalid_cases = [
        ("123456789", "Too short"),
        ("1234567890123456", "Too long"),
        ("98765abc10", "Contains letters"),
        (123456789, "Integer instead of string"),
        ("invalid@phone", "Contains invalid characters"),
    ]
    
    passed = 0
    failed = 0
    
    print("\n--- Valid Cases ---")
    for test_value, description in valid_cases:
        try:
            contact_info = ContactInfo(phone="9876543210", emergency_contact=test_value)
            print(f"✅ {description}: '{test_value}' -> Valid (emergency_contact: {contact_info.emergency_contact})")
            passed += 1
        except ValidationError as e:
            print(f"❌ {description}: Unexpected validation error: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error: {str(e)}")
            failed += 1
    
    print("\n--- Invalid Cases ---")
    for test_value, description in invalid_cases:
        try:
            contact_info = ContactInfo(phone="9876543210", emergency_contact=test_value)
            print(f"❌ {description}: Expected validation error but passed")
            failed += 1
        except ValidationError as e:
            # Extract the emergency_contact-related error message
            emergency_errors = [error for error in e.errors() if 'emergency_contact' in str(error.get('loc', []))]
            if emergency_errors:
                error_msg = emergency_errors[0].get('msg', str(e))
                print(f"✅ {description}: Correctly rejected - {error_msg}")
                passed += 1
            else:
                print(f"❌ {description}: Validation error but not for emergency_contact: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error type: {str(e)}")
            failed += 1
    
    print(f"\nEmergency Contact Validation Results: {passed} passed, {failed} failed")
    return failed == 0

def test_destination_id_validation():
    """Test the enhanced destination_id validation"""
    print("\n=== Testing Enhanced Destination ID Validation ===")
    
    # Valid test cases
    valid_cases = [
        ("dest-12345678", "Valid destination ID"),
        ("uuid-1234-5678-9abc-def012345678", "UUID-like format"),
        ("  dest-123  ", "With whitespace (should be trimmed)"),
    ]
    
    # Invalid test cases
    invalid_cases = [
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        (None, "None value"),
        ("short", "Too short (less than 8 chars)"),
        (123, "Integer instead of string"),
    ]
    
    passed = 0
    failed = 0
    
    print("\n--- Valid Cases ---")
    for test_value, description in valid_cases:
        try:
            booking_data = {
                "destination_id": test_value,
                "seats": 2,
                "contact_info": {
                    "phone": "9876543210"
                }
            }
            booking = BookingCreate(**booking_data)
            print(f"✅ {description}: '{test_value}' -> '{booking.destination_id}'")
            passed += 1
        except ValidationError as e:
            print(f"❌ {description}: Unexpected validation error: {e}")
            failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error: {str(e)}")
            failed += 1
    
    print("\n--- Invalid Cases ---")
    for test_value, description in invalid_cases:
        try:
            booking_data = {
                "destination_id": test_value,
                "seats": 2,
                "contact_info": {
                    "phone": "9876543210"
                }
            }
            booking = BookingCreate(**booking_data)
            print(f"❌ {description}: Expected validation error but got destination_id='{booking.destination_id}'")
            failed += 1
        except ValidationError as e:
            # Extract the destination_id-related error message
            dest_errors = [error for error in e.errors() if 'destination_id' in str(error.get('loc', []))]
            if dest_errors:
                error_msg = dest_errors[0].get('msg', str(e))
                print(f"✅ {description}: Correctly rejected - {error_msg}")
                passed += 1
            else:
                print(f"❌ {description}: Validation error but not for destination_id: {e}")
                failed += 1
        except Exception as e:
            print(f"❌ {description}: Unexpected error type: {str(e)}")
            failed += 1
    
    print(f"\nDestination ID Validation Results: {passed} passed, {failed} failed")
    return failed == 0

def test_complete_booking_validation():
    """Test complete BookingCreate validation with various scenarios"""
    print("\n=== Testing Complete BookingCreate Validation ===")
    
    # Test a completely valid booking
    try:
        valid_booking = BookingCreate(
            destination_id="dest-12345678",
            seats="3",  # String that should be converted
            travel_date="2025-12-25",
            special_requests="Window seat please",
            contact_info=ContactInfo(
                phone="+91 9876543210",
                emergency_contact="(555) 123-4567"
            )
        )
        print("✅ Complete valid booking created successfully")
        print(f"  - Seats: {valid_booking.seats} (type: {type(valid_booking.seats)})")
        print(f"  - Destination ID: '{valid_booking.destination_id}'")
        print(f"  - Phone: '{valid_booking.contact_info.phone}'")
        print(f"  - Emergency Contact: '{valid_booking.contact_info.emergency_contact}'")
        return True
    except Exception as e:
        print(f"❌ Complete booking validation failed: {e}")
        return False

def main():
    """Run all Pydantic model validation tests"""
    print("🧪 Pydantic Model Validation Enhancement Tests")
    print("=" * 60)
    
    # Run all tests
    seats_test_passed = test_seats_validation()
    phone_test_passed = test_phone_validation()
    emergency_test_passed = test_emergency_contact_validation()
    dest_id_test_passed = test_destination_id_validation()
    complete_test_passed = test_complete_booking_validation()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS")
    print("=" * 60)
    
    all_tests_passed = all([
        seats_test_passed,
        phone_test_passed,
        emergency_test_passed,
        dest_id_test_passed,
        complete_test_passed
    ])
    
    if all_tests_passed:
        print("🎉 All Pydantic model validation tests PASSED!")
        print("✅ Enhanced seats validation with comprehensive type handling")
        print("✅ Improved phone number validation with format support")
        print("✅ Enhanced emergency contact validation")
        print("✅ Robust destination ID validation")
        print("✅ Complete BookingCreate model validation working")
        print("✅ Pre-validation prevents data type conversion errors")
        return True
    else:
        print("❌ Some Pydantic model validation tests FAILED!")
        print("❌ Please review the model validation implementation")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)