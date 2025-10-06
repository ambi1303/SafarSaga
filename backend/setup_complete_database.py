#!/usr/bin/env python3
"""
Complete Database Setup Script for SafarSaga
Creates tables and populates with all destinations from the frontend
"""

import asyncio
import os
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

from app.services.supabase_service import SupabaseService

# All destinations from the destinations page
DESTINATIONS_DATA = [
    {
        "id": "1",
        "name": "Manali & Kasol 2N/3D",
        "description": "Experience the beauty of Himachal with snow-capped mountains and serene valleys",
        "destination": "Himachal Pradesh",
        "price": Decimal("5499.00"),
        "max_capacity": 20,
        "start_date": datetime.now() + timedelta(days=30),
        "end_date": datetime.now() + timedelta(days=33),
        "difficulty_level": "Moderate",
        "featured_image_url": "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Snow Activities", "Valley Views", "Local Culture", "Professional Guide", "Transportation"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True,
        "is_featured": True,
        "category": "Adventure",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.8,
        "reviews": 124,
        "best_time": "Oct-Feb",
        "group_size": "4-8 people"
    },
    {
        "id": "2", 
        "name": "Chakrata 1N/2D",
        "description": "Peaceful hill station getaway with pristine nature and tranquil environment",
        "destination": "Uttarakhand",
        "price": Decimal("4999.00"),
        "max_capacity": 15,
        "start_date": datetime.now() + timedelta(days=20),
        "end_date": datetime.now() + timedelta(days=22),
        "difficulty_level": "Easy",
        "featured_image_url": "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Nature Walks", "Tiger Falls", "Peaceful Environment", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True,
        "is_featured": False,
        "category": "Nature",
        "duration_days": 2,
        "duration_nights": 1,
        "rating": 4.7,
        "reviews": 89,
        "best_time": "Mar-Jun",
        "group_size": "2-6 people"
    },
    {
        "id": "3",
        "name": "Jibhi 2N/3D", 
        "description": "Hidden gem of Himachal with untouched natural beauty and serenity",
        "destination": "Himachal Pradesh",
        "price": Decimal("5499.00"),
        "max_capacity": 18,
        "start_date": datetime.now() + timedelta(days=25),
        "end_date": datetime.now() + timedelta(days=28),
        "difficulty_level": "Easy",
        "featured_image_url": "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Waterfall Trek", "Forest Walks", "Local Villages", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True,
        "is_featured": True,
        "category": "Nature",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.9,
        "reviews": 156,
        "best_time": "Apr-Oct",
        "group_size": "4-8 people"
    },
    {
        "id": "4",
        "name": "Chopta 2N/3D",
        "description": "Mini Switzerland of India with breathtaking meadows and mountain views",
        "destination": "Uttarakhand", 
        "price": Decimal("5499.00"),
        "max_capacity": 25,
        "start_date": datetime.now() + timedelta(days=35),
        "end_date": datetime.now() + timedelta(days=38),
        "difficulty_level": "Moderate",
        "featured_image_url": "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Tungnath Trek", "Chandrashila Peak", "Meadows", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Porter Charges"],
        "is_active": True,
        "is_featured": True,
        "category": "Adventure",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.8,
        "reviews": 203,
        "best_time": "Apr-Nov",
        "group_size": "4-10 people"
    },
    {
        "id": "5",
        "name": "Udaipur 2N/3D",
        "description": "City of Lakes with royal palaces and rich cultural heritage",
        "destination": "Rajasthan",
        "price": Decimal("5999.00"),
        "max_capacity": 30,
        "start_date": datetime.now() + timedelta(days=40),
        "end_date": datetime.now() + timedelta(days=43),
        "difficulty_level": "Easy",
        "featured_image_url": "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["City Palace", "Lake Pichola", "Boat Rides", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Monument Entry Fees"],
        "is_active": True,
        "is_featured": True,
        "category": "Cultural",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.9,
        "reviews": 198,
        "best_time": "Oct-Mar",
        "group_size": "2-8 people"
    },
    {
        "id": "6",
        "name": "Auli 2N/3D",
        "description": "Skiing paradise with panoramic Himalayan views and adventure activities",
        "destination": "Uttarakhand",
        "price": Decimal("6999.00"),
        "max_capacity": 20,
        "start_date": datetime.now() + timedelta(days=45),
        "end_date": datetime.now() + timedelta(days=48),
        "difficulty_level": "Challenging",
        "featured_image_url": "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Skiing", "Cable Car", "Himalayan Views", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Skiing Instructor"],
        "is_active": True,
        "is_featured": False,
        "category": "Adventure",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.8,
        "reviews": 167,
        "best_time": "Dec-Mar",
        "group_size": "4-8 people"
    },
    {
        "id": "7",
        "name": "Jaisalmer 2N/3D",
        "description": "Golden city with magnificent forts, desert safaris and cultural experiences",
        "destination": "Rajasthan",
        "price": Decimal("5499.00"),
        "max_capacity": 25,
        "start_date": datetime.now() + timedelta(days=50),
        "end_date": datetime.now() + timedelta(days=53),
        "difficulty_level": "Easy",
        "featured_image_url": "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Desert Safari", "Jaisalmer Fort", "Camel Rides", "Cultural Show"],
        "exclusions": ["Personal Expenses", "Travel Insurance", "Tips"],
        "is_active": True,
        "is_featured": False,
        "category": "Cultural",
        "duration_days": 3,
        "duration_nights": 2,
        "rating": 4.7,
        "reviews": 142,
        "best_time": "Oct-Mar",
        "group_size": "4-10 people"
    },
    {
        "id": "8",
        "name": "Manali & Kasol 3N/4D",
        "description": "Extended Himachal experience with more time to explore the beautiful valleys",
        "destination": "Himachal Pradesh",
        "price": Decimal("6499.00"),
        "max_capacity": 20,
        "start_date": datetime.now() + timedelta(days=55),
        "end_date": datetime.now() + timedelta(days=59),
        "difficulty_level": "Moderate",
        "featured_image_url": "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        "inclusions": ["Extended Stay", "Multiple Destinations", "Adventure Activities", "Professional Guide"],
        "exclusions": ["Personal Expenses", "Travel Insurance"],
        "is_active": True,
        "is_featured": True,
        "category": "Adventure",
        "duration_days": 4,
        "duration_nights": 3,
        "rating": 4.9,
        "reviews": 186,
        "best_time": "Oct-Feb",
        "group_size": "4-8 people"
    }
]

async def setup_complete_database():
    """Setup complete database with all destinations"""
    try:
        supabase_service = SupabaseService()
        
        print("🚀 Setting up complete SafarSaga database...")
        print("=" * 50)
        
        # Step 1: Check existing events
        print("📊 Checking existing destinations...")
        existing_events, total = await supabase_service.get_events({}, limit=100, offset=0)
        print(f"   Found {total} existing destinations")
        
        # Step 2: Create/Update destinations
        print("\n🏗️  Creating/Updating destinations...")
        created_count = 0
        updated_count = 0
        
        for dest_data in DESTINATIONS_DATA:
            try:
                # Check if destination exists
                existing = None
                for event in existing_events:
                    if event.name == dest_data["name"]:
                        existing = event
                        break
                
                if existing:
                    # Update existing destination
                    update_data = {
                        "description": dest_data["description"],
                        "destination": dest_data["destination"],
                        "price": float(dest_data["price"]),
                        "max_capacity": dest_data["max_capacity"],
                        "start_date": dest_data["start_date"].isoformat(),
                        "end_date": dest_data["end_date"].isoformat(),
                        "difficulty_level": dest_data["difficulty_level"],
                        "featured_image_url": dest_data["featured_image_url"],
                        "inclusions": dest_data["inclusions"],
                        "exclusions": dest_data["exclusions"],
                        "is_active": dest_data["is_active"]
                    }
                    
                    updated_event = await supabase_service.update_event(existing.id, update_data)
                    if updated_event:
                        print(f"   ✅ Updated: {dest_data['name']}")
                        updated_count += 1
                    else:
                        print(f"   ❌ Failed to update: {dest_data['name']}")
                else:
                    # Create new destination
                    create_data = {
                        "name": dest_data["name"],
                        "description": dest_data["description"],
                        "destination": dest_data["destination"],
                        "price": float(dest_data["price"]),
                        "max_capacity": dest_data["max_capacity"],
                        "start_date": dest_data["start_date"].isoformat(),
                        "end_date": dest_data["end_date"].isoformat(),
                        "difficulty_level": dest_data["difficulty_level"],
                        "featured_image_url": dest_data["featured_image_url"],
                        "inclusions": dest_data["inclusions"],
                        "exclusions": dest_data["exclusions"],
                        "is_active": dest_data["is_active"]
                    }
                    
                    created_event = await supabase_service.create_event(create_data, user_id=None)
                    if created_event:
                        print(f"   ✅ Created: {dest_data['name']}")
                        created_count += 1
                    else:
                        print(f"   ❌ Failed to create: {dest_data['name']}")
                        
            except Exception as e:
                print(f"   ❌ Error processing '{dest_data['name']}': {str(e)}")
                continue
        
        # Step 3: Verify final state
        print(f"\n📈 Database setup completed!")
        print(f"   Created: {created_count} destinations")
        print(f"   Updated: {updated_count} destinations")
        
        # Get final count
        final_events, final_total = await supabase_service.get_events({}, limit=100, offset=0)
        print(f"   Total destinations in database: {final_total}")
        
        # Step 4: Display summary
        print(f"\n📋 Destinations Summary:")
        for event in final_events:
            status = "🌟" if getattr(event, 'is_featured', False) else "📍"
            print(f"   {status} {event.name} - ₹{event.price} ({event.destination})")
        
        print(f"\n🎉 Database setup completed successfully!")
        print(f"   Backend API ready at: http://localhost:8000")
        print(f"   API Documentation: http://localhost:8000/docs")
        
        return True
        
    except Exception as e:
        print(f"💥 Error during database setup: {str(e)}")
        return False

if __name__ == "__main__":
    print("🏗️  SafarSaga Complete Database Setup")
    print("=" * 50)
    
    # Run the setup
    success = asyncio.run(setup_complete_database())
    
    if success:
        print("\n✨ Setup completed successfully!")
        print("   You can now:")
        print("   1. Start the backend: python -m uvicorn app.main:app --reload")
        print("   2. Start the frontend: npm run dev")
        print("   3. Test the booking flow end-to-end")
    else:
        print("\n❌ Setup failed. Please check the errors above.")
    
    print("=" * 50)