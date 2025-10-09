-- Migration: Update pricing model from per-day to package pricing
-- This migration renames average_cost_per_day to package_price and updates existing data

-- Step 1: Add new package_price column
ALTER TABLE destinations ADD COLUMN package_price DECIMAL(10,2);

-- Step 2: Migrate existing data (multiply average_cost_per_day by 5 for 5-day package)
UPDATE destinations 
SET package_price = COALESCE(average_cost_per_day * 5, 15000.00)
WHERE package_price IS NULL;

-- Step 3: Make package_price NOT NULL with default
ALTER TABLE destinations ALTER COLUMN package_price SET NOT NULL;
ALTER TABLE destinations ALTER COLUMN package_price SET DEFAULT 15000.00;

-- Step 4: Drop the old column
ALTER TABLE destinations DROP COLUMN average_cost_per_day;

-- Step 5: Add comment for clarity
COMMENT ON COLUMN destinations.package_price IS 'Total package price for the complete travel experience (not per day)';

-- Update any existing bookings to use the new pricing model
-- This ensures consistency in the booking calculations
UPDATE tickets 
SET total_amount = (
    SELECT d.package_price * t.seats 
    FROM destinations d 
    WHERE d.id = tickets.destination_id
)
FROM tickets t
WHERE tickets.id = t.id 
AND tickets.destination_id IS NOT NULL;
