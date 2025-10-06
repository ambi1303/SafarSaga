-- Migration script to update bookings table for destinations support
-- Run this in your Supabase SQL Editor after setting up destinations

-- Add destination_id column to tickets table
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES public.destinations(id);

-- Add travel_date and contact_info columns
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS travel_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Create index for destination_id
CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON public.tickets(destination_id);

-- Update existing bookings to use destination_id (if you have existing data)
-- This is optional and depends on your existing data structure

-- Update RLS policies to include destination_id
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON public.tickets;
CREATE POLICY "Users can update own tickets" ON public.tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comment
COMMENT ON COLUMN public.tickets.destination_id IS 'Reference to destinations table for new booking system';
COMMENT ON COLUMN public.tickets.travel_date IS 'Preferred travel date for the booking';
COMMENT ON COLUMN public.tickets.contact_info IS 'Contact information including phone and emergency contact';

-- Optional: Create a view that combines old and new booking systems
CREATE OR REPLACE VIEW public.bookings_view AS
SELECT 
  t.*,
  COALESCE(d.name, e.name) as destination_name,
  COALESCE(d.description, e.description) as destination_description,
  COALESCE(d.state, e.destination) as location,
  COALESCE(d.featured_image_url, e.featured_image_url) as image_url,
  COALESCE(d.difficulty_level, e.difficulty_level) as difficulty,
  COALESCE(d.average_cost_per_day, e.price) as base_price
FROM public.tickets t
LEFT JOIN public.destinations d ON t.destination_id = d.id
LEFT JOIN public.events e ON t.event_id = e.id;

-- Grant access to the view
GRANT SELECT ON public.bookings_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.bookings_view OWNER TO postgres;
CREATE POLICY "Users can view own bookings" ON public.bookings_view
  FOR SELECT USING (auth.uid() = user_id);