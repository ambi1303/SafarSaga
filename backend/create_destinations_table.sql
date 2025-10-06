-- Create destinations table for SafarSaga
-- This will replace the destination field in events with proper destination management

-- Destinations table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_destinations_name ON public.destinations(name);
CREATE INDEX IF NOT EXISTS idx_destinations_state ON public.destinations(state);
CREATE INDEX IF NOT EXISTS idx_destinations_is_active ON public.destinations(is_active);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active destinations" ON public.destinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Update events table to reference destinations
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES public.destinations(id);
CREATE INDEX IF NOT EXISTS idx_events_destination_id ON public.events(destination_id);

-- Trigger for updated_at
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert popular Indian destinations
INSERT INTO public.destinations (name, description, state, featured_image_url, difficulty_level, best_time_to_visit, popular_activities, average_cost_per_day) VALUES
('Manali', 'A picturesque hill station in Himachal Pradesh, known for its snow-capped mountains, adventure sports, and scenic beauty.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 'Moderate', 'October to June', ARRAY['Trekking', 'Paragliding', 'River Rafting', 'Skiing', 'Temple Visits'], 2500.00),

('Goa', 'Famous for its pristine beaches, vibrant nightlife, Portuguese architecture, and water sports activities.', 'Goa', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2', 'Easy', 'November to March', ARRAY['Beach Activities', 'Water Sports', 'Nightlife', 'Heritage Tours', 'Cruise'], 3000.00),

('Kerala Backwaters', 'Serene network of canals, rivers, and lakes in Kerala, perfect for houseboat cruises and experiencing local culture.', 'Kerala', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 'Easy', 'September to March', ARRAY['Houseboat Cruise', 'Ayurvedic Spa', 'Bird Watching', 'Village Tours', 'Fishing'], 2800.00),

('Ladakh', 'High-altitude desert region known for its dramatic landscapes, Buddhist monasteries, and adventure activities.', 'Jammu and Kashmir', 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd', 'Challenging', 'May to September', ARRAY['Motorcycle Tours', 'Trekking', 'Monastery Visits', 'Camping', 'Photography'], 3500.00),

('Rajasthan', 'Land of kings featuring majestic palaces, desert landscapes, colorful culture, and rich heritage.', 'Rajasthan', 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 'Easy', 'October to March', ARRAY['Palace Tours', 'Desert Safari', 'Cultural Shows', 'Camel Rides', 'Heritage Walks'], 2200.00),

('Shimla', 'The Queen of Hills, a charming hill station with colonial architecture, toy train rides, and pleasant weather.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7', 'Easy', 'March to June, September to November', ARRAY['Toy Train Ride', 'Mall Road Shopping', 'Temple Visits', 'Nature Walks', 'Photography'], 2000.00),

('Rishikesh', 'Yoga capital of the world, known for spiritual experiences, adventure sports, and the holy Ganges river.', 'Uttarakhand', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', 'Moderate', 'February to May, September to November', ARRAY['Yoga Retreats', 'River Rafting', 'Bungee Jumping', 'Temple Visits', 'Meditation'], 1800.00),

('Andaman Islands', 'Tropical paradise with crystal clear waters, coral reefs, pristine beaches, and rich marine life.', 'Andaman and Nicobar Islands', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'Easy', 'October to May', ARRAY['Scuba Diving', 'Snorkeling', 'Beach Activities', 'Island Hopping', 'Water Sports'], 4000.00),

('Darjeeling', 'Famous for its tea gardens, stunning views of Kanchenjunga, toy train, and pleasant hill station atmosphere.', 'West Bengal', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96', 'Easy', 'March to May, September to November', ARRAY['Tea Garden Tours', 'Toy Train Ride', 'Sunrise Viewing', 'Monastery Visits', 'Trekking'], 2200.00),

('Hampi', 'UNESCO World Heritage site with ancient ruins, temples, and unique boulder landscapes in Karnataka.', 'Karnataka', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220', 'Moderate', 'October to March', ARRAY['Heritage Tours', 'Rock Climbing', 'Temple Visits', 'Coracle Rides', 'Photography'], 1500.00),

('Spiti Valley', 'Cold desert mountain valley with ancient monasteries, dramatic landscapes, and unique Tibetan culture.', 'Himachal Pradesh', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23', 'Challenging', 'May to October', ARRAY['Monastery Visits', 'Trekking', 'Stargazing', 'Photography', 'Cultural Tours'], 3000.00),

('Munnar', 'Hill station in Kerala famous for tea plantations, misty mountains, and cool climate.', 'Kerala', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944', 'Easy', 'September to March', ARRAY['Tea Plantation Tours', 'Trekking', 'Wildlife Spotting', 'Boating', 'Photography'], 2500.00);

-- Update existing events to use destination_id instead of destination text
-- First, let's create a mapping for existing events
UPDATE public.events 
SET destination_id = (
  SELECT d.id FROM public.destinations d 
  WHERE d.name ILIKE '%' || SPLIT_PART(events.destination, ',', 1) || '%'
  LIMIT 1
)
WHERE destination IS NOT NULL;

COMMENT ON TABLE public.destinations IS 'Travel destinations offered by SafarSaga';