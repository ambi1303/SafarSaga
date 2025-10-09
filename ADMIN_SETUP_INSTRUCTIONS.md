# Admin Setup Instructions

## Setting Up Admin Access for Testing

The 403 Forbidden error occurs because you need to be authenticated as an admin user to access the settings API. Here's how to set up admin access:

### Option 1: Create Admin User via Backend Script

1. **Start the backend server:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Create a regular user first** (via the frontend signup or API):
   - Go to `/auth/signup` and create a user account
   - Or use the API directly:
   ```bash
   curl -X POST "http://localhost:8000/auth/signup" \
        -H "Content-Type: application/json" \
        -d '{
          "email": "admin@safarsaga.com",
          "password": "admin123",
          "full_name": "Admin User"
        }'
   ```

3. **Make the user an admin** using the SQL script:
   - Open Supabase SQL Editor
   - Run the following SQL:
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE email = 'admin@safarsaga.com';
   ```

### Option 2: Direct Database Access

If you have direct database access:

1. Connect to your PostgreSQL database
2. Run the SQL command:
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   ```

### Option 3: Backend API Endpoint (Development Only)

Add a temporary development endpoint to create admin users:

1. Add this to `backend/app/routers/auth.py`:
   ```python
   @router.post("/make-admin/{user_email}")
   async def make_admin(user_email: str):
       # Only allow in development
       if os.getenv("ENVIRONMENT") != "development":
           raise HTTPException(status_code=403, detail="Not allowed in production")
       
       # Update user to admin
       # Implementation depends on your database setup
   ```

### Testing the Admin Settings

Once you have admin access:

1. **Login as admin user:**
   - Go to `/admin/login`
   - Use your admin credentials

2. **Access admin settings:**
   - Navigate to `/admin/settings`
   - The 403 error should be resolved

3. **Run the database migration:**
   ```bash
   cd backend
   # Apply the app_settings migration
   psql -d your_database -f migrations/010_app_settings_table.sql
   ```

### Troubleshooting

- **Still getting 403?** Check that:
  - User is logged in
  - User has `is_admin = true` in database
  - JWT token is valid and not expired
  - Backend is running and accessible

- **Database connection issues?** Verify:
  - Supabase credentials are correct
  - Database is accessible
  - Migration has been applied

### Environment Variables Required

Make sure these are set in your `.env` files:

**Backend (.env):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENVIRONMENT=development
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
