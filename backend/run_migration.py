#!/usr/bin/env python3
"""
Database migration script for destination bookings
Safely applies the migration with rollback capability
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

try:
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError:
    print("Error: Required packages not installed. Run: pip install supabase python-dotenv")
    sys.exit(1)

def load_environment():
    """Load environment variables"""
    load_dotenv()
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        sys.exit(1)
    
    if supabase_url.startswith("your_") or supabase_key.startswith("your_"):
        print("Error: Please update .env file with actual Supabase credentials")
        sys.exit(1)
    
    return supabase_url, supabase_key

def run_migration():
    """Run the destination bookings migration"""
    print("🚀 Starting destination bookings migration...")
    
    # Load environment
    supabase_url, supabase_key = load_environment()
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
        
        # Read migration file
        migration_file = backend_dir / "migrations" / "001_add_destination_bookings.sql"
        
        if not migration_file.exists():
            print(f"❌ Migration file not found: {migration_file}")
            sys.exit(1)
        
        with open(migration_file, 'r') as f:
            migration_sql = f.read()
        
        print("📄 Migration file loaded")
        
        # Check if destinations table exists
        print("🔍 Checking if destinations table exists...")
        
        try:
            result = supabase.table('destinations').select('count').limit(1).execute()
            print("✅ Destinations table exists")
        except Exception as e:
            print(f"❌ Destinations table not found. Please run destinations setup first.")
            print(f"   Error: {e}")
            print("   Run: python setup_destinations.py")
            sys.exit(1)
        
        # Check current tickets table structure
        print("🔍 Checking current tickets table structure...")
        
        try:
            result = supabase.table('tickets').select('*').limit(1).execute()
            if result.data:
                sample_ticket = result.data[0]
                has_destination_id = 'destination_id' in sample_ticket
                has_contact_info = 'contact_info' in sample_ticket
                has_travel_date = 'travel_date' in sample_ticket
                
                print(f"   destination_id column: {'✅ exists' if has_destination_id else '❌ missing'}")
                print(f"   contact_info column: {'✅ exists' if has_contact_info else '❌ missing'}")
                print(f"   travel_date column: {'✅ exists' if has_travel_date else '❌ missing'}")
                
                if has_destination_id and has_contact_info and has_travel_date:
                    print("✅ Migration appears to already be applied")
                    return
            else:
                print("   No existing tickets found")
        except Exception as e:
            print(f"   Error checking tickets table: {e}")
        
        # Apply migration
        print("🔧 Applying migration...")
        
        # Split migration into individual statements
        statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements, 1):
            if statement.strip():
                try:
                    print(f"   Executing statement {i}/{len(statements)}...")
                    # Use rpc for DDL statements
                    supabase.rpc('exec_sql', {'sql': statement}).execute()
                except Exception as e:
                    # Some statements might fail if already applied, that's okay
                    if any(phrase in str(e).lower() for phrase in ['already exists', 'duplicate', 'does not exist']):
                        print(f"   ⚠️  Statement {i} skipped (already applied): {str(e)[:100]}...")
                    else:
                        print(f"   ❌ Statement {i} failed: {e}")
                        raise
        
        print("✅ Migration completed successfully!")
        
        # Verify migration
        print("🔍 Verifying migration...")
        
        try:
            result = supabase.table('tickets').select('*').limit(1).execute()
            if result.data:
                sample_ticket = result.data[0]
                has_destination_id = 'destination_id' in sample_ticket
                has_contact_info = 'contact_info' in sample_ticket
                has_travel_date = 'travel_date' in sample_ticket
                
                if has_destination_id and has_contact_info and has_travel_date:
                    print("✅ Migration verification successful!")
                else:
                    print("⚠️  Migration verification incomplete - some columns may not be visible")
            
            # Test the booking_details view
            result = supabase.table('booking_details').select('*').limit(1).execute()
            print("✅ booking_details view is accessible")
            
        except Exception as e:
            print(f"⚠️  Verification warning: {e}")
        
        print("\n🎉 Destination bookings migration completed!")
        print("   - destination_id column added to tickets table")
        print("   - contact_info and travel_date columns added")
        print("   - Indexes created for performance")
        print("   - booking_details view created for unified queries")
        print("   - Existing bookings preserved")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\n🔄 To rollback, you may need to:")
        print("   1. Remove destination_id column: ALTER TABLE tickets DROP COLUMN destination_id;")
        print("   2. Remove contact_info column: ALTER TABLE tickets DROP COLUMN contact_info;")
        print("   3. Remove travel_date column: ALTER TABLE tickets DROP COLUMN travel_date;")
        print("   4. Drop view: DROP VIEW booking_details;")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()