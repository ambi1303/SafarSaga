# Destinations Setup Guide

This guide will help you set up the destinations table and migrate from the events-based booking system to a destinations-based system.

## Step 1: Create Destinations Table

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL from `create_destinations_table.sql`

## Step 2: Migrate Bookings Table

1. In Supabase SQL Editor, run the SQL from `migrate_bookings_to_destinations.sql`

## Step 3: Populate Destinations

1. After creating the table, run:
   ```bash
   python setup_destinations.py
   ```

## Step 4: Update Backend Services

The backend has been updated to support both events and destinations. The booking system now:

- Accepts `destination_id` instead of `event_id`
- Supports additional fields like `travel_date` and `contact_info`
- Maintains backward compatibility with existing events

## Step 5: Update Frontend

The frontend booking service has been updated to:

- Use `destination_id` in booking requests
- Include contact information in the proper format
- Handle the new booking response structure

## Current Status

The system is currently set up to work with the existing events table while being ready for destinations. The booking flow will:

1. Use the existing events table as destinations
2. Create bookings with the current structure
3. Be ready to migrate to the new destinations table when available

## Testing the Current System

You can test bookings with the existing event IDs:
- Use any existing event ID as a destination ID
- The system will create bookings against events
- All CRUD operations work with the current structure

## Migration Path

When ready to fully migrate:

1. Create the destinations table (Step 1)
2. Migrate existing events to destinations
3. Update bookings to reference destinations
4. Switch frontend to use destinations API

## Troubleshooting

### Backend Issues
- Ensure the backend server is running on port 8000
- Check that Supabase credentials are correct in `.env`
- Verify the events table has data

### Frontend Issues
- Check that API_BASE_URL points to the correct backend
- Ensure authentication tokens are valid
- Verify the booking request format matches the backend expectations

### Database Issues
- Run the SQL scripts in the correct order
- Check RLS policies are properly configured
- Verify foreign key constraints are satisfied