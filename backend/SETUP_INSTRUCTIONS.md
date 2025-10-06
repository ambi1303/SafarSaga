# Database Setup Instructions

## Current Status ✅
- **Service Role Key**: Configured correctly
- **Connection**: Working
- **Issue**: Database schema not set up

## Steps to Complete Setup

### 1. Run Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `araqnetcjdobovlmaiqw`
3. Navigate to **SQL Editor**
4. Copy the entire contents of `project/database/schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

### 2. Verify Setup

After running the schema, test the setup:

```bash
cd backend
venv\Scripts\activate
python setup_database.py
```

You should see:
```
✅ Users table exists and is accessible
🎉 Database appears to be set up correctly!
✅ get_user_by_email works: True
```

### 3. Test Signup Endpoint

Once the database is set up, test the signup endpoint:

```bash
# Start the backend server
python -m uvicorn app.main:app --reload --port 8000

# Test signup (in another terminal or Postman)
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "full_name": "Test User"
  }'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "full_name": "Test User",
    "is_admin": false
  }
}
```

## What the Schema Creates

- **Tables**: users, events, tickets, gallery_images
- **Indexes**: For better query performance
- **RLS Policies**: Row-level security for data protection
- **Triggers**: Auto-create user profiles, update timestamps
- **Functions**: Helper functions for user management

## Troubleshooting

If you get errors:
1. Make sure you're using the **SQL Editor** (not the Table Editor)
2. Run the entire schema at once
3. Check for any error messages in the SQL Editor
4. Verify the service role key is correct in `.env`