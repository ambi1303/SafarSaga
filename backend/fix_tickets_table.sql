-- Fix tickets table structure for SafarSaga
-- Run this in Supabase Dashboard → SQL Editor

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add created_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tickets' AND column_name = 'created_at') THEN
        ALTER TABLE tickets ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        -- Set created_at to booked_at for existing records
        UPDATE tickets SET created_at = COALESCE(booked_at, NOW()) WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at column';
    ELSE
        RAISE NOTICE 'created_at column already exists';
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tickets' AND column_name = 'updated_at') THEN
        ALTER TABLE tickets ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        -- Set updated_at to booked_at for existing records
        UPDATE tickets SET updated_at = COALESCE(booked_at, NOW()) WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;
    
    -- Add booking_reference column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tickets' AND column_name = 'booking_reference') THEN
        ALTER TABLE tickets ADD COLUMN booking_reference VARCHAR(50);
        -- Generate booking references for existing records
        UPDATE tickets 
        SET booking_reference = 'SS' || LPAD(EXTRACT(EPOCH FROM COALESCE(booked_at, NOW()))::bigint::text, 10, '0') || UPPER(SUBSTRING(id::text, 1, 4))
        WHERE booking_reference IS NULL;
        RAISE NOTICE 'Added booking_reference column';
    ELSE
        RAISE NOTICE 'booking_reference column already exists';
    END IF;
    
    -- Ensure booked_at has a default
    ALTER TABLE tickets ALTER COLUMN booked_at SET DEFAULT NOW();
    
    -- Make sure destination_id and event_id can be null (for flexibility)
    ALTER TABLE tickets ALTER COLUMN destination_id DROP NOT NULL;
    ALTER TABLE tickets ALTER COLUMN event_id DROP NOT NULL;
    
    RAISE NOTICE 'Tickets table structure updated successfully';
    
END $$;

-- Create or update the updated_at trigger
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

-- Create the trigger
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_tickets_updated_at();

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_reference ON tickets(booking_reference);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;

-- Show sample data (if any exists)
SELECT 
    id,
    user_id,
    destination_id,
    event_id,
    seats,
    total_amount,
    booking_status,
    payment_status,
    booking_reference,
    booked_at,
    created_at,
    updated_at
FROM tickets 
LIMIT 5;