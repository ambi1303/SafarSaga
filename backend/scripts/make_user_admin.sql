-- Script to Make a User an Admin
-- Run this in Supabase SQL Editor

-- Option 1: Make user admin by email
-- Replace 'user@example.com' with the actual email address
UPDATE users 
SET is_admin = true 
WHERE email = 'user@example.com';

-- Option 2: Make user admin by user ID
-- Replace 'user-id-here' with the actual user UUID
-- UPDATE users 
-- SET is_admin = true 
-- WHERE id = 'user-id-here';

-- Verify the update
SELECT id, email, full_name, is_admin, is_active, created_at
FROM users 
WHERE email = 'user@example.com';

-- To see all admin users
-- SELECT id, email, full_name, is_admin, created_at
-- FROM users 
-- WHERE is_admin = true
-- ORDER BY created_at DESC;
