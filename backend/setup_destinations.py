#!/usr/bin/env python3
"""
Setup destinations table and populate with initial data
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_destinations():
    """Setup destinations table and populate with data"""
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return False
    
    if supabase_url.startswith("your_") or supabase_key.startswith("your_"):
        print("❌ Error: Please update .env file with actual Supabase credentials")
        return False
    
    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Read and execute the SQL file
        sql_file_path = "create_destinations_table.sql"
        if not os.path.exists(sql_file_path):
            print(f"❌ Error: {sql_file_path} not found")
            return False
        
        with open(sql_file_path, 'r') as file:
            sql_content = file.read()
        
        print("📝 Executing destinations table setup...")
        
        # Split SQL into individual statements and execute them
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                try:
                    # Use RPC to execute raw SQL
                    result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                    print(f"✅ Executed statement {i+1}/{len(statements)}")
                except Exception as e:
                    print(f"⚠️  Warning on statement {i+1}: {str(e)}")
                    # Continue with other statements
        
        print("✅ Destinations table setup completed!")
        
        # Verify the setup by checking if destinations exist
        try:
            destinations = supabase.table("destinations").select("id, name").limit(5).execute()
            if destinations.data:
                print(f"✅ Found {len(destinations.data)} destinations in database:")
                for dest in destinations.data:
                    print(f"   - {dest['name']} (ID: {dest['id']})")
            else:
                print("⚠️  No destinations found in database")
        except Exception as e:
            print(f"⚠️  Could not verify destinations: {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up destinations: {str(e)}")
        return False

def create_exec_sql_function():
    """Create a helper function to execute raw SQL"""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        return False
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Create the exec_sql function
        exec_sql_function = """
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql;
            RETURN 'OK';
        END;
        $$;
        """
        
        # This might not work with the Python client, so we'll use a different approach
        print("⚠️  Note: You may need to run the SQL manually in Supabase SQL Editor")
        return True
        
    except Exception as e:
        print(f"❌ Error creating exec_sql function: {str(e)}")
        return False

def manual_destinations_insert():
    """Manually insert destinations using the Python client"""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return False
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Check if destinations table exists
        try:
            existing = supabase.table("destinations").select("count").limit(1).execute()
            print("✅ Destinations table exists")
        except Exception as e:
            print(f"❌ Destinations table does not exist: {str(e)}")
            print("Please run the SQL in create_destinations_table.sql manually in Supabase SQL Editor")
            return False
        
        # Destinations data
        destinations_data = [
            {
                "name": "Manali",
                "description": "A picturesque hill station in Himachal Pradesh, known for its snow-capped mountains, adventure sports, and scenic beauty.",
                "state": "Himachal Pradesh",
                "country": "India",
                "featured_image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                "difficulty_level": "Moderate",
                "best_time_to_visit": "October to June",
                "popular_activities": ["Trekking", "Paragliding", "River Rafting", "Skiing", "Temple Visits"],
                "average_cost_per_day": 2500.00,
                "is_active": True
            },
            {
                "name": "Goa",
                "description": "Famous for its pristine beaches, vibrant nightlife, Portuguese architecture, and water sports activities.",
                "state": "Goa",
                "country": "India",
                "featured_image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
                "difficulty_level": "Easy",
                "best_time_to_visit": "November to March",
                "popular_activities": ["Beach Activities", "Water Sports", "Nightlife", "Heritage Tours", "Cruise"],
                "average_cost_per_day": 3000.00,
                "is_active": True
            },
            {
                "name": "Kerala Backwaters",
                "description": "Serene network of canals, rivers, and lakes in Kerala, perfect for houseboat cruises and experiencing local culture.",
                "state": "Kerala",
                "country": "India",
                "featured_image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
                "difficulty_level": "Easy",
                "best_time_to_visit": "September to March",
                "popular_activities": ["Houseboat Cruise", "Ayurvedic Spa", "Bird Watching", "Village Tours", "Fishing"],
                "average_cost_per_day": 2800.00,
                "is_active": True
            },
            {
                "name": "Ladakh",
                "description": "High-altitude desert region known for its dramatic landscapes, Buddhist monasteries, and adventure activities.",
                "state": "Jammu and Kashmir",
                "country": "India",
                "featured_image_url": "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd",
                "difficulty_level": "Challenging",
                "best_time_to_visit": "May to September",
                "popular_activities": ["Motorcycle Tours", "Trekking", "Monastery Visits", "Camping", "Photography"],
                "average_cost_per_day": 3500.00,
                "is_active": True
            },
            {
                "name": "Rajasthan",
                "description": "Land of kings featuring majestic palaces, desert landscapes, colorful culture, and rich heritage.",
                "state": "Rajasthan",
                "country": "India",
                "featured_image_url": "https://images.unsplash.com/photo-1477587458883-47145ed94245",
                "difficulty_level": "Easy",
                "best_time_to_visit": "October to March",
                "popular_activities": ["Palace Tours", "Desert Safari", "Cultural Shows", "Camel Rides", "Heritage Walks"],
                "average_cost_per_day": 2200.00,
                "is_active": True
            }
        ]
        
        # Insert destinations
        print("📝 Inserting destinations...")
        
        for dest in destinations_data:
            try:
                # Check if destination already exists
                existing = supabase.table("destinations").select("id").eq("name", dest["name"]).execute()
                
                if existing.data:
                    print(f"⚠️  Destination '{dest['name']}' already exists, skipping...")
                    continue
                
                # Insert new destination
                result = supabase.table("destinations").insert(dest).execute()
                
                if result.data:
                    print(f"✅ Inserted destination: {dest['name']}")
                else:
                    print(f"❌ Failed to insert destination: {dest['name']}")
                    
            except Exception as e:
                print(f"❌ Error inserting {dest['name']}: {str(e)}")
        
        # Verify insertions
        destinations = supabase.table("destinations").select("id, name, state").execute()
        
        if destinations.data:
            print(f"\n✅ Successfully set up {len(destinations.data)} destinations:")
            for dest in destinations.data:
                print(f"   - {dest['name']} ({dest.get('state', 'Unknown State')}) - ID: {dest['id']}")
        else:
            print("❌ No destinations found after insertion")
            return False
        
        print("\n🎉 Destinations setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error in manual destinations insert: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up SafarSaga Destinations...")
    print("=" * 50)
    
    # Try manual insertion first (more reliable)
    success = manual_destinations_insert()
    
    if success:
        print("\n✅ Destinations setup completed successfully!")
        print("\nNext steps:")
        print("1. Update your booking system to use destination_id")
        print("2. Test the booking flow with the new destinations")
        print("3. Update frontend to use the destinations API")
    else:
        print("\n❌ Destinations setup failed!")
        print("\nManual steps:")
        print("1. Go to your Supabase SQL Editor")
        print("2. Run the SQL from create_destinations_table.sql")
        print("3. Run this script again")
        
        sys.exit(1)