-- Create efficient booking statistics function
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_booking_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE user_id = user_uuid
        ),
        'upcoming_trips', (
            SELECT COUNT(*)
            FROM tickets
            WHERE user_id = user_uuid
            AND booking_status = 'confirmed'
            AND (travel_date IS NULL OR travel_date > NOW())
        ),
        'completed_trips', (
            SELECT COUNT(*)
            FROM tickets
            WHERE user_id = user_uuid
            AND booking_status = 'confirmed'
            AND travel_date IS NOT NULL
            AND travel_date <= NOW()
        ),
        'total_spent', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM tickets
            WHERE user_id = user_uuid
            AND payment_status = 'paid'
        ),
        'pending_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE user_id = user_uuid
            AND booking_status = 'pending'
        ),
        'cancelled_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE user_id = user_uuid
            AND booking_status = 'cancelled'
        ),
        'average_booking_amount', (
            SELECT COALESCE(AVG(total_amount), 0)
            FROM tickets
            WHERE user_id = user_uuid
            AND payment_status = 'paid'
        ),
        'most_recent_booking', (
            SELECT json_build_object(
                'id', id,
                'destination_id', destination_id,
                'event_id', event_id,
                'travel_date', travel_date,
                'total_amount', total_amount,
                'booking_status', booking_status,
                'booked_at', booked_at
            )
            FROM tickets
            WHERE user_id = user_uuid
            ORDER BY booked_at DESC
            LIMIT 1
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_booking_stats(UUID) TO authenticated;

-- Create admin booking statistics function
CREATE OR REPLACE FUNCTION get_admin_booking_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_bookings', (
            SELECT COUNT(*) FROM tickets
        ),
        'total_revenue', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM tickets
            WHERE payment_status = 'paid'
        ),
        'pending_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE booking_status = 'pending'
        ),
        'confirmed_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE booking_status = 'confirmed'
        ),
        'cancelled_bookings', (
            SELECT COUNT(*)
            FROM tickets
            WHERE booking_status = 'cancelled'
        ),
        'bookings_by_month', (
            SELECT json_agg(
                json_build_object(
                    'month', month_year,
                    'count', booking_count,
                    'revenue', total_revenue
                )
            )
            FROM (
                SELECT 
                    TO_CHAR(booked_at, 'YYYY-MM') as month_year,
                    COUNT(*) as booking_count,
                    COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
                FROM tickets
                WHERE booked_at >= NOW() - INTERVAL '12 months'
                GROUP BY TO_CHAR(booked_at, 'YYYY-MM')
                ORDER BY month_year DESC
                LIMIT 12
            ) monthly_stats
        ),
        'top_destinations', (
            SELECT json_agg(
                json_build_object(
                    'destination_id', destination_id,
                    'destination_name', destination_name,
                    'booking_count', booking_count,
                    'total_revenue', total_revenue
                )
            )
            FROM (
                SELECT 
                    t.destination_id,
                    d.name as destination_name,
                    COUNT(*) as booking_count,
                    COALESCE(SUM(CASE WHEN t.payment_status = 'paid' THEN t.total_amount ELSE 0 END), 0) as total_revenue
                FROM tickets t
                LEFT JOIN destinations d ON t.destination_id = d.id
                WHERE t.destination_id IS NOT NULL
                GROUP BY t.destination_id, d.name
                ORDER BY booking_count DESC
                LIMIT 10
            ) destination_stats
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (will be restricted by API)
GRANT EXECUTE ON FUNCTION get_admin_booking_stats() TO authenticated;