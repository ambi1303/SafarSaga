-- Create tickets table for SafarSaga booking system
-- This table supports both destination-based and event-based bookings

-- Drop table if exists (be careful in production!)
-- DROP TABLE IF EXISTS tickets CASCADE;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User reference
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Booking can be for either an event or destination
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    
    -- Booking details
    seats INTEGER NOT NULL DEFAULT 1 CHECK (seats > 0),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    
    -- Status fields
    booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    
    -- Additional information
    special_requests TEXT,
    contact_info JSONB,
    travel_date DATE,
    
    -- Payment information
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    
    -- Timestamps
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tickets_booking_reference CHECK (
        (event_id IS NOT NULL AND destination_id IS NULL) OR 
        (event_id IS NULL AND destination_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_destination_id ON tickets(destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_status ON tickets(booking_status);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_booked_at ON tickets(booked_at);
CREATE INDEX IF NOT EXISTS idx_tickets_travel_date ON tickets(travel_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own bookings
-- CREATE POLICY "Users can view own bookings" ON tickets
--     FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
-- CREATE POLICY "Users can create own bookings" ON tickets
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings
-- CREATE POLICY "Users can update own bookings" ON tickets
--     FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions (adjust as needed)
-- GRANT ALL ON tickets TO authenticated;
-- GRANT ALL ON tickets TO service_role;

-- Insert sample data (optional)
-- INSERT INTO tickets (user_id, destination_id, seats, total_amount, booking_status, payment_status, contact_info)
-- SELECT 
--     u.id,
--     d.id,
--     2,
--     d.average_cost_per_day * 2,
--     'pending',
--     'unpaid',
--     '{"phone": "+91-9876543210", "emergency_contact": "+91-9876543211"}'::jsonb
-- FROM users u, destinations d
-- WHERE u.email = 'test@safarsaga.com' 
--   AND d.name = 'Test Destination'
-- LIMIT 1;

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;