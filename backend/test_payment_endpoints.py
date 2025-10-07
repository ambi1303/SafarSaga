"""
Test payment admin endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# You'll need to replace this with a valid admin token
ADMIN_TOKEN = "your_admin_token_here"

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

def test_get_payment_info(booking_id: str):
    """Test getting payment info"""
    print(f"\n=== Testing GET /api/bookings/{booking_id}/payment-info ===")
    response = requests.get(
        f"{BASE_URL}/api/bookings/{booking_id}/payment-info",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response

def test_confirm_payment(booking_id: str):
    """Test confirming payment"""
    print(f"\n=== Testing POST /api/bookings/{booking_id}/confirm-payment ===")
    response = requests.post(
        f"{BASE_URL}/api/bookings/{booking_id}/confirm-payment",
        headers=headers
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response

def test_reject_payment(booking_id: str, reason: str):
    """Test rejecting payment"""
    print(f"\n=== Testing POST /api/bookings/{booking_id}/reject-payment ===")
    response = requests.post(
        f"{BASE_URL}/api/bookings/{booking_id}/reject-payment",
        headers=headers,
        json={"reason": reason}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response

if __name__ == "__main__":
    # Replace with actual booking ID
    booking_id = "d32cd2e8-4e80-47ca-8e51-86ca8cbefbb9"
    
    print("=" * 60)
    print("Payment Admin Endpoints Test")
    print("=" * 60)
    
    # Test 1: Get payment info
    test_get_payment_info(booking_id)
    
    # Test 2: Confirm payment (uncomment to test)
    # test_confirm_payment(booking_id)
    
    # Test 3: Reject payment (uncomment to test)
    # test_reject_payment(booking_id, "Invalid payment proof")
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)
