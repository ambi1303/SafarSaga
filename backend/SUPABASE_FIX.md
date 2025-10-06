# Supabase Configuration Fix

## Issue
The signup endpoint is failing with "Database error during get user by email" because:

1. **Wrong API Key**: Using anon key instead of service role key
2. **Missing Database Schema**: The users table doesn't exist in Supabase

## Fix Steps

### 1. Get Correct Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `araqnetcjdobovlmaiqw`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (NOT the anon key)
5. Update your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYXFuZXRjamRvYm92bG1haXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM5NTk3MywiZXhwIjoyMDc0OTcxOTczfQ.ACTUAL_SERVICE_ROLE_KEY_HERE
```

### 2. Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the schema from `project/database/schema.sql`
3. This will create:
   - `users` table
   - `events` table  
   - `tickets` table
   - `gallery_images` table
   - RLS policies
   - Triggers for user creation

### 3. Test the Fix

After updating the service role key and running the schema:

```bash
cd backend
venv\Scripts\activate
python test_supabase_connection.py
```

Should show:
```
✅ All tests completed successfully!
```

### 4. Test Signup

Try the signup endpoint again with:
```json
{
  "email": "test@example.com",
  "password": "Test123!",
  "full_name": "Test User"
}
```

## Current Error Details

- **Error**: "Could not find the table 'public.users' in the schema cache"
- **Cause**: Database schema not set up
- **HTTP Status**: 500 - Internal Server Error
- **Fix**: Complete steps 1-2 above

## Security Note

The service role key has full database access and bypasses RLS. Keep it secure and never expose it in client-side code.