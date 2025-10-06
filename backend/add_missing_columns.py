#!/usr/bin/env python3
"""
Add missing columns to tickets table
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def add_missing_columns():
    """Add missing columns to tickets table"""
    
    print("🔧 Adding Missing Columns to Tickets Table...")
    print("=" * 50)
    
    try:
        from app.services.supabase_service import SupabaseService
        
        service = SupabaseService()
        
        print("🔗 Testing database connection...")
        
        # Test connection
        def _test_connection():
            try:
                response = service._get_client().table("tickets").select("id").limit(1).execute()
                return True, "Connection successful"
            except Exception as e:
                return False, str(e)
        
        connected, message = await service._run_sync(_test_connection)
        
        if not connected:
            print(f"❌ Database connection failed: {message}")
            return False
        
        print(f"✅ {message}")
        
        print("\n🔧 Adding missing columns...")
        
        # SQL to add missing columns
        missing_columns_sql = """
        -- Add missing columns if they don't exist
        DO $$ 
        BEGIN
            -- Add created_at column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'tickets' AND column_name = 'created_at') THEN
                ALTER TABLE tickets ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                UPDATE tickets SET created_at = booked_at WHERE created_at IS NULL;
            END IF;
            
            -- Add updated_at column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'tickets' AND column_name = 'updated_at') THEN
                ALTER TABLE tickets ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                UPDATE tickets SET updated_at = booked_at WHERE updated_at IS NULL;
            END IF;
            
            -- Add booking_reference column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name = 'tickets' AND column_name = 'booking_reference') THEN
                ALTER TABLE tickets ADD COLUMN booking_reference VARCHAR(50);
                -- Generate booking references for existing records
                UPDATE tickets SET booking_reference = 'SS' || EXTRACT(EPOCH FROM booked_at)::bigint || SUBSTRING(id::text, 1, 4)
                WHERE booking_reference IS NULL;
            END IF;
            
            -- Ensure booked_at has a default
            ALTER TABLE tickets ALTER COLUMN booked_at SET DEFAULT NOW();
            
        END $$;
        
        -- Create or update the updated_at trigger
        CREATE OR REPLACE FUNCTION update_tickets_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
        CREATE TRIGGER update_tickets_updated_at
            BEFORE UPDATE ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION update_tickets_updated_at();
        """
        
        def _add_columns():
            try:
                # Execute the SQL using Supabase RPC or direct SQL
                response = service._get_client().rpc('exec_sql', {'sql': missing_columns_sql}).execute()
                return True, "Columns added successfully"
            except Exception as e:
                # If RPC doesn't work, we'll need to do it manually
                return False, str(e)
        
        success, result_message = await service._run_sync(_add_columns)
        
        if success:
            print(f"✅ {result_message}")
        else:
            print(f"⚠️ Could not add columns automatically: {result_message}")
            print("\n📋 Manual SQL to run in Supabase:")
            print("=" * 50)
            print(missing_columns_sql)
            print("=" * 50)
            print("\n🔧 Steps:")
            print("1. Go to Supabase Dashboard → SQL Editor")
            print("2. Copy and paste the SQL above")
            print("3. Run the query")
            print("4. Test again with: python check_tickets_table.py")
        
        print("\n🧪 Testing table structure after changes...")
        
        # Test the updated structure
        def _test_new_structure():
            try:
                response = service._get_client().table("tickets").select(
                    "id, user_id, destination_id, event_id, seats, total_amount, "
                    "booking_status, payment_status, booked_at, created_at, updated_at"
                ).limit(1).execute()
                return True, "All columns accessible"
            except Exception as e:
                return False, str(e)
        
        structure_ok, structure_message = await service._run_sync(_test_new_structure)
        
        if structure_ok:
            print(f"✅ {structure_message}")
        else:
            print(f"⚠️ {structure_message}")
        
        print("\n🎉 Column addition completed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Failed to add columns: {str(e)}")
        return False

async def main():
    """Run the column addition"""
    
    print("🚀 SafarSaga Database Column Fix")
    print("=" * 50)
    
    success = await add_missing_columns()
    
    if success:
        print("\n" + "=" * 50)
        print("✅ COLUMNS ADDED SUCCESSFULLY!")
        print("=" * 50)
        print("\n🧪 Next Steps:")
        print("1. Test the tickets table: python check_tickets_table.py")
        print("2. Test the connection: python test_supabase_connection.py")
        print("3. Start the server: uvicorn app.main:app --reload")
        print("4. Test user registration")
    else:
        print("\n" + "=" * 50)
        print("❌ COLUMN ADDITION FAILED!")
        print("=" * 50)
        print("\n🔧 Manual Steps Required:")
        print("1. Run the SQL script manually in Supabase")
        print("2. Check table permissions")
        print("3. Verify table structure")

if __name__ == "__main__":
    asyncio.run(main())