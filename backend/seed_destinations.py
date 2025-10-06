#!/usr/bin/env python3
"""
Seed script to populate the database with sample destinations/events
Run this script to add sample data for testing the booking system
"""

import asyncio
import os
from datetime import datetime, timedelta
from decimal import Decimal

from app.services.supabase_service import SupabaseService
from app.models import EventCreate, DifficultyLevel

# Sample destinations data
SAMPLE_DESTINATIONS = [
    {
        "name": "Manali & Kasol 2N/3D",
        "description": "Experience the beauty of Himachal with snow-capped mountains and serene valleys. This adventure-packed trip includes trekking, local sightseeing, and cultural experiences.",
        "destination": "Manali & Kasol, Himachal Pradesh",
        "price": Decimal("5499.00"),
        "max_capacity": 20,
        "start_date": datetime.now() + timedelta(days=30),
        "end_date": datetime.now() + timedelta(days=33),
        "difficulty_level": DifficultyLevel.MODERATE,
        "featured_image_url": "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Meals", "Snow Activities"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Tips"],
        "is_active": True
    },
    {
        "name": "Chakrata 1N/2D",
        "description": "Peaceful hill station getaway with pristine nature and tranquil environment. Perfect for a quick weekend escape from city life.",
        "destination": "Chakrata, Uttarakhand",
        "price": Decimal("4999.00"),
        "max_capacity": 15,
        "start_date": datetime.now() + timedelta(days=20),
        "end_date": datetime.now() + timedelta(days=22),
        "difficulty_level": DifficultyLevel.EASY,
        "featured_image_url": "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Nature Walks"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True
    },
    {
        "name": "Jibhi 2N/3D",
        "description": "Hidden gem of Himachal with untouched natural beauty and serenity. Experience authentic mountain life and pristine landscapes.",
        "destination": "Jibhi, Himachal Pradesh",
        "price": Decimal("5499.00"),
        "max_capacity": 18,
        "start_date": datetime.now() + timedelta(days=25),
        "end_date": datetime.now() + timedelta(days=28),
        "difficulty_level": DifficultyLevel.EASY,
        "featured_image_url": "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Waterfall Trek", "Local Village Tour"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True
    },
    {
        "name": "Chopta 2N/3D",
        "description": "Mini Switzerland of India with breathtaking meadows and mountain views. Perfect for trekking enthusiasts and nature lovers.",
        "destination": "Chopta, Uttarakhand",
        "price": Decimal("5499.00"),
        "max_capacity": 25,
        "start_date": datetime.now() + timedelta(days=35),
        "end_date": datetime.now() + timedelta(days=38),
        "difficulty_level": DifficultyLevel.MODERATE,
        "featured_image_url": "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Tungnath Trek", "Chandrashila Peak"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Porter Charges"],
        "is_active": True
    },
    {
        "name": "Udaipur 2N/3D",
        "description": "City of Lakes with royal palaces and rich cultural heritage. Explore the magnificent architecture and royal history of Rajasthan.",
        "destination": "Udaipur, Rajasthan",
        "price": Decimal("5999.00"),
        "max_capacity": 30,
        "start_date": datetime.now() + timedelta(days=40),
        "end_date": datetime.now() + timedelta(days=43),
        "difficulty_level": DifficultyLevel.EASY,
        "featured_image_url": "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "City Palace Tour", "Lake Pichola Boat Ride"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Monument Entry Fees"],
        "is_active": True
    },
    {
        "name": "Auli 2N/3D",
        "description": "Skiing paradise with panoramic Himalayan views and adventure activities. Experience the thrill of skiing in the Indian Himalayas.",
        "destination": "Auli, Uttarakhand",
        "price": Decimal("6999.00"),
        "max_capacity": 20,
        "start_date": datetime.now() + timedelta(days=45),
        "end_date": datetime.now() + timedelta(days=48),
        "difficulty_level": DifficultyLevel.CHALLENGING,
        "featured_image_url": "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Skiing Equipment", "Cable Car Ride"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Skiing Instructor"],
        "is_active": True
    },
    {
        "name": "Jaisalmer 2N/3D",
        "description": "Golden city with magnificent forts, desert safaris and cultural experiences. Immerse yourself in the desert culture of Rajasthan.",
        "destination": "Jaisalmer, Rajasthan",
        "price": Decimal("5499.00"),
        "max_capacity": 25,
        "start_date": datetime.now() + timedelta(days=50),
        "end_date": datetime.now() + timedelta(days=53),
        "difficulty_level": DifficultyLevel.EASY,
        "featured_image_url": "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Accommodation", "Desert Safari", "Camel Ride", "Cultural Show"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Tips"],
        "is_active": True
    },
    {
        "name": "Goa Beach Paradise 3N/4D",
        "description": "Relax and unwind on the pristine beaches of Goa with our all-inclusive beach holiday package. Perfect for beach lovers and party enthusiasts.",
        "destination": "Goa",
        "price": Decimal("7999.00"),
        "max_capacity": 35,
        "start_date": datetime.now() + timedelta(days=55),
        "end_date": datetime.now() + timedelta(days=59),
        "difficulty_level": DifficultyLevel.EASY,
        "featured_image_url": "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Professional Guide", "Transportation", "Beach Resort Stay", "Water Sports", "Beach Activities"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Alcohol", "Additional Water Sports"],
        "is_active": True
    }
]

async def seed_destinations():
    """Seed the database with sample destinations"""
    try:
        supabase_service = SupabaseService()
        
        print("🌱 Starting destination seeding...")
        
        # Check if destinations already exist
        existing_events, _ = await supabase_service.get_events({}, limit=100, offset=0)
        
        if len(existing_events) >= len(SAMPLE_DESTINATIONS):
            print(f"✅ Database already has {len(existing_events)} destinations. Skipping seeding.")
            return
        
        # Create destinations
        created_count = 0
        for dest_data in SAMPLE_DESTINATIONS:
            try:
                # Check if this destination already exists
                existing = [e for e in existing_events if e.name == dest_data["name"]]
                if existing:
                    print(f"⏭️  Destination '{dest_data['name']}' already exists. Skipping.")
                    continue
                
                # Create the destination
                event_create = EventCreate(**dest_data)
                created_event = await supabase_service.create_event(event_create.dict(), user_id=None)
                
                if created_event:
                    print(f"✅ Created destination: {dest_data['name']}")
                    created_count += 1
                else:
                    print(f"❌ Failed to create destination: {dest_data['name']}")
                    
            except Exception as e:
                print(f"❌ Error creating destination '{dest_data['name']}': {str(e)}")
                continue
        
        print(f"🎉 Seeding completed! Created {created_count} new destinations.")
        
        # Display summary
        all_events, _ = await supabase_service.get_events({}, limit=100, offset=0)
        print(f"📊 Total destinations in database: {len(all_events)}")
        
    except Exception as e:
        print(f"💥 Error during seeding: {str(e)}")
        raise

if __name__ == "__main__":
    print("🚀 SafarSaga Destination Seeder")
    print("=" * 40)
    
    # Run the seeding
    asyncio.run(seed_destinations())
    
    print("=" * 40)
    print("✨ Seeding process completed!")