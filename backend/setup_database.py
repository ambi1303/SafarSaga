#!/usr/bin/env python3
"""
Set up Supabase database schema
"""

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.supabase_service import SupabaseService

# Database schema SQL
SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events/Trips table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  price DECIMAL(10,2),
  max_capacity INTEGER,
  current_bookings INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  itinerary JSONB,
  inclusions TEXT[],
  exclusions TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
  featured_image_url TEXT,
  gallery_images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets/Bookings table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL CHECK (seats > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  upi_qr_code TEXT,
  special_requests TEXT,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Gallery Images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cloudinary_public_id TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  tags TEXT[],
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

INDEXES_SQL = """
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_destination ON public.events(destination);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_status ON public.tickets(booking_status);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON public.tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_event_id ON public.gallery_images(event_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_tags ON public.gallery_images USING GIN(tags);
"""

RLS_SQL = """
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
CREATE POLICY "Admins can update user roles" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Events policies
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Tickets policies
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON public.tickets;
CREATE POLICY "Users can update own tickets" ON public.tickets
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update all tickets" ON public.tickets;
CREATE POLICY "Admins can update all tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Gallery images policies
DROP POLICY IF EXISTS "Anyone can view gallery images" ON public.gallery_images;
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
"""

FUNCTIONS_SQL = """
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update current_bookings when tickets are created/updated
CREATE OR REPLACE FUNCTION update_event_bookings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_bookings count for the event
  UPDATE public.events 
  SET current_bookings = (
    SELECT COALESCE(SUM(seats), 0) 
    FROM public.tickets 
    WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) 
    AND booking_status = 'confirmed'
  )
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for booking count updates
DROP TRIGGER IF EXISTS update_bookings_on_insert ON public.tickets;
CREATE TRIGGER update_bookings_on_insert
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_event_bookings();

DROP TRIGGER IF EXISTS update_bookings_on_update ON public.tickets;
CREATE TRIGGER update_bookings_on_update
  AFTER UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_event_bookings();

DROP TRIGGER IF EXISTS update_bookings_on_delete ON public.tickets;
CREATE TRIGGER update_bookings_on_delete
  AFTER DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_event_bookings();
"""

async def setup_database():
    """Set up the database schema"""
    print("Setting up Supabase database schema...")
    print("⚠️  Note: This script can only test the connection.")
    print("📝 You need to run the SQL schema manually in Supabase Dashboard.")
    print("\nSteps to complete setup:")
    print("1. Go to https://supabase.com/dashboard")
    print("2. Select your project")
    print("3. Go to SQL Editor")
    print("4. Run the schema from project/database/schema.sql")
    
    try:
        service = SupabaseService()
        
        print("\n🔍 Testing current connection...")
        
        # Test basic connection
        def _test_connection():
            client = service._get_client()
            # Try to query a system table that should always exist
            response = client.rpc('version').execute()
            return response
        
        try:
            version_result = await service._run_sync(_test_connection)
            print("✅ Supabase connection successful")
            print(f"Database version info available: {bool(version_result)}")
        except Exception as e:
            print(f"⚠️  Connection test failed: {e}")
        
        # Test if users table exists
        print("\n🔍 Checking if users table exists...")
        try:
            def _check_users_table():
                client = service._get_client()
                response = client.table("users").select("count").limit(1).execute()
                return response
            
            users_result = await service._run_sync(_check_users_table)
            print("✅ Users table exists and is accessible")
            
            # If we get here, the database is set up
            print("\n🎉 Database appears to be set up correctly!")
            
            # Test user operations
            print("\n🔍 Testing user operations...")
            user = await service.get_user_by_email("nonexistent@example.com")
            print(f"✅ get_user_by_email works: {user is None}")
            
        except Exception as e:
            error_str = str(e).lower()
            if "could not find the table" in error_str or "pgrst205" in error_str:
                print("❌ Users table does not exist")
                print("\n📋 Next steps:")
                print("1. Go to Supabase Dashboard → SQL Editor")
                print("2. Copy and run the SQL from project/database/schema.sql")
                print("3. Run this script again to verify")
            else:
                print(f"❌ Unexpected error: {e}")
        
    except Exception as e:
        print(f"\n❌ Error during database setup: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(setup_database())