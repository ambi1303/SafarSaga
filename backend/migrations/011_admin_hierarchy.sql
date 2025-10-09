-- Migration: Add admin hierarchy tracking
-- This migration adds a promoted_by field to track who promoted each admin
-- This enables hierarchical admin management where admins can only revoke users they promoted

-- Add promoted_by column to users table
ALTER TABLE users 
ADD COLUMN promoted_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_users_promoted_by ON users(promoted_by);

-- Add comment for documentation
COMMENT ON COLUMN users.promoted_by IS 'ID of the admin who promoted this user to admin status';

-- Update existing admin users to have NULL promoted_by (they are root admins)
-- This ensures existing admins maintain their privileges
UPDATE users 
SET promoted_by = NULL 
WHERE is_admin = true;
