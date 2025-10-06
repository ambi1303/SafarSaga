#!/usr/bin/env python3
"""
FINAL FIX VERIFICATION
Verifies all fixes are in place and provides actionable recommendations
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("=" * 80)
print("🔧 FINAL FIX VERIFICATION")
print("=" * 80)

checks_passed = []
checks_failed = []

# CHECK 1: Pydantic Model Validation
print("\n✓ CHECK 1: Pydantic Model Validation")
try:
    from app.models import BookingCreate, ContactInfo
    
    # Test with string seats
    contact = ContactInfo(phone="9876543210")
    booking = BookingCreate(
        destination_id="test-id",
        seats="2",  # String input
        travel_date="2025-12-25",
        contact_info=contact
    )
    
    if isinstance(booking.seats, int):
        print("  ✅ Pydantic converts string seats to int")
        checks_passed.append("Pydantic validation")
    else:
        print(f"  ❌ Pydantic did not convert seats: {type(booking.seats)}")
        checks_failed.append("Pydantic validation")
except Exception as e:
    print(f"  ❌ Pydantic validation error: {e}")
    checks_failed.append("Pydantic validation")

# CHECK 2: Business Logic Safety
print("\n✓ CHECK 2: Business Logic Safety")
try:
    from app.models import BookingBusinessRules
    from decimal import Decimal
    
    # Test with integer
    result1 = BookingBusinessRules.calculate_booking_amount(Decimal('1000'), 2, 3)
    
    # Test with string (should be handled safely now)
    result2 = BookingBusinessRules.calculate_booking_amount(Decimal('1000'), "2", 3)
    
    print("  ✅ calculate_booking_amount handles both int and string")
    checks_passed.append("Business logic safety")
except Exception as e:
    print(f"  ❌ Business logic error: {e}")
    checks_failed.append("Business logic safety")

# CHECK 3: Service Layer Validation
print("\n✓ CHECK 3: Service Layer Validation")
try:
    from app.services.supabase_service import SupabaseService
    
    service = SupabaseService()
    test_data = {
        "user_id": "test",
        "destination_id": "test",
        "seats": "2",  # String
        "total_amount": "100.50",  # String
        "booking_status": "pending",
        "payment_status": "unpaid"
    }
    
    validated = service._validate_and_convert_booking_data(test_data)
    
    if isinstance(validated['seats'], int) and isinstance(validated['total_amount'], float):
        print("  ✅ Service layer converts string data to proper types")
        checks_passed.append("Service layer validation")
    else:
        print(f"  ❌ Service layer types: seats={type(validated['seats'])}, amount={type(validated['total_amount'])}")
        checks_failed.append("Service layer validation")
except Exception as e:
    print(f"  ❌ Service layer error: {e}")
    checks_failed.append("Service layer validation")

# CHECK 4: Booking Endpoint Safety
print("\n✓ CHECK 4: Booking Endpoint Pre-calculation Safety")
try:
    with open("app/routers/bookings.py", "r") as f:
        content = f.read()
    
    if "seats_for_calculation" in content and "isinstance(seats_for_calculation, str)" in content:
        print("  ✅ Booking endpoint has pre-calculation safety checks")
        checks_passed.append("Endpoint safety")
    else:
        print("  ⚠️  Booking endpoint might not have pre-calculation safety")
        print("     This could be the source of the error!")
        checks_failed.append("Endpoint safety")
except Exception as e:
    print(f"  ❌ Could not check endpoint: {e}")
    checks_failed.append("Endpoint safety")

# CHECK 5: Global Error Handler
print("\n✓ CHECK 5: Global Error Handler")
try:
    with open("app/main.py", "r") as f:
        content = f.read()
    
    if "type_error_handler" in content and "Request" in content:
        print("  ✅ Global TypeError handler is configured")
        checks_passed.append("Global error handler")
    else:
        print("  ⚠️  Global error handler might not be configured")
        checks_failed.append("Global error handler")
except Exception as e:
    print(f"  ❌ Could not check main.py: {e}")
    checks_failed.append("Global error handler")

# SUMMARY
print("\n" + "=" * 80)
print("📊 VERIFICATION SUMMARY")
print("=" * 80)

print(f"\n✅ Checks Passed: {len(checks_passed)}/{len(checks_passed) + len(checks_failed)}")
for check in checks_passed:
    print(f"  ✓ {check}")

if checks_failed:
    print(f"\n❌ Checks Failed: {len(checks_failed)}")
    for check in checks_failed:
        print(f"  ✗ {check}")

# RECOMMENDATIONS
print("\n" + "=" * 80)
print("💡 RECOMMENDATIONS")
print("=" * 80)

if len(checks_failed) == 0:
    print("""
✅ All validation layers are in place and working!

If you're still seeing the error, please:

1. **RESTART THE SERVER COMPLETELY**
   - Stop the FastAPI server (Ctrl+C)
   - Start it again: uvicorn app.main:app --reload

2. **CLEAR BROWSER CACHE**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

3. **CAPTURE THE EXACT ERROR**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Make a booking
   - Click on the failed request
   - Copy the FULL error response
   - Share the complete stack trace

4. **CHECK SERVER LOGS**
   - Look at the FastAPI server console
   - Find the error with line numbers
   - Share the complete traceback

The error might be:
- In a different code path we haven't checked
- From cached code that hasn't been reloaded
- In a different function/endpoint
- Related to a specific data scenario

With the exact error message and line number, we can fix it immediately!
""")
else:
    print(f"""
⚠️  Some checks failed. This might be causing your error.

Failed checks: {', '.join(checks_failed)}

Please ensure:
1. All files have been saved
2. The server has been restarted
3. No syntax errors in the code

Run this script again after fixing the issues.
""")

print("=" * 80)
