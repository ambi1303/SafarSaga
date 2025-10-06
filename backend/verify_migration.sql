-- Run this in Supabase SQL Editor to verify the migration worked
-- Verification script for destination booking migration

-- Test 1: Check if new columns exist in tickets table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name IN ('destination_id', 'contact_info', 'travel_date')
ORDER BY column_name;

-- Test 2: Check if destinations table has data
SELECT 
  COUNT(*) as destination_count,
  'destinations' as table_name
FROM public.destinations;

-- Test 3: Check if booking_details view exists and works
SELECT 
  COUNT(*) as view_accessible,
  'booking_details view' as test_name
FROM public.booking_details
LIMIT 1;

-- Test 4: Check if indexes were created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename = 'tickets' 
AND indexname LIKE '%destination%'
ORDER BY indexname;

-- Test 5: Show sample destinations for booking
SELECT 
  id,
  name,
  state,
  average_cost_per_day,
  is_active
FROM public.destinations 
WHERE is_active = true
LIMIT 5;

-- Success message
SELECT 'Migration verification completed! ✅' as status;