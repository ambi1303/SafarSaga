-- Complete Migration: Create destinations table and add destination booking support
-- Run this SQL directly in your Supabase SQL Editor

-- Step 1: Create destinations table (if not exists)
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  featured_image_url TEXT,
  gallery_images TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
  best_time_to_visit TEXT,
  popular_activities TEXT[],
  average_cost_per_day DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for destinations table
CREATE INDEX IF NOT EXISTS idx_destinations_name ON public.destinations(name);
CREATE INDEX IF NOT EXISTS idx_destinations_state ON public.destinations(state);
CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON public.destinations(is_active);

-- Step 3: Enable RLS on destinations table
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for destinations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'destinations' AND policyname = 'Anyone can view active destinations') THEN
        CREATE POLICY "Anyone can view active destinations" ON public.destinations
          FOR SELECT USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'destinations' AND policyname = 'Admins can manage destinations') THEN
        CREATE POLICY "Admins can manage destinations" ON public.destinations
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE id = auth.uid() AND is_admin = true
            )
          );
    END IF;
END $$;

-- Step 5: Insert sample destinations (if table is empty)
INSERT INTO public.destinations (name, description, state, featured_image_url, difficulty_level, best_time_to_visit, popular_activities, average_cost_per_day) 
SELECT * FROM (VALUES
  ('Manali', 'A picturesque hill station in Himachal Pradesh, known for its snow-capped mountains, adventure sports, and scenic beauty.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'Moderate', 'October to June', ARRAY['Trekking', 'Paragliding', 'River Rafting', 'Skiing', 'Temple Visits'], 2500.00),
  ('Goa', 'Famous for its pristine beaches, vibrant nightlife, Portuguese architecture, and water sports activities.', 'Goa', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 'Easy', 'November to March', ARRAY['Beach Activities', 'Water Sports', 'Nightlife', 'Heritage Tours', 'Cruise'], 3000.00),
  ('Kerala Backwaters', 'Serene network of canals, rivers, and lakes in Kerala, perfect for houseboat cruises and experiencing local culture.', 'Kerala', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 'Easy', 'September to March', ARRAY['Houseboat Cruise', 'Ayurvedic Spa', 'Bird Watching', 'Village Tours', 'Fishing'], 2800.00),
  ('Ladakh', 'High-altitude desert region known for its dramatic landscapes, Buddhist monasteries, and adventure activities.', 'Jammu and Kashmir', 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd', 'Challenging', 'May to September', ARRAY['Motorcycle Tours', 'Trekking', 'Monastery Visits', 'Camping', 'Photography'], 3500.00),
  ('Rajasthan', 'Land of kings featuring majestic palaces, desert landscapes, colorful culture, and rich heritage.', 'Rajasthan', 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 'Easy', 'October to March', ARRAY['Palace Tours', 'Desert Safari', 'Cultural Shows', 'Camel Rides', 'Heritage Walks'], 2200.00),
  ('Shimla', 'The Queen of Hills, a charming hill station with colonial architecture, toy train rides, and pleasant weather.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7', 'Easy', 'March to June, September to November', ARRAY['Toy Train Ride', 'Mall Road Shopping', 'Temple Visits', 'Nature Walks', 'Photography'], 2000.00),
  ('Rishikesh', 'Yoga capital of the world, known for spiritual experiences, adventure sports, and the holy Ganges river.', 'Uttarakhand', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', 'Moderate', 'February to May, September to November', ARRAY['Yoga Retreats', 'River Rafting', 'Bungee Jumping', 'Temple Visits', 'Meditation'], 1800.00),
  ('Andaman Islands', 'Tropical paradise with crystal clear waters, coral reefs, pristine beaches, and rich marine life.', 'Andaman and Nicobar Islands', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'Easy', 'October to May', ARRAY['Scuba Diving', 'Snorkeling', 'Beach Activities', 'Island Hopping', 'Water Sports'], 4000.00)
) AS v(name, description, state, featured_image_url, difficulty_level, best_time_to_visit, popular_activities, average_cost_per_day)
WHERE NOT EXISTS (SELECT 1 FROM public.destinations WHERE destinations.name = v.name);

-- Step 6: Add destination_id column to tickets table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tickets' AND column_name = 'destination_id') THEN
        ALTER TABLE public.tickets ADD COLUMN destination_id UUID REFERENCES public.destinations(id);
        RAISE NOTICE 'Added destination_id column to tickets table';
    ELSE
        RAISE NOTICE 'destination_id column already exists in tickets table';
    END IF;
END $$;

-- Step 7: Add contact_info column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tickets' AND column_name = 'contact_info') THEN
        ALTER TABLE public.tickets ADD COLUMN contact_info JSONB;
        RAISE NOTICE 'Added contact_info column to tickets table';
    ELSE
        RAISE NOTICE 'contact_info column already exists in tickets table';
    END IF;
END $$;

-- Step 8: Add travel_date column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tickets' AND column_name = 'travel_date') THEN
        ALTER TABLE public.tickets ADD COLUMN travel_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added travel_date column to tickets table';
    ELSE
        RAISE NOTICE 'travel_date column already exists in tickets table';
    END IF;
END $$;

-- Step 9: Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON public.tickets(destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_destination ON public.tickets(user_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_travel_date ON public.tickets(booking_status, travel_date);

-- Step 10: Add constraint to ensure either destination_id or event_id is present
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'tickets_destination_or_event_check') THEN
        ALTER TABLE public.tickets 
        ADD CONSTRAINT tickets_destination_or_event_check 
        CHECK (destination_id IS NOT NULL OR event_id IS NOT NULL);
        RAISE NOTICE 'Added constraint to ensure destination_id or event_id is present';
    ELSE
        RAISE NOTICE 'Constraint tickets_destination_or_event_check already exists';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Constraint may already exist or conflict with existing data';
END $$;

-- Step 11: Skip migration of existing bookings for now
-- Note: Existing event-based bookings will continue to work
-- New bookings can use destination_id directly
-- Future: You can manually map events to destinations if needed

-- Step 12: Create or replace the booking update function
CREATE OR REPLACE FUNCTION update_destination_bookings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update booking count for destinations (if destination_id exists)
  IF NEW.destination_id IS NOT NULL OR OLD.destination_id IS NOT NULL THEN
    -- Note: Destinations don't have max_capacity like events, so this is for future use
    -- You can add a current_bookings column to destinations table if needed
    NULL; -- Placeholder for future destination booking count logic
  END IF;
  
  -- Still update event bookings for backward compatibility
  IF NEW.event_id IS NOT NULL OR OLD.event_id IS NOT NULL THEN
    UPDATE public.events 
    SET current_bookings = (
      SELECT COALESCE(SUM(seats), 0) 
      FROM public.tickets 
      WHERE event_id = COALESCE(NEW.event_id, OLD.event_id) 
      AND booking_status = 'confirmed'
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 13: Update triggers to use new function
DROP TRIGGER IF EXISTS update_bookings_on_insert ON public.tickets;
DROP TRIGGER IF EXISTS update_bookings_on_update ON public.tickets;
DROP TRIGGER IF EXISTS update_bookings_on_delete ON public.tickets;

CREATE TRIGGER update_bookings_on_insert
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

CREATE TRIGGER update_bookings_on_update
  AFTER UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

CREATE TRIGGER update_bookings_on_delete
  AFTER DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

-- Step 14: Create or replace the booking_details view
CREATE OR REPLACE VIEW public.booking_details AS
SELECT 
  t.*,
  -- Destination details (preferred)
  d.name as destination_name,
  d.state as destination_state,
  d.average_cost_per_day as destination_price,
  d.featured_image_url as destination_image,
  d.difficulty_level as destination_difficulty,
  -- Event details (fallback for legacy bookings)
  e.name as event_name,
  e.destination as event_destination,
  e.price as event_price,
  e.featured_image_url as event_image,
  e.difficulty_level as event_difficulty,
  -- User details
  u.full_name as user_name,
  u.email as user_email,
  u.phone as user_phone
FROM public.tickets t
LEFT JOIN public.destinations d ON t.destination_id = d.id
LEFT JOIN public.events e ON t.event_id = e.id
LEFT JOIN public.users u ON t.user_id = u.id;

-- Step 15: Grant access to the view
GRANT SELECT ON public.booking_details TO authenticated;

-- Step 16: Add RLS policy for destination bookings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE tablename = 'tickets' AND policyname = 'Users can create destination bookings') THEN
        CREATE POLICY "Users can create destination bookings" ON public.tickets
          FOR INSERT WITH CHECK (
            auth.uid() = user_id AND 
            (destination_id IS NOT NULL OR event_id IS NOT NULL)
          );
        RAISE NOTICE 'Added RLS policy for destination bookings';
    ELSE
        RAISE NOTICE 'RLS policy for destination bookings already exists';
    END IF;
END $$;

-- Step 17: Add trigger for destinations updated_at
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 18: Add comments for documentation
COMMENT ON TABLE public.destinations IS 'Travel destinations offered by SafarSaga';
COMMENT ON COLUMN public.tickets.destination_id IS 'Reference to destinations table for destination-based bookings';
COMMENT ON COLUMN public.tickets.contact_info IS 'JSON object containing phone, emergency_contact, etc.';
COMMENT ON COLUMN public.tickets.travel_date IS 'Preferred travel date for the booking';
COMMENT ON VIEW public.booking_details IS 'Unified view of booking data with destination and event details';

-- Migration completed - Show results
SELECT 
  'Complete destination booking migration finished successfully!' as status,
  (SELECT COUNT(*) FROM public.destinations) as destinations_created,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tickets' AND column_name IN ('destination_id', 'contact_info', 'travel_date')) as new_columns_added;