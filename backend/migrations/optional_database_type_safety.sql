-- Optional Database-Side Type Safety for Booking Data
-- This migration adds database-level type casting as a final safety net
-- Run this ONLY if you want additional database-level protection

-- WARNING: This is optional and should only be used if:
-- 1. You have data that might bypass backend validation
-- 2. You want extra safety at the database level
-- 3. You understand the performance implications

-- Before running, backup your data!

BEGIN;

-- Add comments to document the safety measures
COMMENT ON TABLE tickets IS 'Booking/ticket table with enhanced type safety';

-- Option 1: Add check constraints for data validation
-- This ensures data integrity without changing column types

-- Ensure seats is a positive integer
ALTER TABLE tickets 
ADD CONSTRAINT check_seats_positive_integer 
CHECK (seats > 0 AND seats <= 10);

-- Ensure total_amount is a positive number
ALTER TABLE tickets 
ADD CONSTRAINT check_total_amount_positive 
CHECK (total_amount > 0);

-- Option 2: (More aggressive) Force column type conversion
-- UNCOMMENT ONLY IF YOU WANT TO ENFORCE STRICT TYPES

-- Force seats column to be integer (will fail if non-integer strings exist)
-- ALTER TABLE tickets ALTER COLUMN seats TYPE integer USING seats::integer;

-- Force total_amount column to be numeric (will fail if non-numeric strings exist)
-- ALTER TABLE tickets ALTER COLUMN total_amount TYPE numeric(10,2) USING total_amount::numeric;

-- Option 3: Create a trigger function for automatic type conversion
-- This will attempt to convert string values to proper types on insert/update

CREATE OR REPLACE FUNCTION convert_booking_data_types()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert seats to integer if it's a string
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Handle seats conversion
        IF NEW.seats IS NOT NULL THEN
            BEGIN
                -- Try to convert to integer
                NEW.seats := NEW.seats::integer;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'Invalid seats value: %. Must be a valid integer between 1 and 10.', NEW.seats;
            END;
        END IF;
        
        -- Handle total_amount conversion
        IF NEW.total_amount IS NOT NULL THEN
            BEGIN
                -- Try to convert to numeric
                NEW.total_amount := NEW.total_amount::numeric;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'Invalid total_amount value: %. Must be a valid number.', NEW.total_amount;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (UNCOMMENT to enable automatic conversion)
-- CREATE TRIGGER booking_data_type_conversion_trigger
--     BEFORE INSERT OR UPDATE ON tickets
--     FOR EACH ROW
--     EXECUTE FUNCTION convert_booking_data_types();

-- Add indexes for better performance on validated columns
CREATE INDEX IF NOT EXISTS idx_tickets_seats ON tickets(seats);
CREATE INDEX IF NOT EXISTS idx_tickets_total_amount ON tickets(total_amount);

-- Log the changes
INSERT INTO migration_log (migration_name, applied_at, description) 
VALUES (
    'optional_database_type_safety', 
    NOW(), 
    'Added optional database-level type safety constraints and conversion functions'
) ON CONFLICT DO NOTHING;

COMMIT;

-- Usage Instructions:
-- 1. This migration adds check constraints by default (safe)
-- 2. Uncomment the ALTER TABLE statements for strict type enforcement (aggressive)
-- 3. Uncomment the CREATE TRIGGER statement for automatic conversion (automatic)
-- 
-- Recommendation: Start with just the check constraints, then add more if needed