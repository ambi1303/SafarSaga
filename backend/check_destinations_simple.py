#!/usr/bin/env python3
"""
Simple script to check destinations in the database
"""

import requests
import json

# Supabase configuration
SUPABASE_URL = "https://araqnetcjdobovlmaiqw.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYXFuZXRjamRvYm92bG1haXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM5NTk3MywiZXhwIjoyMDc0OTcxOTczfQ.leB8zvKL3Spxc9oPsJ3pzE4FN6xb2BQsr7v0R61j5xc"

def check_destinations():
    """Check destinations table using REST API"""
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Check destinations table
        print("=== CHECKING DESTINATIONS TABLE ===")
        url = f"{SUPABASE_URL}/rest/v1/destinations?select=*&limit=20"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            destinations = response.json()
            print(f"Found {len(destinations)} destinations:")
            
            for dest in destinations:
                print(f"\n- Name: {dest.get('name', 'Unknown')}")
                print(f"  ID: {dest.get('id', 'No ID')}")
                print(f"  State: {dest.get('state', 'Unknown')}")
                print(f"  Price: ₹{dest.get('average_cost_per_day', 0)}/day")
                print(f"  Difficulty: {dest.get('difficulty_level', 'Unknown')}")
                print(f"  Active: {dest.get('is_active', False)}")
                
        else:
            print(f"Error fetching destinations: {response.status_code}")
            print(f"Response: {response.text}")
            
        # Check events table
        print("\n=== CHECKING EVENTS TABLE ===")
        url = f"{SUPABASE_URL}/rest/v1/events?select=*&limit=10"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            events = response.json()
            print(f"Found {len(events)} events:")
            
            for event in events:
                print(f"\n- Name: {event.get('name', 'Unknown')}")
                print(f"  ID: {event.get('id', 'No ID')}")
                print(f"  Destination: {event.get('destination', 'Unknown')}")
                print(f"  Destination ID: {event.get('destination_id', 'None')}")
                print(f"  Price: ₹{event.get('price', 0)}")
                print(f"  Active: {event.get('is_active', False)}")
                
        else:
            print(f"Error fetching events: {response.status_code}")
            print(f"Response: {response.text}")
            
        # Check bookings/tickets table
        print("\n=== CHECKING BOOKINGS/TICKETS TABLE ===")
        url = f"{SUPABASE_URL}/rest/v1/tickets?select=*&limit=5"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            bookings = response.json()
            print(f"Found {len(bookings)} bookings:")
            
            for booking in bookings:
                print(f"\n- Booking ID: {booking.get('id', 'No ID')}")
                print(f"  User ID: {booking.get('user_id', 'No user ID')}")
                print(f"  Event ID: {booking.get('event_id', 'No event ID')}")
                print(f"  Seats: {booking.get('seats', 0)}")
                print(f"  Total Amount: ₹{booking.get('total_amount', 0)}")
                print(f"  Booking Status: {booking.get('booking_status', 'Unknown')}")
                print(f"  Payment Status: {booking.get('payment_status', 'Unknown')}")
                
        else:
            print(f"Error fetching bookings: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_destinations()