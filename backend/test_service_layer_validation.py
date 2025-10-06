#!/usr/bin/env python3
"""
Test script to validate service layer type guards
This tests the comprehensive validation in SupabaseService._validate_and_convert_booking_data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.supabase_service import SupabaseService
from app.exceptions import ValidationException, DatabaseException
import pytest

def test_service_layer_validation():
    """Test the service layer validation method directly"""
    print("=== Testing Service Layer Validation ===")
    
    # Create service instance
    service = SupabaseService()
    
    # Valid test cases
    valid_cases = [
        {
            "name": "Valid booking data with integers",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0,
                "contact_info": {
                    "phone": "9876543210"
                }
            }
        },
        {
            "name": "Valid booking data with string numbers",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": "3",
                "total_amount": "2000.50",
                "contact_info": {
                    "phone": "+91 9876543210"
                }
            }
        },
        {
            "name": "Valid booking data with float seats (whole number)",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 5.0,
                "total_amount": 3000,
                "contact_info": {
                    "phone": "(555) 123-4567"
                }
            }
        },
        {
            "name": "Valid booking data with whitespace trimming",
            "data": {
                "destination_id": "  dest-12345678  ",
                "user_id": "  user-12345678  ",
                "seats": "  4  ",
                "total_amount": "  2500.75  ",
                "contact_info": {
                    "phone": "  9876543210  "
                }
            }
        }
    ]
    
    # Invalid test cases
    invalid_cases = [
        {
            "name": "Invalid seats - non-numeric string",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": "abc",
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - decimal string",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": "2.5",
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - decimal float",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2.5,
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - zero",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 0,
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - negative",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": -1,
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - too many",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 11,
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - None",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": None,
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid seats - wrong type",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": [],
                "total_amount": 1500.0
            },
            "expected_field": "seats"
        },
        {
            "name": "Invalid total_amount - negative",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": -100.0
            },
            "expected_field": "total_amount"
        },
        {
            "name": "Invalid total_amount - zero",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 0
            },
            "expected_field": "total_amount"
        },
        {
            "name": "Invalid total_amount - non-numeric string",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": "invalid"
            },
            "expected_field": "total_amount"
        },
        {
            "name": "Invalid destination_id - empty",
            "data": {
                "destination_id": "",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0
            },
            "expected_field": "destination_id"
        },
        {
            "name": "Invalid destination_id - too short",
            "data": {
                "destination_id": "short",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0
            },
            "expected_field": "destination_id"
        },
        {
            "name": "Invalid destination_id - wrong type",
            "data": {
                "destination_id": 123,
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0
            },
            "expected_field": "destination_id"
        },
        {
            "name": "Invalid phone - too short",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0,
                "contact_info": {
                    "phone": "123456789"
                }
            },
            "expected_field": "contact_info.phone"
        },
        {
            "name": "Invalid phone - contains letters",
            "data": {
                "destination_id": "dest-12345678",
                "user_id": "user-12345678",
                "seats": 2,
                "total_amount": 1500.0,
                "contact_info": {
                    "phone": "98765abc10"
                }
            },
            "expected_field": "contact_info.phone"
        }
    ]
    
    passed = 0
    failed = 0
    
    print("\n--- Valid Cases ---")
    for case in valid_cases:
        try:
            result = service._validate_and_convert_booking_data(case["data"])
            print(f"✅ {case['name']}: Validation passed")
            
            # Verify data types are correct
            if 'seats' in result:
                assert isinstance(result['seats'], int), f"Seats should be int, got {type(result['seats'])}"
            if 'total_amount' in result:
                assert isinstance(result['total_amount'], float), f"Total amount should be float, got {type(result['total_amount'])}"
            if 'destination_id' in result:
                assert isinstance(result['destination_id'], str), f"Destination ID should be str, got {type(result['destination_id'])}"
            
            passed += 1
        except ValidationException as e:
            print(f"❌ {case['name']}: Unexpected validation error: {e.message}")
            failed += 1
        except Exception as e:
            print(f"❌ {case['name']}: Unexpected error: {str(e)}")
            failed += 1
    
    print("\n--- Invalid Cases ---")
    for case in invalid_cases:
        try:
            result = service._validate_and_convert_booking_data(case["data"])
            print(f"❌ {case['name']}: Expected validation error but passed")
            failed += 1
        except ValidationException as e:
            # Check if the error is for the expected field
            expected_field = case.get("expected_field", "")
            if expected_field and expected_field in e.details.get("field", ""):
                print(f"✅ {case['name']}: Correctly rejected - {e.message}")
                passed += 1
            elif not expected_field:
                print(f"✅ {case['name']}: Correctly rejected - {e.message}")
                passed += 1
            else:
                print(f"❌ {case['name']}: Validation error but wrong field. Expected '{expected_field}', got '{e.details.get('field', 'unknown')}'")
                failed += 1
        except Exception as e:
            print(f"❌ {case['name']}: Unexpected error type: {str(e)}")
            failed += 1
    
    print(f"\nService Layer Validation Results: {passed} passed, {failed} failed")
    return failed == 0

def test_data_type_conversion():
    """Test that data types are properly converted"""
    print("\n=== Testing Data Type Conversion ===")
    
    service = SupabaseService()
    
    test_data = {
        "destination_id": "  dest-12345678  ",  # Should be trimmed
        "user_id": "user-12345678",
        "seats": "5",  # String should become int
        "total_amount": "2500.75",  # String should become float
        "contact_info": {
            "phone": "  +91 9876543210  "  # Should be trimmed
        }
    }
    
    try:
        result = service._validate_and_convert_booking_data(test_data)
        
        # Check data types
        checks = [
            (isinstance(result['seats'], int), f"Seats should be int, got {type(result['seats'])}"),
            (result['seats'] == 5, f"Seats should be 5, got {result['seats']}"),
            (isinstance(result['total_amount'], float), f"Total amount should be float, got {type(result['total_amount'])}"),
            (result['total_amount'] == 2500.75, f"Total amount should be 2500.75, got {result['total_amount']}"),
            (isinstance(result['destination_id'], str), f"Destination ID should be str, got {type(result['destination_id'])}"),
            (result['destination_id'] == "dest-12345678", f"Destination ID should be trimmed, got '{result['destination_id']}'"),
        ]
        
        all_passed = True
        for check, message in checks:
            if check:
                print(f"✅ {message.replace('should be', 'is correctly')}")
            else:
                print(f"❌ {message}")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Data type conversion test failed: {str(e)}")
        return False

def test_edge_cases():
    """Test edge cases and boundary conditions"""
    print("\n=== Testing Edge Cases ===")
    
    service = SupabaseService()
    
    edge_cases = [
        {
            "name": "Minimum valid seats (1)",
            "data": {"seats": 1, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 100.0},
            "should_pass": True
        },
        {
            "name": "Maximum valid seats (10)",
            "data": {"seats": 10, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 1000.0},
            "should_pass": True
        },
        {
            "name": "Minimum valid destination ID length (8 chars)",
            "data": {"seats": 2, "destination_id": "12345678", "user_id": "user-12345678", "total_amount": 200.0},
            "should_pass": True
        },
        {
            "name": "Very small positive amount",
            "data": {"seats": 1, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 0.01},
            "should_pass": True
        },
        {
            "name": "Large valid amount",
            "data": {"seats": 5, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 999999.99},
            "should_pass": True
        },
        {
            "name": "Empty contact_info (should be allowed)",
            "data": {"seats": 2, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 200.0, "contact_info": {}},
            "should_pass": True
        },
        {
            "name": "None contact_info (should be allowed)",
            "data": {"seats": 2, "destination_id": "dest-12345678", "user_id": "user-12345678", "total_amount": 200.0, "contact_info": None},
            "should_pass": True
        }
    ]
    
    passed = 0
    failed = 0
    
    for case in edge_cases:
        try:
            result = service._validate_and_convert_booking_data(case["data"])
            if case["should_pass"]:
                print(f"✅ {case['name']}: Correctly passed")
                passed += 1
            else:
                print(f"❌ {case['name']}: Expected to fail but passed")
                failed += 1
        except ValidationException as e:
            if not case["should_pass"]:
                print(f"✅ {case['name']}: Correctly rejected - {e.message}")
                passed += 1
            else:
                print(f"❌ {case['name']}: Expected to pass but rejected - {e.message}")
                failed += 1
        except Exception as e:
            print(f"❌ {case['name']}: Unexpected error: {str(e)}")
            failed += 1
    
    print(f"\nEdge Cases Results: {passed} passed, {failed} failed")
    return failed == 0

def main():
    """Run all service layer validation tests"""
    print("🧪 Service Layer Type Guards Validation Tests")
    print("=" * 60)
    
    # Run all tests
    validation_test_passed = test_service_layer_validation()
    conversion_test_passed = test_data_type_conversion()
    edge_cases_test_passed = test_edge_cases()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS")
    print("=" * 60)
    
    all_tests_passed = all([
        validation_test_passed,
        conversion_test_passed,
        edge_cases_test_passed
    ])
    
    if all_tests_passed:
        print("🎉 All service layer validation tests PASSED!")
        print("✅ Comprehensive type validation and conversion working")
        print("✅ Proper error handling with structured ValidationException")
        print("✅ Data type conversion prevents 'str' to int errors")
        print("✅ Edge cases and boundary conditions handled correctly")
        print("✅ Service layer provides final defensive validation")
        return True
    else:
        print("❌ Some service layer validation tests FAILED!")
        print("❌ Please review the service layer validation implementation")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)