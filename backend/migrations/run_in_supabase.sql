-- Run this SQL directly in your Supabase SQL Editor
-- Migration: Add destination booking support to existing schema

-- Step 1: Add destination_id column to tickets table (if not exists)
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

-- Step 2: Add contact_info column (if not exists)
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

-- Step 3: Add travel_date column (if not exists)
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

-- Step 4: Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON public.tickets(destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_destination ON public.tickets(user_id, destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_travel_date ON public.tickets(booking_status, travel_date);

-- Step 5: Add constraint to ensure either destination_id or event_id is present
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

-- Step 6: Update existing bookings to use destination_id where possible
-- This maps existing event-based bookings to destinations based on event.destination_id
UPDATE public.tickets 
SET destination_id = (
  SELECT e.destination_id 
  FROM public.events e 
  WHERE e.id = tickets.event_id 
  AND e.destination_id IS NOT NULL
)
WHERE destination_id IS NULL 
AND event_id IS NOT NULL
AND EXISTS (
  SELECT 1 FROM public.events e 
  WHERE e.id = tickets.event_id 
  AND e.destination_id IS NOT NULL
);

-- Step 7: Create or replace the booking update function
CREATE OR REPLACE FUNCTION update_destination_bookings()
RETURNS TRIGGER AS $
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
$ LANGUAGE plpgsql;

-- Step 8: Update triggers to use new function
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

-- Step 9: Create or replace the booking_details view
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

-- Step 10: Grant access to the view
GRANT SELECT ON public.booking_details TO authenticated;

-- Step 11: Add RLS policy for destination bookings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies 
                   WHERE policyname = 'Users can create destination bookings') THEN
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

-- Step 12: Add comments for documentation
COMMENT ON COLUMN public.tickets.destination_id IS 'Reference to destinations table for destination-based bookings';
COMMENT ON COLUMN public.tickets.contact_info IS 'JSON object containing phone, emergency_contact, etc.';
COMMENT ON COLUMN public.tickets.travel_date IS 'Preferred travel date for the booking';
COMMENT ON VIEW public.booking_details IS 'Unified view of booking data with destination and event details';

-- Migration completed
SELECT 'Destination booking migration completed successfully!' as status;