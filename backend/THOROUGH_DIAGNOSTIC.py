#!/usr/bin/env python3
"""
THOROUGH END-TO-END DIAGNOSTIC
Traces the exact flow from frontend payload to backend processing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
import json
from app.models import BookingCreate, ContactInfo, BookingBusinessRules
from app.services.supabase_service import SupabaseService
from decimal import Decimal

print("=" * 80)
print("🔍 THOROUGH END-TO-END DIAGNOSTIC")
print("=" * 80)

# STEP 1: Frontend Payload Simulation
print("\n📱 STEP 1: FRONTEND PAYLOAD")
print("-" * 80)

frontend_payload = {
    "destination_id": "real-destination-id-here",
    "seats": 2,  # Number from frontend
    "travel_date": "2025-12-25",
    "special_requests": "Window seat",
    "contact_info": {
        "phone": "9876543210",
        "emergency_contact": None
    }
}

print("Frontend sends (after Number() conversion):")
print(json.dumps(frontend_payload, indent=2))
print(f"\nData types:")
print(f"  seats: {type(frontend_payload['seats']).__name__} = {frontend_payload['seats']}")
print(f"  travel_date: {type(frontend_payload['travel_date']).__name__} = {frontend_payload['travel_date']}")

# STEP 2: JSON Serialization/Deserialization
print("\n📄 STEP 2: JSON SERIALIZATION")
print("-" * 80)

json_string = json.dumps(frontend_payload)
print(f"JSON string: {json_string[:100]}...")

deserialized = json.loads(json_string)
print(f"\nAfter JSON parse:")
print(f"  seats: {type(deserialized['seats']).__name__} = {deserialized['seats']}")
print(f"  travel_date: {type(deserialized['travel_date']).__name__} = {deserialized['travel_date']}")

# STEP 3: Pydantic Validation
print("\n📝 STEP 3: PYDANTIC VALIDATION")
print("-" * 80)

try:
    contact_info = ContactInfo(**deserialized['contact_info'])
    print(f"✅ ContactInfo created")
    
    booking_create = BookingCreate(
        destination_id=deserialized['destination_id'],
        seats=deserialized['seats'],
        travel_date=deserialized['travel_date'],
        special_requests=deserialized.get('special_requests'),
        contact_info=contact_info
    )
    
    print(f"✅ BookingCreate validated")
    print(f"  seats after Pydantic: {type(booking_create.seats).__name__} = {booking_create.seats}")
    print(f"  travel_date after Pydantic: {type(booking_create.travel_date).__name__} = {booking_create.travel_date}")
    
except Exception as e:
    print(f"❌ Pydantic validation failed: {e}")
    sys.exit(1)

# STEP 4: Business Logic Calculation
print("\n🧮 STEP 4: BUSINESS LOGIC CALCULATION")
print("-" * 80)

try:
    destination_cost = Decimal('1000.00')
    duration_days = 3
    
    print(f"Calling calculate_booking_amount with:")
    print(f"  destination_cost: {destination_cost}")
    print(f"  seats: {booking_create.seats} (type: {type(booking_create.seats).__name__})")
    print(f"  duration_days: {duration_days}")
    
    total_amount = BookingBusinessRules.calculate_booking_amount(
        destination_cost,
        booking_create.seats,
        duration_days
    )
    
    print(f"✅ Calculation successful: {total_amount}")
    
except Exception as e:
    print(f"❌ Calculation failed: {e}")
    print(f"   Error type: {type(e).__name__}")
    if "'str' object cannot be interpreted as an integer" in str(e):
        print("   🚨 FOUND THE ERROR IN CALCULATION!")
    sys.exit(1)

# STEP 5: Service Layer Preparation
print("\n🔧 STEP 5: SERVICE LAYER DATA PREPARATION")
print("-" * 80)

create_data = {
    "user_id": "test-user-id",
    "destination_id": booking_create.destination_id,
    "seats": booking_create.seats,
    "total_amount": float(total_amount),
    "special_requests": booking_create.special_requests,
    "contact_info": booking_create.contact_info.model_dump() if booking_create.contact_info else None,
    "travel_date": booking_create.travel_date,
    "booking_status": "pending",
    "payment_status": "unpaid"
}

print("Data prepared for service layer:")
for key, value in create_data.items():
    if key != "contact_info":
        print(f"  {key}: {type(value).__name__} = {value}")

# STEP 6: Service Layer Validation
print("\n🛡️ STEP 6: SERVICE LAYER VALIDATION")
print("-" * 80)

async def test_service_validation():
    try:
        service = SupabaseService()
        validated_data = service._validate_and_convert_booking_data(create_data)
        
        print("✅ Service validation successful")
        print(f"  seats after service: {type(validated_data['seats']).__name__} = {validated_data['seats']}")
        print(f"  total_amount after service: {type(validated_data['total_amount']).__name__} = {validated_data['total_amount']}")
        print(f"  travel_date after service: {type(validated_data.get('travel_date')).__name__} = {validated_data.get('travel_date')}")
        
        return True
    except Exception as e:
        print(f"❌ Service validation failed: {e}")
        if "'str' object cannot be interpreted as an integer" in str(e):
            print("   🚨 FOUND THE ERROR IN SERVICE LAYER!")
        return False

service_success = asyncio.run(test_service_validation())

# STEP 7: Check for any remaining issues
print("\n🔍 STEP 7: POTENTIAL ISSUE ANALYSIS")
print("-" * 80)

issues_found = []

# Check if seats could be a string anywhere
if isinstance(frontend_payload['seats'], str):
    issues_found.append("Frontend is sending seats as string")

if isinstance(deserialized['seats'], str):
    issues_found.append("JSON deserialization resulted in string seats")

if isinstance(booking_create.seats, str):
    issues_found.append("Pydantic validation did not convert seats to int")

if isinstance(create_data['seats'], str):
    issues_found.append("Service layer data preparation has string seats")

if issues_found:
    print("⚠️  Issues found:")
    for issue in issues_found:
        print(f"  - {issue}")
else:
    print("✅ No data type issues found in the flow")

# FINAL SUMMARY
print("\n" + "=" * 80)
print("📊 DIAGNOSTIC SUMMARY")
print("=" * 80)

if service_success and not issues_found:
    print("✅ ALL CHECKS PASSED")
    print("\nThe booking flow is working correctly in isolation.")
    print("If you're still seeing the error, it might be:")
    print("  1. A different code path is being used")
    print("  2. The server hasn't been restarted with the new code")
    print("  3. There's cached code in the browser or server")
    print("  4. The error is in a different function/endpoint")
    print("\nRECOMMENDATIONS:")
    print("  1. Restart the FastAPI server completely")
    print("  2. Clear browser cache and hard refresh (Ctrl+F5)")
    print("  3. Check the actual error message and stack trace")
    print("  4. Look for the exact line number where the error occurs")
else:
    print("❌ ISSUES DETECTED")
    print("\nThe diagnostic found problems in the booking flow.")
    print("Review the steps above to see where the error occurred.")

print("\n" + "=" * 80)
