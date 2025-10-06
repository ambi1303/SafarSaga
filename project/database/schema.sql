-- SafarSaga Travel Booking Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE public.destinations (
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

-- Events/Trips table
CREATE TABLE public.events (
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

-- Tickets/Bookings table (supports both destination and event bookings)
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL CHECK (seats > 0),
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  upi_qr_code TEXT,
  special_requests TEXT,
  contact_info JSONB,
  travel_date TIMESTAMP WITH TIME ZONE,
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_confirmed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT tickets_destination_or_event_check CHECK (destination_id IS NOT NULL OR event_id IS NOT NULL)
);

-- Gallery Images table
CREATE TABLE public.gallery_images (
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

-- Create indexes for better performance
CREATE INDEX idx_destinations_name ON public.destinations(name);
CREATE INDEX idx_destinations_state ON public.destinations(state);
CREATE INDEX idx_destinations_is_active ON public.destinations(is_active);
CREATE INDEX idx_events_destination ON public.events(destination);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_is_active ON public.events(is_active);
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_destination_id ON public.tickets(destination_id);
CREATE INDEX idx_tickets_booking_status ON public.tickets(booking_status);
CREATE INDEX idx_tickets_payment_status ON public.tickets(payment_status);
CREATE INDEX idx_tickets_user_destination ON public.tickets(user_id, destination_id);
CREATE INDEX idx_tickets_booking_travel_date ON public.tickets(booking_status, travel_date);
CREATE INDEX idx_gallery_images_event_id ON public.gallery_images(event_id);
CREATE INDEX idx_gallery_images_tags ON public.gallery_images USING GIN(tags);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update user roles" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Destinations policies
CREATE POLICY "Anyone can view active destinations" ON public.destinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Events policies
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Tickets policies
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create destination bookings" ON public.tickets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (destination_id IS NOT NULL OR event_id IS NOT NULL)
  );

CREATE POLICY "Users can update own tickets" ON public.tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Gallery images policies
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER update_bookings_on_insert
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

CREATE TRIGGER update_bookings_on_update
  AFTER UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

CREATE TRIGGER update_bookings_on_delete
  AFTER DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION update_destination_bookings();

-- Insert sample admin user (update with your email)
-- Note: This user will need to sign up through your app first, then you can update their admin status
-- UPDATE public.users SET is_admin = true WHERE email = 'your-admin-email@example.com';

-- Sample data (optional - remove in production)
INSERT INTO public.events (name, description, destination, price, max_capacity, start_date, end_date, difficulty_level, is_active, created_by) VALUES
('Manali Adventure Trek', 'Experience the breathtaking beauty of Manali with our guided adventure trek through scenic mountain trails.', 'Manali, Himachal Pradesh', 15999.00, 20, '2024-03-15 06:00:00+00', '2024-03-18 18:00:00+00', 'Moderate', true, (SELECT id FROM public.users WHERE is_admin = true LIMIT 1)),
('Goa Beach Paradise', 'Relax and unwind on the pristine beaches of Goa with our all-inclusive beach holiday package.', 'Goa', 12999.00, 30, '2024-04-01 10:00:00+00', '2024-04-05 16:00:00+00', 'Easy', true, (SELECT id FROM public.users WHERE is_admin = true LIMIT 1)),
('Kerala Backwaters Cruise', 'Discover the serene backwaters of Kerala with our luxury houseboat cruise experience.', 'Alleppey, Kerala', 18999.00, 15, '2024-04-20 08:00:00+00', '2024-04-24 17:00:00+00', 'Easy', true, (SELECT id FROM public.users WHERE is_admin = true LIMIT 1));

-- Create view for unified booking data (destinations + events)
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

-- Grant access to the view
GRANT SELECT ON public.booking_details TO authenticated;

-- Insert sample destinations
INSERT INTO public.destinations (name, description, state, featured_image_url, difficulty_level, best_time_to_visit, popular_activities, average_cost_per_day) VALUES
('Manali', 'A picturesque hill station in Himachal Pradesh, known for its snow-capped mountains, adventure sports, and scenic beauty.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'Moderate', 'October to June', ARRAY['Trekking', 'Paragliding', 'River Rafting', 'Skiing', 'Temple Visits'], 2500.00),
('Goa', 'Famous for its pristine beaches, vibrant nightlife, Portuguese architecture, and water sports activities.', 'Goa', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 'Easy', 'November to March', ARRAY['Beach Activities', 'Water Sports', 'Nightlife', 'Heritage Tours', 'Cruise'], 3000.00),
('Kerala Backwaters', 'Serene network of canals, rivers, and lakes in Kerala, perfect for houseboat cruises and experiencing local culture.', 'Kerala', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 'Easy', 'September to March', ARRAY['Houseboat Cruise', 'Ayurvedic Spa', 'Bird Watching', 'Village Tours', 'Fishing'], 2800.00),
('Ladakh', 'High-altitude desert region known for its dramatic landscapes, Buddhist monasteries, and adventure activities.', 'Jammu and Kashmir', 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd', 'Challenging', 'May to September', ARRAY['Motorcycle Tours', 'Trekking', 'Monastery Visits', 'Camping', 'Photography'], 3500.00),
('Rajasthan', 'Land of kings featuring majestic palaces, desert landscapes, colorful culture, and rich heritage.', 'Rajasthan', 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 'Easy', 'October to March', ARRAY['Palace Tours', 'Desert Safari', 'Cultural Shows', 'Camel Rides', 'Heritage Walks'], 2200.00)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.destinations IS 'Travel destinations offered by SafarSaga';
COMMENT ON TABLE public.events IS 'Travel packages and trips offered by SafarSaga';
COMMENT ON TABLE public.tickets IS 'Booking records for trips and destinations';
COMMENT ON TABLE public.gallery_images IS 'Image gallery with trip associations';
COMMENT ON VIEW public.booking_details IS 'Unified view of booking data with destination and event details';