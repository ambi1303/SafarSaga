-- Migration: User Management Improvements
-- Description: Adds is_active and deleted_at columns, and creates get_users_with_stats function
-- Date: 2025-10-08

-- Step 1: Add is_active column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Step 2: Add deleted_at column for soft deletes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Step 3: Create index on is_active and deleted_at for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Step 4: Create function to get users with booking statistics (solves N+1 query problem)
CREATE OR REPLACE FUNCTION get_users_with_stats(
    search_term TEXT DEFAULT NULL,
    page_limit INT DEFAULT 20,
    page_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    is_admin BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_bookings BIGINT,
    total_spent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_admin,
        u.is_active,
        u.created_at,
        u.updated_at,
        COALESCE(COUNT(DISTINCT b.id), 0) AS total_bookings,
        COALESCE(SUM(b.total_amount), 0) AS total_spent
    FROM users u
    LEFT JOIN tickets b ON u.id = b.user_id
    WHERE 
        u.deleted_at IS NULL  -- Only show non-deleted users
        AND (
            search_term IS NULL 
            OR u.full_name ILIKE '%' || search_term || '%'
            OR u.email ILIKE '%' || search_term || '%'
            OR u.id::TEXT ILIKE '%' || search_term || '%'
        )
    GROUP BY u.id, u.email, u.full_name, u.phone, u.is_admin, u.is_active, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to get total count of users (for pagination)
CREATE OR REPLACE FUNCTION get_users_count(
    search_term TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM users u
        WHERE 
            u.deleted_at IS NULL
            AND (
                search_term IS NULL 
                OR u.full_name ILIKE '%' || search_term || '%'
                OR u.email ILIKE '%' || search_term || '%'
                OR u.id::TEXT ILIKE '%' || search_term || '%'
            )
    );
END;
$$ LANGUAGE plpgsql;

-- Step 6: Add comment for documentation
COMMENT ON COLUMN users.is_active IS 'Indicates if the user account is active. Deactivated users cannot log in.';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when the user was soft-deleted. NULL means the user is not deleted.';
COMMENT ON FUNCTION get_users_with_stats IS 'Efficiently retrieves users with their booking statistics in a single query, solving the N+1 query problem.';
COMMENT ON FUNCTION get_users_count IS 'Returns the total count of non-deleted users matching the search criteria.';
